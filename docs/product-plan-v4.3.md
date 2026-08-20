# MoveHere — Product Plan

**Version 4.3 — Park-first, venue-aware, evidence-driven**

> **Working name:** MoveHere. Availability and trademark clearance have not yet been completed.
>
> **Status:** Phase 0 — Product & Engineering Foundation (§19). Formal customer interviews and commercial validation are intentionally deferred. Product hypotheses remain explicitly unvalidated.

---

## 1. Executive Summary

MoveHere explores a simple product hypothesis:

> **Can understanding the physical environment around a user remove enough workout-planning friction to help them exercise more consistently?**

Parks are the initial wedge.

Instead of asking users to search a workout library and determine whether a workout fits their surroundings, MoveHere creates a structured inventory of **user-confirmed supported features** in a nearby park and uses that inventory to construct a compatible workout.

### Initial experience

```text
Scan park
    ↓
Detect candidate supported features
    ↓
User confirms what exists
    ↓
Choose available time + session goal
    ↓
Generate workout using only confirmed supported features
    ↓
Complete / log session
    ↓
Correct venue information when needed
```

Indoor venue awareness remains a potential mechanism for maintaining continuity during periods when outdoor exercise is impractical. It is a **hypothesis to validate**, not proof that seasonality has been solved.

**MoveHere is park-first and potentially venue-capable — not a universal workout generator.**

---

## 2. Problem Statement

The hypothesized beachhead user already has convenient access to a nearby park and may already walk or run there, but does not consistently use the environment for strength or structured training.

The hypothesized friction is:

> **“I have somewhere nearby where I could exercise, but I don't know what useful workout I can do with what is actually there.”**

MoveHere attempts to eliminate the translation work between the physical environment and an executable workout.

This problem has **not yet been validated through formal customer interviews**. Development proceeds to prototype and evaluate the technical and product mechanism without treating the hypothesis as established evidence.

---

## 3. Target User

### Initial beachhead hypothesis

Adults approximately 25–45 who:

- Live in a walkable US urban area.
- Have a park within roughly a 10-minute **walk**.
- Already visit or pass that park.
- Want to incorporate strength or structured exercise.
- Do not consistently use a gym.
- Are generally healthy enough for unsupervised general fitness activity.
- Experience uncertainty about useful training they can perform with the available environment.

This is a **hypothesized beachhead**, not a validated customer segment.

### Why the walking constraint matters

The 10-minute walk is part of the working value proposition.

If the user must drive to the park, a low-cost gym may become a stronger alternative because it provides climate control and purpose-built equipment with similar travel overhead.

The importance of travel overhead remains a hypothesis and should not be represented as validated causal evidence.

### Explicitly outside initial scope

- Caregivers using playground equipment.
- Children.
- Rehabilitation users.
- Injury-specific programming.
- Suburban drive-to-park users.
- Hotel travelers.
- Office workouts.
- Arbitrary public structures.
- Advanced athletes.

Expansion requires evidence rather than feature opportunity.

---

## 4. Competitive Positioning

The working competitive hypothesis is not:

> “We have better workouts.”

It is:

> **MoveHere reduces the work of translating a real physical environment into an executable workout.**

Traditional fitness products generally begin with the workout:

```text
Find/select workout
        ↓
Determine whether you can perform it
        ↓
Adapt environment or substitute exercises
```

MoveHere proposes reversing that:

```text
Understand environment
        ↓
Determine supported possibilities
        ↓
Construct compatible workout
```

### Current alternatives

Potential alternatives include:

- Nike Training Club.
- Freeletics.
- Apple Fitness+.
- Peloton App.
- YouTube.
- Low-cost gyms.
- Self-created workouts.
- Walking or running without structured strength work.
- Doing nothing or exercising inconsistently.

The exact competitive behavior of the beachhead user remains unvalidated.

### Positioning constraint

MoveHere should not compete primarily on:

- Price.
- Exercise-library size.
- Number of workout videos.
- AI novelty.

The sentence future validation must support is:

> **A user chooses MoveHere over their current alternative because MoveHere understands the nearby environment and removes the work of figuring out what they can do there.**

---

## 5. Product Wedge

### Park-first

The park remains the initial product and acquisition story because it provides:

- A specific physical context.
- Potentially useful structures and terrain.
- Potential proximity.
- An existing behavioral trigger.
- A concrete reason for venue awareness.

### Venue-aware

The underlying architecture may eventually generalize beyond parks.

