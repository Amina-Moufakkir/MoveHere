/**
 * Whether a movement may fill a policy slot, and how it is dosed when it does (§8).
 *
 * One definition, imported by both the feasibility proof and the generator.
 * They had a copy each, character-identical, and that is how the counting
 * defect survived: a proof and a mechanism can only bind each other while they
 * are asking the same question. Two copies of a rule are two rules that happen
 * to agree today.
 *
 * A slot carries an ordered set of prescription variants. Eligibility is
 * existential — a movement qualifies when *some* variant fits it — and the
 * variant it receives is the first one it is compatible with, because variant
 * order is authored policy precedence.
 *
 * This file decides eligibility and reads authored dosing. It never decides
 * what a slot prescribes: counting, dose, and estimated time stay authored
 * together in policy, so nothing here constructs or rewrites a prescription.
 */

import type { Exercise, Prescription } from './exercise.ts';
import type { PrescriptionVariant, SlotTemplate } from './policy.ts';

/**
 * Whether the prescribed count is meaningful for this movement.
 *
 * A distance prescription carries no count, so it constrains nothing.
 *
 * Deliberately not derived from laterality. Laterality says whether a movement
 * works one side at a time; counting says how a prescribed number is read.
 * Gait is where the two come apart — walking alternates legs and is counted
 * total, because "walk two minutes per side" is not a thing a person can do.
 */
const acceptsCounting = (exercise: Exercise, prescription: Prescription): boolean =>
  !('counting' in prescription) || exercise.countingModes.includes(prescription.counting);

/**
 * Whether one dosing suits one movement.
 *
 * Prescribing reps for a hold is not a near miss, and neither is prescribing a
 * per-side count for a movement that has no sides.
 */
export const variantFits = (exercise: Exercise, variant: PrescriptionVariant): boolean =>
  exercise.prescriptionKinds.includes(variant.prescription.kind) &&
  acceptsCounting(exercise, variant.prescription);

/**
 * The dosing this movement receives in this slot, or null when none fits.
 *
 * **First compatible variant wins.** The order is authored precedence: where a
 * movement accepts more than one dosing, policy decides which it gets, not the
 * generator and not a second random draw.
 */
export const variantFor = (
  exercise: Exercise,
  slot: SlotTemplate,
): PrescriptionVariant | null => {
  if (!slot.eligiblePatterns.includes(exercise.pattern)) return null;
  return slot.variants.find((variant) => variantFits(exercise, variant)) ?? null;
};

/** Eligibility is existential over the slot's variants. */
export const canFill = (exercise: Exercise, slot: SlotTemplate): boolean =>
  variantFor(exercise, slot) !== null;

/**
 * Eligible on pattern and dose alone, ignoring counting.
 *
 * Used only to attribute a narrowing to its cause: an exercise this admits and
 * `canFill` rejects was excluded by counting and nothing else.
 */
export const canFillIgnoringCounting = (exercise: Exercise, slot: SlotTemplate): boolean =>
  slot.eligiblePatterns.includes(exercise.pattern) &&
  slot.variants.some((variant) => exercise.prescriptionKinds.includes(variant.prescription.kind));

/**
 * The variants some movement in `pool` can actually be given.
 *
 * Feasibility bounds a slot's duration from the variants that can really be
 * selected, so a dead variant cannot inflate an upper bound or deflate a fill
 * ratio with time no session will ever spend.
 */
export const selectableVariants = (
  slot: SlotTemplate,
  pool: readonly Exercise[],
): readonly PrescriptionVariant[] => {
  const selectable = slot.variants.filter((variant) =>
    pool.some((exercise) => variantFor(exercise, slot) === variant),
  );
  // No movement in this pool can fill the slot at all. Satisfiability errors
  // report that; for time, fall back to the authored set rather than zero, so
  // an unfillable slot never looks free.
  return selectable.length > 0 ? selectable : slot.variants;
};
