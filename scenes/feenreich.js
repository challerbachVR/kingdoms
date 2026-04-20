// ═══════════════════════════════════════════════════════════════════════════
// FEENREICH SZENE – Magische Feenlandschaft südlich der Kesselstadt
// Erreichbar durch das Südtor (Welt-Z > 33).
// ═══════════════════════════════════════════════════════════════════════════

/* ── Prozeduraler Feenreich-Himmel ──────────────────────────────────────────
   Achtung: document.body existiert nicht wenn <script> im <head> läuft.
   Deshalb: Funktion hier definieren, Canvas-Erstellung in feenreich-scene.init()
   ─────────────────────────────────────────────────────────────────────────── */
function _drawFeenSky(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Hauptgradient: tief-violett → lila → pink → pfirsich
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,    '#0e001f');
  bg.addColorStop(0.20, '#2d0055');
  bg.addColorStop(0.48, '#8822aa');
  bg.addColorStop(0.72, '#dd66bb');
  bg.addColorStop(0.88, '#ffaacc');
  bg.addColorStop(1,    '#ffd4a0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Aurora-Bänder (horizontal)
  [
    { y: 0.08, col: '#00ffcc', a: 0.28 },
    { y: 0.18, col: '#aa44ff', a: 0.22 },
    { y: 0.30, col: '#ff44aa', a: 0.18 },
    { y: 0.42, col: '#44ffbb', a: 0.14 },
  ].forEach(({ y, col, a }) => {
    const yc = H * y;
    const gr = ctx.createLinearGradient(0, yc - 45, 0, yc + 45);
    gr.addColorStop(0,   'rgba(0,0,0,0)');
    gr.addColorStop(0.5, col + Math.round(a * 255).toString(16).padStart(2, '0'));
    gr.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, yc - 45, W, 90);
  });

  // Sterne
  const starPalette = ['#ffffff', '#ffccff', '#ccffff', '#ffffcc', '#ffbbee'];
  for (let i = 0; i < 280; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H * 0.62;
    const r = 0.4 + Math.random() * 1.8;
    ctx.fillStyle = starPalette[Math.floor(Math.random() * starPalette.length)];
    ctx.globalAlpha = 0.35 + Math.random() * 0.65;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Magische Wolkenschimmer
  const cloudCols = ['#ff88cc', '#aa88ff', '#88ccff', '#ffaa88', '#cc88ff'];
  for (let i = 0; i < 12; i++) {
    const x  = Math.random() * W;
    const y  = H * (0.38 + Math.random() * 0.50);
    const rw = 55 + Math.random() * 130;
    const rh = rw * (0.22 + Math.random() * 0.18);
    const col = cloudCols[i % cloudCols.length];
    const gr = ctx.createRadialGradient(x, y, 0, x, y, rw);
    gr.addColorStop(0, col + 'aa');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2); ctx.fill();
  }

  // Zwei magische Monde / Orbs
  [
    { x: W * 0.22, y: H * 0.20, r: 26, col: '#ffeedd' },
    { x: W * 0.78, y: H * 0.13, r: 16, col: '#ddeeff' },
  ].forEach(({ x, y, r, col }) => {
    const gr = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r * 1.4);
    gr.addColorStop(0,   '#ffffff');
    gr.addColorStop(0.4, col);
    gr.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  });
}

