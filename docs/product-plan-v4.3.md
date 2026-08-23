# MoveHere — Product Plan

**Version 4.3 — Park-first, venue-aware, evidence-driven**

> **Working name:** MoveHere. Availability and trademark clearance have not yet been completed.
>
> **Status:** Native Mobile Client (§20) — the current implementation phase. The Phase 0 foundation (§19) is mechanism-complete and released as the web MVP (`web-mvp-v1`); its remaining exit conditions are open and carried forward. Formal customer interviews and commercial validation are intentionally deferred. Product hypotheses remain explicitly unvalidated.

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
   │
   └── Native Mobile
       Expo + React Native
       iOS + Android
```

The clients are presentation. Neither owns product logic. The supported-feature registry, the candidate → confirmation → confirmed venue inventory contract, the compatibility matrix, goal programming policy, feasibility, and the deterministic generator are shared source, consumed identically by both. A client may not hold its own copy of any of them, and may not reach generation by a route the other does not have (§6, §8).

Current direction:

- TypeScript.
- Deterministic domain logic separated from UI, and shared by both clients.
- Web client: Next.js App Router, Tailwind CSS.
- Native mobile client: Expo, React Native, Expo Router.
- One repository, no workspace tooling. The shared domain has no external dependencies and no platform APIs, so it is shared as source rather than packaged.
- Local-only state on both clients.
- Server-side vision inference when vision is introduced.
- Server-side session generation when server infrastructure is introduced.
- Supabase + PostgreSQL in Phase 2.
- RLS in Phase 2.
- PostGIS only when geographic venue discovery requires it.

### Shared domain, not a shared UI layer

The clients share domain logic, presentation data, and safety-critical copy. They deliberately do not share components. Tailwind and React Native are different rendering models, and a compatibility layer between them would buy partial reuse at the cost of putting a translation layer in the one place the visual identity is defined. The Open Air identity is shared as design tokens — colour, type scale, radii, elevation, motion — and rendered natively by each client.

The tokens are extracted from the web stylesheet; the stylesheet is **not** rewritten to consume them. That leaves two representations of the palette for now, deliberately. The working web CSS stays the canonical visual reference, and rewriting a released client's styling to import a token module would risk visual regression in exchange for single-source purity that cannot yet be evaluated. Mobile is the second consumer of these values, and whether native rendering needs different token semantics is something to learn from it rather than guess in advance. Revisit collapsing the two once the native client visually matches Open Air.

### Goal programming policy

Goal programming policy is data, authored in-repo and version controlled. It moves through the same review as code. It is data for authoring, not for runtime mutation.

### Carried-forward design work

Recorded so it is not lost between passes. Not implemented:

- **Consistent exercise visuals in the workout player.** The player currently
  carries a movement name, a prescription and written cues. A coherent set of
  exercise illustrations or diagrams would make a movement recognisable without
  reading, which matters most at the moment it matters most — mid-session, at
  arm's length, outdoors. Deferred from M5 because a partial or inconsistent
  set would read worse than none, and because the set has to be designed as a
  system rather than drawn one movement at a time.

### Carried-forward contract work

Recorded so it is not lost between passes:

- **Laterality and rep counting.** **Closed.** **Laterality is an intrinsic property of an exercise** — `bilateral | unilateral` — because whether a movement works one side at a time is a fact about the movement, not a policy choice. **Rep counting is a property of a prescription** — `total | per-side` — because it states what a prescribed number means. What was missing for both passes was the proof that the two agree: counting was authored per slot, slots select by movement pattern, and nothing checked the result. An audit found 1,335 of 6,540 generated items carrying a count their movement did not accept; the evidence is preserved in `docs/counting-compatibility-audit.md`. Counting compatibility (§8) closes it — `countingModes` authored per movement, proved when policy loads — and the figure is now zero.
- **Hanging knee raise is two movements.** Accepted, not implemented. The matrix holds one exercise cited on a pull-up bar and on parallel bars, the second labelled *From a support hold*. The evidence does not support that being a variation: the body hangs below the hands in one and is supported above them in the other, and comparative research treats the supported version as its own exercise (`docs/movement-instruction-evidence.md`). `hanging-knee-raise` keeps the bar; a distinct supported knee raise takes the parallel bars, replacing the existing compatibility claim rather than adding to it. The new movement needs its own cues and structural metadata — the existing ones are false of a support hold — and both stay instruction-outstanding. Outstanding.
- **Movement instruction content.** The contract exists — typed steps, the three-valued state, declared default context and phase overrides, all validated when the matrix loads. No instruction is authored: coverage is 0 authored, 0 not-required, 22 outstanding, and `check:instructions` reports it on every build. Two movements have a decided outcome waiting to be written (`brisk-walk` and `easy-run` become `not-required`: ordinary locomotor action has no construction step, and pace stays cue content). Two are blocked on the domain questions in §8 above, `thoracic-rotation` and `shuttle-run`. Outstanding.
- **Slot variety debt from counting compatibility.** Enforcing counting compatibility narrowed twenty-nine slots and left nine able to produce only one movement each, because a slot carries one prescription and its eligible movements are dosed differently. Every movement remains reachable and no session states work it is not asking for, so this is a valid state rather than a defect — but it is not the intended programming outcome, and it is deliberately visible: `counting-narrows-slot-to-one` names each affected slot when policy loads. Slot prescription variants (§8) is the resolution. Outstanding.
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

Phase 0 is the only numbered phase this document defines. "Phase 1" and "Phase 2" appear throughout as labels for *product capability* stages — no authentication in Phase 1 (§14), accessibility as a Phase 1 quality requirement (§15), Supabase and RLS in Phase 2 (§15) — and they are still not formally scoped. Defining them is deferred until there is enough evidence to scope them honestly.

The native mobile client (§20) is an implementation phase, not one of those capability stages, and deliberately does not claim the Phase 1 name. It adds a client; it adds no product capability. Every existing Phase 1 and Phase 2 reference continues to mean what it meant.

---

## 20. Native Mobile Client

The current implementation phase.

Its purpose is to bring MoveHere to iOS and Android as a native client, at feature parity with the released web MVP, over the same shared domain.

### Why this phase exists

The web MVP proved the complete flow end to end: a confirmed park inventory drives deterministic generation, and the whole sequence from environment selection to post-session correction is implementable inside the safety authority boundary (§9).

Native mobile was not part of the original implementation scope. It became the logical next client once the web version proved the flow — MoveHere is used standing in a park, on a phone, outdoors, which is a native context. This is recorded plainly so that a later reader does not mistake it for a commitment made earlier than it was.

### Scope

Feature parity with the web MVP, and nothing beyond it:

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

### Leaving this phase

Parity is the bar. The flow above works on iOS and Android, the shared domain has one implementation, and the safety and language invariants hold identically on both clients.

Parity is an implementation result and nothing more. It is not validation, not traction, and not evidence that anyone wants the product. The Phase 0 exit conditions in §19 remain open throughout this phase and are not addressed by it.
