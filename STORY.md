# ✦ KINGDOMS – Story & Narrative
> Technische Details → siehe GDD.md

---

## 1. Die Welt vor dem Verlust

Die fünf Bereiche – Kesselstadt und die vier Reiche – wurden einst von einer **Königin** regiert. Ihre Macht und ein uraltes Artefakt – der **Herzstein** – hielten alles in Balance.

Vor langer Zeit verschwand die Königin spurlos. Bevor sie verschwand zerbrach sie den Herzstein in vier Splitter und versteckte je einen in einem Reich – um zu verhindern dass er in falsche Hände fällt.

Ohne sie und ohne den Herzstein verlor jedes Reich seine Balance.

---

## 2. Wer herrscht jetzt?

| Bereich | Herrscher | Situation |
|---------|-----------|-----------|
| 🏙️ Kesselstadt | Stadtrat aus Händlern & Ingenieuren | Pragmatisch, hat Kontakt zur magischen Welt verloren. Bürger glauben nicht mehr an die Reiche. |
| 🍄 Feenreich | Die weise Fee – Hüterin, nicht Herrscherin | Regiert sich durch die Natur. Wird ohne Königin wilder und unberechenbarer. |
| 🌟 Lichtreich | Ein falscher König – Usurpator | Nutzte die Abwesenheit aus. Kontrolliert Licht und Wahrheit. Hielt das Westtor verschlossen. |
| 🌑 Schattenreich | Niemand – Chaos | Von Dunkelkreaturen übernommen. Hier liegt die dunkelste Wahrheit. |
| 🐉 Sturmreich | Ein alter Drache | Kannte die Königin persönlich. Trauert – sein Schmerz wurde zu Zorn. Hält das Reich in Isolation. |

---

## 3. Die Identität des Spielers

Der Spieler ist keine zufällige Person.

**Du bist die Prinzessin** – die Tochter der verschwundenen Königin. Du hast dein Gedächtnis verloren und bist als Mensch in der Kesselstadt aufgewacht.

Die weise Fee hat auf deine Rückkehr gewartet. Sie erkennt dich sofort und verwandelt dich zurück in eine Fee. Deine Erinnerungen kehren langsam zurück – je ein Herzstein-Splitter bringt eine neue.

---

## 4. Die Reise & Erinnerungen

| Reich | Splitter | Erinnerung |
|-------|----------|------------|
| 🍄 Feenreich | Schlüssel gefunden ✅ | Du erinnerst dich an deine Kindheit im Feenreich |
| 🌟 Lichtreich | ??? | Du erinnerst dich an deine Mutter – die Königin |
| 🌑 Schattenreich | ??? | Du erfährst was wirklich mit ihr geschah |
| 🐉 Sturmreich | ??? | Die finale Wahrheit – und die Rückkehr |

---

## 5. Charaktere

### Die Prinzessin (Spieler)
- Hat ihr Gedächtnis verloren, erwacht als Mensch in der Kesselstadt
- Erinnerungen kehren durch Herzstein-Splitter und Begegnungen zurück
- Wird von der weisen Fee zurück in eine Fee verwandelt

### Die Weise Fee
- Hüterin des Feenreichs, wartete auf die Rückkehr der Prinzessin
- Erscheint zunächst als **Alchemistin in der Kesselstadt** (Verkleidung) – gibt den Hinweis auf den Hund
- Im Feenreich: weißes Haar, lila Robe, goldene Krone, Zauberstab
- Verwandelt die Prinzessin zurück in eine Fee

### Der besondere Hund
- Erkennbar an seinen **goldenen Augen**
- Einziger in der Kesselstadt der die Prinzessin wirklich erkennt
- Weicht zunächst zurück – muss mit Futter gewonnen werden
- Führt sie zu den drei versteckten Zeichen
- Verschwindet nach Erfüllung seiner Aufgabe

