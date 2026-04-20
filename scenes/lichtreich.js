// ═══════════════════════════════════════════════════════════════════════════
// LICHTREICH SZENE – Kühl / kristallin / episch
// Konfliktfrei mit globalem Day/Night-System der Kesselstadt
// ═══════════════════════════════════════════════════════════════════════════

function _drawLichtSky(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0.00, '#183041');
  bg.addColorStop(0.20, '#27485f');
  bg.addColorStop(0.45, '#4c7288');
  bg.addColorStop(0.72, '#86a7b7');
  bg.addColorStop(1.00, '#d4e3ea');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const horizon = ctx.createLinearGradient(0, H * 0.55, 0, H);
  horizon.addColorStop(0.0, 'rgba(255,255,255,0)');
  horizon.addColorStop(0.45, 'rgba(185,225,240,0.10)');
  horizon.addColorStop(1.0, 'rgba(220,245,255,0.28)');
  ctx.fillStyle = horizon;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(
    W * 0.5, H * 0.58, 0,
    W * 0.5, H * 0.58, W * 0.38
  );
  glow.addColorStop(0.00, 'rgba(180,245,255,0.24)');
  glow.addColorStop(0.30, 'rgba(120,220,255,0.12)');
  glow.addColorStop(0.65, 'rgba(120,180,220,0.05)');
  glow.addColorStop(1.00, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const pillar = ctx.createLinearGradient(W * 0.48, H * 0.18, W * 0.52, H);
  pillar.addColorStop(0.0, 'rgba(220,250,255,0)');
  pillar.addColorStop(0.35, 'rgba(210,248,255,0.05)');
  pillar.addColorStop(0.6, 'rgba(180,235,255,0.10)');
  pillar.addColorStop(1.0, 'rgba(220,250,255,0)');
  ctx.fillStyle = pillar;
  ctx.fillRect(W * 0.40, 0, W * 0.20, H);

  function drawCrystalCloud(x, y, scale, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = `rgba(210,235,245,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(-110, -10);
    ctx.lineTo(-30, -26);
    ctx.lineTo(30, -16);
    ctx.lineTo(92, 12);
    ctx.lineTo(96, 34);
    ctx.lineTo(44, 52);
    ctx.lineTo(-18, 46);
    ctx.lineTo(-74, 26);
    ctx.lineTo(-112, 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(150,185,205,${alpha * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(-70, 18);
    ctx.lineTo(-12, 6);
    ctx.lineTo(28, 12);
    ctx.lineTo(74, 34);
    ctx.lineTo(40, 50);
    ctx.lineTo(-8, 48);
    ctx.lineTo(-52, 34);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawCrystalCloud(W * 0.18, H * 0.30, 0.95, 0.20);
  drawCrystalCloud(W * 0.80, H * 0.24, 0.78, 0.14);

  for (let i = 0; i < 14; i++) {
    const x = Math.random() * W;
    const y = H * (0.16 + Math.random() * 0.38);
    const len = 80 + Math.random() * 140;

    ctx.strokeStyle = `rgba(210,245,255,${0.04 + Math.random() * 0.05})`;
    ctx.lineWidth = 1 + Math.random() * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len * 0.34, y - len);
    ctx.stroke();
  }

  const hazeCols = [
    'rgba(210,240,250,0.09)',
    'rgba(150,220,245,0.06)',
    'rgba(235,250,255,0.05)',
  ];

  for (let i = 0; i < 8; i++) {
    const x = Math.random() * W;
    const y = H * (0.14 + Math.random() * 0.44);
    const rw = 120 + Math.random() * 200;
    const rh = rw * (0.12 + Math.random() * 0.10);

    const grad = ctx.createRadialGradient(x, y, 0, x, y, rw);
    grad.addColorStop(0, hazeCols[i % hazeCols.length]);
    grad.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, rw, rh, Math.random() * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 28; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H * 0.62;
    const r = 0.8 + Math.random() * 2.0;

    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
    g.addColorStop(0, 'rgba(255,255,255,0.24)');
    g.addColorStop(0.35, 'rgba(180,235,255,0.11)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 10; i++) {
    const x = Math.random() * W;
    const y = H * (0.08 + Math.random() * 0.40);
    const len = 7 + Math.random() * 10;
    const a = 0.06 + Math.random() * 0.06;

    ctx.strokeStyle = `rgba(240,250,255,${a})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - len, y);
    ctx.lineTo(x + len, y);
    ctx.moveTo(x, y - len * 0.7);
    ctx.lineTo(x, y + len * 0.7);
    ctx.stroke();
  }
}