/* ── Bach: prozedurale Three.js-Geometrie als Schleife ──────────────────── */
AFRAME.registerComponent('fairy-stream', {
  init() {
    const pts = [
      new THREE.Vector3( 8,  0.04,  46),
      new THREE.Vector3( 6,  0.04,  58),
      new THREE.Vector3( 2,  0.04,  70),
      new THREE.Vector3(-3,  0.04,  82),
      new THREE.Vector3(-7,  0.04,  94),
      new THREE.Vector3(-10, 0.04, 106),
    ];
    const curve   = new THREE.CatmullRomCurve3(pts);
    const samples = curve.getPoints(60);
    const width   = 2.4;
    const pos = [], idx = [];

    for (let i = 0; i < samples.length; i++) {
      const p = samples[i];
      const tang = i < samples.length - 1
        ? new THREE.Vector3().subVectors(samples[i + 1], p).normalize()
        : new THREE.Vector3().subVectors(p, samples[i - 1]).normalize();
      const norm = new THREE.Vector3(tang.z, 0, -tang.x);
      const l = new THREE.Vector3().addVectors(p, norm.clone().multiplyScalar(-width * 0.5));
      const r = new THREE.Vector3().addVectors(p, norm.clone().multiplyScalar( width * 0.5));
      pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
    }
    for (let i = 0; i < samples.length - 1; i++) {
      const a = i*2, b = i*2+1, c = i*2+2, d = i*2+3;
      idx.push(a, b, c,  b, d, c);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);

    this._mat = new THREE.MeshBasicMaterial({
      color: 0x88ddff, transparent: true, opacity: 0.62, side: THREE.DoubleSide,
    });
    this.el.setObject3D('stream', new THREE.Mesh(geo, this._mat));

    // Uferstreifen links + rechts (etwas breiter, dunkler grün)
    const bankW = 1.0;
    ['l', 'r'].forEach((side, si) => {
      const bpos = [];
      for (let i = 0; i < samples.length; i++) {
        const p = samples[i];
        const tang = i < samples.length - 1
          ? new THREE.Vector3().subVectors(samples[i + 1], p).normalize()
          : new THREE.Vector3().subVectors(p, samples[i - 1]).normalize();
        const norm = new THREE.Vector3(tang.z, 0, -tang.x);
        const sign = si === 0 ? -1 : 1;
        const inner = new THREE.Vector3().addVectors(p, norm.clone().multiplyScalar( sign * width * 0.5));
        const outer = new THREE.Vector3().addVectors(p, norm.clone().multiplyScalar( sign * (width * 0.5 + bankW)));
        inner.y = 0.01; outer.y = 0.01;
        bpos.push(inner.x, inner.y, inner.z, outer.x, outer.y, outer.z);
      }
      const bgeo = new THREE.BufferGeometry();
      bgeo.setAttribute('position', new THREE.Float32BufferAttribute(bpos, 3));
      bgeo.setIndex([...idx]);
      const bmat = new THREE.MeshBasicMaterial({ color: 0x449933, side: THREE.DoubleSide });
      this.el.setObject3D(`bank_${side}`, new THREE.Mesh(bgeo, bmat));
    });
  },

  tick(t) {
    if (!this._mat) return;
    this._mat.opacity = 0.55 + Math.sin(t * 0.0015) * 0.10;
  },

  remove() {
    ['stream', 'bank_l', 'bank_r'].forEach(k => this.el.removeObject3D(k));
  },
});

/* ── Schwebende Feenlichter ─────────────────────────────────────────────── */
AFRAME.registerComponent('fairy-dust', {
  schema: {
    count:  { default: 10 },
    spread: { default: 4  },
    color:  { default: '#ffffff' },
    height: { default: 2  },
  },
  init() {
    this._p = [];
    const { count, spread, color, height } = this.data;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('a-sphere');
      s.setAttribute('radius', 0.045 + Math.random() * 0.055);
      s.setAttribute('segments-width',  '4');
      s.setAttribute('segments-height', '3');
      s.setAttribute('material',
        `color:${color};emissive:${color};emissiveIntensity:1.2;shader:flat;` +
        `opacity:0.85;transparent:true`);
      this.el.appendChild(s);
      this._p.push({
        el: s,
        ox: (Math.random() - 0.5) * spread,
        oz: (Math.random() - 0.5) * spread,
        oy: 0.4 + Math.random() * height,
        ph: Math.random() * Math.PI * 2,
        sp: 0.28 + Math.random() * 0.35,
        bob: 0.25 + Math.random() * 0.40,
      });
    }
  },
  tick(t) {
    const ts = t * 0.001;
    this._p.forEach(p => {
      p.el.object3D.position.set(
        p.ox + Math.sin(ts * p.sp + p.ph) * 0.55,
        p.oy + Math.sin(ts * p.sp * 1.3 + p.ph) * p.bob,
        p.oz + Math.cos(ts * p.sp * 0.9 + p.ph) * 0.55,
      );
      p.el.object3D.scale.setScalar(0.5 + Math.abs(Math.sin(ts * 6 + p.ph)) * 0.5);
    });
  },
  remove() {
    this._p.forEach(p => { if (p.el.parentNode) p.el.parentNode.removeChild(p.el); });
  },
});

