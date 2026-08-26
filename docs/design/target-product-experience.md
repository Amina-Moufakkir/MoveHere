# MoveHere — Target Product Experience

Approved 2026-08-25. Anchor: `movehere-target-landing-page.png`, in this directory.

> **This artifact governs target product-experience and visual direction. It does not authorize capability. Where it conflicts with the canonical product plan, the product plan governs.**

**The image is evidence of an approved design direction. It is not evidence of user demand, validation, implementation, or capability.** A concept showing a capability does not create one, does not schedule one, and does not move one into scope. Every material capability it shows or implies is classified below.

## What the anchor governs

Visual hierarchy, the green and white brand treatment, typographic character, spacing and whitespace, card treatment, photography integration, call-to-action hierarchy, information density, and the premium fitness-tech feel.

## What it does not govern

Product scope, capability claims, roadmap, sequencing, or evidence. Those are `docs/product-plan-v4.7.md`.

It also does not govern deployment. This design direction applies to the consolidated product; it does not replace or supersede `web-mvp-v1`, which stays live as a frozen historical MVP. See §21.

## The loop

The target experience exists to make one loop feel obvious:

```text
Where am I? → What is available? → How much time do I have? → What is my goal?
    → Give me a workout I can actually perform here.
    → Guide me through it.
    → Adapt when the environment does not cooperate.
    → Remember what I did and, where honestly measurable, help me understand progress.
```

Expansion should strengthen that loop rather than turn MoveHere into a generic workout library.

## Classification

Five classes:

- **CURRENT** — authorized and substantially implemented.
- **NEAR-TERM PRESENTATION/PRODUCT** — needs no new domain capability; exposes or improves what MoveHere already does.
- **PLANNED** — the product intends to have it, and its scoping questions are owed. **PLANNED is not CURRENT**: it authorizes no implementation and no affordance. A planned capability appears on the production surface only once its minimum truthful functional implementation exists (§22, §23).
- **NEXT-STAGE AUTHORIZED** — scoped, contracted, and authorized to be *built* next. It still authorizes **no affordance and no copy**: the same rule applies, and the words wait for the implementation (§24).
- **FUTURE CAPABILITY CANDIDATE** — compatible with the vision, requires an explicit future product, domain or architecture decision first.
- **NOT AUTHORIZED BY VISION ALONE** — the concept cannot authorize it; current scope or evidence prevents or contradicts it.

### Marketing and presentation

| Element | Class | Note |
|---|---|---|
| Top navigation | NEAR-TERM | |
| How It Works | NEAR-TERM | Describes the implemented flow |
| Features | NEAR-TERM | Must describe authorized capability only |
| For Any Place | **NOT AUTHORIZED** as written | Asserts venue awareness where none is implemented. See *Works Anywhere* below |
| About | NEAR-TERM | |
| **Login** | **PLANNED** | Intended for the full product (§22). **Not authorized on the current production surface** until a functional authentication flow exists. The image's placement is approved for that moment, not for now |
| **Get Started** | **NEAR-TERM** | Enters the existing local, unauthenticated flow. No account required |
| PARK-FIRST WORKOUTS badge | CURRENT | Accurate today |
| *Work out. Anywhere. MoveHere.* | NEAR-TERM, **as a brand statement only** | See *Works Anywhere* |
| Venue-aware supporting copy | CURRENT | "adapt to the equipment and space around you" is the mechanism |
| **Start Your Workout** | **NEAR-TERM** | Enters the existing flow. No account required |
| See How It Works | NEAR-TERM | |
| No-gym positioning | CURRENT | |
| Feature cards | NEAR-TERM | Each card's claim classified individually below |
| Product / mobile preview | NEAR-TERM | Must depict authorized capability |
| Responsive premium marketing site | NEAR-TERM | |
| Realistic urban-park photography | NEAR-TERM | Production rules in `../exercise-media-manifest.md` apply to exercise media |
| Green and white visual system | NEAR-TERM | |
| Bold typography, rounded cards and buttons | NEAR-TERM | |
| Clean fitness-tech aesthetic | NEAR-TERM | |

### Product capability

