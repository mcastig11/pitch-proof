import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

// Original, deliberately small test engraver, not a production notation renderer.
// Only built-in Node modules. No network, external fonts, PDF input or OMR output.
const root = fileURLToPath(new URL('../', import.meta.url));
const sha = (value) => createHash('sha256').update(value).digest('hex');
// Text hashes normalize CRLF to LF so Windows checkout policy cannot invalidate
// identical authored gold/approval content. PDF byte hashes remain exact.
const textSha = (value) => sha(Buffer.from(String(value).replace(/\r\n/g, '\n')));
const load = async (name) => JSON.parse(await readFile(join(root, 'tests/fixtures/scores', name), 'utf8'));
const W = 612; const H = 792;
const AUTHOR = 'Pitch Proof original fixture authored with Codex, 2026-10-17';
const MAX_PDF_BYTES = 2 * 1024 * 1024;
const MAX_BATCH_BYTES = 32 * 1024 * 1024;

// This input recipe is authored separately from tracer-gold.json. Never read gold
// to engrave or rewrite it from generated/recognized results. Beat units: quarters.
function exercise(index) {
  const offset = [-2, -1, 0, 1, 2, 3, -3, 0, 2, -2, 1, -1][index];
  const pickup = index % 2 === 0;
  const parts = [{ id: 'upper', label: 'UPPER', clef: 'treble', base: 72 }, { id: 'lower', label: 'LOWER', clef: 'bass', base: 48 }];
  const bars = [
    pickup ? [[0, 1]] : [[0, 1], [2, 1], [4, 1], [2, 1]],
    [[0, 0.75], [2, 0.25], [4, 0.5], [null, 0.5], [5, 2]],
    [[4, 3], [4, 1, 'start']],
    [[4, 1, 'stop'], [2, 1], [0, 2]],
    [[0, 0.5], [2, 0.5], [4, 1], [null, 1], [2, 1]],
    [[-1, 1.5], [0, 0.5], [2, 2]],
    [[0, 4]],
    [[null, 2], [0, 2]],
  ];
  return { id: `pp-${String(index + 1).padStart(2, '0')}`, bpm: 72 + index * 4, pickup, parts,
    measures: parts.flatMap((part) => bars.map((bar, i) => {
      let beat = 0;
      return { part: part.id, clef: part.clef, number: i + 1, length: pickup && i === 0 ? 1 : 4,
        events: bar.map(([pitch, duration, tie = null], j) => {
          const item = { id: `${part.id}-m${i + 1}-e${j + 1}`, onset: beat, duration,
            midi: pitch === null ? null : part.base + offset + pitch, tie };
          beat += duration; return item;
        }) };
    })) };
}

// Original 5x7 block lettering keeps both PDF and controlled raster output on
// the same geometric display list, without fetching or embedding a font file.
const letters = {
  A: '01110/10001/10001/11111/10001/10001/10001', B: '11110/10001/10001/11110/10001/10001/11110',
  C: '01111/10000/10000/10000/10000/10000/01111', D: '11110/10001/10001/10001/10001/10001/11110',
  E: '11111/10000/10000/11110/10000/10000/11111', F: '11111/10000/10000/11110/10000/10000/10000',
  G: '01111/10000/10000/10111/10001/10001/01111', H: '10001/10001/10001/11111/10001/10001/10001',
  I: '11111/00100/00100/00100/00100/00100/11111', J: '00111/00010/00010/00010/10010/10010/01100',
  K: '10001/10010/10100/11000/10100/10010/10001', L: '10000/10000/10000/10000/10000/10000/11111',
  M: '10001/11011/10101/10101/10001/10001/10001', N: '10001/11001/10101/10011/10001/10001/10001',
  O: '01110/10001/10001/10001/10001/10001/01110', P: '11110/10001/10001/11110/10000/10000/10000',
  Q: '01110/10001/10001/10001/10101/10010/01101', R: '11110/10001/10001/11110/10100/10010/10001',
  S: '01111/10000/10000/01110/00001/00001/11110', T: '11111/00100/00100/00100/00100/00100/00100',
  U: '10001/10001/10001/10001/10001/10001/01110', V: '10001/10001/10001/10001/10001/01010/00100',
  W: '10001/10001/10001/10101/10101/10101/01010', X: '10001/10001/01010/00100/01010/10001/10001',
  Y: '10001/10001/01010/00100/00100/00100/00100', Z: '11111/00001/00010/00100/01000/10000/11111',
  0: '01110/10001/10011/10101/11001/10001/01110', 1: '00100/01100/00100/00100/00100/00100/01110',
  2: '01110/10001/00001/00010/00100/01000/11111', 3: '11110/00001/00001/01110/00001/00001/11110',
  4: '00010/00110/01010/10010/11111/00010/00010', 5: '11111/10000/10000/11110/00001/00001/11110',
  6: '01110/10000/10000/11110/10001/10001/01110', 7: '11111/00001/00010/00100/01000/01000/01000',
  8: '01110/10001/10001/01110/10001/10001/01110', 9: '01110/10001/10001/01111/00001/00001/01110',
  '-': '00000/00000/00000/11111/00000/00000/00000',
};

