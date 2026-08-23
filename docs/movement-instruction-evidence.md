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

## Standing limitation on every citation here

**All page content reached this document through an automated summariser.** The
fetch mechanism available to this project runs a small model over a page and
returns its answer; it does not return raw source text. Every entry below is
therefore **second-hand by construction**, and none of it is verified
primary-source evidence.

One entry — the push-up elbow path — was re-fetched with an extraction-only
prompt requesting verbatim text rather than description. That is the strongest
form available here and is still model-mediated. It is marked accordingly.

**Before any of this becomes authored content, a person should read the cited
pages directly.** That is a cheap step and it is the only thing that converts
these entries from second-hand to verified.

## Admitted sources

| Ref | Source | Publisher type | Authority | Applicability | Retrieved |
|---|---|---|---|---|---|
| `ACE-LIB` | ACE Exercise Library, individual movement pages | Professional certifying body | Practitioner guidance, not primary research | High for movement description; many pages are loaded or equipment-based and the loading does not transfer | 2026-08-23 |
| `ACE-RES` | ACE-commissioned exercise comparison research (Univ. of Wisconsin–La Crosse) | Commissioned study, trade publication | Comparative, not a technique description | Used **only** for exercise-identity evidence, not for technique | 2026-08-23 |
| `NSCA-LUNGE` | NSCA, *The Undervalued Lunge*, PTQ 4.4 | Professional certifying body, practitioner journal | Practitioner guidance | Lunge family only | 2026-08-23 |
| `MCGILL-AC` | *Muscle activity and spine load during anterior chain whole body linkage exercises* (PubMed 25111163) | Peer-reviewed | Primary research | Used **only** for exercise-identity evidence | 2026-08-23 |
| `DIP-KIN` | *Bench, Bar, and Ring Dips: Do Kinematics and Muscle Activity Differ?* (PMC9603242) | Peer-reviewed | Primary research | Describes the supported position on parallel bars; not a knee-raise description | 2026-08-23 |
| `NHS-STR` | NHS *Strength exercises* | National health service | Public health guidance | **Low.** Chair-supported, older-adult programming. Used only for the elevated-hands press principle | 2026-08-23 |

## Per-movement basis

Status key — **S** sufficient · **C** sufficient with stated caveat · **X** insufficient, do not author.

| Movement | Basis ref | Status | Descriptive facts supported | Uncertain / not supported |
|---|---|---|---|---|
| `bodyweight-squat` | `ACE-LIB` 135 | S | Stance width and foot direction; hips shift back then down, hip and knee flexing together; return by extending hips and knees | Descent endpoint described by natural limits only — **not** a target and must not be restated as one |
| `reverse-lunge` | `ACE-LIB` 319 | S | Step backward with one leg; rear knee lowers toward the floor; chest stays raised; return by pressing the front foot and swinging the rear leg forward | Page is barbell-loaded; loading discarded |
| `split-squat` @ EI | `NSCA-LUNGE`; `ACE-LIB` 366 (beginner note) | S | Split stance longer than a walking stride; rear heel raised; hips travel down and up; torso upright | Stance length is relative, never absolute |
| `split-squat` @ `park-bench` | `ACE-LIB` 366 | S | Rear foot placed behind on a bench; rear knee lowers toward the floor; return by pressing the front foot and the top of the rear foot | Bench height **discarded** as an equipment dimension |
| `step-up` | `ACE-LIB` 28 | S | Stand facing the platform; whole lead foot placed on it, torso upright; push off the trailing leg; step down under control | Page is dumbbell-loaded. **No step height may be carried across** |
| `glute-bridge` | `ACE-LIB` 49 | S | Supine, knees bent, feet flat and hip-width; hips press up; lower under control | Heel-to-hip distance not specified by the source |
| `hip-hinge` | `ACE-LIB` 33 | S | Feet shoulder-width; weight to the heels, hips travel backward, torso ends between vertical and parallel, minimal knee bend; return by driving the hips forward | Source uses a bar held along the spine as feedback — a teaching device, not the movement. MoveHere's is unloaded |
| `single-leg-deadlift` | `ACE-LIB` 329 / 350 | S | Stand on one leg, supporting knee slightly bent; hips push back as the free leg straightens behind; return by pressing the standing foot down and lowering the free leg | Descent depth described as comfort-limited, not a target |
| `push-up` | `ACE-LIB` 41 | S | Hands about shoulder-width, shoulders over hands, rigid torso; lower toward the floor; press back to full extension | Elbow path — see cue finding 1 |
| `incline-push-up` | `ACE-LIB` 41 + `NHS-STR` | C | Hands on the raised surface, feet back, body in one line; lower the chest toward the hands; press back | **Composite, not directly sourced.** No single source describes this movement |
| `pike-push-up` | — | **X** | none | **No institutional source located.** Every search returned suspension-trainer or stability-ball pike variants, which are different exercises using equipment the matrix does not cite |
| `dead-hang` | `ACE-LIB` 191 (start position) | C | Reach the bar overhead, palms facing away, full grip, shoulders drawn down and back, feet clear of the ground | **Derived** from the pull-up start position; no dedicated source. MoveHere's cue *"Shoulders active, not shrugged"* has no direct positional source |
| `pull-up` | `ACE-LIB` 191 | S | Stand under the bar, reach overhead with palms away, take a full grip; pull by driving the elbows down toward the sides; lower to a full hang | — |
| `plank` | `ACE-LIB` 32 | S | Face down; elbows directly under the shoulders, palms down; straight line from head to heels | Mat is incidental to the position |
| `side-plank` | `ACE-LIB` 101 | S | Lie on one side, legs extended, feet stacked; supporting elbow directly under the shoulder; lift hips and knees clear | **`ACE-LIB` 303 is a BOSU exercise and is the wrong page for this movement.** 101 is the floor version |
| `dead-bug` | `ACE-LIB` 147 | S | Supine start; limbs raised so knees are over the hips and elbows over the shoulders; one hand and the opposite heel move together, then return; reciprocal | Framing differs from MoveHere's cue — see cue finding 3 |
| `hanging-knee-raise` | thin secondary only | **X** | Knees raise toward the chest and lower again — the action only | **No institutional page.** Setup and hang position unsupported |
| `supported-knee-raise` | `DIP-KIN` (position only) | **X** | Bodyweight supported through the upper limbs on parallel bars, elbows extended | **No source describes a support-hold knee raise at all.** Its structural metadata and cues are new project content |
| `march-in-place` | `NHS-STR` family | C | Alternating hip and knee flexion while remaining on the spot | Thin. Knee height described relatively, never as a target |
| `hip-flexor-stretch` | `ACE-LIB` 142 | S | Half-kneeling, one foot forward and the opposite knee down; pelvis tucked, spine neutral; lean into the front hip without letting the pelvis rotate forward | Hold durations and repetition counts **discarded** |

