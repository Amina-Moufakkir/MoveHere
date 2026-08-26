# Working rules for MoveHere

## Source of truth

`docs/product-plan-v4.6.md` is canonical. Read the relevant sections before non-trivial work. The plan overrides inference, convention, and anything in this file. If the plan is silent, ambiguous, or appears wrong, say so and ask — do not resolve it silently in code.

`docs/product-plan-v4.5.md` is retained unchanged as the historical product authority for that version. It is not current. v4.6 supersedes it on how the approved design anchor's capabilities are **classified** (§23): progress and session history, multi-environment expansion, and readiness adaptation are **PLANNED**; environment/conditions adaptation is recognised as **CURRENT**; beginner-to-advanced **remains NOT AUTHORIZED**; *"Your Goals. Your Pace."* is **not authorized as written**. v4.5's §22 and its governing rule carry forward untouched.

`docs/product-plan-v4.4.md` is retained unchanged for its version. v4.5 superseded it on one point: authentication and accounts are PLANNED, not FUTURE (§22).

`docs/product-plan-v4.3.md` is retained unchanged as the historical product authority for that version. It is not current: it describes native as the current phase, instructions as unauthored, and exercise visuals as unimplemented, all of which v4.4 corrects.

`docs/design/target-product-experience.md` records the approved target product experience and classifies every capability the north-star design shows or implies. **It governs visual and product-experience direction and authorizes no capability.** Where it and the plan differ, the plan governs.

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

- Supabase, authentication, accounts, server-side persistence, RLS, and PostGIS. State is local only on both clients. Do not introduce any of these unless the canonical product plan is explicitly revised first. Authentication is **PLANNED** for the full product (§22) — that is a classification, not permission. No provider is chosen, Supabase is not selected by precedent, and §22 authorizes no implementation. **Local session history does not require any of this**: progress's first stage is local-first and must not be blocked behind the authentication milestone (§23.1).
- Vision inference and camera capture.
- Location and GPS.
- Home-equipment support, indoor venues, and venue classes beyond parks.
- Notifications, Apple Health and Health Connect, payments, and community features.

Also out of scope, because the approved design anchor shows or implies them: **progress tracking, session history, any claim of measured improvement, readiness or "how you feel" input to generation, beginner-to-advanced programming, and scanning.** A capability does not become authorized by appearing in an approved design.

Out of scope *for this stage* is not the same as out of the product, and §23 now separates them: progress, session history and readiness are **PLANNED** and still excluded here; measured improvement and beginner-to-advanced are excluded from the product outright. See the §23 summary below before assuming which kind a line is.

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

## Capability classification (§23)

Promoting a capability to PLANNED changes what MoveHere intends, never what it may claim. **PLANNED ≠ CURRENT.** v4.6 brings the design anchor's feature copy no closer to shipping than v4.5 did — visual parity with the anchor is available now; parity with its claims is not.

- **PLANNED, unbuilt:** progress and session history (§23.1, local-first) · multi-environment expansion (§23.2) · readiness adaptation (§23.3, §10 review precedes design).
- **CURRENT:** adaptation to confirmed environment and reported conditions (§23.3).
- **NOT AUTHORIZED, and not promoted:** beginner-to-advanced programming (§23.4). Needs a beachhead expansion revising §3/§5 on evidence, a real difficulty/progression model, and qualified review — all three. *Beginner-friendly* is a different, truthful statement and is not a step toward it.
- **Refused outright, not deferred:** "getting stronger", "improving fitness", "performance improvement", improvement trend lines. MoveHere records no load, reps completed or effort.
- **Never call prescribed duration** *total workout minutes* or *minutes trained*. The honest name is **minutes programmed**. Measured elapsed time, if it ever exists, is a distinct metric.
- **"Anywhere"** is not truthful as a capability claim while parks are the only environment class. The brand line *Work out. Anywhere. MoveHere.* stays permitted; feature copy names only what is supported.
- **§15 accessibility overrides literal visual parity** where the generated anchor is non-conformant. `#9BB293` is decorative only (2.29:1); interactive boundaries take `#7E9A75`.
