# ✦ KINGDOMS – Game Design Document (Technisch)
> Story & Narrative → siehe STORY.md

**Plattform:** Meta Quest 3 (WebXR)  
**Technologie:** A-Frame / Three.js / Web Audio API  
**Repository:** https://github.com/challerbachvr/kingdoms  
**Live URL:** https://challerbachvr.github.io/kingdoms  
**Status:** Kesselstadt ✅ / Feenreich ✅ / Lichtreich 🔲 (Kulisse) / Gasthaus ✅ / Quest 0 ✅ / Quest 1 ✅

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
├── index.html                    (~65 Zeilen – schlanker Einstiegspunkt)
├── GDD.md                        (dieses Dokument – technisch)
├── STORY.md                      (Story, Quests, Charaktere)
├── js/
│   ├── textures.js               (prozedurale Canvas-Texturen)
│   ├── sounds.js                 (Web Audio Sound-Engine)
│   ├── daynight.js               (Tag/Nacht + Steampunk-Animationen)
│   ├── navigation.js             (Bewegung, Kollision, Terrain-Höhe)
│   ├── npcs.js                   (NPCs, Tiere, Vögel; dog-special mit Fütterungs- & Führungs-KI)
│   ├── feenreich-creatures.js    (Feenschwärme, Hasen, Füchse, Schmetterlinge)
│   ├── touch-controls.js         (Mobile Touch-Joysticks)
│   ├── ui-panel.js               (Info-Panel, Tageszeit, Sound-Toggles)
│   ├── fairy-transform.js        (Weise Fee NPC + Feenverwandlung + Flugsteuerung)
│   └── key-system.js             (Schlüssel + Inventory HUD + Lichtreich-Tor)
└── scenes/
    ├── kesselstadt.js            (Kesselstadt HTML + gate-trigger + old-woman-npc + gasthaus-door)
    ├── kesselstadt-quests.js     (dog-food-item, magic-signs, quest1-gate)
    ├── kesselstadt-night.js      (kesselstadt-night – Nacht-Modus + 3 Nachtwachen)
    ├── gasthaus.js               (gasthaus-scene + 4 NPC-Dialoge / Interaktionen)
    ├── feenreich.js              (Feenreich Terrain + Kreaturen + Sounds)
    └── lichtreich.js             (Lichtreich Kulisse)
```

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
- **Südtor** (→ Feenreich): gesperrt bis `QUEST1.completed`. Öffnet dauerhaft nach den drei Zeichen
- **Westtor** (→ Lichtreich): gesperrt via Schloss + Barriere. Öffnet dauerhaft nach Schlüssel-Einsatz
- **Nordtor** (→ Sturmreich): offen, keine Mechanik
- **Osttor** (→ Schattenreich): offen, keine Mechanik

### Stadtleben (Tag)
- 9 NPCs, Patrol-System (28 Wegpunkte), gefilterter Spawn
- 3 Hunde (dog-special mit goldenen Augen – Quest 1), 2 Katzen, 6 Hühner, 13 Vögel

### Nacht-Modus (`kesselstadt-night`)
- Tag-NPCs, Tiere und Vögel werden ausgeblendet
- dog-special bewacht Gasthaus-Eingang (Pos: −9, 0, 12.5)
- 3 Nachtwachen patrouillieren mit Laterne; Dialog-Panel bei Annäherung
- Tageszeit wird auf Nacht gesetzt (`daynight: mode:night`)

### Sounds (Web Audio API)
- Tag: Stimmengewirr, Dampfpfeifen, Zahnrad-Klingen, Schmiedehammer
- Nacht: Feuerknistern, Wind, Eulenrufe

### Kollisionserkennung
- AABB-Boxen: Gebäude, Mauern, Sonderobjekte
- Kreise: Türme, Brunnen, runde Strukturen
- Uhrturm: separater AABB (4.5×4.5m)
- Torlücken (r ≤ 3m um Tormitte) freigelassen
- Dynamisch: Lichtreich-Barriere (x=−29..−27, z=−2.5..2.5) wird bei Öffnung entfernt
- Gasthaus-Box wird beim Eintreten aus player-collision entfernt (Innenraum-Navigation)

---

## 4. Das Gasthaus ✅

### Zugang (`gasthaus-door`)
- Außen-Trigger: Weltpos (−9, 0, 10.52), Radius 2m
- Hint-Panels: „E / Trigger: Eintreten" / „E / Trigger: Verlassen"
- Fade-Transition (Schwarz, 300ms) beim Wechsel Außen↔Innen
- Beim Eintreten: Alle Szene-Entities ausgeblendet; Gasthaus-Kollisionsbox deaktiviert
- Spieler landet bei Weltpos (−9, 0, 7.5) im Inneren

### Innenraum (`gasthaus-scene`)
- Koordinatenursprung: Weltpos (−9, 0, 8) = `#gasthaus-interior`
- Raummaße: 12×8m, Höhe 3.20m
- Feuerstelle (Nordwand), Theke mit Regalen (Westwand), 5 Tische mit Bänken
- Prozedurale Texturen: `tex-inn-planks`, `tex-inn-stone`, `tex-inn-beam`
- Feuerschein: 1 Punktlicht (orange, Intensität 1.6)