function display(score, page) {
  const items = [];
  const line = (x, y, x2, y2, width = 0.7) => items.push({ type: 'line', x, y, x2, y2, width });
  const rect = (x, y, w, h) => items.push({ type: 'rect', x, y, w, h });
  const oval = (x, y, rx, ry, fill = true) => items.push({ type: 'oval', x, y, rx, ry, fill });
  const curve = (points, width = 1) => items.push({ type: 'curve', points, width });
  function text(value, x, y, size = 1) {
    for (const c of value.toUpperCase()) {
      if (c !== ' ') {
        assert(letters[c], `Unmapped original lettering: ${c}`);
        letters[c].split('/').forEach((row, r) => [...row].forEach((v, col) => { if (v === '1') rect(x + col * size, y + r * size, size, size); }));
      }
      x += 6 * size;
    }
  }
  text(`PITCH PROOF ${score.id}`, 45, 38, 1.8);
  text(`ORIGINAL EXERCISE - PAGE ${page} OF 2`, 45, 65, 1);
  text(`QUARTER ${score.bpm} BPM - 4 4`, 45, 84, 1);
  if (score.pickup && page === 1) text('ONE QUARTER PICKUP', 45, 102, 1);
  text('GENERATED TEST MATERIAL - HUMAN GOLD REVIEW PENDING', 45, 735, 0.9);
  for (const measure of score.measures) {
    const m = measure.number - 1;
    if (Math.floor(m / 4) + 1 !== page) continue;
    const system = Math.floor((m % 4) / 2);
    const top = 150 + system * 290 + (measure.part === 'lower' ? 100 : 0);
    const left = m % 2 === 0 ? 150 : 340;
    const right = left + 190;
    for (let n = 0; n < 5; n++) line(left, top + n * 10, right, top + n * 10);
    line(left, top, left, top + 40); line(right, top, right, top + 40);
    text(String(measure.number), left + 2, top - 19, 1);
    if (m % 2 === 0) {
      text(measure.part, 45, top + 16, 1);
      // Original path sketches: treble spiral centered on G; bass F and dots.
      if (measure.clef === 'treble') {
        curve([left - 22, top + 51, left - 38, top + 28, left - 10, top + 4, left - 24, top - 10], 1.4);
        curve([left - 24, top - 10, left - 42, top + 11, left - 4, top + 42, left - 26, top + 42], 1.4);
        curve([left - 26, top + 42, left - 42, top + 41, left - 35, top + 18, left - 20, top + 27], 1.4);
      } else {
        oval(left - 31, top + 10, 3, 3);
        curve([left - 31, top + 10, left - 10, top - 7, left - 10, top + 28, left - 34, top + 36], 1.8);
        oval(left - 10, top + 5, 1.4, 1.4); oval(left - 10, top + 15, 1.4, 1.4);
      }
      text('4', left - 3, top + 3, 1.2); text('4', left - 3, top + 22, 1.2);
    }
    // The final exercise deliberately removes one region and obscures another.
    // Gold retains the intended music, while visibility is an independent field.
    if (score.id === 'pp-12' && measure.part === 'upper' && measure.number === 6) {
      text('MISSING SOURCE', left + 22, top + 16, 1);
      continue;
    }
    for (const [eventIndex, event] of measure.events.entries()) {
      // Equal event slots reserve room for flags/accidentals at short rhythms.
      const x = left + 25 + eventIndex * 143 / measure.events.length;
      if (event.midi === null) {
        if (event.duration === 2) rect(x - 5, top + 15, 10, 4);
        else if (event.duration === 0.5) { oval(x + 2, top + 12, 2.7, 2.2); line(x + 4, top + 11, x - 2, top + 28, 1.5); }
        else { line(x, top + 10, x + 4, top + 16, 1.5); line(x + 4, top + 16, x - 3, top + 23, 1.5); line(x - 3, top + 23, x + 2, top + 29, 1.5); }
        continue;
      }
      const pitches = [0, 2, 4, 5, 7, 9, 11];
      const pc = event.midi % 12;
      const naturalPc = pitches.includes(pc) ? pc : pc - 1;
      const diatonic = Math.floor(event.midi / 12) * 7 + pitches.indexOf(naturalPc);
      const bottomDiatonic = measure.clef === 'treble' ? 5 * 7 + 2 : 3 * 7 + 4; // E4 / G2
      const y = top + 40 - (diatonic - bottomDiatonic) * 5;
      for (let ledger = top + 50; ledger <= y; ledger += 10) line(x - 8, ledger, x + 8, ledger);
      for (let ledger = top - 10; ledger >= y; ledger -= 10) line(x - 8, ledger, x + 8, ledger);
      if (!pitches.includes(pc)) {
        line(x - 15, y - 9, x - 16, y + 9); line(x - 11, y - 10, x - 12, y + 8);
        line(x - 18, y - 3, x - 8, y - 5); line(x - 18, y + 3, x - 8, y + 1);
      }
      const base = [0.75, 1.5, 3].includes(event.duration) ? event.duration / 1.5 : event.duration;
      oval(x, y, base === 4 ? 7 : 5.8, 4, base < 2);
      if (base < 4) {
        line(x + 5, y, x + 5, y - 30, 1.1);
        for (let flag = 0; flag < (base === 0.25 ? 2 : base === 0.5 ? 1 : 0); flag++)
          curve([x + 5, y - 30 + flag * 7, x + 18, y - 27 + flag * 7, x + 17, y - 19 + flag * 7, x + 10, y - 16 + flag * 7]);
      }
      if (base !== event.duration) oval(x + 10, y - 2, 1.6, 1.6);
      if (event.tie === 'start') curve([x + 3, y + 9, x + 20, y + 24, right + 3, y + 24, right + 22, y + 9]);
    }
    if (score.id === 'pp-12' && measure.part === 'lower' && measure.number === 7) {
      rect(left + 12, top - 12, 145, 66);
      text('CORRUPT', left + 18, top + 62, 1);
    }
  }
  return items;
}

