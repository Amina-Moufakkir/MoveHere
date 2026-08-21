/**
 * M4 — deterministic session generation.
 *
 * These test the mechanism, not the programming. Whether these sessions are
 * good training is a question for professional review, which this project
 * content has not had.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateSession, GENERATOR_VERSION } from '../../src/domain/generator.ts';
import { loadMatrix } from '../../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '../../src/domain/exercise-catalog.ts';
import { loadGoalPolicies } from '../../src/domain/policy-loader.ts';
import { AUTHORED_POLICIES } from '../../src/domain/policy-catalog.ts';
import { checkFeasibility, selectPolicy } from '../../src/domain/feasibility.ts';
import { makeSessionMinutes, SESSION_DURATIONS, assessConditions } from '../../src/domain/session.ts';
import { seedFrom } from '../../src/domain/prng.ts';
import { FEATURE_REGISTRY } from '../../src/domain/feature-registry.ts';
import { confirmInventory, projectGenerationView } from '../../src/domain/confirmation.ts';
import type { VenueId, GenerationVenueView } from '../../src/domain/confirmation.ts';
import type {
  SessionGenerationInput,
  SessionGenerationOutput,
  ConditionsDisposition,
  SessionMinutes,
} from '../../src/domain/session.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import type { ValidatedMatrix } from '../../src/domain/matrix-loader.ts';

/* --------------------------------------------------------------- fixtures */

const matrix: ValidatedMatrix = (() => {
  const r = loadMatrix(AUTHORED_MATRIX);
  assert.ok(r.ok);
  return r.matrix;
})();

const programming = (() => {
  const p = loadGoalPolicies(AUTHORED_POLICIES);
  assert.ok(p.ok);
  const f = checkFeasibility(matrix, p.policies);
  assert.ok(f.ok);
  return f.programming;
})();

const ALL_FEATURES = FEATURE_REGISTRY.supported.map((f) => f.id);

/** Builds a real generation view through the confirmation boundary. */
const viewOf = (features: readonly SupportedFeatureId[]): GenerationVenueView => {
  const { inventory } = confirmInventory({
    venueId: 'v' as VenueId,
    candidates: features.map((featureId) => ({
      featureId,
      source: { kind: 'manual-selection' },
      observedAt: 't',
    })),
    confirmations: features.map((featureId) => ({
      featureId,
      decision: 'present' as const,
      decidedAt: 't',
      candidateSource: { kind: 'manual-selection' as const },
    })),
    at: 't',
  });
  return projectGenerationView(inventory);
};

const minutes = (value: number): SessionMinutes => {
  const m = makeSessionMinutes(value);
  assert.ok(m !== null);
  return m;
};

const PERMITTED: ConditionsDisposition = { kind: 'park-permitted' };

const input = (over: Partial<SessionGenerationInput> = {}): SessionGenerationInput => ({
  context: { kind: 'venue-aware', venue: viewOf(['park-bench', 'pull-up-bar', 'stairs']) },
  policy: selectPolicy(programming, 'strength'),
  matrix,
  availableMinutes: minutes(30),
  conditions: PERMITTED,
  seed: seedFrom('seed-1'),
  ...over,
});

const items = (out: SessionGenerationOutput) =>
  out.kind === 'park-session' || out.kind === 'substitute-session'
    ? out.blocks.flatMap((b) => [...b.items])
    : [];

/* ------------------------------------------------------------ determinism */

test('same input produces deep-equal output', () => {
  const a = generateSession(input());
  const b = generateSession(input());
  assert.deepEqual(a, b);
});

test('output is invariant under permutation of every input collection', () => {
  const base = input();
  const reversed: ValidatedMatrix = {
    ...matrix,
    exercises: [...matrix.exercises].reverse(),
    compatibilities: [...matrix.compatibilities].reverse(),
    environmentIndependent: [...matrix.environmentIndependent].reverse(),
  } as ValidatedMatrix;

  const shuffledVenue = viewOf(['stairs', 'pull-up-bar', 'park-bench']);
  assert.deepEqual(
    generateSession(base),
    generateSession({
      ...base,
      matrix: reversed,
      context: { kind: 'venue-aware', venue: shuffledVenue },
    }),
  );
});

