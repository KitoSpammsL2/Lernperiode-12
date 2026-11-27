// Level 3: Hinweise liefern Regeln, aus denen der Spieler die Lösung ableitet.
const quarantineEdges = [
    { from: "S", to: "A", cost: 2, unstable: false },
    { from: "S", to: "B", cost: 3, unstable: false },
    { from: "A", to: "C", cost: 3, unstable: true },
    { from: "A", to: "E", cost: 4, unstable: false },
    { from: "B", to: "C", cost: 2, unstable: false },
    { from: "B", to: "D", cost: 3, unstable: true },
    { from: "C", to: "D", cost: 2, unstable: false },
    { from: "C", to: "E", cost: 3, unstable: false },
    { from: "D", to: "Z", cost: 3, unstable: true },
    { from: "E", to: "Z", cost: 3, unstable: false }
];

const level3Views = {
    puzzle1: {
        title: "ZUGRIFF – CHIPREIHENFOLGE",
        html: `
            <p>Setze jeden Chip genau einmal ein. Klicke die Chips in der gewünschten Reihenfolge an.</p>
            <p class="glitch-hint">9 steckt direkt links von 7. Zwischen 9 und 2 liegen genau zwei Chips.
                4 steckt rechts von 7 und rechts von 6. 6 steckt direkt neben 2.</p>
            <div class="symbol-buttons" aria-label="Verfügbare Chips">
                ${[2, 4, 6, 7, 9].map(chip => `<button type="button" data-chip="${chip}">${chip}</button>`).join("")}
            </div>
            <p id="chipOrder" role="status">Belegung: leer</p>
            <button type="button" id="chipUndo">LETZTEN ENTFERNEN</button>
            <button type="button" id="chipCheck">PRÜFEN</button>`,
        setup: setupChipPuzzle,
        incorrect: "Mindestens eine Regel ist verletzt. Prüfe die Abstände und Nachbarn."
    },
    puzzle2: {
        title: "DATENPUFFER – BITFEHLER",
        html: `
            <p>Empfangenes Paket: <strong>0110001</strong>. Genau ein Bit ist falsch.
                Markiere seine Position und lies nach der Reparatur die vier Nutzbits ab.</p>
            <p class="glitch-hint">Jede Prüfgruppe braucht eine gerade Anzahl Einsen (101 enthält zwei).
                A prüft 1, 3, 5, 7: in Ordnung. B prüft 2, 3, 6, 7: Fehler.
                C prüft 4, 5, 6, 7: Fehler. Lies die Nutzbits an Position 3, 5, 6, 7.
                Die Diagnose gilt für das ursprünglich empfangene Paket.</p>
            <div class="symbol-buttons" aria-label="Bitposition zum Reparieren wählen">
                ${[..."0110001"].map((bit, i) => `<button type="button" data-bit="${i + 1}" aria-pressed="false">${i + 1}: ${bit}</button>`).join("")}
            </div>
            <p id="bitPreview" role="status">Noch kein Bit ausgewählt.</p>
            <form id="bitForm">
                <label for="payload">Nutzbits nach der Reparatur</label>
                <input id="payload" type="text" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="Vier Bits">
                <button type="submit">PRÜFEN</button>
            </form>`,
        setup: setupBitPuzzle,
        incorrect: "Diese Bitposition repariert das Paket nicht. Vergleiche die drei Prüfgruppen."
    },
    puzzle3: {
        title: "ROUTENPULT – QUARANTÄNE",
        html: `
            <p>Finde die günstigste zulässige Route von S nach Z. Jede Station darf nur einmal besucht werden.
                Die Leitungen sind in beide Richtungen nutzbar. Klicke die nächste Station an.</p>
            <p class="glitch-hint">Besuche Kontrollpunkt C. Nutze genau eine instabile Leitung.
                Budget: 11. Unter allen zulässigen Wegen zählt der mit den geringsten Kosten.</p>
            <ul>${quarantineEdges.map(edge => `<li>${edge.from}–${edge.to}: ${edge.cost}
                <b class="glitch-hint">${edge.unstable ? "instabil" : "normal"}</b></li>`).join("")}</ul>
            <div class="symbol-buttons" aria-label="Nächste Station">
                ${[..."ABCDEZ"].map(node => `<button type="button" data-node="${node}">${node}</button>`).join("")}
            </div>
            <p id="routePreview" role="status">Route: S · Kosten: 0</p>
            <button type="button" id="routeUndo">SCHRITT ZURÜCK</button>
            <button type="button" id="routeCheck">PRÜFEN</button>`,
        setup: setupRoutePuzzle,
        incorrect: "Die Route ist zulässig, aber es gibt einen günstigeren Weg."
    }
};

