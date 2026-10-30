
const endScreen = document.getElementById("endScreen");
const endTitle = document.getElementById("endTitle");
const endMessage = document.getElementById("endMessage");

let gameEnded = false;

function showWinScreen() {
    if (gameEnded) return;

    gameEnded = true;

    endTitle.textContent = "SIMULATION VERLASSEN!";
    endMessage.textContent =
        "Glückwunsch! Du hast alle Rätsel gelöst und bist entkommen.";

    endScreen.hidden = false;
}

function showLoseScreen() {
    if (gameEnded) return;

    gameEnded = true;

    endTitle.textContent = "GAME OVER";
    endMessage.textContent =
        "Die Zeit ist abgelaufen. Die Simulation hat dich besiegt.";

    endScreen.hidden = false;
}

document.getElementById("restartGame")
    .addEventListener("click", () => {
        // Neustart ohne alten Rätsel-Fortschritt
        localStorage.removeItem("solvedPuzzles");
        sessionStorage.clear();
        window.location.href = "index.html";
    });

/* Gewinn nach drei gelösten Rätseln und Türöffnung */

function allRoomPuzzlesSolved() {
    if (typeof checkDoor === "function") {
        return checkDoor() === true;
    }

    return false;
}

document.querySelectorAll('[data-object="tuer"]')
    .forEach(door => {
        door.addEventListener("click", () => {
            if (allRoomPuzzlesSolved()) {
                showWinScreen();
            }
        });
    });

/* Timer überwachen */

const timerElement = document.getElementById("timer");

if (timerElement) {
    const timerObserver = new MutationObserver(() => {
        const value = timerElement.textContent.trim();

        if (value === "00:00" || value === "0:00") {
            showLoseScreen();
        }
    });

    timerObserver.observe(timerElement, {
        childList: true,
        characterData: true,
        subtree: true
    });
}
