// ═══════════════════════════════════════════════════════════════════════════
// FEENREICH KREATUREN – Feen, Tiere, Geistwesen
// Prozedural, keine externen Assets, Quest 3 optimiert.
// Komponente: feenreich-life (auf <a-entity> in FEENREICH_HTML)
// ═══════════════════════════════════════════════════════════════════════════
AFRAME.registerComponent('feenreich-life', {

  init() {
    this._fairies = [];   // Schwarmobjekte
    this._animals = [];   // Hasen, Füchse, Schmetterlinge
    this._spirits = [];   // Geistwesen
    this._built   = false;
    this._cam     = null;
    this._camWP   = new THREE.Vector3();

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });
  },

  remove() {
    const rm = e => {
      if (e && e.parentNode) e.parentNode.removeChild(e);
    };
    this._fairies.forEach(sw => {
      sw.members.forEach(m => {
        rm(m.root);
        m.trail.forEach(tr => rm(tr.el));
      });
    });
    this._animals.forEach(a => rm(a.root));
    this._spirits.forEach(s => rm(s.root));
  },

  tick(t, dt) {
    if (!this._built || dt > 200) return;
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam) return;
    this._cam.object3D.getWorldPosition(this._camWP);

    // Keine Kreatur-KI wenn Spieler noch in der Kesselstadt ist
    if (this._camWP.z < 30) return;

    const s = Math.min(dt, 50) * 0.001;
    this._tickFairies(t, s);
    this._tickAnimals(t, s);
    this._tickSpirits(t, s);
  },

  _build() {
    this._built = true;
    this._mkFairies();
    this._mkAnimals();
    this._mkSpirits();
  },

  // ── DOM-Hilfsfunktionen ─────────────────────────────────────────────────
  _el(tag, attrs) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  },

  _sph(r, col, em, emI, op, px, py, pz) {
    const mat = [`color:${col}`, 'shader:flat',
      ...(em  ? [`emissive:${em}`, `emissiveIntensity:${emI}`] : []),
      ...(op < 1 ? [`transparent:true`, `opacity:${op}`] : []),
    ].join(';');
    return this._el('a-sphere', {
      radius: r, position: `${px} ${py} ${pz}`,
      'segments-width': 4, 'segments-height': 3, material: mat,
    });
  },

  _box(w, h, d, col, op, px, py, pz) {
    const mat = [`color:${col}`, 'shader:flat',
      ...(op < 1 ? [`transparent:true`, `opacity:${op}`] : []),
    ].join(';');
    return this._el('a-box', {
      width: w, height: h, depth: d,
      position: `${px} ${py} ${pz}`,
      'width-segments': 1, 'height-segments': 1, material: mat,
    });
  },

  _cyl(r, h, col, px, py, pz) {
    return this._el('a-cylinder', {
      radius: r, height: h, position: `${px} ${py} ${pz}`,
      'segments-radial': 4, material: `color:${col};shader:flat`,
    });
  },

  _cone(rb, rt, h, col, px, py, pz) {
    return this._el('a-cone', {
      'radius-bottom': rb, 'radius-top': rt, height: h,
      position: `${px} ${py} ${pz}`,
      'segments-radial': 4, material: `color:${col};shader:flat`,
    });
  },

  // Plane für Flügel – side:double damit von beiden Seiten sichtbar
  _wing(w, h, col, op, px, py, pz, rx, ry, rz) {
    return this._el('a-plane', {
      width: w, height: h,
      position: `${px} ${py} ${pz}`,
      rotation: `${rx} ${ry} ${rz}`,
      material: `color:${col};shader:flat;transparent:true;opacity:${op};side:double`,
    });
  },

  /* ══════════════════════════════════════════════════════════════════════
     ✦ KLEINE FEEN
     3 Schwärme (Gold / Blau / Grün), je 4 Mitglieder.
     Neugierig ab 14 m, scheu ab 5 m vom Spieler.
     ══════════════════════════════════════════════════════════════════════ */
  _SWARMS: [
    { col: '#ffdd44', em: '#ffaa00', cx: -8,  cy: 3.5, cz:  58 },
    { col: '#44aaff', em: '#0066ff', cx:  12, cy: 4.2, cz:  80 },
    { col: '#44ff88', em: '#00aa44', cx:  -5, cy: 3.8, cz: 100 },
  ],

  _mkFairies() {
    this._SWARMS.forEach(sw => {
      const swarm = {
        cx: sw.cx, cy: sw.cy, cz: sw.cz,
        col: sw.col, em: sw.em,
        members: [],
        orbitA:   Math.random() * Math.PI * 2,
        orbitR:   4 + Math.random() * 3,
        orbitSpd: 0.10 + Math.random() * 0.08,
      };

      for (let i = 0; i < 4; i++) {
        const root = document.createElement('a-entity');

        // Äußerer Glühschimmer
        const glow = this._sph(0.14, sw.col, sw.em, 0.4, 0.20, 0, 0, 0);
        // Körper
        const body = this._sph(0.052, sw.col, sw.em, 2.2, 1.0, 0, 0, 0);
        // Flügel – jeweils durch rotation.z animiert (in Grad gespeichert, in tick direkt als Rad gesetzt)
        const wL = this._wing(0.14, 0.10, sw.col, 0.62, -0.08, 0.01, 0,  -15, 25,  65);
        const wR = this._wing(0.14, 0.10, sw.col, 0.62,  0.08, 0.01, 0,  -15,-25, -65);

        root.appendChild(glow);
        root.appendChild(body);
        root.appendChild(wL);
        root.appendChild(wR);
        this.el.appendChild(root);

        // Partikelspuren – 2 Positionen im Ringpuffer
        const trail = [];
        for (let ti = 0; ti < 2; ti++) {
          const tp = this._sph(0.028, sw.col, sw.em, 0.9, 0.55 - ti * 0.22, 0, -200, 0);
          this.el.appendChild(tp);
          trail.push({ el: tp, x: sw.cx, y: sw.cy, z: sw.cz });
        }

        swarm.members.push({
          root, glow, wL, wR, trail,
          orbR:   0.9 + Math.random() * 1.3,
          orbA:   (i / 4) * Math.PI * 2,
          orbSpd: 0.55 + Math.random() * 0.55,
          bobPh:  Math.random() * Math.PI * 2,
          bobAmp: 0.28 + Math.random() * 0.38,
          wPhase: Math.random() * Math.PI * 2,
          trailT: 0,
          px: sw.cx, py: sw.cy, pz: sw.cz,
        });
      }
      this._fairies.push(swarm);
    });
  },

  _tickFairies(t, dt) {
    const ts  = t * 0.001;
    const ppx = this._camWP.x, ppz = this._camWP.z;

    this._fairies.forEach(sw => {
      const ddx = ppx - sw.cx, ddz = ppz - sw.cz;
      const pdist = Math.sqrt(ddx * ddx + ddz * ddz);

      const FLEE_D  = 5.5;
      const CURIO_D = 14;

      // ── Schwarm-KI ──
      if (pdist < FLEE_D) {
        // Scheu: direkt wegfliegen
        const nd = Math.max(pdist, 0.1);
        sw.cx -= (ddx / nd) * dt * 6.0;
        sw.cz -= (ddz / nd) * dt * 6.0;
      } else if (pdist < CURIO_D) {
        // Neugierig: langsam nähern
        const nd = Math.max(pdist, 0.1);
        sw.cx += (ddx / nd) * dt * 0.7;
        sw.cz += (ddz / nd) * dt * 0.7;
      } else {
        // Normal: langsame Orbitbewegung
        sw.orbitA += sw.orbitSpd * dt;
        sw.cx += Math.cos(sw.orbitA) * sw.orbitR * dt * 0.18;
        sw.cz += Math.sin(sw.orbitA) * sw.orbitR * dt * 0.14;
      }

      // Feenreich-Grenzen halten
      sw.cx = Math.max(-25, Math.min(25, sw.cx));
      sw.cz = Math.max( 38, Math.min(112, sw.cz));
      sw.cy = 2.8 + Math.sin(ts * 0.35 + sw.orbitA) * 1.0;

      const isShy = pdist < FLEE_D;

      // ── Mitglieder ──
      sw.members.forEach(m => {
        m.orbA += m.orbSpd * (isShy ? 2.0 : 1.0) * dt;
        const nx = sw.cx + Math.cos(m.orbA) * m.orbR;
        const nz = sw.cz + Math.sin(m.orbA) * m.orbR;
        const ny = sw.cy + Math.sin(ts * 1.1 + m.bobPh) * m.bobAmp;

        // Trail-Ringpuffer vorschieben
        m.trailT -= dt;
        if (m.trailT <= 0) {
          m.trailT = 0.09;
          for (let ti = m.trail.length - 1; ti > 0; ti--) {
            m.trail[ti].x = m.trail[ti - 1].x;
            m.trail[ti].y = m.trail[ti - 1].y;
            m.trail[ti].z = m.trail[ti - 1].z;
          }
          m.trail[0].x = m.px;
          m.trail[0].y = m.py;
          m.trail[0].z = m.pz;
        }
        m.trail.forEach(tr => tr.el.object3D.position.set(tr.x, tr.y, tr.z));

        m.px = nx; m.py = ny; m.pz = nz;
        m.root.object3D.position.set(nx, ny, nz);

        // Zur Flugrichtung drehen
        const fdx = nx - (m.px || nx), fdz = nz - (m.pz || nz);
        if (fdx * fdx + fdz * fdz > 0.0001) {
          m.root.object3D.rotation.y = Math.atan2(fdx, fdz);
        }

        // Flügelschlag (direkt Euler in Radiant setzen)
        const flapT   = ts * (isShy ? 14 : 7) + m.wPhase;
        const flapAng = Math.sin(flapT) * 0.55;
        if (m.wL.object3D) m.wL.object3D.rotation.z =  (1.10 + flapAng);
        if (m.wR.object3D) m.wR.object3D.rotation.z = -(1.10 + flapAng);

        // Glow-Puls
        if (m.glow.object3D) {
          const gs = 0.7 + Math.abs(Math.sin(ts * 2.8 + m.bobPh)) * 0.55;
          m.glow.object3D.scale.setScalar(gs);
        }
      });
    });
  },

  /* ══════════════════════════════════════════════════════════════════════
     ✦ TIERE: Hasen, Füchse, Schmetterlinge
     Flüchten langsam wenn Spieler zu nah kommt.
     ══════════════════════════════════════════════════════════════════════ */

  // Wegpunkte im Feenreich (x, z)
  _FWP: [
    [  4, 47], [ -6, 52], [ 10, 57], [  2, 63],
    [-15, 67], [  8, 73], [ -3, 79], [ 14, 83],
    [ -8, 87], [  5, 93], [-12, 99], [  3,105],
    [  7, 60], [-10, 75], [ 18, 90], [-20, 80],
  ],

  _pickFWP(n) {
    const pool = [...this._FWP], res = [];
    for (let i = 0; i < n; i++) {
      const j = Math.floor(Math.random() * pool.length);
      res.push(pool.splice(j, 1)[0]);
    }
    return res;
  },

  _mkAnimals() {
    this._mkRabbits();
    this._mkFoxes();
    this._mkButterflies();
  },

  // ── Hasen ───────────────────────────────────────────────────────────────
  _mkRabbits() {
    for (let i = 0; i < 3; i++) {
      const root = document.createElement('a-entity');
      const W  = '#f2f2f2';
      const WW = '#e8e8e8';  // leicht dunklere Unterseite
      const PK = '#ffbbcc';

      // Hinterkörper (runder, tiefer)
      root.appendChild(this._sph(0.130, W, null, 0, 1,  0,     0.155, -0.06));
      // Vorderkörper (etwas kleiner)
      root.appendChild(this._sph(0.105, W, null, 0, 1,  0,     0.170,  0.09));
      // Bauch (heller)
      root.appendChild(this._sph(0.095, '#fefefe', null, 0, 1,  0, 0.160,  0.06));

      // Hinterbeine-Pivot (Hase: ausgeprägte Oberschenkel schräg nach hinten)
      const makeHLeg = (side) => {
        const piv = document.createElement('a-entity');
        piv.setAttribute('position', `${side * 0.085} 0.135 -0.085`);
        // Oberschenkel – schräg nach hinten/unten
        const thigh = this._box(0.052, 0.130, 0.052, WW, 1, 0, -0.058, -0.028);
        thigh.setAttribute('rotation', '30 0 0');
        piv.appendChild(thigh);
        // Unterschenkel – fast senkrecht
        piv.appendChild(this._cyl(0.026, 0.115, WW, 0, -0.130, 0.010));
        // Pfote (lang, nach vorn)
        piv.appendChild(this._box(0.046, 0.020, 0.085, WW, 1, 0, -0.198, 0.030));
        return piv;
      };
      const hLegL = makeHLeg(-1);
      const hLegR = makeHLeg( 1);
      root.appendChild(hLegL); root.appendChild(hLegR);

      // Vorderbeine-Pivot
      const makeFLeg = (side) => {
        const piv = document.createElement('a-entity');
        piv.setAttribute('position', `${side * 0.068} 0.148 0.095`);
        piv.appendChild(this._cyl(0.022, 0.130, WW, 0, -0.065, 0));
        piv.appendChild(this._box(0.042, 0.018, 0.060, WW, 1, 0, -0.138, 0.018));
        return piv;
      };
      const fLegL = makeFLeg(-1);
      const fLegR = makeFLeg( 1);
      root.appendChild(fLegL); root.appendChild(fLegR);

      // Hals
      root.appendChild(this._cyl(0.042, 0.068, W, 0, 0.268, 0.120));

      // Kopf
      root.appendChild(this._sph(0.096, W, null, 0, 1, 0, 0.325, 0.155));
      // Wangen (etwas breiter als Kopf)
      root.appendChild(this._sph(0.062, W, null, 0, 1, -0.072, 0.310, 0.158));
      root.appendChild(this._sph(0.062, W, null, 0, 1,  0.072, 0.310, 0.158));

      // Ohren (lang, leicht gespreizt)
      const earInner = (side) => {
        const e = this._box(0.018, 0.155, 0.010, PK, 1, side * 0.038, 0.495, 0.148);
        e.setAttribute('rotation', `0 0 ${side * -8}`);
        return e;
      };
      const makeEar = (side) => {
        const e = this._box(0.030, 0.185, 0.018, W, 1, side * 0.042, 0.490, 0.142);
        e.setAttribute('rotation', `0 0 ${side * -8}`);
        return e;
      };
      root.appendChild(makeEar(-1)); root.appendChild(makeEar(1));
      root.appendChild(earInner(-1)); root.appendChild(earInner(1));

      // Augen (cyan, leuchtend – magisches Feenreich-Tier)
      root.appendChild(this._sph(0.019, '#aaffee', '#aaffee', 2.8, 1,  -0.058, 0.333, 0.242));
      root.appendChild(this._sph(0.019, '#aaffee', '#aaffee', 2.8, 1,   0.058, 0.333, 0.242));
      root.appendChild(this._sph(0.010, '#002818', null, 0, 1,          -0.058, 0.333, 0.249));
      root.appendChild(this._sph(0.010, '#002818', null, 0, 1,           0.058, 0.333, 0.249));
      root.appendChild(this._sph(0.005, '#ffffff', null, 0, 1,          -0.050, 0.338, 0.252));
      root.appendChild(this._sph(0.005, '#ffffff', null, 0, 1,           0.050, 0.338, 0.252));

      // Nase
      root.appendChild(this._sph(0.014, PK, PK, 0.8, 1, 0, 0.315, 0.248));

      // Flauschiger Schwanz
      root.appendChild(this._sph(0.058, '#ffffff', null, 0, 1,  0, 0.192, -0.188));
      root.appendChild(this._sph(0.038, '#fefefe', null, 0, 1,  0, 0.208, -0.218));

      this.el.appendChild(root);
      const wps = this._pickFWP(6);
      root.object3D.position.set(wps[0][0], 0, wps[0][1]);

      this._animals.push({
        root, type: 'rabbit', wps, wpIdx: 0,
        fLegL, fLegR, hLegL, hLegR,
        speed: 1.0 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        wait:  Math.random() * 2,
        fleeing: false, fleeTimer: 0, FLEE_DIST: 4.0,
      });
    }
  },

  // ── Füchse ──────────────────────────────────────────────────────────────
  _mkFoxes() {
    for (let i = 0; i < 2; i++) {
      const root = document.createElement('a-entity');
      const FC = '#d46020';   // Fuchs-Orange
      const FD = '#8c2c00';   // Dunkel (Schnauze, Pfoten)
      const FW = '#f5f0e8';   // Weiß (Brust, Schwanzspitze)

      // Rumpf
      root.appendChild(this._sph(0.155, FC, null, 0, 1,  0, 0.240,  0.00));
      // Brust (heller)
      root.appendChild(this._sph(0.118, FW, null, 0, 1,  0, 0.240,  0.12));
      // Hinterpartie (leicht angehoben)
      root.appendChild(this._sph(0.130, FC, null, 0, 1,  0, 0.275, -0.09));

      // 4 Bein-Pivots
      const makeFoxLeg = (lx, lz, dark) => {
        const piv = document.createElement('a-entity');
        piv.setAttribute('position', `${lx} 0.225 ${lz}`);
        piv.appendChild(this._cyl(0.032, 0.230, FC, 0, -0.115, 0));
        // Pfote (dunkel)
        piv.appendChild(this._box(0.060, 0.025, 0.078, dark ? FD : FC, 1, 0, -0.245, 0.018));
        return piv;
      };
      const legFL = makeFoxLeg(-0.095,  0.12, true);
      const legFR = makeFoxLeg( 0.095,  0.12, true);
      const legRL = makeFoxLeg(-0.095, -0.12, true);
      const legRR = makeFoxLeg( 0.095, -0.12, true);
      root.appendChild(legFL); root.appendChild(legFR);
      root.appendChild(legRL); root.appendChild(legRR);

      // Hals
      const neck = this._box(0.120, 0.145, 0.115, FC, 1, 0, 0.370, 0.155);
      neck.setAttribute('rotation', '-18 0 0');
      root.appendChild(neck);

      // Kopf
      root.appendChild(this._sph(0.118, FC, null, 0, 1,  0, 0.448, 0.220));
      // Wangen (etwas breiter, weißlich)
      root.appendChild(this._sph(0.072, FW, null, 0, 1, -0.088, 0.435, 0.225));
      root.appendChild(this._sph(0.072, FW, null, 0, 1,  0.088, 0.435, 0.225));

      // Spitze Schnauze
      root.appendChild(this._box(0.072, 0.062, 0.115, FD, 1, 0, 0.425, 0.332));
      root.appendChild(this._sph(0.022, FD, null, 0, 1,  0, 0.430, 0.388));  // Nase

      // Spitze Ohren (Cone)
      const earL = this._cone(0.038, 0.005, 0.120, FC, -0.090, 0.548, 0.208);
      const earR = this._cone(0.038, 0.005, 0.120, FC,  0.090, 0.548, 0.208);
      earL.setAttribute('rotation', '0 0  12'); earR.setAttribute('rotation', '0 0 -12');
      root.appendChild(earL); root.appendChild(earR);
      // Ohrinnen (dunkler)
      const earIL = this._cone(0.020, 0.003, 0.078, FD, -0.090, 0.535, 0.210);
      const earIR = this._cone(0.020, 0.003, 0.078, FD,  0.090, 0.535, 0.210);
      earIL.setAttribute('rotation', '0 0  12'); earIR.setAttribute('rotation', '0 0 -12');
      root.appendChild(earIL); root.appendChild(earIR);

      // Augen (leuchtend grün – magisch)
      root.appendChild(this._sph(0.020, '#88ff44', '#88ff44', 2.2, 1, -0.058, 0.460, 0.318));
      root.appendChild(this._sph(0.020, '#88ff44', '#88ff44', 2.2, 1,  0.058, 0.460, 0.318));
      root.appendChild(this._sph(0.011, '#061800', null, 0, 1,         -0.058, 0.460, 0.326));
      root.appendChild(this._sph(0.011, '#061800', null, 0, 1,          0.058, 0.460, 0.326));
      root.appendChild(this._sph(0.005, '#ffffff', null, 0, 1,         -0.050, 0.466, 0.330));
      root.appendChild(this._sph(0.005, '#ffffff', null, 0, 1,          0.050, 0.466, 0.330));

      // Buschiger Schwanz (Pivot für Wedeln)
      const tailPiv = document.createElement('a-entity');
      tailPiv.setAttribute('position', '0 0.290 -0.175');
      tailPiv.setAttribute('rotation', '28 0 0');
      tailPiv.appendChild(this._sph(0.110, '#e06828', '#cc5500', 0.30, 1,  0, 0.115, 0));
      tailPiv.appendChild(this._sph(0.095, FC,         null,       0,   1,  0, 0.228, 0));
      tailPiv.appendChild(this._sph(0.080, '#f0f0f0',  null,       0,   1,  0, 0.310, 0));  // Spitze
      tailPiv.appendChild(this._sph(0.055, '#ffffff',  null,       0,   1,  0, 0.362, 0));
      root.appendChild(tailPiv);

      this.el.appendChild(root);
      const wps = this._pickFWP(5);
      root.object3D.position.set(wps[0][0], 0, wps[0][1]);

      this._animals.push({
        root, type: 'fox', wps, wpIdx: 0,
        legFL, legFR, legRL, legRR,
        tail: tailPiv,
        speed: 0.65 + Math.random() * 0.35,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        wait:  1.5 + Math.random() * 2.5,
        fleeing: false, fleeTimer: 0, FLEE_DIST: 5.5,
        shimmerPh: Math.random() * Math.PI * 2,
        _bodyMats: null,
      });
    }
  },

  // ── Schmetterlinge ───────────────────────────────────────────────────────
  _mkButterflies() {
    const FLOWERS = [
      { x:  3.5, z:  42 }, { x:  8,   z:  60 },
      { x: -6,   z:  68 }, { x: 10,   z:  75 },
      { x:  5,   z:  97 },
    ];
    const COLS  = ['#ff6699', '#44ccff', '#ffaa22', '#aa66ff', '#44ff88'];
    const DARKS = ['#880022', '#004488', '#885500', '#440088', '#006622'];
    const SPOTS = ['#ffddee', '#aaeeff', '#ffeeaa', '#ddaaff', '#ccffdd'];

    FLOWERS.forEach(({ x, z }, i) => {
      const root = document.createElement('a-entity');
      const col  = COLS[i];
      const dark = DARKS[i];
      const spot = SPOTS[i];

      // Körper: Abdomen (unten) + Thorax + Kopf
      root.appendChild(this._cyl(0.018, 0.130, dark,   0, -0.048, 0));  // Abdomen
      root.appendChild(this._cyl(0.016, 0.072, dark,   0,  0.040, 0));  // Thorax
      root.appendChild(this._sph(0.024, dark, null, 0, 1, 0, 0.092, 0)); // Kopf
      // Augen
      root.appendChild(this._sph(0.010, '#ffffaa', '#ffff44', 1.5, 1, -0.018, 0.096, 0.018));
      root.appendChild(this._sph(0.010, '#ffffaa', '#ffff44', 1.5, 1,  0.018, 0.096, 0.018));
      // Fühler (zwei dünne Stäbe + Knubbel)
      const antL = this._cyl(0.004, 0.095, dark, -0.022, 0.152, 0);
      const antR = this._cyl(0.004, 0.095, dark,  0.022, 0.152, 0);
      antL.setAttribute('rotation', '0 0  22'); antR.setAttribute('rotation', '0 0 -22');
      root.appendChild(antL); root.appendChild(antR);
      root.appendChild(this._sph(0.012, col, col, 0.8, 1, -0.052, 0.192, 0));
      root.appendChild(this._sph(0.012, col, col, 0.8, 1,  0.052, 0.192, 0));

      // Oberflügel (groß, abgerundet via plane)
      const wUL = this._wing(0.230, 0.170, col,  0.78, -0.115, 0.028, 0, -12, 22,  0);
      const wUR = this._wing(0.230, 0.170, col,  0.78,  0.115, 0.028, 0, -12,-22,  0);
      // Flügelmuster: dunklere Ränder (kleinere Planes leicht versetzt)
      const wULd = this._wing(0.190, 0.140, spot, 0.28, -0.112, 0.028, 0, -12, 22,  0);
      const wURd = this._wing(0.190, 0.140, spot, 0.28,  0.112, 0.028, 0, -12,-22,  0);
      // Unterflügel
      const wLL = this._wing(0.165, 0.130, col,  0.65, -0.095,-0.042, 0,  -5, 19,  0);
      const wLR = this._wing(0.165, 0.130, col,  0.65,  0.095,-0.042, 0,  -5,-19,  0);
      const wLLd = this._wing(0.120, 0.095, dark, 0.15, -0.093,-0.042, 0,  -5, 19,  0);
      const wLRd = this._wing(0.120, 0.095, dark, 0.15,  0.093,-0.042, 0,  -5,-19,  0);

      root.appendChild(wUL); root.appendChild(wUR);
      root.appendChild(wULd); root.appendChild(wURd);
      root.appendChild(wLL); root.appendChild(wLR);
      root.appendChild(wLLd); root.appendChild(wLRd);
      this.el.appendChild(root);

      root.object3D.position.set(x, 1.8 + Math.random() * 0.6, z);

      this._animals.push({
        root, type: 'butterfly',
        wUL, wUR, wULd, wURd, wLL, wLR, wLLd, wLRd,
        cx: x, cz: z,
        figA:    Math.random() * Math.PI * 2,
        figSpd:  0.50 + Math.random() * 0.35,
        figR:    1.8  + Math.random() * 1.2,
        baseY:   1.8  + Math.random() * 0.5,
        flapPh:  Math.random() * Math.PI * 2,
        flapSpd: 5.5  + Math.random() * 4.0,
        fleeing: false, fleeTimer: 0, fleeVY: 0, FLEE_DIST: 3.5,
        angle: 0,
      });
    });
  },

  _tickAnimals(t, dt) {
    const ts  = t * 0.001;
    const ppx = this._camWP.x, ppz = this._camWP.z;

    this._animals.forEach(a => {
      if (a.type === 'butterfly') { this._tickButterfly(a, ts, dt); return; }

      const p = a.root.object3D.position;

      // Distanz Spieler → Tier
      const fdx = p.x - ppx, fdz = p.z - ppz;
      const fdist = Math.sqrt(fdx * fdx + fdz * fdz);

      // ── Fluchtverhalten ──
      if (a.fleeing) {
        a.fleeTimer -= dt;
        if (a.fleeTimer <= 0) { a.fleeing = false; return; }
        const nd = Math.max(fdist, 0.1);
        p.x += (fdx / nd) * a.speed * 2.4 * dt;
        p.z += (fdz / nd) * a.speed * 2.4 * dt;
        p.x = Math.max(-26, Math.min(26, p.x));
        p.z = Math.max(38,  Math.min(112, p.z));
        // Hase hoppelt schnell
        if (a.type === 'rabbit') p.y = Math.abs(Math.sin(ts * 12 + a.phase)) * 0.14;
        return;
      }
      if (fdist < a.FLEE_DIST) {
        a.fleeing   = true;
        a.fleeTimer = 7 + Math.random() * 5;
        return;
      }

      // ── Normales Wandern ──
      if (a.wait > 0) {
        a.wait -= dt;
        // Beine dämpfen; Fuchsschwanz wippen
        if (a.fLegL && a.fLegL.object3D) {
          a.fLegL.object3D.rotation.x *= 0.88; a.fLegR.object3D.rotation.x *= 0.88;
          a.hLegL.object3D.rotation.x *= 0.88; a.hLegR.object3D.rotation.x *= 0.88;
        }
        if (a.legFL && a.legFL.object3D) {
          a.legFL.object3D.rotation.x *= 0.88; a.legFR.object3D.rotation.x *= 0.88;
          a.legRL.object3D.rotation.x *= 0.88; a.legRR.object3D.rotation.x *= 0.88;
        }
        if (a.tail && a.tail.object3D) {
          a.tail.object3D.rotation.z = Math.sin(ts * 0.9 + a.phase) * 0.35;
        }
        return;
      }

      const [tx, tz] = a.wps[a.wpIdx];
      const dx = tx - p.x, dz = tz - p.z;
      const d  = Math.sqrt(dx * dx + dz * dz);

      if (d < 0.35) {
        a.wpIdx = (a.wpIdx + 1) % a.wps.length;
        a.wait  = a.type === 'fox'
          ? 1.5 + Math.random() * 4
          : 0.5 + Math.random() * 1.5;
        return;
      }

      const spd = a.speed * dt;
      p.x += dx / d * spd;
      p.z += dz / d * spd;

      if (a.type === 'rabbit') {
        // Hase hoppelt: Körper auf/ab + Beinpivots synchron
        p.y = Math.abs(Math.sin(ts * 5.5 + a.phase)) * 0.062;
        if (a.fLegL && a.fLegL.object3D) {
          const hop = Math.sin(ts * 5.5 + a.phase);
          const fSwing = hop * 0.55;
          const hSwing = -hop * 0.65;
          a.fLegL.object3D.rotation.x =  fSwing; a.fLegR.object3D.rotation.x =  fSwing;
          a.hLegL.object3D.rotation.x =  hSwing; a.hLegR.object3D.rotation.x =  hSwing;
        }
      } else {
        // Fuchs: sanfter Trab
        p.y = Math.sin(ts * 1.4 + a.phase) * 0.014;
        if (a.legFL && a.legFL.object3D) {
          const sw = Math.sin(ts * 4.5 * a.speed + a.phase) * 0.48;
          a.legFL.object3D.rotation.x =  sw; a.legFR.object3D.rotation.x = -sw;
          a.legRL.object3D.rotation.x = -sw; a.legRR.object3D.rotation.x =  sw;
        }
        // Schwanz wedelt beim Gehen
        if (a.tail && a.tail.object3D) {
          a.tail.object3D.rotation.z = Math.sin(ts * 2.5 + a.phase) * 0.42;
        }
      }

      // Drehung zur Laufrichtung
      const ta = Math.atan2(dx, dz);
      let da   = ta - a.angle;
      if (da >  Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      a.angle += da * Math.min(1, dt * 6);
      a.root.object3D.rotation.y = a.angle;
    });
  },

  _tickButterfly(a, ts, dt) {
    const p    = a.root.object3D.position;
    const ppx  = this._camWP.x, ppz = this._camWP.z;
    const fdx  = p.x - ppx, fdz = p.z - ppz;
    const dist = Math.sqrt(fdx * fdx + fdz * fdz);

    if (a.fleeing) {
      a.fleeTimer -= dt;
      a.fleeVY     = Math.min(a.fleeVY + dt * 2.5, 2.2);
      p.y         += a.fleeVY * dt;
      if (a.fleeTimer <= 0 || p.y > a.baseY + 5) {
        a.fleeing = false; a.fleeVY = 0; p.y = a.baseY;
      }
    } else if (dist < a.FLEE_DIST) {
      a.fleeing   = true;
      a.fleeTimer = 3.5 + Math.random() * 3;
    } else {
      // Lissajous-Flugbahn (Acht-Figur) um Ausgangspunkt
      a.figA += a.figSpd * dt;
      p.x = a.cx + Math.sin(a.figA)           * a.figR;
      p.z = a.cz + Math.sin(a.figA * 2) * 0.5 * a.figR;
      p.y = a.baseY + Math.sin(a.figA * 1.7)  * 0.35;
    }

    // Flügelschlag (Radiant: ±0.65 rad = ±37°) – alle Lagen synchron
    const flap = Math.sin(ts * a.flapSpd + a.flapPh) * 0.65;
    const fU =  ( 0.45 + flap);
    const fL =  ( 0.80 + flap * 0.55);
    if (a.wUL.object3D)  a.wUL.object3D.rotation.z  =  fU;
    if (a.wUR.object3D)  a.wUR.object3D.rotation.z  = -fU;
    if (a.wULd.object3D) a.wULd.object3D.rotation.z =  fU;
    if (a.wURd.object3D) a.wURd.object3D.rotation.z = -fU;
    if (a.wLL.object3D)  a.wLL.object3D.rotation.z  =  fL;
    if (a.wLR.object3D)  a.wLR.object3D.rotation.z  = -fL;
    if (a.wLLd.object3D) a.wLLd.object3D.rotation.z =  fL;
    if (a.wLRd.object3D) a.wLRd.object3D.rotation.z = -fL;

    // Leichte Neigung in Flugrichtung
    a.root.object3D.rotation.y = Math.atan2(
      Math.cos(a.figA),
      Math.cos(a.figA * 2) * 2,
    );
    a.root.object3D.rotation.z = Math.sin(a.figA * 2) * 0.18;
  },

  /* ══════════════════════════════════════════════════════════════════════
     ✦ GEISTWESEN  –  klar erkennbare Geist-Silhouette:
       Kopf (oben) · Augen · Torso · Schleier (nach unten) · Arme
       Gleiten in langsamen Bögen, Opacity pulsiert.
     ══════════════════════════════════════════════════════════════════════ */

  // Erzeugt einen halbtransparenten Geist-Cone (Schleier)
  _veilCone(rb, rt, h, col, em, op, px, py, pz, seg) {
    const e = this._el('a-cone', {
      'radius-bottom': rb, 'radius-top': rt, height: h,
      position: `${px} ${py} ${pz}`,
      'segments-radial': seg || 6,
      material: `color:${col};emissive:${em};emissiveIntensity:0.55;` +
                `shader:flat;transparent:true;opacity:${op}`,
    });
    return e;
  },

  _mkSpirits() {
    const DEFS = [
      { col: '#c0ccff', em: '#8899ff', eye: '#aabbff', cx: -18, cz:  65, pathR:  7, pathSpd: 0.055 },
      { col: '#cceeff', em: '#44aadd', eye: '#88ddff', cx:   6, cz:  90, pathR:  9, pathSpd: 0.042 },
      { col: '#e0c0ff', em: '#cc88ff', eye: '#ddaaff', cx:  19, cz:  75, pathR:  6, pathSpd: 0.068 },
    ];

    DEFS.forEach(def => {
      const root = document.createElement('a-entity');
      const col = def.col, em = def.em, eye = def.eye;

      // ── KOPF ─────────────────────────────────────────────────────────
      // Äußerer Kopfschein
      const headGlow = this._sph(0.290, col, em, 0.20, 0.08, 0, 0.880, 0);
      headGlow.setAttribute('segments-width', 5); headGlow.setAttribute('segments-height', 4);

      // Hauptkopf
      const head = this._sph(0.195, col, em, 0.58, 0.40, 0, 0.880, 0);
      head.setAttribute('segments-width', 6); head.setAttribute('segments-height', 5);

      // Augen (vorne, z > 0 = Blickrichtung des Geistes)
      const eyeL = this._sph(0.044, '#ffffff', eye, 3.0, 0.82, -0.085, 0.902, 0.155);
      const eyeR = this._sph(0.044, '#ffffff', eye, 3.0, 0.82,  0.085, 0.902, 0.155);
      // Pupillen
      const pupL = this._sph(0.022, '#060010', null, 0, 0.90, -0.085, 0.902, 0.168);
      const pupR = this._sph(0.022, '#060010', null, 0, 0.90,  0.085, 0.902, 0.168);

      // ── HALS (kurzes Verbindungsstück) ───────────────────────────────
      const neck = this._sph(0.110, col, em, 0.48, 0.32, 0, 0.655, 0);

      // ── TORSO ────────────────────────────────────────────────────────
      const torso = this._sph(0.200, col, em, 0.44, 0.32, 0, 0.440, 0);
      torso.setAttribute('segments-width', 5); torso.setAttribute('segments-height', 4);

      // ── LEUCHTENDER SEELENKERN ───────────────────────────────────────
      const core = this._sph(0.088, '#ffffff', em, 2.2, 0.72, 0, 0.490, 0.020);

      // ── ARME (seitlich ausgestreckte Tentakel-Cones) ─────────────────
      // rotation Z=+90° → Cone-Achse zeigt nach -X (links)
      // radius-bottom (Ursprung -Y → jetzt +X, körpernah) = breit
      // radius-top    (Ursprung +Y → jetzt -X, außen)     = spitz
      const armL = this._veilCone(0.038, 0.005, 0.320, col, em, 0.38,  0, 0.455, 0);
      armL.setAttribute('rotation', '0 0  90');
      const armR = this._veilCone(0.038, 0.005, 0.320, col, em, 0.38,  0, 0.455, 0);
      armR.setAttribute('rotation', '0 0 -90');

      // ── SCHLEIER / GEWAND (Kegel nach unten, breit oben → spitz unten) ─
      // In A-Frame: radius-top = obere Kante (+Y), radius-bottom = untere Kante (-Y)
      // Für Geisterschleier: radius-top=breit (Taille oben), radius-bottom=spitz (unten)
      // Mittelpunkt des Kegels bei py → obere Kante bei py+h/2, untere bei py-h/2

      // Haupt-Schleier:  Taille bei y=+0.22, Spitze bei y≈-0.56 → Mitte y=-0.17
      const veil0 = this._veilCone(0.010, 0.230, 0.780, col, em, 0.34, 0, -0.170, 0, 6);

      // Zweiter (äußerer) Schleier: etwas breiter, kürzer
      const veil1 = this._veilCone(0.008, 0.295, 0.520, col, em, 0.18, 0, -0.040, 0, 6);

      // Drei versetzt-schwebende Seitenstreifen (Fetzen)
      const shreds = [
        this._veilCone(0.006, 0.085, 0.560, col, em, 0.20, -0.115, -0.085, 0.050, 4),
        this._veilCone(0.006, 0.075, 0.480, col, em, 0.20,  0.120, -0.050,-0.040, 4),
        this._veilCone(0.006, 0.065, 0.420, col, em, 0.18,  0.015, -0.070, 0.110, 4),
      ];
      shreds[0].setAttribute('rotation', '10 0 -8');
      shreds[1].setAttribute('rotation', '-8 0  6');
      shreds[2].setAttribute('rotation',  '5 0  4');

      // ── ORBITIERENDE PARTIKEL ────────────────────────────────────────
      const orbs = [];
      for (let oi = 0; oi < 3; oi++) {
        const orb = this._sph(0.036, col, em, 1.4, 0.58, 0, 0.500, 0);
        root.appendChild(orb);
        orbs.push({ el: orb, phase: (oi / 3) * Math.PI * 2, r: 0.58 + oi * 0.14, oy: 0.42 + oi * 0.18 });
      }

      // Alles anhängen
      root.appendChild(headGlow); root.appendChild(head);
      root.appendChild(eyeL);    root.appendChild(eyeR);
      root.appendChild(pupL);    root.appendChild(pupR);
      root.appendChild(neck);    root.appendChild(torso);
      root.appendChild(core);
      root.appendChild(armL);    root.appendChild(armR);
      root.appendChild(veil0);   root.appendChild(veil1);
      shreds.forEach(s => root.appendChild(s));
      this.el.appendChild(root);

      root.object3D.position.set(def.cx, 2.6, def.cz);

      this._spirits.push({
        root, headGlow, head, eyeL, eyeR, pupL, pupR,
        neck, torso, core, armL, armR, veil0, veil1, shreds, orbs,
        baseX: def.cx, baseZ: def.cz,
        pathA:   Math.random() * Math.PI * 2,
        pathR:   def.pathR,
        pathSpd: def.pathSpd,
        bobPh:   Math.random() * Math.PI * 2,
        opPh:    Math.random() * Math.PI * 2,
        _mats:   null,
      });
    });
  },

  _tickSpirits(t, dt) {
    const ts = t * 0.001;

    this._spirits.forEach(sp => {
      sp.pathA += sp.pathSpd * dt;

      const x = sp.baseX + Math.cos(sp.pathA)          * sp.pathR;
      const z = sp.baseZ + Math.sin(sp.pathA * 0.65)   * sp.pathR * 0.85;
      const y = 2.6      + Math.sin(ts * 0.45 + sp.bobPh) * 0.90;

      sp.root.object3D.position.set(x, y, z);
      // Dreht sich in Fahrtrichtung
      sp.root.object3D.rotation.y = sp.pathA + Math.PI * 0.5;
      // Leichte Neigung beim Gleiten
      sp.root.object3D.rotation.z = Math.sin(sp.pathA * 1.3) * 0.09;

      // ── Opacity-Puls (Hauch: 0.14 – 0.50) ──
      const op = 0.14 + Math.abs(Math.sin(ts * 0.30 + sp.opPh)) * 0.36;

      // Lazy material cache
      if (!sp._mats) {
        const col = el => { const ms = []; el.object3D.traverse(n => { if (n.isMesh && n.material) ms.push(n.material); }); return ms; };
        sp._mats = {
          headGlow: col(sp.headGlow),
          head:     col(sp.head),
          eyeL:     col(sp.eyeL), eyeR: col(sp.eyeR),
          pupL:     col(sp.pupL), pupR: col(sp.pupR),
          neck:     col(sp.neck),
          torso:    col(sp.torso),
          core:     col(sp.core),
          armL:     col(sp.armL), armR: col(sp.armR),
          veil0:    col(sp.veil0), veil1: col(sp.veil1),
          shreds:   sp.shreds.map(s => col(s)),
        };
      }

      const set = (mats, o) => mats.forEach(m => { m.opacity = Math.max(0, o); m.needsUpdate = true; });
      set(sp._mats.headGlow, op * 0.22);
      set(sp._mats.head,     op * 0.82);
      set(sp._mats.eyeL,     Math.min(0.96, op * 2.4));
      set(sp._mats.eyeR,     Math.min(0.96, op * 2.4));
      set(sp._mats.pupL,     Math.min(0.92, op * 2.2));
      set(sp._mats.pupR,     Math.min(0.92, op * 2.2));
      set(sp._mats.neck,     op * 0.68);
      set(sp._mats.torso,    op * 0.72);
      set(sp._mats.core,     Math.min(0.94, op * 2.8));
      set(sp._mats.armL,     op * 0.65);
      set(sp._mats.armR,     op * 0.65);
      set(sp._mats.veil0,    op * 0.72);
      set(sp._mats.veil1,    op * 0.40);
      sp._mats.shreds.forEach(ms => set(ms, op * 0.48));

      // ── Arm-Wellen ──
      if (sp.armL.object3D) {
        const wave = Math.sin(ts * 0.75 + sp.bobPh) * 0.30;
        // Arm-Pivot um Z animieren: Geist-Arme heben sich leicht
        sp.armL.object3D.rotation.z =  Math.PI * 0.5 + wave;
        sp.armR.object3D.rotation.z = -Math.PI * 0.5 - wave;
        sp.armL.object3D.rotation.x = Math.sin(ts * 0.55 + sp.opPh) * 0.20;
        sp.armR.object3D.rotation.x = Math.cos(ts * 0.55 + sp.opPh) * 0.20;
      }

      // ── Schleierfetzen wehen ──
      sp.shreds.forEach((s, si) => {
        if (s.object3D) {
          s.object3D.rotation.x = Math.sin(ts * 0.65 + si * 1.1 + sp.bobPh) * 0.16;
          s.object3D.rotation.z = Math.cos(ts * 0.50 + si * 0.9 + sp.opPh)  * 0.14;
        }
      });

      // ── Orb-Kreisen ──
      sp.orbs.forEach(orb => {
        if (orb.el.object3D) {
          const ox = Math.cos(ts * 0.85 + orb.phase) * orb.r;
          const oy = orb.oy + Math.sin(ts * 1.25 + orb.phase) * 0.20;
          const oz = Math.sin(ts * 0.85 + orb.phase) * orb.r;
          orb.el.object3D.position.set(ox, oy, oz);
        }
      });
    });
  },
});