### NPCs im Gasthaus

| Figur | Lokale Pos | Weltpos | Rotation |
|-------|-----------|---------|----------|
| Gastwirt | (−5.80, 0, −2.0) | (−14.8, 0, 6.0) | rotY=90 (Ost) |
| Reisender A | (−3.2, 0, −2.37) | (−12.2, 0, 5.63) | rotY=180 (Nord) |
| Reisender B | (−3.2, 0, −3.83) | (−12.2, 0, 4.17) | rotY=0 (Süd) |
| Alter Soldat | (3.2, 0, 0.33) | (−5.8, 0, 8.33) | rotY=180 (Nord) |
| Frau mit Kapuze | (3.2, 0, −3.83) | (−5.8, 0, 4.17) | rotY=0 (Süd) |

---

## 5. Das Feenreich ✅

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

## 6. Das Lichtreich 🔲

### Lage & Zugang
- Westen (−x > |z|), erreichbar nach Westtor-Öffnung
- Herzstein-Splitter Nr. 2 liegt hier (noch nicht implementiert)

---

## 7. Story-Mechaniken

### Quest 0: Gasthaus-Vorgeschichte ✅

Alle Flags in `window.QUEST0`:

| Flag | Auslöser | Bedingung |
|------|----------|-----------|
| `heardTravelers` | Auto bei < 2.5m | — |
| `heardSoldier` | E/Trigger bei < 2m | — |
| `sawCloakedWoman` | Auto bei < 2m | — |
| `heardTavern` | E/Trigger bei < 2m | `heardSoldier && heardTravelers` |

**Reisende** (`gasthaus-travelers`): Auto-Dialog über Tisch 3, Tischmitte (−12.2, 0, 4.9). Drei Zeilen, Pausen 6s. Einmalig.

**Alter Soldat** (`soldier-dialog`): Hint „E / Trigger: Ansprechen" bei < 2m. Drei Zeilen, Pausen 6s. Einmalig.

**Frau mit Kapuze** (`cloaked-woman`): Stumme Interaktion bei < 2m. Aufstehen (0.5s, easeInOut) → wegdrehen (0.4s) → verblassen (1s, Three.js-Traverse). Einmalig. Kein Hint.

**Gastwirt** (`innkeeper-dialog`): Hint nur sichtbar wenn `heardSoldier && heardTravelers`. Drei Zeilen, Pausen 3s. Setzt `heardTavern = true` nach letzter Zeile.

### Quest 1: Alter Hund / Drei Zeichen / Südtor ✅

Alle Flags in `window.QUEST1`:

| Flag | Typ | Bedeutung |
|------|-----|-----------|
| `signs` | 0–3 | Anzahl untersuchter Runenzeichen |
| `dogFed` | bool | Hund gefüttert |
| `completed` | bool | Quest abgeschlossen, Südtor geöffnet |

**Hundefutter** (`dog-food-item`): Knochen auf Marktstand 2, Weltpos (4.2, 1.08, −4.5). Schwebt + rotiert. Pickup per E/Trigger bei < 1.5m. Setzt `INVENTORY.dogFood = true`. HUD-Slot 🦴.

**Magische Zeichen** (`magic-signs`): Drei Runen (Brunnen, Gasthaus-Vordach, Dampfmaschine). Unsichtbar bis `INVENTORY.dogFood = true`, dann Fade-In per A-Frame-Animation (`startEvents:sign-reveal`). Untersuchen per E/Trigger bei < 2m. HUD-Slot `✦ 0/3`. Positionen:

| Zeichen | Weltpos | ry |
|---------|---------|-----|
| Brunnen | (0, 0.62, 1.90) | 0° |
| Gasthaus-Vordach | (−9, 5.20, 11.58) | 0° |
| Dampfmaschine | (14.65, 1.50, −2.00) | 90° |

