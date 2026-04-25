# ✦ DIE VIER REICHE (KINGDOMS) ✦
## Game Design Document

**Plattform:** Meta Quest 3 (WebXR)  
**Technologie:** A-Frame / Three.js / Web Audio API  
**Genre:** VR Exploration / Fantasy  
**Perspektive:** First Person VR  
**Repository:** https://github.com/challerbachvr/kingdoms  
**Live URL:** https://challerbachvr.github.io/kingdoms  
**Status:** In Entwicklung – Kesselstadt ✅ / Feenreich ✅ / Lichtreich 🔲 (Kulisse) / Mauer ✅

---

## 1. Vision & Konzept

Die Vier Reiche ist eine immersive VR-Fantasiewelt für die Meta Quest 3. Der Spieler erkundet eine zusammenhängende Welt, die aus vier einzigartigen magischen Reichen besteht, die alle von einer zentralen Steampunk-Mittelalterstadt – der Kesselstadt – ausgehen.

Jedes Reich hat eine eigene Atmosphäre, Farbpalette, Kreaturenwelt und Soundlandschaft. Die Welt ist nicht linear – der Spieler kann frei erkunden und zwischen den Reichen wechseln.

### Kernprinzipien
- Freie Erkundung ohne festes Ziel
- Jede Zone erzählt ihre Geschichte durch Umgebung und Atmosphäre
- Lebendige Welt: Kreaturen, Wind, Wasser, Tag/Nacht-Wechsel
- Intuitive VR-Navigation mit Controller-Interaktion
- Unterstützung für VR (Quest 3), Desktop (WASD) und Mobile (Touch-Joysticks)

---

## 2. Weltstruktur

Die Welt ist als **Kreuz-Dreieck-Karte** aufgebaut. Im Zentrum liegt die Kesselstadt als Quadrat (|x| ≤ 28, |z| ≤ 28). Die vier Reiche erstrecken sich als Dreiecke diagonal nach außen bis zum Kartenrand (≈ 120 Einheiten).

```
              [ Sturmreich 🐉 ]
             /                 \
            /   -z > |x|        \
           /                     \
[ Lichtreich ] ──[ KESSELSTADT ]──[ Schattenreich ]
  -x > |z|  \                   /   x > |z|
              \   z > |x|      /
               \               /
              [ Feenreich 🍄 ]
```

Die **Grenzen** verlaufen diagonal (45°) von den Ecken der Kesselstadt (±28, 0, ±28) bis zum Kartenrand. Jede Grenze wird durch ein Landschaftselement markiert (z. B. Mauer zwischen Feenreich und Lichtreich).

### Zonenerkennung (Kameraposition)

| Zone | Bedingung |
|------|-----------|
| Kesselstadt | \|x\| ≤ 28 **und** \|z\| ≤ 28 |
| Feenreich (Süd) | z > \|x\| |
| Sturmreich (Nord) | −z > \|x\| |
| Lichtreich (West) | −x > \|z\| |
| Schattenreich (Ost) | x > \|z\| |

Koordinatensystem: +X = Ost, −X = West, +Z = Süd, −Z = Nord.

### Übersicht der Zonen

| Zone | Stil | Atmosphäre | Status |
|------|------|------------|--------|
| 🏙️ Kesselstadt | Steampunk-Mittelalter | Belebt, laut, geschäftig | ✅ Fertig |
| 🍄 Feenreich | Magisch, bunt | Märchenhaft & lebendig | ✅ Terrain + Leben + Sounds |
| 🌟 Lichtreich | Hell & kristallin | Magisch, schwebend | 🔲 Kulisse in Arbeit |
| 🌑 Schattenreich | Dunkel & mystisch | Nebel, Mondlicht | 🔲 Geplant |
| 🐉 Sturmreich | Episch & dramatisch | Gewitter, Burgen | 🔲 Geplant |

### Zonenwechsel & Übergänge
- **Feenreich:** Himmels-Crossfade über 22 Einheiten ab z=28 (Kesselstadt-Tor bis tief im Feenreich). Sound/Licht-Wechsel bei 50 % des Übergangs.
- **Lichtreich:** Himmels-Crossfade über 30 Einheiten ab der Diagonalgrenze. Licht und Nebel werden kontinuierlich interpoliert.
- Beide Zonen nutzen eine zweite, transparente Sphäre (`#sky-overlay`, r=4800) als Overlay. Die Sphäre blendet schrittweise von Opacity 0 → 1 ein; bei voller Immersion wechselt die Hauptsphäre (`#sky-sphere`) und das Overlay verschwindet.
- 4-Sekunden Audio-Crossfade zwischen den Zonen
- Grenzen für Sturmreich und Schattenreich folgen demselben Diagonalprinzip

