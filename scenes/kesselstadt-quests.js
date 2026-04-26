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
    // sign-brunnen: z=2.15/y=0.90 → außen am Südrand des Beckens (Radius=2, Rand bei y≈0.82)
    { id: 'sign-brunnen', x:  0.00, y: 0.90, z:  2.15, ry:   0, hy: 1.60 },
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

    this._cam          = null;
    this._camWP        = new THREE.Vector3();
    this._hint         = null;
    this._hintVis      = false;
    this._triggered    = false;
    this._particles    = [];
    this._partLight    = null;
    this._barrierEl    = null;
    this._collisionBox = null;
    this._lockRoot     = null;
    this._lockParts    = [];

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });
  },

  _build() {
    this._buildLock();
    this._buildHint_q1();
    this._buildBarrier();
    this._buildParticles();
    this._addCollisionBox();
  },

  _buildLock() {
    const LX = 0, LY = 3.2, LZ = 27.5;
    const root = document.createElement('a-entity');
    root.setAttribute('position', `${LX} ${LY} ${LZ}`);
    root.setAttribute('animation__rot',
      'property:rotation; to:0 360 0; dur:8000; loop:true; easing:linear');
    root.setAttribute('animation__float',
      `property:position; to:${LX} 3.42 ${LZ}; dur:1800; dir:alternate; loop:true; easing:easeInOutSine`);

    const M = 'color:#ffd740;emissive:#ffaa00;emissiveIntensity:0.9;shader:flat';

    const body = document.createElement('a-box');
    body.setAttribute('width',  '0.44');
    body.setAttribute('height', '0.36');
    body.setAttribute('depth',  '0.18');
    body.setAttribute('material', M);
    root.appendChild(body);
    this._lockParts.push(body);

    const armL = document.createElement('a-cylinder');
    armL.setAttribute('radius', '0.040');
    armL.setAttribute('height', '0.22');
    armL.setAttribute('segments-radial', '6');
    armL.setAttribute('position', '-0.12 0.28 0');
    armL.setAttribute('material', M);
    root.appendChild(armL);
    this._lockParts.push(armL);

    const armR = document.createElement('a-cylinder');
    armR.setAttribute('radius', '0.040');
    armR.setAttribute('height', '0.22');
    armR.setAttribute('segments-radial', '6');
    armR.setAttribute('position', '0.12 0.28 0');
    armR.setAttribute('material', M);
    root.appendChild(armR);
    this._lockParts.push(armR);

    const topBar = document.createElement('a-box');
    topBar.setAttribute('width',  '0.28');
    topBar.setAttribute('height', '0.08');
    topBar.setAttribute('depth',  '0.09');
    topBar.setAttribute('position', '0 0.40 0');
    topBar.setAttribute('material', M);
    root.appendChild(topBar);
    this._lockParts.push(topBar);

    const hole = document.createElement('a-cylinder');
    hole.setAttribute('radius', '0.050');
    hole.setAttribute('height', '0.02');
    hole.setAttribute('segments-radial', '8');
    hole.setAttribute('position', '0 0.04 0.09');
    hole.setAttribute('rotation', '90 0 0');
    hole.setAttribute('material', 'color:#221100;shader:flat');
    root.appendChild(hole);

    const gl = document.createElement('a-entity');
    gl.setAttribute('light', 'type:point;color:#ffcc44;intensity:0.9;distance:10');
    root.appendChild(gl);

    for (let i = 0; i < 4; i++) {
      const orb = document.createElement('a-sphere');
      orb.setAttribute('radius', '0.025');
      orb.setAttribute('segments-width',  '4');
      orb.setAttribute('segments-height', '3');
      orb.setAttribute('material',
        'color:#fffce8;emissive:#ffe880;emissiveIntensity:2.0;shader:flat;transparent:true;opacity:0.75');
      const angle = (i / 4) * Math.PI * 2;
      const r = 0.32;
      orb.setAttribute('position',
        `${(Math.cos(angle) * r).toFixed(3)} 0 ${(Math.sin(angle) * r).toFixed(3)}`);
      root.appendChild(orb);
    }

    this.el.sceneEl.appendChild(root);
    this._lockRoot = root;
  },

  _buildHint_q1() {
    const h = document.createElement('a-entity');
    h.setAttribute('id', 'quest1-gate-hint');
    h.setAttribute('position', '0 -200 27.5');
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

  _buildBarrier() {
    const barrier = document.createElement('a-plane');
    barrier.setAttribute('position', '0 2.5 28');
    barrier.setAttribute('rotation', '0 0 0');
    barrier.setAttribute('width',  '4.2');
    barrier.setAttribute('height', '5.0');
    barrier.setAttribute('material',
      'color:#3322cc;emissive:#5544ff;emissiveIntensity:0.9;shader:flat;' +
      'transparent:true;opacity:0.42;side:double');
    this.el.sceneEl.appendChild(barrier);
    this._barrierEl = barrier;
  },

  _addCollisionBox() {
    const pc = this.el.sceneEl.components['player-collision'];
    if (pc && pc._boxes) {
      this._collisionBox = { x0: -2.1, x1: 2.1, z0: 27.2, z1: 28.8 };
      pc._boxes.push(this._collisionBox);
    }
  },

  _removeBarrier() {
    if (this._barrierEl && this._barrierEl.parentNode)
      this._barrierEl.parentNode.removeChild(this._barrierEl);
    this._barrierEl = null;

    if (this._collisionBox) {
      const pc = this.el.sceneEl.components['player-collision'];
      if (pc && pc._boxes) {
        const i = pc._boxes.indexOf(this._collisionBox);
        if (i !== -1) pc._boxes.splice(i, 1);
      }
      this._collisionBox = null;
    }
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

    // Schloss + Barriere weiß aufleuchten, dann entfernen
    const WM = 'color:#ffffff;emissive:#ffffff;emissiveIntensity:3.5;shader:flat';
    this._lockParts.forEach(p => p.setAttribute('material', WM));
    if (this._barrierEl) {
      this._barrierEl.setAttribute('material',
        'color:#ffffff;emissive:#ffffff;emissiveIntensity:3.0;shader:flat;' +
        'transparent:true;opacity:0.95;side:double');
    }
    setTimeout(() => {
      if (this._lockRoot && this._lockRoot.parentNode)
        this._lockRoot.parentNode.removeChild(this._lockRoot);
      this._lockRoot = null;
      this._removeBarrier();
    }, 400);

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

    // Barriere pulsieren
    if (this._barrierEl) {
      const mesh = this._barrierEl.getObject3D('mesh');
      if (mesh && mesh.material) {
        mesh.material.opacity = 0.28 + Math.abs(Math.sin(t * 0.0018)) * 0.30;
      }
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
      this._hint.object3D.position.set(0, 2.2, 27.5);
      this._hint.object3D.rotation.y = Math.atan2(
        this._camWP.x,
        this._camWP.z - 27.5,
      );
    }
  },

  remove() {
    if (this._hint && this._hint.parentNode)
      this._hint.parentNode.removeChild(this._hint);
    if (this._partRoot && this._partRoot.parentNode)
      this._partRoot.parentNode.removeChild(this._partRoot);
    if (this._lockRoot && this._lockRoot.parentNode)
      this._lockRoot.parentNode.removeChild(this._lockRoot);
    this._removeBarrier();
  },
});