### Der Schmied
- Alter, schweigsamer Mann
- Hat einst einen Schwertgriff mit dem Wappen der Königin geschmiedet
- Redet nur wenn man ihn auf das Westtor anspricht (Hinweis vom Wirt)
- Gibt keine klaren Antworten – nur Andeutungen
- Weiß wer die Prinzessin ist, schweigt aber aus Angst
- Sein Schweigen wird im Schattenreich aufgelöst

### Der Gastwirt
- Gesprächig aber vorsichtig
- Hat Angst vor dem Stadtrat
- Gibt den Hinweis auf den Schmied wenn man ihn auf Soldat + Reisende anspricht
- *„Sag nicht ich hab dich geschickt."*

### Der Händler
- Geschwätzig, handelt mit allem
- Hat einen Schwertgriff (Wappen der Königin) zufällig erworben – weiß nicht was er ist
- Erkennt das Wappen wenn der Spieler den Griff zeigt
- Gibt dann den Hinweis auf die Alchemistin
- Verkauft Hundefutter (wichtig für Quest 1)

### Der alte Soldat
- Trinkt allein, redet ungern
- War dabei als die Stadt sich veränderte
- Spricht über das verschlossene Westtor
- Könnte in späteren Quests wieder auftauchen

### Die Königin (verschwunden)
- Herrscherin aller fünf Bereiche, Mutter der Prinzessin
- Zerbrach den Herzstein um ihn zu schützen
- Was wirklich mit ihr geschah: im Schattenreich verborgen

### Der falsche König (Lichtreich)
- Usurpator der die Abwesenheit der Königin ausnutzte
- Kontrolliert Licht = kontrolliert Wahrheit
- Antagonist von Quest 3

### Der alte Drache (Sturmreich)
- Kannte die Königin persönlich, trauert um sie
- Sein Schmerz wurde zu Zorn – hält das Reich in Isolation
- Nicht böse, nur gebrochen – muss anders überzeugt werden

---

## 6. Tagesablauf & Hausstruktur

Jedes begehbare Haus ist nur zu einer bestimmten Tageszeit zugänglich.
Der Besuch eines Hauses löst den Tageswechsel aus.

| Tageszeit | Ort | Quest-State danach |
|-----------|-----|--------------------|
| 🌙 Nacht | Gasthaus | `QUEST0.heardTavern = true` |
| 🌅 Morgen | Schmiede | `QUEST1.hasSwordHilt = true` + `QUEST1.firstMemory = true` |
| ☀️ Mittag | Händlerhaus | `QUEST1.heardMerchant = true` + `INVENTORY.dogFood = true` |
| 🌆 Abend | Alchemistin | `QUEST1.triggered = true` |
| 🌆 Abend+ | Kesselstadt | Hund finden → füttern → Zeichen → Südtor |
| 🍄 Feenreich | Weise Fee | Verwandlung → Schlüssel → Westtor |

---

## 7. Quest-Struktur

### Quest 0 – Die erste Nacht 🌙 ✅

**Ziel:** Hinweis auf den Schmied bekommen und das Gasthaus verlassen dürfen.

1. **Erwachen** – Nacht, leere Stadt, nur Gaslaternen flackern
2. **Nachtwache** – spricht an: *„Ins Gasthaus oder nach Hause!"*
3. **Gasthaus betreten** – Wirt begrüßt, stellt Getränk hin
4. **Reisende belauschen** – Westtor-Gerücht → `QUEST0.heardTravelers = true`
5. **Soldat ansprechen** – Stadt war früher anders → `QUEST0.heardSoldier = true`
6. **Frau mit Kapuze** – geht auf sie zu, sie verschwindet wortlos → `QUEST0.sawCloakedWoman = true`
7. **Wirt ansprechen** (nur wenn Soldat + Reisende gehört):
   - *„Lass die Finger davon. Der Stadtrat hat lange Ohren."*
   - *„Geh zum Schmied. Morgen früh, wenn er seine Esse anfeuert."*
   - *„Aber sag nicht ich hab dich geschickt."*
   - → `QUEST0.heardTavern = true`
