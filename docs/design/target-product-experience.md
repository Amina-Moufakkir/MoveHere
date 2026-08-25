# MoveHere — Target Product Experience

Approved 2026-08-25. Anchor: `movehere-target-landing-page.png`, in this directory.

> **This artifact governs target product-experience and visual direction. It does not authorize capability. Where it conflicts with the canonical product plan, the product plan governs.**

**The image is evidence of an approved design direction. It is not evidence of user demand, validation, implementation, or capability.** A concept showing a capability does not create one, does not schedule one, and does not move one into scope. Every material capability it shows or implies is classified below.

## What the anchor governs

Visual hierarchy, the green and white brand treatment, typographic character, spacing and whitespace, card treatment, photography integration, call-to-action hierarchy, information density, and the premium fitness-tech feel.

## What it does not govern

Product scope, capability claims, roadmap, sequencing, or evidence. Those are `docs/product-plan-v4.4.md`.

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

Four classes:

- **CURRENT** — authorized and substantially implemented.
- **NEAR-TERM PRESENTATION/PRODUCT** — needs no new domain capability; exposes or improves what MoveHere already does.
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
| **Login** | **FUTURE** | Accounts, authentication and server persistence are excluded (§14, §21) |
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
| Completion logging | NEAR-TERM | One session, local, overwritten |
| **Progress tracking / Track Progress** | **FUTURE**, with one part **NOT AUTHORIZED** | See below |
| Park-First | CURRENT | |
| **Works Anywhere** | **NOT AUTHORIZED** as capability | See below |
| Smart & Adaptive | NEAR-TERM **if scoped to environment and conditions** | Adaptation to the venue and to reported conditions is current. Adaptation to the person is not |
| **Adapts to how you feel that day** | **NOT AUTHORIZED** | See below |
| Strength / Conditioning / Core presentation | CURRENT, with a correction | Strength and Conditioning are goals. **Core is a block role, not a goal** — the concept conflates two levels |
| No-equipment sessions | CURRENT | Environment-independent movements |
| **Beginner to Advanced** | **NOT AUTHORIZED** | See below |
| Short-duration workouts | CURRENT | 10, 20, 30 and 45 minutes |
| Your Goals. Your Pace. | Goals: NEAR-TERM. Pace: FUTURE | "Pace" implies progression or personalisation that does not exist |
| Accounts | FUTURE | |
| Persistent user history | FUTURE | One session persists and is overwritten |
| Saved environments and preferences | One venue: CURRENT. Multiple venues and preferences: FUTURE | A single home-park inventory persists locally today |

## The five that must not be waved through

### Login and accounts — FUTURE

Accounts, authentication and server-side persistence are excluded from current scope. The loop eventually needs identity for cross-device history, so this is a genuine future candidate rather than a rejected idea. It is not authorized now, and **the web consolidation stage must not ship a sign-in affordance that does nothing**.

*Get Started* and *Start Your Workout* are different: both enter the existing local flow and need no account. They are near-term.

### Track Progress — split, and one part cannot be claimed at all

Four distinct things hide in one phrase:

| | |
|---|---|
| Local completion logging, one session | **CURRENT** |
| Session history | **FUTURE** — needs a persistence-shape decision |
| Consistency over time | **FUTURE** — needs a defined metric |
| Measured improvement | **NOT AUTHORIZED** |

MoveHere records that a session was completed, how many movements it held, which features it used, and whether it was a substitute. It records **no load, no completed repetitions, no perceived effort, and no duration achieved**. There is nothing from which improvement could be computed, and no measure of improvement has ever been defined.

**A progress claim whose measurement has never been defined is not a feature that has not shipped. It is a claim the product cannot make.**

### Beginner to Advanced — NOT AUTHORIZED

The product plan lists advanced athletes among the users MoveHere is explicitly not for, and the wedge depends on that exclusion. This is **not** reclassified as a future commitment: widening the beachhead requires evidence rather than feature opportunity, and that is a product-plan amendment, not a copy decision.

### Adapts to how you feel that day — NOT AUTHORIZED

Current generation inputs are confirmed venue inventory, duration, goal and reported conditions. A readiness input is a **new generation-policy capability**, and it sits close to the medical boundary: "how you feel" shades into soreness, pain and injury, which are excluded from programming entirely.

It may be compatible with future exploration. It is **not an approved roadmap commitment**, and any reconsideration requires a new generation-policy decision reviewed against the medical and injury boundary.

### Works Anywhere — the finest distinction

Four different things wear this phrase:

1. **The product vision** — environment awareness generally. True, and the plan's opening claim.
2. **The current implementation** — park-aware. True today.
3. **Environment-independent continuity** — sessions requiring nothing, which genuinely do work anywhere. True today.
4. **Future indoor and home awareness** — not implemented, and entering only through the same admission and compatibility boundaries as the park.

**The brand statement may stand.** *Work out. Anywhere. MoveHere.* is defensible: environment-independent sessions really do work anywhere, and the vision really is broader than parks.

**Capability copy must be narrower.** A feature card promising *"parks, courts, paths, or home"* asserts venue awareness in places where none is implemented, and names home specifically, which is excluded. The *For Any Place* navigation item has the same problem.

The distinction to hold: **the brand may describe the destination; the product may only describe what it does now.**

## Using this artifact

When designing a surface, classify every claim before writing it. If a claim is FUTURE or NOT AUTHORIZED, it appears in neither copy nor affordance. If a classification feels wrong, that is a product-plan question, not a design question.