function pdf(objects) {
  const chunks = [Buffer.from('%PDF-1.4\n%PitchProof-original\n')];
  const offsets = [0]; let offset = chunks[0].length;
  objects.forEach((object, i) => {
    offsets.push(offset);
    const bytes = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`), Buffer.isBuffer(object) ? object : Buffer.from(object), Buffer.from('\nendobj\n')]);
    chunks.push(bytes); offset += bytes.length;
  });
  chunks.push(Buffer.from(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((n) => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`));
  return Buffer.concat(chunks);
}
const stream = (bytes, dictionary = '') => Buffer.concat([Buffer.from(`<< /Length ${bytes.length} ${dictionary} >>\nstream\n`), bytes, Buffer.from('\nendstream')]);
const num = (n) => String(Math.round(n * 1000) / 1000);
function vectorStream(items) {
  const commands = ['0 g 0 G'];
  for (const p of items) {
    if (p.type === 'rect') commands.push(`${num(p.x)} ${num(H - p.y - p.h)} ${num(p.w)} ${num(p.h)} re f`);
    if (p.type === 'line') commands.push(`${p.width} w ${num(p.x)} ${num(H - p.y)} m ${num(p.x2)} ${num(H - p.y2)} l S`);
    if (p.type === 'curve') {
      const q = p.points.map((n, i) => num(i % 2 ? H - n : n));
      commands.push(`${p.width} w ${q.slice(0, 2).join(' ')} m ${q.slice(2).join(' ')} c S`);
    }
    if (p.type === 'oval') {
      const { x, rx, ry } = p; const y = H - p.y; const k = 0.55228475;
      commands.push(`0.9 w ${num(x + rx)} ${num(y)} m ${num(x + rx)} ${num(y + k * ry)} ${num(x + k * rx)} ${num(y + ry)} ${num(x)} ${num(y + ry)} c ${num(x - k * rx)} ${num(y + ry)} ${num(x - rx)} ${num(y + k * ry)} ${num(x - rx)} ${num(y)} c ${num(x - rx)} ${num(y - k * ry)} ${num(x - k * rx)} ${num(y - ry)} ${num(x)} ${num(y - ry)} c ${num(x + k * rx)} ${num(y - ry)} ${num(x + rx)} ${num(y - k * ry)} ${num(x + rx)} ${num(y)} c ${p.fill ? 'f' : 'S'}`);
    }
  }
  return Buffer.from(commands.join('\n'));
}

