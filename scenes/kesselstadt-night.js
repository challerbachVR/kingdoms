// ═══════════════════════════════════════════════════════════════════════════
// KESSELSTADT – NACHT-MODUS  (scenes/kesselstadt-night.js)
// Setzt Nacht-Tageszeit, blendet tagsüber-NPCs aus, spawnt 3 Nachtwachen.
// ═══════════════════════════════════════════════════════════════════════════

AFRAME.registerComponent('kesselstadt-night', {

  init() {
    this._guards = [];
    this._cam    = null;
    this._camWP  = new THREE.Vector3();

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._setup();
    else sc.addEventListener('loaded', () => this._setup(), { once: true });
  },

  /* ── Szene auf Nacht umschalten ──────────────────────────────────────── */
  _setup() {
    this._cam = document.getElementById('camera');
    this.el.setAttribute('daynight', 'mode:night');
    this._hideNPCs();
    this._buildGuards();
  },

  /* ── Alle Tages-NPCs / Tiere / Vögel ausblenden ─────────────────────── */
  _hideNPCs() {
    const clEl = document.getElementById('city-life-root');
    const cl   = clEl && clEl.components['city-life'];
    if (!cl || !cl._built) { setTimeout(() => this._hideNPCs(), 100); return; }

    cl._npcs.forEach(n => { n.root.object3D.visible = false; });

    cl._anim.forEach(a => {
      if (a.special) {
        // dog-special sitzt nachts vor dem Gasthaus und bewacht den Eingang
        a.root.object3D.position.set(-9, 0, 12.5);
        a.root.object3D.rotation.y = Math.PI;   // blickt zur Gasthaus-Tür
        a.wps    = [[-9, 12.5]];
        a.wpIdx  = 0;
        a.wait   = 9999;                         // sitzt für die Session still
      } else {
        a.root.object3D.visible = false;
      }
    });

    cl._birds.forEach(b => { b.root.object3D.visible = false; });
  },

  /* ── Mesh-Hilfsfunktionen ────────────────────────────────────────────── */
  _b(w, h, d, col, px, py, pz) {
    const e = document.createElement('a-box');
    e.setAttribute('width', w); e.setAttribute('height', h); e.setAttribute('depth', d);
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    return e;
  },
  _s(r, col, px, py, pz) {
    const e = document.createElement('a-sphere');
    e.setAttribute('radius', r);
    e.setAttribute('segments-width', '8'); e.setAttribute('segments-height', '6');
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    return e;
  },
  _c(r, h, col, px, py, pz) {
    const e = document.createElement('a-cylinder');
    e.setAttribute('radius', r); e.setAttribute('height', h);
    e.setAttribute('segments-radial', '8');
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    return e;
  },

  /* ── Drei Nachtwachen aufbauen ───────────────────────────────────────── */
  _buildGuards() {
    // Patrol-Routen aus den bereits in npcs.js validierten Wegpunkten
    const DEFS = [
      { x:  4, z:  4, ry:   0, wps: [[ 4,  4], [-4,  4], [-4, -4], [ 4, -4]] }, // Marktplatz
      { x:  2, z:-14, ry: 180, wps: [[ 2,-14], [-2,-14], [ 0,-20]]            }, // Nordstraße
      { x: 14, z:  2, ry: 270, wps: [[14,  2], [14, -2], [ 5, -5], [ 5,  5]]  }, // Ostseite
    ];
    DEFS.forEach(def => {
      const root = this._buildGuardFigure(def);
      const { panelEl, panelTxt } = this._buildGuardPanel();
      const { armL, armR } = root._arms;
      this._guards.push({
        root, panelEl, panelTxt, armL, armR,
        wps:   def.wps,
        wpIdx: 0,
        angle: def.ry * Math.PI / 180,
        speed: 0.80 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        wait:  Math.random() * 2.5,
        radius: 0.28,
        stuck:  0,
        warned: false,
        dialogActive: false,
        dialogAt: 0,
      });
    });
  },

  /* ── Wachen-Figur (dunkle Rüstung + Laterne) ────────────────────────── */
  _buildGuardFigure(def) {
    const ARMOR = '#2a3040';
    const DARK  = '#1a2030';
    const METAL = '#484858';
    const SKIN  = '#e8b882';
    const TRIM  = '#c8a820';
    const BOOT  = '#0a0a0e';

    const root = document.createElement('a-entity');
    root.setAttribute('position', `${def.x} 0 ${def.z}`);
    root.setAttribute('rotation', `0 ${def.ry} 0`);

    // Stiefel
    root.appendChild(this._b(0.110, 0.055, 0.155, BOOT,  0.082, 0.028,  0.016));
    root.appendChild(this._b(0.110, 0.055, 0.155, BOOT, -0.082, 0.028,  0.016));

    // Bein-Rüstung
    root.appendChild(this._c(0.058, 0.44, ARMOR,  0.082, 0.22, 0));
    root.appendChild(this._c(0.058, 0.44, ARMOR, -0.082, 0.22, 0));
    // Knieschützer (gold)
    root.appendChild(this._b(0.092, 0.062, 0.090, TRIM,  0.082, 0.38, 0.042));
    root.appendChild(this._b(0.092, 0.062, 0.090, TRIM, -0.082, 0.38, 0.042));

    // Hüfte + Gürtel
    root.appendChild(this._b(0.30, 0.12, 0.21, ARMOR, 0, 0.50, 0));
    root.appendChild(this._b(0.34, 0.046, 0.23, TRIM,  0, 0.565, 0));

    // Torso-Rüstung
    root.appendChild(this._b(0.32, 0.36, 0.22, ARMOR, 0, 0.75, 0));
    // Mittelstreifen (gold)
    root.appendChild(this._b(0.060, 0.34, 0.013, TRIM, 0, 0.75, 0.112));

    // Schultern (breit, Metallfarbe)
    root.appendChild(this._b(0.46, 0.09, 0.24, METAL, 0, 0.93, 0));
    // Schulterpatten (gold)
    root.appendChild(this._b(0.10, 0.08, 0.10, TRIM,  0.225, 0.965, 0));
    root.appendChild(this._b(0.10, 0.08, 0.10, TRIM, -0.225, 0.965, 0));

    // Arme (Schulter-Pivot)
    const makeArm = (side, withLantern) => {
      const piv = document.createElement('a-entity');
      piv.setAttribute('position', `${side * 0.215} 0.93 0`);
      piv.appendChild(this._c(0.055, 0.38, ARMOR, 0, -0.19, 0)); // Oberarm
      piv.appendChild(this._c(0.046, 0.24, METAL, 0, -0.43, 0)); // Unterarm
      piv.appendChild(this._s(0.062, SKIN,  0, -0.59, 0));        // Hand
      if (withLantern) {
        const anchor = document.createElement('a-entity');
        anchor.setAttribute('position', '0 -0.69 0');
        // Laternenstab
        anchor.appendChild(this._c(0.013, 0.10, '#4a3a1a', 0,  0.05, 0));
        // Laternenkörper (emissiv)
        const body = this._b(0.074, 0.094, 0.074, '#c8a840', 0, -0.04, 0);
        body.setAttribute('material',
          'color:#c8a840;emissive:#ffaa22;emissiveIntensity:0.65;shader:flat');
        anchor.appendChild(body);
        // Lichtschein (Kern)
        const glow = document.createElement('a-sphere');
        glow.setAttribute('radius', '0.030');
        glow.setAttribute('position', '0 -0.04 0');
        glow.setAttribute('segments-width', '6');
        glow.setAttribute('segments-height', '4');
        glow.setAttribute('material',
          'color:#ffee88;emissive:#ffcc44;emissiveIntensity:2.5;shader:flat');
        anchor.appendChild(glow);
        piv.appendChild(anchor);
      }
      return piv;
    };
    const armL = makeArm(-1, false);
    const armR = makeArm( 1, true);
    root.appendChild(armL);
    root.appendChild(armR);

    // Hals
    root.appendChild(this._c(0.054, 0.11, SKIN, 0, 1.045, 0));
    // Halsschutz (Gorget)
    root.appendChild(this._c(0.072, 0.065, ARMOR, 0, 1.010, 0));

    // Kopf (unter Helm)
    root.appendChild(this._s(0.148, SKIN, 0, 1.225, 0));

    // ── Helm ──────────────────────────────────────────────────────────
    // Krempe
    root.appendChild(this._c(0.172, 0.052, METAL, 0, 1.385, 0));
    // Kalotte (Helm-Körper)
    root.appendChild(this._c(0.122, 0.215, ARMOR, 0, 1.495, 0));
    // Nasenschutz
    root.appendChild(this._b(0.046, 0.250, 0.046, ARMOR, 0, 1.448, 0.114));
    // Kamm (gold)
    root.appendChild(this._b(0.040, 0.058, 0.224, TRIM, 0, 1.618, 0.008));
    // Visier-Schlitze
    root.appendChild(this._b(0.054, 0.018, 0.012, DARK, -0.052, 1.258, 0.130));
    root.appendChild(this._b(0.054, 0.018, 0.012, DARK,  0.052, 1.258, 0.130));

    root._arms = { armL, armR };   // für Arm-Swing in tick zugänglich
    this.el.sceneEl.appendChild(root);
    return root;
  },

  /* ── Dialog-Panel für eine Wache ────────────────────────────────────── */
  _buildGuardPanel() {
    const panel = document.createElement('a-entity');
    panel.setAttribute('position', '0 -200 0');
    panel.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width', '2.40');
    frame.setAttribute('height', '0.46');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#2a3a50;emissive:#1a2a40;emissiveIntensity:0.4;shader:flat;' +
      'transparent:true;opacity:0.92');
    panel.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width', '2.34');
    bg.setAttribute('height', '0.40');
    bg.setAttribute('material',
      'color:#080e1c;shader:flat;transparent:true;opacity:0.96');
    panel.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('align', 'center');
    txt.setAttribute('color', '#c8d8e8');
    txt.setAttribute('width', '2.10');
    txt.setAttribute('position', '0 0 0.005');
    panel.appendChild(txt);

    this.el.sceneEl.appendChild(panel);
    return { panelEl: panel, panelTxt: txt };
  },

  /* ── Tick ────────────────────────────────────────────────────────────── */
  tick(t, dt) {
    if (!this._cam || dt > 200) return;
    this._cam.object3D.getWorldPosition(this._camWP);
    const s = Math.min(dt, 50) * 0.001;
    this._guards.forEach(g => this._tickGuard(g, t, s));
  },

  _tickGuard(g, t, s) {
    const p  = g.root.object3D.position;
    const dx = this._camWP.x - p.x;
    const dz = this._camWP.z - p.z;
    const d2 = dx * dx + dz * dz;

    // ── Aktiver Dialog ──────────────────────────────────────────────────
    if (g.dialogActive) {
      // Panel kamera-zugewandt
      g.panelEl.object3D.position.set(p.x, 2.0, p.z);
      g.panelEl.object3D.rotation.y = Math.atan2(dx, dz);
      // Wache dreht sich zum Spieler
      g.root.object3D.rotation.y = Math.atan2(dx, dz);
      if (t - g.dialogAt >= 4000) {
        g.dialogActive = false;
        g.panelEl.setAttribute('visible', 'false');
      }
      return;
    }

    // ── Spieler nähert sich < 3m ──────────────────────────────────────
    if (d2 < 9) {
      const msg = g.warned
        ? 'Hab ich mich nicht klar ausgedrückt?'
        : 'Ins Gasthaus oder nach Hause –\naber nicht auf der Straße!';
      g.warned      = true;
      g.dialogActive = true;
      g.dialogAt     = t;
      g.panelTxt.setAttribute('value', msg);
      g.panelEl.setAttribute('visible', 'true');
      return;
    }

    // ── Wartepause ───────────────────────────────────────────────────
    if (g.wait > 0) {
      g.wait -= s;
      if (g.armL.object3D) {
        g.armL.object3D.rotation.x *= 0.88;
        g.armR.object3D.rotation.x *= 0.88;
      }
      return;
    }

    // ── Patrol-Bewegung ──────────────────────────────────────────────
    const [tx, tz] = g.wps[g.wpIdx];
    const pdx = tx - p.x, pdz = tz - p.z;
    const pd  = Math.sqrt(pdx * pdx + pdz * pdz);

    if (pd < 0.3) {
      g.wpIdx = (g.wpIdx + 1) % g.wps.length;
      g.wait  = 1.2 + Math.random() * 2.5;
      g.stuck = 0;
      return;
    }

    const spd  = g.speed * s;
    const move = this._tryStep(g, tx, tz, spd);
    p.y = 0;

    if (!move.moved) { g.stuck += s; } else { g.stuck = 0; }
    if (g.stuck > 0.6) {
      g.wpIdx = (g.wpIdx + 1) % g.wps.length;
      g.stuck = 0;
      g.wait  = 0.2 + Math.random() * 0.3;
      return;
    }

    // Arm-Schwingen
    if (g.armL.object3D) {
      const swing = Math.sin(t * 0.011 * g.speed + g.phase) * 0.42;
      g.armL.object3D.rotation.x =  swing;
      g.armR.object3D.rotation.x = -swing;
    }

    const ta = move.moved ? move.heading : Math.atan2(pdx, pdz);
    let da   = ta - g.angle;
    if (da >  Math.PI) da -= Math.PI * 2;
    if (da < -Math.PI) da += Math.PI * 2;
    g.angle += da * Math.min(1, s * 6);
    g.root.object3D.rotation.y = g.angle;
  },

  /* ── Kollisions-Logik (analog npcs.js, referenziert globale Konstanten) */
  _tryStep(agent, tx, tz, step) {
    const p      = agent.root.object3D.position;
    const radius = agent.radius || 0.28;
    const dx = tx - p.x, dz = tz - p.z;
    const d  = Math.sqrt(dx * dx + dz * dz);
    if (d < 1e-4) return { moved: false, heading: agent.angle };

    const base    = Math.atan2(dx, dz);
    const offsets = [0, 0.55, -0.55, 1.05, -1.05, 1.55, -1.55, Math.PI];
    let best = null;

    for (const off of offsets) {
      const ang = base + off;
      const nx  = p.x + Math.sin(ang) * step;
      const nz  = p.z + Math.cos(ang) * step;
      if (this._isBlocked(nx, nz, radius)) continue;
      const score = Math.hypot(tx - nx, tz - nz) + Math.abs(off) * 0.35;
      if (!best || score < best.score) best = { nx, nz, heading: ang, score };
      if (off === 0) break;
    }

    if (!best) return { moved: false, heading: base };
    p.x = best.nx; p.z = best.nz;
    return { moved: true, heading: best.heading };
  },

  _isBlocked(x, z, radius) {
    for (const c of CITY_COLLISION_CIRCLES) {
      const dx = x - c.cx, dz = z - c.cz;
      if (dx * dx + dz * dz < (radius + c.r) ** 2) return true;
    }
    for (const b of CITY_COLLISION_BOXES) {
      if (x > b.x0 - radius && x < b.x1 + radius &&
          z > b.z0 - radius && z < b.z1 + radius) return true;
    }
    return false;
  },

  remove() {
    this._guards.forEach(g => {
      if (g.root    && g.root.parentNode)    g.root.parentNode.removeChild(g.root);
      if (g.panelEl && g.panelEl.parentNode) g.panelEl.parentNode.removeChild(g.panelEl);
    });
  },
});
