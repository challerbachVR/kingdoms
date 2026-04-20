// ═══════════════════════════════════════════════════════════════════════════
// VR CONTROLLER NAVIGATION (Quest 3)
// ═══════════════════════════════════════════════════════════════════════════

// Quest 3 WebXR: Thumbstick auf axes[2]/axes[3], Fallback auf axes[0]/axes[1]
function _getStick(handEl) {
  if (!handEl) return null;
  const tc = handEl.components['tracked-controls'];
  if (!tc || !tc.controller) return null;
  const gp = tc.controller.gamepad;
  if (!gp || !gp.axes || gp.axes.length < 2) return null;
  if (gp.axes.length >= 4 &&
      (Math.abs(gp.axes[2]) > 0.02 || Math.abs(gp.axes[3]) > 0.02)) {
    return { x: gp.axes[2], y: gp.axes[3] };
  }
  return { x: gp.axes[0], y: gp.axes[1] };
}

// Deadzone mit linearer Reskalierung (kein Sprung beim Einrasten)
function _dz(v, dz) {
  const s = v < 0 ? -1 : 1, a = Math.abs(v);
  return a < dz ? 0 : s * (a - dz) / (1 - dz);
}

// ── Smooth Locomotion (linker Stick) + Snap Turn (rechter Stick) ────────────
AFRAME.registerComponent('vr-movement', {
  schema: {
    speed:     { default: 5   },
    snapAngle: { default: 45  },
    moveDead:  { default: 0.18 },
    snapDead:  { default: 0.65 },
  },
  init() {
    this._lHand = null;
    this._rHand = null;
    this._snapLocked  = false;
    this._snapCooldown = 0;
    this._fwd  = new THREE.Vector3();
    this._side = new THREE.Vector3();
    this._camQ = new THREE.Quaternion();
  },
  tick(t, dt) {
    if (!dt || dt > 200) return;
    if (!this._lHand) this._lHand = document.getElementById('leftHand');
    if (!this._rHand) this._rHand = document.getElementById('rightHand');

    const ls = _getStick(this._lHand);
    if (ls) {
      const ax = _dz(ls.x, this.data.moveDead);
      const ay = _dz(ls.y, this.data.moveDead);
      if (ax !== 0 || ay !== 0) {
        const cam = document.getElementById('camera');
        if (cam) {
          cam.object3D.getWorldQuaternion(this._camQ);
          this._fwd.set(0, 0, -1).applyQuaternion(this._camQ);
          this._fwd.y = 0;
          if (this._fwd.lengthSq() > 1e-5) this._fwd.normalize();
          this._side.set(1, 0, 0).applyQuaternion(this._camQ);
          this._side.y = 0;
          if (this._side.lengthSq() > 1e-5) this._side.normalize();
          const sp = this.data.speed * dt / 1000;
          this.el.object3D.position.addScaledVector(this._fwd, -ay * sp);
          this.el.object3D.position.addScaledVector(this._side,  ax * sp);
        }
      }
    }

    if (this._snapCooldown > 0) { this._snapCooldown -= dt; return; }
    const rs = _getStick(this._rHand);
    if (rs) {
      const rx = _dz(rs.x, this.data.snapDead);
      if (Math.abs(rx) > 0 && !this._snapLocked) {
        this._snapLocked   = true;
        this._snapCooldown = 320;
        const rad = (rx > 0 ? -1 : 1) * this.data.snapAngle * (Math.PI / 180);
        this.el.object3D.rotation.y += rad;
      } else if (Math.abs(rx) === 0) {
        this._snapLocked = false;
      }
    }
  }
});

