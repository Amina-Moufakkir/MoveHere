# Working rules for MoveHere

## Source of truth

`docs/product-plan-v4.8.md` is canonical. Read the relevant sections before non-trivial work. The plan overrides inference, convention, and anything in this file. If the plan is silent, ambiguous, or appears wrong, say so and ask — do not resolve it silently in code.

`docs/product-plan-v4.7.md` is retained unchanged as the historical product authority for that version. It is not current. v4.8 supersedes it on **how a workout is executed and what may be recorded about it** (§25): the scalar `done` is replaced by ordered per-movement execution state; **Skip**, **Finish later**, **End workout** and **Restart** are authorized; and an intentionally ended workout with evidence may enter Activity, which §24.6 refused. Everything else in v4.7 carries forward.

`docs/product-plan-v4.6.md` is retained unchanged as the historical product authority for that version. It is not current. v4.7 supersedes it on one capability: what v4.6 classified as **progress and session history — PLANNED** (§23.1) is promoted, renamed and contracted in **§24 as Activity — NEXT-STAGE AUTHORIZED**. v4.6's §22 governing rule, its §23 refusals and every current-stage exclusion carry forward untouched.

`docs/product-plan-v4.5.md` is retained unchanged as the historical product authority for that version. It is not current. v4.6 supersedes it on how the approved design anchor's capabilities are **classified** (§23): progress and session history, multi-environment expansion, and readiness adaptation are **PLANNED**; environment/conditions adaptation is recognised as **CURRENT**; beginner-to-advanced **remains NOT AUTHORIZED**; *"Your Goals. Your Pace."* is **not authorized as written**. v4.5's §22 and its governing rule carry forward untouched.

`docs/product-plan-v4.4.md` is retained unchanged for its version. v4.5 superseded it on one point: authentication and accounts are PLANNED, not FUTURE (§22).

`docs/product-plan-v4.3.md` is retained unchanged as the historical product authority for that version. It is not current: it describes native as the current phase, instructions as unauthored, and exercise visuals as unimplemented, all of which v4.4 corrects.

`docs/design/target-product-experience.md` records the approved target product experience and classifies every capability the north-star design shows or implies. **It governs visual and product-experience direction and authorizes no capability.** Where it and the plan differ, the plan governs.

**Visual artifacts under `docs/design-references/` provide design direction only. They cannot authorize capabilities.** Resolve conflicts in favour of the canonical product plan and the written design authority above; that directory's `README.md` carries the interpretation rules. Two are registered: `movehere-target-landing-page.png` (marketing) and `movehere-operational-north-star-v1.png` (operational — Train, Recap, Activity, and their mobile adaptation). **E2 consults the plan, the written design authority, that README and the operational image, in that order** — the image overrides none of the first three, it is a design board rather than a one-page layout, and anything in it that v4.8 does not authorize is adapted rather than implemented.

MoveHere has two clients over one shared domain (§15): the **web** client (Next.js, released as `web-mvp-v1`) and the **native mobile** client (Expo + React Native, iOS and Android).

The current stage is **Web Product Consolidation** (§21): evolving the existing Next.js client to express the target product experience, over the same shared domain, against the approved design direction. It evolves the released client rather than creating a parallel application.

The **Native Mobile Client** (§20) is **paused at a validated implementation checkpoint** — not complete, and not at parity in either direction. Android is unverified and carried forward. Any stage's completion is an implementation result — not validation, not traction, not evidence of product-market fit.

Phase 0 — Product & Engineering Foundation (§19) is mechanism-complete but **did not close its exit conditions**. Park audits, Gate I, and qualified fitness review of goal programming policy remain open and carry forward. Shipped training content is project content and is labeled as such. Adding a second client resolves none of this.

## Invariants

These are standing product and safety decisions, not preferences. User demand does not authorize overriding them.

1. **`detected ≠ supported ≠ structurally safe`.** Keep the three states distinct in types, data, copy, and UI. Never let a detected or supported object imply a safety verdict MoveHere has not made and cannot make.

2. **The generator consumes only confirmed inventory.** It may use user-confirmed supported venue features and explicitly environment-independent movements — nothing else. Never assume a bench, bar, stairs, or any other structure exists.

3. **One path into generation.** Manual feature selection and any future vision detection must converge on the same `candidate → confirmation → confirmed venue inventory` contract. Vision must never create a separate path into session generation, and must never write confirmed state directly.

4. **Vision is never authoritative venue state.** It proposes candidates only. Favor precision over recall: a missed feature costs options, an invented one creates physical risk.

