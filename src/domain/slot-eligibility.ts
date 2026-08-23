/**
 * Whether a movement may fill a policy slot (§8).
 *
 * One definition, imported by both the feasibility proof and the generator.
 * They had a copy each, character-identical, and that is how the counting
 * defect survived: a proof and a mechanism can only bind each other while they
 * are asking the same question. Two copies of a rule are two rules that happen
 * to agree today.
 *
 * Three conditions, all facts about the movement rather than judgments about
 * it. Whether the pattern matches, whether the movement can be dosed the way
 * the policy prescribes, and whether the count the policy prescribes means
 * anything for this movement.
 *
 * This file decides eligibility. It never decides what a slot prescribes:
 * counting, dose, and estimated time stay authored together in policy (§8), so
 * nothing here rewrites a prescription to make it fit.
 */

import type { Exercise, Prescription } from './exercise.ts';
import type { SlotTemplate } from './policy.ts';

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
 * Prescribing reps for a hold is not a near miss, and neither is prescribing a
 * per-side count for a movement that has no sides.
 */
export const canFill = (exercise: Exercise, slot: SlotTemplate): boolean =>
  slot.eligiblePatterns.includes(exercise.pattern) &&
  exercise.prescriptionKinds.includes(slot.prescription.kind) &&
  acceptsCounting(exercise, slot.prescription);

/**
 * Eligible on pattern and dose alone, ignoring counting.
 *
 * Used only to attribute a narrowing to its cause: an exercise this admits and
 * `canFill` rejects was excluded by counting and nothing else.
 */
export const canFillIgnoringCounting = (exercise: Exercise, slot: SlotTemplate): boolean =>
  slot.eligiblePatterns.includes(exercise.pattern) &&
  exercise.prescriptionKinds.includes(slot.prescription.kind);
