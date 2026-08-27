# MoveHere — Product Plan

**Version 4.8 — Park-first, venue-aware, evidence-driven**

> **Working name:** MoveHere. Availability and trademark clearance have not yet been completed.
>
> **Status:** Web Product Consolidation (§21) is the current implementation stage. **Activity and session history (§24) is authorized and partially built.** **Session Execution v2 (§25) is authorized as design authority and is not implemented.** The Native Mobile Client (§20) is **paused at a validated implementation checkpoint**. The Phase 0 foundation (§19) is mechanism-complete and released as the web MVP (`web-mvp-v1`); its remaining exit conditions are open and carried forward. Formal customer interviews and commercial validation are intentionally deferred. Product hypotheses remain explicitly unvalidated.
>
> **Supersedes v4.7**, which is retained unchanged as the historical product authority for that version. v4.8 changes nothing about what MoveHere may claim and everything about what it can honestly record. §25 replaces the scalar execution model with explicit per-movement execution state, authorizes **Skip**, **Finish later**, **End workout** and **Restart**, and permits an intentionally ended workout to enter history for the first time.
>
> **The discovery behind it:** the existing `done` counter conflates two different facts — *where the user is* and *what the user performed*. Everything that could not be expressed followed from that single fusion.
>
> **§25 authorizes a model, not a vocabulary.** §22's governing rule applies unchanged: no capability becomes production copy or affordance before its minimum truthful implementation exists. Every refusal in §18, §23 and §24 stands — **improvement, streaks, trends and measured performance remain refused, not deferred.**
>
> v4.6, v4.5, v4.4 and v4.3 remain the historical authorities for their own versions.

---

## 1. Executive Summary

MoveHere explores a simple product hypothesis:

> **Can understanding the environment, resources, and time a user actually has remove enough workout-planning friction to help them exercise more consistently?**

Instead of asking users to search a workout library and determine whether a workout fits their circumstances, MoveHere builds a session from what is actually available where they are.

**The park is the first environment in which that capability is implemented**, and the current differentiating proof that the mechanism works: confirmed park features materially change the generated session (§16, Gate I). Today MoveHere creates a structured inventory of **user-confirmed supported features** in a nearby park and uses that inventory to construct a compatible workout. Beyond the park and environment-independent sessions, nothing is built (§4).

### Initial experience — the park

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

**MoveHere is environment-aware in purpose and park-first in implementation — not a universal workout generator.**

### Target product experience

This document already separates three registers: the product vision, the current implementation, and the current differentiating proof. This is a fourth, and it is the weakest of the four in authority.

The target product experience is the loop MoveHere is trying to make feel obvious:

```text
Where am I?
    → What is available?
    → How much time do I have?
    → What is my goal?
    → Give me a workout I can actually perform here.
    → Guide me through it.
    → Adapt when the environment does not cooperate.
    → Remember what I did and, where honestly measurable,
      help me understand progress.
```

Most of that loop is implemented today. Two clauses are deliberately hedged and must stay hedged. *Where am I* is answered by the user rather than by location services (§14). *Where honestly measurable* is doing real work in the last line: MoveHere records that a session was completed, and records nothing from which improvement could be computed — no load, no completed repetitions, no perceived effort. A progress claim whose measurement has never been defined is not a feature that has not shipped yet; it is a claim the product cannot currently make (§18).

**Expansion should strengthen this loop rather than widen the catalogue.** A capability that makes *what is available here* sharper belongs to this product. A capability that makes MoveHere a larger workout library does not, however well it would sell.

**The approved design anchor** is `docs/design/movehere-target-landing-page.png`, with the full capability classification in `docs/design/target-product-experience.md`.

> **The anchor governs visual and product-experience direction. It does not authorize capability.**

A capability does not become authorized by appearing in an approved design. Every material capability the anchor shows or implies is classified in that artifact as current, near-term presentation, **planned**, a future candidate, or not authorized by vision alone. Where the anchor and this plan differ, **this plan governs capability and the anchor governs visual direction**. The classifications themselves are product decisions and live here: §22 for authentication, §23 for the rest.

---

## 2. Problem Statement

### The general friction

Sessions are not usually skipped because someone did not want to train. They are skipped because the setup was wrong — the gym required a trip, the weather turned, the equipment was not there, or the time available did not match the plan.

The hypothesized friction is therefore:

> **“I could train right now, but not in the way I think I'm supposed to, so I don't.”**

MoveHere attempts to eliminate the translation work between whatever environment, equipment and time a person actually has and an executable workout.

### The park instance of it

The hypothesized beachhead user already has convenient access to a nearby park and may already walk or run there, but does not consistently use the environment for strength or structured training. For them the friction reads:

> **“I have somewhere nearby where I could exercise, but I don't know what useful workout I can do with what is actually there.”**

This is one instance of the general friction, not a narrower replacement for it. The park is where MoveHere addresses it first (§5), and the only environment currently implemented.

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

### Three levels, kept distinct

Conflating these is how "park-first" drifts into "park-only", and how a parity feature gets mistaken for a differentiator. They are stated separately and should stay that way in the plan, the product and any external description.

**Product vision.** MoveHere builds a workout around the environment a person is in, the resources and equipment available to them, the time they have, and the goal they choose.

**Current implementation.** Park-aware sessions built from user-confirmed park features, plus environment-independent sessions requiring no equipment at all. Nothing else is built.

**Current differentiating proof.** The park is MoveHere's first environment-aware implementation, and the evidence that the mechanism works: confirmed park features materially change the generated workout (§16, Gate I).

### Environment awareness is the capability; the park is the first instance

The differentiating capability is **environment awareness** — understanding what is actually available where a person is, and generating from it. The park is the first environment in which that capability is implemented, not the capability itself.

This matters for sequencing as well as language. Supporting a further environment is the same capability pointed somewhere new, subject to the same admission, confirmation and safety boundaries (§5, §7, §9). It is not a different product.

### No-equipment generation is not the differentiation

Environment-independent workouts overlap substantially with capabilities existing fitness products already offer. MoveHere does not claim that capability as its differentiation.

Its role is **continuity**: it is what keeps a person training when the park is unavailable, the weather turns, or nothing has been confirmed yet. Continuity is the promise; environment awareness is the proof.

### Positioning constraint

MoveHere should not compete primarily on:

- Price.
- Exercise-library size.
- Number of workout videos.
- AI novelty.
- Bodyweight or no-equipment workout generation.

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

### Park-first is a sequencing decision, not the product boundary

The park is where environment awareness is implemented first. It is not the limit of what MoveHere is for (§2, §4).

The domain model already reflects this. The candidate → confirmation → confirmed inventory contract, the compatibility engine and the generator say nothing about parks; only the supported-feature registry (§7) is park-specific, and it is park-specific by deliberate choice rather than by structural constraint.

### Venue-aware

The underlying architecture may eventually generalize beyond parks.

However:

> **Venue-capable does not mean every venue belongs in the product.**

New venue classes should only be supported when evidence justifies them and the safety/domain model can support them responsibly.

Both statements hold at once. Park-first does not narrow the product's purpose, and a broad purpose does not widen the registry. Nothing enters on the strength of the vision alone.

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
✓ Path
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

**Confirmation remains a separate step in the MVP**, even though the MVP's only candidate source is manual selection and selecting a feature already implies asserting it. The review step is retained because it is where the product's central invariant becomes visible to the user, and because it is the seam vision plugs into later without restructuring the flow.

### Step 4 — Session inputs

Initially collect only:

- Available time.
- Session goal.

The initial supported session goals are:

- Strength.
- Conditioning.

**Mobility is deferred.** It is not a supported goal in the MVP. It remains a candidate pending reviewed domain input on two questions: whether mobility is a goal MoveHere should program at all, and whether it can be expressed in the same programming model as strength and conditioning (§8). Initial goal-policy work covers strength and conditioning only. Mobility is promoted or removed on evidence, not on the fact that it was listed first.

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

**MVP conditions input is user-reported**: acceptable, adverse, or unknown. No weather service is integrated. The disposition the user reports drives the same gate a retrieved forecast eventually would, so the substitute path is exercised for real rather than stubbed. Unknown behaves as unavailable.

### Step 6 — Generate and perform

The deterministic generator may use only:

1. user-confirmed supported venue features; and/or
2. explicitly environment-independent movements.

The user follows the workout and records completion locally.

The user may ask for a different session for the same venue, goal, and duration. This generates with a new seed and is recorded with the session, so any session remains reproducible. **The raw seed is not exposed in normal UI** — it is provenance, not a user-facing control.

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

- Walking/running path.
- Stairs.
- Hills.
- Running track.
- Hard court.

### Open ground is baseline space, not a registry feature

Ordinary usable standing, floor, or ground space is deliberately **not** in the
registry. It is the baseline condition every environment-independent movement
already assumes, which is exactly why it fails admission condition 3: a feature
that changes no eligible movement does not materially change generation.

Confirming it would ask the user to assert something that adds nothing, and
would make an inventory containing only open ground look venue-aware when the
session it produces is environment-independent. Environment-independent
movements carry their own declaration (§8) and depend on no confirmation.

### Class B — Initial candidates

- Conventional park bench.
- Purpose-built pull-up/horizontal bar.
- Purpose-built parallel/dip bars.

### Outdoor fitness equipment enters as specific types, not as a category

"Designated outdoor fitness equipment" is not a registry entry. It names a
category rather than an object, and the category spans equipment with
materially different load paths — a captive-weight machine, a balance beam, a
suspension frame and a sign-posted stretching station are not one thing.

Admitting a category would let an unreviewed object inherit support from the
label attached to it, which is the failure mode Class C exists to prevent.

Future equipment therefore enters **one specific feature type at a time**, each
satisfying the five conditions on its own evidence, each with its own
confirmation prompt, and each with explicit reviewed compatibility claims
naming the movements it supports. No object becomes supported by resembling
something already in the registry.

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
ENVIRONMENT-INDEPENDENT
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

The first group is not a venue feature. Environment-independent movements are
declared as needing nothing, which is why they remain available when no venue
is confirmed (§7, §11). Every other group hangs off a confirmed feature.

The exact exercise set must be reviewed before being treated as authoritative.

The initial question is:

> **Can a small, trustworthy compatibility system generate useful sessions from confirmed venue features?**

### When a context is a different movement

A compatibility claim says a movement can be performed using a feature, and a variation label names how it differs there. Most differences are small and honest: where a hand goes, where a foot goes, which surface is underneath. A label carries them.

Some are not variations at all. **The test is whether the feature changes where a limb is placed, or the body's relationship to the structure.** A step-up from a bench and one from a stair place the same foot on a different object. A knee raise hanging from a bar and one performed from a support hold on parallel bars do not: in the first the body hangs below the hands with the trunk unsupported, in the second it is held above them with the elbows extended and the torso upright. Nearly every joint above the hips is somewhere else, and the stability demand is not comparable.

**Where the support relationship changes, it is a different movement, and it belongs in the catalog as one.** Keeping it as a variation makes one entry describe two things: one set of cues that cannot be true of both, one instruction that constructs neither, and one asset key for two pictures.

This costs catalog size, and §7's preference for a small, inspectable catalog is real. It is not served by conflation. A catalog that stays short by describing two movements as one is not smaller, only less accurate.

### Goal programming policy

The compatibility matrix answers which movements a venue supports. It does not answer what a session should contain. That second question — which movement patterns a goal calls for, in what priority, in what structure, at what volume, with what rest — is fitness judgment, and it must not live in the generator.

MoveHere separates the two:

```text
GENERATOR
deterministic mechanism
       ↕
REVIEWED GOAL POLICY
fitness judgment, expressed as data
```

The generator selects, orders, and fills according to a policy it is given. It contains no programming knowledge of its own. A reader should be able to read the entire generator without learning anything about exercise programming.

Goal programming policy is therefore **reviewed data, not generator code**. It lives in the repository under version control, is reviewed like code, covers every supported session duration exhaustively, and resolves prescriptions deterministically. A policy is validated against the compatibility matrix before use, so that a policy the matrix cannot satisfy is caught when it is loaded rather than when a user asks for a workout.

Policy carries its own goal. Generation is given one reviewed policy rather than a goal plus a policy, so the two cannot disagree.

### Counting compatibility

Laterality and rep counting are separate concepts (§15), and separating them is not enough on its own. A prescription states a number; counting states what that number means. If nothing proves the two agree, a slot can hand a unilateral movement a total count, or a bilateral movement a per-side count, and the session states work the user is not actually being asked to do.

**Which counting values are meaningful is a fact about a movement**, in the same way that whether it can be dosed by reps or by time is a fact about a movement. A split squat accepts only per-side. A plank accepts only total. A step-up accepts either. A brisk walk accepts only total — walking alternates legs, but nobody walks for two minutes per side, and treating gait as unilateral for counting purposes produces exactly that sentence.

So this is a compatibility constraint, and it belongs beside the others:

```text
EXERCISE
├── which patterns it covers
├── how it may be dosed        (reps | time | distance)
└── how a dose may be counted  (total | per-side)
```

**Policy keeps owning counting, dose, and estimated time.** These are one decision, not three: "3 × 8 per side" is twice the work of "3 × 8", and the time a slot is budgeted for follows from the volume it prescribes. Deriving counting at generation time — from laterality or from anything else — would let volume float free of the estimate its author wrote, and a session's predicted duration would depend on which exercise happened to fill a slot.

**Feasibility proves the agreement.** A policy is already validated against the compatibility matrix before use, so that a policy the matrix cannot satisfy is caught when it loads rather than when a user asks for a workout. Counting joins that proof: for every slot, every exercise eligible to fill it must accept the counting that slot prescribes. A slot whose eligibility spans movements that disagree is not repaired at generation time. Its author either narrows it until the proof passes, or gives it prescription variants that dose each group honestly (below). Both are authored decisions; neither is a mechanism inferring a dose.

**Counting is never derived mechanically from laterality.** Laterality says whether a movement works one side at a time. Counting says how a prescribed number is read. The two are related and not equivalent, and gait is where the difference becomes visible.

### Slot prescription variants

Counting compatibility settles what a prescribed number may mean. It leaves a second problem in plain view: a slot carries one prescription, so a slot whose legitimately eligible movements need different prescription shapes can serve only some of them. In the shipped policy, nine slots narrow to a single possible movement for exactly that reason and twenty-nine lost breadth they should have kept. That is variety debt, not a correct resting state.

**A slot may carry a non-empty ordered set of prescription variants.** Everything that makes a slot one slot stays single-valued:

```text
SLOT — one training purpose
├── eligible patterns       one set
├── obligation per context  one value each
├── source preference       one value
├── repeat rule             one value
└── prescription variants   one or more, ordered
```

A slot with three variants is still one training purpose with one set of eligibility, source, and repeat semantics. Only the dosing varies, and only because the movements that legitimately belong in that slot are dosed differently.

**Eligibility is existential.** A movement is eligible for a slot when at least one authored variant is compatible with both its `prescriptionKinds` and its `countingModes`. No compatible variant, no eligibility — the movement is excluded, exactly as it is today.

**Variant order is authored policy precedence, and the generator adds no randomness.** The movement is selected first, as now; the variant is then the first authored one that movement accepts. The generator does not construct a prescription, does not rewrite one, and does not draw a second random number. Session-to-session variation already comes from movement selection, and a second source of it would make the same policy mean two different doses for no authored reason.

**Reordering variants is a policy change, not a permutation.** Generation output is invariant under permutation of input *collections* — the matrix's exercises, compatibility claims, and independence declarations — because the order of those carries no meaning. Variant order carries meaning. Permuting it is expected to change sessions, and it is reviewed as a programming decision like any other.

**`estimatedSeconds` belongs to each variant.** Once dosing varies within a slot, time cannot sit on the slot: a per-side hold is twice the work of a total hold at the same duration. Counting, dose, and estimated time remain one decision, made together, one level further down.

