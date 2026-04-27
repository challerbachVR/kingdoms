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
    this._figure(root, 3.2, -3.83, 0, {
      cloak: '#1a1520', cloth: '#1a1520', skin: '#c8a070',
      hair: '#1a1010', legs: '#1a1520', hood: true, seated: true,
    });
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
