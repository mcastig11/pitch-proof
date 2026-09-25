const assert = require('node:assert/strict');
const test = require('node:test');
const { createPracticeAudio } = require('../practice-audio.js');

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function makeAudioHarness({ getUserMedia, failAnalyser = false } = {}) {
  const tracks = [];
  const contexts = [];
  const frames = new Map();
  let nextFrame = 1;
  const mediaDevices = {
    getUserMedia: getUserMedia || (async () => {
      const track = { stopped: 0, stop() { this.stopped++; } };
      tracks.push(track);
      return { getTracks: () => [track] };
    }),
  };
  class FakeAudioContext {
    constructor() {
      this.currentTime = 1;
      this.sampleRate = 48000;
      this.state = 'running';
      this.closed = 0;
      this.destination = {};
      contexts.push(this);
    }
    createAnalyser() {
      if (failAnalyser) throw new Error('analyser setup failed');
      return { fftSize: 32, connect() {}, disconnect() {}, getFloatTimeDomainData() {} };
    }
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    async close() { this.closed++; this.state = 'closed'; }
  }
  const audio = createPracticeAudio({
    mediaDevices,
    AudioContext: FakeAudioContext,
    requestAnimationFrame(callback) { const id = nextFrame++; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  return { audio, tracks, contexts, frames };
}

test('only one microphone permission request can be pending', async () => {
  const permission = deferred();
  let requestCount = 0;
  const track = { stopped: 0, stop() { this.stopped++; } };
  const { audio } = makeAudioHarness({
    getUserMedia: () => { requestCount++; return permission.promise; },
  });

  const first = audio.checkMicrophone();
  const secondPending = audio.checkMicrophone();
  permission.resolve({ getTracks: () => [track] });

  assert.equal(await secondPending, false);
  assert.equal(await first, true);
  assert.equal(requestCount, 1);
});

test('a permission result that arrives after stop is released and cannot revive the session', async () => {
  const permission = deferred();
  const track = { stopped: 0, stop() { this.stopped++; } };
  const { audio, contexts } = makeAudioHarness({ getUserMedia: () => permission.promise });
  const checking = audio.checkMicrophone();

  await audio.stop();
  permission.resolve({ getTracks: () => [track] });

  assert.equal(await checking, false);
  assert.equal(track.stopped, 1);
  assert.equal(contexts.length, 0);
  assert.equal(audio.state, 'stopped');
});

test('permission denial leaves the session retryable and does not retain a prior graph', async () => {
  const track = { stopped: 0, stop() { this.stopped++; } };
  let requests = 0;
  const { audio, contexts } = makeAudioHarness({
    getUserMedia: async () => {
      requests++;
      if (requests === 1) return { getTracks: () => [track] };
      const error = new Error('permission denied');
      error.name = 'NotAllowedError';
      throw error;
    },
  });

  assert.equal(await audio.checkMicrophone(), true);
  await assert.rejects(audio.checkMicrophone(), { name: 'NotAllowedError' });

  assert.equal(track.stopped, 1);
  assert.equal(contexts[0].closed, 1);
  assert.equal(audio.state, 'error');
  assert.equal(await audio.checkMicrophone(), false);
});

test('setup failure releases the granted track and can be safely stopped repeatedly', async () => {
  const track = { stopped: 0, stop() { this.stopped++; } };
  const { audio, contexts } = makeAudioHarness({
    getUserMedia: async () => ({ getTracks: () => [track] }),
    failAnalyser: true,
  });

  await assert.rejects(audio.checkMicrophone(), /analyser setup failed/);
  await audio.stop();
  await audio.stop();

  assert.equal(track.stopped, 1);
  assert.equal(contexts[0].closed, 1);
  assert.equal(audio.state, 'stopped');
});
