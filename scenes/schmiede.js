// ═══════════════════════════════════════════════════════════════════════════
// SCHMIEDE – Innenraum  (scenes/schmiede.js)
// Fügt architektonischen Inhalt in #schmiede-interior ein.
// Koordinatenursprung = Interior-Entity-Position (= Weltpos -9 0 -8).
//   Local  z = +4.0  → Südwand / Tür (Eingang)
//   Local  z = -4.0  → Nordwand / Esse (Schmiedefeuer)
//   Local  x = -5.0  → Westwand / Werkzeuge
//   Local  x = +5.0  → Ostwand  / Rüstung & Waffen
// ═══════════════════════════════════════════════════════════════════════════

AFRAME.registerComponent('schmiede-scene', {
  init() {
    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });
  },

  _build() {
    this._buildRetries = (this._buildRetries || 0) + 1;
    const interior = document.getElementById('schmiede-interior');
    if (!interior) {
      if (this._buildRetries > 20) {
        console.warn('schmiede-scene: #schmiede-interior nicht gefunden');
        return;
      }
      setTimeout(() => this._build(), 100);
      return;
    }
    this._initTextures();
    this._buildRoom(interior);
  },

  _initTextures() {
    const make = (id, w, h, fn) => {
      if (document.getElementById(id)) return;
      const c = document.createElement('canvas');
      c.id = id; c.width = w; c.height = h; c.style.display = 'none';
      document.body.appendChild(c);
      fn(c.getContext('2d'), w, h);
    };

    // Dunkler Bruchstein mit Rußstreifen
    make('tex-forge-stone', 256, 256, (ctx, W, H) => {
      ctx.fillStyle = '#1a1410';
      ctx.fillRect(0, 0, W, H);
      const bw = 72, bh = 36;
      for (let row = 0; row * bh < H + bh; row++) {
        const xOff = (row % 2) * (bw / 2);
        for (let col = -1; col * bw < W + bw; col++) {
          const bx = col * bw + xOff, by = row * bh;
          const t = 55 + Math.floor(Math.random() * 30);
          const w2 = Math.floor(Math.random() * 7);
          ctx.fillStyle = `rgb(${t + w2},${t + Math.floor(w2 / 2)},${t})`;
          ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
          if (Math.random() < 0.40) {
            ctx.fillStyle = `rgba(0,0,0,${0.30 + Math.random() * 0.40})`;
            ctx.fillRect(bx + 4 + Math.random() * (bw - 14),
                         by + 2 + Math.random() * (bh - 8),
                         4 + Math.random() * 18, 3 + Math.random() * 10);
          }
        }
      }
    });

    // Schieferplatten-Boden
    make('tex-forge-floor', 256, 256, (ctx, W, H) => {
      ctx.fillStyle = '#141210';
      ctx.fillRect(0, 0, W, H);
      const ts = 64;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const t = 50 + Math.floor(Math.random() * 20);
          ctx.fillStyle = `rgb(${t},${t},${t - 3})`;
          ctx.fillRect(col * ts + 2, row * ts + 2, ts - 4, ts - 4);
        }
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.40)';
      ctx.lineWidth = 3;
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath(); ctx.moveTo(i * ts, 0); ctx.lineTo(i * ts, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * ts); ctx.lineTo(W, i * ts); ctx.stroke();
      }
    });

    // Dunkle Eichenbalken
    make('tex-forge-beam', 128, 256, (ctx, W, H) => {
      ctx.fillStyle = '#1c1008';
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 18; i++) {
        const x = Math.random() * W;
        ctx.strokeStyle = `rgba(80,50,20,${0.12 + Math.random() * 0.18})`;
        ctx.lineWidth = 0.5 + Math.random() * 1.4;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (Math.random() - 0.5) * 6, H);
        ctx.stroke();
      }
    });
  },

  // ── helpers ────────────────────────────────────────────────────────────────

  _box(w, h, d, col, px, py, pz, texId, repx, repy) {
    const e = document.createElement('a-box');
    e.setAttribute('width', w); e.setAttribute('height', h); e.setAttribute('depth', d);
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    if (texId) e.setAttribute('tex', `id:${texId}; repx:${repx || 1}; repy:${repy || 1}`);
    return e;
  },

  _cyl(r, h, col, px, py, pz) {
    const e = document.createElement('a-cylinder');
    e.setAttribute('radius', r); e.setAttribute('height', h);
    e.setAttribute('segments-radial', '8');
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    return e;
  },

  _plane(w, h, col, px, py, pz, rx, texId, repx, repy) {
    const e = document.createElement('a-plane');
    e.setAttribute('width', w); e.setAttribute('height', h);
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('rotation', `${rx} 0 0`);
    e.setAttribute('material', `color:${col};shader:flat;side:double`);
    if (texId) e.setAttribute('tex', `id:${texId}; repx:${repx || 1}; repy:${repy || 1}`);
    return e;
  },

  _emissiveBox(w, h, d, col, emiCol, emi, px, py, pz, transp) {
    const e = document.createElement('a-box');
    e.setAttribute('width', w); e.setAttribute('height', h); e.setAttribute('depth', d);
    e.setAttribute('position', `${px} ${py} ${pz}`);
    let mat = `color:${col};emissive:${emiCol};emissiveIntensity:${emi};shader:flat`;
    if (transp) mat += `;transparent:true;opacity:${transp}`;
    e.setAttribute('material', mat);
    return e;
  },

  _emissiveSph(r, col, emiCol, emi, px, py, pz, transp) {
    const e = document.createElement('a-sphere');
    e.setAttribute('radius', r);
    e.setAttribute('segments-width', '8'); e.setAttribute('segments-height', '6');
    e.setAttribute('position', `${px} ${py} ${pz}`);
    let mat = `color:${col};emissive:${emiCol};emissiveIntensity:${emi};shader:flat`;
    if (transp) mat += `;transparent:true;opacity:${transp}`;
    e.setAttribute('material', mat);
    return e;
  },

  _sph(r, col, px, py, pz) {
    const e = document.createElement('a-sphere');
    e.setAttribute('radius', r);
    e.setAttribute('segments-width', '8'); e.setAttribute('segments-height', '6');
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    return e;
  },

  // ── room ───────────────────────────────────────────────────────────────────

  _buildRoom(root) {
    const add = e => root.appendChild(e);

    // Floor
    add(this._plane(10, 8, '#1a1614', 0, 0.002, 0, -90, 'tex-forge-floor', 5, 4));
    // Ceiling
    add(this._plane(10.6, 8.6, '#120c06', 0, 5.0, 0, 90, 'tex-forge-beam', 4, 3));
    // Crossbeams along X
    for (const z of [-2.5, 0.5, 3.0]) {
      add(this._box(10.4, 0.28, 0.28, '#2a1808', 0, 4.86, z, 'tex-forge-beam', 5, 1));
    }
    // Ridge beam along Z
    add(this._box(0.28, 0.28, 8.4, '#2a1808', 0, 4.86, 0, 'tex-forge-beam', 1, 4));

    // North wall
    add(this._box(10, 5, 0.28, '#2a2220', 0, 2.5, -4.14, 'tex-forge-stone', 4, 2));
    // West wall
    add(this._box(0.28, 5, 8, '#2a2220', -5.14, 2.5, 0, 'tex-forge-stone', 3, 2));
    // East wall
    add(this._box(0.28, 5, 8, '#2a2220', 5.14, 2.5, 0, 'tex-forge-stone', 3, 2));
    // South wall left
    add(this._box(4.3, 5, 0.28, '#2a2220', -2.85, 2.5, 4.14, 'tex-forge-stone', 1.7, 2));
    // South wall right
    add(this._box(4.3, 5, 0.28, '#2a2220', 2.85, 2.5, 4.14, 'tex-forge-stone', 1.7, 2));
    // Door arch beam (above 2.2m door opening)
    add(this._box(1.3, 2.8, 0.28, '#2a2220', 0, 3.9, 4.14, 'tex-forge-stone', 0.5, 1.1));
    // Door frame posts
    add(this._box(0.14, 5, 0.22, '#2a1808', -0.72, 2.5, 4.14, 'tex-forge-beam', 1, 2.5));
    add(this._box(0.14, 5, 0.22, '#2a1808', 0.72, 2.5, 4.14, 'tex-forge-beam', 1, 2.5));

    this._buildForge(root);
    this._buildAnvil(root);
    this._buildTools(root);
    this._buildWeapons(root);
    this._buildExtras(root);
    this._buildTorches(root);
  },

  // ── forge (Esse) ──────────────────────────────────────────────────────────

  _buildForge(root) {
    const add = e => root.appendChild(e);

    // Stone base block
    add(this._box(3.2, 0.65, 1.05, '#3a3028', 0, 0.325, -3.625, 'tex-forge-stone', 1.2, 0.25));
    // Left pillar
    add(this._box(0.68, 1.55, 0.95, '#3a3028', -1.32, 1.05, -3.625, 'tex-forge-stone', 0.25, 0.6));
    // Right pillar
    add(this._box(0.68, 1.55, 0.95, '#3a3028', 1.32, 1.05, -3.625, 'tex-forge-stone', 0.25, 0.6));
    // Fire chamber (dark)
    add(this._box(1.56, 1.02, 0.85, '#0e0806', 0, 1.18, -3.625));
    // Hood / Haube
    add(this._box(2.9, 3.1, 0.60, '#484038', 0, 3.25, -3.84, 'tex-forge-stone', 1.0, 1.2));
    // Chimney
    add(this._box(0.92, 1.5, 0.48, '#2a2018', 0, 4.50, -3.80, 'tex-forge-stone', 0.3, 0.6));

    // Grate embers
    add(this._emissiveBox(1.32, 0.10, 0.52, '#cc2200', '#ff4400', 2.2, 0, 0.70, -3.60));
    // Lower flames
    add(this._emissiveBox(1.00, 0.56, 0.40, '#ee5500', '#ff2200', 2.5, 0, 1.00, -3.62, 0.88));
    // Mid flames
    add(this._emissiveBox(0.66, 0.44, 0.30, '#ff8800', '#ff5500', 3.0, 0, 1.40, -3.64, 0.75));
    // Flame tip
    add(this._emissiveSph(0.22, '#ffcc00', '#ffaa00', 3.5, 0, 1.72, -3.64, 0.55));

    // Forge point light
    const light = document.createElement('a-entity');
    light.setAttribute('position', '0 1.8 -2.2');
    light.setAttribute('light', 'type:point;color:#ff5522;intensity:2.0;distance:12');
    root.appendChild(light);

    // Bellows body
    add(this._box(0.34, 0.62, 0.55, '#3a2818', -1.10, 1.00, -3.40));
    // Bellows handle
    add(this._box(0.12, 0.12, 0.62, '#2a1808', -1.10, 0.65, -3.15));
    // Bellows nozzle
    add(this._box(0.10, 0.10, 0.42, '#282828', -1.10, 1.00, -3.82));

    // Coal pile
    add(this._box(0.72, 0.20, 0.52, '#1a1810', -2.20, 0.10, -2.95));
    add(this._box(0.46, 0.15, 0.34, '#141410', -2.32, 0.25, -2.88));

    // 4 chain links hanging from chimney
    for (let i = 0; i < 4; i++) {
      add(this._box(0.05, 0.22, 0.05, '#2a2828', 0.5, 4.18 - i * 0.24, -3.65));
    }
    // Hook at chain bottom
    add(this._box(0.20, 0.05, 0.05, '#303030', 0.5, 3.46, -3.65));
  },

  // ── anvil (Amboss) ────────────────────────────────────────────────────────

  _buildAnvil(root) {
    const add = e => root.appendChild(e);
    const ax = 0, az = -1.5;

    // Wood stand
    add(this._box(0.56, 0.88, 0.56, '#3a2510', ax, 0.44, az, 'tex-forge-beam', 0.5, 0.4));
    // Anvil lower body
    add(this._box(0.62, 0.10, 0.30, '#242424', ax, 0.88, az));
    // Anvil main block
    add(this._box(0.54, 0.18, 0.28, '#282828', ax, 0.97, az));
    // Anvil horn (Bahn)
    add(this._box(0.26, 0.10, 0.13, '#282828', ax + 0.42, 0.93, az));
    // Anvil top face
    add(this._box(0.54, 0.036, 0.28, '#343434', ax, 1.061, az));
    // Hardy hole
    add(this._box(0.06, 0.037, 0.06, '#0a0a0a', ax + 0.14, 1.062, az));
    // Half-forged blade on anvil
    add(this._box(0.44, 0.04, 0.07, '#382820', ax - 0.04, 1.10, az));

    // Quench barrel (right of anvil)
    add(this._cyl(0.34, 0.74, '#3a2810', 1.82, 0.37, az));
    add(this._cyl(0.32, 0.04, '#2a5870', 1.82, 0.75, az));
    // Barrel hoops
    add(this._cyl(0.35, 0.04, '#1c1410', 1.82, 0.12, az));
    add(this._cyl(0.35, 0.04, '#1c1410', 1.82, 0.42, az));
    add(this._cyl(0.35, 0.04, '#1c1410', 1.82, 0.65, az));
  },

  // ── tools (west wall) ─────────────────────────────────────────────────────

  _buildTools(root) {
    const add = e => root.appendChild(e);

    // Rack bars
    add(this._box(0.10, 0.08, 3.2, '#2a1808', -4.94, 1.90, -0.4, 'tex-forge-beam', 0.1, 1.6));
    add(this._box(0.10, 0.08, 3.2, '#2a1808', -4.94, 1.32, -0.4));

    // Hooks on top bar
    for (const z of [-1.6, -0.8, 0.0, 0.8]) {
      add(this._box(0.18, 0.05, 0.05, '#282828', -4.88, 1.90, z));
    }
    // Hooks on mid bar
    for (const z of [-1.6, -0.8, 0.0, 0.8]) {
      add(this._box(0.18, 0.05, 0.05, '#282828', -4.88, 1.32, z));
    }

    // Sledgehammer 1
    add(this._box(0.06, 0.06, 0.75, '#4a2c10', -4.88, 1.42, -1.6));
    add(this._box(0.20, 0.24, 0.14, '#282828', -4.88, 1.84, -1.52));

    // Hammer 2 (smaller)
    add(this._box(0.05, 0.05, 0.58, '#3a2410', -4.88, 1.38, 0.0));
    add(this._box(0.15, 0.19, 0.11, '#282828', -4.88, 1.78, 0.06));

    // Tongs 1
    add(this._box(0.04, 0.04, 0.58, '#2a2828', -4.86, 1.56, 0.75));
    add(this._box(0.04, 0.04, 0.58, '#2a2828', -4.88, 1.63, 0.88));
    add(this._box(0.08, 0.08, 0.06, '#282828', -4.87, 1.60, 0.47));

    // Tongs 2
    add(this._box(0.04, 0.04, 0.58, '#2a2828', -4.86, 1.54, -0.8));
    add(this._box(0.04, 0.04, 0.58, '#2a2828', -4.88, 1.60, -0.68));

    // Chisel
    add(this._box(0.04, 0.04, 0.42, '#3a3030', -4.88, 1.42, -2.4));
    add(this._box(0.08, 0.06, 0.10, '#303030', -4.88, 1.43, -2.65));

    // Coal shovel
    add(this._box(0.05, 0.05, 0.68, '#3a2010', -4.88, 1.40, -1.0));
    add(this._box(0.24, 0.04, 0.26, '#282828', -4.88, 1.41, -1.38));

    // Heavy pry bar leaning
    add(this._box(0.05, 1.55, 0.05, '#222022', -4.90, 0.78, 2.0));

    // Small anvil-block on floor
    add(this._box(0.40, 0.52, 0.40, '#282828', -4.72, 0.26, 2.8));
  },

  // ── weapons (east wall) ───────────────────────────────────────────────────

  _buildWeapons(root) {
    const add = e => root.appendChild(e);

    // Rack bars
    add(this._box(0.10, 0.08, 3.8, '#2a1808', 4.94, 2.25, 0.0, 'tex-forge-beam', 0.1, 1.9));
    add(this._box(0.10, 0.08, 3.8, '#2a1808', 4.94, 1.30, 0.0));

    // Pegs
    for (const z of [-1.4, -0.4, 0.6, 1.5]) {
      add(this._box(0.22, 0.06, 0.06, '#2a2020', 4.84, 2.25, z));
      add(this._box(0.22, 0.06, 0.06, '#2a2020', 4.84, 1.30, z));
    }

    // Sword 1 (vertical, z=-1.4)
    add(this._box(0.06, 1.08, 0.026, '#505060', 4.86, 2.12, -1.4));
    add(this._box(0.48, 0.065, 0.065, '#3a3830', 4.86, 1.56, -1.4));
    add(this._box(0.065, 0.36, 0.055, '#4a3020', 4.86, 1.30, -1.4));
    add(this._sph(0.075, '#383828', 4.86, 1.09, -1.4));

    // Sword 2 (shorter, z=-0.4)
    add(this._box(0.055, 0.88, 0.024, '#484858', 4.87, 2.00, -0.4));
    add(this._box(0.40, 0.055, 0.055, '#383830', 4.87, 1.54, -0.4));
    add(this._box(0.055, 0.28, 0.048, '#3a2818', 4.87, 1.38, -0.4));
    add(this._sph(0.065, '#302820', 4.87, 1.21, -0.4));

    // Shield (z=0.6)
    add(this._box(0.09, 0.92, 0.82, '#5a4830', 4.90, 1.82, 0.6));
    add(this._emissiveSph(0.10, '#484838', '#505040', 0.2, 4.84, 1.82, 0.6));
    add(this._box(0.09, 0.09, 0.82, '#3a3028', 4.90, 2.32, 0.6));
    add(this._box(0.09, 0.09, 0.82, '#3a3028', 4.90, 1.32, 0.6));
    add(this._box(0.09, 0.92, 0.09, '#3a3028', 4.90, 1.82, 1.04));
    add(this._box(0.09, 0.92, 0.09, '#3a3028', 4.90, 1.82, 0.16));

    // Helmet (z=1.5)
    add(this._emissiveSph(0.21, '#484838', '#404030', 0.15, 4.84, 1.92, 1.5));
    add(this._box(0.04, 0.22, 0.028, '#404038', 4.84, 1.78, 1.62));
    add(this._box(0.07, 0.07, 0.54, '#3a3830', 4.84, 1.68, 1.5));
    add(this._box(0.54, 0.07, 0.07, '#3a3830', 4.84, 1.68, 1.5));

    // Breastplate
    add(this._box(0.09, 0.52, 0.32, '#4a4840', 4.90, 1.76, -2.58));
    add(this._box(0.09, 0.52, 0.32, '#4a4840', 4.90, 1.76, -3.18));
    add(this._box(0.09, 0.14, 0.58, '#3a3830', 4.90, 2.08, -2.88));
    add(this._box(0.07, 0.09, 0.60, '#3a2010', 4.90, 1.44, -2.88));
  },

  // ── torches (east & west wall) ────────────────────────────────────────────

  _buildTorches(root) {
    const add = e => root.appendChild(e);
    const y = 1.8;
    const data = [
      { x: -4.5, z: -1.0, side: 'west' },
      { x: -4.5, z: -3.0, side: 'west' },
      { x:  4.5, z: -1.0, side: 'east' },
      { x:  4.5, z: -3.0, side: 'east' },
    ];

    for (const t of data) {
      const stemX  = t.side === 'west' ? t.x + 0.30 : t.x - 0.30;
      const stemZ  = t.side === 'west' ? -65 : 65;
      const stemY  = y + 0.04;
      const tipY   = stemY + 0.14; // cylinder center + half height

      // Halterung (an der Wand, zwischen Fackel und Wand)
      const bracketX = t.side === 'west' ? -4.88 : 4.88;
      add(this._box(0.08, 0.08, 0.22, '#3a2010', bracketX, y, t.z));

      // Stiel
      const stem = document.createElement('a-cylinder');
      stem.setAttribute('radius', '0.028');
      stem.setAttribute('height', '0.28');
      stem.setAttribute('segments-radial', '6');
      stem.setAttribute('position', `${stemX} ${stemY} ${t.z}`);
      stem.setAttribute('rotation', `0 0 ${stemZ}`);
      stem.setAttribute('material', 'color:#4a3018;shader:flat');
      root.appendChild(stem);

      // Brennendes Ende (Glut)
      add(this._emissiveBox(0.06, 0.06, 0.06, '#cc3300', '#ff5500', 1.8, stemX, tipY, t.z));

      // Flamme (untere)
      add(this._emissiveBox(0.05, 0.10, 0.05, '#ff6600', '#ff3300', 2.2, stemX, tipY + 0.08, t.z, 0.88));

      // Flammenspitze
      add(this._emissiveSph(0.030, '#ffdd00', '#ffaa00', 3.0, stemX, tipY + 0.16, t.z, 0.75));

      // Punktlicht pro Fackel
      const light = document.createElement('a-entity');
      light.setAttribute('position', `${stemX} ${tipY + 0.16} ${t.z}`);
      light.setAttribute('light', 'type:point;color:#ff8833;intensity:0.8;distance:6');
      root.appendChild(light);
    }
  },

  // ── extras ────────────────────────────────────────────────────────────────

  _buildExtras(root) {
    const add = e => root.appendChild(e);

    // Wall torch – West
    add(this._box(0.24, 0.07, 0.07, '#2a1808', -5.08, 2.65, 0.0));
    add(this._cyl(0.04, 0.24, '#3a2818', -5.08, 2.78, 0.0));
    add(this._emissiveSph(0.06, '#ffcc44', '#ff8800', 3.0, -5.08, 2.91, 0.0, 0.8));

    // Wall torch – East
    add(this._box(0.24, 0.07, 0.07, '#2a1808', 5.08, 2.65, 0.0));
    add(this._cyl(0.04, 0.24, '#3a2818', 5.08, 2.78, 0.0));
    add(this._emissiveSph(0.06, '#ffcc44', '#ff8800', 3.0, 5.08, 2.91, 0.0, 0.8));

    // Horseshoe above door entry
    add(this._box(0.05, 0.30, 0.05, '#282828', 4.38, 1.94, 3.50));
    add(this._box(0.05, 0.30, 0.05, '#282828', 4.58, 1.94, 3.50));
    add(this._box(0.25, 0.05, 0.05, '#282828', 4.48, 2.08, 3.50));

    // Forge floor channel (soot runoff)
    add(this._box(2.0, 0.06, 0.18, '#1a1410', 0, 0.001, -3.05));

    // Raised forge step
    add(this._box(2.0, 0.14, 0.65, '#302820', 0, 0.07, -3.52, 'tex-forge-stone', 0.8, 0.06));

    // Finished sword leaning at south wall
    add(this._box(0.055, 1.12, 0.026, '#606070', 3.52, 0.58, 3.68));
    add(this._box(0.44, 0.06, 0.055, '#3a3830', 3.52, 0.54, 3.44));

    // Secondary fill light (warm, near center ceiling)
    const fillLight = document.createElement('a-entity');
    fillLight.setAttribute('position', '0 3.5 0');
    fillLight.setAttribute('light', 'type:point;color:#ff8844;intensity:0.35;distance:8');
    root.appendChild(fillLight);
  },
});
