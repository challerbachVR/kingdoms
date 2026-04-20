// ═══════════════════════════════════════════════════════════════════════════
// TAG/NACHT-SYSTEM + HILFREICH-KOMPONENTEN
// ═══════════════════════════════════════════════════════════════════════════

AFRAME.registerComponent('daynight', {
  schema: { mode: { type: 'string', default: 'day' } },
  init()   { this.apply(this.data.mode); },
  update() { this.apply(this.data.mode); },
  apply(mode) {
    const sun = document.getElementById('sun');
    const amb = document.getElementById('ambLight');
    const modes = {
      morning: { sun:'#ffddaa', sunPos:'-5 4 -10',  amb:0.50 },
      day:     { sun:'#fff5cc', sunPos:' 5 12 -8',  amb:0.70 },
      evening: { sun:'#ff8c42', sunPos:'-8 3 -5',   amb:0.35 },
      night:   { sun:'#334488', sunPos:' 0 8 10',   amb:0.15 },
    };
    const cfg = modes[mode] || modes.day;

    const skyCanvas = document.getElementById('sky-canvas');
    if (skyCanvas) { drawSky(skyCanvas, mode); _updateSkyTex(); }

    if (sun) {
      sun.setAttribute('light', `type:directional;intensity:1.1;color:${cfg.sun}`);
      sun.setAttribute('position', cfg.sunPos);
    }
    if (amb) amb.setAttribute('light', `type:ambient;intensity:${cfg.amb};color:#fff8f0`);

    document.querySelectorAll('.lantern-light').forEach(l =>
      l.setAttribute('light', `type:point;intensity:${mode==='night'?1.2:0};color:#ffaa33;distance:6`)
    );
    document.querySelectorAll('.lantern-glow').forEach(l =>
      l.setAttribute('material',
        `color:${mode==='night'?'#ffcc44':'#886633'};emissive:${mode==='night'?'#ffaa22':'#000'};emissiveIntensity:1`)
    );

    // Fenster: bernsteinfarben, Abend/Nacht leuchten von innen
    const winEmi = mode === 'night' ? 1.0 : mode === 'evening' ? 0.55 : 0.0;
    document.querySelectorAll('.window-pane').forEach(w =>
      w.setAttribute('material',
        `color:#f5c842;emissive:#f5a020;emissiveIntensity:${winEmi};opacity:0.82;transparent:true`)
    );

    if (window._KS) window._KS.setMode(mode);
  }
});

// Zahnrad-Rotation
AFRAME.registerComponent('gear-spin', {
  schema: { speed: { default: 1 }, reverse: { default: false } },
  tick(t) {
    this.el.object3D.rotation.z = (this.data.reverse ? -1 : 1) * t * 0.001 * this.data.speed;
  }
});

// Dampfwolken
AFRAME.registerComponent('steam', {
  init() {
    this.particles = [];
    for (let i = 0; i < 5; i++) this.spawnParticle(i * 800);
  },
  spawnParticle(delay) {
    const p = document.createElement('a-sphere');
    p.setAttribute('radius', 0.18 + Math.random() * 0.12);
    p.setAttribute('material', 'color:#ccddee;opacity:0.45;transparent:true;shader:flat');
    p.setAttribute('position', `${(Math.random()-.5)*.3} 0 ${(Math.random()-.5)*.3}`);
    this.el.appendChild(p);
    this.particles.push({ el: p, life: 0, delay, speed: 0.8 + Math.random() * 0.6 });
  },
  tick(t, dt) {
    this.particles.forEach(p => {
      p.life += dt;
      if (p.life < p.delay) return;
      const age = (p.life - p.delay) / 2000;
      if (age > 1) {
        p.life = p.delay;
        p.el.setAttribute('position', `${(Math.random()-.5)*.3} 0 ${(Math.random()-.5)*.3}`);
        return;
      }
      p.el.object3D.position.y = age * 3 * p.speed;
      p.el.object3D.scale.setScalar(0.5 + age * 1.5);
      p.el.setAttribute('material',
        `color:#ccddee;opacity:${Math.max(0, 0.5 - age * 0.5)};transparent:true;shader:flat`);
    });
  }
});
