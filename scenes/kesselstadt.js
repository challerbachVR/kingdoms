// ═══════════════════════════════════════════════════════════════════════════
// KESSELSTADT SZENE – A-Frame Komponente
// Baut den gesamten Stadtinhalt dynamisch auf.
// ═══════════════════════════════════════════════════════════════════════════

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
    this._done   = window.QUEST1.triggered === true;
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
      if (e.code === 'KeyE') this._tryTransit();
    });

    sc.addEventListener('loaded', () => {
      const rh = document.getElementById('rightHand');
      if (rh) rh.addEventListener('triggerdown', () => this._tryTransit());
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
        this._cooldown = 1.5;
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
    if (this._rig)      this._rig.object3D.position.set(-9, 0, 9.0);
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
    if (this._rig)      this._rig.object3D.position.set(-9, 0, 12.5);
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