AFRAME.registerComponent('lichtreich-scene', {
  init() {
    const canvases = [
      { id: 'licht-sky-canvas', w: 1024, h: 512, fn: _drawLichtSky },
    ];

    canvases.forEach(({ id, w, h, fn }) => {
      if (document.getElementById(id)) return;
      const c = document.createElement('canvas');
      c.id = id;
      c.width = w;
      c.height = h;
      c.style.display = 'none';
      document.body.appendChild(c);
      fn(c);
    });

    this.el.insertAdjacentHTML('beforeend', LICHTREICH_HTML);

    this._inLicht = false;
    this._cam = null;
    this._sky = null;
    this._amb = null;
    this._sun = null;
    this._scene = this.el.sceneEl;
    this._camWP = new THREE.Vector3();
  },

  _swapSkyTo(canvasId) {
    if (!this._sky) return;
    if (!window._KC_TEX) window._KC_TEX = {};

    if (!window._KC_TEX[canvasId]) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.needsUpdate = true;
      window._KC_TEX[canvasId] = tex;
    }

    const tex = window._KC_TEX[canvasId];

    this._sky.object3D.traverse((node) => {
      if (node.isMesh && node.material) {
        node.material.map = tex;
        node.material.needsUpdate = true;
      }
    });
  },

  tick() {
  if (!this._cam) this._cam = document.getElementById('camera');
  if (!this._sky) this._sky = document.getElementById('sky-sphere');
  if (!this._amb) this._amb = document.getElementById('ambLight');
  if (!this._sun) this._sun = document.getElementById('sun');
  if (!this._cam) return;

  this._cam.object3D.getWorldPosition(this._camWP);

  const start = -30;
  const end = -60;

  const t = THREE.MathUtils.clamp(
    (this._camWP.x - start) / (end - start),
    0,
    1
  );

  const inLicht = t > 0.01;

  if (inLicht !== this._inLicht) {
    this._inLicht = inLicht;
    this.el.emit('zone-changed', { zone: inLicht ? 'licht' : 'city' });
  }

  // In der Stadt: Stadthimmel wiederherstellen, aber keine Lichtwerte überschreiben
  if (!inLicht) {
    this._swapSkyTo('sky-canvas');

    if (this._scene) {
      this._scene.removeAttribute('fog');
    }
    return;
  }

  // Im Übergang / Lichtreich
  if (t > 0.6) {
    this._swapSkyTo('licht-sky-canvas');
  } else {
    this._swapSkyTo('sky-canvas');
  }

  if (this._scene) {
    const density = 0.0001 + t * 0.0032;
    this._scene.setAttribute(
      'fog',
      `type: exponential; color: #90a7b3; density: ${density}`
    );
  }

  if (this._amb) {
    const intensity = 0.7 * (1 - t) + 0.55 * t;
    this._amb.setAttribute(
      'light',
      `type: ambient; intensity: ${intensity}; color: #cfefff`
    );
  }

  if (this._sun) {
    const intensity = 1.1 * (1 - t) + 0.6 * t;
    this._sun.setAttribute(
      'light',
      `type: directional; intensity: ${intensity}; color: #d8f6ff`
    );
    this._sun.setAttribute('position', '-10 18 4');
  }
},
});

