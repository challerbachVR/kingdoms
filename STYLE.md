# ✦ KINGDOMS – Visual Style Guide
> Für Claude Code: Dieses Dokument vor jedem Art-Pass lesen.
> Technische Infos → GDD.md | Story → STORY.md

**Plattform:** Meta Quest 3 (WebXR / A-Frame / Three.js)  
**Performance-Limit:** Max 72fps auf Quest 3 halten. Keine Echtzeit-Schatten. Max ~150k Polygone pro Zone.

---

## 0. Globale Regeln (alle Zonen)

- **Keine harten Schatten** – nur Ambient Occlusion, Baked Shadows oder gefälschte Drop-Shadows
- **Fog immer aktiv** – verbessert Tiefe und kaschiert Draw-Distance
- **Farben immer leicht gesättigt** – keine reinen Grau-/Schwarz-Töne
- **Partikel sparsam** – max 200 aktive Partikel gleichzeitig pro Zone (Quest 3 Limit)
- **Texturgröße:** Max 512x512 für Objekte, 1024x1024 für Terrain

---

## 1. 🏙️ Kesselstadt

**Stil:** Steampunk-Mittelalter | Geschäftig & belebt

### Farbpalette
| Element | Hex | Beschreibung |
|---------|-----|--------------|
| Stein/Mauern | `#6B5744` | Warmes Dunkelbraun |
| Holz | `#8B6914` | Goldbraun gealtert |
| Metall/Kupfer | `#B87333` | Oxidiertes Kupfer |
| Messing | `#CFB53B` | Messing-Akzent |
| Dampf/Nebel | `#C8C8C8` | Hellgrau, 40% Opacity |
| Himmel Tag | `#7AA3C8` | Gedämpftes Blau |
| Himmel Nacht | `#1A1A2E` | Dunkelblau-Lila |
| Lampenlicht | `#F4A460` | Warmes Orange-Gelb |

### Beleuchtung
```
ambientLight: color="#4A3F35" intensity=0.6
directionalLight: color="#F4C87A" intensity=0.8 (Richtung: leicht von rechts)
PointLights (Laternen): color="#F4A460" intensity=0.5 distance=8
```

### Fog
```
fog: type="linear" color="#8A7A6A" near=30 far=80
```

### Atmosphäre-Effekte
- Dampfwolken aus Rohren (langsam aufsteigend, grau-weiß)
- Funken an Schmieden (goldgelb, kurze Lebensdauer)
- Tauben/Vögel als Billboard-Sprites im Hintergrund

---

## 2. 🍄 Feenreich

**Stil:** Magisch-Märchenhaft | Bunt & schillernd

### Farbpalette
| Element | Hex | Beschreibung |
|---------|-----|--------------|
| Pilz Türkis | `#00CED1` | Hauptpilz-Farbe |
| Pilz Magenta | `#FF00FF` | Leuchtende Kappen |
| Pilz Orange | `#FF6B35` | Warme Akzente |
| Pilz Violett | `#8B00FF` | Tiefe Pilze |
| Pilz Gold | `#FFD700` | Leuchtende Spots |
| Gras Hellgrün | `#90EE90` | Pastellgras |
| Gras Rosa | `#FFB6C1` | Magisches Gras |
| Gras Hellblau | `#ADD8E6` | Seltenes Gras |
| Wasser/Bach | `#00BFFF` | Kristallklar, 70% Opacity |
| Feenstaub Gold | `#FFD700` | Partikel goldene Feen |
| Feenstaub Blau | `#00BFFF` | Partikel blaue Feen |
| Feenstaub Grün | `#7FFF00` | Partikel grüne Feen |
| Himmel | `#9370DB` | Lila-Abend-Stimmung |
| Ambient | `#2D1B4E` | Dunkles Lila |

### Beleuchtung
```
ambientLight: color="#6A4E8A" intensity=0.8
hemisphereLight: skyColor="#9370DB" groundColor="#2D5A27" intensity=0.6
PointLights (Pilze): color="#00CED1" intensity=0.4 distance=5 (emissive Pilze)
PointLights (Feen): color="#FFD700" intensity=0.3 distance=3 (animiert)
```

### Fog
```
fog: type="exponential" color="#1A0A2E" density=0.015
```

