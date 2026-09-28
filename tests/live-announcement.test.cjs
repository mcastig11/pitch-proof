'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const fixtureApi = require('../practice-fixture.js');

const script = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

test('microphone and count-in transitions update the polite status without beat chatter', async () => {
  class FakeNode {
    constructor() {
      this.attributes = new Map();
      this.children = [];
      this.dataset = {};
      this.listeners = new Map();
      this.classList = { add() {}, remove() {} };
      this.textContent = '';
      this.value = '';
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    removeAttribute(name) { this.attributes.delete(name); }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    addEventListener(type, callback) { this.listeners.set(type, callback); }
  }

  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new FakeNode());
      return elements.get(id);
    },
    createElement() { return new FakeNode(); },
    createElementNS() { return new FakeNode(); },
    createTextNode(text) { return { textContent: text }; },
    addEventListener() {},
  };
  let practiceCallbacks;
  const audio = {
    async checkMicrophone() { return true; },
    async resume() {},
    startPractice(callbacks) { practiceCallbacks = callbacks; },
  };

  vm.runInNewContext(script, {
    window: { PitchProofFixture: fixtureApi, PitchProofAudio: { createPracticeAudio: () => audio } },
    document,
    console: { error() {} },
  });

  const announcement = elements.get('live-announcement');
  await elements.get('mic-button').listeners.get('click')();
  assert.equal(announcement.textContent, 'Microphone ready');

  elements.get('start-measure').value = 'pickup';
  await elements.get('start-button').listeners.get('click')();
  assert.equal(announcement.textContent, 'Count-in started at Pickup');
  assert.equal(typeof practiceCallbacks.onBeat, 'function');

  practiceCallbacks.onBeat(1, 4);
  practiceCallbacks.onBeat(2, 4);
  assert.equal(announcement.textContent, 'Count-in started at Pickup');
});
