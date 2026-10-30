
// Rätsel pro Level: neue Levels bekommen hier ihre eigenen Lösungen
const levelPuzzles = {
    1: {
        puzzle1: "2048",
        puzzle2: "GLITCH",
        // Schalter A an, B aus, C an
        puzzle3: "101"
    }
};

// Fortschritt aller Levels, z.B. { level1: { puzzle1: true, ... } }
const progressStorageKey = "glitchProgress";

// Rätsel des aktuellen Levels (currentLevel kommt aus script.js)
let puzzles = {};

// Gespeicherten Fortschritt aller Levels lesen
function loadProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem(progressStorageKey));
        return saved && typeof saved === "object" ? saved : {};
    } catch (error) {
        console.error("Spielstand konnte nicht geladen werden.", error);
        return {};
    }
}

// Rätsel des aktuellen Levels vorbereiten und dessen Fortschritt laden
function loadPuzzles() {
    const solutions = levelPuzzles[currentLevel] || {};
    const levelProgress = loadProgress()["level" + currentLevel] || {};

    puzzles = {};

    for (const id in solutions) {
        puzzles[id] = {
            solution: solutions[id],
            solved: levelProgress[id] === true
        };
    }
}

function checkPuzzle(puzzleId, answer) {
    const puzzle = puzzles[puzzleId];

    if (!puzzle) {
        console.log("Rätsel existiert nicht.");
        return false;
    }

    if (puzzle.solved) {
        console.log("Dieses Rätsel wurde bereits gelöst.");
        return true;
    }

    const input = String(answer).trim().toUpperCase();

    if (input === puzzle.solution) {
        puzzle.solved = true;
        savePuzzles();

        console.log(puzzleId + " wurde gelöst!");
        return true;
    }

    console.log("Falsche Lösung!");
    return false;
}

// Fortschritt des aktuellen Levels speichern, andere Levels bleiben erhalten
function savePuzzles() {
    const progress = loadProgress();
    const levelProgress = {};

    for (const id in puzzles) {
        levelProgress[id] = puzzles[id].solved;
    }

    progress["level" + currentLevel] = levelProgress;

    try {
        localStorage.setItem(progressStorageKey, JSON.stringify(progress));
    } catch (error) {
        console.error("Spielstand konnte nicht gespeichert werden.", error);
    }
}

function isPuzzleSolved(puzzleId) {
    return puzzles[puzzleId] !== undefined && puzzles[puzzleId].solved;
}

function getSolvedCount() {
    return Object.values(puzzles)
        .filter(puzzle => puzzle.solved).length;
}

function allPuzzlesSolved() {
    const list = Object.values(puzzles);

    // Ein Level ohne Rätsel darf die Tür nicht öffnen
    return list.length > 0 && list.every(puzzle => puzzle.solved);
}

// Rätsel des aktuellen Levels zurücksetzen
function resetPuzzles() {
    for (const id in puzzles) {
        puzzles[id].solved = false;
    }

    savePuzzles();
    console.log("Rätsel von Level " + currentLevel + " wurden zurückgesetzt.");
}

// Fortschritt aller Levels löschen, z.B. bei einem neuen Spiel
function resetAllPuzzles() {
    try {
        localStorage.removeItem(progressStorageKey);
    } catch (error) {
        console.error("Spielstand konnte nicht gelöscht werden.", error);
    }

    loadPuzzles();
    console.log("Alle Rätsel wurden zurückgesetzt.");
}

loadPuzzles();
