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
      const W = '#f2f2f2';

      root.appendChild(this._box( 0.28, 0.18, 0.22, W,    1,  0,    0.12,  0));     // Körper
      root.appendChild(this._sph( 0.10, W, null, 0, 1,     0.17, 0.24,  0));     // Kopf
      root.appendChild(this._box( 0.033, 0.22, 0.022, W, 1, 0.14, 0.41, -0.038)); // Ohr L
      root.appendChild(this._box( 0.033, 0.22, 0.022, W, 1, 0.14, 0.41,  0.038)); // Ohr R
      root.appendChild(this._sph( 0.017, '#aaffee', '#aaffee', 2.8, 1, 0.27, 0.26, -0.062)); // Auge L
      root.appendChild(this._sph( 0.017, '#aaffee', '#aaffee', 2.8, 1, 0.27, 0.26,  0.062)); // Auge R
      root.appendChild(this._sph( 0.012, '#ffbbcc', '#ffaacc', 1.0, 1, 0.28, 0.22,  0));     // Nase
      root.appendChild(this._sph( 0.052, W, null, 0, 1, -0.17, 0.14,  0));     // Schwanz

      this.el.appendChild(root);
      const wps = this._pickFWP(6);
      root.object3D.position.set(wps[0][0], 0, wps[0][1]);

      this._animals.push({
        root, type: 'rabbit', wps, wpIdx: 0,
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
      const FC = '#d46020', FD = '#a03808';

      root.appendChild(this._box( 0.36, 0.22, 0.20, FC, 1,  0,    0.18,  0));  // Körper
      root.appendChild(this._sph( 0.12, FC, null, 0, 1,     0.22, 0.30,  0));  // Kopf
      root.appendChild(this._box( 0.10, 0.07, 0.12, FD, 1,  0.32, 0.25,  0));  // Schnauze
      root.appendChild(this._cone(0.035, 0.005, 0.10, FC, 0.18, 0.42, -0.07)); // Ohr L
      root.appendChild(this._cone(0.035, 0.005, 0.10, FC, 0.18, 0.42,  0.07)); // Ohr R
      root.appendChild(this._sph( 0.018, '#88ff44', '#88ff44', 2.2, 1, 0.31, 0.31, -0.068)); // Auge L
      root.appendChild(this._sph( 0.018, '#88ff44', '#88ff44', 2.2, 1, 0.31, 0.31,  0.068)); // Auge R
      // Schwanz – zwei überlagerte Kugeln für Buscheffekt
      root.appendChild(this._sph( 0.095, '#e06828', '#cc5500', 0.38, 1, -0.24, 0.18,  0));
      root.appendChild(this._sph( 0.065, '#f8f8f8', null, 0, 1,      -0.33, 0.19,  0));  // Schwanzspitze

      this.el.appendChild(root);
      const wps = this._pickFWP(5);
      root.object3D.position.set(wps[0][0], 0, wps[0][1]);

      this._animals.push({
        root, type: 'fox', wps, wpIdx: 0,
        speed: 0.65 + Math.random() * 0.35,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.random() * Math.PI * 2,
        wait:  1.5 + Math.random() * 2.5,
        fleeing: false, fleeTimer: 0, FLEE_DIST: 5.5,
        shimmerPh: Math.random() * Math.PI * 2,
        // Materialen für Fell-Shimmer (werden lazy gecached)
        _bodyMats: null,
      });
    }
  },

  // ── Schmetterlinge ───────────────────────────────────────────────────────
  _mkButterflies() {
    // Blumenkoordinaten aus FEENREICH_HTML
    const FLOWERS = [
      { x:  3.5, z:  42 }, { x:  8,   z:  60 },
      { x: -6,   z:  68 }, { x: 10,   z:  75 },
      { x:  5,   z:  97 },
    ];
    const COLS = ['#ff6699', '#44ccff', '#ffaa22', '#aa66ff', '#44ff88'];

    FLOWERS.forEach(({ x, z }, i) => {
      const root = document.createElement('a-entity');
      const col  = COLS[i];
      const dark = '#221108';

      root.appendChild(this._cyl(0.012, 0.18, dark, 0, 0, 0)); // Körper

      // Flügel – Rotations-z wird in tick gesteuert (Radiant)
      // Initiale Rotation (Grad) gibt die Spreizung vor, z wird überschrieben
      const wUL = this._wing(0.22, 0.16, col, 0.72, -0.11, 0.025, 0, -12, 20,  0);
      const wUR = this._wing(0.22, 0.16, col, 0.72,  0.11, 0.025, 0, -12,-20,  0);
      const wLL = this._wing(0.16, 0.12, col, 0.55, -0.09,-0.045, 0,  -5, 18,  0);
      const wLR = this._wing(0.16, 0.12, col, 0.55,  0.09,-0.045, 0,  -5,-18,  0);

      root.appendChild(wUL); root.appendChild(wUR);
      root.appendChild(wLL); root.appendChild(wLR);
      this.el.appendChild(root);

      root.object3D.position.set(x, 1.8 + Math.random() * 0.6, z);

      this._animals.push({
        root, type: 'butterfly',
        wUL, wUR, wLL, wLR,
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
      if (a.wait > 0) { a.wait -= dt; return; }

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

      // Hase hoppelt sanft
      if (a.type === 'rabbit') {
        p.y = Math.abs(Math.sin(ts * 5 + a.phase)) * 0.055;
      } else {
        p.y = Math.sin(ts * 1.2 + a.phase) * 0.012;
        // Fuchs-Fell-Shimmer (lazy material cache)
        if (!a._bodyMats) {
          a._bodyMats = [];
          a.root.object3D.traverse(n => {
            if (n.isMesh && n.material) a._bodyMats.push(n.material);
          });
        }
        if (a._bodyMats.length) {
          const em = 0.15 + Math.abs(Math.sin(ts * 2.2 + a.shimmerPh)) * 0.25;
          a._bodyMats.forEach(m => {
            if (m.emissiveIntensity !== undefined) m.emissiveIntensity = em;
          });
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

    // Flügelschlag (Radiant: ±0.65 rad = ±37°)
    const flap = Math.sin(ts * a.flapSpd + a.flapPh) * 0.65;
    if (a.wUL.object3D) a.wUL.object3D.rotation.z =  ( 0.45 + flap);
    if (a.wUR.object3D) a.wUR.object3D.rotation.z = -( 0.45 + flap);
    if (a.wLL.object3D) a.wLL.object3D.rotation.z =  ( 0.80 + flap * 0.55);
    if (a.wLR.object3D) a.wLR.object3D.rotation.z = -( 0.80 + flap * 0.55);

    // Leichte Neigung in Flugrichtung
    a.root.object3D.rotation.y = Math.atan2(
      Math.cos(a.figA),
      Math.cos(a.figA * 2) * 2,
    );
    a.root.object3D.rotation.z = Math.sin(a.figA * 2) * 0.18;
  },

  /* ══════════════════════════════════════════════════════════════════════
     ✦ MYSTERIÖSE GEISTWESEN
     3 halbtransparente Erscheinungen. Reagieren NICHT auf den Spieler.
     Gleiten in langsamen Bögen, Opacity pulsiert (0.15 – 0.48).
     ══════════════════════════════════════════════════════════════════════ */
  _mkSpirits() {
    const DEFS = [
      { col: '#c0ccff', cx: -18, cz:  65, pathR:  7, pathSpd: 0.055 },
      { col: '#cceeff', cx:   6, cz:  90, pathR:  9, pathSpd: 0.042 },
      { col: '#e0c0ff', cx:  19, cz:  75, pathR:  6, pathSpd: 0.068 },
    ];

    DEFS.forEach(def => {
      const root = document.createElement('a-entity');
      const col  = def.col;

      // Äußere Aura – sehr transparent
      const aura = this._sph(0.75, col, col, 0.25, 0.08, 0, 0, 0);
      aura.setAttribute('segments-width',  5);
      aura.setAttribute('segments-height', 4);

      // Hauptkörper – langgestreckt (scale via Three.js gesetzt)
      const body = document.createElement('a-sphere');
      body.setAttribute('radius', 0.38);
      body.setAttribute('position', '0 0 0');
      body.setAttribute('segments-width',  5);
      body.setAttribute('segments-height', 4);
      body.setAttribute('material',
        `color:${col};emissive:${col};emissiveIntensity:0.55;` +
        `shader:flat;transparent:true;opacity:0.32`);

      // Innerer leuchtender Kern
      const core = this._sph(0.14, '#ffffff', col, 1.2, 0.55, 0, 0.15, 0);

      root.appendChild(aura);
      root.appendChild(body);
      root.appendChild(core);
      this.el.appendChild(root);

      root.object3D.position.set(def.cx, 2.8, def.cz);
      // Gestreckte Form ohne a-sphere scale-Attribut-Bugs: direkt Three.js
      body.addEventListener('object3dset', () => {
        body.object3D.scale.set(0.62, 1.75, 0.55);
      });

      // Material-Cache für Opacity-Puls (lazy, ersten Tick)
      this._spirits.push({
        root, aura, body, core,
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
      const y = 2.5      + Math.sin(ts * 0.45 + sp.bobPh) * 1.1;

      sp.root.object3D.position.set(x, y, z);
      sp.root.object3D.rotation.y = sp.pathA + Math.PI * 0.5;
      // Sanftes Neigen
      sp.root.object3D.rotation.z = Math.sin(sp.pathA * 1.3) * 0.12;

      // Opacity-Puls (Geisterhauch: 0.13 – 0.46)
      const op     = 0.13 + Math.abs(Math.sin(ts * 0.32 + sp.opPh)) * 0.33;
      const auraOp = op * 0.30;
      const coreOp = Math.min(0.82, op * 1.9);

      // Lazy-cache: Materials erst holen wenn object3D bereit
      if (!sp._mats) {
        sp._mats = { body: [], aura: [], core: [] };
        sp.body.object3D.traverse(n => { if (n.isMesh) sp._mats.body.push(n.material); });
        sp.aura.object3D.traverse(n => { if (n.isMesh) sp._mats.aura.push(n.material); });
        sp.core.object3D.traverse(n => { if (n.isMesh) sp._mats.core.push(n.material); });
      }
      sp._mats.body.forEach(m => { m.opacity = op;     m.needsUpdate = true; });
      sp._mats.aura.forEach(m => { m.opacity = auraOp; m.needsUpdate = true; });
      sp._mats.core.forEach(m => { m.opacity = coreOp; m.needsUpdate = true; });
    });
  },
});
