// Rätsel im Spielraum
// Verbindet die Gegenstände mit dem Rätselsystem (puzzles.js)
// und die Ausgangstür mit der Türmechanik (door.js).
// Rätselideen und Hinweise: Laurentiu (Idee.MD, laurentiu/demo.html)

// Welcher Gegenstand öffnet welches Rätsel, pro Level
const levelObjects = {
    1: {
        schrank: "puzzle1",
        terminal: "puzzle2",
        stromkasten: "puzzle3"
    },
    2: {
        konsole: "puzzle1",
        tresor: "puzzle2",
        server: "puzzle3"
    }
};

const puzzleObjects = levelObjects[currentLevel] || {};

// Inhalt und Steuerung der drei Rätsel von Level 1
const level1Views = {
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

// Laurentius Rätsel für Level 2; die bestehende Objektgruppe bleibt erhalten.
const level2Views = {
    puzzle1: textPuzzle(
        "KONSOLE – VERSCHOBENE DATEN",
        "Die Konsole zeigt UHVHW. Entschlüssle den Befehl aus fünf Buchstaben.",
        "Jeder Buchstabe wurde im Alphabet um 3 Stellen nach vorne verschoben. " +
        "Gehe zum Entschlüsseln 3 Stellen zurück (D → A, E → B)."
    ),
    puzzle2: {
        title: "TRESOR – DATENFRAGMENTE",
        html: `
            <p>Vier Fragmente enthalten je eine Ziffer des Tresorcodes.
               Bringe die Fragmente in die ursprüngliche Reihenfolge.</p>
            <div class="color-code" aria-label="Datenfragmente">
                <span class="color">A = 8</span>
                <span class="color">B = 2</span>
                <span class="color">C = 6</span>
                <span class="color">D = 4</span>
            </div>
            <p class="glitch-hint">Wiederhergestellte Reihenfolge: C → A → D → B</p>
            <form id="codeForm">
                <input id="codeInput" type="text" inputmode="numeric" maxlength="4"
                       autocomplete="off" placeholder="4 Zahlen" aria-label="Tresorcode">
                <button type="submit">PRÜFEN</button>
            </form>
        `,
        setup: setupCodeLock
    },
    puzzle3: {
        title: "SERVER – SICHERER NEUSTART",
        html: `
            <p>Aktiviere genau zwei intakte Module und prüfe die Auswahl.
               Beschädigte Module müssen ausgeschaltet bleiben.</p>
            <p class="glitch-hint">Diagnose: A ist beschädigt. B ist intakt.
               C ist beschädigt. D ist intakt.</p>
            <div class="switches">
                <label><input type="checkbox" data-module="A"> Modul A</label>
                <label><input type="checkbox" data-module="B"> Modul B</label>
                <label><input type="checkbox" data-module="C"> Modul C</label>
                <label><input type="checkbox" data-module="D"> Modul D</label>
            </div>
            <button type="button" id="moduleSubmit">PRÜFEN</button>
        `,
        setup: setupServerPuzzle
    }
};

const puzzleViews = { 1: level1Views, 2: level2Views }[currentLevel] || {};

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
        view.setup(puzzleId);
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
function setupCodeLock(puzzleId) {
    document.getElementById("codeForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const code = document.getElementById("codeInput").value.trim();

        if (!/^\d{4}$/.test(code)) {
            showPuzzleFeedback("Bitte genau 4 Zahlen eingeben.", false);
            return;
        }

        submitAnswer(puzzleId, code);
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

// Level 2: vier Servermodule in der festen Reihenfolge A, B, C, D prüfen.
function setupServerPuzzle(puzzleId) {
    document.getElementById("moduleSubmit").addEventListener("click", () => {
        const answer = ["A", "B", "C", "D"]
            .map(name => puzzleArea.querySelector(`[data-module="${name}"]`).checked ? "1" : "0")
            .join("");

        submitAnswer(puzzleId, answer);
    });
}

// Rätsel mit freier Texteingabe
function textPuzzle(title, question, hint) {
    return {
        title: title,
        html: `
            <p>${question}</p>
            <p class="glitch-hint">${hint}</p>
            <form id="textForm">
                <input id="textInput" type="text" autocomplete="off"
                       placeholder="Antwort" aria-label="Antwort">
                <button type="submit">PRÜFEN</button>
            </form>
        `,
        setup: setupTextPuzzle
    };
}

function setupTextPuzzle(puzzleId) {
    document.getElementById("textForm").addEventListener("submit", (event) => {
        event.preventDefault();
        submitAnswer(puzzleId, document.getElementById("textInput").value);
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
