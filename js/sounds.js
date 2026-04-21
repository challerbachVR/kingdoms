// ═══════════════════════════════════════════════════════════════════════════
// SOUND ENGINE – 100 % prozedural, Web Audio API
// Kesselstadt + Feenreich – nahtloser Zonen-Crossfade
// Keine externen Audiodateien.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  let _c    = null;   // AudioContext
  let _m    = null;   // Master-GainNode
  let _city = null;   // Kesselstadt-Bus  (day+nite hängen hier dran)
  let _day  = null;   // Tages-Bus
  let _nite = null;   // Nacht-Bus
  let _feen = null;   // Feenreich-Bus
  let _live = false;
  let _pendingMode = 'day';
  let _pendingZone = 'city';
  let _cityMuted   = false;
  let _feenMuted   = false;

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

  /* ══════════════════════════════════════════════════════════════════════
     KESSELSTADT SOUNDS
     ══════════════════════════════════════════════════════════════════════ */

  /* ── TAG: Marktplatz-Stimmengewirr ──────────────────────────────────── */
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

  /* ── TAG: Dampfpfeife ────────────────────────────────────────────────── */
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

  /* ── TAG: Zahnrad-Klingen ────────────────────────────────────────────── */
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

  /* ── TAG: Schmiedehammer ─────────────────────────────────────────────── */
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

  /* ── NACHT: Feuerknistern ────────────────────────────────────────────── */
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

  /* ── NACHT: Windambiente ─────────────────────────────────────────────── */
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

  /* ── NACHT: Eulenruf ─────────────────────────────────────────────────── */
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

  /* ══════════════════════════════════════════════════════════════════════
     FEENREICH SOUNDS
     ══════════════════════════════════════════════════════════════════════ */

  /* ── Magisches Grundrauschen (kontinuierlich) ────────────────────────── */
  function _buildFeenAmbient() {
    // Tiefes Dröhnen – magischer Untergrund
    const n1 = _mkBrown(4);
    const f1 = _c.createBiquadFilter();
    f1.type = 'bandpass'; f1.frequency.value = 155; f1.Q.value = 0.65;
    const g1 = _c.createGain(); g1.gain.value = 0.13;
    const lfo1 = _c.createOscillator(); lfo1.frequency.value = 0.16;
    const lg1  = _c.createGain();       lg1.gain.value = 0.042;
    lfo1.connect(lg1); lg1.connect(g1.gain);
    n1.connect(f1); f1.connect(g1); g1.connect(_feen);
    n1.start(); lfo1.start();

    // Mittlerer Schimmer – atmosphärisches Rauschen
    const n2 = _mkBrown(3);
    const f2 = _c.createBiquadFilter();
    f2.type = 'bandpass'; f2.frequency.value = 380; f2.Q.value = 1.1;
    const g2 = _c.createGain(); g2.gain.value = 0.058;
    const lfo2 = _c.createOscillator(); lfo2.frequency.value = 0.24;
    const lg2  = _c.createGain();       lg2.gain.value = 0.019;
    lfo2.connect(lg2); lg2.connect(g2.gain);
    n2.connect(f2); f2.connect(g2); g2.connect(_feen);
    n2.start(); lfo2.start();

    // Hochfrequenter Magie-Glimmer
    const n3 = _mkWhite(2);
    const f3 = _c.createBiquadFilter();
    f3.type = 'highpass'; f3.frequency.value = 6500;
    const g3 = _c.createGain(); g3.gain.value = 0.022;
    const lfo3 = _c.createOscillator(); lfo3.frequency.value = 0.41;
    const lg3  = _c.createGain();       lg3.gain.value = 0.010;
    lfo3.connect(lg3); lg3.connect(g3.gain);
    n3.connect(f3); f3.connect(g3); g3.connect(_feen);
    n3.start(); lfo3.start();
  }

  /* ── Bach-Plätschern (kontinuierlich) ───────────────────────────────── */
  function _buildFeenStream() {
    // Gurgling – mittlere Frequenzen
    const n1 = _mkWhite(3);
    const f1 = _c.createBiquadFilter();
    f1.type = 'bandpass'; f1.frequency.value = 880; f1.Q.value = 1.6;
    const g1 = _c.createGain(); g1.gain.value = 0.085;
    const lfo1 = _c.createOscillator(); lfo1.frequency.value = 0.68;
    const lg1  = _c.createGain();       lg1.gain.value = 0.032;
    lfo1.connect(lg1); lg1.connect(g1.gain);
    n1.connect(f1); f1.connect(g1); g1.connect(_feen);
    n1.start(); lfo1.start();

    // Plätschern – hohe Frequenzen
    const n2 = _mkWhite(2.5);
    const f2 = _c.createBiquadFilter();
    f2.type = 'bandpass'; f2.frequency.value = 1700; f2.Q.value = 2.4;
    const g2 = _c.createGain(); g2.gain.value = 0.042;
    const lfo2 = _c.createOscillator(); lfo2.frequency.value = 1.18;
    const lg2  = _c.createGain();       lg2.gain.value = 0.016;
    lfo2.connect(lg2); lg2.connect(g2.gain);
    n2.connect(f2); f2.connect(g2); g2.connect(_feen);
    n2.start(); lfo2.start();

    // Tiefes Glucksen
    const n3 = _mkBrown(2);
    const f3 = _c.createBiquadFilter();
    f3.type = 'bandpass'; f3.frequency.value = 320; f3.Q.value = 3.5;
    const g3 = _c.createGain(); g3.gain.value = 0.048;
    const lfo3 = _c.createOscillator(); lfo3.frequency.value = 0.93;
    const lg3  = _c.createGain();       lg3.gain.value = 0.022;
    lfo3.connect(lg3); lg3.connect(g3.gain);
    n3.connect(f3); f3.connect(g3); g3.connect(_feen);
    n3.start(); lfo3.start();
  }

  /* ── Kristall-Summen der Pilze (kontinuierlich) ─────────────────────── */
  function _buildFeenCrystals() {
    // Harmonische Sinustöne in magischen Intervallen (Quarte + Quinte)
    const FREQS = [184.0, 220.0, 293.7, 330.0, 440.0, 587.3];
    FREQS.forEach((freq, i) => {
      const osc = _c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      // Leichte Verstimmung für lebendigen Klang
      const detune = (Math.random() - 0.5) * 8;
      osc.detune.value = detune;

      const g = _c.createGain(); g.gain.value = 0.022;
      const lfo = _c.createOscillator();
      lfo.frequency.value = 0.12 + i * 0.07 + Math.random() * 0.05;
      const lg = _c.createGain(); lg.gain.value = 0.016;
      lfo.connect(lg); lg.connect(g.gain);
      osc.connect(g); g.connect(_feen);
      osc.start(); lfo.start();
    });

    // Oberton-Schimmer (höhere Harmonische, sehr leise)
    [880, 1320, 1760].forEach((freq, i) => {
      const osc = _c.createOscillator(); osc.type = 'sine';
      osc.frequency.value = freq;
      const g = _c.createGain(); g.gain.value = 0.008;
      const lfo = _c.createOscillator(); lfo.frequency.value = 0.09 + i * 0.04;
      const lg  = _c.createGain();       lg.gain.value = 0.006;
      lfo.connect(lg); lg.connect(g.gain);
      osc.connect(g); g.connect(_feen);
      osc.start(); lfo.start();
    });
  }

  /* ── Insekten-Summen (kontinuierlich) ───────────────────────────────── */
  function _buildFeenInsects() {
    // Hochfrequentes Summen (Libellen/Käfer)
    const n1 = _mkWhite(2);
    const f1 = _c.createBiquadFilter();
    f1.type = 'bandpass'; f1.frequency.value = 3200; f1.Q.value = 14;
    const g1 = _c.createGain(); g1.gain.value = 0.055;
    const lfo1 = _c.createOscillator(); lfo1.frequency.value = 9.2;
    const lg1  = _c.createGain();       lg1.gain.value = 0.024;
    lfo1.connect(lg1); lg1.connect(g1.gain);
    n1.connect(f1); f1.connect(g1); g1.connect(_feen);
    n1.start(); lfo1.start();

    // Zweite Insekten-Schicht (anderer Rhythmus)
    const n2 = _mkWhite(1.8);
    const f2 = _c.createBiquadFilter();
    f2.type = 'bandpass'; f2.frequency.value = 4600; f2.Q.value = 9;
    const g2 = _c.createGain(); g2.gain.value = 0.032;
    const lfo2 = _c.createOscillator(); lfo2.frequency.value = 13.7;
    const lg2  = _c.createGain();       lg2.gain.value = 0.013;
    lfo2.connect(lg2); lg2.connect(g2.gain);
    n2.connect(f2); f2.connect(g2); g2.connect(_feen);
    n2.start(); lfo2.start();

    // Tieferes Brummen (Hummel)
    const n3 = _mkBrown(2.5);
    const f3 = _c.createBiquadFilter();
    f3.type = 'bandpass'; f3.frequency.value = 160; f3.Q.value = 6;
    const g3 = _c.createGain(); g3.gain.value = 0.038;
    const lfo3 = _c.createOscillator(); lfo3.frequency.value = 0.45;
    const lg3  = _c.createGain();       lg3.gain.value = 0.018;
    lfo3.connect(lg3); lg3.connect(g3.gain);
    n3.connect(f3); f3.connect(g3); g3.connect(_feen);
    n3.start(); lfo3.start();
  }

  /* ── Feen-Zwitschern / Glöckchen (periodisch) ───────────────────────── */
  function _fairyChime() {
    const t = _c.currentTime;
    // Manchmal Gruppen von 2–3 Glöckchen
    const count = Math.random() < 0.30 ? 2 + (Math.random() < 0.4 ? 1 : 0) : 1;

    for (let ci = 0; ci < count; ci++) {
      const d    = t + ci * _rnd(0.06, 0.22);
      const base = _rnd(1600, 3800);
      // Terz oder Quinte für harmonischen Klang
      const freq = base * (Math.random() < 0.5 ? 1.0 : (Math.random() < 0.5 ? 1.25 : 1.5));

      // FM-Glöckchen: Trägerwelle + Modulator für metallischen Charakter
      const osc = _c.createOscillator(); osc.type = 'sine';
      osc.frequency.value = freq;
      const mod = _c.createOscillator(); mod.type = 'sine';
      mod.frequency.value = freq * 1.414;   // √2 → leicht inharmonisch
      const mg = _c.createGain(); mg.gain.value = freq * 0.55;
      mod.connect(mg); mg.connect(osc.frequency);

      const env = _c.createGain();
      env.gain.setValueAtTime(0, d);
      env.gain.linearRampToValueAtTime(0.15, d + 0.004);
      env.gain.exponentialRampToValueAtTime(0.001, d + _rnd(0.40, 0.70));

      osc.connect(env); env.connect(_feen);
      mod.start(d); osc.start(d);
      mod.stop(d + 0.75); osc.stop(d + 0.75);
    }

    setTimeout(_fairyChime, _rnd(1500, 5500));
  }

  /* ── Magischer Vogelgesang (periodisch) ─────────────────────────────── */
  function _feenBird() {
    const t       = _c.currentTime;
    const phrases = Math.floor(_rnd(1, 4));

    for (let p = 0; p < phrases; p++) {
      const pd     = t + p * _rnd(0.35, 0.80);
      const startF = _rnd(500, 1800);
      const endF   = startF * _rnd(0.55, 1.85);
      const dur    = _rnd(0.18, 0.48);

      const osc = _c.createOscillator(); osc.type = 'sine';
      osc.frequency.setValueAtTime(startF, pd);
      osc.frequency.exponentialRampToValueAtTime(Math.max(80, endF), pd + dur * 0.72);

      // Kurzes Vibrato am Ende
      const vib = _c.createOscillator(); vib.frequency.value = _rnd(6, 11);
      const vg  = _c.createGain();       vg.gain.value = _rnd(6, 20);
      vib.connect(vg); vg.connect(osc.frequency);

      const env = _c.createGain();
      env.gain.setValueAtTime(0, pd);
      env.gain.linearRampToValueAtTime(0.11, pd + 0.035);
      env.gain.setValueAtTime(0.11, pd + dur - 0.04);
      env.gain.linearRampToValueAtTime(0, pd + dur);

      osc.connect(env); env.connect(_feen);
      vib.start(pd); osc.start(pd);
      vib.stop(pd + dur + 0.08); osc.stop(pd + dur + 0.08);
    }

    setTimeout(_feenBird, _rnd(7000, 24000));
  }

  /* ══════════════════════════════════════════════════════════════════════
     ENGINE
     ══════════════════════════════════════════════════════════════════════ */
  function _start() {
    if (_live) {
      if (_c && _c.state === 'suspended') _c.resume();
      return;
    }
    _live = true;
    
    _c = new (window.AudioContext || window.webkitAudioContext)();
    _m = _c.createGain(); _m.gain.value = 0.75; _m.connect(_c.destination);

    // ── Audiograph ──────────────────────────────────────────────────────
    //   _day  ─┐
    //   _nite ─┤→ _city ─┐
    //                     ├→ _m → destination
    //   _feen ────────────┘
    // ───────────────────────────────────────────────────────────────────
    _city = _c.createGain(); _city.gain.value = 1; _city.connect(_m);
    _day  = _c.createGain(); _day.gain.value  = 1; _day.connect(_city);
    _nite = _c.createGain(); _nite.gain.value = 0; _nite.connect(_city);
    _feen = _c.createGain(); _feen.gain.value = 0; _feen.connect(_m);

    // Kesselstadt (kontinuierlich)
    //_buildCrowd(); _buildFire(); _buildWind();
    _buildWind();
    // Kesselstadt (periodisch)
    _steamWhistle(); _gearClank(); _smithyHammer(); _owlCall();

    // Feenreich (kontinuierlich)
    _buildFeenAmbient(); _buildFeenStream(); _buildFeenCrystals(); _buildFeenInsects();
    // Feenreich (periodisch)
    _fairyChime(); _feenBird();

    // Pending-Zustände anwenden
    _applyMode(_pendingMode, /*instant=*/true);
    _setZone(_pendingZone,   /*instant=*/true);
  }

  /* ── Tages/Nacht-Modus ───────────────────────────────────────────────── */
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

  /* ── Zonen-Crossfade ─────────────────────────────────────────────────── */
  // zone: 'city' | 'feen'
  // Vom Torbereich hört man noch gedämpfte Stadtgeräusche im Feenreich (0.12).
  function _setZone(zone, instant) {
    _pendingZone = zone;
    if (!_c) return;
    const t      = _c.currentTime;
    const dur    = instant ? 0.02 : 4.0;
    const inFeen = zone === 'feen';

    _city.gain.cancelScheduledValues(t);
    _feen.gain.cancelScheduledValues(t);
    _city.gain.setValueAtTime(_city.gain.value, t);
    _feen.gain.setValueAtTime(_feen.gain.value, t);

    const cityTarget = _cityMuted ? 0 : (inFeen ? 0.12 : 1.0);
    const feenTarget = _feenMuted ? 0 : (inFeen ? 1.0  : 0.0);
    _city.gain.linearRampToValueAtTime(cityTarget, t + dur);
    _feen.gain.linearRampToValueAtTime(feenTarget, t + dur);
  }

  function _setCityMute(muted) { _cityMuted = muted; _setZone(_pendingZone, true); }
  function _setFeenMute(muted) { _feenMuted = muted; _setZone(_pendingZone, true); }

  /* ── Öffentliche API ─────────────────────────────────────────────────── */
  window._KS = {
    start:        _start,
    setMode:      _applyMode,
    setZone:      _setZone,
    setCityMute:  _setCityMute,
    setFeenMute:  _setFeenMute,
    setVol(v) { if (_m) _m.gain.value = Math.max(0, Math.min(1, v)); },
  };

  ['click', 'keydown', 'touchstart'].forEach(ev =>
    document.addEventListener(ev, _start, { once: true })
  );
})();