Not researched, by instruction: `brisk-walk` and `easy-run` (decided `not-required`);
`thoracic-rotation` and `shuttle-run` (blocked on §8 domain questions).

## Out-of-scope facts collected and discarded

Recorded so the omissions are auditable rather than invisible. None of these
reaches the catalog, and none may be reintroduced during authoring.

| Discarded | Where it appeared |
|---|---|
| Hold durations and repetition counts | `ACE-LIB` 142 hip-flexor stretch |
| Equipment dimensions (bench/box height) | `ACE-LIB` 366 Bulgarian split squat |
| Minimum joint angles at the bottom of a lunge | `NSCA-LUNGE` |
| Muscles worked, agonists, activation percentages | `ACE-LIB` throughout, `MCGILL-AC` |
| Benefits, difficulty ratings, progression and regression | `ACE-LIB` throughout |
| Breathing prescriptions (inhale/exhale phase cueing) | `ACE-LIB` throughout |
| Counting and side-switching phrasing | `ACE-LIB` 28 step-up, 142 hip-flexor stretch |
| Depth and range targets | `ACE-LIB` 135 squat |

The last two matter most. Counting phrasing is forbidden in MoveHere
instruction text by §8 and is caught by the loader; range targets are a
programming judgment this project has not made.

## Cue findings — findings only

The cues are existing project content and remain independently auditable.
**Nothing here was changed, and none of it may be silently corrected while
authoring instructions.** These belong to a cue audit.

**1 · `push-up` — elbow path. Substantive.**
MoveHere cues *"Elbows back, not flared."* `ACE-LIB` 41 states as its default:
"Allow your elbows to flare outwards during the lowering phase." It then offers
an alternative in which the hands are turned to face forwards and the elbows
stay close to the sides.

So MoveHere is not contradicting the source outright — it states as its only
instruction what the source presents as an *alternative*, and pairs it with the
hand position the source associates with the default. The result is a composite
no single source describes. **This is the only finding retrieved by verbatim
extraction rather than description, and it still warrants a direct read of the
page before anyone acts on it.**

**2 · `bodyweight-squat` — stance width. Minor.**
MoveHere: *"Feet about shoulder width."* `ACE-LIB` 135: slightly wider than
hip-width. `NHS-STR`: hip-width. Three sources, three widths. No conflict of
movement identity; MoveHere's is the widest claim and is unsourced.

**3 · `dead-bug` — framing, not conflict. Minor.**
MoveHere: *"Extend opposite arm and leg."* `ACE-LIB` 147 describes the opposite
hand and heel *lowering toward the floor* from a knees-over-hips start. The same
motion, described from opposite ends. Authoring must not adopt one framing as
though it had settled the other.

**4 · `brisk-walk` — unsourced physiological claim. Carried forward.**
*"Breathe through your nose if you can."* Out of scope for this pass — the
movement is `not-required` — and still open as a cue finding.

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

`split-squat` is now the only movement in the catalog needing a phase override.

**Other**

| | Count |
|---|---|
| Admitted sources | 6 |
| Entries that are second-hand by construction | **all** |
| Entries retrieved by verbatim extraction | 1 (push-up elbow path) |
| Out-of-scope fact categories discarded | 8 |
| Cue findings raised, none actioned | 4 |
| Domain-model findings raised | 1, accepted and implemented |
| Movements ready to author on this evidence | **16 of 19** |
| Instruction prose, UI, visuals, safety copy | unchanged |
