// ═══════════════════════════════════════════════════════════════════════════
// KESSELSTADT SZENE – A-Frame Komponente
// Baut den gesamten Stadtinhalt dynamisch auf.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Globale NPC-Utilities ────────────────────────────────────────────────
window.NPC_REGISTRY = window.NPC_REGISTRY || {};

window.showNarrativeText = function(text, duration) {
  duration = duration || 4000;
  const existing = document.getElementById('narrative-text-panel');
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

  const cam = document.getElementById('camera');
  if (!cam) return;

  const h = document.createElement('a-entity');
  h.id = 'narrative-text-panel';
  h.setAttribute('position', '0 -0.35 -1.8');

  const frame = document.createElement('a-plane');
  frame.setAttribute('width',  '2.40');
  frame.setAttribute('height', '0.50');
  frame.setAttribute('position', '0 0 -0.003');
  frame.setAttribute('material',
    'color:#888890;shader:flat;transparent:true;opacity:0.50;' +
    'emissive:#aaaaaa;emissiveIntensity:0.26');
  h.appendChild(frame);

  const bg = document.createElement('a-plane');
  bg.setAttribute('width',  '2.34');
  bg.setAttribute('height', '0.44');
  bg.setAttribute('material',
    'color:#0c0c10;shader:flat;transparent:true;opacity:0.92');
  h.appendChild(bg);

  const txt = document.createElement('a-text');
  txt.setAttribute('value', text);
  txt.setAttribute('align', 'center');
  txt.setAttribute('color', '#e8e8d8');
  txt.setAttribute('width', '2.12');
  txt.setAttribute('position', '0 0 0.005');
  h.appendChild(txt);

  cam.appendChild(h);

  setTimeout(() => {
    if (h.parentNode) h.parentNode.removeChild(h);
  }, duration);
};

window.showHint = function(text) {
  const existing = document.getElementById('hint-text-panel');
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

  const cam = document.getElementById('camera');
  if (!cam) return;

  const h = document.createElement('a-entity');
  h.id = 'hint-text-panel';
  h.setAttribute('position', '0 -0.60 -1.8');

  const frame = document.createElement('a-plane');
  frame.setAttribute('width',  '1.40');
  frame.setAttribute('height', '0.28');
  frame.setAttribute('position', '0 0 -0.003');
  frame.setAttribute('material',
    'color:#b08848;shader:flat;transparent:true;opacity:0.48;' +
    'emissive:#b08848;emissiveIntensity:0.32');
  h.appendChild(frame);

  const bg = document.createElement('a-plane');
  bg.setAttribute('width',  '1.34');
  bg.setAttribute('height', '0.22');
  bg.setAttribute('material',
    'color:#1a0800;shader:flat;transparent:true;opacity:0.92');
  h.appendChild(bg);

  const txt = document.createElement('a-text');
  txt.setAttribute('value', text);
  txt.setAttribute('align', 'center');
  txt.setAttribute('color', '#ffe8b0');
  txt.setAttribute('width', '1.20');
  txt.setAttribute('position', '0 0 0.005');
  h.appendChild(txt);

  cam.appendChild(h);

  // Auto-remove after 2s
  setTimeout(() => {
    if (h.parentNode) h.parentNode.removeChild(h);
  }, 2000);
};

AFRAME.registerComponent('gate-trigger', {
  // Westtor wird durch lichtreich-gate gesteuert.
  // Südtor wird durch quest1-gate gesteuert.
  init() {},
  tick() {},
});

// ─── Alte Frau NPC (weise Fee in Verkleidung, Quest 1) ───────────────────────
// Position: (-6.5, 0, 4.5) – ruhige Ecke nordöstlich des Gasthauses.
// Erscheint nur einmal, solange QUEST1.triggered falsch ist.
// Bei < 2.5m: Dialog 4s → NPC verschwindet, QUEST1.triggered = true.
AFRAME.registerComponent('old-woman-npc', {

  init() {
    if (!window.QUEST1) window.QUEST1 = {};
    this._cam    = null;
    this._camWP  = new THREE.Vector3();
    this._root   = null;
    this._panel  = null;
    this._shown  = false;
    this._done   = true; // Quest 0 noch nicht implementiert – NPC bis dahin versteckt
    this._showAt = 0;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });
  },

  // ── Mesh-Hilfsfunktionen (lokal) ─────────────────────────────────────────
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

  _build() {
    if (this._done) return;
    this._buildFigure();
    this._buildPanel();
  },

  _buildFigure() {
    const SKIN  = '#c8a070';   // blassere, ältere Haut
    const CLOAK = '#8a8a90';   // grauer Umhang
    const DARK  = '#606068';   // dunkles Grau (Gewand unten)
    const HAIR  = '#e0e0d8';   // weißes Haar
    const BOOT  = '#3a2818';

    const root = document.createElement('a-entity');
    root.setAttribute('position', '-6.5 0 4.5');
    root.setAttribute('rotation', '0 125 0');   // blickt zum Marktplatz/Brunnen

    // Gebückte Haltung: Körper leicht nach vorne geneigt
    const tilt = document.createElement('a-entity');
    tilt.setAttribute('rotation', '-12 0 0');

    // Schuhe (unter Gewand)
    tilt.appendChild(this._b(0.09, 0.05, 0.13, BOOT,  0.065, 0.025,  0.01));
    tilt.appendChild(this._b(0.09, 0.05, 0.13, BOOT, -0.065, 0.025,  0.01));

    // Gewand unten (bedeckt Beine vollständig)
    tilt.appendChild(this._b(0.30, 0.50, 0.24, DARK,  0, 0.30, 0));
    tilt.appendChild(this._b(0.34, 0.06, 0.26, CLOAK, 0, 0.56, 0));  // Hüftband

    // Torso / Umhang
    tilt.appendChild(this._b(0.32, 0.36, 0.22, CLOAK, 0, 0.74, 0));

    // Schultern (breiter – Umhang-Drape)
    tilt.appendChild(this._b(0.44, 0.07, 0.24, CLOAK, 0, 0.91, 0));

    // Rückenumhang
    tilt.appendChild(this._b(0.30, 0.58, 0.07, CLOAK, 0, 0.65, -0.14));

    // Arme (herabhängend, leicht nach vorne)
    const mkArm = sx => {
      const piv = document.createElement('a-entity');
      piv.setAttribute('position', `${sx * 0.205} 0.91 0`);
      piv.setAttribute('rotation', `20 0 ${sx * -12}`);
      piv.appendChild(this._c(0.048, 0.32, CLOAK,  0, -0.16, 0));
      piv.appendChild(this._c(0.038, 0.20, SKIN,   0, -0.37, 0));
      piv.appendChild(this._s(0.048, SKIN,           0, -0.51, 0));
      return piv;
    };
    tilt.appendChild(mkArm(-1));
    tilt.appendChild(mkArm( 1));

    // Hals
    tilt.appendChild(this._c(0.046, 0.08, SKIN, 0, 1.015, 0));

    // Kopf
    tilt.appendChild(this._s(0.132, SKIN, 0, 1.160, 0));

    // Kopftuch / Haube (grau)
    tilt.appendChild(this._b(0.28, 0.10, 0.26, CLOAK, 0, 1.275, -0.012));
    // Weißes Haar an den Seiten
    tilt.appendChild(this._b(0.055, 0.11, 0.048, HAIR, -0.138, 1.162, -0.038));
    tilt.appendChild(this._b(0.055, 0.11, 0.048, HAIR,  0.138, 1.162, -0.038));
    // Hauben-Rand vorne
    tilt.appendChild(this._b(0.28, 0.055, 0.04, DARK, 0, 1.230, 0.122));

    // Gesicht
    tilt.appendChild(this._s(0.022, '#eeece6', -0.048, 1.200, 0.106));  // Augenweiß L
    tilt.appendChild(this._s(0.022, '#eeece6',  0.048, 1.200, 0.106));  // Augenweiß R
    tilt.appendChild(this._s(0.013, '#2a1808', -0.048, 1.200, 0.117));  // Pupille L
    tilt.appendChild(this._s(0.013, '#2a1808',  0.048, 1.200, 0.117));  // Pupille R
    tilt.appendChild(this._s(0.018, SKIN, 0, 1.158, 0.124));            // Nase
    tilt.appendChild(this._b(0.058, 0.012, 0.010, '#7a3020', 0, 1.124, 0.118)); // Mund

    root.appendChild(tilt);
    this.el.sceneEl.appendChild(root);
    this._root = root;
  },

  _buildPanel() {
    const h = document.createElement('a-entity');
    h.setAttribute('position', '-6.5 -200 4.5');
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width',  '2.10');
    frame.setAttribute('height', '0.42');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#888890;shader:flat;transparent:true;opacity:0.50;' +
      'emissive:#aaaaaa;emissiveIntensity:0.26');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width',  '2.04');
    bg.setAttribute('height', '0.36');
    bg.setAttribute('material',
      'color:#0c0c10;shader:flat;transparent:true;opacity:0.92');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value',
      'Finde den Hund mit den goldenen\nAugen. Er kennt den Weg.');
    txt.setAttribute('align', 'center');
    txt.setAttribute('color', '#e8e8d8');
    txt.setAttribute('width', '1.82');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    this._panel = h;
  },

  tick(t) {
    if (this._done) return;
    if (!this._cam) this._cam = document.getElementById('camera');
    if (!this._cam) return;

    // Knochen bereits aufgehoben → Quest läuft schon, NPC nicht mehr nötig
    if (window.INVENTORY && window.INVENTORY.dogFood && !this._shown) {
      this._dismiss();
      return;
    }

    this._cam.object3D.getWorldPosition(this._camWP);
    const dx = this._camWP.x + 6.5;   // camX - (-6.5)
    const dz = this._camWP.z - 4.5;

    if (!this._shown && (dx * dx + dz * dz) < 6.25) {   // 2.5m Radius
      this._shown  = true;
      this._showAt = t;
      if (!window.QUEST1) window.QUEST1 = {};
      window.QUEST1.triggered = true;
      if (this._panel) this._panel.setAttribute('visible', 'true');
    }

    if (this._shown && this._panel && this._panel.object3D) {
      this._panel.object3D.position.set(-6.5, 1.68, 4.5);
      this._panel.object3D.rotation.y = Math.atan2(
        this._camWP.x + 6.5,
        this._camWP.z - 4.5,
      );
      if (t - this._showAt >= 4000) this._dismiss();
    }
  },

  _dismiss() {
    this._done = true;
    if (this._panel) this._panel.setAttribute('visible', 'false');
    if (this._root && this._root.parentNode)
      this._root.parentNode.removeChild(this._root);
    this._root = null;
  },

  remove() {
    if (this._root && this._root.parentNode)
      this._root.parentNode.removeChild(this._root);
    if (this._panel && this._panel.parentNode)
      this._panel.parentNode.removeChild(this._panel);
  },
});

// ─── Gasthaus-Tür: Eintreten / Verlassen ─────────────────────────────────────
// Außentür bei Weltpos (-9, ~10.5). Fade-Überblendung + Sichtbarkeitsumschaltung.
// #ks-outdoor (gesamte Außenwelt) wird beim Eintreten ausgeblendet,
// #gasthaus-interior (Platzhalter, später scenes/gasthaus.js) eingeblendet.

const INN_OUTER = { x: -9, z: 10.52 };  // Außentür Weltpos XZ (Gasthaus-Vorderkante)
const INN_INNER = { x: -9, z: 10.0  };  // Trigger-Pos von innen (Rückseite Tür)
const INN_R2    = 4;                      // Interaktionsradius² = 2m