8. **Gasthaus verlassen** – Überblende → *„Der Morgen graut..."* → Tageszeit: Morgen

**States:** `window.QUEST0 = { heardTravelers, heardSoldier, sawCloakedWoman, heardTavern }`

---

### Quest 1a – Der Schmied 🌅 🔲

**Ziel:** Schwertgriff finden, erste Erinnerung auslösen.

**Voraussetzung:** `QUEST0.heardTavern === true`

1. **Schmiede betreten** – Morgen, Schmied arbeitet am Amboss
2. **Schmied ansprechen** (Zeile 1):
   - *„Der Wirt schickt mir jeden zweiten Fremden."*
3. **Erneut ansprechen** (Zeile 2):
   - *„Du hast die falschen Fragen gestellt. Deshalb bist du hier."*
   - *„Das Westtor. Ich war dabei. Vor vielen Jahren."*
4. **Erneut ansprechen** (Zeile 3):
   - *„Ich schmied nicht mehr für jeden. Nur noch für mich."*
   - Legt Hammer hin, dreht sich halb um.
   - *„Hinter dem Amboss. Schau selbst. Ich hab's nicht weggeworfen – aber ich red nicht drüber."*
5. **Schwertgriff aufheben** – hinter dem Amboss, interaktiv
   - Gravur: Krone über zwei gekreuzten Schlüsseln
   - → `INVENTORY.swordHilt = true`, HUD zeigt ⚔️
   - **Flashback:** Schwarzblende → *„...ein Thronsaal. Warmes Licht. Eine Hand die deine hält."* → zurück
   - → `QUEST1.firstMemory = true`
6. **Schmied erneut ansprechen** (optional):
   - *„Du weißt wer ich bin."*
   - *„Ich weiß was dieses Wappen bedeutet. Mehr sag ich nicht."*
   - *„Geh nach Westen. Wenn du den Schlüssel hast."*
   - → `QUEST1.smithKnows = true`
7. **Schmiede verlassen** → Tageszeit: Mittag

**States:** `window.QUEST1.hasSwordHilt`, `QUEST1.firstMemory`, `QUEST1.smithKnows`

---

### Quest 1b – Der Händler ☀️ 🔲

**Ziel:** Hinweis auf die Alchemistin bekommen, Hundefutter erhalten.

**Voraussetzung:** `QUEST1.firstMemory === true`

1. **Händlerhaus betreten** – Mittag, Händler begrüßt sofort (Auto-Trigger 1.5s):
   - *„Ha! Ein Kunde! Schau dich um – ich hab alles, fast alles."*
   - → `dialogStep = 1`

2. **E drücken ohne Schwertgriff** (dialogStep=1, kein Wappen):
   - *„Was darf es sein, Fremder? Ich hab Waren aus aller Welt!"*
   - Kein Fortschritt. Cooldown 5s.

3. **Schwertgriff aktiv zeigen** (E mit `INVENTORY.swordHilt === true`):
   - Händler schaut auf den Griff. Pause.
   - *„Warte mal... das Wappen. Zwei Schlüssel, eine Krone."*
   - *„Das hab ich schon mal gesehen – bei der Alchemistin."*
   - *„Sie hat so ein Zeichen an ihrer Tür."*
   - Auto → Zeile 2:
   - *„Geh abends hin. Tagsüber macht sie nicht auf."*
   - *„Und... erwähn meinen Namen lieber nicht."*
   - → `QUEST1.heardMerchant = true`, `dialogStep = 2`

4. **E drücken nach Wappen-Dialog** (dialogStep=2):
   - *„Übrigens – brauchst du was Günstiges für unterwegs?"*
   - Auto → Zeile 2:
   - *„Altes Brot vom Markt. Nimm's – kostet mich nichts."*
   - → Brot wird interaktiv (leuchtet auf), `dialogStep = 3`