AFRAME.registerComponent('light-beam-effect', {
  init() {
    this.cam = document.getElementById('camera');
    this.zone = null;
    this.scene = this.el.sceneEl;
    this.active = false;

    this.tmp = new THREE.Vector3();
    this.zonePos = new THREE.Vector3();

    this._spawnParticles();
  },

  _ensureZone() {
    if (!this.zone) {
      this.zone = document.getElementById('beam-trigger');
      if (this.zone) {
        this.zone.object3D.getWorldPosition(this.zonePos);
      }
    }
  },

  _spawnParticles() {
    const container = document.getElementById('beam-particles');
    if (!container) return;

    for (let i = 0; i < 16; i++) {
      const p = document.createElement('a-sphere');

      p.setAttribute('radius', 0.045 + Math.random() * 0.035);
      p.setAttribute('position', {
        x: (Math.random() - 0.5) * 1.1,
        y: Math.random() * 6,
        z: (Math.random() - 0.5) * 1.1,
      });
      p.setAttribute(
        'material',
        'color:#eefaff; emissive:#bfefff; emissiveIntensity:0.32; shader:flat'
      );

      p.setAttribute('animation', {
        property: 'position',
        to: `${(Math.random() - 0.5) * 1.1} 10 ${(Math.random() - 0.5) * 1.1}`,
        dur: 3600 + Math.random() * 1800,
        loop: true,
        easing: 'linear',
      });

      container.appendChild(p);
    }
  },

  tick() {
    if (!this.cam) this.cam = document.getElementById('camera');
    this._ensureZone();

    if (!this.cam || !this.zone) return;

    this.cam.object3D.getWorldPosition(this.tmp);
    this.zone.object3D.getWorldPosition(this.zonePos);

    const dist = this.tmp.distanceTo(this.zonePos);

    if (dist < 2.2 && !this.active) {
      this._enterBeam();
    }

    if (dist > 3 && this.active) {
      this._leaveBeam();
    }
  },

  _enterBeam() {
    this.active = true;

    const cam = document.getElementById('camera');
    if (!cam) return;

    const x = cam.object3D.position.x;
    const start = -30;
    const end = -60;

    const t = THREE.MathUtils.clamp(
      (x - start) / (end - start),
      0,
      1
    );

    if (t <= 0.01) return;

    const sun = document.getElementById('sun');
    if (sun) {
      sun.setAttribute(
        'light',
        'type: directional; intensity: 1.08; color: #eef8ff'
      );
    }

    if (this.scene) {
      this.scene.setAttribute(
        'fog',
        'type: exponential; color: #a9c1cc; density: 0.0048'
      );
    }
  },

  _leaveBeam() {
    this.active = false;

    const cam = document.getElementById('camera');
    if (!cam) return;

    const x = cam.object3D.position.x;
    const start = -30;
    const end = -60;

    const t = THREE.MathUtils.clamp(
      (x - start) / (end - start),
      0,
      1
    );

    // Außerhalb Lichtreich nichts global anfassen
    if (t <= 0.01) {
      if (this.scene) {
        this.scene.removeAttribute('fog');
      }
      return;
    }

    const sun = document.getElementById('sun');
    if (sun) {
      const intensity = 1.1 * (1 - t) + 0.6 * t;
      sun.setAttribute(
        'light',
        `type: directional; intensity: ${intensity}; color: #d8f6ff`
      );
    }

    if (this.scene) {
      const density = 0.0001 + t * 0.0032;
      this.scene.setAttribute(
        'fog',
        `type: exponential; color: #90a7b3; density: ${density}`
      );
    }
  },
});

