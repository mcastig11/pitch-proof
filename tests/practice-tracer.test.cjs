const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const fixtureApi = require('../practice-fixture.js');
const audioApi = require('../practice-audio.js');

function sine(frequency, amplitude = 0.2, sampleRate = 44100, length = 2048) {
  return Float32Array.from({ length }, (_, index) => amplitude * Math.sin(2 * Math.PI * frequency * index / sampleRate));
}

test('page exposes one verified vocal part, fixed tempo and meter, and fixture measures', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const fixture = fixtureApi.EXAMPLE_FIXTURE;
  assert.equal(fixtureApi.validateFixture(fixture).valid, true);
  assert.equal(fixture.part.name, 'Voice');
  assert.equal(fixtureApi.getStartMeasures(fixture).length, fixture.measures.length + 1);
  assert.match(html, /id="part-select"/);
  assert.match(html, /id="start-measure"/);
  assert.match(html, /id="tempo-meter"/);
  assert.match(html, /Live observations · not graded/);
  assert.match(html, /practice-fixture\.js/);
  assert.match(html, /practice-audio\.js/);
  assert.doesNotMatch(html, /\b(in tune|sharp|flat|early|late|accuracy percentage)\b/i);
});

test('synthetic A4 input produces a provisional heard-pitch observation', () => {
  const frame = audioApi.analyzeAudioFrame(sine(440), 44100, {}, { audioTime: 1 });
  assert.equal(frame.pitchText, 'Pitch heard: A4');
  assert.deepEqual(Object.keys(frame.pitch), ['frequency', 'note']);
  assert.equal('writtenNote' in frame, false);
  assert.equal('grade' in frame, false);
});

test('silence stays in listening state; a silence-to-tone edge reports its nearby fixture beat', () => {
  const silence = new Float32Array(2048);
  const quiet = audioApi.analyzeAudioFrame(silence, 44100, {}, { audioTime: 0.4 });
  assert.equal(quiet.pitchText, 'Listening for a sung note');
  assert.equal(quiet.onsetText, 'No onset detected yet');
  const tone = audioApi.analyzeAudioFrame(sine(440), 44100, quiet.state, {
    audioTime: 0.52,
    beatAtAudioTime: (time) => Math.round(time / (60 / 96)) + 1,
  });
  assert.equal(tone.onsetDetected, true);
  assert.equal(tone.onsetText, 'Onset heard near beat 2');
  assert.equal('writtenNote' in tone, false);
  assert.equal('grade' in tone, false);
});

test('microphone practice schedules count-in only, transitions on the next beat, and releases local resources', async () => {
  const queuedFrames = [];
  const nodes = [];
  const stoppedTracks = [];
  const callbacks = { beats: [], following: false };
  const stream = { getTracks: () => [{ stop: () => stoppedTracks.push('track') }] };
  let fakeContext;
  class FakeContext {
    constructor() { this.currentTime = 10; this.sampleRate = 44100; this.destination = {}; this.closed = false; fakeContext = this; }
    createAnalyser() { return { fftSize: 2048, connect() {}, disconnect() {}, getFloatTimeDomainData() {} }; }
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    createOscillator() {
      const node = { frequency: {}, connect() {}, disconnect() {}, start: (at) => { node.startedAt = at; }, stop: (at) => { node.stoppedAt = at; } };
      nodes.push(node);
      return node;
    }
    createGain() {
      const values = [];
      return { gain: { setValueAtTime: (...args) => values.push(args), linearRampToValueAtTime: (...args) => values.push(args) }, connect() {}, disconnect() {}, values };
    }
    async close() { this.closed = true; }
    async resume() {}
  }
  const audio = audioApi.createPracticeAudio({
    mediaDevices: { getUserMedia: async () => stream },
    AudioContext: FakeContext,
    requestAnimationFrame: (callback) => { queuedFrames.push(callback); return queuedFrames.length; },
    cancelAnimationFrame() {},
  });
  assert.equal(await audio.checkMicrophone(), true);
  const start = audio.startPractice({
    measureId: '1', beats: 4, tempoBpm: 96,
    onBeat: (beat) => callbacks.beats.push(beat),
    onFollowing: () => { callbacks.following = true; },
    onObservation() {},
    mapBeat: () => 1,
  });
  assert.equal(nodes.length, 4);
  assert.equal(nodes[0].frequency.value, 1046);
  assert.ok(nodes.slice(1).every((node) => node.frequency.value === 880));
  assert.ok(Math.abs(nodes[0].stoppedAt - nodes[0].startedAt - 0.05) < 1e-9);
  assert.equal(start.practiceStartAudioTime, start.countInStart + 4 * (60 / 96));
  const runAt = (time) => {
    fakeContext.currentTime = time;
    const frame = queuedFrames.shift();
    assert.ok(frame, 'a visual audio-clock frame should be scheduled');
    frame();
  };
  const beatDuration = 60 / 96;
  runAt(start.countInStart);
  runAt(start.countInStart + beatDuration);
  runAt(start.countInStart + beatDuration * 2);
  runAt(start.countInStart + beatDuration * 3);
  runAt(start.practiceStartAudioTime);
  assert.deepEqual(callbacks.beats, [1, 2, 3, 4]);
  assert.equal(callbacks.following, true);
  const oldContext = audio.getAudioTime;
  await audio.stop();
  assert.deepEqual(stoppedTracks, ['track']);
  assert.equal(oldContext(), null);
  await audio.stop();
  assert.deepEqual(stoppedTracks, ['track']);
});

test('microphone setup failure stops the newly granted stream before surfacing the error', async () => {
  let stopped = 0;
  const stream = { getTracks: () => [{ stop: () => stopped++ }] };
  class BrokenAudioContext { constructor() { throw new Error('Audio output could not start'); } }
  const audio = audioApi.createPracticeAudio({
    mediaDevices: { getUserMedia: async () => stream },
    AudioContext: BrokenAudioContext,
  });
  await assert.rejects(audio.checkMicrophone(), /Audio output could not start/);
  assert.equal(stopped, 1);
});
