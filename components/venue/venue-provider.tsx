'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  candidatesFrom,
  clearInventory,
  commitConfirmations,
  loadInventory,
  saveInventory,
} from '@/lib/venue-store';
import type { LoadOutcome } from '@/lib/venue-store';
import type {
  CandidateFeature,
  ConfirmationDecision,
  ConfirmedVenueInventory,
  IgnoredConfirmation,
} from '@/src/domain/confirmation.ts';
import type { SupportedFeatureId } from '@/src/domain/feature.ts';
import type { SessionGoal, SessionDuration } from '@/src/domain/session.ts';
import type { ReportedConditions } from '@/src/programming/conditions.ts';
import type { SessionGenerationOutput } from '@/src/domain/session.ts';
import type { VenueCorrection } from '@/src/domain/confirmation.ts';
import { applyCorrection } from '@/src/domain/confirmation.ts';
import { clearSession, readSession, writeSession } from '@/lib/session-store';
import type { ActiveSessionRecord } from '@/lib/session-store';
import { activityStore } from '@/lib/activity-store';
import type { ActivityRecord } from '@/lib/activity-store';
import { recordIdFor } from '@/src/storage/activity-record.ts';
import { buildActivityRecord } from '@/src/domain/activity-snapshot.ts';
import { decideBegin, decideStartup } from '@/src/domain/session-lifecycle.ts';
import { projectGenerationView } from '@/src/domain/confirmation.ts';
import { generateFromView } from '@/src/programming/session-builder.ts';
import { makeSeed, makeSessionId } from '@/src/programming/seed.ts';

export interface SessionRequest {
  readonly minutes: SessionDuration;
  readonly goal: SessionGoal;
  readonly conditions: ReportedConditions;
}

/**
 * What a request to begin a session did.
 *
 * `refused` is not an error. It is the one-active-session invariant (§24.6,
 * Invariant 7) reporting that unfinished work exists, so the caller must offer
 * the user a choice rather than act on an assumption. There is deliberately no
 * `force` flag: a boolean escape hatch would make destruction a parameter
 * instead of a decision, and the call site that forgets to pass it correctly is
 * the one that ships.
 */
export type BeginOutcome = { readonly kind: 'begun' } | { readonly kind: 'refused' };

interface VenueState {
  readonly session: ActiveSessionRecord | null;
  readonly workout: SessionGenerationOutput | null;
  /**
   * Begins a session, refusing when unfinished work exists.
   *
   * Enforced here rather than in a screen: every screen that builds a session
   * calls this, and a rule enforced at call sites is a rule the next call site
   * will miss (§24.6).
   */
  readonly beginSession: () => BeginOutcome;
  /** Destroys the unfinished workout and begins another. Explicit by name. */
  readonly discardAndBegin: () => void;
  /** Destroys the unfinished workout and nothing outside it (Invariant 8). */
  readonly discardSession: () => void;
  readonly setDone: (done: number) => void;
  /**
   * Terminal completion: append the record, then clear the session.
   *
   * One operation, not two writes composed at a call site, and idempotent by
   * record identity (§24.6, Invariant 9).
   */
  readonly finishSession: (at: string, localDate: string) => ActivityRecord | null;
  readonly endSession: () => void;
  /** Corrections go through applyCorrection. Nothing here mutates inventory. */
  readonly correct: (correction: VenueCorrection) => void;
  /** Candidates are ephemeral by design — only confirmation produces durable state. */
  readonly candidates: readonly CandidateFeature[];
  readonly inventory: ConfirmedVenueInventory | null;
  readonly loadOutcome: LoadOutcome | null;
  readonly request: SessionRequest;
  readonly proposeCandidates: (ids: readonly SupportedFeatureId[]) => void;
  readonly confirm: (
    decisions: ReadonlyMap<SupportedFeatureId, ConfirmationDecision>,
  ) => readonly IgnoredConfirmation[];
  readonly setRequest: (next: Partial<SessionRequest>) => void;
  readonly forget: () => void;
}

const VenueContext = createContext<VenueState | null>(null);

const DEFAULT_REQUEST: SessionRequest = {
  minutes: 30,
  goal: 'strength',
  conditions: 'acceptable',
};

