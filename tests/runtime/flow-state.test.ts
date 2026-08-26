/**
 * What the workflow meter is allowed to claim.
 *
 * Both failures below shipped. A cold deep link into training announced three
 * completed stages with no session in existence, and a live session part way
 * through was reported as not started — which also stranded it, because a stage
 * reported not-started is not a link back to the work inside it.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stageReached, stageStateFor, FLOW_STEPS, flowIndexFor } from '../../components/shell/flow.ts';
import type { FlowFacts } from '../../components/shell/flow.ts';

const nothing: FlowFacts = {
  hasCandidates: false,
  hasInventory: false,
  hasActiveSession: false,
  hasCompletedRecord: false,
};

const stages = (pathname: string, facts: FlowFacts) =>
  FLOW_STEPS.map((_, i) => stageStateFor(i, pathname, facts));

test('a cold deep link into training claims nothing it has not earned', () => {
  assert.deepEqual(stages('/workout', nothing), [
    'not-started',
    'not-started',
    'not-started',
    'current-view',
    'not-started',
  ]);
});

test('an active session keeps Train reached while the user stands on Confirm', () => {
  const facts: FlowFacts = { ...nothing, hasInventory: true, hasActiveSession: true };
  const state = stages('/confirm', facts);
  assert.equal(state[1], 'current-view', 'Confirm is where they are');
  assert.equal(state[2], 'reached', 'Set up is behind them');
  assert.equal(
    state[3],
    'reached',
    'Train is where their work is — and therefore still a route back to it',
  );
});

test('moving backward changes the view, never what has been reached', () => {
  const facts: FlowFacts = { ...nothing, hasInventory: true, hasActiveSession: true };
  const fromWorkout = stages('/workout', facts);
  const fromSetup = stages('/setup', facts);
  for (const i of [0, 1, 2]) {
    assert.equal(
      stageReached(i, facts),
      true,
      'reached is a fact about the work, identical from either screen',
    );
  }
  assert.equal(fromWorkout[3], 'current-view');
  assert.equal(fromSetup[3], 'reached', 'Train stays reached when viewed from Set up');
});

test('candidates alone reach only the first stage', () => {
  const facts: FlowFacts = { ...nothing, hasCandidates: true };
  assert.equal(stageReached(0, facts), true);
  assert.equal(stageReached(1, facts), false, 'proposing is not confirming');
  assert.equal(stageReached(2, facts), false);
});

test('a completed record reaches every stage', () => {
  const facts: FlowFacts = { ...nothing, hasCompletedRecord: true };
  assert.deepEqual(
    FLOW_STEPS.map((_, i) => stageReached(i, facts)),
    [true, true, true, true, true],
  );
});

test('trailing slashes do not change which stage is current', () => {
  assert.equal(flowIndexFor('/workout'), flowIndexFor('/workout/'));
  assert.equal(stageStateFor(3, '/workout/', nothing), 'current-view');
});
