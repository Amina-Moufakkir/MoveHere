/**
 * MoveHere native spike. Two checks, then this file gets deleted.
 *
 * CHECK 1 — Metro bundles the shared src/ source unchanged.
 *   Every import below is written exactly as the web client writes it,
 *   explicit .ts specifiers included, because the domain tests execute the
 *   source directly under Node's type stripping and that form is required
 *   there. No resolver options, no extension rewriting, no shim.
 *
 * CHECK 2 — synchronous native storage round-trips real MoveHere state through
 *   the existing trusted rehydration boundary.
 *   The point is not that a key-value store works. It is that expo-sqlite's
 *   synchronous API satisfies the StorageLike port as written, so confirmed
 *   venue state is rebuilt by the same constructor on a device as in a
 *   browser — and that a value written is readable in the same tick, with no
 *   await anywhere. A sync-looking API that silently defers would pass a
 *   careless test and fail here.
 *
 * No navigation, no product screens, no design tokens. The view renders check
 * results as plain text because something has to show them.
 */
import { ScrollView, Text, View } from 'react-native';
import Storage from 'expo-sqlite/kv-store';

import { FEATURE_REGISTRY } from '../src/domain/feature-registry.ts';
import {
  confirmInventory,
  makeVenueId,
  projectGenerationView,
  rehydrateInventoryFromJson,
  toPersistable,
} from '../src/domain/confirmation.ts';
import type {
  CandidateFeature,
  ConfirmedVenueInventory,
  FeatureConfirmation,
} from '../src/domain/confirmation.ts';
import { generateFor, MATRIX, PROGRAMMING } from '../src/programming/session-builder.ts';
import { createInventoryStore } from '../src/storage/inventory-store.ts';
import { createSessionStore } from '../src/storage/session-record.ts';
import type { SessionRecord } from '../src/storage/session-record.ts';
import type { StorageLike } from '../src/storage/port.ts';
import { SUBSTITUTE_LABEL } from '../src/presentation/session-copy.ts';
import { NO_SAFETY_ASSESSMENT } from '../src/presentation/safety-copy.ts';
import { byPresentation } from '../src/presentation/feature-copy.ts';

const AT = '2026-01-01T00:00:00.000Z';

interface Check {
  readonly group: 1 | 2;
  readonly name: string;
  readonly ok: boolean;
  readonly detail: string;
}

/**
 * The whole adapter, for real.
 *
 * If this is all it takes, the port did its job: nothing above it changes, and
 * the domain never learns which platform it is on.
 */
const nativeStorage: StorageLike = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => {
    Storage.removeItemSync(key);
  },
};

const buildInventory = (): ConfirmedVenueInventory | null => {
  const venueId = makeVenueId('spike-park');
  if (venueId === null) return null;
  const candidates: readonly CandidateFeature[] = [
    { featureId: 'park-bench', source: { kind: 'manual-selection' }, observedAt: AT },
    { featureId: 'pull-up-bar', source: { kind: 'manual-selection' }, observedAt: AT },
  ];
  const confirmations: readonly FeatureConfirmation[] = candidates.map((c) => ({
    featureId: c.featureId,
    decision: 'present',
    decidedAt: AT,
    candidateSource: c.source,
  }));
  return confirmInventory({ venueId, candidates, confirmations, at: AT }).inventory;
};

