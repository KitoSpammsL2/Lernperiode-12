# GLITCH – Escape the Simulation

## AP4 – Erstes Level testen

**Name:** Laurentiu  
**Datum:** 29.10.2026  
**Arbeitspaket:** Erstes Level testen und Fehler aufschreiben

### 1. Ziel

Ich möchte testen, ob unsere drei Rätsel richtig funktionieren. Ausserdem möchte ich überprüfen, ob der Glitch-Modus und der Timer funktionieren.

Wenn ich Fehler finde, schreibe ich sie auf.

### 2. Durchgeführte Tests

| Test | Ergebnis |
|---|---|
| Zahlenschloss mit richtigem Code (2048) | Funktioniert |
| Zahlenschloss mit falschem Code | Funktioniert |
| Symbolrätsel mit richtiger Reihenfolge | Funktioniert |
| Symbolrätsel mit falscher Reihenfolge | Funktioniert |
| Schalterrätsel richtig einstellen | Funktioniert |
| Schalterrätsel falsch einstellen | Funktioniert |
| Glitch-Modus aktivieren | Funktioniert in der Testversion |
| Alle drei Rätsel lösen | Funktioniert in der Testversion |
| Countdown-Timer | Noch nicht getestet |
| Ganzes Level im gemeinsamen Spiel | Noch nicht vollständig getestet |

### 3. Gefundene Probleme

Die drei Rätsel funktionieren in meiner eigenen Testversion.

Im gemeinsamen Spiel muss noch getestet werden, ob die Rätsel richtig mit dem Spielraum verbunden sind.

Auch der Timer muss noch getestet werden.

### 4. Ergebnis

Ich habe alle drei Rätsel ausprobiert. Die richtigen und falschen Antworten wurden richtig erkannt.

Der Glitch-Modus funktioniert in meiner Testversion ebenfalls.

Als Nächstes möchte ich den Timer und das ganze erste Level testen. Wenn ich Fehler finde, werde ich sie aufschreiben und mit meinem Team besprechen.

---

## Prüfung vom 06.11.2026 – Level 2 und Team-Arbeitspakete

Die folgende Prüfung wurde mit Codex durchgeführt. Der historische Bericht oben
bleibt als damaliger Stand erhalten.

### Umgebung und Umfang

- Ausgangsstand: `main`, Commit `9b94378`.
- Browser: Microsoft Edge, automatisiert mit Playwright gegen einen lokalen HTTP-Server.
- Bildschirmgrössen: 1280 × 900 und 390 × 844; zusätzlich Sichtkontrolle der mobilen Ansicht.
- Geprüft wurde der Weg vom Hauptmenü über alle Rätsel von Level 1 bis zum Gewinn in Level 2.
- Die obere Objektgruppe (Konsole, Tresor, Server, Ausgang) verwendet Laurentius neue Rätsel.
- Faruks zusätzlicher Bereich und seine Dateien wurden nicht geändert.

### Ergebnisse nach Einbau der neuen Rätsel

| Prüfung | Ergebnis |
|---|---|
| Neues Spiel, drei Rätsel von Level 1, Ausgang zu Level 2 | Bestanden; das Zahlenschloss von Level 1 funktioniert weiterhin. |
| Start von Level 2 | 05:00 und 0/3; Ausgang bleibt gesperrt. |
| Glitch-Hinweise bei jedem der drei neuen Rätsel | Zuerst verborgen; Button blendet Hinweise ein und wieder aus. |
| Konsole: leere Eingabe, EXIT und UHVHW | Werden abgelehnt; erneute Eingabe bleibt möglich. |
| Konsole: `  reset  ` mit Enter | Wird als RESET erkannt und löst genau ein Rätsel. |
| Tresor: leer, 68 oder ABCD | Meldung zur Eingabe von genau vier Ziffern. |
| Tresor: 8264 und 0003 | Werden abgelehnt. |
| Tresor: 6842 mit Enter | Richtig; Eingabe wird gesperrt. |
| Server: alle 15 falschen Kombinationen | Werden abgelehnt, auch keine oder alle aktivierten Module. |
| Server: nur B und D aktiv | Richtig; Eingaben werden gesperrt. |
| Gelöstes Rätsel schliessen und erneut öffnen | Meldung „bereits gelöst“, Zähler steigt nicht nochmals. |
| Nach einem gelösten Rätsel neu laden | 1/3 bleibt erhalten; Level-1-Fortschritt bleibt erhalten. |
| Timer nach Neuladen | Läuft mit der gespeicherten Restzeit weiter statt erneut bei 05:00 zu beginnen. |
| Ausgang bei 0/3 und 2/3 | Bleibt gesperrt. |
| 3/3, neu laden, Ausgang anklicken | Tür bleibt freigeschaltet; Gewinnbildschirm erscheint. |
| Gewinnbildschirm | Benötigte Zeit und neue Bestzeit erscheinen; Bestzeit ist gespeichert. |
| Gewinnseite neu laden | Gewinnbildschirm wird wieder angezeigt. |
| Zurück ins Menü und neues Spiel | Startet Level 1 bei 0/3; Bestzeit bleibt erhalten. |
| Abgelaufener gespeicherter Timer | Verlustbildschirm erscheint; geöffnetes Rätsel wird geschlossen. |
| Neustart nach Niederlage | Beginnt Level 1 mit leeren Rätselständen. |
| Alte gespeicherte Platzhalter-Erfolge von Level 2 | Neue Rätsel beginnen bei 0/3; Level 1 und Bestzeit bleiben erhalten. |
| Neue Rätselstände nach Migration | Werden mit Versionskennung gespeichert und beim Neuladen wieder geladen. |
| JavaScript-Syntax und `git diff --check` | Bestanden. |

