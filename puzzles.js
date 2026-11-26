
// Rätsel pro Level: neue Levels bekommen hier ihre eigenen Lösungen
const levelPuzzles = {
    1: {
        puzzle1: "2048",
        puzzle2: "GLITCH",
        // Schalter A an, B aus, C an
        puzzle3: "101"
    },
    // Level 2: Caesar-Code, sortierte Datenfragmente, intakte Servermodule
    2: {
        puzzle1: "RESET",
        puzzle2: "6842",
        puzzle3: "0101"
    },
    // Quarantäne: Chipfolge, repariertes Datenpaket, günstigste Route
    3: {
        puzzle1: "97624",
        puzzle2: "6:1011",
        puzzle3: "SBCDZ"
    },
    // Platzhalter, bis Laurentius Rätsel für Level 4 fertig sind
    4: {
        puzzle1: "4",
        puzzle2: "SIGNAL",
        puzzle3: "ZUGANG"
    }
};

// Fortschritt aller Levels, z.B. { level1: { puzzle1: true, ... } }
const progressStorageKey = "glitchProgress";

// Gefundene Gegenstände, z.B. [{ id: "zugangskarte", name: "Zugangskarte", symbol: "▭", level: 4 }]
const inventoryStorageKey = "glitchInventory";

// Rätsel des aktuellen Levels (currentLevel kommt aus script.js)
let puzzles = {};

// Gespeicherten Fortschritt aller Levels lesen
function loadProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem(progressStorageKey));
        return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch (error) {
        console.error("Spielstand konnte nicht geladen werden.", error);
        return {};
    }
}

// Rätsel des aktuellen Levels vorbereiten und dessen Fortschritt laden
function loadPuzzles() {
    const solutions = levelPuzzles[currentLevel] || {};
    let levelProgress = loadProgress()["level" + currentLevel] || {};

    // Alte Platzhalterlösungen zählen nicht für die neuen Rätsel von Level 2.
    // Der Fortschritt von Level 1 bleibt erhalten.
    if (currentLevel === 2 && levelProgress.version !== 2) {
        levelProgress = {};
    }

    // Erfolge der Level-3-Platzhalter zählen nicht für die neuen Aufgaben.
    if (currentLevel === 3 && levelProgress.version !== 1) {
        levelProgress = {};
    }

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

    if (currentLevel === 2) {
        levelProgress.version = 2;
    }

    if (currentLevel === 3) {
        levelProgress.version = 1;
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

// Inventar lesen; beschädigte Einträge werden ignoriert
function loadInventory() {
    try {
        const saved = JSON.parse(localStorage.getItem(inventoryStorageKey));
        return Array.isArray(saved) ? saved.filter(item => item && typeof item.id === "string") : [];
    } catch (error) {
        console.error("Inventar konnte nicht geladen werden.", error);
        return [];
    }
}

function saveInventory(items) {
    try {
        localStorage.setItem(inventoryStorageKey, JSON.stringify(items));
    } catch (error) {
        console.error("Inventar konnte nicht gespeichert werden.", error);
    }
}

// Gegenstand ins Inventar legen; jeder Gegenstand kommt nur einmal vor
function addItem(item) {
    const items = loadInventory();

    if (items.some(saved => saved.id === item.id)) return false;

    items.push({ id: item.id, name: item.name, symbol: item.symbol || "◆", level: currentLevel });
    saveInventory(items);
    return true;
}

function hasItem(itemId) {
    return loadInventory().some(item => item.id === itemId);
}

// Fortschritt eines einzelnen Levels löschen, z.B. beim Neustart dieses Levels
function resetLevelProgress(level) {
    const progress = loadProgress();
    delete progress["level" + level];

    try {
        localStorage.setItem(progressStorageKey, JSON.stringify(progress));
    } catch (error) {
        console.error("Spielstand konnte nicht gespeichert werden.", error);
    }

    // Gegenstände aus diesem Level gehen beim Neustart ebenfalls verloren
    saveInventory(loadInventory().filter(item => item.level !== level));

    if (level === currentLevel) {
        loadPuzzles();
    }
}

// Fortschritt aller Levels löschen, z.B. bei einem neuen Spiel
function resetAllPuzzles() {
    try {
        localStorage.removeItem(progressStorageKey);
        localStorage.removeItem(inventoryStorageKey);
    } catch (error) {
        console.error("Spielstand konnte nicht gelöscht werden.", error);
    }

    loadPuzzles();
    console.log("Alle Rätsel wurden zurückgesetzt.");
}

loadPuzzles();
