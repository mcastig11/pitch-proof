'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

function elementForId(id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<([a-z][a-z0-9-]*)\\b([^>]*\\bid=["']${escapedId}["'][^>]*)>`, 'i'));
}

function labelFor(id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<label\\b[^>]*\\bfor=["']${escapedId}["'][^>]*>([\\s\\S]*?)<\\/label>`, 'i'));
}

test('practice selectors have associated visible labels and native controls', () => {
  for (const [id, tag, label] of [
    ['part-select', 'select', 'Vocal part'],
    ['start-measure', 'select', 'Starting measure'],
  ]) {
    const element = elementForId(id);
    assert.ok(element, `expected #${id}`);
    assert.equal(element[1].toLowerCase(), tag);
    assert.ok(labelFor(id), `expected a label for #${id}`);
    assert.match(labelFor(id)[1], new RegExp(label, 'i'));
  }

  for (const [id, text] of [
    ['mic-button', 'Check microphone'],
    ['start-button', 'Start practice'],
    ['stop-button', 'Stop practice'],
    ['retry-button', 'Retry attempt'],
    ['lost-place-button', 'I lost my place'],
  ]) {
    const element = elementForId(id);
    assert.ok(element, `expected #${id}`);
    assert.equal(element[1].toLowerCase(), 'button');
    assert.match(element[2], /\btype=["']button["']/i);
    const start = html.indexOf(element[0]);
    const buttonMarkup = html.slice(start, html.indexOf('</button>', start) + '</button>'.length);
    assert.match(buttonMarkup, new RegExp(text, 'i'));
  }
});

test('primary controls retain natural DOM keyboard order', () => {
  const ids = ['part-select', 'start-measure', 'mic-button', 'start-button', 'stop-button', 'lost-place-button', 'retry-button'];
  const offsets = ids.map((id) => html.indexOf(`id="${id}"`));
  assert.ok(offsets.every((offset) => offset >= 0));
  assert.deepEqual(offsets, [...offsets].sort((a, b) => a - b));
});

test('keyboard focus is visible with at least a two-pixel outline', () => {
  assert.match(html, /button:focus-visible\s*,\s*select:focus-visible\s*\{[^}]*outline:\s*2px\s+solid/i);
});

test('position and provisional observation meaning remains visible as text', () => {
  const position = elementForId('position');
  assert.ok(position, 'expected a persistent score-position element');
  assert.doesNotMatch(position[2], /\bhidden\b/i);
  assert.match(html, /Live observations\s*[·.]\s*not graded/i);
  assert.match(script, /Position uncertain\. This passage is ungraded\./);
  assert.match(script, /Current position unknown\./);
});

test('transition announcements use one polite live region without per-beat updates', () => {
  const announcement = elementForId('live-announcement');
  assert.ok(announcement, 'expected a dedicated announcement region');
  assert.match(announcement[2], /\brole=["']status["']/i);
  assert.match(announcement[2], /\baria-live=["']polite["']/i);
  assert.doesNotMatch(elementForId('position')[2], /aria-live/i);
  assert.doesNotMatch(elementForId('count-status')[2], /aria-live/i);

  for (const phrase of [
    'Microphone ready',
    'Microphone unavailable',
    'Count-in started',
    'Position uncertain',
    'Practice started',
    'Position recovered. Practice resumed.',
  ]) {
    assert.ok(script.includes(phrase), `missing announcement for ${phrase}`);
  }
});

test('responsive layout confines score overflow and respects reduced motion', () => {
  assert.match(html, /\.practice-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*2fr\)\s+minmax\(280px,\s*1fr\)/);
  assert.match(html, /\.score-frame\s*\{[^}]*overflow-x:\s*auto/);
  assert.match(html, /@media\s*\(max-width:\s*959px\)/);
  assert.match(html, /\.practice-grid\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(html, /@media\s*\(max-width:\s*599px\)/);
  assert.match(html, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(html, /button,\s*select\s*\{\s*min-height:\s*44px/);
});