AFRAME.registerComponent('gasthaus-door', {

  init() {
    this._cam           = null;
    this._rig           = null;
    this._camWP         = new THREE.Vector3();
    this._inside        = false;
    this._transitioning = false;
    this._cooldown      = 0;
    this._near          = false;
    this._hint          = null;
    this._innerHint     = null;
    this._touchBtn      = null;
    this._fade          = null;
    this._interior      = null;
    this._hiddenEls     = [];
    this._gasthausBox   = null;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    document.addEventListener('keydown', e => {
      if (e.code === 'KeyE' && this._near) this._tryTransit();
    });

    sc.addEventListener('loaded', () => {
      const rh = document.getElementById('rightHand');
      if (rh) rh.addEventListener('triggerdown', () => { if (this._near) this._tryTransit(); });
    }, { once: true });
  },

  _build() {
    this._cam = document.getElementById('camera');
    this._rig = document.getElementById('rig');
    this._buildFade();
    this._buildHint();
    this._buildInnerHint();
    this._buildInterior();
    this._buildTouchBtn();
  },

  // ── Schwarze Fade-Ebene (Kind der Kamera, immer vor dem Spieler) ─────────
  _buildFade() {
    const fade = document.createElement('a-plane');
    fade.setAttribute('width',  '40');
    fade.setAttribute('height', '40');
    fade.setAttribute('position', '0 0 -0.06');
    fade.setAttribute('material',
      'color:#000;shader:flat;transparent:true;opacity:0;depthTest:false;side:double');
    fade.setAttribute('animation__out',
      'property:material.opacity;from:0;to:1;dur:300;easing:linear;autoplay:false;startEvents:fade-black');
    fade.setAttribute('animation__in',
      'property:material.opacity;from:1;to:0;dur:300;easing:linear;autoplay:false;startEvents:fade-clear');
    if (this._cam) this._cam.appendChild(fade);
    this._fade = fade;
  },

  // ── Hinweis-Panel-Helfer ──────────────────────────────────────────────────
  _mkPanel(col, label) {
    const h = document.createElement('a-entity');
    h.setAttribute('position', '0 -200 0');
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width',  '1.22');
    frame.setAttribute('height', '0.26');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      `color:${col};shader:flat;transparent:true;opacity:0.48;emissive:${col};emissiveIntensity:0.32`);
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width',  '1.16');
    bg.setAttribute('height', '0.20');
    bg.setAttribute('material', 'color:#1a0800;shader:flat;transparent:true;opacity:0.92');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', label);
    txt.setAttribute('align', 'center');
    txt.setAttribute('color', '#ffe8b0');
    txt.setAttribute('width', '1.02');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    return h;
  },

  _buildHint() {
    this._hint      = this._mkPanel('#b08848', 'E / Trigger: Eintreten');
  },
  _buildInnerHint() {
    this._innerHint = this._mkPanel('#907040', 'E / Trigger: Verlassen');
  },

  // ── Innenraum-Platzhalter (leer – Inhalt folgt in scenes/gasthaus.js) ────
  _buildInterior() {
    const el = document.createElement('a-entity');
    el.setAttribute('id', 'gasthaus-interior');
    el.setAttribute('position', '-9 0 8');
    el.setAttribute('visible', 'false');
    // Unsichtbarer Boden – ermöglicht dem Spieler zu stehen und den Exit-Trigger zu erreichen
    const floor = document.createElement('a-plane');
    floor.setAttribute('rotation', '-90 0 0');
    floor.setAttribute('width',  '20');
    floor.setAttribute('height', '20');
    floor.setAttribute('material', 'shader:flat;transparent:true;opacity:0;side:double');
    el.appendChild(floor);
    this.el.sceneEl.appendChild(el);
    this._interior = el;
  },

  // ── Mobile Touch-Button ───────────────────────────────────────────────────
  _buildTouchBtn() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch || document.getElementById('inn-touch-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'inn-touch-btn';
    btn.textContent = 'Eintreten';
    btn.style.cssText =
      'position:fixed;bottom:200px;left:50%;transform:translateX(-50%);' +
      'background:rgba(192,144,80,0.90);color:#1a0800;border:none;' +
      'border-radius:30px;padding:12px 30px;font-size:17px;' +
      'font-family:sans-serif;font-weight:bold;' +
      'display:none;z-index:10001;touch-action:none;';
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      this._tryTransit();
    }, { passive: false });
    document.body.appendChild(btn);
    this._touchBtn = btn;
  },

  // ── Fade-Helfer ───────────────────────────────────────────────────────────
  _fadeOut(cb) {
    if (!this._fade) { cb(); return; }
    this._fade.emit('fade-black');
    setTimeout(cb, 320);
  },
  _fadeIn(cb) {
    if (!this._fade) { cb(); return; }
    this._fade.emit('fade-clear');
    setTimeout(cb, 320);
  },

  // ── Transitions-Logik ────────────────────────────────────────────────────
  _tryTransit() {
    if (!this._near || this._transitioning) return;
    this._transitioning = true;
    const goingIn = !this._inside;
    this._fadeOut(() => {
      if (goingIn) this._doEnter(); else this._doExit();
      this._fadeIn(() => {
        this._transitioning = false;
        this._cooldown = 4.0;
      });
    });
  },

  _doEnter() {
    this._inside = true;

    // Alle sichtbaren Szenen-Kinder ausblenden: ks-outdoor, Himmel, Feenreich,
    // Lichtreich, Nacht-Wachen und alle anderen Zonen-Entities.
    // Ausnahmen: Rig (Spieler), Interior, Sonne und Ambient-Licht.
    const KEEP = new Set(['rig', 'gasthaus-interior', 'sun', 'ambLight']);
    this._hiddenEls = [];
    Array.from(this.el.sceneEl.children).forEach(el => {
      if (!el.object3D || KEEP.has(el.id)) return;
      if (el.object3D.visible) {
        el.object3D.visible = false;
        this._hiddenEls.push(el);
      }
    });

    // Gasthaus-Kollisionsbox aus player-collision entfernen,
    // damit der Spieler im Innenraum navigieren kann.
    const pc = this.el.sceneEl.components['player-collision'];
    if (pc) {
      const idx = pc._boxes.findIndex(b => b.x0 === -12.3 && b.z0 === 5.2);
      if (idx !== -1) this._gasthausBox = pc._boxes.splice(idx, 1)[0];
    }

    if (this._interior) this._interior.setAttribute('visible', 'true');
    if (this._rig && this._cam) {
      // Kamera-Lokaloffset (WASD-Desktop oder HMD-VR) kompensieren,
      // damit die Kamera sicher bei Weltpos (-9, *, 7.5) landet.
      const cl = this._cam.object3D.position;
      this._rig.object3D.position.set(-9 - cl.x, 0, 7.5 - cl.z);
    }
    this._near = false;
    if (this._hint) this._hint.setAttribute('visible', 'false');
    if (this._touchBtn) { this._touchBtn.textContent = 'Verlassen'; this._touchBtn.style.display = 'none'; }
  },

  _doExit() {
    this._inside = false;

    // Alle beim Eintreten ausgeblendeten Elemente wiederherstellen.
    this._hiddenEls.forEach(el => { if (el.parentNode) el.object3D.visible = true; });
    this._hiddenEls = [];

    // Gasthaus-Kollisionsbox wiederherstellen.
    const pc = this.el.sceneEl.components['player-collision'];
    if (pc && this._gasthausBox) {
      pc._boxes.push(this._gasthausBox);
      this._gasthausBox = null;
    }

    if (this._interior) this._interior.setAttribute('visible', 'false');
    if (this._rig && this._cam) {
      const cl = this._cam.object3D.position;
      this._rig.object3D.position.set(-9 - cl.x, 0, 12.5 - cl.z);
    }
    this._near = false;
    if (this._innerHint) this._innerHint.setAttribute('visible', 'false');
    if (this._touchBtn) { this._touchBtn.textContent = 'Eintreten'; this._touchBtn.style.display = 'none'; }
  },

  // ── Tick: Annäherungs-Prüfung + Panel-Positionierung ─────────────────────
  tick(t, dt) {
    if (this._transitioning || !this._cam) return;
    if (this._cooldown > 0) { this._cooldown -= Math.min(dt, 200) * 0.001; return; }

    this._cam.object3D.getWorldPosition(this._camWP);

    const trig       = this._inside ? INN_INNER : INN_OUTER;
    const activeHint = this._inside ? this._innerHint : this._hint;
    const dx   = this._camWP.x - trig.x;
    const dz   = this._camWP.z - trig.z;
    const near = (dx * dx + dz * dz) < INN_R2;

    if (near !== this._near) {
      this._near = near;
      if (activeHint) activeHint.setAttribute('visible', near ? 'true' : 'false');
      if (this._touchBtn) this._touchBtn.style.display = near ? 'block' : 'none';
    }

    if (this._near && activeHint && activeHint.object3D) {
      activeHint.object3D.position.set(trig.x, 2.4, trig.z);
      activeHint.object3D.rotation.y = Math.atan2(
        this._camWP.x - trig.x,
        this._camWP.z - trig.z,
      );
    }
  },

  remove() {
    [this._hint, this._innerHint, this._interior].forEach(el => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  },
});

// ─── Schmiede-Tür: Eintreten / Verlassen ─────────────────────────────────────
// Nur tagsüber (mode: day / morning) betretbar.
// Außentür bei Weltpos (-9, ~-5.5). Gleiche Fade-Logik wie gasthaus-door.

const FORGE_OUTER = { x: -9, z: -5.5 };  // Außentür Weltpos XZ
const FORGE_INNER = { x: -9, z: -4.5 };  // Trigger-Pos von innen
const FORGE_R2    = 4;                     // Interaktionsradius² = 2m

AFRAME.registerComponent('schmiede-door', {

  init() {
    this._cam           = null;
    this._rig           = null;
    this._camWP         = new THREE.Vector3();
    this._inside        = false;
    this._transitioning = false;
    this._cooldown      = 0;
    this._near          = false;
    this._hint          = null;
    this._innerHint     = null;
    this._closedHint    = null;
    this._touchBtn      = null;
    this._fade          = null;
    this._interior      = null;
    this._hiddenEls     = [];
    this._schmiedeBox   = null;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    document.addEventListener('keydown', e => {
      if (e.code === 'KeyE' && this._near) this._tryTransit();
    });
    sc.addEventListener('loaded', () => {
      const rh = document.getElementById('rightHand');
      if (rh) rh.addEventListener('triggerdown', () => { if (this._near) this._tryTransit(); });
    }, { once: true });
  },

  _build() {
    this._cam = document.getElementById('camera');
    this._rig = document.getElementById('rig');
    this._buildFade();
    this._buildHints();
    this._buildInterior();
    this._buildTouchBtn();
  },

  _buildFade() {
    const fade = document.createElement('a-plane');
    fade.setAttribute('width',  '40');
    fade.setAttribute('height', '40');
    fade.setAttribute('position', '0 0 -0.06');
    fade.setAttribute('material',
      'color:#000;shader:flat;transparent:true;opacity:0;depthTest:false;side:double');
    fade.setAttribute('animation__black',
      'property:material.opacity;to:1;dur:300;startEvents:fade-black');
    fade.setAttribute('animation__clear',
      'property:material.opacity;to:0;dur:300;startEvents:fade-clear');
    this._cam.appendChild(fade);
    this._fade = fade;
  },

  _mkPanel(col, text) {
    const h = document.createElement('a-entity');
    h.setAttribute('position', '0 -200 0');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width',  '1.48');
    frame.setAttribute('height', '0.42');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      `color:${col};shader:flat;transparent:true;opacity:0.80`);
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width',  '1.42');
    bg.setAttribute('height', '0.36');
    bg.setAttribute('material',
      'color:#140c00;shader:flat;transparent:true;opacity:0.90');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', text);
    txt.setAttribute('align', 'center');
    txt.setAttribute('color', '#ffe8b0');
    txt.setAttribute('width', '1.02');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    return h;
  },

  _buildHints() {
    this._hint       = this._mkPanel('#5a3818', 'E / Trigger: Eintreten');
    this._innerHint  = this._mkPanel('#3a2810', 'E / Trigger: Verlassen');
    this._closedHint = this._mkPanel('#4a1818', 'Nachts geschlossen');
  },

  _buildInterior() {
    const el = document.createElement('a-entity');
    el.setAttribute('id', 'schmiede-interior');
    el.setAttribute('position', '-9 0 -8');
    el.setAttribute('visible', 'false');
    const floor = document.createElement('a-plane');
    floor.setAttribute('rotation', '-90 0 0');
    floor.setAttribute('width',  '10');
    floor.setAttribute('height', '8');
    floor.setAttribute('material',
      'shader:flat;transparent:true;opacity:0;side:double');
    el.appendChild(floor);
    this.el.sceneEl.appendChild(el);
    this._interior = el;
  },

  _buildTouchBtn() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch || document.getElementById('forge-touch-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'forge-touch-btn';
    btn.textContent = 'Eintreten';
    btn.style.cssText =
      'position:fixed;bottom:200px;left:50%;transform:translateX(-50%);' +
      'background:rgba(120,60,20,0.90);color:#fff0e0;border:none;' +
      'border-radius:30px;padding:12px 30px;font-size:17px;' +
      'font-family:sans-serif;font-weight:bold;display:none;z-index:10001;touch-action:none;';
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      this._tryTransit();
    }, { passive: false });
    document.body.appendChild(btn);
    this._touchBtn = btn;
  },

  _fadeOut(cb) {
    if (!this._fade) { cb(); return; }
    this._fade.emit('fade-black');
    setTimeout(cb, 320);
  },
  _fadeIn(cb) {
    if (!this._fade) { cb(); return; }
    this._fade.emit('fade-clear');
    setTimeout(cb, 320);
  },

  _isDaytime() {
    const dn = this.el.sceneEl.components.daynight;
    if (!dn) return true;
    const m = dn.data.mode;
    return m === 'morning';
  },

  _tryTransit() {
    if (!this._near || this._transitioning) return;
    if (!this._inside && !this._isDaytime()) return; // Hinweis wird im tick() gezeigt
    this._transitioning = true;
    const goingIn = !this._inside;
    this._fadeOut(() => {
      if (goingIn) this._doEnter(); else this._doExit();
      this._fadeIn(() => {
        this._transitioning = false;
        this._cooldown = 1.5;
      });
    });
  },

  _doEnter() {
    this._inside = true;
    window.FORGE_INSIDE = true;
    const KEEP = new Set(['rig', 'schmiede-interior', 'sun', 'ambLight', 'cloaked-woman-figure']);
    this._hiddenEls = [];
    Array.from(this.el.sceneEl.children).forEach(el => {
      if (!el.object3D || KEEP.has(el.id)) return;
      if (el.object3D.visible) {
        el.object3D.visible = false;
        this._hiddenEls.push(el);
      }
    });
    const pc = this.el.sceneEl.components['player-collision'];
    if (pc) {
      const idx = pc._boxes.findIndex(b => b.x0 === -11.8 && b.z0 === -10.8);
      if (idx !== -1) this._schmiedeBox = pc._boxes.splice(idx, 1)[0];
    }
    if (this._interior) this._interior.setAttribute('visible', 'true');
    if (this._rig && this._cam) {
      const cl = this._cam.object3D.position;
      this._rig.object3D.position.set(-9 - cl.x, 0, -6.5 - cl.z);
    }
    this._near = false;
    if (this._hint) this._hint.setAttribute('visible', 'false');
    if (this._touchBtn) { this._touchBtn.textContent = 'Verlassen'; this._touchBtn.style.display = 'none'; }
  },

  _doExit() {
    this._inside = false;
    window.FORGE_INSIDE = false;
    this._hiddenEls.forEach(el => { if (el.parentNode) el.object3D.visible = true; });
    this._hiddenEls = [];
    const pc = this.el.sceneEl.components['player-collision'];
    if (pc && this._schmiedeBox) {
      pc._boxes.push(this._schmiedeBox);
      this._schmiedeBox = null;
    }
    if (this._interior) this._interior.setAttribute('visible', 'false');
    if (this._rig && this._cam) {
      const cl = this._cam.object3D.position;
      this._rig.object3D.position.set(-9 - cl.x, 0, -4.2 - cl.z);
    }
    this._near = false;
    if (this._innerHint) this._innerHint.setAttribute('visible', 'false');
    if (this._touchBtn) { this._touchBtn.textContent = 'Eintreten'; this._touchBtn.style.display = 'none'; }
    // Tageszeit auf Mittag setzen wenn Flashback gesehen
    if (window.QUEST1 && window.QUEST1.firstMemory) {
      this.el.sceneEl.setAttribute('daynight', 'mode:midday');
    }
  },

  tick(t, dt) {
    if (this._transitioning || !this._cam) return;
    if (this._cooldown > 0) { this._cooldown -= Math.min(dt, 200) * 0.001; return; }

    this._cam.object3D.getWorldPosition(this._camWP);
    const trig = this._inside ? FORGE_INNER : FORGE_OUTER;
    const dx = this._camWP.x - trig.x;
    const dz = this._camWP.z - trig.z;
    const near = (dx * dx + dz * dz) < FORGE_R2;

    const activeHint = this._inside
      ? this._innerHint
      : (this._isDaytime() ? this._hint : this._closedHint);

    if (near !== this._near) {
      this._near = near;
      [this._hint, this._innerHint, this._closedHint].forEach(h => {
        if (h) h.setAttribute('visible', 'false');
      });
      if (near && activeHint) activeHint.setAttribute('visible', 'true');
      if (this._touchBtn) this._touchBtn.style.display =
        (near && this._inside) ? 'block' : 'none';
    }

    if (this._near && activeHint && activeHint.object3D) {
      activeHint.object3D.position.set(trig.x, 2.4, trig.z);
      activeHint.object3D.rotation.y = Math.atan2(
        this._camWP.x - trig.x,
        this._camWP.z - trig.z,
      );
    }
  },

  remove() {
    [this._hint, this._innerHint, this._closedHint, this._interior].forEach(el => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  },
});

