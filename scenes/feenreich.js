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

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,    '#0e001f');
  bg.addColorStop(0.20, '#2d0055');
  bg.addColorStop(0.48, '#8822aa');
  bg.addColorStop(0.72, '#dd66bb');
  bg.addColorStop(0.88, '#ffaacc');
  bg.addColorStop(1,    '#ffd4a0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

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

/* ── Wiese: Pastellgrün mit Farbvariationen ─────────────────────────────── */
function _drawFeenGrass(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Pastellgrüne Basis
  ctx.fillStyle = '#9ad86a';
  ctx.fillRect(0, 0, W, H);

  // Farbflecken: Rosa, Mintgrün, Hellgelb-Grün
  [
    { x: 0.14, y: 0.12, r: 0.30, col: 'rgba(240,200,220,0.48)' },
    { x: 0.72, y: 0.22, r: 0.24, col: 'rgba(200,240,200,0.52)' },
    { x: 0.38, y: 0.68, r: 0.32, col: 'rgba(160,235,205,0.50)' },
    { x: 0.82, y: 0.72, r: 0.22, col: 'rgba(210,245,165,0.55)' },
    { x: 0.08, y: 0.80, r: 0.20, col: 'rgba(225,185,225,0.42)' },
    { x: 0.55, y: 0.42, r: 0.18, col: 'rgba(170,240,215,0.45)' },
    { x: 0.90, y: 0.08, r: 0.16, col: 'rgba(245,225,180,0.38)' },
    { x: 0.30, y: 0.30, r: 0.14, col: 'rgba(215,255,215,0.40)' },
  ].forEach(({ x, y, r, col }) => {
    const gx = x * W, gy = y * H, gr = r * Math.min(W, H);
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    grad.addColorStop(0, col);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  });

  // Grashalm-Striche für Nahdetail
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const len = 5 + Math.random() * 12;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
    const bright = 0.65 + Math.random() * 0.55;
    ctx.strokeStyle = `rgba(${Math.floor(80*bright)},${Math.floor(195*bright)},${Math.floor(70*bright)},0.32)`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }
}

