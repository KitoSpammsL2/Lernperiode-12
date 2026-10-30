
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

// Vollbild für das Spielende erstellen (Gewinn oder Niederlage)
function showEndScreen(id, color, html) {
    let screen = document.getElementById(id);

    if (!screen) {
        screen = document.createElement("div");
        screen.id = id;

        screen.style.cssText = `
            position: fixed;
            inset: 0;
            background: #090914;
            color: ${color};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;

        document.body.appendChild(screen);
    }

    screen.innerHTML = html;
    return screen;
}

// Gewinnbildschirm erstellen
function showWinScreen() {
    const screen = showEndScreen("winScreen", "#00ffff", `
        <h1>SIMULATION ABGESCHLOSSEN</h1>
        <h2>Du bist entkommen!</h2>
        <button id="backToMenu">HAUPTMENÜ</button>
    `);

    document.getElementById("backToMenu")
        .addEventListener("click", () => {
            returnToMenu();
            screen.remove();
        });
}

// Verlustbildschirm erstellen
function showLoseScreen() {
    showEndScreen("loseScreen", "#ff00aa", `
        <h1>ZEIT ABGELAUFEN</h1>
        <h2>Die Simulation hat dich behalten.</h2>
        <button id="restartGame">NEU STARTEN</button>
        <button id="loseToMenu">HAUPTMENÜ</button>
    `);

    document.getElementById("restartGame")
        .addEventListener("click", startGame);

    document.getElementById("loseToMenu")
        .addEventListener("click", returnToMenu);
}

// Passenden Bildschirm zum Spielzustand anzeigen
document.addEventListener("gameStateChanged", (event) => {
    if (event.detail.state === GameState.WON) {
        showWinScreen();
    }

    if (event.detail.state === GameState.LOST) {
        showLoseScreen();
    }
});
