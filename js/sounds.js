// ═══════════════════════════════════════════════════════════════════════════
// KESSELSTADT SOUND ENGINE – 100 % prozedural, Web Audio API
// Keine externen Audiodateien.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  let _c    = null;   // AudioContext
  let _m    = null;   // Master-GainNode
  let _day  = null;   // Tages-Bus
  let _nite = null;   // Nacht-Bus
  let _live = false;
  let _pendingMode = 'day';

  const _rnd = (a, b) => a + Math.random() * (b - a);

  /* ── Rausch-Buffer-Fabriken ──────────────────────────────────────────── */
  function _mkWhite(secs) {
    const n   = Math.ceil(_c.sampleRate * secs);
    const buf = _c.createBuffer(1, n, _c.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = _c.createBufferSource(); s.buffer = buf; s.loop = true; return s;
  }

  function _mkBrown(secs) {
    const n   = Math.ceil(_c.sampleRate * secs);
    const buf = _c.createBuffer(1, n, _c.sampleRate);
    const d   = buf.getChannelData(0);
    let v = 0;
    for (let i = 0; i < n; i++) {
      v = (v + 0.02 * (Math.random() * 2 - 1)) * 0.998;
      d[i] = Math.max(-1, Math.min(1, v * 3.5));
    }
    const s = _c.createBufferSource(); s.buffer = buf; s.loop = true; return s;
  }

  /* ── TAG: Marktplatz-Stimmengewirr (kontinuierlich) ─────────────────── */
  function _buildCrowd() {
    const n1 = _mkBrown(3);
    const f1 = _c.createBiquadFilter();
    f1.type = 'bandpass'; f1.frequency.value = 850; f1.Q.value = 0.9;
    const g1 = _c.createGain(); g1.gain.value = 0.17;
    const lfo1 = _c.createOscillator(); lfo1.frequency.value = 0.33;
    const lg1  = _c.createGain();       lg1.gain.value = 0.055;
    lfo1.connect(lg1); lg1.connect(g1.gain);
    n1.connect(f1); f1.connect(g1); g1.connect(_day);
    n1.start(); lfo1.start();

    const n2 = _mkWhite(2);
    const f2 = _c.createBiquadFilter();
    f2.type = 'bandpass'; f2.frequency.value = 2100; f2.Q.value = 1.4;
    const g2 = _c.createGain(); g2.gain.value = 0.042;
    const lfo2 = _c.createOscillator(); lfo2.frequency.value = 0.58;
    const lg2  = _c.createGain();       lg2.gain.value = 0.012;
    lfo2.connect(lg2); lg2.connect(g2.gain);
    n2.connect(f2); f2.connect(g2); g2.connect(_day);
    n2.start(); lfo2.start();
  }

  /* ── TAG: Dampfpfeife (periodisch) ──────────────────────────────────── */
  function _steamWhistle() {
    const t = _c.currentTime;
    const f = _rnd(870, 1320);

    const osc = _c.createOscillator(); osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f, t);
    const lp = _c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1900;
    const env = _c.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.23, t + 0.07);
    env.gain.setValueAtTime(0.23, t + _rnd(0.4, 0.7));
    env.gain.linearRampToValueAtTime(0, t + 0.88);
    osc.connect(lp); lp.connect(env); env.connect(_day);
    osc.start(t); osc.stop(t + 0.95);

    const w  = _mkWhite(1.2);
    const hp = _c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3800;
    const hg = _c.createGain();
    hg.gain.setValueAtTime(0, t);
    hg.gain.linearRampToValueAtTime(0.085, t + 0.07);
    hg.gain.setValueAtTime(0.085, t + 0.78);
    hg.gain.linearRampToValueAtTime(0, t + 1.15);
    w.connect(hp); hp.connect(hg); hg.connect(_day);
    w.start(t); w.stop(t + 1.2);

    setTimeout(_steamWhistle, _rnd(12000, 23000));
  }

  /* ── TAG: Zahnrad-Klingen (periodisch) ──────────────────────────────── */
  function _gearClank() {
    const t    = _c.currentTime;
    const hits = Math.random() < 0.35 ? 2 : 1;

    for (let i = 0; i < hits; i++) {
      const d  = t + i * _rnd(0.12, 0.26);
      const w  = _mkWhite(0.5);
      const bp = _c.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = _rnd(2000, 5200); bp.Q.value = 11 + Math.random() * 6;
      const env = _c.createGain();
      env.gain.setValueAtTime(0.21, d);
      env.gain.exponentialRampToValueAtTime(0.001, d + 0.14);
      w.connect(bp); bp.connect(env); env.connect(_day);
      w.start(d); w.stop(d + 0.17);
    }

    setTimeout(_gearClank, _rnd(2000, 6500));
  }

  /* ── TAG: Schmiedehammer (periodisch) ───────────────────────────────── */
  function _smithyHammer() {
    const t       = _c.currentTime;
    const hits    = Math.floor(_rnd(2, 5));
    const spacing = _rnd(0.28, 0.45);

    for (let i = 0; i < hits; i++) {
      const d = t + i * spacing;

      const osc = _c.createOscillator(); osc.type = 'triangle';
      osc.frequency.setValueAtTime(_rnd(190, 290), d);
      osc.frequency.exponentialRampToValueAtTime(62, d + 0.18);
      const eg = _c.createGain();
      eg.gain.setValueAtTime(0.31, d);
      eg.gain.exponentialRampToValueAtTime(0.001, d + 0.33);
      osc.connect(eg); eg.connect(_day);
      osc.start(d); osc.stop(d + 0.38);

      const ring = _c.createOscillator(); ring.type = 'sine';
      ring.frequency.value = _rnd(2300, 4600);
      const rg = _c.createGain();
      rg.gain.setValueAtTime(0.055, d);
      rg.gain.exponentialRampToValueAtTime(0.001, d + 0.58);
      ring.connect(rg); rg.connect(_day);
      ring.start(d); ring.stop(d + 0.63);
    }

    setTimeout(_smithyHammer, _rnd(5000, 13000));
  }

  /* ── NACHT: Feuerknistern (kontinuierlich) ───────────────────────────── */
  function _buildFire() {
    const n  = _mkBrown(4);
    const hp = _c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 540;
    const g  = _c.createGain(); g.gain.value = 0.105;
    [[7.1, 0.038], [13.4, 0.027], [3.9, 0.021]].forEach(([rate, depth]) => {
      const lfo = _c.createOscillator(); lfo.frequency.value = rate;
      const lg  = _c.createGain();       lg.gain.value = depth;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
    });
    n.connect(hp); hp.connect(g); g.connect(_nite); n.start();
  }

  /* ── NACHT: Windambiente (kontinuierlich) ───────────────────────────── */
  function _buildWind() {
    const n  = _mkBrown(5);
    const bp = _c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 265; bp.Q.value = 0.52;
    const g  = _c.createGain(); g.gain.value = 0.062;
    const lfo = _c.createOscillator(); lfo.frequency.value = 0.11;
    const lg  = _c.createGain();       lg.gain.value = 0.021;
    lfo.connect(lg); lg.connect(g.gain);
    n.connect(bp); bp.connect(g); g.connect(_nite);
    n.start(); lfo.start();
  }

  /* ── NACHT: Eulenruf (periodisch) ──────────────────────────────────── */
  function _owlCall() {
    const t    = _c.currentTime;
    const base = _rnd(360, 440);

    [[0, 0.65], [0.88, 1.52]].forEach(([s, e]) => {
      const osc = _c.createOscillator(); osc.type = 'sine';
      osc.frequency.setValueAtTime(base, t + s);
      osc.frequency.linearRampToValueAtTime(base * 0.87, t + e);
      const vib = _c.createOscillator(); vib.frequency.value = 5.2;
      const vg  = _c.createGain();       vg.gain.value = 3.5;
      vib.connect(vg); vg.connect(osc.frequency);
      const env = _c.createGain();
      env.gain.setValueAtTime(0, t + s);
      env.gain.linearRampToValueAtTime(0.14, t + s + 0.11);
      env.gain.setValueAtTime(0.14, t + e - 0.1);
      env.gain.linearRampToValueAtTime(0, t + e);
      osc.connect(env); env.connect(_nite);
      vib.start(t + s); vib.stop(t + e + 0.06);
      osc.start(t + s); osc.stop(t + e + 0.06);
    });

    setTimeout(_owlCall, _rnd(18000, 42000));
  }

  /* ── Engine starten ─────────────────────────────────────────────────── */
  function _start() {
    if (_live) {
      if (_c && _c.state === 'suspended') _c.resume();
      return;
    }
    _live = true;
    _c = new (window.AudioContext || window.webkitAudioContext)();
    _m = _c.createGain(); _m.gain.value = 0.75; _m.connect(_c.destination);
    _day  = _c.createGain(); _day.gain.value  = 1; _day.connect(_m);
    _nite = _c.createGain(); _nite.gain.value = 0; _nite.connect(_m);

    _buildCrowd(); _buildFire(); _buildWind();
    _steamWhistle(); _gearClank(); _smithyHammer(); _owlCall();
    _applyMode(_pendingMode, /*instant=*/true);
  }

  function _applyMode(mode, instant) {
    const isDay = mode === 'morning' || mode === 'day';
    if (!_c) { _pendingMode = mode; return; }
    const t   = _c.currentTime;
    const dur = instant ? 0.02 : 4.0;
    _day.gain.cancelScheduledValues(t);
    _nite.gain.cancelScheduledValues(t);
    _day.gain.setValueAtTime(_day.gain.value, t);
    _nite.gain.setValueAtTime(_nite.gain.value, t);
    _day.gain.linearRampToValueAtTime(isDay ? 1 : 0, t + dur);
    _nite.gain.linearRampToValueAtTime(isDay ? 0 : 1, t + dur);
  }

  /* ── Öffentliche API ────────────────────────────────────────────────── */
  window._KS = {
    start:   _start,
    setMode: _applyMode,
    setVol(v) { if (_m) _m.gain.value = Math.max(0, Math.min(1, v)); }
  };

  ['click', 'keydown', 'touchstart'].forEach(ev =>
    document.addEventListener(ev, _start, { once: true })
  );
})();