| Claim | Class | Note |
|---|---|---|
| **Scan & Confirm** | Confirm: **CURRENT**. Scan: **FUTURE** | The architecture anticipates vision and the target experience may describe it. **Current copy must not imply scanning exists** — use *Confirm what's available* or *Tell MoveHere what's available* |
| Generation from environment, resources, time and goal | CURRENT | The implemented mechanism |
| Substitutions when needed | CURRENT | Substitute sessions, labelled as substitutes |
| Completion logging | NEAR-TERM | One session, local, overwritten. **§24 replaces this substrate**: a completed session becomes an immutable local record rather than a regenerated derivation |
| **Activity / session history** | **NEXT-STAGE AUTHORIZED** | §24. Recorded behaviour only, local-first. Authorized to build; no affordance, link or copy until it works (§24.15) |
| **Progress tracking / Track Progress** | **NOT AUTHORIZED as a name or a claim** | §24.2. *Activity* is the capability name. Improvement claims are refused, not deferred. See below |
| Park-First | CURRENT | |
| **Works Anywhere** | **PLANNED** as multi-environment expansion | §23.2. The expansion is intended; the phrase is not authorized. Copy names only supported classes. See below |
| Smart & Adaptive | **Split: environment/conditions CURRENT; person PLANNED** | §23.3. Venue and reported-conditions adaptation is the implemented mechanism. Person-state adaptation is planned and review-gated |
| **Adapts to how you feel that day** | **PLANNED**, §10 review-gated | §23.3. Not authorized now. Qualified review precedes design, not implementation. See below |
| Strength / Conditioning / Core presentation | CURRENT, with a correction | Strength and Conditioning are goals. **Core is a block role, not a goal** — the concept conflates two levels |
| No-equipment sessions | CURRENT | Environment-independent movements |
| **Beginner to Advanced** | **NOT AUTHORIZED** — unchanged by §23 | Excluded from the product, not merely this stage. §23.4 records the three requirements. See below |
| Short-duration workouts | CURRENT | 10, 20, 30 and 45 minutes |
| Your Goals. Your Pace. | **Not authorized as written** | §23.5. Goal is accurate; "pace" has no product definition. Current truth is *Your Goal. Your Time.* |
| Accounts | PLANNED | Intended for the full product (§22); not authorized now |
| Persistent user history | **Local: NEXT-STAGE AUTHORIZED (§24)**. Cross-device: PLANNED (§22) | Local history needs persistence, not identity, and selects no provider. Cross-device sync is a separate, later decision |
| Saved environments and preferences | One venue: CURRENT. Multiple venues: **PLANNED** (§23.2) | A single home-park inventory persists locally today |

## The five that must not be waved through

### Login and accounts — PLANNED

Accounts, authentication and persisted history are **PLANNED** capabilities of the full product (§22). They are intended, and their scoping questions are owed. They are still excluded from current scope, and none of them exists.

It is not authorized now, and **the web consolidation stage must not ship a sign-in affordance that does nothing**.

§22 states the rule that governs the gap between intent and implementation: **planned capability does not authorize a production affordance before its minimum truthful functional implementation exists.** So `Login` does not ship in the current header — no placeholder, no disabled control, no reserved gap, and no interim route that explains that authentication is unavailable. When it appears, it authenticates.

**The image's `Login` control is approved visual placement for the point at which authentication exists — not implementation authority for the current surface.** A later reader restoring it to match the image would be matching a picture rather than shipping a capability. §22.3 records the deliberate header divergence.

*Get Started* and *Start Your Workout* are different: both enter the existing local flow and need no account. They are near-term.

### Track Progress — renamed to Activity, and one part cannot be claimed at all

Four distinct things hide in one phrase:

| | |
|---|---|
| Local completion logging, one session | **CURRENT** |
| Session history | **NEXT-STAGE AUTHORIZED** — local-first, no accounts required (§24) |
| Consistency over time | **Activity calendar and completed-session counts (§24.9)**. Streaks remain **deferred** — a streak needs a definition before it is a metric (§24.10) |
| Measured improvement | **NOT AUTHORIZED** |

MoveHere records that a session was completed, how many movements it held, which features it used, and whether it was a substitute. It records **no load, no completed repetitions, no perceived effort, and no duration achieved**. There is nothing from which improvement could be computed, and no measure of improvement has ever been defined.

**A progress claim whose measurement has never been defined is not a feature that has not shipped. It is a claim the product cannot make.**

§24 authorizes the *measurable* half as the next stage and renames it **Activity**: completed sessions, sessions per week, activity dates, goal distribution, park-versus-substitute distribution, and session history. **Minutes programmed is permitted but deliberately not shipped in Activity v1** (§24.11) — the word that makes it honest is the word a reader discards. The naming trap stands regardless: the sum of prescribed durations is **minutes programmed**, never *total workout minutes* or *minutes trained*. A 30-minute session marked complete evidences an intention and a tap, not thirty elapsed minutes.

**The name moves too.** *Progress* is refused as a capability name, not merely as a claim (§24.2): activity is behaviour and MoveHere records it; progress is capability change and MoveHere does not measure it. Once Activity ships, *Track your activity* may be considered; *Track your progress* stays unauthorized before and after (§24.15).

