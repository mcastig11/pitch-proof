const test = require('node:test');
const assert = require('node:assert/strict');
const fixtureApi = require('../practice-fixture.js');

test('verified fixture has one part, fixed tempo and meter, a pickup, ordered measures, notes, and a rest', () => {
  const fixture = fixtureApi.EXAMPLE_FIXTURE;
  assert.deepEqual(fixtureApi.validateFixture(fixture), { valid: true, errors: [] });
  assert.equal(fixture.part.name, 'Voice');
  assert.equal(fixture.tempoBpm, 96);
  assert.equal(fixture.meter.label, '4/4');
  assert.equal(fixture.pickup.beats, 1);
  assert.equal(fixture.measures.length, 4);
  assert.ok(fixture.measures.flatMap((measure) => measure.events).some((event) => event.type === 'rest'));
});

test('incomplete or malformed metadata and event spans fail closed', () => {
  const fixture = structuredClone(fixtureApi.EXAMPLE_FIXTURE);
  fixture.tempoBpm = null;
  fixture.part.name = '';
  fixture.measures[0].events[1].beat = 3;
  const result = fixtureApi.validateFixture(fixture);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('Tempo')));
  assert.ok(result.errors.some((error) => error.includes('vocal part')));
  assert.ok(result.errors.some((error) => error.includes('invalid or overlapping')));
});

test('unknown starting measures produce no selectable option or score position', () => {
  const fixture = fixtureApi.EXAMPLE_FIXTURE;
  assert.deepEqual(fixtureApi.getStartMeasures(fixture).map((measure) => measure.id), ['pickup', '1', '2', '3', '4']);
  assert.equal(fixtureApi.getPositionAtTime(fixture, 0, '99'), null);
  assert.equal(fixtureApi.nearestBeatAtTime(fixture, 0, '99'), null);
  assert.equal(fixtureApi.getPositionAtTime(fixture, -0.01, '1'), null);
});

test('fixture labels are data, while page rendering uses text content rather than markup insertion', () => {
  const fixture = structuredClone(fixtureApi.EXAMPLE_FIXTURE);
  fixture.measures[0].label = '<img src=x onerror=alert(1)>';
  assert.equal(fixtureApi.validateFixture(fixture).valid, true);
  const script = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'script.js'), 'utf8');
  assert.match(script, /option\.textContent = measure\.label/);
  assert.match(script, /'data-measure-label': measure\.id \}, measure\.displayLabel/);
  assert.doesNotMatch(script, /innerHTML\s*=\s*[^'"`]/);
});