5. **Brot aufheben** (E beim Brot, dialogStep >= 3):
   - → `INVENTORY.dogFood = true`, HUD zeigt 🍖

6. **Händlerhaus verlassen** → Tageszeit: Abend

**States:** `window.QUEST1.heardMerchant`, `window.INVENTORY.dogFood`

---

### Quest 1c – Die Alchemistin 🌆 🔲

**Ziel:** Hinweis auf den Hund mit goldenen Augen bekommen.

**Voraussetzung:** `QUEST1.heardMerchant === true` + `INVENTORY.swordHilt === true`

**Raum:** Dunkel, warm. Kerzen, Glasflaschen, getrocknete Kräuter. Leises Summen.
Das Wappen der Königin (Krone über zwei Schlüsseln) hängt an der Tür — kein Zufall, ein Signal.

1. **Alchemistenladen betreten** – Abend, Alchemistin steht am Arbeitstisch
   - Dreht sich beim Eintreten um. Hält inne. Schaut lange.
   - *„Ich habe dich erwartet. Nicht heute — aber irgendwann."*
2. **Ansprechen** (Zeile 1):
   - *„Der Händler hat mich geschickt."*
   - Sie lächelt leicht: *„Der Händler weiß nicht was er gesehen hat. Aber du weißt es auch noch nicht."*
   - Pause. Sie schaut auf den Schwertgriff.
   - *„Das Wappen. Du hast es gefunden."*
   - *„Dann ist es Zeit."*
3. **Zeile 2** – nach kurzer Pause:
   - *„In dieser Stadt lebt ein Hund. Goldene Augen — du wirst ihn erkennen."*
   - *„Er hat auf dich gewartet. Länger als ich."*
4. **Zeile 3:**
   - *„Füttere ihn. Dann folge ihm."*
   - *„Was er dir zeigt — merk es dir."*
   - Dreht sich wieder zum Tisch. Gespräch beendet.
   - → `QUEST1.triggered = true`
5. **Optional – erneut ansprechen:**
   - *„Wer bist du?"*
   - Ohne sich umzudrehen: *„Jemand der sich erinnert. Für dich — bis du es selbst kannst."*
   - → `QUEST1.alchemistHint = true`
6. **Laden verlassen** – Überblende → kurzer Text:
   - *„Die Nacht gehört dem Warten. Aber der Hund ist noch wach."*
   - Tageszeit bleibt Abend. Quest 1d startet sofort.

> 📌 **Auflösung später:** Nach dem Besuch verschwindet die Alchemistin — ihr Laden ist danach leer.
> Im Feenreich wird klar: sie war die ganze Zeit die weise Fee.

**States:** `QUEST1.triggered`, `QUEST1.alchemistHint`

---

### Quest 1d – Der Hund & die Zeichen 🌆 ✅

**Ziel:** Hund füttern, drei Zeichen finden, Südtor öffnen.

**Voraussetzung:** `QUEST1.triggered === true` + `INVENTORY.dogFood === true`

1. **Hund mit goldenen Augen finden** – weicht zunächst zurück
2. **Füttern** bei < 3m mit Hundefutter → `QUEST1.dogFed = true`
3. **Hund führt zu drei Zeichen:**
   - 🔵 Brunnen auf dem Marktplatz
   - 🔵 Dachbalken des Gasthauses
   - 🔵 Zahnrad der Dampfmaschine
4. **Alle drei gefunden** → Zeichen leuchten auf, zeigen nach Süden
5. **Hund verschwindet** in der Menge
6. **Feenlichter** erscheinen am Südtor
7. **Südtor öffnet** sich dauerhaft

**States:** `window.QUEST1 = { triggered, dogFed, signs: 0-3, completed }`

---

### Quest 2 – Das Feenreich & der Schlüssel 🍄 ✅

**Ziel:** Schlüssel finden und Westtor zum Lichtreich öffnen.

1. **Ankunft** – die weise Fee erwartet dich
   - *„Du bist endlich zurück. Ich habe so lange gewartet."*
