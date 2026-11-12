# GLITCH – AP1: Level-2-Oberfläche

Datum: 13.11.2026 · Verantwortlich: Faruk (Frontend)

## Ausgangslage und Umsetzung

Der Arbeitsbaum war sauber. Branch `feature/faruk-level2-design` existierte bereits.
Nach `git fetch origin` war HEAD identisch mit `origin/main` (`4371b40`);
`git merge --ff-only origin/main` erforderte keine Änderungen.

In `room2.html` standen zwei Objektgruppen (acht Buttons) und zwei Einbindungen
von `faruk-room2.js`. Die zweite Gruppe zeigte lediglich Beschreibungstexte,
während Konsole, Tresor, Server und Ausgang des Hauptspielraums bereits mit
Laurentius Rätseln und Kaitos Steuerung verbunden waren. Ausserdem enthielt die
Datei ein schliessendes `section` ohne zugehöriges öffnendes Element.

- Nur die zusätzliche Objektgruppe und das überzählige `section` entfernt.
- `faruk-room2.js` einmal eingebunden und als reine UI-Ergänzung weiterverwendet:
  gelöste Karten, Türstatus, aufgeklappte Objekte, Glitch-Button-Zustand,
  Tastaturfokus und Schliessen per Escape. Keine Lösungen oder Speicherwerte geändert.
- Eigenes `room2.css`, ausschliesslich auf `.level-two` begrenzt: dunkle Karten,
  Türkis und Pink, dezente Hover-Effekte, 4/2/1 Spalten, sticky HUD,
  lesbare Rätselansicht und Endbildschirm-Buttons, Fokus und reduzierte Bewegung.
- Ungenutzte Regeln der zusätzlichen Objektgruppe aus `faruk-design.css` entfernt.
  Gemeinsame Regeln für Menü, Rätsel und Endbildschirme erhalten.
- Bestehende Logikdateien `script.js`, `puzzles.js`, `door.js`, `room.js` und
  `room-puzzles.js` unverändert. Keine Änderungen an Rätselinhalt oder Lösungen.

## Wiederholbarer Browser-Test

Voraussetzungen: Node.js 22 oder neuer (globales WebSocket), installiertes Chrome.
Keine npm-Pakete oder externen Dienste erforderlich.

```powershell
node tests/level2-ui.cjs
```

Alternativer Chrome-Pfad: Umgebungsvariable `CHROME_PATH`.
Optional `SCREENSHOT_PATH` für Desktop- und Mobile-PNGs setzen.
Der Test startet einen lokalen HTTP-Server auf einem freien Port und isoliertes
Headless-Chrome mit einem temporären Profil. Er berührt keinen persönlichen
Browser-Spielstand. Chrome muss in der Ausführungsumgebung starten dürfen;
in der Codex-Sandbox war dafür eine Ausführung ausserhalb der Sandbox erforderlich.

## Erfolgreiche Prüfungen

| Prüfung | Ergebnis |
|---|---|
| Direkter Levelzugriff ohne gestartetes Spiel | Weiterleitung zum Hauptmenü |
| Startmenü, alle Level-1-Rätsel, Wechsel nach Level 2 | Spielbar; Level 2 startet bei 0/3 und voller Zeit |
| Raum, Objekte und Skripte | Ein Hauptspielraum, vier Originalobjekte, keine doppelten Skripte |
| CSS | Alle vier Stylesheets geladen und mit Regeln vorhanden |
| Gesperrte Tür | Öffnet sich bei 0/3 nicht |
| Glitch-Modus | Hinweis zunächst verborgen, nach Aktivierung sichtbar; Buttonzustand stimmt |
| Konsole | Falsche Antwort abgelehnt, ` reset ` akzeptiert |
| Tresor | `8264` abgelehnt, `6842` akzeptiert |
| Server | A+B abgelehnt, B+D akzeptiert |
| Fortschritt | Karte nach Lösung aktualisiert, erneutes Öffnen ohne Doppelzählung |
| Speichern und Neuladen | Fortschritt und exakter Ablaufzeitpunkt bleiben erhalten |
| Tür bei 3/3 | Freigeschaltet und beschriftet; Gewinnbildschirm erscheint |
| Tastatur | Escape schliesst Rätsel, Fokus kehrt zum Objekt zurück; Tab zum Ausgang mit sichtbarem Fokus |
| Responsive | 1440, 768, 390 und 320 px: kein horizontaler Überlauf, alle Karten innerhalb der Breite |
| HUD | Timer und Fortschritt bei allen geprüften Breiten auch nach Scrollen sichtbar |
| Reduzierte Bewegung | Titelanimation ausgeschaltet |
| Gewinn und Bestzeit | Gewinnbildschirm, persönliche Bestzeit gespeichert |
| Neues Spiel | Rätselfortschritt zurückgesetzt |
| Niederlage in Level 2 | 00:00, Verlustbildschirm und geschlossenes Rätsel; bleibt nach Neuladen erhalten |
| Neustart nach Niederlage | Zurück nach Level 1 bei 0/3 und voller Zeit |
| Browser-Konsole und Ressourcen | Keine JavaScript-/Konsolenfehler, keine fehlgeschlagenen Ressourcen |

Der Test beschleunigt den Zeitablauf durch Setzen des Ablaufzeitpunkts im
isolierten Spielstand. Für die Layoutprüfung wird das Serverrätsel im Test
vorübergehend wieder geöffnet. Der Produktionscode enthält keine Test-Abkürzungen.
Desktop- und Mobile-Screenshots wurden zusätzlich visuell geprüft.
Alle JavaScript-Dateien im Projektwurzelverzeichnis sowie der neue Test wurden
mit `node --check` geprüft; `git diff --check` ohne Fehler.

## Grenzen

Geprüft mit installiertem Chromium/Chrome unter Windows und emulierten
Viewportgrössen. Keine Prüfung auf echten Mobilgeräten, Safari, Firefox oder mit
einem Screenreader. Keine wesentliche offene Anforderung für AP1 festgestellt.
Die separaten Arbeitspakete zu zusätzlichen Glitch-Effekten und Levelübergängen
bleiben im README offen.
