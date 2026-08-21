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
import type { SessionGenerationOutput } from '@/src/domain/session.ts';
import type { VenueCorrection } from '@/src/domain/confirmation.ts';
import { applyCorrection } from '@/src/domain/confirmation.ts';
import { saveInventory as persistInventory } from '@/lib/venue-store';
import { clearSession, readSession, writeSession } from '@/lib/session-store';
import type { SessionRecord, SessionSummary } from '@/lib/session-store';
import { generateFor } from '@/lib/programming';

/** What the user reports about conditions. `unknown` maps to unavailable (§6.5). */
export type ReportedConditions = 'acceptable' | 'adverse' | 'unknown';

export interface SessionRequest {
  readonly minutes: SessionDuration;
  readonly goal: SessionGoal;
  readonly conditions: ReportedConditions;
}

interface VenueState {
  readonly session: SessionRecord | null;
  readonly workout: SessionGenerationOutput | null;
  /** Starts a session with a fresh seed. Regeneration is always deliberate. */
  readonly startSession: (seed: string) => void;
  readonly setDone: (done: number) => void;
  readonly completeSession: (at: string, summary: SessionSummary) => void;
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
  const [session, setSession] = useState<SessionRecord | null>(null);

  // Rehydrate once on mount. Anything untrusted resolves to no venue.
  useEffect(() => {
    const outcome = loadInventory();
    setLoadOutcome(outcome);
    if (outcome.kind === 'loaded') setInventory(outcome.inventory);

    const stored = readSession();
    if (stored !== null) {
      setSession(stored);
      setRequestState({
        minutes: stored.minutes,
        goal: stored.goal,
        conditions: stored.conditions,
      });
    }
  }, []);

  /**
   * The workout is derived, never stored.
   *
   * Same seed and same confirmed inventory regenerate the same session, so a
   * reload cannot silently hand back a different workout — and a correction
   * changes the next one, because the inventory it derives from changed.
   */
  const workout = useMemo<SessionGenerationOutput | null>(() => {
    if (session === null) return null;
    return generateFor({
      inventory,
      minutes: session.minutes,
      goal: session.goal,
      conditions: session.conditions,
      seed: session.seed,
    });
  }, [session, inventory]);

  const startSession = useCallback(
    (seed: string) => {
      const record: SessionRecord = {
        seed,
        minutes: request.minutes,
        goal: request.goal,
        conditions: request.conditions,
        done: 0,
        completedAt: null,
        summary: null,
      };
      writeSession(record);
      setSession(record);
    },
    [request],
  );

  const setDone = useCallback((done: number) => {
    setSession((prev) => {
      if (prev === null) return prev;
      const next = { ...prev, done };
      writeSession(next);
      return next;
    });
  }, []);

  const completeSession = useCallback((at: string, summary: SessionSummary) => {
    setSession((prev) => {
      if (prev === null) return prev;
      // Snapshot what the session was, so a later correction cannot rewrite it.
      const next = { ...prev, completedAt: at, summary };
      writeSession(next);
      return next;
    });
  }, []);

  const endSession = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const correct = useCallback((correction: VenueCorrection) => {
    setInventory((prev) => {
      if (prev === null) return prev;
      const next = applyCorrection(prev, correction);
      persistInventory(next);
      return next;
    });
  }, []);

  const proposeCandidates = useCallback((ids: readonly SupportedFeatureId[]) => {
    setCandidates(candidatesFrom(ids, new Date().toISOString()));
  }, []);

  const confirm = useCallback(
    (decisions: ReadonlyMap<SupportedFeatureId, ConfirmationDecision>) => {
      const { inventory: next, ignored } = commitConfirmations(
        candidates,
        decisions,
        new Date().toISOString(),
      );
      saveInventory(next);
      setInventory(next);
      setLoadOutcome({ kind: 'loaded', inventory: next });
      return ignored;
    },
    [candidates],
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
      startSession, setDone, completeSession, endSession, correct,
    }),
    [
      candidates, inventory, loadOutcome, request, session, workout,
      proposeCandidates, confirm, setRequest, forget,
      startSession, setDone, completeSession, endSession, correct,
    ],
  );

  return <VenueContext.Provider value={value}>{children}</VenueContext.Provider>;
}

export function useVenue(): VenueState {
  const ctx = useContext(VenueContext);
  if (ctx === null) throw new Error('useVenue must be used inside VenueProvider');
  return ctx;
}

