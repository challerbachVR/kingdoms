# ✦ KINGDOMS – Claude Code Skill
> Kompakter Kontext für Claude Code. Details → GDD.md / STORY.md

**Stack:** A-Frame + Three.js + Web Audio API | **Plattform:** Meta Quest 3 (WebXR)  
**Repo:** https://github.com/challerbachvr/kingdoms | **Live:** https://challerbachvr.github.io/kingdoms

---

## Dateistruktur

```
index.html                  – Einstiegspunkt, lädt alle Scripts
GDD.md                      – Technische Details
STORY.md                    – Story, Quests, Charaktere
SKILL.md                    – dieser File
js/
  textures.js               – prozedurale Canvas-Texturen + tex-Component
  sounds.js                 – Web Audio Sound-Engine (day/night/feen)
  daynight.js               – daynight-Component + gear-spin + steam
  navigation.js             – vr-movement + vr-teleport + player-collision
  npcs.js                   – city-life: NPCs, Tiere, Vögel + dog-special (Quest 1)
  fairy-transform.js        – weise Fee NPC + Feenverwandlung + Flugsteuerung
  key-system.js             – Schlüssel + Inventory HUD + Lichtreich-Tor
  ui-panel.js               – UI-Panel: Tageszeit, Sound, Quest-State-Toggle
scenes/
  kesselstadt.js            – statische Welt + gasthaus-door + schmiede-door
                              + haendler-door + alchemisten-door Components
  kesselstadt-quests.js     – dog-food-item, magic-signs, quest1-gate
  kesselstadt-night.js      – kesselstadt-night: Nacht-NPCs, Nachtwachen, Hund
  gasthaus.js               – Gasthaus Innenraum + 4 NPC-Dialoge (Quest 0)
  schmiede.js               – Schmiede Innenraum + smith-npc (Quest 1a)
  haendler.js               – Händler Innenraum + haendler-npc (Quest 1b)
  alchemistin.js            – Alchemistin Innenraum + alchemist-npc (Quest 1c)
  feenreich.js              – Feenreich: Terrain, Kreaturen, Sounds
  lichtreich.js             – Lichtreich Kulisse
```

---

## Globale States

```javascript
window.INVENTORY = {
  magicKey:  false,   // Magischer Schlüssel (Feenreich-Pilz)
  swordHilt: false,   // Schwertgriff mit Königin-Wappen (Schmiede)
  dogFood:   false    // Hundefutter (Händler)
}

window.QUEST0 = {
  heardTravelers:  false,  // Reisende im Gasthaus belauscht
  heardSoldier:    false,  // Soldat angesprochen
  sawCloakedWoman: false,  // Frau mit Kapuze verschwunden
  heardTavern:     false   // Gastwirt-Dialog → Ausgang frei
}

window.QUEST1 = {
  hasSwordHilt:  false,  // Schwertgriff aufgehoben
  firstMemory:   false,  // Flashback nach Schwertgriff
  smithKnows:    false,  // Schmied-Zusatzdialog gehört
  heardMerchant: false,  // Händler-Dialog abgeschlossen
  triggered:     false,  // Alchemistin: Hinweis auf Hund
  alchemistHint: false,  // Alchemistin-Zusatzdialog gehört
  dogFed:        false,  // Hund gefüttert
  signs:         0,      // Gefundene Zeichen (0-3)
  completed:     false   // Südtor geöffnet
}

window.LICHTREICH_GATE_UNLOCKED = false
window.FORGE_INSIDE    = false  // Spieler in Schmiede
window.MERCHANT_INSIDE = false  // Spieler im Händlerhaus
window.ALCHEMIST_INSIDE = false // Spieler in Alchemistin
```

---

## Wichtige Koordinaten