// ─── Händler-Tür (Händlerhaus NO) ──────────────────────────────────────────
// Nur Mittags (mode === 'midday') betretbar.
// Außentür bei Weltpos (9, ~-5.5).

const MERCHANT_OUTER = { x: 9, z: -5.5 };
const MERCHANT_INNER = { x: 9, z: -4.5 };  // 1m vor Tür (Richtung Straße) – kein Overlap mit NPC-Zone
const MERCHANT_R2    = 4;   // 2m radius²

AFRAME.registerComponent('haendler-door', {

  init() {
    this._cam           = null;
    this._rig           = null;
    this._camWP         = new THREE.Vector3();
    this._inside        = false;
    this._transitioning = false;
    this._cooldown      = 0;
    this._near          = false;
    this._hint          = null;
    this._innerHint     = null;
    this._closedHint    = null;
    this._touchBtn      = null;
    this._fade          = null;
    this._interior      = null;
    this._hiddenEls     = [];
    this._merchantBox   = null;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    document.addEventListener('keydown', e => {
      if (e.code === 'KeyE' && this._near) this._tryTransit();
    });
    sc.addEventListener('loaded', () => {
      const rh = document.getElementById('rightHand');
      if (rh) rh.addEventListener('triggerdown', () => { if (this._near) this._tryTransit(); });
    }, { once: true });
  },

  _build() {
    this._cam = document.getElementById('camera');
    this._rig = document.getElementById('rig');
    this._buildFade();
    this._buildHints();
    this._buildInterior();
    this._buildTouchBtn();
  },

  _buildFade() {
    const fade = document.createElement('a-plane');
    fade.setAttribute('width',  '40');
    fade.setAttribute('height', '40');
    fade.setAttribute('position', '0 0 -0.06');
    fade.setAttribute('material',
      'color:#000;shader:flat;transparent:true;opacity:0;depthTest:false;side:double');
    fade.setAttribute('animation__black',
      'property:material.opacity;to:1;dur:300;startEvents:fade-black');
    fade.setAttribute('animation__clear',
      'property:material.opacity;to:0;dur:300;startEvents:fade-clear');
    this._cam.appendChild(fade);
    this._fade = fade;
  },

  _mkPanel(col, text) {
    const h = document.createElement('a-entity');
    h.setAttribute('position', '0 -200 0');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width',  '1.48');
    frame.setAttribute('height', '0.42');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      `color:${col};shader:flat;transparent:true;opacity:0.80`);
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width',  '1.42');
    bg.setAttribute('height', '0.36');
    bg.setAttribute('material',
      'color:#140c00;shader:flat;transparent:true;opacity:0.90');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', text);
    txt.setAttribute('align', 'center');
    txt.setAttribute('color', '#ffe8b0');
    txt.setAttribute('width', '1.02');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    return h;
  },

  _buildHints() {
    this._hint       = this._mkPanel('#5a3818', 'E / Trigger: Eintreten');
    this._innerHint  = this._mkPanel('#3a2810', 'E / Trigger: Verlassen');
    this._closedHint = this._mkPanel('#4a1818', 'Nur mittags geöffnet');
  },

  _buildInterior() {
    const el = document.createElement('a-entity');
    el.setAttribute('id', 'haendler-interior');
    el.setAttribute('position', '9 0 -8');
    el.setAttribute('visible', 'false');
    const floor = document.createElement('a-plane');
    floor.setAttribute('rotation', '-90 0 0');
    floor.setAttribute('width',  '8');
    floor.setAttribute('height', '6');
    floor.setAttribute('material',
      'shader:flat;transparent:true;opacity:0;side:double');
    el.appendChild(floor);
    this.el.sceneEl.appendChild(el);
    this._interior = el;
  },

  _buildTouchBtn() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch || document.getElementById('merchant-touch-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'merchant-touch-btn';
    btn.textContent = 'Eintreten';
    btn.style.cssText =
      'position:fixed;bottom:200px;left:50%;transform:translateX(-50%);' +
      'background:rgba(120,60,20,0.90);color:#fff0e0;border:none;' +
      'border-radius:30px;padding:12px 30px;font-size:17px;' +
      'font-family:sans-serif;font-weight:bold;display:none;z-index:10001;touch-action:none;';
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      this._tryTransit();
    }, { passive: false });
    document.body.appendChild(btn);
    this._touchBtn = btn;
  },

  _fadeOut(cb) {
    if (!this._fade) { cb(); return; }
    this._fade.emit('fade-black');
    setTimeout(cb, 320);
  },
  _fadeIn(cb) {
    if (!this._fade) { cb(); return; }
    this._fade.emit('fade-clear');
    setTimeout(cb, 320);
  },

  _isDaytime() {
    const dn = this.el.sceneEl.components.daynight;
    if (!dn) return true;
    const m = dn.data.mode;
    return m === 'midday';
  },

  _tryTransit() {
    if (!this._near || this._transitioning) return;
    if (!this._inside && !this._isDaytime()) return;
    this._transitioning = true;
    const goingIn = !this._inside;
    this._fadeOut(() => {
      if (goingIn) this._doEnter(); else this._doExit();
      this._fadeIn(() => {
        this._transitioning = false;
        this._cooldown = 4.0;
      });
    });
  },

  _doEnter() {
    this._inside = true;
    window.MERCHANT_INSIDE = true;
    const KEEP = new Set(['rig', 'haendler-interior', 'sun', 'ambLight', 'cloaked-woman-figure']);
    this._hiddenEls = [];
    Array.from(this.el.sceneEl.children).forEach(el => {
      if (!el.object3D || KEEP.has(el.id)) return;
      if (el.object3D.visible) {
        el.object3D.visible = false;
        this._hiddenEls.push(el);
      }
    });
    const pc = this.el.sceneEl.components['player-collision'];
    if (pc) {
      const idx = pc._boxes.findIndex(b => b.x0 === 6.2 && b.z0 === -10.8);
      if (idx !== -1) this._merchantBox = pc._boxes.splice(idx, 1)[0];
    }
    if (this._interior) this._interior.setAttribute('visible', 'true');
    if (this._rig && this._cam) {
      const cl = this._cam.object3D.position;
      this._rig.object3D.position.set(9 - cl.x, 0, -9.0 - cl.z);
    }
    this._near = false;
    if (this._hint) this._hint.setAttribute('visible', 'false');
    if (this._touchBtn) { this._touchBtn.textContent = 'Verlassen'; this._touchBtn.style.display = 'none'; }
  },

  _doExit() {
    this._inside = false;
    window.MERCHANT_INSIDE = false;
    this._hiddenEls.forEach(el => { if (el.parentNode) el.object3D.visible = true; });
    this._hiddenEls = [];
    const pc = this.el.sceneEl.components['player-collision'];
    if (pc && this._merchantBox) {
      pc._boxes.push(this._merchantBox);
      this._merchantBox = null;
    }
    if (this._interior) this._interior.setAttribute('visible', 'false');
    if (this._rig && this._cam) {
      const cl = this._cam.object3D.position;
      this._rig.object3D.position.set(9 - cl.x, 0, -6.5 - cl.z);
    }
    this._near = false;
    if (this._innerHint) this._innerHint.setAttribute('visible', 'false');
    if (this._touchBtn) { this._touchBtn.textContent = 'Eintreten'; this._touchBtn.style.display = 'none'; }
    if (window.QUEST1 && window.QUEST1.heardMerchant) {
      this.el.sceneEl.setAttribute('daynight', 'mode:evening');
    }
  },

  tick(t, dt) {
    if (this._transitioning || !this._cam) return;
    if (this._cooldown > 0) { this._cooldown -= Math.min(dt, 200) * 0.001; return; }

    this._cam.object3D.getWorldPosition(this._camWP);
    const trig = this._inside ? MERCHANT_INNER : MERCHANT_OUTER;
    const dx = this._camWP.x - trig.x;
    const dz = this._camWP.z - trig.z;
    const near = (dx * dx + dz * dz) < MERCHANT_R2;

    const activeHint = this._inside
      ? this._innerHint
      : (this._isDaytime() ? this._hint : this._closedHint);

    if (near !== this._near) {
      this._near = near;
      [this._hint, this._innerHint, this._closedHint].forEach(h => {
        if (h) h.setAttribute('visible', 'false');
      });
      if (near && activeHint) activeHint.setAttribute('visible', 'true');
      if (this._touchBtn) this._touchBtn.style.display =
        (near && this._inside) ? 'block' : 'none';
    }

    if (this._near && activeHint && activeHint.object3D) {
      activeHint.object3D.position.set(trig.x, 2.4, trig.z);
      activeHint.object3D.rotation.y = Math.atan2(
        this._camWP.x - trig.x,
        this._camWP.z - trig.z,
      );
    }
  },

  remove() {
    [this._hint, this._innerHint, this._closedHint, this._interior].forEach(el => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// SCHMIED-NPC – Quest 1a (Child von #schmiede-interior)
// Hammeranimation + Funken + Dialog-System + Schwertgriff + Flashback.
// Nur aktiv wenn FORGE_INSIDE && QUEST0.heardTavern.
// ═══════════════════════════════════════════════════════════════════════════

// ── Globale Quest/Inventory Initialisierung ──────────────────────────────────
window.QUEST1 = window.QUEST1 || {
  hasSwordHilt:  false,
  firstMemory:   false,
  smithKnows:    false,
  heardMerchant: false,
  triggered:     false,
  alchemistHint: false,
  dogFed:        false,
  signs:         0,
  completed:     false,
};
window.INVENTORY = window.INVENTORY || {
  magicKey:  false,
  swordHilt: false,
  dogFood:   false,
};

const SMITH_HAMMER_CYCLE_MS = 800;
const SMITH_SPARK_POOL_SIZE = 32;
const SMITH_SPARK_BURST_COUNT = 16;

const smithState = {
  dialogStep:   0,
  extraStep:    0,
  cooldownMs:   6000,
  lastTrigger:  0,
  hammerActive: true,
  hiltPickedUp: false,
};

AFRAME.registerComponent('smith-npc', {

  init() {
    if (typeof window.FORGE_INSIDE === 'undefined') window.FORGE_INSIDE = false;
    window.QUEST0 = window.QUEST0 || {};

    this._cam = null;
    this._camWP = new THREE.Vector3();
    this._tmpVec3 = new THREE.Vector3();
    this._insideRoot = null;
    this._insideNpcRoot = null;
    this._hammerPivot = null;
    this._hiltMesh = null;
    this._hiltRoot = null;
    this._state = 'working';
    this._sparkPool = [];
    this._sparkMeshes = [];
    this._bubbles = {};
    this._hint = null;
    this._touchBtn = null;
    this._hiltTouchBtn = null;
    this._nearSmith = false;
    this._nearHilt = false;
    this._bubbleTimer = null;
    this._flashbackActive = false;
    this._npcWorldPos = new THREE.Vector3();
    this._hiltWorldPos = new THREE.Vector3();

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    document.addEventListener('keydown', e => {
      if (e.code === 'KeyE' && window.FORGE_INSIDE) {
        if (this._nearHilt) this._tryPickupHilt();
        else if (this._nearSmith) this._triggerDialog();
      }
    });
  },

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
    this._buildInteriorFigure();
    this._buildHilt();
    this._buildSparkPool();
    this._buildBubbles();
    this._buildHint();
    this._buildTouchBtns();
    this._addHUDSlot();

    const tryBindVR = () => {
      const rh = document.getElementById('rightHand');
      if (rh) {
        rh.addEventListener('triggerdown', () => {
          if (!window.FORGE_INSIDE) return;
          if (this._nearHilt) this._tryPickupHilt();
          else if (this._nearSmith) this._triggerDialog();
        });
      } else {
        setTimeout(tryBindVR, 200);
      }
    };
    tryBindVR();

    window.NPC_REGISTRY.schmied = {
      id: 'schmied-inside',
      position: { x: -9.5, y: 0, z: -9.5 },
      state: this._state,
    };
  },

  // ── Interior NPC (Child von #schmiede-interior) ──────────────────────────
  _buildInteriorFigure() {
    const SKIN  = '#d4a070';
    const SHIRT = '#6a4020';
    const APRON = '#3a2818';
    const PANTS = '#2a1a10';
    const BOOT  = '#1a0e08';
    const HAIR  = '#2a1a0a';
    const METAL = '#383838';

    const interior = document.getElementById('schmiede-interior');
    if (!interior) { setTimeout(() => this._buildInteriorFigure(), 100); return; }

    const root = document.createElement('a-entity');
    root.setAttribute('position', '-0.5 0 -1.5');
    root.setAttribute('rotation', '0 90 0');

    const npcRoot = document.createElement('a-entity');

    npcRoot.appendChild(this._box(0.12, 0.06, 0.18, BOOT,  0.09, 0.03,  0.02));
    npcRoot.appendChild(this._box(0.12, 0.06, 0.18, BOOT, -0.09, 0.03,  0.02));
    npcRoot.appendChild(this._cyl(0.06, 0.40, PANTS,  0.09, 0.24, 0));
    npcRoot.appendChild(this._cyl(0.06, 0.40, PANTS, -0.09, 0.24, 0));
    npcRoot.appendChild(this._box(0.32, 0.10, 0.22, PANTS, 0, 0.50, 0));
    npcRoot.appendChild(this._box(0.34, 0.04, 0.24, '#4a2a10', 0, 0.56, 0));
    npcRoot.appendChild(this._box(0.34, 0.34, 0.24, SHIRT, 0, 0.76, 0));
    npcRoot.appendChild(this._box(0.26, 0.40, 0.015, APRON, 0, 0.68, 0.125));
    npcRoot.appendChild(this._box(0.44, 0.08, 0.24, SHIRT, 0, 0.94, 0));

    const armL = document.createElement('a-entity');
    armL.setAttribute('position', '-0.22 0.94 0');
    armL.setAttribute('rotation', '15 0 8');
    armL.appendChild(this._cyl(0.05, 0.30, SHIRT, 0, -0.15, 0));
    armL.appendChild(this._cyl(0.042, 0.22, SKIN,  0, -0.38, 0));
    armL.appendChild(this._sph(0.05, SKIN, 0, -0.52, 0));
    npcRoot.appendChild(armL);

    const armR = document.createElement('a-entity');
    armR.setAttribute('position', '0.22 0.94 0');
    armR.setAttribute('rotation', '-10 0 -8');
    armR.appendChild(this._cyl(0.05, 0.30, SHIRT, 0, -0.15, 0));

    const forearmPiv = document.createElement('a-entity');
    forearmPiv.setAttribute('position', '0 -0.30 0');
    forearmPiv.appendChild(this._cyl(0.042, 0.22, SKIN, 0, -0.11, 0));
    forearmPiv.appendChild(this._sph(0.05, SKIN, 0, -0.24, 0));

    const hammerHandle = this._box(0.04, 0.04, 0.50, '#4a3018', 0, -0.10, -0.25);
    hammerHandle.setAttribute('rotation', '20 0 0');
    forearmPiv.appendChild(hammerHandle);

    const hammerHead = this._box(0.18, 0.14, 0.10, METAL, 0, -0.10, -0.52);
    hammerHead.setAttribute('rotation', '20 0 0');
    forearmPiv.appendChild(hammerHead);

    armR.appendChild(forearmPiv);
    npcRoot.appendChild(armR);
    this._hammerPivot = forearmPiv;

    npcRoot.appendChild(this._cyl(0.05, 0.08, SKIN, 0, 1.04, 0));
    npcRoot.appendChild(this._sph(0.14, SKIN, 0, 1.18, 0));
    npcRoot.appendChild(this._box(0.30, 0.10, 0.28, HAIR, 0, 1.30, -0.02));
    npcRoot.appendChild(this._box(0.07, 0.12, 0.06, HAIR, -0.15, 1.19, -0.05));
    npcRoot.appendChild(this._box(0.07, 0.12, 0.06, HAIR,  0.15, 1.19, -0.05));
    npcRoot.appendChild(this._box(0.12, 0.10, 0.08, HAIR, 0, 1.10, 0.10));
    npcRoot.appendChild(this._sph(0.025, '#f0ece6', -0.05, 1.22, 0.12));
    npcRoot.appendChild(this._sph(0.025, '#f0ece6',  0.05, 1.22, 0.12));
    npcRoot.appendChild(this._sph(0.015, '#1a0800', -0.05, 1.22, 0.13));
    npcRoot.appendChild(this._sph(0.015, '#1a0800',  0.05, 1.22, 0.13));
    npcRoot.appendChild(this._sph(0.02, SKIN, 0, 1.18, 0.14));
    npcRoot.appendChild(this._box(0.06, 0.012, 0.01, '#7a3020', 0, 1.14, 0.13));

    root.appendChild(npcRoot);
    interior.appendChild(root);
    this._insideRoot = root;
    this._insideNpcRoot = npcRoot;
  },

  // ── Schwertgriff ──────────────────────────────────────────────────────────
  _buildHilt() {
    const interior = document.getElementById('schmiede-interior');
    if (!interior) { setTimeout(() => this._buildHilt(), 100); return; }

    const root = document.createElement('a-entity');
    root.setAttribute('position', '-0.8 0.92 -0.6');
    root.setAttribute('visible', 'false');

    const hilt = this._box(0.08, 0.22, 0.06, '#8B6914', 0, 0, 0);
    hilt.setAttribute('material',
      'color:#8B6914;emissive:#c8a020;emissiveIntensity:0.4;shader:flat');
    root.appendChild(hilt);

    interior.appendChild(root);
    this._hiltRoot = root;
    this._hiltMesh = hilt;

    // Sichtbar machen wenn dialogStep >= 3 (Session-Reload)
    if (smithState.dialogStep >= 3 && !smithState.hiltPickedUp) {
      root.setAttribute('visible', 'true');
    }
  },

  // ── Spark-Pool ────────────────────────────────────────────────────────────
  _buildSparkPool() {
    for (let i = 0; i < SMITH_SPARK_POOL_SIZE; i++) {
      this._sparkPool.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 0,
        active: false,
      });
    }
    for (let i = 0; i < SMITH_SPARK_POOL_SIZE; i++) {
      const el = document.createElement('a-sphere');
      el.setAttribute('radius', '0.025');
      el.setAttribute('segments-width', '4');
      el.setAttribute('segments-height', '3');
      el.setAttribute('material',
        'color:#FFD700;emissive:#FFD700;emissiveIntensity:2.0;shader:flat');
      el.object3D.visible = false;
      this.el.sceneEl.appendChild(el);
      this._sparkMeshes.push(el);
    }
  },

  // ── Dialog-Bubbles ────────────────────────────────────────────────────────
  _mkBubble(text, bgW, bgH) {
    const h = document.createElement('a-entity');
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

  _buildBubbles() {
    this._bubbles.b1 = this._mkBubble(
      'Schmied: Der Wirt schickt mir jeden zweiten Fremden.', 1.80, 0.24);
    this._bubbles.b2 = this._mkBubble(
      'Schmied: Du hast die falschen Fragen gestellt.\nDeshalb bist du hier.\nDas Westtor. Ich war dabei.\nVor vielen Jahren.',
      1.80, 0.64);
    this._bubbles.b3 = this._mkBubble(
      'Schmied: Ich schmiede nicht mehr fuer jeden.\nNur noch fuer mich.', 1.80, 0.32);
    this._bubbles.b3b = this._mkBubble(
      'Schmied: Hinter dem Amboss, der Schwertgriff. Schau selbst, vieleicht sagt Dir das etwas?\nFrag nicht mich, \nich rede nicht darueber.',
      1.80, 0.48);
    this._bubbles.extra1 = this._mkBubble(
      'Du: Diese Wappen? Weisst Du wer ich bin?!', 1.40, 0.24);
    this._bubbles.extra2 = this._mkBubble(
      'Schmied: Ich weiss was dieses Wappen bedeutet. \nAber ich darf Dir nicht mehr dazu sagen. \nVielleicht kann Dir jemand anderes \nin der Stadt weiterhelfen.',
      1.80, 0.64);
  },

  // ── Interaktions-Hint ─────────────────────────────────────────────────────
  _buildHint() {
    const h = document.createElement('a-entity');
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width', '1.18');
    frame.setAttribute('height', '0.26');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#805030;shader:flat;transparent:true;opacity:0.50;' +
      'emissive:#805030;emissiveIntensity:0.18');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width', '1.12');
    bg.setAttribute('height', '0.20');
    bg.setAttribute('material',
      'color:#100800;shader:flat;transparent:true;opacity:0.90');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', 'E / Trigger: Ansprechen');
    txt.setAttribute('align', 'center');
    txt.setAttribute('baseline', 'center');
    txt.setAttribute('color', '#f0d0a0');
    txt.setAttribute('width', '0.98');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    this._hint = h;
  },

  // ── Touch-Buttons ─────────────────────────────────────────────────────────
  _buildTouchBtns() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch) return;

    const style = document.createElement('style');
    style.textContent = `
      #smith-talk-btn, #smith-hilt-btn {
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

    const talkBtn = document.createElement('button');
    talkBtn.id = 'smith-talk-btn';
    talkBtn.textContent = 'Ansprechen';
    talkBtn.addEventListener('touchstart', e => {
      e.preventDefault();
      if (this._nearSmith) this._triggerDialog();
    }, { passive: false });
    document.body.appendChild(talkBtn);
    this._touchBtn = talkBtn;

    const hiltBtn = document.createElement('button');
    hiltBtn.id = 'smith-hilt-btn';
    hiltBtn.textContent = 'Aufheben';
    hiltBtn.addEventListener('touchstart', e => {
      e.preventDefault();
      if (this._nearHilt) this._tryPickupHilt();
    }, { passive: false });
    document.body.appendChild(hiltBtn);
    this._hiltTouchBtn = hiltBtn;
  },

  // ── HUD-Slot ──────────────────────────────────────────────────────────────
  _addHUDSlot() {
    if (document.getElementById('inv-hilt-slot')) return;
    const hud = document.getElementById('inventory-hud');
    if (!hud) { setTimeout(() => this._addHUDSlot(), 150); return; }
    const slot = document.createElement('div');
    slot.id = 'inv-hilt-slot';
    slot.className = 'inv-slot';
    slot.textContent = '⚔️';
    slot.style.display = 'none';
    hud.appendChild(slot);
    if (window.INVENTORY.swordHilt) {
      slot.style.display = '';
      slot.classList.add('has-item');
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // TICK
  // ═════════════════════════════════════════════════════════════════════════
  tick(t, dt) {
    if (!window.FORGE_INSIDE) return;
    if (!window.QUEST0 || !window.QUEST0.heardTavern) return;
    if (!this._cam || !this._insideRoot || !this._insideNpcRoot) return;

    const clampedDt = Math.min(dt, 50) * 0.001;
    this._cam.object3D.getWorldPosition(this._camWP);
    this._insideRoot.object3D.getWorldPosition(this._npcWorldPos);

    const dx = this._camWP.x - this._npcWorldPos.x;
    const dz = this._camWP.z - this._npcWorldPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Hammer animation
    const now = performance.now();
    const result = this._animateHammer(now, clampedDt);

    // Spark burst only when hammer is active
    if (result.strikeOccurred && smithState.hammerActive) {
      this._emitSparkBurst();
    }

    // Update particles
    this._updateSparkParticles(clampedDt);

    // Hilt floating animation
    if (this._hiltRoot && this._hiltRoot.object3D &&
        this._hiltRoot.getAttribute('visible') !== 'false') {
      this._hiltRoot.object3D.position.y = 0.92 + Math.sin(t * 0.002) * 0.03;
      this._hiltRoot.object3D.rotation.y += 0.01;
    }

    // Proximity check
    this._checkProximity(dist, dx, dz, now);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // HAMMER ANIMATION
  // ═════════════════════════════════════════════════════════════════════════
  _animateHammer(elapsed, dt) {
    if (!this._hammerPivot || !this._hammerPivot.object3D) {
      return { strikeOccurred: false };
    }
    if (!smithState.hammerActive) {
      // Lerp to 0
      this._hammerPivot.object3D.rotation.x *= 0.9;
      return { strikeOccurred: false };
    }

    const cycleMs = SMITH_HAMMER_CYCLE_MS;
    const phase = (elapsed % cycleMs) / cycleMs;
    const prevPhase = ((elapsed - dt * 1000) % cycleMs) / cycleMs;

    let rotX;
    if (phase < 0.35) {
      const p = phase / 0.35;
      rotX = 0 + (-1.4 - 0) * p;
    } else if (phase < 0.55) {
      const p = (phase - 0.35) / 0.2;
      rotX = -1.4 + (0.3 - (-1.4)) * p;
    } else {
      const p = (phase - 0.55) / 0.45;
      rotX = 0.3 + (0 - 0.3) * p;
    }
    this._hammerPivot.object3D.rotation.x = rotX;

    const strikeOccurred = prevPhase < 0.50 && phase >= 0.50;
    return { strikeOccurred };
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SPARK PARTICLES
  // ═════════════════════════════════════════════════════════════════════════
  _updateSparkParticles(dt) {
    for (let i = 0; i < SMITH_SPARK_POOL_SIZE; i++) {
      const p = this._sparkPool[i];
      const mesh = this._sparkMeshes[i];
      if (!p.active) {
        if (mesh && mesh.object3D) mesh.object3D.visible = false;
        continue;
      }
      p.velocity.y -= 4.8 * dt;
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.position.z += p.velocity.z * dt;
      p.life -= dt / 0.6;
      if (p.life <= 0) {
        p.active = false;
        if (mesh && mesh.object3D) mesh.object3D.visible = false;
        continue;
      }
      if (mesh && mesh.object3D) {
        mesh.object3D.position.copy(p.position);
        mesh.object3D.visible = true;
        const t = 1 - p.life;
        const r = 255, g = Math.round(215 - t * 108), b = Math.round(0 + t * 53);
        const hex = '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
        const alpha = Math.max(0, p.life);
        mesh.setAttribute('material',
          `color:${hex};emissive:${hex};emissiveIntensity:${alpha * 2.0};shader:flat;transparent:true;opacity:${alpha}`);
      }
    }
  },

  _emitSparkBurst() {
    const origin = new THREE.Vector3(-9.5, 1.06, -9.5);

    const candidates = [];
    for (let i = 0; i < SMITH_SPARK_POOL_SIZE; i++) {
      if (!this._sparkPool[i].active) {
        candidates.push(i);
        if (candidates.length >= SMITH_SPARK_BURST_COUNT) break;
      }
    }
    if (candidates.length < SMITH_SPARK_BURST_COUNT) {
      const sorted = this._sparkPool
        .map((p, i) => ({ idx: i, life: p.active ? p.life : -1 }))
        .sort((a, b) => a.life - b.life);
      for (const item of sorted) {
        if (candidates.length >= SMITH_SPARK_BURST_COUNT) break;
        if (!candidates.includes(item.idx)) candidates.push(item.idx);
      }
    }
    for (let i = 0; i < Math.min(SMITH_SPARK_BURST_COUNT, candidates.length); i++) {
      const idx = candidates[i];
      const p = this._sparkPool[idx];
      p.position.copy(origin);
      p.velocity.set(
        (Math.random() - 0.5) * 3.5,
        Math.random() * 4.0 + 1.5,
        (Math.random() - 0.5) * 3.5
      );
      p.life = 1.0;
      p.active = true;
      if (this._sparkMeshes[idx] && this._sparkMeshes[idx].object3D) {
        this._sparkMeshes[idx].object3D.position.copy(origin);
        this._sparkMeshes[idx].object3D.visible = true;
      }
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PROXIMITY
  // ═════════════════════════════════════════════════════════════════════════
  _checkProximity(dist, dx, dz, now) {
    if (dist <= 2.0) {
      smithState.hammerActive = false;
      if (this._insideNpcRoot && this._insideNpcRoot.object3D) {
        const angle = Math.atan2(dx, dz);
        this._insideNpcRoot.object3D.rotation.y = angle;
      }
      this._nearSmith = true;
      // Hint nur zeigen wenn kein Dialog aktiv:
      if (!this._bubbleTimer) {
        this._showInteractionHint();
      } else {
        this._hideHint();
      }
    } else {
      this._nearSmith = false;
      smithState.hammerActive = true;
      this._hideHint();
    }

    // Hilt proximity
    if (this._hiltRoot && this._hiltRoot.getAttribute('visible') !== 'false' &&
        smithState.dialogStep >= 3 && !smithState.hiltPickedUp) {
      this._hiltRoot.object3D.getWorldPosition(this._hiltWorldPos);
      const hdx = this._camWP.x - this._hiltWorldPos.x;
      const hdz = this._camWP.z - this._hiltWorldPos.z;
      this._nearHilt = (hdx * hdx + hdz * hdz) < 2.25; // 1.5m
    } else {
      this._nearHilt = false;
    }

    // Touch buttons
    if (this._touchBtn) {
      this._touchBtn.style.display = (this._nearSmith && dist <= 2.0) ? 'block' : 'none';
    }
    if (this._hiltTouchBtn) {
      this._hiltTouchBtn.style.display = this._nearHilt ? 'block' : 'none';
    }
  },

  _showInteractionHint() {
    if (!this._hint || !this._hint.object3D) return;
    // Hint nur zeigen wenn KEINE Bubble aktiv
    if (this._bubbleTimer) return;
    this._hint.object3D.position.set(
      this._npcWorldPos.x,
      this._npcWorldPos.y + 1.8,
      this._npcWorldPos.z
    );
    this._hint.object3D.rotation.y = Math.atan2(
      this._camWP.x - this._npcWorldPos.x,
      this._camWP.z - this._npcWorldPos.z,
    );
    this._hint.setAttribute('visible', 'true');
  },

  _hideHint() {
    if (this._hint) this._hint.setAttribute('visible', 'false');
  },

  // ═════════════════════════════════════════════════════════════════════════
  // DIALOG
  // ═════════════════════════════════════════════════════════════════════════
  _triggerDialog() {
    const now = performance.now();
    if (now - smithState.lastTrigger < smithState.cooldownMs) return;
    if (this._bubbleTimer) return; // bubble still active
    smithState.lastTrigger = now;

    const npcPos = this._insideRoot.object3D.position;

    if (smithState.dialogStep === 0) {
      this._showBubble('b1', 5000, () => { smithState.dialogStep = 1; });
    } else if (smithState.dialogStep === 1) {
      this._showBubble('b2', 7000, () => { smithState.dialogStep = 2; });
    } else if (smithState.dialogStep === 2) {
      this._showBubble('b3', 4000, () => {
        this._showBubble('b3b', 6000, () => {
          smithState.dialogStep = 3;
          if (this._hiltRoot) this._hiltRoot.setAttribute('visible', 'true');
        });
      });
    } else if (smithState.dialogStep >= 3) {
      if (smithState.hiltPickedUp) {
        this._triggerExtraDialog();
      } else {
        this._showBubble(null, 3000, null, 'Schau hinter den Amboss.');
      }
    }
  },

  _triggerExtraDialog() {
    if (smithState.extraStep >= 1) return;
    smithState.extraStep = 1;
    this._showBubble('extra1', 4000, () => {
      this._showBubble('extra2', 7000, () => {
        window.QUEST1.smithKnows = true;
      });
    });
  },

  _showBubble(key, duration, onEnd, customText) {
    // Hint ausblenden während Dialog läuft
    if (this._hint) this._hint.setAttribute('visible', 'false');
    // Hide all bubbles
    Object.values(this._bubbles).forEach(b => b.setAttribute('visible', 'false'));

    if (customText) {
      // Show custom text via narrative text
      if (typeof window.showNarrativeText === 'function') {
        window.showNarrativeText(customText, duration);
      }
      this._bubbleTimer = setTimeout(() => {
        this._bubbleTimer = null;
        if (onEnd) onEnd();
      }, duration);
      return;
    }

    const bubble = this._bubbles[key];
    if (!bubble) return;

    // Hint ausblenden während Bubble aktiv ist
    this._hideHint();

    bubble.object3D.position.set(
      this._npcWorldPos.x,
      this._npcWorldPos.y + 1.8,
      this._npcWorldPos.z
    );
    bubble.object3D.rotation.y = Math.atan2(
      this._camWP.x - this._npcWorldPos.x,
      this._camWP.z - this._npcWorldPos.z,
    );
    bubble.setAttribute('visible', 'true');

    this._bubbleTimer = setTimeout(() => {
      bubble.setAttribute('visible', 'false');
      this._bubbleTimer = null;
      // Hint wieder einblenden wenn Spieler noch nah
      if (this._nearSmith) this._showInteractionHint();
      if (onEnd) onEnd();
    }, duration);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // HILT PICKUP
  // ═════════════════════════════════════════════════════════════════════════
  _tryPickupHilt() {
    if (smithState.dialogStep < 3) return;
    if (smithState.hiltPickedUp) return;
    if (!this._nearHilt) return;

    smithState.hiltPickedUp = true;
    window.INVENTORY.swordHilt = true;
    window.QUEST1.hasSwordHilt = true;

    if (this._hiltRoot) this._hiltRoot.setAttribute('visible', 'false');
    if (this._hiltTouchBtn) this._hiltTouchBtn.style.display = 'none';

    const slot = document.getElementById('inv-hilt-slot');
    if (slot) {
      slot.style.display = '';
      slot.classList.add('has-item');
    }

    this._triggerFlashback();
  },

  // ═════════════════════════════════════════════════════════════════════════
  // FLASHBACK
  // ═════════════════════════════════════════════════════════════════════════
  _triggerFlashback() {
    if (this._flashbackActive) return;
    this._flashbackActive = true;

    const cam = document.getElementById('camera');
    if (!cam) { this._flashbackActive = false; return; }

    // Eigenes schwarzes Overlay auf camera
    const overlay = document.createElement('a-plane');
    overlay.setAttribute('width', '40');
    overlay.setAttribute('height', '40');
    overlay.setAttribute('position', '0 0 -0.06');
    overlay.setAttribute('material',
      'color:#000;shader:flat;transparent:true;opacity:0;' +
      'depthTest:false;side:double');
    cam.appendChild(overlay);

    // 1. Fade to black (300ms)
    let opacity = 0;
    const fadeIn = setInterval(() => {
      opacity = Math.min(1, opacity + 0.1);
      overlay.setAttribute('material',
        `color:#000;shader:flat;transparent:true;opacity:${opacity};` +
        'depthTest:false;side:double');
      if (opacity >= 1) clearInterval(fadeIn);
    }, 30);

    setTimeout(() => {
      // 2. Text einblenden
      const panel = document.createElement('a-entity');
      panel.setAttribute('position', '0 -0.10 -2.0');
      const txt = document.createElement('a-text');
      txt.setAttribute('value',
        '...ein Thronsaal. Warmes Licht.\nEine Hand die deine haelt.');
      txt.setAttribute('align', 'center');
      txt.setAttribute('color', '#ffffff');
      txt.setAttribute('width', '3.5');
      txt.setAttribute('shader', 'flat');
      panel.appendChild(txt);
      cam.appendChild(panel);

      // 3. Text 3500ms halten, dann fade out
      setTimeout(() => {
        if (panel.parentNode) panel.parentNode.removeChild(panel);

        // 4. Fade back to clear (300ms)
        let op = 1;
        const fadeOut = setInterval(() => {
          op = Math.max(0, op - 0.1);
          overlay.setAttribute('material',
            `color:#000;shader:flat;transparent:true;opacity:${op};` +
            'depthTest:false;side:double');
          if (op <= 0) {
            clearInterval(fadeOut);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            this._flashbackActive = false;
            window.QUEST1.firstMemory = true;
          }
        }, 30);

      }, 3500);
    }, 320);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REMOVE
  // ═════════════════════════════════════════════════════════════════════════
  remove() {
    if (this._insideRoot && this._insideRoot.parentNode)
      this._insideRoot.parentNode.removeChild(this._insideRoot);
    this._sparkMeshes.forEach(el => { if (el && el.parentNode) el.parentNode.removeChild(el); });
    Object.values(this._bubbles).forEach(b => { if (b && b.parentNode) b.parentNode.removeChild(b); });
    if (this._hint && this._hint.parentNode) this._hint.parentNode.removeChild(this._hint);
    if (this._touchBtn && this._touchBtn.parentNode) this._touchBtn.parentNode.removeChild(this._touchBtn);
    if (this._hiltTouchBtn && this._hiltTouchBtn.parentNode) this._hiltTouchBtn.parentNode.removeChild(this._hiltTouchBtn);
    delete window.NPC_REGISTRY.schmied;
  },
});