However:

> **Venue-capable does not mean every venue belongs in the product.**

New venue classes should only be supported when evidence justifies them and the safety/domain model can support them responsibly.

---

## 6. Core Experience

### Step 1 — First session without assuming equipment

If nothing has been scanned or confirmed:

```text
Confirmed features = none
        ↓
Only environment-independent supported movements
        ↓
Complete first session
        ↓
Invite park scan
```

MoveHere must **not** silently assume a bench, stairs, bars, or another structure exists.

### Step 2 — Scan the park

The user takes several photographs of the relevant park area.

Vision identifies **candidate features**.

```text
Possible features detected:

✓ Bench
✓ Open ground
□ Horizontal bar
? Stairs
```

Detection does not mean suitability.

Vision answers:

> **“What supported objects appear to exist?”**

It does not answer:

> “Is this object structurally safe for exercise?”

### Step 3 — Mandatory confirmation

Candidate features must be confirmed before the workout generator can depend on them.

The generator trusts only:

```text
SUPPORTED FEATURE
        +
USER CONFIRMATION
```

Raw vision output is never authoritative venue state.

Precision should be favored over recall:

- Missing a feature reduces workout options.
- Inventing a feature can create physical risk.

### Step 4 — Session inputs

Initially collect only:

- Available time.
- Session goal.

The initial session goals are:

- Strength.
- Conditioning.
- Mobility.

Available time is chosen from a fixed set of durations:

- 10 minutes.
- 20 minutes.
- 30 minutes.
- 45 minutes.

Free-form durations are deliberately excluded for Phase 1. A fixed set keeps generated sessions comparable across venues and goals, which Gates I and J depend on, and avoids committing to arbitrary-length generation before the compatibility matrix is understood. Widening or reopening this set is a product decision.

A combined or "mixed" goal is deliberately excluded from Phase 0. Its semantics are not defined well enough to enter generation, and an underspecified goal would make generated sessions harder to compare under Gates I and J.

Additional inputs should not be added unless they materially affect generation.

### Step 5 — Conditions check

Known outdoor conditions are checked before a park session is offered.

If the conditions gate fails, MoveHere offers the environment-independent substitute session defined in §11.

Conditions may also be **unavailable** — unknown, unreadable, or not yet retrieved. Unavailable conditions are not treated as acceptable. They follow the same user-facing fallback path as adverse conditions and produce an environment-independent substitute session.

The two cases must remain distinguishable in recorded provenance. "We know conditions are adverse" and "we could not determine conditions" are different facts, and collapsing them would misrepresent why a park session was withheld and corrupt the seasonality signal in §11.

### Step 6 — Generate and perform

The deterministic generator may use only:

1. user-confirmed supported venue features; and/or
2. explicitly environment-independent movements.

The user follows the workout and records completion locally.

### Step 7 — Correct venue information

After the session, the user may report that a confirmed feature was absent or unusable. These are distinct venue states and must not be collapsed.

**Absent** means the feature is not there. The confirmation is withdrawn.

**Unusable** means the feature exists but could not be used — occupied, flooded, damaged, fenced off, or otherwise unavailable in practice. The confirmation stands. The feature remains venue knowledge and is retained, while becoming ineligible for session generation until the user indicates otherwise.

Retaining unusable features matters because "this park has a pull-up bar that is frequently unusable" is knowledge about the venue (§13). Deleting it would discard that signal and invite the user to re-confirm the same feature indefinitely.

Feedback may update local venue state but must never silently convert an unsupported object into a supported one, and no correction may add a feature.

---

## 7. Supported-Feature Registry

MoveHere uses a deliberately small supported-feature registry.

An object enters the registry only if:

1. The system can identify it sufficiently reliably.
2. Users can understand what is being identified.
3. It materially changes workout generation.
4. Supported exercises can use it without unreasonable structural assumptions.
5. Its use does not introduce disproportionate safety or legal uncertainty.

### Classification principle: load-bearing assumption

```text
CLASS A — Ground-type

Terrain or a surface engineered for people
to stand or move on.


CLASS B — Engineered load-bearing

Purpose-built for people to load, hang from,
push against, or otherwise use in the
supported manner.


CLASS C — Excluded

Supporting the movement would require
MoveHere to make a structural assumption
it cannot responsibly make.
```

### Class A — Initial candidates

- Open ground.
- Walking/running path.
- Stairs.
- Hills.
- Running track.
- Hard court.