### Atmosphäre-Effekte
- **Feenstaub:** Goldene/blaue/grüne Partikel, langsam schwebend (Keyframe-Animation)
- **Pilz-Leuchten:** Emissive Maps auf Pilzkappen (kein echter Light-Cast nötig)
- **Schmetterlinge:** Billboard-Sprites, 8 Stück max, flatternde Animation
- **Wasser-Bach:** Animierte UV-Scrolling Textur, kein echtes Wasser-Shader

### Emissive Werte (A-Frame Material)
```
Pilze: emissive="#00CED1" emissiveIntensity=0.4
Kristalle: emissive="#FFFFFF" emissiveIntensity=0.6
Feen-Lichter: emissive="#FFD700" emissiveIntensity=0.8
```

---

## 3. 🌟 Lichtreich (West)

**Stil:** Hell & kristallin | Schwebend & majestätisch  
**Status:** Kulisse geplant – noch nicht implementiert

### Farbpalette
| Element | Hex | Beschreibung |
|---------|-----|--------------|
| Primär | `#FFFACD` | Warmes Cremeweiß |
| Kristall | `#E0F7FA` | Eisblau-Kristall |
| Kristall Akzent | `#B2EBF2` | Helles Türkis |
| Gold | `#FFD700` | Göttliches Gold |
| Himmel | `#87CEEB` | Hellblau |
| Clouds | `#FFFFFF` | Reines Weiß, 80% Opacity |
| Ambient Glow | `#FFF9C4` | Warm-gelbes Glühen |
| Boden | `#F0F8FF` | Alice-Blau, fast weiß |

### Beleuchtung
```
ambientLight: color="#FFF9C4" intensity=1.2  (heller als andere Zonen!)
directionalLight: color="#FFFFFF" intensity=1.0
PointLights (Kristalle): color="#E0F7FA" intensity=0.5 distance=10
```

### Fog
```
fog: type="linear" color="#E8F4FD" near=20 far=60  (Weißer Dunst, Wolken-Effekt)
```

### Atmosphäre-Effekte
- Schwebende Kristallscherben (langsame Rotation, emissive)
- Lichtpartikel die nach oben steigen (weiß/gold)
- Schwebende Plattformen aus Kristall
- Lensflare-ähnliche Sprites bei Lichtquellen (Billboard)

---

## 4. 🌑 Schattenreich (Ost) – Geplant

**Stil:** Dunkel & mystisch | Mondlicht & Nebel

### Farbpalette (Vorschau)
| Element | Hex |
|---------|-----|
| Primär Dunkel | `#1C1C2E` |
| Mondlicht | `#C0C0FF` |
| Nebel | `#2D2D4A` |
| Lila Akzent | `#6A0DAD` |
| Silber | `#C0C0C0` |

### Fog (Vorschau)
```
fog: type="exponential" color="#0D0D1A" density=0.025
```

---

## 5. 🐉 Sturmreich (Nord) – Geplant

**Stil:** Episch & dramatisch | Gewitter & Burgen

### Farbpalette (Vorschau)
| Element | Hex |
|---------|-----|
| Himmel Gewitter | `#2C3E50` |
| Blitz | `#F8F8FF` |
| Stein Burg | `#708090` |
| Moos | `#4A5A3A` |
| Donner-Lila | `#4B0082` |

### Fog (Vorschau)
```
fog: type="exponential" color="#1A2A3A" density=0.02
```

---

## 6. 🔮 Alchemistin-Innenraum

**Stil:** Mystisch & warm | Kerzen & Kräuter | Lila Akzente

### Farbpalette
| Element | Hex | Beschreibung |
|---------|-----|--------------|
| Wände | `#6a5a4a` | Warmer Bruchstein |
| Boden | `#3c2818` | Dunkle Holzdielen |
| Theke | `#2a1a0e` | Sehr dunkles Holz |
| Thekenplatte | `#3a2510` | Mitteldunkles Holz |
| Kerze | `#ede8d4` | Cremewachs |
| Kerzenflamme | `#ffee88` | Warmgelb |
| Fläschchen Lila | `#8040c0` | Magisch-lila |
| Fläschchen Gold | `#c8a020` | Alchemie-Gold |
| Akzentlicht | `#c060ff` | Lila Punktlicht |

