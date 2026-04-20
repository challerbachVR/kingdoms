// ═══════════════════════════════════════════════════════════════════════════
// MOBILE TOUCH-JOYSTICKS
// Zwei virtuelle Joysticks für Smartphones / Tablets.
// Sichtbar nur auf Touch-Geräten, automatisch ausgeblendet in VR.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // Kein Touch-Gerät → sofort beenden, keinerlei DOM-Änderungen
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (!isTouch) return;

  // ── Konstanten ────────────────────────────────────────────────────────────
  const MOVE_SPEED = 5.5;   // m/s Bewegungsgeschwindigkeit
  const TURN_SPEED = 2.2;   // rad/s Rotationsgeschwindigkeit
  const KNOB_MAX   = 46;    // px maximaler Knob-Ausschlag vom Mittelpunkt
  const DEAD_PX    = 9;     // px toter Bereich

  // ── Joystick-Zustand ──────────────────────────────────────────────────────
  // on: aktiv | id: Touch-Identifier | sx/sy: Start-Pixel | nx/ny: normiert [-1..1]
  const L = { on: false, id: -1, sx: 0, sy: 0, nx: 0, ny: 0 };
  const R = { on: false, id: -1, sx: 0, sy: 0, nx: 0, ny: 0 };

  // Three.js Arbeits-Vektoren (einmal alloziert, kein GC-Druck)
  let _rig = null, _cam = null, _lastT = 0;
  const _fwd  = new THREE.Vector3();
  const _side = new THREE.Vector3();
  const _camQ = new THREE.Quaternion();

  // ── DOM + CSS ─────────────────────────────────────────────────────────────
  function buildDOM() {
    const style = document.createElement('style');
    style.textContent = `
      #tc-overlay {
        position: fixed; bottom: 0; left: 0; right: 0; height: 180px;
        display: flex; align-items: center;
        pointer-events: none;
        z-index: 9999;
        user-select: none; -webkit-user-select: none;
      }
      #tc-overlay.tc-vr { display: none !important; }

      .tc-zone {
        flex: 1;
        display: flex; align-items: center; justify-content: center;
        pointer-events: all;
      }

      .tc-wrap {
        position: relative;
      }

      .tc-base {
        width: 114px; height: 114px; border-radius: 50%;
        background: rgba(255,255,255,0.08);
        border: 2px solid rgba(255,255,255,0.28);
        position: relative;
        touch-action: none;
        transition: background 0.12s, border-color 0.12s;
      }
      .tc-base.tc-active {
        background: rgba(255,255,255,0.16);
        border-color: rgba(255,255,255,0.50);
      }

      .tc-knob {
        width: 50px; height: 50px; border-radius: 50%;
        background: rgba(255,255,255,0.38);
        border: 2px solid rgba(255,255,255,0.72);
        box-shadow: 0 0 10px rgba(255,255,255,0.18);
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        will-change: transform;
      }
      .tc-base.tc-active .tc-knob {
        background: rgba(255,255,255,0.55);
        box-shadow: 0 0 14px rgba(255,255,255,0.35);
      }

      .tc-label {
        position: absolute; bottom: -20px;
        left: 0; right: 0; text-align: center;
        font-size: 11px; font-family: sans-serif;
        color: rgba(255,255,255,0.35);
        pointer-events: none; letter-spacing: 0.04em;
      }
    `;
    document.head.appendChild(style);

    const ov = document.createElement('div');
    ov.id = 'tc-overlay';
    ov.innerHTML = `
      <div class="tc-zone">
        <div class="tc-wrap">
          <div class="tc-base" id="tc-left">
            <div class="tc-knob" id="tc-lknob"></div>
          </div>
          <div class="tc-label">Bewegen</div>
        </div>
      </div>
      <div class="tc-zone">
        <div class="tc-wrap">
          <div class="tc-base" id="tc-right">
            <div class="tc-knob" id="tc-rknob"></div>
          </div>
          <div class="tc-label">Drehen</div>
        </div>
      </div>
    `;
    document.body.appendChild(ov);

    // In VR ausblenden (events bubblen von a-scene → document)
    document.addEventListener('enter-vr', () => ov.classList.add('tc-vr'));
    document.addEventListener('exit-vr',  () => ov.classList.remove('tc-vr'));

    bindEvents(
      document.getElementById('tc-left'),
      document.getElementById('tc-right'),
      document.getElementById('tc-lknob'),
      document.getElementById('tc-rknob'),
    );
  }

  // ── Touch-Events ──────────────────────────────────────────────────────────
  function bindEvents(lBase, rBase, lKnob, rKnob) {

    // touchstart: jeweils nur auf dem eigenen Element registriert,
    // stopPropagation verhindert dass look-controls diesen Touch sieht.
    function startHandler(stick, base, e) {
      e.preventDefault(); e.stopPropagation();
      if (stick.on) return; // zweiter Finger auf demselben Joystick ignorieren
      const t = e.changedTouches[0];
      stick.on = true; stick.id = t.identifier;
      stick.sx = t.clientX; stick.sy = t.clientY;
      stick.nx = 0; stick.ny = 0;
      base.classList.add('tc-active');
    }

    lBase.addEventListener('touchstart', e => startHandler(L, lBase, e), { passive: false });
    rBase.addEventListener('touchstart', e => startHandler(R, rBase, e), { passive: false });

    // touchmove: document-Level um Bewegung außerhalb des Kreises zu erfassen
    document.addEventListener('touchmove', e => {
      for (const t of e.changedTouches) {
        if (L.on && t.identifier === L.id) {
          e.preventDefault();
          const v = normalise(t.clientX - L.sx, t.clientY - L.sy);
          L.nx = v.x; L.ny = v.y;
          moveKnob(lKnob, t.clientX - L.sx, t.clientY - L.sy);
        }
        if (R.on && t.identifier === R.id) {
          e.preventDefault();
          const v = normalise(t.clientX - R.sx, t.clientY - R.sy);
          R.nx = v.x; R.ny = v.y;
          moveKnob(rKnob, t.clientX - R.sx, t.clientY - R.sy);
        }
      }
    }, { passive: false });

    // touchend / touchcancel
    function endTouch(e) {
      for (const t of e.changedTouches) {
        if (L.on && t.identifier === L.id) {
          L.on = false; L.nx = 0; L.ny = 0;
          lBase.classList.remove('tc-active');
          resetKnob(lKnob);
        }
        if (R.on && t.identifier === R.id) {
          R.on = false; R.nx = 0; R.ny = 0;
          rBase.classList.remove('tc-active');
          resetKnob(rKnob);
        }
      }
    }
    document.addEventListener('touchend',    endTouch);
    document.addEventListener('touchcancel', endTouch);
  }

  // ── Knob-Visuals ──────────────────────────────────────────────────────────
  function normalise(dx, dy) {
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < DEAD_PX) return { x: 0, y: 0 };
    const scale = Math.min(d, KNOB_MAX) / (KNOB_MAX * d);
    return { x: dx * scale, y: dy * scale };
  }

  function moveKnob(knob, dx, dy) {
    const d  = Math.sqrt(dx * dx + dy * dy);
    const r  = Math.min(d, KNOB_MAX);
    const ox = d > 0 ? (dx / d) * r : 0;
    const oy = d > 0 ? (dy / d) * r : 0;
    knob.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`;
  }

  function resetKnob(knob) {
    knob.style.transform = 'translate(-50%, -50%)';
  }

  // ── Game-Loop (requestAnimationFrame) ─────────────────────────────────────
  // Läuft unabhängig vom A-Frame-Tick; schreibt direkt auf rig.object3D.
  function loop(now) {
    requestAnimationFrame(loop);

    if (!L.on && !R.on) { _lastT = now; return; }

    const dt = Math.min(now - (_lastT || now), 50) * 0.001;
    _lastT = now;

    if (!_rig) _rig = document.getElementById('rig');
    if (!_cam) _cam = document.getElementById('camera');
    if (!_rig || !_cam) return;

    // ── Linker Stick: Vorwärts / Rückwärts / Seitwärts ──────────────────
    if (L.on && (L.nx !== 0 || L.ny !== 0)) {
      _cam.object3D.getWorldQuaternion(_camQ);

      _fwd.set(0, 0, -1).applyQuaternion(_camQ);
      _fwd.y = 0;
      if (_fwd.lengthSq() > 1e-5) _fwd.normalize();

      _side.set(1, 0, 0).applyQuaternion(_camQ);
      _side.y = 0;
      if (_side.lengthSq() > 1e-5) _side.normalize();

      const sp = MOVE_SPEED * dt;
      _rig.object3D.position.addScaledVector(_fwd,  -L.ny * sp);
      _rig.object3D.position.addScaledVector(_side,   L.nx * sp);
    }

    // ── Rechter Stick: Horizontale Kameradrehung (Yaw) ───────────────────
    // Rig-Rotation drehen, nicht die Kamera selbst – look-controls für
    // vertikales Schauen bleibt unberührt.
    if (R.on && R.nx !== 0) {
      _rig.object3D.rotation.y -= R.nx * TURN_SPEED * dt;
    }
  }

  // ── Start ─────────────────────────────────────────────────────────────────
  // buildDOM erst nach DOMContentLoaded (document.body existiert dann sicher)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildDOM);
  } else {
    buildDOM();
  }

  requestAnimationFrame(loop);
})();