---

## 3. Die Kesselstadt (Zentrum) ✅

### Atmosphäre
- Belebt und laut – die Stadt lebt rund um die Uhr
- Tag/Nacht-Wechsel per UI steuerbar (Morgen / Tag / Abend / Nacht)
- Tagsüber: warmes goldenes Licht, Marktschreier, Dampfpfeifen
- Nachts: Gaslaternen, Sterne, ruhigere aber immer noch aktive Stadt

### Architektur & Elemente
- Kopfsteinpflaster-Straßen (prozedurale Canvas-Textur)
- 4 Hauptgebäude mit echten Satteldächern:
  - Schmied (SW) – 39.2° Neigung, Terrakotta-Ziegel
  - Händlerhaus (SO) – 48° Neigung, Sandstein-Ziegel
  - Gasthaus (NW) – 42.8° Neigung, breiter Grundriss
  - Alchemistenladen (NO) – 39.2° Neigung, mit Rundturm
- Steinmauer-Texturen an allen Gebäuden und Mauern
- Vollständige Stadtmauer mit 4 Toren (N/S/O/W) und 4 Ecktürmen
- Zinnen an allen Mauerabschnitten und Toren
- Zentraler Brunnen auf dem Marktplatz
- Dampfbetriebene Maschinen und Zahnradkonstruktionen
- Heißluftballon am Himmel
- Gaslaternen
- Marktbuden mit Holztexturen