const LICHTREICH_HTML = /* html */ `
  <!-- ═══ ÜBERGANG WESTTOR → LICHTREICH ═══ -->
  <a-plane
    position="-36 0.01 0"
    rotation="-90 0 0"
    width="14"
    height="10"
    tex="id: tex-licht-ground; repx: 2; repy: 2"
    material="color:#bcc6cb; shader:flat">
  </a-plane>

  <a-plane
    position="-44 0.015 0"
    rotation="-90 0 0"
    width="18"
    height="14"
    tex="id: tex-licht-ground; repx: 2; repy: 2"
    material="color:#a7b7c1; shader:flat">
  </a-plane>

  <a-plane
    position="-53 0.02 0"
    rotation="-90 0 0"
    width="22"
    height="18"
    tex="id: tex-licht-ground; repx: 2; repy: 2"
    material="color:#93a8b1; opacity:0.18; transparent:true; shader:flat">
  </a-plane>

  <!-- ═══ HAUPTFLÄCHE ═══ -->
  <a-plane
    position="-86 0.005 0"
    rotation="-90 0 0"
    width="106"
    height="132"
    tex="id: tex-licht-ground; repx: 10; repy: 12"
    material="color:#5d7380; shader:flat">
  </a-plane>

  <!-- Schimmernde Bodenfelder -->
  <a-plane
    position="-78 0.015 -14"
    rotation="-90 0 0"
    width="18"
    height="24"
    tex="id: tex-licht-ground; repx: 2; repy: 3"
    material="color:#91a8b4; opacity:0.15; transparent:true; shader:flat">
  </a-plane>

  <a-plane
    position="-92 0.015 18"
    rotation="-90 0 0"
    width="24"
    height="18"
    tex="id: tex-licht-ground; repx: 3; repy: 2"
    material="color:#9fb1ba; opacity:0.12; transparent:true; shader:flat">
  </a-plane>

  <a-plane
    position="-64 0.015 24"
    rotation="-90 0 0"
    width="16"
    height="20"
    tex="id: tex-licht-ground; repx: 2; repy: 2"
    material="color:#879ba3; opacity:0.12; transparent:true; shader:flat">
  </a-plane>

  <a-plane
    position="-108 0.015 -18"
    rotation="-90 0 0"
    width="20"
    height="16"
    tex="id: tex-licht-ground; repx: 2; repy: 2"
    material="color:#7f8f99; opacity:0.14; transparent:true; shader:flat">
  </a-plane>

  <!-- Lichtterrassen -->
  <a-cylinder
    position="-72 0.18 -6"
    radius="8.4"
    height="0.28"
    segments-radial="8"
    tex="id: tex-licht-terrace; repx: 2; repy: 1"
    material="color:#62737d; opacity:0.18; transparent:true; shader:flat">
  </a-cylinder>

  <a-cylinder
    position="-72 1.2 -6"
    radius="8"
    height="2.4"
    segments-radial="8"
    tex="id: tex-licht-terrace; repx: 2; repy: 1"
    material="color:#a8bbc4; shader:flat">
  </a-cylinder>

  <a-cylinder
    position="-94 0.20 12"
    radius="10.5"
    height="0.30"
    segments-radial="8"
    tex="id: tex-licht-terrace; repx: 2; repy: 1"
    material="color:#62717a; opacity:0.18; transparent:true; shader:flat">
  </a-cylinder>

  <a-cylinder
    position="-94 1.6 12"
    radius="10"
    height="3.2"
    segments-radial="8"
    tex="id: tex-licht-terrace; repx: 2; repy: 1"
    material="color:#a1b6c0; shader:flat">
  </a-cylinder>

  <a-cylinder
    position="-108 0.16 -20"
    radius="7.4"
    height="0.24"
    segments-radial="8"
    tex="id: tex-licht-terrace; repx: 2; repy: 1"
    material="color:#5e6b74; opacity:0.18; transparent:true; shader:flat">
  </a-cylinder>

  <a-cylinder
    position="-108 1.0 -20"
    radius="7"
    height="2.0"
    segments-radial="8"
    tex="id: tex-licht-terrace; repx: 2; repy: 1"
    material="color:#9fb4be; shader:flat">
  </a-cylinder>

  <!-- Kristallformationen links -->
  <a-cone
    position="-72 7 -8"
    radius-bottom="3.2"
    radius-top="0.18"
    height="12"
    segments-radial="5"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#b7e4f4; emissive:#9ee9ff; emissiveIntensity:0.35; shader:flat">
  </a-cone>

  <a-cone
    position="-76 5 -3"
    radius-bottom="2.0"
    radius-top="0.14"
    height="8"
    segments-radial="5"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#d8ebf5; emissive:#c4f3ff; emissiveIntensity:0.08; shader:flat">
  </a-cone>

  <a-cone
    position="-68 4.2 -12"
    radius-bottom="1.8"
    radius-top="0.12"
    height="6.5"
    segments-radial="5"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#cad8f0; emissive:#bed7ff; emissiveIntensity:0.07; shader:flat">
  </a-cone>

  <a-cone
    position="-73 10 -7"
    radius-bottom="1.8"
    radius-top="0.10"
    height="7.5"
    segments-radial="4"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#edf9ff; emissive:#d5faff; emissiveIntensity:0.12; shader:flat">
  </a-cone>

  <!-- Kristallformationen Mitte -->
  <a-cone
    position="-94 8 10"
    radius-bottom="3.6"
    radius-top="0.18"
    height="13"
    segments-radial="5"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#cfe8f8; emissive:#b9edff; emissiveIntensity:0.10; shader:flat">
  </a-cone>

  <a-cone
    position="-99 5.2 15"
    radius-bottom="2.2"
    radius-top="0.14"
    height="8.5"
    segments-radial="5"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#b8dff2; emissive:#9deeff; emissiveIntensity:0.09; shader:flat">
  </a-cone>

  <a-cone
    position="-88 4.5 16"
    radius-bottom="1.8"
    radius-top="0.12"
    height="7"
    segments-radial="5"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#d7ddf6; emissive:#d7dfff; emissiveIntensity:0.08; shader:flat">
  </a-cone>

  <a-cone
    position="-94 11 11"
    radius-bottom="1.9"
    radius-top="0.10"
    height="8"
    segments-radial="4"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#f4fbff; emissive:#e6fdff; emissiveIntensity:0.12; shader:flat">
  </a-cone>

  <!-- Kristallformationen hinten -->
  <a-cone
    position="-108 6.5 -22"
    radius-bottom="2.8"
    radius-top="0.16"
    height="11"
    segments-radial="5"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#bbd8e7; emissive:#9fdaff; emissiveIntensity:0.10; shader:flat">
  </a-cone>

  <a-cone
    position="-113 4.2 -17"
    radius-bottom="1.8"
    radius-top="0.12"
    height="7"
    segments-radial="5"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#dce8f0; emissive:#c9eef8; emissiveIntensity:0.08; shader:flat">
  </a-cone>

  <a-cone
    position="-103 3.8 -15"
    radius-bottom="1.5"
    radius-top="0.10"
    height="6"
    segments-radial="5"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#cbe3ee; emissive:#a8f2ff; emissiveIntensity:0.08; shader:flat">
  </a-cone>

  <!-- Lichtbögen / Portale -->
  <a-torus
    position="-84 5 0"
    rotation="90 0 0"
    radius="7"
    radius-tubular="0.35"
    arc="220"
    segments-radial="6"
    segments-tubular="18"
    tex="id: tex-licht-portal; repx: 1; repy: 1"
    material="color:#d8eef8; emissive:#c7f5ff; emissiveIntensity:0.8; shader:flat">
  </a-torus>

  <a-torus
    position="-84 5 0"
    rotation="90 30 0"
    radius="5.2"
    radius-tubular="0.18"
    arc="230"
    segments-radial="6"
    segments-tubular="18"
    tex="id: tex-licht-portal; repx: 1; repy: 1"
    material="color:#b8e6ff; emissive:#8feeff; emissiveIntensity:1.0; shader:flat">
  </a-torus>

  <a-entity
    position="-84 5 0"
    light="type:point; color:#c8f3ff; intensity:0.6; distance:20">
  </a-entity>

  <a-entity
    position="-84 6.5 0"
    light="type:point; color:#bfefff; intensity:0.18; distance:12">
  </a-entity>

  <!-- Schwebende Fragmente -->
  <a-box
    position="-82 11 -5"
    rotation="24 18 14"
    width="1.4"
    height="4.5"
    depth="1.2"
    animation="property: rotation; to: 24 378 14; loop: true; dur: 32000; easing: linear"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#d0e5ee; emissive:#b7f2ff; emissiveIntensity:0.08; shader:flat">
  </a-box>

  <a-box
    position="-91 13 7"
    rotation="-14 32 -10"
    width="1.2"
    height="3.8"
    depth="1.0"
    animation="property: rotation; to: -14 392 -10; loop: true; dur: 36000; easing: linear"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#d8eaf1; emissive:#d0f8ff; emissiveIntensity:0.08; shader:flat">
  </a-box>

  <a-box
    position="-100 10 18"
    rotation="18 -24 22"
    width="1.0"
    height="3.2"
    depth="0.9"
    animation="property: rotation; to: 18 336 22; loop: true; dur: 34000; easing: linear"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#cdd9ee; emissive:#cad7ff; emissiveIntensity:0.07; shader:flat">
  </a-box>

  <a-box
    position="-110 12 -10"
    rotation="12 20 -18"
    width="1.3"
    height="4.0"
    depth="1.1"
    animation="property: rotation; to: 12 380 -18; loop: true; dur: 38000; easing: linear"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#c7e4ea; emissive:#9aefff; emissiveIntensity:0.08; shader:flat">
  </a-box>

  <!-- Schwebeinseln -->
  <a-cylinder
    position="-76 8.32 15"
    radius="4.5"
    height="0.18"
    segments-radial="8"
    tex="id: tex-licht-terrace; repx: 2; repy: 1"
    material="color:#5f6f79; opacity:0.22; transparent:true; shader:flat">
  </a-cylinder>

  <a-cylinder
    position="-76 9 15"
    radius="4.2"
    height="1.0"
    segments-radial="8"
    tex="id: tex-licht-terrace; repx: 2; repy: 1"
    material="color:#9fb3bc; shader:flat">
  </a-cylinder>

  <a-cone
    position="-76 7.9 15"
    radius-bottom="3.5"
    radius-top="0.4"
    height="1.8"
    segments-radial="6"
    tex="id: tex-licht-terrace; repx: 1; repy: 1"
    material="color:#7f949f; shader:flat">
  </a-cone>

  <a-cone
    position="-76 12.5 15"
    radius-bottom="1.2"
    radius-top="0.08"
    height="4.8"
    segments-radial="5"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#e9f8ff; emissive:#d9fbff; emissiveIntensity:0.10; shader:flat">
  </a-cone>

  <a-cylinder
    position="-104 10.36 -2"
    radius="3.8"
    height="0.18"
    segments-radial="8"
    tex="id: tex-licht-terrace; repx: 2; repy: 1"
    material="color:#596871; opacity:0.20; transparent:true; shader:flat">
  </a-cylinder>

  <a-cylinder
    position="-104 11 -2"
    radius="3.5"
    height="0.9"
    segments-radial="8"
    tex="id: tex-licht-terrace; repx: 2; repy: 1"
    material="color:#95a6af; shader:flat">
  </a-cylinder>

  <a-cone
    position="-104 10 -2"
    radius-bottom="3.0"
    radius-top="0.3"
    height="1.6"
    segments-radial="6"
    tex="id: tex-licht-terrace; repx: 1; repy: 1"
    material="color:#7b909b; shader:flat">
  </a-cone>

  <a-cone
    position="-104 14 -2"
    radius-bottom="1.0"
    radius-top="0.08"
    height="4.2"
    segments-radial="5"
    tex="id: tex-licht-crystal; repx: 1; repy: 2"
    material="color:#e8f6fd; emissive:#d5f8ff; emissiveIntensity:0.10; shader:flat">
  </a-cone>

  <!-- Leuchtsteine entlang des Wegs -->
  <a-sphere
    position="-48 0.6 2"
    radius="0.38"
    tex="id: tex-licht-crystal; repx: 1; repy: 1"
    material="color:#d7e9ef; emissive:#a6ecff; emissiveIntensity:0.26; shader:flat">
  </a-sphere>

  <a-sphere
    position="-58 0.7 -1"
    radius="0.44"
    tex="id: tex-licht-crystal; repx: 1; repy: 1"
    material="color:#cfe4eb; emissive:#98ebff; emissiveIntensity:0.24; shader:flat">
  </a-sphere>

  <a-sphere
    position="-68 0.7 3"
    radius="0.40"
    tex="id: tex-licht-crystal; repx: 1; repy: 1"
    material="color:#d9edf5; emissive:#afecff; emissiveIntensity:0.26; shader:flat">
  </a-sphere>

  <a-sphere
    position="-79 0.8 0"
    radius="0.46"
    tex="id: tex-licht-crystal; repx: 1; repy: 1"
    material="color:#e5f5ff; emissive:#c1f5ff; emissiveIntensity:0.28; shader:flat">
  </a-sphere>

  <!-- Atmosphärisches Licht -->
  <a-entity
    position="-86 14 0"
    light="type:point; color:#dff8ff; intensity:0.10; distance:16">
  </a-entity>

  <a-entity
    position="-96 12 8"
    light="type:point; color:#c6f0ff; intensity:0.08; distance:14">
  </a-entity>

  <!-- Fake Schatten unter Player -->
  <a-circle
    position="-84 0.01 0"
    rotation="-90 0 0"
    radius="6"
    material="color:#000000; opacity:0.16; transparent:true">
  </a-circle>

  <!-- ═══ SIGNATURE MOMENT: LICHTSTRAHL ═══ -->
  <a-entity id="light-beam-zone">
    <a-cylinder
      id="beam-trigger"
      position="-84 1 0"
      radius="2.2"
      height="3"
      visible="false">
    </a-cylinder>

    <a-cylinder
      id="light-beam"
      position="-84 6 0"
      radius="1.4"
      height="12"
      tex="id: tex-licht-portal; repx: 1; repy: 2"
      material="color:#f3fcff; opacity:0.22; transparent:true; shader:flat">
    </a-cylinder>

    <a-cylinder
      position="-84 6 0"
      radius="0.4"
      height="12"
      tex="id: tex-licht-portal; repx: 1; repy: 2"
      material="color:#d6f6ff; emissive:#b6f2ff; emissiveIntensity:0.7; shader:flat">
    </a-cylinder>

    <a-entity id="beam-particles" position="-84 0 0"></a-entity>
  </a-entity>
`;