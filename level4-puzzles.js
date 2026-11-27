// Systemkern: zyklische Zahlen, Signalverarbeitung und parallele Prozesse.
const level4Views = {
    puzzle1: {
        title: "WARTUNG – ZEHNERRÄDER",
        html: `
            <p>Vier Räder zeigen A = 7, B = 2, C = 9 und D = 4.
                Berechne ihre Endstellungen und gib den vierstelligen Wartungscode ein.</p>
            <p class="glitch-hint">Jedes Rad läuft von 0 bis 9 im Kreis. Nach 9 kommt 0, vor 0 kommt 9.
                Drehe A um +5, B um −7, C um +8 und D um −6 Schritte.
                Lies danach die Räder in der Reihenfolge C → A → D → B ab.</p>
            <form id="textForm">
                <label for="textInput">Wartungscode</label>
                <input id="textInput" type="text" inputmode="numeric" maxlength="4"
                       autocomplete="off" placeholder="Vier Ziffern">
                <button type="submit">PRÜFEN</button>
            </form>`,
        setup: setupMaintenancePuzzle,
        incorrect: "Prüfe den Überlauf bei 0 und 9 und die Reihenfolge der Räder.",
        reward: { id: "zugangskarte", name: "Zugangskarte", symbol: "▭" }
    },
    puzzle2: {
        title: "SIGNALVERSTÄRKER – XOR-FILTER",
        html: `
            <p>Empfangenes Signal: <strong>110010</strong>. Filtermaske: <strong>101101</strong>.
                Stelle die sechs Bits des gefilterten Signals ein. Jeder Klick wechselt zwischen 0 und 1.</p>
            <p class="glitch-hint">Verschiebe zuerst nur die Filtermaske zyklisch um zwei Stellen nach links.
                Die ersten beiden Bits wandern ans Ende. Beispiel: 100011 → 001110.
                Verknüpfe danach Signal und verschobene Maske mit XOR.
                Gleiche Bits ergeben 0, unterschiedliche Bits ergeben 1.</p>
            <div class="symbol-buttons" aria-label="Ausgabebits von links nach rechts">
                ${[1, 2, 3, 4, 5, 6].map(position => `<button type="button" data-signal-bit="${position}"
                    aria-label="Bit ${position}: 0" aria-pressed="false">0</button>`).join("")}
            </div>
            <p id="signalPreview" role="status">Ausgabe: 000000</p>
            <button type="button" id="signalReset">ZURÜCKSETZEN</button>
            <button type="button" id="signalCheck">PRÜFEN</button>`,
        setup: setupSignalPuzzle,
        incorrect: "Das Signal stimmt nicht. Verschiebe zuerst die Maske und prüfe danach jedes XOR-Bit."
    },
    puzzle3: {
        title: "KONTROLLRAUM – PROZESSPLAN",
        html: `
            <p>Plane den frühestmöglichen Systemstart ab Zeitpunkt 0.
                Prozesse dürfen parallel laufen. Jeder Prozess beginnt sofort, sobald alle seine Vorgänger fertig sind.
                Alle Angaben sind Recheneinheiten und unabhängig vom Spieltimer.</p>
            <ul>
                <li>A dauert 3 Einheiten.</li><li>B dauert 5 Einheiten.</li>
                <li>C dauert 4 Einheiten.</li><li>D dauert 7 Einheiten.</li>
                <li>E dauert 2 Einheiten.</li>
            </ul>
            <p class="glitch-hint">A und B starten bei 0. C wartet auf A und B.
                D wartet auf A. E wartet auf C und D.
                Bei mehreren Vorgängern zählt der späteste Endzeitpunkt.</p>
            <form id="processForm">
                <label for="processC">Startzeit von C</label>
                <input id="processC" type="text" inputmode="numeric" maxlength="3" autocomplete="off">
                <label for="processE">Startzeit von E</label>
                <input id="processE" type="text" inputmode="numeric" maxlength="3" autocomplete="off">
                <label for="processEnd">Endzeit von E</label>
                <input id="processEnd" type="text" inputmode="numeric" maxlength="3" autocomplete="off">
                <button type="submit">PRÜFEN</button>
            </form>`,
        setup: setupProcessPuzzle,
        incorrect: "Prüfe die Vorgänger. Parallele Prozesse warten jeweils auf das späteste benötigte Ende.",
        requires: { id: "zugangskarte", name: "Zugangskarte" }
    }
};

function setupMaintenancePuzzle(puzzleId) {
    document.getElementById("textForm").addEventListener("submit", event => {
        event.preventDefault();
        const answer = document.getElementById("textInput").value.trim();
        if (!/^\d{4}$/.test(answer)) {
            showPuzzleFeedback("Gib genau vier Ziffern ein, auch wenn der Code mit 0 beginnt.", false);
            return;
        }
        submitAnswer(puzzleId, answer);
    });
}

function setupSignalPuzzle(puzzleId) {
    const bits = [0, 0, 0, 0, 0, 0];
    const buttons = [...puzzleArea.querySelectorAll("[data-signal-bit]")];
    function render() {
        buttons.forEach((button, index) => {
            button.textContent = String(bits[index]);
            button.setAttribute("aria-pressed", String(bits[index] === 1));
            button.setAttribute("aria-label", `Bit ${index + 1}: ${bits[index]}`);
        });
        document.getElementById("signalPreview").textContent = "Ausgabe: " + bits.join("");
    }
    buttons.forEach((button, index) => button.addEventListener("click", () => {
        bits[index] = 1 - bits[index];
        render();
    }));
    document.getElementById("signalReset").addEventListener("click", () => {
        bits.fill(0);
        render();
    });
    document.getElementById("signalCheck").addEventListener("click", () => {
        submitAnswer(puzzleId, bits.join(""));
    });
}

function setupProcessPuzzle(puzzleId) {
    document.getElementById("processForm").addEventListener("submit", event => {
        event.preventDefault();
        const values = ["processC", "processE", "processEnd"]
            .map(id => document.getElementById(id).value.trim());
        if (!values.every(value => /^\d{1,3}$/.test(value))) {
            showPuzzleFeedback("Fülle alle drei Zeitfelder mit ganzen Zahlen ab 0 aus.", false);
            return;
        }
        submitAnswer(puzzleId, values.map(Number).join(":"));
    });
}
