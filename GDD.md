# ✦ KINGDOMS – Game Design Document (Technisch)
> Story & Narrative → siehe STORY.md

**Plattform:** Meta Quest 3 (WebXR)  
**Technologie:** A-Frame / Three.js / Web Audio API  
**Repository:** https://github.com/challerbachvr/kingdoms  
**Live URL:** https://challerbachvr.github.io/kingdoms  
**Status:** Kesselstadt ✅ / Feenreich ✅ / Lichtreich 🔲 (Kulisse) / Quest 1 🔄 / Story in Entwicklung

---

## 1. Weltstruktur & Koordinaten

Die Welt ist als **Kreuz-Dreieck-Karte** aufgebaut. Kesselstadt = Zentrum (|x| ≤ 28, |z| ≤ 28). Die vier Reiche erstrecken sich diagonal nach außen.

```
              [ Sturmreich 🐉 ]  -z > |x|
             /                 \
[ Lichtreich ] ──[ KESSELSTADT ]──[ Schattenreich ]
  -x > |z|  \                   /   x > |z|
              \   z > |x|      /
              [ Feenreich 🍄 ]
```

**Koordinatensystem:** +X = Ost, −X = West, +Z = Süd, −Z = Nord

### Zonenerkennung (Kameraposition)

| Zone | Bedingung |
|------|-----------|
| Kesselstadt | \|x\| ≤ 28 **und** \|z\| ≤ 28 |
| Feenreich (Süd) | z > \|x\| |
| Sturmreich (Nord) | −z > \|x\| |
| Lichtreich (West) | −x > \|z\| |
| Schattenreich (Ost) | x > \|z\| |

### Zonenwechsel & Übergänge
- **Feenreich:** Crossfade über 22 Einheiten ab z=28. Sound/Licht bei 50%
- **Lichtreich:** Crossfade über 30 Einheiten ab Diagonalgrenze
- Sky-Overlay-Sphäre (`#sky-overlay`, r=4800) als Blend-Layer
- 4-Sekunden Audio-Crossfade zwischen Zonen
- Alle Grenzen folgen dem 45°-Diagonalprinzip

### Zonenstatus

| Zone | Status |
|------|--------|
| 🏙️ Kesselstadt | ✅ Fertig |
| 🍄 Feenreich | ✅ Fertig |
| 🌟 Lichtreich (West) | 🔲 Kulisse in Arbeit |
| 🌑 Schattenreich (Ost) | 🔲 Geplant |
| 🐉 Sturmreich (Nord) | 🔲 Geplant |

---

## 2. Dateistruktur

```
kingdoms/
├── index.html                  (Einstiegspunkt + <a-scene>-Attribute)
├── GDD.md                      (dieses Dokument – technisch)
├── STORY.md                    (Story, Quests, Charaktere)
├── js/
│   ├── textures.js             (prozedurale Canvas-Texturen)
│   ├── sounds.js               (Web Audio Sound-Engine)
│   ├── daynight.js             (Tag/Nacht + Steampunk-Animationen)
│   ├── navigation.js           (Bewegung, Kollision, Terrain-Höhe)
│   ├── npcs.js                 (NPCs, Tiere, Vögel + Hund-Fütterung)
│   ├── feenreich-creatures.js  (Feenschwärme, Hasen, Füchse, Schmetterlinge)
│   ├── touch-controls.js       (Mobile Touch-Joysticks)
│   ├── ui-panel.js             (Info-Panel, Tageszeit, Sound-Toggles)
│   ├── fairy-transform.js      (Weise Fee NPC + Feenverwandlung + Flugsteuerung)
│   └── key-system.js           (Schlüssel + Inventory HUD + Lichtreich-Tor)
└── scenes/
    ├── kesselstadt.js          (statische Welt: Gebäude, Mauern, Tore, NPC alte Frau)
    ├── kesselstadt-quests.js   (Quest 1 Logik: Knochen, Zeichen, Südtor-Mechanik)
    ├── feenreich.js            (Feenreich Terrain + Kreaturen + Sounds)
    └── lichtreich.js           (Lichtreich Kulisse)
```

### Ladereihenfolge (index.html)
`kesselstadt.js` → `kesselstadt-quests.js` → `feenreich.js` → `lichtreich.js`  
Wichtig: `kesselstadt.js` muss vor `kesselstadt-quests.js` geladen sein, da `KESSELSTADT_HTML` (inkl. `gate-south-*`) zuerst im DOM stehen muss.

---

## 3. Die Kesselstadt ✅

### Architektur
- Kopfsteinpflaster (prozedurale Canvas-Textur)
- 4 Hauptgebäude mit Satteldächern:
  - Schmied (SW) – 39.2° Neigung, Terrakotta
  - Händlerhaus (SO) – 48° Neigung, Sandstein
  - Gasthaus (NW) – 42.8° Neigung
  - Alchemistenladen (NO) – 39.2° Neigung, Rundturm
