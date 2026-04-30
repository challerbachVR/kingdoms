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
  npcs.js                   – city-life: NPCs, Tiere, Vögel (Tag)
  fairy-transform.js        – weise Fee NPC + Feenverwandlung + Flugsteuerung
  key-system.js             – Schlüssel + Inventory HUD + Westtor
scenes/
  kesselstadt.js            – statische Welt + gasthaus-door Component
  kesselstadt-quests.js     – Quest 1: Knochen, Zeichen, Südtor, alte Frau
  kesselstadt-night.js      – Nacht: NPCs ausblenden, Nachtwachen, Hund
  feenreich.js              – Feenreich: Terrain, Kreaturen, Sounds
  lichtreich.js             – Lichtreich Kulisse
  gasthaus.js               – Gasthaus Innenraum + alle NPCs + Dialoge
```

---

## Globale States

```javascript
window.INVENTORY = { magicKey: false, dogFood: false }

window.QUEST0 = {
  heardTravelers: false,   // Reisende im Gasthaus belauscht
  heardSoldier:   false,   // Soldat angesprochen
  sawCloakedWoman: false,  // Frau mit Kapuze verschwunden
  heardTavern:    false    // Gastwirt-Dialog abgeschlossen → Ausgang frei
}

window.QUEST1 = {
  triggered: false,   // Alte Frau hat Hinweis gegeben
  dogFed:    false,   // Hund gefüttert
  signs:     0,       // Gefundene Zeichen (0-3)
  completed: false    // Südtor geöffnet
}

window.LICHTREICH_GATE_UNLOCKED = false  // Westtor dauerhaft offen
```

---

## Wichtige Koordinaten

| Objekt | Position |
|--------|----------|
| Spieler-Start | (0, 0, 10) |
| Südtor | (0, 0, 28) |
| Westtor | (-28, 0, 0) |
| Schlüsselpilz | (-13, 12, 51) |
| Gasthaus-Tür außen | (-9, 0, 10.5) |
| Feenreich-Trigger | z > 33 |

---

## Wiederkehrende Patterns

### Dialog-Panel
```javascript
const panel = document.createElement('a-entity');
panel.setAttribute('position', '0 2.2 0');
panel.setAttribute('visible', 'false');
const txt = document.createElement('a-text');
txt.setAttribute('value', 'Text hier');
txt.setAttribute('align', 'center');
txt.setAttribute('color', '#ffffff');
txt.setAttribute('width', '2.5');
panel.appendChild(txt);
parentEl.appendChild(panel);
// Anzeigen:
panel.setAttribute('visible', 'true');
// Nach N ms ausblenden:
setTimeout(() => panel.setAttribute('visible', 'false'), 3000);
```

### Multi-Plattform-Input (E / Trigger / Touch)
```javascript
// In init():
this._onKey = (e) => { if (e.code === 'KeyE') this._interact(); };
document.addEventListener('keydown', this._onKey);
this.el.sceneEl.addEventListener('triggerdown', () => this._interact());
// Touch-Button: wird dynamisch bei Nähe ein-/ausgeblendet
// Siehe key-system.js als Referenz
```

### Fade to Black
```javascript
// Overlay-Element in index.html: <a-entity id="fade-overlay">
const overlay = document.querySelector('#fade-overlay');
// Fade out:
overlay.setAttribute('material', 'opacity: 1');
setTimeout(() => {
  // Szene wechseln
  setTimeout(() => {
    // Fade in:
    overlay.setAttribute('material', 'opacity: 0');
  }, 300);
}, 300);
// Referenz: gasthaus-door Component in kesselstadt.js
```

### Stilisierten NPC erstellen
```javascript
// Referenz: npcs.js _spawnNPC() oder gasthaus.js _buildNPCs()
// Struktur: pivot → body (box) + head (sphere) + legs (cylinder×2)
// shader:flat auf allen Materialien für Quest 3 Performance
// Beispiel-Farben: Torso #3a6bc4, Kopf #f5c8a0, Haar #2a1a0a
```

---

## Performance-Regeln Quest 3

- `shader:flat` auf ALLEN Materialien
- Kugeln max. `segments-height:10 segments-width:5`
- Zylinder max. `segments-radial:8`
- Texturen max. 512×512px
- Max. 9 aktive Punktlichter gesamt
- Kein `setAttribute` in `tick()`-Schleifen → `object3D` direkt manipulieren
- `dt` auf 50ms begrenzen: `dt = Math.min(dt, 50)`
- Canvas-Texturen einmalig zeichnen, per `.clone()` wiederverwenden

---

## Bestehende Components

| Component | Datei | Beschreibung |
|-----------|-------|--------------|
| `daynight` | daynight.js | Tageszeit setzen: `setAttribute('daynight', 'mode:night')` |
| `player-collision` | navigation.js | AABB + Kreis-Kollision, `._boxes` und `._circles` arrays |
| `vr-movement` | navigation.js | Smooth Locomotion Quest 3 + WASD Desktop |
| `city-life` | npcs.js | Alle Tag-NPCs, Tiere, Vögel – `visible` toggle für Nacht |
| `fairy-transform` | fairy-transform.js | Fee-Verwandlung + Flugmodus |
| `key-system` | key-system.js | Schlüssel-Pickup + Westtor-Öffnung |
| `gasthaus-door` | kesselstadt.js | Eintreten/Verlassen Gasthaus + Fade |
| `quest1-gate` | kesselstadt-quests.js | Südtor-Sperre + Öffnungs-Sequenz |
| `kesselstadt-night` | kesselstadt-night.js | Nacht-Modus + Nachtwachen |
| `feenreich-scene` | feenreich.js | Feenreich Terrain + Zonenwechsel |

---

## Zonenwechsel-Logik

```javascript
// Kamera-Weltposition prüfen (nicht Rig!):
const cam = document.querySelector('#camera');
const wp = new THREE.Vector3();
cam.object3D.getWorldPosition(wp);

// Zonen:
// Kesselstadt: |wp.x| <= 28 && |wp.z| <= 28
// Feenreich:   wp.z > Math.abs(wp.x)
// Lichtreich:  -wp.x > Math.abs(wp.z)
// Sturmreich:  -wp.z > Math.abs(wp.x)
// Schattenreich: wp.x > Math.abs(wp.z)
```
