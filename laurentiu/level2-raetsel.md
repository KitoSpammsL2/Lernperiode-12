# Level 2 – Rätselplanung

Datum: 06.11.2026  
Bereich: Laurentiu – Rätselentwicklung

Die Rätsel verwenden die bestehende obere Objektgruppe in `room2.html`:
Konsole, Tresor und Server. Faruks zusätzlicher Bereich bleibt unverändert.
Jedes Rätsel kann unabhängig von den anderen gelöst werden. Es werden keine
Gegenstände aus Level 1 benötigt. Pro Level stehen fünf Minuten zur Verfügung.

## 1. Konsole – Verschobene Daten

Die Konsole zeigt den verschlüsselten Text **UHVHW**. Der Spieler gibt den
entschlüsselten Befehl in ein Textfeld ein und klickt auf PRÜFEN oder drückt Enter.

Nur im Glitch-Modus erscheint die Erklärung: Jeder Buchstabe wurde um drei
Stellen nach vorne verschoben; zum Entschlüsseln geht man drei Stellen zurück.
Die Beispiele D → A und E → B erklären das Verfahren, ohne die Lösung zu nennen.

Lösung: U → R, H → E, V → S, H → E, W → T, also **RESET**.
Gross-/Kleinschreibung und Leerzeichen am Anfang oder Ende werden ignoriert.
Eine leere oder falsche Antwort zeigt eine Fehlermeldung; ein neuer Versuch bleibt möglich.

## 2. Tresor – Datenfragmente

Vier sichtbare Fragmente enthalten die Ziffern A = 8, B = 2, C = 6 und D = 4.
Der Spieler muss sie in der ursprünglichen Reihenfolge zusammensetzen und den
vierstelligen Code eingeben.

Nur im Glitch-Modus erscheint die Reihenfolge **C → A → D → B**.
Zusammen mit den Fragmenten ergibt dies die Lösung **6842**.

Andere Codes werden abgelehnt. Eingaben mit weniger als vier Ziffern oder mit
Buchstaben erhalten eine eigene Eingabemeldung. Das Rätsel darf erneut versucht werden.

## 3. Server – Sicherer Neustart

Vier Module A, B, C und D können über Checkboxen eingeschaltet werden.
Genau zwei intakte Module müssen aktiv sein; beschädigte Module bleiben aus.

Nur im Glitch-Modus zeigt die Diagnose: **A beschädigt, B intakt,
C beschädigt, D intakt**.

Lösung: **A AUS, B AN, C AUS, D AN**. Intern wird die Auswahl als **0101** geprüft.
Falsche Kombinationen zeigen eine Fehlermeldung, lassen die Auswahl aber zur Korrektur stehen.

## Ablauf und gemeinsame Spiellogik

1. Spieler erreicht nach dem Ausgang von Level 1 den zweiten Raum.
2. Konsole, Tresor und Server öffnen jeweils eines der neuen Rätsel.
3. Der Glitch-Button blendet die Hinweise ein und wieder aus, auch bei geöffnetem Rätsel.
4. Eine richtige Antwort sperrt die Eingaben und aktualisiert den Zähler.
5. Erledigte Rätsel bleiben nach Schliessen und Neuladen erledigt.
6. Erst bei 3/3 wird die bestehende Ausgangstür freigeschaltet.
7. Beim Ausgang erscheint aktuell der Gewinnbildschirm; spätere Levels werden von Kaito ergänzt.
8. Läuft die Zeit ab, erscheint der Verlustbildschirm. Ein neues Spiel setzt alle Rätsel zurück.

Die früheren Platzhalter EXIT, 3 und GLITCH werden ersetzt. Bereits gespeicherte
Platzhalter-Erfolge von Level 2 werden verworfen, damit die neuen Rätsel tatsächlich
gespielt werden. Level 1 und die gespeicherte Bestzeit werden dadurch nicht gelöscht.

## Abgrenzung zum 13.11

Die Rätsel sind am 06.11 in der bestehenden Objektgruppe spielbar. Für den 13.11
bleiben die gemeinsame Abstimmung mit Faruks überarbeitetem Raum, das Testen der
endgültigen Oberfläche und das Konzept für Level 3 vorgesehen. Diese späteren
Arbeitspakete werden heute nicht abgehakt.