### Beleuchtung
```
ambientLight: color="#3a2840" intensity=0.6
PointLight (Kerze): color="#c060ff" intensity=1.5 distance=5
```

### Atmosphäre
- Lila Kerzenlicht dominiert
- Regale mit farbigen Fläschchen (emissive)
- Dunkle, geheimnisvolle Atmosphäre
- Kein Tageslicht

---

## 7. 🔨 Schmiede-Innenraum

**Stil:** Düster & industriell | Feuer & Metall | Rusß

### Farbpalette
| Element | Hex | Beschreibung |
|---------|-----|--------------|
| Wände | `#2a2220` | Dunkler Bruchstein mit Ruß |
| Boden | `#1a1614` | Schieferplatten |
| Amboss | `#282828` | Dunkles Metall |
| Holz-Ständer | `#3a2510` | Verbranntes Holz |
| Esse-Glut | `#cc2200` | Tiefes Rot |
| Flamme | `#ff6600` | Orange-Feuer |
| Flammenspitze | `#ffcc00` | Goldgelb |
| Werkzeuge | `#2a2828` | Dunkles Schmiedemetall |

### Beleuchtung
```
PointLight (Esse): color="#ff5522" intensity=2.0 distance=12
PointLight (Fill): color="#ff8844" intensity=0.35 distance=8
PointLights (Fackeln): color="#ff8833" intensity=0.8 distance=6
```

### Atmosphäre
- Essenlicht dominiert (orange-rot)
- Fackeln an Ost- und Westwand
- Dunkle prozedurale Texturen: `tex-forge-stone`, `tex-forge-floor`, `tex-forge-beam`
- Werkzeuge und Waffen an den Wänden

---

## 8. 🍺 Händler-Innenraum

**Stil:** Warm & einladend | Holz & Messing | Kaufmannsatmosphäre

### Farbpalette
| Element | Hex | Beschreibung |
|---------|-----|--------------|
| Theke | `#3c2210` | Dunkles Handelsholz |
| Thekenplatte | `#5a3818` | Mittelhelles Holz |
| Kasse | `#3a2010` | Steampunk-Holz |
| Kassendetails | `#B87333` | Kupfer |
| Kassenknopf | `#CFB53B` | Messing |
| Flasche Türkis | `#00CED1` | Exotische Ware |
| Kerze | `#ede8d4` | Cremewachs |

### Beleuchtung
```
ambientLight: color="#f0d0a0" intensity=0.9
PointLight (Kerze): color="#f4a460" intensity=1.4 distance=12
```

---

## 9. 🍻 Gasthaus-Innenraum

**Stil:** Gemütlich & warm | Holz & Feuer | Taverne

### Farbpalette
| Element | Hex | Beschreibung |
|---------|-----|--------------|
| Boden | `#5a3618` | Dunkle Holzdielen |
| Wände | `#a08868` | Warmer Innenputzstein |
| Balken | `#38200c` | Dunkle Eiche |
| Theke | `#3c2210` | Gasthaus-Holz |
| Feuer | `#ff6600` | Kaminfeuer |

### Beleuchtung
```
PointLight (Kamin): color="#ff8833" intensity=1.6 distance=10
```

---

## 10. Übergangszonen

### Kesselstadt → Feenreich (Südtor)
- Fog-Farbe wechselt über 22 Einheiten: `#8A7A6A` → `#1A0A2E`
- Ambient-Light-Farbe: `#4A3F35` → `#6A4E8A`
- Neue Pflanzen/Pilze tauchen ab z=20 auf

### Kesselstadt → Lichtreich (Westtor)
- Fog-Farbe: `#8A7A6A` → `#E8F4FD`
- Szene wird progressiv heller
- Kristall-Objekte ab x=-20

---

## 11. Quest für Claude Code: Standard-Prompt

Füge diesen Satz an den Anfang jeder Optik-Session:

```
Lies STYLE.md. Ziel: [ZONE] Art Pass.
Quest 3 Limits: Keine Echtzeit-Schatten, max 150k Polygone, max 200 Partikel.
Ändere nur Dateien in /[zone]-folder/. GDD.md nicht anfassen.
```