/* ── Pilzkappe: Organische Flecken + Spirale ────────────────────────────── */
function _drawFeenMushcap(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Helle Basis (wird durch material.color multipliziert → Tint-Effekt)
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(0, 0, W, H);

  // Highlight-Gradient von oben-links
  const hl = ctx.createRadialGradient(W * 0.35, H * 0.28, 0, W * 0.5, H * 0.5, W * 0.65);
  hl.addColorStop(0,   'rgba(255,255,255,0.55)');
  hl.addColorStop(0.5, 'rgba(200,200,200,0.15)');
  hl.addColorStop(1,   'rgba(0,0,0,0.18)');
  ctx.fillStyle = hl;
  ctx.fillRect(0, 0, W, H);

  // Organische dunkle Flecken
  for (let i = 0; i < 14; i++) {
    const x = (0.08 + Math.random() * 0.84) * W;
    const y = (0.08 + Math.random() * 0.84) * H;
    const rx = (10 + Math.random() * 26) * (W / 256);
    const ry = rx * (0.5 + Math.random() * 0.7);
    ctx.fillStyle = `rgba(0,0,0,${0.14 + Math.random() * 0.22})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Helle leuchtende Punkte
  for (let i = 0; i < 20; i++) {
    const x = (0.05 + Math.random() * 0.90) * W;
    const y = (0.05 + Math.random() * 0.90) * H;
    const r = (3 + Math.random() * 9) * (W / 256);
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0,   `rgba(255,255,255,${0.6 + Math.random() * 0.38})`);
    gr.addColorStop(0.5, `rgba(255,255,255,0.15)`);
    gr.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // Spirale vom Zentrum
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 5; a += 0.12) {
    const sr = a * (W * 0.055);
    const sx = W / 2 + Math.cos(a) * sr;
    const sy = H / 2 + Math.sin(a) * sr;
    if (a < 0.12) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Konzentrische Ringe (Kappenstruktur)
  for (let ring = 1; ring <= 5; ring++) {
    ctx.strokeStyle = `rgba(0,0,0,${0.06 + ring * 0.016})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(W / 2, H * 0.55, W * 0.10 * ring, H * 0.06 * ring, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/* ── Baumstamm: Holzmaserung in warmen Brauntönen ───────────────────────── */
function _drawFeenBark(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Dunkles Braun als Basis
  ctx.fillStyle = '#2c1508';
  ctx.fillRect(0, 0, W, H);

  // Vertikale Maserungsstreifen
  for (let i = 0; i < 35; i++) {
    let x = Math.random() * W;
    const v = 38 + Math.floor(Math.random() * 65);
    const pr = Math.floor(v * 0.88);
    const pg = Math.floor(v * 0.54);
    const pb = Math.floor(v * 0.28);
    const alpha = 0.28 + Math.random() * 0.52;
    ctx.strokeStyle = `rgba(${pr},${pg},${pb},${alpha})`;
    ctx.lineWidth = 1.8 + Math.random() * 5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= H; y += 10) {
      x += (Math.random() - 0.5) * 6;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Horizontale Risse
  for (let i = 0; i < 10; i++) {
    const y = Math.random() * H;
    ctx.strokeStyle = `rgba(0,0,0,${0.18 + Math.random() * 0.28})`;
    ctx.lineWidth = 0.7 + Math.random() * 1.2;
    ctx.beginPath();
    let cx = 0;
    ctx.moveTo(0, y);
    while (cx < W) {
      cx += 12 + Math.random() * 28;
      ctx.lineTo(cx, y + (Math.random() - 0.5) * 7);
    }
    ctx.stroke();
  }

  // Seitliches Streifenlicht
  const side = ctx.createLinearGradient(0, 0, W, 0);
  side.addColorStop(0,    'rgba(0,0,0,0.25)');
  side.addColorStop(0.28, 'rgba(180,95,40,0.20)');
  side.addColorStop(0.50, 'rgba(220,130,60,0.28)');
  side.addColorStop(0.72, 'rgba(180,95,40,0.20)');
  side.addColorStop(1,    'rgba(0,0,0,0.30)');
  ctx.fillStyle = side;
  ctx.fillRect(0, 0, W, H);

  // Moos-Grünschimmer an den Rändern
  const mossg = ctx.createLinearGradient(0, 0, W, 0);
  mossg.addColorStop(0,    'rgba(30,80,20,0.30)');
  mossg.addColorStop(0.15, 'rgba(0,0,0,0)');
  mossg.addColorStop(0.85, 'rgba(0,0,0,0)');
  mossg.addColorStop(1,    'rgba(30,80,20,0.30)');
  ctx.fillStyle = mossg;
  ctx.fillRect(0, 0, W, H);
}

/* ── Baumkrone: Blattwerk mit Farbvariationen ───────────────────────────── */
function _drawFeenFoliage(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Dunkelgrüne Basis
  ctx.fillStyle = '#183820';
  ctx.fillRect(0, 0, W, H);

  // Unregelmäßige Blatt-Blobs in verschiedenen Grüntönen
  const greens = ['#2a7032', '#1e5828', '#348a40', '#265e30', '#3a7c48', '#448844', '#206030'];
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 7 + Math.random() * 30;
    ctx.fillStyle = greens[Math.floor(Math.random() * greens.length)];
    ctx.globalAlpha = 0.55 + Math.random() * 0.45;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.45 + Math.random() * 0.75), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Sonnenlicht-Dappling: helle Grünpunkte
  for (let i = 0; i < 35; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 2 + Math.random() * 8;
    const lg = ctx.createRadialGradient(x, y, 0, x, y, r);
    lg.addColorStop(0,   'rgba(200,255,170,0.60)');
    lg.addColorStop(0.5, 'rgba(150,220,120,0.25)');
    lg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // Magischer Feenschimmer (lila/rosa Glühen zwischen den Blättern)
  const magics = ['rgba(200,155,255,0.14)', 'rgba(255,175,220,0.12)', 'rgba(155,255,200,0.11)'];
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 10 + Math.random() * 22;
    const mg = ctx.createRadialGradient(x, y, 0, x, y, r);
    mg.addColorStop(0, magics[Math.floor(Math.random() * magics.length)]);
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

/* ── Moos + Erde: Boden unter den Feendorf-Wurzeln ─────────────────────── */
function _drawFeenMoss(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Dunkle Erde als Basis
  ctx.fillStyle = '#1e1005';
  ctx.fillRect(0, 0, W, H);

  // Erdflecken in warmen Brauntönen
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 14 + Math.random() * 42;
    const v = 38 + Math.floor(Math.random() * 32);
    ctx.fillStyle = `rgba(${Math.floor(v*0.88)},${Math.floor(v*0.52)},${Math.floor(v*0.26)},0.58)`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.35 + Math.random() * 0.45), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moos-Büschel in verschiedenen Grüntönen
  const mosscols = ['rgba(50,120,35,0.72)', 'rgba(72,148,48,0.65)', 'rgba(44,98,55,0.60)', 'rgba(95,155,55,0.55)', 'rgba(38,88,50,0.68)'];
  for (let i = 0; i < 55; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 4 + Math.random() * 16;
    ctx.fillStyle = mosscols[Math.floor(Math.random() * mosscols.length)];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Kleine Steine
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 3 + Math.random() * 9;
    const v = 75 + Math.floor(Math.random() * 45);
    const sg = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 1, x, y, r);
    sg.addColorStop(0, `rgb(${v+22},${v+16},${v+10})`);
    sg.addColorStop(1, `rgb(${Math.max(0,v-22)},${Math.max(0,v-27)},${Math.max(0,v-30)})`);
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.55 + Math.random() * 0.35), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ── Wasser: Schimmerndes Blau/Türkis (wird per UV-Offset animiert) ─────── */
function _drawFeenWater(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Tiefes Blau
  ctx.fillStyle = '#0048b8';
  ctx.fillRect(0, 0, W, H);

  // Tiefengradient
  const dg = ctx.createLinearGradient(0, 0, 0, H);
  dg.addColorStop(0,   'rgba(80,210,255,0.35)');
  dg.addColorStop(0.4, 'rgba(0,148,225,0.20)');
  dg.addColorStop(1,   'rgba(0,72,160,0.28)');
  ctx.fillStyle = dg;
  ctx.fillRect(0, 0, W, H);

  // Horizontale Schimmer-Wellenlinien
  for (let i = 0; i < 22; i++) {
    const y   = Math.random() * H;
    const xst = Math.random() * W * 0.4;
    const xen = xst + W * (0.3 + Math.random() * 0.5);
    const wg  = ctx.createLinearGradient(xst, 0, xen, 0);
    const al  = 0.28 + Math.random() * 0.38;
    wg.addColorStop(0,   'rgba(0,0,0,0)');
    wg.addColorStop(0.35, `rgba(160,240,255,${al})`);
    wg.addColorStop(0.65, `rgba(100,220,245,${al * 0.7})`);
    wg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = wg;
    ctx.fillRect(xst, y - 1.2, xen - xst, 2.4);
  }

  // Türkise Glanzpunkte
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 3 + Math.random() * 12;
    const gg = ctx.createRadialGradient(x, y, 0, x, y, r);
    gg.addColorStop(0,   'rgba(120,255,235,0.80)');
    gg.addColorStop(0.45, 'rgba(50,200,225,0.32)');
    gg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // Magenta-/Lila-Reflexion (Feenreich-Atmosphäre)
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 5 + Math.random() * 15;
    const pg = ctx.createRadialGradient(x, y, 0, x, y, r);
    pg.addColorStop(0,   'rgba(200,100,255,0.22)');
    pg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

/* ── Bach: prozedurale Three.js-Geometrie + animierte Wassertextur ──────── */
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
    const pos = [], uvs = [], idx = [];

    for (let i = 0; i < samples.length; i++) {
      const p = samples[i];
      const tang = i < samples.length - 1
        ? new THREE.Vector3().subVectors(samples[i + 1], p).normalize()
        : new THREE.Vector3().subVectors(p, samples[i - 1]).normalize();
      const norm = new THREE.Vector3(tang.z, 0, -tang.x);
      const l = new THREE.Vector3().addVectors(p, norm.clone().multiplyScalar(-width * 0.5));
      const r = new THREE.Vector3().addVectors(p, norm.clone().multiplyScalar( width * 0.5));
      pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
      const v = i / (samples.length - 1);
      uvs.push(0, v * 4,  1, v * 4);   // v×4 → sichtbare Kachelung entlang des Bachs
    }
    for (let i = 0; i < samples.length - 1; i++) {
      const a = i*2, b = i*2+1, c = i*2+2, d = i*2+3;
      idx.push(a, b, c,  b, d, c);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();

    // Wassertextur aus Canvas (wird in feenreich-scene.init() erstellt)
    this._waterTex = null;
    const waterCanvas = document.getElementById('fee-water');
    if (waterCanvas) {
      const t = new THREE.CanvasTexture(waterCanvas);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.needsUpdate = true;
      this._waterTex = t;
    }

    this._mat = new THREE.MeshBasicMaterial({
      map: this._waterTex,
      color: this._waterTex ? 0xffffff : 0x88ddff,
      transparent: true,
      opacity: 0.68,
      side: THREE.DoubleSide,
    });
    this.el.setObject3D('stream', new THREE.Mesh(geo, this._mat));

    // Uferstreifen links + rechts
    const bankW = 1.0;
    ['l', 'r'].forEach((side, si) => {
      const bpos = [], buvs = [];
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
        const v = i / (samples.length - 1);
        buvs.push(0, v,  1, v);
      }
      const bgeo = new THREE.BufferGeometry();
      bgeo.setAttribute('position', new THREE.Float32BufferAttribute(bpos, 3));
      bgeo.setAttribute('uv',       new THREE.Float32BufferAttribute(buvs, 2));
      bgeo.setIndex([...idx]);

      // Ufer benutzt Gras-Textur falls vorhanden
      const grassCanvas = document.getElementById('fee-grass');
      let bankMat;
      if (grassCanvas) {
        if (!window._KC_TEX) window._KC_TEX = {};
        if (!window._KC_TEX['fee-grass']) {
          const gt = new THREE.CanvasTexture(grassCanvas);
          gt.wrapS = gt.wrapT = THREE.RepeatWrapping;
          gt.needsUpdate = true;
          window._KC_TEX['fee-grass'] = gt;
        }
        const gt = window._KC_TEX['fee-grass'].clone();
        gt.wrapS = gt.wrapT = THREE.RepeatWrapping;
        gt.repeat.set(2, 6);
        gt.needsUpdate = true;
        bankMat = new THREE.MeshBasicMaterial({ map: gt, side: THREE.DoubleSide });
      } else {
        bankMat = new THREE.MeshBasicMaterial({ color: 0x449933, side: THREE.DoubleSide });
      }
      this.el.setObject3D(`bank_${side}`, new THREE.Mesh(bgeo, bankMat));
    });
  },

  tick(t, dt) {
    if (!this._mat) return;
    // Opacity-Puls
    this._mat.opacity = 0.62 + Math.sin(t * 0.0015) * 0.09;
    // UV-Offset: Wasser fließt ins Feenreich (v nimmt ab = Richtung z+)
    if (this._waterTex && dt) {
      this._waterTex.offset.y -= dt * 0.000_18;
    }
  },

  remove() {
    ['stream', 'bank_l', 'bank_r'].forEach(k => this.el.removeObject3D(k));
    if (this._waterTex) this._waterTex.dispose();
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
    // Alle Feenreich-Canvas-Texturen erstellen (document.body existiert jetzt sicher)
    const CANVASES = [
      { id: 'fee-sky-canvas', w: 1024, h: 512, fn: _drawFeenSky    },
      { id: 'fee-grass',      w: 512,  h: 512, fn: _drawFeenGrass  },
      { id: 'fee-mushcap',    w: 256,  h: 256, fn: _drawFeenMushcap},
      { id: 'fee-bark',       w: 256,  h: 512, fn: _drawFeenBark   },
      { id: 'fee-foliage',    w: 256,  h: 256, fn: _drawFeenFoliage},
      { id: 'fee-moss',       w: 256,  h: 256, fn: _drawFeenMoss   },
      { id: 'fee-water',      w: 256,  h: 256, fn: _drawFeenWater  },
    ];
    CANVASES.forEach(({ id, w, h, fn }) => {
      if (!document.getElementById(id)) {
        const c = document.createElement('canvas');
        c.id = id; c.width = w; c.height = h; c.style.display = 'none';
        document.body.appendChild(c);
        fn(c);
      }
    });

    this.el.insertAdjacentHTML('beforeend', FEENREICH_HTML);
    this._inFeen = false;
    this._cam    = null;
    this._sky    = null;
    this._amb    = null;
    this._sun    = null;
    this._camWP  = new THREE.Vector3();
  },

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
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._sky) this._sky = document.getElementById('sky-sphere');
    if (!this._amb) this._amb = document.getElementById('ambLight');
    if (!this._sun) this._sun = document.getElementById('sun');
    if (!this._cam) return;

    this._cam.object3D.getWorldPosition(this._camWP);
    const feen = this._camWP.z > 33;
    if (feen === this._inFeen) return;
    this._inFeen = feen;
    if (window._KS) window._KS.setZone(feen ? 'feen' : 'city');

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
    tex="id:fee-grass;repx:3;repy:4"
    material="color:#ffffff;shader:flat">
  </a-plane>
  <a-plane position="-8 0.01 34" rotation="-90 0 0" width="8" height="10"
    tex="id:fee-grass;repx:2;repy:3"
    material="color:#f0fce8;shader:flat">
  </a-plane>
  <a-plane position="8 0.01 34" rotation="-90 0 0" width="8" height="10"
    tex="id:fee-grass;repx:2;repy:3"
    material="color:#f0fce8;shader:flat">
  </a-plane>

  <!-- ═══ HAUPTWIESE ═══ -->
  <a-plane position="0 0.005 83" rotation="-90 0 0" width="130" height="108"
    tex="id:fee-grass;repx:18;repy:15"
    material="color:#ffffff;shader:flat">
  </a-plane>

  <!-- Pastellfarbene Grasflecken (leicht transparent für Mischung) -->
  <a-plane position="14 0.015 54"  rotation="-90 0 0" width="14" height="10"
    material="color:#f0c8e0;opacity:0.62;transparent:true;shader:flat">
  </a-plane>
  <a-plane position="-10 0.015 76" rotation="-90 0 0" width="12" height="16"
    material="color:#c0d8f8;opacity:0.55;transparent:true;shader:flat">
  </a-plane>
  <a-plane position="5 0.015 96"   rotation="-90 0 0" width="18" height="12"
    material="color:#f8e0c0;opacity:0.50;transparent:true;shader:flat">
  </a-plane>
  <a-plane position="-18 0.015 92" rotation="-90 0 0" width="10" height="14"
    material="color:#e0f0c8;opacity:0.60;transparent:true;shader:flat">
  </a-plane>
  <a-plane position="20 0.015 88"  rotation="-90 0 0" width="16" height="10"
    material="color:#f0d8f8;opacity:0.55;transparent:true;shader:flat">
  </a-plane>

  <!-- ═══ HÜGEL (flache Kugeln halb im Boden) ═══ -->
  <a-sphere radius="9"  position="-19 -7  67" segments-width="8" segments-height="6"
    tex="id:fee-grass;repx:4;repy:4"
    material="color:#eaffd8;shader:flat">
  </a-sphere>
  <a-sphere radius="7"  position=" 22 -5  73" segments-width="8" segments-height="6"
    tex="id:fee-grass;repx:3;repy:3"
    material="color:#f0ffe8;shader:flat">
  </a-sphere>
  <a-sphere radius="11" position=" -6 -9 102" segments-width="8" segments-height="6"
    tex="id:fee-grass;repx:5;repy:5"
    material="color:#e8ffd8;shader:flat">
  </a-sphere>
  <a-sphere radius="6"  position=" 12 -4  57" segments-width="8" segments-height="6"
    tex="id:fee-grass;repx:3;repy:3"
    material="color:#f2ffe8;shader:flat">
  </a-sphere>
  <a-sphere radius="8"  position="-14 -6  88" segments-width="8" segments-height="6"
    tex="id:fee-grass;repx:4;repy:4"
    material="color:#eaffd5;shader:flat">
  </a-sphere>

  <!-- ═══ RIESENPILZE ═══ -->

  <!-- Riesenpilz 1: Türkis · Position (-13, 0, 51) -->
  <a-entity position="-13 0 51">
    <a-cylinder radius="0.9" height="8" position="0 4 0" segments-radial="8"
      material="color:#e8f8f5;shader:flat">
    </a-cylinder>
    <a-sphere radius="5.5" position="0 9 0" scale="1 0.44 1"
      segments-width="10" segments-height="5"
      tex="id:fee-mushcap"
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
      tex="id:fee-mushcap"
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
      tex="id:fee-mushcap"
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
      tex="id:fee-mushcap"
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
      tex="id:fee-mushcap"
      material="color:#ddaa00;emissive:#664400;emissiveIntensity:0.38;shader:flat">
    </a-sphere>
    <a-sphere radius="0.18" position=" 1.5 5.3  2.0" material="color:#ffffaa;emissive:#ffee00;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.20" position="-2.1 5.3  0.8" material="color:#ffffaa;emissive:#ffee00;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
    <a-sphere radius="0.16" position=" 0.3 5.3 -1.8" material="color:#ffffaa;emissive:#ffee00;emissiveIntensity:1.5;shader:flat;opacity:0.9;transparent:true"></a-sphere>
  </a-entity>

  <!-- Kleine Pilze – Türkis-Gruppe nahe Eingang -->
  <a-entity position="-5 0 42">
    <a-cylinder radius="0.28" height="2.2" position="0 1.1 0" segments-radial="6" material="color:#e8f8f5;shader:flat"></a-cylinder>
    <a-sphere radius="1.6" position="0 2.5 0" scale="1 0.42 1" segments-width="6" segments-height="4"
      tex="id:fee-mushcap" material="color:#00c8c0;emissive:#003030;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>
  <a-entity position="-3 0 44">
    <a-cylinder radius="0.18" height="1.5" position="0 0.75 0" segments-radial="6" material="color:#e8f8f5;shader:flat"></a-cylinder>
    <a-sphere radius="1.1" position="0 1.65 0" scale="1 0.43 1" segments-width="6" segments-height="4"
      tex="id:fee-mushcap" material="color:#00aaa0;emissive:#002828;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>
  <a-entity position="-7 0 46">
    <a-cylinder radius="0.22" height="1.8" position="0 0.9 0" segments-radial="6" material="color:#f0f8f5;shader:flat"></a-cylinder>
    <a-sphere radius="1.4" position="0 2.0 0" scale="1 0.41 1" segments-width="6" segments-height="4"
      tex="id:fee-mushcap" material="color:#22ddcc;emissive:#004040;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>

  <!-- Kleine Pilze – Magenta-Gruppe -->
  <a-entity position="10 0 62">
    <a-cylinder radius="0.24" height="2.0" position="0 1.0 0" segments-radial="6" material="color:#f8eeee;shader:flat"></a-cylinder>
    <a-sphere radius="1.5" position="0 2.3 0" scale="1 0.43 1" segments-width="6" segments-height="4"
      tex="id:fee-mushcap" material="color:#dd0099;emissive:#440022;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>
  <a-entity position="12 0 65">
    <a-cylinder radius="0.16" height="1.4" position="0 0.7 0" segments-radial="6" material="color:#f8eeee;shader:flat"></a-cylinder>
    <a-sphere radius="1.0" position="0 1.55 0" scale="1 0.42 1" segments-width="6" segments-height="4"
      tex="id:fee-mushcap" material="color:#cc0077;emissive:#330022;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>

  <!-- Kleine Pilze – Orange/Gold-Gruppe tief -->
  <a-entity position="4 0 100">
    <a-cylinder radius="0.20" height="1.6" position="0 0.8 0" segments-radial="6" material="color:#f8f4ee;shader:flat"></a-cylinder>
    <a-sphere radius="1.2" position="0 1.85 0" scale="1 0.44 1" segments-width="6" segments-height="4"
      tex="id:fee-mushcap" material="color:#ff8800;emissive:#442200;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>
  <a-entity position="2 0 104">
    <a-cylinder radius="0.15" height="1.2" position="0 0.6 0" segments-radial="6" material="color:#f8f5ee;shader:flat"></a-cylinder>
    <a-sphere radius="0.9" position="0 1.35 0" scale="1 0.42 1" segments-width="6" segments-height="4"
      tex="id:fee-mushcap" material="color:#ccaa00;emissive:#443300;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>
  <a-entity position="6 0 98">
    <a-cylinder radius="0.26" height="2.2" position="0 1.1 0" segments-radial="6" material="color:#f8f5ee;shader:flat"></a-cylinder>
    <a-sphere radius="1.5" position="0 2.5 0" scale="1 0.45 1" segments-width="6" segments-height="4"
      tex="id:fee-mushcap" material="color:#ff9900;emissive:#553300;emissiveIntensity:0.3;shader:flat"></a-sphere>
  </a-entity>

  <!-- ═══ KRISTALLKLARER BACH ═══ -->
  <a-entity fairy-stream></a-entity>

  <!-- ═══ RIESENBAUM 1 – WESTLICHER ANKER (mit Feendorf) ═══ -->
  <a-entity position="-23 0 70">
    <!-- Moos-Boden unter den Wurzeln -->
    <a-plane position="0 0.02 0" rotation="-90 0 0" width="12" height="12"
      tex="id:fee-moss;repx:3;repy:3"
      material="color:#ffffff;shader:flat;opacity:0.92;transparent:true">
    </a-plane>
    <!-- Stamm -->
    <a-cylinder radius="2.0" height="24" position="0 12 0" segments-radial="8"
      tex="id:fee-bark;repx:3;repy:7"
      material="color:#ffffff;shader:flat">
    </a-cylinder>
    <!-- Äste -->
    <a-cylinder radius="0.7" height="11" position="-2.5 20 1.5" rotation="0 20 52" segments-radial="6"
      tex="id:fee-bark;repx:2;repy:3"
      material="color:#ffffff;shader:flat">
    </a-cylinder>
    <a-cylinder radius="0.6" height="9"  position=" 2.0 22 -1" rotation="0 -25 -48" segments-radial="6"
      tex="id:fee-bark;repx:2;repy:3"
      material="color:#ffffff;shader:flat">
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
    <a-sphere radius="9"  position=" 0  25  0" scale="1 0.78 1" segments-width="8" segments-height="6"
      tex="id:fee-foliage;repx:3;repy:3"
      material="color:#ffffff;shader:flat">
    </a-sphere>
    <a-sphere radius="7"  position="-3  28  2" scale="1 0.80 1" segments-width="8" segments-height="6"
      tex="id:fee-foliage;repx:2;repy:2"
      material="color:#ddffd8;shader:flat">
    </a-sphere>
    <a-sphere radius="6"  position=" 3  26 -2" scale="1 0.75 1" segments-width="8" segments-height="6"
      tex="id:fee-foliage;repx:2;repy:2"
      material="color:#e8ffe0;shader:flat">
    </a-sphere>
    <a-sphere radius="5"  position=" 1  30  1" scale="1 0.72 1" segments-width="8" segments-height="6"
      material="color:#338844;emissive:#0c3018;emissiveIntensity:0.2;shader:flat">
    </a-sphere>

    <!-- Feendorf in den Wurzeln -->
    <a-box width="0.55" height="0.70" depth="0.55" position=" 3.8 0.40  0.8"
      material="color:#c8a870;shader:flat">
    </a-box>
    <a-cone radius-bottom="0.40" radius-top="0" height="0.45" position=" 3.8 0.90  0.8"
      material="color:#aa3322;shader:flat">
    </a-cone>
    <a-box width="0.12" height="0.12" depth="0.02" position=" 3.8 0.42  1.09"
      material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat">
    </a-box>
    <a-box width="0.48" height="0.60" depth="0.48" position="-3.5 0.38  1.6"
      material="color:#b89060;shader:flat">
    </a-box>
    <a-cone radius-bottom="0.36" radius-top="0" height="0.40" position="-3.5 0.82  1.6"
      material="color:#882222;shader:flat">
    </a-cone>
    <a-box width="0.10" height="0.10" depth="0.02" position="-3.5 0.40  1.87"
      material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat">
    </a-box>
    <a-box width="0.42" height="0.55" depth="0.42" position=" 1.2 0.35  4.0"
      material="color:#c0a880;shader:flat">
    </a-box>
    <a-cone radius-bottom="0.32" radius-top="0" height="0.38" position=" 1.2 0.77  4.0"
      material="color:#993322;shader:flat">
    </a-cone>
    <a-box width="0.10" height="0.10" depth="0.02" position=" 1.2 0.36  4.23"
      material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat">
    </a-box>
    <a-box width="0.50" height="0.65" depth="0.50" position="-1.5 0.37 -3.5"
      material="color:#b89868;shader:flat">
    </a-box>
    <a-cone radius-bottom="0.38" radius-top="0" height="0.42" position="-1.5 0.84 -3.5"
      material="color:#772211;shader:flat">
    </a-cone>
    <a-box width="0.10" height="0.10" depth="0.02" position="-1.5 0.38 -3.23"
      material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat">
    </a-box>
    <a-box width="0.10" height="0.06" depth="4.0" position=" 0.2 0.65  1.2" rotation="0 -20 0"
      material="color:#8a6540;shader:flat">
    </a-box>
    <a-box width="0.10" height="0.06" depth="3.2" position="-1.0 0.60  2.9" rotation="0 40 0"
      material="color:#8a6540;shader:flat">
    </a-box>
    <a-cylinder radius="0.04" height="0.60" position=" 3.0 0.38  0.0" segments-radial="4" material="color:#555544;shader:flat"></a-cylinder>
    <a-sphere radius="0.08" position=" 3.0 0.70  0.0" material="color:#ffffcc;emissive:#ffdd44;emissiveIntensity:1.5;shader:flat"></a-sphere>
    <a-cylinder radius="0.04" height="0.60" position="-3.0 0.38  2.2" segments-radial="4" material="color:#555544;shader:flat"></a-cylinder>
    <a-sphere radius="0.08" position="-3.0 0.70  2.2" material="color:#ffffcc;emissive:#ffdd44;emissiveIntensity:1.5;shader:flat"></a-sphere>
    <a-entity position="0 0.5 0" light="type:point;color:#ffcc66;intensity:0.7;distance:8"></a-entity>
    <a-entity position="0 25 0" fairy-dust="count:8;spread:6;color:#aaffcc;height:3"></a-entity>
  </a-entity>

  <!-- ═══ RIESENBAUM 2 – ÖSTLICHER BAUM ═══ -->
  <a-entity position="23 0 79">
    <!-- Moos-Boden -->
    <a-plane position="0 0.02 0" rotation="-90 0 0" width="10" height="10"
      tex="id:fee-moss;repx:3;repy:3"
      material="color:#ffffff;shader:flat;opacity:0.90;transparent:true">
    </a-plane>
    <!-- Stamm -->
    <a-cylinder radius="1.6" height="20" position="0 10 0" segments-radial="8"
      tex="id:fee-bark;repx:3;repy:6"
      material="color:#ffffff;shader:flat">
    </a-cylinder>
    <!-- Äste -->
    <a-cylinder radius="0.6" height="9" position="-2 17 1" rotation="0 15 50" segments-radial="6"
      tex="id:fee-bark;repx:2;repy:3"
      material="color:#ffffff;shader:flat">
    </a-cylinder>
    <a-cylinder radius="0.5" height="8" position=" 2 19 -1" rotation="0 -20 -46" segments-radial="6"
      material="color:#42280e;shader:flat">
    </a-cylinder>
    <!-- Wurzeln -->
    <a-cylinder radius="0.55" height="7" position=" 3.8 0.7  0.4" rotation="0  10 65" segments-radial="6" material="color:#42280e;shader:flat"></a-cylinder>
    <a-cylinder radius="0.50" height="6" position="-3.5 0.7  1.5" rotation="0 -20 -63" segments-radial="6" material="color:#42280e;shader:flat"></a-cylinder>
    <a-cylinder radius="0.48" height="6" position=" 1.2 0.7  3.8" rotation="62  0  12" segments-radial="6" material="color:#42280e;shader:flat"></a-cylinder>
    <a-cylinder radius="0.45" height="5" position="-1.5 0.7 -3.5" rotation="-60  0  -8" segments-radial="6" material="color:#42280e;shader:flat"></a-cylinder>
    <!-- Blattwerk -->
    <a-sphere radius="8"  position=" 0 21  0" scale="1 0.80 1" segments-width="8" segments-height="6"
      tex="id:fee-foliage;repx:3;repy:3"
      material="color:#ffffff;shader:flat">
    </a-sphere>
    <a-sphere radius="6"  position="-2 24  1" scale="1 0.78 1" segments-width="8" segments-height="6"
      tex="id:fee-foliage;repx:2;repy:2"
      material="color:#e0ffe0;shader:flat">
    </a-sphere>
    <a-sphere radius="5"  position=" 2 22 -2" scale="1 0.75 1" segments-width="8" segments-height="6"
      material="color:#226030;emissive:#082210;emissiveIntensity:0.2;shader:flat">
    </a-sphere>
    <!-- Mini-Feendorf -->
    <a-box width="0.50" height="0.62" depth="0.50" position=" 3.4 0.38  0.5" material="color:#c4a468;shader:flat"></a-box>
    <a-cone radius-bottom="0.36" radius-top="0" height="0.40" position=" 3.4 0.80  0.5" material="color:#992211;shader:flat"></a-cone>
    <a-box width="0.10" height="0.10" depth="0.02" position=" 3.4 0.38  0.78" material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat"></a-box>
    <a-box width="0.44" height="0.56" depth="0.44" position="-3.0 0.36  1.2" material="color:#b89060;shader:flat"></a-box>
    <a-cone radius-bottom="0.32" radius-top="0" height="0.36" position="-3.0 0.78  1.2" material="color:#772211;shader:flat"></a-cone>
    <a-box width="0.10" height="0.10" depth="0.02" position="-3.0 0.36  1.46" material="color:#ffee88;emissive:#ffcc00;emissiveIntensity:1.2;shader:flat"></a-box>
    <a-entity position="0 0.5 0" light="type:point;color:#ffcc55;intensity:0.6;distance:7"></a-entity>
    <a-entity position="0 22 0" fairy-dust="count:7;spread:5;color:#ffaaee;height:3"></a-entity>
  </a-entity>

  <!-- ═══ RIESENBAUM 3 – TIEFER WALDBAUM ═══ -->
  <a-entity position="-10 0 109">
    <!-- Moos-Boden -->
    <a-plane position="0 0.02 0" rotation="-90 0 0" width="9" height="9"
      tex="id:fee-moss;repx:3;repy:3"
      material="color:#ffffff;shader:flat;opacity:0.88;transparent:true">
    </a-plane>
    <a-cylinder radius="1.4" height="18" position="0 9 0" segments-radial="8"
      tex="id:fee-bark;repx:3;repy:5"
      material="color:#ffffff;shader:flat">
    </a-cylinder>
    <a-cylinder radius="0.5" height="8" position="-1.5 16 1" rotation="0 10 48" segments-radial="6"
      tex="id:fee-bark;repx:2;repy:3"
      material="color:#ffffff;shader:flat">
    </a-cylinder>
    <a-cylinder radius="0.45" height="7" position=" 1.5 14 0" rotation="0 -15 -45" segments-radial="6"
      material="color:#3c2412;shader:flat">
    </a-cylinder>
    <a-cylinder radius="0.50" height="6" position=" 3.5 0.7  0.5" rotation="0 10 63" segments-radial="6" material="color:#3c2412;shader:flat"></a-cylinder>
    <a-cylinder radius="0.45" height="6" position="-3.0 0.7  1.5" rotation="0 -22 -62" segments-radial="6" material="color:#3c2412;shader:flat"></a-cylinder>
    <a-cylinder radius="0.42" height="5" position=" 1.0 0.7  3.5" rotation="60 0 10" segments-radial="6" material="color:#3c2412;shader:flat"></a-cylinder>
    <a-sphere radius="7"  position=" 0 19  0" scale="1 0.80 1" segments-width="8" segments-height="6"
      tex="id:fee-foliage;repx:3;repy:3"
      material="color:#ffffff;shader:flat">
    </a-sphere>
    <a-sphere radius="5"  position="-2 22  1" scale="1 0.78 1" segments-width="8" segments-height="6"
      tex="id:fee-foliage;repx:2;repy:2"
      material="color:#ddffd8;shader:flat">
    </a-sphere>
    <a-sphere radius="4"  position=" 2 20 -1" scale="1 0.76 1" segments-width="8" segments-height="6"
      material="color:#1c4824;emissive:#08180a;emissiveIntensity:0.2;shader:flat">
    </a-sphere>
    <a-entity position="0 19 0" fairy-dust="count:6;spread:4;color:#88ffee;height:2.5"></a-entity>
  </a-entity>

  <!-- ═══ MAGISCHE BLUMEN (statisch) ═══ -->
  <a-cylinder radius="0.04" height="0.55" position=" 3.5 0.27 42" segments-radial="4" material="color:#44aa22;shader:flat"></a-cylinder>
  <a-sphere radius="0.22" position=" 3.5 0.55 42" segments-width="4" segments-height="3" material="color:#ff88cc;emissive:#aa2266;emissiveIntensity:0.5;shader:flat"></a-sphere>
  <a-cylinder radius="0.04" height="0.48" position=" 5.0 0.24 40" segments-radial="4" material="color:#44aa22;shader:flat"></a-cylinder>
  <a-sphere radius="0.18" position=" 5.0 0.50 40" segments-width="4" segments-height="3" material="color:#ffaadd;emissive:#882255;emissiveIntensity:0.5;shader:flat"></a-sphere>
  <a-cylinder radius="0.04" height="0.52" position="-4.0 0.26 43" segments-radial="4" material="color:#44aa22;shader:flat"></a-cylinder>
  <a-sphere radius="0.20" position="-4.0 0.52 43" segments-width="4" segments-height="3" material="color:#cc88ff;emissive:#6622aa;emissiveIntensity:0.5;shader:flat"></a-sphere>

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
  <a-entity position="0 8 75"  light="type:point;color:#cc88ff;intensity:0.45;distance:55"></a-entity>
  <a-entity position="0 6 75"  light="type:point;color:#88ccff;intensity:0.30;distance:35"></a-entity>

  <!-- ═══ KREATUREN – Feen, Tiere, Geistwesen ═══ -->
  <a-entity feenreich-life></a-entity>

`;