**Feasibility proves the bounds from opposite ends.** The upper duration bound is proved against the **longest** valid variant and the minimum-fill expectation against the **shortest**. A session must be impossible to overrun and impossible to under-deliver, whichever variants the movements select. This makes budgets somewhat more conservative, which is the correct direction for a promise about someone's time.

**Counting remains authored policy.** It is never derived from laterality, here or anywhere. Variants change which prescriptions a slot offers; they change nothing about where a prescription comes from.

**A variant describes a prescription shape and must never name an exercise.** This is the line that keeps the mechanism general. The moment a variant names a movement, this stops being slot structure and becomes the *Specific-exercise requirements* question recorded below as unresolved — which must not be answered by an implementation.

**Variants represent legitimate dosing differences, not a variety lever.** A variant is authored because a movement genuinely requires a different prescription shape, never because adding one lets another exercise into a slot. That distinction is not always visible in the data, so two advisories keep it in view: a slot whose variant count approaches its eligible-movement count has begun to approximate per-exercise programming, and a variant no eligible movement can use is dead policy.

**Expected consequence.** All nine single-option slots should be recoverable, and the twenty-nine counting-narrowed slots should regain their legitimate breadth, while counting violations remain at zero. `single-leg-deadlift` shows why this is one change rather than nine local repairs: adding a variant only to `s45-hinge-2`, the single slot it currently occupies alone, would reduce its share rather than restore it.

### Policy authority boundaries

Four rules govern how policy reaches production generation. All four are standing decisions.

**Draft policy cannot enter production generation.** Draft and reviewed policy are distinguishable, and only reviewed policy is eligible. Drafts are dropped when policy is loaded, and every drop is reported — a half-reviewed policy set must never look complete.

**Production-reviewed authority and test-fixture authority must remain structurally distinct.** Testing the generator requires policy, and fabricating a reviewer reference to satisfy a test would reintroduce, one layer higher, exactly the fabricated authority the venue confirmation boundary exists to prevent. Test authority must be unable to carry review provenance, must be refused in authored policy data, and must remain visible in the provenance of anything generated from it, so that a session built on test policy can never be presented to a user as a real one.

**Feasibility validation is a mandatory boundary.** Policy is validated against the compatibility matrix before it can enter production generation, so a policy the matrix cannot satisfy is caught as a defect rather than surfacing as a user receiving no session. This is enforced in CI and build verification, and again at loading or startup where applicable.

**Reviewed goal policy is general-fitness authority only.** It can never represent medical, rehabilitation, diagnostic, or injury-specific authority — see §10.

### Project-content authority

MoveHere's current objective is a school and portfolio engineering project: a complete, polished, working venue-aware fitness experience. Commercial-production readiness is not the bar for that objective, and the absence of professional review, customer validation, or commercial hardening does not block it.

That requires a third authority tier, distinct from both production review and test fixtures:

```text
REVIEWED          professional sign-off, production authority
PROJECT-CONTENT   researched conventions, portfolio authority
TEST-FIXTURE      test scaffolding, never presentable
```

**Project content is authorized for development workout content** — the exercise catalog, the compatibility matrix, and the strength and conditioning programming policies — authored from researched general-fitness conventions with its sources recorded.

Project content is presentable, unlike a test fixture. It is not reviewed, and it never becomes reviewed by being used. It does not satisfy Gate E, does not constitute professional authority, and changes none of the boundaries in §10: medical, rehabilitation, diagnostic, and injury-specific programming remain excluded regardless of authority tier.

**Sessions generated from project content must carry a persistent but quiet label saying so.** Persistent, because a user should never be mid-session and unaware of what authored the programming. Quiet, because an honest provenance note is part of the design rather than a disclaimer bolted onto it.

Promotion from project content to reviewed is a deliberate act requiring the review in §8, not an upgrade that happens by default.

### Policy review requirement

Programming policy is the highest-stakes domain content in the product. Compatibility asserts that a movement is possible at a feature; policy asserts what a person should do. The review standard differs accordingly.

A goal programming policy may be treated as authoritative only when reviewed by a **qualified fitness professional holding recognized training or programming credentials, with relevant practical experience**. The review must record the reviewer reference, the review date, and the supporting sources the policy rests on.

This standard is **provisional**. What counts as a recognized credential has not been defined, and defining it is an open decision. A policy with no cited basis is an opinion and must not be structurally indistinguishable from reviewed content.

This review authorizes **general fitness programming only**. It does not authorize medical, rehabilitation, diagnostic, or injury-specific programming, which remain excluded under §10.

### Movement instructions and execution cues

The catalog carries execution cues. Cues are corrective and attentional: addressed to someone already performing the movement, unordered, and deliberately partial because attention mid-effort is scarce. "Elbows back, not flared" is a correction, and a correction presupposes the thing being corrected.

That makes cues unsuitable as instructions for an unfamiliar movement, and they must not be presented as though they were. **Ordered movement instructions are a separate content type**, addressed to someone who has never performed the movement:

```text
EXECUTION CUES         unordered, corrective, read during the set
MOVEMENT INSTRUCTIONS  ordered, constructive, read before the set
```

Instructions are complete in a way cues are not: followed from a standing start, they produce the movement. Cues are complete in a way instructions are not: they name the errors that matter. Neither replaces the other, and adding instructions does not license shortening cues.

**Steps are typed**, because the defect is predictable:

```text
setup   where the movement begins
action  what happens
return  how a repetition completes
```

The commonest defect in an instruction is a missing start position: a set of steps that begins mid-movement reads as complete and is not. An authored instruction must therefore carry at least one `setup` step and at least one `action` step. A `return` step is optional, because a static hold has none.

**Instruction state is three-valued**, not present-or-absent:

```text
authored      steps exist, carrying their own recorded authority
not-required  deliberately none — walking needs no instruction
outstanding   not yet written
```

"We decided none is needed" and "we have not written one yet" are different facts, and a model that collapses them into absence loses the distinction permanently. This is the discipline §7 already applies to venue features: the states stay distinct in the types, not only in someone's memory.

**Side-switching is derived from the prescription, never written into a step.** Authored text cannot know which counting a slot will use, so a step that says "then switch sides" is either wrong or accidentally right. What a prescribed number means is stated once, by the prescription, and the instruction surface renders that rather than restating it.

Instructions carry their own authority, separately from the exercise they describe. They are new content on a different authoring schedule, and inheriting an exercise's tier would let an instruction acquire authority it never earned. Until independently reviewed they are project content (§8) and are labeled as such.

**Instructions resolve against the context the session actually cited.** Some movements begin from a different position depending on the structure they use. A split squat with the rear foot on the ground and one with it raised on a bench start differently; a knee raise hanging from a bar and one supported on parallel bars, more so. One set of steps cannot construct both without describing neither.

Duplicating a whole instruction per context is the wrong repair. The action and the return are identical in both examples, and two copies of a paragraph are two paragraphs that drift. So an authored instruction declares the context it was written for, and may carry phase overrides for the others:

```text
AUTHORED INSTRUCTION
├── default context  which basis the steps below construct
├── steps            setup / action / return, in phase order
└── overrides        per other context, replacing one phase wholesale
```

**The default context is declared, never inferred.** Where the matrix holds an environment-independent declaration for the movement, that is the default context: the form performable anywhere is the one a baseline description should describe. Where it does not, the default names the single supported feature its steps were written for. Prose whose intended basis is unknown is prose nobody can review — a reader cannot otherwise tell whether "place your whole foot on the step" was written for a bench or for a stair.

**The invariant is about resolution, not about the default.** The default must completely construct *its own declared context*. Every supported generation context must **resolve** to a complete instruction, either from the default alone or through valid phase overrides. The unmodified default is not required to be valid in every context, and requiring that would push the prose back toward describing nothing in particular.

**A phase override is a setup difference within one movement.** It may say a foot starts on a bench rather than the ground. It may not rewrite the body's relationship to the structure — if an override changes whether the body is supported or suspended, or what it is balanced on, the catalog holds two movements and should say so (above). An override must never be the thing that conceals that.

**Overrides replace a phase, never a step and never a whole instruction.** A phase is the smallest unit that is both meaningful and unambiguous to replace, which is also why steps must appear in phase order: a phase is then a contiguous run, and replacement preserves order without re-sorting. Because a phase may only be replaced by a non-empty set of steps of the same kind, a resolved instruction cannot lose the setup or the action the authored one guaranteed.

**An override may only describe a context the matrix already holds** — the rule exercise visuals already obey. Instruction content must never become a second way to assert that a movement can be performed on a structure. A cited context that differs from the default and carries no override is inheriting prose authored for somewhere else; that is a legitimate authoring decision and is reported, so it stays a decision rather than an oversight.

**Overrides carry their own authority, and a resolved instruction reports the weakest that was applied.** An override added after a review would otherwise ride on the reviewed tier without having been reviewed — the same laundering that giving instructions their own authority exists to prevent, one level further down.

**Only `authored` resolves.** `outstanding` and `not-required` are facts about the movement, not about where it is performed. A movement authored for a bench and outstanding for stairs would be a fourth state wearing a disguise, and the three states stay three.

**Context decides where a person puts their foot; the prescription decides how many and which side.** Resolution changes which steps are read and nothing else. Side-switching still derives from the prescription at render time, from the same place, for the same reason.

### Exercise visuals and the compatibility boundary

Exercise visuals are presentation, and they sit under the same boundary as instruction content because they can assert the same thing.

**A visual may illustrate a compatibility claim the matrix already holds. It may never create one.** Adding a depiction does not establish that a movement can be performed on a structure; a build check fails on any pairing the matrix does not hold, so a picture cannot quietly assert what generation never authorized. This is the rule instruction overrides were written to match, and it applies in both directions.

**Cue text is reference-only and is not depiction authority.** Cues are corrective and attentional project content, several of them recorded as unestablished against their sources. A visual composed to satisfy a cue would give that cue an authority nothing granted it, so where a grounded depiction requirement and a cue differ, the grounded basis governs and the discrepancy stays open for review.

**Incidental environment creates no compatibility.** A structure visible behind a movement is scenery, not a claim: the movement must remain performable if every incidental object were removed. A structure participating in the movement is a claim, and is governed by the matrix.

The production rules implementing all of this — composition, phase ordering, theme treatment, equipment prohibitions, per-movement briefs — are in `docs/exercise-media-manifest.md`. They are production law rather than product law and are deliberately not restated here.


### Instruction evidence eligibility

**A movement's presence in the catalog and its instructions are separate questions.** An exercise may ship as project content with no external instruction basis at all. Source-grounding gates what may be *written about* a movement; it never gates whether the movement may be *offered*. A catalog entry rests on the compatibility and authority rules above. An instruction rests on evidence. They are not the same gate and must not be collapsed into one.

Absence of a convenient public source is not evidence that a movement is invalid. Several movements this project ships are ordinary and widely performed and simply have no institutional page describing them. The supported knee raise is a further case: the project separated the supported form into its own catalog identity after evidence showed it should not remain conflated with the hanging knee raise, and no directly applicable institutional instruction source has yet been found for that identity. The movement is not new; the identity is, and the search has so far not matched one to the other.

**Source-grounding is required before source-grounded instructions may be authored**, unless professional review independently supplies both the authority and the basis, in which case the review *is* the grounding.

**Where a bounded search found nothing adequate, the instruction stays `outstanding`, and model knowledge may not fill the gap.** This is the rule that matters most, because breaking it is invisible from the outside. An instruction assembled from what a model happens to know, shipped in a product that labels content by how it was authored, is content whose stated provenance is false. It does not become acceptable by turning out to be accurate.

**Where a candidate source exists but nobody has read it, the instruction also stays `outstanding` — and the two cases must remain distinguishable in the evidence record.** They produce the same state and are not the same problem. One is closed until new evidence appears; the other is open, cheap, and someone's next task. A record that flattens them loses the difference between work that is finished and work that was never started.

**`not-required` is never inferred from missing or insufficient evidence.** It is a deliberate decision that a movement needs no written instruction, made about the movement, and recorded with its reason. Arriving at it because evidence proved hard to find would convert a gap into a claim, which is precisely what the three-valued state exists to prevent.

**Source-grounding does not promote content authority.** A source agreeing with project content leaves it project content. Authority is a property of how content was authored and reviewed, not of whether something external happens to agree with it, and only professional review moves the tier.

**An `outstanding` instruction produces no "How to do it" affordance in the client**, and no "not available yet" label is added in its place. The client shows what exists; it does not narrate what does not. An absent affordance says nothing, while a labelled empty one advertises an internal content gap on every session containing that movement — which serves the project's bookkeeping rather than the person exercising.

**Cues continue to render regardless.** They are existing project content under their own authority, unaffected by the state of the instruction beside them. A movement with no instruction still carries what to attend to while performing it.

The four states, with the movements currently in each:

```text
evidence insufficient    searched, nothing adequate found
    pike push-up, hanging knee raise, supported knee raise

verification incomplete  a candidate source exists, unread
    hip flexor stretch, march in place

not-required             deliberate decision, reason recorded
    brisk walk, easy run

blocked on domain input  §8 unresolved questions
    thoracic rotation, shuttle run
```

The last is not an evidence state at all. It is listed here only so the four are not confused with one another: those two movements are waiting on a decision this project has not made, not on a source it has not read.

### Unresolved domain questions

The following are recorded so they are not quietly resolved by an implementation. **No further design should be built around them until reviewed fitness-domain input exists.**

- **Block roles.** The permitted vocabulary of block roles within a session.
- **Work/rest structures.** The permitted vocabulary of work and rest structures, and which applies to which goal.
- **Prescription resolution.** How a prescribed range is resolved to a single value. Taking the minimum, the midpoint, or scaling by duration are materially different training decisions, so the rule is domain input rather than a mechanism default.
- **Minimum viable program.** What the smallest program that still counts as a given goal at a given duration consists of.
- **Specific-exercise requirements.** Whether a policy may ever mandate a particular movement rather than a movement pattern. The current model selects exercises to fill pattern-based slots; mandating a specific exercise would require a different structure. Prescription variants sit next to this question without answering it: a variant describes a dosing shape and may never name a movement.
- **Venue-richness policy.** Whether a better-equipped venue should be programmed differently, or merely substituted into. The current model is venue-agnostic policy plus mechanism substitution.
- **Thoracic rotation starting position.** The movement is commonly taught side-lying, quadruped, and seated, and the catalog's cues do not say which. Choosing one is a programming decision rather than a description of an existing claim, so its instruction stays unwritten until reviewed input exists.
- **Shuttle run distance.** How far out the movement runs before turning is stated nowhere in the product, and the distance materially changes what is being prescribed. It is not to be invented to complete an instruction.

### Differentiation risk

A conservative registry may cause many parks to resolve to:

