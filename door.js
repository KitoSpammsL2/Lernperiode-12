
let doorUnlocked = false;

// Prüfen, ob die Tür geöffnet werden darf
function checkDoor() {
    doorUnlocked = allPuzzlesSolved();

    if (doorUnlocked) {
        console.log("Alle Rätsel gelöst! Tür freigeschaltet.");
    } else {
        console.log("Tür verschlossen! Löse zuerst alle Rätsel.");
    }

    return doorUnlocked;
}

// Spieler versucht, die Tür zu öffnen
function openDoor() {
    if (currentState !== GameState.PLAYING) {
        console.log("Das Spiel läuft noch nicht.");
        return false;
    }

    if (!checkDoor()) {
        return false;
    }

    console.log("Tür geöffnet! Level abgeschlossen.");
    completeLevel();

    return true;
}

// Gewinnbildschirm erstellen
function showWinScreen() {
    let screen = document.getElementById("winScreen");

    if (!screen) {
        screen = document.createElement("div");
        screen.id = "winScreen";

        screen.style.cssText = `
            position: fixed;
            inset: 0;
            background: #090914;
            color: #00ffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;

        document.body.appendChild(screen);
    }

    screen.innerHTML = `
        <h1>SIMULATION ABGESCHLOSSEN</h1>
        <h2>Du bist entkommen!</h2>
        <button id="backToMenu">HAUPTMENÜ</button>
    `;

    document.getElementById("backToMenu")
        .addEventListener("click", () => {
            returnToMenu();
            screen.remove();
        });
}

// Gewinnbildschirm bei Spielgewinn anzeigen
document.addEventListener("gameStateChanged", (event) => {
    if (event.detail.state === GameState.WON) {
        showWinScreen();
    }
});
