# Working rules for MoveHere

## Source of truth

`docs/product-plan-v4.3.md` is canonical. Read the relevant sections before non-trivial work. The plan overrides inference, convention, and anything in this file. If the plan is silent, ambiguous, or appears wrong, say so and ask — do not resolve it silently in code.

MoveHere is in **Phase 0 — Product & Engineering Foundation** (§19). Phase 0 is not the MVP.

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

Do not introduce Supabase, authentication, server-side persistence, RLS, or PostGIS during Phase 0 or Phase 1 unless the canonical product plan is explicitly revised first. Phase 0 state is local only.

Vision inference, indoor venues, and venue classes beyond parks are likewise out of scope for Phase 0.

## Engineering conventions

- Keep deterministic domain logic isolated from UI and testable without React.
- Generation must be deterministic and reproducible from the same inputs.
- Accessibility is a design and engineering constraint from Phase 0 and an implementation requirement from Phase 1. Do not make Phase 0 architecture decisions that make accessible implementation harder later. Phase 1 UI must target WCAG 2.1 AA or the applicable current standard defined by the canonical plan (§15).
- No Prisma.
- Prefer a small, reviewable exercise set over library breadth.

## Language rules

- Never write copy stating or implying that MoveHere has verified a structure is safe.
- Label an adverse-conditions session as a substitute, never as a park session.
- Describe hypotheses as hypotheses. Do not present Phase 0 output as validation, traction, or product-market fit.

## Ask before

- Scaffolding the application or adding dependencies.
- Any change that widens scope beyond the park wedge.
- Any user-facing claim about safety, health, evidence, or validation.
- Editing the canonical product plan.
