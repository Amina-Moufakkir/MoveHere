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
import type { ConditionsAssessment } from '@/src/domain/session.ts';

/** What the user reports about conditions. `unknown` maps to unavailable (§6.5). */
export type ReportedConditions = 'acceptable' | 'adverse' | 'unknown';

export interface SessionRequest {
  readonly minutes: SessionDuration;
  readonly goal: SessionGoal;
  readonly conditions: ReportedConditions;
}

interface VenueState {
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

  // Rehydrate once on mount. Anything untrusted resolves to no venue.
  useEffect(() => {
    const outcome = loadInventory();
    setLoadOutcome(outcome);
    if (outcome.kind === 'loaded') setInventory(outcome.inventory);
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
    () => ({ candidates, inventory, loadOutcome, request, proposeCandidates, confirm, setRequest, forget }),
    [candidates, inventory, loadOutcome, request, proposeCandidates, confirm, setRequest, forget],
  );

  return <VenueContext.Provider value={value}>{children}</VenueContext.Provider>;
}

export function useVenue(): VenueState {
  const ctx = useContext(VenueContext);
  if (ctx === null) throw new Error('useVenue must be used inside VenueProvider');
  return ctx;
}

/**
 * The user's report becomes the assessment the gate consumes (§6 step 5).
 *
 * "Bad out there" records exactly what was said and no more — the UI never asks
 * why, so it must not claim rain, ice, heat or darkness. "Not sure" is
 * unavailable, which withholds the park for a different, distinguishable
 * reason.
 */
export const assessmentFor = (reported: ReportedConditions): ConditionsAssessment =>
  reported === 'acceptable'
    ? { kind: 'acceptable' }
    : reported === 'adverse'
      ? { kind: 'adverse', cause: { kind: 'user-reported' } }
      : { kind: 'unavailable' };