AFRAME.registerComponent('kesselstadt-scene', {
  init() {
    // Szene-HTML einmalig einfügen, sobald A-Frame bereit ist
    this.el.insertAdjacentHTML('beforeend', KESSELSTADT_HTML);

    // VR-Audio starten sobald VR-Session beginnt
    this.el.addEventListener('loaded', () => {
      this.el.addEventListener('enter-vr', () => {
        if (window._KS) window._KS.start();
      });
    });
  }
});

// ─── Szenen-HTML ─────────────────────────────────────────────────────────────
// Alle visuellen Elemente der Kesselstadt als Template-String.
// Licht und Spieler-Rig sind in index.html definiert.
// ─────────────────────────────────────────────────────────────────────────────
const KESSELSTADT_HTML = /* html */`
<a-entity id="ks-outdoor">

  <!-- ═══ HIMMEL – prozedurale Sky-Sphere ═══ -->
  <a-entity id="sky-sphere"
    geometry="primitive:sphere; radius:4900; segmentsWidth:36; segmentsHeight:18"
    material="shader:flat; color:#ffffff; side:back"
    tex="id:sky-canvas; repx:1; repy:1">
  </a-entity>

  <!-- ═══ BODEN ═══ -->
  <a-plane position="0 0 -5.5" rotation="-90 0 0" width="80" height="69"
    material="color:#ffffff;roughness:1"
    tex="id:tex-cobble; repx:20; repy:20"
    shadow="receive:true">
  </a-plane>
  <a-plane position="0 0.01 0" rotation="-90 0 0" width="14" height="14"
    material="color:#e8ddd0;roughness:1"
    tex="id:tex-cobble; repx:5; repy:5"
    shadow="receive:true">
  </a-plane>

  <!-- ═══ MARKTBRUNNEN ═══ -->
  <a-cylinder position="0 0.4 0" radius="2" height="0.8"
    material="color:#d8cfc0;roughness:0.9"
    tex="id:tex-stone; repx:3; repy:0.5"
    shadow="cast:true;receive:true">
  </a-cylinder>
  <a-cylinder position="0 0.82 0" radius="1.9" height="0.05"
    material="color:#b0a090;roughness:0.9">
  </a-cylinder>
  <a-cylinder position="0 0.76 0" radius="1.75" height="0.04"
    material="color:#4488aa;opacity:0.7;transparent:true;metalness:0.3;roughness:0.1">
  </a-cylinder>
  <a-cylinder position="0 1.4 0" radius="0.12" height="1.2"
    material="color:#c0b0a0;roughness:0.9"
    tex="id:tex-stone; repx:1; repy:1"
    shadow="cast:true">
  </a-cylinder>
  <a-sphere position="0 2.05 0" radius="0.22"
    material="color:#aabbcc;metalness:0.6;roughness:0.3" shadow="cast:true">
  </a-sphere>

  <!-- ═══ GEBÄUDE N-W: Schmied / Werkstatt ═══ -->
  <a-entity position="-9 0 -8">
    <a-box position="0 2 0" width="5" height="4" depth="5"
      material="color:#d8c8b8;roughness:0.9"
      tex="id:tex-stone; repx:2.5; repy:2"
      shadow="cast:true;receive:true">
    </a-box>
    <a-box position="0 4.6 0" width="5.4" height="1.2" depth="5.4"
      material="color:#c8b8a8;roughness:0.9"
      tex="id:tex-stone; repx:2.7; repy:0.6"
      shadow="cast:true">
    </a-box>
    <!-- Satteldach Schmied: ridge entlang X, Neigung über Z -->
    <a-box position="0 6.3 1.35" rotation="39.2 0 0" width="5.6" height="0.22" depth="3.48"
      material="color:#c89070;roughness:1" tex="id:tex-tiles; repx:3; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 6.3 -1.35" rotation="-39.2 0 0" width="5.6" height="0.22" depth="3.48"
      material="color:#c89070;roughness:1" tex="id:tex-tiles; repx:3; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 7.35 0" width="5.6" height="0.2" depth="0.3"
      material="color:#7a4a28;roughness:1"></a-box>
    <a-cylinder position="1 7.5 -1" radius="0.25" height="2"
      material="color:#2a2020;roughness:1" shadow="cast:true">
    </a-cylinder>
    <a-entity position="1 8.6 -1" steam></a-entity>
    <a-plane position="1.5 2.5 2.51" width="0.8" height="1"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-plane position="-1.2 2.5 2.51" width="0.8" height="1"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-box position="0 1.1 2.52" width="1" height="2.2" depth="0.06"
      material="color:#c8a070;roughness:0.9"
      tex="id:tex-wood; repx:0.9; repy:1">
    </a-box>
  </a-entity>

  <!-- ═══ GEBÄUDE N-O: Händlerhaus ═══ -->
  <a-entity position="9 0 -8">
    <a-box position="0 3 0" width="5" height="6" depth="5"
      material="color:#ddd0be;roughness:0.9"
      tex="id:tex-stone; repx:2.5; repy:3"
      shadow="cast:true;receive:true">
    </a-box>
    <a-box position="0 6.5 0" width="5.4" height="1" depth="5.4"
      material="color:#ccc0aa;roughness:0.9"
      tex="id:tex-stone; repx:2.7; repy:0.5"
      shadow="cast:true">
    </a-box>
    <!-- Satteldach Händlerhaus: ridge entlang X, Neigung über Z -->
    <a-box position="0 8.5 1.35" rotation="48.0 0 0" width="5.6" height="0.22" depth="4.04"
      material="color:#c8a098;roughness:1" tex="id:tex-tiles; repx:3; repy:2" shadow="cast:true"></a-box>
    <a-box position="0 8.5 -1.35" rotation="-48.0 0 0" width="5.6" height="0.22" depth="4.04"
      material="color:#c8a098;roughness:1" tex="id:tex-tiles; repx:3; repy:2" shadow="cast:true"></a-box>
    <a-box position="0 9.95 0" width="5.6" height="0.2" depth="0.3"
      material="color:#7a4a28;roughness:1"></a-box>
    <a-box position="0 3.5 2.8" width="2.5" height="2" depth="1"
      material="color:#d8c8b0;roughness:0.9"
      tex="id:tex-stone; repx:1.2; repy:1">
    </a-box>
    <a-plane position="1.5 4.5 2.51" width="0.9" height="1.2"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-plane position="-1.5 4.5 2.51" width="0.9" height="1.2"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-box position="0 1.1 2.52" width="1.1" height="2.2" depth="0.06"
      material="color:#b89060;roughness:0.9"
      tex="id:tex-wood; repx:1; repy:1">
    </a-box>
    <a-box position="0 2.8 2.58" width="2" height="0.6" depth="0.1"
      material="color:#c8a060;roughness:0.9"
      tex="id:tex-wood; repx:1.5; repy:0.5">
    </a-box>
  </a-entity>

  <!-- ═══ GEBÄUDE S-W: Gasthaus ═══ -->
  <a-entity position="-9 0 8">
    <a-box position="0 2.5 0" width="6" height="5" depth="5"
      material="color:#d8ccba;roughness:0.9"
      tex="id:tex-stone; repx:3; repy:2.5"
      shadow="cast:true;receive:true">
    </a-box>
    <a-box position="0 5.2 2.8" width="6.5" height="0.2" depth="1.5"
      material="color:#b89060;roughness:0.9"
      tex="id:tex-wood; repx:3; repy:0.5"
      shadow="cast:true">
    </a-box>
    <a-box position="-2.5 4.7 3.5" width="0.14" height="1.2" depth="0.14"
      material="color:#8a5530;roughness:1"
      tex="id:tex-wood; repx:0.5; repy:1">
    </a-box>
    <a-box position="2.5 4.7 3.5" width="0.14" height="1.2" depth="0.14"
      material="color:#8a5530;roughness:1"
      tex="id:tex-wood; repx:0.5; repy:1">
    </a-box>
    <a-entity position="-2.5 4.5 2.55">
      <a-cylinder radius="0.08" height="0.3" material="color:#333;roughness:0.8"></a-cylinder>
      <a-box position="0 -0.25 0" width="0.2" height="0.35" depth="0.2"
        material="color:#ffcc44;emissive:#ffaa22;emissiveIntensity:1;opacity:0.9;transparent:true"
        class="lantern-glow">
      </a-box>
      <a-entity class="lantern-light" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
    </a-entity>
    <a-entity position="2.5 4.5 2.55">
      <a-cylinder radius="0.08" height="0.3" material="color:#333;roughness:0.8"></a-cylinder>
      <a-box position="0 -0.25 0" width="0.2" height="0.35" depth="0.2"
        material="color:#ffcc44;emissive:#ffaa22;emissiveIntensity:1;opacity:0.9;transparent:true"
        class="lantern-glow">
      </a-box>
      <a-entity class="lantern-light" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
    </a-entity>
    <!-- Satteldach Gasthaus: ridge entlang X, Neigung über Z -->
    <a-box position="0 6.25 1.35" rotation="42.8 0 0" width="6.4" height="0.22" depth="3.68"
      material="color:#c09078;roughness:1" tex="id:tex-tiles; repx:3.5; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 6.25 -1.35" rotation="-42.8 0 0" width="6.4" height="0.22" depth="3.68"
      material="color:#c09078;roughness:1" tex="id:tex-tiles; repx:3.5; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 7.45 0" width="6.4" height="0.2" depth="0.3"
      material="color:#7a4a28;roughness:1"></a-box>
    <a-box position="0 1.2 2.52" width="1.2" height="2.4" depth="0.06"
      material="color:#c09060;roughness:0.9"
      tex="id:tex-wood; repx:1; repy:1">
    </a-box>
  </a-entity>

  <!-- ═══ GEBÄUDE S-O: Alchemistenladen ═══ -->
  <a-entity position="9 0 8">
    <a-box position="0 2.5 0" width="4.5" height="5" depth="4.5"
      material="color:#c8cdb8;roughness:0.9"
      tex="id:tex-stone; repx:2.2; repy:2.5"
      shadow="cast:true;receive:true">
    </a-box>
    <a-cylinder position="2.5 3.5 -2" radius="1.2" height="7"
      material="color:#b8bda8;roughness:0.9"
      tex="id:tex-stone; repx:2; repy:3.5"
      shadow="cast:true">
    </a-cylinder>
    <a-cone position="2.5 7.5 -2" radius-bottom="1.5" radius-top="0" height="2"
      material="color:#a07868;roughness:1"
      tex="id:tex-tiles; repx:2; repy:1.5"
      shadow="cast:true">
    </a-cone>
    <!-- Satteldach Alchemistenladen: ridge entlang X, Neigung über Z -->
    <a-box position="0 6.0 1.225" rotation="39.2 0 0" width="4.9" height="0.22" depth="3.16"
      material="color:#a07868;roughness:1" tex="id:tex-tiles; repx:2.5; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 6.0 -1.225" rotation="-39.2 0 0" width="4.9" height="0.22" depth="3.16"
      material="color:#a07868;roughness:1" tex="id:tex-tiles; repx:2.5; repy:1.5" shadow="cast:true"></a-box>
    <a-box position="0 6.95 0" width="4.9" height="0.2" depth="0.3"
      material="color:#7a4a28;roughness:1"></a-box>
    <a-plane position="-1 3 2.26" width="0.8" height="1"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-plane position="1 3 2.26" width="0.8" height="1"
      material="color:#f5c842;emissive:#f5a020;emissiveIntensity:0;opacity:0.82;transparent:true"
      class="window-pane">
    </a-plane>
    <a-box position="0 1.1 2.27" width="1" height="2.2" depth="0.06"
      material="color:#a08860;roughness:0.9"
      tex="id:tex-wood; repx:0.9; repy:1">
    </a-box>
  </a-entity>

  <!-- ═══ UHRTURM ═══ -->
  <a-entity position="-14 0 -2">
    <a-box position="0 1 0" width="4.5" height="2" depth="4.5"
      material="color:#c8c0b8;roughness:0.9"
      tex="id:tex-stone; repx:2.2; repy:1"
      shadow="cast:true;receive:true">
    </a-box>
    <a-cylinder position="0 8 0" radius="1.8" height="12"
      material="color:#d0c8c0;roughness:0.9"
      tex="id:tex-stone; repx:4; repy:5"
      shadow="cast:true">
    </a-cylinder>
    <a-cylinder position="0 14.2 0" radius="2.3" height="0.4"
      material="color:#b0a8a0;roughness:0.9"
      tex="id:tex-stone; repx:2; repy:0.2"
      shadow="cast:true">
    </a-cylinder>
    <a-cylinder position="0 16 0" radius="2" height="3"
      material="color:#c8c0b8;roughness:0.9"
      tex="id:tex-stone; repx:3; repy:1.5"
      shadow="cast:true">
    </a-cylinder>
    <a-circle position="0 16 2.02" radius="1.5"
      material="color:#ddccaa;emissive:#ccbb88;emissiveIntensity:0.15">
    </a-circle>
    <a-circle position="0 16 -2.02" rotation="0 180 0" radius="1.5"
      material="color:#ddccaa;emissive:#ccbb88;emissiveIntensity:0.15">
    </a-circle>
    <a-circle position="2.02 16 0" rotation="0 -90 0" radius="1.5"
      material="color:#ddccaa;emissive:#ccbb88;emissiveIntensity:0.15">
    </a-circle>
    <a-circle position="-2.02 16 0" rotation="0 90 0" radius="1.5"
      material="color:#ddccaa;emissive:#ccbb88;emissiveIntensity:0.15">
    </a-circle>
    <a-cone position="0 19.5 0" radius-bottom="2.2" radius-top="0" height="3"
      material="color:#b08070;roughness:1"
      tex="id:tex-tiles; repx:2.5; repy:2"
      shadow="cast:true">
    </a-cone>
    <a-cylinder position="0 22.3 0" radius="0.08" height="1.5"
      material="color:#888;metalness:0.8">
    </a-cylinder>
    <a-torus position="2.1 10 0" rotation="0 90 0" radius="1.1" radius-tubular="0.12"
      material="color:#7a6a40;metalness:0.5;roughness:0.6" gear-spin="speed:0.5">
    </a-torus>
    <a-torus position="-2.1 10 0" rotation="0 90 0" radius="0.75" radius-tubular="0.1"
      material="color:#6a5a30;metalness:0.5;roughness:0.6" gear-spin="speed:0.75;reverse:true">
    </a-torus>
    <a-cylinder position="0.8 14 -1.5" radius="0.22" height="4"
      material="color:#2a2020;roughness:1">
    </a-cylinder>
    <a-entity position="0.8 16.1 -1.5" steam></a-entity>
  </a-entity>

  <!-- ═══ DAMPFMASCHINE ═══ -->
  <a-entity position="13 0 -2">
    <a-cylinder position="0 1.5 0" rotation="0 0 90" radius="0.9" height="3"
      material="color:#7a5530;metalness:0.4;roughness:0.6" shadow="cast:true">
    </a-cylinder>
    <a-box position="-1 0.5 0.5"  width="0.2" height="1" depth="0.2" material="color:#4a3820"></a-box>
    <a-box position="1 0.5 0.5"   width="0.2" height="1" depth="0.2" material="color:#4a3820"></a-box>
    <a-box position="-1 0.5 -0.5" width="0.2" height="1" depth="0.2" material="color:#4a3820"></a-box>
    <a-box position="1 0.5 -0.5"  width="0.2" height="1" depth="0.2" material="color:#4a3820"></a-box>
    <a-torus position="1.7 1.5 0" rotation="0 90 0" radius="1.2" radius-tubular="0.15"
      material="color:#8a7040;metalness:0.6;roughness:0.5" gear-spin="speed:0.4">
    </a-torus>
    <a-torus position="1.7 1.5 0" rotation="0 90 0" radius="0.6" radius-tubular="0.1"
      material="color:#6a5030;metalness:0.5;roughness:0.5" gear-spin="speed:0.8;reverse:true">
    </a-torus>
    <a-cylinder position="-0.5 3.5 0" radius="0.2" height="2.5"
      material="color:#2a2020;roughness:1" shadow="cast:true">
    </a-cylinder>
    <a-entity position="-0.5 4.8 0" steam></a-entity>
    <a-cylinder position="0 2.5 0.95" radius="0.25" height="0.1"
      material="color:#ccbb88;metalness:0.5">
    </a-cylinder>
    <a-circle position="0 2.5 1.01" radius="0.22"
      material="color:#ddccaa;emissive:#ccbb88;emissiveIntensity:0.2">
    </a-circle>
  </a-entity>

  <!-- ═══ STADTLATERNEN (Marktplatz-Ring) ═══ -->
  <a-entity position="-6 0 -6">
    <a-cylinder position="0 2.5 0" radius="0.06" height="5" material="color:#3a3030"></a-cylinder>
    <a-cylinder position="0.4 4.8 0" rotation="0 0 20" radius="0.04" height="0.8" material="color:#3a3030"></a-cylinder>
    <a-box position="0.55 5.05 0" width="0.25" height="0.35" depth="0.25"
      class="lantern-glow" material="color:#886633;roughness:0.6">
    </a-box>
    <a-entity class="lantern-light" position="0.55 5.05 0" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
  </a-entity>
  <a-entity position="6 0 -6">
    <a-cylinder position="0 2.5 0" radius="0.06" height="5" material="color:#3a3030"></a-cylinder>
    <a-cylinder position="-0.4 4.8 0" rotation="0 0 -20" radius="0.04" height="0.8" material="color:#3a3030"></a-cylinder>
    <a-box position="-0.55 5.05 0" width="0.25" height="0.35" depth="0.25"
      class="lantern-glow" material="color:#886633;roughness:0.6">
    </a-box>
    <a-entity class="lantern-light" position="-0.55 5.05 0" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
  </a-entity>
  <a-entity position="-6 0 6">
    <a-cylinder position="0 2.5 0" radius="0.06" height="5" material="color:#3a3030"></a-cylinder>
    <a-cylinder position="0.4 4.8 0" rotation="0 0 20" radius="0.04" height="0.8" material="color:#3a3030"></a-cylinder>
    <a-box position="0.55 5.05 0" width="0.25" height="0.35" depth="0.25"
      class="lantern-glow" material="color:#886633;roughness:0.6">
    </a-box>
    <a-entity class="lantern-light" position="0.55 5.05 0" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
  </a-entity>
  <a-entity position="6 0 6">
    <a-cylinder position="0 2.5 0" radius="0.06" height="5" material="color:#3a3030"></a-cylinder>
    <a-cylinder position="-0.4 4.8 0" rotation="0 0 -20" radius="0.04" height="0.8" material="color:#3a3030"></a-cylinder>
    <a-box position="-0.55 5.05 0" width="0.25" height="0.35" depth="0.25"
      class="lantern-glow" material="color:#886633;roughness:0.6">
    </a-box>
    <a-entity class="lantern-light" position="-0.55 5.05 0" light="type:point;intensity:0;color:#ffaa33;distance:6"></a-entity>
  </a-entity>

  <!-- ═══ MARKTSTÄNDE ═══ -->
  <a-entity position="-3.5 0 -4.5">
    <a-box position="0 0.9 0" width="2.5" height="0.15" depth="1.5"
      material="color:#c8a870;roughness:0.9" tex="id:tex-wood; repx:1.5; repy:1"></a-box>
    <a-box position="-1.1 0.45 0" width="0.12" height="0.9" depth="0.12"
      material="color:#8a5530;roughness:1" tex="id:tex-wood; repx:0.5; repy:1"></a-box>
    <a-box position="1.1 0.45 0" width="0.12" height="0.9" depth="0.12"
      material="color:#8a5530;roughness:1" tex="id:tex-wood; repx:0.5; repy:1"></a-box>
    <a-box position="0 1.5 0" width="2.8" height="0.12" depth="1.8" rotation="5 0 0"
      material="color:#c84444;roughness:1"></a-box>
    <a-sphere position="-0.5 1.1 0"   radius="0.15" material="color:#ff6644"></a-sphere>
    <a-sphere position="0   1.1 0.1"  radius="0.13" material="color:#ffaa22"></a-sphere>
    <a-sphere position="0.5 1.1 -0.1" radius="0.14" material="color:#cc4444"></a-sphere>
  </a-entity>
  <a-entity position="3.5 0 -4.5">
    <a-box position="0 0.9 0" width="2.5" height="0.15" depth="1.5"
      material="color:#c8a870;roughness:0.9" tex="id:tex-wood; repx:1.5; repy:1"></a-box>
    <a-box position="-1.1 0.45 0" width="0.12" height="0.9" depth="0.12"
      material="color:#8a5530;roughness:1" tex="id:tex-wood; repx:0.5; repy:1"></a-box>
    <a-box position="1.1 0.45 0" width="0.12" height="0.9" depth="0.12"
      material="color:#8a5530;roughness:1" tex="id:tex-wood; repx:0.5; repy:1"></a-box>
    <a-box position="0 1.5 0" width="2.8" height="0.12" depth="1.8" rotation="-5 0 0"
      material="color:#4488cc;roughness:1"></a-box>
    <a-box position="-0.5 1.08 0" width="0.3" height="0.2" depth="0.4" material="color:#4a3010"></a-box>
    <a-box position="0.2 1.08 0"  width="0.25" height="0.22" depth="0.35" material="color:#5a4020"></a-box>
  </a-entity>

  <!-- ═══ TOR NORD → Sturmreich ═══ -->
  <a-entity position="0 0 -28">
    <a-cylinder position="-4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cylinder position="4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="-4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"w
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-cone position="4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.5"
      theta-length="180" theta-start="0"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:1" shadow="cast:true"></a-torus>
    <a-box position="0 3 0" width="6" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:3; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 2.5 0" width="4" height="5" depth="1.8" material="color:#111;roughness:1"></a-box>
    <a-box position="0 5.5 0" width="1.2" height="0.8" depth="1.8"
      material="color:#b8b0a8;roughness:0.9" tex="id:tex-stone; repx:0.6; repy:0.4"></a-box>
    <a-box position="0 7.5 0.85" width="3" height="0.8" depth="0.2"
      material="color:#c8a060;roughness:0.9" tex="id:tex-wood; repx:2; repy:0.6"></a-box>
    <a-text value="STURMREICH" position="0 7.5 0.96" align="center" color="#ddccaa" width="3.5"
      font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    <a-box position="-12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="-15 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-13 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-11 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-9 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="9 6.5 0"   width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="11 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="13 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="15 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ═══ TOR SÜD → Feenreich ═══ -->
  <a-entity position="0 0 28">
    <a-cylinder position="-4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cylinder position="4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="-4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-cone position="4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.5"
      theta-length="180" theta-start="0"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:1" shadow="cast:true"></a-torus>
    <!-- Torrahmen Süd: linke + rechte Seite + Sturz (Öffnung x=-2..2, y=0..5 bleibt frei) -->
    <a-box position="-2.5 3 0" width="1" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:0.5; repy:3" shadow="cast:true"></a-box>
    <a-box position=" 2.5 3 0" width="1" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:0.5; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 5.5 0" width="4" height="1" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:0.5" shadow="cast:true"></a-box>
    <a-box position="0 6.2 0" width="1.2" height="0.8" depth="1.8"
      material="color:#b8b0a8;roughness:0.9" tex="id:tex-stone; repx:0.6; repy:0.4"></a-box>
    <!-- Schild Südseite (sichtbar aus dem Feenreich) -->
    <a-box position="0 7.5 0.85" width="3" height="0.8" depth="0.2"
      material="color:#c8a060;roughness:0.9" tex="id:tex-wood; repx:2; repy:0.6"></a-box>
    <a-text value="FEENREICH" position="0 7.5 0.96" align="center" color="#88ff88" width="3.5"></a-text>
    <!-- Schild Nordseite (sichtbar aus der Kesselstadt) -->
    <a-box position="0 7.5 -0.85" width="3" height="0.8" depth="0.2"
      material="color:#c8a060;roughness:0.9" tex="id:tex-wood; repx:2; repy:0.6"></a-box>
    <a-text value="FEENREICH" position="0 7.5 -0.96" rotation="0 180 0" align="center" color="#88ff88" width="3.5"></a-text>
    <a-box position="-12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="-15 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-13 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-11 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-9 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="9 6.5 0"   width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="11 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="13 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="15 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <!-- Torflügel SÜD – linker Flügel (Scharnier an linkem Pfosten, x=-2) -->
    <a-entity id="gate-south-left" position="-2 0 0"
      animation__open="property:rotation; to:0 90 0; dur:1600; easing:easeInOutSine; startEvents:gate-open; autoplay:false"
      animation__close="property:rotation; to:0 0 0; dur:1400; easing:easeInOutSine; startEvents:gate-close; autoplay:false">
      <a-box position="0.95 2.5 0" width="1.9" height="5" depth="0.14"
        tex="id:tex-wood; repx:1; repy:2.5"
        material="color:#7a5430; shader:flat">
      </a-box>
      <a-box position="0.95 4.2 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
      <a-box position="0.95 0.8 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
    </a-entity>
    <!-- Torflügel SÜD – rechter Flügel (Scharnier an rechtem Pfosten, x=+2) -->
    <a-entity id="gate-south-right" position="2 0 0"
      animation__open="property:rotation; to:0 -90 0; dur:1600; easing:easeInOutSine; startEvents:gate-open; autoplay:false"
      animation__close="property:rotation; to:0 0 0; dur:1400; easing:easeInOutSine; startEvents:gate-close; autoplay:false">
      <a-box position="-0.95 2.5 0" width="1.9" height="5" depth="0.14"
        tex="id:tex-wood; repx:1; repy:2.5"
        material="color:#7a5430; shader:flat">
      </a-box>
      <a-box position="-0.95 4.2 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
      <a-box position="-0.95 0.8 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
    </a-entity>
  </a-entity>

  <!-- ═══ TOR OST → Schattenreich ═══ -->
  <a-entity position="28 0 0" rotation="0 90 0">
    <a-cylinder position="-4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cylinder position="4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="-4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-cone position="4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.5"
      theta-length="180" theta-start="0"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:1" shadow="cast:true"></a-torus>
    <a-box position="0 3 0" width="6" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:3; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 2.5 0" width="4" height="5" depth="1.8" material="color:#111;roughness:1"></a-box>
    <a-box position="0 5.5 0" width="1.2" height="0.8" depth="1.8"
      material="color:#b8b0a8;roughness:0.9" tex="id:tex-stone; repx:0.6; repy:0.4"></a-box>
    <a-box position="0 7.5 0.85" width="3.5" height="0.8" depth="0.2"
      material="color:#c8a060;roughness:0.9" tex="id:tex-wood; repx:2.5; repy:0.6"></a-box>
    <a-text value="SCHATTENREICH" position="0 7.5 0.96" align="center" color="#aaaaff" width="3.8"
      font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    <a-box position="-12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="-15 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-13 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-11 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-9 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="9 6.5 0"   width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="11 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="13 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="15 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ═══ TOR WEST → Lichtreich ═══ -->
  <a-entity position="-28 0 0" rotation="0 -90 0">
    <a-cylinder position="-4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cylinder position="4 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="-4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-cone position="4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.5"
      theta-length="180" theta-start="0"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:1" shadow="cast:true"></a-torus>
    <!-- Torrahmen West: linke + rechte Seite + Sturz (Öffnung x=-2..2, y=0..5 bleibt frei) -->
    <a-box position="-2.5 3 0" width="1" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:0.5; repy:3" shadow="cast:true"></a-box>
    <a-box position=" 2.5 3 0" width="1" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:0.5; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 5.5 0" width="4" height="1" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:0.5" shadow="cast:true"></a-box>
    <a-box position="0 6.2 0" width="1.2" height="0.8" depth="1.8"
      material="color:#b8b0a8;roughness:0.9" tex="id:tex-stone; repx:0.6; repy:0.4"></a-box>
    <a-box position="0 7.5 0.85" width="3" height="0.8" depth="0.2"
      material="color:#c8a060;roughness:0.9" tex="id:tex-wood; repx:2; repy:0.6"></a-box>
    <a-text value="LICHTREICH" position="0 7.5 0.96" align="center" color="#ffffaa" width="3.5"
      font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    <a-box position="-12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="-15 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-13 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-11 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-9 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="9 6.5 0"   width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="11 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="13 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="15 6.5 0"  width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <!-- Torflügel WEST – linker Flügel (Scharnier an linkem Pfosten, x=-2) -->
    <a-entity id="gate-west-left" position="-2 0 0"
      animation__open="property:rotation; to:0 90 0; dur:1600; easing:easeInOutSine; startEvents:gate-open; autoplay:false"
      animation__close="property:rotation; to:0 0 0; dur:1400; easing:easeInOutSine; startEvents:gate-close; autoplay:false">
      <a-box position="0.95 2.5 0" width="1.9" height="5" depth="0.14"
        tex="id:tex-wood; repx:1; repy:2.5"
        material="color:#7a5430; shader:flat">
      </a-box>
      <a-box position="0.95 4.2 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
      <a-box position="0.95 0.8 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
    </a-entity>
    <!-- Torflügel WEST – rechter Flügel (Scharnier an rechtem Pfosten, x=+2) -->
    <a-entity id="gate-west-right" position="2 0 0"
      animation__open="property:rotation; to:0 -90 0; dur:1600; easing:easeInOutSine; startEvents:gate-open; autoplay:false"
      animation__close="property:rotation; to:0 0 0; dur:1400; easing:easeInOutSine; startEvents:gate-close; autoplay:false">
      <a-box position="-0.95 2.5 0" width="1.9" height="5" depth="0.14"
        tex="id:tex-wood; repx:1; repy:2.5"
        material="color:#7a5430; shader:flat">
      </a-box>
      <a-box position="-0.95 4.2 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
      <a-box position="-0.95 0.8 0" width="1.9" height="0.2" depth="0.2" material="color:#42280a; shader:flat"></a-box>
    </a-entity>
  </a-entity>

  <!-- ═══ LUFTSCHIFFE ═══ -->
  <a-entity position="10 22 -15"
    animation="property:position; to:-20 24 -10; dur:30000; loop:true; dir:alternate; easing:easeInOutSine">
    <a-box position="0 0 0" width="3.5" height="1.2" depth="1.2"
      material="color:#c8a070;roughness:0.8" tex="id:tex-wood; repx:2; repy:0.8" shadow="cast:true"></a-box>
    <a-sphere position="0 2 0" radius="2.2" scale="1 1.3 1"
      material="color:#aa3322;roughness:0.8;metalness:0.1" shadow="cast:true"></a-sphere>
    <a-cylinder position="-0.8 0.9 0" radius="0.05" height="1.5" rotation="15 0 0"
      material="color:#3a2a10"></a-cylinder>
    <a-cylinder position="0.8 0.9 0" radius="0.05" height="1.5" rotation="-15 0 0"
      material="color:#3a2a10"></a-cylinder>
    <a-cylinder position="-0.6 0.8 0" radius="0.1" height="0.8" material="color:#2a1a10"></a-cylinder>
    <a-entity position="-0.6 1.25 0" steam></a-entity>
    <a-box position="1.9 0 0" width="0.1" height="1.8" depth="0.3"
      material="color:#5a4020"
      animation="property:rotation; to:0 0 360; loop:true; dur:1000; easing:linear"></a-box>
  </a-entity>
  <a-entity position="-20 28 -30"
    animation="property:position; to:15 26 -35; dur:45000; loop:true; dir:alternate; easing:easeInOutSine">
    <a-box position="0 0 0" width="2.5" height="0.9" depth="0.9"
      material="color:#a08060;roughness:0.8" tex="id:tex-wood; repx:1.5; repy:0.6"></a-box>
    <a-sphere position="0 1.6 0" radius="1.6" scale="1 1.25 1"
      material="color:#224466;roughness:0.8"></a-sphere>
  </a-entity>

  <!-- ═══ MAUERERGÄNZUNGEN – Ecktürme und lückenschließende Wandsegmente ═══ -->
  <!-- Lücken: N/S-Wand von x=±18 bis x=±26; O/W-Wand von z=±18 bis z=±26     -->
  <!-- Ecktürme bei (±28, 0, ±28) schließen die verbleibenden Eckpunkte.        -->

  <!-- ── Ecktürme ──────────────────────────────────────────────────────────── -->
  <a-entity position="28 0 -28">
    <a-cylinder position="0 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="0 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
  </a-entity>
  <a-entity position="-28 0 -28">
    <a-cylinder position="0 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="0 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
  </a-entity>
  <a-entity position="28 0 28">
    <a-cylinder position="0 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="0 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
  </a-entity>
  <a-entity position="-28 0 28">
    <a-cylinder position="0 4 0" radius="2" height="8"
      material="color:#c8c0b8;roughness:0.9" tex="id:tex-stone; repx:2.5; repy:4" shadow="cast:true"></a-cylinder>
    <a-cone position="0 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
  </a-entity>

  <!-- ── N-Wand: x=−26…−18 bei z=−28 ──────────────────────────────────────── -->
  <a-entity position="-22 0 -28">
    <a-box position="0 3 0" width="8" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:4; repy:3" shadow="cast:true"></a-box>
    <a-box position="-3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>
  <!-- ── N-Wand: x=+18…+26 bei z=−28 ──────────────────────────────────────── -->
  <a-entity position="22 0 -28">
    <a-box position="0 3 0" width="8" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:4; repy:3" shadow="cast:true"></a-box>
    <a-box position="-3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ── S-Wand: x=−26…−18 bei z=+28 ──────────────────────────────────────── -->
  <a-entity position="-22 0 28">
    <a-box position="0 3 0" width="8" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:4; repy:3" shadow="cast:true"></a-box>
    <a-box position="-3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>
  <!-- ── S-Wand: x=+18…+26 bei z=+28 ──────────────────────────────────────── -->
  <a-entity position="22 0 28">
    <a-box position="0 3 0" width="8" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:4; repy:3" shadow="cast:true"></a-box>
    <a-box position="-3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="-1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 1 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position=" 3 6.5 0" width="1" height="1" depth="1.8" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ── O-Wand: z=−26…−18 bei x=+28 ──────────────────────────────────────── -->
  <!-- Zinnen laufen in Z-Richtung → width=1.8 (Wandtiefe), depth=1          -->
  <a-entity position="28 0 -22">
    <a-box position="0 3 0" width="1.6" height="6" depth="8"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:1; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 6.5 -3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5 -1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>
  <!-- ── O-Wand: z=+18…+26 bei x=+28 ──────────────────────────────────────── -->
  <a-entity position="28 0 22">
    <a-box position="0 3 0" width="1.6" height="6" depth="8"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:1; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 6.5 -3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5 -1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ── W-Wand: z=−26…−18 bei x=−28 ──────────────────────────────────────── -->
  <a-entity position="-28 0 -22">
    <a-box position="0 3 0" width="1.6" height="6" depth="8"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:1; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 6.5 -3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5 -1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>
  <!-- ── W-Wand: z=+18…+26 bei x=−28 ──────────────────────────────────────── -->
  <a-entity position="-28 0 22">
    <a-box position="0 3 0" width="1.6" height="6" depth="8"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:1; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 6.5 -3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5 -1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  1" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
    <a-box position="0 6.5  3" width="1.8" height="1" depth="1" material="color:#b8b0a8" tex="id:tex-stone; repx:0.5; repy:0.5"></a-box>
  </a-entity>

  <!-- ═══ STADTLEBEN ═══ -->
  <a-entity id="city-life-root" city-life></a-entity>

</a-entity>
`;