### Class B — Initial candidates

- Conventional park bench.
- Purpose-built pull-up/horizontal bar.
- Purpose-built parallel/dip bars.
- Designated outdoor fitness equipment.

### Bleachers — excluded pending evidence

Bleachers remain Class C unless park audits establish both:

1. They are common enough to materially affect generation.
2. Fixed and portable bleachers can be reliably distinguished through vision or a simple user confirmation.

If condition 2 fails, bleachers remain excluded regardless of frequency.

### Class C — Initial exclusions

- Playground frames.
- Trees.
- Backstop fencing.
- Walls and ledges.
- Doorframes.
- Countertops.
- Sofa arms.
- Picnic tables.
- Bleachers pending promotion evidence.

### Critical invariant

```text
Object detected
      ≠
Object supported for exercise
      ≠
Object verified structurally safe
```

This distinction must never collapse in code, copy, or product behavior.

---

## 8. Exercise Compatibility Engine

MoveHere begins with a small feature-to-movement compatibility matrix rather than a general exercise library.

```text
SUPPORTED FEATURE
        ↓
SUPPORTED MOVEMENTS
```

Illustrative structure:

```text
OPEN GROUND
├── squat
├── reverse lunge
├── push-up
├── plank
└── selected mobility movements

BENCH
├── supported step-up variation
├── incline push-up
└── other reviewed movements

PURPOSE-BUILT BAR
├── supported hang variation
└── supported pulling movement
```

The exact exercise set must be reviewed before being treated as authoritative.

The initial question is:

> **Can a small, trustworthy compatibility system generate useful sessions from confirmed venue features?**

### Differentiation risk

A conservative registry may cause many parks to resolve to:

```text
open ground
+
path
+
bench
```

If materially different parks produce near-identical sessions, venue awareness may not be doing enough useful work to justify the product mechanism.

This is tested through **Gate I — Venue Differentiation**.

---

## 9. Safety Authority Boundary

MoveHere separates four questions:

```text
VISION
What appears to exist?
       ↓
CONFIRMATION
Does the user confirm it exists?
       ↓
CONDITION GATE
Are known external conditions acceptable?
       ↓
COMPATIBILITY
Which supported movements are compatible?
```

None of these means:

> **“MoveHere guarantees this object is safe.”**

MoveHere should avoid structures whose suitability cannot reasonably be established within its authority.

---

## 10. Injury and Medical Scope

MoveHere does **not** provide injury-aware or medical-condition-aware programming initially.

Do not implement:

```text
Medical condition
      ↓
Software interprets condition
      ↓
Determines contraindications
      ↓
Prescribes alternative exercise
```

### Initial behavior

An optional question may ask:

> “Do you currently have pain, an injury, or a condition that affects how you exercise?”

If yes:

1. MoveHere states that it does not adapt sessions to injuries or medical conditions.
2. MoveHere does not claim to determine what is safe for the condition.
3. The user may choose to view the standard session, clearly labeled as **not modified or evaluated for their condition**.
4. MoveHere suggests consulting an appropriately qualified professional.
5. Volunteered free text is not parsed into generation logic.

Explicitly excluded:

- Injury-specific substitutions.
- Condition-specific safety claims.
- Severity triage.
- Diagnosis.
- Exercise exclusion keyed to reported medical conditions.

Future injury-aware programming requires:

- Authoritative source material.
- Qualified professional review.
- Versioned rules.
- Test coverage.
- Clear refusal/escalation behavior.
- Legal review.

---

## 11. Conditions and Seasonality

Potential signals include:

- Precipitation.
- Freezing conditions.
- Extreme heat.
- Heat index.
- Daylight.
- Severe weather.

> **Indoor fallback does not automatically solve seasonality.**

If months of indoor use remove the product's differentiation, MoveHere may lose value during adverse seasons.

### Phase 1 adverse-condition behavior

```text
Conditions gate fails, conditions unavailable,
nothing confirmed, or no compatible venue movements
        ↓
Offer environment-independent substitute session
        ↓
Label it as a substitute, not a park session
        ↓
Track locally:
offered / started / completed / dismissed
        ↓
Record which of those causes applied
```

A substitute session is offered whenever a venue-aware session cannot be produced but a valid environment-independent session can. That includes the case where a venue has confirmed features but none of them yield compatible movements for the requested goal and time.

Offering no session at all is reserved for cases where no valid session can be constructed by any route. A user who asked for a workout should not receive nothing simply because their venue did not resolve.