function raster(items, dpi) {
  const scale = dpi / 72; const width = Math.round(W * scale); const height = Math.round(H * scale);
  assert(width * height <= 8500000);
  const pixels = Buffer.alloc(width * height, 255);
  function box(x, y, w, h) {
    const x0 = Math.max(0, Math.floor(x * scale)); const x1 = Math.min(width, Math.ceil((x + w) * scale));
    for (let row = Math.max(0, Math.floor(y * scale)); row < Math.min(height, Math.ceil((y + h) * scale)); row++)
      pixels.fill(0, row * width + x0, row * width + x1);
  }
  function stroke(x, y, x2, y2, size) {
    const steps = Math.ceil(Math.hypot(x2 - x, y2 - y) * scale * 2) || 1;
    for (let i = 0; i <= steps; i++) box(x + (x2 - x) * i / steps - size / 2, y + (y2 - y) * i / steps - size / 2, size, size);
  }
  for (const p of items) {
    if (p.type === 'rect') box(p.x, p.y, p.w, p.h);
    if (p.type === 'line') stroke(p.x, p.y, p.x2, p.y2, p.width);
    if (p.type === 'oval') {
      for (let py = Math.floor((p.y - p.ry - 1) * scale); py <= Math.ceil((p.y + p.ry + 1) * scale); py++) {
        for (let px = Math.floor((p.x - p.rx - 1) * scale); px <= Math.ceil((p.x + p.rx + 1) * scale); px++) {
          const d = ((px / scale - p.x) / p.rx) ** 2 + ((py / scale - p.y) / p.ry) ** 2;
          const inner = ((px / scale - p.x) / (p.rx - 0.9)) ** 2 + ((py / scale - p.y) / (p.ry - 0.9)) ** 2;
          if (d <= 1 && (p.fill || inner >= 1) && px >= 0 && py >= 0 && px < width && py < height) pixels[py * width + px] = 0;
        }
      }
    }
    if (p.type === 'curve') {
      const q = p.points; let previous = [q[0], q[1]];
      for (let i = 1; i <= 80; i++) {
        const t = i / 80; const u = 1 - t;
        const point = [0, 1].map((axis) => u ** 3 * q[axis] + 3 * u ** 2 * t * q[axis + 2] + 3 * u * t ** 2 * q[axis + 4] + t ** 3 * q[axis + 6]);
        stroke(...previous, ...point, p.width); previous = point;
      }
    }
  }
  return { pixels, width, height };
}

