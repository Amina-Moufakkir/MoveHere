# Movement instruction evidence

Compiled 2026-08-23 against `feat/mobile-app` at `16d53b3`, matrix `1`.

The descriptive basis for authoring movement instructions (§8). It records what
is supported, by what, how well, and what is not supported at all. It is
evidence, not content: **no instruction prose exists in this repository, and
nothing here is instruction prose.** Source wording is evidence and is never
copied into MoveHere content.

Scope is deliberately narrow — starting position, defining action, return
position, and context-specific setup. Nothing else was collected, and what was
collected incidentally and discarded is listed below so the omission is visible
rather than assumed.

## Provenance and verification status

**Unless a page appears as verified in the register below, its content reached
this document through an automated summariser.** The fetch mechanism available
to this project runs a small model over a page and returns its answer; it does
not return raw source text. Summariser-mediated entries are **second-hand by
construction** and are not verified primary-source evidence.

Reading a cited page directly is the only thing that converts an entry from
second-hand to verified, and **no instruction prose may be committed from an
unverified entry.**

Entries carry one of four provenance states:

```text
verified               a person read that page, for that movement
derived from verified  facts taken from a verified page about a different movement
second-hand            summariser-mediated, not verified
set aside              read and deliberately not used
```

**Derived is not verified.** It is better than second-hand — the facts themselves
were read by a person — and it is weaker than verification, because nobody has
read a source about *this* movement. An entry in that state names what it was
derived from and why no dedicated source exists.

`incline-push-up` is a compound case: **composite derived**, assembled from two
verified pages about two other movements, neither of which is it. That is the
weakest form of derivation in this artifact and it is labelled as such.

**A retraction, and the reason it was possible.** This artifact twice claimed the
register was complete and that no movement evidence remained summariser-only.
Both claims were false. `ACE-LIB` 142 was never added to the register, so
`hip-flexor-stretch` sat at directly-supported status on evidence nobody read;
and `march-in-place` was shown resting on `NHS-STR`, which was verified only for
its wall press-up section and says nothing about marching.

Both errors survived eleven verifications for the same reason: **the register was
treated as the inventory of what needs reading, when it was only a list of what
someone thought to write down.** The per-movement basis table is the inventory.
Anything in it without a register row is unverified by definition, and the two
tables must be reconciled rather than assumed to agree.

### Verification register

Ordered by priority. `verified` means a person read the page itself.

**A register row asks what a page says. It must not ask for confirmation of what
the page is assumed to say.** Three rows here were written the wrong way round
and had to be corrected on contact. One asserted that ACE 303 is a BOSU
exercise. One asked to confirm the hip-hinge bar is "a feedback device, not part
of the movement". One instructed *do not record platform height* for ACE 28,
presuming a height was stated there; the page does not state one, so there was
nothing to exclude. All three smuggled a summariser's conclusion into the
question, which is the failure mode this register exists to prevent.