```text
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

### Feature-use checks

A movement that depends on a structure raises a question a movement on open ground does not: is this particular bar, bench, or step one this person wants to use? MoveHere cannot answer it. It has no access to the object, no load rating, no inspection history, and no authority to assess any of them.

It can stop leaving the question abstract. "Nothing here assesses whether it is safe to use" is honest and gives a user nothing to act on. **A feature-use check names what a person might look at, and stops there.**

```text
NAMES WHAT TO LOOK AT     ✓
STATES WHAT TO CONCLUDE   ✗
RECORDS THAT IT WAS DONE  ✗
```

Four constraints, all standing decisions.

**A check never states a conclusion.** It may draw attention to movement in a fixing, to rust, to a wet surface. It may not say a structure is safe, sound, secure, suitable, or inspected, and it may not imply that looking makes it so.

**A check is not completable.** No checkbox, no confirmation, no state the player or the generator waits on. A completion record is a verdict record: it lets a user — and later, a reader of the data — treat "the check was done" as "the structure was cleared". The decision to use a structure is the user's, before and after.

**A check never gates generation.** Confirmed inventory is the only thing that drives generation (§6). A second gate that looked like a safety gate would make the confirmation contract mean something it does not.

**A check is content, carrying its own authority.** It is the content type closest to the boundary this section draws, and therefore the one most in need of professional review. Until independently reviewed it is project content (§8), labeled alongside everything else.

If a check cannot be written for a feature without stating a conclusion, it is not written. An absent check costs a user nothing they had. A check that reads as clearance costs them the boundary this entire section exists to hold.

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

Review of a goal programming policy under §8 does not satisfy any part of this list. A qualified fitness professional signing a general-fitness programming policy authorizes general fitness programming and nothing further. It is not authorization for injury-aware programming, condition-specific substitution, or any claim about what is safe for a medical condition, and it must never be represented as such.

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

### Home resources enter through the same boundaries

A future home or equipment mode is the same environment-awareness capability applied to another place (§4). It is not an exemption from any of the boundaries that govern the park.

Any home resource — a chair, a step, a band, a dumbbell — must satisfy the same requirements as a park feature:

- The five-condition admission test for the supported-feature registry (§7).
- Class A / B / C classification by load-bearing assumption (§7).
- Candidate → confirmation → confirmed inventory, with no separate path into generation (§6).
- Reviewed compatibility claims that make no unfounded structural assumption (§8, §9).

**The existing Class C exclusions stand unchanged.** Doorframes, countertops, sofa arms, walls and ledges are excluded today and a home mode does not reopen them. Being indoors is not evidence that an object is safe to load; if anything, household furniture is less predictable than purpose-built outdoor equipment.

Purpose-built portable equipment — a resistance band, a dumbbell — is a different case from household furniture and may be more admissible, but it enters through the same test rather than around it.

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

MoveHere has two clients over one shared domain.

```text
MoveHere
   │
   ├── Web
   │   Next.js
   │   web-mvp-v1 released
   │   current implementation surface (§21)
   │
   └── Native Mobile
       Expo + React Native
       iOS verified, Android unverified
       paused at a checkpoint (§20)
```

**The web client is the current implementation surface.** That is a sequencing decision recorded in §21, not a judgment about either client: the browser iterates faster than a simulator, and the native work produced enough product and presentation evidence that the target experience should be consolidated there before native resumes against it.

The clients are presentation. Neither owns product logic. The supported-feature registry, the candidate → confirmation → confirmed venue inventory contract, the compatibility matrix, goal programming policy, feasibility, and the deterministic generator are shared source, consumed identically by both. A client may not hold its own copy of any of them, and may not reach generation by a route the other does not have (§6, §8).

Current direction:

- TypeScript.
- Deterministic domain logic separated from UI, and shared by both clients.
- Web client: Next.js App Router, Tailwind CSS.
- Native mobile client: Expo, React Native, Expo Router.
- One repository, no workspace tooling. The shared domain has no external dependencies and no platform APIs, so it is shared as source rather than packaged.
- Local-only state on both clients. **Local Activity history is also local-only and selects no backend (§24.12, §24.13).**
- Server-side vision inference when vision is introduced.
- Server-side session generation when server infrastructure is introduced.
- **No backend, database, auth provider or row-level-security model is selected.** Earlier versions of this list named Supabase, PostgreSQL and RLS as Phase 2 direction. **v4.7 withdraws that naming**, because §22 subsequently made provider choice an open scoping question and stated plainly that Supabase is not selected — a direction list that still named one contradicted the section that governs it. When server persistence is introduced, §22 chooses; nothing is chosen in advance, and nothing is chosen by precedent from other projects.
- PostGIS only when geographic venue discovery requires it, and only under whatever provider §22 eventually selects.

### Shared domain, not a shared UI layer

The clients share domain logic, presentation data, and safety-critical copy. They deliberately do not share components. Tailwind and React Native are different rendering models, and a compatibility layer between them would buy partial reuse at the cost of putting a translation layer in the one place the visual identity is defined. The Open Air identity is shared as design tokens — colour, type scale, radii, elevation, motion — and rendered natively by each client.

The tokens are extracted from the web stylesheet; the stylesheet is **not** rewritten to consume them. That leaves two representations of the palette for now, deliberately. The working web CSS stays the canonical visual reference, and rewriting a released client's styling to import a token module would risk visual regression in exchange for single-source purity that cannot yet be evaluated. Mobile is the second consumer of these values, and whether native rendering needs different token semantics is something to learn from it rather than guess in advance. Revisit collapsing the two once the native client visually matches Open Air. The web consolidation stage (§21) rewrites that stylesheet substantially, which is the moment to collapse them rather than to defer again.

### Goal programming policy

Goal programming policy is data, authored in-repo and version controlled. It moves through the same review as code. It is data for authoring, not for runtime mutation.

### Carried-forward design work

- **Consistent exercise visuals in the workout player. Closed as stated; now a partial, evidence-governed system.** Phase 0 deferred this on the reasoning that a partial or inconsistent set would read worse than none. **That reasoning has been superseded by rendered evidence.** Missing media degrades gracefully — an unillustrated movement renders no placeholder and no empty region, and the movement with no asset at all was among the most usable screens in the set. Partial coverage does not make a movement unusable, which is the property the media architecture was built to have.

  Coverage is partial and honest about it: **4 of 31 presentation pairings illustrated**, three of them conforming production families and the fourth a superseded style draft that predates the production rules. Depictions are selected by session presentation and theme without changing media identity, and the depiction rules are governed by evidence in the same way instruction content is (§8). The current counts, the production brief and the per-movement briefs are in `docs/exercise-media-manifest.md`; the visual-evidence discipline is summarised in §8 and lives in full there.

### Carried-forward contract work

Recorded so it is not lost between passes:

- **Laterality and rep counting.** **Closed.** **Laterality is an intrinsic property of an exercise** — `bilateral | unilateral` — because whether a movement works one side at a time is a fact about the movement, not a policy choice. **Rep counting is a property of a prescription** — `total | per-side` — because it states what a prescribed number means. What was missing for both passes was the proof that the two agree: counting was authored per slot, slots select by movement pattern, and nothing checked the result. An audit found 1,335 of 6,540 generated items carrying a count their movement did not accept; the evidence is preserved in `docs/counting-compatibility-audit.md`. Counting compatibility (§8) closes it — `countingModes` authored per movement, proved when policy loads — and the figure is now zero.
- **Hanging knee raise is two movements. Closed.** Implemented. The matrix holds one exercise cited on a pull-up bar and on parallel bars, the second labelled *From a support hold*. The evidence does not support that being a variation: the body hangs below the hands in one and is supported above them in the other, and comparative research treats the supported version as its own exercise (`docs/movement-instruction-evidence.md`). `hanging-knee-raise` keeps the bar; a distinct supported knee raise takes the parallel bars, replacing the existing compatibility claim rather than adding to it. The new movement carries its own cues and structural metadata, because the existing ones are false of a support hold. Both remain instruction-outstanding on evidence grounds.
- **Movement instruction content. Partially authored, and the mechanism is proven in all three states.** The contract exists — typed steps, the three-valued state, declared default context and phase overrides, all validated when the matrix loads, with `check:instructions` reporting coverage on every build.

  Coverage is **12 authored, 2 not-required, 9 outstanding**, with one shipped context override and one context deliberately inheriting a default. The per-movement readiness board, the provenance of every source, and the reasons each outstanding movement is outstanding are in `docs/movement-instruction-evidence.md` and are not restated here, because that list changes as evidence is gathered and the plan should not track it.

  **Two facts belong in the plan rather than the artifact.** First, `not-required` is now a decided content state carried by real movements rather than a schema possibility: `brisk-walk` and `easy-run` are continuous locomotor modes with no distinct setup, action and return for the contract to order, and their session meaning is carried by the prescription and the cue layer. That is a judgment about the contract's fit, not a claim that either movement is simple or that a reader already knows it. Second, `outstanding` and `not-required` are deliberately indistinguishable on screen, so the only thing separating a decision from an omission is the recorded reason — which is why the reason is required and why "obvious" is not one.

  The eligibility rules governing all three states are in §8 and are unchanged.
- **Slot variety debt from counting compatibility.** Enforcing counting compatibility narrowed twenty-nine slots and left nine able to produce only one movement each, because a slot carries one prescription and its eligible movements are dosed differently. Every movement remains reachable and no session states work it is not asking for, so this is a valid state rather than a defect — but it is not the intended programming outcome, and it is deliberately visible: `counting-narrows-slot-to-one` names each affected slot when policy loads. Slot prescription variants (§8) is the resolution. **Closed** — the advisories are gone and exercise distribution returned to its pre-fix breadth without changing the authored training purpose of any slot.
- **Test-fixture authority.** If generation accepts only reviewed policy, test fixtures must be shaped as reviewed, which would mean fabricating a reviewer reference to make tests compile — reintroducing fabricated authority one layer above the venue brands. This is an open design question for the goal-policy contract pass, deliberately not yet solved.

### ORM

Prisma remains removed unless a later requirement justifies reconsideration.

### Accessibility

Accessibility is a quality requirement on both clients. The standard differs between them, because the conformance models differ.

**Web — WCAG 2.1 AA**, or the applicable current standard after verification. Semantic structure, keyboard access, visible focus, readable contrast, accessible form labels, and screen-reader-compatible interactions, built in from the beginning.

**Native mobile — the iOS and Android accessibility APIs and platform guidance**, carrying the equivalent principles rather than the web conformance label: sufficient contrast, meaningful labels, sensible focus and reading order, scalable text, reduced motion, adequate touch targets, and screen-reader usability under VoiceOver and TalkBack.

The native client is not described as WCAG 2.1 AA conformant. WCAG is written for the web, and inheriting the label because the other client targets it would be a conformance claim nobody verified — the same failure mode as presenting project content as reviewed programming (§8).

Accessibility constrains architecture from the start on both clients. It is not a later pass.

---

## 16. Product Evidence Gates

Formal customer validation is intentionally deferred during the current engineering phase.

The gates are stated at the level of the thesis they test, which is environment awareness (§4). The **park is the only evidence surface currently available**, because it is the only environment implemented. A gate phrased broadly is not a claim that home or equipment support exists; it records what the gate would have to answer, evaluated today against the park.

### Gate A — Problem

Do target users actually experience difficulty translating the environment and resources they actually have into useful structured workouts?

Currently evaluable only for the park.

### Gate B — Proximity

**Informational, non-blocking.**

Is travel/setup overhead meaningfully related to why target users do not consistently use alternatives?

### Gate C — Competition

Is there a meaningful reason users would choose MoveHere over their current alternative?

### Gate D — Vision

Can ordinary phone photos plus user confirmation create the minimum reliable supported-feature inventory?

### Gate E — Generation

Can the curated compatibility matrix and a reviewed goal programming policy together produce sensible sessions?

Sensibility is jointly determined. The matrix establishes what a venue supports; the policy establishes what a session should contain. Gate E cannot be evaluated before at least one reviewed goal policy exists (§8).

### Gate F — Behavior

Do users actually perform the sessions?

### Gate G — Seasonality

During adverse outdoor periods, is there a continuity mechanism that retains enough value?

### Gate H

**There is no Gate H.** The sequence runs A–G, then I and J.

Recorded because the omission looks like a lost gate and invites someone to
invent one. It is absent in every revision of this plan under version control,
so if a Gate H ever existed it predates the repository. Gate I is referenced
throughout this document, in the domain source, and in the test suite;
renumbering to close the gap would rewrite every one of those references to fix
nothing. The letter stays skipped.

### Gate I — Venue Differentiation

Do materially different confirmed venue inventories produce materially different sessions?

If a minimally equipped park and a feature-rich park produce near-identical sessions, venue awareness may not create meaningful differentiation.

**Gate I is deliberately park-scoped.** It is the current MVP evidence surface, and it should stay park-scoped rather than being restated in broader environment terms the implementation cannot yet support.

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

Phase 0 is no longer the current phase — see §20. It is retained here as the record of what it established, and of the exit conditions it did not close.

Its purpose was to establish the domain model, the safety authority boundary, and the deterministic generation mechanism in a form that can later be evaluated — and to challenge those decisions cheaply, before customer recruitment.

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
- The goal programming policy contract (§8) — the schema, not the values.
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

### Blocked pending external input

**Goal programming values require qualified fitness-domain review and may not be invented by the implementation agent.**

The blocked values are the eligible movement patterns per goal and their priority order; block count, roles, and role vocabulary; slot counts and which slots are required; set counts, rep ranges, hold durations, and distance ranges; rest durations at every level; work/rest structure and its vocabulary; volume caps per duration; prescription resolution rules; which dosing variants a slot offers and in what precedence; laterality values and counting modes; whether an exercise may repeat within a session; the minimum viable program per goal and duration; and the unresolved domain questions in §8.

Building the policy contract is not blocked. Populating it **with reviewed production values** is.

This blocker scopes to production authority only. Authoring **project-content** policy and catalog values for the school/portfolio MVP is authorized under §8, provided the content is labeled as project content, cites its basis, and is never represented as reviewed. An implementation agent may design the schema, the loader, and the feasibility check, and may author project-content values; it may not author reviewed values or present project content as professional authority.

### External input task

**Obtain qualified general-fitness programming review for the initial strength and conditioning policies, and for the minimum exercise compatibility set.**

Scope of the review:

- Goal programming policy values for strength and conditioning across all four supported durations (§6 step 4).
- The minimum exercise compatibility set — which movements are compatible with which supported features, and the environment-independent movements the substitute session depends on (§8).
- The unresolved domain questions in §8.
- Whether mobility belongs in the supported goal set at all, and if so whether it fits the same programming model.

Reviewer requirement and recorded provenance are defined in §8. The review authorizes general fitness programming only.

This is the single external dependency currently on the Phase 0 critical path. Gate E and Gate I are unevaluable until it is satisfied.

### Leaving Phase 0

Exit is a judgment, not a schedule, and it is worth separating two things that are easy to conflate.

**Mechanism complete** — the contracts, loaders, feasibility validation, generator, and verification are finished and passing. This is achievable entirely within the team and does not depend on external review.

**Phase 0 exit** — mechanism complete, the domain model survives park audits, Gate I shows that confirmed venue inventories materially change generated sessions, and the remaining hypotheses are still stated as hypotheses.

Exit additionally requires at least one reviewed goal programming policy, because Gate E and Gate I are both unevaluable without one: neither "are these sessions sensible" nor "do different venues produce different sessions" can be answered from sessions no qualified reviewer has authorized.

Separating the two matters because it lets engineering finish without waiting on review, and without the wait creating pressure to sign a policy quickly in order to declare a phase complete.

### What Phase 0 actually closed

Recorded against the two tests above, so the distinction Phase 0 drew is not lost by declaring the phase over.

**Mechanism complete — yes.** The contracts, loaders, feasibility validation, generator, and verification are finished and passing. The complete flow — environment selection, park features, confirmation, duration and goal, conditions, deterministic generation, workout player, completion and correction — was implemented and released as the web MVP (`web-mvp-v1`).

**Phase 0 exit — not closed.** Park audits have not been carried out, Gate I has not been evaluated, and no goal programming policy has been reviewed by a qualified fitness professional. The shipped content remains project content and is labeled as such (§8).

These conditions carry forward unchanged. Moving implementation to a second client does not resolve them, does not reduce them, and must not be described as having done so. The external input task above remains the single dependency on the critical path, and Gate E and Gate I remain unevaluable until it is satisfied.

### Phase numbering

Phase 0 is the only numbered phase this document defines. "Phase 1" and "Phase 2" appear throughout as labels for *product capability* stages — no authentication in Phase 1 (§14), accessibility as a Phase 1 quality requirement (§15), server persistence in Phase 2 (§15) — and they are still not formally scoped. **v4.7 withdrew the provider names that reference once carried**: §15 no longer names Supabase, PostgreSQL or RLS, because §22 governs that choice and has made none. Defining them is deferred until there is enough evidence to scope them honestly.

**One of those stages now has a name and an owner: authentication (§22).** v4.5 promotes it from FUTURE to PLANNED and records what must be decided before it can be built. That is a scoping obligation, not a scope: §22 chooses no provider, no schema, and no architecture, and it authorizes no implementation. The remaining Phase 1 and Phase 2 references continue to mean what they meant.

**v4.6 names three more (§23): progress and session history, multi-environment expansion, and readiness adaptation.** Same framing — each is scoped-but-unbuilt, and naming a stage is an obligation to define it honestly, not permission to start it. One of them, **local activity history, deliberately does not depend on §22**: history needs persistence, not identity, and the first stage runs on the device. v4.7 authorizes it as the next stage (§24).

The native mobile client (§20) is an implementation phase, not one of those capability stages, and deliberately does not claim the Phase 1 name. It adds a client; it adds no product capability. Every existing Phase 1 and Phase 2 reference continues to mean what it meant.

---

## 20. Native Mobile Client — paused at a validated implementation checkpoint

**Paused, not complete.** Its purpose was to bring MoveHere to iOS and Android as a native client, at feature parity with the released web MVP, over the same shared domain. It did not reach that bar, and in several respects it went past it. The reason for pausing is sequencing (§21), not a judgment that the work was wrong.

### Why this phase exists

The web MVP proved the complete flow end to end: a confirmed park inventory drives deterministic generation, and the whole sequence from environment selection to post-session correction is implementable inside the safety authority boundary (§9).

Native mobile was not part of the original implementation scope. It became the logical next client once the web version proved the flow — MoveHere is used standing in a park, on a phone, outdoors, which is a native context. This is recorded plainly so that a later reader does not mistake it for a commitment made earlier than it was.

### Scope

Feature parity with the web MVP, as originally scoped. What was actually built exceeded this in the ways recorded below:

```text
Environment selection
    ↓
