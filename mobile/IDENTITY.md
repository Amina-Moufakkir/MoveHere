# Native application identity

These values identify the MoveHere iOS application and the on-device data that
belongs to it. **They are stable. Changing any of them is a migration decision,
not a configuration edit.**

| | Value |
|---|---|
| Expo slug | `movehere` |
| iOS bundle identifier | `dev.movehere.app` |
| Deep-link scheme | `movehere` |

## Why this is recorded rather than left in app.json

Both values look like naming. They are not.

**The bundle identifier is the app's identity to iOS.** It determines the data
container, the keychain access group, and which installed app an update
replaces. Changing it does not rename an app — it produces a different app, and
the original's local data becomes unreachable.

**The slug scopes local storage in Expo Go.** This already happened once during
development: the spike ran under `movehere-spike`, and renaming the slug to
`movehere` moved the client to a new scoped container, orphaning everything the
spike had written. That was harmless — the data was two test keys — and it is
the same mechanism that would silently strand a real user's confirmed venue
inventory.

Phase 0 state is local only (§14). There is no server copy, so local data is
the only copy.

## What a change would require

Before either value changes:

1. A stated reason. "Tidier" is not one.
2. A migration path for existing confirmed venue inventory and session state,
   or an explicit decision that losing it is acceptable and why.
3. An account of what a user sees. Silently starting from an empty park is a
   confirmation the user never withdrew, which is precisely what
   `candidate → confirmation → confirmed inventory` exists to prevent.

Storage keys carry the same weight for the same reason: `movehere:inventory:*`
and `movehere:session` are written by shared source and read on both clients.