function engrave(score, variant) {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>'];
  for (let page = 1; page <= 2; page++) {
    const pageId = page === 1 ? 3 : 6; const items = display(score, page);
    if (variant === 'digital') {
      objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << >> /Contents ${pageId + 1} 0 R >>`, stream(vectorStream(items)), '<< >>');
    } else {
      const image = raster(items, Number(score.id.slice(-2)) % 2 ? 300 : 144);
      objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im1 ${pageId + 2} 0 R >> >> /Contents ${pageId + 1} 0 R >>`,
        stream(Buffer.from(`q ${W} 0 0 ${H} 0 0 cm /Im1 Do Q`)),
        stream(deflateSync(image.pixels, { level: 9 }), `/Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode`));
    }
  }
  return pdf(objects);
}

function assertPdf(bytes, rasterized) {
  assert(bytes.length > 1000 && bytes.length <= MAX_PDF_BYTES, 'PDF size outside bound');
  const text = bytes.toString('latin1');
  assert.equal((text.match(/\/Type \/Page /g) || []).length, 2);
  assert.equal(text.includes('/Subtype /Image'), rasterized);
  const xref = Number(text.match(/startxref\n(\d+)\n%%EOF\n$/)?.[1]);
  assert.equal(text.slice(xref, xref + 4), 'xref');
  const offsets = text.slice(xref).match(/\d{10} 00000 n /g) || [];
  assert.equal(offsets.length, 8);
  offsets.forEach((row, i) => assert(text.slice(Number(row.slice(0, 10))).startsWith(`${i + 1} 0 obj\n`)));
  assert(!text.includes('/JavaScript') && !text.includes('/URI') && !text.includes('/Launch'));
}

const rational = (value) => {
  assert.match(value, /^-?\d+\/[1-9]\d*$/);
  const [n, d] = value.split('/').map(Number);
  assert(Number.isSafeInteger(n) && Number.isSafeInteger(d));
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  assert.equal(gcd(Math.abs(n), d), 1, 'Gold rationals must be reduced');
  return n / d;
};
function validateGold(gold) {
  assert.equal(gold.schemaVersion, 1); assert.equal(gold.authorship.author, AUTHOR);
  assert.equal(gold.authorship.origin, 'newly-composed-no-external-source');
  assert(gold.authorship.semanticMethod.includes('not OMR'));
  assert.equal(gold.exercises.length, 12);
  const ids = new Set();
  for (const g of gold.exercises) {
    assert(!ids.has(g.id)); ids.add(g.id);
    const expected = exercise(Number(g.id.slice(-2)) - 1);
    assert.equal(g.tempoQuarterBpm, expected.bpm);
    assert.equal(g.pickupQuarterBeats, expected.pickup ? '1/1' : null);
    for (const measure of expected.measures) {
      const pattern = gold.rhythmicGold[measure.number === 1 ? (expected.pickup ? 'pickup' : 'opening') : `m${measure.number}`];
      assert.equal(pattern.length, measure.events.length);
      let end = 0;
      pattern.forEach(([onset, duration, semitones, tie], i) => {
        assert.equal(rational(onset), end, 'Gap/overlap in authored gold'); end += rational(duration);
        const event = measure.events[i];
        assert.equal(event.onset, rational(onset)); assert.equal(event.duration, rational(duration));
        assert.equal(event.midi, semitones === null ? null : g.partBaseMidi[measure.part] + semitones);
        assert.equal(event.tie, tie);
      });
      assert.equal(end, measure.length);
      const region = gold.regionGold.find((r) => r.partId === measure.part && r.measure === measure.number);
      assert(region); assert([1, 2].includes(region.page)); assert([1, 2].includes(region.system));
      assert.equal(region.page, measure.number <= 4 ? 1 : 2);
      assert.equal(region.system, [1, 2, 5, 6].includes(measure.number) ? 1 : 2);
      const [x, y, w, h] = region.rect;
      assert([x, y, w, h].every(Number.isFinite) && x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= W && y + h <= H, 'Invalid gold region');
    }
    assert.equal(new Set(gold.regionGold.map((r) => `${r.partId}:${r.measure}`)).size, 16);
  }
  // Deliberate damage has semantic gold but no valid precise source assertion.
  assert.deepEqual(gold.damageGold, [{ exerciseId: 'pp-12', partId: 'upper', measure: 6, state: 'missing', reviewEligible: false }, { exerciseId: 'pp-12', partId: 'lower', measure: 7, state: 'corrupt', reviewEligible: false }]);
  assert(['pending', 'approved'].includes(gold.independentReview.status));
}