### Fenster
- Einheitliche Bernstein-Farbe (#f5c842) an allen Gebäuden
- Abends: emissiveIntensity 0.55 (warmes Leuchten von innen)
- Nachts: emissiveIntensity 1.0 (helles Leuchten)

### Prozeduraler Himmel
- 4 Modi: Morgen / Tag / Abend / Nacht
- Gradient mit Sonne/Mond/Sternen und prozeduralen Wolken
- Wechselt automatisch mit Tageszeit-UI

### Stadtleben
- 9 NPCs mit stilisierten Figuren, 9 verschiedene Kleidungsfarben
- Patrol-System mit 28 Wegpunkten über Marktplatz und Gassen
- NPCs und Tiere spawnen nie in Gebäuden oder Hindernissen (gefilterter Spawn)
- 3 Hunde (Golden Retriever), 2 Katzen, 6 Hühner, 13 Vögel in 2 Schwärmen

### Prozedurale Sounds (Web Audio API)
- Tagsüber: Stimmengewirr, Dampfpfeifen, Zahnrad-Klingen, Schmiedehammer
- Nachts: Feuerknistern, Wind, Eulenrufe
- Sanfter 4-Sekunden Crossfade zwischen Tag und Nacht

### Tore & Öffnungslogik
- **Südtor** (→ Feenreich): öffnet sich automatisch bei Annäherung (Radius 5.5 m), schließt bei Entfernung. Zwei Holzflügel, 1.6 s öffnen / 1.4 s schließen.
- **Westtor** (→ Lichtreich): gesperrt durch magisches Schloss + Barriere (siehe Abschnitt 6). Öffnet sich dauerhaft nach Benutzung des magischen Schlüssels.
- **Nordtor** (→ Sturmreich) und **Osttor** (→ Schattenreich): offen, keine Mechanik bisher.

### Kollisionserkennung
- AABB-Boxen für Gebäude, Mauern und Sonderobjekte
- Kreise für Türme, Brunnen und runde Strukturen
- Uhrturm-Fußabdruck als separater AABB-Eintrag (4.5 × 4.5 m, z. B. `x0:−16.25, x1:−11.75`)
- Torlücken (Radius ≤ 3 m um Tormitte) korrekt freigelassen
- Dynamische Kollisionsbox: Lichtreich-Barriere (x=−29..−27, z=−2.5..2.5) wird bei Tor-Öffnung entfernt

---

## 4. Das Feenreich ✅

### Farbstimmung & Atmosphäre
- Bunt & schillernd – Violett/Pink/Pastelltöne
- Prozeduraler Himmel: Violett→Pink→Pfirsich-Gradient
- 4 Aurora-Bänder, 280 Sterne, 2 magische Monde
- Weiches diffuses Licht – lila Ambient + rosa Sonnenlicht

### Landschaft
- Sanft hügelige Wiese mit Pastellfarben
- 5 Hügel (kugelförmige Heightmap, teilweise versenkt)
- 5 Riesenpilze, 10 kleine Pilze
- 3 Riesenbäume mit Feendörfern in den Wurzeln
- Kristallklarer Bach mit animiertem Wasser
- 11 leuchtende Blumen

### Riesenpilz 1 – Schlüsselpilz (Türkis) ✅
- Position: (−13, 0, 51) — erster Pilz nach dem Südtor
- Stamm: Zylinder r=0.9, Höhe 8 m
- Kappe: oblates Ellipsoid (r=5.5, scale-y=0.44) — Spitze bei y≈11.42
- **Begehbarkeit:** Ellipsoid-Heightmap in `_getTerrainHeight` — Spieler (als Fee) kann auf der Kappe landen und stehen
- **Schlüssel:** schwebt bei (−13, 12, 51), goldenes Glühen, rotierend, mit 7 Glitzer-Orbs
- **Interaktion:** Spieler muss als Fee auf der Kappe landen und E/Trigger/Touch drücken

### Prozedurale Texturen
- `fee-grass`: Pastellgrün mit 500 Grashalmen
- `fee-mushcap`: Organische Blobs, Spiralen, Glitzerpunkte
- `fee-bark`: Holzmaserung mit Moos-Tint
- `fee-foliage`: Blattwerk mit magischen Glows
- `fee-moss`: Erde mit Moos und Kieselsteinen
- `fee-water`: Schimmernde Wellen mit animiertem UV-Offset

### Kreaturen
- 3 Feenschwärme (Gold/Blau/Grün), je 4 Feen mit Schwarm-KI
- 3 weiße Hasen, 2 Füchse, 5 Schmetterlinge (Lissajous-Bahnen)
- 3 halbtransparente Geistwesen mit pulsierender Opacity
- Alle Tiere flüchten wenn Spieler zu nah kommt

### Die Weise Fee (NPC) ✅
- Erscheint im Feenreich nahe dem Eingang (~5–10 m vom Südtor)
- Weißes Haar, lila Robe, goldene Krone, Zauberstab
- Läuft frei zwischen 10 Wegpunkten (Schwarm-ähnliche Patrol-KI)
- Dreht sich dem Spieler zu wenn dieser näherkommt (< 3.5 m)
- **Dialog-Panel** erscheint bei Nähe (< 3 m): „Möchtest du mit Feenstaub bestäubt werden?"
  - **Ja** → Feenstaub-Verwandlung
  - **Nein** → Dialog schließt sich, Fee läuft weiter

### Prozedurale Sounds
- Magisches Grundrauschen, Feen-Zwitschern, Bach-Plätschern
- Kristall-Summen, magischer Vogelgesang, Insekten-Summen
- 4-Sekunden Crossfade von/zu Kesselstadt-Sounds

---

## 5. Die Grenzmauer: Feenreich ↔ Lichtreich ✅

### Lage & Aufbau
Die Mauer verläuft **diagonal (SW-Richtung)** von der SW-Ecke der Kesselstadt (−28, 0, 28) bis zum SW-Kartenrand (−84, 0, 84). Sie folgt exakt der Zonengrenze `z = −x`.

- Zwei Mauerebenen (Lichtreich-Seite: grau/Stein, Feenreich-Seite: weiß/organisch)
- Drei Rundbastone: am Kesselstadt-Eck, in der Mitte und am Kartenrand
- Oberer Steg (begehbar, diagonal)
- Kristall-Ornamente auf Lichtreich-Seite
- Feenwurzeln, die von der Feenreich-Seite in/durch die Mauer wachsen

### Die Wurzelgrenze *(Narrative)*
Das Feenreich kann seine Naturmagie nicht vollständig eindämmen. Moos, Gras und leuchtende Feenpflanzen wachsen auf der **Lichtreich-Seite** der Mauer — dicht und üppig unmittelbar an der Mauer, mit zunehmender Distanz immer blasser werdend.

**Bedeutung:** Vor dem Bau der Mauer war dieser Bereich gemeinschaftliches Territorium. Die Natur "erinnert sich" und wächst trotz Mauer durch die Fugen. Das Lichtreich toleriert es — ein stiller Hinweis auf die alte Verbindung der beiden Reiche.

**Visuell:**
- 0–3 Einheiten NW der Mauer: dichtes grünes Moos (Opacity 0.75–0.82)
- 4–8 Einheiten NW: lichteres Moos und Grastupfen (Opacity 0.45–0.55)
- 9–15 Einheiten NW: blasse Feenspuren (Opacity 0.22–0.28)
- Vereinzelte leuchtende Feenpflanzen (grün + violett, mit Emissive-Glow)

### Künftige Grenzmauern
Gleiche Diagonallogik für:
- Lichtreich ↔ Sturmreich (NW-Diagonale, von (−28,−28) nach (−84,−84))
- Sturmreich ↔ Schattenreich (NO-Diagonale, von (28,−28) nach (84,−84))
- Schattenreich ↔ Feenreich (SO-Diagonale, von (28,28) nach (84,84))

---

## 6. Story-Mechanik: Feenstaub & Lichtreich-Tor ✅

### Überblick
Eine lineare Story-Sequenz verbindet Feenreich und Lichtreich. Der Spieler muss fünf Schritte abschließen:

```
Kesselstadt → Feenreich → Weise Fee → Verwandlung → Pilz → Schlüssel → Westtor → Lichtreich
```

### Schritt 1 – Feenstaub-Verwandlung ✅
- Spieler spricht mit der **Weisen Fee** im Feenreich (Dialog-Panel)
- Bei Zustimmung: **Verwandlungsanimation** (2.8 s, easeInOut Scale 1.0 → 0.22)
- Spieler wird zur Fee: Rig-Scale 0.22, **große Flügel** erscheinen (lila, transparent)
- **Magischer Schweif** (12 Orbs im Ringpuffer) folgt der Bewegung
- Feenmodus bleibt dauerhaft aktiv (kein Zurücksetzen)
- Spieler bleibt nach Verwandlung im Feenreich (kein Zone-Revert trotz Skalierung)

### Schritt 2 – Fliegen ✅
Als Fee kann der Spieler vertikal fliegen:

| Plattform | Steigen | Sinken |
|-----------|---------|--------|
| Quest 3 | B-Button (rechts) | A-Button (rechts) |
| Desktop | Space | C |
| Mobile | Touch-Button ↑ (rechts unten) | Touch-Button ↓ (rechts unten) |

- Horizontale Bewegung: weiterhin über Thumbstick/WASD/Joystick
- Gravitation: Fee sinkt langsam wenn kein Input, landet auf Terrain/Pilzkappe
- Höhenbegrenzung: 0 m (Boden) bis 30 m (max. Flughöhe)
- Terrain-Kollision gilt auch im Flugmodus: Fee landet auf Pilzkappen und Feenhügeln

### Schritt 3 – Magischer Schlüssel ✅
- **Fundort:** auf Pilz 1 (Türkis, −13, 12, 51), schwebend über der Kappenspitze
- **Erreichbar:** als Fee auf die Kappe fliegen und landen (Ellipsoid-Heightmap trägt den Spieler)
- **Flugsteuerung im Feenreich:** Stamm-Kollision deaktiviert wenn Fee > 1 m über Boden
- **Hinweis-Panel** erscheint bei Nähe (< 2.5 m): „E / Trigger: Aufheben"
- **Interaktion:** E-Taste / Trigger / Touch-Button → Schlüssel verschwindet

### Schritt 4 – Inventory ✅
- **HTML-HUD** rechts unten: `#inventory-hud` mit Slot-Icon 🗝️
- Leerer Slot: gedimmt (opacity 0.40, matter Rahmen)
- Schlüssel vorhanden: leuchtet auf (opacity 1.0, goldener Glow)
- Persistent über alle Zonenwechsel der Session (`window.INVENTORY.magicKey`)
- In VR: HUD blendet sich bei `enter-vr` aus, bei `exit-vr` wieder ein

### Schritt 5 – Lichtreich-Tor öffnen ✅
- Das **Westtor** der Kesselstadt ist dauerhaft gesperrt solange der Spieler keinen Schlüssel hat:
  - **Sichtbares 3D-Schloss** (goldenes Glühen, schwebend + rotierend) vor der Stadtmauer-Innenseite
  - **Magische Barriere** (blaue pulsierende Ebene) blockiert den Torweg physisch
- Bei Annäherung **mit Schlüssel** (< 5.5 m): Hinweis-Panel „E / Trigger: Tor öffnen"
- **Öffnungssequenz:**
  1. Schloss und Barriere leuchten weiß auf (400 ms)
  2. Beide verschwinden aus der Szene
  3. Kollisionsbox der Barriere wird entfernt
  4. Beide Torflügel öffnen sich (gate-open Animation)
  5. Tor bleibt **dauerhaft offen** für den Rest der Session
- `window.LICHTREICH_GATE_UNLOCKED = true` verhindert erneutes Schließen

### Multi-Plattform-Interaktionen ✅
Alle Story-Interaktionen (Schlüssel aufheben, Tor öffnen) funktionieren auf:
- **Quest 3:** rechter Trigger (`triggerdown`)
- **Desktop:** E-Taste (`keydown KeyE`)
- **Mobile:** Touch-Button erscheint bei Nähe, verschwindet nach Interaktion

---

## 7. Navigation & Steuerung

| Plattform | Bewegung | Kamera | Fee steigen | Fee sinken |
|-----------|----------|--------|-------------|------------|
| Quest 3 | Linker Thumbstick | Rechter Thumbstick (Snap 45°) | B-Button | A-Button |
| Desktop | WASD | Maus | Space | C |
| Mobile | Linker Touch-Joystick | Rechter Touch-Joystick | ↑ Button | ↓ Button |

### VR-Teleport
- Linker Trigger gedrückt halten: parabolischer Zielbogen
- Linken Trigger loslassen: teleportiert zum Zielpunkt
- Zielt nur auf Y=0 (Bodenebene) — Spieler wird danach von Terrain-Höhe (Hügel, Pilzkappe) angehoben

---

## 8. UI & Panel

### Öffnen/Schließen
- **Quest 3:** X-Button am linken Controller
- **Desktop:** Taste `M`
- **Mobile:** Schwebender Button unten rechts

### Panel-Inhalt
- Aktive Zone wird angezeigt
- Tageszeit: Morgen / Tag / Abend / Nacht (nur Kesselstadt)
- Sound Kesselstadt: An/Aus
- Sound Feenreich: An/Aus

### Inventory HUD
- Festes HTML-Element rechts unten (`#inventory-hud`)
- Slot `#inv-key-slot` zeigt 🗝️ — gedimmt wenn leer, leuchtend wenn Schlüssel vorhanden
- Wird in VR ausgeblendet (kein 2D-Overlay in VR-Modus)

---

## 9. Mixed Reality Modus (Geplant)

> 📌 Wird nach Fertigstellung der VR-Welt eingebaut.

- Feen im echten Zimmer
- Portale in die vier Reiche an echten Wänden
- Magische Objekte auf echten Flächen
- Atmosphärische Partikeleffekte im Zimmer
- Per UI-Knopf zwischen VR und MR umschaltbar

---

## 10. Geschichte & Narrative (Geplant)

> 📌 Wird nach Fertigstellung der visuellen Welt ausgearbeitet.

- Environmental Storytelling
- NPC-Dialoge
- Questgegenstände (Tagebuchseiten, Kristalle)
- Narrative UI beim Zonenbetreten

---

## 11. Bekannte TODOs

| Priorität | Was |
|-----------|-----|
| 🟠 Mittel | Lichtreich: Inhalte (Terrain, Kreaturen, Sounds) fehlen noch |
| 🟡 Niedrig | aframe-watcher funktioniert nicht mit modularer Struktur |
| 🟡 Niedrig | VR-Teleport trifft nur Y=0, nicht erhöhte Plattformen direkt |

---

## 12. Dateistruktur

```
kingdoms/
├── index.html              (Schlanker Einstiegspunkt, ~65 Zeilen)
├── GDD.md                  (dieses Dokument)
├── js/
│   ├── textures.js         (prozedurale Canvas-Texturen)
│   ├── sounds.js           (Web Audio Sound-Engine)
│   ├── daynight.js         (Tag/Nacht + Steampunk-Animationen)
│   ├── navigation.js       (Bewegung, Kollision, Terrain-Höhe)
│   ├── npcs.js             (NPCs, Tiere, Vögel – mit Spawn-Kollisionsfilter)
│   ├── feenreich-creatures.js  (Feenschwärme, Hasen, Füchse, Schmetterlinge)
│   ├── touch-controls.js   (Mobile Touch-Joysticks)
│   ├── ui-panel.js         (Info-Panel, Tageszeit, Sound-Toggles)
│   ├── fairy-transform.js  (Weise Fee NPC + Feenverwandlung + Flugsteuerung)
│   └── key-system.js       (Magischer Schlüssel + Inventory HUD + Lichtreich-Tor)
└── scenes/
    ├── kesselstadt.js      (Kesselstadt HTML + gate-trigger)
    ├── feenreich.js        (Feenreich Terrain + Kreaturen + Sounds)
    └── lichtreich.js       (Lichtreich Kulisse)
```

---

## 13. Entwicklungs-Roadmap

| Phase | Was | Status |
|-------|-----|--------|
| 1 | Leveldesign & GDD | ✅ |
| 2 | Setup (VS Code, GitHub, Quest) | ✅ |
| 3 | Kesselstadt komplett | ✅ |
| 4 | Feenreich Terrain + Texturen | ✅ |
| 5 | Feenreich Kreaturen + Sounds | ✅ |
| 6 | UI Panel | ✅ |
| 7 | Kollision Feenreich | ✅ |
| 7b | Diagonale Kartenaufteilung + Grenzmauer Feenreich/Lichtreich | ✅ |
| 7c | Wurzelgrenze Narrative (Moos/Pflanzen auf Lichtreich-Seite) | ✅ |
| 7d | Sky-Crossfade + Torflügel mit Öffnungsanimation | ✅ |
| 7e | Weise Fee NPC + Feenverwandlung + Flugsteuerung | ✅ |
| 7f | Story-Mechanik: Schlüssel → Inventory → Lichtreich-Tor | ✅ |
| 7g | Pilz-1-Kappe begehbar (Ellipsoid-Heightmap) + Fee-Landung | ✅ |
| 7h | Multi-Plattform-Input (Quest/Desktop/Mobile) für alle Interaktionen | ✅ |
| 8 | Lichtreich: Terrain, Kreaturen, Sounds | 🔲 |
| 9 | Sturmreich, Schattenreich (Kulissen + Inhalte) | 🔲 |
| 10 | Mixed Reality Modus | 🔲 |
| 11 | Geschichte & Narrative (Dialoge, Quests) | 🔲 |
| 12 | Polish & Optimierung | 🔲 |

---

## 14. Technische Hinweise & Erkenntnisse

### Performance-Regeln Quest 3
- shader:flat wo möglich
- Kugeln max. 10×5, Zylinder max. 8 radial
- Texturen max. 512×512px
- Max. 9 aktive Punktlichter
- Kein setAttribute in Tick-Schleifen
- dt auf 50ms begrenzen

### Kollisionssystem
- `player-collision` Komponente auf `<a-scene>`: prüft jeden Frame Kamera-Weltposition
- **Kreise** (`_circles`, `_feenCircles`): radiale Ausstoßung für runde Objekte
- **Boxen** (`_boxes`): AABB minimaler Ausstoß — dynamisch erweiterbar (z. B. Lichtreich-Barriere)
- **Terrain-Höhe** (`_getTerrainHeight`): feenHills (versenkte Kugeln) + feenMushroomCaps (Ellipsoide)
- Im Feenmodus (`fairy-mode` aktiv, rig.y > 1 m): `_feenCircles` werden übersprungen → freies Fliegen

### Feenverwandlung – Technische Details
- Rig-Scale wird über 2.8 s von 1.0 auf 0.22 interpoliert (easeInOut)
- Während Skalierung: Kamera-Weltposition bleibt konstant (Rig-XZ wird nachgeführt)
- `player-collision` übernimmt Y-Kontrolle im Normalmodus; `fairy-mode` übernimmt Y im Feenmodus
- `fairy-mode` ruft `player-collision._getTerrainHeight()` auf als Bodenlimit

### Wichtige Erkenntnisse
- Scripts im `<head>` nie direkt `document.body` ansprechen – in A-Frame `init()` initialisieren
- aframe-watcher funktioniert nur mit einzelner index.html
- `rayOrigin: mouse` für kamera-relative UI-Panels verwenden
- Zonenwechsel über Kamera-Weltposition prüfen, nicht Rig-Position
- Canvas-Texturen einmalig zeichnen, per Clone wiederverwenden
- `AFRAME.registerGeometry` mit custom `THREE.ShapeGeometry` überträgt Texturen via `tex`-Component nicht zuverlässig → `<a-plane>` mit Y-Schichtung bevorzugen
- Bodenflächen-Y-Reihenfolge: Lichtreich 0.003 < Feenreich 0.005/0.006 < Schimmer 0.015–0.02
- Diagonale Zonengrenze `z = −x` (SW) / `z = x` (NW) etc. — alle künftigen Grenzelemente folgen diesem 45°-Prinzip
- Oblates Ellipsoid für Pilzkappe: `capY = cy + b × √(1 − d²/a²)` — einfach in `_getTerrainHeight` integrierbar
