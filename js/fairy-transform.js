// ══════════════════════════════════════════════════════════════════════════
// FAIRY TRANSFORM – Weise Fee NPC + Feenstaub-Verwandlung
// ══════════════════════════════════════════════════════════════════════════
(function () {
'use strict';

/* ── DOM-Hilfsfunktionen ─────────────────────────────────────────────────── */
const _el = (tag, attrs) => {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
  return e;
};
const _sph = (r, col, em, emI, op, px, py, pz) => {
  const m = `color:${col};shader:flat` +
    (em  ? `;emissive:${em};emissiveIntensity:${emI}` : '') +
    (op < 1 ? `;transparent:true;opacity:${op}` : '');
  return _el('a-sphere', { radius: r, position: `${px} ${py} ${pz}`,
    'segments-width': 6, 'segments-height': 4, material: m });
};
const _box = (w, h, d, col, px, py, pz) =>
  _el('a-box', { width: w, height: h, depth: d, position: `${px} ${py} ${pz}`,
    material: `color:${col};shader:flat` });
const _cyl = (r, h, col, px, py, pz) =>
  _el('a-cylinder', { radius: r, height: h, position: `${px} ${py} ${pz}`,
    'segments-radial': 5, material: `color:${col};shader:flat` });
const _plane = (w, h, col, op, px, py, pz, rx, ry, rz) =>
  _el('a-plane', { width: w, height: h, position: `${px} ${py} ${pz}`,
    rotation: `${rx} ${ry} ${rz}`,
    material: `color:${col};shader:flat;transparent:true;opacity:${op};side:double` });

/* ════════════════════════════════════════════════════════════════════════════
   WISE-FAIRY  –  NPC-Mesh, freies Laufen + Proximity-Dialog
   ════════════════════════════════════════════════════════════════════════════ */
AFRAME.registerComponent('wise-fairy', {

  // Wegpunkte im Feenreich (erste Siedlung)
  _wps: [
    [-5, 52], [-10, 58], [-3, 64], [6, 60],
    [ 8, 52], [ 4, 47],  [-8, 50], [-12, 56],
    [ 2, 68], [-6, 44],
  ],

  init() {
    this._cam       = null;
    this._camWP     = new THREE.Vector3();
    this._dialogVis = false;
    this._answered  = false;
    this._root      = null;
    this._dialog    = null;
    this._aura      = null;
    this._wL        = [];
    this._wR        = [];
    this._orbs      = [];
    this._wPhase    = Math.random() * Math.PI * 2;
    this._wpIdx     = 0;
    this._wait      = Math.random() * 2;
    this._speed     = 0.55;
    this._angle     = 0;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });
  },

  _build() {
    this._buildFairy();
    this._buildDialog();
  },

  // ── Mesh der weisen Fee ───────────────────────────────────────────────────
  _buildFairy() {
    const root = document.createElement('a-entity');
    root.setAttribute('position', '-5 0.62 52');

    const robe = '#c8c0f0';
    const skin = '#f5dfc0';
    const hair = '#f0f0f8';
    const gold = '#ffd740';
    const wCol = '#dd99ff';

    // Robe (Kegel)
    root.appendChild(_el('a-cone', {
      'radius-bottom': 0.090, 'radius-top': 0.052, height: 0.30,
      position: '0 -0.10 0', 'segments-radial': 7,
      material: `color:${robe};shader:flat`,
    }));
    root.appendChild(_cyl(0.094, 0.026, robe, 0, -0.25, 0));

    // Torso
    root.appendChild(_box(0.108, 0.118, 0.088, robe, 0, 0.055, 0));

    // Hals + Kopf
    root.appendChild(_cyl(0.024, 0.055, skin, 0, 0.133, 0));
    root.appendChild(_sph(0.064, skin, null, 0, 1, 0, 0.190, 0));
    root.appendChild(_sph(0.030, skin, null, 0, 1, -0.054, 0.185, 0.018));
    root.appendChild(_sph(0.030, skin, null, 0, 1,  0.054, 0.185, 0.018));

    // Augen + Pupillen
    root.appendChild(_sph(0.015, '#336699', null, 0, 1, -0.030, 0.196, 0.055));
    root.appendChild(_sph(0.015, '#336699', null, 0, 1,  0.030, 0.196, 0.055));
    root.appendChild(_sph(0.009, '#060408', null, 0, 1, -0.030, 0.196, 0.062));
    root.appendChild(_sph(0.009, '#060408', null, 0, 1,  0.030, 0.196, 0.062));
    root.appendChild(_sph(0.004, '#ffffff', null, 0, 1, -0.024, 0.200, 0.065));
    root.appendChild(_sph(0.004, '#ffffff', null, 0, 1,  0.024, 0.200, 0.065));

    // Weißes langes Haar
    root.appendChild(_box(0.115, 0.088, 0.105, hair, 0, 0.202, -0.024));
    root.appendChild(_box(0.058, 0.185, 0.042, hair, -0.072, 0.140, -0.020));
    root.appendChild(_box(0.058, 0.185, 0.042, hair,  0.072, 0.140, -0.020));

    // Goldene Stirnkrone
    root.appendChild(_el('a-torus', {
      radius: 0.058, 'radius-tubular': 0.006, position: '0 0.232 0',
      'segments-tubular': 6, 'segments-radial': 14,
      material: `color:${gold};shader:flat;emissive:${gold};emissiveIntensity:0.9`,
    }));
    root.appendChild(_sph(0.014, '#ff88cc', '#ff44aa', 3.0, 1, 0, 0.244, 0.055));

    // Arme
    const mkArm = (side) => {
      const piv = document.createElement('a-entity');
      piv.setAttribute('position', `${side * 0.060} 0.058 0`);
      piv.setAttribute('rotation', `0 0 ${side * 38}`);
      piv.appendChild(_cyl(0.018, 0.098, robe, 0, -0.049, 0));
      piv.appendChild(_sph(0.019, skin, null, 0, 1, 0, -0.098, 0));
      return piv;
    };
    root.appendChild(mkArm(-1));
    root.appendChild(mkArm( 1));

    // Zauberstab
    const staffPiv = document.createElement('a-entity');
    staffPiv.setAttribute('position', '0.060 0.058 0');
    staffPiv.setAttribute('rotation', '0 0 38');
    staffPiv.appendChild(_cyl(0.009, 0.24, '#d0a840', 0, -0.12, 0));
    staffPiv.appendChild(_sph(0.022, gold, gold, 3.5, 1, 0, -0.24, 0));
    root.appendChild(staffPiv);

    // Aura
    const aura = _sph(0.22, '#cc88ff', '#aa44ff', 0.4, 0.12, 0, 0.055, 0);
    root.appendChild(aura);
    this._aura = aura;

    // Flügel
    const wL1 = _plane(0.26, 0.20, wCol, 0.62, -0.13,  0.040, 0, -10,  28, 0);
    const wL2 = _plane(0.20, 0.16, wCol, 0.46, -0.12, -0.065, 0,  -5,  22, 0);
    const wR1 = _plane(0.26, 0.20, wCol, 0.62,  0.13,  0.040, 0, -10, -28, 0);
    const wR2 = _plane(0.20, 0.16, wCol, 0.46,  0.12, -0.065, 0,  -5, -22, 0);
    root.appendChild(wL1); root.appendChild(wL2);
    root.appendChild(wR1); root.appendChild(wR2);
    this._wL = [wL1, wL2];
    this._wR = [wR1, wR2];

    // Feenstaub-Orbs
    for (let i = 0; i < 5; i++) {
      const orb = _sph(0.011, '#ffdd88', '#ffaa00', 2.5, 0.72, 0, -200, 0);
      root.appendChild(orb);
      this._orbs.push({ el: orb, phase: (i / 5) * Math.PI * 2,
        r: 0.22 + i * 0.04, oy: 0.06 + i * 0.05 });
    }

    this.el.sceneEl.appendChild(root);
    this._root = root;
  },

  // ── Dialog-Panel ─────────────────────────────────────────────────────────
  _buildDialog() {
    const dlg = document.createElement('a-entity');
    dlg.setAttribute('visible', false);

    // Rahmen
    dlg.appendChild(_el('a-plane', {
      width: 0.72, height: 0.38,
      material: 'color:#cc88ff;shader:flat;transparent:true;opacity:0.38',
      position: '0 0 -0.003',
    }));
    // Hintergrund
    dlg.appendChild(_el('a-plane', {
      width: 0.66, height: 0.32,
      material: 'color:#180030;shader:flat;transparent:true;opacity:0.92',
    }));

    // Frage-Text
    dlg.appendChild(_el('a-text', {
      value: 'Möchtest du mit Feenstaub\nbestäubt werden?',
      align: 'center', color: '#ffddff',
      width: 0.58, 'wrap-count': 28,
      position: '0 0.075 0.006',
    }));

    // ── Ja-Button ──
    const jaBtn = _el('a-plane', {
      class: 'ui-btn',
      width: 0.24, height: 0.090,
      material: 'color:#5522aa;shader:flat;transparent:true;opacity:0.95',
      position: '-0.165 -0.088 0.006',
    });
    // Größerer Text: hohe width, niedrige wrap-count → große Zeichen
    jaBtn.appendChild(_el('a-text', {
      value: 'Ja', align: 'center', color: '#ffccff',
      width: 0.55, 'wrap-count': 4,
      position: '0 0 0.004',
    }));
    jaBtn.addEventListener('click', () => this._onAnswer(true));
    dlg.appendChild(jaBtn);

    // ── Nein-Button ──
    const neinBtn = _el('a-plane', {
      class: 'ui-btn',
      width: 0.24, height: 0.090,
      material: 'color:#220044;shader:flat;transparent:true;opacity:0.95',
      position: '0.165 -0.088 0.006',
    });
    neinBtn.appendChild(_el('a-text', {
      value: 'Nein', align: 'center', color: '#ccaaee',
      width: 0.55, 'wrap-count': 6,
      position: '0 0 0.004',
    }));
    neinBtn.addEventListener('click', () => this._onAnswer(false));
    dlg.appendChild(neinBtn);

    this.el.sceneEl.appendChild(dlg);
    this._dialog = dlg;
  },

  _onAnswer(yes) {
    if (this._answered) return;
    this._answered = true;
    this._hideDialog();
    if (yes) this.el.sceneEl.emit('fairy-transform');
  },

  _showDialog() {
    if (this._dialogVis) return;
    this._dialogVis = true;
    this._dialog.setAttribute('visible', true);
  },

  _hideDialog() {
    if (!this._dialogVis) return;
    this._dialogVis = false;
    this._dialog.setAttribute('visible', false);
  },

  tick(t, dt) {
    if (!this._root) return;
    const ts = t * 0.001;
    const s  = Math.min(dt, 50) * 0.001;

    // ── Visuelle Animationen ──
    const flapAng = Math.sin(ts * 9.0 + this._wPhase) * 0.60;
    this._wL.forEach((w, i) => {
      if (w.object3D)
        w.object3D.rotation.z =  (i === 0 ? 0.48 : 0.75) + flapAng * (i === 0 ? 1.0 : 0.65);
    });
    this._wR.forEach((w, i) => {
      if (w.object3D)
        w.object3D.rotation.z = -((i === 0 ? 0.48 : 0.75) + flapAng * (i === 0 ? 1.0 : 0.65));
    });
    if (this._aura && this._aura.object3D)
      this._aura.object3D.scale.setScalar(0.85 + Math.abs(Math.sin(ts * 2.0 + this._wPhase)) * 0.30);
    this._orbs.forEach(o => {
      if (o.el.object3D) o.el.object3D.position.set(
        Math.cos(ts * 1.4 + o.phase) * o.r,
        o.oy + Math.sin(ts * 2.0 + o.phase) * 0.08,
        Math.sin(ts * 1.4 + o.phase) * o.r,
      );
    });

    // ── Kamera holen ──
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam) return;
    this._cam.object3D.getWorldPosition(this._camWP);
    if (this._camWP.z < 33) return;  // Spieler noch in Kesselstadt

    const fp   = this._root.object3D.position;
    const dxC  = fp.x - this._camWP.x;
    const dzC  = fp.z - this._camWP.z;
    const dist = Math.sqrt(dxC * dxC + dzC * dzC);

    // Dialog vor der Fee zum Spieler hin ausrichten
    if (this._dialogVis && this._dialog.object3D) {
      const len = Math.max(0.1, dist);
      const nx  = -dxC / len;
      const nz  = -dzC / len;
      this._dialog.object3D.position.set(
        fp.x + nx * 0.55,
        fp.y + 0.72,
        fp.z + nz * 0.55,
      );
      this._dialog.object3D.rotation.y = Math.atan2(nx, nz);
    }

    // Dialog ein-/ausblenden
    if (!this._answered) {
      if (dist < 3.0) this._showDialog();
      else if (dist > 4.5) this._hideDialog();
    }

    // ── Hover-Animation (Y) ──
    fp.y = 0.62 + Math.sin(ts * 0.85) * 0.09;

    // ── Zum Spieler wenden wenn nah, sonst Wegpunkt-Navigation ──
    if (dist < 3.5) {
      // Zur Spielerrichtung drehen, anhalten
      const ta = Math.atan2(-dxC, -dzC);
      let da   = ta - this._angle;
      if (da >  Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      this._angle += da * Math.min(1, s * 5);
      this._root.object3D.rotation.y = this._angle;
      this._wait = 0.5;
      return;
    }

    if (this._wait > 0) {
      this._wait -= s;
      return;
    }

    const wp  = this._wps[this._wpIdx];
    const dxW = wp[0] - fp.x;
    const dzW = wp[1] - fp.z;
    const dW  = Math.sqrt(dxW * dxW + dzW * dzW);

    if (dW < 0.5) {
      this._wpIdx = (this._wpIdx + 1) % this._wps.length;
      this._wait  = 2 + Math.random() * 4;
      return;
    }

    fp.x += dxW / dW * this._speed * s;
    fp.z += dzW / dW * this._speed * s;

    const ta = Math.atan2(dxW, dzW);
    let da   = ta - this._angle;
    if (da >  Math.PI) da -= Math.PI * 2;
    if (da < -Math.PI) da += Math.PI * 2;
    this._angle += da * Math.min(1, s * 4);
    this._root.object3D.rotation.y = this._angle;
  },

  remove() {
    [this._root, this._dialog].forEach(e => {
      if (e && e.parentNode) e.parentNode.removeChild(e);
    });
  },
});


