(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PitchProofAudio = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const RMS_GATE = 0.01;
  const RMS_RELEASE = 0.006;

  function rmsOf(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
    return buffer.length ? Math.sqrt(sum / buffer.length) : 0;
  }

  function detectPitch(buffer, sampleRate) {
    const rms = rmsOf(buffer);
    if (rms < RMS_GATE || !Number.isFinite(sampleRate)) return null;
    const minLag = Math.max(2, Math.floor(sampleRate / 1200));
    const maxLag = Math.min(Math.floor(sampleRate / 60), Math.floor(buffer.length / 2));
    let bestLag = -1;
    let previousCorrelation = -1;
    let currentCorrelation = -1;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let product = 0;
      let leftEnergy = 0;
      let rightEnergy = 0;
      for (let i = 0; i < buffer.length - lag; i++) {
        product += buffer[i] * buffer[i + lag];
        leftEnergy += buffer[i] * buffer[i];
        rightEnergy += buffer[i + lag] * buffer[i + lag];
      }
      const correlation = leftEnergy && rightEnergy ? product / Math.sqrt(leftEnergy * rightEnergy) : 0;
      if (currentCorrelation >= 0.9 && currentCorrelation >= previousCorrelation && currentCorrelation > correlation) {
        bestLag = lag - 1;
        break;
      }
      previousCorrelation = currentCorrelation;
      currentCorrelation = correlation;
    }
    if (bestLag < 0) return null;
    const frequency = sampleRate / bestLag;
    if (frequency < 60 || frequency > 1200) return null;
    const midi = Math.round(12 * Math.log2(frequency / 440) + 69);
    if (midi < 0 || midi > 131) return null;
    return { frequency, note: `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}` };
  }

  function analyzeAudioFrame(buffer, sampleRate, state = {}, options = {}) {
    const now = Number.isFinite(options.audioTime) ? options.audioTime : 0;
    const rms = rmsOf(buffer);
    const pitch = detectPitch(buffer, sampleRate);
    const previousRms = Number.isFinite(state.previousRms) ? state.previousRms : 0;
    const lastOnsetAt = Number.isFinite(state.lastOnsetAt) ? state.lastOnsetAt : -Infinity;
    const onsetDetected = previousRms < RMS_RELEASE && rms > RMS_GATE && now - lastOnsetAt >= 0.1;
    const onsetBeat = onsetDetected && typeof options.beatAtAudioTime === 'function'
      ? options.beatAtAudioTime(now)
      : null;
    return {
      state: { previousRms: rms < RMS_RELEASE ? 0 : rms, lastOnsetAt: onsetDetected ? now : lastOnsetAt },
      rms,
      pitchText: pitch ? `Pitch heard: ${pitch.note}` : 'Listening for a sung note',
      pitch,
      onsetText: onsetDetected && Number.isInteger(onsetBeat) ? `Onset heard near beat ${onsetBeat}` : 'No onset detected yet',
      onsetDetected,
      onsetBeat: Number.isInteger(onsetBeat) ? onsetBeat : null,
    };
  }

  function createPracticeAudio(options = {}) {
    const mediaDevices = options.mediaDevices || globalThis.navigator?.mediaDevices;
    const AudioContextClass = options.AudioContext || globalThis.AudioContext || globalThis.webkitAudioContext;
    const requestFrame = options.requestAnimationFrame || globalThis.requestAnimationFrame?.bind(globalThis);
    const cancelFrame = options.cancelAnimationFrame || globalThis.cancelAnimationFrame?.bind(globalThis);
    const setTimer = options.setTimeout || globalThis.setTimeout.bind(globalThis);
    const clearTimer = options.clearTimeout || globalThis.clearTimeout.bind(globalThis);
    let stream = null;
    let context = null;
    let analyser = null;
    let source = null;
    let frameId = null;
    let requestGeneration = 0;
    let active = false;
    let practiceStartAudioTime = null;
    let selectedMeasureId = null;
    let beatAtAudioTime = null;
    let analysisState = {};
    const timers = new Set();
    const oscillators = new Set();

    async function checkMicrophone() {
      const generation = ++requestGeneration;
      if (!mediaDevices?.getUserMedia || !AudioContextClass) throw new Error('Microphone audio is not available in this browser.');
      const nextStream = await mediaDevices.getUserMedia({ audio: true });
      if (generation !== requestGeneration) {
        nextStream.getTracks().forEach((track) => track.stop());
        return false;
      }
      await releaseGraph();
      stream = nextStream;
      context = new AudioContextClass();
      analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      source = context.createMediaStreamSource(stream);
      source.connect(analyser);
      if (context.state === 'suspended') await context.resume();
      return true;
    }

    function beginSampling(callback) {
      if (!analyser || !context || !requestFrame) throw new Error('Microphone must be ready before practice starts.');
      active = true;
      const buffer = new Float32Array(analyser.fftSize);
      const tick = () => {
        if (!active || !analyser || !context) return;
        analyser.getFloatTimeDomainData(buffer);
        const analysis = analyzeAudioFrame(buffer, context.sampleRate, analysisState, {
          audioTime: context.currentTime,
          beatAtAudioTime: beatAtAudioTime ? (time) => beatAtAudioTime(time - practiceStartAudioTime) : undefined,
        });
        analysisState = analysis.state;
        callback({ ...analysis, audioTime: context.currentTime });
        frameId = requestFrame(tick);
      };
      frameId = requestFrame(tick);
    }

    function scheduleClick(at, accented) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = accented ? 1046 : 880;
      gain.gain.setValueAtTime(0.08, at);
      gain.gain.setValueAtTime(0.08, at + 0.025);
      gain.gain.linearRampToValueAtTime(0, at + 0.045);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillators.add(oscillator);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        oscillators.delete(oscillator);
      };
      oscillator.start(at);
      oscillator.stop(at + 0.05);
    }

    function startPractice({ measureId, beats, tempoBpm, onBeat, onFollowing, onObservation, mapBeat }) {
      if (!context || !stream) throw new Error('Check the microphone before starting practice.');
      if (!Number.isInteger(beats) || beats < 1 || !Number.isFinite(tempoBpm) || tempoBpm <= 0) throw new Error('Count-in timing is invalid.');
      stopScheduled();
      selectedMeasureId = String(measureId);
      analysisState = {};
      const beatDuration = 60 / tempoBpm;
      const countInStart = context.currentTime + 0.08;
      practiceStartAudioTime = countInStart + beats * beatDuration;
      beatAtAudioTime = (elapsed) => mapBeat(elapsed, selectedMeasureId);
      for (let beat = 0; beat < beats; beat++) {
        const at = countInStart + beat * beatDuration;
        scheduleClick(at, beat === 0);
        const timer = setTimer(() => {
          timers.delete(timer);
          if (active && context) onBeat?.(beat + 1, beats);
        }, Math.max(0, (at - context.currentTime) * 1000));
        timers.add(timer);
      }
      const startTimer = setTimer(() => {
        timers.delete(startTimer);
        if (!active || !context) return;
        onFollowing?.(practiceStartAudioTime);
      }, Math.max(0, (practiceStartAudioTime - context.currentTime) * 1000));
      timers.add(startTimer);
      beginSampling((analysis) => {
        if (context.currentTime < practiceStartAudioTime) return;
        onObservation?.(analysis);
      });
      return { countInStart, practiceStartAudioTime };
    }

    function stopScheduled() {
      timers.forEach(clearTimer);
      timers.clear();
      oscillators.forEach((oscillator) => {
        try { oscillator.stop(); } catch (_) { /* It may already have ended. */ }
        try { oscillator.disconnect(); } catch (_) { /* It may already be disconnected. */ }
      });
      oscillators.clear();
      if (frameId !== null && cancelFrame) cancelFrame(frameId);
      frameId = null;
    }

    async function releaseGraph() {
      active = false;
      stopScheduled();
      if (source) { source.disconnect(); source = null; }
      if (analyser) { analyser.disconnect?.(); analyser = null; }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }
      if (context) {
        const oldContext = context;
        context = null;
        await oldContext.close();
      }
    }

    async function stop() {
      requestGeneration++;
      await releaseGraph();
    }

    return { checkMicrophone, startPractice, stop, getAudioTime: () => context?.currentTime ?? null };
  }

  return { RMS_GATE, RMS_RELEASE, rmsOf, detectPitch, analyzeAudioFrame, createPracticeAudio };
});
