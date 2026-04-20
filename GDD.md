# ✦ DIE VIER REICHE (KINGDOMS) ✦
## Game Design Document

**Plattform:** Meta Quest 3 (WebXR)  
**Technologie:** A-Frame / Three.js  
**Genre:** VR Exploration / Fantasy  
**Perspektive:** First Person VR  
**Status:** In Entwicklung – Technische Umsetzung  

---

## 1. Vision & Konzept

Die Vier Reiche ist eine immersive VR-Fantasiewelt für die Meta Quest 3. Der Spieler erkundet eine zusammenhängende Welt, die aus vier einzigartigen magischen Reichen besteht, die alle von einer zentralen Steampunk-Mittelalterstadt – der Kesselstadt – ausgehen.

Jedes Reich hat eine eigene Atmosphäre, Farbpalette, Kreaturenwelt und Soundlandschaft. Die Welt ist nicht linear – der Spieler kann frei erkunden und zwischen den Reichen wechseln.

### Kernprinzipien
- Freie Erkundung ohne festes Ziel
- Jede Zone erzählt ihre Geschichte durch Umgebung und Atmosphäre
- Lebendige Welt: Kreaturen, Wind, Wasser, Tag/Nacht-Wechsel
- Intuitive VR-Navigation mit Controller-Interaktion

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
| 🏙️ Kesselstadt | Steampunk-Mittelalter | Belebt, laut, geschäftig | ✅ Aktiv |
| 🍄 Feenreich | Magisch, bunt | Märchenhaft & lebendig | ✅ Aktiv (Hauptzone) |
| 🌟 Lichtreich | Hell & kristallin | Magisch, schwebend | 🔲 Kulisse |
| 🌑 Schattenreich | Dunkel & mystisch | Nebel, Mondlicht | 🔲 Kulisse |
| 🐉 Sturmreich | Episch & dramatisch | Gewitter, Burgen | 🔲 Kulisse |

---

## 3. Die Kesselstadt (Zentrum)

Die Kesselstadt ist der Ausgangspunkt aller Erkundungen. Sie verbindet mittelalterliche Architektur mit Steampunk-Technologie – Zahnräder und Dampfmaschinen neben Türmen aus Stein.

### Atmosphäre
- Belebt und laut – die Stadt lebt rund um die Uhr
- Tag/Nacht-Wechsel per UI steuerbar
- Tagsüber: warmes goldenes Licht, Marktschreier, Dampfpfeifen
- Nachts: Gaslaternen, Sterne, ruhigere aber immer noch aktive Stadt

### Architektur & Elemente
- Kopfsteinpflaster-Straßen und mittelalterliche Gebäude
- Dampfbetriebene Maschinen und Zahnradkonstruktionen
- Luftschiffe die am Himmel kreuzen
- Marktplatz als zentraler Treffpunkt
- Vier große Stadttore – je eines in Richtung der vier Reiche (Nord/Süd/Ost/West)
- Uhrtürme mit sichtbaren Zahnrädern

### Sounds
- Dampfpfeifen und Maschinengeräusche
- Marktschreier und Stimmengewirr
- Metallisches Klingen von Zahnrädern
- Nachts: ruhigeres Ambiente, Eulenrufe, Laternen-Knistern

---

## 4. Das Feenreich (Hauptzone)

Das Feenreich ist die erste vollständig ausgearbeitete Zone. Es ist eine lebendige, bunte und magische Welt – ein Mix aus verschiedenen Landschaftselementen, bevölkert von Feen, Tieren und Geistwesen.

### Farbstimmung & Atmosphäre
- Bunt & schillernd – viele Farben gleichzeitig
- Magisches Leuchten von Pflanzen, Kristallen und Kreaturen
- Weiche, diffuse Beleuchtung ohne harte Schatten
- Schimmernde Partikeleffekte in der Luft

### Landschaft

#### Riesige Pilze
- Verschiedene Größen – von hüfthohen bis turmhohen Exemplaren
- Leuchtende Spots und Muster auf den Kappen
- Farben: Türkis, Magenta, Orange, Violett, Goldgelb

#### Feen-Dörfer in Baumwurzeln
- Kleine Siedlungen versteckt in den Wurzeln riesiger Bäume
- Winzige Türen, Fenster mit warmem Licht
- Brücken aus geflochtenen Ranken zwischen den Wurzeln
- Laternen aus getrockneten Pilzen

#### Offene Wiese
- Zentrales Element – verbindet alle Landschaftsteile
- Wogendes Gras in Pastellfarben (Hellgrün, Rosa, Hellblau)
- Magische Blumen die sich langsam öffnen und schließen
- Kristallklarer Bach der durch die Wiese fließt

### Kreaturen

#### Kleine Feen
- Fliegen in Schwärmen durch die Luft
- Hinterlassen leuchtende Partikelspuren
- Reagieren auf die Anwesenheit des Spielers – neugierig aber scheu
- Verschiedene Farben: Goldene, Blaue, Grüne Feen

#### Freundliche Tiere
- Weiße Hasen mit leuchtenden Augen
- Füchse mit schimmerndem Fell
- Große bunte Schmetterlinge
- Tiere flüchten langsam wenn man zu nah kommt

#### Mysteriöse Geistwesen
- Halbtransparente Erscheinungen die durch den Wald gleiten
- Reagieren nicht auf den Spieler – ruhig und friedlich
- Erscheinen hauptsächlich in der Dämmerung

