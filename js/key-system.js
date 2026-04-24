// ═══════════════════════════════════════════════════════════════════════════
// KEY SYSTEM – Magischer Schlüssel im Feenreich + Inventory HUD
// Schlüssel liegt auf Riesenpilz 1 (Türkis, Welt -13 0 51).
// ═══════════════════════════════════════════════════════════════════════════
(function () {
'use strict';

// Persistentes Inventory – überlebt Zonenwechsel innerhalb der Session
if (!window.INVENTORY) window.INVENTORY = { magicKey: false };

// Pilz 1: entity(-13,0,51), Kappe sphere(0,9,0) r=5.5 scale-y=0.44
// Kappen-Top: 9 + 5.5×0.44 ≈ 11.42 → Schlüssel etwas darüber
const KEY_POS = { x: -13, y: 12.0, z: 51 };
const KEY_R   = 1.5;   // Interaktionsradius (m)

AFRAME.registerComponent('magic-key', {

  init() {
    this._cam      = null;
    this._camWP    = new THREE.Vector3();
    this._picked   = false;
    this._near     = false;
    this._root     = null;
    this._hint     = null;
    this._sparkles = [];
    this._touchBtn = null;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    // Tastatur E
    document.addEventListener('keydown', e => {
      if (e.code === 'KeyE') this._tryPickup();
    });

    // VR – rechter Trigger (nach scene-load registrieren)
    sc.addEventListener('loaded', () => {
      const rh = document.getElementById('rightHand');
      if (rh) rh.addEventListener('triggerdown', () => this._tryPickup());
    }, { once: true });
  },

  _build() {
    this._buildKey();
    this._buildHint();
    this._buildHUD();
    this._buildTouchBtn();
  },

  // ── 3D-Schlüssel-Mesh ─────────────────────────────────────────────────────
  _buildKey() {
    const root = document.createElement('a-entity');
    root.setAttribute('position', `${KEY_POS.x} ${KEY_POS.y} ${KEY_POS.z}`);

    const M = 'color:#ffd740;emissive:#ffaa00;emissiveIntensity:0.75;shader:flat';

    // Bügel (Torus)
    const bow = document.createElement('a-torus');
    bow.setAttribute('radius', '0.18');
    bow.setAttribute('radius-tubular', '0.055');
    bow.setAttribute('segments-tubular', '8');
    bow.setAttribute('segments-radial', '10');
    bow.setAttribute('position', '0 0.22 0');
    bow.setAttribute('material', M);
    root.appendChild(bow);

    // Schaft
    const shaft = document.createElement('a-cylinder');
    shaft.setAttribute('radius', '0.048');
    shaft.setAttribute('height', '0.52');
    shaft.setAttribute('segments-radial', '6');
    shaft.setAttribute('position', '0 -0.08 0');
    shaft.setAttribute('material', M);
    root.appendChild(shaft);

    // Bart – zwei Zähne
    const mkBit = (px, py) => {
      const b = document.createElement('a-box');
      b.setAttribute('width', '0.13');
      b.setAttribute('height', '0.065');
      b.setAttribute('depth', '0.048');
      b.setAttribute('position', `${px} ${py} 0`);
      b.setAttribute('material', M);
      root.appendChild(b);
    };
    mkBit(0.11, -0.26);
    mkBit(0.09, -0.36);

    // Sanftes Glühen (Punkt-Licht)
    const gl = document.createElement('a-entity');
    gl.setAttribute('light', 'type:point;color:#ffcc44;intensity:0.55;distance:6');
    root.appendChild(gl);

    // Glitzer-Orbs (orbiten um den Schlüssel)
    for (let i = 0; i < 7; i++) {
      const orb = document.createElement('a-sphere');
      orb.setAttribute('radius', String((0.020 + Math.random() * 0.014).toFixed(3)));
      orb.setAttribute('segments-width', '4');
      orb.setAttribute('segments-height', '3');
      orb.setAttribute('material',
        'color:#fffce8;emissive:#ffe880;emissiveIntensity:2.2;shader:flat;transparent:true;opacity:0.82');
      root.appendChild(orb);
      this._sparkles.push({
        el:    orb,
        phase: (i / 7) * Math.PI * 2,
        r:     0.26 + Math.random() * 0.14,
        spd:   0.80 + Math.random() * 0.75,
        oy:    (Math.random() - 0.5) * 0.22,
      });
    }

    this.el.sceneEl.appendChild(root);
    this._root = root;
  },

  // ── Hinweis-Panel (3D, camera-facing) ────────────────────────────────────
  _buildHint() {
    const h = document.createElement('a-entity');
    // Startposition weit unten → kein Flackern beim ersten Frame
    h.setAttribute('position', `${KEY_POS.x} -200 ${KEY_POS.z}`);
    h.setAttribute('visible', 'false');

    // Goldener Rahmen
    const frame = document.createElement('a-plane');
    frame.setAttribute('width', '1.12');
    frame.setAttribute('height', '0.24');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#ffd740;shader:flat;transparent:true;opacity:0.48;' +
      'emissive:#ffd740;emissiveIntensity:0.32');
    h.appendChild(frame);

    // Dunkler Hintergrund
    const bg = document.createElement('a-plane');
    bg.setAttribute('width', '1.06');
    bg.setAttribute('height', '0.18');
    bg.setAttribute('material',
      'color:#001020;shader:flat;transparent:true;opacity:0.92');
    h.appendChild(bg);

    // Text
    const txt = document.createElement('a-text');
    txt.setAttribute('value', 'E / Trigger: Aufheben');
    txt.setAttribute('align', 'center');
    txt.setAttribute('color', '#ffe8a0');
    txt.setAttribute('width', '0.92');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    this._hint = h;
  },

  // ── HTML Inventory-HUD (Desktop / Mobile, versteckt in VR) ───────────────
  _buildHUD() {
    if (document.getElementById('inventory-hud')) return;

    const style = document.createElement('style');
    style.textContent = `
      #inventory-hud {
        position: fixed; bottom: 20px; right: 20px;
        display: flex; gap: 6px;
        z-index: 9998; pointer-events: none; user-select: none;
      }
      #inventory-hud .inv-slot {
        width: 48px; height: 48px;
        border: 2px solid rgba(255,215,64,0.28);
        border-radius: 8px;
        background: rgba(0,8,18,0.72);
        display: flex; align-items: center; justify-content: center;
        font-size: 24px; opacity: 0.40;
        transition: opacity 0.5s, border-color 0.5s, box-shadow 0.5s;
      }
      #inventory-hud .inv-slot.has-item {
        opacity: 1;
        border-color: rgba(255,215,64,0.88);
        box-shadow: 0 0 14px rgba(255,215,64,0.52);
      }
    `;
    document.head.appendChild(style);

    const hud = document.createElement('div');
    hud.id = 'inventory-hud';
    hud.innerHTML = '<div class="inv-slot" id="inv-key-slot">🗝️</div>';
    document.body.appendChild(hud);

    document.addEventListener('enter-vr', () => { hud.style.display = 'none'; });
    document.addEventListener('exit-vr',  () => { hud.style.display = 'flex'; });
  },

  // ── Mobile Touch-Button (erscheint bei Nähe) ──────────────────────────────
  _buildTouchBtn() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch) return;
    if (document.getElementById('key-touch-btn')) return;

    const style = document.createElement('style');
    style.textContent = `
      #key-touch-btn {
        position: fixed; bottom: 200px; left: 50%;
        transform: translateX(-50%);
        background: rgba(255,215,64,0.90); color: #1a0800;
        border: none; border-radius: 30px;
        padding: 12px 30px; font-size: 17px;
        font-family: sans-serif; font-weight: bold;
        display: none; z-index: 10001; touch-action: none;
      }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'key-touch-btn';
    btn.textContent = 'Aufheben';
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      this._tryPickup();
    }, { passive: false });
    document.body.appendChild(btn);
    this._touchBtn = btn;
  },

  // ── Pickup-Logik ─────────────────────────────────────────────────────────
  _tryPickup() {
    if (this._picked || !this._near) return;
    this._picked = true;
    window.INVENTORY.magicKey = true;

    // Schlüssel aus Szene entfernen
    if (this._root && this._root.parentNode)
      this._root.parentNode.removeChild(this._root);
    this._root = null;

    // Hinweis + Touch-Button ausblenden
    this._near = false;
    if (this._hint) this._hint.setAttribute('visible', 'false');
    if (this._touchBtn) this._touchBtn.style.display = 'none';

    // HUD-Slot aufleuchten lassen
    const slot = document.getElementById('inv-key-slot');
    if (slot) slot.classList.add('has-item');

    // Event für andere Systeme (Nordtor-Schloss in Teil 3)
    this.el.sceneEl.emit('key-picked-up');
  },

  // ── Tick ──────────────────────────────────────────────────────────────────
  tick(t, dt) {
    if (this._picked) return;
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam || !this._root) return;

    const ts = t * 0.001;

    // Schlüssel: Rotation + sanftes Schweben
    if (this._root.object3D) {
      this._root.object3D.rotation.y  = ts * 1.1;
      this._root.object3D.position.y  = KEY_POS.y + Math.sin(ts * 1.4) * 0.10;
    }

    // Glitzer-Orbs animieren
    this._sparkles.forEach(s => {
      if (!s.el.object3D) return;
      s.el.object3D.position.set(
        Math.cos(ts * s.spd + s.phase) * s.r,
        s.oy + Math.sin(ts * s.spd * 1.3 + s.phase) * 0.09,
        Math.sin(ts * s.spd + s.phase) * s.r,
      );
      s.el.object3D.scale.setScalar(
        0.55 + Math.abs(Math.sin(ts * 3.2 + s.phase)) * 0.45,
      );
    });

    // Distanz-Check (3D) zur Kamera
    this._cam.object3D.getWorldPosition(this._camWP);
    const dx = this._camWP.x - KEY_POS.x;
    const dy = this._camWP.y - KEY_POS.y;
    const dz = this._camWP.z - KEY_POS.z;
    const near = (dx * dx + dy * dy + dz * dz) < KEY_R * KEY_R;

    // Hinweis ein-/ausblenden wenn sich Zustand ändert
    if (near !== this._near) {
      this._near = near;
      if (this._hint) this._hint.setAttribute('visible', near ? 'true' : 'false');
      if (this._touchBtn) this._touchBtn.style.display = near ? 'block' : 'none';
    }

    // Hinweis-Panel über dem Schlüssel, zur Kamera ausgerichtet
    if (this._near && this._hint && this._hint.object3D) {
      const ky = this._root
        ? this._root.object3D.position.y + 0.52
        : KEY_POS.y + 0.52;
      this._hint.object3D.position.set(KEY_POS.x, ky, KEY_POS.z);
      this._hint.object3D.rotation.y = Math.atan2(
        this._camWP.x - KEY_POS.x,
        this._camWP.z - KEY_POS.z,
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

// ═══════════════════════════════════════════════════════════════════════════
// LICHTREICH-TOR – Magisches Schloss + Barriere
// Westtor der Kesselstadt, world position (-28, 0, 0).
// Öffnet sich nur wenn der Spieler den magischen Schlüssel besitzt.
// ═══════════════════════════════════════════════════════════════════════════
if (window.LICHTREICH_GATE_UNLOCKED === undefined) window.LICHTREICH_GATE_UNLOCKED = false;

const GATE_POS = { x: -28, y: 0, z: 0 };
const GATE_R   = 5.5;

AFRAME.registerComponent('lichtreich-gate', {

  init() {
    this._cam       = null;
    this._camWP     = new THREE.Vector3();
    this._unlocked  = false;
    this._near      = false;
    this._lockRoot  = null;
    this._lockParts = [];
    this._barrierEl = null;
    this._hint      = null;
    this._touchBtn  = null;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    document.addEventListener('keydown', e => {
      if (e.code === 'KeyE') this._tryUnlock();
    });

    sc.addEventListener('loaded', () => {
      const rh = document.getElementById('rightHand');
      if (rh) rh.addEventListener('triggerdown', () => this._tryUnlock());
    }, { once: true });
  },

  _build() {
    this._buildLock();
    this._buildBarrier();
    this._buildHint();
    this._buildTouchBtn();
  },

  // ── 3D-Schloss (goldenes Glühen) ─────────────────────────────────────────
  _buildLock() {
    const root = document.createElement('a-entity');
    root.setAttribute('position', `${GATE_POS.x} 3.2 ${GATE_POS.z}`);
    root.setAttribute('animation__rot',
      'property:rotation; to:0 360 0; dur:8000; loop:true; easing:linear');
    root.setAttribute('animation__float',
      `property:position; to:${GATE_POS.x} 3.42 ${GATE_POS.z}; dur:1800; dir:alternate; loop:true; easing:easeInOutSine`);

    const M = 'color:#ffd740;emissive:#ffaa00;emissiveIntensity:0.9;shader:flat';

    // Schlossgehäuse
    const body = document.createElement('a-box');
    body.setAttribute('width',  '0.44');
    body.setAttribute('height', '0.36');
    body.setAttribute('depth',  '0.18');
    body.setAttribute('material', M);
    root.appendChild(body);
    this._lockParts.push(body);

    // Bügel – linker Arm
    const armL = document.createElement('a-cylinder');
    armL.setAttribute('radius', '0.040');
    armL.setAttribute('height', '0.22');
    armL.setAttribute('segments-radial', '6');
    armL.setAttribute('position', '-0.12 0.28 0');
    armL.setAttribute('material', M);
    root.appendChild(armL);
    this._lockParts.push(armL);

    // Bügel – rechter Arm
    const armR = document.createElement('a-cylinder');
    armR.setAttribute('radius', '0.040');
    armR.setAttribute('height', '0.22');
    armR.setAttribute('segments-radial', '6');
    armR.setAttribute('position', '0.12 0.28 0');
    armR.setAttribute('material', M);
    root.appendChild(armR);
    this._lockParts.push(armR);

    // Bügel – Querbalken
    const topBar = document.createElement('a-box');
    topBar.setAttribute('width',  '0.28');
    topBar.setAttribute('height', '0.08');
    topBar.setAttribute('depth',  '0.09');
    topBar.setAttribute('position', '0 0.40 0');
    topBar.setAttribute('material', M);
    root.appendChild(topBar);
    this._lockParts.push(topBar);

    // Schlüsselloch
    const hole = document.createElement('a-cylinder');
    hole.setAttribute('radius', '0.050');
    hole.setAttribute('height', '0.02');
    hole.setAttribute('segments-radial', '8');
    hole.setAttribute('position', '0 0.04 0.09');
    hole.setAttribute('rotation', '90 0 0');
    hole.setAttribute('material', 'color:#221100;shader:flat');
    root.appendChild(hole);

    // Glüh-Licht
    const gl = document.createElement('a-entity');
    gl.setAttribute('light', 'type:point;color:#ffcc44;intensity:0.9;distance:10');
    root.appendChild(gl);

    // Glitzer-Orbs
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

  // ── Magische Barriere (halbdurchsichtige Ebene im Torrahmen) ─────────────
  _buildBarrier() {
    const barrier = document.createElement('a-plane');
    barrier.setAttribute('position', `${GATE_POS.x} 2.5 ${GATE_POS.z}`);
    barrier.setAttribute('rotation', '0 90 0');
    barrier.setAttribute('width',  '4.2');
    barrier.setAttribute('height', '5.0');
    barrier.setAttribute('material',
      'color:#3322cc;emissive:#5544ff;emissiveIntensity:0.9;shader:flat;' +
      'transparent:true;opacity:0.42;side:double');
    this.el.sceneEl.appendChild(barrier);
    this._barrierEl = barrier;
  },

  // ── Hinweis-Panel (3D, camera-facing) ────────────────────────────────────
  _buildHint() {
    const h = document.createElement('a-entity');
    h.setAttribute('position', `${GATE_POS.x} -200 ${GATE_POS.z}`);
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width',  '1.22');
    frame.setAttribute('height', '0.24');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#ffd740;shader:flat;transparent:true;opacity:0.48;' +
      'emissive:#ffd740;emissiveIntensity:0.32');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width',  '1.16');
    bg.setAttribute('height', '0.18');
    bg.setAttribute('material',
      'color:#001020;shader:flat;transparent:true;opacity:0.92');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', 'E / Trigger: Tor öffnen');
    txt.setAttribute('align', 'center');
    txt.setAttribute('color', '#ffe8a0');
    txt.setAttribute('width', '1.0');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    this._hint = h;
  },

  // ── Mobile Touch-Button ───────────────────────────────────────────────────
  _buildTouchBtn() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch) return;
    if (document.getElementById('gate-touch-btn')) return;

    const style = document.createElement('style');
    style.textContent = `
      #gate-touch-btn {
        position: fixed; bottom: 200px; left: 50%;
        transform: translateX(-50%);
        background: rgba(255,215,64,0.90); color: #1a0800;
        border: none; border-radius: 30px;
        padding: 12px 30px; font-size: 17px;
        font-family: sans-serif; font-weight: bold;
        display: none; z-index: 10001; touch-action: none;
      }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'gate-touch-btn';
    btn.textContent = 'Tor öffnen';
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      this._tryUnlock();
    }, { passive: false });
    document.body.appendChild(btn);
    this._touchBtn = btn;
  },

  // ── Öffnungs-Logik ────────────────────────────────────────────────────────
  _tryUnlock() {
    if (this._unlocked || !this._near) return;
    if (!window.INVENTORY || !window.INVENTORY.magicKey) return;
    this._unlocked = true;
    window.LICHTREICH_GATE_UNLOCKED = true;

    if (this._hint) this._hint.setAttribute('visible', 'false');
    if (this._touchBtn) this._touchBtn.style.display = 'none';

    this._flashAndOpen();
  },

  _flashAndOpen() {
    // Aufleuchten: Schloss + Barriere weiß
    const WM = 'color:#ffffff;emissive:#ffffff;emissiveIntensity:3.5;shader:flat';
    this._lockParts.forEach(p => p.setAttribute('material', WM));
    if (this._barrierEl) {
      this._barrierEl.setAttribute('material',
        'color:#ffffff;emissive:#ffffff;emissiveIntensity:3.0;shader:flat;' +
        'transparent:true;opacity:0.95;side:double');
    }

    // Nach 400 ms: Schloss + Barriere entfernen, Kollision aufheben, Tor öffnen
    setTimeout(() => {
      if (this._lockRoot && this._lockRoot.parentNode)
        this._lockRoot.parentNode.removeChild(this._lockRoot);
      this._lockRoot = null;

      if (this._barrierEl && this._barrierEl.parentNode)
        this._barrierEl.parentNode.removeChild(this._barrierEl);
      this._barrierEl = null;

      this.el.sceneEl.emit('lichtreich-unlocked');

      document.getElementById('gate-west-left')?.emit('gate-open');
      document.getElementById('gate-west-right')?.emit('gate-open');
    }, 400);
  },

  // ── Tick ──────────────────────────────────────────────────────────────────
  tick(t) {
    if (this._unlocked) return;
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam) return;

    // Barriere-Opazität pulsieren
    if (this._barrierEl) {
      const mesh = this._barrierEl.getObject3D('mesh');
      if (mesh && mesh.material) {
        mesh.material.opacity = 0.28 + Math.abs(Math.sin(t * 0.0018)) * 0.30;
      }
    }

    // Distanz zum Westtor
    this._cam.object3D.getWorldPosition(this._camWP);
    const dx   = this._camWP.x - GATE_POS.x;
    const dz   = this._camWP.z - GATE_POS.z;
    const hasKey = !!(window.INVENTORY && window.INVENTORY.magicKey);
    const near   = hasKey && (dx * dx + dz * dz) < GATE_R * GATE_R;

    if (near !== this._near) {
      this._near = near;
      if (this._hint) this._hint.setAttribute('visible', near ? 'true' : 'false');
      if (this._touchBtn) this._touchBtn.style.display = near ? 'block' : 'none';
    }

    // Hinweis-Panel über dem Tor, zur Kamera ausgerichtet
    if (this._near && this._hint && this._hint.object3D) {
      this._hint.object3D.position.set(GATE_POS.x, 5.0, GATE_POS.z);
      this._hint.object3D.rotation.y = Math.atan2(
        this._camWP.x - GATE_POS.x,
        this._camWP.z - GATE_POS.z,
      );
    }
  },

  remove() {
    if (this._lockRoot && this._lockRoot.parentNode)
      this._lockRoot.parentNode.removeChild(this._lockRoot);
    if (this._barrierEl && this._barrierEl.parentNode)
      this._barrierEl.parentNode.removeChild(this._barrierEl);
    if (this._hint && this._hint.parentNode)
      this._hint.parentNode.removeChild(this._hint);
  },
});

})();