| Objekt | World Position |
|--------|----------------|
| Spieler-Start | (0, 0, 10) |
| Südtor | (0, 0, 28) |
| Westtor | (-28, 0, 0) |
| Schlüsselpilz | (-13, 12, 51) |
| Gasthaus-Tür außen | (-9, 0, 10.5) |
| Gasthaus-Interior | (-9, 0, 8) |
| Schmiede-Tür außen | (-9, 0, -5.5) |
| Schmiede-Interior | (-9, 0, -8) |
| Schmied-NPC | (-9.5, 0, -9.5) |
| Händler-Tür außen | (9, 0, -5.5) |
| Händler-Interior | (9, 0, -8) |
| Händler-NPC | (9, 0, -9.5) |
| Alchemist-Tür außen | (9, 0, 10.5) |
| Alchemist-Interior | (9, 0, 8) |
| Alchemist-NPC lokal | (0, 0, -1.5) |
| Feenreich-Trigger | z > 33 |

---

## Tageszeit-System

| Mode | Gebäude | Voraussetzung | Danach |
|------|---------|---------------|--------|
| `night` | Gasthaus | — | Start |
| `morning` | Schmiede | `QUEST0.heardTavern` | Nach Gasthaus verlassen |
| `midday` | Händlerhaus | `QUEST1.firstMemory` | Nach Schmiede verlassen |
| `evening` | Alchemistin | `QUEST1.heardMerchant` | Nach Händler verlassen |
| `day` | — | — | Normal-Zyklus |

```javascript
// Tageszeit setzen:
scene.setAttribute('daynight', 'mode:morning')

// Tageszeit lesen:
const mode = scene.components.daynight.data.mode

// Quest-States per UI-Panel setzen (Testing):
// Panel → Morgen → setzt QUEST0.heardTavern = true
// Panel → Tag   → setzt QUEST1.hasSwordHilt + firstMemory
// Panel → Abend → setzt QUEST1.heardMerchant + INVENTORY.dogFood
```

---

## HUD Slots

| Slot-ID | Symbol | State |
|---------|--------|-------|
| `#inv-key-slot` | 🗝️ | `INVENTORY.magicKey` |
| `#inv-hilt-slot` | ⚔️ | `INVENTORY.swordHilt` |
| `#inv-food-slot` | 🍖 | `INVENTORY.dogFood` |

Alle Slots: `display:none` wenn false, `has-item` Klasse wenn true. In VR ausgeblendet.

---

## Bestehende Components

| Component | Datei | Beschreibung |
|-----------|-------|--------------|
| `daynight` | daynight.js | Tageszeit: `setAttribute('daynight', 'mode:night')` |
| `player-collision` | navigation.js | AABB + Kreis-Kollision, `._boxes` + `._circles` |
| `vr-movement` | navigation.js | Smooth Locomotion Quest 3 + WASD Desktop |
| `city-life` | npcs.js | Tag-NPCs, Tiere, Vögel + dog-special |
| `fairy-transform` | fairy-transform.js | Fee-Verwandlung + Flugmodus |
| `key-system` | key-system.js | Schlüssel-Pickup + Westtor-Öffnung |
| `gasthaus-door` | kesselstadt.js | Eintreten/Verlassen Gasthaus, nur nachts |
| `schmiede-door` | kesselstadt.js | Eintreten/Verlassen Schmiede, nur morgens |
| `haendler-door` | kesselstadt.js | Eintreten/Verlassen Händlerhaus, nur mittags |
| `alchemisten-door` | kesselstadt.js | Eintreten/Verlassen Alchemistin, nur abends |
| `smith-npc` | schmiede.js | Schmied Dialog + Hammer + Funken + Flashback |
| `haendler-npc` | haendler.js | Händler Dialog + Wappen-Ablegen + Hundefutter |
| `alchemist-npc` | alchemistin.js | Alchemistin Dialog + Quest 1c |
| `quest1-gate` | kesselstadt-quests.js | Südtor-Sperre + Öffnungs-Sequenz |
| `kesselstadt-night` | kesselstadt-night.js | Nacht-Modus + Nachtwachen |
| `feenreich-scene` | feenreich.js | Feenreich Terrain + Zonenwechsel |
| `ui-panel-manager` | ui-panel.js | UI-Panel + Tageszeit-Toggle + Quest-States |

---

## Kritische Patterns

