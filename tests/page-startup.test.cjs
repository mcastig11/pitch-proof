'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const fixtureApi = require('../practice-fixture.js');

const script = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

test('page startup attaches the microphone and practice controls', () => {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) {
        const listeners = new Map();
        elements.set(id, {
          listeners,
          addEventListener(type, callback) { listeners.set(type, callback); },
          setAttribute() {},
          replaceWith() {},
        });
      }
      return elements.get(id);
    },
    createElement() { return {}; },
    addEventListener() {},
  };

  vm.runInNewContext(script, { window: {}, document, console: { error() {} } });

  for (const id of ['mic-button', 'start-button', 'stop-button', 'retry-button', 'lost-place-button', 'reload-button']) {
    assert.equal(typeof elements.get(id).listeners.get('click'), 'function', `${id} should be clickable`);
  }
});

test('the example score is revealed with notes placed against the staff', () => {
  class FakeNode {
    constructor() {
      this.attributes = new Map();
      this.children = [];
      this.dataset = {};
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    hasAttribute(name) { return this.attributes.has(name); }
    removeAttribute(name) { this.attributes.delete(name); }
    append(child) { this.children.push(child); }
    replaceChildren() { this.children = []; }
    addEventListener() {}
  }

  const elements = new Map();
  const score = new FakeNode();
  score.setAttribute('hidden', '');
  elements.set('score', score);
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new FakeNode());
      return elements.get(id);
    },
    createElement() { return new FakeNode(); },
    createElementNS() { return new FakeNode(); },
    addEventListener() {},
  };
  vm.runInNewContext(script, {
    window: { PitchProofFixture: fixtureApi, PitchProofAudio: { createPracticeAudio: () => ({}) } },
    document,
    console: { error() {} },
  });

  assert.equal(score.hasAttribute('hidden'), false, 'score SVG should be visible');
  const notes = score.children.filter((child) => child.getAttribute('aria-label'));
  const noteY = (pitch) => Number(notes.find((note) => note.getAttribute('aria-label') === pitch)?.getAttribute('cy'));
  assert.ok(noteY('C4') > 164, 'middle C should sit below the treble staff');
  assert.ok(noteY('G4') >= 100 && noteY('G4') <= 164, 'G4 should sit on the treble staff');
});