test('the same seed is stable across runs and goals', () => {
  for (const goal of ['strength', 'conditioning'] as const) {
    const cfg = input({ policy: selectPolicy(programming, goal) });
    assert.deepEqual(generateSession(cfg), generateSession(cfg));
  }
});

test('different seeds still produce valid sessions', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 40; i++) {
    const out = generateSession(input({ seed: seedFrom(`seed-${i}`) }));
    assert.equal(out.kind, 'park-session');
    if (out.kind !== 'park-session') continue;
    assert.ok(out.blocks.length > 0);
    for (const block of out.blocks) assert.ok(block.items.length > 0);
    seen.add(JSON.stringify(items(out).map((it) => it.exerciseId)));
  }
  assert.ok(seen.size > 1, 'seeds should produce more than one distinct session');
});

/* -------------------------------------------------------- basis integrity */

test('every item cites a basis that the input actually supports', () => {
  const venueFeatures: readonly SupportedFeatureId[] = ['park-bench', 'pull-up-bar'];
  const out = generateSession(input({
    context: { kind: 'venue-aware', venue: viewOf(venueFeatures) },
  }));
  const declarationIds = new Set(matrix.environmentIndependent.map((e) => e.id as string));
  const claims = new Map(matrix.compatibilities.map((c) => [c.id as string, c]));

  for (const item of items(out)) {
    if (item.basis.kind === 'environment-independent') {
      assert.ok(declarationIds.has(item.basis.declarationId));
    } else {
      const claim = claims.get(item.basis.compatibilityId);
      assert.ok(claim !== undefined);
      assert.equal(claim.exerciseId, item.exerciseId);
      assert.equal(claim.featureId, item.basis.featureId);
      assert.ok(venueFeatures.includes(item.basis.featureId), 'basis names an unconfirmed feature');
    }
  }
});

test('authority provenance is complete and matches the matrix', () => {
  const out = generateSession(input());
  for (const item of items(out)) {
    assert.equal(item.basis.authority.matrixVersion, matrix.version);
    assert.ok(item.basis.authority.attestedAt.length > 0);
    assert.ok(['project-content', 'reviewed'].includes(item.basis.authority.tier));
  }
});

test('no draft authority reaches a session', () => {
  const out = generateSession(input());
  for (const item of items(out)) {
    assert.notEqual(item.basis.authority.tier as string, 'draft');
  }
  assert.ok(out.kind !== 'not-generated');
  if (out.kind === 'not-generated') return;
  assert.equal(out.provenance.authorityTier, 'project-content');
});

test('a session records the policy and seed it came from', () => {
  const out = generateSession(input());
  assert.ok(out.kind === 'park-session');
  if (out.kind !== 'park-session') return;
  assert.equal(out.provenance.generatorVersion, GENERATOR_VERSION);
  assert.equal(out.provenance.policyId, 'policy-strength');
  assert.equal(out.provenance.seed, 'seed-1');
  assert.ok(out.provenance.venueSnapshotId !== null);
});

/* ----------------------------------------------------------- venue rules */

test('pull never appears without a compatible confirmed feature', () => {
  const pullExercises = new Set(
    matrix.exercises.filter((e) => e.pattern === 'pull').map((e) => e.id as string),
  );
  for (const goal of ['strength', 'conditioning'] as const) {
    for (const duration of SESSION_DURATIONS) {
      for (const features of [[], ['park-bench'], ['stairs', 'hill'], ['parallel-bars']] as const) {
        for (let i = 0; i < 5; i++) {
          const out = generateSession(input({
            policy: selectPolicy(programming, goal),
            availableMinutes: minutes(duration),
            seed: seedFrom(`p-${i}`),
            context:
              features.length === 0
                ? { kind: 'environment-independent' }
                : { kind: 'venue-aware', venue: viewOf(features) },
          }));
          for (const item of items(out)) {
            assert.ok(
              !pullExercises.has(item.exerciseId as string),
              `pull appeared without a bar: ${item.exerciseId}`,
            );
          }
        }
      }
    }
  }
});

