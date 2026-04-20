# ✦ DIE VIER REICHE (KINGDOMS) ✦
## Game Design Document

**Plattform:** Meta Quest 3 (WebXR)  
**Technologie:** A-Frame / Three.js / Web Audio API  
**Genre:** VR Exploration / Fantasy  
**Perspektive:** First Person VR  
**Repository:** https://github.com/challerbachvr/kingdoms  
**Live URL:** https://challerbachvr.github.io/kingdoms  
**Status:** In Entwicklung – Kesselstadt ✅ / Feenreich ✅ (Terrain + Leben + Sounds)

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

Die Welt ist kreisförmig aufgebaut. Im Zentrum liegt die Kesselstadt. Von dort führen vier Wege in die vier Reiche.

```
        [ Sturmreich 🐉 ]
               ↑
[ Lichtreich 🌟 ] ← KESSELSTADT → [ Schattenreich 🌑 ]
               ↓
        [ Feenreich 🍄 ] ← AKTIV
```

### Übersicht der Zonen

| Zone | Stil | Atmosphäre | Status |
|------|------|------------|--------|
| 🏙️ Kesselstadt | Steampunk-Mittelalter | Belebt, laut, geschäftig | ✅ Fertig |
| 🍄 Feenreich | Magisch, bunt | Märchenhaft & lebendig | ✅ Terrain + Leben + Sounds |
| 🌟 Lichtreich | Hell & kristallin | Magisch, schwebend | 🔲 Kulisse geplant |
| 🌑 Schattenreich | Dunkel & mystisch | Nebel, Mondlicht | 🔲 Kulisse geplant |
| 🐉 Sturmreich | Episch & dramatisch | Gewitter, Burgen | 🔲 Kulisse geplant |

### Zonenwechsel
- Übergang Kesselstadt → Feenreich bei z > 33
- Automatischer Himmel-, Licht- und Sound-Wechsel beim Betreten
- 4-Sekunden Audio-Crossfade zwischen den Zonen

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
- 3 Hunde, 2 Katzen, 6 Hühner, 13 Vögel in 2 Schwärmen

### Prozedurale Sounds (Web Audio API)
- Tagsüber: Stimmengewirr, Dampfpfeifen, Zahnrad-Klingen, Schmiedehammer
- Nachts: Feuerknistern, Wind, Eulenrufe
- Sanfter 4-Sekunden Crossfade zwischen Tag und Nacht

### Kollisionserkennung
- AABB-Boxen für Gebäude und Mauern
- Kreise für Türme und Brunnen
- Torlücken korrekt freigelassen

---

## 4. Das Feenreich ✅

### Farbstimmung & Atmosphäre
- Bunt & schillernd – Violett/Pink/Pastelltöne
- Prozeduraler Himmel: Violett→Pink→Pfirsich-Gradient
- 4 Aurora-Bänder, 280 Sterne, 2 magische Monde
- Weiches diffuses Licht – lila Ambient + rosa Sonnenlicht

### Landschaft
- Sanft hügelige Wiese mit Pastellfarben
- 5 Hügel, 5 Riesenpilze, 10 kleine Pilze
- 3 Riesenbäume mit Feendörfern in den Wurzeln
- Kristallklarer Bach mit animiertem Wasser
- 11 leuchtende Blumen

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

### Prozedurale Sounds
- Magisches Grundrauschen, Feen-Zwitschern, Bach-Plätschern
- Kristall-Summen, magischer Vogelgesang, Insekten-Summen
- 4-Sekunden Crossfade von/zu Kesselstadt-Sounds

---

## 5. Navigation & Steuerung

| Plattform | Bewegung | Kamera |
|-----------|----------|--------|
| Quest 3 | Linker Thumbstick (Smooth) | Rechter Thumbstick (Snap 45°) |
| Desktop | WASD | Maus |
| Mobile | Linker Touch-Joystick | Rechter Touch-Joystick |

---

## 6. UI & Panel

### Öffnen/Schließen
- **Quest 3:** Menu-Button (Options) am linken Controller
- **Desktop:** Taste `M`
- **Mobile:** Schwebender Button unten rechts

### Panel-Inhalt
- Aktive Zone wird angezeigt
- Tageszeit: Morgen / Tag / Abend / Nacht (nur Kesselstadt)
- Sound Kesselstadt: An/Aus
- Sound Feenreich: An/Aus

---

## 7. Mixed Reality Modus (Geplant)

> 📌 Wird nach Fertigstellung der VR-Welt eingebaut.

- Feen im echten Zimmer
- Portale in die vier Reiche an echten Wänden
- Magische Objekte auf echten Flächen
- Atmosphärische Partikeleffekte im Zimmer
- Per UI-Knopf zwischen VR und MR umschaltbar

---

## 8. Geschichte & Narrative (Geplant)

> 📌 Wird nach Fertigstellung der visuellen Welt ausgearbeitet.

- Environmental Storytelling
- NPC-Dialoge
- Questgegenstände (Tagebuchseiten, Kristalle)
- Narrative UI beim Zonenbetreten

---

## 9. Bekannte TODOs

| Priorität | Was |
|-----------|-----|
| 🔴 Mittel | Kollision Feenreich (Pilze, Bäume) |
| 🟡 Niedrig | aframe-watcher funktioniert nicht mit modularer Struktur |

---

## 10. Dateistruktur

```
kingdoms/
├── index.html              (64 lines – schlanker Einstiegspunkt)
├── GDD.md                  (dieses Dokument)
├── js/
│   ├── textures.js         (prozedurale Canvas-Texturen)
│   ├── sounds.js           (Web Audio Sound-Engine)
│   ├── daynight.js         (Tag/Nacht + Steampunk-Animationen)
│   ├── navigation.js       (Bewegung + Kollision)
│   └── npcs.js             (NPCs, Tiere, Vögel)
└── scenes/
    ├── kesselstadt.js      (Kesselstadt: HTML + UI)
    └── feenreich.js        (Feenreich: Terrain + Kreaturen + Sounds)
```

---

## 11. Entwicklungs-Roadmap

| Phase | Was | Status |
|-------|-----|--------|
| 1 | Leveldesign & GDD | ✅ |
| 2 | Setup (VS Code, GitHub, Quest) | ✅ |
| 3 | Kesselstadt komplett | ✅ |
| 4 | Feenreich Terrain + Texturen | ✅ |
| 5 | Feenreich Kreaturen + Sounds | ✅ |
| 6 | UI Panel | ✅ |
| 7 | Kollision Feenreich | 🔲 |
| 8 | Drei Kulissen-Reiche | 🔲 |
| 9 | Mixed Reality Modus | 🔲 |
| 10 | Geschichte & Narrative | 🔲 |
| 11 | Polish & Optimierung | 🔲 |

---

## 12. Technische Hinweise & Erkenntnisse

### Performance-Regeln Quest 3
- shader:flat wo möglich
- Kugeln max. 10×5, Zylinder max. 8 radial
- Texturen max. 512×512px
- Max. 9 aktive Punktlichter
- Kein setAttribute in Tick-Schleifen
- dt auf 50ms begrenzen

### Wichtige Erkenntnisse
- Scripts im `<head>` nie direkt `document.body` ansprechen – in A-Frame `init()` initialisieren
- aframe-watcher funktioniert nur mit einzelner index.html
- `rayOrigin: mouse` für kamera-relative UI-Panels verwenden
- Zonenwechsel über Kamera-Weltposition prüfen, nicht Rig-Position
- Canvas-Texturen einmalig zeichnen, per Clone wiederverwenden
