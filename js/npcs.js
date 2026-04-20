// ═══════════════════════════════════════════════════════════════════════════
// CITY-LIFE COMPONENT – NPCs, Tiere, Vögel (prozedural, kein Asset)
// ═══════════════════════════════════════════════════════════════════════════
const CITY_COLLISION_CIRCLES = [
  { cx:   0,   cz:   0,  r: 2.20 },
  { cx: -14,   cz:  -2,  r: 2.50 },
  { cx:  11.5, cz:   6,  r: 1.40 },
  { cx:  -4,   cz: -28,  r: 2.45 },
  { cx:   4,   cz: -28,  r: 2.45 },
  { cx:  -4,   cz:  28,  r: 2.45 },
  { cx:   4,   cz:  28,  r: 2.45 },
  { cx:  28,   cz:   4,  r: 2.45 },
  { cx:  28,   cz:  -4,  r: 2.45 },
  { cx: -28,   cz:   4,  r: 2.45 },
  { cx: -28,   cz:  -4,  r: 2.45 },
  { cx:  28,   cz: -28,  r: 2.45 },
  { cx: -28,   cz: -28,  r: 2.45 },
  { cx:  28,   cz:  28,  r: 2.45 },
  { cx: -28,   cz:  28,  r: 2.45 },
];

const CITY_COLLISION_BOXES = [
  { x0: -11.8, x1:  -6.2, z0: -10.8, z1:  -5.2 },
  { x0:   6.2, x1:  11.8, z0: -10.8, z1:  -5.2 },
  { x0: -12.3, x1:  -5.7, z0:   5.2, z1:  10.8 },
  { x0:   6.5, x1:  11.5, z0:   5.8, z1:  10.2 },
  { x0:  10.8, x1:  15.5, z0:  -3.2, z1:   1.2 },
  { x0: -45,  x1:  -3.0, z0: -29.5, z1: -26.5 },
  { x0:  3.0, x1:  45,   z0: -29.5, z1: -26.5 },
  { x0: -45,  x1:  -3.0, z0:  26.5, z1:  29.5 },
  { x0:  3.0, x1:  45,   z0:  26.5, z1:  29.5 },
  { x0:  26.5, x1: 29.5, z0: -45,   z1:  -3.0 },
  { x0:  26.5, x1: 29.5, z0:  3.0,  z1:  45   },
  { x0: -29.5, x1:-26.5, z0: -45,   z1:  -3.0 },
  { x0: -29.5, x1:-26.5, z0:  3.0,  z1:  45   },
];

