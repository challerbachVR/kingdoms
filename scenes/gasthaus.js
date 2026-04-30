// ═══════════════════════════════════════════════════════════════════════════
// GASTHAUS – Innenraum  (scenes/gasthaus.js)
// Fügt architektonischen Inhalt in #gasthaus-interior ein.
// Koordinatenursprung = Spieler-Startpunkt (= Weltpos -9 0 8).
//   Local  z =  2.5  → Südwand / Tür (Exit-Trigger bei z ≈ 2.0)
//   Local  z = -5.5  → Nordwand / Feuerstelle
//   Local  x = -6.0  → Westwand / Theke
//   Local  x =  6.0  → Ostwand
// ═══════════════════════════════════════════════════════════════════════════

AFRAME.registerComponent('gasthaus-scene', {

  init() {
    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });
  },

  _build() {
    const interior = document.getElementById('gasthaus-interior');
    if (!interior) { setTimeout(() => this._build(), 100); return; }
    this._initTextures();
    this._buildRoom(interior);
  },

  /* ── Prozedurale Canvas-Texturen ─────────────────────────────────────── */
  _initTextures() {
    const make = (id, w, h, fn) => {
      if (document.getElementById(id)) return;
      const c = document.createElement('canvas');
      c.id = id; c.width = w; c.height = h; c.style.display = 'none';
      document.body.appendChild(c);
      fn(c.getContext('2d'), w, h);
    };

    // Dielen-Boden: dunkle Holzplanken mit Maserung
    make('tex-inn-planks', 512, 256, (ctx, W, H) => {
      ctx.fillStyle = '#5a3618';
      ctx.fillRect(0, 0, W, H);
      const pH = 38;
      for (let y = 0; y < H; y += pH) {
        const lum = 0.08 + Math.random() * 0.06;
        ctx.fillStyle = `rgba(${Math.floor(255*lum+40)},${Math.floor(255*lum+10)},0,0.20)`;
        ctx.fillRect(0, y, W, pH - 2);
        for (let i = 0; i < 14; i++) {
          const gx = Math.random() * W;
          ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.12})`;
          ctx.lineWidth = 0.5 + Math.random() * 1.2;
          ctx.beginPath();
          ctx.moveTo(gx, y);
          ctx.lineTo(gx + (Math.random() - 0.5) * 20, y + pH);
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.32)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, y + pH - 1); ctx.lineTo(W, y + pH - 1); ctx.stroke();
        const seam = 60 + Math.random() * (W - 120);
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(seam, y); ctx.lineTo(seam, y + pH); ctx.stroke();
      }
    });

    // Innenputz-Stein: warmes Graubraun mit Fugen
    make('tex-inn-stone', 256, 256, (ctx, W, H) => {
      ctx.fillStyle = '#241a0e';
      ctx.fillRect(0, 0, W, H);
      const bW = 68, bH = 34;
      for (let row = 0; row * bH < H + bH; row++) {
        const xOff = (row % 2) * (bW * 0.5);
        for (let col = -1; col * bW < W + bW; col++) {
          const bx = col * bW + xOff;
          const by = row * bH;
          const t = 142 + Math.random() * 30;
          ctx.fillStyle = `rgb(${t},${t - 14},${t - 24})`;
          ctx.fillRect(bx + 2, by + 2, bW - 4, bH - 4);
          for (let k = 0; k < 4; k++) {
            ctx.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.06})`;
            ctx.fillRect(bx + 4 + Math.random() * 40, by + 4 + Math.random() * 16,
              6 + Math.random() * 14, 3 + Math.random() * 8);
          }
        }
      }
    });

    // Holzbalken: dunkle Eiche, Längsmaserung
    make('tex-inn-beam', 128, 256, (ctx, W, H) => {
      ctx.fillStyle = '#38200c';
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 22; i++) {
        const x = Math.random() * W;
        ctx.strokeStyle = `rgba(0,0,0,${0.10 + Math.random() * 0.20})`;
        ctx.lineWidth = 0.6 + Math.random() * 1.6;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (Math.random() - 0.5) * 8, H);
        ctx.stroke();
      }
      const g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, 'rgba(255,255,255,0.04)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.10)');
      g.addColorStop(1, 'rgba(255,255,255,0.04)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
  },

  /* ── Mesh-Hilfsmethoden ──────────────────────────────────────────────── */
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
    e.setAttribute('segments-width', '8'); e.setAttribute('segments-height', '5');
    e.setAttribute('position', `${px} ${py} ${pz}`);
    let mat = `color:${col};emissive:${emiCol};emissiveIntensity:${emi};shader:flat`;
    if (transp) mat += `;transparent:true;opacity:${transp}`;
    e.setAttribute('material', mat);
    return e;
  },

  _sph(r, col, px, py, pz) {
    const e = document.createElement('a-sphere');
    e.setAttribute('radius', r);
    e.setAttribute('segments-width', '8'); e.setAttribute('segments-height', '5');
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    return e;
  },

  /* ── NPC-Figur (statisch) ────────────────────────────────────────────── */
  // cfg: { cloth, skin, hair, legs, apron?, seated?, cloak?, hood? }
  _figure(root, x, z, rotY, cfg) {
    const { cloth, skin, hair, legs, apron, seated, cloak, hood } = cfg;
    const e    = document.createElement('a-entity');
    e.setAttribute('position', `${x} 0 ${z}`);
    e.setAttribute('rotation', `0 ${rotY} 0`);
    const add  = c => e.appendChild(c);
    const BOOT = '#2c1a0a';
    const BELT = '#5a3a10';
    const BODY = cloak || cloth;

    if (seated) {
      // Schuhe (Füße leicht nach vorne gestreckt)
      add(this._box(0.110, 0.055, 0.155, BOOT,  0.082, 0.028, 0.24));
      add(this._box(0.110, 0.055, 0.155, BOOT, -0.082, 0.028, 0.24));
      // Unterschenkel (hängend)
      add(this._cyl(0.052, 0.40, legs,  0.082, 0.20, 0.18));
      add(this._cyl(0.052, 0.40, legs, -0.082, 0.20, 0.18));
      // Oberschenkel (horizontal auf Sitzbank)
      add(this._box(0.12, 0.10, 0.36, legs,  0.082, 0.43, 0.06));
      add(this._box(0.12, 0.10, 0.36, legs, -0.082, 0.43, 0.06));
    } else {
      add(this._box(0.110, 0.055, 0.155, BOOT,  0.082, 0.028, 0.016));
      add(this._box(0.110, 0.055, 0.155, BOOT, -0.082, 0.028, 0.016));
      add(this._cyl(0.058, 0.44, legs,  0.082, 0.22, 0));
      add(this._cyl(0.058, 0.44, legs, -0.082, 0.22, 0));
    }

    // Hüfte + Gürtel
    add(this._box(0.30, 0.12, 0.21, BODY, 0, 0.50, 0));
    if (!cloak) add(this._box(0.34, 0.046, 0.23, BELT, 0, 0.565, 0));

    // Torso (Umhang: breiter/tiefer)
    const tw = cloak ? 0.38 : 0.32;
    const td = cloak ? 0.26 : 0.22;
    add(this._box(tw, 0.36, td, BODY, 0, 0.75, 0));
    if (apron) add(this._box(0.24, 0.38, 0.012, apron, 0, 0.67, 0.116));

    // Schultern
    add(this._box(0.42, 0.09, 0.23, BODY, 0, 0.93, 0));

    // Arme (Oberarm, Unterarm)
    add(this._cyl(0.052, 0.38, BODY,  0.215, 0.74, 0));
    add(this._cyl(0.052, 0.38, BODY, -0.215, 0.74, 0));
    add(this._cyl(0.044, 0.24, skin,  0.215, 0.50, 0));
    add(this._cyl(0.044, 0.24, skin, -0.215, 0.50, 0));

    // Hals
    add(this._cyl(0.054, 0.11, skin, 0, 1.045, 0));

    if (hood) {
      // Kapuze: kastenförmige Verkleidung über dem Kopf
      add(this._box(0.34, 0.38, 0.32, cloak, 0, 1.22, -0.02));
      // Gesicht (halb sichtbar unter der Kapuze)
      add(this._sph(0.13, skin, 0, 1.19, 0.04));
      // Augen im Schatten
      add(this._sph(0.020, '#160800', -0.044, 1.22, 0.11));
      add(this._sph(0.020, '#160800',  0.044, 1.22, 0.11));
    } else {
      // Kopf + Ohren
      add(this._sph(0.148, skin, 0, 1.225, 0));
      add(this._sph(0.040, skin, -0.145, 1.225, -0.015));
      add(this._sph(0.040, skin,  0.145, 1.225, -0.015));
      // Haare
      add(this._box(0.30, 0.10, 0.30, hair, 0, 1.345, -0.018));
      add(this._box(0.065, 0.13, 0.055, hair, -0.152, 1.225, -0.045));
      add(this._box(0.065, 0.13, 0.055, hair,  0.152, 1.225, -0.045));
      // Augenbrauen
      add(this._box(0.062, 0.017, 0.012, hair, -0.054, 1.284, 0.124));
      add(this._box(0.062, 0.017, 0.012, hair,  0.054, 1.284, 0.124));
      // Augen
      add(this._sph(0.028, '#f5f4ee', -0.055, 1.248, 0.122));
      add(this._sph(0.028, '#f5f4ee',  0.055, 1.248, 0.122));
      add(this._sph(0.018, '#160800', -0.055, 1.248, 0.133));
      add(this._sph(0.018, '#160800',  0.055, 1.248, 0.133));
      // Nase + Mund
      add(this._sph(0.022, skin, 0, 1.200, 0.140));
      add(this._box(0.074, 0.016, 0.012, '#aa4433', 0, 1.162, 0.132));
    }

    root.appendChild(e);
    return e;
  },

  /* ── Statische NPC-Figuren ───────────────────────────────────────────── */
  _buildNPCs(root) {
    const add = e => root.appendChild(e);

    // Gastwirt: stehend hinter der Theke (Westwand), schaut nach Osten
    // rotY=90: lokales +Z → Welt +X (Ost)
    this._figure(root, -5.80, -2.0, 90, {
      cloth: '#2a1a0a', skin: '#c8905c', hair: '#3d2b1f',
      legs: '#1a1a1a', apron: '#2c401c', seated: false,
    });

    // Reisender A: Tisch 3 (x=-3.2 z=-3.1), Südbank → schaut nach Norden
    this._figure(root, -3.2, -2.37, 180, {
      cloth: '#8b4513', skin: '#d4905c', hair: '#3a280a',
      legs: '#4a3020', seated: true,
    });

    // Reisender B: Tisch 3, Nordbank → schaut nach Süden
    this._figure(root, -3.2, -3.83, 0, {
      cloth: '#2c5f7a', skin: '#e8b882', hair: '#1c1c1c',
      legs: '#1c2840', seated: true,
    });

    // Alter Soldat: Tisch 2 (x=3.2 z=-0.4), Südbank → schaut nach Norden
    this._figure(root, 3.2, 0.33, 180, {
      cloth: '#4a5560', skin: '#c07848', hair: '#b0b0a8',
      legs: '#3a4048', seated: true,
    });
    // Zinnbecher auf dem Tisch vor dem Soldaten (Tischplatte top y=0.80)
    add(this._cyl(0.046, 0.13, '#787870', 3.2, 0.865, -0.15));

    // Frau mit Kapuze: Tisch 4 (x=3.2 z=-3.1), Nordbank → schaut nach Süden
    const cloakFig = this._figure(root, 3.2, -3.83, 0, {
      cloak: '#1a1520', cloth: '#1a1520', skin: '#c8a070',
      hair: '#1a1010', legs: '#1a1520', hood: true, seated: true,
    });
    cloakFig.setAttribute('id', 'cloaked-woman-figure');
  },

  /* ── Gesamter Innenraum ──────────────────────────────────────────────── */
  _buildRoom(root) {
    const add = e => root.appendChild(e);

    // Konstanten
    const H = 3.20;   // Raumhöhe

    // ── Boden ──────────────────────────────────────────────────────────
    add(this._plane(12, 8, '#6a4020', 0, 0.002, -1.5, -90,
      'tex-inn-planks', 5, 2.5));

    // ── Decke ──────────────────────────────────────────────────────────
    add(this._plane(12.6, 8.6, '#281406', 0, H, -1.5, 90,
      'tex-inn-beam', 5, 3.5));

    // ── Wände ──────────────────────────────────────────────────────────
    // Nordwand (Feuerstelle)
    add(this._box(12, H, 0.28, '#a08868', 0, H / 2, -5.64,
      'tex-inn-stone', 4.5, 1.2));
    // Westwand (Theke)
    add(this._box(0.28, H, 8, '#a08868', -6.14, H / 2, -1.5,
      'tex-inn-stone', 3, 1.2));
    // Ostwand
    add(this._box(0.28, H, 8, '#a08868', 6.14, H / 2, -1.5,
      'tex-inn-stone', 3, 1.2));
    // Südwand – linke Hälfte (neben Tür)
    add(this._box(5.10, H, 0.28, '#a08868', -3.45, H / 2, 2.64,
      'tex-inn-stone', 1.9, 1.2));
    // Südwand – rechte Hälfte
    add(this._box(5.10, H, 0.28, '#a08868',  3.45, H / 2, 2.64,
      'tex-inn-stone', 1.9, 1.2));
    // Sturz über Tür
    add(this._box(1.80, 0.72, 0.28, '#a08868', 0, H - 0.36, 2.64,
      'tex-inn-stone', 0.65, 0.28));

    // ── Türrahmen (markiert Ausgang → Exit-Trigger bei local z ≈ 2.0) ──
    add(this._box(0.14, H, 0.22, '#3a2010', -0.74, H / 2, 2.64,
      'tex-inn-beam', 1, 2.5));
    add(this._box(0.14, H, 0.22, '#3a2010',  0.74, H / 2, 2.64,
      'tex-inn-beam', 1, 2.5));

    // ── Deckenbalken (Querträger, entlang X) ───────────────────────────
    [-4.8, -3.0, -1.2,  0.6,  2.4].forEach(z => {
      add(this._box(12.4, 0.26, 0.26, '#3a2010', 0, H - 0.13, z,
        'tex-inn-beam', 6, 1));
    });
    // Längsträger (entlang Z)
    [-3.2, 3.2].forEach(x => {
      add(this._box(0.26, 0.26, 8.4, '#3a2010', x, H - 0.13, -1.5,
        'tex-inn-beam', 1, 4));
    });

    // ── Feuerstelle, Theke, Tische ─────────────────────────────────────
    this._buildFireplace(root);
    this._buildBar(root);

    [
      { x: -3.2, z: -0.4 },
      { x:  3.2, z: -0.4 },
      { x: -3.2, z: -3.1 },
      { x:  3.2, z: -3.1 },
      { x:  0.0, z: -4.6 },
    ].forEach(t => this._buildTable(root, t.x, t.z));

    // ── NPCs ───────────────────────────────────────────────────────────
    this._buildNPCs(root);
  },

  /* ── Feuerstelle (Nordwand, Mitte) ───────────────────────────────────── */
  _buildFireplace(root) {
    const add = e => root.appendChild(e);
    const fz = -5.50;   // Innenseite Nordwand

    // Kaminverkleidung (Stein, leicht vorspringend)
    add(this._box(3.0, 2.80, 0.55, '#8a7050', 0, 1.40, fz + 0.28,
      'tex-inn-stone', 1.1, 1.1));
    // Kaminherd-Boden (flache Steinplatte)
    add(this._box(1.90, 0.09, 0.60, '#6e5c40', 0, 0.045, fz + 0.30,
      'tex-inn-stone', 0.8, 0.25));
    // Kaminöffnung (dunkler Schlund)
    add(this._box(1.55, 1.38, 0.48, '#100c08', 0, 0.69, fz + 0.08));
    // Sims (Mantelstück)
    add(this._box(3.20, 0.15, 0.68, '#7c6442', 0, 1.47, fz + 0.30,
      'tex-inn-stone', 1.2, 0.28));

    // Feuer – Glutbett
    add(this._emissiveBox(
      1.10, 0.10, 0.30, '#cc3300', '#ff5500', 1.6, 0, 0.07, fz + 0.05));
    // Feuer – untere Flamme
    add(this._emissiveBox(
      0.88, 0.50, 0.22, '#ff6600', '#ff3300', 2.2, 0, 0.38, fz + 0.06, 0.88));
    // Feuer – mittlere Flamme (schmaler)
    add(this._emissiveBox(
      0.56, 0.38, 0.16, '#ffaa00', '#ff7700', 2.5, 0, 0.66, fz + 0.06, 0.76));
    // Feuer – Flammenspitze (Kugel)
    add(this._emissiveSph(
      0.24, '#ffdd00', '#ffaa00', 3.0, 0, 0.90, fz + 0.06, 0.62));

    // Feuerschein – einziges Punktlicht im Innenraum
    const light = document.createElement('a-entity');
    light.setAttribute('position', `0 1.4 ${fz + 1.8}`);
    light.setAttribute('light',
      'type:point;color:#ff8833;intensity:1.6;distance:10');
    root.appendChild(light);
  },

  /* ── Theke (Westwand) ────────────────────────────────────────────────── */
  _buildBar(root) {
    const add = e => root.appendChild(e);
    const bx = -5.60;   // Innenseite Westwand

    // Tresenkörper
    add(this._box(0.82, 0.74, 4.40, '#3c2210', bx + 0.41, 0.37, -2.0,
      'tex-inn-beam', 0.8, 2.5));
    // Tresenplatte (etwas heller, leicht überstehend)
    add(this._box(0.92, 0.09, 4.60, '#5a3818', bx + 0.46, 0.785, -2.0,
      'tex-inn-planks', 0.5, 2.2));

    // Wandregale (2 Reihen, 2 Segmente)
    [
      { z: -0.6, y: 1.86 }, { z: -0.6, y: 2.28 },
      { z: -3.4, y: 1.86 }, { z: -3.4, y: 2.28 },
    ].forEach(sh => {
      add(this._box(0.16, 0.06, 1.30, '#4a2c10', -5.95, sh.y, sh.z,
        'tex-inn-beam', 1, 0.8));
    });

    // Krüge und Töpfe auf Regalen
    [
      [-5.88, 2.01, -0.85, 0.065, 0.22, '#9a7860'],
      [-5.88, 2.01, -0.55, 0.052, 0.17, '#7a6050'],
      [-5.88, 2.01, -0.28, 0.068, 0.20, '#8a7060'],
      [-5.88, 2.43, -3.55, 0.058, 0.18, '#806050'],
      [-5.88, 2.43, -3.25, 0.072, 0.22, '#987060'],
    ].forEach(([cx, cy, cz, r, h, col]) => add(this._cyl(r, h, col, cx, cy, cz)));
  },

  /* ── Tisch mit Bänken und Kerzen ─────────────────────────────────────── */
  _buildTable(root, tx, tz) {
    const add = e => root.appendChild(e);

    // Tischplatte
    add(this._box(1.55, 0.08, 0.90, '#3c2210', tx, 0.76, tz,
      'tex-inn-planks', 1, 0.55));
    // Tischbeine
    [[-0.63, -0.35], [-0.63, 0.35], [0.63, -0.35], [0.63, 0.35]].forEach(([lx, lz]) =>
      add(this._cyl(0.04, 0.76, '#2e1a08', tx + lx, 0.38, tz + lz))
    );

    // Bänke
    [-0.73, 0.73].forEach(side => {
      add(this._box(1.40, 0.07, 0.30, '#3c2210', tx, 0.43, tz + side,
        'tex-inn-planks', 0.8, 0.18));
      // Bankstützen (vier Ecken)
      [[-0.58, -0.09], [-0.58, 0.09], [0.58, -0.09], [0.58, 0.09]].forEach(([lx, lz]) =>
        add(this._cyl(0.028, 0.43, '#2e1a08', tx + lx, 0.215, tz + side + lz))
      );
    });

    // Kerzen (2 pro Tisch)
    [-0.32, 0.32].forEach(ox => {
      // Kerzenkörper
      add(this._cyl(0.022, 0.18, '#ede8d4', tx + ox, 0.89, tz));
      // Docht / Flamme
      add(this._emissiveSph(
        0.024, '#ffee88', '#ffcc44', 3.2, tx + ox, 0.988, tz, null));
      // Wachsträufel
      add(this._emissiveSph(
        0.018, '#ede0b0', '#ffe890', 0.6, tx + ox, 0.970, tz + 0.018, null));
    });
  },
});

