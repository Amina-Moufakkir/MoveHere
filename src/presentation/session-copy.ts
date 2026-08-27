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
 *
 * **Each line describes the workout, not the venue as it stands now.** A
 * session is generated from inputs fixed when it was built, and the venue can
 * differ from those inputs by the time anyone reads this. Copy that infers a
 * reason from current venue state will eventually assert something false about
 * a park the reader can see: production found exactly that, where a session
 * built with no venue input announced "No park is confirmed yet" to a user
 * whose park was confirmed. Describing the workout is always true, because the
 * workout is the thing in front of them.
 */
export const SUBSTITUTE_REASON: Record<SubstituteReason['kind'], string> = {
  'conditions-adverse': 'You said it’s bad outside, so this is a no-equipment session.',
  'conditions-unavailable': 'Conditions weren’t known, so this is a no-equipment session.',
  'no-confirmed-inventory': 'This workout uses no park features, so it’s a no-equipment session.',
  'no-compatible-venue-movements':
    'Your park couldn’t fill this session, so this is a no-equipment one.',
};
