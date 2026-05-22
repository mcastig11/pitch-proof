// ─── Pitch detection helpers ───────────────────────────────────────────────

let mediaRecorder = null;
let recordedChunks = [];

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function freqToNote(freq) {
  if (freq <= 0) return null;
  // A4 = 440 Hz, MIDI note 69
  const midi = 12 * Math.log2(freq / 440) + 69;
  const rounded = Math.round(midi);
  const cents = Math.round((midi - rounded) * 100);
  const noteName = NOTE_NAMES[rounded % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return { note: `${noteName}${octave}`, cents, midi: rounded };
}

// Autocorrelation pitch detection (no external library needed!)
function detectPitch(buffer, sampleRate) {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // too quiet

  let lastCorrelation = 1;
  let foundGoodCorrelation = false;

  for (let offset = 1; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;
    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;

    if (correlation > 0.9 && correlation > lastCorrelation) {
      foundGoodCorrelation = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (foundGoodCorrelation) {
      break;
    }
    lastCorrelation = correlation;
  }

  if (bestOffset === -1) return -1;
  return sampleRate / bestOffset;
}

// ─── State ─────────────────────────────────────────────────────────────────

let audioContext = null;
let analyser = null;
let source = null;
let animFrame = null;
let isRecording = false;
let pitchLog = []; // stores detected notes while recording

// ─── DOM refs ──────────────────────────────────────────────────────────────

const recordBtn    = document.getElementById('recordBtn');
const recordLabel  = document.getElementById('recordLabel');
const statusEl     = document.getElementById('status');
const noteNameEl   = document.getElementById('noteName');
const frequencyEl  = document.getElementById('frequency');
const centsFillEl  = document.getElementById('centsFill');
const centsValueEl = document.getElementById('centsValue');
const waveformCanvas = document.getElementById('waveform');
const waveCtx      = waveformCanvas.getContext('2d');
const feedbackBox  = document.getElementById('feedbackBox');
const feedbackBtn  = document.getElementById('feedbackBtn');

// ─── Recording ─────────────────────────────────────────────────────────────

recordBtn.addEventListener('click', async () => {
  if (!isRecording) {
    await startRecording();
  } else {
    stopRecording();
  }
});

async function startRecording() {
    const startTime = Date.now();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    isRecording = true;
    pitchLog = [];
    recordBtn.classList.add('recording');
    recordLabel.textContent = 'STOP';
    statusEl.textContent = 'listening...';

    drawLoop();

    // Set up media recording
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);

        // Create a download link and auto-click it
        const a = document.createElement('a');
        a.href = url;
        a.download = `pitch-recording-${Date.now()}.webm`;
        a.click();

        // Also save the URL so you can play it back in the app
        lastRecordingURL = url;
    };
    mediaRecorder.start();
  } catch (err) {
    statusEl.textContent = 'mic access denied — check browser permissions';
    console.error(err);
  }
}

function stopRecording() {
  isRecording = false;
  cancelAnimationFrame(animFrame);
  if (source) source.disconnect();
  if (audioContext) audioContext.close();

  recordBtn.classList.remove('recording');
  recordLabel.textContent = 'START SINGING';
  statusEl.textContent = `done — ${pitchLog.length} pitch samples captured`;

  // Reset display
  noteNameEl.textContent = '—';
  noteNameEl.className = 'note-name';
  frequencyEl.textContent = '— Hz';
  centsFillEl.style.left = '50%';
  centsValueEl.textContent = '0 cents';

  // Clear waveform
  waveCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);

  // Stop media recorder
  mediaRecorder.stop();
}

// ─── Draw loop (pitch + waveform) ──────────────────────────────────────────

function drawLoop() {
  animFrame = requestAnimationFrame(drawLoop);

  const bufferLength = analyser.fftSize;
  const dataArray = new Float32Array(bufferLength);
  analyser.getFloatTimeDomainData(dataArray);

  // Pitch detection
  const freq = detectPitch(dataArray, audioContext.sampleRate);
  if (freq > 60 && freq < 1200) {
    const result = freqToNote(freq);
    if (result) {
      noteNameEl.textContent = result.note;
      frequencyEl.textContent = `${Math.round(freq)} Hz`;
      updateCentsMeter(result.cents);

      // Classify tuning
      const absC = Math.abs(result.cents);
      noteNameEl.className = 'note-name ' + (absC < 10 ? 'in-tune' : 'off-tune');

      pitchLog.push({
        note: result.note,
        cents: result.cents,
        freq: Math.round(freq),
        time: ((Date.now() - startTime) / 1000).toFixed(1) // seconds since start
        });
    }
  } else {
    noteNameEl.textContent = '—';
    frequencyEl.textContent = '— Hz';
    noteNameEl.className = 'note-name';
  }

  // Waveform drawing
  const w = waveformCanvas.width = waveformCanvas.offsetWidth * window.devicePixelRatio;
  const h = waveformCanvas.height = waveformCanvas.offsetHeight * window.devicePixelRatio;

  waveCtx.clearRect(0, 0, w, h);
  waveCtx.strokeStyle = '#7c6fff';
  waveCtx.lineWidth = 2;
  waveCtx.beginPath();

  const sliceWidth = w / bufferLength;
  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i];
    const y = (v * h / 2) + h / 2;
    if (i === 0) waveCtx.moveTo(x, y);
    else waveCtx.lineTo(x, y);
    x += sliceWidth;
  }
  waveCtx.stroke();
}

