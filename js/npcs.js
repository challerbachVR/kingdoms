// ═══════════════════════════════════════════════════════════════════════════
// CITY-LIFE COMPONENT – NPCs, Tiere, Vögel (prozedural, kein Asset)
// ═══════════════════════════════════════════════════════════════════════════
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
    this._mkNPCs();
    this._mkAnimals();
    this._mkBirds();
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
  _mkNPCs() {
    const CLOTH = ['#c0392b','#2980b9','#27ae60','#8e44ad',
                   '#e67e22','#16a085','#d35400','#6c3483','#1a5276'];
    const SKIN  = '#f0c090';
    const HAIR  = ['#3d2b1f','#7b3f00','#c8a870','#1c1c1c','#f5e6c8'];

    for (let i = 0; i < 9; i++) {
      const root = document.createElement('a-entity');
      const cl   = CLOTH[i], hr = HAIR[i % HAIR.length];
      root.appendChild(this._cyl(0.11, 0.78, '#333344',  0,    0.39,  0));
      root.appendChild(this._box(0.30, 0.42, 0.20, cl,   0,    0.98,  0));
      root.appendChild(this._sph(0.155, SKIN,             0,    1.52,  0));
      root.appendChild(this._box(0.28, 0.07, 0.21, hr,   0,    1.66,  0));
      this.el.appendChild(root);

      const wps      = this._pickWPs(5);
      const [sx, sz] = wps[0];
      root.object3D.position.set(sx, 0, sz);

      this._npcs.push({
        root, wps, wpIdx: 0,
        speed: 0.9  + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        wait:  Math.random() * 2,
      });
    }
  },

  _tickNPCs(t, dt) {
    this._npcs.forEach(n => {
      const p = n.root.object3D.position;
      if (n.wait > 0) { n.wait -= dt; return; }

      const [tx, tz] = n.wps[n.wpIdx];
      const dx = tx - p.x, dz = tz - p.z;
      const d  = Math.sqrt(dx * dx + dz * dz);

      if (d < 0.3) {
        n.wpIdx = (n.wpIdx + 1) % n.wps.length;
        n.wait  = 0.4 + Math.random() * 1.8;
        return;
      }

      const spd = n.speed * dt;
      p.x += dx / d * spd;
      p.z += dz / d * spd;
      p.y  = Math.sin(t * 0.008 + n.phase) * 0.04;

      const ta = Math.atan2(dx, dz);
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
    ['#8B4513','#c4a265','#555566'].forEach((c) => {
      const root = document.createElement('a-entity');
      root.appendChild(this._box(0.52, 0.26, 0.26, c,    0,    0.27,  0));
      root.appendChild(this._sph(0.13, c,               0.28,  0.37,  0));
      root.appendChild(this._box(0.10, 0.07, 0.09, c,   0.37,  0.33,  0));
      root.appendChild(this._box(0.18, 0.05, 0.05, c,  -0.31,  0.40,  0));
      this.el.appendChild(root);
      const wps = this._pickWPs(6);
      root.object3D.position.set(wps[0][0], 0, wps[0][1]);
      this._anim.push({ root, wps, wpIdx: 0, type: 'dog',
        speed: 1.4 + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        wait:  Math.random() * 1.5 });
    });

    ['#888899','#c8a470'].forEach((c, i) => {
      const root = document.createElement('a-entity');
      root.appendChild(this._box(0.33, 0.20, 0.18, c,    0,    0.20,  0));
      root.appendChild(this._sph(0.11, c,               0.17,  0.29,  0));
      root.appendChild(this._box(0.03, 0.06, 0.03, c,   0.22,  0.40,  0.038));
      root.appendChild(this._box(0.03, 0.06, 0.03, c,   0.22,  0.40, -0.038));
      root.appendChild(this._cyl(0.025, 0.32, c,        -0.19,  0.30,  0));
      this.el.appendChild(root);
      root.object3D.position.set(i === 0 ? -3 : 8, 0, i === 0 ? 5 : -3);
      this._anim.push({ root, wps: this._pickWPs(4), wpIdx: 0, type: 'cat',
        speed: 0.40 + Math.random() * 0.25,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        wait:  2 + Math.random() * 4 });
    });

    for (let i = 0; i < 6; i++) {
      const root = document.createElement('a-entity');
      root.appendChild(this._sph(0.13, '#f0dfa0',    0,    0.19,  0));
      root.appendChild(this._sph(0.07, '#f0dfa0',    0.13, 0.31,  0));
      root.appendChild(this._box(0.07,0.045,0.06,'#e8a020', 0.21, 0.30, 0));
      root.appendChild(this._sph(0.025,'#cc0000',    0.17, 0.26,  0));
      root.appendChild(this._box(0.04, 0.06,0.02,'#dd2222', 0.13, 0.39, 0));
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
      if (a.wait > 0) { a.wait -= dt; return; }

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
