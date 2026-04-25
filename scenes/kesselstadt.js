// ═══════════════════════════════════════════════════════════════════════════
// KESSELSTADT SZENE – A-Frame Komponente
// Baut den gesamten Stadtinhalt dynamisch auf.
// ═══════════════════════════════════════════════════════════════════════════

AFRAME.registerComponent('gate-trigger', {
  // Westtor wird durch lichtreich-gate gesteuert.
  // Südtor wird durch quest1-gate gesteuert.
  init() {},
  tick() {},
});

// ─── Hundefutter-Item am Marktstand 2 (Quest 1) ──────────────────────────────
// Knochen auf Tisch von Marktstand 2: world (4.2, 1.08, -4.5)
AFRAME.registerComponent('dog-food-item', {

  init() {
    if (!window.INVENTORY) window.INVENTORY = {};
    if (window.INVENTORY.dogFood === undefined) window.INVENTORY.dogFood = false;

    this._cam      = null;
    this._camWP    = new THREE.Vector3();
    this._picked   = false;
    this._near     = false;
    this._root     = null;
    this._hint     = null;
    this._touchBtn = null;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    document.addEventListener('keydown', e => {
      if (e.code === 'KeyE') this._tryPickup();
    });

    sc.addEventListener('loaded', () => {
      const rh = document.getElementById('rightHand');
      if (rh) rh.addEventListener('triggerdown', () => this._tryPickup());
    }, { once: true });
  },

  _build() {
    this._buildBone();
    this._buildHint();
    this._buildTouchBtn();
    this._addHUDSlot();
  },

  _buildBone() {
    const M = 'color:#e8dcc8;emissive:#ffe090;emissiveIntensity:0.5;shader:flat';
    const root = document.createElement('a-entity');
    root.setAttribute('id', 'dog-food-bone');
    root.setAttribute('position', '4.2 1.08 -4.5');
    root.setAttribute('rotation', '30 0 20');

    // Shaft
    const shaft = document.createElement('a-cylinder');
    shaft.setAttribute('radius', '0.018');
    shaft.setAttribute('height', '0.14');
    shaft.setAttribute('segments-radial', '6');
    shaft.setAttribute('material', M);
    root.appendChild(shaft);

    // Top knob
    const kTop = document.createElement('a-sphere');
    kTop.setAttribute('radius', '0.030');
    kTop.setAttribute('segments-width', '6');
    kTop.setAttribute('segments-height', '4');
    kTop.setAttribute('position', '0 0.082 0');
    kTop.setAttribute('material', M);
    root.appendChild(kTop);

    // Bottom knob
    const kBot = document.createElement('a-sphere');
    kBot.setAttribute('radius', '0.030');
    kBot.setAttribute('segments-width', '6');
    kBot.setAttribute('segments-height', '4');
    kBot.setAttribute('position', '0 -0.082 0');
    kBot.setAttribute('material', M);
    root.appendChild(kBot);

    // Warm glow
    const gl = document.createElement('a-entity');
    gl.setAttribute('light', 'type:point;color:#ffe0a0;intensity:0.35;distance:3');
    root.appendChild(gl);

    this.el.sceneEl.appendChild(root);
    this._root = root;
  },

  _buildHint() {
    const h = document.createElement('a-entity');
    h.setAttribute('position', '4.2 -200 -4.5');
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width', '1.12');
    frame.setAttribute('height', '0.24');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#c8a060;shader:flat;transparent:true;opacity:0.48;' +
      'emissive:#c8a060;emissiveIntensity:0.32');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width', '1.06');
    bg.setAttribute('height', '0.18');
    bg.setAttribute('material',
      'color:#100800;shader:flat;transparent:true;opacity:0.92');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', 'E / Trigger: Aufheben');
    txt.setAttribute('align', 'center');
    txt.setAttribute('color', '#ffe8b0');
    txt.setAttribute('width', '0.92');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    this._hint = h;
  },

  _buildTouchBtn() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch) return;
    if (document.getElementById('food-touch-btn')) return;

    const style = document.createElement('style');
    style.textContent = `
      #food-touch-btn {
        position: fixed; bottom: 200px; left: 50%;
        transform: translateX(-50%);
        background: rgba(200,160,80,0.90); color: #1a0800;
        border: none; border-radius: 30px;
        padding: 12px 30px; font-size: 17px;
        font-family: sans-serif; font-weight: bold;
        display: none; z-index: 10001; touch-action: none;
      }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'food-touch-btn';
    btn.textContent = 'Aufheben';
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      this._tryPickup();
    }, { passive: false });
    document.body.appendChild(btn);
    this._touchBtn = btn;
  },

  _addHUDSlot() {
    if (document.getElementById('inv-food-slot')) return;
    const hud = document.getElementById('inventory-hud');
    if (!hud) { setTimeout(() => this._addHUDSlot(), 150); return; }
    const slot = document.createElement('div');
    slot.id = 'inv-food-slot';
    slot.className = 'inv-slot';
    slot.textContent = '🦴';
    hud.appendChild(slot);
  },

  _tryPickup() {
    if (this._picked || !this._near) return;
    this._picked = true;

    window.INVENTORY.dogFood = true;

    if (this._root && this._root.parentNode)
      this._root.parentNode.removeChild(this._root);
    this._root = null;

    this._near = false;
    if (this._hint) this._hint.setAttribute('visible', 'false');
    if (this._touchBtn) this._touchBtn.style.display = 'none';

    const slot = document.getElementById('inv-food-slot');
    if (slot) slot.classList.add('has-item');
  },

  tick(t) {
    if (this._picked) return;
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam || !this._root) return;

    const ts = t * 0.001;

    if (this._root.object3D) {
      this._root.object3D.position.y = 1.08 + Math.sin(ts * 1.6) * 0.05;
      this._root.object3D.rotation.y = ts * 0.8;
    }

    this._cam.object3D.getWorldPosition(this._camWP);
    const dx   = this._camWP.x - 4.2;
    const dz   = this._camWP.z + 4.5;
    const near = (dx * dx + dz * dz) < 2.25;   // 1.5m radius

    if (near !== this._near) {
      this._near = near;
      if (this._hint) this._hint.setAttribute('visible', near ? 'true' : 'false');
      if (this._touchBtn) this._touchBtn.style.display = near ? 'block' : 'none';
    }

    if (this._near && this._hint && this._hint.object3D) {
      const iy = this._root ? this._root.object3D.position.y + 0.28 : 1.36;
      this._hint.object3D.position.set(4.2, iy, -4.5);
      this._hint.object3D.rotation.y = Math.atan2(
        this._camWP.x - 4.2,
        this._camWP.z + 4.5,
      );
    }
  },

  remove() {
    if (this._root && this._root.parentNode)
      this._root.parentNode.removeChild(this._root);
    if (this._hint && this._hint.parentNode)
      this._hint.parentNode.removeChild(this._hint);
  },
});

// ─── Magische Zeichen (Quest 1) ───────────────────────────────────────────────
// Drei Runen: Brunnen, Gasthaus-Vordach, Dampfmaschinen-Zahnrad.
// Bleiben unsichtbar bis window.INVENTORY.dogFood = true.
AFRAME.registerComponent('magic-signs', {

  _DEFS: [
    // x,y,z = Weltposition des Zeichens; ry = Y-Rotation; hy = Hint-Höhe
    { id: 'sign-brunnen', x:  0.00, y: 0.62, z:  1.90, ry:   0, hy: 1.20 },
    { id: 'sign-gasthaus',x: -9.00, y: 5.20, z: 11.58, ry:   0, hy: 3.00 },
    { id: 'sign-dampf',   x: 14.65, y: 1.50, z: -2.00, ry:  90, hy: 2.20 },
  ],

  init() {
    if (!window.QUEST1) window.QUEST1 = { signs: 0 };

    this._cam      = null;
    this._camWP    = new THREE.Vector3();
    this._signs    = [];       // { root, hint, done }
    this._revealed = false;
    this._nearIdx  = -1;
    this._touchBtn = null;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    document.addEventListener('keydown', e => {
      if (e.code === 'KeyE' && this._nearIdx >= 0) this._tryInspect(this._nearIdx);
    });

    sc.addEventListener('loaded', () => {
      const rh = document.getElementById('rightHand');
      if (rh) rh.addEventListener('triggerdown', () => {
        if (this._nearIdx >= 0) this._tryInspect(this._nearIdx);
      });
    }, { once: true });
  },

  _build() {
    this._DEFS.forEach(def => {
      this._signs.push({ root: this._mkSign(def), hint: this._mkHint(def), done: false });
    });
    this._mkTouchBtn();
    this._addHUDSlot();
  },

  _mkSign(def) {
    const M0   = 'color:#8844ff;emissive:#6622ee;emissiveIntensity:1.2;' +
                 'shader:flat;transparent:true;opacity:0';
    const ANIM = 'property:material.opacity; from:0; to:0.72; dur:2000; ' +
                 'easing:easeInSine; startEvents:sign-reveal; autoplay:false';

    const root = document.createElement('a-entity');
    root.setAttribute('id', def.id);
    root.setAttribute('position', `${def.x} ${def.y} ${def.z}`);
    root.setAttribute('rotation', `0 ${def.ry} 0`);
    root.setAttribute('visible', 'false');

    // Äußerer Ring
    const ring = document.createElement('a-torus');
    ring.setAttribute('radius', '0.115');
    ring.setAttribute('radius-tubular', '0.010');
    ring.setAttribute('segments-tubular', '20');
    ring.setAttribute('segments-radial', '12');
    ring.setAttribute('material', M0);
    ring.setAttribute('animation__reveal', ANIM);
    root.appendChild(ring);

    // Drei Rune-Striche (je 60° versetzt)
    [0, 60, 120].forEach(angle => {
      const stroke = document.createElement('a-box');
      stroke.setAttribute('width',  '0.012');
      stroke.setAttribute('height', '0.175');
      stroke.setAttribute('depth',  '0.006');
      stroke.setAttribute('rotation', `0 0 ${angle}`);
      stroke.setAttribute('material', M0);
      stroke.setAttribute('animation__reveal', ANIM);
      root.appendChild(stroke);
    });

    // Mittelpunkt
    const dot = document.createElement('a-sphere');
    dot.setAttribute('radius', '0.016');
    dot.setAttribute('segments-width',  '6');
    dot.setAttribute('segments-height', '4');
    dot.setAttribute('material', M0);
    dot.setAttribute('animation__reveal', ANIM);
    root.appendChild(dot);

    this.el.sceneEl.appendChild(root);
    return root;
  },

  _mkHint(def) {
    const h = document.createElement('a-entity');
    h.setAttribute('position', `${def.x} -200 ${def.z}`);
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width', '1.28');
    frame.setAttribute('height', '0.24');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#8844ff;shader:flat;transparent:true;opacity:0.48;' +
      'emissive:#8844ff;emissiveIntensity:0.32');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width', '1.22');
    bg.setAttribute('height', '0.18');
    bg.setAttribute('material',
      'color:#080010;shader:flat;transparent:true;opacity:0.92');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', 'E / Trigger: Untersuchen');
    txt.setAttribute('align', 'center');
    txt.setAttribute('color', '#ddaaff');
    txt.setAttribute('width', '1.04');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    return h;
  },

  _mkTouchBtn() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch || document.getElementById('sign-touch-btn')) return;

    const style = document.createElement('style');
    style.textContent = `
      #sign-touch-btn {
        position: fixed; bottom: 200px; left: 50%;
        transform: translateX(-50%);
        background: rgba(136,68,255,0.90); color: #fff;
        border: none; border-radius: 30px;
        padding: 12px 30px; font-size: 17px;
        font-family: sans-serif; font-weight: bold;
        display: none; z-index: 10001; touch-action: none;
      }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'sign-touch-btn';
    btn.textContent = 'Untersuchen';
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      if (this._nearIdx >= 0) this._tryInspect(this._nearIdx);
    }, { passive: false });
    document.body.appendChild(btn);
    this._touchBtn = btn;
  },

  _addHUDSlot() {
    if (document.getElementById('inv-signs-slot')) return;
    const hud = document.getElementById('inventory-hud');
    if (!hud) { setTimeout(() => this._addHUDSlot(), 150); return; }

    const slot = document.createElement('div');
    slot.id    = 'inv-signs-slot';
    slot.className = 'inv-slot';
    slot.textContent = '✦ 0/3';
    slot.style.fontSize = '13px';
    slot.style.minWidth = '56px';
    slot.style.padding  = '0 6px';
    hud.appendChild(slot);
  },

  _tryInspect(idx) {
    const s = this._signs[idx];
    if (!s || s.done) return;
    s.done = true;

    window.QUEST1.signs = Math.min(3, (window.QUEST1.signs || 0) + 1);

    // Zeichen hell aufleuchten (einmalig – kein tick-setAttribute)
    const BRIGHT = 'color:#ccaaff;emissive:#9955ff;emissiveIntensity:3.0;' +
                   'shader:flat;transparent:true;opacity:0.95';
    s.root.querySelectorAll('a-torus, a-box, a-sphere')
      .forEach(el => el.setAttribute('material', BRIGHT));

    if (s.hint) s.hint.setAttribute('visible', 'false');
    if (this._nearIdx === idx) {
      this._nearIdx = -1;
      if (this._touchBtn) this._touchBtn.style.display = 'none';
    }
    this._updateHUD();
  },

  _updateHUD() {
    const slot = document.getElementById('inv-signs-slot');
    if (!slot) return;
    const n = window.QUEST1 ? (window.QUEST1.signs || 0) : 0;
    slot.textContent = `✦ ${n}/3`;
    if (n > 0) slot.classList.add('has-item');
  },

  tick() {
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam) return;

    // Einmalige Enthüllung sobald Futter aufgehoben
    if (!this._revealed && window.INVENTORY && window.INVENTORY.dogFood) {
      this._revealed = true;
      this._signs.forEach(s => {
        if (s.done) return;
        s.root.setAttribute('visible', 'true');
        s.root.querySelectorAll('a-torus, a-box, a-sphere')
          .forEach(el => el.emit('sign-reveal'));
      });
    }

    if (!this._revealed) return;

    // Nächstes unberührtes Zeichen innerhalb 2m XZ suchen
    this._cam.object3D.getWorldPosition(this._camWP);
    let newNear = -1;
    let bestD2  = 4.0;  // 2m²

    this._DEFS.forEach((def, i) => {
      if (this._signs[i].done) return;
      const dx = this._camWP.x - def.x;
      const dz = this._camWP.z - def.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < bestD2) { bestD2 = d2; newNear = i; }
    });

    if (newNear !== this._nearIdx) {
      if (this._nearIdx >= 0 && this._signs[this._nearIdx])
        this._signs[this._nearIdx].hint.setAttribute('visible', 'false');
      this._nearIdx = newNear;
      if (newNear >= 0)
        this._signs[newNear].hint.setAttribute('visible', 'true');
      if (this._touchBtn)
        this._touchBtn.style.display = newNear >= 0 ? 'block' : 'none';
    }

    // Aktives Hinweis-Panel kamerazugewandt positionieren
    if (this._nearIdx >= 0) {
      const def = this._DEFS[this._nearIdx];
      const h   = this._signs[this._nearIdx].hint;
      if (h && h.object3D) {
        h.object3D.position.set(def.x, def.hy, def.z);
        h.object3D.rotation.y = Math.atan2(
          this._camWP.x - def.x,
          this._camWP.z - def.z,
        );
      }
    }
  },

  remove() {
    this._signs.forEach(s => {
      if (s.root && s.root.parentNode) s.root.parentNode.removeChild(s.root);
      if (s.hint && s.hint.parentNode) s.hint.parentNode.removeChild(s.hint);
    });
  },
});

