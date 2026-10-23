const GameState = {
    START: "start",
    PLAYING: "playing",
    WON: "won",
    LOST: "lost"
};

let currentState = GameState.START;
let currentLevel = 1;
const maxLevels = 5;

// Spielzustand ändern
function changeState(newState) {
    currentState = newState;
    console.log("Spielzustand:", currentState);

    document.dispatchEvent(
        new CustomEvent("gameStateChanged", {
            detail: { state: currentState, level: currentLevel }
        })
    );
}

// Spiel starten
function startGame() {
    currentLevel = 1;
    changeState(GameState.PLAYING);
}

// Level abschliessen
function completeLevel() {
    if (currentState !== GameState.PLAYING) return;

    if (currentLevel < maxLevels) {
        currentLevel++;
        console.log("Level", currentLevel, "gestartet");
        changeState(GameState.PLAYING);
    } else {
        changeState(GameState.WON);
    }
}

// Spiel verlieren
function loseGame() {
    if (currentState !== GameState.PLAYING) return;
    changeState(GameState.LOST);
}

// Zurück zum Hauptmenü
function returnToMenu() {
    currentLevel = 1;
    changeState(GameState.START);
}

// Start-Button mit der Spiellogik verbinden
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startButton");

    if (startButton) {
        startButton.addEventListener("click", startGame);
    }
});