AFRAME.registerComponent('city-life', {

  init() {
    this._npcs  = [];
    this._anim  = [];
    this._birds = [];
    this._built = false;
    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });
  },

  remove() {
    const rm = e => { if (e.root && e.root.parentNode) e.root.parentNode.removeChild(e.root); };
    this._npcs.forEach(rm); this._anim.forEach(rm); this._birds.forEach(rm);
  },

  tick(t, dt) {
    if (!this._built || dt > 200) return;
    const s = Math.min(dt, 50) * 0.001;
    this._tickNPCs(t, s);
    this._tickAnim(t, s);
    this._tickBirds(t, s);
  },

  _build() {
    this._built = true;
    this._initNpcTextures();
    this._mkNPCs();
    this._mkAnimals();
    this._mkBirds();
  },

  /* ── NPC-Canvas-Texturen ────────────────────────────────────────────── */
  _initNpcTextures() {
    const make = (id, w, h, fn) => {
      if (document.getElementById(id)) return;
      const c = document.createElement('canvas');
      c.id = id; c.width = w; c.height = h;
      c.style.display = 'none';
      document.body.appendChild(c);
      fn(c);
    };

    make('tex-npc-cloth', 128, 128, c => {
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 128);
      // Warp-Fäden (vertikal)
      for (let x = 0; x < 128; x += 8) {
        ctx.strokeStyle = `rgba(0,0,0,${0.07 + (x % 16 === 0 ? 0.06 : 0)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 128); ctx.stroke();
      }
      // Schuss-Fäden (horizontal)
      for (let y = 0; y < 128; y += 8) {
        ctx.strokeStyle = `rgba(0,0,0,${0.07 + (y % 16 === 0 ? 0.06 : 0)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y); ctx.stroke();
      }
      // Leichtes Rauschen
      for (let i = 0; i < 600; i++) {
        const a = Math.random() * 0.04;
        ctx.fillStyle = Math.random() > 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`;
        ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
      }
    });

    make('tex-npc-skin', 128, 128, c => {
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 128);
      // Poren-Variation
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 128, y = Math.random() * 128;
        const a = 0.02 + Math.random() * 0.05;
        ctx.fillStyle = Math.random() > 0.6
          ? `rgba(200,140,90,${a})`
          : `rgba(255,220,180,${a})`;
        ctx.beginPath(); ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
      }
      // Soft-Licht-Gradient (oben heller)
      const g = ctx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, 'rgba(255,255,255,0.12)');
      g.addColorStop(1, 'rgba(0,0,0,0.08)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    });

    make('tex-npc-leather', 128, 128, c => {
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#f0ece4';
      ctx.fillRect(0, 0, 128, 128);
      // Leder-Körnung
      for (let i = 0; i < 60; i++) {
        const y = Math.random() * 128;
        const x = Math.random() * 128;
        const len = 20 + Math.random() * 50;
        ctx.strokeStyle = `rgba(80,50,20,${0.04 + Math.random() * 0.08})`;
        ctx.lineWidth = 0.8 + Math.random() * 1.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + len * 0.5, y + (Math.random() - 0.5) * 6, x + len, y + (Math.random() - 0.5) * 4);
        ctx.stroke();
      }
      // Risse
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * 128, y = Math.random() * 128;
        ctx.strokeStyle = `rgba(60,30,10,${0.10 + Math.random() * 0.10})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 18, y + (Math.random() - 0.5) * 10); ctx.stroke();
      }
      const g = ctx.createLinearGradient(0, 0, 128, 128);
      g.addColorStop(0, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0.06)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    });

    make('tex-npc-hair', 64, 128, c => {
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 64, 128);
      // Haarsträhnen (vertikal, leicht gewellt)
      for (let x = 1; x < 64; x += 3) {
        const a = 0.08 + Math.random() * 0.18;
        ctx.strokeStyle = Math.random() > 0.4 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a * 0.5})`;
        ctx.lineWidth = 1 + Math.random() * 1.5;
        ctx.beginPath(); ctx.moveTo(x, 0);
        let cx2 = x;
        for (let y = 0; y <= 128; y += 20) {
          cx2 += (Math.random() - 0.5) * 2;
          ctx.lineTo(cx2, y);
        }
        ctx.stroke();
      }
      // Glanzstreifen
      const gx = ctx.createLinearGradient(10, 0, 22, 0);
      gx.addColorStop(0, 'rgba(255,255,255,0)');
      gx.addColorStop(0.5, 'rgba(255,255,255,0.28)');
      gx.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gx; ctx.fillRect(0, 0, 64, 128);
    });

    make('tex-npc-metal', 128, 128, c => {
      const ctx = c.getContext('2d');
      // Grundglanz-Gradient
      const g = ctx.createLinearGradient(0, 0, 128, 128);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.35, '#e8e8e8');
      g.addColorStop(0.65, '#d0d0d0');
      g.addColorStop(1, '#b8b8b8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
      // Kratzer
      for (let i = 0; i < 22; i++) {
        const x = Math.random() * 128, y = Math.random() * 128;
        const a = Math.random() * Math.PI * 0.15;
        const len = 10 + Math.random() * 35;
        ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '80,80,80'},${0.12 + Math.random() * 0.14})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
        ctx.stroke();
      }
      // Schein-Streifen (diagonale helle Linie)
      const gs = ctx.createLinearGradient(20, 0, 50, 128);
      gs.addColorStop(0, 'rgba(255,255,255,0)');
      gs.addColorStop(0.5, 'rgba(255,255,255,0.22)');
      gs.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gs; ctx.fillRect(0, 0, 128, 128);
    });
  },

  /* ── Textur auf Element anwenden ────────────────────────────────────── */
  _texEl(el, id, repx, repy) {
    el.setAttribute('tex', `id:${id}; repx:${repx}; repy:${repy}`);
    return el;
  },

  /* ── Waypoints ──────────────────────────────────────────────────────── */
  _WP: [
    [ 4,  4],[-4,  4],[ 4, -4],[-4, -4],
    [ 6,  0],[-6,  0],[ 0,  6],[ 0, -6],
    [ 2,  2],[-2, -2],[ 5, -5],[-5,  5],
    [ 1, -1],[-1,  1],[ 3, -2],[-3,  2],
    [ 2,-14],[-2,-14],[ 0,-20],
    [ 2, 14],[-2, 14],[ 0, 20],
    [14,  2],[14, -2],[20,  0],
    [-14, 2],[-14,-2],[-20, 0],
  ],

  _pickWPs(n) {
    const pool = [...this._WP], res = [];
    for (let i = 0; i < n; i++) {
      const j = Math.floor(Math.random() * pool.length);
      res.push(pool.splice(j, 1)[0]);
    }
    return res;
  },

  _isBlocked(x, z, radius) {
    for (const c of CITY_COLLISION_CIRCLES) {
      const dx = x - c.cx;
      const dz = z - c.cz;
      const minD = radius + c.r;
      if ((dx * dx + dz * dz) < minD * minD) return true;
    }

    for (const b of CITY_COLLISION_BOXES) {
      if (x > b.x0 - radius && x < b.x1 + radius &&
          z > b.z0 - radius && z < b.z1 + radius) return true;
    }

    return false;
  },

  _tryStep(agent, tx, tz, step) {
    const p = agent.root.object3D.position;
    const radius = agent.radius || 0.26;
    const dx = tx - p.x;
    const dz = tz - p.z;
    const d  = Math.sqrt(dx * dx + dz * dz);
    if (d < 1e-4) return { moved: false, heading: agent.angle };

    const base = Math.atan2(dx, dz);
    const offsets = [0, 0.55, -0.55, 1.05, -1.05, 1.55, -1.55, Math.PI];
    let best = null;

    for (const off of offsets) {
      const ang = base + off;
      const nx = p.x + Math.sin(ang) * step;
      const nz = p.z + Math.cos(ang) * step;
      if (this._isBlocked(nx, nz, radius)) continue;

      const score = Math.hypot(tx - nx, tz - nz) + Math.abs(off) * 0.35;
      if (!best || score < best.score) best = { nx, nz, heading: ang, score };
      if (off === 0) break;
    }

    if (!best) return { moved: false, heading: base };
    p.x = best.nx;
    p.z = best.nz;
    return { moved: true, heading: best.heading };
  },

  /* ── Mesh-Hilfsfunktionen ───────────────────────────────────────────── */
  _box(w, h, d, col, px, py, pz) {
    const e = document.createElement('a-box');
    e.setAttribute('width', w); e.setAttribute('height', h); e.setAttribute('depth', d);
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    return e;
  },
  _sph(r, col, px, py, pz) {
    const e = document.createElement('a-sphere');
    e.setAttribute('radius', r);
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    return e;
  },
  _cyl(r, h, col, px, py, pz) {
    const e = document.createElement('a-cylinder');
    e.setAttribute('radius', r); e.setAttribute('height', h);
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    return e;
  },

  /* ════════════════════════════════════════════════════════════════════
     NPCS
     ════════════════════════════════════════════════════════════════════ */

  // NPC-Typen: Bürger, Händler (Schürze), Wachen (Helm)
  _NPC_DEFS: [
    { cloth:'#c0392b', skin:'#f0c090', hair:'#3d2b1f', legs:'#2a2440', hat:null,      apron:null    },
    { cloth:'#2980b9', skin:'#e8b882', hair:'#1c1c1c', legs:'#222244', hat:null,      apron:null    },
    { cloth:'#27ae60', skin:'#d4905c', hair:'#7b3f00', legs:'#2a2830', hat:null,      apron:null    },
    { cloth:'#8e44ad', skin:'#f0c090', hair:'#c8a870', legs:'#2a2440', hat:null,      apron:'#d4a060'},
    { cloth:'#e67e22', skin:'#e8b882', hair:'#3d2b1f', legs:'#332810', hat:null,      apron:'#b8c060'},
    { cloth:'#16a085', skin:'#c47840', hair:'#1c1c1c', legs:'#182830', hat:null,      apron:'#d0c890'},
    { cloth:'#556677', skin:'#f0c090', hair:'#1c1c1c', legs:'#445566', hat:'#445566', apron:null    },
    { cloth:'#445566', skin:'#e8b882', hair:'#2a1a0a', legs:'#334455', hat:'#334455', apron:null    },
    { cloth:'#d35400', skin:'#f0c090', hair:'#f5e6c8', legs:'#222233', hat:null,      apron:null    },
  ],

  _mkNPCs() {
    this._NPC_DEFS.forEach((cfg, i) => {
      const { cloth, skin, hair, legs, hat, apron } = cfg;
      const root = document.createElement('a-entity');

      // ── Schuhe ──────────────────────────────────────────────────────
      root.appendChild(this._texEl(this._box(0.110, 0.055, 0.155, '#2c1a0a',  0.082, 0.028,  0.016), 'tex-npc-leather', 1, 1));
      root.appendChild(this._texEl(this._box(0.110, 0.055, 0.155, '#2c1a0a', -0.082, 0.028,  0.016), 'tex-npc-leather', 1, 1));

      // ── Beine ────────────────────────────────────────────────────────
      root.appendChild(this._texEl(this._cyl(0.058, 0.44, legs,  0.082, 0.22, 0), 'tex-npc-cloth', 1, 2));
      root.appendChild(this._texEl(this._cyl(0.058, 0.44, legs, -0.082, 0.22, 0), 'tex-npc-cloth', 1, 2));

      // ── Hüfte + Gürtel ───────────────────────────────────────────────
      root.appendChild(this._texEl(this._box(0.30, 0.12, 0.21, cloth, 0, 0.50, 0), 'tex-npc-cloth', 2, 1));
      root.appendChild(this._texEl(this._box(0.34, 0.046, 0.23, '#5a3a10', 0, 0.565, 0), 'tex-npc-leather', 2, 1));

      // ── Torso ────────────────────────────────────────────────────────
      root.appendChild(this._texEl(this._box(0.32, 0.36, 0.22, cloth, 0, 0.75, 0), 'tex-npc-cloth', 2, 2));

      // ── Schultern ────────────────────────────────────────────────────
      root.appendChild(this._texEl(this._box(0.42, 0.09, 0.23, cloth, 0, 0.93, 0), 'tex-npc-cloth', 2, 1));

      // ── Schürze (Händler) ────────────────────────────────────────────
      if (apron) {
        root.appendChild(this._texEl(this._box(0.24, 0.38, 0.012, apron, 0, 0.67, 0.116), 'tex-npc-cloth', 1, 2));
      }

      // ── Arme als Schulter-Pivot (für Animation) ──────────────────────
      const makeArm = (side) => {
        const pivot = document.createElement('a-entity');
        pivot.setAttribute('position', `${side * 0.215} 0.93 0`);
        pivot.appendChild(this._texEl(this._cyl(0.052, 0.38, cloth,  0, -0.19, 0), 'tex-npc-cloth', 1, 1)); // Oberarm (Ärmel)
        pivot.appendChild(this._texEl(this._cyl(0.044, 0.24, skin,   0, -0.43, 0), 'tex-npc-skin',  1, 1)); // Unterarm
        pivot.appendChild(this._texEl(this._sph(0.058, skin,          0, -0.59, 0), 'tex-npc-skin',  1, 1)); // Hand
        return pivot;
      };
      const armL = makeArm(-1);
      const armR = makeArm( 1);
      root.appendChild(armL);
      root.appendChild(armR);

      // ── Hals ─────────────────────────────────────────────────────────
      root.appendChild(this._texEl(this._cyl(0.054, 0.11, skin, 0, 1.045, 0), 'tex-npc-skin', 1, 1));

      // ── Kopf ─────────────────────────────────────────────────────────
      root.appendChild(this._texEl(this._sph(0.148, skin, 0, 1.225, 0), 'tex-npc-skin', 1, 1));

      // ── Ohren ────────────────────────────────────────────────────────
      root.appendChild(this._texEl(this._sph(0.040, skin, -0.145, 1.225, -0.015), 'tex-npc-skin', 1, 1));
      root.appendChild(this._texEl(this._sph(0.040, skin,  0.145, 1.225, -0.015), 'tex-npc-skin', 1, 1));

      // ── Haare ────────────────────────────────────────────────────────
      root.appendChild(this._texEl(this._box(0.30, 0.10, 0.30, hair, 0, 1.345, -0.018), 'tex-npc-hair', 2, 1));
      if (!hat) {
        // Seitensträhnen
        root.appendChild(this._texEl(this._box(0.065, 0.13, 0.055, hair, -0.152, 1.225, -0.045), 'tex-npc-hair', 1, 1));
        root.appendChild(this._texEl(this._box(0.065, 0.13, 0.055, hair,  0.152, 1.225, -0.045), 'tex-npc-hair', 1, 1));
      }

      // ── Gesicht (shader:flat – keine Textur, klare Farben) ───────────
      // Augenbrauen
      root.appendChild(this._box(0.062, 0.017, 0.012, hair, -0.054, 1.284, 0.124));
      root.appendChild(this._box(0.062, 0.017, 0.012, hair,  0.054, 1.284, 0.124));

      // Augenweiß
      root.appendChild(this._sph(0.028, '#f5f4ee', -0.055, 1.248, 0.122));
      root.appendChild(this._sph(0.028, '#f5f4ee',  0.055, 1.248, 0.122));
      // Pupille
      root.appendChild(this._sph(0.018, '#160800', -0.055, 1.248, 0.133));
      root.appendChild(this._sph(0.018, '#160800',  0.055, 1.248, 0.133));
      // Glanzpunkt
      root.appendChild(this._sph(0.007, '#ffffff', -0.048, 1.254, 0.140));
      root.appendChild(this._sph(0.007, '#ffffff',  0.048, 1.254, 0.140));

      // Nase
      root.appendChild(this._sph(0.022, skin, 0, 1.200, 0.140));

      // Mund
      root.appendChild(this._box(0.074, 0.016, 0.012, '#aa4433', 0, 1.162, 0.132));

      // Wangenrötung
      root.appendChild(this._sph(0.026, '#e07868', -0.090, 1.208, 0.120));
      root.appendChild(this._sph(0.026, '#e07868',  0.090, 1.208, 0.120));

      // ── Helm / Hut ───────────────────────────────────────────────────
      if (hat) {
        root.appendChild(this._texEl(this._cyl(0.170, 0.05, hat,  0, 1.390,  0), 'tex-npc-metal', 1, 1));  // Krempe
        root.appendChild(this._texEl(this._cyl(0.118, 0.20, hat,  0, 1.495,  0), 'tex-npc-metal', 1, 1));  // Kalotte
        root.appendChild(this._texEl(this._box(0.046, 0.24, 0.045, hat, 0, 1.445, 0.108), 'tex-npc-metal', 1, 2)); // Nasenschutz
      }

      this.el.appendChild(root);

      const wps      = this._pickWPs(5);
      const [sx, sz] = wps[0];
      root.object3D.position.set(sx, 0, sz);

      this._npcs.push({
        root, wps, wpIdx: 0,
        speed:   0.9 + Math.random() * 0.8,
        angle:   Math.random() * Math.PI * 2,
        phase:   Math.random() * Math.PI * 2,
        wait:    Math.random() * 2,
        radius:  0.28,
        reroute: 0,
        stuck:   0,
        armL, armR,
      });
    });
  },

  _tickNPCs(t, dt) {
    this._npcs.forEach(n => {
      const p = n.root.object3D.position;
      if (n.wait > 0) {
        n.wait -= dt;
        // Arme sanft in Ruhestellung
        if (n.armL.object3D) {
          n.armL.object3D.rotation.x *= 0.88;
          n.armR.object3D.rotation.x *= 0.88;
        }
        return;
      }

      const [tx, tz] = n.wps[n.wpIdx];
      const dx = tx - p.x, dz = tz - p.z;
      const d  = Math.sqrt(dx * dx + dz * dz);

      if (d < 0.3) {
        n.wpIdx = (n.wpIdx + 1) % n.wps.length;
        n.wait  = 0.4 + Math.random() * 1.8;
        n.reroute = 0;
        n.stuck = 0;
        return;
      }

      const spd  = n.speed * dt;
      const move = this._tryStep(n, tx, tz, spd);
      p.y = Math.sin(t * 0.008 + n.phase) * 0.04;

      // Arm-Schwingen beim Gehen
      if (n.armL.object3D) {
        const swing = Math.sin(t * 0.012 * n.speed + n.phase) * 0.50;
        n.armL.object3D.rotation.x =  swing;
        n.armR.object3D.rotation.x = -swing;
      }

      if (!move.moved) {
        n.stuck   += dt;
        n.reroute += dt;
      } else {
        n.stuck = 0;
        if (move.heading !== Math.atan2(dx, dz)) n.reroute += dt * 0.35;
        else n.reroute = Math.max(0, n.reroute - dt);
      }

      if (n.reroute > 1.1 || n.stuck > 0.55) {
        n.wpIdx   = (n.wpIdx + 1) % n.wps.length;
        n.reroute = 0;
        n.stuck   = 0;
        n.wait    = 0.15 + Math.random() * 0.35;
        return;
      }

      const ta = move.moved ? move.heading : Math.atan2(dx, dz);
      let da   = ta - n.angle;
      if (da >  Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      n.angle += da * Math.min(1, dt * 6);
      n.root.object3D.rotation.y = n.angle;
    });
  },

  /* ════════════════════════════════════════════════════════════════════
     TIERE
     ════════════════════════════════════════════════════════════════════ */
  _mkAnimals() {
    // ── Hunde ─────────────────────────────────────────────────────────────
    ['#8B4513','#c4a265','#555566'].forEach((c) => {
      const root = document.createElement('a-entity');
      const dark = '#160800';

      // Körper + Brust
      root.appendChild(this._box(0.33, 0.19, 0.44, c,    0, 0.26,  0.00));
      root.appendChild(this._box(0.27, 0.17, 0.16, c,    0, 0.26,  0.26));

      // 4 Bein-Pivots (Schulter/Hüfte oben, animierbar)
      const makeDogLeg = (lx, lz) => {
        const piv = document.createElement('a-entity');
        piv.setAttribute('position', `${lx} 0.21 ${lz}`);
        piv.appendChild(this._cyl(0.038, 0.22, c, 0, -0.11, 0));          // Schenkel
        const paw = this._box(0.075, 0.035, 0.095, c, 0, -0.235, 0.025);
        piv.appendChild(paw);
        return piv;
      };
      const legFL = makeDogLeg(-0.13,  0.17);
      const legFR = makeDogLeg( 0.13,  0.17);
      const legRL = makeDogLeg(-0.13, -0.17);
      const legRR = makeDogLeg( 0.13, -0.17);
      root.appendChild(legFL); root.appendChild(legFR);
      root.appendChild(legRL); root.appendChild(legRR);

      // Hals
      const neck = this._box(0.13, 0.16, 0.13, c, 0, 0.37, 0.22);
      neck.setAttribute('rotation', '-22 0 0');
      root.appendChild(neck);

      // Kopf + Schnauze
      root.appendChild(this._sph(0.115, c,       0,     0.445, 0.300));
      root.appendChild(this._box(0.080, 0.065, 0.11, c, 0, 0.413, 0.400));
      root.appendChild(this._sph(0.019, dark,    0,     0.417, 0.457));   // Nase
      root.appendChild(this._sph(0.016, dark,   -0.052, 0.465, 0.382));   // Auge L
      root.appendChild(this._sph(0.016, dark,    0.052, 0.465, 0.382));   // Auge R
      root.appendChild(this._sph(0.007, '#fff',  -0.047, 0.471, 0.391));  // Glanz L
      root.appendChild(this._sph(0.007, '#fff',   0.047, 0.471, 0.391));  // Glanz R

      // Ohren (hängend, leicht nach außen geneigt)
      const earL = this._box(0.055, 0.085, 0.038, c, -0.118, 0.438, 0.250);
      const earR = this._box(0.055, 0.085, 0.038, c,  0.118, 0.438, 0.250);
      earL.setAttribute('rotation', '0 0 -18'); earR.setAttribute('rotation', '0 0 18');
      root.appendChild(earL); root.appendChild(earR);

      // Schwanz (angewinkelt nach oben/hinten)
      const tail = this._box(0.045, 0.040, 0.20, c, 0, 0.365, -0.265);
      tail.setAttribute('rotation', '-38 0 0');
      root.appendChild(tail);

      this.el.appendChild(root);
      const wps = this._pickWPs(6);
      root.object3D.position.set(wps[0][0], 0, wps[0][1]);
      this._anim.push({ root, wps, wpIdx: 0, type: 'dog',
        legFL, legFR, legRL, legRR,
        speed: 1.4 + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        wait:  Math.random() * 1.5 });
    });

    // ── Katzen ────────────────────────────────────────────────────────────
    ['#888899','#c8a470'].forEach((c, i) => {
      const root = document.createElement('a-entity');

      // Körper (schmal, elegant)
      root.appendChild(this._box(0.24, 0.15, 0.34, c,    0, 0.21,  0.00));

      // 4 Bein-Pivots
      const makeCatLeg = (lx, lz) => {
        const piv = document.createElement('a-entity');
        piv.setAttribute('position', `${lx} 0.17 ${lz}`);
        piv.appendChild(this._cyl(0.027, 0.18, c, 0, -0.09, 0));
        piv.appendChild(this._box(0.056, 0.028, 0.072, c, 0, -0.195, 0.018));
        return piv;
      };
      const legFL = makeCatLeg(-0.09,  0.13);
      const legFR = makeCatLeg( 0.09,  0.13);
      const legRL = makeCatLeg(-0.09, -0.13);
      const legRR = makeCatLeg( 0.09, -0.13);
      root.appendChild(legFL); root.appendChild(legFR);
      root.appendChild(legRL); root.appendChild(legRR);

      // Hals
      root.appendChild(this._cyl(0.048, 0.095, c, 0, 0.315, 0.140));

      // Kopf
      root.appendChild(this._sph(0.097, c, 0, 0.395, 0.175));

      // Spitze Ohren
      const earL = this._box(0.036, 0.070, 0.018, c, -0.063, 0.462, 0.165);
      const earR = this._box(0.036, 0.070, 0.018, c,  0.063, 0.462, 0.165);
      earL.setAttribute('rotation', '0 0  16'); earR.setAttribute('rotation', '0 0 -16');
      root.appendChild(earL); root.appendChild(earR);

      // Augen (groß, leuchtend)
      root.appendChild(this._sph(0.022, '#1a5c10',  -0.042, 0.400, 0.262));
      root.appendChild(this._sph(0.022, '#1a5c10',   0.042, 0.400, 0.262));
      root.appendChild(this._sph(0.013, '#06060e',  -0.042, 0.400, 0.270));
      root.appendChild(this._sph(0.013, '#06060e',   0.042, 0.400, 0.270));
      root.appendChild(this._sph(0.006, '#ffffff',  -0.035, 0.405, 0.274));
      root.appendChild(this._sph(0.006, '#ffffff',   0.035, 0.405, 0.274));

      // Nase
      root.appendChild(this._sph(0.011, '#e07080', 0, 0.388, 0.267));

      // Schnurrhaare (4×2)
      [[-1,  -7], [-1, 7], [1, -7], [1, 7]].forEach(([side, ang]) => {
        const w = this._box(0.078, 0.004, 0.003, '#cccccc',
          side * 0.090, 0.385 + (ang > 0 ? -0.004 : 0.004), 0.252);
        w.setAttribute('rotation', `0 0 ${ang}`);
        root.appendChild(w);
      });

      // Schwanz: Pivot-Basis für Seitenschwingen + zwei gebogene Segmente
      const tailBase = document.createElement('a-entity');
      tailBase.setAttribute('position', '0 0.255 -0.178');
      tailBase.setAttribute('rotation', '32 0 0');     // Basis-Neigung nach hinten/oben
      tailBase.appendChild(this._cyl(0.021, 0.20, c, 0, 0.100, 0));  // Segment 1
      const seg2 = this._cyl(0.016, 0.15, c, 0, 0.228, 0);
      seg2.setAttribute('rotation', '-28 0 0');          // Spitze leicht nach vorn gebogen
      tailBase.appendChild(seg2);
      root.appendChild(tailBase);

      this.el.appendChild(root);
      root.object3D.position.set(i === 0 ? -3 : 8, 0, i === 0 ? 5 : -3);
      this._anim.push({ root, wps: this._pickWPs(4), wpIdx: 0, type: 'cat',
        legFL, legFR, legRL, legRR,
        tail: tailBase,
        speed: 0.40 + Math.random() * 0.25,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        wait:  2 + Math.random() * 4 });
    });

    // ── Hühner ────────────────────────────────────────────────────────────
    for (let i = 0; i < 6; i++) {
      const root   = document.createElement('a-entity');
      const body   = '#f0dfa0';
      const red    = '#cc2222';
      const beak   = '#e8a020';
      const yellow = '#d4a020';

      // Rumpf
      root.appendChild(this._sph(0.145, body, 0, 0.230, 0.000));

      // Flügel (seitlich anliegend)
      const wL = this._box(0.050, 0.095, 0.175, body, -0.158, 0.230, -0.008);
      const wR = this._box(0.050, 0.095, 0.175, body,  0.158, 0.230, -0.008);
      wL.setAttribute('rotation', '0 0  14'); wR.setAttribute('rotation', '0 0 -14');
      root.appendChild(wL); root.appendChild(wR);

      // Schwanzfedern (3 Strähnen hinten oben)
      [{ox:0, oz:0, rz:0}, {ox:-0.038, oz:0, rz:12}, {ox:0.038, oz:0, rz:-12}].forEach(f => {
        const tf = this._box(0.028, 0.130, 0.028, body, f.ox, 0.300, -0.128);
        tf.setAttribute('rotation', `-42 0 ${f.rz}`);
        root.appendChild(tf);
      });

      // Beine
      root.appendChild(this._cyl(0.019, 0.160, yellow, -0.054, 0.082, 0.010));
      root.appendChild(this._cyl(0.019, 0.160, yellow,  0.054, 0.082, 0.010));
      // Füße (3-Zehen-Andeutung)
      root.appendChild(this._box(0.044, 0.018, 0.096, yellow, -0.054, 0.006, 0.030));
      root.appendChild(this._box(0.044, 0.018, 0.096, yellow,  0.054, 0.006, 0.030));
      root.appendChild(this._box(0.022, 0.015, 0.050, yellow, -0.078, 0.006, -0.010));
      root.appendChild(this._box(0.022, 0.015, 0.050, yellow,  0.078, 0.006, -0.010));

      // Hals
      root.appendChild(this._cyl(0.040, 0.105, body, 0, 0.385, 0.082));

      // Kopf
      root.appendChild(this._sph(0.075, body, 0, 0.460, 0.126));

      // Kamm (3 Zacken)
      root.appendChild(this._box(0.024, 0.058, 0.014, red,  0.000, 0.526, 0.118));
      root.appendChild(this._box(0.018, 0.044, 0.012, red, -0.024, 0.518, 0.116));
      root.appendChild(this._box(0.018, 0.044, 0.012, red,  0.024, 0.518, 0.116));

      // Kehllappen
      root.appendChild(this._sph(0.028, red, 0, 0.418, 0.150));

      // Schnabel (Ober- + Unterkiefer)
      root.appendChild(this._box(0.030, 0.020, 0.050, beak,  0, 0.460, 0.175));
      root.appendChild(this._box(0.026, 0.013, 0.040, beak,  0, 0.448, 0.172));

      // Augen
      root.appendChild(this._sph(0.016, '#e8a800', -0.050, 0.467, 0.150));
      root.appendChild(this._sph(0.016, '#e8a800',  0.050, 0.467, 0.150));
      root.appendChild(this._sph(0.009, '#080808', -0.050, 0.467, 0.158));
      root.appendChild(this._sph(0.009, '#080808',  0.050, 0.467, 0.158));

      this.el.appendChild(root);
      const sx = (Math.random() - 0.5) * 10;
      const sz = (Math.random() - 0.5) * 10;
      root.object3D.position.set(sx, 0, sz);
      this._anim.push({ root, type: 'chicken',
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.50 + Math.random() * 0.30,
        tx: sx + (Math.random() - 0.5) * 5,
        tz: sz + (Math.random() - 0.5) * 5,
        wait:  Math.random() * 2 });
    }
  },

  _tickAnim(t, dt) {
    this._anim.forEach(a => {
      if (a.type === 'chicken') { this._tickChicken(a, t, dt); return; }

      const p = a.root.object3D.position;
      if (a.wait > 0) {
        a.wait -= dt;
        // Beine in Ruhe dämpfen
        if (a.legFL && a.legFL.object3D) {
          a.legFL.object3D.rotation.x *= 0.88; a.legFR.object3D.rotation.x *= 0.88;
          a.legRL.object3D.rotation.x *= 0.88; a.legRR.object3D.rotation.x *= 0.88;
        }
        // Katzenschwanz wippen
        if (a.tail && a.tail.object3D) {
          a.tail.object3D.rotation.z = Math.sin(t * 0.006 + a.phase) * 0.28;
        }
        return;
      }

      const [tx, tz] = a.wps[a.wpIdx];
      const dx = tx - p.x, dz = tz - p.z;
      const d  = Math.sqrt(dx * dx + dz * dz);

      if (d < 0.25) {
        a.wpIdx = (a.wpIdx + 1) % a.wps.length;
        a.wait  = a.type === 'cat'
          ? (Math.random() < 0.4 ? 4 + Math.random() * 5 : 0.8 + Math.random() * 2)
          : 0.2 + Math.random() * 0.6;
        return;
      }

      const spd = a.speed * dt;
      p.x += dx / d * spd;
      p.z += dz / d * spd;
      p.y  = Math.sin(t * 0.014 + a.phase) * 0.018;

      // Bein-Animation (Trab-Gang: FL+RR vs FR+RL)
      if (a.legFL && a.legFL.object3D) {
        const swing = Math.sin(t * 0.015 * a.speed + a.phase) * (a.type === 'dog' ? 0.55 : 0.40);
        a.legFL.object3D.rotation.x =  swing;
        a.legFR.object3D.rotation.x = -swing;
        a.legRL.object3D.rotation.x = -swing;
        a.legRR.object3D.rotation.x =  swing;
      }

      // Katzenschwanz: rhythmisches Seitenwedeln
      if (a.tail && a.tail.object3D) {
        a.tail.object3D.rotation.z = Math.sin(t * 0.008 + a.phase) * 0.32;
      }

      const ta = Math.atan2(dx, dz);
      let da   = ta - a.angle;
      if (da >  Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      a.angle += da * Math.min(1, dt * 7);
      a.root.object3D.rotation.y = a.angle;
    });
  },

  _tickChicken(a, t, dt) {
    const p  = a.root.object3D.position;
    p.y = Math.abs(Math.sin(t * 0.006 + a.phase)) * 0.032;

    if (a.wait > 0) { a.wait -= dt; return; }

    const dx = a.tx - p.x, dz = a.tz - p.z;
    const d  = Math.sqrt(dx * dx + dz * dz);

    if (d < 0.25) {
      a.tx   = (Math.random() - 0.5) * 9;
      a.tz   = (Math.random() - 0.5) * 9;
      a.wait = 0.9 + Math.random() * 1.8;
      return;
    }

    const spd = a.speed * dt * 0.55;
    p.x += dx / d * spd;
    p.z += dz / d * spd;

    const ta = Math.atan2(dx, dz);
    let da   = ta - a.angle;
    if (da >  Math.PI) da -= Math.PI * 2;
    if (da < -Math.PI) da += Math.PI * 2;
    a.angle += da * Math.min(1, dt * 5);
    a.root.object3D.rotation.y = a.angle;
  },

  /* ════════════════════════════════════════════════════════════════════
     VÖGEL
     ════════════════════════════════════════════════════════════════════ */
  _mkBirds() {
    [{cx: 0, cz:-10, n:7, h:30, r:20},
     {cx: 6, cz:  8, n:6, h:38, r:26}].forEach(f => {
      for (let i = 0; i < f.n; i++) {
        const root = document.createElement('a-entity');
        root.appendChild(this._box(0.42, 0.10, 0.22, '#222233', 0, 0, 0));
        const wl = this._box(0.46, 0.05, 0.12, '#222233', -0.32, 0,  0.04);
        const wr = this._box(0.46, 0.05, 0.12, '#222233',  0.32, 0,  0.04);
        root.appendChild(wl); root.appendChild(wr);
        this.el.appendChild(root);

        const angle = (i / f.n) * Math.PI * 2 + Math.random() * 0.5;
        this._birds.push({
          root, wl, wr,
          cx: f.cx, cz: f.cz,
          r:     f.r + (Math.random() - 0.5) * 7,
          spd:   0.17 + Math.random() * 0.10,
          angle,
          baseH: f.h + (Math.random() - 0.5) * 5,
          wFreq: 1.1 + Math.random() * 1.3,
          wAmp:  0.8 + Math.random() * 1.0,
          wPh:   Math.random() * Math.PI * 2,
          flPh:  Math.random() * Math.PI * 2,
        });
      }
    });
  },

  _tickBirds(t, dt) {
    const ts = t * 0.001;
    this._birds.forEach(b => {
      b.angle += b.spd * dt;
      const x = b.cx + Math.cos(b.angle) * b.r;
      const z = b.cz + Math.sin(b.angle) * b.r;
      const y = b.baseH + Math.sin(ts * b.wFreq + b.wPh) * b.wAmp;
      b.root.object3D.position.set(x, y, z);
      b.root.object3D.rotation.y = -(b.angle - Math.PI * 0.5);
      const flap = Math.sin(ts * 8 + b.flPh) * 0.35;
      if (b.wl.object3D) b.wl.object3D.rotation.z =  flap;
      if (b.wr.object3D) b.wr.object3D.rotation.z = -flap;
    });
  },
});