5. **No medical or injury-aware programming.** Do not infer contraindications, substitute exercises by condition, triage severity, or parse volunteered health free text into generation logic.

6. **Derived features, never raw photos.** Strip EXIF before upload, do not persist raw venue images, and do not expose an attributable home-park relationship.

7. **Registry changes are deliberate.** Adding an object to the supported-feature registry requires the five conditions in §7, not convenience. Class C stays excluded; bleachers stay Class C pending audit evidence.

## Phase boundaries

Out of scope for the current web consolidation stage (§21), on **both** clients:

- Supabase, authentication, accounts, server-side persistence, RLS, and PostGIS. State is local only on both clients. Do not introduce any of these unless the canonical product plan is explicitly revised first. Authentication is **PLANNED** for the full product (§22) — that is a classification, not permission. No provider is chosen, Supabase is not selected by precedent, and §22 authorizes no implementation. **Local session history does not require any of this**: Activity's first stage is local-first and must not be blocked behind the authentication milestone (§24.13). No provider is selected for it either.
- Vision inference and camera capture.
- Location and GPS.
- Home-equipment support, indoor venues, and venue classes beyond parks.
- Notifications, Apple Health and Health Connect, payments, and community features.

Also out of scope *for §21*, because the approved design anchor shows or implies them: **progress tracking, any claim of measured improvement, readiness or "how you feel" input to generation, beginner-to-advanced programming, and scanning.** A capability does not become authorized by appearing in an approved design. **Activity and session history is the exception**: it is no longer merely planned but authorized as the *next* stage (§24), which is still not this one.

Out of scope *for this stage* is not the same as out of the product, and §23–§24 separate them: **Activity and session history is NEXT-STAGE AUTHORIZED (§24)** and still not part of §21; readiness is **PLANNED**; measured improvement and beginner-to-advanced are excluded from the product outright. See the classification summary below before assuming which kind a line is.

**Deployment is not capability.** The consolidated product deploys to Vercel; the frozen `web-mvp-v1` stays live on GitHub Pages and is no longer rebuilt. A hosting platform capable of servers, databases or auth authorizes none of them — the exclusions above continue to govern. Before any §21 application work, the deployment-preservation gate must pass: the existing deploy workflow publishes to GitHub Pages on every push to `main`, so merging an evolved client would overwrite the historical MVP automatically.

A native runtime and a marketing surface make several of these newly *possible* or newly *tempting* rather than newly appropriate. A capability being available is not a reason to use it — each exclusion stays governed by the plan section that made it. Unauthorized capability appears in neither copy nor affordance.

**Planned capability does not authorize a production affordance before its minimum truthful functional implementation exists** (§22, and §23 for every capability it names). Concretely: `Login` does not ship in the header — no placeholder, no disabled control, no reserved gap, no interim `/login` route explaining that accounts don't exist. When `Login` appears, it authenticates. The approved design image shows a `Login` control; that is visual placement for when auth exists, not authority to render one now. Matching the image is not a reason.

`output: 'export'` is an architectural boundary, not a build preference. Authentication planning does not authorize removing it, and Vercel's ability to run a server is not evidence that MoveHere needs one (§22.2).

## Engineering conventions

- Keep deterministic domain logic isolated from UI and testable without React.
- `src/` is shared by both clients and must stay platform-independent: no DOM, no Node, no React Native, no browser or device APIs. `npm run typecheck:domain` enforces this by compiling `src/` against ES2022 only with no `@types`. Platform access belongs behind a port, as `StorageLike` already does.
- Safety-critical copy is shared source, not re-authored per client. Wording governed by §9, §10, and §11 — safety authority, medical scope, substitute-session labeling — lives in shared `src/`, and each client renders the same meaning in its own UI. Two independently written copies of a safety claim can drift, and only one would be reviewed.
- Never use a type assertion (`as`, `as unknown as`) to create a branded trusted domain value such as `ConfirmedVenueInventory`, `ConfirmedFeatureSet`, `GenerationVenueView`, or `SessionMinutes`. Brands stop object literals, update-by-spread, structural clones, and untrusted persisted state; they cannot stop a deliberate assertion. Trusted values come only from their owning constructor or rehydration boundary. The one place an assertion is legitimate is inside that constructor, after validation.
- Do not call `JSON.parse` on persisted venue state outside the rehydration boundary. It returns `any`, which assigns to anything and silently defeats the confirmation guarantee across a reload.
- Generation must be deterministic and reproducible from the same inputs.
- Accessibility constrains architecture from the start on both clients and is not a later pass. **Web** targets WCAG 2.1 AA, or the applicable current standard defined by the canonical plan (§15). **Native mobile** uses the iOS and Android accessibility APIs and platform guidance, carrying the equivalent principles: contrast, meaningful labels, focus and reading order, scalable text, reduced motion, adequate touch targets, screen-reader usability under VoiceOver and TalkBack. Never describe the native client as WCAG conformant — WCAG is written for the web, and inheriting the label because the other client targets it is a conformance claim nobody verified.
- No Prisma.
- Prefer a small, reviewable exercise set over library breadth.