Diese Prüfungen bestanden bei beiden Bildschirmgrössen. Die Timer-Niederlage
wurde mit einer absichtlich abgelaufenen Endzeit im Test-Spielstand geprüft;
es wurde dafür nicht fünf Minuten gewartet.

### Kaito – Pakete vom 06.11

Die drei Pakete sind umgesetzt und über PR #10, #11 und #12 in `main` angekommen:

- **Levelsteuerung:** `script.js` enthält zwei Levelseiten. Der Ausgang von Level 1
  lädt Level 2; dort wird der eigene Rätselstand verwendet.
- **Timer speichern:** Eine Endzeit wird in `sessionStorage` gespeichert. Neuladen
  erhält die Restzeit; ein neues Level startet mit fünf Minuten.
- **Bestzeit:** Die Dauer des Durchgangs wird beim letzten Ausgang gemessen,
  in `localStorage` gespeichert und auf dem Gewinnbildschirm angezeigt.

Der geprüfte normale Spieldurchlauf funktioniert. Das ersetzt nicht die für den
13.11 geplante umfassende Prüfung aller Sonderfälle der Spiellogik.

### Faruk – Pakete vom 06.11

Die Änderungen sind über PR #13 in `main` vorhanden. Die Anleitung im Hauptmenü
ist eingebaut. Der neue Raum und zusätzliche Gestaltung sind vorhanden, aber
noch nicht vollständig mit dem gemeinsamen Spiel verbunden:

1. **Doppelte Objektgruppen:** `room2.html` enthält die alte und die neue Gruppe.
   Die neuen Objekte zeigen Beschreibungen; Rätsel und Gewinn laufen über die alte Gruppe.
2. **Doppeltes Skript:** `faruk-room2.js` wird zweimal geladen. Im Browser entsteht
   `Identifier 'level2Objects' has already been declared`. Die erste Einbindung
   läuft vor den neuen Objekten; ihre Klickbehandlung wird dadurch nicht zuverlässig eingerichtet.
3. **Rätselfenster-Design:** Die neuen CSS-Regeln zielen unter anderem auf
   `#puzzleModal` und `.puzzle-box`. Das tatsächlich verwendete Fenster heisst
   `#puzzleArea`; die neue Gestaltung greift dort nicht vollständig.
4. **HTML-Struktur:** Vor den unteren Skripten steht ein schliessendes
   `</section>` ohne zugehöriges öffnendes Element.

Diese Probleme bestanden bereits vor Laurentius neuen Rätseln. Sie bleiben auf
Wunsch unverändert und sollen mit Faruk beim für den 13.11 geplanten Überarbeiten
der Oberfläche besprochen werden. Der normale Durchlauf in der alten Objektgruppe
funktioniert trotz des dokumentierten Skriptfehlers.

### Wiederholung von Hand

1. Spiel über einen lokalen HTTP-Server im Hauptmenü öffnen und starten.
2. Level 1 mit 2048, der Symbolfolge GLITCH und den Schaltern A/C lösen.
3. Ausgang öffnen; in Level 2 die **oberen** Objekte verwenden.
4. Konsole mit falscher Antwort testen, dann RESET eingeben.
5. Tresor zunächst mit ungültigem Code testen, dann 6842 eingeben.
6. Server mit falscher Auswahl testen, dann ausschliesslich B und D aktivieren.
7. Bei jedem Rätsel den Glitch-Modus ein- und ausschalten und zwischendurch neu laden.
8. Bei 3/3 den oberen Ausgang anklicken und Zeit sowie Bestzeit prüfen.
