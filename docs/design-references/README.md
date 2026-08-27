# MoveHere Design References

This directory contains visual reference artifacts for MoveHere.

These files provide **visual direction**, not product or implementation authority. They exist to communicate intended composition, hierarchy, density, visual language, responsive direction, and overall product character.

## Authority hierarchy

When interpreting a design reference, use the following order of authority:

1. **Canonical product plan** — defines authorized capabilities, domain behavior, lifecycle semantics, invariants, safety boundaries, and current product scope.
2. **`docs/design/target-product-experience.md`** — defines the intended product experience and translates product authority into design direction.
3. **This directory (`docs/design-references/`)** — provides visual references for implementing that direction.
4. **Existing implementation** — provides evidence of current behavior but does not override the authorities above.

If a visual reference conflicts with the canonical product plan or `target-product-experience.md`, the higher authority wins.

## What these references may guide

Visual references may guide decisions such as:

- page composition;
- information hierarchy;
- spacing and density;
- typography scale;
- component proportions;
- visual rhythm;
- use of imagery;
- icon direction;
- interaction prominence;
- responsive composition;
- relationship between primary and secondary actions;
- fitness-product character;
- continuity between the marketing and operational experiences.

Visual parity is not required when it would violate product semantics, accessibility, responsive behavior, or an established design-system rule.

## What these references may not authorize

A visual reference must **never be treated as authority for a capability simply because that capability appears in the image**.

In particular, an image cannot independently authorize:

- authentication or Login;
- accounts;
- server persistence;
- databases or Supabase;
- synchronization;
- workout timing or elapsed-time tracking;
- calories or physiological measurements;
- streaks;
- performance or improvement claims;
- progress claims;
- new workout goals;
- new environments;
- exercise substitutions;
- scheduling or prescribed workout days;
- deletion behavior;
- navigation destinations;
- session lifecycle states;
- analytics;
- any other behavior not authorized by the canonical product plan.

Generated text, numbers, labels, icons, controls, charts, dates, exercise names, prescriptions, and example data inside a reference image are illustrative unless separately supported by product authority.

## Current references

### `movehere-target-landing-page.png`

Visual north star for the MoveHere marketing landing page.

Use it primarily for:

- hero composition;
- brand character;
- marketing-page spacing;
- typography hierarchy;
- image/text relationship;
- feature-strip composition;
- CTA prominence;
- visual continuity.

It does not authorize marketing claims or product capabilities that are not supported by the canonical plan.

### `movehere-operational-north-star-v1.png`

Visual direction for the post-E1 operational MoveHere experience, particularly:

- Train;
- Recap;
- Activity;
- desktop composition;
- mobile adaptation;
- workout-focused information hierarchy;
- execution-state visibility;
- fitness-product identity;
- relationship between current workout, historical recap, and return behavior.

This image is a **design direction, not a literal implementation specification**.

The behavioral meaning of execution states such as `completed`, `skipped`, and `not-reached`, as well as workout lifecycle actions and Activity semantics, comes from the canonical product plan.

Any unsupported detail appearing in the image must be ignored or adapted rather than implemented by assumption.

## Desktop and mobile interpretation

References may show desktop and mobile concepts together for comparison.

They do **not** imply that Train, Recap, and Activity belong on one page.

Each product surface should retain its authorized route and responsibility.

Desktop implementations should use the available viewport appropriately rather than reproducing narrow mobile-card proportions merely because a reference board presents several screens side by side.

Mobile implementations should preserve the same information hierarchy and semantics while adapting composition to the smaller viewport.

## Accessibility

Accessibility requirements override literal visual parity.

A reference must not be copied literally when doing so would compromise:

- text contrast;
- non-text contrast;
- focus visibility;
- keyboard operation;
- touch-target size;
- semantic structure;
- screen-reader meaning;
- reduced-motion expectations;
- responsive usability;
- non-color communication of state.

Where visual fidelity and accessibility conflict, preserve the design intent while meeting the accessibility requirement.

## Working rule

Before implementing something visible in a reference, ask:

> **Is this a visual decision, or is it a product capability?**

If it is visual, the reference may guide the implementation.

If it changes what MoveHere can do, what data it records, what a state means, or what a user is promised, verify that the canonical product plan authorizes it first.

**Design references show how MoveHere should feel.  
The product plan defines what MoveHere is allowed to mean.**
