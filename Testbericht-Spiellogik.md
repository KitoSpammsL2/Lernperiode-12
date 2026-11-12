# GLITCH – Testbericht Spiellogik

**Name:** Kaito  
**Datum:** 12.11.2026  
**Arbeitspaket:** Spiellogik von Level 1 und 2 vollständig testen (13.11)

## Ziel

Alle Sonderfälle der Spiellogik prüfen: Levelwechsel, Timer, Rätselstatus und
Speicherfunktion. Gefundene Fehler werden behoben und nochmals getestet.

## Umgebung

- Ausgangsstand: `main`, Commit `dd80884` (nach PR #14).
- Browser über einen lokalen HTTP-Server, nicht über `file://`.
- Klicks teils mit der Maus, teils über die Browser-Konsole. Der Ablauf der Zeit
  wurde mit einer vorgestellten Endzeit getestet, ohne fünf Minuten zu warten.
- Beschädigte Speicherstände wurden über die Konsole in `localStorage` und
  `sessionStorage` geschrieben.

## Ergebnisse

### Levelwechsel

| Prüfung | Ergebnis |
|---|---|
| `room2.html` ohne gestartetes Spiel öffnen | Bestanden: Weiterleitung ins Hauptmenü |
| Neues Spiel | Bestanden: Level 1, 0/3, Timer läuft, Ausgang gesperrt |
| Ausgang bei 0/3 in Level 1 und 2 | Bestanden: bleibt gesperrt, Meldung mit Anzahl gelöster Rätsel |
| `room2.html` aufrufen, während Level 1 läuft | Bestanden: Weiterleitung zu `room.html` |
| Level 1 mit 3/3 abschliessen | Bestanden: Level 2 startet bei 0/3 und 05:00 |
| **Doppelklick auf den Ausgang von Level 1** | **Fehler gefunden und behoben**, siehe unten |
| Level 2 mit 3/3 abschliessen, auch mit Doppelklick | Bestanden: Gewinnbildschirm mit Zeit und Bestzeit |

### Timer

| Prüfung | Ergebnis |
|---|---|
| Zeit um 1:30 vorstellen und neu laden | Bestanden: Timer läuft weiter (03:20 → 03:16) statt bei 05:00 |
| Wechsel in Level 2 | Bestanden: Level 2 beginnt wieder mit voller Zeit |
| Zeit läuft ab, während ein Rätsel offen ist | Bestanden: Verlustbildschirm, Rätsel wird geschlossen |
| Antwort nach Ablauf der Zeit abgeben | Bestanden: wird nicht mehr angenommen |
| Nach Niederlage neu laden | Bestanden: Verlustbildschirm bleibt, Timer 00:00 |
| «NEU STARTEN» nach Niederlage in Level 2 | Bestanden: Level 1, 0/3, alter Fortschritt gelöscht |

### Rätselstatus

| Prüfung | Ergebnis |
|---|---|
| Schrank: leer, `12`, `abcd` | Bestanden: «Bitte genau 4 Zahlen eingeben.» |
| Schrank: `1234`, danach `2048` | Bestanden: falsch, dann gelöst und Eingabe gesperrt |
| Terminal: falsche Reihenfolge, danach GLITCH | Bestanden: Auswahl wird zurückgesetzt, dann gelöst |
| Stromkasten: alle 7 falschen Kombinationen, danach A + C | Bestanden: alle abgelehnt, dann gelöst |
| Level 2: `UHVHW`, `8264`, Module A + B | Bestanden: abgelehnt |
| Level 2: ` reset ` mit Leerzeichen, `6842`, Module B + D | Bestanden: gelöst |
| Gelöstes Rätsel erneut öffnen | Bestanden: «bereits gelöst», Zähler steigt nicht |

### Speicherfunktion

| Prüfung | Ergebnis |
|---|---|
| Neu laden mit 1/3 in Level 1 und 2/3 in Level 2 | Bestanden: Fortschritt bleibt pro Level erhalten |
| Wechsel in Level 2 | Bestanden: Fortschritt von Level 1 bleibt gespeichert |
| **Fortschritt im Speicher als Liste `[]`** | **Fehler gefunden und behoben**, siehe unten |
| **Level im Spielstand als Text `"2"`** | **Fehler gefunden und behoben**, siehe unten |
| Konsole während aller Tests | Keine Fehler aus der Spiellogik (siehe offene Punkte) |

## Gefundene und behobene Fehler

1. **Doppelklick auf den Ausgang übersprang Level 2** (`script.js`)  
   Beim zweiten Klick war die Seite noch nicht gewechselt. Der Ausgang galt
   deshalb nochmals als offen, und das Spiel wurde sofort gewonnen. Der
   Gewinnbildschirm erschien in Level 2 bei 0/3, und die viel zu kurze Zeit
   (00:04) wurde als Bestzeit gespeichert.  
   **Lösung:** Die Variable `levelChanging` sperrt `completeLevel()`, sobald ein
   Levelwechsel läuft.  
   **Nachtest:** Echter Doppelklick und drei gleichzeitige Klicks führen in Level 2 bei 0/3.

2. **Fortschritt wurde bei beschädigtem Speicher nie mehr gespeichert** (`puzzles.js`)  
   Stand in `glitchProgress` eine Liste `[]`, wurde sie wie ein Objekt
   behandelt. Beim Speichern blieb sie leer, und nach dem Neuladen waren
   gelöste Rätsel wieder offen.  
   **Lösung:** Nur ein echtes Objekt wird als Fortschritt übernommen.  
   **Nachtest:** Der Fortschritt wird wieder als Objekt gespeichert und bleibt nach dem Neuladen.

3. **Level als Text wurde übernommen** (`script.js`)  
   Ein gespeichertes Level `"2"` (Text statt Zahl) wurde akzeptiert. Vergleiche
   wie `currentLevel === 2` schlugen dadurch fehl.  
   **Lösung:** Das Level wird nur als ganze Zahl übernommen, sonst beginnt das Spiel bei Level 1.  
   **Nachtest:** Der ungültige Wert wird verworfen.

## Offene Punkte ausserhalb der Spiellogik

- `faruk-room2.js` wird in `room2.html` zweimal geladen. Das erzeugt den Fehler
  `Identifier 'level2Objects' has already been declared`. Er ist schon im
  Testbericht vom 06.11 beschrieben und gehört zu Faruks Überarbeitung von Level 2.
- Das Terminal in Level 1 zeigt im Glitch-Modus «SYSTEM-FRAGMENT: 2048». Das ist
  der Code des Schranks und verrät die Lösung. Das ist eine inhaltliche Frage für Faruk und Laurentiu.
- Der Rätselfortschritt liegt im `localStorage` und gilt deshalb für alle Tabs.
  Wer in zwei Tabs gleichzeitig spielt, teilt den Fortschritt. Für das Spiel in
  einem Tab ist das kein Problem.

## Wiederholung von Hand

1. Spiel über einen lokalen HTTP-Server starten.
2. Level 1 mit `2048`, der Symbolfolge GLITCH und den Schaltern A + C lösen.
3. Den Ausgang **doppelt** anklicken: Level 2 muss bei 0/3 starten.
4. Ein Rätsel lösen und neu laden: Der Fortschritt und die Zeit bleiben.
5. Level 2 mit `RESET`, `6842` und den Modulen B + D lösen und den Ausgang öffnen.
6. Ein neues Spiel starten und die Zeit ablaufen lassen: Verlustbildschirm, danach «NEU STARTEN».
