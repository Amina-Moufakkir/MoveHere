/**
 * Runtime verification of the duration factories.
 *
 * Fixed-set membership and positivity are runtime rules, not type rules: both
 * factories accept `number` precisely so unvalidated input has somewhere to be
 * rejected. The type system cannot check them, so this suite does.
 *
 * Run with Node's native type stripping. No test-runner dependency.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  SESSION_DURATIONS,
  makeSessionMinutes,
  makeEstimatedMinutes,
} from '../../src/domain/session.ts';

test('the fixed duration set matches the canonical plan', () => {
  assert.deepEqual([...SESSION_DURATIONS], [10, 20, 30, 45]);
});

test('every duration in the fixed set is accepted', () => {
  for (const value of SESSION_DURATIONS) {
    assert.equal(makeSessionMinutes(value), value);
  }
});

test('durations outside the fixed set are rejected', () => {
  for (const value of [0, 5, 15, 25, 31, 44, 46, 60, 90, -10, 10.5, NaN, Infinity]) {
    assert.equal(makeSessionMinutes(value), null, `${value} must be rejected`);
  }
});

test('estimates accept any positive whole number, including values off the fixed set', () => {
  for (const value of [1, 7, 27, 44, 120]) {
    assert.equal(makeEstimatedMinutes(value), value);
  }
});

test('estimates reject zero, negative, fractional, and non-finite values', () => {
  for (const value of [0, -1, -27, 12.5, NaN, Infinity, -Infinity]) {
    assert.equal(makeEstimatedMinutes(value), null, `${value} must be rejected`);
  }
});
