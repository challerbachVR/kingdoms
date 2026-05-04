// ═══════════════════════════════════════════════════════════════════════════
// HÄNDLER – Quest 1b (Child von #haendler-interior)
// Dialog-System + Wappen-ablegen + Hundefutter-Pickup + HUD-Slot.
// Nur aktiv wenn MERCHANT_INSIDE.
// ═══════════════════════════════════════════════════════════════════════════

window.MERCHANT_INSIDE = false;

const merchantState = {
  dialogStep:  0,
  cooldownMs:  5000,
  lastTrigger: 0,
  foodGiven:   false,
  hiltPlaced:  false,
};

// Tresen-Weltposition (lokal 0, 0.93, -3.0 relativ zu #haendler-interior world 9,0,-8):
const COUNTER_WORLD = { x: 9.0, y: 0.93, z: -11.0 };
const COUNTER_PROXIMITY = 1.2;

AFRAME.registerComponent('haendler-npc', {

  init() {
    this._cam = null;
    this._camWP = new THREE.Vector3();
    this._npcWorldPos = new THREE.Vector3();
    this._foodWorldPos = new THREE.Vector3();
    this._insideRoot = null;
    this._insideNpcRoot = null;
    this._foodMesh = null;
    this._foodRoot = null;
    this._bubbles = {};
    this._hint = null;
    this._foodHint = null;
    this._touchBtn = null;
    this._foodTouchBtn = null;
    this._nearMerchant = false;
    this._nearFood = false;
    this._bubbleTimer = null;
    this._autoB1Timer = null;
    this._autoB1Done = false;
    this._nearCounter = false;
    this._counterHint = null;
    this._hiltOnCounter = null;

    const sc = this.el.sceneEl;
    if (sc.hasLoaded) this._build();
    else sc.addEventListener('loaded', () => this._build(), { once: true });

    document.addEventListener('keydown', e => {
      if (e.code !== 'KeyE' || !window.MERCHANT_INSIDE) return;
      if (this._nearFood && merchantState.dialogStep >= 2) { this._tryPickupFood(); return; }
      if (this._nearCounter && !merchantState.hiltPlaced) { this._placeHiltOnCounter(); return; }
      if (this._nearMerchant) { this._triggerMerchantDialog(); return; }
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
    this._buildRoom();
    this._buildShopCounter();
    this._buildFoodItem();
    this._buildInteriorFigure();
    this._buildShowcase();
    this._buildBubbles();
    this._buildHint();
    this._buildFoodHint();
    this._buildCounterHint();
    this._buildHiltOnCounter();
    this._buildInteriorDecor();
    this._buildTouchBtns();
    this._addHUDSlot();

    const tryBindVR = () => {
  const rh = document.getElementById('rightHand');
  if (rh) {
    rh.addEventListener('triggerdown', () => {
      if (!window.MERCHANT_INSIDE) return;
      if (this._nearFood && merchantState.dialogStep >= 2)
        { this._tryPickupFood(); return; }
      if (this._nearCounter && !merchantState.hiltPlaced)
        { this._placeHiltOnCounter(); return; }
      if (this._nearMerchant)
        { this._triggerMerchantDialog(); return; }
    });
  } else {
    setTimeout(tryBindVR, 200);
  }
};
tryBindVR();

  },

  // ── Zimmer (Wände, Boden, Decke, Licht) ──────────────────────────────────
  _buildRoom() {
    const interior = document.getElementById('haendler-interior');
    if (!interior) {
      setTimeout(() => this._buildRoom(), 200);
      return;
    }
    if (interior.dataset.roomBuilt) return;
    interior.dataset.roomBuilt = 'true';

    // Boden
    const floor = document.createElement('a-plane');
    floor.setAttribute('rotation', '-90 0 0');
    floor.setAttribute('width', '10');
    floor.setAttribute('height', '8');
    floor.setAttribute('material', 'color:#5a3618;shader:flat');
    floor.setAttribute('tex', 'id:tex-planks; repx:4; repy:3');
    interior.appendChild(floor);

    // Decke
    const ceil = document.createElement('a-plane');
    ceil.setAttribute('rotation', '90 0 0');
    ceil.setAttribute('width', '10');
    ceil.setAttribute('height', '8');
    ceil.setAttribute('position', '0 3.2 0');
    ceil.setAttribute('material', 'color:#281406;shader:flat');
    ceil.setAttribute('tex', 'id:tex-beam; repx:4; repy:3');
    interior.appendChild(ceil);

    // Nordwand
    const wallN = document.createElement('a-box');
    wallN.setAttribute('width', '10');
    wallN.setAttribute('height', '3.2');
    wallN.setAttribute('depth', '0.28');
    wallN.setAttribute('position', '0 1.6 -4.0');
    wallN.setAttribute('material', 'color:#a08868;shader:flat');
    wallN.setAttribute('tex', 'id:tex-stone; repx:3; repy:1.2');
    interior.appendChild(wallN);

    // Westwand
    const wallW = document.createElement('a-box');
    wallW.setAttribute('width', '0.28');
    wallW.setAttribute('height', '3.2');
    wallW.setAttribute('depth', '8');
    wallW.setAttribute('position', '-5.0 1.6 0');
    wallW.setAttribute('material', 'color:#a08868;shader:flat');
    wallW.setAttribute('tex', 'id:tex-stone; repx:3; repy:1.2');
    interior.appendChild(wallW);

    // Ostwand
    const wallE = document.createElement('a-box');
    wallE.setAttribute('width', '0.28');
    wallE.setAttribute('height', '3.2');
    wallE.setAttribute('depth', '8');
    wallE.setAttribute('position', '5.0 1.6 0');
    wallE.setAttribute('material', 'color:#a08868;shader:flat');
    wallE.setAttribute('tex', 'id:tex-stone; repx:3; repy:1.2');
    interior.appendChild(wallE);

    // Südwand links
    const wallSL = document.createElement('a-box');
    wallSL.setAttribute('width', '3.9');
    wallSL.setAttribute('height', '3.2');
    wallSL.setAttribute('depth', '0.28');
    wallSL.setAttribute('position', '-3.05 1.6 3.5');
    wallSL.setAttribute('material', 'color:#a08868;shader:flat');
    wallSL.setAttribute('tex', 'id:tex-stone; repx:3; repy:1.2');
    interior.appendChild(wallSL);

    // Südwand rechts
    const wallSR = document.createElement('a-box');
    wallSR.setAttribute('width', '3.9');
    wallSR.setAttribute('height', '3.2');
    wallSR.setAttribute('depth', '0.28');
    wallSR.setAttribute('position', '3.05 1.6 3.5');
    wallSR.setAttribute('material', 'color:#a08868;shader:flat');
    wallSR.setAttribute('tex', 'id:tex-stone; repx:3; repy:1.2');
    interior.appendChild(wallSR);

    // Ambientlicht
    const amb = document.createElement('a-entity');
    amb.setAttribute('light', 'type:ambient;color:#f0d0a0;intensity:0.9');
    interior.appendChild(amb);

    // Punktlicht
    const pt = document.createElement('a-entity');
    pt.setAttribute('position', '0 2.8 -1.5');
    pt.setAttribute('light',
      'type:point;color:#f4a460;intensity:1.4;distance:12');
    interior.appendChild(pt);
  },

  // ── Shop Counter (Nordseite) ──────────────────────────────────────────────
  _buildShopCounter() {
    const interior = document.getElementById('haendler-interior');
    if (!interior) return;

    // Tresenkörper (länger als vorher)
    const counter = document.createElement('a-box');
    counter.setAttribute('width', '4.0');
    counter.setAttribute('height', '0.9');
    counter.setAttribute('depth', '0.7');
    counter.setAttribute('position', '0 0.45 -3.0');
    counter.setAttribute('material', 'color:#3c2210;shader:flat');
    counter.setAttribute('tex', 'id:tex-wood; repx:2; repy:0.5');
    interior.appendChild(counter);

    // Tresenplatte
    const top = document.createElement('a-box');
    top.setAttribute('width', '4.2');
    top.setAttribute('height', '0.06');
    top.setAttribute('depth', '0.82');
    top.setAttribute('position', '0 0.93 -3.0');
    top.setAttribute('material', 'color:#5a3818;shader:flat');
    top.setAttribute('tex', 'id:tex-wood; repx:2; repy:0.4');
    interior.appendChild(top);

    // 4 Beine
    [
      [-1.8, 0.45, -2.65],
      [-1.8, 0.45, -3.35],
      [ 1.8, 0.45, -2.65],
      [ 1.8, 0.45, -3.35],
    ].forEach(([x, y, z]) => {
      const leg = document.createElement('a-cylinder');
      leg.setAttribute('radius', '0.06');
      leg.setAttribute('height', '0.9');
      leg.setAttribute('segments-radial', '8');
      leg.setAttribute('position', `${x} ${y} ${z}`);
      leg.setAttribute('material', 'color:#2e1a08;shader:flat');
      leg.setAttribute('tex', 'id:tex-beam; repx:1; repy:1');
      interior.appendChild(leg);
    });

    // Steampunk-Kasse (rechte Seite des Tresens)
    // Kassenkörper
    const cashBody = document.createElement('a-box');
    cashBody.setAttribute('width', '0.35');
    cashBody.setAttribute('height', '0.28');
    cashBody.setAttribute('depth', '0.28');
    cashBody.setAttribute('position', '1.5 1.02 -3.0');
    cashBody.setAttribute('material', 'color:#4a3010;shader:flat');
    cashBody.setAttribute('tex', 'id:tex-wood; repx:1; repy:1');
    interior.appendChild(cashBody);

    // Kassendeckel
    const cashLid = document.createElement('a-box');
    cashLid.setAttribute('width', '0.37');
    cashLid.setAttribute('height', '0.04');
    cashLid.setAttribute('depth', '0.30');
    cashLid.setAttribute('position', '1.5 1.17 -3.0');
    cashLid.setAttribute('material', 'color:#3a2208;shader:flat');
    cashLid.setAttribute('tex', 'id:tex-wood; repx:1; repy:0.5');
    interior.appendChild(cashLid);

    // Schublade
    const drawer = document.createElement('a-box');
    drawer.setAttribute('width', '0.28');
    drawer.setAttribute('height', '0.08');
    drawer.setAttribute('depth', '0.06');
    drawer.setAttribute('position', '1.5 0.94 -2.72');
    drawer.setAttribute('material', 'color:#2e1a08;shader:flat');
    drawer.setAttribute('tex', 'id:tex-wood; repx:1; repy:0.5');
    interior.appendChild(drawer);

    // Schubladengriff
    const handle = document.createElement('a-cylinder');
    handle.setAttribute('radius', '0.018');
    handle.setAttribute('height', '0.10');
    handle.setAttribute('segments-radial', '6');
    handle.setAttribute('rotation', '0 0 90');
    handle.setAttribute('position', '1.5 0.94 -2.66');
    handle.setAttribute('material', 'color:#B87333;shader:flat');
    interior.appendChild(handle);

    // Messingknöpfe (3 Stück, Deko)
    [
      [1.34, 1.08, -2.87],
      [1.50, 1.08, -2.87],
      [1.66, 1.08, -2.87],
    ].forEach(([x, y, z]) => {
      const btn = document.createElement('a-sphere');
      btn.setAttribute('radius', '0.018');
      btn.setAttribute('segments-width', '6');
      btn.setAttribute('segments-height', '4');
      btn.setAttribute('position', `${x} ${y} ${z}`);
      btn.setAttribute('material',
        'color:#CFB53B;emissive:#CFB53B;emissiveIntensity:0.3;shader:flat');
      interior.appendChild(btn);
    });

    // Hebel
    const lever = document.createElement('a-cylinder');
    lever.setAttribute('radius', '0.015');
    lever.setAttribute('height', '0.18');
    lever.setAttribute('segments-radial', '6');
    lever.setAttribute('position', '1.72 1.10 -2.96');
    lever.setAttribute('rotation', '0 0 25');
    lever.setAttribute('material', 'color:#B87333;shader:flat');
    interior.appendChild(lever);

    // Hebelknauf
    const leverKnob = document.createElement('a-sphere');
    leverKnob.setAttribute('radius', '0.030');
    leverKnob.setAttribute('segments-width', '6');
    leverKnob.setAttribute('segments-height', '4');
    leverKnob.setAttribute('position', '1.80 1.18 -2.96');
    leverKnob.setAttribute('material',
      'color:#CFB53B;emissive:#CFB53B;emissiveIntensity:0.4;shader:flat');
    interior.appendChild(leverKnob);
  },

  _buildFoodItem() {
    const interior = document.getElementById('haendler-interior');
    if (!interior) return;

    // Hundefutter-Brot auf Theke
    const foodRoot = document.createElement('a-entity');
    foodRoot.setAttribute('position', '0.4 1.00 -3.0');

    const bread = document.createElement('a-box');
    bread.setAttribute('width', '0.14');
    bread.setAttribute('height', '0.07');
    bread.setAttribute('depth', '0.10');
    bread.setAttribute('material',
      'color:#c8b080;emissive:#c8b080;emissiveIntensity:0.2;shader:flat');
    foodRoot.appendChild(bread);

    interior.appendChild(foodRoot);
    this._foodRoot = foodRoot;
    this._foodMesh = bread;

    // Session-Reload: bereits aufgehoben
    if (merchantState.foodGiven ||
        (window.INVENTORY && window.INVENTORY.dogFood)) {
      foodRoot.setAttribute('visible', 'false');
      merchantState.foodGiven = true;
    }
  },

  // ── Interior NPC (Child von #haendler-interior) ──────────────────────────
  _buildInteriorFigure() {
    const SKIN  = '#e8b882';
    const SHIRT = '#c8a030';
    const APRON = '#8B6914';
    const PANTS = '#3a2810';
    const BOOT  = '#1a0e08';
    const HAIR  = '#3d2b1f';

    const interior = document.getElementById('haendler-interior');
    if (!interior) { setTimeout(() => this._buildInteriorFigure(), 100); return; }

    const root = document.createElement('a-entity');
    root.setAttribute('position', '0 0 -1.5');
    root.setAttribute('rotation', '0 180 0');

    const npcRoot = document.createElement('a-entity');

    npcRoot.appendChild(this._box(0.12, 0.06, 0.18, BOOT,  0.09, 0.03,  0.02));
    npcRoot.appendChild(this._box(0.12, 0.06, 0.18, BOOT, -0.09, 0.03,  0.02));
    npcRoot.appendChild(this._cyl(0.06, 0.40, PANTS,  0.09, 0.24, 0));
    npcRoot.appendChild(this._cyl(0.06, 0.40, PANTS, -0.09, 0.24, 0));
    npcRoot.appendChild(this._box(0.32, 0.10, 0.22, PANTS, 0, 0.50, 0));
    npcRoot.appendChild(this._box(0.34, 0.04, 0.24, '#4a2a10', 0, 0.56, 0));
    npcRoot.appendChild(this._box(0.34, 0.34, 0.24, SHIRT, 0, 0.76, 0));
    npcRoot.appendChild(this._box(0.28, 0.42, 0.015, '#5a3010', 0, 0.68, 0.125));
    npcRoot.appendChild(this._box(0.32, 0.04, 0.015, '#3a1a08', 0, 0.89, 0.125));
    npcRoot.appendChild(this._box(0.10, 0.06, 0.012, '#4a3820', 0, 1.145, 0.128));
    npcRoot.appendChild(this._cyl(0.20, 0.04, '#3a2010', 0, 1.38, 0));
    npcRoot.appendChild(this._cyl(0.13, 0.22, '#3a2010', 0, 1.50, 0));
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
    armR.appendChild(this._cyl(0.042, 0.22, SKIN,  0, -0.38, 0));
    armR.appendChild(this._sph(0.05, SKIN, 0, -0.52, 0));
    npcRoot.appendChild(armR);

    npcRoot.appendChild(this._cyl(0.05, 0.08, SKIN, 0, 1.04, 0));
    npcRoot.appendChild(this._sph(0.14, SKIN, 0, 1.18, 0));
    npcRoot.appendChild(this._box(0.30, 0.10, 0.28, HAIR, 0, 1.30, -0.02));
    npcRoot.appendChild(this._box(0.07, 0.12, 0.06, HAIR, -0.15, 1.19, -0.05));
    npcRoot.appendChild(this._box(0.07, 0.12, 0.06, HAIR,  0.15, 1.19, -0.05));
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

  // ── Schaukasten ──────────────────────────────────────────────────────────
  _buildShowcase() {
    const interior = document.getElementById('haendler-interior');
    if (!interior) { setTimeout(() => this._buildShowcase(), 100); return; }

    const table = this._box(1.2, 0.08, 0.6, '#5a3818', 0, 0.85, -0.8);
    table.setAttribute('tex', 'id:tex-wood; repx:1; repy:0.5');
    interior.appendChild(table);

    // Fläschchen (Deko)
    const flask = this._cyl(0.04, 0.14, '#00CED1', -0.2, 0.96, -0.8);
    flask.setAttribute('material',
      'color:#00CED1;emissive:#00CED1;emissiveIntensity:0.6;shader:flat');
    interior.appendChild(flask);
  },

  // ── Dialog-Bubbles ───────────────────────────────────────────────────────
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
      'Haendler: Ha! Ein Kunde!\nSchau dich um – ich hab alles,\nfast alles.',
      1.80, 0.48);
    this._bubbles.no_hilt = this._mkBubble(
      'Haendler: Was darf es sein, Fremder?\nIch hab Waren aus aller Welt!',
      1.80, 0.32);
    this._bubbles.b2 = this._mkBubble(
      'Haendler: Warte mal... das Wappen.\nZwei Schluessel, eine Krone.\nDas hab ich schon mal gesehen –\nbei der Alchemistin.\nSie hat so ein Zeichen an ihrer Tuer.',
      1.80, 0.80);
    this._bubbles.b2b = this._mkBubble(
      'Haendler: Geh abends hin.\nTagsueber macht sie nicht auf.\nUnd... erwaehne meinen Namen\nlieber nicht.',
      1.80, 0.48);
    this._bubbles.b2c = this._mkBubble(
      'Haendler: Ach — und nimm das hier.\nFuer unterwegs.',
      1.60, 0.32);
  },

  // ── Hints ────────────────────────────────────────────────────────────────
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

  _buildFoodHint() {
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
    txt.setAttribute('value', 'E / Trigger: Aufnehmen');
    txt.setAttribute('align', 'center');
    txt.setAttribute('baseline', 'center');
    txt.setAttribute('color', '#f0d0a0');
    txt.setAttribute('width', '0.98');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    this._foodHint = h;
  },

  // ── Counter Hint ──────────────────────────────────────────────────────────
  _buildCounterHint() {
    const h = document.createElement('a-entity');
    h.setAttribute('visible', 'false');

    const frame = document.createElement('a-plane');
    frame.setAttribute('width', '1.40');
    frame.setAttribute('height', '0.26');
    frame.setAttribute('position', '0 0 -0.003');
    frame.setAttribute('material',
      'color:#805030;shader:flat;transparent:true;opacity:0.50;' +
      'emissive:#805030;emissiveIntensity:0.18');
    h.appendChild(frame);

    const bg = document.createElement('a-plane');
    bg.setAttribute('width', '1.34');
    bg.setAttribute('height', '0.20');
    bg.setAttribute('material',
      'color:#100800;shader:flat;transparent:true;opacity:0.90');
    h.appendChild(bg);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', 'E: Wappen ablegen');
    txt.setAttribute('align', 'center');
    txt.setAttribute('baseline', 'center');
    txt.setAttribute('color', '#c8a030');
    txt.setAttribute('width', '1.20');
    txt.setAttribute('position', '0 0 0.005');
    h.appendChild(txt);

    this.el.sceneEl.appendChild(h);
    this._counterHint = h;
  },

  // ── Hilt On Counter Mesh ──────────────────────────────────────────────────
  _buildHiltOnCounter() {
    const interior = document.getElementById('haendler-interior');
    if (!interior) { setTimeout(() => this._buildHiltOnCounter(), 100); return; }

    const root = document.createElement('a-entity');
    root.setAttribute('position', '8.6 0.97 -11.0');
    root.setAttribute('visible', 'false');

    const hilt = document.createElement('a-box');
    hilt.setAttribute('width', '0.08');
    hilt.setAttribute('height', '0.04');
    hilt.setAttribute('depth', '0.22');
    hilt.setAttribute('rotation', '0 45 0');
    hilt.setAttribute('material',
      'color:#8B6914;emissive:#c8a020;' +
      'emissiveIntensity:0.6;shader:flat');
    root.appendChild(hilt);

    interior.appendChild(root);
    this._hiltOnCounter = root;
  },

  // ── Mehr Interieur (Regale, Laterne) ────────────────────────────────────
  _buildInteriorDecor() {
    const interior = document.getElementById('haendler-interior');
    if (!interior) return;

    // ── A) Regal 1 (niedrig, Nordwand hinter Tresen) ──────────────────────
    const shelf1 = document.createElement('a-box');
    shelf1.setAttribute('width', '3.5');
    shelf1.setAttribute('height', '0.06');
    shelf1.setAttribute('depth', '0.25');
    shelf1.setAttribute('position', '0 1.55 -3.82');
    shelf1.setAttribute('material', 'color:#4a2c10;shader:flat');
    shelf1.setAttribute('tex', 'id:tex-beam; repx:2; repy:0.5');
    interior.appendChild(shelf1);

    // Waren auf Regal 1
    // Krug 1
    const jug1 = document.createElement('a-cylinder');
    jug1.setAttribute('radius', '0.07');
    jug1.setAttribute('height', '0.18');
    jug1.setAttribute('segments-radial', '8');
    jug1.setAttribute('position', '-1.2 1.67 -3.82');
    jug1.setAttribute('material', 'color:#9a7060;shader:flat');
    interior.appendChild(jug1);

    // Krug 2
    const jug2 = document.createElement('a-cylinder');
    jug2.setAttribute('radius', '0.05');
    jug2.setAttribute('height', '0.14');
    jug2.setAttribute('segments-radial', '8');
    jug2.setAttribute('position', '-0.5 1.64 -3.82');
    jug2.setAttribute('material', 'color:#7a5840;shader:flat');
    interior.appendChild(jug2);

    // Krug 3
    const jug3 = document.createElement('a-cylinder');
    jug3.setAttribute('radius', '0.08');
    jug3.setAttribute('height', '0.20');
    jug3.setAttribute('segments-radial', '8');
    jug3.setAttribute('position', '0.4 1.68 -3.82');
    jug3.setAttribute('material', 'color:#806050;shader:flat');
    interior.appendChild(jug3);

    // Kleines Fläschchen
    const flaskShelf = document.createElement('a-cylinder');
    flaskShelf.setAttribute('radius', '0.03');
    flaskShelf.setAttribute('height', '0.14');
    flaskShelf.setAttribute('segments-radial', '8');
    flaskShelf.setAttribute('position', '1.1 1.64 -3.82');
    flaskShelf.setAttribute('material',
      'color:#00CED1;emissive:#00CED1;emissiveIntensity:0.5;shader:flat');
    interior.appendChild(flaskShelf);

    // ── B) Regal 2 (höher, Nordwand hinter Tresen) ────────────────────────
    const shelf2 = document.createElement('a-box');
    shelf2.setAttribute('width', '3.5');
    shelf2.setAttribute('height', '0.06');
    shelf2.setAttribute('depth', '0.25');
    shelf2.setAttribute('position', '0 2.10 -3.82');
    shelf2.setAttribute('material', 'color:#4a2c10;shader:flat');
    shelf2.setAttribute('tex', 'id:tex-beam; repx:2; repy:0.5');
    interior.appendChild(shelf2);

    // Waren auf Regal 2
    // Truhe
    const chestShelf = document.createElement('a-box');
    chestShelf.setAttribute('width', '0.22');
    chestShelf.setAttribute('height', '0.14');
    chestShelf.setAttribute('depth', '0.16');
    chestShelf.setAttribute('position', '-1.0 2.19 -3.82');
    chestShelf.setAttribute('material', 'color:#3a2010;shader:flat');
    chestShelf.setAttribute('tex', 'id:tex-wood; repx:1; repy:1');
    interior.appendChild(chestShelf);

    // Topf
    const potShelf = document.createElement('a-cylinder');
    potShelf.setAttribute('radius', '0.07');
    potShelf.setAttribute('height', '0.14');
    potShelf.setAttribute('segments-radial', '8');
    potShelf.setAttribute('position', '0.2 2.17 -3.82');
    potShelf.setAttribute('material', 'color:#5a4030;shader:flat');
    interior.appendChild(potShelf);

    // Rolle
    const rollShelf = document.createElement('a-cylinder');
    rollShelf.setAttribute('radius', '0.04');
    rollShelf.setAttribute('height', '0.22');
    rollShelf.setAttribute('segments-radial', '8');
    rollShelf.setAttribute('rotation', '90 20 0');
    rollShelf.setAttribute('position', '1.0 2.13 -3.82');
    rollShelf.setAttribute('material', 'color:#c8b080;shader:flat');
    interior.appendChild(rollShelf);

    // ── C) Regal West-Wand (links) ────────────────────────────────────────
    const shelfWest = document.createElement('a-box');
    shelfWest.setAttribute('width', '0.25');
    shelfWest.setAttribute('height', '0.06');
    shelfWest.setAttribute('depth', '1.8');
    shelfWest.setAttribute('position', '-4.88 1.60 -1.5');
    shelfWest.setAttribute('material', 'color:#4a2c10;shader:flat');
    shelfWest.setAttribute('tex', 'id:tex-beam; repx:0.5; repy:1');
    interior.appendChild(shelfWest);

    // Waren an West-Wand
    // Krug
    const jugWest = document.createElement('a-cylinder');
    jugWest.setAttribute('radius', '0.06');
    jugWest.setAttribute('height', '0.16');
    jugWest.setAttribute('segments-radial', '8');
    jugWest.setAttribute('position', '-4.82 1.70 -1.0');
    jugWest.setAttribute('material', 'color:#806050;shader:flat');
    interior.appendChild(jugWest);

    // Kästchen
    const chestWest = document.createElement('a-box');
    chestWest.setAttribute('width', '0.16');
    chestWest.setAttribute('height', '0.12');
    chestWest.setAttribute('depth', '0.20');
    chestWest.setAttribute('position', '-4.82 1.67 -1.8');
    chestWest.setAttribute('material', 'color:#3a2010;shader:flat');
    chestWest.setAttribute('tex', 'id:tex-wood; repx:1; repy:1');
    interior.appendChild(chestWest);

    // ── D) Hängende Laterne (Mitte Decke) ─────────────────────────────────
    // Kette
    const chain = document.createElement('a-cylinder');
    chain.setAttribute('radius', '0.008');
    chain.setAttribute('height', '0.3');
    chain.setAttribute('segments-radial', '6');
    chain.setAttribute('position', '0 3.05 -1.5');
    chain.setAttribute('material', 'color:#3a3030;shader:flat');
    interior.appendChild(chain);

    // Laternengehäuse
    const lanternBody = document.createElement('a-box');
    lanternBody.setAttribute('width', '0.18');
    lanternBody.setAttribute('height', '0.22');
    lanternBody.setAttribute('depth', '0.18');
    lanternBody.setAttribute('position', '0 2.80 -1.5');
    lanternBody.setAttribute('material', 'color:#2a1a08;shader:flat');
    lanternBody.setAttribute('tex', 'id:tex-wood; repx:1; repy:1');
    interior.appendChild(lanternBody);

    // Laternenglas (repariert: emissive + opacity erhöht)
    const lanternGlass = document.createElement('a-box');
    lanternGlass.setAttribute('width', '0.12');
    lanternGlass.setAttribute('height', '0.16');
    lanternGlass.setAttribute('depth', '0.12');
    lanternGlass.setAttribute('position', '0 2.80 -1.5');
    lanternGlass.setAttribute('material',
      'color:#ffee88;emissive:#ffcc44;emissiveIntensity:2.5;' +
      'shader:flat;transparent:true;opacity:0.85');
    interior.appendChild(lanternGlass);

    // Laternenlicht (stärker)
    const lanternLight = document.createElement('a-entity');
    lanternLight.setAttribute('position', '0 2.70 -1.5');
    lanternLight.setAttribute('light',
      'type:point;color:#f4a460;intensity:1.8;distance:9');
    interior.appendChild(lanternLight);
  },

  // ── Touch-Buttons ────────────────────────────────────────────────────────
  _buildTouchBtns() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch) return;

    const style = document.createElement('style');
    style.textContent = `
      #merchant-talk-btn, #merchant-food-btn, #merchant-counter-btn {
        position: fixed; bottom: 200px; left: 50%;
        transform: translateX(-50%);
        background: rgba(128,80,48,0.90); color: #fde8c0;
        border: none; border-radius: 30px;
        padding: 12px 30px; font-size: 17px;
        font-family: sans-serif; font-weight: bold;
        display: none; z-index: 10001; touch-action: none;
      }
      #merchant-counter-btn {
        background: rgba(180,140,40,0.90);
      }
    `;
    document.head.appendChild(style);

    const talkBtn = document.createElement('button');
    talkBtn.id = 'merchant-talk-btn';
    talkBtn.textContent = 'Ansprechen';
    talkBtn.addEventListener('touchstart', e => {
      e.preventDefault();
      if (this._nearMerchant) this._triggerMerchantDialog();
    }, { passive: false });
    document.body.appendChild(talkBtn);
    this._touchBtn = talkBtn;

    const foodBtn = document.createElement('button');
    foodBtn.id = 'merchant-food-btn';
    foodBtn.textContent = 'Aufnehmen';
    foodBtn.addEventListener('touchstart', e => {
      e.preventDefault();
      if (this._nearFood) this._tryPickupFood();
    }, { passive: false });
    document.body.appendChild(foodBtn);
    this._foodTouchBtn = foodBtn;

    const counterBtn = document.createElement('button');
    counterBtn.id = 'merchant-counter-btn';
    counterBtn.textContent = 'Wappen ablegen';
    counterBtn.addEventListener('touchstart', e => {
      e.preventDefault();
      this._placeHiltOnCounter();
    }, { passive: false });
    document.body.appendChild(counterBtn);
    this._counterTouchBtn = counterBtn;
  },

  // ── HUD-Slot ─────────────────────────────────────────────────────────────
  _addHUDSlot() {
    if (document.getElementById('inv-food-slot')) return;
    const hud = document.getElementById('inventory-hud');
    if (!hud) { setTimeout(() => this._addHUDSlot(), 150); return; }
    const slot = document.createElement('div');
    slot.id = 'inv-food-slot';
    slot.className = 'inv-slot';
    slot.textContent = '🍖';
    slot.style.display = 'none';
    hud.appendChild(slot);
    if (window.INVENTORY.dogFood) {
      slot.style.display = '';
      slot.classList.add('has-item');
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // TICK
  // ═════════════════════════════════════════════════════════════════════════
  tick(t, dt) {
    if (!window.MERCHANT_INSIDE) {
      // Alle Bubbles ausblenden wenn draußen
      Object.values(this._bubbles).forEach(b => {
        if (b && b.object3D) b.object3D.visible = false;
      });
      if (this._bubbleTimer) {
        clearTimeout(this._bubbleTimer);
        this._bubbleTimer = null;
      }
      if (this._autoB1Timer) {
        clearTimeout(this._autoB1Timer);
        this._autoB1Timer = null;
      }
      return;
    }
    // Auto-b1 beim ersten Betreten
    if (!this._autoB1Done && merchantState.dialogStep === 0) {
      if (!this._autoB1Timer) {
        this._autoB1Timer = setTimeout(() => {
          this._autoB1Timer = null;
          if (!window.MERCHANT_INSIDE) return;
          this._autoB1Done = true;
          this._showBubble('b1', 4000, () => {
            merchantState.dialogStep = 1;
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

    // Proximity
    this._checkProximityMerchant(dist, dx, dz);
    this._checkProximityCounter();

    // Food floating animation
    if (this._foodRoot && this._foodRoot.object3D.visible &&
        !merchantState.foodGiven) {
      this._foodRoot.object3D.position.y = 0.92 + Math.sin(t * 0.002) * 0.02;
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
  // PROXIMITY
  // ═════════════════════════════════════════════════════════════════════════
  _checkProximityMerchant(dist, dx, dz) {
    if (dist <= 2.0) {
      this._nearMerchant = true;
      if (this._insideRoot && this._insideRoot.object3D) {
        const angle = Math.atan2(
          this._camWP.x - this._npcWorldPos.x,
          this._camWP.z - this._npcWorldPos.z
        );
        // Weltrotation setzen (nicht lokal) – _insideRoot hat Basis-Rotation 180°
        this._insideRoot.object3D.rotation.y = angle;
      }
      this._showHint();
    } else {
      this._nearMerchant = false;
      this._hideHint();
    }

    // Food proximity
    if (this._foodRoot && this._foodRoot.object3D.visible &&
        merchantState.dialogStep >= 2 && !merchantState.foodGiven) {
      this._foodRoot.object3D.getWorldPosition(this._foodWorldPos);
      const fdx = this._camWP.x - this._foodWorldPos.x;
      const fdz = this._camWP.z - this._foodWorldPos.z;
      this._nearFood = (fdx * fdx + fdz * fdz) < 2.25; // 1.5m
    } else {
      this._nearFood = false;
    }

    // Touch buttons
    if (this._touchBtn) {
      this._touchBtn.style.display = (this._nearMerchant && dist <= 2.0) ? 'block' : 'none';
    }
    if (this._foodTouchBtn) {
      this._foodTouchBtn.style.display = this._nearFood ? 'block' : 'none';
    }
  },

  _checkProximityCounter() {
    const cx = this._camWP.x - COUNTER_WORLD.x;
    const cz = this._camWP.z - COUNTER_WORLD.z;
    const counterDist = Math.sqrt(cx*cx + cz*cz);
    const nearCounter = counterDist <= COUNTER_PROXIMITY
      && merchantState.dialogStep === 1
      && window.INVENTORY && window.INVENTORY.swordHilt
      && !merchantState.hiltPlaced;

    if (nearCounter !== this._nearCounter) {
      this._nearCounter = nearCounter;
      if (this._counterHint)
        this._counterHint.object3D.visible = nearCounter;
    }

    if (this._nearCounter && this._counterHint) {
      this._counterHint.object3D.position.set(
        COUNTER_WORLD.x,
        COUNTER_WORLD.y + 0.4,
        COUNTER_WORLD.z
      );
      this._counterHint.object3D.rotation.y =
        Math.atan2(
          this._camWP.x - COUNTER_WORLD.x,
          this._camWP.z - COUNTER_WORLD.z
        );
    }

    // Touch button for counter
    if (this._counterTouchBtn) {
      this._counterTouchBtn.style.display = this._nearCounter ? 'block' : 'none';
    }
  },

  _showHint() {
    if (!this._hint || !this._hint.object3D) return;
    this._hint.object3D.position.set(
      this._npcWorldPos.x,
      this._npcWorldPos.y + 1.8,
      this._npcWorldPos.z
    );
    this._hint.object3D.rotation.y = Math.atan2(
      this._camWP.x - this._npcWorldPos.x,
      this._camWP.z - this._npcWorldPos.z,
    );
    this._hint.object3D.visible = true;
  },

  _hideHint() {
    if (this._hint && this._hint.object3D) this._hint.object3D.visible = false;
  },

  _showFoodHint() {
    if (!this._foodHint || !this._foodHint.object3D) return;
    this._foodHint.object3D.position.set(
      this._foodWorldPos.x,
      this._foodWorldPos.y + 0.3,
      this._foodWorldPos.z
    );
    this._foodHint.object3D.rotation.y = Math.atan2(
      this._camWP.x - this._foodWorldPos.x,
      this._camWP.z - this._foodWorldPos.z,
    );
    this._foodHint.object3D.visible = true;
  },

  _hideFoodHint() {
    if (this._foodHint && this._foodHint.object3D) this._foodHint.object3D.visible = false;
  },

  // ═════════════════════════════════════════════════════════════════════════
  // DIALOG
  // ═════════════════════════════════════════════════════════════════════════
  _triggerMerchantDialog() {
    const now = performance.now();
    if (now - merchantState.lastTrigger < merchantState.cooldownMs) return;
    if (this._bubbleTimer) return;
    merchantState.lastTrigger = now;

    if (merchantState.dialogStep === 0) {
      return;
    }

    if (merchantState.dialogStep === 1) {
      // Wappen noch nicht abgelegt
      this._showBubble('no_hilt', 4000, null);
      return;
    }

    // dialogStep >= 2: fertig
    return;
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PLACE HILT ON COUNTER
  // ═════════════════════════════════════════════════════════════════════════
  _placeHiltOnCounter() {
    if (merchantState.hiltPlaced) return;
    if (!this._nearCounter) return;
    if (!window.INVENTORY || !window.INVENTORY.swordHilt) return;

    merchantState.hiltPlaced = true;

    // Hint ausblenden
    if (this._counterHint)
      this._counterHint.object3D.visible = false;
    if (this._counterTouchBtn)
      this._counterTouchBtn.style.display = 'none';

    // Griff-Mesh auf Tresen einblenden
    if (this._hiltOnCounter)
      this._hiltOnCounter.setAttribute('visible', 'true');

    // Dialog starten nach kurzer Pause (800ms)
    setTimeout(() => {
      this._showBubble('b2', 8000, () => {
        this._showBubble('b2b', 6000, () => {
          this._showBubble('b2c', 4000, () => {
            window.QUEST1.heardMerchant = true;
            merchantState.dialogStep = 2;
            // Brot aufleuchten
            if (this._foodMesh && this._foodMesh.object3D) {
              this._foodMesh.object3D.traverse(child => {
                if (child.material)
                  child.material.emissiveIntensity = 0.8;
              });
            }
          });
        });
      });
    }, 800);
  },

  _showBubble(key, duration, onEnd) {
    Object.values(this._bubbles).forEach(b => {
      if (b && b.object3D) b.object3D.visible = false;
    });

    const bubble = this._bubbles[key];
    if (!bubble) return;

    bubble.object3D.position.set(
      this._npcWorldPos.x,
      this._npcWorldPos.y + 1.8,
      this._npcWorldPos.z
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
  // FOOD PICKUP
  // ═════════════════════════════════════════════════════════════════════════
  _tryPickupFood() {
    if (merchantState.dialogStep < 2) return;
    if (merchantState.foodGiven) return;
    if (!this._nearFood) return;

    merchantState.foodGiven = true;
    window.INVENTORY.dogFood = true;

    if (this._foodRoot) this._foodRoot.object3D.visible = false;
    this._hideFoodHint();
    if (this._foodTouchBtn) this._foodTouchBtn.style.display = 'none';

    const slot = document.getElementById('inv-food-slot');
    if (slot) {
      slot.style.display = '';
      slot.classList.add('has-item');
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REMOVE
  // ═════════════════════════════════════════════════════════════════════════
  remove() {
    if (this._insideRoot && this._insideRoot.parentNode)
      this._insideRoot.parentNode.removeChild(this._insideRoot);
    Object.values(this._bubbles).forEach(b => { if (b && b.parentNode) b.parentNode.removeChild(b); });
    if (this._hint && this._hint.parentNode) this._hint.parentNode.removeChild(this._hint);
    if (this._foodHint && this._foodHint.parentNode) this._foodHint.parentNode.removeChild(this._foodHint);
    if (this._counterHint && this._counterHint.parentNode) this._counterHint.parentNode.removeChild(this._counterHint);
    if (this._hiltOnCounter && this._hiltOnCounter.parentNode) this._hiltOnCounter.parentNode.removeChild(this._hiltOnCounter);
    if (this._touchBtn && this._touchBtn.parentNode) this._touchBtn.parentNode.removeChild(this._touchBtn);
    if (this._foodTouchBtn && this._foodTouchBtn.parentNode) this._foodTouchBtn.parentNode.removeChild(this._foodTouchBtn);
    if (this._counterTouchBtn && this._counterTouchBtn.parentNode) this._counterTouchBtn.parentNode.removeChild(this._counterTouchBtn);
  },
});