| Page | Status | Verified facts / what to confirm |
|---|---|---|
| [ACE 41 Push-Up](https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/) | **verified 2026-08-23** | Hands approximately shoulder-width; shoulders directly over hands; body extended with no hip or knee bend; the downward phase lowers the body with a rigid torso; the upward phase presses back to full elbow extension. **The default explicitly allows the elbows to flare outward during lowering, and elbows-close-to-sides is presented separately as an alternative position.** |
| [ACE 101 Side Plank with Straight Leg](https://www.acefitness.org/resources/everyone/exercise-library/101/side-plank-with-straight-leg/) | **verified 2026-08-23** | Starts lying on one side; legs extended and stacked; supporting elbow directly beneath the shoulder; the upward action lifts the hips and knees from the floor; the held position keeps the supporting elbow beneath the shoulder; lowering returns to the start. **This straight-leg floor variation is MoveHere's designated basis.** [ACE 303](https://www.acefitness.org/resources/everyone/exercise-library/303/side-plank/) was not read and is not the basis |
| [ACE 33 Hip Hinge](https://www.acefitness.org/education-and-resources/lifestyle/exercise-library/33/hip-hinge/) | **verified 2026-08-23** | Standing setup, feet shoulder-width, toes forward or slightly outward; movement begins by shifting weight toward the heels and pushing the hips backward; the torso hinges forward at the hips; only slight knee bending occurs; the return moves the hips forward to upright standing. **ACE teaches this version using a light bar maintained against the head, thoracic spine and sacrum, and does not state that the bar is optional** |
| [ACE 366 Bulgarian Split Squat](https://www.acefitness.org/resources/everyone/exercise-library/366/bulgarian-split-squat/) | **verified 2026-08-23** | Starts in a split stance, one foot forward and the other behind; the rear foot is placed on a bench or box; the back is kept straight during the lowering phase; the rear knee lowers toward the floor; the return presses the front foot into the ground, and ACE also describes pushing through the top of the rear foot. **ACE specifies a bench or box height; that specification is excluded** — see the equipment note |
| [NSCA *The Undervalued Lunge*](https://www.nsca.com/contentassets/24dd7222ed1b4caeb8a0a46b81bd11f3/ptq-4.4.9-the-undervalued-lunge.pdf) | **verified 2026-08-23**, with applicability caveat | Split stance, one foot forward and one behind; feet approximately hip-width apart; front-to-back distance greater than a walking stride; torso upright; toes and knees forward; rear heel raised; hips move down and up in a straight line; the return uses pressure through the front heel; the **Completely Stationary** modification keeps the feet in place after setup until the repetitions are done. **Discusses the lunge family and does not name a split squat** — see the applicability note |
| [ACE 135 Bodyweight Squat](https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/) | **verified 2026-08-23** | Starts standing, feet slightly wider than hip-width, toes turned slightly outward; the descent begins by moving the hips backward then downward, with the hips and knees bending; the heels remain on the floor throughout; the upward phase extends the hips and knees with hips and torso rising together, returning to the starting standing position. **The depth target is excluded** |
| [ACE 319 Reverse Lunge](https://www.acefitness.org/resources/everyone/exercise-library/319/reverse-lunge/) | **verified 2026-08-23**, with loaded-source caveat | Standing with feet about hip-width apart; one leg steps backward; after the rear foot contacts the ground the rear knee lowers toward the floor; the chest remains raised during the descent; the return presses the front foot into the ground and the rear leg moves forward to standing. **The source is a barbell-loaded reverse lunge** — see the loaded-source note |
| [ACE 28 Step-Up](https://www.acefitness.org/resources/everyone/exercise-library/28/step-up/) | **verified 2026-08-23**, with loaded-source caveat | Starts standing, feet approximately hip-width apart; one foot is placed firmly on the platform; the torso remains upright through the upward phase; the body rises onto the platform and the trailing foot comes alongside the lead foot; on the descent the trailing foot steps backward to the floor first, then the lead foot leaves the platform. **ACE instructs pushing off with the trailing leg during the ascent.** The source uses dumbbells; **it does not specify a platform height** |
| [ACE 49 Glute Bridge](https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/) | **verified 2026-08-23** | Starts lying on the back, knees bent, feet flat on the floor approximately hip-width apart, toes facing forward and away from the body; the upward phase raises the hips from the floor with the heels pressing into it; the lowering returns toward the starting position |
| [ACE 329 Single-leg Romanian Deadlift](https://www.acefitness.org/resources/everyone/exercise-library/329/single-leg-romanian-deadlift/) | **verified 2026-08-23**, designated basis | Starts standing, feet approximately hip-width apart, knees slightly bent; the hips move backward; one foot leaves the ground and the free leg extends behind the body while the torso leans forward; the return brings the body upright and the free leg back toward the floor. **The equipment-free version**, and ACE's name for it differs from MoveHere's — see the name-mismatch note |
| [ACE 350 Single Leg Romanian Dead Lift](https://www.acefitness.org/resources/everyone/exercise-library/350/single-leg-romanian-dead-lift/) | **not used** | The cable-machine version. **Not rejected and not classified as wrong** — simply less applicable, and unnecessary once ACE supplies a directly equipment-free page. Recorded so a later reader does not re-open the question |
| [ACE 32 Front Plank](https://www.acefitness.org/resources/everyone/exercise-library/32/front-plank/) | **verified 2026-08-23** | Starts lying prone on the floor; elbows directly beneath the shoulders; legs extended; the upward phase lifts the body from the floor; through the hold the torso and legs remain stiff and the shoulders stay over the elbows; the downward phase lowers the body back toward the floor. **Contains pain and medical guidance, excluded** |
| [ACE 147 Supine Dead Bug](https://www.acefitness.org/education-and-resources/lifestyle/exercise-library/147/supine-dead-bug/) | **verified 2026-08-23** | Starts lying on the back; before the moving phase both arms and legs are raised, knees directly over the hips and bent about 90 degrees, arms and elbows over the shoulders; one arm and the opposite leg lower toward the floor together and return to the start; the movement then occurs with the opposite pairing. **ACE explicitly instructs slow lowering and slow return** |
| [ACE 191 Pull-ups](https://www.acefitness.org/resources/everyone/exercise-library/191/pull-ups/) | **verified 2026-08-23** | Starts beneath the bar with arms reaching overhead; takes a full grip; the body leaves the ground with the arms overhead; the upward action bends the elbows and drives them downward while the trunk stays generally vertical, continuing until the chin is approximately level with the bar; the return extends the arms overhead until fully extended. **Not a dead-hang source** — it verifies a suspended starting position from which dead-hang setup is *derived*, see below |
| [NHS Strength exercises](https://www.nhs.uk/live-well/exercise/strength-exercises/) | **verified 2026-08-23** for its wall press-up section | Starts standing away from a wall; hands placed flat against the wall at chest level; the arms bend to move the body toward the wall; the movement reverses to return to the start. **This verifies a wall press-up, not MoveHere's incline push-up** — see the composite-evidence note. Anything the earlier summariser reported beyond these facts is not carried |
| NHS *Standing press-up* video transcript | **human-provided, directly read 2026-08-23** | Start approximately arm's length from the support; hands placed on the support, arms initially straight, hands shoulder-width apart; back and legs kept straight; the arms bend to move toward the support and straighten to return; standing farther away increases the lean. **NHS explicitly states the press-up may be performed with the hands on a bench instead of a tree** |
| [ACE 142 Kneeling Hip-flexor Stretch](https://www.acefitness.org/resources/everyone/exercise-library/142/kneeling-hip-flexor-stretch/) | **unverified — summariser-mediated** | **Omitted from this register when it was written, and not noticed for eleven verifications.** `hip-flexor-stretch` has been carried at directly-supported status on evidence nobody read. Needs a first read: half-kneeling position, pelvis tuck, the lean into the front hip. Do not record hold durations or repetition counts |
| `pike-push-up`, `hanging-knee-raise`, `supported-knee-raise`, `march-in-place` | **no page** | These need a source found, not a source checked |

## Admitted sources

| Ref | Source | Publisher type | Authority | Applicability | Retrieved |
|---|---|---|---|---|---|
| `ACE-LIB` | ACE Exercise Library, individual movement pages | Professional certifying body | Practitioner guidance, not primary research | High for movement description; many pages are loaded or equipment-based and the loading does not transfer | 2026-08-23 |
| `ACE-RES` | ACE-commissioned exercise comparison research (Univ. of Wisconsin–La Crosse) | Commissioned study, trade publication | Comparative, not a technique description | Used **only** for exercise-identity evidence, not for technique | 2026-08-23 |
| `NSCA-LUNGE` | NSCA, *The Undervalued Lunge*, PTQ 4.4 | Professional certifying body, practitioner journal | Practitioner guidance — **human-verified** | Lunge family; the movement MoveHere calls a split squat appears as the *Completely Stationary* modification, not under that name | 2026-08-23 |
| `MCGILL-AC` | *Muscle activity and spine load during anterior chain whole body linkage exercises* (PubMed 25111163) | Peer-reviewed | Primary research | Used **only** for exercise-identity evidence | 2026-08-23 |
| `DIP-KIN` | *Bench, Bar, and Ring Dips: Do Kinematics and Muscle Activity Differ?* (PMC9603242) | Peer-reviewed | Primary research | Describes the supported position on parallel bars; not a knee-raise description | 2026-08-23 |
| `NHS-VID` | NHS *Standing press-up* video transcript | National health service | Public health guidance — **human-provided, directly read** | Demonstrated against a tree; **NHS explicitly permits a bench as the hand support instead** | 2026-08-23 |
| `NHS-STR` | NHS *Strength exercises*, wall press-up section | National health service | Public health guidance — **human-verified** | **Low.** It documents a wall press-up, a different exercise from MoveHere's incline push-up. Used only for the elevated-hands pressing principle | 2026-08-23 |

## Per-movement basis

Status key — **S** sufficient · **C** sufficient with stated caveat · **X** insufficient,
do not author · **U** basis not verified.

**U is a provenance status, not a sufficiency one.** An entry may describe the
movement adequately and still be unauthorable, because no person has read the
source it rests on. Sufficiency and provenance are separate axes, and the rule
that no prose may be committed from an unverified entry applies regardless of how
good the evidence looks.

| Movement | Basis ref | Status | Descriptive facts supported | Uncertain / not supported |
|---|---|---|---|---|
| `bodyweight-squat` | `ACE-LIB` 135 — **human-verified** | S | Starts standing, feet slightly wider than hip-width, toes turned slightly outward; the descent moves the hips backward then downward as the hips and knees bend; the heels remain on the floor throughout; the return extends the hips and knees with hips and torso rising together, back to standing | **Depth target excluded**, including thigh-parallel. Postural set-up detail, joint-alignment prescriptions and weighting instructions are all out of scope — see the discarded list |
| `reverse-lunge` | `ACE-LIB` 319 — **human-verified**, loaded source | S | Standing, feet about hip-width apart; one leg steps backward; after the rear foot contacts the ground the rear knee lowers toward the floor; the chest stays raised through the descent; the return presses the front foot into the ground and the rear leg moves forward to standing | **A barbell-loaded source, used only for facts that stay descriptive once the load is removed.** Not to be represented as an unloaded or bodyweight source — see the loaded-source note |
| `split-squat` @ EI | `NSCA-LUNGE` — **human-verified** | S | Split stance, one foot forward and one behind, feet about hip-width apart, front-to-back distance greater than a walking stride; torso upright; toes and knees forward; rear heel raised; hips travel down and up in a straight line; the return presses through the front heel; the feet stay in place after setup | **Name mismatch, not movement mismatch** — see the applicability note. Stance length is relative, never absolute. The unverified `ACE-LIB` 366 beginner note is no longer relied on here |
| `split-squat` @ `park-bench` | `ACE-LIB` 366 — **human-verified** | S | Split stance, one foot forward and the other behind; the rear foot placed on a bench or box; the back kept straight while lowering; the rear knee lowers toward the floor; the return presses the front foot into the ground, and also pushes through the top of the rear foot | **ACE does not establish that an arbitrary park bench suits this movement** — see the equipment note. Height specification, depth endpoint and held implements all discarded |
| `step-up` | `ACE-LIB` 28 — **human-verified**, loaded source | S | Standing, feet approximately hip-width apart; one foot placed **firmly** on the platform; torso upright through the upward phase; the body rises onto the platform and the trailing foot comes alongside the lead foot; on the descent the trailing foot steps back to the floor first, then the lead foot leaves the platform | **Corrects earlier summariser text.** Whole-foot placement is *not* established, only firm placement. ACE instructs pushing off with the **trailing** leg — see cue finding 9. **No platform height is stated in the source**, so none was excluded and none exists to carry |
| `glute-bridge` | `ACE-LIB` 49 — **human-verified** | S | Lying on the back, knees bent, feet flat on the floor approximately hip-width apart, toes facing forward and away; the upward phase raises the hips from the floor while the heels press into it; the lowering returns toward the start | **No heel-to-hip distance is stated.** Endpoint and hip-height limits excluded, as are the abdominal and low-back materials that a cue might otherwise be read against — see cue finding 10 |
| `hip-hinge` | `ACE-LIB` 33 — **human-verified** | S | Feet shoulder-width, toes forward or slightly outward; weight shifts toward the heels and the hips push backward; the torso hinges forward at the hips; only slight knee bending; return moves the hips forward to upright standing | **Torso endpoint discarded.** The source teaches the movement with a light bar held at three points and **does not establish that the bar is optional** — see the provenance note below. MoveHere's is unloaded and must not import it |
| `single-leg-deadlift` | `ACE-LIB` 329 — **human-verified**, equipment-free | S | Standing, feet approximately hip-width apart, knees slightly bent; the hips move backward; one foot leaves the ground and the free leg extends behind while the torso leans forward; the return brings the body upright and the free leg back toward the floor | **Name mismatch** — ACE calls it a Romanian deadlift. Range endpoint excluded. `ACE-LIB` 350, the cable version, is not the basis and is not rejected |
| `push-up` | `ACE-LIB` 41 — **human-verified** | S | Hands approximately shoulder-width; shoulders directly over hands; body extended with no hip or knee bend; lower with a rigid torso; press back to full elbow extension | Elbow path is not settled by this source — see cue finding 1 |
| `incline-push-up` @ `park-bench` | `NHS-VID` — **directly supported** | S | Start approximately arm's length from the support; hands on it, arms straight, shoulder-width apart; back and legs kept straight; the arms bend to move the body toward the support and straighten to return. **NHS explicitly permits a bench as the support** | NHS does not re-specify every setup detail for the lower bench position, and establishes **no chest-to-hands endpoint** — see finding 16 |
| `incline-push-up` @ `stairs` | `ACE-LIB` 41 + `NHS-STR` — **composite derived** | C | The elevated-hands pressing principle only | **No source describes this context.** The bench authorisation does not extend to a stair |
| `pike-push-up` | — | **X** | none | **No institutional source located.** Every search returned suspension-trainer or stability-ball pike variants, which are different exercises using equipment the matrix does not cite |
| `dead-hang` | `ACE-LIB` 191 — **derived from verified** | C | Full grip on the bar; the body off the ground; arms overhead; the trunk beneath the hands | **Derived, not verified.** ACE 191 is a pull-up page and verifies that suspended position directly; no dedicated dead-hang source exists. The hold itself, and leaving the bar, are established by nothing — see finding 15 and the static-hold note |
| `pull-up` | `ACE-LIB` 191 — **human-verified** | S | Starts beneath the bar, arms reaching overhead, taking a full grip; the body leaves the ground with the arms overhead; the upward action bends the elbows and drives them downward, trunk generally vertical, until the chin is approximately level with the bar; the return extends the arms overhead until fully extended | **The source's endpoint is the chin at bar level**, which is not MoveHere's cue — see finding 14 |
| `plank` | `ACE-LIB` 32 — **human-verified** | S | Starts lying prone on the floor, elbows directly beneath the shoulders, legs extended; the upward phase lifts the body from the floor; the hold keeps the torso and legs stiff with the shoulders over the elbows; the downward phase lowers the body back toward the floor | The source describes an exit phase — see the note on static holds. Its four fault corrections are excluded and **must not be read back as support** for a cue (finding 12) |
| `side-plank` | `ACE-LIB` 101 — **human-verified** | S | Starts lying on one side; legs extended and stacked; supporting elbow directly beneath the shoulder; the upward action lifts the hips and knees from the floor; the hold keeps that elbow beneath the shoulder; lowering returns to the start | Head position — the source establishes the head aligned with the spine, not MoveHere's phrasing. See cue finding 5 |
| `dead-bug` | `ACE-LIB` 147 — **human-verified** | S | Lying on the back; both arms and legs raised before the moving phase, knees directly over the hips and bent about 90 degrees, arms and elbows over the shoulders; one arm and the opposite leg lower toward the floor together, then return; the opposite pairing follows | **The source's alternating sequence is not MoveHere's counting** — see the counting-boundary note. Hollowing, stabilisation and low-back material excluded and not readable as cue support |
| `hanging-knee-raise` | thin secondary only | **X** | Knees raise toward the chest and lower again — the action only | **No institutional page.** Setup and hang position unsupported |
| `supported-knee-raise` | `DIP-KIN` (position only) | **X** | Bodyweight supported through the upper limbs on parallel bars, elbows extended | **No source describes a support-hold knee raise at all.** Its structural metadata and cues are new project content |
| `march-in-place` | **none** | **U** | *No verified source.* A summariser search returned NHS warm-up and NHS-trust pages describing alternating hip and knee flexion on the spot; none was read | **The earlier `NHS-STR` attribution is withdrawn.** `NHS-STR` was verified only for its wall press-up section and says nothing about this movement. Inheriting its verified status was an error |
| `hip-flexor-stretch` | `ACE-LIB` 142 — **second-hand, unverified** | **U** | *Summariser-reported, not confirmed:* half-kneeling, one foot forward and the opposite knee down; pelvis tucked, spine neutral; lean into the front hip without letting the pelvis rotate forward | **Was carried as directly supported in error.** ACE 142 was omitted from the register, so this was never read. Not authorable until it is. Also a time-dosed hold — see the static-hold exit note |

Not researched, by instruction: `brisk-walk` and `easy-run` (decided `not-required`);
`thoracic-rotation` and `shuttle-run` (blocked on §8 domain questions).

## Out-of-scope facts collected and discarded

Recorded so the omissions are auditable rather than invisible. None of these
reaches the catalog, and none may be reintroduced during authoring.

**Excluded is not rejected.** Nothing in this list is recorded as wrong, or as
disputed. These are facts and instructions that fall outside the
movement-construction scope MoveHere is currently authoring — setup position,
defining action, return, and context-specific setup. Several would be entirely
appropriate content for a product making claims this one does not make. The list
says *not here*, not *not true*.

| Discarded | Where it appeared |
|---|---|
| Hold durations and repetition counts | `ACE-LIB` 142 hip-flexor stretch, 101 side plank, 32 plank, 147 dead bug (30-second relaxation period) |
| Measured set-up distances | `ACE-LIB` 147 dead bug (12–18 inch initial foot distance), `NHS-VID` (arm's-length start distance) |
| Approach, mounting and dismounting method | `ACE-LIB` 191 pull-ups (reaching or jumping to the bar) — **bears on the unresolved static-hold exit question** |
| Tempo and pause prescriptions | `ACE-LIB` 191 pull-ups (pause) |
| Equipment dimensions (bench/box height) | `ACE-LIB` 366 Bulgarian split squat — **verified present in the source and deliberately not carried across** |
| Minimum joint angles at the bottom of a lunge | `NSCA-LUNGE` |
| Joint-alignment and segment-relationship prescriptions | `NSCA-LUNGE` (knee over ankle); `ACE-LIB` 135 (knee over second toe, tibial translation, tibia/torso parallel), 28 (knee over second toe, tibia angle, forward lean), 32 (ankle dorsiflexion), 191 (wrist position, 3-and-9-o'clock elbows) |
| Equipment, held implements and balance support | `NSCA-LUNGE`; `ACE-LIB` 366 (dumbbells, dumbbell position, and the elbow position associated with holding one — unrelated to the push-up elbow finding), 319 (barbell), 28 (dumbbells, hand position), 329 (hand position for balance) |
| Loaded set-up procedure (racking, unracking, bar placement, grip width, rack clearance) | `ACE-LIB` 319 reverse lunge |
| Source-specific coaching cues | `ACE-LIB` 319 (pulling the front knee backwards; pushing back into the hip), 329 (hip tilting) |
| Muscles worked, agonists, activation percentages, and stabilisation-mechanism claims | `ACE-LIB` throughout including 49 glute bridge and 147 dead bug, `MCGILL-AC` |
| Benefits, difficulty ratings, progression and regression | `ACE-LIB` throughout, 28 and 49 (single-leg progressions), 147 (easier variation), 191 (resistance progression, grip variations), `NHS-VID` (greater-distance progression) |
| Functional and daily-life transfer claims | `ACE-LIB` 28 step-up |
| Prerequisite, teaching-sequence and related-exercise recommendations | `ACE-LIB` 33 hip hinge, 135 squat |
| Breathing prescriptions (inhale/exhale phase cueing) | `ACE-LIB` throughout, 101 side plank, 33 hip hinge, 135 squat, 49 glute bridge, 32 plank, 147 dead bug |
| Counting, side-switching, and source-specific left/right wording | `ACE-LIB` 28 step-up (incl. opposite-side language), 142 hip-flexor stretch, 101 side plank, 366 split squat, 319 reverse lunge, 329 single-leg deadlift (completing one side before switching), 147 dead bug (counting aloud, repetition and time instructions); `NSCA-LUNGE` |
| Depth, range and torso-endpoint targets | `ACE-LIB` 135 squat (thigh-parallel), 33 hip hinge, 366 split squat (depth and floor-contact endpoint), 49 glute bridge (hip-height limit), 329 single-leg deadlift (comfortable-distance endpoint), 147 dead bug (mandatory hand and heel floor-touch), `NHS-VID` (nose-near-support endpoint) |
| Muscle-emphasis claims | `ACE-LIB` 41 push-up |
| Joint-stress and safety claims | `ACE-LIB` 41 push-up, 101 side plank, 191 pull-ups (shoulder stress); `NSCA-LUNGE` |
| Muscle-contraction and bracing wording | `ACE-LIB` 101 side plank, 147 dead bug (abdominal hollowing, belly-button-to-spine, pelvic-floor contraction), 33 hip hinge, 135 squat (abdominal), 49 glute bridge (abdominal, glute), 329 single-leg deadlift (glute), 32 plank (abdominal, quadriceps); `NSCA-LUNGE` (abdominal, scapular) |
| Postural set-up detail (scapular, chest, head, hand and palm position) | `ACE-LIB` 135 squat, 28 step-up (scapular), 49 glute bridge (flattening the lower back into the floor), 32 plank (palm and hand direction), 147 dead bug (scapular), 191 pull-ups (scapular, crossed-leg position), `NHS-VID` (hand orientation) |
| Weight-distribution instructions | `ACE-LIB` 135 squat (deliberate shift into the heels) |
| Fault checks and corrections | `ACE-LIB` 135 squat (ankle collapse), 28 step-up (foot and ankle monitoring), 49 glute bridge (excessive arching), 32 plank (low-back sagging, hip hiking, knee bending, shoulder shrugging), 191 pull-ups (anti-swing) |
| Alternative and modified variations (knee-supported, BOSU) | `ACE-LIB` 101 side plank |
| Equipment incidental to a position (mats) | `ACE-LIB` 32 plank, 101 side plank, 49 glute bridge |
| Pain, medical and referral guidance | `ACE-LIB` 32 plank — **out of scope under §10 as well as here** |

The last two matter most. Counting phrasing is forbidden in MoveHere
instruction text by §8 and is caught by the loader; range targets are a
programming judgment this project has not made.

## Cue findings — findings only

The cues are existing project content and remain independently auditable.
**Nothing here was changed, and none of it may be silently corrected while
authoring instructions.** These belong to a cue audit.

**1 · `push-up` — elbow path. Substantive. Human-verified 2026-08-23.**

A person read `ACE-LIB` 41 directly. The source presents two elbow paths: its
**default allows the elbows to flare outward during the lowering phase**, and it
**separately offers elbows-close-to-the-sides as an alternative position**,
paired with turning the hands to face forwards.

MoveHere cues *"Elbows back, not flared."* Two of the three push-up cues are
confirmed consistent with the source — *"Hands under your shoulders"* matches
shoulders directly over hands, and *"Body in one line"* matches a body extended
with no hip or knee bend and a rigid torso through the descent. The third is not.

**The finding stands, and verification sharpened rather than dissolved it.**
MoveHere states as its only instruction what the source presents as an
alternative, and pairs it with the hand position the source associates with its
default. That is **a specific technique choice, unreviewed, not a neutral
definition of the movement** — and nothing in this source supports presenting it
as the way a push-up is done.

The cue is unchanged. Resolving it is a cue-audit decision, not an instruction
one: an instruction that quietly adopted the source's default would overrule a
cue nobody has revisited, and an instruction that echoed the cue would inherit a
choice nobody has reviewed. Until it is resolved, push-up instruction prose
should construct the movement without settling the elbow path in either
direction.

**2 · `bodyweight-squat` — one supported, two phrased by MoveHere. Human-verified 2026-08-23.**

*"Feet about shoulder width"* — **broadly compatible, not directly
established.** `ACE-LIB` 135 establishes feet slightly wider than hip-width.
Shoulder-width is a wider claim than the source makes, and nothing contradicts
it. (`NHS-STR` says hip-width, but that page is still unverified and is not
weighed here.)

*"Sit back and down"* — **directly supported.** The source establishes the
descent beginning with the hips moving backward and then downward, in that
sequence.

*"Stand tall at the top"* — **consistent, phrased by MoveHere.** The source
establishes the return to the starting standing position with the hips and
torso rising together. "Stand tall" is a qualitative instruction it does not
give.

An observation, offered as one and not as a rule: across the six pages read so
far, the cue naming the *action* has tended to be supported, while cues
describing a *position* or a *quality* have tended to be MoveHere's own wording.
That is a pattern in what has been read, not a principle about cues, and it
predicts nothing about the eight pages still unverified. All three cues here are
unchanged and stay project content.

**ACE's depth target is not imported.** Squat prose describes the descent
without stating how far it goes.

**3 · `dead-bug` — framing, not conflict. Minor.**
MoveHere: *"Extend opposite arm and leg."* `ACE-LIB` 147 describes the opposite
hand and heel *lowering toward the floor* from a knees-over-hips start. The same
motion, described from opposite ends. Authoring must not adopt one framing as
though it had settled the other.

**4 · `brisk-walk` — unsourced physiological claim. Carried forward.**
*"Breathe through your nose if you can."* Out of scope for this pass — the
movement is `not-required` — and still open as a cue finding.

**5 · `side-plank` — two cues, two different gaps. Human-verified 2026-08-23.**

A person read `ACE-LIB` 101 directly. The three cues do not sit at the same
distance from it.

*"Elbow under your shoulder"* — **directly supported.** The source establishes
the supporting elbow beneath the shoulder both at setup and through the hold.

*"Hips stacked and lifted"* — **consistent, with wording drift.** The source
directly establishes the *lift* of the hips and knees from the floor. It does
not establish "stacked" as the description of the hips; what it stacks is the
legs. The cue is not contradicted, but half of it is MoveHere's phrasing rather
than the source's fact.

*"Keep your neck long"* — **not directly established.** The source describes the
head aligned with the spine. That is a different formulation, and "long" is a
qualitative instruction the source does not give. It remains existing
project content and is **not to be silently rewritten** into the source's
phrasing while authoring — an instruction that quietly adopted "head aligned
with the spine" would settle a cue nobody has reviewed.

Side-plank instruction prose can be constructed entirely from verified facts —
the start position, the lift, the elbow, and the return are all directly
supported — without depending on either contested cue.

**6 · `hip-hinge` — the cue is standing in for a physical device. Human-verified 2026-08-23.**

*"Soft knees"* — **conceptually supported.** The source establishes that only
slight knee bending occurs.

*"Push your hips back"* — **directly supported.** The source establishes the
hips pushing backward as the initiating action.

*"Flat back throughout"* — **not directly established in that wording.** The
source does not phrase a spinal instruction at all; it constrains body position
physically, through three-point contact with the bar.

That is the substantive part of this finding. **MoveHere's cue is doing the job
the bar does in the source.** Removing the bar — which the environment-
independent movement requires — removes the constraint, and "flat back
throughout" is the unreviewed verbal substitute standing in its place. Whether a
verbal cue can carry what a physical device carried is exactly the kind of
question that needs qualified review rather than an authoring decision.

The cue is unchanged and stays project content. Hip-hinge prose can be built
from the verified facts without settling it, but this movement is a strong
candidate for the trainer-review list rather than the cue-audit list alone.

**7 · `split-squat` — read against two verified sources. Human-verified 2026-08-23.**

Both of this movement's contexts have now been read directly, so its cues can be
checked against two independent sources rather than one.

*"Stagger your stance"* — **directly supported by both.** `NSCA-LUNGE`
establishes the split stance, its width and its front-to-back distance;
`ACE-LIB` 366 establishes the split stance with one foot forward and one behind.

*"Lower straight down"* — **supported by one, broadly consistent with the
other.** `NSCA-LUNGE` establishes the hips moving down and up in a straight line.
`ACE-LIB` 366 describes the rear knee lowering toward the floor and does not
explicitly establish a straight vertical hip path. The cue is not contradicted;
it rests more firmly on one source than the other.

*"Keep your weight on the front leg"* — **not established by either, and the
second source works against it.** `NSCA-LUNGE` establishes pressure through the
front heel *on the return*: an action during one phase, not a state held
throughout, and reading the second from the first is inference. `ACE-LIB` 366
describes the return as pressing the front foot into the ground **and** pushing
through the top of the rear foot — a return using both feet, which does not
support a cue about keeping weight on one of them.

That is the sharpening a second source bought. With one source this cue looked
unestablished; with two it looks like a description the sources do not share.
**It is unchanged and stays project content**, and it must not be silently
rewritten while authoring. Split-squat prose can still be built without settling
it, because the stance, the descent and the return are directly supported in
both contexts.

**8 · `reverse-lunge` — one supported, one framed, one absent. Human-verified 2026-08-23.**

*"Step back, not down"* — **half supported.** `ACE-LIB` 319 directly establishes
the backward step. The corrective half, *not down*, is MoveHere's framing: the
source describes what the movement is, not the mistake it is being distinguished
from. That half is a correction, which is what cues are for, and it remains
unsourced.

*"Keep the front shin upright"* — **not established by this source.** ACE 319
says nothing about the front shin.

*"Push through the front foot"* — **directly supported.** The source establishes
pressing the front foot into the ground during the return.

One thing this finding deliberately does not do. `NSCA-LUNGE` is a verified
source about the lunge family, and a reverse lunge is in that family, so it may
well bear on the front shin. **It was verified for the split-squat context, and
extending it to another movement is a separate applicability decision, not an
inference to make here.** Until that decision is made, the front-shin cue stands
unestablished rather than unexamined.

All three cues are unchanged and stay project content.

**9 · `step-up` — the first cue in tension with its source. Human-verified 2026-08-23.**

*"Place the whole foot on the step"* — **partially supported.** `ACE-LIB` 28
establishes the foot placed *firmly* on the platform. *Whole foot* is a stronger
claim than the source makes and is MoveHere's wording.

*"Step down under control"* — **strongly consistent, phrased by MoveHere.** The
source establishes an ordered descent — trailing foot back to the floor first,
then the lead foot off the platform — performed slowly and under control. The
exact phrasing is MoveHere's.

*"Drive through the top leg"* — **not supported, and in tension with the
source.** ACE explicitly instructs pushing off with the **trailing** leg during
the ascent. That is a different prime mover from the one MoveHere names.

This is a different category from every previous finding. The others were cues
that drifted in wording, or were framed by MoveHere, or were simply unaddressed.
This one names a lead-leg emphasis where the source names a trailing-leg one.
Nothing here decides which is right — that is a question for qualified review,
and the cue is unchanged project content until it gets one.

**10 · `glute-bridge` — one action supported, two positions not. Human-verified 2026-08-23.**

*"Push the floor away"* — **underlying action strongly supported, wording
MoveHere's.** `ACE-LIB` 49 establishes the heels pressing into the floor during
the upward phase. The metaphor is MoveHere's; what it describes is directly
established.

*"Heels close to your hips"* — **not directly established.** The source
establishes bent knees and feet flat and approximately hip-width apart. It states
no heel-to-hip distance.

*"Ribs down at the top"* — **not directly established, and specifically not to
be inferred.** The source carries abdominal-contraction material and a warning
about excessive lower-back arching, both of which are excluded from this
artifact's scope. "Ribs down" is a common cue for the effect those passages
describe, which makes reading them as support for it tempting and wrong: it
would launder excluded material into evidence for a cue, arriving at support the
artifact has explicitly declined to collect. The cue remains unestablished.

All three are unchanged and stay project content.

**11 · `single-leg-deadlift` — a tempo prescription inside a cue. Human-verified 2026-08-23.**

*"Hinge at the hip"* — **directly supported.** `ACE-LIB` 329 establishes the
hips moving backward as the initiating action.

*"Back leg and torso move together"* — **broadly consistent, coordination not
established.** The source describes the free leg extending behind while the
torso leans forward. That the two move *together*, as a synchronised pair, is a
stronger coordination claim and is MoveHere's.

*"Move slowly for balance"* — **not established, and a different kind of
problem.** The source acknowledges balance; it does not prescribe slow tempo as
the answer to it. This cue states a tempo, which is a programming judgment
rather than a description of the movement, and it arrives inside a cue where
nothing reviews it as one.

**Flagged for trainer review specifically as an embedded tempo prescription.**
The Pass 2A inspection noted the same shape in `dead-bug` and
`thoracic-rotation`, so this looked like it might be a family.

**It is not.** `dead-bug` was verified afterwards and its *"Move slowly"* is
directly established by its source (finding 13). Two movements carry a tempo cue;
one is supported and one is not. The shape repeats, the verdict does not, which
is a reason to read each remaining page rather than generalise from this one.

Instruction prose is unaffected either way: tempo is outside the
movement-construction scope, so an instruction would not state one regardless of
how the cue is resolved. All three cues are unchanged and stay project content.

**12 · `plank` — where the no-laundering rule applies, and where it does not. Human-verified 2026-08-23.**

*"Forearms under your shoulders"* — **supported in substance, worded by
MoveHere.** `ACE-LIB` 32 establishes the *elbows* directly beneath the
shoulders. Forearms and elbows are not the same referent, and the setup they
describe is.

*"Body in one line"* — **strongly consistent, not directly stated.** The verified
hold keeps the torso and legs stiff with the shoulders over the elbows, which is
consistent with the cue. The source also carries four fault corrections — low-back
sagging, hip hiking, knee bending, shoulder shrugging — all excluded, and **none
of them may be read back as support for this cue.** Together they describe the
same body position from the outside, which is exactly what makes the inference
tempting and exactly why finding 10 forbids it.

*"Breathe, do not hold your breath"* — **half directly established.** The source
establishes continuing to breathe through the hold. The corrective half is
MoveHere's framing, the same shape as *"Step back, not down"*: the source says
what to do, the cue adds the mistake it is being distinguished from.

**A clarification the artifact needs, arising here.** Breathing is an excluded
category, and the breathing fact is nonetheless cited as supporting this cue.
That is not a contradiction, because the exclusions and the no-laundering rule
run on different axes. **Scope exclusion** decides what may appear in instruction
prose; breathing may not, and will not. **The no-laundering rule** forbids
manufacturing support for a cue out of material that does not directly state it.
ACE saying *continue to breathe* directly states what the cue's first half says,
so citing it is quotation, not inference. Inferring *"ribs down"* from an
abdominal-contraction passage, or *"body in one line"* from a list of sagging
faults, is inference. **The test is whether the source says the thing, not
whether the thing is in scope.**

All three cues are unchanged and stay project content.

**13 · `dead-bug` — a tempo cue that *is* supported. Human-verified 2026-08-23.**

*"Extend opposite arm and leg"* — **supported in substance, worded differently.**
`ACE-LIB` 147 establishes one arm and the opposite leg lowering toward the floor
together and returning, then the opposite pairing. MoveHere says *extend*; the
source describes the same reciprocal motion from the other end. This closes the
framing question raised as finding 3 before any page had been read: the two
descriptions are compatible, and neither settles the other's phrasing.

*"Move slowly"* — **directly supported.** The source explicitly instructs slow
lowering and slow return. This is verified technique and tempo content, and it
stays outside movement-construction prose regardless: tempo is not something an
instruction states.

*"Lower back stays down"* — **not established in MoveHere's wording, and not to
be inferred.** The source carries hollowing, belly-button-to-spine, and
stabilisation material along with low-back positioning, all excluded. The
simplified cue says something those passages are about; it does not say what
they say. Third application of the no-laundering rule, after `glute-bridge` and
`plank`.

**The tempo question is now answered, and not the way it looked.** Finding 11
flagged `single-leg-deadlift`'s *"Move slowly for balance"* as possibly the first
of a family, since Pass 2A saw the same shape here and in `thoracic-rotation`.
It is not a family: that cue is unsupported, this one is directly supported, and
the difference is what each source happens to say. A repeated shape is not a
repeated verdict.

All three cues are unchanged and stay project content.

**14 · `pull-up` — the source names a different endpoint. Human-verified 2026-08-23.**

*"Start from a full hang"* — **strongly supported in substance.** `ACE-LIB` 191
establishes the suspended start with the arms overhead and fully extended.
*Full hang* is MoveHere's terminology for what the source describes.

*"Lower under control"* — **strongly supported.** The source establishes a slow
return to full arm extension. The wording is MoveHere's.

*"Pull your chest toward the bar"* — **not established, and the endpoints
differ.** The source's upward phase continues until the **chin** is approximately
level with the bar. MoveHere's cue names the **chest**, which is a higher and
more demanding endpoint than the one the source states.

**These are not to be silently reconciled.** Writing an instruction to the
source's endpoint would quietly relax a standard MoveHere's cue sets; writing it
to the cue's would state a target no verified source supports. Which endpoint a
pull-up has is a programming judgment, and it belongs to qualified review.

Both cues are unchanged and stay project content.

**15 · `dead-hang` — derived evidence, and two cues resting on nothing. Derived from verified, 2026-08-23.**

`ACE-LIB` 191 is a pull-up page. It directly verifies the suspended position a
dead hang begins from — full grip, body off the ground, arms overhead, trunk
beneath the hands — and it is not a dead-hang source. This movement's basis is
**derived from verified**, which is better than second-hand and is not
verification.

*"Full grip on the bar"* — **directly supported** by that verified setup.

*"Shoulders active, not shrugged"* — **not established, and not to be inferred.**
The source carries scapular depression and retraction material, which is
excluded. That material is about the same region of the body as the cue, which is
what makes reading it as support tempting and forbidden. Fourth application of
the no-laundering rule, after `glute-bridge`, `plank` and `dead-bug`.

*"Breathe steadily"* — **not established by this source.** Its breathing content
is excluded, and unlike `ACE-LIB` 32 for the plank, it does not state the thing
the cue states.

**What no source establishes at all is the hold.** A dead hang is dosed by time,
and the verified evidence covers only how to arrive at the position. Neither the
hold nor leaving the bar is described by anything read so far, and this page does
not resolve the static-hold exit question — the approach-to-the-bar material that
might have spoken to it is excluded as method.

Of the three cues, one is supported and two rest on nothing.

`dead-hang` and `incline-push-up` are the two weakest-grounded movements that are
not outright blocked, and they are weak in opposite places: dead hang has a
verified setup and no source for its hold, while incline push-up has a derived
pressing principle and no source for its setup.

**16 · `incline-push-up` — one context sourced, one not. Directly supported at the bench, 2026-08-23.**

The `NHS-VID` transcript changes this movement's standing. It establishes a
standing press-up performed at roughly arm's length from a support, hands on it
and shoulder-width apart with the arms straight, the back and legs kept straight,
the arms bending to move the body toward the support and straightening to return
— and it **explicitly permits a bench as the support**.

*"Hands on the surface, feet back"* — **substantially supported.** Hands on the
support is explicit, and the transcript uses greater distance from the support to
increase the lean, which is the feet-back setup described from the other end.
The exact wording is MoveHere's.

*"Body in one line"* — **strongly supported in substance.** The transcript
instructs keeping the back and legs straight.

*"Lower your chest to your hands"* — **not established.** The demonstrated
version describes a nose-near-support endpoint, and the transcript gives no
chest-to-hands endpoint for the bench variation.

**The two contexts now differ.** `incline-push-up @ park-bench` has direct
primary-source support and is no longer composite extrapolation.
`incline-push-up @ stairs` has none: NHS authorises a bench, and that
authorisation does not extend to a stair. This is the second movement whose
contexts are unevenly evidenced, after `split-squat` before its bench context was
read — and unlike that case, the gap here is not going to close by reading a page
already in the register.

**Applicability caveat.** NHS permits substituting a bench for the tree; it does
not separately re-specify every setup detail for the lower bench position. What
transfers is the movement and the substitution, not a fresh specification of the
setup at bench height.

All three cues are unchanged and stay project content.

### First evidence bearing on a compatibility claim

This artifact's scope is movement construction. `NHS-VID` is the first entry that
also bears on something else: the matrix's claim that an incline push-up can be
performed at a bench. NHS states that the movement may be done with the hands on
a bench, which is a statement about the pairing rather than about the movement.

**Recorded, and deliberately not acted on.** The compatibility matrix is
project content authored from researched conventions, and its authority tier is
a property of how it was authored, not of whether a source happens to agree with
one of its entries. One external agreement does not promote an entry, and reading
it as promotion would be the same laundering the cue findings refuse — support
arriving from material collected for another purpose.

Whether external evidence should ever bear on compatibility authority is a real
question for §8. It is not answered here, and nothing about the matrix changes.

### Counting boundary — a source's sequence is not MoveHere's count

`ACE-LIB` 147 describes the dead bug as alternating: one arm and the opposite leg,
then the other pairing. That reads like counting semantics and is not.

**Two different things sit in that sentence.** The opposite-limb pairing is
**movement identity** — a dead bug in which the same-side arm and leg moved
together would be a different movement. The alternation between pairings is
**sequence**, and how many of them a person does, and whether the prescribed
number means total or per side, is owned by the prescription (§8).

MoveHere's `dead-bug` accepts both `total` and `per-side` counting, so the slot
decides. **ACE's alternation must not be imported as instruction semantics**: an
instruction that described alternating pairings as the way the movement is
performed would hardcode one reading of a number the prescription is entitled to
make either way — the exact defect counting compatibility was built to close.

The same distinction will matter for any movement whose source describes a
sequence, `step-up` and `reverse-lunge` among them.

### Static holds describe an exit the instruction model does not

`ACE-LIB` 32 structures the plank as an upward phase, a hold, and a downward
phase that lowers the body back toward the floor. `ACE-LIB` 101 does the same for
the side plank.

**Four movements expose this, not three.** `plank`, `side-plank`, `dead-hang`,
and `hip-flexor-stretch` — every time-dosed held position in the catalog. The
last was missed when this note was written; its basis is also unverified, so it
carries both problems at once. `march-in-place` is continuous movement rather
than a hold and is unaffected.

The Pass 2A manifest classified both as needing **no `return` step**, on the
grounds that a held position has no repetition to complete. That reasoning still
holds — `return` means *how a repetition completes*, and a timed hold has none —
but the verified sources do describe getting out of the position, and the same
question was already noted for `dead-hang`, where leaving the bar is described
by no step kind at all.

`ACE-LIB` 191 was the page most likely to settle this for `dead-hang`, and it
does not. Its account of reaching the bar is excluded as method, and it describes
no hold and no dismount — the movement it documents ends by extending the arms,
not by letting go.

Recorded, not resolved. The authoring pass should decide deliberately whether a
static hold's exit is an `action` step, an unstated part of the hold, or content
the app does not carry — rather than discovering the question halfway through
writing one.

### Confirmation of the instruction-model premise

The instruction work began from an inspection finding: cues are corrective and
attentional, and eleven of the movements that needed instructions failed on a
missing start position. Glute bridge was among the clearest — its three cues
never say to lie down.

Reading the sources directly confirms that, now against something rather than by
inspection alone.

`ACE-LIB` 49 constructs exactly what the glute-bridge cues do not: lying on the
back, knees bent, feet flat and approximately hip-width apart, toes forward.
`ACE-LIB` 32 does the same for the plank — lying prone, elbows beneath the
shoulders, legs extended, then lifting — where the three cues describe only what
to attend to once the position is held.

`ACE-LIB` 147 makes it three. Its dead bug establishes the raised-limb start —
on the back, knees over the hips at about ninety degrees, arms over the
shoulders — before any limb moves, and MoveHere's three cues all begin after that
position exists.

**Neither set is deficient at its own job**, and the gap between them is the
reason ordered instructions are a separate content type rather than a rewrite of
the cues. Three verified confirmations now, each on a movement whose cues never
say how to reach the floor position they describe.

### Authoring constraints carried by unresolved findings

Collected so the authoring pass reads them as a list rather than re-deriving
them from seven findings. Each is a point where an instruction would otherwise
settle, by phrasing alone, a question nobody has reviewed.

| Movement | Constraint on instruction prose |
|---|---|
| `push-up` | Construct the movement **without settling the elbow path** in either direction. The source's default and its alternative disagree, and MoveHere's cue takes the alternative |
| `step-up` | Construct the movement **without settling which leg drives the ascent**. The source says trailing leg, the cue says top leg |

Both are achievable: in each case the setup, the action and the return are
directly supported independently of the contested point. An instruction that
quietly adopted the source would overrule a cue nobody has revisited; one that
echoed the cue would inherit a choice nobody has reviewed.

### Notes on individual sources

### Applicability note — name mismatches

`NSCA-LUNGE` is directly human-verified primary evidence, and it never says
"split squat". It discusses the lunge family, and the movement MoveHere calls a
split squat appears as its **Completely Stationary** modification: once the
initial position is established, the feet do not move until the repetitions are
finished.

**This is a name mismatch, not a movement mismatch.** Every construction fact
MoveHere needs is directly established — the stance, its width and length, the
upright torso, the raised rear heel, the straight-line hip path, and the return.
What is not established is that any source calls it what MoveHere calls it.

Recorded because the two failure modes look identical from a distance. Citing a
source that describes a different movement would be wrong. Citing a source that
describes the same movement under another name is fine, provided the artifact
says so rather than letting a later reader assume the names matched.

**A second, milder instance.** MoveHere's `single-leg-deadlift` is verified
against `ACE-LIB` 329, which calls the movement a **Single-leg Romanian
Deadlift**. Here the source does name the movement; it names it differently. The
construction facts apply directly and the naming does not, which is the same
distinction as above with less distance to travel.

Two of the ten verified movements are grounded in a source that does not use
MoveHere's name for them. That is not a problem to fix — MoveHere's names are
its own — but it is a fact a reader should not have to rediscover.

### Split squat context coverage — two of two

`split-squat` is the only movement in the catalog requiring a phase override, so
both of its contexts had to be verified before its instruction could be authored.

- **environment-independent** — verified via `NSCA-LUNGE`.
- **`park-bench`** — verified via `ACE-LIB` 366.

**The phase-override case is now fully human-grounded across both supported
contexts.** The default and the override each rest on a directly read source, and
the two agree on the construction facts they share: the split stance, the rear
knee lowering, and a return driven from the front foot.

### Equipment note — what ACE 366 establishes about the bench

ACE directly establishes that its version of this movement uses a bench or box,
and it specifies a height for it.

**It does not establish that an arbitrary park bench suits this movement.** That
is a different claim, about a specific real object, and no source in this
artifact makes it.

So the height specification is excluded, and it may not be converted into any of
the three things it could easily become:

```text
a MoveHere equipment requirement          ✗
a park-bench safety or suitability claim  ✗
a feature-use-check conclusion            ✗
```

The first would import a dimension the product does not measure. The second and
third would be a safety verdict, which §9 refuses and which a feature-use check
is expressly forbidden from stating. The question of whether a given bench suits
a given movement stays open, and belongs to feature-use and suitability review
whenever that happens — not to this artifact and not to instruction authoring.

**The same boundary, from the other direction.** `NHS-VID` explicitly permits a
bench as the hand support for a standing press-up. That is stronger than ACE 366,
which merely uses one — NHS authorises the substitution. It still authorises
nothing about a particular bench.

So the rule generalises, and is worth stating once rather than per source:

> **A source authorising a class of object as a movement context is not a source
> authorising a specific object as suitable for use.**

NHS establishes that a bench can be the support for this movement. Whether *this*
bench, in *this* park, on *this* day, is one a person should put their weight on
is a question no source in this artifact addresses and none is being read to
address. That remains the user's judgment, and MoveHere's copy already says the
product does not assess it (§9).

### Loaded sources for unloaded movements

Several verified pages describe a loaded version of a movement MoveHere performs
unloaded. That is not one problem; it is two, and they need separating.

**Load that only adds resistance.** A barbell across the back in `ACE-LIB` 319,
dumbbells in 366 and 28. Removing it changes how hard the movement is and
changes nothing about how it is constructed: the stance, the path and the return
are described the same way with or without it. Such a source is usable for
movement construction, and the equipment, its placement, and the procedure for
getting into and out of it are all excluded.

**Load that constrains position.** The bar held at three points in `ACE-LIB` 33.
Removing it removes a constraint the source relies on rather than a resistance
it adds, which is why that page has its own note below and why the hip hinge is
flagged for qualified review.

A verified page in the first group is still a loaded source and is recorded as
one. **It must not be represented as an unloaded or bodyweight source**, and the
movement it establishes is the loaded version, described in terms that survive
the load's removal.

### Provenance note — the hip-hinge bar

Recorded separately because the distinction is easy to lose and expensive to
lose.

**What the source establishes:** ACE teaches this version of the hip hinge using
a light bar maintained in contact with the head, the thoracic spine and the
sacrum.

**What the source does not establish:** that the bar is optional, or that its
role is only positional feedback. It says neither.

**Reviewer inference, marked as inference:** the bar's described role *functions*
as positional feedback. That is a reading of the source, not a claim it makes,
and it must never be cited as though the source said it.

**Consequence for MoveHere.** The verified body-position facts — the setup, the
hips travelling backward, the hinge, the slight knee bend, the return — are
independent of the bar and transfer. The bar itself does not: MoveHere's hip
hinge is environment-independent and unloaded, and **the bar must not appear in
its instructions.**

The residual limitation is real and stays open. Strictly, this source describes a
hip hinge *performed with a bar in place*; that the unloaded movement is the
same movement is not something it establishes. The body-position facts are
sufficient to construct the movement, and whether the constraint the bar
supplies needs replacing by something else is a question for qualified review,
not for authoring.

## Domain-model finding — `hanging-knee-raise` was two movements (accepted, implemented)

The matrix holds one exercise cited in two contexts, with `parallel-bars`
carrying the variation label *From a support hold*. The evidence does not
support treating that as a setup difference.

**The two differ in the body's relationship to the structure, not in foot
placement.** On a bar the body is *suspended below the hands*, shoulders
overhead, with no external trunk support. On parallel bars the body is
*supported above the hands* with the elbows extended and the torso upright
(`DIP-KIN`), which is a different position of nearly every joint above the hips.

**The stability demand differs materially.** `MCGILL-AC` records the hanging
straight-leg raise as among the highest abdominal demands measured, attributable
to the unsupported trunk. A supported position provides external stabilisation
the hanging version does not.

**Comparative research treats the supported version as its own exercise.**
`ACE-RES` tested a supported knee raise (captain's chair) as a distinct entry
alongside crunches and planks rather than as a variation of a hanging movement.

**The catalog already noticed.** No other compatibility in the matrix carries a
variation label describing a different relationship to the structure; the others
describe where a limb is placed. `From a support hold` is doing more work than a
label should.

**Consequence, if accepted.** `hanging-knee-raise @ parallel-bars` would become
its own exercise with its own compatibility entry, its own instruction, and its
own visual key — and the phase-override contract would be left with
`split-squat` as its only current case. That does not invalidate the contract:
split squat is a real setup difference and the mechanism is correct for it. It
does mean the second justifying case was a modelling error rather than a setup
variation.

**Accepted and implemented.** `hanging-knee-raise` keeps the pull-up bar;
`supported-knee-raise` takes the parallel bars, replacing the existing
compatibility claim rather than adding to it, and the *From a support hold*
label is gone with it. The general rule that produced this — a context is a
different movement when it changes the body's relationship to the structure
rather than where a limb is placed — is in §8.

The split converts a **context**-evidence gap into a **movement**-evidence gap.
Neither knee raise is better sourced than it was; the accounting is simply
honest now, because the missing evidence never was about a setup.

## Gaps carried by authored instructions

Where shipped instruction prose is silent because the verified basis stopped
there. **These are recorded, not repaired.** Filling them from model knowledge
would produce content whose stated provenance is false (§8), and filling them
from a cue would launder an unestablished cue into sourced content.

Each entry names what a reader does not get, so the silence is a known cost
rather than an oversight discovered later.

**`plank` — the lower support point.** `ACE-LIB` 32 establishes the elbows
beneath the shoulders and the legs extended, and does not state what the lower
body rests on once the body lifts. The instruction therefore says to lift the
body off the floor without naming the second contact point. A reader following
the steps arrives at a plank; the step is thinner than it could be, and closing
it needs a source that states it.

**`glute-bridge` — heel-to-hip distance.** `ACE-LIB` 49 establishes bent knees
and feet flat and hip-width apart, and states no distance between the heels and
the hips. The existing cue *"Heels close to your hips"* says one, and is
unestablished (finding 10), so the instruction is silent on it. This is the most
visible cost of the discipline in the first batch: a conventional fitness writer
would supply the distance without hesitating.

Both gaps close the same way — a primary source that states the fact, read by a
person — and neither closes by writing more carefully.

## Readiness board

Where all 23 shipped movements stand. **Readiness is about evidence, not about
the movement** — a blocked entry is one this artifact cannot support, never a
judgement that the exercise is wrong.

### Ready, directly verified — 12

`bodyweight-squat` · `push-up` · `pull-up` · `plank` · `side-plank` ·
`dead-bug` · `glute-bridge` · `single-leg-deadlift` · `split-squat` (both
contexts) · `step-up` · `reverse-lunge` · `hip-hinge`

The last three carry caveats that do not reduce readiness: `step-up` and
`reverse-lunge` rest on resistance-only loaded sources, and `hip-hinge` rests on
a source that teaches the movement with a bar it never calls optional, which is
separately flagged for qualified review.

### Ready with derived or caveated evidence — 2

| Movement | State |
|---|---|
| `incline-push-up` | `@park-bench` directly supported; `@stairs` composite derived |
| `dead-hang` | Setup derived from the verified pull-up page; **nothing sources the hold**, which is the whole dose |

### Basis unverified — 2

`hip-flexor-stretch` · `march-in-place` — neither blocked nor ready. Each needs a
register row and a first read.

### Deliberately not-required — 2

`brisk-walk` · `easy-run` — decided; the reason text is written at authoring.

### Blocked on missing evidence — 3

`pike-push-up` · `hanging-knee-raise` · `supported-knee-raise` — no institutional
source located. For `supported-knee-raise` the gap is one of identity rather than
of the movement: the project separated the supported form into its own catalog
entry after evidence showed it should not stay conflated with the hanging one,
and no directly applicable institutional instruction source has yet been matched
to that identity. The movement itself is ordinary and widely performed.

### Blocked on a domain decision — 2

`shuttle-run` (distance) · `thoracic-rotation` (starting variant) — both recorded
in §8's unresolved questions. Neither is a reading problem.

### How this moved

| | Ready | Basis for the estimate |
|---|---|---|
| Pass 2A inspection | 18 of 22 | reading the catalog |
| First evidence sweep | 16 of 19 | summariser-mediated sources |
| Now | **14 of 23** | human-read sources |

Every revision moved the same direction, and none was caused by a movement
becoming harder. Each was caused by looking more carefully: the knee-raise split
added a movement and blocked two, the source search failed on pike push-up, dead
hang turned out to have no source for its dose, and the board review found two
movements whose evidence had never been checked at all.

## Counts

Movements and context-specific setups are counted separately, because a
movement can be sufficiently evidenced while one of its contexts is not.

**Movements — 19, following the knee-raise split**

| Status | Count | Movements |
|---|---|---|
| Sufficient (S) | **13** | bodyweight-squat, reverse-lunge, split-squat, step-up, glute-bridge, hip-hinge, single-leg-deadlift, push-up, pull-up, plank, side-plank, dead-bug, hip-flexor-stretch |
| Sufficient with caveat (C) | **3** | incline-push-up (composite), dead-hang (derived), march-in-place (thin) |
| Insufficient (X) | **3** | pike-push-up, hanging-knee-raise, supported-knee-raise |

**Context-specific setups — 2 required, both on one movement**

| Status | Count | Contexts |
|---|---|---|
| Sourced | **2** | `split-squat` @ environment-independent; `split-squat` @ `park-bench` |
| Not sourced | **0** | — |

`split-squat` is the only movement in the catalog needing a phase override, and **both of its contexts are human-verified**.

**Other**

| | Count |
|---|---|
| Admitted sources | 6 |
| Pages directly read by a person | **15** (`ACE-LIB` 28, 32, 33, 41, 49, 101, 135, 147, 191, 319, 329, 366; `NSCA-LUNGE`; `NHS-STR`; `NHS-VID`), 1 read and set aside (`ACE-LIB` 350), **1 unverified** (`ACE-LIB` 142). **The register is not complete** |
| Movements whose basis is still second-hand | **2** — `hip-flexor-stretch`, `march-in-place` |
| Movements derived from verified pages | **1** (`dead-hang`) |
| Contexts derived rather than directly supported | **1** — `incline-push-up` @ `stairs`, the only one |
| Out-of-scope fact categories discarded | 26 |
| Cue findings raised, none actioned | 16 — 13 human-verified, 2 derived, 1 unverified; 2 constraining authoring |
| Domain-model findings raised | 1, accepted and implemented |
| Movements ready to author on this evidence | **16 of 19** |
| Instruction prose, UI, visuals, safety copy | unchanged |