- Vollständige Stadtmauer, 4 Tore, 4 Ecktürme, Zinnen
- Brunnen, Dampfmaschinen, Zahnräder, Gaslaternen, Marktstände

### Fenster
- Farbe: #f5c842 / Abends: emissiveIntensity 0.55 / Nachts: 1.0

### Tore & Öffnungslogik

| Tor | Richtung | Mechanik |
|-----|----------|----------|
| **Südtor** | → Feenreich | Gesperrt (Quest 1). Schloss + blaue Barriere. Öffnet wenn `QUEST1.completed = true` |
| **Westtor** | → Lichtreich | Gesperrt via Schloss + Barriere. Öffnet dauerhaft nach Schlüssel-Einsatz |
| **Nordtor** | → Sturmreich | Offen, keine Mechanik |
| **Osttor** | → Schattenreich | Offen, keine Mechanik |

**Südtor-Sequenz bei Quest-Abschluss:** Schloss + Barriere weiß aufleuchten (400ms) → beides verschwindet → Feen-Partikel erscheinen → Torflügel öffnen (800ms Delay)

### Stadtleben
- 9 NPCs, Patrol-System (28 Wegpunkte), gefilterter Spawn
- 3 Hunde (1 mit goldenen Augen – Quest 1), 2 Katzen, 6 Hühner, 13 Vögel
- Alte Frau NPC (statisch, Quest 1) – verschwindet nach Dialog

### NPCs – Alte Frau (weise Fee in Verkleidung)
- **Position:** (−6.5, 0, 4.5) – Ecke nordöstlich des Gasthauses, blickt zum Marktplatz
- **Aussehen:** gebückte Haltung (−12° X-Tilt), grauer Umhang, weißes Haar, blassere Haut
- **Verhalten:** Statisch (kein Patrol)
- **Sichtbar:** Nur wenn `QUEST1.triggered !== true` (und Knochen noch nicht aufgehoben)
- **Dialog bei < 2.5m:** „Finde den Hund mit den goldenen Augen. Er kennt den Weg."
- **Nach 4s:** Panel verschwindet, Figur entfernt sich, `QUEST1.triggered = true`
- **Einmalig:** Dialog erscheint nur beim ersten Mal

### Sounds (Web Audio API)
- Tag: Stimmengewirr, Dampfpfeifen, Zahnrad-Klingen, Schmiedehammer
- Nacht: Feuerknistern, Wind, Eulenrufe

### Kollisionserkennung
- AABB-Boxen: Gebäude, Mauern, Sonderobjekte
- Kreise: Türme, Brunnen, runde Strukturen
- Uhrturm: separater AABB (4.5×4.5m)
- Torlücken (r ≤ 3m um Tormitte) freigelassen
- Dynamisch (entfernt bei Öffnung):
  - Lichtreich-Barriere: x=−29..−27, z=−2.5..2.5 → Event `lichtreich-unlocked`
  - Südtor-Barriere: x=−2.1..2.1, z=27.2..28.8 → via `player-collision._boxes` aus `quest1-gate`

---

## 4. Das Feenreich ✅

### Terrain
- Hügelige Wiese (Pastellfarben), 5 Hügel, 5 Riesenpilze, 10 kleine Pilze
- 3 Riesenbäume mit Feendörfern, Bach (CatmullRom-Kurve), 11 Blumen

### Schlüsselpilz (Türkis) ✅
- Position: (−13, 0, 51)
- Stamm: Zylinder r=0.9, Höhe 8m
- Kappe: oblates Ellipsoid (r=5.5, scale-y=0.44), Spitze bei y≈11.42
- Begehbar via Ellipsoid-Heightmap
- Schlüssel schwebt bei (−13, 12, 51)

### Prozedurale Texturen
`fee-grass`, `fee-mushcap`, `fee-bark`, `fee-foliage`, `fee-moss`, `fee-water`

### Weise Fee NPC ✅
- Position: 5–10m vom Südtor
- Dialog bei < 3m: Feenverwandlung anbieten
- Dreht sich Spieler zu bei < 3.5m

### Kreaturen
- 3 Feenschwärme (Gold/Blau/Grün), je 4 Feen mit Schwarm-KI
- 3 Hasen, 2 Füchse, 5 Schmetterlinge (Lissajous), 3 Geistwesen

### Sounds
- Grundrauschen, Feen-Zwitschern, Bach, Kristall-Summen, Vogelgesang, Insekten

---

## 5. Das Lichtreich 🔲

### Lage & Zugang
- Westen (−x > |z|), erreichbar nach Westtor-Öffnung
- Herzstein-Splitter Nr. 2 liegt hier (noch nicht implementiert)

---

## 6. Story-Mechaniken