2. **Verwandlung** – Feenstaub → du wirst zur Fee → `fairy-mode`
3. **Erste Erinnerung** – du als Kind zwischen riesigen Pilzen
4. **Schlüssel suchen** – auf dem türkisen Riesenpilz bei (−13, 12, 51)
5. **Zurück zur Kesselstadt** – Westtor mit Schloss und Barriere
6. **Westtor öffnen** – mit Schlüssel → dauerhaft geöffnet → `LICHTREICH_GATE_UNLOCKED = true`

---

### Quest 3 – Das Lichtreich & der falsche König 🌟 🔲

- Herzstein-Splitter Nr. 2
- Erinnerung an die Mutter kehrt zurück
- Konfrontation mit dem falschen König

---

### Quest 4 – Das Schattenreich & die Wahrheit 🌑 🔲

- Herzstein-Splitter Nr. 3
- Was wirklich mit der Königin geschah
- Auflösung: warum der Schmied schwieg

---

### Quest 5 – Das Sturmreich & die Rückkehr 🐉 🔲

- Herzstein-Splitter Nr. 4
- Den alten Drachen überzeugen
- Finale Wahrheit & Rückkehr der Prinzessin

---

## 8. Inventory

| Item | Symbol | State | Woher |
|------|--------|-------|-------|
| Magischer Schlüssel | 🗝️ | `INVENTORY.magicKey` | Türkiser Pilz (Feenreich) |
| Schwertgriff | ⚔️ | `INVENTORY.swordHilt` | Schmiede (hinter Amboss) |
| Hundefutter | 🍖 | `INVENTORY.dogFood` | Händler (Mittag) |

---

## 9. Globale Quest-States

```javascript
window.QUEST0 = {
  heardTravelers:   false,  // Reisende belauscht
  heardSoldier:     false,  // Soldat angesprochen
  sawCloakedWoman:  false,  // Frau mit Kapuze verschwunden
  heardTavern:      false,  // Wirt: Hinweis auf Schmied
}

window.QUEST1 = {
  firstMemory:    false,  // Flashback nach Schwertgriff
  hasSwordHilt:   false,  // Schwertgriff aufgehoben  ← NEU
  smithKnows:     false,  // Schmied-Zusatzdialog gehört
  heardMerchant:  false,  // Händler: Hinweis auf Alchemistin
  triggered:      false,  // Alchemistin: Hinweis auf Hund
  alchemistHint:  false,  // Alchemistin-Zusatzdialog gehört
  dogFed:         false,  // Hund gefüttert
  signs:          0,      // Zeichen gefunden (0-3)
  completed:      false,  // Südtor geöffnet
}

window.INVENTORY = {
  magicKey:   false,
  swordHilt:  false,  // ← NEU
  dogFood:    false,
}

window.LICHTREICH_GATE_UNLOCKED = false;
window.FORGE_INSIDE = false;  // ← NEU
```

---

## 10. Storytelling-Methoden

- **Tageszeit als Narrative** – jede Tageszeit hat einen Ort, einen Charakter, eine Information
- **Environmental Storytelling** – Geschichte durch Ruinen, Artefakte, Umgebung
- **NPC-Dialoge** – kurze, atmosphärische Gesprächsfetzen
- **Begehbare Häuser** – Innenräume als eigene Mini-Szenen
- **Questgegenstände** – Schwertgriff, Splitter, Briefe
- **Erinnerungs-Sequenzen** – kurze Flashbacks beim Finden der Splitter
- **Narrative UI** – kurzer atmosphärischer Text beim Zonenbetreten

---

## 11. Mixed Reality (Geplant)

> 📌 Nach Fertigstellung der VR-Welt

- Feen fliegen durch dein echtes Zimmer
- Portale in die vier Reiche öffnen sich an echten Wänden
- Magische Objekte auf echten Tischen/Böden
- Per UI-Knopf zwischen VR und MR umschaltbar