Park features
    ↓
Confirmation
    ↓
Duration / goal / conditions
    ↓
Deterministic generation
    ↓
Workout player
    ↓
Completion / correction
```

- Expo, React Native, TypeScript, Expo Router.
- Local-only state, through the existing storage port and the existing rehydration boundary (§14).
- The Open Air identity translated to native rendering from shared design tokens (§15).

### Out of scope

Unchanged from Phase 0, and restated because a native runtime makes several of them newly *possible* rather than newly appropriate:

- Supabase, accounts, authentication, and server-side persistence (§14).
- Vision inference and camera capture (§6 step 2).
- Location and GPS (§14).
- Home-equipment support and indoor venue awareness (§12).
- Notifications.
- Apple Health and Health Connect (§10).
- Payments.
- Community features.

A device capability being available is not a reason to use it. Each exclusion remains governed by the section that made it.

### Architectural constraints

- **One path into generation.** Both clients reach generation through the same candidate → confirmation → confirmed venue inventory contract (§6). The native client introduces no second route.
- **No duplicated domain.** Shared logic is shared as source. A client-local copy of the registry, the matrix, the policy, or the generator is a defect.
- **No duplicated safety copy.** Language governed by §9, by §10's medical scope, and by §11's requirement that a substitute session is labeled a substitute is shared source, not re-authored per client. Two independently written copies of a safety claim can drift, and only one of them would be reviewed. Each client renders the same meaning in its own UI; neither client owns the wording.
- **The persistence port is unchanged.** Native storage plugs into the existing storage port beneath the rehydration boundary. Confirmed venue state is produced by the same constructor on both platforms, or it is not confirmed venue state.

### Accessibility

Settled in §15. The native client is held to the iOS and Android accessibility APIs and platform guidance, carrying WCAG's principles — contrast, meaningful labels, focus and reading order, scalable text, reduced motion, adequate touch targets, screen-reader usability — without claiming its conformance label.

In practice that means accessibility roles, labels, and state are authored on interactive elements as the screens are built, not retrofitted, and that VoiceOver and TalkBack testing belongs to this phase.

The measured contrast ratios recorded with the Open Air palette are binding on both clients.

### What this checkpoint established

Recorded as implementation results. None of it is validation, traction, or evidence that anyone wants the product.

- **The shared domain has a second consumer.** Generation, compatibility, feasibility, policy and the confirmation contract are consumed identically by two clients with no duplicated logic and no second route into generation.
- **Native storage plugs into the existing port** beneath the unchanged rehydration boundary. Confirmed venue state is produced by the same constructor on both platforms.
- **The core workout flow works**, from environment selection through confirmation, duration, goal and conditions to deterministic generation, the workout player, completion and correction.
- **Beginner-readable prescription presentation.** Compact notation was replaced by explicit terms — sets, reps, seconds, per side — because a numeral pair states nothing to a reader who does not already know the convention.
- **Inline movement instructions**, resolved against the basis the session actually cited, with context overrides working in shipped content.
- **Exercise-media presentation**, including park and substitute selection and theme-aware versus theme-neutral depiction.
- **Basis and media are separate content types.** They previously shared one slot, so gaining a picture silently cost a movement its basis label.
- **A workout-player information hierarchy** that survives contact with real assets: name, prescription, block role, basis, instructions in full, the visual where one exists, then cues. The visual follows the written instruction rather than preceding it, because ahead of the steps it pushed every one of them past the fold — the movements carrying a produced asset became the least instructive, which inverted the purpose of producing them.
- **Scrolling behaviour** in the player, fixed and verified.
- **Real device pressure on accessibility and vertical layout** that no amount of reasoning produced. Several decisions in this phase were made because a rendered screen contradicted an expectation.

### What this checkpoint did not establish

- **Parity is not complete, in either direction.** The web client has no movement instructions, no exercise media, no basis and media separation, and not this information hierarchy. The two clients are no longer at parity, and native is ahead on presentation while the web client remains the released product.
- **Android is unverified.** Every rendered result in this phase came from the iOS simulator. iOS alone is sufficient for a checkpoint, because a checkpoint is not phase completion — but **this checkpoint establishes no Android parity, and Android verification is required when native implementation resumes.** It is carried forward, not waived.
- **The Phase 0 exit conditions in §19 remain open** and were not addressed by this phase.

### Carried-forward native work

Recorded so it is not lost across the pause. Detailed evidence stays in its artifacts rather than in this plan.

- **Android implementation and verification.** Outstanding in full.
- **A Dynamic Type and accessibility layout pass.** At large accessibility text sizes the sticky footer grows until it consumes most of the viewport, and the header metadata collides and overflows. Both affect illustrated and unillustrated movements equally, and neither is caused by the media slot. The standard being held to is unchanged and is set in §15.
- **VoiceOver and TalkBack testing.** Accessibility roles, labels and state are authored on interactive elements, and screen-reader verification on both platforms belongs to the resumed phase.

### Why this phase pauses here

Sequencing. The native work produced more product and presentation evidence than parity required — how a prescription should read, where a visual belongs relative to an instruction, what a missing asset should do, how basis and media differ — and that evidence describes a target experience the released web client does not yet express.

Consolidating that experience is faster in a browser than in a simulator, and doing it on the web first means native resumes against an evolved target rather than re-deriving it. **Native is paused, not abandoned**, and what it established above is the input to §21 rather than a sunk cost.

---

## 21. Web Product Consolidation

The current implementation stage.

Its purpose is to consolidate MoveHere's target product experience (§1) on the web client, and to bring that client up to the product understanding the native checkpoint produced.

### Why this stage exists

The released web MVP proved the flow and has not changed since. Everything learned in §20 about how the product should *read* — prescription language, instruction placement, basis and media as separate content types, what a missing asset should do — exists only on native. The web client is simultaneously the released product and the one furthest from the target experience.

The browser is also the faster surface on which to settle that experience. This stage is where the target experience becomes concrete, so that native resumes against something evolved rather than against the MVP it already passed.

### Scope

- **The existing Next.js client evolves.** No parallel application, no v2 directory. Behaviour, shared-domain authority and the safety boundaries are preserved; presentation is free to change substantially. Git history preserves the released MVP, so the shipped JSX and CSS do not need to remain visually intact merely because they shipped.
- **The shared domain is unchanged.** No client-local copy of the registry, matrix, policy, feasibility or generator, and no second route into generation (§6, §8).
- **Safety and authority invariants hold identically.** §9's authority boundary, §10's medical scope, §11's substitute labelling, and the project-content disclosure are shared source and are not re-authored for the web.
- **The approved design direction is applied** — `docs/design/movehere-target-landing-page.png`, classified in `docs/design/target-product-experience.md`.
- **Native presentation lessons are carried across**: the player hierarchy, basis and media separation, instructions before the visual, and missing media rendering nothing at all.
- **A coherent end-to-end experience**: marketing, onboarding and setup, generation, the workout, and completion and correction, as one product rather than five screens.
- **Portfolio quality and responsive.** The web client is the surface most likely to be seen by someone who is not using it.
- **Accessibility per §15** — WCAG 2.1 AA, or the applicable current standard, built in rather than retrofitted.

### Three artifacts, not one

The word "web" now names three different things, and collapsing them loses one of them.

| | |
|---|---|
| **`web-mvp-v1`** | The **frozen historical MVP**, deployed on GitHub Pages. It stays live and stops changing. |
| **Web Product Consolidation** | The **existing Next.js codebase**, continuing to evolve in this repository (§21). |
| **Current product deployment** | The **consolidated product**, deployed separately on Vercel. |

**The codebase evolves; the historical deployment stays frozen.** These are not in tension: git history preserves the old implementation as source, and the GitHub Pages deployment preserves it as something a person can still open and use. A repository is a poor demonstration of what shipped; a running site is a good one.

This changes nothing about §21's scope decision. There is **no parallel application and no duplicated codebase** — one Next.js client evolves, and the frozen artifact is a deployment that is no longer rebuilt from it.

**Deployment is not capability.** Vercel is a deployment target and authorizes nothing. Not accounts, not authentication, not server persistence, not Supabase, not server-side generation, not vision, not progress or history, not readiness input, and not any other capability excluded below. A platform being capable of hosting something is the same class of argument as a device being capable of running something (§20), and it carries the same weight: none. The local-only capability boundaries govern the Vercel product exactly as they govern the current one.

### First implementation gate — deployment preservation

**Before any application work in this stage begins**, the historical deployment must be protected.

This is a gate rather than a task because the risk is live and automatic. The repository's existing deploy workflow builds the static export and publishes it to GitHub Pages **on every push to `main`**. Nothing in it distinguishes the historical MVP from whatever `main` happens to hold. So the first merge of an evolved web client to `main` would rebuild and replace the deployed `web-mvp-v1` without anyone deciding to — the artifact would be gone before it was noticed missing, and it is not recoverable by reverting a commit, because what was lost is a deployment rather than a file.

The gate requires, in order:

1. Determine exactly how the current GitHub Pages site is built and deployed.
2. Identify the branch, tag, workflow and artifact that currently control it.
3. Determine whether future pushes or builds could overwrite the deployed `web-mvp-v1`.
4. Establish the minimum change needed to freeze that deployment safely.
5. Verify the existing public GitHub Pages URL still works.

**Only once the historical deployment is protected may the evolving web client begin its Vercel path.**

The mechanics of the fix are deliberately not specified here. They depend on what the audit finds, and a plan that prescribed a solution before the inspection would be inventing infrastructure rather than recording a decision.

### Out of scope

Unchanged from §19 and §20, restated because a browser and a marketing surface make several of them newly *tempting* rather than newly appropriate:

- Supabase, accounts, authentication, and server-side persistence (§14).
  - **This list states what Web Product Consolidation may implement now — not what the full product may ever contain.** Authentication and accounts are PLANNED for the full product (§22). They remain excluded from this stage, and §22's governing rule keeps the affordance out of the production surface until the capability works. Nothing in §22 relaxes this line.
- Vision inference and camera capture (§6 step 2). **Scanning is not implemented**, and current-capability copy must not imply that it is. The target experience may describe it; the product may not claim it.
- Location and GPS (§14).
- Home-equipment support and indoor venue awareness (§12).
- Notifications, Apple Health and Health Connect, payments, and community features.

And, because the approved design anchor shows or implies them:

- **Progress tracking, session history, and any claim of measured improvement.** Completion is recorded locally for one session. Nothing recorded supports a progress claim (§18).
  - **Activity and session history are NEXT-STAGE AUTHORIZED** (§24) and remain excluded from *this stage*, which is §21 and not §24. **Measured improvement is excluded from the product**, not merely from this stage — MoveHere records no load, no completed repetitions and no effort, so the claim has nothing to rest on.
- **Readiness or "how you feel" input to generation.** A new generation-policy capability, and one that runs close to §10's medical boundary.
  - **PLANNED** (§23.3), excluded from this stage, and gated on §10 review before design rather than after.
- **Beginner-to-advanced programming.** §3 excludes advanced athletes, and widening the beachhead is a §3 and §5 decision requiring evidence rather than a copy decision.
  - **Unchanged by §23.** This one is excluded from the product, not merely from this stage (§23.4).

**Unauthorized capability appears in neither copy nor affordance.** A sign-in control that does nothing, or a progress card with no data, teaches the next reader that those are in scope. If a capability is not authorized, the surface does not gesture at it.

### Exit condition

The web client expresses the target experience end to end within currently authorized capability: the full flow, the evolved presentation, the design direction applied, no capability claim in copy or affordance that this plan does not authorize, and the safety and language invariants holding identically to native.

That is an implementation result and nothing more. It is not validation, not traction, and not evidence that anyone wants the product. The Phase 0 exit conditions in §19 remain open throughout this stage and are not addressed by it.

---

## 22. Authentication and Accounts — PLANNED

Authentication, accounts, authenticated returning-user state, and **account-bound,
cross-device** session history are **PLANNED** capabilities of the full MoveHere
product.

**Local** session history is not among them. It needs persistence, not identity,
and v4.7 authorizes it separately as the next stage (§24). Nothing in §22 gates
it, and nothing in §24 requires §22.

This is a change of classification, not of scope. Earlier versions treated them
as FUTURE — genuine candidates, but outside the product as decided. They are now
intended. What has not changed is that none of them exists, none of them is
designed, and none of them is authorized to appear.

### PLANNED is not CURRENT

**PLANNED** means the product intends to have the capability, and that its
scoping questions are owed.

**CURRENT** means the stage may implement it.

Authentication is the first and only PLANNED capability. It is not CURRENT.
§21's out-of-scope list stands unchanged and continues to govern Web Product
Consolidation: no accounts, no authentication, no server-side persistence, no
Supabase.

### The governing rule

> **Planned capability does not authorize a production affordance before its
> minimum truthful functional implementation exists.**

A control ships when it performs its function, not when its function is decided.
Intent is not implementation, and a roadmap is not a feature.

This generalizes the existing §21 rule rather than weakening it. **Unauthorized
capability appears in neither copy nor affordance** already barred a sign-in
control that does nothing. The rule above extends the same protection to
capability that *is* authorized in principle but does not yet work — the case
§21 did not have to consider, and the one most likely to produce a dead control,
because the capability is real and the temptation to gesture at it is stronger.

Applied to the current surface:

- **`Login` does not ship during Landing Page Batch 1.** No placeholder, no
  disabled control, no reserved gap in the header, and no interim route that
  explains that authentication is unavailable.
- **When `Login` appears, it authenticates.** A control whose destination
  apologizes for itself is the affordance this rule exists to prevent.
- **`Get Started` remains live** and enters the current unauthenticated local
  flow. It requires no account today. When authentication ships, that is the
  moment its meaning changes — and that change is a §22 decision, not a copy
  decision.

### 22.1 Scoping questions, deliberately unresolved

v4.5 records that authentication is planned. It does not choose how.

The following are open and must be answered by a proposal reviewed on its own
terms, not settled by whichever option is nearest to hand:

1. **Identity and authentication provider.**
2. **Account model** — what an account is, and what it owns.
3. **Anonymous → authenticated transition** — what happens to someone who has
   already been using the product without an account.
4. **Treatment of existing local state** — confirmed venue inventory and session
   records currently live only on the device. Whether they migrate, merge,
   duplicate or are discarded is a product decision with a safety dimension:
   confirmed inventory is trusted domain state, and §6's
   `candidate → confirmation → confirmed` contract must survive any migration
   intact.
5. **Persistence and synchronization boundary** — what is stored where, and what
   remains local.
6. **Privacy and data ownership** — governed by §14, which is not relaxed here.
7. **Logout** — including what becomes of local state on the device.
8. **Account deletion** — what is deleted, and what deletion means for content
   already generated.
9. **Authorization and RLS**, *if* server-side persistence is later admitted.
   It is not admitted by this section.
10. **Static-export implications** — see §22.2.

**No provider is selected. Supabase in particular is not selected.** Supabase
appeared in this document as a Phase 2 reference (§15) until v4.7 withdrew that
naming, and it appears in adjacent work elsewhere; neither was ever an argument. Precedent, familiarity, and proximity
are not selection criteria. Choosing an authentication architecture is a §22
decision requiring its own review.

### 22.2 Static export remains an active boundary

The web client sets `output: 'export'`. §21 treats this as an architectural
boundary that prevents server capability from being introduced casually, not as
a build preference.

**Authentication planning does not itself authorize removing it.**

A future proposal to remove the static-export boundary must identify a concrete
authorized product requirement that cannot reasonably be satisfied while
preserving it. The following do not qualify:

- **Vercel's ability to provide a server runtime.** Capability of the platform
  is not a requirement of the product. This is the same argument §21 rejects
  under *deployment is not capability*, and it carries the same weight: none.
- **The general observation that authentication often involves a server.**

**Authentication does not necessarily require Next.js server functionality.**
Client-side authentication against an external authorized backend remains an
architecture possibility to be evaluated when §22.1 is answered. It is recorded
here as unresolved — neither chosen nor excluded. Nothing in this section should
be read as scheduling the removal of static export.

### 22.3 Relationship to the approved design anchor

`docs/design/target-product-experience.md` shows a `Login` control in the
approved header. That artifact governs visual and product-experience direction
and authorizes no capability (§21).

The control's **placement** is approved for the point at which authentication
exists. It is not implementation authority for the current surface, and it does
not survive the governing rule above.

**The production header therefore diverges from the design anchor, deliberately:**

```text
Batch 1 (now):   MoveHere · How It Works · Features · Built for parks · About · [Get Started]
After auth:      MoveHere · How It Works · Features · Built for parks · About · Login · [Get Started]
```

This divergence is recorded so that a later reader does not restore `Login` to
match the image. Matching the image is not a reason. A working authentication
flow is the only reason.

### Exit condition

There is none yet, because there is no stage yet. §22 creates an obligation to
scope, not a licence to build. The exit condition for authentication will be
written when §22.1 is answered and the stage is defined.

---

## 23. Capability Classification from the Approved Design Anchor

`docs/design/target-product-experience.md` and its anchor image are now treated
as approved **full-product direction** rather than loose styling reference.

That changes how the capabilities the anchor shows are **classified**. It does
not change what is **authorized**, and the artifact continues to authorize
nothing (§21). A picture of a product is not a product decision; this section is
the product decision, made deliberately and recorded where it can be reviewed.

### The rule this section does not relax

> §22's governing rule applies to every capability named below.
> **Planned capability does not authorize a production affordance before its
> minimum truthful functional implementation exists.**

Promoting a capability from FUTURE or NOT AUTHORIZED to PLANNED changes what
MoveHere **intends**. It changes nothing about what MoveHere may **claim**.

**PLANNED ≠ CURRENT.** No copy, icon label, feature-strip slot or affordance
described here becomes shippable until its specific capability is CURRENT. The
practical consequence is worth stating plainly, because it is the thing most
likely to be misread: **v4.6 brings the anchor's feature copy no closer to
shipping than v4.5 did.** Visual parity with the anchor — layout, palette,
geometry, icon system — is fully available now. Parity with its *claims* is not,
and buying that with copy is precisely what this plan exists to prevent.

### 23.1 Progress and session history — superseded by §24

**v4.7 supersedes this subsection.** What v4.6 classified here as PLANNED is
promoted in §24 to **NEXT-STAGE AUTHORIZED** and renamed **Activity**. The
scoping below is retained because §24 is built on it and does not contradict it:
every field it authorizes, every metric it permits, and every claim it refuses
carry forward unchanged. Where §24 is more specific — the record contract, the
completion semantics, the persistence rules, the calendar and week definitions —
**§24 governs**.

The rename matters and is not cosmetic. *Progress* is refused as a capability
name (§23.4, §18); the product records behaviour, not improvement. §24 explains
why the destination is called Activity and why History may only describe the
chronological list inside it.

Promoted from FUTURE. The first stage is scoped to **facts MoveHere can actually
record**, and to nothing derived from evidence it does not collect.

**A completed-session history record may contain:** completion timestamp; goal;
prescribed duration; reported conditions; park versus no-equipment-substitute
context; confirmed venue features used, where applicable; exercise ids;
prescriptions; substitute flag.

**First-stage derived metrics may include:** completed sessions; **minutes
programmed**; sessions per week; goal distribution; park versus
no-equipment-substitute distribution; session history.

**Prescribed duration must never be presented as time trained.** It may not be
called *total workout minutes* or *minutes trained*. A 30-minute programmed
session marked complete does not evidence 30 elapsed minutes of training — it
evidences an intention and a tap. The honest name for the sum of prescribed
durations is **minutes programmed**. If actual elapsed duration is measured
later, that is a **distinct metric** with a distinct name, not a correction to
this one.

**Streaks and consistency are deferred**, and are not part of the first
contract. They become definable once the product decides what counts as a
qualifying session, what breaks a streak, how timezones behave, whether there is
a grace day, and how missed or partial sessions are treated. Until those are
answered a streak is a number without a meaning.

**These claims remain NOT AUTHORIZED**, and this is a refusal rather than a
deferral: *getting stronger*, *improving fitness*, *performance improvement*,
and any trend line implying physiological or capability improvement. MoveHere
records no load, no completed repetitions, and no perceived effort. There is
nothing from which improvement could be computed, and no measure of improvement
has ever been defined (§18).

**This capability does not require accounts.** Progress needs *history*, and
history needs *persistence*, not identity. Today one session persists locally
and is overwritten; extending local persistence to a session list satisfies the
whole first stage with **authentication still PLANNED (§22), no server
persistence selected, and `output: 'export'` intact (§22.2)**. Local history
must not be blocked behind the authentication milestone. Cross-device history is
a separate, later decision that does depend on §22.

### 23.2 Multi-environment expansion — PLANNED

The anchor's *Works Anywhere* is promoted from NOT AUTHORIZED to PLANNED, as
**multi-environment expansion** — not as a phrase.

Each environment class enters independently through §7's five admission
conditions. Promotion here admits none of them; it records that expanding beyond
the park wedge is intended rather than rejected.

**"Anywhere" is never truthful as a blanket capability claim**, and does not
become truthful by the addition of a second class. Until multiple environment
classes are CURRENT, production copy **names only what is actually supported**.

The brand headline *Work out. Anywhere. MoveHere.* remains permitted as a brand
statement under the existing target-experience distinction (§1): environment-
independent sessions genuinely do work anywhere, and the vision really is
broader than parks. Concrete capability copy stays narrower. A brand line
describes an intent; a feature card asserts a capability, and only one of those
is bound to what is built.

### 23.3 Adaptation — split

**CURRENT.** Adaptation to the **confirmed environment** and to **reported
conditions**, and the deterministic session adaptation that follows from those
inputs. This is the implemented mechanism (§1, §6, §11), and the anchor's
*Smart & Adaptive* slot is accurate when scoped to it.

**PLANNED.** Adaptation to the **person** — readiness, "how you feel",
person-state input to generation. This is a new generation-policy capability
that runs close to §10's medical boundary, and it is **review-gated: qualified
review precedes design and implementation, not the other way round.** Nothing
here relaxes §10. Injury-aware programming, condition-specific substitution and
severity triage remain excluded regardless of how readiness is eventually
scoped.

### 23.4 Beginner-to-advanced programming — remains NOT AUTHORIZED

Not promoted. Recorded here so a later reader meets a decision rather than an
omission.

Supporting it would require **all three** of:

1. A deliberate **beachhead expansion** revising §3 and §5 on evidence. §3
   excludes advanced athletes, and the wedge depends on that exclusion.
2. A real **difficulty and progression model** in the compatibility matrix —
   authored policy, not a label.
3. **Qualified fitness review** of the progression policy (§8, Gate E).

Absent all three the capability does not ship and no copy gestures at it,
including softened forms. *Beginner-friendly* is a different and truthful
statement: it describes the current target user (§3) and the existence of
authored user-facing movement instructions (§8). It is not a step toward this
claim and must not be read as one.

### 23.5 "Your Goals. Your Pace." — not authorized as written

*Goals* is accurate: strength or conditioning is a current input.

*Pace* implies progression or personalisation that has no product definition,
no data behind it, and no owner. It is not promoted, because there is nothing
yet to promote — a phrase is not a capability. Before it may appear, "pace" must
be defined as an actual product concept.

Current truth is **"Your Goal. Your Time."** — the goal is chosen, and the time
is one of 10, 20, 30 or 45 minutes.

### 23.6 Copy unlocks

What each capability makes sayable, once it is CURRENT — and what stays refused
afterwards.

| Capability | Unlocks | Still refused |
|---|---|---|
| §24 Activity and history | Workouts recorded, workouts per week, activity dates, goal and substitute distribution, session history. **§25 adds** per-movement results and the finished / ended-early outcome. **Minutes programmed is permitted but not shipped in Activity v1 (§24.11).** | Getting stronger, improving fitness, performance improvement, improvement trend lines, streaks (§24.10) |
| §23.2 multi-environment | Copy naming the classes actually supported | "Anywhere" while parks are the only class |
| §23.3 readiness | Readiness language in adaptation copy, after §10 review | Medical, injury-aware or contraindication framing |
| §23.4 beginner-to-advanced | Nothing, until §23.4's three requirements land | The claim entirely, including softened forms |
| §23.5 "pace" | Only once "pace" has a product definition | The phrase as decoration for progression that does not exist |

### 23.7 Visual direction

The anchor now governs the primary colour family and the marketing page
geometry, both derived by **measuring the image** rather than by inference. The
values live in `docs/design/target-product-experience.md`, which governs visual
direction and authorizes no capability.

One measured value is deliberately **not** reproduced. The anchor's secondary-
control border sits at 2.29:1 against white, below the 3:1 that WCAG 2.1 AA
requires where a border is the only thing defining a control's boundary
(1.4.11). §15 binds the web client to AA, so **§15 overrides literal visual
parity wherever the generated anchor is non-conformant.** The measured value is
retained for decorative, non-interactive use; interactive boundaries take the
conformant substitute. An approved image is design direction, not an exemption
from the accessibility standard the plan already set.

### Exit condition

There is none, because §23 defines no stage. It classifies. Each capability it
promotes owes its own scoping before it can be built, exactly as §22 owes its
own, and none of them is in scope for §21.

---

## 24. Activity and Session History — NEXT-STAGE AUTHORIZED

**Status: authorized as the next implementation stage. Not built.** This section
promotes what §23.1 classified as PLANNED, renames it **Activity**, and writes
the contract it must be built against. Authorization here is permission to
build, not permission to speak: §22's governing rule applies without exception,
and no Activity affordance, link, navigation entry or marketing claim may ship
before Activity itself works (§24.15).

Two findings from the Batch F cross-flow audit drive this section. First, the
product loop ends too early — the terminal screen reports metadata and loses the
workout. Second, and more seriously, **a completed session is currently
re-derived from mutable state**, so correcting a venue feature after finishing
can change the historical account of what was trained. The second is an
architectural defect, and §24.3 fixes it by contract rather than by patch.

### 24.1 The product loop

The loop is recorded as five stages:

```text
Environment  →  Prepare  →  Train  →  Record  →  Return
```

| Stage | The question it answers | Kind |
|---|---|---|
| Environment | What is actually here? | workflow |
| Prepare | What am I doing today? | workflow |
| Train | What do I do now? | workflow |
| Record | What did I just do? | workflow **terminus** |
| Return | What has my training looked like over time? | **persistent destination** |

**Record and Return are different kinds of thing, and the distinction is
load-bearing.** Record closes one session and belongs to that session's
workflow. Return belongs to no session: it is reachable with nothing in flight,
before a first session exists, and after any session ends. Modelling Return as a
sixth workflow step would repeat a defect the audit already found, where the
workflow meter asserts stage state from the current route and can therefore
claim stages the user never completed.

The loop describes the product. It does not rename routes, and route names are
implementation history rather than product authority.

### 24.2 The capability is called Activity

**Activity** is the capability and the destination name. **History** may
describe the chronological list of completed sessions inside Activity. **Progress
is not a name this product may use**, and that is a refusal carried forward from
§23.4 and §18, not a stylistic preference.

The reason is that the words are not synonyms of each other. Activity is
behaviour: sessions were programmed, and the user reached the end of them.
Progress is capability change, and MoveHere records no load, no completed
repetitions, and no effort, so it has nothing from which progress could be
computed and has never defined a measure of it. A destination named Progress
would make a claim its contents cannot support, and renaming a refused claim is
still making it.

### 24.3 The completed-session record is an immutable snapshot

**A completed-session record describes what was actually programmed at the
moment that session was completed. It is never re-derived.**

Today the session store keeps a seed and a request and regenerates the workout
from the seed and the *current* confirmed inventory. `src/storage/session-record.ts`
states that intent explicitly, and for an **in-progress** session it is correct:
regeneration is what makes a reload return the same workout rather than a
plausible different one, and storing generated output would risk drift from the
content that produced it.

That reasoning does not survive completion. One of the regeneration inputs —
confirmed inventory — remains mutable after the session ends, so a venue
correction silently rewrites the past. The same file already promises the
opposite guarantee in prose, describing a completed session as "a record, not a
derivation"; the stored shape is simply too thin to deliver it.

**Two lifetimes, two strategies.** An in-progress session stays a derivation. A
completed session becomes a snapshot. The snapshot must be renderable with **no
call into the generator and no read of current inventory**, and that property is
the test of whether the contract in §24.4 is sufficient.

**Two lifetimes therefore mean two stores.** The **active-session store holds
unfinished work only**; **Activity holds completed immutable history**. At the
schema boundary, completion timestamp and summary leave the active-session store
entirely (§24.6). A single store holding both is what allowed a finished session
to be finished again and rewritten, and separating them removes the possibility
rather than guarding it.

An in-progress session's derivation is nonetheless made stable: its generation
venue input is frozen when the session is created, so every input to that
session is immutable for its lifetime (§24.6). Derived does not mean liable to
change underneath the user.

### 24.4 Record fields

**REQUIRED.** The record carries: a stable `recordId`; a `schemaVersion`; the
completion instant `completedAt` as UTC; the frozen `localDate` (§24.9); the
session `kind`; `goal`; `requestedMinutes`; reported `conditions`; the
`substituteReason` when the kind is a substitute; the confirmed features used;
the **ordered list of movements**; and the content `authorityTier`.

Each movement carries: `exerciseId`; the `prescription` as programmed; the
`blockName` it appeared under; the `featureId` it relied on, or null; and the
`variationLabel` where one was shown. **Movement order is array position** — the
record stores no separate index.

> **Amended by §25.13.** Each movement additionally carries a `result` —
> `completed`, `skipped` or `not-reached`. Without it a record lists what was
> *programmed* and silently implies it was all *performed*, which holds only
> while completion is the sole way a record can be created. §25 ends that, so
> the field is a condition of the change rather than an addition to it.

Two of these deserve their reasons stated. **Prescriptions are stored** because
policy may change and a record must show what was prescribed, not what would be
prescribed today. **`authorityTier` is stored** because §8 obliges MoveHere to
label the authority behind its content, and if project content is ever
professionally reviewed, historical records must not silently inherit a review
they never had.

**The session kind is a kind, not a flag.** §11 makes a park session and a
substitute session different kinds rather than one kind with a boolean, and the
record follows the domain. The current `wasSubstitute: boolean` is superseded;
carrying both a kind and a flag would create two sources of truth for one fact.

**DERIVABLE, and therefore not stored:** movement count, from the movement list;
estimated minutes, from the stored prescriptions and policy; and media identity,
which is `(exerciseId, featureId)` and is already present.

**EXCLUDED, with reasons.** The **generation seed** is excluded: once movements
are stored it becomes a second, contradictable source of truth for the same
fact, and a record that carries both can disagree with itself. Excluding it as
evidence does not preclude deriving the record's *identifier* from stable
active-session identity, which §24.6 requires for completion idempotency — an
opaque identity derived from session machinery is not a claim about what was
trained. **The seed remains generator and session machinery, never historical
workout evidence.** **Generator,
matrix and policy versions** are excluded: they exist to reproduce generation,
and the record reports a stored workout rather than reproducing one. **Venue
identifier and venue snapshot id** are excluded both because a single venue
exists and because Invariant 6 forbids an attributable home-park relationship —
a venue key inside records that may one day migrate to an account is exactly the
relationship that invariant prohibits. **Per-movement completion state** is
excluded because no partial records exist (§24.6).

Fields are added to this contract when evidence requires them, never because
they may prove useful later.

### 24.5 Instructional copy and exercise media are current-reference content

The record preserves **what movement and prescription were programmed**. It does
not preserve the instructional prose or the exercise imagery that was on screen.

**The repository has no stable content or instruction version identifier worth
recording, and this was checked rather than assumed.** The candidates all fail
for the same reason. `ContentAuthority` carries `authoredAt` and `reviewedAt`,
but these are authority provenance stamps applied as shared catalog-wide
constants, and nothing binds them to the wording of any instruction — editing a
step does not oblige changing the date. `GENERATOR_VERSION`, the compatibility
matrix version, the feature registry version and the policy versions are real
identifiers, but they version generation, compatibility, the registry and
programming policy rather than instruction prose or media bytes, and every one
of them is still `'1'`. Recording any of them would manufacture an appearance of
precision: every record would say `'1'` for ever, and would keep saying `'1'`
after the wording changed.

Therefore v4.7 records the semantics explicitly:

> **The completed-session record preserves what movement and prescription were
> programmed. Instructional copy and exercise media are current-reference
> content, not historical evidence of exactly what content was displayed at
> completion time.**

> **A historical record must never silently imply that current instruction
> wording was the wording presented during that workout.**

This is a constraint on the interface as much as on the store. A historical
record may show today's instructions for a movement, because the movement is the
same movement; it may not present them as a transcript of that session. If a
content version identifier bound to instruction wording is ever introduced,
storing a minimal reference to it becomes a live option and this subsection is
the place to revisit.

### 24.6 The in-progress session lifecycle

**A completed-session record is created exactly once, when the user reaches
terminal session completion** — the completion action on the final movement.

**Partial sessions do not produce Activity records in v1.** A record meaning
"some of a workout" would make every derived count ambiguous before a single
count has been defined.

The rest of this subsection is the lifecycle that makes those two statements
safe. It exists because the audit found the opposite: an unfinished session
could be stranded with no route back to it, and two separate controls minted a
new seed and destroyed the unfinished work with no warning at all.

#### The state machine

Three persisted states, and no more:

```text
        ┌──────────────────┐
        │   NO SESSION     │  no active-session record
        └────────┬─────────┘
                 │ build
                 ▼
        ┌──────────────────┐
        │     ACTIVE       │  an active-session record exists
        │  done = 0 … n-1  │  "not started"  ⇔ done === 0
        └───┬──────────┬───┘  "partly done"  ⇔ done > 0
            │          │
    discard │          │ final movement completed
            │          ▼
            │   ┌──────────────────┐
            │   │    COMPLETED     │  immutable Activity record appended
            │   └────────┬─────────┘
            ▼            ▼
        ┌──────────────────┐
        │   NO SESSION     │
        └──────────────────┘