function setupChipPuzzle(puzzleId) {
    const chosen = [];
    const buttons = [...puzzleArea.querySelectorAll("[data-chip]")];
    function render() {
        document.getElementById("chipOrder").textContent = "Belegung: " + (chosen.join(" → ") || "leer");
        buttons.forEach(button => button.disabled = chosen.includes(button.dataset.chip));
    }
    buttons.forEach(button => button.addEventListener("click", () => {
        chosen.push(button.dataset.chip);
        render();
    }));
    document.getElementById("chipUndo").addEventListener("click", () => {
        chosen.pop();
        render();
    });
    document.getElementById("chipCheck").addEventListener("click", () => {
        if (chosen.length !== 5) {
            showPuzzleFeedback("Setze zuerst alle fünf Chips ein.", false);
            return;
        }
        submitAnswer(puzzleId, chosen.join(""));
    });
}

function setupBitPuzzle(puzzleId) {
    let position = null;
    const buttons = [...puzzleArea.querySelectorAll("[data-bit]")];
    buttons.forEach(button => button.addEventListener("click", () => {
        position = Number(button.dataset.bit);
        buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
        const bits = [..."0110001"];
        bits[position - 1] = bits[position - 1] === "0" ? "1" : "0";
        document.getElementById("bitPreview").textContent = `Position ${position} umgedreht: ${bits.join("")}`;
    }));
    document.getElementById("bitForm").addEventListener("submit", event => {
        event.preventDefault();
        const payload = document.getElementById("payload").value.trim();
        if (position === null) {
            showPuzzleFeedback("Wähle zuerst die Position des fehlerhaften Bits (1 bis 7).", false);
            return;
        }
        if (!/^[01]{4}$/.test(payload)) {
            showPuzzleFeedback("Gib genau vier Bits ein. Erlaubt sind nur 0 und 1.", false);
            return;
        }
        const correct = submitAnswer(puzzleId, position + ":" + payload);
        if (!correct && position === 6) {
            showPuzzleFeedback("Die Bitposition stimmt. Prüfe die Lesereihenfolge der Nutzbits.", false);
        }
    });
}

function setupRoutePuzzle(puzzleId) {
    const route = ["S"];
    let totalCost = 0;
    let unstableCount = 0;
    const buttons = [...puzzleArea.querySelectorAll("[data-node]")];
    function findEdge(from, to) {
        return quarantineEdges.find(edge =>
            (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from));
    }
    function render() {
        totalCost = 0;
        unstableCount = 0;
        for (let i = 1; i < route.length; i++) {
            const edge = findEdge(route[i - 1], route[i]);
            totalCost += edge.cost;
            unstableCount += Number(edge.unstable);
        }
        const last = route[route.length - 1];
        buttons.forEach(button => button.disabled =
            last === "Z" || route.includes(button.dataset.node) || !findEdge(last, button.dataset.node));
        document.getElementById("routePreview").textContent = `Route: ${route.join(" → ")} · Kosten: ${totalCost}`;
    }
    buttons.forEach(button => button.addEventListener("click", () => {
        route.push(button.dataset.node);
        render();
    }));
    document.getElementById("routeUndo").addEventListener("click", () => {
        if (route.length > 1) route.pop();
        render();
    });
    document.getElementById("routeCheck").addEventListener("click", () => {
        let error = "";
        if (route[route.length - 1] !== "Z") error = "Erreiche zuerst den Ausgang Z.";
        else if (!route.includes("C")) error = "Die Route muss Kontrollpunkt C besuchen.";
        else if (unstableCount !== 1) error = "Nutze genau eine instabile Leitung.";
        else if (totalCost > 11) error = "Die Route überschreitet das Budget von 11.";
        if (error) {
            showPuzzleFeedback(error, false);
            return;
        }
        submitAnswer(puzzleId, route.join(""));
    });
    render();
}