export function VenueProvider({ children }: { readonly children: ReactNode }) {
  const [candidates, setCandidates] = useState<readonly CandidateFeature[]>([]);
  const [inventory, setInventory] = useState<ConfirmedVenueInventory | null>(null);
  const [loadOutcome, setLoadOutcome] = useState<LoadOutcome | null>(null);
  const [request, setRequestState] = useState<SessionRequest>(DEFAULT_REQUEST);
  const [session, setSession] = useState<ActiveSessionRecord | null>(null);

  // Rehydrate once on mount. Anything untrusted resolves to no venue.
  useEffect(() => {
    const outcome = loadInventory();
    setLoadOutcome(outcome);
    if (outcome.kind === 'loaded') setInventory(outcome.inventory);

    const stored = readSession();
    if (stored !== null) {
      /* Recovery for the append-before-clear window (§24.6).
         If a record already exists for this session's identity, completion
         already happened and only the clear was interrupted. Reconciling here
         means the user is never offered a finished session to finish again, and
         the deterministic identity means no duplicate can be appended. */
      const decision = decideStartup(stored, activityStore().has(recordIdFor(stored.sessionId)));
      if (decision.kind === 'reconcile') {
        clearSession();
      } else {
        setSession(stored);
        setRequestState({
          minutes: stored.minutes,
          goal: stored.goal,
          conditions: stored.conditions,
        });
      }
    }
  }, []);

  /**
   * The workout is derived, never stored — from inputs frozen at creation.
   *
   * The venue view is part of the session record rather than read live, so
   * resume returns the same workout rather than an equivalent one (§24.6).
   * Confirming or correcting a feature changes what the *next* session is built
   * from and cannot reach this one. `inventory` is deliberately absent from the
   * dependency list: if it appeared, a correction would re-derive a running
   * session's remaining movements underneath a position counter that does not
   * move, which is the defect this freezing exists to remove.
   */
  const workout = useMemo<SessionGenerationOutput | null>(() => {
    if (session === null) return null;
    return generateFromView({
      view: session.frozenView,
      minutes: session.minutes,
      goal: session.goal,
      conditions: session.conditions,
      seed: session.seed,
    });
  }, [session]);

  /** Mints a record and freezes the venue view it will be generated from. */
  const createRecord = useCallback((): ActiveSessionRecord => {
    const now = Date.now();
    return {
      sessionId: makeSessionId(now),
      seed: makeSeed(now),
      minutes: request.minutes,
      goal: request.goal,
      conditions: request.conditions,
      done: 0,
      /* Frozen here, once. Everything this session is generated from is now
         immutable for its lifetime. */
      frozenView: inventory === null ? null : projectGenerationView(inventory),
    };
  }, [request, inventory]);

  const beginSession = useCallback((): BeginOutcome => {
    /* The invariant is checked against persisted state, not React state: a
       second tab, a restored session, or a render that has not caught up must
       not be able to slip a replacement past it. */
    const existing = readSession();
    if (decideBegin(existing).kind === 'refused') {
      /* Surface the session we refused over, so the caller's next render shows
         the resume choice. A refusal the user cannot see is the invisible
         redirect this replaced. */
      setSession(existing);
      return { kind: 'refused' };
    }
    const record = createRecord();
    writeSession(record);
    setSession(record);
    return { kind: 'begun' };
  }, [createRecord]);

  const discardSession = useCallback(() => {
    /* Destroys the workout and nothing outside it (Invariant 8). Request,
       candidates, confirmed inventory and corrections are all untouched — they
       belong to the user and the park, not to this attempt. */
    clearSession();
    setSession(null);
  }, []);

  const discardAndBegin = useCallback(() => {
    const record = createRecord();
    writeSession(record);
    setSession(record);
  }, [createRecord]);

  const setDone = useCallback((done: number) => {
    /* The write happens here, not inside the state updater. An updater may be
       invoked more than once, and persistence is not a pure function. */
    setSession((prev) => {
      if (prev === null) return prev;
      const next = { ...prev, done };
      writeSession(next);
      return next;
    });
  }, []);

  const finishSession = useCallback(
    (at: string, localDate: string): ActivityRecord | null => {
      const current = readSession();
      if (current === null || workout === null) return null;

      const record = buildActivityRecord(current, workout, { at, localDate });
      if (record === null) return null;

      /* Append first, clear second (§24.6, Invariant 9). Interrupted after the
         append, a record exists and the lingering session is reconciled on next
         load. Interrupted the other way round, the workout is simply lost. */
      activityStore().append(record);
      clearSession();
      setSession(null);
      return record;
    },
    [workout],
  );

  const endSession = discardSession;

  const correct = useCallback((correction: VenueCorrection) => {
    setInventory((prev) => {
      if (prev === null) return prev;
      const next = applyCorrection(prev, correction);
      saveInventory(next);
      return next;
    });
  }, []);

  const proposeCandidates = useCallback((ids: readonly SupportedFeatureId[]) => {
    setCandidates(candidatesFrom(ids, new Date().toISOString()));
  }, []);

  const confirm = useCallback(
    (decisions: ReadonlyMap<SupportedFeatureId, ConfirmationDecision>) => {
      const at = new Date().toISOString();
      const { inventory: committed, ignored } = commitConfirmations(candidates, decisions, at);

      /* Re-confirmation rebuilds inventory from decisions, and every confirmed
         feature enters as usable. A feature the user had already reported
         unusable would silently become usable again — a correction erased by
         revisiting a screen. Reported-unusable is recorded authority too, so it
         is carried across rather than restated, using the same correction
         operation that produced it. Nothing is invented: only corrections that
         already existed for features that are still confirmed are reapplied. */
      const previouslyUnusable = (inventory?.features ?? []).filter(
        (f) => f.usability.kind === 'reported-unusable',
      );
      const next = previouslyUnusable.reduce(
        (acc, f) =>
          acc.features.some((c) => c.featureId === f.featureId)
            ? applyCorrection(acc, {
                kind: 'feature-unusable',
                featureId: f.featureId,
                occurredAt: at,
              })
            : acc,
        committed,
      );

      saveInventory(next);
      setInventory(next);
      setLoadOutcome({ kind: 'loaded', inventory: next });
      return ignored;
    },
    [candidates, inventory],
  );

  const setRequest = useCallback((next: Partial<SessionRequest>) => {
    setRequestState((prev) => ({ ...prev, ...next }));
  }, []);

  const forget = useCallback(() => {
    clearInventory();
    setInventory(null);
    setCandidates([]);
    setLoadOutcome({ kind: 'none' });
  }, []);

  const value = useMemo<VenueState>(
    () => ({
      candidates, inventory, loadOutcome, request, session, workout,
      proposeCandidates, confirm, setRequest, forget,
      beginSession, discardAndBegin, discardSession, setDone, finishSession, endSession, correct,
    }),
    [
      candidates, inventory, loadOutcome, request, session, workout,
      proposeCandidates, confirm, setRequest, forget,
      beginSession, discardAndBegin, discardSession, setDone, finishSession, endSession, correct,
    ],
  );

  return <VenueContext.Provider value={value}>{children}</VenueContext.Provider>;
}

export function useVenue(): VenueState {
  const ctx = useContext(VenueContext);
  if (ctx === null) throw new Error('useVenue must be used inside VenueProvider');
  return ctx;
}

