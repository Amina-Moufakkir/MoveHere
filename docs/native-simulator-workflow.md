# Running MoveHere on the iOS Simulator

Verified 2026-08-23 on the environment recorded in `native-client-spike.md`
(Apple Silicon, Xcode 26.6, iOS 26.5 runtime, iPhone 17 Pro, Expo Go, SDK 57,
React Native 0.86.2).

Everything here was run, not assumed. Where something did not work, that is
recorded too, because the failures cost more time than the successes.

## Start Metro

```bash
cd mobile && npm run ios      # expo start --ios
```

Metro prints the LAN URL it is serving, e.g. `exp://192.168.1.207:8081`. **Note
that host** — the launch commands below need it.

## Boot the Simulator and launch the app

```bash
xcrun simctl boot <device-udid>     # e.g. iPhone 17 Pro; skip if already booted
open -a Simulator
xcrun simctl list devices | grep Booted
```

The simulator device shuts down between sessions. `open -a Simulator` starts the
app but does not necessarily boot a device, so check for `Booted` before going
further.

Launch, or navigate to a route:

```bash
xcrun simctl openurl booted "exp://192.168.1.207:8081/--/workout"
```

**The `movehere://` scheme does not work in Expo Go.** The custom scheme in
`app.json` only resolves in a dev build or a standalone app; under Expo Go the
`exp://…/--/<route>` form is the one that navigates.

For a cold start — required whenever persisted state was changed outside the
app:

```bash
xcrun simctl terminate booted host.exp.Exponent
sleep 3
xcrun simctl openurl booted "exp://192.168.1.207:8081/--/workout"
```

## Screenshots

```bash
xcrun simctl io booted screenshot /tmp/shot.png
```

Works without any additional tooling or permissions.

## Limitation: no automated input

**Nothing on this machine can tap, swipe, or scroll the Simulator
programmatically.** Verified:

| Path | State |
|---|---|
| `xcrun simctl` | no tap/touch/input verb exists |
| `osascript` + System Events | blocked — `osascript is not allowed assistive access` |
| `idb`, `cliclick` | not installed |

So **any interaction must be driven manually in the Simulator window.** Capturing
is automatable; driving is not. Plan screenshot work around that rather than
discovering it mid-task.

## Recovery: touch input stops responding

Symptom: manual scrolling or tapping does nothing, **even though** the app is
running current code and programmatic scrolling works.

**Fully quit the Simulator application and restart it, before changing any
MoveHere code.**

This was verified: after the workout player's `ScrollView` layout bug was fixed
and confirmed — programmatic `scrollTo` moved the view and clamped correctly at
the content end — manual touch scrolling still failed. Quitting and restarting
the Simulator restored it with no code change. **It was Simulator input state,
not an application defect.**

## Distinguish input failure from application failure

Before editing scroll code, discriminate. The probes escalate from native UIKit,
through React Native, to our source:

| Settings.app | Expo Go launcher | MoveHere | Reading |
|---|---|---|---|
| fails | — | — | Simulator input. Restart the Simulator; change nothing |
| works | fails | fails | React Native / Expo runtime, not our code |
| works | works | all screens fail | RN scroll handling as configured — investigate globally |
| works | works | one screen fails | genuinely screen-specific — now debug that screen |

The Expo Go launcher probe matters: it is itself a React Native surface, so
without it "Settings works, MoveHere fails" leaves the runtime and our code
indistinguishable.

**A real layout defect and an input failure look identical from the outside** —
both present as "the content below the fold is unreachable." The workout player
had one of each, consecutively, and the second was mistaken for a relapse of the
first.

## Checking whether the device is running current code

`mtime` is not evidence. **Metro dedupes by content hash**, so `touch` on a
source file produces no rebuild and an unchanged Metro log proves nothing.

```bash
# what Metro would serve right now
curl -s "http://localhost:8081/node_modules/expo-router/entry.bundle?platform=ios&dev=true" \
  -o /tmp/bundle.js && grep -c "<a string only in the current source>" /tmp/bundle.js

# is a device actually connected?
curl -s http://localhost:8081/json/list
```

A full cold bundle logs its module count (`iOS Bundled … (1483 modules)`); an
incremental Fast Refresh push logs `(1 module)`. That distinction tells you
which one the device received.

## Development-only technique: seeding a session

**This is a screenshot and development technique. It is not a way to verify a
user flow.** It bypasses the confirmation and setup screens entirely, so it
proves nothing about how a user reaches a state — only about how that state
renders. Any claim about flow behaviour has to come from driving the real path.

Session state persists through `expo-sqlite/kv-store`:

```bash
C=$(xcrun simctl get_app_container booted host.exp.Exponent data)
DB=$(find "$C/Documents" -path "*movehere-*/SQLite/ExpoSQLiteStorage")
sqlite3 "$DB" "select key from storage;"     # movehere:inventory:*, movehere:session
```

A `movehere:session` row must satisfy `parseSessionRecord` in
`src/storage/session-record.ts` — schema version, a non-empty seed, a supported
duration and goal, a valid reported-conditions value, and an integer `done`.
Writing one and cold-starting lands the app on a chosen movement without tapping
through. Setting `done` selects which movement is shown.

## Temporary instrumentation

Scripted scrolling for mid-scroll captures needs a `ref` and `scrollTo`; the
`contentOffset` prop is silently ignored on React Native 0.86.

**Any such instrumentation must be removed before the work is committed.** It is
capture scaffolding, never product behaviour, and it changes what the running app
does — an auto-scrolling screen is indistinguishable from a broken one. Grep for
it before committing:

```bash
grep -rn "SHOT_OFFSET\|shotRef\|contentOffset" mobile/ src/ --include="*.ts" --include="*.tsx"
```