// ─── Reisenden-Dialog (Quest 0) ──────────────────────────────────────────────
// Automatischer Dialog bei Annäherung < 2.5m an Tisch 3 (Reisender A & B).
// Reisender A: world (-12.2, 0,  5.63) → bubble y=1.65
// Reisender B: world (-12.2, 0,  4.17) → bubble y=1.65
// Triggerachse-Mitte: (-12.2, 0, 4.90)
AFRAME.registerComponent('gasthaus-travelers', {

  init() {
    if (!window.QUEST0) window.QUEST0 = {};

    this._cam       = null;
    this._camWP     = new THREE.Vector3();
    this._triggered = false;
    this._step      = 0;   // 0=warten, 1=b1, 2=b2, 3=b3, 4=fertig
    this._timer     = 0;
    this._b1        = null;
    this._b2        = null;
    this._b3        = null;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });
  },

  _mkBubble(text, wx, wy, wz, bgW, bgH) {
    const h = document.createElement('a-entity');
    h.setAttribute('position', `${wx} ${wy} ${wz}`);
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width',  (bgW + 0.06).toFixed(2));
    frame.setAttribute('height', (bgH + 0.06).toFixed(2));
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#9b7040;shader:flat;transparent:true;opacity:0.50;' +
      'emissive:#9b7040;emissiveIntensity:0.18');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width',  bgW.toFixed(2));
    bg.setAttribute('height', bgH.toFixed(2));
    bg.setAttribute('material',
      'color:#140c00;shader:flat;transparent:true;opacity:0.90');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', text);
    txt.setAttribute('align', 'center');
    txt.setAttribute('baseline', 'center');
    txt.setAttribute('color', '#ffe8c0');
    txt.setAttribute('width', (bgW - 0.10).toFixed(2));
    txt.setAttribute('wrap-count', '32');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    return h;
  },

  _build() {
    // Reisender A (Südbank, schaut nach Norden): world (-12.2, 1.65, 5.63)
    this._b1 = this._mkBubble(
      'Das Westtor war frueher nie verschlossen.\nSeit Jahren kommt niemand mehr raus oder rein.',
      -12.2, 1.65, 5.63,
      1.80, 0.48,
    );
    // Reisender B (Nordbank, schaut nach Süden): world (-12.2, 1.65, 4.17)
    this._b2 = this._mkBubble(
      'Lass es gut sein.\nDer Stadtrat hat seine Gruende.',
      -12.2, 1.65, 4.17,
      1.60, 0.30,
    );
    // Reisender A – dritte Zeile
    this._b3 = this._mkBubble(
      'Gruende... oder Angst.',
      -12.2, 1.65, 5.63,
      1.30, 0.22,
    );
  },

  _trigger() {
    this._triggered = true;
    window.QUEST0.heardTravelers = true;
    this._step  = 1;
    this._timer = 6.0;
    if (this._b1) this._b1.setAttribute('visible', 'true');
  },

  tick(t, dt) {
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam) return;

    const dts = Math.min(dt * 0.001, 0.05);

    this._cam.object3D.getWorldPosition(this._camWP);
    const cx = this._camWP.x;
    const cz = this._camWP.z;

    // Sichtbare Panels zur Kamera ausrichten
    [this._b1, this._b2, this._b3].forEach(b => {
      if (b && b.object3D && b.object3D.visible) {
        b.object3D.rotation.y = Math.atan2(
          cx - b.object3D.position.x,
          cz - b.object3D.position.z,
        );
      }
    });

    if (this._step === 4) return;

    // Bereits ausgelöst (z. B. Session-Reload): überspringen
    if (!this._triggered && window.QUEST0.heardTravelers) {
      this._triggered = true;
      this._step = 4;
      return;
    }

    if (!this._triggered) {
      // Näheprüfung zur Tischmitte (-12.2, 0, 4.9)
      const dx = cx - (-12.2);
      const dz = cz - 4.9;
      if (dx * dx + dz * dz < 6.25) this._trigger();   // 2.5m radius
      return;
    }

    // Timer-gesteuerte Sequenz
    this._timer -= dts;
    if (this._timer > 0) return;

    if (this._step === 1) {
      if (this._b1) this._b1.setAttribute('visible', 'false');
      if (this._b2) this._b2.setAttribute('visible', 'true');
      this._step  = 2;
      this._timer = 6.0;
    } else if (this._step === 2) {
      if (this._b2) this._b2.setAttribute('visible', 'false');
      if (this._b3) this._b3.setAttribute('visible', 'true');
      this._step  = 3;
      this._timer = 5.0;
    } else if (this._step === 3) {
      if (this._b3) this._b3.setAttribute('visible', 'false');
      this._step = 4;
    }
  },

  remove() {
    [this._b1, this._b2, this._b3].forEach(b => {
      if (b && b.parentNode) b.parentNode.removeChild(b);
    });
  },
});