### Sounds
- Glockenhelles Feen-Zwitschern
- Sanftes Wasserrauschen des Bachs
- Magisches Summen der Kristalle
- Vogelgesang in ungewöhnlichen Tonlagen
- Windgeräusche die durch die Pilze pfeifen

---

## 5. UI & Interaktion

Die Benutzeroberfläche ist als In-World-Panel gestaltet – ein schwebendes Menü das der Spieler mit dem Controller bedienen kann.

### Haupt-Menü Panel
- **Position:** Schwebt vor dem Spieler, per Knopf ein-/ausblendbar
- **Interaktion:** Controller zeigen + Trigger drücken
- **Design:** Holografisch, passend zur jeweiligen Zone

### Menü-Funktionen
- 🌅 Tageszeit ändern: Morgen / Mittag / Abend / Nacht
- 🌦️ Wetter: Sonnig / Bewölkt / Regen / Magischer Nebel
- 🗺️ Zone wechseln: Schnellreise zu allen vier Reichen
- 🔊 Sound: Lautstärke, Musik an/aus
- 🥽 Modus: VR / Mixed Reality umschalten

---

## 6. Mixed Reality Modus (Geplant)

> 📌 Wird nach Fertigstellung der VR-Welt als optionaler Modus eingebaut.

Die Meta Quest 3 bietet einen der besten Passthrough-Sensoren am Markt. Mixed Reality wird als optionaler Modus per UI-Knopf zuschaltbar sein.

### Technologie
- **API:** WebXR Depth Sensing + Plane Detection
- **Aktivierung:** Per UI-Knopf im Hauptmenü umschaltbar
- **Raumerkennung:** Quest 3 erkennt automatisch Flächen (Tisch, Boden, Wände)

### Geplante MR-Elemente

#### 🧚 Feen im echten Zimmer
- Kleine Feen fliegen durch den realen Raum
- Landen auf echten Oberflächen wie Tisch oder Regal
- Hinterlassen leuchtende Partikelspuren im Raum

#### 🌀 Portale in die vier Reiche
- An echten Wänden öffnen sich leuchtende Portale
- Durch das Portal sieht man das jeweilige Reich
- Jedes Reich hat ein eigenes Portal-Design

#### ✨ Magische Objekte auf echten Flächen
- Leuchtende Kristalle erscheinen auf dem Tisch
- Ein kleines Feen-Dorf wächst auf dem Boden
- Magische Blumen sprießen aus echten Oberflächen

#### 🌨️ Atmosphärische Effekte im Zimmer
- Magische Partikel, Glühwürmchen oder Funken schweben durch den Raum
- Passend zur aktiven Zone

---

## 7. Geschichte & Narrative (Geplant)

> 📌 Wird zu einem späteren Zeitpunkt ausgearbeitet – nach Fertigstellung der visuellen Welt.

### Konzept-Ideen (noch offen)
- Was verbindet die vier Reiche mit der Kesselstadt?
- Welches Geheimnis verbirgt jedes Reich?
- Gibt es einen Konflikt oder eine Bedrohung die alle Reiche betrifft?
- Wer hat die Kesselstadt erbaut – und warum verbinden Dampfmaschinen und Magie sich hier?

### Geplante Storytelling-Methoden
- **Environmental Storytelling:** Geschichte durch Ruinen, Artefakte, mysteriöse Orte
- **NPC-Dialoge:** Bewohner erzählen Fragmente der Geschichte
- **Questgegenstände:** Tagebuchseiten, magische Kristalle, alte Briefe
- **Narrative UI:** Kurzer atmosphärischer Text beim Betreten einer neuen Zone

---

## 8. Entwicklungs-Roadmap

| Phase | Was | Details |
|-------|-----|---------|
| 1 | Leveldesign ✅ | GDD fertiggestellt, alle Zonen konzipiert |
| 2 | Kesselstadt Basis | Terrain, Gebäude, Tag/Nacht-System |
| 3 | Feenreich Terrain | Landschaft, Pilze, Wiese, Bäume |
| 4 | Feenreich Leben | Kreaturen, Animationen, Sounds |
| 5 | UI System | In-World-Menü, Navigation, Zonenauswahl |
| 6 | Kulissen | Licht-, Schatten-, Sturmreich als Hintergründe |
| 7 | Mixed Reality | Passthrough-Modus, Feen im Zimmer, Portale |
| 8 | Geschichte | Narrative, NPCs, Fundstücke |
| 9 | Polish | Partikel, Licht, Sound-Feintuning |

---

## 9. Technische Hinweise für die Entwicklung

### Stack
- **A-Frame** für WebXR/VR-Grundstruktur
- **Three.js** für komplexere 3D-Elemente
- **GitHub Pages** für Hosting
- **Meta Quest 3 Browser** als Zielplattform

### Performance-Regeln für Quest 3
- Polygonanzahl pro Objekt möglichst niedrig halten
- Texturen max. 1024x1024px
- Wenige Draw Calls – Objekte zusammenfassen wo möglich
- Partikeleffekte sparsam einsetzen

### Branch-Strategie
```
main                    → stabile, funktionierende Version
├── feature/kesselstadt → Stadtentwicklung
├── feature/feenreich   → Feenreich-Arbeit
├── experiment/mr-modus → Mixed Reality testen
└── experiment/story    → Narrative einbauen
```
