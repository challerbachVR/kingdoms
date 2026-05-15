// ═══════════════════════════════════════════════════════════════════════════
// ALCHIMISTIN – Quest 1c (Child von #alchemist-interior)
// Dialog-System + NPC + Innenraum.
// Nur aktiv wenn ALCHEMIST_INSIDE.
// ═══════════════════════════════════════════════════════════════════════════

window.ALCHEMIST_INSIDE = false;

const alchemistState = {
  dialogStep:  0,
  cooldownMs:  4000,
  lastTrigger: 0,
};

AFRAME.registerComponent('alchemist-npc', {

  init() {
    this._cam = null;
    this._camWP = new THREE.Vector3();
    this._npcWorldPos = new THREE.Vector3();
    this._insideRoot = null;
    this._insideNpcRoot = null;
    this._bubbles = {};
    this._near = false;
    this._bubbleTimer = null;
    this._autoTimer = null;
    this._autoDone = false;
    this._hint = null;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    document.addEventListener('keydown', e => {
      if (e.code !== 'KeyE' || !window.ALCHEMIST_INSIDE) return;
      if (this._near) this._triggerDialog();
    });
  },

  _box(w, h, d, col, px, py, pz, tex) {
    const e = document.createElement('a-box');
    e.setAttribute('width', w); e.setAttribute('height', h); e.setAttribute('depth', d);
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    if (tex) e.setAttribute('tex', tex);
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
  _cyl(r, h, col, px, py, pz) {
    const e = document.createElement('a-cylinder');
    e.setAttribute('radius', r); e.setAttribute('height', h);
    e.setAttribute('segments-radial', '8');
    e.setAttribute('position', `${px} ${py} ${pz}`);
    e.setAttribute('material', `color:${col};shader:flat`);
    return e;
  },

  _build() {
    this._cam = document.getElementById('camera');
    this._buildRoom();
    this._buildInteriorFigure();
    this._buildBubbles();
    this._buildHint();

    const tryBindVR = () => {
      const rh = document.getElementById('rightHand');
      if (rh) {
        rh.addEventListener('triggerdown', () => {
          if (!window.ALCHEMIST_INSIDE) return;
          if (this._near) this._triggerDialog();
        });
      } else {
        setTimeout(tryBindVR, 200);
      }
    };
    tryBindVR();
  },

  // ── Innenraum ────────────────────────────────────────────────────────────
  _buildRoom() {
    const interior = document.getElementById('alchemist-interior');
    if (!interior) { setTimeout(() => this._buildRoom(), 100); return; }
    if (interior.dataset.alchemyBuilt) return;
    interior.dataset.alchemyBuilt = 'true';

    const add = e => interior.appendChild(e);

    // Boden
    const floor = document.createElement('a-plane');
    floor.setAttribute('rotation', '-90 0 0');
    floor.setAttribute('width', '4.4');
    floor.setAttribute('height', '3.8');
    floor.setAttribute('material', 'color:#3c2818;shader:flat');
    floor.setAttribute('tex', 'id:tex-planks; repx:2; repy:1.5');
    interior.appendChild(floor);

    // Decke
    const ceil = document.createElement('a-plane');
    ceil.setAttribute('rotation', '90 0 0');
    ceil.setAttribute('width', '4.4');
    ceil.setAttribute('height', '3.8');
    ceil.setAttribute('position', '0 3.2 0');
    ceil.setAttribute('material', 'color:#1a0e06;shader:flat');
    ceil.setAttribute('tex', 'id:tex-beam; repx:2; repy:1.5');
    interior.appendChild(ceil);

    // Nordwand
    add(this._box(4.4, 3.2, 0.28, '#6a5a4a', 0, 1.6, -1.9, 'id:tex-stone; repx:2; repy:1.2'));
    // Westwand
    add(this._box(0.28, 3.2, 3.8, '#6a5a4a', -2.2, 1.6, 0, 'id:tex-stone; repx:2; repy:1.2'));
    // Ostwand
    add(this._box(0.28, 3.2, 3.8, '#6a5a4a', 2.2, 1.6, 0, 'id:tex-stone; repx:2; repy:1.2'));
    // Südwand links (neben Tür)
    add(this._box(1.4, 3.2, 0.28, '#6a5a4a', -1.4, 1.6, 1.9, 'id:tex-stone; repx:2; repy:1.2'));
    // Südwand rechts
    add(this._box(1.4, 3.2, 0.28, '#6a5a4a', 1.4, 1.6, 1.9, 'id:tex-stone; repx:2; repy:1.2'));
    // Türsturz
    add(this._box(1.4, 0.5, 0.28, '#6a5a4a', 0, 2.95, 1.9, 'id:tex-stone; repx:2; repy:0.2'));

    // ── Tür (Südwand) ──────────────────────────────────────────────────────
    // Türblatt
    add(this._box(1.40, 2.70, 0.10, '#2a1a0e',
      0, 1.35, 1.86, 'id:tex-planks; repx:0.8; repy:1.4'));
    // Türrahmen links
    add(this._box(0.14, 3.2, 0.24, '#4a2c10',
      -0.77, 1.6, 1.9, 'id:tex-beam; repx:1; repy:2'));
    // Türrahmen rechts
    add(this._box(0.14, 3.2, 0.24, '#4a2c10',
      0.77, 1.6, 1.9, 'id:tex-beam; repx:1; repy:2'));

    // Ambientlicht (warm, gedämpft)
    const amb = document.createElement('a-entity');
    amb.setAttribute('light', 'type:ambient;color:#c8a888;intensity:0.6');
    interior.appendChild(amb);

    // Kerzenlicht (Punktlicht mit warmem Gold)
    const pt = document.createElement('a-entity');
    pt.setAttribute('position', '0 1.6 -1.5');
    pt.setAttribute('light',
      'type:point;color:#f4a460;intensity:0.9;distance:8');
    interior.appendChild(pt);

    // ── Arbeitstisch (massive Theke) ──────────────────────────────────────
    // Thekenkörper (massiv)
    add(this._box(3.2, 0.85, 0.65, '#2a1a0e', 0, 0.425, -1.0,
      'tex-wood', 1.5, 0.4));
    // Thekenplatte
    add(this._box(3.4, 0.06, 0.75, '#3a2510', 0, 0.88, -1.0,
      'tex-wood', 1.5, 0.35));

    // Objekte auf der Theke:
    // Mörser + Stößel
    add(this._cyl(0.08, 0.10, '#808080', -0.8, 0.94, -1.0));
    // Kleines Fläschchen (lila, magisch)
    const flaskSmall = document.createElement('a-cylinder');
    flaskSmall.setAttribute('radius', '0.03');
    flaskSmall.setAttribute('height', '0.16');
    flaskSmall.setAttribute('segments-radial', '8');
    flaskSmall.setAttribute('position', '-0.4 0.96 -1.0');
    flaskSmall.setAttribute('material',
      'color:#8040c0;shader:flat;emissive:#8040c0;emissiveIntensity:0.8');
    interior.appendChild(flaskSmall);
    // Großes Fläschchen (gold)
    const flaskBig = document.createElement('a-cylinder');
    flaskBig.setAttribute('radius', '0.05');
    flaskBig.setAttribute('height', '0.20');
    flaskBig.setAttribute('segments-radial', '8');
    flaskBig.setAttribute('position', '0 0.98 -1.0');
    flaskBig.setAttribute('material',
      'color:#c8a020;shader:flat;emissive:#c8a020;emissiveIntensity:0.4');
    interior.appendChild(flaskBig);
    // Aufgeschlagenes Buch
    add(this._box(0.28, 0.02, 0.22, '#c8b080', 0.6, 0.89, -0.95));
    // Kerze
    add(this._cyl(0.022, 0.18, '#ede8d4', 1.0, 0.97, -1.0));
    // Kerzenflamme
    const flame = document.createElement('a-sphere');
    flame.setAttribute('radius', '0.024');
    flame.setAttribute('segments-width', '8');
    flame.setAttribute('segments-height', '6');
    flame.setAttribute('position', '1.0 1.07 -1.0');
    flame.setAttribute('material',
      'color:#ffee88;shader:flat;emissive:#ffcc44;emissiveIntensity:3.0');
    interior.appendChild(flame);
    // Kerzenlicht
    const candleLight = document.createElement('a-entity');
    candleLight.setAttribute('position', '0 1.8 -0.5');
    candleLight.setAttribute('light',
      'type:point;color:#c060ff;intensity:1.5;distance:5');
    interior.appendChild(candleLight);

    // ── Regal an Westwand ─────────────────────────────────────────────────
    // Unteres Regal
    add(this._box(0.18, 0.05, 1.2, '#3a2010', -2.08, 1.3, -0.6,
      'tex-beam', 1, 0.5));
    // Oberes Regal
    add(this._box(0.18, 0.05, 1.2, '#3a2010', -2.08, 1.9, -0.6,
      'tex-beam', 1, 0.5));

    // Flaschen auf Regalen
    [
      [-2.04, 1.45, -1.0, 0.030, 0.12, '#6040a0'],
      [-2.04, 1.45, -0.6, 0.035, 0.15, '#4060a0'],
      [-2.04, 1.45, -0.2, 0.028, 0.10, '#40a060'],
      [-2.04, 2.05, -0.9, 0.032, 0.14, '#a06040'],
      [-2.04, 2.05, -0.5, 0.025, 0.11, '#a0a040'],
      [-2.04, 2.05, -0.1, 0.030, 0.13, '#604080'],
    ].forEach(([x, y, z, r, h, col]) => {
      const bottle = document.createElement('a-cylinder');
      bottle.setAttribute('radius', r);
      bottle.setAttribute('height', h);
      bottle.setAttribute('segments-radial', '8');
      bottle.setAttribute('position', `${x} ${y} ${z}`);
      bottle.setAttribute('material', `color:${col};shader:flat`);
      interior.appendChild(bottle);
    });

    // ── Leuchtkristall (Deko, mystische Atmosphäre) ───────────────────────
    const crystal = document.createElement('a-sphere');
    crystal.setAttribute('radius', '0.06');
    crystal.setAttribute('segments-width', '8');
    crystal.setAttribute('segments-height', '6');
    crystal.setAttribute('position', '0 0.96 -1.45');
    crystal.setAttribute('material',
      'color:#8866cc;emissive:#6633aa;emissiveIntensity:1.2;shader:flat');
    interior.appendChild(crystal);
    this._crystal = crystal;

    // Kleiner lila Lichtakzent
    const accentLight = document.createElement('a-entity');
    accentLight.setAttribute('position', '0 0.9 -1.5');
    accentLight.setAttribute('light',
      'type:point;color:#8866cc;intensity:0.3;distance:3');
    interior.appendChild(accentLight);
  },

  // ── NPC-Figure (Alchemistin / weise Fee in Verkleidung) ─────────────────
  _buildInteriorFigure() {
    const ROBE = '#1a1520';
    const SKIN = '#c8a070';
    const HAIR = '#c8c8d0';
    const BOOT = '#2c1a0a';

    const interior = document.getElementById('alchemist-interior');
    if (!interior) { setTimeout(() => this._buildInteriorFigure(), 100); return; }

    // Bereits besucht → Figur unsichtbar
    if (window.QUEST1 && window.QUEST1.triggered) {
      // Root dennoch anlegen (für spätere Referenz), aber invisible
      const invisibleRoot = document.createElement('a-entity');
      invisibleRoot.setAttribute('position', '0 0 -0.8');
      invisibleRoot.setAttribute('rotation', '0 180 0');
      invisibleRoot.object3D.visible = false;
      interior.appendChild(invisibleRoot);
      this._insideRoot = invisibleRoot;
      this._insideNpcRoot = invisibleRoot;
      window._alchemistRoot = invisibleRoot;
      // Crystal als Child von _insideRoot (verschwindet mit NPC)
      if (this._crystal && this._crystal.parentNode) {
        this._crystal.parentNode.removeChild(this._crystal);
        this._insideRoot.appendChild(this._crystal);
        this._crystal.setAttribute('position', '0 0.5 0.3');
      }
      return;
    }

    const root = document.createElement('a-entity');
    root.setAttribute('position', '0 0 -1.5');
    root.setAttribute('rotation', '0 180 0');

    const npcRoot = document.createElement('a-entity');

    // Schuhe
    npcRoot.appendChild(this._box(0.10, 0.05, 0.14, BOOT,  0.075, 0.025,  0.02));
    npcRoot.appendChild(this._box(0.10, 0.05, 0.14, BOOT, -0.075, 0.025,  0.02));

    // Beine (unter Robe verdeckt, schmal)
    npcRoot.appendChild(this._cyl(0.05, 0.40, ROBE,  0.07, 0.22, 0));
    npcRoot.appendChild(this._cyl(0.05, 0.40, ROBE, -0.07, 0.22, 0));

    // Hüfte
    npcRoot.appendChild(this._box(0.28, 0.10, 0.20, ROBE, 0, 0.48, 0));
    // Gürtel (dünn, heller)
    npcRoot.appendChild(this._box(0.30, 0.03, 0.22, '#3a2a30', 0, 0.54, 0));

    // Torso (Robe)
    npcRoot.appendChild(this._box(0.34, 0.38, 0.24, ROBE, 0, 0.76, 0));

    // Schultern (breiter durch Umhang)
    npcRoot.appendChild(this._box(0.42, 0.08, 0.26, ROBE, 0, 0.94, 0));

    // Rückenumhang (fällt hinten runter)
    npcRoot.appendChild(this._box(0.30, 0.50, 0.06, ROBE, 0, 0.68, -0.14));

    // Arme (unter Robe)
    const mkArm = sx => {
      const piv = document.createElement('a-entity');
      piv.setAttribute('position', `${sx * 0.20} 0.94 0`);
      piv.setAttribute('rotation', `15 0 ${sx * -10}`);
      piv.appendChild(this._cyl(0.045, 0.30, ROBE,  0, -0.15, 0));
      piv.appendChild(this._cyl(0.038, 0.20, SKIN,   0, -0.37, 0));
      piv.appendChild(this._sph(0.045, SKIN,           0, -0.50, 0));
      return piv;
    };
    npcRoot.appendChild(mkArm(-1));
    npcRoot.appendChild(mkArm(1));

    // Hals
    npcRoot.appendChild(this._cyl(0.045, 0.08, SKIN, 0, 1.04, 0));

    // Kopf
    npcRoot.appendChild(this._sph(0.14, SKIN, 0, 1.19, 0));

    // Silbernes Haar (seitlich)
    npcRoot.appendChild(this._box(0.06, 0.12, 0.05, HAIR, -0.15, 1.20, -0.04));
    npcRoot.appendChild(this._box(0.06, 0.12, 0.05, HAIR,  0.15, 1.20, -0.04));
    // Haarknoten oben
    npcRoot.appendChild(this._sph(0.06, HAIR, 0, 1.34, 0));

    // Kapuze (kastenförmig über Kopf, Gesicht bleibt halb sichtbar)
    npcRoot.appendChild(this._box(0.34, 0.28, 0.32, ROBE, 0, 1.28, -0.04));
    // Kapuzenrand vorne
    npcRoot.appendChild(this._box(0.34, 0.04, 0.04, '#2a2030', 0, 1.15, 0.14));

    // Gesicht (angedeutet, Augen im Schatten)
    // Augenweiß (leicht sichtbar)
    npcRoot.appendChild(this._sph(0.020, '#eeece6', -0.048, 1.22, 0.10));
    npcRoot.appendChild(this._sph(0.020, '#eeece6',  0.048, 1.22, 0.10));
    // Pupillen (dunkel)
    npcRoot.appendChild(this._sph(0.012, '#0a0604', -0.048, 1.22, 0.11));
    npcRoot.appendChild(this._sph(0.012, '#0a0604',  0.048, 1.22, 0.11));
    // Nase
    npcRoot.appendChild(this._sph(0.017, SKIN, 0, 1.18, 0.12));
    // Mund
    npcRoot.appendChild(this._box(0.05, 0.010, 0.008, '#7a5040', 0, 1.14, 0.12));

    root.appendChild(npcRoot);
    interior.appendChild(root);
    this._insideRoot = root;
    this._insideNpcRoot = npcRoot;
    window._alchemistRoot = root;
    // Crystal als Child von _insideRoot (verschwindet mit NPC)
    if (this._crystal && this._crystal.parentNode) {
      this._crystal.parentNode.removeChild(this._crystal);
      this._insideRoot.appendChild(this._crystal);
      this._crystal.setAttribute('position', '0 0.5 0.3');
    }
  },

  // ── Dialog-Bubbles ──────────────────────────────────────────────────────
  _mkBubble(text, bgW, bgH) {
    const h = document.createElement('a-entity');
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width',  (bgW + 0.06).toFixed(2));
    frame.setAttribute('height', (bgH + 0.06).toFixed(2));
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#604080;shader:flat;transparent:true;opacity:0.50;' +
      'emissive:#604080;emissiveIntensity:0.18');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width',  bgW.toFixed(2));
    bg.setAttribute('height', bgH.toFixed(2));
    bg.setAttribute('material',
      'color:#0c0810;shader:flat;transparent:true;opacity:0.90');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', text);
    txt.setAttribute('align', 'center');
    txt.setAttribute('baseline', 'center');
    txt.setAttribute('color', '#d8cce8');
    txt.setAttribute('width', (bgW - 0.12).toFixed(2));
    txt.setAttribute('wrap-count', '30');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    return h;
  },

  _buildBubbles() {
    this._bubbles.b1 = this._mkBubble(
      'Alchemistin: Ich habe dich erwartet.\nNicht heute – aber irgendwann.',
      1.80, 0.32);
    this._bubbles.b2b = this._mkBubble(
      'Alchemistin: Der Haendler weiss nicht\nwas er gesehen hat.\nAber du weisst es auch noch nicht.',
      1.80, 0.56);
    this._bubbles.b2c = this._mkBubble(
      'Alchemistin: Das Wappen. Du hast es gefunden.\nDann ist es Zeit.',
      1.80, 0.32);
    this._bubbles.b3 = this._mkBubble(
      'Alchemistin: In dieser Stadt lebt ein Hund.\nGoldene Augen – du wirst ihn erkennen.\nEr hat auf dich gewartet.\nLaenger als ich.',
      1.80, 0.64);
    this._bubbles.b4 = this._mkBubble(
      'Alchemistin: Fuettere ihn. Dann folge ihm.\nWas er dir zeigt – merk es dir.',
      1.80, 0.40);
    this._bubbles.b4_no_food = this._mkBubble(
      'Alchemistin: Fuettere ihn. Dann folge ihm.\nWas er dir zeigt – merk es dir.\nUnd besorge dir etwas zum Fuettern.\nDer Haendler hilft dir.',
      1.80, 0.64);
    this._bubbles.b5b = this._mkBubble(
      'Alchemistin: Jemand der sich erinnert.\nFuer dich – bis du es selbst kannst.',
      1.80, 0.32);
  },

  // ── Hint (E/Trigger) ─────────────────────────────────────────────────────
  _buildHint() {
    const h = document.createElement('a-entity');
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width', '1.28');
    frame.setAttribute('height', '0.28');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#604080;shader:flat;transparent:true;opacity:0.50;' +
      'emissive:#604080;emissiveIntensity:0.18');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width', '1.22');
    bg.setAttribute('height', '0.22');
    bg.setAttribute('material',
      'color:#0c0810;shader:flat;transparent:true;opacity:0.90');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', 'E / Trigger: Ansprechen');
    txt.setAttribute('align', 'center');
    txt.setAttribute('baseline', 'center');
    txt.setAttribute('color', '#d8cce8');
    txt.setAttribute('width', '1.08');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    this._hint = h;
  },

  // ═════════════════════════════════════════════════════════════════════════
  // TICK
  // ═════════════════════════════════════════════════════════════════════════
  tick(t, dt) {
    if (!window.ALCHEMIST_INSIDE) {
      // Bubbles ausblenden
      Object.values(this._bubbles).forEach(b => {
        if (b && b.object3D) b.object3D.visible = false;
      });
      if (this._bubbleTimer) {
        clearTimeout(this._bubbleTimer);
        this._bubbleTimer = null;
      }
      if (this._autoTimer) {
        clearTimeout(this._autoTimer);
        this._autoTimer = null;
      }
      return;
    }

    // Auto-b1 beim ersten Betreten
    if (!this._autoDone && alchemistState.dialogStep === 0) {
      if (!this._autoTimer) {
        this._autoTimer = setTimeout(() => {
          this._autoTimer = null;
          if (!window.ALCHEMIST_INSIDE) return;
          this._autoDone = true;
          this._showBubble('b1', 4000, () => {
            alchemistState.dialogStep = 1;
          });
        }, 1500);
      }
    }

    if (!this._cam || !this._insideRoot || !this._insideNpcRoot) return;

    const clampedDt = Math.min(dt, 50) * 0.001;
    this._cam.object3D.getWorldPosition(this._camWP);
    this._insideRoot.object3D.getWorldPosition(this._npcWorldPos);

    const dx = this._camWP.x - this._npcWorldPos.x;
    const dz = this._camWP.z - this._npcWorldPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Proximity + NPC-Rotation
    if (dist <= 2.0) {
      this._near = true;
      if (this._insideRoot && this._insideRoot.object3D) {
        const angle = Math.atan2(dx, dz);
        this._insideRoot.object3D.rotation.y = angle;
      }
      // Hint anzeigen wenn kein Dialog aktiv
      if (!this._bubbleTimer && alchemistState.dialogStep > 0) {
        if (this._hint) {
          this._hint.object3D.visible = true;
          this._hint.object3D.position.set(
            this._npcWorldPos.x,
            this._npcWorldPos.y + 1.8,
            this._npcWorldPos.z
          );
          this._hint.object3D.rotation.y = Math.atan2(dx, dz);
        }
      }
    } else {
      this._near = false;
      if (this._hint) this._hint.object3D.visible = false;
    }

    // Update bubble facing
    Object.values(this._bubbles).forEach(b => {
      if (b.object3D && b.object3D.visible) {
        b.object3D.rotation.y = Math.atan2(
          this._camWP.x - this._npcWorldPos.x,
          this._camWP.z - this._npcWorldPos.z,
        );
      }
    });
  },

  // ═════════════════════════════════════════════════════════════════════════
  // DIALOG
  // ═════════════════════════════════════════════════════════════════════════
  _triggerDialog() {
    const now = performance.now();
    if (now - alchemistState.lastTrigger < alchemistState.cooldownMs) return;
    if (this._bubbleTimer) return;
    alchemistState.lastTrigger = now;

    const step = alchemistState.dialogStep;

    // Schritt 0 → Auto-Bubble läuft noch oder wartet
    if (step === 0) return;

    // Schritt 1: Spieler spricht Alchemistin an → Bubble-Kette
    if (step === 1) {
  if (typeof window.showNarrativeText === 'function') {
    window.showNarrativeText(
      'Du: Der Haendler hat mich geschickt.', 2500);
  }
  // Cooldown für diesen Step ignorieren
  alchemistState.lastTrigger = 0;
  setTimeout(() => {
    if (!window.ALCHEMIST_INSIDE) return;
    this._showBubble('b2b', 5000, () => {
      this._showBubble('b2c', 4000, () => {
        alchemistState.dialogStep = 2;
      });
    });
  }, 2600);
  return;
}

    // Schritt 2: Hund-Hinweis
    if (step === 2) {
      this._showBubble('b3', 7000, () => {
        alchemistState.dialogStep = 3;
      });
      return;
    }

    // Schritt 3: Füttere ihn + Quest-Trigger
    if (step === 3) {
      const hasFood = window.INVENTORY && window.INVENTORY.dogFood;
      const key = hasFood ? 'b4' : 'b4_no_food';
      this._showBubble(key, 5000, () => {
        alchemistState.dialogStep = 4;
        window.QUEST1.triggered = true;
        // NPC dreht sich weg (reset local rotation)
        if (this._insideNpcRoot && this._insideNpcRoot.object3D) {
          this._insideNpcRoot.object3D.rotation.y = 0;
        }
        if (this._insideRoot && this._insideRoot.object3D) {
          this._insideRoot.object3D.rotation.y = Math.PI;
        }
      });
      return;
    }

    // Schritt 4: Optionaler Zusatzdialog
    if (step === 4) {
      if (window.QUEST1 && !window.QUEST1.alchemistHint) {
        if (typeof window.showNarrativeText === 'function') {
          window.showNarrativeText('Du: Wer bist du?', 2000);
        }
        setTimeout(() => {
          this._showBubble('b5b', 5000, () => {
            window.QUEST1.alchemistHint = true;
          });
        }, 2100);
      }
      return;
    }
  },

  _showBubble(key, duration, onEnd) {
    // Hint ausblenden während Dialog
    if (this._hint) this._hint.object3D.visible = false;

    // Position updaten falls nicht in tick()
    if (this._insideRoot && this._insideRoot.object3D) {
      this._insideRoot.object3D.getWorldPosition(this._npcWorldPos);
    }
    if (this._cam && this._cam.object3D) {
      this._cam.object3D.getWorldPosition(this._camWP);
    }

    // Hide all bubbles
    Object.values(this._bubbles).forEach(b => {
      if (b && b.object3D) b.object3D.visible = false;
    });

    const bubble = this._bubbles[key];
    if (!bubble) return;

    // Bubble vor dem NPC (Richtung Spieler)
    const dirX = this._camWP.x - this._npcWorldPos.x;
    const dirZ = this._camWP.z - this._npcWorldPos.z;
    const len = Math.sqrt(dirX*dirX + dirZ*dirZ) || 1;
    bubble.object3D.position.set(
      this._npcWorldPos.x + (dirX/len) * 0.8,
      this._npcWorldPos.y + 1.8,
      this._npcWorldPos.z + (dirZ/len) * 0.8
    );
    bubble.object3D.rotation.y = Math.atan2(
      this._camWP.x - this._npcWorldPos.x,
      this._camWP.z - this._npcWorldPos.z,
    );
    bubble.object3D.visible = true;

    this._bubbleTimer = setTimeout(() => {
      bubble.object3D.visible = false;
      this._bubbleTimer = null;
      if (onEnd) onEnd();
    }, duration);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REMOVE
  // ═════════════════════════════════════════════════════════════════════════
  remove() {
    if (this._insideRoot && this._insideRoot.parentNode)
      this._insideRoot.parentNode.removeChild(this._insideRoot);
    Object.values(this._bubbles).forEach(b => {
      if (b && b.parentNode) b.parentNode.removeChild(b);
    });
    delete window._alchemistRoot;
  },
});