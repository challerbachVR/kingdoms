// ═══════════════════════════════════════════════════════════════════════════
// PROZEDURALE TEXTUREN + TEX-KOMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

function drawCobblestone(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cols = 7, rows = 9;
  const cw = W / cols, ch = H / rows;

  ctx.fillStyle = '#262018';
  ctx.fillRect(0, 0, W, H);

  for (let row = 0; row < rows; row++) {
    const xOff = (row % 2) * cw * 0.5;
    for (let col = -1; col <= cols; col++) {
      const bx = col * cw + xOff + cw / 2;
      const by = row * ch + ch / 2;
      const jx = (Math.random() - 0.5) * cw * 0.22;
      const jy = (Math.random() - 0.5) * ch * 0.22;
      const rx = cw * (0.36 + Math.random() * 0.09);
      const ry = ch * (0.34 + Math.random() * 0.09);
      const angle = (Math.random() - 0.5) * 0.28;
      const v = 88 + Math.floor(Math.random() * 48);
      const r = Math.floor(v * 0.84), g = Math.floor(v * 0.78), b = Math.floor(v * 0.73);

      ctx.save();
      ctx.translate(bx + jx, by + jy);
      ctx.rotate(angle);

      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.beginPath();
      ctx.ellipse(3, 5, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      const grd = ctx.createRadialGradient(-rx * 0.25, -ry * 0.3, 2, 0, 0, Math.max(rx, ry) * 1.05);
      grd.addColorStop(0,    `rgb(${Math.min(255,r+38)},${Math.min(255,g+34)},${Math.min(255,b+29)})`);
      grd.addColorStop(0.55, `rgb(${r},${g},${b})`);
      grd.addColorStop(1,    `rgb(${Math.max(0,r-28)},${Math.max(0,g-24)},${Math.max(0,b-20)})`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      if (Math.random() > 0.55) {
        ctx.strokeStyle = 'rgba(0,0,0,0.07)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo((Math.random()-0.5)*rx, (Math.random()-0.5)*ry);
        ctx.lineTo((Math.random()-0.5)*rx*0.8, (Math.random()-0.5)*ry*0.8);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

function drawStoneWall(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const bW = 82, bH = 38, gap = 5;

  ctx.fillStyle = '#3e3830';
  ctx.fillRect(0, 0, W, H);

  for (let row = 0; row * (bH + gap) < H + bH; row++) {
    const xOff = (row % 2) * (bW + gap) * 0.5;
    const y = row * (bH + gap);
    for (let col = -1; col * (bW + gap) < W + bW; col++) {
      const x = col * (bW + gap) + xOff;
      const v = 100 + Math.floor(Math.random() * 45);
      const r = Math.floor(v * 0.77), g = Math.floor(v * 0.72), b = Math.floor(v * 0.69);

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, bW, bH);

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(x + 5, y + 5, bW - 10, bH - 10);

      ctx.fillStyle = 'rgba(255,255,255,0.11)';
      ctx.fillRect(x, y, bW, 3);
      ctx.fillRect(x, y, 3, bH);

      ctx.fillStyle = 'rgba(0,0,0,0.20)';
      ctx.fillRect(x, y + bH - 4, bW, 4);
      ctx.fillRect(x + bW - 4, y, 4, bH);

      if (Math.random() > 0.62) {
        ctx.strokeStyle = 'rgba(0,0,0,0.09)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        const lx1 = x + 10 + Math.random() * (bW - 20);
        const ly1 = y + 8 + Math.random() * (bH - 16);
        ctx.moveTo(lx1, ly1);
        ctx.lineTo(lx1 + (Math.random()-0.5)*22, ly1 + (Math.random()-0.5)*14);
        ctx.stroke();
      }
    }
  }
}

function drawWood(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const plankH = 72;
  const numPlanks = Math.ceil(H / plankH) + 1;

  ctx.fillStyle = '#3d1c08';
  ctx.fillRect(0, 0, W, H);

  for (let p = 0; p < numPlanks; p++) {
    const py = p * plankH;
    const v = 92 + Math.floor(Math.random() * 34);
    const pr = Math.floor(v * 0.83), pg = Math.floor(v * 0.54), pb = Math.floor(v * 0.31);

    ctx.fillStyle = `rgb(${pr},${pg},${pb})`;
    ctx.fillRect(0, py + 3, W, plankH - 3);

    const grains = 14 + Math.floor(Math.random() * 10);
    for (let g = 0; g < grains; g++) {
      let gx = Math.random() * W;
      const alpha = 0.05 + Math.random() * 0.13;
      ctx.strokeStyle = Math.random() > 0.5
        ? `rgba(0,0,0,${alpha})`
        : `rgba(220,160,80,${alpha * 0.6})`;
      ctx.lineWidth = 0.6 + Math.random() * 1.8;
      ctx.beginPath();
      ctx.moveTo(gx, py + 3);
      for (let sy = py + 3; sy < py + plankH; sy += 10) {
        gx += (Math.random() - 0.5) * 7;
        ctx.lineTo(gx, sy);
      }
      ctx.stroke();
    }

    ctx.fillStyle = '#230e04';
    ctx.fillRect(0, py, W, 3);

    ctx.fillStyle = 'rgba(255,210,130,0.10)';
    ctx.fillRect(0, py + 3, W, 5);

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, py + plankH - 6, W, 6);

    if (Math.random() > 0.52) {
      const kx = 30 + Math.random() * (W - 60);
      const ky = py + 15 + Math.random() * (plankH - 30);
      for (let ring = 6; ring > 0; ring--) {
        ctx.strokeStyle = `rgba(0,0,0,${0.03 + (7-ring) * 0.013})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(kx, ky, ring * 5.5, ring * 3.2, 0.15, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(kx, ky, 5, 3, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawRoofTiles(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const tW = 64, tH = 52;

  ctx.fillStyle = '#1e0a04';
  ctx.fillRect(0, 0, W, H);

  for (let row = Math.ceil(H / tH) + 2; row >= -1; row--) {
    const xOff = (row % 2) * tW * 0.5;
    const y = row * tH;
    for (let col = -1; col * tW < W + tW; col++) {
      const x = col * tW + xOff;
      const v = 72 + Math.floor(Math.random() * 38);
      const r = Math.floor(v * 0.79), g = Math.floor(v * 0.38), b = Math.floor(v * 0.20);

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x + 2, y, tW - 4, tH * 0.52);

      ctx.beginPath();
      ctx.arc(x + tW / 2, y + tH * 0.52, (tW - 4) / 2, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      ctx.fillRect(x + 2, y, tW - 4, 4);

      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x + 2, y, 4, tH * 0.52);

      ctx.fillStyle = 'rgba(0,0,0,0.24)';
      ctx.fillRect(x + tW - 6, y, 4, tH * 0.52);
      ctx.beginPath();
      ctx.arc(x + tW / 2, y + tH * 0.52, (tW - 4) / 2, 0.4, Math.PI - 0.4);
      ctx.fill();
    }
  }
}

// ── Himmel ──────────────────────────────────────────────────────────────────

function _skyBlob(ctx, cx, cy, rx, ry, rgb, alpha) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0,    `rgba(${rgb},${alpha})`);
  g.addColorStop(0.55, `rgba(${rgb},${alpha * 0.42})`);
  g.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function _skyCloud(ctx, cx, cy, sc, L, M, D, al) {
  const B = [
    { dx: 0,   dy: 0,   rx: 88, ry: 46 },
    { dx: -78, dy: 12,  rx: 65, ry: 35 },
    { dx:  78, dy: 10,  rx: 62, ry: 34 },
    { dx: -44, dy: -22, rx: 52, ry: 28 },
    { dx:  42, dy: -20, rx: 50, ry: 27 },
  ];
  B.forEach(b => _skyBlob(ctx, cx+b.dx*sc+4, cy+(b.dy+9)*sc, b.rx*sc, b.ry*sc*0.50, D, al*0.42));
  B.forEach(b => _skyBlob(ctx, cx+b.dx*sc,   cy+b.dy*sc,     b.rx*sc, b.ry*sc,      M, al*0.66));
  B.forEach(b => _skyBlob(ctx, cx+b.dx*sc,   cy+b.dy*sc-6,   b.rx*sc*0.80, b.ry*sc*0.62, L, al*0.55));
}

function drawSky(canvas, mode) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const HZ = Math.floor(H * 0.5);

  const MODES = {
    morning: {
      grad: [[0,'#182850'],[0.24,'#3a6888'],[0.60,'#d07030'],[1.0,'#f0b050']],
      hGlow: 'rgba(255,148,38,0.68)',
      sun: { nx:0.22, ny:0.45, r:20, c:'255,200,80',  ray:7 },
      cL:'255,225,195', cM:'245,178,128', cD:'178,108,58', cA:0.72,
      stars:false, moon:false,
    },
    day: {
      grad: [[0,'#0c3680'],[0.20,'#1858b0'],[0.58,'#3a90cc'],[1.0,'#a0ccec']],
      hGlow: null,
      sun: { nx:0.65, ny:0.26, r:28, c:'255,255,210', ray:5 },
      cL:'255,255,255', cM:'224,232,240', cD:'182,200,215', cA:0.80,
      stars:false, moon:false,
    },
    evening: {
      grad: [[0,'#050720'],[0.22,'#380f08'],[0.60,'#bb3800'],[1.0,'#ff8820']],
      hGlow: 'rgba(255,70,0,0.84)',
      sun: { nx:0.78, ny:0.46, r:22, c:'255,85,10',   ray:9 },
      cL:'238,132,68', cM:'172,68,20', cD:'106,26,7', cA:0.86,
      stars:false, moon:false,
    },
    night: {
      grad: [[0,'#010306'],[0.35,'#020810'],[0.75,'#060e1a'],[1.0,'#0c1626']],
      hGlow: null, sun: null,
      cL:null, cM:null, cD:null, cA:0,
      stars:true, moon:true,
    },
  };

  const cfg = MODES[mode] || MODES.day;
  ctx.clearRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, 0, HZ);
  cfg.grad.forEach(([s, c]) => grad.addColorStop(s, c));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, HZ + 2);

  const below = ctx.createLinearGradient(0, HZ, 0, H);
  below.addColorStop(0, cfg.grad[cfg.grad.length - 1][1]);
  below.addColorStop(1, '#050505');
  ctx.fillStyle = below;
  ctx.fillRect(0, HZ, W, H - HZ);

  if (cfg.hGlow) {
    const hg = ctx.createLinearGradient(0, HZ * 0.52, 0, HZ);
    hg.addColorStop(0, 'rgba(0,0,0,0)');
    hg.addColorStop(1, cfg.hGlow);
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, W, HZ + 2);
  }

  if (cfg.stars) {
    for (let i = 0; i < 320; i++) {
      const sx = Math.random() * W;
      const sy = Math.random() * HZ * 0.93;
      const br = 0.22 + Math.random() * 0.78;
      const sr = Math.random() > 0.90 ? 1.4 + Math.random() * 0.9 : 0.4 + Math.random() * 0.8;
      if (Math.random() > 0.80) {
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3.8);
        sg.addColorStop(0,   `rgba(210,225,255,${br})`);
        sg.addColorStop(0.5, `rgba(170,195,255,${br * 0.28})`);
        sg.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.arc(sx, sy, sr * 3.8, 0, Math.PI * 2); ctx.fill();
      }
      const wb = 200 + Math.floor(Math.random() * 55);
      ctx.fillStyle = `rgba(255,255,${wb},${br})`;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
    }
  }

  if (cfg.moon) {
    const mx = W * 0.72, my = HZ * 0.28, mr = 22;
    const mg = ctx.createRadialGradient(mx, my, mr, mx, my, mr * 5.5);
    mg.addColorStop(0,    'rgba(195,215,255,0.38)');
    mg.addColorStop(0.45, 'rgba(150,185,255,0.11)');
    mg.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr * 5.5, 0, Math.PI * 2); ctx.fill();
    const mb = ctx.createRadialGradient(mx - mr * 0.22, my - mr * 0.22, 0, mx, my, mr);
    mb.addColorStop(0, '#eaecff'); mb.addColorStop(0.65, '#c8d4f0'); mb.addColorStop(1, '#9ab0d8');
    ctx.fillStyle = mb; ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(92,112,162,0.22)';
    [[mx+mr*.25,my+mr*.12,mr*.17],[mx-mr*.30,my-mr*.22,mr*.11],[mx+mr*.08,my-mr*.35,mr*.09]].forEach(([cx,cy,cr]) => {
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
    });
  }

  if (cfg.sun) {
    const { nx, ny, r: sr, c: sc, ray } = cfg.sun;
    const sx = nx * W, sy = ny * HZ;
    const so = ctx.createRadialGradient(sx, sy, sr, sx, sy, sr * ray);
    so.addColorStop(0,    `rgba(${sc},0.46)`);
    so.addColorStop(0.35, `rgba(${sc},0.14)`);
    so.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = so; ctx.beginPath(); ctx.arc(sx, sy, sr * ray, 0, Math.PI * 2); ctx.fill();
    const si = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 1.9);
    si.addColorStop(0,   'rgba(255,255,255,0.94)');
    si.addColorStop(0.5, `rgba(${sc},0.78)`);
    si.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = si; ctx.beginPath(); ctx.arc(sx, sy, sr * 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
  }

  if (cfg.cL) {
    const CP = [
      { nx:0.10, ny:0.20, sc:1.10 },
      { nx:0.31, ny:0.14, sc:0.85 },
      { nx:0.55, ny:0.29, sc:1.28 },
      { nx:0.74, ny:0.17, sc:0.96 },
      { nx:0.92, ny:0.24, sc:1.04 },
    ];
    CP.forEach(c => _skyCloud(ctx, c.nx * W, c.ny * HZ, c.sc, cfg.cL, cfg.cM, cfg.cD, cfg.cA));
    _skyCloud(ctx, (CP[0].nx + 1) * W, CP[0].ny * HZ, CP[0].sc, cfg.cL, cfg.cM, cfg.cD, cfg.cA);
    _skyCloud(ctx, (CP[4].nx - 1) * W, CP[4].ny * HZ, CP[4].sc, cfg.cL, cfg.cM, cfg.cD, cfg.cA);
  }
}

function _updateSkyTex() {
  const s = document.getElementById('sky-sphere');
  if (!s || !s.object3D) return;
  s.object3D.traverse(n => {
    if (n.isMesh && n.material && n.material.map) n.material.map.needsUpdate = true;
  });
}

// Erstellt alle Canvas-Elemente und zeichnet sie (synchron, vor der Szene aufzurufen)
function initTextures() {
  const CANVASES = [
    { id: 'sky-canvas', w: 1024, h: 512, fn: c => drawSky(c, 'day') },
    { id: 'tex-cobble', w: 512,  h: 512, fn: drawCobblestone },
    { id: 'tex-stone',  w: 512,  h: 512, fn: drawStoneWall   },
    { id: 'tex-wood',   w: 512,  h: 512, fn: drawWood        },
    { id: 'tex-tiles',  w: 512,  h: 512, fn: drawRoofTiles   },
  ];
  CANVASES.forEach(({ id, w, h, fn }) => {
    const c = document.createElement('canvas');
    c.id = id; c.width = w; c.height = h;
    c.style.display = 'none';
    document.body.appendChild(c);
    fn(c);
  });
}

// ── A-Frame Tex-Komponente ──────────────────────────────────────────────────
AFRAME.registerComponent('tex', {
  schema: {
    id:   { type: 'string' },
    repx: { type: 'number', default: 1 },
    repy: { type: 'number', default: 1 }
  },
  init() {
    if (!window._KC_TEX) window._KC_TEX = {};
    const id = this.data.id;
    if (!window._KC_TEX[id]) {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      const t = new THREE.CanvasTexture(canvas);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 4;
      window._KC_TEX[id] = t;
    }
    this._tex = window._KC_TEX[id].clone();
    this._tex.wrapS = this._tex.wrapT = THREE.RepeatWrapping;
    this._tex.repeat.set(this.data.repx, this.data.repy);
    this._tex.needsUpdate = true;

    this._apply = () => {
      const mesh = this.el.getObject3D('mesh');
      if (!mesh) return;
      const tex = this._tex;
      mesh.traverse(n => {
        if (n.isMesh && n.material) {
          n.material.map = tex;
          n.material.needsUpdate = true;
        }
      });
    };
    this.el.addEventListener('object3dset', this._apply);
    this._apply();
  },
  remove() {
    this.el.removeEventListener('object3dset', this._apply);
    if (this._tex) this._tex.dispose();
  }
});
