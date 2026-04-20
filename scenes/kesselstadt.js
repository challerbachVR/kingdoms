// ═══════════════════════════════════════════════════════════════════════════
// KESSELSTADT SZENE – A-Frame Komponente
// Baut den gesamten Stadtinhalt dynamisch auf.
// ═══════════════════════════════════════════════════════════════════════════

AFRAME.registerComponent('kesselstadt-scene', {
  init() {
    // Szene-HTML einmalig einfügen, sobald A-Frame bereit ist
    this.el.insertAdjacentHTML('beforeend', KESSELSTADT_HTML);

    // UI-Buttons und VR-Audio nach vollständigem Laden verdrahten
    this.el.addEventListener('loaded', () => {
      this.el.querySelectorAll('.ui-btn').forEach(btn => {
        const setMode = () =>
          this.el.setAttribute('daynight', `mode: ${btn.getAttribute('data-mode')}`);
        btn.addEventListener('click',       setMode);
        btn.addEventListener('triggerdown', setMode);
      });

      // Temporärer Feenreich-Teleport-Button
      const feenBtn = document.getElementById('btn-feenreich');
      if (feenBtn) {
        const doTP = () => {
          const rig = document.getElementById('rig');
          const cam = document.getElementById('camera');
          if (!rig) return;
          // Kamera-Offset berücksichtigen (WASD verschiebt camera, nicht rig)
          const off = cam ? cam.object3D.position : { x: 0, z: 0 };
          rig.object3D.position.set(-off.x, 0, 45 - off.z);
        };
        feenBtn.addEventListener('click',       doTP);
        feenBtn.addEventListener('triggerdown', doTP);
      }

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

  <!-- ═══ HIMMEL – prozedurale Sky-Sphere ═══ -->
  <a-entity id="sky-sphere"
    geometry="primitive:sphere; radius:4900; segmentsWidth:36; segmentsHeight:18"
    material="shader:flat; color:#ffffff; side:back"
    tex="id:sky-canvas; repx:1; repy:1">
  </a-entity>

  <!-- ═══ BODEN ═══ -->
  <a-plane position="0 0 0" rotation="-90 0 0" width="80" height="80"
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
    <a-cone position="0 6 0" radius-bottom="3.2" radius-top="0" height="2.5"
      material="color:#d0a090;roughness:1"
      tex="id:tex-tiles; repx:3.5; repy:2"
      shadow="cast:true">
    </a-cone>
    <a-cylinder position="1 7.5 -1" radius="0.25" height="2"
      material="color:#2a2020;roughness:1" shadow="cast:true">
    </a-cylinder>
    <a-entity position="1 8.6 -1" steam></a-entity>
    <a-plane position="1.5 2.5 2.51" width="0.8" height="1"
      material="color:#cc9944;emissive:#cc9944;emissiveIntensity:0.3;opacity:0.85;transparent:true">
    </a-plane>
    <a-plane position="-1.2 2.5 2.51" width="0.8" height="1"
      material="color:#cc9944;emissive:#cc9944;emissiveIntensity:0.3;opacity:0.85;transparent:true">
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
    <a-cone position="0 8 0" radius-bottom="3.2" radius-top="0" height="3"
      material="color:#c8a898;roughness:1"
      tex="id:tex-tiles; repx:3.5; repy:2.5"
      shadow="cast:true">
    </a-cone>
    <a-box position="0 3.5 2.8" width="2.5" height="2" depth="1"
      material="color:#d8c8b0;roughness:0.9"
      tex="id:tex-stone; repx:1.2; repy:1">
    </a-box>
    <a-plane position="1.5 4.5 2.51" width="0.9" height="1.2"
      material="color:#bbddff;emissive:#aaccff;emissiveIntensity:0.2;opacity:0.8;transparent:true">
    </a-plane>
    <a-plane position="-1.5 4.5 2.51" width="0.9" height="1.2"
      material="color:#bbddff;emissive:#aaccff;emissiveIntensity:0.2;opacity:0.8;transparent:true">
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
    <a-cone position="0 7 0" radius-bottom="3.8" radius-top="0" height="2.5"
      material="color:#c0907a;roughness:1"
      tex="id:tex-tiles; repx:4; repy:2"
      shadow="cast:true">
    </a-cone>
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
    <a-cone position="0 7 0" radius-bottom="2.8" radius-top="0" height="2.2"
      material="color:#a07868;roughness:1"
      tex="id:tex-tiles; repx:3; repy:2"
      shadow="cast:true">
    </a-cone>
    <a-plane position="-1 3 2.26" width="0.8" height="1"
      material="color:#44ff88;emissive:#22cc44;emissiveIntensity:0.6;opacity:0.85;transparent:true">
    </a-plane>
    <a-plane position="1 3 2.26" width="0.8" height="1"
      material="color:#aa44ff;emissive:#8822cc;emissiveIntensity:0.6;opacity:0.85;transparent:true">
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
    <a-cone position="-4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-cone position="4 8.8 0" radius-bottom="2.5" radius-top="0" height="2.5"
      material="color:#b09080;roughness:1" tex="id:tex-tiles; repx:2.5; repy:2"></a-cone>
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.8"
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
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.8"
      theta-length="180" theta-start="0"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:1" shadow="cast:true"></a-torus>
    <a-box position="0 3 0" width="6" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:3; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 2.5 0" width="4" height="5" depth="1.8" material="color:#111;roughness:1"></a-box>
    <a-box position="0 5.5 0" width="1.2" height="0.8" depth="1.8"
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
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.8"
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
    <a-torus position="0 5.5 0" rotation="90 0 0" radius="3" radius-tubular="0.8"
      theta-length="180" theta-start="0"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:2; repy:1" shadow="cast:true"></a-torus>
    <a-box position="0 3 0" width="6" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:3; repy:3" shadow="cast:true"></a-box>
    <a-box position="0 2.5 0" width="4" height="5" depth="1.8" material="color:#111;roughness:1"></a-box>
    <a-box position="0 5.5 0" width="1.2" height="0.8" depth="1.8"
      material="color:#b8b0a8;roughness:0.9" tex="id:tex-stone; repx:0.6; repy:0.4"></a-box>
    <a-box position="0 7.5 0.85" width="3" height="0.8" depth="0.2"
      material="color:#c8a060;roughness:0.9" tex="id:tex-wood; repx:2; repy:0.6"></a-box>
    <a-text value="LICHTREICH" position="0 7.5 0.96" align="center" color="#ffffaa" width="3.5"
      font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    <a-box position="-12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
    <a-box position="12 3 0" width="12" height="6" depth="1.6"
      material="color:#c0b8b0;roughness:0.9" tex="id:tex-stone; repx:6; repy:3" shadow="cast:true"></a-box>
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

  <!-- ═══ IN-WORLD UI (Tag/Nacht) ═══ -->
  <a-entity id="ui-panel" position="0 2.5 -4">
    <a-box position="0 0 0" width="2.8" height="1.6" depth="0.06"
      material="color:#1a1a2e;opacity:0.88;transparent:true;metalness:0.2"></a-box>
    <a-box position="0 0 0.02" width="2.85" height="1.65" depth="0.02"
      material="color:#8a7040;metalness:0.6;roughness:0.4"></a-box>
    <a-text value="TAGESZEIT" position="0 0.55 0.05" align="center" color="#ddcc88"
      width="3" font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    <a-box id="btn-morning" position="-1.0 0.1 0.06" width="0.58" height="0.38" depth="0.06"
      material="color:#cc8833;metalness:0.3" class="ui-btn" data-mode="morning"
      event-set__mouseenter="material.color: #ffaa44"
      event-set__mouseleave="material.color: #cc8833">
      <a-text value="Morgen" position="0 0 0.05" align="center" color="#fff" width="1.5"
        font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    </a-box>
    <a-box id="btn-day" position="-0.33 0.1 0.06" width="0.58" height="0.38" depth="0.06"
      material="color:#3388cc;metalness:0.3" class="ui-btn" data-mode="day"
      event-set__mouseenter="material.color: #44aaff"
      event-set__mouseleave="material.color: #3388cc">
      <a-text value="Tag" position="0 0 0.05" align="center" color="#fff" width="1.5"
        font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    </a-box>
    <a-box id="btn-evening" position="0.33 0.1 0.06" width="0.58" height="0.38" depth="0.06"
      material="color:#cc5522;metalness:0.3" class="ui-btn" data-mode="evening"
      event-set__mouseenter="material.color: #ff7744"
      event-set__mouseleave="material.color: #cc5522">
      <a-text value="Abend" position="0 0 0.05" align="center" color="#fff" width="1.5"
        font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    </a-box>
    <a-box id="btn-night" position="1.0 0.1 0.06" width="0.58" height="0.38" depth="0.06"
      material="color:#222266;metalness:0.3" class="ui-btn" data-mode="night"
      event-set__mouseenter="material.color: #4444aa"
      event-set__mouseleave="material.color: #222266">
      <a-text value="Nacht" position="0 0 0.05" align="center" color="#fff" width="1.5"
        font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
    </a-box>
    <a-text value="R-Trigger: Menü | L-Trigger: Teleport | L-Stick: Laufen | R-Stick: Drehen"
      position="0 -0.55 0.05" align="center" color="#888877" width="2.8"
      font="https://cdn.aframe.io/fonts/Roboto-msdf.json"></a-text>
  </a-entity>

  <!-- ═══ TEMP: Feenreich-Schnellreise ═══ -->
  <a-entity position="0 1.72 -4">
    <a-box position="0 0 0" width="2.8" height="0.52" depth="0.06"
      material="color:#0d1f12;opacity:0.90;transparent:true;metalness:0.2"></a-box>
    <a-box position="0 0 0.02" width="2.85" height="0.57" depth="0.02"
      material="color:#2a6040;metalness:0.5;roughness:0.4"></a-box>
    <a-box id="btn-feenreich" position="0 0 0.06" width="2.6" height="0.40" depth="0.06"
      material="color:#1a5c30;metalness:0.3"
      event-set__mouseenter="material.color: #2a8844"
      event-set__mouseleave="material.color: #1a5c30">
      <a-text value="Zum Feenreich (Test)" position="0 0 0.05" align="center" color="#88ffbb" width="2.6"></a-text>
    </a-box>
  </a-entity>

  <!-- ═══ STADTLEBEN ═══ -->
  <a-entity id="city-life-root" city-life></a-entity>
`;
