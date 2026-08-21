# Native client spike — results

**Date:** 2026-08-21
**Phase:** Native Mobile Client (product plan §20)
**Status:** Both checks passed. Decisions below are settled by measurement, not expectation.

Two architectural unknowns stood between the shared-source refactor and any real
mobile work. Both were assumptions. This records what happened when they were
tested, so the decisions that follow can be reviewed against evidence rather
than re-argued.

The spike itself is disposable and is deleted when Expo Router scaffolding
begins. This note is what survives it.

---

## Environment

| | |
|---|---|
| Machine | Apple Silicon (M1), macOS 26.5.2, 8 GB RAM |
| Xcode | 26.6 (build 17F113) |
| iOS runtime | 26.5 |
| Device | iPhone 17 Pro simulator |
| Host runtime | Expo Go (not a custom dev build) |
| Expo SDK | 57 |
| React Native | 0.86.2 |
| React | 19.2.3 (mobile) / 19.2.8 (web) |
| Node | 22.23.1 |

The React versions differ between clients and that is not a problem here,
because the shared source imports React on neither. It would become one the day
shared code contains a component.

---

## Check 1 — Metro imports the shared `src/` source unchanged

**Result: pass.** 754 modules bundled, no resolver customisation.

Every relative import in this repository carries an explicit `.ts` specifier,
because the domain tests execute the source directly under Node's type
stripping, which requires that form. Had Metro rejected it, the test harness and
the mobile bundler would have wanted incompatible things, and one of them would
have had to give.

The entire Metro configuration beyond `getDefaultConfig` is one line:

```js
config.watchFolders = [repoRoot];
```

No custom resolver, no `sourceExts` change, no `nodeModulesPaths`, no
`disableHierarchicalLookup`, no extension rewriting, no re-export shim.

It is this cheap because `src/` has no external dependencies. Nothing resolves
across the project boundary, so Metro only has to read files — which is also why
the usual monorepo failure modes, duplicate React and hoisting conflicts, never
arise.

Two negative tests were run, because a check that cannot fail proves nothing:

- A nonexistent `.ts` path fails with `Unable to resolve module`. The check is real.
- **Dropping the extension entirely also bundles.** Metro is indifferent to the
  specifiers rather than merely tolerating them, so the repository keeps the
  extensions Node requires and is not locked into them either.

The bundle artifact was inspected rather than trusted: the registry's
confirmation prompts, the Class C exclusion reasons, the substitute-session
label, the safety disclaimers, and all 22 exercise names from the catalog are
present in the shipped bytecode.

---

## Check 2 — synchronous native storage through the trusted rehydration boundary

**Result: pass.** All nine storage assertions green on the device.

`expo-sqlite/kv-store` exposes `getItemSync`, `setItemSync`, and
`removeItemSync`. They satisfy `StorageLike` as written. The whole adapter:

```ts
const nativeStorage: StorageLike = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => { Storage.removeItemSync(key); },
};
```

It typechecks with no cast. Only `removeItemSync` differs from the port, returning
`boolean` where `StorageLike` declares `void`, which TypeScript accepts.

Nothing above the port changed. `createInventoryStore` and `createSessionStore`
are the same shared modules the web client runs.

The assertions that carried weight:

- **A value written is readable in the same tick**, with no `await` anywhere.
  This is the one that could have failed quietly: an API that looked
  synchronous but deferred would have returned `null` here. It returned the value.
- **A session generated from rehydrated state is identical to the one generated
  before persisting.** Determinism survives a native storage round-trip.
- **Trusted state was rebuilt by the constructor, not fabricated** — the
  rehydrated inventory came back with its two confirmed features and revision 1,
  through `rehydrateInventoryFromJson`.

### Corrupt state still fails closed

Recorded separately because it is a safety invariant, not a storage detail.

A persisted `{"schemaVersion":1,"features":[{"featureId":"tree"}]}` — a Class C
object, deliberately excluded from the registry (§7) — was **rejected as
`malformed`** on the device, exactly as in a browser. It did not become confirmed
venue inventory.

This is the behaviour that matters most across a platform change. The
confirmation guarantee is only as strong as its weakest rehydration path, and a
second client is a second path. On the evidence here it is the *same* path: one
boundary, one implementation, one result.

---

## Decision consequences

### 1. Keep the repository flat — root + `mobile/`

Confirmed. No workspace tooling, no Turborepo, no `apps/` restructure, and the
released web application stays at the repository root.

The reasoning was that a shared package with no dependencies and no build step
earns nothing from workspace machinery. The spike measured the cost of the
alternative: one line of Metro config. Restructuring would have rewritten every
import in a frozen release to avoid that line.

Revisit if a third consumer appears, if shared code acquires real dependencies,
or if the domain needs to be versioned or published.

### 2. Use `expo-sqlite/kv-store`, synchronous API

Confirmed. Not for performance — for architectural preservation.

`StorageLike` is synchronous, and so are the rehydration boundary and every
caller above it. An asynchronous store would not have been a swap; it would have
reshaped the code that turns untrusted persisted state into trusted venue
state, which is the one place that should change least. The synchronous API
removed that question entirely.

`AsyncStorage` is not adopted. If a future requirement forces it, the cost is
the boundary rewrite this decision avoided, and that should be weighed
explicitly rather than absorbed.

### 3. No shared-domain changes were required

The strongest result, and the one worth stating plainly: **`src/` needed no
modification to run natively.** Not a shim, not a conditional, not a platform
branch, not a single edit.

The properties that made this true — no external dependencies, no platform APIs,
no React — were established for other reasons: determinism, testability, and the
confirmation guarantee. `npm run typecheck:domain` now enforces them, and the
shared domain typechecks clean under three type environments: DOM, none, and
React Native.

---

## Known boundary

The spike ran in **Expo Go**, which bundles `expo-sqlite`, so no native build
was needed. That will not hold once the app requires a native module outside
Expo Go's bundled set — at that point `npx expo run:ios` and a generated `ios/`
directory become necessary. Nothing in the parity scope (§20) requires it.

---

## What this is not

Parity is not yet implemented; this spike renders no product UI and no
navigation. Passing these checks says the shared architecture holds on a device.
It says nothing about whether the sessions are good training, whether anyone
wants the product, or whether any Phase 0 exit condition has been met — those
remain open exactly as §19 records them.