/* ════════════════════════════════════════════════════════════════════════════
   FAIRY-MODE  –  Verwandlungsanimation, Fliegen, Flügel, Schweif
   ════════════════════════════════════════════════════════════════════════════ */
AFRAME.registerComponent('fairy-mode', {
  schema: { active: { type: 'boolean', default: false } },

  // Verwandlungsdauer in Sekunden
  TRANSFORM_DUR: 2.8,
  FAIRY_SCALE:   0.22,

  init() {
    this._rig          = null;
    this._wL           = null;
    this._wR           = null;
    this._trail        = [];
    this._trailTick    = 0;
    this._vY           = 0;
    this._rise         = false;
    this._sink         = false;
    this._wPhase       = Math.random() * Math.PI * 2;
    this._tmpWP        = new THREE.Vector3();
    this._transforming = false;
    this._transformT   = 0;

    this.el.sceneEl.addEventListener('fairy-transform', () => {
      this.el.setAttribute('fairy-mode', 'active', true);
    });
  },

  update(oldData) {
    if (this.data.active && !oldData.active) this._activate();
  },

  _activate() {
    this._rig = document.getElementById('rig');
    if (!this._rig) return;

    // Kamera-Lokalposition merken damit Rig-XZ während der Skalierung
    // nachgeführt wird → Kamera-Weltposition bleibt konstant, kein Zone-Revert
    const cam = document.getElementById('camera');
    this._rigPosStart     = this._rig.object3D.position.clone();
    this._camLocalAtStart = cam ? cam.object3D.position.clone() : new THREE.Vector3();

    // Verwandlungsanimation starten (Position bleibt, nur Scale ändert sich)
    this._transforming = true;
    this._transformT   = 0;

    // Flügel und Schweif aufbauen – Flügel zunächst unsichtbar
    this._buildWings();
    this._buildTrail();
    this._bindControls();
  },

  // ── Flügel am Rig (in Rig-Lokalraum, sichtbar in Peripherie) ─────────────
  _buildWings() {
    const rig = this._rig;

    const mkWingSet = (side) => {
      const piv = document.createElement('a-entity');
      piv.setAttribute('position', `${side * 0.68} 1.44 -0.22`);
      piv.setAttribute('visible', false);  // erscheinen erst nach Verwandlung

      const wu = _el('a-plane', {
        width: 2.8, height: 2.2,
        rotation: `-10 ${side > 0 ? -30 : 30} 0`,
        position: `${side * 0.88} 0.24 0`,
        material: 'color:#dd88ff;shader:flat;transparent:true;opacity:0.70;side:double' +
                  ';emissive:#aa44ff;emissiveIntensity:0.35',
      });
      const wui = _el('a-plane', {
        width: 2.0, height: 1.55,
        rotation: `-10 ${side > 0 ? -30 : 30} 0`,
        position: `${side * 0.86} 0.20 0.01`,
        material: 'color:#ffffff;shader:flat;transparent:true;opacity:0.18;side:double' +
                  ';emissive:#ffccff;emissiveIntensity:0.5',
      });
      const wl = _el('a-plane', {
        width: 2.0, height: 1.55,
        rotation: `-6 ${side > 0 ? -24 : 24} 0`,
        position: `${side * 0.78} -0.58 0`,
        material: 'color:#cc66ee;shader:flat;transparent:true;opacity:0.58;side:double' +
                  ';emissive:#882299;emissiveIntensity:0.28',
      });

      piv.appendChild(wu); piv.appendChild(wui); piv.appendChild(wl);
      rig.appendChild(piv);
      return { piv, wu, wl };
    };

    this._wL = mkWingSet(-1);
    this._wR = mkWingSet( 1);
  },

  // ── Magischer Schweif (Weltkoordinaten, Ring-Puffer) ──────────────────────
  _buildTrail() {
    const scene = this.el.sceneEl;
    for (let i = 0; i < 12; i++) {
      const op  = Math.max(0.05, 0.72 - i * 0.055);
      const r   = Math.max(0.008, 0.040 - i * 0.0024);
      const orb = _sph(r, '#ffaaee', '#ff66cc', 1.6, op, 0, -600, 0);
      scene.appendChild(orb);
      this._trail.push({ el: orb, x: 0, y: -600, z: 0 });
    }
  },

  // ── Controller + Keyboard ─────────────────────────────────────────────────
  _bindControls() {
    const rh = document.getElementById('rightHand');
    if (rh) {
      rh.addEventListener('bbuttondown', () => { this._rise = true;  });
      rh.addEventListener('bbuttonup',   () => { this._rise = false; });
      rh.addEventListener('abuttondown', () => { this._sink = true;  });
      rh.addEventListener('abuttonup',   () => { this._sink = false; });
    }
    document.addEventListener('keydown', e => {
      if (!this.data.active) return;
      if (e.code === 'Space') { e.preventDefault(); this._rise = true;  }
      if (e.code === 'KeyC')  { this._sink = true;  }
    });
    document.addEventListener('keyup', e => {
      if (e.code === 'Space') this._rise = false;
      if (e.code === 'KeyC')  this._sink = false;
    });
  },

  tick(t, dt) {
    if (!this.data.active || !this._rig || dt > 200) return;
    const s  = Math.min(dt, 50) * 0.001;
    const ts = t * 0.001;

    // ── Verwandlungsanimation ──
    if (this._transforming) {
      this._transformT += s;
      const progress = Math.min(1, this._transformT / this.TRANSFORM_DUR);
      // easeInOut: erst langsam, dann schneller, am Ende wieder langsam
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const currentScale = 1.0 - (1.0 - this.FAIRY_SCALE) * ease;
      this._rig.object3D.scale.setScalar(currentScale);

      // Rig verschieben damit die Kamera-Weltposition konstant bleibt:
      // rigWorld + camLocal * scale = rigStart + camLocal * 1  =>  rigWorld = rigStart + camLocal * (1 - scale)
      const drift = 1.0 - currentScale;
      this._rig.object3D.position.x = this._rigPosStart.x + this._camLocalAtStart.x * drift;
      this._rig.object3D.position.z = this._rigPosStart.z + this._camLocalAtStart.z * drift;

      if (progress >= 1) {
        this._transforming = false;
        this._rig.object3D.scale.setScalar(this.FAIRY_SCALE);
        // Flügel einblenden
        if (this._wL) this._wL.piv.setAttribute('visible', true);
        if (this._wR) this._wR.piv.setAttribute('visible', true);
      }
      return;  // Während Verwandlung kein Fliegen
    }

    // ── Vertikales Fliegen ──
    if (this._rise) {
      this._vY = Math.min( 5.0, this._vY + 4.5 * s);
    } else if (this._sink) {
      this._vY = Math.max(-4.0, this._vY - 4.5 * s);
    } else {
      this._vY = Math.max(-3.0, this._vY - 2.2 * s);
    }

    const pos = this._rig.object3D.position;
    pos.y = Math.max(0.0, Math.min(30.0, pos.y + this._vY * s));
    if (pos.y <= 0.0) this._vY = Math.max(0, this._vY);

    // ── Flügelschlag ──
    if (this._wL && this._wL.piv.object3D) {
      const flap = Math.sin(ts * 10.5 + this._wPhase) * 0.55;
      const tilt = this._rise ? -0.38 : (this._sink ? 0.20 : 0);
      this._wL.piv.object3D.rotation.z =  flap + tilt;
      this._wR.piv.object3D.rotation.z = -flap - tilt;
      this._wL.piv.object3D.rotation.x = tilt * 0.4;
      this._wR.piv.object3D.rotation.x = tilt * 0.4;
    }

    // ── Magischer Schweif ──
    this._trailTick -= s;
    if (this._trailTick <= 0 && this._trail.length > 0) {
      this._trailTick = 0.05;
      const cam = document.getElementById('camera');
      if (cam) cam.object3D.getWorldPosition(this._tmpWP);
      else     this._rig.object3D.getWorldPosition(this._tmpWP);

      for (let i = this._trail.length - 1; i > 0; i--) {
        this._trail[i].x = this._trail[i - 1].x;
        this._trail[i].y = this._trail[i - 1].y;
        this._trail[i].z = this._trail[i - 1].z;
      }
      this._trail[0].x = this._tmpWP.x;
      this._trail[0].y = this._tmpWP.y - 0.06;
      this._trail[0].z = this._tmpWP.z;
    }

    this._trail.forEach((pt, i) => {
      if (!pt.el.object3D) return;
      const pulse = 0.80 + Math.sin(ts * 7 + i * 0.9) * 0.20;
      const sc    = Math.max(0.05, (1.0 - i * 0.075) * pulse);
      pt.el.object3D.position.set(pt.x, pt.y, pt.z);
      pt.el.object3D.scale.setScalar(sc);
    });
  },

  remove() {
    this._trail.forEach(pt => {
      if (pt.el && pt.el.parentNode) pt.el.parentNode.removeChild(pt.el);
    });
  },
});

})();
