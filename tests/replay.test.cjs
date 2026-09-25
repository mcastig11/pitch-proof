const assert = require('node:assert/strict');
const test = require('node:test');
const { EXAMPLE_FIXTURE, createPositionTracker } = require('../practice-fixture.js');

test('pickup, silence, wrong pitch, and octave ambiguity stay descriptive and ungraded', () => {
  assert.equal(typeof createPositionTracker, 'function');
  const tracker = createPositionTracker(EXAMPLE_FIXTURE);
  assert.equal(tracker.start('pickup', 10), true);
  const initial = tracker.update(10.2);
  assert.equal(initial.position.measureId, 'pickup');
  assert.equal(initial.position.beat, 1);

  for (const kind of ['silence', 'wrong-pitch', 'octave-ambiguous']) {
    const observation = tracker.acceptObservation({ kind, note: kind === 'wrong-pitch' ? 'F#4' : null });
    assert.equal(observation.graded, false);
    assert.equal(observation.measureId, null);
    assert.equal(observation.note, null);
    assert.equal(tracker.snapshot().position.measureId, 'pickup');
  }
});

test('a timeline gap freezes the last confirmed position and removes the current claim', () => {
  const tracker = createPositionTracker(EXAMPLE_FIXTURE);
  tracker.start('pickup', 20);
  const lastConfirmed = tracker.update(20.25).position;

  const uncertain = tracker.update(21);

  assert.equal(uncertain.status, 'uncertain');
  assert.equal(uncertain.reason, 'clock-gap');
  assert.equal(uncertain.position, null);
  assert.deepEqual(uncertain.lastConfirmedPosition, lastConfirmed);
  assert.equal(tracker.acceptObservation({ kind: 'pitch', note: 'G4' }), null);
});

test('suspension, visibility loss, and declared divergence enter the same ungraded state', () => {
  for (const reason of ['audio-suspended', 'visibility-loss', 'user-lost-place']) {
    const tracker = createPositionTracker(EXAMPLE_FIXTURE);
    tracker.start('1', 30);
    tracker.update(30.1);
    const lastConfirmed = tracker.snapshot().lastConfirmedPosition;
    const uncertain = tracker.markUncertain(reason);

    assert.equal(uncertain.reason, reason);
    assert.equal(uncertain.position, null);
    assert.deepEqual(uncertain.lastConfirmedPosition, lastConfirmed);
    assert.equal(tracker.acceptObservation({ kind: 'pitch', note: 'C4' }), null);
  }
});

test('recovery validates the chosen measure, clears stale observations, and resumes at that measure', () => {
  const tracker = createPositionTracker(EXAMPLE_FIXTURE);
  tracker.start('pickup', 40);
  tracker.update(40.1);
  tracker.markUncertain('user-lost-place');
  const staleEpoch = tracker.snapshot().observationEpoch;

  assert.equal(tracker.beginRecovery('99'), false);
  assert.equal(tracker.beginRecovery('2'), true);
  assert.equal(tracker.snapshot().status, 'recovering');
  assert.ok(tracker.snapshot().observationEpoch > staleEpoch);
  assert.equal(tracker.acceptObservation({ kind: 'pitch', note: 'G4' }), null);
  assert.equal(tracker.completeRecovery(50), true);

  const resumed = tracker.snapshot();
  assert.equal(resumed.status, 'following');
  assert.equal(resumed.position.measureId, '2');
  assert.equal(resumed.position.beat, 1);
});
