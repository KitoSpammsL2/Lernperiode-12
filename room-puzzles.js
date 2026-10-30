// Rätsel im Spielraum
// Verbindet die Gegenstände mit dem Rätselsystem (puzzles.js)
// und die Ausgangstür mit der Türmechanik (door.js).
// Rätselideen und Hinweise: Laurentiu (Idee.MD, laurentiu/demo.html)

// Welcher Gegenstand öffnet welches Rätsel
const puzzleObjects = {
    schrank: "puzzle1",
    terminal: "puzzle2",
    stromkasten: "puzzle3"
};

// Inhalt und Steuerung der drei Rätsel
const puzzleViews = {
    puzzle1: {
        title: "ZAHLENSCHLOSS",
        html: `
            <p>Der Schrank ist mit einem Zahlenschloss gesichert.
               Die Reihenfolge ist Rot, Blau, Grün, Gelb.</p>
            <div class="color-code">
                <span class="color red">Rot <b class="glitch-hint">2</b></span>
                <span class="color blue">Blau <b class="glitch-hint">0</b></span>
                <span class="color green">Grün <b class="glitch-hint">4</b></span>
                <span class="color yellow">Gelb <b class="glitch-hint">8</b></span>
            </div>
            <form id="codeForm">
                <input id="codeInput" type="text" inputmode="numeric" maxlength="4"
                       autocomplete="off" placeholder="4 Zahlen" aria-label="Code">
                <button type="submit">PRÜFEN</button>
            </form>
        `,
        setup: setupCodeLock
    },
    puzzle2: {
        title: "GEHEIMSCHRIFT",
        html: `
            <p>Auf dem Terminal blinken sechs Symbole.
               Klicke sie in der Reihenfolge des Wortes GLITCH an.</p>
            <p class="glitch-hint">★ = G, ▲ = L, ● = I, ◆ = T, ■ = C, ✚ = H</p>
            <div class="symbol-buttons">
                <button type="button" data-letter="H" aria-label="Plus">✚</button>
                <button type="button" data-letter="I" aria-label="Kreis">●</button>
                <button type="button" data-letter="L" aria-label="Dreieck">▲</button>
                <button type="button" data-letter="G" aria-label="Stern">★</button>
                <button type="button" data-letter="C" aria-label="Quadrat">■</button>
                <button type="button" data-letter="T" aria-label="Raute">◆</button>
            </div>
            <p id="symbolCount">Ausgewählt: 0 / 6</p>
            <button type="button" id="symbolReset">LÖSCHEN</button>
        `,
        setup: setupSymbolPuzzle
    },
    puzzle3: {
        title: "ENERGIESCHALTER",
        html: `
            <p>Genau zwei Schalter müssen eingeschaltet sein, damit der Strom fliesst.</p>
            <p class="glitch-hint">Warnung: Schalter B ist kaputt und muss AUS bleiben!</p>
            <div class="switches">
                <label><input type="checkbox" id="switchA"> Schalter A</label>
                <label><input type="checkbox" id="switchB"> Schalter B</label>
                <label><input type="checkbox" id="switchC"> Schalter C</label>
            </div>
            <button type="button" id="switchSubmit">PRÜFEN</button>
        `,
        setup: setupSwitchPuzzle
    }
};

// Bereich, in dem das geöffnete Rätsel angezeigt wird
const puzzleArea = document.createElement("section");
puzzleArea.id = "puzzleArea";
puzzleArea.hidden = true;
document.querySelector(".game-room").appendChild(puzzleArea);

const doorObject = document.querySelector('[data-object="tuer"]');

function showRoomMessage(text) {
    document.getElementById("message").textContent = text;
}