test('a bar makes pull available', () => {
  const out = generateSession(input({
    context: { kind: 'venue-aware', venue: viewOf(['pull-up-bar']) },
    availableMinutes: minutes(30),
  }));
  const pulled = items(out).some((it) => ['pull-up', 'dead-hang'].includes(it.exerciseId as string));
  assert.ok(pulled, 'a confirmed bar should let a pull slot fill');
});

test('sourcePreference prefers venue movements without forcing them', () => {
  const out = generateSession(input({
    context: { kind: 'venue-aware', venue: viewOf(['park-bench']) },
  }));
  assert.equal(out.kind, 'park-session');
  // The bench must be used, but slots it cannot serve still fill from the
  // environment-independent pool rather than being forced or dropped.
  const all = items(out);
  assert.ok(all.some((it) => it.basis.kind === 'confirmed-feature'));
  assert.ok(all.some((it) => it.basis.kind === 'environment-independent'));
});

/* ------------------------------------------------------ fallback precedence */

test('fallback precedence table', () => {
  const bench = viewOf(['park-bench']);
  const adverse: ConditionsDisposition = {
    kind: 'park-withheld',
    cause: { kind: 'adverse', cause: { kind: 'user-reported' } },
  };
  const unavailable: ConditionsDisposition = {
    kind: 'park-withheld',
    cause: { kind: 'unavailable' },
  };

  const cases: readonly [string, Partial<SessionGenerationInput>, string, string | null][] = [
    ['adverse conditions with a venue', { conditions: adverse, context: { kind: 'venue-aware', venue: bench } }, 'substitute-session', 'conditions-adverse'],
    ['adverse conditions without a venue', { conditions: adverse, context: { kind: 'environment-independent' } }, 'substitute-session', 'conditions-adverse'],
    ['unavailable conditions', { conditions: unavailable, context: { kind: 'venue-aware', venue: bench } }, 'substitute-session', 'conditions-unavailable'],
    ['no venue', { context: { kind: 'environment-independent' } }, 'substitute-session', 'no-confirmed-inventory'],
    ['empty venue', { context: { kind: 'venue-aware', venue: viewOf([]) } }, 'substitute-session', 'no-confirmed-inventory'],
    ['venue with features', { context: { kind: 'venue-aware', venue: bench } }, 'park-session', null],
  ];

  for (const [label, over, expectedKind, expectedReason] of cases) {
    const out = generateSession(input(over));
    assert.equal(out.kind, expectedKind, label);
    if (expectedReason !== null && out.kind === 'substitute-session') {
      assert.equal(out.reason.kind, expectedReason, label);
    }
  }
});

test('conditions outrank inventory when both would trigger a fallback', () => {
  const out = generateSession(input({
    conditions: { kind: 'park-withheld', cause: { kind: 'unavailable' } },
    context: { kind: 'environment-independent' },
  }));
  assert.equal(out.kind, 'substitute-session');
  if (out.kind !== 'substitute-session') return;
  assert.equal(out.reason.kind, 'conditions-unavailable');
});

test('a substitute session never claims a venue snapshot', () => {
  const out = generateSession(input({ context: { kind: 'environment-independent' } }));
  assert.ok(out.kind === 'substitute-session');
  if (out.kind !== 'substitute-session') return;
  assert.equal(out.provenance.venueSnapshotId, null);
  assert.ok(items(out).every((it) => it.basis.kind === 'environment-independent'));
});

/* -------------------------------------------------------------- totality */