/* ── Feenreich-Szene: Zone-Erkennung + Himmelswechsel ──────────────────── */
AFRAME.registerComponent('feenreich-scene', {
  init() {
    // Canvas hier erstellen – document.body existiert jetzt sicher
    if (!document.getElementById('fee-sky-canvas')) {
      const c = document.createElement('canvas');
      c.id = 'fee-sky-canvas'; c.width = 1024; c.height = 512; c.style.display = 'none';
      document.body.appendChild(c);
      _drawFeenSky(c);
    }

    this.el.insertAdjacentHTML('beforeend', FEENREICH_HTML);
    this._inFeen = false;
    this._cam    = null;
    this._sky    = null;
    this._amb    = null;
    this._sun    = null;
    // Pre-alloc: kein Objekt-Müll im Tick
    this._camWP  = new THREE.Vector3();
  },

  // Tauscht die Sky-Sphere-Textur direkt über Three.js aus
  // (tex-Komponente hat kein update() – setAttribute wäre wirkungslos)
  _swapSkyTo(canvasId) {
    if (!this._sky) return;
    if (!window._KC_TEX) window._KC_TEX = {};
    if (!window._KC_TEX[canvasId]) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) { console.warn('feenreich: canvas nicht gefunden:', canvasId); return; }
      const t = new THREE.CanvasTexture(canvas);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.needsUpdate = true;
      window._KC_TEX[canvasId] = t;
    }
    const tex = window._KC_TEX[canvasId];
    this._sky.object3D.traverse(n => {
      if (n.isMesh && n.material) {
        n.material.map = tex;
        n.material.needsUpdate = true;
      }
    });
  },

  tick() {
    // Kamera-Weltposition prüfen – funktioniert sowohl mit WASD (Desktop)
    // als auch mit vr-movement (Quest 3), da WASD nur die Kamera,
    // nicht den Rig bewegt.
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._sky) this._sky = document.getElementById('sky-sphere');
    if (!this._amb) this._amb = document.getElementById('ambLight');
    if (!this._sun) this._sun = document.getElementById('sun');
    if (!this._cam) return;

    this._cam.object3D.getWorldPosition(this._camWP);
    const feen = this._camWP.z > 33;
    if (feen === this._inFeen) return;
    this._inFeen = feen;

    if (feen) {
      this._swapSkyTo('fee-sky-canvas');
      if (this._amb) this._amb.setAttribute('light', 'type:ambient;intensity:0.55;color:#cc88ff');
      if (this._sun) {
        this._sun.setAttribute('light', 'type:directional;intensity:0.6;color:#ff88cc');
        this._sun.setAttribute('position', '-6 10 20');
      }
    } else {
      this._swapSkyTo('sky-canvas');
      if (this._amb) this._amb.setAttribute('light', 'type:ambient;intensity:0.7;color:#fff8f0');
      if (this._sun) {
        this._sun.setAttribute('light', 'type:directional;intensity:1.1;color:#fff5cc');
        this._sun.setAttribute('position', '5 12 -8');
      }
    }
  },
});