**Hund-Fütterung** (in `npcs.js`, `city-life`): dog-special hat goldene Augen (#FFD700, emissiveIntensity 1.5). Retreating bei < 4m Abstand. Nach Fütterung: Fress-Animation (1.5s Kopfnicken, Schwanzwedeln), dann führt Hund den Spieler zu den drei Zeichen.

**Südtor** (`quest1-gate`): Geschlossen bis `QUEST1.signs === 3`. Hint „Finde die drei Zeichen" bei < 3m. Bei Abschluss: Zeichen leuchten weiß auf (1s) → Feen-Partikel (8 Orbs, Farbe #88ffcc) am Tor → Torflügel öffnen (nach 800ms Delay). `QUEST1.completed = true`.

### Schlüssel-System ✅
- Schlüssel bei (−13, 12, 51), Interaktionsradius 2.5m
- Hinweis bei Nähe: „E / Trigger: Aufheben"

### Inventory HUD
- `#inventory-hud` rechts unten, `.inv-slot`-Items mit `has-item`-Klasse
- Slots: 🗝️ (magicKey), 🦴 (dogFood), `✦ 0/3` (signs)
- Persistent: `window.INVENTORY` / In VR ausgeblendet

### Westtor öffnen ✅
- Schloss: 3D-Objekt, goldenes Glühen, schwebend + rotierend
- Barriere: blaue pulsierende Ebene, physisch blockierend
- Mit Schlüssel bei < 5.5m: „E / Trigger: Tor öffnen"
- Sequenz: Aufleuchten (400ms) → Schloss + Barriere weg → Torflügel öffnen
- `window.LICHTREICH_GATE_UNLOCKED = true`

### Multi-Plattform-Input
- Quest 3: rechter Trigger (`triggerdown`)
- Desktop: E-Taste (`keydown KeyE`)
- Mobile: Touch-Button bei Nähe

---

## 8. Navigation & Steuerung

| Plattform | Bewegung | Kamera | Fee ↑ | Fee ↓ |
|-----------|----------|--------|-------|-------|
| Quest 3 | Linker Thumbstick | Rechter Thumbstick Snap 45° | B | A |
| Desktop | WASD | Maus | Space | C |
| Mobile | Linker Joystick | Rechter Joystick | ↑ | ↓ |

- VR-Teleport: Linker Trigger halten → loslassen
- Zielt auf Y=0 (Boden)

---

## 9. UI & Panel

- **Quest 3:** X-Button / **Desktop:** M / **Mobile:** Button unten rechts
- Inhalt: Zone, Tageszeit (nur Kesselstadt), Sound-Toggles

---

## 10. Bekannte TODOs

| Priorität | Was |
|-----------|-----|
| 🔴 Hoch | Gasthaus: Ausgang erst nach `heardTavern = true` freigeben |
| 🔴 Hoch | Schmied-Quest (Quest 2): NPC + Dialog + Mechanik |
| 🟠 Mittel | Lichtreich: Terrain, Kreaturen, Sounds, Quest 3 |
| 🟠 Mittel | old-woman-npc aktivieren (wartet auf Quest-0-Abschluss) |
| 🟡 Niedrig | VR-Teleport trifft nur Y=0 |
| 🟡 Niedrig | aframe-watcher nicht kompatibel mit modularer Struktur |

---

## 11. Entwicklungs-Roadmap

| Phase | Was | Status |
|-------|-----|--------|
| 1–6 | Kesselstadt + Feenreich + UI | ✅ |
| 7a | Kollision Feenreich | ✅ |
| 7b | Diagonale Kartenaufteilung + Grenzmauer | ✅ |
| 7c | Sky-Crossfade + Torflügel-Animation | ✅ |
| 7d | Weise Fee + Feenverwandlung + Flugsteuerung | ✅ |
| 7e | Schlüssel → Inventory → Westtor | ✅ |
| 7f | Pilz-Kappe begehbar + Multi-Plattform-Input | ✅ |
| 8a | Quest 0: Gasthaus-Dialoge (Reisende, Soldat, Kapuze, Gastwirt) | ✅ |
| 8b | Quest 1: Hund + Zeichen + Südtor | ✅ |
| 8c | Gasthaus: Nacht-Modus + Nachtwachen | ✅ |
| 9 | Schmied-Quest (Quest 2) | 🔲 |
| 10 | Lichtreich: Terrain + Kreaturen + Sounds + Quest | 🔲 |
| 11 | Schattenreich + Sturmreich | 🔲 |
| 12 | Mixed Reality Modus | 🔲 |
| 13 | Polish & Optimierung | 🔲 |

---

## 12. Technische Erkenntnisse

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

### Feenverwandlung
- Rig-Scale: 1.0 → 0.22 über 2.8s (easeInOut)
- Kamera-Weltposition bleibt konstant während Skalierung
- `fairy-mode` nutzt `player-collision._getTerrainHeight()` als Bodenlimit

### NPC-Animationen (Three.js direkt)
- Aufstehen / Wegdrehen / Verblassen: `object3D.position/rotation/material` direkt → kein `setAttribute` in Tick
- `material.transparent = true; material.needsUpdate = true` einmalig beim Start der Fade-Phase
- `object3D.traverse` für Opacity-Fade über alle Kindmeshes

### Dialog-Panels
- A-Entity mit Frame-Plane + BG-Plane + a-text, initial `visible:false`
- Kamerazugewandt per `Math.atan2` in tick()
- `startEvents`-Animationen auf Zeichen-Entities statt `setAttribute` in tick

### Allgemeine Erkenntnisse
- Scripts im `<head>`: nie `document.body` direkt – in A-Frame `init()` initialisieren
- `rayOrigin: mouse` für kamera-relative UI-Panels
- Zonenwechsel über Kamera-Weltposition, nicht Rig-Position
- Canvas-Texturen einmalig zeichnen, per Clone wiederverwenden
- Bodenflächen Y-Reihenfolge: Lichtreich 0.003 < Feenreich 0.005 < Schimmer 0.015–0.02
- Diagonale Grenze: `z = −x` / `z = x` – alle Grenzelemente folgen 45°-Prinzip
- Gasthaus-Innenraum: Kollisionsbox beim Eintreten aus `player-collision._boxes` entfernen, beim Verlassen wiederherstellen