### Globaler Spielzustand (`window.*`)

```js
window.INVENTORY = {
  magicKey: false,   // Schlüssel aufgehoben (Feenreich-Pilz)
  dogFood:  false,   // Knochen aufgehoben (Marktstand 2)
}

window.QUEST1 = {
  triggered: false,  // Alte Frau wurde getriggert (Dialog einmalig gesehen)
  signs:     0,      // 0..3 magische Zeichen untersucht
  dogFed:    false,  // Hund gefüttert (reserviert, nicht aktiv geprüft)
  completed: false,  // Quest abgeschlossen → Südtor öffnet
}

window.LICHTREICH_GATE_UNLOCKED = false  // Westtor dauerhaft geöffnet
```

### Quest 1 – Ablauf ✅ (Rückkehr alte Frau fehlt noch)

```
Alte Frau Dialog  →  Hund mit goldenen Augen finden
      ↓                         ↓
QUEST1.triggered = true    Knochen aufheben (Marktstand 2)
                                ↓
                          INVENTORY.dogFood = true
                                ↓
                     3 magische Zeichen erscheinen
                     (Brunnen / Gasthaus / Dampfmaschine)
                                ↓
                     Alle 3 untersuchen (E / Trigger)
                          QUEST1.signs = 3
                                ↓
                     QUEST1.completed = true
                     Schloss + Barriere Südtor weg
                     Feen-Partikel + Torflügel öffnen
```

### Quest 1 – Knochen-Item (`dog-food-item`)
- **Position:** (4.2, 1.08, −4.5) – Tisch von Marktstand 2
- Schwebt + rotiert (tick-Animation)
- Interaktionsradius: 1.5m XZ
- HUD-Slot: `#inv-food-slot` zeigt 🦴
- Hinweis: „E / Trigger: Aufheben" (kamerazugewandt)

### Quest 1 – Magische Zeichen (`magic-signs`)
Erscheinen erst wenn `INVENTORY.dogFood = true` (einmalige Enthüllung mit Fade-In).

| ID | Position | Beschreibung |
|----|----------|-------------|
| `sign-brunnen` | (0, 0.90, 2.15) | Außen am Südrand des Brunnenbeckens |
| `sign-gasthaus` | (−9, 5.20, 11.58) | Am Gasthaus-Vordach |
| `sign-dampf` | (14.65, 1.50, −2.00) | Am Dampfmaschinen-Zahnrad (ry=90°) |

- Interaktionsradius: 2m XZ
- HUD-Counter: `#inv-signs-slot` zeigt ✦ 0/3 … ✦ 3/3
- Aufleuchten nach Untersuchen: violett (emissiveIntensity 3.0)

### Quest 1 – Südtor-Mechanik (`quest1-gate`)
- **Schloss:** (0, 3.2, 27.5) – goldenes 3D-Objekt, rotiert + schwebt (identisches Schema wie Westtor)
- **Barriere:** `a-plane` bei (0, 2.5, 28), blaue pulsierende Ebene (`side:double`)
- **Pulsieren:** `opacity = 0.28 + |sin(t·0.0018)| · 0.30`
- **Kollision:** AABB `{ x0:−2.1, x1:2.1, z0:27.2, z1:28.8 }` dynamisch in `player-collision._boxes`
- **Hinweis:** „Finde die drei Zeichen" erscheint bei < 3m (unterhalb des Schlosses, y=2.2)
- **Abschluss:** Sofort wenn `QUEST1.signs >= 3` → Flash → Entfernung → Torflügel + Partikel

### Schlüssel-System (`magic-key` / `lichtreich-gate`)
- Schlüssel bei (−13, 12, 51), Interaktionsradius 2.5m
- Hinweis bei Nähe: „E / Trigger: Aufheben"

### Inventory HUD
- `#inventory-hud` rechts unten, Slots: 🗝️ `#inv-key-slot` / 🦴 `#inv-food-slot` / ✦ `#inv-signs-slot`
- Persistent innerhalb der Session via `window.INVENTORY`
- In VR ausgeblendet

### Westtor öffnen (`lichtreich-gate`)
- Schloss: 3D-Objekt, goldenes Glühen, schwebend + rotierend bei (−26.5, 3.2, 0)
- Barriere: blaue pulsierende Ebene bei (−28, 2.5, 0)
- Mit Schlüssel bei < 5.5m: „E / Trigger: Tor öffnen"
- Sequenz: Aufleuchten (400ms) → Schloss + Barriere weg → Torflügel öffnen
- `window.LICHTREICH_GATE_UNLOCKED = true`

### Multi-Plattform-Input
- Quest 3: rechter Trigger (`triggerdown`)
- Desktop: E-Taste (`keydown KeyE`)
- Mobile: Touch-Button bei Nähe

---

## 7. Navigation & Steuerung