function verifyRejections(gold) {
  const damaged = (mutate) => { const copy = structuredClone(gold); mutate(copy); return copy; };
  assert.throws(() => validateGold(damaged((g) => { g.regionGold[0].rect[0] = -1; })));
  assert.throws(() => validateGold(damaged((g) => { g.regionGold[15].page = 1; })));
  assert.throws(() => validateGold(damaged((g) => { g.rhythmicGold.m2[1][1] = '1/2'; })));
  assert.throws(() => validateGold(damaged((g) => { g.rhythmicGold.m2[0][0] = '0/2'; })));
  assert.throws(() => validateGold(damaged((g) => { g.authorship.origin = 'unknown'; })));
  assert.throws(() => validateGold(damaged((g) => { g.damageGold[0].reviewEligible = true; })));
  assert.throws(() => validateGold(damaged((g) => { g.exercises[0].partBaseMidi.upper += 1; })));
  assert.throws(() => approval({ status: 'approved', approvedBy: '', approvedOn: null }, 'Invalid approval'));
  const brokenPdf = engrave(exercise(0), 'digital');
  assert.throws(() => assertPdf(brokenPdf.subarray(0, brokenPdf.length - 20), false));
  return 9;
}

function approval(record, description) {
  assert(record && record.status === 'approved', `${description}: explicit approval pending`);
  assert.equal(typeof record.approvedBy, 'string'); assert(record.approvedBy.trim().length > 0);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(record.approvedOn), `${description}: dated approval required`);
  assert.equal(typeof record.evidence, 'string'); assert(record.evidence.trim().length > 0);
}
async function verifyProtocol(manifest) {
  approval(manifest.protocolApproval, 'Corpus protocol');
  assert.equal(manifest.protocolApproval.artifactSha256, textSha(await readFile(join(root, 'docs/score-corpus-protocol.md'), 'utf8')), 'Protocol approval must bind current document hash');
  const budget = manifest.effortBudget;
  approval(budget, 'Correction effort budget');
  for (const key of ['medianActiveSecondsPerMeasure', 'p95ActiveSecondsPerMeasure', 'medianGesturesPerMeasure', 'p95GesturesPerMeasure', 'maxAbandonmentRate']) assert(Number.isFinite(budget[key]) && budget[key] >= 0, `Missing numeric ${key}`);
  assert(budget.p95ActiveSecondsPerMeasure >= budget.medianActiveSecondsPerMeasure);
  assert(budget.p95GesturesPerMeasure >= budget.medianGesturesPerMeasure && budget.maxAbandonmentRate <= 1);
  assert(manifest.assets.some((a) => a.stratum === 'physical-scan' && a.status === 'available'), 'Representative physical scans missing');
  for (const asset of manifest.assets.filter((a) => a.status === 'available')) {
    approval(asset.rights, `${asset.id} rights`); approval(asset.goldReview, `${asset.id} independent gold`);
    assert(asset.goldReview.reviewerId && asset.goldReview.reviewerId !== asset.authorId, 'Gold reviewer must be independent');
    assert(/^[a-f0-9]{64}$/.test(asset.sha256));
    assert(asset.rights.localProcessing === true);
    assert.equal(typeof asset.rights.cloudUpload, 'boolean');
    assert.equal(typeof asset.rights.redistribution, 'boolean');
    if (asset.goldFile === 'tests/fixtures/scores/tracer-gold.json') assert.equal(asset.goldReview.goldSha256, manifest.authorship.goldFileSha256, 'Independent gold approval must bind exact gold hash');
  }
}
async function verifyDesign(manifest) {
  const design = await readFile(join(root, 'docs/score-review-design.md'), 'utf8');
  for (let i = 1; i <= 12; i++) assert(design.includes(`D-${String(i).padStart(2, '0')}:`), 'Missing design acceptance case');
  approval(manifest.designApproval, 'Review interaction contract');
  assert.equal(manifest.designApproval.artifactSha256, textSha(design), 'Design approval must bind current document hash');
}

