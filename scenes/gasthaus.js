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
    add(this._box(0.82, 1.04, 4.40, '#3c2210', bx + 0.41, 0.52, -2.0,
      'tex-inn-beam', 0.8, 3.5));
    // Tresenplatte (etwas heller, leicht überstehend)
    add(this._box(0.92, 0.09, 4.60, '#5a3818', bx + 0.46, 1.085, -2.0,
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
    add(this._box(1.55, 0.08, 0.90, '#7a4c22', tx, 0.76, tz,
      'tex-inn-planks', 1, 0.55));
    // Tischbeine
    [[-0.63, -0.35], [-0.63, 0.35], [0.63, -0.35], [0.63, 0.35]].forEach(([lx, lz]) =>
      add(this._cyl(0.04, 0.76, '#5c3618', tx + lx, 0.38, tz + lz))
    );

    // Bänke
    [-0.73, 0.73].forEach(side => {
      add(this._box(1.40, 0.07, 0.30, '#6a4020', tx, 0.43, tz + side,
        'tex-inn-planks', 0.8, 0.18));
      // Bankstützen
      [-0.58, 0.58].forEach(lx =>
        add(this._cyl(0.028, 0.43, '#5c3618', tx + lx, 0.215, tz + side))
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