| Plattform | Bewegung | Kamera | Fee ↑ | Fee ↓ |
|-----------|----------|--------|-------|-------|
| Quest 3 | Linker Thumbstick | Rechter Thumbstick Snap 45° | B | A |
| Desktop | WASD | Maus | Space | C |
| Mobile | Linker Joystick | Rechter Joystick | ↑ | ↓ |

- VR-Teleport: Linker Trigger halten → loslassen
- Zielt auf Y=0 (Boden)

---

## 8. UI & Panel

- **Quest 3:** X-Button / **Desktop:** M / **Mobile:** Button unten rechts
- Inhalt: Zone, Tageszeit (nur Kesselstadt), Sound-Toggles

---

## 9. Bekannte TODOs

| Priorität | Was |
|-----------|-----|
| 🟠 Mittel | Quest 1: Alte Frau kehrt nach Quest-Abschluss als Fee in die Kesselstadt zurück |
| 🟠 Mittel | Lichtreich: Terrain, Kreaturen, Sounds, Quest 2 |
| 🟡 Niedrig | aframe-watcher nicht kompatibel mit modularer Struktur |
| 🟡 Niedrig | VR-Teleport trifft nur Y=0 |

---

## 10. Entwicklungs-Roadmap

| Phase | Was | Status |
|-------|-----|--------|
| 1–6 | Kesselstadt + Feenreich + UI | ✅ |
| 7a | Kollision Feenreich | ✅ |
| 7b | Diagonale Kartenaufteilung + Grenzmauer | ✅ |
| 7c | Sky-Crossfade + Torflügel-Animation | ✅ |
| 7d | Weise Fee + Feenverwandlung + Flugsteuerung | ✅ |
| 7e | Schlüssel → Inventory → Westtor | ✅ |
| 7f | Pilz-Kappe begehbar + Multi-Plattform-Input | ✅ |
| 8a | Quest 1: Knochen + Zeichen + Südtor (Schloss + Barriere) | ✅ |
| 8b | Quest 1: Alte Frau NPC (Dialog, verschwindet) | ✅ |
| 8c | Quest 1: Alte Frau kehrt als Fee zurück | 🔲 |
| 9 | Lichtreich: Terrain + Kreaturen + Sounds + Quest | 🔲 |
| 10 | Schattenreich + Sturmreich | 🔲 |
| 11 | Mixed Reality Modus | 🔲 |
| 12 | Polish & Optimierung | 🔲 |

---

## 11. Technische Erkenntnisse

### Performance Quest 3
- `shader:flat` wo möglich
- Kugeln max. 10×5, Zylinder max. 8 radial
- Texturen max. 512×512px, max. 9 Punktlichter
- Kein `setAttribute` in Tick-Schleifen, dt auf 50ms begrenzen

### Kollisionssystem
- `player-collision` auf `<a-scene>`: prüft Kamera-Weltposition jeden Frame
- Feenmodus (rig.y > 1m): `_feenCircles` übersprungen → freies Fliegen
- Terrain-Höhe: feenHills (Kugeln) + feenMushroomCaps (Ellipsoide)
- Ellipsoid-Formel: `capY = cy + b × √(1 − d²/a²)`
- Dynamische Barrieren: per `_boxes.push/splice` aus Quest-Komponenten eintragbar

### Quest-Komponenten-Architektur
- Quest-Logik strikt getrennt von statischer Welt (`kesselstadt-quests.js` vs. `kesselstadt.js`)
- `kesselstadt.js` definiert `KESSELSTADT_HTML` (inkl. Torflügel-Entities) → muss vor Quest-Datei geladen sein
- Kollisions-Barrieren für Quests: dynamisch via `this.el.sceneEl.components['player-collision']._boxes`
- Quest-Gate-Sequenz-Schema (Schloss + Barriere + Partikel + Torflügel): identisch für West- und Südtor

### Feenverwandlung
- Rig-Scale: 1.0 → 0.22 über 2.8s (easeInOut)
- Kamera-Weltposition bleibt konstant während Skalierung
- `fairy-mode` nutzt `player-collision._getTerrainHeight()` als Bodenlimit

### Allgemeine Erkenntnisse
- Scripts im `<head>`: nie `document.body` direkt – in A-Frame `init()` initialisieren
- `rayOrigin: mouse` für kamera-relative UI-Panels
- Zonenwechsel über Kamera-Weltposition, nicht Rig-Position
- Canvas-Texturen einmalig zeichnen, per Clone wiederverwenden
- Bodenflächen Y-Reihenfolge: Lichtreich 0.003 < Feenreich 0.005 < Schimmer 0.015–0.02
- Diagonale Grenze: `z = −x` / `z = x` – alle Grenzelemente folgen 45°-Prinzip
- NPC-Dialog-Panels: initial bei y=−200 parken, in tick() auf Zielposition setzen + kamera-facing