// ─── Alter Soldat – Dialog (Quest 0) ─────────────────────────────────────────
// Alter Soldat: local (3.2, 0, 0.33) → world (-5.8, 0, 8.33)
// Interaktion per E / Trigger / Touch-Button bei < 2m.
AFRAME.registerComponent('soldier-dialog', {

  init() {
    if (!window.QUEST0) window.QUEST0 = {};

    this._cam       = null;
    this._camWP     = new THREE.Vector3();
    this._near      = false;
    this._triggered = false;
    this._step      = 0;   // 0=warten, 1=b1, 2=b2, 3=b3, 4=fertig
    this._timer     = 0;
    this._hint      = null;
    this._b1        = null;
    this._b2        = null;
    this._b3        = null;
    this._touchBtn  = null;

    // Weltposition des Soldaten
    this._sx = -5.8;
    this._sz =  8.33;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    document.addEventListener('keydown', e => {
      if (e.code === 'KeyE' && this._near) this._trigger();
    });

    sc.addEventListener('loaded', () => {
      const rh = document.getElementById('rightHand');
      if (rh) rh.addEventListener('triggerdown', () => {
        if (this._near) this._trigger();
      });
    }, { once: true });
  },

  _mkHint() {
    const h = document.createElement('a-entity');
    h.setAttribute('position', `${this._sx} 1.85 ${this._sz}`);
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width', '1.18');
    frame.setAttribute('height', '0.30');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#607080;shader:flat;transparent:true;opacity:0.50;' +
      'emissive:#607080;emissiveIntensity:0.18');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width', '1.12');
    bg.setAttribute('height', '0.24');
    bg.setAttribute('material',
      'color:#080c10;shader:flat;transparent:true;opacity:0.90');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', 'E / Trigger: Ansprechen');
    txt.setAttribute('align', 'center');
    txt.setAttribute('baseline', 'center');
    txt.setAttribute('color', '#b0c8d8');
    txt.setAttribute('width', '1.00');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    return h;
  },

  _mkBubble(text, bgW, bgH) {
    const h = document.createElement('a-entity');
    h.setAttribute('position', `${this._sx} 1.70 ${this._sz}`);
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width',  (bgW + 0.06).toFixed(2));
    frame.setAttribute('height', (bgH + 0.06).toFixed(2));
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#607080;shader:flat;transparent:true;opacity:0.50;' +
      'emissive:#607080;emissiveIntensity:0.18');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width',  bgW.toFixed(2));
    bg.setAttribute('height', bgH.toFixed(2));
    bg.setAttribute('material',
      'color:#080c10;shader:flat;transparent:true;opacity:0.90');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', text);
    txt.setAttribute('align', 'center');
    txt.setAttribute('baseline', 'center');
    txt.setAttribute('color', '#c8dce8');
    txt.setAttribute('width', (bgW - 0.12).toFixed(2));
    txt.setAttribute('wrap-count', '30');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    return h;
  },

  _mkTouchBtn() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch || document.getElementById('soldier-touch-btn')) return;

    const style = document.createElement('style');
    style.textContent = `
      #soldier-touch-btn {
        position: fixed; bottom: 200px; left: 50%;
        transform: translateX(-50%);
        background: rgba(80,112,128,0.90); color: #dff0ff;
        border: none; border-radius: 30px;
        padding: 12px 30px; font-size: 17px;
        font-family: sans-serif; font-weight: bold;
        display: none; z-index: 10001; touch-action: none;
      }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'soldier-touch-btn';
    btn.textContent = 'Ansprechen';
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      if (this._near) this._trigger();
    }, { passive: false });
    document.body.appendChild(btn);
    this._touchBtn = btn;
  },

  _build() {
    this._hint = this._mkHint();
    this._b1 = this._mkBubble(
      'Noch ein Fremder der nicht weiss\nwo er hingehoert.',
      1.70, 0.32,
    );
    this._b2 = this._mkBubble(
      'Diese Stadt... frueher war sie anders. Offener.\nDie Tore standen immer offen. Jetzt?\nDas Westtor seit Jahren verschlossen.\nNiemand fragt warum.',
      1.80, 0.72,
    );
    this._b3 = this._mkBubble(
      'Ich frag auch nicht mehr.',
      1.30, 0.22,
    );
    this._mkTouchBtn();
  },

  _trigger() {
    if (this._triggered) return;
    this._triggered = true;
    window.QUEST0.heardSoldier = true;

    this._near = false;
    if (this._hint) this._hint.setAttribute('visible', 'false');
    if (this._touchBtn) this._touchBtn.style.display = 'none';

    this._step  = 1;
    this._timer = 6.0;
    if (this._b1) this._b1.setAttribute('visible', 'true');
  },

  tick(t, dt) {
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam) return;

    const dts = Math.min(dt * 0.001, 0.05);

    this._cam.object3D.getWorldPosition(this._camWP);
    const cx = this._camWP.x;
    const cz = this._camWP.z;

    // Sichtbare Panels zur Kamera ausrichten
    const panels = [this._hint, this._b1, this._b2, this._b3];
    panels.forEach(p => {
      if (p && p.object3D && p.object3D.visible) {
        p.object3D.rotation.y = Math.atan2(
          cx - this._sx,
          cz - this._sz,
        );
      }
    });

    if (this._step === 4) return;

    // Bereits gehört (Session-Reload)
    if (!this._triggered && window.QUEST0.heardSoldier) {
      this._triggered = true;
      this._step = 4;
      return;
    }

    if (!this._triggered) {
      const dx = cx - this._sx;
      const dz = cz - this._sz;
      const near = (dx * dx + dz * dz) < 4.0;   // 2m radius
      if (near !== this._near) {
        this._near = near;
        if (this._hint) this._hint.setAttribute('visible', near ? 'true' : 'false');
        if (this._touchBtn) this._touchBtn.style.display = near ? 'block' : 'none';
      }
      return;
    }

    // Timer-gesteuerte Sequenz
    this._timer -= dts;
    if (this._timer > 0) return;

    if (this._step === 1) {
      if (this._b1) this._b1.setAttribute('visible', 'false');
      if (this._b2) this._b2.setAttribute('visible', 'true');
      this._step  = 2;
      this._timer = 6.0;
    } else if (this._step === 2) {
      if (this._b2) this._b2.setAttribute('visible', 'false');
      if (this._b3) this._b3.setAttribute('visible', 'true');
      this._step  = 3;
      this._timer = 5.0;
    } else if (this._step === 3) {
      if (this._b3) this._b3.setAttribute('visible', 'false');
      this._step = 4;
    }
  },

  remove() {
    [this._hint, this._b1, this._b2, this._b3].forEach(p => {
      if (p && p.parentNode) p.parentNode.removeChild(p);
    });
    if (this._touchBtn && this._touchBtn.parentNode)
      this._touchBtn.parentNode.removeChild(this._touchBtn);
  },
});

// ─── Frau mit Kapuze – Stumme Interaktion (Quest 0) ──────────────────────────
// Frau mit Kapuze: local (3.2, 0, -3.83) → world (-5.8, 0, 4.17)
// Annäherung < 2m: aufstehen (0.5s) → wegdrehen (0.4s) → verschwinden (1s).
AFRAME.registerComponent('cloaked-woman', {

  init() {
    if (!window.QUEST0) window.QUEST0 = {};

    this._cam         = null;
    this._camWP       = new THREE.Vector3();
    this._fig         = null;
    this._state       = 'waiting';
    this._timer       = 0;
    this._startAngle  = 0;
    this._targetAngle = 0;

    // Weltposition der Figur (interior -9,0,8 + local 3.2,0,-3.83)
    this._wx = -5.8;
    this._wz =  4.17;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._setup();
    else sc.addEventListener('loaded', () => this._setup(), { once: true });
  },

  _setup() {
    this._fig = document.getElementById('cloaked-woman-figure');
    if (this._fig && window.QUEST0.sawCloakedWoman) {
      this._fig.setAttribute('visible', 'false');
      this._state = 'done';
    }
  },

  tick(t, dt) {
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam || !this._fig || this._state === 'done') return;

    const dts = Math.min(dt * 0.001, 0.05);

    // ── Warten: Näheprüfung ──────────────────────────────────────────────
    if (this._state === 'waiting') {
      if (window.QUEST0.sawCloakedWoman) {
        this._fig.setAttribute('visible', 'false');
        this._state = 'done';
        return;
      }
      this._cam.object3D.getWorldPosition(this._camWP);
      const dx = this._camWP.x - this._wx;
      const dz = this._camWP.z - this._wz;
      if (dx * dx + dz * dz < 4.0) {   // 2m radius
        window.QUEST0.sawCloakedWoman = true;
        // Zielwinkel: von Spieler wegdrehen
        const away = Math.atan2(-dx, -dz);
        this._startAngle  = this._fig.object3D.rotation.y;
        let diff = away - this._startAngle;
        while (diff >  Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        this._targetAngle = this._startAngle + diff;
        this._state = 'rising';
        this._timer = 0;
      }
      return;
    }

    this._timer += dts;

    // ── Aufstehen (0.5s) ─────────────────────────────────────────────────
    if (this._state === 'rising') {
      const p    = Math.min(this._timer / 0.5, 1.0);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      this._fig.object3D.position.y = ease * 0.30;
      if (p >= 1.0) { this._state = 'turning'; this._timer = 0; }

    // ── Wegdrehen (0.4s) ─────────────────────────────────────────────────
    } else if (this._state === 'turning') {
      const p    = Math.min(this._timer / 0.4, 1.0);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      this._fig.object3D.rotation.y =
        this._startAngle + ease * (this._targetAngle - this._startAngle);
      if (p >= 1.0) {
        this._state = 'fading';
        this._timer = 0;
        // Transparency einmalig aktivieren
        this._fig.object3D.traverse(child => {
          if (child.material) {
            child.material.transparent = true;
            child.material.needsUpdate = true;
          }
        });
      }

    // ── Verschwinden (1s) ────────────────────────────────────────────────
    } else if (this._state === 'fading') {
      const p = Math.min(this._timer / 1.0, 1.0);
      this._fig.object3D.traverse(child => {
        if (child.material) child.material.opacity = 1.0 - p;
      });
      if (p >= 1.0) {
        this._fig.setAttribute('visible', 'false');
        this._state = 'done';
      }
    }
  },
});

// ─── Gastwirt – Dialog (Quest 0) ─────────────────────────────────────────────
// Gastwirt: local (-5.80, 0, -2.0) → world (-14.8, 0, 6.0)
// Hinweis nur wenn heardSoldier && heardTravelers. Setzt heardTavern nach Dialog.
AFRAME.registerComponent('innkeeper-dialog', {

  init() {
    if (!window.QUEST0) window.QUEST0 = {};

    this._cam       = null;
    this._camWP     = new THREE.Vector3();
    this._near      = false;
    this._triggered = false;
    this._step      = 0;   // 0=warten, 1=b1, 2=b2, 3=b3, 4=fertig
    this._timer     = 0;
    this._hint      = null;
    this._b1        = null;
    this._b2        = null;
    this._b3        = null;
    this._touchBtn  = null;

    this._wx = -14.8;
    this._wz =   6.0;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    document.addEventListener('keydown', e => {
      if (e.code === 'KeyE' && this._near) this._trigger();
    });

    sc.addEventListener('loaded', () => {
      const rh = document.getElementById('rightHand');
      if (rh) rh.addEventListener('triggerdown', () => {
        if (this._near) this._trigger();
      });
    }, { once: true });
  },

  _mkHint() {
    const h = document.createElement('a-entity');
    h.setAttribute('position', `${this._wx} 2.10 ${this._wz}`);
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width', '1.18');
    frame.setAttribute('height', '0.30');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#805030;shader:flat;transparent:true;opacity:0.50;' +
      'emissive:#805030;emissiveIntensity:0.18');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width', '1.12');
    bg.setAttribute('height', '0.24');
    bg.setAttribute('material',
      'color:#100800;shader:flat;transparent:true;opacity:0.90');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', 'E / Trigger: Ansprechen');
    txt.setAttribute('align', 'center');
    txt.setAttribute('baseline', 'center');
    txt.setAttribute('color', '#e8c090');
    txt.setAttribute('width', '1.00');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    return h;
  },

  _mkBubble(text, bgW, bgH) {
    const h = document.createElement('a-entity');
    h.setAttribute('position', `${this._wx} 1.90 ${this._wz}`);
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width',  (bgW + 0.06).toFixed(2));
    frame.setAttribute('height', (bgH + 0.06).toFixed(2));
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#805030;shader:flat;transparent:true;opacity:0.50;' +
      'emissive:#805030;emissiveIntensity:0.18');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width',  bgW.toFixed(2));
    bg.setAttribute('height', bgH.toFixed(2));
    bg.setAttribute('material',
      'color:#100800;shader:flat;transparent:true;opacity:0.90');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', text);
    txt.setAttribute('align', 'center');
    txt.setAttribute('baseline', 'center');
    txt.setAttribute('color', '#f0d0a0');
    txt.setAttribute('width', (bgW - 0.12).toFixed(2));
    txt.setAttribute('wrap-count', '30');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    return h;
  },

  _mkTouchBtn() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch || document.getElementById('innkeeper-touch-btn')) return;

    const style = document.createElement('style');
    style.textContent = `
      #innkeeper-touch-btn {
        position: fixed; bottom: 200px; left: 50%;
        transform: translateX(-50%);
        background: rgba(128,80,48,0.90); color: #fde8c0;
        border: none; border-radius: 30px;
        padding: 12px 30px; font-size: 17px;
        font-family: sans-serif; font-weight: bold;
        display: none; z-index: 10001; touch-action: none;
      }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'innkeeper-touch-btn';
    btn.textContent = 'Ansprechen';
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      if (this._near) this._trigger();
    }, { passive: false });
    document.body.appendChild(btn);
    this._touchBtn = btn;
  },

  _build() {
    this._hint = this._mkHint();
    this._b1 = this._mkBubble(
      'Lass die Finger davon, Fremder.\nDer Stadtrat hat lange Ohren.',
      1.80, 0.32,
    );
    this._b2 = this._mkBubble(
      'Wenn du wirklich Antworten willst...\ngeh zum Schmied. Morgen frueh,\nwenn er seine Esse anfeuert.',
      1.80, 0.48,
    );
    this._b3 = this._mkBubble(
      'Aber sag nicht ich hab dich geschickt.',
      1.60, 0.24,
    );
    this._mkTouchBtn();
  },

  _trigger() {
    if (this._triggered) return;
    this._triggered = true;

    this._near = false;
    if (this._hint) this._hint.setAttribute('visible', 'false');
    if (this._touchBtn) this._touchBtn.style.display = 'none';

    this._step  = 1;
    this._timer = 3.0;
    if (this._b1) this._b1.setAttribute('visible', 'true');
  },

  tick(t, dt) {
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam) return;

    const dts = Math.min(dt * 0.001, 0.05);

    this._cam.object3D.getWorldPosition(this._camWP);
    const cx = this._camWP.x;
    const cz = this._camWP.z;

    // Sichtbare Panels zur Kamera ausrichten
    [this._hint, this._b1, this._b2, this._b3].forEach(p => {
      if (p && p.object3D && p.object3D.visible) {
        p.object3D.rotation.y = Math.atan2(cx - this._wx, cz - this._wz);
      }
    });

    if (this._step === 4) return;

    // Bereits abgeschlossen (Session-Reload)
    if (!this._triggered && window.QUEST0.heardTavern) {
      this._triggered = true;
      this._step = 4;
      return;
    }

    if (!this._triggered) {
      const conditions = window.QUEST0.heardSoldier && window.QUEST0.heardTravelers;
      const dx   = cx - this._wx;
      const dz   = cz - this._wz;
      const near = conditions && (dx * dx + dz * dz) < 4.0;   // 2m radius

      if (near !== this._near) {
        this._near = near;
        if (this._hint) this._hint.setAttribute('visible', near ? 'true' : 'false');
        if (this._touchBtn) this._touchBtn.style.display = near ? 'block' : 'none';
      }
      return;
    }

    // Timer-gesteuerte Sequenz (Pausen je 3s)
    this._timer -= dts;
    if (this._timer > 0) return;

    if (this._step === 1) {
      if (this._b1) this._b1.setAttribute('visible', 'false');
      if (this._b2) this._b2.setAttribute('visible', 'true');
      this._step  = 2;
      this._timer = 3.0;
    } else if (this._step === 2) {
      if (this._b2) this._b2.setAttribute('visible', 'false');
      if (this._b3) this._b3.setAttribute('visible', 'true');
      this._step  = 3;
      this._timer = 4.0;
    } else if (this._step === 3) {
      if (this._b3) this._b3.setAttribute('visible', 'false');
      window.QUEST0.heardTavern = true;
      this._step = 4;
    }
  },

  remove() {
    [this._hint, this._b1, this._b2, this._b3].forEach(p => {
      if (p && p.parentNode) p.parentNode.removeChild(p);
    });
    if (this._touchBtn && this._touchBtn.parentNode)
      this._touchBtn.parentNode.removeChild(this._touchBtn);
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// GASTHAUS-MORNING – Tageswechsel beim Verlassen des Gasthauses
// Registriert als System (kein index.html-Attribut nötig)
// ─────────────────────────────────────────────────────────────────────────────
AFRAME.registerSystem('gasthaus-morning', {
  init() {
    this._morningDone    = false;
    this._blockHintTimer = null;
    this.el.addEventListener('loaded', () => this._patch(), { once: true });
  },

  _patch() {
    const gd = this.el.components['gasthaus-door'];
    if (!gd) return;

    const self    = this;
    const origTry = gd._tryTransit.bind(gd);

    gd._tryTransit = function () {
      if (!this._inside) { origTry(); return; }

      if (!window.QUEST0 || !window.QUEST0.heardTavern) {
        self._showBlockHint();
        return;
      }

      if (!self._morningDone) {
        self._morningDone = true;
        self._doMorningExit(gd);
        return;
      }

      origTry();
    };
  },

  _doMorningExit(gd) {
    if (!gd._near || gd._transitioning) return;
    gd._transitioning = true;
    gd._fadeOut(() => {
      gd._doExit();
      this._applyMorning();
      gd._fadeIn(() => {
        gd._transitioning = false;
        gd._cooldown = 1.5;
        setTimeout(() => this._showText(), 400);
      });
    });
  },

  _applyMorning() {
    this.el.setAttribute('daynight', 'mode:morning');

    const clRoot = document.querySelector('#city-life-root');
    if (clRoot && clRoot.components['city-life']) {
      clRoot.components['city-life']._npcs.forEach(n => {
        if (n.root) n.root.object3D.visible = true;
      });
    }

    const kn = this.el.components['kesselstadt-night'];
    if (kn && kn._guards) {
      kn._guards.forEach(g => {
        if (g.root) g.root.object3D.visible = false;
      });
    }
  },

  _showBlockHint() {
    if (this._blockHintTimer) return;
    const cam = document.querySelector('#camera');
    if (!cam) return;

    const panel = document.createElement('a-entity');
    panel.setAttribute('position', '0 0.25 -2.0');
    const t = document.createElement('a-text');
    t.setAttribute('value', 'Sprich erst mit dem Gastwirt');
    t.setAttribute('align', 'center');
    t.setAttribute('color', '#ff9944');
    t.setAttribute('width', '2.5');
    t.setAttribute('shader', 'flat');
    panel.appendChild(t);
    cam.appendChild(panel);

    this._blockHintTimer = setTimeout(() => {
      if (panel.parentNode) panel.parentNode.removeChild(panel);
      this._blockHintTimer = null;
    }, 3000);
  },

  _showText() {
    const cam = document.querySelector('#camera');
    if (!cam) return;

    const panel = document.createElement('a-entity');
    panel.setAttribute('position', '0 -0.05 -2.0');
    const t = document.createElement('a-text');
    t.setAttribute('value', 'Der Morgen graut\nueber der Kesselstadt...');
    t.setAttribute('align', 'center');
    t.setAttribute('color', '#ffd080');
    t.setAttribute('width', '3.0');
    t.setAttribute('shader', 'flat');
    panel.appendChild(t);
    cam.appendChild(panel);

    const div = document.createElement('div');
    div.style.cssText =
      'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
      'color:#ffd080;font-size:22px;text-align:center;font-family:Georgia,serif;' +
      'pointer-events:none;opacity:0;transition:opacity 0.5s;z-index:9999;' +
      'text-shadow:0 0 8px #000;line-height:1.6;white-space:pre;';
    div.textContent = 'Der Morgen graut\nueber der Kesselstadt...';
    document.body.appendChild(div);
    requestAnimationFrame(() => requestAnimationFrame(() => { div.style.opacity = '1'; }));

    setTimeout(() => {
      if (panel.parentNode) panel.parentNode.removeChild(panel);
      div.style.opacity = '0';
      setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 500);
    }, 3500);
  },
});
