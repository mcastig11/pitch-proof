const test = require('node:test');
const assert = require('node:assert/strict');
const fixtureApi = require('../practice-fixture.js');
const audioApi = require('../practice-audio.js');

const fixture = fixtureApi.EXAMPLE_FIXTURE;
const beatDuration = 60 / fixture.tempoBpm;

test('pickup and following measure positions map in verified score order', () => {
  assert.deepEqual(fixtureApi.getPositionAtTime(fixture, 0, 'pickup'), {
    measureId: 'pickup', label: 'Pickup', beat: 1, beatIndex: 0, beatFraction: 0,
  });
  assert.equal(fixtureApi.getPositionAtTime(fixture, beatDuration - 0.001, 'pickup').measureId, 'pickup');
  assert.deepEqual(fixtureApi.getPositionAtTime(fixture, beatDuration, 'pickup'), {
    measureId: '1', label: 'Measure 1', beat: 1, beatIndex: 1, beatFraction: 0,
  });
  assert.equal(fixtureApi.getPositionAtTime(fixture, beatDuration * 5, 'pickup').measureId, '2');
  assert.deepEqual(fixtureApi.getPositionAtTime(fixture, 0, '2'), {
    measureId: '2', label: 'Measure 2', beat: 1, beatIndex: 5, beatFraction: 0,
  });
});

test('rest events remain rests in the fixture and do not fabricate another note event', () => {
  const rest = fixture.measures[0].events.find((event) => event.type === 'rest');
  assert.deepEqual(rest, { beat: 4, duration: 1, type: 'rest' });
  assert.equal('pitch' in rest, false);
});

test('onsets map to the nearest beat from the selected score measure', () => {
  assert.equal(fixtureApi.nearestBeatAtTime(fixture, 0.52, '1'), 2);
  assert.equal(fixtureApi.nearestBeatAtTime(fixture, 0.14, 'pickup'), 1);
  assert.equal(fixtureApi.nearestBeatAtTime(fixture, beatDuration, 'pickup'), 1);
});

test('scheduled audio time drives count-in beat display even when a visual frame arrives late', () => {
  const frames = [];
  const clicks = [];
  const visualBeats = [];
  const state = { following: false };
  let context;
  class FakeContext {
    constructor() { this.currentTime = 5; this.sampleRate = 44100; this.destination = {}; context = this; }
    createAnalyser() { return { fftSize: 2048, connect() {}, disconnect() {}, getFloatTimeDomainData(buffer) { buffer.fill(0); } }; }
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    createOscillator() {
      const oscillator = { frequency: {}, connect() {}, disconnect() {}, start(at) { this.startedAt = at; clicks.push(this); }, stop(at) { this.stoppedAt = at; } };
      return oscillator;
    }
    createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
    async close() {}
    async resume() {}
  }
  const stream = { getTracks: () => [{ stop() {} }] };
  const audio = audioApi.createPracticeAudio({
    mediaDevices: { getUserMedia: async () => stream },
    AudioContext: FakeContext,
    requestAnimationFrame: (callback) => { frames.push(callback); return frames.length; },
    cancelAnimationFrame() {},
  });
  return audio.checkMicrophone().then(() => {
    const timing = audio.startPractice({
      measureId: '1', beats: 4, tempoBpm: fixture.tempoBpm,
      onBeat: (beat) => visualBeats.push(beat),
      onFollowing: () => { state.following = true; },
      onObservation() {},
      mapBeat: (seconds) => fixtureApi.nearestBeatAtTime(fixture, seconds, '1'),
    });
    assert.equal(clicks.length, 4);
    clicks.forEach((click, index) => assert.ok(Math.abs(click.startedAt - timing.countInStart - index * beatDuration) < 1e-9));
    const runFrameAt = (time) => {
      context.currentTime = time;
      const frame = frames.shift();
      assert.ok(frame);
      frame();
    };
    runFrameAt(timing.countInStart + beatDuration * 2.1);
    assert.deepEqual(visualBeats, [3]);
    assert.equal(state.following, false);
    runFrameAt(timing.practiceStartAudioTime);
    assert.equal(state.following, true);
    assert.equal(clicks.length, 4, 'no click is created at or after the singing start');
    return audio.stop();
  });
});
