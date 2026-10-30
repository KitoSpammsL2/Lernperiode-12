const GameState = {
    START: "start",
    PLAYING: "playing",
    WON: "won",
    LOST: "lost"
};

// Seiten des Spiels: neue Levels werden hier der Reihe nach eingetragen
const menuPage = "index.html";
const levelPages = ["room.html"];
const maxLevels = levelPages.length;

const stateStorageKey = "glitchGameState";

let currentState = GameState.START;
let currentLevel = 1;

// Name der aktuellen Seite, z.B. "room.html"
function getCurrentPage() {
    return location.pathname.split("/").pop() || menuPage;
}

function isLevelPage() {
    return levelPages.includes(getCurrentPage());
}

// Spielzustand für den Seitenwechsel speichern (gilt nur für diesen Tab)
function saveGameState() {
    try {
        sessionStorage.setItem(
            stateStorageKey,
            JSON.stringify({ state: currentState, level: currentLevel })
        );
    } catch (error) {
        console.error("Spielzustand konnte nicht gespeichert werden.", error);
    }
}

// Gespeicherten Spielzustand laden und auf Gültigkeit prüfen
function loadGameState() {
    try {
        const saved = JSON.parse(sessionStorage.getItem(stateStorageKey));

        if (saved && Object.values(GameState).includes(saved.state)) {
            currentState = saved.state;
        }

        if (saved && saved.level >= 1 && saved.level <= maxLevels) {
            currentLevel = saved.level;
        }
    } catch (error) {
        console.error("Spielzustand konnte nicht geladen werden.", error);
    }
}

// Alle Seiten über den aktuellen Zustand informieren
function announceState() {
    document.dispatchEvent(
        new CustomEvent("gameStateChanged", {
            detail: { state: currentState, level: currentLevel }
        })
    );
}

// Spielzustand ändern
function changeState(newState) {
    currentState = newState;
    console.log("Spielzustand:", currentState);

    saveGameState();
    announceState();
}

// Neues Spiel: alten Rätselfortschritt löschen und zum ersten Level wechseln
function startGame() {
    currentLevel = 1;
    resetAllPuzzles();
    changeState(GameState.PLAYING);
    location.href = levelPages[0];
}

// Level abschliessen: nächstes Level laden oder gewinnen
function completeLevel() {
    if (currentState !== GameState.PLAYING) return;

    if (currentLevel < maxLevels) {
        currentLevel++;
        console.log("Level", currentLevel, "gestartet");
        changeState(GameState.PLAYING);
        location.href = levelPages[currentLevel - 1];
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

    if (getCurrentPage() !== menuPage) {
        location.href = menuPage;
    }
}

loadGameState();

// Ein Level ohne gestartetes Spiel führt zurück ins Hauptmenü
if (isLevelPage() && currentState === GameState.START) {
    location.replace(menuPage);
}

document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startButton");

    // Im Hauptmenü läuft kein Spiel
    if (startButton) {
        if (currentState !== GameState.START) {
            returnToMenu();
        }

        startButton.addEventListener("click", startGame);
    }

    // Nach einem Neuladen den gespeicherten Zustand erneut anzeigen
    if (isLevelPage()) {
        announceState();
    }
});