The unmeasurable half does not move. Improvement claims stay refused.

### Beginner to Advanced — NOT AUTHORIZED, and not promoted by §23

The product plan lists advanced athletes among the users MoveHere is explicitly not for, and the wedge depends on that exclusion. This is **not** reclassified as a future commitment: widening the beachhead requires evidence rather than feature opportunity, and that is a product-plan amendment, not a copy decision.

### Adapts to how you feel that day — PLANNED, review-gated

Current generation inputs are confirmed venue inventory, duration, goal and reported conditions. A readiness input is a **new generation-policy capability**, and it sits close to the medical boundary: "how you feel" shades into soreness, pain and injury, which are excluded from programming entirely.

§23.3 promotes it to **PLANNED**: intended, unbuilt, and **review-gated — qualified review precedes design, not implementation**. Nothing about §10 relaxes. Injury-aware programming, condition-specific substitution and severity triage stay excluded however readiness is eventually scoped.

The other half of *Smart & Adaptive* is now recorded as **CURRENT**: adaptation to confirmed environment and reported conditions is the implemented mechanism, and the anchor's slot is accurate when scoped to it.

### Works Anywhere — PLANNED as expansion, not as a phrase

Four different things wear this phrase:

1. **The product vision** — environment awareness generally. True, and the plan's opening claim.
2. **The current implementation** — park-aware. True today.
3. **Environment-independent continuity** — sessions requiring nothing, which genuinely do work anywhere. True today.
4. **Future indoor and home awareness** — not implemented, and entering only through the same admission and compatibility boundaries as the park. §23.2 promotes this expansion to **PLANNED**; each class still enters individually through §7's five conditions.

**The brand statement may stand.** *Work out. Anywhere. MoveHere.* is defensible: environment-independent sessions really do work anywhere, and the vision really is broader than parks.

**Capability copy must be narrower.** A feature card promising *"parks, courts, paths, or home"* asserts venue awareness in places where none is implemented, and names home specifically, which is excluded. The *For Any Place* navigation item has the same problem.

**"Anywhere" does not become truthful by the addition of a second class.** Until multiple environment classes are CURRENT, production copy names only what is actually supported.

The distinction to hold: **the brand may describe the destination; the product may only describe what it does now.**

## Using this artifact

When designing a surface, classify every claim before writing it. If a claim is FUTURE or NOT AUTHORIZED, it appears in neither copy nor affordance. If a classification feels wrong, that is a product-plan question, not a design question.

## Measured visual direction

Taken from the anchor image by sampling pixels, not by inference. Roughly 24,000
green pixels across five regions; geometry by edge-scanning, scaled from the
image's 1536px width to a 1440px viewport.

### Colour

| Slot | Value | Source | Contrast on white |
|---|---|---|---|
| primary green | `#4F7E38` | CTA fill, `MoveHere.` headline | 4.80:1 — passes AA for body text; white on it is also 4.80:1 |
| primary hover | `#41682D` | derived, −8% lightness | 6.4:1 |
| pale tint | `#F2F4F1` | badge pill fill | decorative |
| decorative border | `#9BB293` | secondary-CTA ring | **2.29:1 — decorative only** |
| interactive border | `#7E9A75` | conformant substitute | 3.1:1 |
| green ink | `#3D6329` | icon strokes, darkened for text | 7.1:1 |
| panel surface | `#F7F7F7` | feature-strip fill | the strip is faintly grey, not white |

The target green measures **hue 100°, saturation 38%** — an olive, yellow-leaning
park green. It is not the emerald family (hue ~156°, saturation ~80%) the
implementation had been using.

### Geometry, at a 1440px viewport

| Measure | Target |
|---|---|
| Logo left edge | 65 |
| Headline left edge | 90 |
| Get Started right edge | 1371 |
| Content width | ~1305 |
| Side gutter | ~68 |
| Feature-strip width | ~1305 |

The anchor is not a centred narrow column. It is close to full-bleed with
generous padding, and the marketing surface needs its own measure rather than
the app flow's.

### Where the anchor is not followed

`#9BB293` is **decorative and non-interactive only**. Against white it measures
2.29:1, below the 3:1 that WCAG 2.1 AA requires where a border is the only thing
defining a control's boundary (1.4.11). The plan binds the web client to AA
(§15), so **§15 overrides literal visual parity wherever the generated anchor is
non-conformant** — here, and anywhere else measurement finds the same problem.
Interactive boundaries take `#7E9A75`, which is visually near-identical and
conformant.

An approved image is design direction. It is not an exemption from the
accessibility standard the plan already set.
