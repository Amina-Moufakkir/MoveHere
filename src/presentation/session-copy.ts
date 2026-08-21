/**
 * Copy that carries §11's substitute-session requirement.
 *
 * Shared by both clients, because the requirement is that a substitute is
 * always labeled a substitute and never presented as a park session — and a
 * requirement enforced in one client and re-typed in the other is enforced in
 * neither. Each client renders these strings in its own UI; neither owns the
 * wording.
 *
 * Written with real characters, never HTML entities. An entity inside a
 * JavaScript string is not markup: React escapes it and the user reads the
 * entity instead of the punctuation.
 */

import type { SubstituteReason } from '../domain/session.ts';

/** The label. A substitute session says so, in both clients, in these words. */
export const SUBSTITUTE_LABEL = 'Substitute session';

/**
 * Why this is a substitute rather than a park session (§11).
 *
 * Keyed by SubstituteReason['kind'] rather than by string, so adding a reason
 * to the domain is a compile error here instead of a substitute session that
 * announces itself with no explanation underneath.
 */
export const SUBSTITUTE_REASON: Record<SubstituteReason['kind'], string> = {
  'conditions-adverse': 'You said it’s bad outside, so this is a no-equipment session.',
  'conditions-unavailable': 'Conditions weren’t known, so this is a no-equipment session.',
  'no-confirmed-inventory': 'No park is confirmed yet, so this is a no-equipment session.',
  'no-compatible-venue-movements':
    'Your park couldn’t fill this session, so this is a no-equipment one.',
};