```

**Not-started and partly-done are not separate persisted states.** The movement
index already distinguishes them exactly, and the total comes from the session
itself. A status field beside the index would be state invented for naming
symmetry, and it could disagree with the index it duplicates. The distinction is
real in the interface — it decides whether the product offers *Start* or
*Resume* — and is derived, not stored.

**Discarded is not a state. It is absence.** A discarded session is
indistinguishable from a session that never existed, and must be. A tombstone
would be persistent state whose only purpose is to remember something the
product has decided not to remember.

#### One active session

> **MoveHere holds at most one unfinished session. A new session may not replace
> an unfinished one without an explicit user decision to discard it.**

**This is enforced in the active-session store and the state that owns it, not
in the screens that call them.** Both controls that destroyed unfinished work
called the same underlying start operation, and that operation overwrote
unconditionally. A rule enforced at two call sites is a rule the third call site
will miss. Replacement must be a distinct, explicitly named operation that a
screen has to ask for; the ordinary start operation must refuse to overwrite
unfinished work.

#### Resume is faithful, not equivalent

> **Resume returns the user to the same workout they left — the same movements,
> in the same order, with the same prescriptions, the same park or substitute
> context, and the same position. Not an equivalent workout.**

**The generation venue input is frozen into the active session** when the
session is created, and generation for that session reads the frozen input
rather than live inventory. Without this, "same seed" does not mean "same
workout": the audit showed a running session's remaining movements re-deriving
underneath an unmoved position counter when confirmed inventory changed.

The workout therefore remains *derived* for an active session — every input is
simply immutable for that session's lifetime. Persisting the generated movement
list for an in-flight session is deliberately **not** the mechanism: that is
what §24.3 does at completion, and doing it twice would put generator output in
the one place this plan keeps derived.

**Mid-session inventory changes affect future generation only.** Confirming or
correcting a feature while a session is in flight changes what MoveHere builds
next. It cannot alter the session already running, and it never touches history
(§24.8).

#### Discard

> **Discard destroys the workout and nothing outside it.**

Discarding an unfinished session creates no Activity record, no completion
timestamp, no calendar mark and no contribution to any count, and modifies no
historical record.

| Data | On discard | Why |
|---|---|---|
| Session seed | destroyed | identifies that session and nothing else |
| Movement index | destroyed | belongs to that session |
| Frozen generation venue input | destroyed | belongs to that session |
| **Requested minutes, goal, conditions** | **preserved** | the user's stated preference, not part of the workout. They are discarding a workout in order to build another; re-entering three choices they just made would be gratuitous |
| **Candidate features** | **preserved** | belong to the venue, not the session |
| **Confirmed inventory** | **preserved** | belongs to the park. Discarding a workout must never un-confirm a bench |
| **Venue corrections** | **preserved** | statements about the park's current usability, which outlive any session |

**Unfinished sessions do not expire in v1.** No age-based cleanup, no
time-boxed invalidation. An unfinished workout from last week is still the
user's unfinished workout.

#### Choosing between resume and replacement

When an unfinished session exists and the user asks to build another, the
product presents the choice rather than acting on an assumption:

> **You have a workout in progress.**
>
> {minutes} min · {Goal} · Movement {current} of {total}
>
> **[ Resume workout ]**
>
> **[ Discard and build a new one ]**

The position line is part of the copy, not decoration: it turns an abstract
warning into a fact the user can weigh.

**No second confirmation step is required to discard an unfinished workout.**
The destructive action names the destruction, and it must be chosen over a
present and prominent *Resume*. A second modal would be confirmation theatre,
which trains people to click through. Deleting a completed Activity record keeps
its own separate confirmation requirement (§24.7), because that destroys
immutable history rather than unfinished work.

**Authorized direction: the *Generate another* control is removed from the
training screen.** It sat inside the session it destroyed, was shown only while
that session was unfinished, and carried no warning. Building a different
session is a preparation decision and belongs where preparation happens.

#### Completion: evidence first, then cleanup

> **Completion creates historical evidence before removing unfinished state.**

> **Amended by §25.5 and §25.16.** There are now two terminal paths — *finished*
> and *ended early* — rather than one. Both remain terminal, both append before
> clearing, and both resolve to the same deterministic record identity, so a
> session still produces at most one record and still cannot be finished twice.

The transition is conceptually atomic — unfinished session, then completed
Activity snapshot, then no active session — but two local writes cannot be made
transactional. Ordering and idempotency carry it instead of machinery.

**Append the Activity record first; clear the active session second.** The two
interruption windows are not equally bad. Interrupted after the append, a record
exists while an active session lingers — recoverable, and invisible once the
identity rule below applies. Interrupted after a clear-first ordering, the
session is gone and no record exists, and the workout is simply lost. One is
recoverable; the other is data loss.

**A completed Activity record has a deterministic identifier derived from stable
active-session identity. Repeating terminal completion for the same active
session resolves to the same record identifier and therefore cannot append a
duplicate record.** The first implementation may derive that identity from the
existing session seed if that is the smallest correct implementation. **The seed
remains generator and session machinery, not historical workout evidence**
(§24.4).

That single property closes all three failure modes: a double activation or a
reload during completion resolves to one record; an interruption between append
and clear is recovered on next load, because an active session whose identifier
already exists in Activity is recognised as completed and cleared; and no
ordering can produce a cleared session with no record.

#### After completion

**`completedAt` and `summary` leave the active-session store at the schema
boundary.** The active-session store represents unfinished work only; Activity
represents completed immutable history. The two are separate stores with
separate lifetimes.

The consequence is that **re-finishing a completed session becomes structurally
impossible rather than merely guarded**: after completion there is no active
session, so the training screen has nothing to finish and shows its ordinary
no-session state. The audit's re-finish defect — which rewrote a completed
record's attributed feature — is closed by removing the state that permitted it,
not by validating around it.

**The recap screen renders from Activity record identity**, showing the most
recent record by default and an explicitly identified record when one is named.
**Record lookup must remain compatible with static export**: an identified
record is addressed by query parameter and resolved on the device. A dynamic
route segment is not available, because the records exist only on the user's
device and cannot be prerendered.

**If the recap record is missing or unreadable**, the screen says so plainly —
the session finished, this record could not be read — and never fabricates a
summary or silently substitutes a different record. Per-record quarantine
(§24.12) keeps one unreadable record from taking the rest of history with it.

#### Where an unfinished session changes behaviour

Only where work would actually be destroyed. Most routes do nothing special,
and making every route hostage to a prompt would punish a user who came to look.

| Entry point | With an unfinished session |
|---|---|
| Landing page and its primary call to action | nothing special (§24.15) |
| Looking around, confirming | nothing special — neither touches the session, and with the frozen input neither can disturb it |
| Preparation screen | preparation may be edited freely; the choice in this subsection appears only when the user asks to build |
| Training screen | resume silently at the recorded position |
| Browser back | nothing special — navigation is not an action, and nothing is destroyed without a deliberate control press |
| Reload, or closing and reopening | resume silently; the session survives indefinitely |
| Leaving via the wordmark | nothing special — it leaves the session, it does not end it |

Preparation controls must not appear to change a workout they cannot reach: an
active session carries its own copy of the request, so edits made during one
apply to the next session, and the interface must not imply otherwise.

#### Accessibility

The resume choice is an inline region, not a modal, announced politely when it
appears, with *Resume workout* first in reading order and both controls meeting
the touch-target minimum. After discarding, focus moves to the new session's
first movement heading with the discard announced; after resuming, focus moves
to the workout heading. Focus is never left on a control that has been removed,
and never dropped to the document body on a route change. Session state is
never conveyed by colour alone.

#### Vocabulary

**Discard** applies to unfinished work; **Delete** applies to completed Activity
records. Two different destructions, two different words, so neither can be
mistaken for the other. **Cancel is not used for either**, because it reads as
"abandon this dialog" rather than "abandon my workout"; a control that declines
a destructive choice keeps the work and says so.

### 24.7 Deletion

**Records are immutable against editing and regeneration. They are not
undeletable.**

A user may delete an entire completed-session record, behind an explicit
confirmation. Deletion is whole-record only: there is no field-level edit, no
partial redaction, and no correction of a past session. **All safe derivations
recompute from the remaining records** — counts, calendar marks and
distributions follow deletion immediately and retroactively, and no tombstone or
residue survives it.

### 24.8 Venue correction never rewrites history

**Venue correction affects future generation authority only.**

Reporting a feature unusable changes what MoveHere may build next. It does not
change, reinterpret or annotate any record of a session already completed. The
two statements a user may see together — that a past session used the bench, and
that the bench is now left out of sessions — are both true and describe
different tenses. The interface owes the user that distinction in words; the
store owes it by never rewriting the record.

### 24.9 Time, the week, and the calendar

**The local calendar date is frozen at completion.** Each record stores both the
UTC `completedAt` instant and a `localDate` captured from the user's device at
the moment of completion.

Deriving a calendar date at read time would make history mutable by travel: one
timezone eastward and a Sunday-evening session silently becomes Monday's,
changing a past week's count. The UTC instant orders records exactly; the frozen
local date says which day the session belonged to for the person who did it, for
ever.

**The week starts on Monday (ISO 8601), fixed.** Not locale-derived: the same
history must not produce different counts on different devices.

**Completed sessions this week** is defined as the number of completed-session
records whose **recorded local calendar date** falls within the user's current
local calendar week, Monday to Sunday inclusive.

> **Superseded by §25.18.** Once an ended-early workout can hold a record, the
> word *completed* in this count becomes false for part of what it counts. The
> count becomes **workouts this week**, over records carrying execution
> evidence. The window, the Monday start and the frozen local date are
> unchanged.

**Multiple sessions in one day each count individually** toward that number.

**A session that crosses midnight belongs to the date on which completion was
recorded.** The record has one date, taken at the completion action. This
requires no session-duration model and is explainable in one sentence.

**Activity calendar semantics — the whole of it:**

> **A marked date means at least one session was recorded complete on that local
> calendar date.**

That sentence is the complete meaning of a mark and must be available to the
user, not merely implied. It follows that **one mark per date, regardless of how
many sessions that date holds**: two sessions do not make a better day, and any
count-scaled, size-scaled or colour-scaled mark would imply a judgment of
quality or intensity that MoveHere cannot make. The count for a date belongs in
that date's detail. Unmarked dates are unmarked — never styled as failure, never
labelled missed.

### 24.10 Streaks remain deferred

v4.6 deferred streaks and gave the reason; nothing in v4.7 resolves it, and a
streak stays undefined until every one of these is answered: what counts as a
qualifying session; whether two sessions in a day advance a streak once or
twice; which timezone owns the day boundary; whether that boundary is local
midnight or a rolling window; what a missed day does; whether grace days exist
and how many; whether a partial session qualifies; what deleting a record does
to a streak that ran through it; whether streaks are stored or recomputed;
what timezone travel that shortens or lengthens a local day does; and whether a
broken streak is shown at all.

**The activity calendar and completed-session counts are the first consistency
representation.** They answer the same user question without any of the above,
because a calendar reports and a streak judges.

### 24.11 Recorded facts, safe derivations, refusals

**RECORDED FACTS.** Completion instant; recorded local date; goal; requested
programmed duration; reported conditions; session kind; substitute reason;
features used; the ordered movement list; prescriptions; block names; content
authority tier.

**SAFE DERIVATIONS.** Workouts in total; workouts this week; workouts per week;
activity dates; goal distribution; park versus substitute distribution; movement
count per session; number of distinct dates with a record. **Added by §25:**
per-workout counts of completed, skipped and not-reached movements, and the
finished / ended-early outcome — all derived from recorded results, none of them
a claim about physical performance (§25.2).

Two of these carry conditions. Goal distribution must be phrased as what was
**requested**, never as training emphasis achieved. A count of distinct dates
must never be rendered as a consecutive run, which is a streak wearing a
different name.

**Programmed-minute aggregation is omitted from Activity v1.** Programmed
duration remains visible on an individual session record, where it is the
duration the user chose. Weekly and monthly programmed-minute totals are not
shipped. §23.1 permits the metric and v4.7 does not withdraw that permission —
it declines to use it, because the metric is honest only while carrying the word
*programmed*, and that is precisely the word a reader discards. A weekly total
would be read as time trained by most people who saw it, and MoveHere has
evidence of an intention and a tap. The session count answers the same question
with no misreading available. If elapsed time is ever measured, it is a distinct
metric with a distinct name, and the two may then be shown together where the
distinction is visible rather than merely asserted.

**NOT AUTHORIZED, unchanged and by refusal rather than deferral:** getting
stronger; improving fitness; performance improvement; any improvement trend
line; calories burned; elapsed workout minutes; minutes trained; active minutes;
any claim that consistency itself is improving; and any per-movement completion
claim, since no per-movement state is recorded.

### 24.12 Persistence architecture

**Local, on the device, in the smallest reliable form: `localStorage`, an
append-only record list, under a key of its own.**

The history store is **separate from the in-flight session store**. Mixing a
mutable in-progress session with immutable history in one key would mean every
tick of a workout rewrites the whole history.

**`localStorage` is sufficient and IndexedDB is not selected.** A record of
roughly seven movements serialises to under a kilobyte, so a thousand sessions
sit comfortably inside a five-megabyte budget. The storage port is deliberately
three synchronous string operations so the same store runs in a browser, on a
device, and against an in-memory fake; an asynchronous store would not be a swap
but a change to the shape of the rehydration boundary, which is the code that
should change least. Sophistication is not a reason.

**Per-record validation and quarantine — an explicit divergence.** The venue
boundary fails closed, and must: a half-restored inventory could imply a
confirmation the user never gave, which is a safety claim. **History carries no
safety semantics, and whole-store fail-closed would let one malformed row erase
a year of records.** The Activity store therefore validates each record
independently, keeps every valid one, skips and quarantines invalid ones, and
surfaces how many were unreadable rather than failing silently. This divergence
is documented here precisely because it contradicts the rule in the neighbouring
store, and a divergence that is not written down is a defect waiting to be
"fixed" by someone restoring consistency.

**Migration before discard.** The session store may refuse an unrecognised
schema version, because a session is regenerable. History is not. A version
mismatch in the Activity store must attempt migration first, and discard only
what cannot be migrated.

**Appends are idempotent** on `recordId`: appending a record that is already
present is a no-op.

**No capacity cap in v1.** A cap that silently dropped the oldest records would
violate immutability by another route. The size estimate is documented instead,
and a cap becomes a product decision if it is ever needed.

### 24.13 Activity requires no account, and selects no provider

**Activity works locally, with no account, and its first stage does not depend on
§22.** History needs persistence, not identity. Authentication remains PLANNED,
**no provider is selected, and Supabase is not selected by precedent or by
proximity.** `output: 'export'` is untouched and remains an architectural
boundary (§22.2). Cross-device history is a separate, later decision that does
depend on §22 and is not authorized here.

The record is nonetheless designed so that a future account system could adopt
it without changing what any record means:

- **`recordId` is stable, client-minted and unique enough to deduplicate across
  devices.** It follows the existing seed-minting pattern — a caller-supplied
  timestamp and a wrapping sequence, with no clock and no randomness inside
  shared source.
- **`completedAt` is UTC; `localDate` is the frozen local date.** Both survive
  any account model.
- **There is no ownership field in v1.** Shipping a null owner today would be
  speculative schema for an unchosen provider; ownership is assigned by the
  system that introduces identity.
- **Duplicate handling at migration is `recordId` idempotency.**

### 24.14 Navigation and workflow terminology

The session workflow and persistent product navigation are different things and
are not the same component's job.

**Activity is a persistent product destination, not a workflow stage.** It is
authorized to appear in persistent navigation **only once its minimum truthful
implementation exists** (§24.15). Classification and documentation do not cause
an affordance to ship.

**The terminal workflow stage becomes RECAP rather than DONE.** The direction is
authorized because the screen's job changes: it reports the record rather than
acknowledging a completion. **The final visual treatment of the workflow meter
is deliberately not settled here** and belongs to the later fitness-identity
pass.

**The workflow meter must derive its state from real session and venue state,
not from the current route.** The audit found it claiming three completed stages
on a cold deep link into training, with no session in existence, and announcing
those false claims to assistive technology. A meter that can assert a stage the
user never reached is not a progress indicator.

What authorizes each stage:

| Stage | Completed when | Current when |
|---|---|---|
| Look around | candidates have been proposed, or a confirmed inventory exists | that screen is being viewed |
| Confirm | a confirmed inventory exists | that screen is being viewed |
| Set up | an active session exists | that screen is being viewed |
| Train | the active session has reached its final movement, or a completed record exists for it | that screen is being viewed |
| Recap | a completed Activity record exists for the session | that screen is being viewed |

Anything satisfying neither predicate is *not started*.

**Moving backward changes the screen being viewed, not the stage the user has
reached.** With a session in flight, returning to confirmation must keep the
training stage marked as reached — that is where the user's work actually is —
while marking confirmation as the screen in view. Conflating location with
progress produced both audit symptoms: stages falsely completed on a cold deep
link, and a training stage reported as not started while a session sat part way
through. It also strands the session, because a stage reported as not started
offers no way back to it; a training stage that remains reachable whenever an
active session exists is the same fix seen from the user's side.

### 24.15 Landing page

**No Activity copy and no Activity affordance may appear on the landing page
until Activity is implemented and usable.** This is §22's governing rule applied
to this capability, and it is the same rule that removed the anchor's Track
Progress slot in the first place.

**The landing page's primary call to action does not vary with session state.**
It remains a static invitation to start, and remains a plain link into
preparation. The page is prerendered with no knowledge of the device's session,
so a session-dependent label would render one way and then change after
hydration — a visible flip on the page's primary control, on a surface where
nothing else depends on client state. It is also unnecessary: a user with an
unfinished session is never more than one screen from resuming it, and
preparation offers the choice prominently (§24.6). If a resume affordance is
ever wanted here, the honest form is an additional element that appears after
hydration, never a mutating primary button.

Once Activity ships, **"Track your activity"** may be considered, along with
plain statements of what the product records. **"Track your progress" remains
unauthorized**, before and after. The distinction is the one drawn in §24.2:
activity is behaviour and MoveHere records it; progress is capability change and
MoveHere does not measure it.

### 24.16 New invariants

These join the standing invariants and are not preferences.

1. **A completed-session record is immutable against editing and regeneration.**
   It may be deleted in whole, behind explicit confirmation; it may never be
   altered.
2. **A completed session is a snapshot, never a derivation.** It must be
   renderable with no call into the generator and no read of current inventory.
3. **Venue correction affects future generation authority only** and never
   rewrites, reinterprets or annotates a completed record.
4. **The recorded local calendar date is frozen at completion.** Calendar marks
   and week membership never re-derive a date from a current timezone.
5. **A marked calendar date means at least one session was recorded complete on
   that local date**, and carries no claim about quality, intensity, duration or
   effort.
6. **Activity history validates per record and quarantines invalid rows.** One
   unreadable record must not erase otherwise valid history. This is a
   deliberate, documented divergence from the venue boundary's fail-closed rule,
   justified by the absence of any safety semantics in history.
7. **Starting or generating a workout never destroys an unfinished workout
   without an explicit user decision.** At most one unfinished session exists,
   and replacing it is an operation the user asks for by name.
8. **Discard destroys the workout and nothing outside it.** Requested duration,
   goal and conditions, candidate features, confirmed inventory and venue
   corrections all survive it.
9. **Completion creates historical evidence before removing unfinished state.**
   The Activity record is appended first and the active session cleared second,
   and repeating completion for the same session resolves to the same record
   identifier, so it cannot append a duplicate.

Carried forward from the confirmation decision already taken: **returning to
confirmation reconstructs the interface from recorded user authority; it never
invents authority.**

### 24.17 Dependency on the Batch F defects

Activity does not supersede the open defects, and two of them are preconditions
rather than neighbours.

| Defect | Severity | Relationship to Activity |
|---|---|---|
| Revisiting confirmation destroys confirmed authority | BLOCKER | **Precondition.** A record naming the features a session used is only trustworthy if confirmed authority is itself trustworthy |
| A completed record can be rewritten | HIGH | **Resolved by §24.3 and §24.6**, by contract rather than by patching the stored summary |
| An in-progress session can be stranded | HIGH | **Escalates under §24.6.** Once records exist, an abandoned session is the one case producing no record, so its exit must be explicit |
| The workflow meter makes false stage claims | HIGH | **Precondition for §24.14.** Navigation must not gain a destination while still misreporting the workflow |
| Focus lost on route change | HIGH | Independent; owed regardless |
| Light-mode contrast failure on the safety statements | HIGH | Independent, and **owed before this stage** — it affects §9 copy and is not blocked by anything here |

The MEDIUM and LOW findings from that audit remain recorded and are not
withdrawn by this section.

### 24.18 What this section does not authorize

It does not authorize accounts, a provider, a server, or cross-device sync
(§22). It does not authorize progress, improvement, performance or trend claims
in any form (§18, §23.4). It does not authorize streaks (§24.10). It does not
authorize programmed-minute aggregation in Activity v1 (§24.11). It does not
authorize partial-session records (§24.6). It does not authorize multi-environment
expansion (§23.2) or readiness adaptation (§23.3). It does not authorize any
landing-page claim (§24.15). And it does not authorize a single word of Activity
vocabulary anywhere in the product before Activity works.

### Exit condition

Activity's stage is complete when a completed session writes an immutable local
record; when the terminal screen shows the workout that was actually programmed;
when a persistent Activity destination lists recorded workouts, marks an activity
calendar, and reports **workouts this week** under the definitions in §24.9 as
amended by §25.18; when a record can be opened in full and deleted in whole; when history
survives a corrupt row; and when every preconditional defect in §24.17 is
closed. Reaching it is an implementation result — not validation, not traction,
and not evidence of product-market fit.

---

## 25. Session Execution and Truthful Training History

**Status: design authority. Not implemented.** §25 defines what a workout *is*
while it is being performed, and what MoveHere may record about it afterwards.
It authorizes no copy and no affordance ahead of its implementation (§22).

### 25.1 The discovery

The execution model was a single integer: how many movements the user had ticked
off. That number carried two different facts at once — **where the user is** and
**what the user performed** — and every situation the product could not express
followed from that one fusion.

Skipping a movement must advance position without adding evidence. Ending a
workout early must stop both while preserving the evidence already gathered.
Neither is expressible in a counter that means both things.

It also made a record's truthfulness **external to the record**. A completed
session stored its movements and no execution facts at all; the claim "these
were performed" rested entirely on the invariant that a record could only be
created when the counter reached the total. The moment any other terminal path
exists, every record silently over-claims — which is why the schema change in
§25.13 is a condition of this section rather than an addition to it.

### 25.2 The evidence principle

> **MoveHere records user-reported execution, not observed physical
> performance.**

This governs every surface: the workout player, the recap, and Activity.

**`completed` means the user explicitly marked this movement Done.** It does not
mean MoveHere observed the repetitions, that every prescribed rep was performed,
that technique was sound, that the prescribed load or duration was achieved, or
that anything improved. MoveHere sees a tap, and a tap is what it records.

**`skipped` means the user explicitly chose to move past this movement without
marking it Done.** It is a normal part of training, not a failure, and it is not
an absence — the user made a decision and the record keeps it.

**`not-reached` means the workout ended before this movement was resolved.**

The three are genuinely different facts, and no surface may collapse them.

### 25.3 Live movement execution state

The scalar loses its authority over execution. A workout in progress carries an
**ordered per-movement execution state**:

```text
pending | completed | skipped
```

Three values. **Not authorized:** `substituted`, `failed`, partial-rep records,
performance scores, or any observed-completion state. Each would either require
evidence MoveHere does not collect or a generator contract that does not exist.

**`current` is derived, never persisted:** the first `pending` movement in
workout order. That dissolves the fusion in §25.1 rather than working around it
— position becomes a function of evidence instead of a second fact to keep in
step with it.

This is only implementable because the generation input is frozen (§24.6).
Indexing execution by position requires the movement list to be stable for the
session's lifetime, which is exactly the property Foundation established. Without
it, this model could not exist.

**Execution state never mutates the generated workout.** Movement identity,
order, prescriptions, block membership, feature basis and the frozen generation
input are all unchanged by anything the user does during training.

### 25.4 Historical movement result

A record stores a **result** per movement:

```text
completed | skipped | not-reached
```

At record creation: live `completed` → `completed`; live `skipped` → `skipped`;
every remaining `pending` → `not-reached`.

**A historical record contains no `pending`.** Pending is a live concept — "still
to do" — and a finished record has nothing still to do. `not-reached` is its
historical tense: the workout ended before this movement came up.

**Every movement stays, in original order.** Skipped and not-reached movements
are never dropped. A workout the user shortened is not a shorter workout; it is
the same workout with a different account of what happened in it.

### 25.5 Lifecycle — derived, not stored

**Active workout**

- **not started** — every movement `pending`
- **in progress** — at least one resolved, at least one `pending`
- **paused / resumable** — *not a persisted state.* It is an unfinished active
  workout that nobody is looking at. There is nothing to store, and storing it
  would create a flag that could disagree with the execution state beneath it.

**Terminal historical outcome**

- **finished** — no movement is `not-reached`; the workout reached its
  programmed end
- **ended early** — at least one movement is `not-reached`

**Non-historical**

- **discarded** — active state destroyed, no record (§24, unchanged)

**No lifecycle or outcome field is stored**, because both are completely
derivable from movement results. Storing either would be the redundant state
this plan avoids elsewhere.

> **`finished` does not mean every movement was completed.**

Five completed plus two skipped plus zero not-reached is a **finished** workout.
It must never be summarised as *seven movements completed*. The workout reaching
its end and the user performing everything in it are different facts, and the
distinction is the whole point of §25.

### 25.6 Done

Changes **only the current movement** from `pending` to `completed`, and
advances to the next `pending` movement. It asserts that the user marked the
movement Done, and nothing more (§25.2).

If no `pending` movements remain afterwards: create a **finished** record, append
before clearing, and preserve the idempotent terminal behaviour of §24.6.

No confirmation.

### 25.7 Skip movement

Changes **only the current movement** from `pending` to `skipped`, and advances
to the next `pending` movement. It does not count as completed, and the movement
stays visible in the historical recap.

**No reason is required in v1.** A reason field nothing consumes is data
collected for its own sake; it becomes worth asking for when substitution exists
and the answer could change what MoveHere builds.

If skipping resolves the final `pending` movement, the outcome is **finished**,
and the record reports completed and skipped results exactly as they are. **Do
not call every movement completed merely because the workout reached its end.**

No confirmation.

### 25.8 Finish later

Changes no execution state. Creates no Activity record. Preserves session
identity, seed, movement results, frozen generation input and prescriptions —
everything, untouched.

**Destination: the preparation screen**, where the existing Resume / Discard
interaction (§24.6) already represents the unfinished workout and already says
what is waiting. The user is still mid-flow; sending them to the landing page
would be leaving the product rather than pausing inside it.

No confirmation. **No expiry** — unchanged from §24.6.

### 25.9 End workout

The user says today's workout is over before reaching its end. **Distinct from
Finish later** (which keeps it), **from Discard** (which destroys it), and **from
Restart** (which resets it).

When at least one movement has been explicitly resolved:

- **require confirmation**
- convert remaining `pending` movements to `not-reached`
- append an immutable Activity record
- clear active state
- outcome derives as **ended early**

The record shows exactly what happened. Eight programmed, four completed, one
skipped, three not reached — and **no surface may turn that into eight
completed**.

This is the rule §24.6 refused, and it is reversed deliberately. Losing four
movements of real work because a fifth did not happen is the worse failure, and
the user ending a workout is a decision worth recording rather than an error to
discard.

#### The zero-evidence rule

If **no movement has been completed and none skipped**, End workout **must not
create an Activity record**.

An untouched generated plan is not evidence of a workout. It is a workout that
was built and never begun, and recording it would let history be manufactured by
generation alone — a number that grows by pressing Build.

The user should instead be directed toward **discarding** the unfinished
workout. The wording is a design decision and is not fixed here; what is fixed
is that nothing is recorded.

### 25.10 Restart workout

> Try the same generated workout again from the beginning.

**Preserves** session and workout identity, seed, frozen generation input,
movement identities, order and prescriptions. **Resets** every movement execution
state to `pending`. Creates no Activity record.

**Requires explicit confirmation**, because it destroys execution evidence the
user generated. That is the same test §24.7 applies to deleting history: the
question is not whether the data is small, but whether the user made it.

> **Restart workout** = the same workout, execution reset.
> **Build another workout** = discard this workout and generate a *different*
> one from the current setup choices.

Restart says "let me try that again". Build another says "give me something
else". They must not be merged, and neither may be worded as the other.

### 25.11 Discard workout

Unchanged from §24.6 and Invariant 8: destroys unfinished active-workout state,
creates no Activity record, and preserves the request, the confirmed inventory
and venue corrections.

**Discard and End workout must not be merged.** One says the workout did not
happen; the other says it happened and stopped. Collapsing them would either
destroy real work or invent history, depending on which way the merge went.

### 25.12 Player control hierarchy

Authorized direction; final visual styling is not fixed here.

- **Primary, dominant: Done**
- **Secondary, visible: Skip movement**
- **Session-level overflow: Finish later · End workout · Restart workout**

Done and Skip are movement-scoped and frequent. The other three are
session-scoped, rarer, and two of them carry consequences that should not sit
beside the primary tap target.

**Skip must not be buried.** If skipping is harder than finishing, people will
press Done to get past a movement they did not do — and the model's honesty
would be defeated by its own interface.

Requirements: Done remains dominant; End workout and Restart require
confirmation; Finish later does not; targets stay at or above 44px; and
one-handed mobile use during exercise is a design requirement, not a
consideration.

### 25.13 Activity record schema v2

`ACTIVITY_SCHEMA_VERSION 1 → 2`. One addition:

```text
movements[].result : completed | skipped | not-reached
```

**Not added:** an outcome field (derivable, §25.5), result counts (derivable),
timing, calories, performance, skip reason, analytics, ownership or provider
fields.

**Preserved unchanged:** immutable snapshot semantics; stable record identity;
frozen `localDate`; programmed duration; goal; conditions; session kind;
substitute reason; features used; block names; movement identities;
prescriptions; variation labels; per-movement feature basis. **Renamed:**
`completedAt` → `recordedAt` (below).

#### `completedAt` is renamed to `recordedAt` — decided

A field named `completedAt` on a workout that was **not** completed states
something false at the schema level, and every reader inherits it. Activity
schema v2 therefore renames it.

> **`recordedAt` is the timestamp at which the workout became an immutable
> Activity record.**

**It does not mean** workout start time, elapsed training time, or observed
physical activity time. It is the moment history was written, and nothing else.

The name is true under both outcomes and carries no claim about how the workout
ended. The outcome is already expressible from movement results (§25.5); the
timestamp must not become a second, weaker way of implying it.

Alternatives rejected: `endedAt` (accurate, but reads as failure for a finished
workout) and keeping `completedAt` to mean "when the record was completed"
(defensible only by explanation, which is what a misleading name always needs).

**Ordering semantics are unchanged.** `recordedAt` is the UTC instant used to
order history, exactly as `completedAt` was; the frozen `localDate` continues to
carry calendar membership (§24.9).

**Migration:** v1 `completedAt` → v2 `recordedAt`, value unchanged. This is
authorized by the §25.14 proof: a v1 record was created only at terminal
completion, so the instant it stored was already the instant it became a record.
The rename corrects what the field was *called*, not what it held.

The rename lands with the schema change in **E1** (§25.25). It is a decided rule,
not an open question.

### 25.14 Activity v1 → v2 migration

**Every v1 movement migrates to `completed`.** This is proved, not assumed, and
the proof was re-verified against the v4.7 implementation checkpoint before
being written down:

1. The Activity store is written by exactly one call site — the terminal
   completion operation.
2. That operation is reached from exactly one call site, gated on the counter
   reaching the movement total.
3. The counter is incremented from exactly one call site, by one, via the Done
   action, and starts at zero.
4. There is no backward navigation between movements.

Therefore **the existence of a v1 record proves the user pressed Done for every
one of its movements.** Had any of those call sites been plural, the proof would
fail and this migration would be a guess.

**Never infer `skipped` or `not-reached` for a v1 record.** Neither state could
be produced under the old contract, so inferring one would be inventing history
that the implementation made impossible.

If a future audit finds the proof no longer holds at the v4.7 checkpoint, this
migration is withdrawn rather than weakened.

### 25.15 Active-session schema v3

The scalar loses its authority. The successor persists **an ordered list of
resolved results** — and nothing else:

```text
execution : (completed | skipped)[]
```

**`pending` is never persisted.** The list is a prefix of resolved movements in
order; everything beyond its length is pending by definition, and `current` is
the list's length. This is the minimum representation that can express §25.3:
it stores exactly the facts the user generated, cannot disagree with itself
about position, and needs no total to be written down.

It encodes one constraint deliberately: **resolution is forward-only.** Returning
to an earlier movement is not authorized in v2, and if it is ever wanted, this
representation is what would have to change.

**Requirements:** the schema version increments; the list length must never
exceed the deterministically derived movement count, and a record that violates
this **fails closed** — an execution list that cannot be trusted is not a session
that can be faithfully resumed; the frozen generation input remains
authoritative; faithful resume (§24.6) remains mandatory; the one-active-session
invariant (Invariant 7) remains mandatory.

#### Migration from active-session v2

`done = N` migrates to **N `completed` entries**, by the same proof as §25.14
steps 2–4: the counter was incremented only by the Done action, one at a time,
from zero, with no backward navigation. The first N movements were explicitly
marked Done.

**The migrated-v1 case with `frozenView === null` carries forward unchanged.**
That session has no frozen venue input and none may be fabricated for it
(§24.6). Its execution list migrates on exactly the same evidence; nothing about
this section gives it a venue it never had.

### 25.16 Terminal lifecycle and idempotency

Two terminal paths — **finished** and **ended early** — and both preserve §24.6
in full: **append the record before clearing the active session**, and derive the
record identity deterministically from active-session identity.

**Both paths share that identity, and must.** A session has one identity and may
produce at most one record, so repeating either terminal path — a double tap, a
reload mid-transition, a retry after an interrupted clear — resolves to the same
record and appends nothing. The two paths differ in what they write, never in
how many records they may write.

### 25.17 Recap semantics

Recap moves from *what was programmed* to *what was programmed, and what the user
reported doing*.

**A finished workout** takes neutral completion language, and **must not imply
every movement was completed** when some were skipped.

**An ended-early workout** takes restrained factual language. It does not shame,
grade, or frame the workout as a failure. The product reports; it does not
assess.

Movement rows must be able to show **completed**, **skipped** and **not reached**
as distinct facts. Skipped and not-reached must be distinguishable from each
other: one was a decision, the other simply never came up.

**On check marks.** Under this model a check becomes defensible for the first
time — it would mean *you marked this Done*, not *MoveHere verified it*. That
distinction does not survive a bare tick, which every reader has been trained to
read as verification. The treatment is **not fixed in this documentation pass**;
what is fixed is that no mark may imply MoveHere observed anything.

**Layer A keeps "Movements programmed"**, because it describes the prescription
and stays true under both outcomes. It must be accompanied by whatever execution
summary prevents it being read as movements completed — the number is honest, and
sitting alone it would be misread.

### 25.18 Activity semantics

**Both finished workouts and ended-early workouts with execution evidence enter
Activity.**

Therefore **"N completed sessions this week" is superseded by "N workouts this
week"**, where a **workout** is an immutable Activity record representing a
training session that carries execution evidence.

Not counted: **paused** workouts (no record), **discarded** workouts (no record),
and **zero-evidence ended sessions** (no record, §25.9).

**Multiple records on one local date count separately** toward the workout count,
while **the date is marked once** — unchanged from §24.9 and Invariant 5. The
count counts records; the calendar marks dates. They answer different questions
and must not be reconciled into one number.

### 25.19 Compact recent-week direction

The visually dominant five-week, thirty-five-cell calendar is **superseded**. The
approved direction is **compact Monday-aligned recent-week strips**:

```text
              M  T  W  T  F  S  S
