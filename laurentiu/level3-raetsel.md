# Level 3 – Der Quarantänesektor

Rätselkonzept von Laurentiu für das Arbeitspaket vom 13.11.2026.

Die Simulation hat einen beschädigten Sektor isoliert. Um ihn zu verlassen,
muss der Spieler Zugriffsrechte wiederherstellen, ein Datenpaket reparieren und
eine Route durch die Quarantäne finden. Die drei Aufgaben lassen sich in
beliebiger Reihenfolge lösen. Der Ausgang öffnet sich bei drei gelösten Rätseln.

In Level 2 reicht es meist, einen einzelnen Hinweis anzuwenden. Hier muss der
Spieler pro Rätsel mehrere Bedingungen kombinieren. Die Hinweise bleiben
lesbar, solange der Glitch-Modus aktiv ist. Fehlversuche verbrauchen keine
zusätzliche Zeit und die Eingaben bleiben zum Korrigieren stehen.

## 1. Zugriffsterminal – Berechtigungen sortieren

Fünf Chips mit den Nummern 2, 4, 6, 7 und 9 liegen neben fünf Steckplätzen.
Jeder Chip muss genau einmal eingesetzt werden. Der Spieler legt per Klick
die Reihenfolge fest und kann Chips wieder entfernen.

Im Glitch-Modus erscheinen diese Regeln:

1. Chip 9 steckt direkt links von Chip 7.
2. Zwischen 9 und 2 liegen genau zwei andere Chips.
3. Chip 4 steckt rechts von Chip 7 und rechts von Chip 6.
4. Chip 6 steckt direkt neben Chip 2.

**Lösung: 9 → 7 → 6 → 2 → 4.** Die ersten drei Regeln lassen noch
97624 und 69742 zu. Die vierte Regel schliesst 69742 aus, weil zwischen 6
und 2 drei Chips liegen.

Beim Prüfen meldet das Spiel eine unvollständige Belegung oder dass mindestens
eine Regel verletzt ist. Eine unzulässige Belegung bleibt zur Korrektur stehen.

## 2. Datenpuffer – Ein defektes Bit reparieren

Der Puffer zeigt das Paket `0110001`, nummeriert von Position 1 bis 7.
Genau ein Bit ist falsch. Der Spieler markiert die Position, die er umdrehen
möchte, und gibt die vier Nutzbits des reparierten Pakets ein.

Im Glitch-Modus erscheinen die Prüftabelle und die Lesereihenfolge. Jede Gruppe
muss nach der Reparatur eine gerade Anzahl Einsen enthalten. Als kurzes
Beispiel zeigt der Hinweis, dass `101` zwei Einsen enthält und damit gerade ist.

| Gruppe | Geprüfte Positionen | Aktueller Status |
|---|---|---|
| A | 1, 3, 5, 7 | In Ordnung (2 Einsen) |
| B | 2, 3, 6, 7 | Fehler (3 Einsen) |
| C | 4, 5, 6, 7 | Fehler (1 Eins) |

Die Nutzbits werden nach der Reparatur an den Positionen **3, 5, 6 und 7**
in dieser Reihenfolge gelesen. Die Prüftabelle bezieht sich immer auf das
ursprünglich empfangene Paket.

**Lösung: Position 6 umdrehen und 1011 eingeben.** Der Fehler muss in B und C
liegen, darf aber nicht in A liegen. B und C teilen die Positionen 6 und 7.
Position 7 gehört auch zu A. Es bleibt Position 6. Aus `0110001` wird
`0110011`, daraus ergeben sich die Nutzbits `1011`. Beide Eingaben müssen
stimmen. Wenn nur die Nutzbits falsch sind, verweist die Meldung auf die
Lesereihenfolge.

## 3. Routenpult – Schnellster Weg durch die Quarantäne

Der Spieler sieht eine Karte mit Start S, Ausgang Z und den Knoten A bis E.
Die Leitungen sind in beide Richtungen nutzbar. Er klickt die Stationen
nacheinander an. Der Weg und die Summe der Kosten sind sichtbar. Eine Station
darf nur einmal besucht werden. Der letzte Schritt lässt sich rückgängig machen.

| Leitung | Kosten | Status |
|---|---:|---|
| S–A | 2 | Normal |
| S–B | 3 | Normal |
| A–C | 3 | Instabil |
| A–E | 4 | Normal |
| B–C | 2 | Normal |
| B–D | 3 | Instabil |
| C–D | 2 | Normal |
| C–E | 3 | Normal |
| D–Z | 3 | Instabil |
| E–Z | 3 | Normal |

Im Glitch-Modus erscheinen der Status der Leitungen sowie drei Bedingungen:
Der Weg muss über Kontrollpunkt C führen, genau eine instabile Leitung nutzen
und insgesamt möglichst wenig kosten. Das Budget beträgt 11.

**Lösung: S → B → C → D → Z mit Kosten 10.** Kontrollpunkt C wird besucht
und D–Z ist die einzige instabile Leitung. S → A → C → E → Z ist ebenfalls
zulässig, kostet aber 11. S → B → C → E → Z kostet ebenfalls 11, nutzt aber
keine instabile Leitung. So reicht es nicht, einfach den ersten Weg unter
dem Budget zu finden.

Die Rückmeldung unterscheidet fehlenden Kontrollpunkt, falsche Anzahl
instabiler Leitungen, überschrittenes Budget und eine gültige, aber langsamere
Route. Das Spiel zeigt bei einem Fehlversuch nicht den optimalen Weg.

## Umsetzung und Tests für den nächsten Termin

- Drei neue Rätsel an das vorhandene System für Rätselstatus, Glitch-Modus und
  Ausgang anschliessen. Antworten als Chipfolge, Bitposition plus Nutzdaten
  beziehungsweise Knotenfolge prüfen.
- Zu jedem Rätsel falsche und richtige Antworten ausprobieren. Beim Routenpult
  auch die gültige Route mit Kosten 11 testen. Bei allen drei Rätseln prüfen,
  dass die Regeln und Prüfdaten im normalen Modus verborgen sind.
- Zwei Personen ohne Lösungshinweise spielen lassen. Mit dem bestehenden
  Fünf-Minuten-Timer beginnen und festhalten, wo sie Zeit verlieren. Danach
  bei Bedarf die Formulierung der Hinweise oder die Zeit für Level 3 anpassen.