// ─── Quest 1: Südtor-Mechanik ─────────────────────────────────────────────────
// Südtor bleibt zu bis alle 3 Zeichen untersucht wurden.
// Bei Abschluss: Zeichen aufleuchten → Feen-Partikel → Tor öffnet.
AFRAME.registerComponent('quest1-gate', {

  init() {
    if (!window.QUEST1) window.QUEST1 = { signs: 0, dogFed: false, completed: false };

    this._cam       = null;
    this._camWP     = new THREE.Vector3();
    this._hint      = null;
    this._hintVis   = false;
    this._triggered = false;
    this._particles = [];
    this._partLight = null;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });
  },

  _build() {
    this._buildHint();
    this._buildParticles();
  },

  _buildHint() {
    const h = document.createElement('a-entity');
    h.setAttribute('id', 'quest1-gate-hint');
    h.setAttribute('position', '0 -200 28');
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width', '1.52');
    frame.setAttribute('height', '0.26');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#cc8800;shader:flat;transparent:true;opacity:0.52;' +
      'emissive:#cc8800;emissiveIntensity:0.30');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width', '1.46');
    bg.setAttribute('height', '0.20');
    bg.setAttribute('material',
      'color:#0d0800;shader:flat;transparent:true;opacity:0.92');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', 'Finde die drei Zeichen');
    txt.setAttribute('align', 'center');
    txt.setAttribute('color', '#ffdd88');
    txt.setAttribute('width', '1.26');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    this._hint = h;
  },

  _buildParticles() {
    // 8 kleine Feen-Orbs am Südtor (z≈27.5) – initial unsichtbar
    const COLS = ['#88ffcc', '#aaffee', '#66ffbb', '#ccffee',
                  '#88eeff', '#aaffdd', '#77ffcc', '#bbffee'];
    const root = document.createElement('a-entity');
    root.setAttribute('id', 'quest1-particles');
    root.setAttribute('visible', 'false');

    COLS.forEach((col, i) => {
      const orb = document.createElement('a-sphere');
      orb.setAttribute('radius', '0.06');
      orb.setAttribute('segments-width', '6');
      orb.setAttribute('segments-height', '4');
      orb.setAttribute('material',
        `color:${col};emissive:${col};emissiveIntensity:2.0;shader:flat;transparent:true;opacity:0.85`);
      root.appendChild(orb);
      this._particles.push({ el: orb, idx: i });
    });

    const pl = document.createElement('a-entity');
    pl.setAttribute('light', 'type:point;color:#88ffcc;intensity:1.4;distance:8');
    pl.setAttribute('position', '0 2 27.5');
    root.appendChild(pl);
    this._partLight = pl;

    this.el.sceneEl.appendChild(root);
    this._partRoot = root;
  },

  _openSouthGate() {
    document.getElementById('gate-south-left')?.emit('gate-open');
    document.getElementById('gate-south-right')?.emit('gate-open');
  },

  _triggerComplete() {
    this._triggered = true;
    window.QUEST1.completed = true;

    if (this._hint) this._hint.setAttribute('visible', 'false');

    // 1. Alle Zeichen kurz weiß aufleuchten
    const WHITE = 'color:#ffffff;emissive:#ffffff;emissiveIntensity:4.0;' +
                  'shader:flat;transparent:true;opacity:1.0';
    const PURPLE = 'color:#ccaaff;emissive:#9955ff;emissiveIntensity:3.0;' +
                   'shader:flat;transparent:true;opacity:0.95';
    const signIds = ['sign-brunnen', 'sign-gasthaus', 'sign-dampf'];
    signIds.forEach(id => {
      const sign = document.getElementById(id);
      if (!sign) return;
      sign.querySelectorAll('a-torus, a-box, a-sphere')
        .forEach(el => el.setAttribute('material', WHITE));
    });

    setTimeout(() => {
      signIds.forEach(id => {
        const sign = document.getElementById(id);
        if (!sign) return;
        sign.querySelectorAll('a-torus, a-box, a-sphere')
          .forEach(el => el.setAttribute('material', PURPLE));
      });
    }, 1000);

    // 2. Feen-Partikel einblenden
    if (this._partRoot) this._partRoot.setAttribute('visible', 'true');

    // 3. Südtor nach kurzem Delay öffnen
    setTimeout(() => this._openSouthGate(), 800);
  },

  tick(t) {
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam) return;

    const ts = t * 0.001;

    // Partikel animieren (Kreis um Toreingang)
    if (this._triggered && this._partRoot && this._partRoot.object3D.visible) {
      this._particles.forEach(p => {
        const angle = ts * 1.2 + (p.idx / this._particles.length) * Math.PI * 2;
        p.el.object3D.position.set(
          Math.cos(angle) * 1.8,
          1.4 + Math.sin(ts * 1.8 + p.idx) * 0.6,
          27.4 + Math.sin(angle) * 0.3,
        );
      });
    }

    if (this._triggered) return;

    this._cam.object3D.getWorldPosition(this._camWP);
    const dx = this._camWP.x;
    const dz = this._camWP.z - 28;
    const d2 = dx * dx + dz * dz;

    const q1done = window.QUEST1 && window.QUEST1.signs >= 3;

    if (q1done) {
      this._triggerComplete();
      return;
    }

    // Hinweis bei < 3m, Quest nicht abgeschlossen
    const nearGate = d2 < 9;   // 3m²
    if (nearGate !== this._hintVis) {
      this._hintVis = nearGate;
      if (this._hint) this._hint.setAttribute('visible', nearGate ? 'true' : 'false');
    }

    if (this._hintVis && this._hint && this._hint.object3D) {
      this._hint.object3D.position.set(0, 2.0, 28);
      this._hint.object3D.rotation.y = Math.atan2(
        this._camWP.x,
        this._camWP.z - 28,
      );
    }
  },

  remove() {
    if (this._hint && this._hint.parentNode)
      this._hint.parentNode.removeChild(this._hint);
    if (this._partRoot && this._partRoot.parentNode)
      this._partRoot.parentNode.removeChild(this._partRoot);
  },
});