const run = (): readonly Check[] => {
  const out: Check[] = [];
  const add = (group: 1 | 2, name: string, ok: boolean, detail: string) =>
    out.push({ group, name, ok, detail });

  /* ---------------- CHECK 1 — shared source bundles and runs -------------- */

  add(
    1,
    'registry loaded',
    FEATURE_REGISTRY.supported.length > 0 && FEATURE_REGISTRY.excluded.length > 0,
    `${FEATURE_REGISTRY.supported.length} supported / ${FEATURE_REGISTRY.excluded.length} excluded`,
  );
  add(
    1,
    'content loaded and feasible',
    MATRIX !== null && PROGRAMMING !== null,
    MATRIX === null ? 'matrix failed to load' : `matrix v${MATRIX.version}, ${MATRIX.exercises.length} exercises`,
  );

  const inventory = buildInventory();
  if (inventory === null) {
    add(1, 'confirmation', false, 'venue id constructor refused a non-empty id');
    return out;
  }
  add(1, 'confirmation produced trusted inventory', inventory.features.length === 2, `${inventory.features.length} confirmed`);

  const view = projectGenerationView(inventory);
  const session = generateFor({ inventory, minutes: 30, goal: 'strength', conditions: 'acceptable', seed: 'spike-seed' });
  add(
    1,
    'deterministic generation runs',
    session !== null && session.kind !== 'not-generated',
    session === null ? 'generator returned null' : `${session.kind} · snapshot ${view.snapshotId}`,
  );

  const again = generateFor({ inventory, minutes: 30, goal: 'strength', conditions: 'acceptable', seed: 'spike-seed' });
  const same = JSON.stringify(session) === JSON.stringify(again);
  add(1, 'generation is reproducible', same, same ? 'identical output' : 'DIVERGED');

  add(
    1,
    'shared presentation and copy resolve',
    SUBSTITUTE_LABEL.length > 0 && NO_SAFETY_ASSESSMENT.length > 0,
    `first by presentation: ${[...FEATURE_REGISTRY.supported.map((f) => f.id)].sort(byPresentation)[0]}`,
  );

  /* ---------------- CHECK 2 — native synchronous storage ------------------ */

  // Bare port behaviour first. No awaits: if the API defers, this fails.
  const probeKey = 'movehere:spike:probe';
  nativeStorage.setItem(probeKey, 'written-then-read-same-tick');
  const echoed = nativeStorage.getItem(probeKey);
  add(2, 'write is readable in the same tick', echoed === 'written-then-read-same-tick', echoed === null ? 'got null — API is NOT synchronous' : `got "${echoed}"`);

  nativeStorage.removeItem(probeKey);
  const afterRemove = nativeStorage.getItem(probeKey);
  add(2, 'remove takes effect synchronously', afterRemove === null, afterRemove === null ? 'key gone' : `still "${afterRemove}"`);

  add(2, 'missing key reads as null, not undefined', nativeStorage.getItem('movehere:spike:absent') === null, 'null');

  // Now the thing that actually matters: real venue state through the real
  // store and the real rehydration boundary.
  const store = createInventoryStore(nativeStorage);
  store.write(inventory.venueId, toPersistable(inventory));
  const persisted = store.read(inventory.venueId);
  add(2, 'inventory persisted through the port', persisted !== null, persisted === null ? 'read back null' : `${persisted.length} bytes`);

  const rehydrated = persisted === null ? null : rehydrateInventoryFromJson(persisted);
  const rehydratedOk = rehydrated !== null && rehydrated.ok;
  add(
    2,
    'rehydration boundary rebuilt trusted state',
    rehydratedOk && rehydrated.inventory.features.length === 2,
    rehydrated === null ? 'nothing to rehydrate' : rehydrated.ok ? `${rehydrated.inventory.features.length} features, revision ${rehydrated.inventory.revision}` : `failed: ${rehydrated.failure.kind}`,
  );

  // Same feature set must generate the same session after a storage round-trip.
  if (rehydrated !== null && rehydrated.ok) {
    const fromStorage = generateFor({ inventory: rehydrated.inventory, minutes: 30, goal: 'strength', conditions: 'acceptable', seed: 'spike-seed' });
    const survived = JSON.stringify(fromStorage) === JSON.stringify(session);
    add(2, 'session survives the round-trip identically', survived, survived ? 'same session as before persisting' : 'DIVERGED after storage');
  }

  // Fail closed on the device exactly as on the web.
  store.write(inventory.venueId, '{"schemaVersion":1,"features":[{"featureId":"tree"}]}');
  const junkText = store.read(inventory.venueId);
  const junk = junkText === null ? null : rehydrateInventoryFromJson(junkText);
  add(2, 'corrupt stored state fails closed', junk !== null && !junk.ok, junk === null ? 'no read' : junk.ok ? 'ACCEPTED BAD STATE' : `rejected: ${junk.failure.kind}`);
  store.clear(inventory.venueId);

  // The second store, on the same port.
  const sessions = createSessionStore(nativeStorage);
  const record: SessionRecord = {
    seed: 'spike-seed',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    done: 2,
    completedAt: null,
    summary: null,
  };
  sessions.write(record);
  const readBack = sessions.read();
  add(
    2,
    'session record round-trips and validates',
    readBack !== null && readBack.seed === 'spike-seed' && readBack.done === 2,
    readBack === null ? 'read back null' : `seed ${readBack.seed}, done ${readBack.done}/${readBack.minutes}min`,
  );
  sessions.clear();
  add(2, 'session clear takes effect', sessions.read() === null, 'cleared');

  return out;
};

let results: readonly Check[] = [];
let crashed: string | null = null;
try {
  results = run();
} catch (error) {
  crashed = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

const group = (n: 1 | 2) => results.filter((c) => c.group === n);
const verdict = (n: 1 | 2) => {
  const g = group(n);
  return crashed !== null ? 'CRASH' : g.length > 0 && g.every((c) => c.ok) ? 'PASS' : 'FAIL';
};

// Also to the Metro console, so the result is readable without a screenshot.
console.log(`[SPIKE] check1=${verdict(1)} check2=${verdict(2)}`);
for (const c of results) console.log(`[SPIKE] ${c.ok ? 'ok  ' : 'FAIL'} (${c.group}) ${c.name} — ${c.detail}`);
if (crashed !== null) console.log(`[SPIKE] CRASHED: ${crashed}`);

export default function App() {
  return (
    <ScrollView contentContainerStyle={{ padding: 14, paddingTop: 58, gap: 8 }}>
      {crashed !== null && <Text style={{ fontSize: 10, color: '#b00' }}>CRASHED: {crashed}</Text>}
      {([1, 2] as const).map((n) => (
        <View key={n} style={{ gap: 2 }}>
          <Text style={{ fontSize: 13, fontWeight: '700' }}>
            Check {n}: {verdict(n)} · {n === 1 ? 'Metro imports shared src/' : 'native sync storage'}
          </Text>
          {group(n).map((c) => (
            <Text key={c.name} style={{ fontSize: 9, lineHeight: 12 }}>
              {c.ok ? '[ok] ' : '[FAIL] '}
              {c.name} — <Text style={{ color: '#555' }}>{c.detail}</Text>
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
