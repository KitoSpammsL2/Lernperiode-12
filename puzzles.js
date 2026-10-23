
const puzzles = {
    puzzle1: {
        solution: "2048",
        solved: false
    },
    puzzle2: {
        solution: "GLITCH",
        solved: false
    },
    puzzle3: {
        solution: "SYSTEM",
        solved: false
    }
};

function loadPuzzles() {
    const saved = localStorage.getItem("glitchPuzzles");

    if (saved) {
        try {
            const progress = JSON.parse(saved);

            for (const id in puzzles) {
                puzzles[id].solved = progress[id] === true;
            }
        } catch (error) {
            console.error("Spielstand konnte nicht geladen werden.", error);
        }
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

function savePuzzles() {
    const progress = {};

    for (const id in puzzles) {
        progress[id] = puzzles[id].solved;
    }

    localStorage.setItem(
        "glitchPuzzles",
        JSON.stringify(progress)
    );
}

function getSolvedCount() {
    return Object.values(puzzles)
        .filter(puzzle => puzzle.solved).length;
}

function allPuzzlesSolved() {
    return Object.values(puzzles)
        .every(puzzle => puzzle.solved);
}

function resetPuzzles() {
    for (const id in puzzles) {
        puzzles[id].solved = false;
    }

    localStorage.removeItem("glitchPuzzles");
    console.log("Rätsel wurden zurückgesetzt.");
}

loadPuzzles();