// ── Teleport (linker Trigger) ────────────────────────────────────────────────
AFRAME.registerComponent('vr-teleport', {
  schema: {
    speed:   { default: 10  },
    gravity: { default: 9.8 },
    steps:   { default: 26  },
    maxDist: { default: 22  },
  },
  init() {
    this._active = false;
    this._hit    = false;
    this._lHand  = null;

    this._pts  = Array.from({ length: 30 }, () => new THREE.Vector3());
    this._cnt  = 0;
    this._dir  = new THREE.Vector3();
    this._wp   = new THREE.Vector3();
    this._wq   = new THREE.Quaternion();
    this._tgt  = new THREE.Vector3();

    this._arcBuf = new Float32Array(30 * 3);
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.BufferAttribute(this._arcBuf, 3));
    arcGeo.setDrawRange(0, 0);
    this._arcMat  = new THREE.LineBasicMaterial({ color: 0x44bbff, transparent: true, opacity: 0.90 });
    this._arcLine = new THREE.Line(arcGeo, this._arcMat);
    this._arcLine.frustumCulled = false;
    this._arcLine.renderOrder   = 999;
    this._arcLine.visible = false;
    this.el.sceneEl.object3D.add(this._arcLine);

    const mkRing = (r0, r1, color, opacity, order) => {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(r0, r1, 40),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false })
      );
      m.rotation.x  = -Math.PI / 2;
      m.renderOrder = order;
      m.visible     = false;
      this.el.sceneEl.object3D.add(m);
      return m;
    };
    const mkDot = () => {
      const m = new THREE.Mesh(
        new THREE.CircleGeometry(0.09, 24),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.80, side: THREE.DoubleSide, depthWrite: false })
      );
      m.rotation.x  = -Math.PI / 2;
      m.renderOrder = 1001;
      m.visible     = false;
      this.el.sceneEl.object3D.add(m);
      return m;
    };
    this._ring1 = mkRing(0.38, 0.56, 0x44bbff, 0.80, 1000);
    this._ring2 = mkRing(0.56, 0.70, 0xffffff, 0.38,  999);
    this._dot   = mkDot();

    this.el.sceneEl.addEventListener('loaded', () => {
      this._lHand = document.getElementById('leftHand');
      if (!this._lHand) return;
      this._lHand.addEventListener('triggerdown', () => { this._active = true; });
      this._lHand.addEventListener('triggerup', () => {
        if (this._active && this._hit) this._doTeleport();
        this._active = false;
        this._hit    = false;
        this._hideAll();
      });
    });
  },

  tick() {
    if (!this._active) return;
    if (!this._lHand) { this._lHand = document.getElementById('leftHand'); return; }
    this._calcArc();
  },

  _calcArc() {
    const hand = this._lHand.object3D;
    if (!hand) return;

    hand.getWorldPosition(this._wp);
    hand.getWorldQuaternion(this._wq);
    this._dir.set(0, 0, -1).applyQuaternion(this._wq);

    const { speed, gravity, steps } = this.data;
    const dt = 0.07;
    this._pts[0].copy(this._wp);
    let hit = false, hi = steps;

    for (let i = 1; i <= steps; i++) {
      const ti = i * dt;
      this._pts[i].set(
        this._wp.x + this._dir.x * speed * ti,
        this._wp.y + this._dir.y * speed * ti - 0.5 * gravity * ti * ti,
        this._wp.z + this._dir.z * speed * ti
      );
      if (this._pts[i].y <= 0.08) {
        const prev = this._pts[i - 1];
        const curr = this._pts[i];
        const f = Math.min((prev.y - 0.06) / Math.max(prev.y - curr.y, 1e-6), 1);
        this._pts[i].lerpVectors(prev, curr, f);
        this._pts[i].y = 0.06;
        const dx = this._pts[i].x - this._wp.x;
        const dz = this._pts[i].z - this._wp.z;
        hit = (dx * dx + dz * dz) <= this.data.maxDist * this.data.maxDist;
        hi  = i;
        break;
      }
    }

    this._hit = hit;
    this._cnt = hi + 1;

    const pa = this._arcBuf;
    for (let i = 0; i < this._cnt; i++) {
      pa[i * 3]     = this._pts[i].x;
      pa[i * 3 + 1] = this._pts[i].y;
      pa[i * 3 + 2] = this._pts[i].z;
    }
    this._arcLine.geometry.attributes.position.needsUpdate = true;
    this._arcLine.geometry.setDrawRange(0, this._cnt);
    this._arcLine.visible = true;
    this._arcMat.color.setHex(hit ? 0x44bbff : 0xff4444);

    const lp = this._pts[hi];
    const ry = 0.04;
    this._ring1.position.set(lp.x, ry + 0.02, lp.z);
    this._ring2.position.set(lp.x, ry + 0.01, lp.z);
    this._dot.position.set(  lp.x, ry + 0.03, lp.z);
    this._ring1.visible = hit;
    this._ring2.visible = hit;
    this._dot.visible   = hit;
    if (hit) this._tgt.copy(lp);
  },

  _doTeleport() {
    const cam = document.getElementById('camera');
    const off = cam ? cam.object3D.position : { x: 0, z: 0 };
    this.el.object3D.position.set(
      this._tgt.x - off.x,
      0,
      this._tgt.z - off.z
    );
  },

  _hideAll() {
    this._arcLine.visible = false;
    this._ring1.visible   = false;
    this._ring2.visible   = false;
    this._dot.visible     = false;
  },

  remove() {
    this._hideAll();
    [this._arcLine, this._ring1, this._ring2, this._dot].forEach(m => {
      this.el.sceneEl.object3D.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
  }
});