THIS WEEK     ·  ●  ·  ●  ·  ●  ·     3 workouts
LAST WEEK     ●  ·  ●  ·  ·  ·  ·     2 workouts
2 WEEKS AGO   ·  ·  ·  ●  ·  ·  ·     1 workout
```

**This is not a prescribed weekly plan.** MoveHere prescribes no schedule, so no
mark may mean *workout scheduled*, *workout missed*, *rest day*, or *target
frequency*. Any of those would be inventing a plan the product does not have and
then judging the user against it.

**Semantics, and only these:**

- **marked date** — at least one Activity record on that stored `localDate`
- **unmarked past date** — no Activity record on that date, and nothing more
- **future date** — has not elapsed, and **must remain visually distinct from an
  unmarked past date**; collapsing the two would style tomorrow as already missed
- **multiple workouts on one date** — still one mark
- **row count** — the number of Activity records in that week

The representation stays compact and **subordinate to the workout history**: the
records are the content, the rhythm is context. **A month calendar is not
authorized. A fixed Day 1 / Day 2 / Day 3 plan is not authorized.**

### 25.20 Future activity charts

Recorded as direction only, authorizing nothing.

A weekly or monthly visualization may eventually represent factual training
behaviour — workouts recorded per week, training dates, and whatever execution
facts §25 makes available. None of it may be called physiological progress unless
MoveHere later measures evidence that supports the claim.

**Not authorized now:** strength-improvement charts, fitness improvement,
performance trends, streaks, and programmed-minute totals presented as time
trained.

**Any future chart requires an explicit measurement contract first** — what is
measured, from what evidence, and what the reader is entitled to conclude. A
chart without one is a claim with a picture in front of it.

### 25.21 Activity deletion placement

Whole-record deletion remains a **storage and data-control capability**, remains
supported, and remains tested. §24.7 is unchanged.

**Superseded:** the proposal to place a prominent Delete control on every Activity
history row. Repeating a destructive control beside every ordinary one makes
deletion look like a routine part of reviewing history, and puts it a mis-tap away
from opening a record.

**For this stage, no prominent Delete action appears in the primary Activity
list**, and Delete on the recap surface is **not automatically authorized**
either. User-facing deletion placement is **deferred** until a broader
history-management and data-control interaction is decided.

The capability stays. Only its prominence is withdrawn.

### 25.22 Mid-workout environment changes

Three different situations that must not be merged:

| The user's situation | Mechanism | Scope |
|---|---|---|
| "Not this movement, now" | **Skip movement** (§25.7) | this movement, this workout |
| "This feature is no longer usable" | **Venue correction** (§24.8) | future generation only |
| "Give me another movement instead" | **Substitution** | **not authorized** |

A venue correction **must not retroactively rewrite the running workout**, whose
generation input is frozen. The park changing is a fact about the next workout,
not about this one.

**Substitution is deferred to a later adaptive-training stage.** It needs a
contract for mid-session regeneration that would either violate the frozen-input
guarantee or define a successor session, and neither exists. **The frozen-input
guarantee is not to be weakened in order to implement it** — that guarantee is
what makes faithful resume and immutable history possible at all.

### 25.23 New invariants

These join the standing invariants.

10. **MoveHere records user-reported execution, not observed physical
    performance.** `completed` means the user marked a movement Done, and no
    surface may imply more.
11. **A record may never assert more performance than its movement results
    support.** Reaching the end of a workout is not evidence that everything in
    it was performed.
12. **Every programmed movement stays in the record, in order, whatever its
    result.** Skipped and not-reached movements are never dropped.
13. **An ended workout with no execution evidence produces no record.**
    Generation alone never becomes history.
14. **`pending` is a live state and never appears in history**; its historical
    tense is `not-reached`.

### 25.24 What this section does not authorize

It does not authorize substitution (§25.22), session timing or any elapsed-time
measure, a change to the meaning of programmed duration, streaks, trends,
improvement of any kind, charts (§25.20), a month calendar or a weekly plan
(§25.19), user-facing deletion placement (§25.21), accounts, a provider, a
server, or any migration away from local-first storage (§22, §24.13). It does not
authorize a single word of Session Execution vocabulary in the product before the
model exists.

### 25.25 Implementation sequencing

Session Execution v2 lands in **two stages**. The order is deliberate:
**executable truth before presentation.** Redesigning the player first would
mean building Skip and End against a model that cannot record what they mean,
and the screens would have to be rebuilt the moment it could.

#### E1 — Execution and Storage Foundation

Active-session schema v3; the scalar removed as execution authority; the ordered
resolved-execution prefix; live `completed` / `skipped`; derived current
movement; faithful resume preserved; Activity schema v2; historical `completed` /
`skipped` / `not-reached`; `recordedAt`; active-session v2→v3 migration; Activity
v1→v2 migration; the **finished** and **ended-early** terminal paths; the
zero-evidence rule; restart and reset semantics; deterministic and idempotent
terminal recording; append-before-clear; interrupted-completion recovery;
**quarantine preservation**; and invariant and property tests for all of it.

**No broad UI redesign in E1.** The existing screens keep working against the new
model with the smallest wiring that makes them truthful.

#### E2 — Training Experience

Done; Skip movement; the session-action overflow; Finish later; End workout;
Restart workout; the confirmation interactions; Recap's finished versus
ended-early semantics; per-movement `completed` / `skipped` / `not reached`
presentation; **N workouts this week**; the compact recent-week strips; Activity
history adaptation; removal of the prominent Delete; and integration of the
retained Activity work.

#### The held Activity implementation

An Activity implementation exists, complete and verified, and is **held
uncommitted** rather than shipped. Three of its decisions are superseded by this
section before they ever reached production: the **five-week thirty-five-cell
calendar** (§25.19), the **prominent per-row Delete** (§25.21), and the
**"completed sessions this week"** wording (§25.18).

**Its quarantine-preservation behaviour is not to be cherry-picked ahead of E1.**
That behaviour — unreadable rows surviving every append and delete rather than
being silently purged — is correct and must be **carried into the Activity v2
implementation and remain tested there**. Landing it separately would put a fix
into production against a schema that is about to change underneath it, and
split its tests across two shapes of the same store.

### Exit condition

Session Execution v2 is complete when a workout carries ordered per-movement
execution state; when Done, Skip, Finish later, End workout, Restart and Discard
all behave as defined here; when an intentionally ended workout with evidence
produces a truthful ended-early record and a zero-evidence one produces nothing;
when Recap and Activity distinguish finished from ended early without implying
performance MoveHere never observed; and when both migrations land on the proofs
in §25.14 and §25.15 rather than on assumption. Reaching it is an implementation
result — not validation, not traction, and not evidence of product-market fit.