test('broad sweep: every combination produces a valid session', () => {
  const subsets: readonly (readonly SupportedFeatureId[])[] = [
    [],
    ['park-bench'],
    ['pull-up-bar'],
    ['stairs'],
    ['hill'],
    ['parallel-bars'],
    ['park-bench', 'pull-up-bar'],
    ['stairs', 'hill', 'running-track'],
    ALL_FEATURES,
  ];
  const dispositions: readonly ConditionsDisposition[] = [
    { kind: 'park-permitted' },
    { kind: 'park-withheld', cause: { kind: 'adverse', cause: { kind: 'measured', signals: ['extreme-heat'] } } },
    { kind: 'park-withheld', cause: { kind: 'unavailable' } },
  ];

  let count = 0;
  let notGenerated = 0;
  for (const goal of ['strength', 'conditioning'] as const) {
    for (const duration of SESSION_DURATIONS) {
      for (const features of subsets) {
        for (const conditions of dispositions) {
          for (let i = 0; i < 3; i++) {
            const out = generateSession(input({
              policy: selectPolicy(programming, goal),
              availableMinutes: minutes(duration),
              conditions,
              seed: seedFrom(`sweep-${i}`),
              context:
                features.length === 0
                  ? { kind: 'environment-independent' }
                  : { kind: 'venue-aware', venue: viewOf(features) },
            }));
            count++;
            if (out.kind === 'not-generated') { notGenerated++; continue; }
            assert.ok(out.blocks.length > 0);
            for (const block of out.blocks) assert.ok(block.items.length > 0);
            assert.ok(out.estimatedMinutes <= duration, `${goal} ${duration} overran`);
            if (out.kind === 'park-session') assert.ok(out.featuresUsed.length > 0);
          }
        }
      }
    }
  }
  assert.ok(count > 600, `swept ${count} combinations`);
  assert.equal(notGenerated, 0, 'not-generated must remain exceptional');
});

test('estimated time never exceeds the time requested', () => {
  for (const goal of ['strength', 'conditioning'] as const) {
    for (const duration of SESSION_DURATIONS) {
      const out = generateSession(input({
        policy: selectPolicy(programming, goal),
        availableMinutes: minutes(duration),
        context: { kind: 'venue-aware', venue: viewOf(ALL_FEATURES) },
      }));
      if (out.kind === 'not-generated') continue;
      assert.ok(out.estimatedMinutes <= duration, `${goal} ${duration}: ${out.estimatedMinutes}`);
    }
  }
});

test('user-reported conditions map to dispositions correctly', () => {
  assert.deepEqual(assessConditions({ kind: 'acceptable' }), { kind: 'park-permitted' });
  assert.equal(assessConditions({ kind: 'unavailable' }).kind, 'park-withheld');

  // A user saying "bad out there" is recorded as exactly that, with no cause
  // invented on their behalf.
  const reported = assessConditions({ kind: 'adverse', cause: { kind: 'user-reported' } });
  assert.equal(reported.kind, 'park-withheld');
  if (reported.kind !== 'park-withheld' || reported.cause.kind !== 'adverse') return;
  assert.deepEqual(reported.cause.cause, { kind: 'user-reported' });
  assert.equal(assessConditions({ kind: 'adverse', cause: { kind: 'user-reported' } }).kind, 'park-withheld');
});

/* ----------------------------------------------------------------- purity */

test('generation is pure: frozen inputs, no clock, no Math.random', () => {
  const cfg = input();
  Object.freeze(cfg);
  Object.freeze(cfg.matrix);
  Object.freeze(cfg.policy);

  const realDate = globalThis.Date;
  const realRandom = Math.random;
  globalThis.Date = new Proxy(realDate, {
    construct: () => { throw new Error('clock read via new Date()'); },
    apply: () => { throw new Error('clock read via Date()'); },
    get: (t, p, r) => { if (p === 'now') throw new Error('clock read via Date.now'); return Reflect.get(t, p, r) as unknown; },
  }) as DateConstructor;
  Math.random = () => { throw new Error('Math.random used'); };

  try {
    const out = generateSession(cfg);
    assert.equal(out.kind, 'park-session');
    assert.deepEqual(generateSession(cfg), out);
  } finally {
    globalThis.Date = realDate;
    Math.random = realRandom;
  }
});