// ── Spieler-Kollisionserkennung ──────────────────────────────────────────────
// Funktioniert sowohl mit Desktop-WASD (bewegt camera) als auch
// mit Quest-3-vr-movement (bewegt rig). Push wird immer auf den Rig
// angewendet – das verschiebt die Kamera-Weltposition in beiden Modi korrekt.
// ─────────────────────────────────────────────────────────────────────────────
AFRAME.registerComponent('player-collision', {
  schema: { radius: { default: 0.38 } },

  init() {
    this._rig  = null;
    this._cam  = null;
    this._wp   = new THREE.Vector3();
    this._push = new THREE.Vector3();

    // ── Kreisförmige Hindernisse { cx, cz, r } ──────────────────────────────
    // Brunnen, Türme, runde Gebäudeteile
    this._circles = [
      { cx:   0,   cz:   0,  r: 2.20 },  // Marktbrunnen
      { cx: -14,   cz:  -2,  r: 2.50 },  // Uhrturm
      { cx:  11.5, cz:   6,  r: 1.40 },  // Alchemisten-Ecke-Turm
      // Tor-N Türme (gate entity z=-28, Türme bei local ±4)
      { cx:  -4,   cz: -28,  r: 2.45 },
      { cx:   4,   cz: -28,  r: 2.45 },
      // Tor-S Türme (gate entity z=+28)
      { cx:  -4,   cz:  28,  r: 2.45 },
      { cx:   4,   cz:  28,  r: 2.45 },
      // Tor-O Türme (gate entity x=+28, rotiert 90° → Türme bei world (28, ±4))
      { cx:  28,   cz:   4,  r: 2.45 },
      { cx:  28,   cz:  -4,  r: 2.45 },
      // Tor-W Türme (gate entity x=-28)
      { cx: -28,   cz:   4,  r: 2.45 },
      { cx: -28,   cz:  -4,  r: 2.45 },
    ];

    // ── Rechteckige Hindernisse AABB { x0, x1, z0, z1 } ────────────────────
    // Koordinaten sind Weltkoordinaten der Gebäude-Außenkanten
    this._boxes = [
      // Gebäude NW – Schmied   (entity -9,0,-8 · box 5×5)
      { x0: -11.8, x1:  -6.2, z0: -10.8, z1:  -5.2 },
      // Gebäude NO – Händler   (entity  9,0,-8 · box 5×5)
      { x0:   6.2, x1:  11.8, z0: -10.8, z1:  -5.2 },
      // Gebäude SW – Gasthaus  (entity -9,0, 8 · box 6×5)
      { x0: -12.3, x1:  -5.7, z0:   5.2, z1:  10.8 },
      // Gebäude SO – Alchemist (entity  9,0, 8 · box 4.5×4.5)
      { x0:   6.5, x1:  11.5, z0:   5.8, z1:  10.2 },
      // Dampfmaschine          (entity 13,0,-2 · grobe Hülle)
      { x0:  10.8, x1:  15.5, z0:  -3.2, z1:   1.2 },

      // ── Stadtmauern – je in zwei Hälften aufgeteilt (Durchgang freilassen) ──
      // Jede Seite hat eine Lücke von x/z ∈ [-3, +3] für den Torweg.
      // Tor-N  (z ≈ -28)
      { x0: -45, x1:  -3.0, z0: -29.5, z1: -26.5 },
      { x0:  3.0, x1:  45,  z0: -29.5, z1: -26.5 },
      // Tor-S  (z ≈ +28)
      { x0: -45, x1:  -3.0, z0:  26.5, z1:  29.5 },
      { x0:  3.0, x1:  45,  z0:  26.5, z1:  29.5 },
      // Tor-O  (x ≈ +28)
      { x0:  26.5, x1:  29.5, z0: -45,  z1:  -3.0 },
      { x0:  26.5, x1:  29.5, z0:  3.0,  z1:  45  },
      // Tor-W  (x ≈ -28)
      { x0: -29.5, x1: -26.5, z0: -45,  z1:  -3.0 },
      { x0: -29.5, x1: -26.5, z0:  3.0,  z1:  45  },
    ];
  },

  tick(t, dt) {
    if (!dt || dt > 200) return;
    if (!this._rig) this._rig = document.getElementById('rig');
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._rig || !this._cam) return;

    // Kamera-Weltposition (korrekt in Desktop- und VR-Modus)
    this._cam.object3D.getWorldPosition(this._wp);
    const px = this._wp.x;
    const pz = this._wp.z;
    const R  = this.data.radius;
    this._push.set(0, 0, 0);

    // ── Kreise: radiale Ausstoßung ─────────────────────────────────────────
    for (const c of this._circles) {
      const dx = px - c.cx;
      const dz = pz - c.cz;
      const d  = Math.sqrt(dx * dx + dz * dz);
      const minD = c.r + R;
      if (d < minD && d > 1e-4) {
        const pen = minD - d;
        this._push.x += (dx / d) * pen;
        this._push.z += (dz / d) * pen;
      }
    }

    // ── Boxen: minimaler Ausstoß auf der flachsten Achse ──────────────────
    for (const b of this._boxes) {
      if (px <= b.x0 - R || px >= b.x1 + R) continue;
      if (pz <= b.z0 - R || pz >= b.z1 + R) continue;

      // Eindringtiefe je Seite
      const dX0 = px - (b.x0 - R); // West-Seite
      const dX1 = (b.x1 + R) - px; // Ost-Seite
      const dZ0 = pz - (b.z0 - R); // Nord-Seite
      const dZ1 = (b.z1 + R) - pz; // Süd-Seite

      const m = Math.min(dX0, dX1, dZ0, dZ1);
      if      (m === dX0) this._push.x -= dX0;
      else if (m === dX1) this._push.x += dX1;
      else if (m === dZ0) this._push.z -= dZ0;
      else                this._push.z += dZ1;
    }

    // Push auf Rig anwenden (verschiebt Kamera-Weltposition in beiden Modi)
    if (this._push.x !== 0 || this._push.z !== 0) {
      this._rig.object3D.position.x += this._push.x;
      this._rig.object3D.position.z += this._push.z;
    }
  },
});