async function main() {
  const mode = process.argv[2] || '--verify';
  assert(process.argv.length <= 3 && ['--verify', '--generate', '--inventory', '--verify-protocol', '--verify-design'].includes(mode), 'Use --verify, --generate, --inventory, --verify-protocol or --verify-design; arbitrary output paths are disallowed');
  const manifest = await load('manifest.json'); const gold = await load('tracer-gold.json');
  validateGold(gold);
  const rejectionChecks = verifyRejections(gold);
  if (mode === '--verify-protocol') { await verifyProtocol(manifest); console.log('Protocol approval verified'); return; }
  if (mode === '--verify-design') { await verifyDesign(manifest); console.log('Design approval verified'); return; }
  assert.equal(manifest.authorship.author, AUTHOR);
  assert.equal(manifest.authorship.goldFileSha256, textSha(await readFile(join(root, 'tests/fixtures/scores/tracer-gold.json'), 'utf8')), 'Gold changed: review authored expectations before updating hash');
  const directory = await mkdtemp(join(tmpdir(), 'pitch-proof-scores-'));
  const records = []; let total = 0; let success = false;
  try {
    for (let i = 0; i < 12; i++) for (const variant of ['digital', 'rasterized']) {
      const score = exercise(i); const bytes = engrave(score, variant);
      assertPdf(bytes, variant === 'rasterized');
      assert.equal(sha(bytes), sha(engrave(score, variant)), 'Nondeterministic fixture hash');
      total += bytes.length; assert(total <= MAX_BATCH_BYTES);
      const id = `${score.id}-${variant}`; const record = { id, sha256: sha(bytes), bytes: bytes.length, pages: 2 };
      records.push(record);
      if (mode !== '--inventory') {
        const declared = manifest.assets.find((a) => a.id === id);
        assert(declared && declared.status === 'available' && declared.stratum === variant, `Missing asset ${id}`);
        assert.equal(declared.sha256, record.sha256, `Committed hash mismatch ${id}`);
        assert.equal(declared.bytes, record.bytes); assert.equal(declared.pages, 2);
        assert.equal(declared.authorId, 'pp-original-codex-20261017');
        assert(['pending-user-confirmation', 'approved'].includes(declared.rights.status));
        assert(['pending', 'approved'].includes(declared.goldReview.status));
      }
      await writeFile(join(directory, `${id}.pdf`), bytes, { flag: 'wx' });
    }
    assert.equal(records.length, 24);
    if (mode === '--inventory') console.log(JSON.stringify(records, null, 2));
    else console.log(JSON.stringify({ status: 'fixture-checks-passed', exercises: 12, assets: 24, pages: 48, digitalPages: 24, rasterizedPages: 24, physicalScanPages: 0, independentlyReviewedAssets: manifest.assets.filter((a) => records.some((r) => r.id === a.id) && a.goldReview.status === 'approved').length, totalBytes: total, deterministicDoubleRender: true, rejectionChecks, pdfStructure: 'xref/page-tree/bounds checked; not independent PDF-decoder proof', protocolApproval: manifest.protocolApproval.status, ...(mode === '--generate' ? { directory } : {}) }, null, 2));
    success = true;
  } finally {
    // Only remove our own fresh, bounded temp batch; never a caller-supplied path.
    if (mode !== '--generate' || !success) await rm(directory, { recursive: true, force: true });
  }
}
main().catch((error) => { console.error(`Score fixture check failed: ${error.message}`); process.exitCode = 1; });
