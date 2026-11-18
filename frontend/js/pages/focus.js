/**
 * focus.js - Pomodoro timer, session tracker (GET/POST /api/focus/sessions)
 * and ambient sounds generated live with the Web Audio API (no audio files needed).
 */
(function () {
  const CIRC = 2 * Math.PI * 115;
  const circle = $('pomCircle');
  circle.style.strokeDasharray = CIRC;

  let mode = 'focus';
  let total = 25 * 60;
  let remaining = total;
  let running = false;
  let endAt = 0;
  let timer = null;
  let todayCount = 0;

  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

  /* ---------- Timer ---------- */
  function paint() {
    $('pomTime').textContent = fmt(remaining);
    $('pomLabel').textContent = mode === 'focus' ? 'Focus time' : 'Break time';
    circle.style.strokeDashoffset = CIRC * (remaining / total); // ring fills up as time passes
    document.title = running ? `${fmt(remaining)} · Focus Mode` : 'Focus Mode · StudySphere';
  }

  function setPlayIcon() {
    $('pomPlay').innerHTML = `<i class="ri-${running ? 'pause' : 'play'}-fill"></i>`;
  }

  function start() {
    endAt = Date.now() + remaining * 1000; // based on the clock, so it stays accurate in background tabs
    running = true;
    timer = setInterval(tick, 250);
    setPlayIcon();
  }
  function pause() {
    clearInterval(timer);
    running = false;
    setPlayIcon();
    paint();
  }
  function tick() {
    remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    paint();
    if (remaining <= 0) finish();
  }

  function setMode(newMode, mins) {
    pause();
    mode = newMode;
    total = remaining = mins * 60;
    document.querySelectorAll('.pom-mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mins === String(mins) && b.dataset.mode === newMode));
    paint();
  }

  /** A session ran to zero: save it (focus only) and move on to the next phase */
  async function finish() {
    pause();
    beep();
    if (mode === 'focus') {
      const res = await UI.run(() => api.post('/focus/sessions', { minutes: Math.round(total / 60) }));
      if (res) { showTracker(res); UI.toast('success', '🎉 Focus session complete and saved!'); }
      setMode('break', 5);
    } else {
      UI.toast('info', '⏰ Break over. Ready for another round?');
      setMode('focus', 25);
    }
  }

  $('pomPlay').addEventListener('click', () => (running ? pause() : start()));
  $('pomReset').addEventListener('click', () => { pause(); remaining = total; paint(); });
  $('pomSkip').addEventListener('click', () => (mode === 'focus' ? setMode('break', 5) : setMode('focus', 25)));
  document.querySelectorAll('.pom-mode-btn').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode, Number(b.dataset.mins))));

  /* ---------- Session tracker ---------- */
  function showTracker(d) {
    todayCount = d.todayCount;
    $('trkSummary').textContent = `${d.todayCount} session${d.todayCount === 1 ? '' : 's'} · ${d.todayMinutes} min`;
    $('sessionLog').innerHTML = d.sessions.length
      ? d.sessions.map((s, i) => `<div class="session-row"><span>Session ${i + 1}</span><span>${s.time ? s.time + ' · ' : ''}${s.minutes} min</span></div>`).join('')
      : '<div class="session-row">No sessions yet today. Start your first one!</div>';

    // 4 dots = one Pomodoro cycle
    const cycle = d.todayCount === 0 ? 0 : ((d.todayCount - 1) % 4) + 1;
    $('sessionDots').innerHTML = [0, 1, 2, 3].map((i) =>
      `<div class="session-dot ${i < cycle ? 'done' : ''} ${i === cycle ? 'current' : ''}" title="Session ${i + 1}"></div>`).join('');
  }

  /* ---------- "Working on" select (from open tasks) ---------- */
  api.get('/tasks').then((tasks) => {
    $('focusTask').innerHTML = '<option>Anything</option>' + tasks.filter((t) => !t.done).map((t) => `<option>${UI.esc(t.title)}</option>`).join('');
  }).catch(() => {});

  /* ---------- Ambient sounds (Web Audio API) ---------- */
  let actx = null, master = null, active = null, nodes = [];
  const volume = () => Number($('volume').value) / 100;

  function audio() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain();
      master.gain.value = volume();
      master.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  function noise(type) {
    const c = audio();
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown') { last = (last + 0.02 * white) / 1.02; data[i] = last * 3.5; } else data[i] = white;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }
  const gainNode = (v) => { const g = audio().createGain(); g.gain.value = v; return g; };
  const filter = (type, freq, q = 1) => { const f = audio().createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; return f; };

  const SOUNDS = {
    rain() { const s = noise('white'); s.connect(filter('highpass', 1000)).connect(gainNode(0.18)).connect(master); s.start(); return [s]; },
    forest() {
      const s = noise('brown'); const g = gainNode(0.7);
      const lfo = audio().createOscillator(); const depth = gainNode(0.3);
      lfo.frequency.value = 0.12; lfo.connect(depth).connect(g.gain); // slow "wind swell"
      s.connect(filter('lowpass', 700)).connect(g).connect(master); s.start(); lfo.start(); return [s, lfo];
    },
    cafe() { const s = noise('brown'); s.connect(filter('bandpass', 750, 0.7)).connect(gainNode(1.1)).connect(master); s.start(); return [s]; },
    lofi() {
      const out = []; const g = gainNode(0.05);
      g.connect(filter('lowpass', 900)).connect(master);
      [220, 261.63, 329.63, 392].forEach((f, i) => { // A minor 7 chord
        const o = audio().createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = (i - 1.5) * 4;
        o.connect(g); o.start(); out.push(o);
      });
      return out;
    },
  };

  function stopAmbient() {
    nodes.forEach((n) => { try { n.stop(); } catch (e) { /* already stopped */ } });
    nodes = []; active = null;
    document.querySelectorAll('.ambient-btn').forEach((b) => b.classList.remove('active'));
  }
  document.querySelectorAll('.ambient-btn').forEach((b) => b.addEventListener('click', () => {
    const name = b.dataset.sound;
    const was = active;
    stopAmbient();
    if (was === name) return UI.toast('info', 'Ambient sound off');
    audio();
    nodes = SOUNDS[name]();
    active = name;
    b.classList.add('active');
    UI.toast('info', `🎵 Playing ${b.textContent.trim()}`);
  }));
  $('volume').addEventListener('input', () => { if (master) master.gain.value = volume(); });

  /** Short chime when a session ends */
  function beep() {
    try {
      const c = audio(); const o = c.createOscillator(); const g = c.createGain();
      o.frequency.value = 880; g.gain.setValueAtTime(0.2, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.8);
      o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.8);
    } catch (e) { /* audio not available */ }
  }

  /* ---------- Distraction-free mode ---------- */
  const zen = $('zenBtn');
  function setZen(on) {
    document.body.classList.toggle('focus-zen', on);
    zen.innerHTML = on ? '<i class="ri-fullscreen-exit-line"></i> Exit distraction-free mode' : '<i class="ri-fullscreen-line"></i> Distraction-free mode';
  }
  zen.addEventListener('click', () => setZen(!document.body.classList.contains('focus-zen')));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setZen(false));

  /* ---------- Init ---------- */
  paint();
  UI.run(() => api.get('/focus/sessions')).then((d) => d && showTracker(d));
})();
