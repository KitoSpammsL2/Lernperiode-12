
const modal = document.getElementById("puzzleModal");
const puzzleTitle = document.getElementById("puzzleTitle");
const puzzleQuestion = document.getElementById("puzzleQuestion");
const puzzleAnswer = document.getElementById("puzzleAnswer");
const puzzleFeedback = document.getElementById("puzzleFeedback");

const roomPuzzles = {
    terminal: {
        id: "puzzle1",
        title: "Terminal-Code",
        question: "Entschlüssle den Code des Terminals."
    },
    schrank: {
        id: "puzzle2",
        title: "Geheimschrift",
        question: "Welches Wort beschreibt die Simulation?"
    },
    energie: {
        id: "puzzle3",
        title: "Systemrätsel",
        question: "Welches Wort steuert das System?"
    }
};

let activePuzzle = null;

function openPuzzle(objectName) {
    const puzzle = roomPuzzles[objectName];

    if (!puzzle) return;

    activePuzzle = puzzle.id;

    puzzleTitle.textContent = puzzle.title;
    puzzleQuestion.textContent = puzzle.question;
    puzzleAnswer.value = "";
    puzzleFeedback.textContent = "";

    modal.hidden = false;
    puzzleAnswer.focus();
}

function closePuzzle() {
    modal.hidden = true;
    activePuzzle = null;
}

document.getElementById("closePuzzle")
    .addEventListener("click", closePuzzle);

document.getElementById("submitPuzzle")
    .addEventListener("click", () => {
        if (!activePuzzle) return;

        if (typeof checkPuzzle !== "function") {
            puzzleFeedback.textContent =
                "Rätselsystem konnte nicht geladen werden.";
            return;
        }

        const correct = checkPuzzle(
            activePuzzle,
            puzzleAnswer.value.trim()
        );

        if (correct) {
            puzzleFeedback.textContent = "Rätsel gelöst!";
            puzzleFeedback.style.color = "#00ff99";

            document.dispatchEvent(
                new CustomEvent("roomPuzzleSolved", {
                    detail: { id: activePuzzle }
                })
            );

            setTimeout(closePuzzle, 800);
        } else {
            puzzleFeedback.textContent =
                "Falsche Lösung! Versuche es erneut.";
            puzzleFeedback.style.color = "#ff00aa";
        }
    });

puzzleAnswer.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        document.getElementById("submitPuzzle").click();
    }
});

document.querySelectorAll(".object").forEach(object => {
    object.addEventListener("click", () => {
        const name = object.dataset.object;

        if (roomPuzzles[name]) {
            openPuzzle(name);
        }
    });
});