// ─── Szenen-HTML ─────────────────────────────────────────────────────────────
const FEENREICH_HTML = /* html */`

  <!-- ═══ ÜBERGANGSWEG (Südtor → Feenreich) ═══ -->
  <a-plane position="0 0.01 36" rotation="-90 0 0" width="10" height="14"
    material="color:#88cc66;shader:flat">
  </a-plane>
  <!-- Grasbüschel zu beiden Seiten des Wegs -->
  <a-plane position="-8 0.01 34" rotation="-90 0 0" width="8" height="10"
    material="color:#99dd77;shader:flat">
  </a-plane>
  <a-plane position="8 0.01 34" rotation="-90 0 0" width="8" height="10"
    material="color:#aae088;shader:flat">
  </a-plane>

  <!-- ═══ HAUPTWIESE ═══ -->
  <a-plane position="0 0 82" rotation="-90 0 0" width="130" height="110"
    material="color:#96d870;shader:flat">
  </a-plane>

  <!-- Pastellfarbene Grasflecken -->
  <a-plane position="14 0.015 54"  rotation="-90 0 0" width="14" height="10"
    material="color:#f0c8e0;opacity:0.72;transparent:true;shader:flat">
  </a-plane>
  <a-plane position="-10 0.015 76" rotation="-90 0 0" width="12" height="16"
    material="color:#c0d8f8;opacity:0.65;transparent:true;shader:flat">
  </a-plane>
  <a-plane position="5 0.015 96"   rotation="-90 0 0" width="18" height="12"
    material="color:#f8e0c0;opacity:0.60;transparent:true;shader:flat">
  </a-plane>
  <a-plane position="-18 0.015 92" rotation="-90 0 0" width="10" height="14"
    material="color:#e0f0c8;opacity:0.70;transparent:true;shader:flat">
  </a-plane>
  <a-plane position="20 0.015 88"  rotation="-90 0 0" width="16" height="10"
    material="color:#f0d8f8;opacity:0.65;transparent:true;shader:flat">
  </a-plane>

  <!-- ═══ HÜGEL (flache Kugeln halb im Boden) ═══ -->
  <a-sphere radius="9"  position="-19 -7  67" segments-width="8" segments-height="6"
    material="color:#88c860;shader:flat">
  </a-sphere>
  <a-sphere radius="7"  position=" 22 -5  73" segments-width="8" segments-height="6"
    material="color:#a0d878;shader:flat">
  </a-sphere>
  <a-sphere radius="11" position=" -6 -9 102" segments-width="8" segments-height="6"
    material="color:#90cc68;shader:flat">
  </a-sphere>
  <a-sphere radius="6"  position=" 12 -4  57" segments-width="8" segments-height="6"
    material="color:#98d470;shader:flat">
  </a-sphere>
  <a-sphere radius="8"  position="-14 -6  88" segments-width="8" segments-height="6"
    material="color:#8cca66;shader:flat">
  </a-sphere>

  <!-- ═══ RIESENPILZE ═══ -->

  <!-- Riesenpilz 1: Türkis · Position (-13, 0, 51) -->
  <a-entity position="-13 0 51">
    <a-cylinder radius="0.9" height="8" position="0 4 0" segments-radial="8"
      material="color:#e8f8f5;shader:flat">
    </a-cylinder>
    <a-sphere radius="5.5" position="0 9 0" scale="1 0.44 1"
      segments-width="10" segments-height="5"
      material="color:#00c8c0;emissive:#004844;emissiveIntensity:0.35;shader:flat">
    </a-sphere>
    <a-sphere radius="0.20" position=" 2.2 7.8  2.8" material="color:#aaffee;emissive:#00ffee;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.17" position="-2.8 7.8  1.5" material="color:#aaffee;emissive:#00ffee;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.22" position=" 0.8 7.8 -2.5" material="color:#aaffee;emissive:#00ffee;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.16" position="-1.2 7.8  2.1" material="color:#aaffee;emissive:#00ffee;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-entity position="0 9 0" light="type:point;color:#00ffcc;intensity:0.9;distance:14"></a-entity>
  </a-entity>

  <!-- Riesenpilz 2: Magenta · Position (17, 0, 57) -->
  <a-entity position="17 0 57">
    <a-cylinder radius="0.7" height="6.5" position="0 3.25 0" segments-radial="8"
      material="color:#f5eeee;shader:flat">
    </a-cylinder>
    <a-sphere radius="4.5" position="0 7.2 0" scale="1 0.43 1"
      segments-width="10" segments-height="5"
      material="color:#cc0088;emissive:#550033;emissiveIntensity:0.40;shader:flat">
    </a-sphere>
    <a-sphere radius="0.18" position=" 1.8 6.1  1.8" material="color:#ffaaee;emissive:#ff00cc;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.20" position="-2.0 6.1 -1.5" material="color:#ffaaee;emissive:#ff00cc;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.16" position=" 0.5 6.1  2.4" material="color:#ffaaee;emissive:#ff00cc;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-entity position="0 7 0" light="type:point;color:#ff44cc;intensity:0.8;distance:12"></a-entity>
  </a-entity>

  <!-- Riesenpilz 3: Orange · Position (-22, 0, 74) -->
  <a-entity position="-22 0 74">
    <a-cylinder radius="1.2" height="10" position="0 5 0" segments-radial="8"
      material="color:#f8f0e8;shader:flat">
    </a-cylinder>
    <a-sphere radius="6.5" position="0 11.2 0" scale="1 0.46 1"
      segments-width="10" segments-height="5"
      material="color:#ff7700;emissive:#662200;emissiveIntensity:0.35;shader:flat">
    </a-sphere>
    <a-sphere radius="0.25" position=" 3.0 9.7  2.5" material="color:#ffddaa;emissive:#ffaa00;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.20" position="-2.5 9.7  2.0" material="color:#ffddaa;emissive:#ffaa00;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.22" position=" 1.0 9.7 -3.2" material="color:#ffddaa;emissive:#ffaa00;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.18" position="-1.8 9.7 -1.8" material="color:#ffddaa;emissive:#ffaa00;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-entity position="0 11 0" light="type:point;color:#ff8800;intensity:1.0;distance:16"></a-entity>
  </a-entity>

  <!-- Riesenpilz 4: Violett · Position (15, 0, 83) -->
  <a-entity position="15 0 83">
    <a-cylinder radius="0.8" height="7.5" position="0 3.75 0" segments-radial="8"
      material="color:#f0eef8;shader:flat">
    </a-cylinder>
    <a-sphere radius="5.0" position="0 8.4 0" scale="1 0.44 1"
      segments-width="10" segments-height="5"
      material="color:#8800cc;emissive:#330055;emissiveIntensity:0.40;shader:flat">
    </a-sphere>
    <a-sphere radius="0.20" position=" 2.2 7.1  1.5" material="color:#ddaaff;emissive:#aa00ff;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.18" position="-1.8 7.1 -2.2" material="color:#ddaaff;emissive:#aa00ff;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.22" position=" 0.5 7.1  2.8" material="color:#ddaaff;emissive:#aa00ff;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-entity position="0 8 0" light="type:point;color:#aa44ff;intensity:0.8;distance:13"></a-entity>
  </a-entity>

  <!-- Riesenpilz 5: Goldgelb · Position (-7, 0, 93) -->
  <a-entity position="-7 0 93">
    <a-cylinder radius="0.65" height="5.5" position="0 2.75 0" segments-radial="8"
      material="color:#f8f5e8;shader:flat">
    </a-cylinder>
    <a-sphere radius="4.0" position="0 6.4 0" scale="1 0.42 1"
      segments-width="10" segments-height="5"
      material="color:#ddaa00;emissive:#664400;emissiveIntensity:0.38;shader:flat">
    </a-sphere>
    <a-sphere radius="0.18" position=" 1.5 5.3  2.0" material="color:#ffffaa;emissive:#ffee00;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.20" position="-2.1 5.3  0.8" material="color:#ffffaa;emissive:#ffee00;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.16" position=" 0.3 5.3 -1.8" material="color:#ffffaa;emissive:#ffee00;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
  </a-entity>

  <!-- Kleine Pilze – Türkis-Gruppe nahe Eingang -->
  <a-entity position="-5 0 42">
    <a-cylinder radius="0.28" height="2.2" position="0 1.1 0" segments-radial="6" material="color:#e8f8f5;shader:flat"></a-cylinder>
    <a-sphere radius="1.6" position="0 2.5 0" scale="1 0.42 1" segments-width="6" segments-height="4" material="color:#00c8c0;emissive:#003030;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>
  <a-entity position="-3 0 44">
    <a-cylinder radius="0.18" height="1.5" position="0 0.75 0" segments-radial="6" material="color:#e8f8f5;shader:flat"></a-cylinder>
    <a-sphere radius="1.1" position="0 1.65 0" scale="1 0.43 1" segments-width="6" segments-height="4" material="color:#00aaa0;emissive:#002828;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>
  <a-entity position="-7 0 46">
    <a-cylinder radius="0.22" height="1.8" position="0 0.9 0" segments-radial="6" material="color:#f0f8f5;shader:flat"></a-cylinder>
    <a-sphere radius="1.4" position="0 2.0 0" scale="1 0.41 1" segments-width="6" segments-height="4" material="color:#22ddcc;emissive:#004040;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>

  <!-- Kleine Pilze – Magenta-Gruppe -->
  <a-entity position="10 0 62">
    <a-cylinder radius="0.24" height="2.0" position="0 1.0 0" segments-radial="6" material="color:#f8eeee;shader:flat"></a-cylinder>
    <a-sphere radius="1.5" position="0 2.3 0" scale="1 0.43 1" segments-width="6" segments-height="4" material="color:#dd0099;emissive:#440022;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>
  <a-entity position="12 0 65">
    <a-cylinder radius="0.16" height="1.4" position="0 0.7 0" segments-radial="6" material="color:#f8eeee;shader:flat"></a-cylinder>
    <a-sphere radius="1.0" position="0 1.55 0" scale="1 0.42 1" segments-width="6" segments-height="4" material="color:#cc0077;emissive:#330022;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>

  <!-- Kleine Pilze – Orange/Gold-Gruppe tief -->
  <a-entity position="4 0 100">
    <a-cylinder radius="0.20" height="1.6" position="0 0.8 0" segments-radial="6" material="color:#f8f4ee;shader:flat"></a-cylinder>
    <a-sphere radius="1.2" position="0 1.85 0" scale="1 0.44 1" segments-width="6" segments-height="4" material="color:#ff8800;emissive:#442200;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>
  <a-entity position="2 0 104">
    <a-cylinder radius="0.15" height="1.2" position="0 0.6 0" segments-radial="6" material="color:#f8f5ee;shader:flat"></a-cylinder>
    <a-sphere radius="0.9" position="0 1.35 0" scale="1 0.42 1" segments-width="6" segments-height="4" material="color:#ccaa00;emissive:#443300;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>
  <a-entity position="6 0 98">
    <a-cylinder radius="0.26" height="2.2" position="0 1.1 0" segments-radial="6" material="color:#f8f5ee;shader:flat"></a-cylinder>
    <a-sphere radius="1.5" position="0 2.5 0" scale="1 0.45 1" segments-width="6" segments-height="4" material="color:#ff9900;emissive:#553300;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>

  <!-- ═══ KRISTALLKLARER BACH ═══ -->
  <a-entity fairy-stream></a-entity>

  <!-- ═══ RIESENBAUM 1 – WESTLICHER ANKER (mit Feendorf) ═══ -->
  <a-entity position="-23 0 70">
    <!-- Stamm -->
    <a-cylinder radius="2.0" height="24" position="0 12 0" segments-radial="8"
      material="color:#3a2010;shader:flat">
    </a-cylinder>
    <!-- Äste -->
    <a-cylinder radius="0.7" height="11" position="-2.5 20 1.5" rotation="0 20 52" segments-radial="6"
      material="color:#3a2010;shader:flat">
    </a-cylinder>
    <a-cylinder radius="0.6" height="9"  position=" 2.0 22 -1" rotation="0 -25 -48" segments-radial="6"
      material="color:#3a2010;shader:flat">
    </a-cylinder>
    <a-cylinder radius="0.5" height="8"  position=" 0.5 19 2.5" rotation="30 0 20" segments-radial="6"
      material="color:#3a2010;shader:flat">
    </a-cylinder>
    <!-- Wurzeln -->
    <a-cylinder radius="0.65" height="8" position=" 4.5 0.8  0.5" rotation="0  15 68" segments-radial="6" material="color:#3a2010;shader:flat"></a-cylinder>
    <a-cylinder radius="0.55" height="7" position="-4.0 0.8  1.8" rotation="0 -25 -66" segments-radial="6" material="color:#3a2010;shader:flat"></a-cylinder>
    <a-cylinder radius="0.60" height="7" position=" 1.5 0.8  4.5" rotation="62  0  15" segments-radial="6" material="color:#3a2010;shader:flat"></a-cylinder>
    <a-cylinder radius="0.50" height="6" position="-2.0 0.8 -4.0" rotation="-64  0 -10" segments-radial="6" material="color:#3a2010;shader:flat"></a-cylinder>
    <a-cylinder radius="0.55" height="7" position=" 3.5 0.8 -3.0" rotation="-55  0  40" segments-radial="6" material="color:#3a2010;shader:flat"></a-cylinder>
    <!-- Blattwerk -->
    <a-sphere radius="9"  position=" 0  25  0" scale="1 0.78 1" segments-width="8" segments-height="6" material="color:#226633;emissive:#0a2810;emissiveIntensity:0.2;shader:flat"></a-sphere>
    <a-sphere radius="7"  position="-3  28  2" scale="1 0.80 1" segments-width="8" segments-height="6" material="color:#2a7a3a;emissive:#0a3015;emissiveIntensity:0.2;shader:flat"></a-sphere>
    <a-sphere radius="6"  position=" 3  26 -2" scale="1 0.75 1" segments-width="8" segments-height="6" material="color:#1e5c2c;emissive:#082010;emissiveIntensity:0.2;shader:flat"></a-sphere>
    <a-sphere radius="5"  position=" 1  30  1" scale="1 0.72 1" segments-width="8" segments-height="6" material="color:#338844;emissive:#0c3018;emissiveIntensity:0.2;shader:flat"></a-sphere>

    <!-- Feendorf in den Wurzeln -->
    <!-- Haus 1 -->
    <a-box width="0.55" height="0.70" depth="0.55" position=" 3.8 0.40  0.8"
      material="color:#c8a870;shader:flat">
    </a-box>
    <a-cone radius-bottom="0.40" radius-top="0" height="0.45" position=" 3.8 0.90  0.8"
      material="color:#aa3322;shader:flat">
    </a-cone>
    <a-box width="0.12" height="0.12" depth="0.02" position=" 3.8 0.42  1.09"
      material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat">
    </a-box>
    <!-- Haus 2 -->
    <a-box width="0.48" height="0.60" depth="0.48" position="-3.5 0.38  1.6"
      material="color:#b89060;shader:flat">
    </a-box>
    <a-cone radius-bottom="0.36" radius-top="0" height="0.40" position="-3.5 0.82  1.6"
      material="color:#882222;shader:flat">
    </a-cone>
    <a-box width="0.10" height="0.10" depth="0.02" position="-3.5 0.40  1.87"
      material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat">
    </a-box>
    <!-- Haus 3 -->
    <a-box width="0.42" height="0.55" depth="0.42" position=" 1.2 0.35  4.0"
      material="color:#c0a880;shader:flat">
    </a-box>
    <a-cone radius-bottom="0.32" radius-top="0" height="0.38" position=" 1.2 0.77  4.0"
      material="color:#993322;shader:flat">
    </a-cone>
    <a-box width="0.10" height="0.10" depth="0.02" position=" 1.2 0.36  4.23"
      material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat">
    </a-box>
    <!-- Haus 4 -->
    <a-box width="0.50" height="0.65" depth="0.50" position="-1.5 0.37 -3.5"
      material="color:#b89868;shader:flat">
    </a-box>
    <a-cone radius-bottom="0.38" radius-top="0" height="0.42" position="-1.5 0.84 -3.5"
      material="color:#772211;shader:flat">
    </a-cone>
    <a-box width="0.10" height="0.10" depth="0.02" position="-1.5 0.38 -3.23"
      material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat">
    </a-box>
    <!-- Brücke 1 (zw. Haus 1 und 2) -->
    <a-box width="0.10" height="0.06" depth="4.0" position=" 0.2 0.65  1.2" rotation="0 -20 0"
      material="color:#8a6540;shader:flat">
    </a-box>
    <!-- Brücke 2 (zw. Haus 2 und 3) -->
    <a-box width="0.10" height="0.06" depth="3.2" position="-1.0 0.60  2.9" rotation="0 40 0"
      material="color:#8a6540;shader:flat">
    </a-box>
    <!-- Laternen -->
    <a-cylinder radius="0.04" height="0.60" position=" 3.0 0.38  0.0" segments-radial="4" material="color:#555544;shader:flat"></a-cylinder>
    <a-sphere radius="0.08" position=" 3.0 0.70  0.0" material="color:#ffffcc;emissive:#ffdd44;emissiveIntensity:1.5;shader:flat"></a-sphere>
    <a-cylinder radius="0.04" height="0.60" position="-3.0 0.38  2.2" segments-radial="4" material="color:#555544;shader:flat"></a-cylinder>
    <a-sphere radius="0.08" position="-3.0 0.70  2.2" material="color:#ffffcc;emissive:#ffdd44;emissiveIntensity:1.5;shader:flat"></a-sphere>
    <!-- Warmes Dorflicht -->
    <a-entity position="0 0.5 0" light="type:point;color:#ffcc66;intensity:0.7;distance:8"></a-entity>
    <!-- Feenstaub im Blattwerk -->
    <a-entity position="0 25 0" fairy-dust="count:8;spread:6;color:#aaffcc;height:3"></a-entity>
  </a-entity>

  <!-- ═══ RIESENBAUM 2 – ÖSTLICHER BAUM ═══ -->
  <a-entity position="23 0 79">
    <!-- Stamm -->
    <a-cylinder radius="1.6" height="20" position="0 10 0" segments-radial="8"
      material="color:#42280e;shader:flat">
    </a-cylinder>
    <!-- Äste -->
    <a-cylinder radius="0.6" height="9" position="-2 17 1" rotation="0 15 50" segments-radial="6" material="color:#42280e;shader:flat"></a-cylinder>
    <a-cylinder radius="0.5" height="8" position=" 2 19 -1" rotation="0 -20 -46" segments-radial="6" material="color:#42280e;shader:flat"></a-cylinder>
    <!-- Wurzeln -->
    <a-cylinder radius="0.55" height="7" position=" 3.8 0.7  0.4" rotation="0  10 65" segments-radial="6" material="color:#42280e;shader:flat"></a-cylinder>
    <a-cylinder radius="0.50" height="6" position="-3.5 0.7  1.5" rotation="0 -20 -63" segments-radial="6" material="color:#42280e;shader:flat"></a-cylinder>
    <a-cylinder radius="0.48" height="6" position=" 1.2 0.7  3.8" rotation="62  0  12" segments-radial="6" material="color:#42280e;shader:flat"></a-cylinder>
    <a-cylinder radius="0.45" height="5" position="-1.5 0.7 -3.5" rotation="-60  0  -8" segments-radial="6" material="color:#42280e;shader:flat"></a-cylinder>
    <!-- Blattwerk -->
    <a-sphere radius="8"  position=" 0 21  0" scale="1 0.80 1" segments-width="8" segments-height="6" material="color:#1e5c2c;emissive:#082010;emissiveIntensity:0.2;shader:flat"></a-sphere>
    <a-sphere radius="6"  position="-2 24  1" scale="1 0.78 1" segments-width="8" segments-height="6" material="color:#286638;emissive:#0a2812;emissiveIntensity:0.2;shader:flat"></a-sphere>
    <a-sphere radius="5"  position=" 2 22 -2" scale="1 0.75 1" segments-width="8" segments-height="6" material="color:#226030;emissive:#082210;emissiveIntensity:0.2;shader:flat"></a-sphere>
    <!-- Mini-Feendorf -->
    <a-box width="0.50" height="0.62" depth="0.50" position=" 3.4 0.38  0.5" material="color:#c4a468;shader:flat"></a-box>
    <a-cone radius-bottom="0.36" radius-top="0" height="0.40" position=" 3.4 0.80  0.5" material="color:#992211;shader:flat"></a-cone>
    <a-box width="0.10" height="0.10" depth="0.02" position=" 3.4 0.38  0.78" material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat"></a-box>
    <a-box width="0.44" height="0.56" depth="0.44" position="-3.0 0.36  1.2" material="color:#b89060;shader:flat"></a-box>
    <a-cone radius-bottom="0.32" radius-top="0" height="0.36" position="-3.0 0.78  1.2" material="color:#772211;shader:flat"></a-cone>
    <a-box width="0.10" height="0.10" depth="0.02" position="-3.0 0.36  1.46" material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat"></a-box>
    <a-entity position="0 0.5 0" light="type:point;color:#ffcc55;intensity:0.6;distance:7"></a-entity>
    <!-- Feenstaub -->
    <a-entity position="0 22 0" fairy-dust="count:7;spread:5;color:#ffaaee;height:3"></a-entity>
  </a-entity>

  <!-- ═══ RIESENBAUM 3 – TIEFER WALDBAUM ═══ -->
  <a-entity position="-10 0 109">
    <a-cylinder radius="1.4" height="18" position="0 9 0" segments-radial="8"
      material="color:#3c2412;shader:flat">
    </a-cylinder>
    <a-cylinder radius="0.5" height="8" position="-1.5 16 1" rotation="0 10 48" segments-radial="6" material="color:#3c2412;shader:flat"></a-cylinder>
    <a-cylinder radius="0.45" height="7" position=" 1.5 14 0" rotation="0 -15 -45" segments-radial="6" material="color:#3c2412;shader:flat"></a-cylinder>
    <a-cylinder radius="0.50" height="6" position=" 3.5 0.7  0.5" rotation="0 10 63" segments-radial="6" material="color:#3c2412;shader:flat"></a-cylinder>
    <a-cylinder radius="0.45" height="6" position="-3.0 0.7  1.5" rotation="0 -22 -62" segments-radial="6" material="color:#3c2412;shader:flat"></a-cylinder>
    <a-cylinder radius="0.42" height="5" position=" 1.0 0.7  3.5" rotation="60 0 10" segments-radial="6" material="color:#3c2412;shader:flat"></a-cylinder>
    <a-sphere radius="7"  position=" 0 19  0" scale="1 0.80 1" segments-width="8" segments-height="6" material="color:#204e28;emissive:#081808;emissiveIntensity:0.2;shader:flat"></a-sphere>
    <a-sphere radius="5"  position="-2 22  1" scale="1 0.78 1" segments-width="8" segments-height="6" material="color:#286030;emissive:#0a2210;emissiveIntensity:0.2;shader:flat"></a-sphere>
    <a-sphere radius="4"  position=" 2 20 -1" scale="1 0.76 1" segments-width="8" segments-height="6" material="color:#1c4824;emissive:#08180a;emissiveIntensity:0.2;shader:flat"></a-sphere>
    <a-entity position="0 19 0" fairy-dust="count:6;spread:4;color:#88ffee;height:2.5"></a-entity>
  </a-entity>

  <!-- ═══ MAGISCHE BLUMEN (statisch für Terrain-Phase) ═══ -->
  <!-- Rosa Blumen nahe Eingang -->
  <a-cylinder radius="0.04" height="0.55" position=" 3.5 0.27 42" segments-radial="4" material="color:#44aa22;shader:flat"></a-cylinder>
  <a-sphere radius="0.22" position=" 3.5 0.55 42" segments-width="4" segments-height="3" material="color:#ff88cc;emissive:#aa2266;emissiveIntensity:0.5;shader:flat"></a-sphere>
  <a-cylinder radius="0.04" height="0.48" position=" 5.0 0.24 40" segments-radial="4" material="color:#44aa22;shader:flat"></a-cylinder>
  <a-sphere radius="0.18" position=" 5.0 0.50 40" segments-width="4" segments-height="3" material="color:#ffaadd;emissive:#882255;emissiveIntensity:0.5;shader:flat"></a-sphere>
  <a-cylinder radius="0.04" height="0.52" position="-4.0 0.26 43" segments-radial="4" material="color:#44aa22;shader:flat"></a-cylinder>
  <a-sphere radius="0.20" position="-4.0 0.52 43" segments-width="4" segments-height="3" material="color:#cc88ff;emissive:#6622aa;emissiveIntensity:0.5;shader:flat"></a-sphere>

  <!-- Gelbe + weiße Blumen Wiese -->
  <a-cylinder radius="0.04" height="0.50" position=" 8 0.25 60"  segments-radial="4" material="color:#44aa22;shader:flat"></a-cylinder>
  <a-sphere radius="0.19" position=" 8 0.50 60"  segments-width="4" segments-height="3" material="color:#ffff66;emissive:#aaaa00;emissiveIntensity:0.5;shader:flat"></a-sphere>
  <a-cylinder radius="0.04" height="0.45" position="-6 0.22 68"  segments-radial="4" material="color:#44aa22;shader:flat"></a-cylinder>
  <a-sphere radius="0.18" position="-6 0.46 68"  segments-width="4" segments-height="3" material="color:#ffffff;emissive:#aaaaaa;emissiveIntensity:0.4;shader:flat"></a-sphere>
  <a-cylinder radius="0.04" height="0.55" position="10 0.27 75"  segments-radial="4" material="color:#44aa22;shader:flat"></a-cylinder>
  <a-sphere radius="0.22" position="10 0.55 75"  segments-width="4" segments-height="3" material="color:#88ffcc;emissive:#22aa66;emissiveIntensity:0.5;shader:flat"></a-sphere>
  <a-cylinder radius="0.04" height="0.48" position="-8 0.24 84"  segments-radial="4" material="color:#44aa22;shader:flat"></a-cylinder>
  <a-sphere radius="0.20" position="-8 0.48 84"  segments-width="4" segments-height="3" material="color:#ffcc88;emissive:#aa6622;emissiveIntensity:0.5;shader:flat"></a-sphere>
  <a-cylinder radius="0.04" height="0.52" position=" 5 0.26 97"  segments-radial="4" material="color:#44aa22;shader:flat"></a-cylinder>
  <a-sphere radius="0.21" position=" 5 0.52 97"  segments-width="4" segments-height="3" material="color:#ff88ff;emissive:#aa22aa;emissiveIntensity:0.5;shader:flat"></a-sphere>

  <!-- ═══ ATMOSPHÄRISCHES LICHT ═══ -->
  <!-- Weiches lila Umgebungslicht mittig über der Wiese -->
  <a-entity position="0 8 75"  light="type:point;color:#cc88ff;intensity:0.45;distance:55"></a-entity>
  <!-- Blaues Mondlicht über dem Bach -->
  <a-entity position="0 6 75"  light="type:point;color:#88ccff;intensity:0.30;distance:35"></a-entity>

`;