// Rätsel eines Gegenstands öffnen
function openPuzzle(puzzleId) {
    if (currentState !== GameState.PLAYING) return;

    const view = puzzleViews[puzzleId];
    const solved = isPuzzleSolved(puzzleId);

    puzzleArea.innerHTML = `
        <div class="puzzle-head">
            <h3>${view.title}</h3>
            <button type="button" id="closePuzzle" aria-label="Rätsel schliessen">✕</button>
        </div>
        ${solved ? "" : view.html}
        <p class="puzzle-feedback" id="puzzleFeedback"></p>
    `;
    puzzleArea.hidden = false;

    document.getElementById("closePuzzle").addEventListener("click", closePuzzle);

    if (solved) {
        showPuzzleFeedback("Dieses Rätsel ist bereits gelöst.", true);
    } else {
        view.setup();
    }

    puzzleArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function closePuzzle() {
    puzzleArea.hidden = true;
    puzzleArea.innerHTML = "";
}

function showPuzzleFeedback(text, success) {
    const feedback = document.getElementById("puzzleFeedback");
    feedback.textContent = text;
    feedback.className = success ? "puzzle-feedback success" : "puzzle-feedback error";
}

// Nach dem Lösen keine weiteren Eingaben zulassen
function lockPuzzleInputs() {
    puzzleArea.querySelectorAll("input, button:not(#closePuzzle)")
        .forEach(element => element.disabled = true);
}

// Antwort vom Rätselsystem prüfen lassen und den Raum aktualisieren
function submitAnswer(puzzleId, answer) {
    if (currentState !== GameState.PLAYING) return false;

    const correct = checkPuzzle(puzzleId, answer);

    if (correct) {
        showPuzzleFeedback("Richtig! Rätsel gelöst.", true);
        lockPuzzleInputs();
        updateProgress();
        updateDoor();
    } else {
        showPuzzleFeedback("Leider falsch. Versuche es nochmals.", false);
    }

    return correct;
}

// Rätsel 1: vierstelliger Code
function setupCodeLock() {
    document.getElementById("codeForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const code = document.getElementById("codeInput").value.trim();

        if (!/^\d{4}$/.test(code)) {
            showPuzzleFeedback("Bitte genau 4 Zahlen eingeben.", false);
            return;
        }

        submitAnswer("puzzle1", code);
    });
}

// Rätsel 2: Symbole in der richtigen Reihenfolge anklicken
function setupSymbolPuzzle() {
    const buttons = puzzleArea.querySelectorAll("[data-letter]");
    const counter = document.getElementById("symbolCount");
    let letters = "";

    function clearSymbols() {
        letters = "";
        buttons.forEach(button => button.disabled = false);
        counter.textContent = "Ausgewählt: 0 / 6";
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            letters += button.dataset.letter;
            button.disabled = true;
            counter.textContent = "Ausgewählt: " + letters.length + " / 6";

            if (letters.length === buttons.length && !submitAnswer("puzzle2", letters)) {
                clearSymbols();
            }
        });
    });

    document.getElementById("symbolReset").addEventListener("click", clearSymbols);
}

// Rätsel 3: Schalterstellung als Zahlenfolge, z.B. "101" = A an, B aus, C an
function setupSwitchPuzzle() {
    document.getElementById("switchSubmit").addEventListener("click", () => {
        const answer = ["switchA", "switchB", "switchC"]
            .map(id => document.getElementById(id).checked ? "1" : "0")
            .join("");

        submitAnswer("puzzle3", answer);
    });
}

// Ausgangstür freischalten, sobald alle Rätsel gelöst sind
function updateDoor() {
    const unlocked = allPuzzlesSolved();
    doorObject.classList.toggle("unlocked", unlocked);

    if (unlocked) {
        showRoomMessage("Alle Rätsel gelöst! Die Ausgangstür ist offen.");
    }
}

// Gegenstände mit ihren Rätseln verbinden
for (const objectName in puzzleObjects) {
    const object = document.querySelector(`[data-object="${objectName}"]`);

    if (object) {
        object.addEventListener("click", () => openPuzzle(puzzleObjects[objectName]));
    }
}

// Ausgangstür mit der Türmechanik verbinden
doorObject.addEventListener("click", () => {
    if (!openDoor()) {
        showRoomMessage(
            "Die Ausgangstür ist verschlossen. Gelöste Rätsel: " + getSolvedCount() + "/3"
        );
    }
});

// Rätsel schliessen, sobald das Spiel gewonnen oder verloren ist
document.addEventListener("gameStateChanged", (event) => {
    if (event.detail.state !== GameState.PLAYING) {
        closePuzzle();
    }
});

updateDoor();
