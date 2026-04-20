// ═══════════════════════════════════════════════════════════════════════════
// UI PANEL – holografisches Einstellungsmenü
// Öffnen: Quest-3 Menu-Button (linker Controller) · M-Taste Desktop · ⚙ Mobile
// Injiziert sich in die <a-camera> damit das Panel immer vor dem Spieler liegt.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ── Panel-HTML (wird in <a-camera> eingefügt) ────────────────────────────
  const PANEL_HTML = `
<a-entity id="ui-panel" visible="false" position="0 0 -1.8">

  <!-- ── Hintergrund ──────────────────────────────────────────────────── -->
  <a-box position="0 0 -0.006" width="1.84" height="1.34" depth="0.01"
    material="color:#030a14;opacity:0.94;transparent:true;shader:flat"></a-box>

  <!-- ── Glühende Rahmenlinien ────────────────────────────────────────── -->
  <a-box position="0  0.67 0" width="1.86" height="0.013" depth="0.013"
    material="color:#00aaff;emissive:#00aaff;emissiveIntensity:1.0;shader:flat"></a-box>
  <a-box position="0 -0.67 0" width="1.86" height="0.013" depth="0.013"
    material="color:#00aaff;emissive:#00aaff;emissiveIntensity:1.0;shader:flat"></a-box>
  <a-box position="-0.92 0 0" width="0.013" height="1.34" depth="0.013"
    material="color:#00aaff;emissive:#00aaff;emissiveIntensity:1.0;shader:flat"></a-box>
  <a-box position=" 0.92 0 0" width="0.013" height="1.34" depth="0.013"
    material="color:#00aaff;emissive:#00aaff;emissiveIntensity:1.0;shader:flat"></a-box>

  <!-- ── Header-Balken ────────────────────────────────────────────────── -->
  <a-box position="0 0.53 0.002" width="1.84" height="0.26" depth="0.008"
    material="color:#001428;opacity:0.97;transparent:true;shader:flat"></a-box>
  <a-box position="0 0.40 0.002" width="1.84" height="0.010" depth="0.008"
    material="color:#00aaff;emissive:#00aaff;emissiveIntensity:0.65;shader:flat"></a-box>
  <a-text value="⚙ KINGDOMS" position="-0.83 0.53 0.02"
    color="#44ccff" width="1.9" align="left" baseline="center"></a-text>
  <a-text id="ui-zone-text" value="Kesselstadt" position="0.83 0.53 0.02"
    color="#88ffcc" width="1.9" align="right" baseline="center"></a-text>

  <!-- ── TAGESZEIT ─────────────────────────────────────────────────────── -->
  <a-text value="TAGESZEIT" position="-0.83 0.27 0.02"
    color="#4d7a99" width="1.5" align="left" baseline="center"></a-text>

  <!-- Morgen -->
  <a-box id="ui-btn-morning" class="ui-btn" data-mode="morning"
    position="-0.635 0.08 0.014" width="0.39" height="0.23" depth="0.010"
    material="color:#1a0d00;emissive:#cc8833;emissiveIntensity:0.30;shader:flat"
    event-set__mouseenter="material.emissiveIntensity: 0.85"
    event-set__mouseleave="material.emissiveIntensity: 0.30">
    <a-text value="Morgen" position="0 0 0.014" align="center"
      color="#ffe4aa" width="0.90" baseline="center"></a-text>
  </a-box>
  <!-- Tag -->
  <a-box id="ui-btn-day" class="ui-btn" data-mode="day"
    position="-0.212 0.08 0.014" width="0.39" height="0.23" depth="0.010"
    material="color:#001128;emissive:#2266aa;emissiveIntensity:0.30;shader:flat"
    event-set__mouseenter="material.emissiveIntensity: 0.85"
    event-set__mouseleave="material.emissiveIntensity: 0.30">
    <a-text value="Tag" position="0 0 0.014" align="center"
      color="#aaddff" width="0.90" baseline="center"></a-text>
  </a-box>
  <!-- Abend -->
  <a-box id="ui-btn-evening" class="ui-btn" data-mode="evening"
    position="0.212 0.08 0.014" width="0.39" height="0.23" depth="0.010"
    material="color:#1e0800;emissive:#aa4411;emissiveIntensity:0.30;shader:flat"
    event-set__mouseenter="material.emissiveIntensity: 0.85"
    event-set__mouseleave="material.emissiveIntensity: 0.30">
    <a-text value="Abend" position="0 0 0.014" align="center"
      color="#ffccaa" width="0.90" baseline="center"></a-text>
  </a-box>
  <!-- Nacht -->
  <a-box id="ui-btn-night" class="ui-btn" data-mode="night"
    position="0.635 0.08 0.014" width="0.39" height="0.23" depth="0.010"
    material="color:#05051a;emissive:#1a1a66;emissiveIntensity:0.30;shader:flat"
    event-set__mouseenter="material.emissiveIntensity: 0.85"
    event-set__mouseleave="material.emissiveIntensity: 0.30">
    <a-text value="Nacht" position="0 0 0.014" align="center"
      color="#ccccff" width="0.90" baseline="center"></a-text>
  </a-box>

  <!-- ── Trennlinie ────────────────────────────────────────────────────── -->
  <a-box position="0 -0.115 0.002" width="1.72" height="0.008" depth="0.008"
    material="color:#004466;emissive:#004466;emissiveIntensity:0.65;shader:flat"></a-box>

  <!-- ── SOUND ─────────────────────────────────────────────────────────── -->
  <a-text value="SOUND" position="-0.83 -0.25 0.02"
    color="#4d7a99" width="1.5" align="left" baseline="center"></a-text>

  <!-- Kesselstadt Sound -->
  <a-box id="ui-btn-city-sound" class="ui-btn"
    position="-0.465 -0.445 0.014" width="0.86" height="0.25" depth="0.010"
    material="color:#060f1e;emissive:#0a3366;emissiveIntensity:0.40;shader:flat"
    event-set__mouseenter="material.emissiveIntensity: 0.90"
    event-set__mouseleave="material.emissiveIntensity: 0.40">
    <a-text id="ui-city-sound-label" value="⚙ Kesselstadt  AN" position="0 0 0.014"
      align="center" color="#88ccff" width="1.60" baseline="center"></a-text>
  </a-box>
  <!-- Feenreich Sound -->
  <a-box id="ui-btn-feen-sound" class="ui-btn"
    position="0.465 -0.445 0.014" width="0.86" height="0.25" depth="0.010"
    material="color:#060f1e;emissive:#0a3366;emissiveIntensity:0.40;shader:flat"
    event-set__mouseenter="material.emissiveIntensity: 0.90"
    event-set__mouseleave="material.emissiveIntensity: 0.40">
    <a-text id="ui-feen-sound-label" value="✦ Feenreich  AN" position="0 0 0.014"
      align="center" color="#88ccff" width="1.60" baseline="center"></a-text>
  </a-box>

  <!-- ── Hinweis ───────────────────────────────────────────────────────── -->
  <a-text value="[M] Desktop  ·  Menu-Btn VR  ·  ☰ Mobile" position="0 -0.60 0.02"
    color="#263340" width="1.55" align="center" baseline="center"></a-text>

</a-entity>`;

  // ── Farben für Tageszeit-Buttons (normal / ausgegraut) ───────────────────
  const MODE_EMI = { morning: '#cc8833', day: '#2266aa', evening: '#aa4411', night: '#1a1a66' };
  const GRAY_MAT = 'color:#0d1118;emissive:#0d1118;emissiveIntensity:0.12;shader:flat';

  // ── Komponente ────────────────────────────────────────────────────────────
  AFRAME.registerComponent('ui-panel-manager', {
    init() {
      this._vis       = false;
      this._inFeen    = false;
      this._cityMuted = false;
      this._feenMuted = false;
      this._panel     = null;
      this._onKey     = null;

      this.el.addEventListener('loaded', () => this._setup());
    },

    // ── Alles verdrahten ────────────────────────────────────────────────────
    _setup() {
      // Panel in die Kamera injizieren (immer vor dem Spieler)
      const cam = document.getElementById('camera');
      if (!cam) return;
      cam.insertAdjacentHTML('beforeend', PANEL_HTML);
      this._panel = document.getElementById('ui-panel');

      // Tageszeit-Buttons
      ['morning', 'day', 'evening', 'night'].forEach(mode => {
        const btn = document.getElementById('ui-btn-' + mode);
        if (!btn) return;
        const act = () => {
          if (this._inFeen) return;                          // im Feenreich gesperrt
          this.el.setAttribute('daynight', 'mode: ' + mode);
          if (window._KS) window._KS.setMode(mode);
        };
        btn.addEventListener('click',       act);
        btn.addEventListener('triggerdown', act);
      });

      // Sound-Toggles
      const soundBtns = [
        { id: 'ui-btn-city-sound', flag: '_cityMuted', apiFn: 'setCityMute' },
        { id: 'ui-btn-feen-sound', flag: '_feenMuted', apiFn: 'setFeenMute' },
      ];
      soundBtns.forEach(({ id, flag, apiFn }) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        const act = () => {
          this[flag] = !this[flag];
          if (window._KS && window._KS[apiFn]) window._KS[apiFn](this[flag]);
          this._updateSoundBtns();
        };
        btn.addEventListener('click',       act);
        btn.addEventListener('triggerdown', act);
      });

      // Zone-Wechsel (kommt von feenreich-scene)
      this.el.addEventListener('zone-changed', e => {
        this._inFeen = (e.detail.zone === 'feen');
        this._updateZoneLabel();
        this._updateTimeBtns();
      });

      // Desktop: M-Taste
      this._onKey = e => {
        if ((e.key === 'm' || e.key === 'M') && !e.target.matches('input, textarea'))
          this._toggle();
      };
      window.addEventListener('keydown', this._onKey);

      // VR: X-Button linker Meta-Controller
      const lh = document.getElementById('leftHand');
      if (lh) lh.addEventListener('xbuttondown', () => this._toggle());

      // Mobile: schwebender FAB-Button
      this._buildMobileFAB();
    },

    // ── Toggle ──────────────────────────────────────────────────────────────
    _toggle() {
      this._vis = !this._vis;
      if (this._panel) this._panel.setAttribute('visible', this._vis);
    },

    // ── Zonenanzeige ────────────────────────────────────────────────────────
    _updateZoneLabel() {
      const el = document.getElementById('ui-zone-text');
      if (!el) return;
      el.setAttribute('value', this._inFeen ? 'Feenreich' : 'Kesselstadt');
      el.setAttribute('color', this._inFeen ? '#88ffaa' : '#88ffcc');
    },

    // ── Tageszeit-Buttons: normal oder ausgegraut ────────────────────────────
    _updateTimeBtns() {
      ['morning', 'day', 'evening', 'night'].forEach(m => {
        const btn = document.getElementById('ui-btn-' + m);
        if (!btn) return;
        if (this._inFeen) {
          btn.setAttribute('material', GRAY_MAT);
        } else {
          btn.setAttribute('material',
            `color:#0a0d14;emissive:${MODE_EMI[m]};emissiveIntensity:0.30;shader:flat`);
        }
      });
    },

    // ── Sound-Button-Zustand ─────────────────────────────────────────────────
    _updateSoundBtns() {
      const cm = this._cityMuted, fm = this._feenMuted;

      const cl = document.getElementById('ui-city-sound-label');
      if (cl) {
        cl.setAttribute('value',  '⚙ Kesselstadt  ' + (cm ? 'AUS' : 'AN'));
        cl.setAttribute('color',  cm ? '#3d5060' : '#88ccff');
      }
      const fl = document.getElementById('ui-feen-sound-label');
      if (fl) {
        fl.setAttribute('value',  '✦ Feenreich  ' + (fm ? 'AUS' : 'AN'));
        fl.setAttribute('color',  fm ? '#3d5060' : '#88ccff');
      }

      const cb = document.getElementById('ui-btn-city-sound');
      if (cb) cb.setAttribute('material',
        `color:#060f1e;emissive:${cm ? '#440011' : '#0a3366'};emissiveIntensity:0.40;shader:flat`);
      const fb = document.getElementById('ui-btn-feen-sound');
      if (fb) fb.setAttribute('material',
        `color:#060f1e;emissive:${fm ? '#440011' : '#0a3366'};emissiveIntensity:0.40;shader:flat`);
    },

    // ── Mobiler FAB-Button (nur auf Touch-Geräten) ───────────────────────────
    _buildMobileFAB() {
      if (!('ontouchstart' in window) && navigator.maxTouchPoints < 1) return;

      const sty = document.createElement('style');
      sty.textContent = `
        #ui-menu-fab {
          position: fixed; bottom: 200px; right: 22px;
          width: 50px; height: 50px; border-radius: 50%;
          background: rgba(3,10,20,0.86);
          border: 2px solid rgba(0,170,255,0.72);
          color: rgba(0,200,255,0.95); font-size: 22px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          z-index: 9998; touch-action: none;
          user-select: none; -webkit-user-select: none;
          box-shadow: 0 0 14px rgba(0,150,240,0.45);
        }
        #ui-menu-fab.in-vr { display: none !important; }
      `;
      document.head.appendChild(sty);

      const fab = document.createElement('div');
      fab.id = 'ui-menu-fab';
      fab.textContent = '⚙';
      document.body.appendChild(fab);

      fab.addEventListener('touchstart', e => {
        e.preventDefault();
        this._toggle();
      }, { passive: false });

      document.addEventListener('enter-vr', () => fab.classList.add('in-vr'));
      document.addEventListener('exit-vr',  () => fab.classList.remove('in-vr'));
    },

    remove() {
      if (this._onKey) window.removeEventListener('keydown', this._onKey);
    },
  });

})();
