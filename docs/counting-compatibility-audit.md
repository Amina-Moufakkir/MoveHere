# Counting compatibility audit

Run 2026-08-23 against `feat/mobile-app` at `4753afc`, matrix `1`, policies `project-content`.

This records the evidence that motivated the counting-compatibility constraint in
§8. It is a finding, not a gate.

**Closed by `587c6d4`.** `countingModes` is authored per movement, eligibility
proves it, and `tests/runtime/counting-compatibility.test.ts` sweeps 6,540
generated items for the same defect on every run. The reproduction below is kept
so the measurement can be repeated, not because the defect is open.

Measured against the authored `countingModes` the same sweep reports **1,335 of
6,540 before, 0 after**. The 1,315 of 3,480 figure below predates
`countingModes` and uses `laterality` as its proxy, which over-counts: gait
movements and the movements that legitimately accept both modes register as
mismatches under the proxy and are correct under the real constraint. Both
numbers describe the same defect; only the second one measures it against the
answer.

Enforcing the constraint narrowed twenty-nine slots and left nine able to
produce a single movement each. That is tracked as variety debt in §15, and slot
prescription variants (§8) is the resolution.

## What was measured

Whether the `counting` value on a generated item's prescription agrees with the
`laterality` of the exercise that filled the slot.

Every combination of goal (`strength`, `conditioning`) × session duration ×
60 seeds, against a venue with every supported feature confirmed, counting an
item as mismatched when it is unilateral and counted `total`, or bilateral and
counted `per-side`.

## Result

```
items generated: 3480
mismatching:     1315   (38%)

 254×  split-squat         [unilateral]  counting='total'      e.g. "3 × 8"
 232×  side-plank          [unilateral]  counting='total'      e.g. "3 × 30s"
 226×  step-up             [unilateral]  counting='total'      e.g. "3 × 8"
 144×  shuttle-run         [unilateral]  counting='total'      e.g. "1 × 120s"
 140×  brisk-walk          [unilateral]  counting='total'      e.g. "1 × 120s"
 139×  single-leg-deadlift [unilateral]  counting='total'      e.g. "3 × 10"
 136×  easy-run            [unilateral]  counting='total'      e.g. "1 × 120s"
  26×  glute-bridge        [bilateral]   counting='per-side'   e.g. "3 × 8 per side"
  18×  hip-hinge           [bilateral]   counting='per-side'   e.g. "3 × 8 per side"
```

It runs in both directions: unilateral movements silently counted as total, and
bilateral movements told "per side", which is not a thing a person can do.

## Cause

`counting` is authored per slot, in `policy-catalog.ts`. Slots select exercises
by **movement pattern**, not by exercise. Generation never reads `laterality`.

So `s10-squat` — `patterns: ['squat']`, `reps(3, 8)`, `counting: 'total'` — is
eligible to be filled by `bodyweight-squat` (bilateral, correct) or by
`split-squat`, `step-up`, or `reverse-lunge` (all unilateral, all wrong). And
`s20-squat-2` — `perSide(2, 8)` — is eligible to be filled by
`bodyweight-squat`, producing "2 × 8 per side" on a two-legged squat.

`prescription-copy.ts` already notes that dropping the per-side suffix "would
quietly halve or double the work". That is happening, upstream of the copy: the
suffix is rendered faithfully from a `counting` value that was never checked
against the movement it ended up describing.

This is not a regression. §15 recorded laterality and rep counting as separate
concepts and left the relation between them unimplemented. The types landed; the
proof never did.

## Why the obvious fix is wrong

Deriving `counting` from `laterality` produces **"walk 2 minutes per side"**.

`Laterality` is overloaded. It means both *trained one side at a time* (split
squat, side plank, single-leg deadlift) and *limbs alternate as part of the gait*
(brisk walk, easy run, march in place, shuttle run). Those are four of the nine
rows above. For the gait group, `per-side` has no meaning at any prescription,
so a mechanical derivation replaces 1,315 wrong counts with a different set of
wrong counts and a nonsensical instruction.

A second reason not to derive it at generation time: `estimatedSeconds` is
authored per slot alongside the dose. A slot budgeted at 80s assuming total
counting takes roughly double if filled by a movement counted per-side, so
counting cannot float free of the estimate without moving session duration and
feeding `insufficient-time`.