AFRAME.registerComponent('kesselstadt-scene', {
  init() {
    // Szene-HTML einmalig einfügen, sobald A-Frame bereit ist
    this.el.insertAdjacentHTML('beforeend', KESSELSTADT_HTML);

    // VR-Audio starten sobald VR-Session beginnt
    this.el.addEventListener('loaded', () => {
      this.el.addEventListener('enter-vr', () => {
        if (window._KS) window._KS.start();
      });
    });
  }
});

// ─── Szenen-HTML ─────────────────────────────────────────────────────────────
// Alle visuellen Elemente der Kesselstadt als Template-String.
// Licht und Spieler-Rig sind in index.html definiert.
// ─────────────────────────────────────────────────────────────────────────────
const KESSELSTADT_HTML = /* html */`

  <!-- ═══ HIMMEL – prozedurale Sky-Sphere ═══ -->
  <a-entity id="sky-sphere"
    geometry="primitive:sphere; radius:4900; segmentsWidth:36; segmentsHeight:18"
    material="shader:flat; color:#ffffff; side:back"
    tex="id:sky-canvas; repx:1; repy:1">
  </a-entity>

  <!-- ═══ BODEN ═══ -->
  <a-plane position="0 0 -5.5" rotation="-90 0 0" width="80" height="69"
    material="color:#ffffff;roughness:1"
    tex="id:tex-cobble; repx:20; repy:20"
    shadow="receive:true">
  </a-plane>
  <a-plane position="0 0.01 0" rotation="-90 0 0" width="14" height="14"
    material="color:#e8ddd0;roughness:1"
    tex="id:tex-cobble; repx:5; repy:5"
    shadow="receive:true">
  </a-plane>

  <!-- ═══ MARKTBRUNNEN ═══ -->
  <a-cylinder position="0 0.4 0" radius="2" height="0.8"
    material="color:#d8cfc0;roughness:0.9"
    tex="id:tex-stone; repx:3; repy:0.5"
    shadow="cast:true;receive:true">
  </a-cylinder>
  <a-cylinder position="0 0.82 0" radius="1.9" height="0.05"
    material="color:#b0a090;roughness:0.9">
  </a-cylinder>
  <a-cylinder position="0 0.76 0" radius="1.75" height="0.04"
    material="color:#4488aa;opacity:0.7;transparent:true;metalness:0.3;roughness:0.1">
  </a-cylinder>
  <a-cylinder position="0 1.4 0" radius="0.12" height="1.2"
    material="color:#c0b0a0;roughness:0.9"
    tex="id:tex-stone; repx:1; repy:1"
    shadow="cast:true">
  </a-cylinder>
  <a-sphere position="0 2.05 0" radius="0.22"
    material="color:#aabbcc;metalness:0.6;roughness:0.3" shadow="cast:true">
  </a-sphere>

  <!-- ═══ GEBÄUDE N-W: Schmied / Werkstatt ═══ -->
  <a-entity position="-9 0 -8">
    <a-box position="0 2 0" width="5" height="4" depth="5"
      material="color:#d8c8b8;roughness:0.9"
      tex="id:tex-stone; repx:2.5; repy:2"
      shadow="cast:true;receive:true">
    </a-box>
    <a-box position="0 4.6 0" width="5.4" height="1.2" depth="5.4"
      material="color:#c8b8a8;roughness:0.9"
      tex="id:tex-stone; repx:2.7; repy:0.6"
      shadow="cast:true">
    </a-box>
    <!-- Satteldach Schmied: ridge entlang X, Neigung über Z -->
    <a-box position="0 6.3 1.35" rotation="39.2 0 0" width="5.6" height="0.22" depth="3.48"
      material="color:#c89070;roughness:1" tex="id:tex-tiles; repx:3; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 6.3 -1.35" rotation="-39.2 0 0" width="5.6" height="0.22" depth="3.48"
      material="color:#c89070;roughness:1" tex="id:tex-tiles; repx:3; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 7.35 0" width="5.6" height="0.2" depth="0.3"
      material="color:#7a4a28;roughness:1"></a-box>
    <a-cylinder position="1 7.5 -1" radius="0.25" height="2"
      material="color:#2a2020;roughness:1" shadow="cast:true">
    </a-cylinder>
    <a-entity position="1 8.6 -1" steam></a-entity>
    <a-plane position="1.5 2.5 2.51" width="0.8" height="1"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-plane position="-1.2 2.5 2.51" width="0.8" height="1"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-box position="0 1.1 2.52" width="1" height="2.2" depth="0.06"
      material="color:#c8a070;roughness:0.9"
      tex="id:tex-wood; repx:0.9; repy:1">
    </a-box>
  </a-entity>

  <!-- ═══ GEBÄUDE N-O: Händlerhaus ═══ -->
  <a-entity position="9 0 -8">
    <a-box position="0 3 0" width="5" height="6" depth="5"
      material="color:#ddd0be;roughness:0.9"
      tex="id:tex-stone; repx:2.5; repy:3"
      shadow="cast:true;receive:true">
    </a-box>
    <a-box position="0 6.5 0" width="5.4" height="1" depth="5.4"
      material="color:#ccc0aa;roughness:0.9"
      tex="id:tex-stone; repx:2.7; repy:0.5"
      shadow="cast:true">
    </a-box>
    <!-- Satteldach Händlerhaus: ridge entlang X, Neigung über Z -->
    <a-box position="0 8.5 1.35" rotation="48.0 0 0" width="5.6" height="0.22" depth="4.04"
      material="color:#c8a098;roughness:1" tex="id:tex-tiles; repx:3; repy:2" shadow="cast:true"></a-box>
    <a-box position="0 8.5 -1.35" rotation="-48.0 0 0" width="5.6" height="0.22" depth="4.04"
      material="color:#c8a098;roughness:1" tex="id:tex-tiles; repx:3; repy:2" shadow="cast:true"></a-box>
    <a-box position="0 9.95 0" width="5.6" height="0.2" depth="0.3"
      material="color:#7a4a28;roughness:1"></a-box>
    <a-box position="0 3.5 2.8" width="2.5" height="2" depth="1"
      material="color:#d8c8b0;roughness:0.9"
      tex="id:tex-stone; repx:1.2; repy:1">
    </a-box>
    <a-plane position="1.5 4.5 2.51" width="0.9" height="1.2"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-plane position="-1.5 4.5 2.51" width="0.9" height="1.2"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-box position="0 1.1 2.52" width="1.1" height="2.2" depth="0.06"
      material="color:#b89060;roughness:0.9"
      tex="id:tex-wood; repx:1; repy:1">
    </a-box>
    <a-box position="0 2.8 2.58" width="2" height="0.6" depth="0.1"
      material="color:#c8a060;roughness:0.9"
      tex="id:tex-wood; repx:1.5; repy:0.5">
    </a-box>
  </a-entity>

  <!-- ═══ GEBÄUDE S-W: Gasthaus ═══ -->
  <a-entity position="-9 0 8">
    <a-box position="0 2.5 0" width="6" height="5" depth="5"
      material="color:#d8ccba;roughness:0.9"
      tex="id:tex-stone; repx:3; repy:2.5"
      shadow="cast:true;receive:true">
    </a-box>
    <a-box position="0 5.2 2.8" width="6.5" height="0.2" depth="1.5"
      material="color:#b89060;roughness:0.9"
      tex="id:tex-wood; repx:3; repy:0.5"
      shadow="cast:true">
    </a-box>
    <a-box position="-2.5 4.7 3.5" width="0.14" height="1.2" depth="0.14"
      material="color:#8a5530;roughness:1"
      tex="id:tex-wood; repx:0.5; repy:1">
    </a-box>
    <a-box position="2.5 4.7 3.5" width="0.14" height="1.2" depth="0.14"
      material="color:#8a5530;roughness:1"
      tex="id:tex-wood; repx:0.5; repy:1">
    </a-box>
    <a-entity position="-2.5 4.5 2.55">
      <a-cylinder radius="0.08" height="0.3" material="color:#333;roughness:0.8"></a-cylinder>
      <a-box position="0 -0.25 0" width="0.2" height="0.35" depth="0.2"
        material="color:#ffcc44;emissive:#ffaa22;emissiveIntensity:1;opacity:0.9;transparent:true"
        class="lantern-glow">
      </a-box>
      <a-entity class="lantern-light" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
    </a-entity>
    <a-entity position="2.5 4.5 2.55">
      <a-cylinder radius="0.08" height="0.3" material="color:#333;roughness:0.8"></a-cylinder>
      <a-box position="0 -0.25 0" width="0.2" height="0.35" depth="0.2"
        material="color:#ffcc44;emissive:#ffaa22;emissiveIntensity:1;opacity:0.9;transparent:true"
        class="lantern-glow">
      </a-box>
      <a-entity class="lantern-light" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
    </a-entity>
    <!-- Satteldach Gasthaus: ridge entlang X, Neigung über Z -->
    <a-box position="0 6.25 1.35" rotation="42.8 0 0" width="6.4" height="0.22" depth="3.68"
      material="color:#c09078;roughness:1" tex="id:tex-tiles; repx:3.5; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 6.25 -1.35" rotation="-42.8 0 0" width="6.4" height="0.22" depth="3.68"
      material="color:#c09078;roughness:1" tex="id:tex-tiles; repx:3.5; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 7.45 0" width="6.4" height="0.2" depth="0.3"
      material="color:#7a4a28;roughness:1"></a-box>
    <a-box position="0 1.2 2.52" width="1.2" height="2.4" depth="0.06"
      material="color:#c09060;roughness:0.9"
      tex="id:tex-wood; repx:1; repy:1">
    </a-box>
  </a-entity>

  <!-- ═══ GEBÄUDE S-O: Alchemistenladen ═══ -->
  <a-entity position="9 0 8">
    <a-box position="0 2.5 0" width="4.5" height="5" depth="4.5"
      material="color:#c8cdb8;roughness:0.9"
      tex="id:tex-stone; repx:2.2; repy:2.5"
      shadow="cast:true;receive:true">
    </a-box>
    <a-cylinder position="2.5 3.5 -2" radius="1.2" height="7"
      material="color:#b8bda8;roughness:0.9"
      tex="id:tex-stone; repx:2; repy:3.5"
      shadow="cast:true">
    </a-cylinder>
    <a-cone position="2.5 7.5 -2" radius-bottom="1.5" radius-top="0" height="2"
      material="color:#a07868;roughness:1"
      tex="id:tex-tiles; repx:2; repy:1.5"
      shadow="cast:true">
    </a-cone>
    <!-- Satteldach Alchemistenladen: ridge entlang X, Neigung über Z -->
    <a-box position="0 6.0 1.225" rotation="39.2 0 0" width="4.9" height="0.22" depth="3.16"
      material="color:#a07868;roughness:1" tex="id:tex-tiles; repx:2.5; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 6.0 -1.225" rotation="-39.2 0 0" width="4.9" height="0.22" depth="3.16"
      material="color:#a07868;roughness:1" tex="id:tex-tiles; repx:2.5; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 6.95 0" width="4.9" height="0.2" depth="0.3"
      material="color:#7a4a28;roughness:1"></a-box>
    <a-plane position="-1 3 2.26" width="0.8" height="1"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-plane position="1 3 2.26" width="0.8" height="1"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-box position="0 1.1 2.27" width="1" height="2.2" depth="0.06"
      material="color:#a08860;roughness:0.9"
      tex="id:tex-wood; repx:0.9; repy:1">
    </a-box>
  </a-entity>

  <!-- ═══ UHRTURM ═══ -->
  <a-entity position="-14 0 -2">
    <a-box position="0 1 0" width="4.5" height="2" depth="4.5"
      material="color:#c8c0b8;roughness:0.9"
      tex="id:tex-stone; repx:2.2; repy:1"
      shadow="cast:true;receive:true">
    </a-box>
    <a-cylinder position="0 8 0" radius="1.8" height="12"
      material="color:#d0c8c0;roughness:0.9"
      tex="id:tex-stone; repx:4; repy:5"
      shadow="cast:true">
    </a-cylinder>
    <a-cylinder position="0 14.2 0" radius="2.3" height="0.4"
      material="color:#b0a8a0;roughness:0.9"
      tex="id:tex-stone; repx:2; repy:0.2"
      shadow="cast:true">
    </a-cylinder>
    <a-cylinder position="0 16 0" radius="2" height="3"
      material="color:#c8c0b8;roughness:0.9"
      tex="id:tex-stone; repx:3; repy:1.5"
      shadow="cast:true">
    </a-cylinder>
    <a-circle position="0 16 2.02" radius="1.5"
      material="color:#ddccaa;emissive:#ccbb88;emissiveIntensity:0.15">
    </a-circle>
    <a-circle position="0 16 -2.02" rotation="0 180 0" radius="1.5"
      material="color:#ddccaa;emissive:#ccbb88;emissiveIntensity:0.15">
    </a-circle>
    <a-circle position="2.02 16 0" rotation="0 -90 0" radius="1.5"
      material="color:#ddccaa;emissive:#ccbb88;emissiveIntensity:0.15">
    </a-circle>
    <a-circle position="-2.02 16 0" rotation="0 90 0" radius="1.5"
      material="color:#ddccaa;emissive:#ccbb88;emissiveIntensity:0.15">
    </a-circle>
    <a-cone position="0 19.5 0" radius-bottom="2.2" radius-top="0" height="3"
      material="color:#b08070;roughness:1"
      tex="id:tex-tiles; repx:2.5; repy:2"
      shadow="cast:true">
    </a-cone>
    <a-cylinder position="0 22.3 0" radius="0.08" height="1.5"
      material="color:#888;metalness:0.8">
    </a-cylinder>
    <a-torus position="2.1 10 0" rotation="0 90 0" radius="1.1" radius-tubular="0.12"
      material="color:#7a6a40;metalness:0.5;roughness:0.6" gear-spin="speed:0.5">
    </a-torus>
    <a-torus position="-2.1 10 0" rotation="0 90 0" radius="0.75" radius-tubular="0.1"
      material="color:#6a5a30;metalness:0.5;roughness:0.6" gear-spin="speed:0.75;reverse:true">
    </a-torus>
    <a-cylinder position="0.8 14 -1.5" radius="0.22" height="4"
      material="color:#2a2020;roughness:1">
    </a-cylinder>
    <a-entity position="0.8 16.1 -1.5" steam></a-entity>
  </a-entity>

  <!-- ═══ DAMPFMASCHINE ═══ -->
  <a-entity position="13 0 -2">
    <a-cylinder position="0 1.5 0" rotation="0 0 90" radius="0.9" height="3"
      material="color:#7a5530;metalness:0.4;roughness:0.6" shadow="cast:true">
    </a-cylinder>
    <a-box position="-1 0.5 0.5"  width="0.2" height="1" depth="0.2" material="color:#4a3820"></a-box>
    <a-box position="1 0.5 0.5"   width="0.2" height="1" depth="0.2" material="color:#4a3820"></a-box>
    <a-box position="-1 0.5 -0.5" width="0.2" height="1" depth="0.2" material="color:#4a3820"></a-box>
    <a-box position="1 0.5 -0.5"  width="0.2" height="1" depth="0.2" material="color:#4a3820"></a-box>
    <a-torus position="1.7 1.5 0" rotation="0 90 0" radius="1.2" radius-tubular="0.15"
      material="color:#8a7040;metalness:0.6;roughness:0.5" gear-spin="speed:0.4">
    </a-torus>
    <a-torus position="1.7 1.5 0" rotation="0 90 0" radius="0.6" radius-tubular="0.1"
      material="color:#6a5030;metalness:0.5;roughness:0.5" gear-spin="speed:0.8;reverse:true">
    </a-torus>
    <a-cylinder position="-0.5 3.5 0" radius="0.2" height="2.5"
      material="color:#2a2020;roughness:1" shadow="cast:true">
    </a-cylinder>
    <a-entity position="-0.5 4.8 0" steam></a-entity>
    <a-cylinder position="0 2.5 0.95" radius="0.25" height="0.1"
      material="color:#ccbb88;metalness:0.5">
    </a-cylinder>
    <a-circle position="0 2.5 1.01" radius="0.22"
      material="color:#ddccaa;emissive:#ccbb88;emissiveIntensity:0.2">
    </a-circle>
  </a-entity>

  <!-- ═══ STADTLATERNEN (Marktplatz-Ring) ═══ -->
  <a-entity position="-6 0 -6">
    <a-cylinder position="0 2.5 0" radius="0.06" height="5" material="color:#3a3030"></a-cylinder>
    <a-cylinder position="0.4 4.8 0" rotation="0 0 20" radius="0.04" height="0.8" material="color:#3a3030"></a-cylinder>
    <a-box position="0.55 5.05 0" width="0.25" height="0.35" depth="0.25"
      class="lantern-glow" material="color:#886633;roughness:0.6">
    </a-box>
    <a-entity class="lantern-light" position="0.55 5.05 0" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
  </a-entity>
  <a-entity position="6 0 -6">
    <a-cylinder position="0 2.5 0" radius="0.06" height="5" material="color:#3a3030"></a-cylinder>
    <a-cylinder position="-0.4 4.8 0" rotation="0 0 -20" radius="0.04" height="0.8" material="color:#3a3030"></a-cylinder>
    <a-box position="-0.55 5.05 0" width="0.25" height="0.35" depth="0.25"
      class="lantern-glow" material="color:#886633;roughness:0.6">
    </a-box>
    <a-entity class="lantern-light" position="-0.55 5.05 0" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
  </a-entity>
  <a-entity position="-6 0 6">
    <a-cylinder position="0 2.5 0" radius="0.06" height="5" material="color:#3a3030"></a-cylinder>
    <a-cylinder position="0.4 4.8 0" rotation="0 0 20" radius="0.04" height="0.8" material="color:#3a3030"></a-cylinder>
    <a-box position="0.55 5.05 0" width="0.25" height="0.35" depth="0.25"
      class="lantern-glow" material="color:#886633;roughness:0.6">
    </a-box>
    <a-entity class="lantern-light" position="0.55 5.05 0" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
  </a-entity>
  <a-entity position="6 0 6">
    <a-cylinder position="0 2.5 0" radius="0.06" height="5" material="color:#3a3030"></a-cylinder>
    <a-cylinder position="-0.4 4.8 0" rotation="0 0 -20" radius="0.04" height="0.8" material="color:#3a3030"></a-cylinder>
    <a-box position="-0.55 5.05 0" width="0.25" height="0.35" depth="0.25"
      class="lantern-glow" material="color:#886633;roughness:0.6">
    </a-box>
    <a-entity class="lantern-light" position="-0.55 5.05 0" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
  </a-entity>

  <!-- ═══ MARKTSTÄNDE ═══ -->
  <a-entity position="-3.5 0 -4.5">
    <a-box position="0 0.9 0" width="2.5" height="0.15" depth="1.5"
      material="color:#c8a870;roughness:0.9" tex="id:tex-wood; repx:1.5; repy:1"></a-box>
    <a-box position="-1.1 0.45 0" width="0.12" height="0.9" depth="0.12"
      material="color:#8a5530;roughness:1" tex="id:tex-wood; repx:0.5; repy:1"></a-box>
    <a-box position="1.1 0.45 0" width="0.12" height="0.9" depth="0.12"
      material="color:#8a5530;roughness:1" tex="id:tex-wood; repx:0.5; repy:1"></a-box>
    <a-box position="0 1.5 0" width="2.8" height="0.12" depth="1.8" rotation="5 0 0"
      material="color:#c84444;roughness:1"></a-box>
    <a-sphere position="-0.5 1.1 0"   radius="0.15" material="color:#ff6644"></a-sphere>
    <a-sphere position="0   1.1 0.1"  radius="0.13" material="color:#ffaa22"></a-sphere>
    <a-sphere position="0.5 1.1 -0.1" radius="0.14" material="color:#cc4444"></a-sphere>
  </a-entity>
  <a-entity position="3.5 0 -4.5">
    <a-box position="0 0.9 0" width="2.5" height="0.15" depth="1.5"
      material="color:#c8a870;roughness:0.9" tex="id:tex-wood; repx:1.5; repy:1"></a-box>
    <a-box position="-1.1 0.45 0" width="0.12" height="0.9" depth="0.12"
      material="color:#8a5530;roughness:1" tex="id:tex-wood; repx:0.5; repy:1"></a-box>
    <a-box position="1.1 0.45 0" width="0.12" height="0.9" depth="0.12"
      material="color:#8a5530;roughness:1" tex="id:tex-wood; repx:0.5; repy:1"></a-box>
    <a-box position="0 1.5 0" width="2.8" height="0.12" depth="1.8" rotation="-5 0 0"
      material="color:#4488cc;roughness:1"></a-box>
    <a-box position="-0.5 1.08 0" width="0.3" height="0.2" depth="0.4" material="color:#4a3010"></a-box>
    <a-box position="0.2 1.08 0"  width="0.25" height="0.22" depth="0.35" material="color:#5a4020"></a-box>
  </a-entity>

  <!-- ═══ TOR NORD → Sturmreich ═══ -->
  <a-entity position="0 0 -28">
    <a-cylinder position="-4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cylinder position="4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="-4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"w
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-cone position="4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.5"
      theta-length="180" theta-start="0"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:1" shadow="cast:true"></a-torus>
    <a-box position="0 3 0" width="6" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:3; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 2.5 0" width="4" height="5" depth="1.8" material="color:#111;roughness:1"></a-box>
    <a-box position="0 5.5 0" width="1.2" height="0.8" depth="1.8"
      material="color:#b8b0a8;roughness:0.9" tex="id:tex-stone; repx:0.6; repy:0.4"></a-box>
    <a-box position="0 7.5 0.85" width="3" height="0.8" depth="0.2"
      material="color:#c8a060;roughness:0.9" tex="id:tex-wood; repx:2; repy:0.6"></a-box>
    <a-text value="STURMREICH" position="0 7.5 0.96" align="center" color="#ddccaa" width="3.5"
      font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    <a-box position="-12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="-15 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-13 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-11 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-9 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="9 6.5 0"   width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="11 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="13 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="15 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ═══ TOR SÜD → Feenreich ═══ -->
  <a-entity position="0 0 28">
    <a-cylinder position="-4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cylinder position="4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="-4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-cone position="4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.5"
      theta-length="180" theta-start="0"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:1" shadow="cast:true"></a-torus>
    <!-- Torrahmen Süd: linke + rechte Seite + Sturz (Öffnung x=-2..2, y=0..5 bleibt frei) -->
    <a-box position="-2.5 3 0" width="1" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:0.5; repy:3" shadow="cast:true"></a-box>
    <a-box position=" 2.5 3 0" width="1" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:0.5; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 5.5 0" width="4" height="1" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:0.5" shadow="cast:true"></a-box>
    <a-box position="0 6.2 0" width="1.2" height="0.8" depth="1.8"
      material="color:#b8b0a8;roughness:0.9" tex="id:tex-stone; repx:0.6; repy:0.4"></a-box>
    <!-- Schild Südseite (sichtbar aus dem Feenreich) -->
    <a-box position="0 7.5 0.85" width="3" height="0.8" depth="0.2"
      material="color:#c8a060;roughness:0.9" tex="id:tex-wood; repx:2; repy:0.6"></a-box>
    <a-text value="FEENREICH" position="0 7.5 0.96" align="center" color="#88ff88" width="3.5"></a-text>
    <!-- Schild Nordseite (sichtbar aus der Kesselstadt) -->
    <a-box position="0 7.5 -0.85" width="3" height="0.8" depth="0.2"
      material="color:#c8a060;roughness:0.9" tex="id:tex-wood; repx:2; repy:0.6"></a-box>
    <a-text value="FEENREICH" position="0 7.5 -0.96" rotation="0 180 0" align="center" color="#88ff88" width="3.5"></a-text>
    <a-box position="-12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="-15 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-13 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-11 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-9 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="9 6.5 0"   width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="11 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="13 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="15 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <!-- Torflügel SÜD – linker Flügel (Scharnier an linkem Pfosten, x=-2) -->
    <a-entity id="gate-south-left" position="-2 0 0"
      animation__open="property:rotation; to:0 90 0; dur:1600; easing:easeInOutSine; startEvents:gate-open; autoplay:false"
      animation__close="property:rotation; to:0 0 0; dur:1400; easing:easeInOutSine; startEvents:gate-close; autoplay:false">
      <a-box position="0.95 2.5 0" width="1.9" height="5" depth="0.14"
        tex="id:tex-wood; repx:1; repy:2.5"
        material="color:#7a5430; shader:flat">
      </a-box>
      <a-box position="0.95 4.2 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
      <a-box position="0.95 0.8 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
    </a-entity>
    <!-- Torflügel SÜD – rechter Flügel (Scharnier an rechtem Pfosten, x=+2) -->
    <a-entity id="gate-south-right" position="2 0 0"
      animation__open="property:rotation; to:0 -90 0; dur:1600; easing:easeInOutSine; startEvents:gate-open; autoplay:false"
      animation__close="property:rotation; to:0 0 0; dur:1400; easing:easeInOutSine; startEvents:gate-close; autoplay:false">
      <a-box position="-0.95 2.5 0" width="1.9" height="5" depth="0.14"
        tex="id:tex-wood; repx:1; repy:2.5"
        material="color:#7a5430; shader:flat">
      </a-box>
      <a-box position="-0.95 4.2 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
      <a-box position="-0.95 0.8 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
    </a-entity>
  </a-entity>

  <!-- ═══ TOR OST → Schattenreich ═══ -->
  <a-entity position="28 0 0" rotation="0 90 0">
    <a-cylinder position="-4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cylinder position="4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="-4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-cone position="4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.5"
      theta-length="180" theta-start="0"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:1" shadow="cast:true"></a-torus>
    <a-box position="0 3 0" width="6" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:3; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 2.5 0" width="4" height="5" depth="1.8" material="color:#111;roughness:1"></a-box>
    <a-box position="0 5.5 0" width="1.2" height="0.8" depth="1.8"
      material="color:#b8b0a8;roughness:0.9" tex="id:tex-stone; repx:0.6; repy:0.4"></a-box>
    <a-box position="0 7.5 0.85" width="3.5" height="0.8" depth="0.2"
      material="color:#c8a060;roughness:0.9" tex="id:tex-wood; repx:2.5; repy:0.6"></a-box>
    <a-text value="SCHATTENREICH" position="0 7.5 0.96" align="center" color="#aaaaff" width="3.8"
      font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    <a-box position="-12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="-15 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-13 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-11 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-9 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="9 6.5 0"   width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="11 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="13 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="15 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ═══ TOR WEST → Lichtreich ═══ -->
  <a-entity position="-28 0 0" rotation="0 -90 0">
    <a-cylinder position="-4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cylinder position="4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="-4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-cone position="4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.5"
      theta-length="180" theta-start="0"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:1" shadow="cast:true"></a-torus>
    <!-- Torrahmen West: linke + rechte Seite + Sturz (Öffnung x=-2..2, y=0..5 bleibt frei) -->
    <a-box position="-2.5 3 0" width="1" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:0.5; repy:3" shadow="cast:true"></a-box>
    <a-box position=" 2.5 3 0" width="1" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:0.5; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 5.5 0" width="4" height="1" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:0.5" shadow="cast:true"></a-box>
    <a-box position="0 6.2 0" width="1.2" height="0.8" depth="1.8"
      material="color:#b8b0a8;roughness:0.9" tex="id:tex-stone; repx:0.6; repy:0.4"></a-box>
    <a-box position="0 7.5 0.85" width="3" height="0.8" depth="0.2"
      material="color:#c8a060;roughness:0.9" tex="id:tex-wood; repx:2; repy:0.6"></a-box>
    <a-text value="LICHTREICH" position="0 7.5 0.96" align="center" color="#ffffaa" width="3.5"
      font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    <a-box position="-12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="-15 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-13 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-11 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-9 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="9 6.5 0"   width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="11 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="13 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="15 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <!-- Torflügel WEST – linker Flügel (Scharnier an linkem Pfosten, x=-2) -->
    <a-entity id="gate-west-left" position="-2 0 0"
      animation__open="property:rotation; to:0 90 0; dur:1600; easing:easeInOutSine; startEvents:gate-open; autoplay:false"
      animation__close="property:rotation; to:0 0 0; dur:1400; easing:easeInOutSine; startEvents:gate-close; autoplay:false">
      <a-box position="0.95 2.5 0" width="1.9" height="5" depth="0.14"
        tex="id:tex-wood; repx:1; repy:2.5"
        material="color:#7a5430; shader:flat">
      </a-box>
      <a-box position="0.95 4.2 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
      <a-box position="0.95 0.8 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
    </a-entity>
    <!-- Torflügel WEST – rechter Flügel (Scharnier an rechtem Pfosten, x=+2) -->
    <a-entity id="gate-west-right" position="2 0 0"
      animation__open="property:rotation; to:0 -90 0; dur:1600; easing:easeInOutSine; startEvents:gate-open; autoplay:false"
      animation__close="property:rotation; to:0 0 0; dur:1400; easing:easeInOutSine; startEvents:gate-close; autoplay:false">
      <a-box position="-0.95 2.5 0" width="1.9" height="5" depth="0.14"
        tex="id:tex-wood; repx:1; repy:2.5"
        material="color:#7a5430; shader:flat">
      </a-box>
      <a-box position="-0.95 4.2 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
      <a-box position="-0.95 0.8 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
    </a-entity>
  </a-entity>

  <!-- ═══ LUFTSCHIFFE ═══ -->
  <a-entity position="10 22 -15"
    animation="property:position; to:-20 24 -10; dur:30000; loop:true; dir:alternate; easing:easeInOutSine">
    <a-box position="0 0 0" width="3.5" height="1.2" depth="1.2"
      material="color:#c8a070;roughness:0.8" tex="id:tex-wood; repx:2; repy:0.8" shadow="cast:true"></a-box>
    <a-sphere position="0 2 0" radius="2.2" scale="1 1.3 1"
      material="color:#aa3322;roughness:0.8;metalness:0.1" shadow="cast:true"></a-sphere>
    <a-cylinder position="-0.8 0.9 0" radius="0.05" height="1.5" rotation="15 0 0"
      material="color:#3a2a10"></a-cylinder>
    <a-cylinder position="0.8 0.9 0" radius="0.05" height="1.5" rotation="-15 0 0"
      material="color:#3a2a10"></a-cylinder>
    <a-cylinder position="-0.6 0.8 0" radius="0.1" height="0.8" material="color:#2a1a10"></a-cylinder>
    <a-entity position="-0.6 1.25 0" steam></a-entity>
    <a-box position="1.9 0 0" width="0.1" height="1.8" depth="0.3"
      material="color:#5a4020"
      animation="property:rotation; to:0 0 360; loop:true; dur:1000; easing:linear"></a-box>
  </a-entity>
  <a-entity position="-20 28 -30"
    animation="property:position; to:15 26 -35; dur:45000; loop:true; dir:alternate; easing:easeInOutSine">
    <a-box position="0 0 0" width="2.5" height="0.9" depth="0.9"
      material="color:#a08060;roughness:0.8" tex="id:tex-wood; repx:1.5; repy:0.6"></a-box>
    <a-sphere position="0 1.6 0" radius="1.6" scale="1 1.25 1"
      material="color:#224466;roughness:0.8"></a-sphere>
  </a-entity>

  <!-- ═══ MAUERERGÄNZUNGEN – Ecktürme und lückenschließende Wandsegmente ═══ -->
  <!-- Lücken: N/S-Wand von x=±18 bis x=±26; O/W-Wand von z=±18 bis z=±26     -->
  <!-- Ecktürme bei (±28, 0, ±28) schließen die verbleibenden Eckpunkte.        -->

  <!-- ── Ecktürme ──────────────────────────────────────────────────────────── -->
  <a-entity position="28 0 -28">
    <a-cylinder position="0 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="0 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
  </a-entity>
  <a-entity position="-28 0 -28">
    <a-cylinder position="0 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="0 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
  </a-entity>
  <a-entity position="28 0 28">
    <a-cylinder position="0 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="0 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
  </a-entity>
  <a-entity position="-28 0 28">
    <a-cylinder position="0 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="0 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
  </a-entity>

  <!-- ── N-Wand: x=−26…−18 bei z=−28 ──────────────────────────────────────── -->
  <a-entity position="-22 0 -28">
    <a-box position="0 3 0" width="8" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:4; repy:3" shadow="cast:true"></a-box>
    <a-box position="-3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>
  <!-- ── N-Wand: x=+18…+26 bei z=−28 ──────────────────────────────────────── -->
  <a-entity position="22 0 -28">
    <a-box position="0 3 0" width="8" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:4; repy:3" shadow="cast:true"></a-box>
    <a-box position="-3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ── S-Wand: x=−26…−18 bei z=+28 ──────────────────────────────────────── -->
  <a-entity position="-22 0 28">
    <a-box position="0 3 0" width="8" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:4; repy:3" shadow="cast:true"></a-box>
    <a-box position="-3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>
  <!-- ── S-Wand: x=+18…+26 bei z=+28 ──────────────────────────────────────── -->
  <a-entity position="22 0 28">
    <a-box position="0 3 0" width="8" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:4; repy:3" shadow="cast:true"></a-box>
    <a-box position="-3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ── O-Wand: z=−26…−18 bei x=+28 ──────────────────────────────────────── -->
  <!-- Zinnen laufen in Z-Richtung → width=1.8 (Wandtiefe), depth=1          -->
  <a-entity position="28 0 -22">
    <a-box position="0 3 0" width="1.6" height="6" depth="8"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:1; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 6.5 -3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5 -1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>
  <!-- ── O-Wand: z=+18…+26 bei x=+28 ──────────────────────────────────────── -->
  <a-entity position="28 0 22">
    <a-box position="0 3 0" width="1.6" height="6" depth="8"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:1; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 6.5 -3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5 -1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ── W-Wand: z=−26…−18 bei x=−28 ──────────────────────────────────────── -->
  <a-entity position="-28 0 -22">
    <a-box position="0 3 0" width="1.6" height="6" depth="8"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:1; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 6.5 -3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5 -1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>
  <!-- ── W-Wand: z=+18…+26 bei x=−28 ──────────────────────────────────────── -->
  <a-entity position="-28 0 22">
    <a-box position="0 3 0" width="1.6" height="6" depth="8"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:1; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 6.5 -3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5 -1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ═══ STADTLEBEN ═══ -->
  <a-entity id="city-life-root" city-life></a-entity>
`;