function updateCentsMeter(cents) {
  // Map cents (-50 to +50) to percentage position (0% to 100%)
  const clamped = Math.max(-50, Math.min(50, cents));
  const percent = 50 + clamped; // 0–100
  centsFillEl.style.left = `${percent}%`;

  const absC = Math.abs(clamped);
  centsFillEl.className = 'cents-fill ' + (absC < 10 ? 'in-tune' : clamped > 0 ? 'sharp' : 'flat');
  centsValueEl.textContent = `${cents > 0 ? '+' : ''}${cents} cents`;
}

// ─── AI Feedback ───────────────────────────────────────────────────────────

feedbackBtn.addEventListener('click', getAIFeedback);

async function getAIFeedback() {
  if (pitchLog.length === 0) {
    feedbackBox.textContent = 'No pitch data yet — sing something first, then click this button!';
    return;
  }

  // Summarize the pitch log
  const notes = pitchLog.map(p => p.note);
  const noteCount = {};
  notes.forEach(n => { noteCount[n] = (noteCount[n] || 0) + 1; });
  const topNotes = Object.entries(noteCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([note, count]) => `${note} (${count}x)`)
    .join(', ');

  const avgCents = Math.round(pitchLog.reduce((s, p) => s + p.cents, 0) / pitchLog.length);
  const sharpCount = pitchLog.filter(p => p.cents > 15).length;
  const flatCount  = pitchLog.filter(p => p.cents < -15).length;
  const inTuneCount = pitchLog.length - sharpCount - flatCount;

  // Group off-pitch moments by timestamp
  const offMoments = pitchLog
    .filter(p => Math.abs(p.cents) > 15)
    .reduce((acc, p) => {
      const last = acc[acc.length - 1];
      if (last && p.time - last.time < 0.5) {
        last.endTime = p.time;
        last.cents.push(p.cents);
      } else {
        acc.push({ time: p.time, endTime: p.time, note: p.note, cents: [p.cents] });
      }
      return acc;
    }, [])
    .map(m => {
      const avgC = Math.round(m.cents.reduce((a, b) => a + b, 0) / m.cents.length);
      const direction = avgC > 0 ? 'sharp' : 'flat';
      return `at ${m.time}s–${m.endTime}s: singing ${m.note}, ${Math.abs(avgC)} cents ${direction}`;
    })
    .join('\n');

  const summary = `
The singer sang for ${pitchLog[pitchLog.length - 1]?.time || 0} seconds.
Most common notes: ${topNotes}.
Average deviation: ${avgCents > 0 ? '+' : ''}${avgCents} cents.
In tune: ${inTuneCount}. Sharp: ${sharpCount}. Flat: ${flatCount}.

Specific off-pitch moments:
${offMoments || 'None detected — great tuning!'}
  `.trim();

  feedbackBox.textContent = 'Analyzing your singing...';
  feedbackBox.className = 'feedback-box loading';
  feedbackBtn.disabled = true;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_KEY_HERE',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `You are a friendly and encouraging vocal coach. A student just sang and here is their pitch accuracy data:\n\n${summary}\n\nGive them 3-4 sentences of specific feedback. Call out the exact timestamps where they went off pitch, whether they were sharp or flat at those moments, and give one concrete tip to fix it. Keep it warm and motivating.`
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || 'Could not get feedback. Check your API key.';
    feedbackBox.textContent = text;
    feedbackBox.className = 'feedback-box';
  } catch (err) {
    feedbackBox.textContent = 'Error connecting to Claude API. Check your API key and internet connection.';
    feedbackBox.className = 'feedback-box';
    console.error(err);
  }

  feedbackBtn.disabled = false;
}

const playbackBtn = document.getElementById('playbackBtn');
let lastRecordingURL = null;

// Show it after recording stops (inside mediaRecorder.onstop)
playbackBtn.style.display = 'block';

playbackBtn.addEventListener('click', () => {
  if (lastRecordingURL) {
    const audio = new Audio(lastRecordingURL);
    audio.play();
  }
});