## Language rules

- Never write copy stating or implying that MoveHere has verified a structure is safe.
- Label an adverse-conditions session as a substitute, never as a park session.
- Describe hypotheses as hypotheses. Do not present output from any phase, on either client, as validation, traction, or product-market fit.

## Ask before

- Scaffolding the application or adding dependencies.
- Any change that widens scope beyond the park wedge.
- Any user-facing claim about safety, health, evidence, or validation.
- Editing the canonical product plan.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Capability classification (§23, §24)

Promoting a capability changes what MoveHere intends, never what it may claim. **PLANNED ≠ CURRENT, and NEXT-STAGE AUTHORIZED ≠ shippable vocabulary.** Authorization to build Activity (§24) is not authorization to mention it; the words wait for the implementation.

- **NEXT-STAGE AUTHORIZED, unbuilt:** **Activity** and session history (§24, local-first). Authorized to be built; **not** authorized to be named, linked or advertised anywhere in the product until it works (§24.15). Never call it *Progress* (§24.2).
- **PLANNED, unbuilt:** multi-environment expansion (§23.2) · readiness adaptation (§23.3, §10 review precedes design).
- **CURRENT:** adaptation to confirmed environment and reported conditions (§23.3).
- **NOT AUTHORIZED, and not promoted:** beginner-to-advanced programming (§23.4). Needs a beachhead expansion revising §3/§5 on evidence, a real difficulty/progression model, and qualified review — all three. *Beginner-friendly* is a different, truthful statement and is not a step toward it.
- **Refused outright, not deferred:** "getting stronger", "improving fitness", "performance improvement", improvement trend lines. MoveHere records no load, reps completed or effort.
- **Never call prescribed duration** *total workout minutes* or *minutes trained*. The honest name is **minutes programmed**. Measured elapsed time, if it ever exists, is a distinct metric.
- **"Anywhere"** is not truthful as a capability claim while parks are the only environment class. The brand line *Work out. Anywhere. MoveHere.* stays permitted; feature copy names only what is supported.
- **§15 accessibility overrides literal visual parity** where the generated anchor is non-conformant. `#9BB293` is decorative only (2.29:1); interactive boundaries take `#7E9A75`.

## Session execution (§25) — design authority, NOT implemented

The current code still uses the scalar `done`. §25 is the contract to build against, not a description of what exists.

- **MoveHere records user-reported execution, not observed physical performance** (Invariant 10). `completed` means *the user pressed Done* — never that reps were seen, form was right, or anything improved.
- **`done` conflated position with evidence.** Replaced by ordered per-movement state: `pending | completed | skipped`. **`current` is derived** (first pending), never persisted.
- **Historical results are `completed | skipped | not-reached`.** `pending` never appears in history (Invariant 14). Every movement stays, in order, whatever its result (Invariant 12).
- **`finished` ≠ everything completed.** 5 completed + 2 skipped + 0 not-reached is finished, and must never read as "7 completed" (Invariant 11).
- **Outcome and lifecycle are derived, never stored** — a record with any `not-reached` ended early.
- **End workout ≠ Finish later ≠ Discard ≠ Restart.** End records what happened; Finish later keeps it resumable with no record; Discard destroys it with no record; Restart resets execution on the *same* workout. **Build another** generates a *different* workout — never merge it with Restart.
- **Zero-evidence rule:** ending with nothing completed and nothing skipped writes **no record** (Invariant 13). Generation alone never becomes history.
- **Weekly count becomes "N workouts this week"** — "completed sessions" is false once ended-early records count (§25.18).
- **Compact Monday-aligned week strips**, not a month calendar and not a Day 1/2/3 plan. Future dates must stay visually distinct from unmarked past dates (§25.19).
- **No prominent Delete in the Activity list**; the store capability stays (§25.21).
- **Substitution is not authorized** and the frozen-input guarantee must not be weakened to get it (§25.22).
- **Both migrations rest on proofs** in §25.14/§25.15 — re-verify them before implementing; if a proof fails, withdraw the migration rather than weaken it.
- **`completedAt` is renamed `recordedAt`** in Activity v2 (§25.13) — *the instant the workout became an immutable record*. Not start time, not elapsed time, not observed activity. v1 values migrate unchanged; only the name was wrong.
- **Two stages (§25.25).** **E1** = execution model + both schemas + both migrations + terminal paths + quarantine preservation, with **no broad UI redesign**. **E2** = player controls, Recap/Activity semantics, weekly-count wording, week strips.
- **An Activity implementation is held uncommitted.** Its 5×7 calendar, per-row Delete and "completed sessions this week" are superseded. **Do not cherry-pick its quarantine fix** — carry that behaviour into E1 and keep it tested there.