### VR Trigger Binding (IMMER so verwenden)
```javascript
// RICHTIG: tryBindVR Pattern
const tryBindVR = () => {
  const rh = document.getElementById('rightHand');
  if (rh) {
    rh.addEventListener('triggerdown', () => { /* handler */ });
  } else {
    setTimeout(tryBindVR, 200);
  }
};
tryBindVR();

// FALSCH: sc.addEventListener('loaded',...) – feuert nie wenn Scene bereits geladen
```

### KeyE Guard (IMMER absichern)
```javascript
document.addEventListener('keydown', e => {
  if (e.code === 'KeyE' && this._near) this._tryTransit(); // ← _near Guard!
});
```

### Door Component Pattern
```javascript
// Alle Door-Components folgen diesem Muster:
// _isDaytime()  → prüft mode
// _doEnter()    → setzt INSIDE=true, versteckt Außenwelt, KEEP-Set beachten
// _doExit()     → setzt INSIDE=false, stellt Außenwelt her, Tageszeit wechseln

// KEEP-Set in _doEnter() IMMER vollständig:
const KEEP = new Set([
  'rig', '[interior-id]', 'sun', 'ambLight',
  'cloaked-woman-figure',  // Gasthaus-Figur
]);
```

### Weltposition (IMMER getWorldPosition nutzen)
```javascript
// RICHTIG:
const worldPos = new THREE.Vector3();
element.object3D.getWorldPosition(worldPos);

// FALSCH: element.object3D.position (= lokale Position)
```

### object3D statt setAttribute in tick()
```javascript
// RICHTIG (Performance):
element.object3D.visible = true;
element.object3D.position.set(x, y, z);

// FALSCH in tick():
element.setAttribute('visible', 'true'); // langsam!
```

### NPC-Rotation zum Spieler
```javascript
const angle = Math.atan2(
  camWP.x - npcWorldPos.x,
  camWP.z - npcWorldPos.z
);
npcRoot.object3D.rotation.y = angle;
```

### Bubble-Position vor NPC (nicht hinter)
```javascript
const dirX = camWP.x - npcWorldPos.x;
const dirZ = camWP.z - npcWorldPos.z;
const len = Math.sqrt(dirX*dirX + dirZ*dirZ) || 1;
bubble.object3D.position.set(
  npcWorldPos.x + (dirX/len) * 0.8,
  npcWorldPos.y + 1.8,
  npcWorldPos.z + (dirZ/len) * 0.8
);
```

---

## Performance-Regeln Quest 3

- `shader:flat` auf ALLEN Materialien
- Kugeln max. `segments-width:8 segments-height:6`
- Zylinder max. `segments-radial:8`
- Texturen max. 512×512px
- Max. 9 aktive Punktlichter gesamt pro Zone
- Kein `setAttribute` in `tick()`-Schleifen → `object3D` direkt
- `dt` auf 50ms begrenzen: `Math.min(dt, 50) * 0.001`
- Canvas-Texturen einmalig zeichnen, per `.clone()` wiederverwenden
- Retry-Pattern für DOM-Elemente: max 20 Versuche, dann `console.warn`

---

## Zonenwechsel-Logik

```javascript
const cam = document.querySelector('#camera');
const wp = new THREE.Vector3();
cam.object3D.getWorldPosition(wp);

// Zonen:
// Kesselstadt:   |wp.x| <= 28 && |wp.z| <= 28
// Feenreich:     wp.z > Math.abs(wp.x)
// Lichtreich:    -wp.x > Math.abs(wp.z)
// Sturmreich:    -wp.z > Math.abs(wp.x)
// Schattenreich: wp.x > Math.abs(wp.z)
```

---

## QA-Checkliste (vor jedem Commit)

1. KeyE Listener mit `this._near` Guard?
2. VR Trigger via `tryBindVR()` (kein `loaded` Wrapper)?
3. Weltpositionen via `getWorldPosition()`?
4. KEEP-Set in `_doEnter()` vollständig (inkl. `cloaked-woman-figure`)?
5. Session-Reload Guards für alle States?
6. `dt` auf 50ms geclampt?
7. Kein `setAttribute` in `tick()`?
8. `shader:flat` auf allen Materialien?
9. Bubbles beim Verlassen des Raums ausgeblendet?
10. Tageszeit-Wechsel in `_doExit()` (nicht `_doEnter()`)?