The constraint in §8 instead makes acceptable counting an intrinsic fact about
the movement — `countingModes`, beside `prescriptionKinds` — and has feasibility
prove that every exercise eligible for a slot accepts that slot's counting.
Policy keeps owning counting, dose, and time as one decision.

## Reproducing

Not a build step; kept here so the finding can be re-run before and after the
fix. Write to a `*.test.ts` at the repository root and run with
`node --experimental-strip-types --test`.

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateSession } from './src/domain/generator.ts';
import { loadMatrix } from './src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from './src/domain/exercise-catalog.ts';
import { loadGoalPolicies } from './src/domain/policy-loader.ts';
import { AUTHORED_POLICIES } from './src/domain/policy-catalog.ts';
import { checkFeasibility, selectPolicy } from './src/domain/feasibility.ts';
import { makeSessionMinutes, SESSION_DURATIONS } from './src/domain/session.ts';
import { seedFrom } from './src/domain/prng.ts';
import { FEATURE_REGISTRY } from './src/domain/feature-registry.ts';
import { confirmInventory, projectGenerationView } from './src/domain/confirmation.ts';
import type { VenueId } from './src/domain/confirmation.ts';
import type { SupportedFeatureId } from './src/domain/feature.ts';
import { doseText } from './src/presentation/prescription-copy.ts';

const m = loadMatrix(AUTHORED_MATRIX); assert.ok(m.ok);
const matrix = m.matrix;
const p = loadGoalPolicies(AUTHORED_POLICIES); assert.ok(p.ok);
const f = checkFeasibility(matrix, p.policies); assert.ok(f.ok);

const ALL = FEATURE_REGISTRY.supported.map((x) => x.id) as SupportedFeatureId[];
const viewOf = (features: readonly SupportedFeatureId[]) => {
  const { inventory } = confirmInventory({
    venueId: 'v' as VenueId,
    candidates: features.map((featureId) => ({
      featureId, source: { kind: 'manual-selection' as const }, observedAt: 't',
    })),
    confirmations: features.map((featureId) => ({
      featureId, decision: 'present' as const, decidedAt: 't',
      candidateSource: { kind: 'manual-selection' as const },
    })),
    at: 't',
  });
  return projectGenerationView(inventory);
};

test('counting agrees with laterality', () => {
  const lat = new Map(matrix.exercises.map((e) => [String(e.id), e.laterality]));
  const bad = new Map<string, { n: number; sample: string }>();
  let total = 0;
  for (const goal of ['strength', 'conditioning'] as const) {
    for (const mins of SESSION_DURATIONS) {
      for (let i = 0; i < 60; i++) {
        const out = generateSession({
          context: { kind: 'venue-aware', venue: viewOf(ALL) },
          policy: selectPolicy(f.programming, goal),
          matrix,
          availableMinutes: makeSessionMinutes(mins)!,
          conditions: { kind: 'park-permitted' },
          seed: seedFrom(`s-${goal}-${mins}-${i}`),
        });
        if (out.kind !== 'park-session' && out.kind !== 'substitute-session') continue;
        for (const b of out.blocks) for (const it of b.items) {
          total++;
          const L = lat.get(String(it.exerciseId));
          const c = 'counting' in it.prescription ? it.prescription.counting : null;
          if (c === null) continue;
          if ((L === 'unilateral' && c === 'total') || (L === 'bilateral' && c === 'per-side')) {
            const k = `${String(it.exerciseId)} [${L}] counting='${c}'`;
            const cur = bad.get(k) ?? { n: 0, sample: `${goal} ${mins}min → "${doseText(it.prescription)}"` };
            bad.set(k, { n: cur.n + 1, sample: cur.sample });
          }
        }
      }
    }
  }
  console.log(`items generated: ${total}`);
  console.log(`mismatching:     ${[...bad.values()].reduce((a, b) => a + b.n, 0)}`);
  for (const [k, v] of [...bad.entries()].sort((a, b) => b[1].n - a[1].n)) {
    console.log(`${String(v.n).padStart(5)}×  ${k}   e.g. ${v.sample}`);
  }
});
```

Note that the sweep classifies gait movements as mismatched, because it tests
`laterality` against `counting` directly. That is the measurement doing its job
rather than a recommendation: the four gait rows are precisely the ones that
show why `countingModes` has to be authored per movement instead of inferred.