## Activity rules (§24) — authorized to build, not to speak

The product loop is **Environment → Prepare → Train → Record → Return**. Record closes a session; **Return (Activity) is a persistent destination, not a workflow stage** (§24.1).

- **A completed-session record is an immutable snapshot** — renderable with no call into the generator and no read of current inventory (§24.3). Never re-derive a finished session from mutable state.
- **Venue correction affects future generation authority only.** It never rewrites, reinterprets or annotates a completed record (§24.8).
- **Completion is terminal.** Once `completedAt` is set the session is closed and must not offer completion again (§24.6).
- **No partial-session records in v1** — but an unfinished session must be resumable, never silently replaced, and never presented as completed (§24.6).
- **Records are deletable in whole, behind confirmation; never editable** (§24.7). Derivations recompute from what remains.
- **The local calendar date is frozen at completion.** Week starts **Monday (ISO 8601), fixed**. A marked date means at least one session was recorded complete on that local date — nothing about quality, intensity or effort (§24.9).
- **Streaks stay deferred** (§24.10). The calendar and completed-session counts are the consistency representation.
- **No programmed-minute aggregation in Activity v1** (§24.11). Programmed duration stays visible on an individual record.
- **Activity history validates per record and quarantines bad rows** — a deliberate, documented divergence from the venue boundary's fail-closed rule (§24.12, §24.16). Do not "restore consistency" by making it fail closed.
- **Activity needs no account and selects no provider** (§24.13). It is local-first; `output: 'export'` is untouched.
- **Instructional copy and exercise media are current-reference content, not historical evidence** of what was displayed at completion time (§24.5). The repository has no content/instruction version identifier bound to wording — this was checked, not assumed.
- **`DONE` → `RECAP`** is the authorized direction for the terminal workflow stage; the meter's visual treatment is not settled (§24.14). The meter must derive state from session state, never from the route.

## In-progress session lifecycle (§24.6)

- **At most one unfinished session.** Starting or generating a workout **never destroys an unfinished one without an explicit user decision**. Enforce this in the store/provider, **not** in screens — every screen that builds a session calls the same operation, and the one that forgets the check is the one that ships.
- **Discard destroys the workout and nothing outside it.** Seed, movement index and frozen venue input go; **request, candidates, confirmed inventory and venue corrections stay**.
- **Resume is faithful, not equivalent.** The generation venue input is **frozen into the active session** at creation, so a mid-session confirmation change alters the *next* session and never the running one.
- **Two stores, two lifetimes.** The active-session store holds **unfinished work only**; Activity holds completed immutable history. `completedAt`/`summary` leave the active-session store at the schema boundary — that is what makes re-finishing structurally impossible.
- **Completion creates historical evidence before removing unfinished state**: append the Activity record, *then* clear the session. Never the reverse — clear-first loses the workout on interruption.
- **Deterministic completion identity.** Repeating terminal completion for the same active session resolves to the same record identifier, so it cannot append a duplicate. May be derived from the session seed if that is smallest; **the seed stays machinery, never historical evidence**.
- **`Generate another` is removed from `/workout`** (authorized direction). Building a different session is a preparation decision.
- **Unfinished sessions do not expire.** No age-based cleanup in v1.
- **Landing CTA stays static** (`Start Your Workout`), never session-dependent — the page is prerendered and a client-derived label would visibly flip after hydration.
- **Recap renders from Activity record identity**, addressed by **query parameter** — a dynamic route segment cannot prerender device-only records under `output: 'export'`.
- **Discard** = unfinished work. **Delete** = completed records. **Never `Cancel`** for either.