This gives the product a defined state without pretending that a generic fallback solves seasonality.

---

## 12. Indoor Venue Awareness

Indoor scanning is a possible later extension, not Phase 1 scope.

Before building it, test:

> **Does scanning an indoor environment create meaningfully more value than a conventional bodyweight workout?**

If supported later, indoor venues require their own supported-feature registry and safety rules.

Do not transfer outdoor assumptions to arbitrary household furniture.

---

## 13. Venue Data as a Potential Compounding Asset

Community-confirmed venue profiles may eventually create increasing value, but this is not yet a proven moat.

The potential asset is richer than a feature list:

```text
Venue
  +
confirmed supported features
  +
condition history
  +
user corrections
  +
exercise compatibility
  +
actual session usage
  +
failed/unusable features
  +
completion behavior
        ↓
knowledge about what actually works
at this venue
```

Defensibility must emerge through real usage.

---

## 14. Location, Images, Privacy, and Eligibility

### Image principle

> **Persist derived features, not raw venue photographs.**

Future vision pipeline:

```text
Photo
  ↓
client-side privacy processing
  ↓
temporary server-side inference
  ↓
derived candidate features
  ↓
raw image discarded
```

Potential privacy and legal issues—including image processing, geolocation, health-adjacent data, consent, retention, and deletion—require qualified review before public commercialization.

These are identified risks, not legal conclusions.

### Engineering decisions

- Strip unnecessary EXIF metadata before upload.
- Do not persist raw venue photos.
- Do not expose a publicly attributable home-park relationship.
- Do not add a public activity feed by default.

### Age / eligibility

Phase 1 has **no authentication or signup flow**.

Any initial age/eligibility gate therefore belongs in the **local first-run experience**, not at signup.

MoveHere intends to target adults initially. Exact minimum age and legal implementation requirements must be verified before public commercialization.

---

## 15. Technology Direction

Current direction:

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- Deterministic domain logic separated from UI.
- Server-side vision inference when vision is introduced.
- Server-side session generation when server infrastructure is introduced.
- Supabase + PostgreSQL in Phase 2.
- RLS in Phase 2.
- PostGIS only when geographic venue discovery requires it.

### ORM

Prisma remains removed unless a later requirement justifies reconsideration.

### Accessibility

Accessibility is a Phase 1 quality requirement.

Target WCAG 2.1 AA or the applicable current standard after verification.

Build semantic structure, keyboard access, visible focus, readable contrast, accessible form labels, and screen-reader-compatible interactions from the beginning.

---

## 16. Product Evidence Gates

Formal customer validation is intentionally deferred during the current engineering phase.

### Gate A — Problem

Do target users actually experience difficulty translating nearby parks into useful structured workouts?

### Gate B — Proximity

**Informational, non-blocking.**

Is travel/setup overhead meaningfully related to why target users do not consistently use alternatives?

### Gate C — Competition

Is there a meaningful reason users would choose MoveHere over their current alternative?

### Gate D — Vision

Can ordinary phone photos plus user confirmation create the minimum reliable supported-feature inventory?

### Gate E — Generation

Can the curated compatibility matrix produce sensible sessions?

### Gate F — Behavior

Do users actually perform the sessions?

### Gate G — Seasonality

During adverse outdoor periods, is there a continuity mechanism that retains enough value?

### Gate I — Venue Differentiation

Do materially different confirmed venue inventories produce materially different sessions?

If a minimally equipped park and a feature-rich park produce near-identical sessions, venue awareness may not create meaningful differentiation.

### Gate J — Incremental Value

> **Does venue-aware generation create meaningful value compared with a comparable venue-blind workout?**

Compare the same goal and available time:

**A — Venue-blind**

A comparable generic session generated without venue inventory.

**B — Venue-aware**

A session generated from confirmed supported park features.

Future evaluation should observe:

- Required substitutions.
- Workout starts.
- Workout completion.
- Execution friction.
- Later choice.
- Unprompted reuse.

**Gate I asks whether venue awareness changes the output.**

**Gate J asks whether that change matters to the user.**

### Domain authority is not a research gate

The authority boundary is a standing product and safety decision.

User demand cannot authorize medical programming, unsupported structural assumptions, or other excluded behavior.

---

## 17. Current Validation Status and Deferred Research

MoveHere is currently an exploratory product and engineering project.

The following remain **unvalidated product hypotheses**:

