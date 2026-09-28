(() => {
  'use strict';

  const fixtureApi = window.PitchProofFixture;
  const audioApi = window.PitchProofAudio;
  const fixture = fixtureApi?.EXAMPLE_FIXTURE;
  const ids = ['fixture-title', 'part-select', 'start-measure', 'tempo-meter', 'score-summary', 'score', 'position',
    'mic-status', 'input-status', 'mic-button', 'count-status', 'beat-display', 'pitch-observation', 'onset-observation',
    'start-button', 'stop-button', 'retry-button', 'lost-place-button', 'reload-button', 'live-announcement'];
  const ui = Object.fromEntries(ids.map((id) => [
    id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
    document.getElementById(id),
  ]));
  const scoreFrame = document.getElementById('score-frame');
  const svgNamespace = 'http://www.w3.org/2000/svg';
  let audio = null;
  let microphoneReady = false;
  let sessionActive = false;
  let attemptStartMeasure = null;
  let positionFrame = null;
  let lastPositionText = '';
  let positionTracker = null;
  let positionUncertain = false;
  let practiceFollowing = false;

  function setText(node, value) { node.textContent = value; }

  function unavailable() {
    ui.score.setAttribute('hidden', '');
    ui.scoreSummary.hidden = true;
    setText(ui.fixtureTitle, 'Example score unavailable');
    const body = document.createElement('p');
    body.textContent = 'The verified example could not be opened. Reload the example to practice.';
    ui.scoreSummary.replaceWith(body);
    ui.reloadButton.hidden = false;
    ui.startButton.disabled = true;
    ui.micButton.disabled = true;
  }

  function addSvg(parent, tag, attributes = {}, text = '') {
    const child = document.createElementNS(svgNamespace, tag);
    Object.entries(attributes).forEach(([name, value]) => child.setAttribute(name, String(value)));
    if (text) child.textContent = text;
    parent.append(child);
    return child;
  }

  function pitchY(pitch) {
    const match = /^([A-G])(#|b)?(\d)$/.exec(pitch);
    if (!match) return 160;
    const steps = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
    const diatonic = Number(match[3]) * 7 + steps[match[1]];
    // The treble staff's bottom line is E4 at y=164; each diatonic step is half a staff space.
    return 164 - (diatonic - (4 * 7 + steps.E)) * 8;
  }

  function drawScore() {
    const allMeasures = [
      { ...fixture.pickup, displayLabel: fixture.pickup.label },
      ...fixture.measures.map((measure) => ({ ...measure, displayLabel: measure.label })),
    ];
    const pickupWidth = 110;
    const measureWidth = 150;
    const width = pickupWidth + measureWidth * fixture.measures.length + 24;
    ui.score.replaceChildren();
    ui.score.setAttribute('viewBox', `0 0 ${width} 220`);
    ui.score.setAttribute('aria-label', `${fixture.title}, ${fixture.part.name} part`);
    addSvg(ui.score, 'title', { id: 'score-title' }, `${fixture.title} — ${fixture.part.name}`);
    addSvg(ui.score, 'desc', { id: 'score-desc' }, `Original ${fixture.part.name} vocal exercise in ${fixture.meter.label}, ${fixture.tempoBpm} beats per minute. Pickup followed by ${fixture.measures.length} measures.`);
    for (let line = 0; line < 5; line++) {
      addSvg(ui.score, 'line', { x1: 12, x2: width - 12, y1: 100 + line * 16, y2: 100 + line * 16, class: 'staff' });
    }
    addSvg(ui.score, 'text', { x: 18, y: 145, class: 'measure' }, '𝄞');
    addSvg(ui.score, 'text', { x: 45, y: 128, class: 'measure' }, 'C');
    addSvg(ui.score, 'text', { x: 48, y: 147, class: 'measure' }, fixture.meter.label);
    let x = 86;
    allMeasures.forEach((measure, measureIndex) => {
      const regionWidth = measureIndex === 0 ? pickupWidth : measureWidth;
      const startX = x;
      addSvg(ui.score, 'text', { x: startX + 5, y: 48, class: 'measure', 'data-measure-label': measure.id }, measure.displayLabel);
      const outline = addSvg(ui.score, 'rect', {
        x: startX, y: 70, width: regionWidth, height: 114, rx: 4,
        fill: 'none', stroke: 'transparent', 'stroke-width': 2, 'data-measure-outline': measure.id,
      });
      measure.events.forEach((event) => {
        const eventX = startX + 22 + ((event.beat - 1) / (measureIndex === 0 ? fixture.pickup.beats : fixture.meter.beatsPerMeasure)) * (regionWidth - 34);
        if (event.type === 'rest') {
          addSvg(ui.score, 'text', { x: eventX, y: 148, class: 'rest' }, '𝄽');
        } else {
          const noteY = pitchY(event.pitch);
          if (noteY === 180) addSvg(ui.score, 'line', { x1: eventX - 11, x2: eventX + 11, y1: 180, y2: 180, class: 'staff' });
          const note = addSvg(ui.score, 'ellipse', { cx: eventX, cy: noteY, rx: 7, ry: 5, class: 'note' });
          addSvg(ui.score, 'line', { x1: eventX + 6, y1: noteY, x2: eventX + 6, y2: noteY - 31, class: 'staff' });
          note.setAttribute('aria-label', event.pitch);
        }
      });
      addSvg(ui.score, 'line', { x1: startX + regionWidth, x2: startX + regionWidth, y1: 92, y2: 170, class: 'barline' });
      outline.dataset.measureOutline = measure.id;
      x += regionWidth;
    });
    addSvg(ui.score, 'line', { id: 'score-cursor', x1: 86, x2: 86, y1: 68, y2: 186, class: 'cursor', hidden: true });
    ui.scoreSummary.textContent = `${fixture.title}: ${fixture.part.name} part, ${fixture.measures.length} measures, ${fixture.tempoBpm} BPM.`;
    ui.scoreSummary.hidden = false;
    ui.score.removeAttribute('hidden');
  }

  function loadFixture() {
    const validation = fixtureApi?.validateFixture(fixture);
    if (!validation?.valid) {
      console.error('Example fixture is invalid.', validation?.errors);
      unavailable();
      return;
    }
    ui.fixtureTitle.textContent = fixture.title;
    ui.partSelect.replaceChildren();
    const partOption = document.createElement('option');
    partOption.value = fixture.part.id;
    partOption.textContent = fixture.part.name;
    ui.partSelect.append(partOption);
    ui.partSelect.disabled = false;
    ui.startMeasure.replaceChildren();
    fixtureApi.getStartMeasures(fixture).forEach((measure) => {
      const option = document.createElement('option');
      option.value = measure.id;
      option.textContent = measure.label;
      ui.startMeasure.append(option);
    });
    ui.startMeasure.disabled = false;
    ui.tempoMeter.textContent = `${fixture.tempoBpm} BPM · ${fixture.meter.label}`;
    drawScore();
    positionTracker = fixtureApi.createPositionTracker(fixture);
    audio = audioApi.createPracticeAudio();
    ui.reloadButton.hidden = true;
  }

  function renderBeatDisplay(activeBeat, totalBeats) {
    ui.beatDisplay.replaceChildren();
    for (let beat = 1; beat <= totalBeats; beat++) {
      const badge = document.createElement('span');
      badge.className = `beat-number${activeBeat === beat ? ' active' : ''}`;
      badge.textContent = String(beat);
      ui.beatDisplay.append(badge);
    }
  }

  function updateScorePosition(position, { uncertain = false } = {}) {
    if (!position) return;
    const labels = Array.from(ui.score.querySelectorAll('[data-measure-label]'));
    const selectedLabel = labels.find((label) => label.dataset.measureLabel === position.measureId);
    if (!selectedLabel) return;
    const labelX = Number(selectedLabel.getAttribute('x'));
    const measureStart = position.measureId === 'pickup' ? 86 : 86 + 110 + (Number(position.measureId) - 1) * 150;
    const measureDuration = position.measureId === 'pickup' ? fixture.pickup.beats : fixture.meter.beatsPerMeasure;
    const markerX = measureStart + 12 + ((position.beat - 1 + position.beatFraction) / measureDuration) * (position.measureId === 'pickup' ? 98 : 138);
    const cursor = ui.score.querySelector('#score-cursor');
    cursor.setAttribute('x1', markerX);
    cursor.setAttribute('x2', markerX);
    cursor.removeAttribute('hidden');
    cursor.classList.toggle('uncertain', uncertain);
    ui.score.querySelectorAll('[data-measure-outline]').forEach((outline) => {
      outline.setAttribute('stroke', !uncertain && outline.dataset.measureOutline === position.measureId ? '#135e63' : 'transparent');
    });
    const line = uncertain
      ? `Last confirmed position: ${position.label}. Current position unknown.`
      : `Following score: measure ${position.label}, beat ${position.beat}.`;
    if (line !== lastPositionText) {
      setText(ui.position, line);
      lastPositionText = line;
    }
    if (selectedLabel && scoreFrame.scrollWidth > scoreFrame.clientWidth) {
      const right = selectedLabel.getBoundingClientRect().right;
      const frame = scoreFrame.getBoundingClientRect();
      if (right > frame.right) scoreFrame.scrollBy({ left: right - frame.right, behavior: 'smooth' });
    }
  }

  function enterPositionUncertain(reason) {
    if (!practiceFollowing || positionUncertain) return;
    const snapshot = positionTracker.markUncertain(reason);
    if (positionFrame !== null) cancelAnimationFrame(positionFrame);
    positionFrame = null;
    positionUncertain = true;
    practiceFollowing = false;
    updateScorePosition(snapshot.lastConfirmedPosition, { uncertain: true });
    setText(ui.pitchObservation, 'Listening for a sung note');
    setText(ui.onsetObservation, 'No onset detected yet');
    setText(ui.countStatus, 'Position uncertain. This passage is ungraded. Choose a measure to resume.');
    ui.startMeasure.disabled = false;
    ui.startButton.hidden = false;
    ui.startButton.disabled = !microphoneReady;
    ui.startButton.textContent = 'Resume with count-in';
    ui.stopButton.hidden = false;
    ui.retryButton.hidden = true;
    ui.lostPlaceButton.hidden = true;
    ui.liveAnnouncement.textContent = 'Position uncertain. This passage is ungraded. Choose a measure to resume.';
  }

  function followPosition() {
    if (!sessionActive || !practiceFollowing) return;
    const now = audio.getAudioTime();
    const tracked = positionTracker.update(now);
    if (tracked.status === 'uncertain') {
      enterPositionUncertain(tracked.reason);
      return;
    }
    const position = tracked.position;
    updateScorePosition(position);
    if (position) {
      setText(ui.countStatus, `Following score: measure ${position.label}, beat ${position.beat}.`);
      positionFrame = requestAnimationFrame(followPosition);
    } else {
      endAttempt();
    }
  }

  function setIdleAfterStop(copy) {
    sessionActive = false;
    practiceFollowing = false;
    positionUncertain = false;
    lastPositionText = '';
    if (positionFrame !== null) cancelAnimationFrame(positionFrame);
    positionFrame = null;
    ui.startMeasure.disabled = false;
    ui.startButton.hidden = false;
    ui.startButton.disabled = !microphoneReady;
    ui.startButton.textContent = 'Start practice';
    ui.stopButton.hidden = true;
    ui.lostPlaceButton.hidden = true;
    ui.retryButton.hidden = false;
    setText(ui.countStatus, copy);
    setText(ui.pitchObservation, 'Listening for a sung note');
    setText(ui.onsetObservation, 'No onset detected yet');
    ui.liveAnnouncement.textContent = copy;
  }

  async function endAttempt() {
    if (!sessionActive) return;
    const originalStart = attemptStartMeasure;
    try { await audio.stop(); } catch (error) { console.error(error); }
    microphoneReady = false;
    ui.micStatus.textContent = 'Microphone not checked';
    ui.inputStatus.textContent = 'Waiting for sound';
    setIdleAfterStop(`Attempt ended. You can retry from measure ${originalStart === 'pickup' ? 'Pickup' : originalStart}. No grades were saved.`);
    setText(ui.position, 'Microphone not checked');
  }

  async function checkMicrophone() {
    ui.micButton.disabled = true;
    ui.startButton.disabled = true;
    ui.micStatus.textContent = 'Checking microphone…';
    ui.micStatus.classList.remove('error');
    try {
      const ready = await audio.checkMicrophone();
      if (!ready) return;
      microphoneReady = true;
      ui.micStatus.textContent = 'Microphone ready. Sing a note to check the input level.';
      ui.micButton.textContent = 'Check microphone';
      ui.inputStatus.textContent = 'Waiting for sound';
      ui.liveAnnouncement.textContent = 'Microphone ready';
      ui.startButton.disabled = false;
      ui.retryButton.hidden = true;
      ui.position.textContent = 'Microphone ready';
    } catch (error) {
      console.error(error);
      microphoneReady = false;
      ui.micStatus.textContent = error?.name === 'NotFoundError'
        ? 'No microphone input was found. Connect a microphone, then choose Try microphone again.'
        : 'Microphone access is off. Allow access in your browser, then choose Try microphone again.';
      ui.micStatus.classList.add('error');
      ui.micButton.textContent = 'Try microphone again';
      ui.startButton.disabled = true;
      ui.liveAnnouncement.textContent = 'Microphone unavailable';
    } finally {
      ui.micButton.disabled = false;
    }
  }

  async function startPractice() {
    if (!microphoneReady || (sessionActive && !positionUncertain)) return;
    const startMeasure = ui.startMeasure.value;
    if (!fixtureApi.getStartMeasures(fixture).some((measure) => measure.id === startMeasure)) return;
    const recovering = positionUncertain;
    if (recovering && !positionTracker.beginRecovery(startMeasure)) return;
    if (!attemptStartMeasure) attemptStartMeasure = startMeasure;
    sessionActive = true;
    practiceFollowing = false;
    ui.startMeasure.disabled = true;
    ui.startButton.hidden = true;
    ui.stopButton.hidden = false;
    ui.retryButton.hidden = true;
    ui.lostPlaceButton.hidden = true;
    ui.pitchObservation.textContent = 'Listening for a sung note';
    ui.onsetObservation.textContent = 'No onset detected yet';
    ui.liveAnnouncement.textContent = `Count-in started at ${startMeasure === 'pickup' ? 'Pickup' : `measure ${startMeasure}`}`;
    const beatCount = fixture.meter.beatsPerMeasure;
    try {
      await audio.resume();
      audio.startPractice({
        measureId: startMeasure,
        beats: beatCount,
        tempoBpm: fixture.tempoBpm,
        mapBeat: (elapsed) => fixtureApi.nearestBeatAtTime(fixture, Math.max(0, elapsed), startMeasure),
        onClockSuspended: () => {
          if (practiceFollowing) enterPositionUncertain('audio-suspended');
          else if (sessionActive) endAttempt();
        },
        onBeat: (beat, total) => {
          renderBeatDisplay(beat, total);
          ui.countStatus.replaceChildren();
          const beatBadge = document.createElement('span');
          beatBadge.className = 'beat-number active';
          beatBadge.textContent = String(beat);
          ui.countStatus.append(beatBadge, document.createTextNode(`Count-in: ${beat} of ${total}. Start at ${startMeasure === 'pickup' ? 'Pickup' : `measure ${startMeasure}`}.`));
        },
        onFollowing: (startTime) => {
          const trackingStarted = recovering
            ? positionTracker.completeRecovery(startTime)
            : positionTracker.start(startMeasure, startTime);
          if (!trackingStarted) {
            enterPositionUncertain('invalid-recovery-position');
            return;
          }
          positionUncertain = false;
          practiceFollowing = true;
          ui.beatDisplay.replaceChildren();
          ui.countStatus.textContent = 'Following score';
          ui.startMeasure.disabled = true;
          ui.startButton.textContent = 'Start practice';
          ui.lostPlaceButton.hidden = false;
          updateScorePosition(positionTracker.snapshot().position);
          positionFrame = requestAnimationFrame(followPosition);
          ui.liveAnnouncement.textContent = recovering ? 'Position recovered. Practice resumed.' : 'Practice started';
          scoreFrame.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        },
        onObservation: (observation) => {
          if (!positionTracker.acceptObservation({ kind: 'microphone-frame' })) return;
          ui.pitchObservation.textContent = observation.pitchText;
          ui.onsetObservation.textContent = observation.onsetText;
          ui.inputStatus.textContent = observation.rms > 0.01 ? 'Input detected' : 'Waiting for sound';
        },
      });
    } catch (error) {
      console.error(error);
      sessionActive = false;
      practiceFollowing = false;
      positionUncertain = false;
      microphoneReady = false;
      await audio.stop();
      ui.micStatus.textContent = 'Practice could not continue. Check your microphone and audio output, then choose Try again.';
      ui.micStatus.classList.add('error');
      ui.startMeasure.disabled = false;
      ui.startButton.hidden = false;
      ui.startButton.disabled = true;
      ui.stopButton.hidden = true;
      ui.lostPlaceButton.hidden = true;
      ui.retryButton.hidden = false;
    }
  }

  async function retryAttempt() {
    if (!attemptStartMeasure) return;
    const retryMeasure = attemptStartMeasure;
    ui.startMeasure.value = retryMeasure;
    await checkMicrophone();
    if (microphoneReady) await startPractice();
  }

  ui.micButton.addEventListener('click', checkMicrophone);
  ui.startButton.addEventListener('click', startPractice);
  ui.stopButton.addEventListener('click', endAttempt);
  ui.retryButton.addEventListener('click', retryAttempt);
  ui.lostPlaceButton.addEventListener('click', () => enterPositionUncertain('user-lost-place'));
  ui.reloadButton.addEventListener('click', () => window.location.reload());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) enterPositionUncertain('visibility-loss');
  });
  loadFixture();
})();
