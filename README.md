# MoveHere

Park-first, venue-aware workout generation.

MoveHere builds a structured inventory of user-confirmed features in a nearby park and generates a workout that uses only what is actually there.

## Status

**Phase 0 — Product & Engineering Foundation.** Phase 0 is not the MVP. There is no application code in this repository yet.

MoveHere is currently an exploratory product and engineering project. The core problem, target user, competitive differentiation, and venue-aware value proposition are product hypotheses and have not yet been validated through user interviews.

Development intentionally proceeds before formal customer discovery in order to prototype and evaluate the technical and product mechanisms — venue representation, feature confirmation, exercise compatibility, and deterministic session generation. Before any commercial launch or claim of product-market fit, the planned research must be completed: target-user interviews, physical park audits, competitive testing, Wizard-of-Oz sessions, and behavioral validation.

The absence of that research is never evidence that the hypotheses hold. Documentation should distinguish validated evidence, engineering decisions, and unvalidated hypotheses throughout.

*MoveHere is a working name. Availability and trademark clearance are not complete.*

## The hypothesis

> Can understanding the physical environment around a user remove enough workout-planning friction to help them exercise more consistently?

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

Conventional fitness products start with a workout and ask whether you can perform it. MoveHere starts with the environment and asks what it supports.

## What MoveHere is not

- **Not a universal workout generator.** Park-first, and only potentially venue-capable beyond that.
- **Not injury-aware or medically aware.** It does not adapt sessions to pain, injury, or medical conditions, and makes no claim about what is safe for a condition.
- **Not a safety authority.** Detecting an object, supporting it for exercise, and verifying it is structurally safe are three different things. MoveHere never guarantees the third.
- **Not validated.** See Status above.

## Current state

No application code. The intended direction is Next.js App Router, TypeScript, and Tailwind CSS, with deterministic domain logic kept separate from the UI and accessibility treated as a build-time requirement rather than a later pass.

This is direction, not commitment. Nothing here has been scaffolded, and stack choices remain open until the domain model justifies them.

## Repository layout

```text
docs/product-plan-v4.3.md   canonical product plan
CLAUDE.md                   working rules for agents and contributors
```

## Documentation

[`docs/product-plan-v4.3.md`](docs/product-plan-v4.3.md) is the canonical product plan and the source of truth for scope, the supported-feature registry, safety boundaries, phase definitions, and evidence gates.

This README is a summary. Where it and the plan disagree, the plan wins.