- The problem.
- The target user.
- Competitive differentiation.
- The venue-aware value proposition.
- Willingness to reuse.
- Seasonality resilience.
- Willingness to pay.

Initial development intentionally proceeds first to prototype and evaluate:

- Venue representation.
- Feature confirmation.
- Feature classification.
- Exercise compatibility.
- Deterministic session generation.
- Safety invariants.
- Venue differentiation.

### Deferred before commercialization

- Target-user interviews.
- Competitive user testing.
- Wizard-of-Oz sessions.
- Gate J venue-aware vs. venue-blind comparison.
- Behavioral validation.
- Retention testing.
- Seasonality validation.

The absence of this research must never be represented as evidence that the hypotheses are validated.

### Early park audits

Park audits remain useful during engineering because they can cheaply challenge the domain model without requiring customer recruitment.

Record:

- Supported structures present.
- Feature variation between parks.
- Class B prevalence.
- Identification difficulty.
- Unsupported structures.
- Session differences produced by different inventories.
- Bleacher construction and distinguishability.

---

## 18. Success Measures

Future production measures may include:

- Activation.
- Scan completion.
- Feature precision.
- Session conversion.
- Weekly frequency.
- D7 retention.
- D30 retention.
- Adverse-season retention.

During the engineering stage, the meaningful measures are internal rather than commercial. They test whether the mechanism behaves as specified, not whether a market exists:

- **Feature-confirmation behavior** — the proportion of candidate features users confirm, reject, or cannot classify.
- **Inventory stability** — whether repeat scans or repeat manual selection at the same venue resolve to a consistent confirmed inventory.
- **Generation coverage** — the proportion of confirmed inventories that yield a complete session across supported goals and time budgets.
- **Session differentiation** — the measurable difference between sessions generated from materially different confirmed inventories (Gate I).
- **Substitution rate** — how often a park session falls back to environment-independent movements.
- **Invariant integrity** — zero instances of generation depending on an unconfirmed feature, an unsupported object, or a Class C structure.
- **Audit friction** — structures observed during park audits that the supported-feature registry cannot classify.

None of these measures indicate product-market fit, demand, retention, or willingness to pay. They indicate only whether the domain model, the confirmation contract, and the deterministic generator behave as specified.

---

## 19. Phase 0 — Product & Engineering Foundation

Phase 0 is the current phase.

Its purpose is to establish the domain model, the safety authority boundary, and the deterministic generation mechanism in a form that can later be evaluated — and to challenge those decisions cheaply, before customer recruitment.

### Phase 0 is not the MVP

Phase 0 is not a launch candidate, not a commercial release, and not a validated product. Work produced during Phase 0 exists to test whether the mechanism can be built responsibly, not to demonstrate that anyone wants it.

Nothing produced in Phase 0 should be presented externally as evidence of product-market fit.

### Formal customer validation is intentionally deferred

Target-user interviews, competitive user testing, Wizard-of-Oz sessions, the Gate J venue-aware vs. venue-blind comparison, behavioral validation, retention testing, and seasonality validation are deliberately postponed until after Phase 0, as recorded in §17.

This deferral is a sequencing decision, not a finding. The absence of this research must never be represented as evidence that the hypotheses in §17 are validated.

### In scope for Phase 0

- The supported-feature registry and Class A/B/C classification (§7).
- The candidate → confirmation → confirmed venue inventory contract (§6).
- The exercise compatibility matrix (§8).
- Deterministic session generation.
- Safety invariants and the authority boundary (§9).
- The conditions gate and the environment-independent substitute session (§11).
- Local-only state.
- Accessibility as a design and engineering constraint on architecture decisions, with implementation deferred to Phase 1 (§15).
- Park audits (§17).

### Out of scope for Phase 0

- Vision inference.
- Accounts, authentication, and server-side persistence (§14).
- Injury-aware or medical programming (§10).
- Indoor venue awareness (§12).
- Venue classes beyond the park wedge (§5).
- Commercial claims, pricing, and marketing.

### Leaving Phase 0

Exit is a judgment, not a schedule. Phase 0 has done its work when the domain model survives park audits, Gate I shows that confirmed venue inventories materially change generated sessions, and the remaining hypotheses are still stated as hypotheses.

### Phase 1 and Phase 2

Phase 1 and Phase 2 are referenced throughout this document but are not yet formally defined. Defining them is deferred until Phase 0 produces enough evidence to scope them honestly.
