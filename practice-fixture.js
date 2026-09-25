(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PitchProofFixture = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Original in-repository vocal exercise; its score labels and practice events share this source.
  const EXAMPLE_FIXTURE = {
    id: 'verified-vocal-exercise',
    title: 'Evening exercise',
    provenance: 'Original Pitch Proof exercise authored for this project.',
    part: { id: 'voice', name: 'Voice', clef: 'treble', key: 'C major' },
    tempoBpm: 96,
    meter: { beatsPerMeasure: 4, beatUnit: 4, label: '4/4' },
    pickup: {
      id: 'pickup',
      label: 'Pickup',
      beats: 1,
      events: [{ beat: 1, duration: 1, type: 'note', pitch: 'G4' }],
    },
    measures: [
      { id: '1', label: 'Measure 1', events: [
        { beat: 1, duration: 1, type: 'note', pitch: 'C4' },
        { beat: 2, duration: 1, type: 'note', pitch: 'D4' },
        { beat: 3, duration: 1, type: 'note', pitch: 'E4' },
        { beat: 4, duration: 1, type: 'rest' },
      ] },
      { id: '2', label: 'Measure 2', events: [
        { beat: 1, duration: 2, type: 'note', pitch: 'G4' },
        { beat: 3, duration: 1, type: 'note', pitch: 'E4' },
        { beat: 4, duration: 1, type: 'note', pitch: 'D4' },
      ] },
      { id: '3', label: 'Measure 3', events: [
        { beat: 1, duration: 1, type: 'note', pitch: 'C4' },
        { beat: 2, duration: 1, type: 'rest' },
        { beat: 3, duration: 1, type: 'note', pitch: 'D4' },
        { beat: 4, duration: 1, type: 'note', pitch: 'E4' },
      ] },
      { id: '4', label: 'Measure 4', events: [
        { beat: 1, duration: 2, type: 'note', pitch: 'G4' },
        { beat: 3, duration: 2, type: 'note', pitch: 'C4' },
      ] },
    ],
  };

  function validateFixture(fixture) {
    const errors = [];
    const fail = (message) => errors.push(message);
    if (!fixture || typeof fixture !== 'object' || Array.isArray(fixture)) {
      return { valid: false, errors: ['Fixture must be an object.'] };
    }
    if (typeof fixture.id !== 'string' || !fixture.id.trim()) fail('Fixture id is required.');
    if (typeof fixture.title !== 'string' || !fixture.title.trim()) fail('Fixture title is required.');
    if (typeof fixture.provenance !== 'string' || !fixture.provenance.trim()) fail('Fixture provenance is required.');
    if (!fixture.part || typeof fixture.part.id !== 'string' || !fixture.part.id.trim() ||
        typeof fixture.part.name !== 'string' || !fixture.part.name.trim() ||
        fixture.part.clef !== 'treble' || typeof fixture.part.key !== 'string' || !fixture.part.key.trim()) {
      fail('A named treble-clef vocal part and key are required.');
    }
    if (!Number.isFinite(fixture.tempoBpm) || fixture.tempoBpm <= 0 || fixture.tempoBpm > 300) fail('Tempo must be between 0 and 300 BPM.');
    const beatsPerMeasure = fixture.meter?.beatsPerMeasure;
    if (!Number.isInteger(beatsPerMeasure) || beatsPerMeasure < 1 || !Number.isInteger(fixture.meter?.beatUnit) ||
        fixture.meter.beatUnit < 1 || typeof fixture.meter.label !== 'string' || !fixture.meter.label.trim()) {
      fail('Meter metadata is incomplete.');
    }
    if (!fixture.pickup || fixture.pickup.id !== 'pickup' || typeof fixture.pickup.label !== 'string' ||
        !fixture.pickup.label.trim() || !Number.isFinite(fixture.pickup.beats) || fixture.pickup.beats <= 0 ||
        fixture.pickup.beats > beatsPerMeasure || !Array.isArray(fixture.pickup.events)) {
      fail('Pickup metadata is incomplete.');
    }
    if (!Array.isArray(fixture.measures) || fixture.measures.length === 0) {
      fail('At least one measure is required.');
    } else {
      const ids = new Set();
      fixture.measures.forEach((measure, index) => {
        if (!measure || typeof measure.id !== 'string' || measure.id !== String(index + 1) || ids.has(measure.id)) {
          fail(`Measure ${index + 1} must have its ordered, unique number.`);
        }
        ids.add(measure?.id);
        if (typeof measure?.label !== 'string' || !measure.label.trim() || !Array.isArray(measure.events)) {
          fail(`Measure ${index + 1} needs a display label and events.`);
        }
        validateEvents(measure?.events, beatsPerMeasure, fail, `Measure ${index + 1}`);
      });
    }
    validateEvents(fixture.pickup?.events, fixture.pickup?.beats, fail, 'Pickup');
    return { valid: errors.length === 0, errors };
  }

  function validateEvents(events, capacity, fail, label) {
    if (!Array.isArray(events) || !Number.isFinite(capacity)) return;
    let end = 0;
    for (const event of events) {
      if (!event || !Number.isInteger(event.beat) || !Number.isInteger(event.duration) ||
          event.beat !== end + 1 || event.duration <= 0 || event.beat + event.duration - 1 > capacity ||
          !['note', 'rest'].includes(event.type) || (event.type === 'note' && !validPitch(event.pitch)) ||
          (event.type === 'rest' && event.pitch !== undefined)) {
        fail(`${label} contains an invalid or overlapping event.`);
        return;
      }
      end = event.beat + event.duration - 1;
    }
    if (events.length === 0 || end < capacity) fail(`${label} events do not fill the displayed beats.`);
  }

  function validPitch(pitch) {
    return typeof pitch === 'string' && /^[A-G](?:#|b)?[0-8]$/.test(pitch);
  }

  function getStartMeasures(fixture) {
    const result = validateFixture(fixture);
    if (!result.valid) return [];
    return [
      { id: fixture.pickup.id, label: fixture.pickup.label },
      ...fixture.measures.map(({ id, label }) => ({ id, label })),
    ];
  }

  function getPositionAtTime(fixture, seconds, startMeasureId) {
    if (!validateFixture(fixture).valid || !Number.isFinite(seconds) || seconds < 0) return null;
    const starts = getStartMeasures(fixture);
    const startIndex = starts.findIndex((measure) => measure.id === String(startMeasureId));
    if (startIndex < 0) return null;
    const beatDuration = 60 / fixture.tempoBpm;
    const startBeatIndex = starts.slice(0, startIndex).reduce((sum, item, index) => {
      return sum + (index === 0 ? fixture.pickup.beats : fixture.meter.beatsPerMeasure);
    }, 0);
    const absoluteBeat = startBeatIndex + seconds / beatDuration;
    let offset = 0;
    for (let index = 0; index < starts.length; index++) {
      const count = index === 0 ? fixture.pickup.beats : fixture.meter.beatsPerMeasure;
      if (absoluteBeat < offset + count) {
        return {
          measureId: starts[index].id,
          label: starts[index].label,
          beat: Math.floor(absoluteBeat - offset) + 1,
          beatIndex: Math.floor(absoluteBeat),
          beatFraction: absoluteBeat - Math.floor(absoluteBeat),
        };
      }
      offset += count;
    }
    return null;
  }

  function nearestBeatAtTime(fixture, seconds, startMeasureId) {
    if (!validateFixture(fixture).valid || !Number.isFinite(seconds) || seconds < 0) return null;
    const starts = getStartMeasures(fixture);
    const startIndex = starts.findIndex((measure) => measure.id === String(startMeasureId));
    if (startIndex < 0) return null;
    const beatsBeforeStart = starts.slice(0, startIndex).reduce((sum, item, index) => {
      return sum + (index === 0 ? fixture.pickup.beats : fixture.meter.beatsPerMeasure);
    }, 0);
    const nearestBeatIndex = Math.max(0, Math.round(beatsBeforeStart + seconds / (60 / fixture.tempoBpm)));
    const nearestPosition = getPositionAtTime(fixture, nearestBeatIndex * (60 / fixture.tempoBpm), 'pickup');
    return nearestPosition?.beat ?? null;
  }

  return { EXAMPLE_FIXTURE, validateFixture, getStartMeasures, getPositionAtTime, nearestBeatAtTime };
});
