const GameState = {
    START: "start",
    PLAYING: "playing",
    WON: "won",
    LOST: "lost"
};

// Seiten des Spiels: neue Levels werden hier der Reihe nach eingetragen
const menuPage = "index.html";
const levelPages = ["room.html", "room2.html"];
const maxLevels = levelPages.length;

const stateStorageKey = "glitchGameState";
const bestTimeKey = "glitchBestTime";

// Zeit pro Level in Sekunden
const levelSeconds = 300;

let currentState = GameState.START;
let currentLevel = 1;

// Verhindert, dass ein Doppelklick auf den Ausgang zwei Levels auf einmal abschliesst
let levelChanging = false;

// Zeitpunkt, an dem die Zeit des aktuellen Levels abläuft (null = noch nicht gestartet)
let levelEndTime = null;

// Startzeit des Spiels und Ergebnis des aktuellen Durchgangs
let gameStartTime = null;
let runSeconds = null;
let newBestTime = false;

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
            JSON.stringify({
                state: currentState,
                level: currentLevel,
                levelEndTime: levelEndTime,
                gameStartTime: gameStartTime,
                runSeconds: runSeconds,
                newBestTime: newBestTime
            })
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

        if (saved && Number.isInteger(saved.level) && saved.level >= 1 && saved.level <= maxLevels) {
            currentLevel = saved.level;
        }

        if (saved && Number.isFinite(saved.levelEndTime)) {
            levelEndTime = saved.levelEndTime;
        }

        if (saved && Number.isFinite(saved.gameStartTime)) {
            gameStartTime = saved.gameStartTime;
        }

        if (saved && Number.isFinite(saved.runSeconds)) {
            runSeconds = saved.runSeconds;
        }

        newBestTime = Boolean(saved) && saved.newBestTime === true;
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

// Zeit des aktuellen Levels starten, nach dem Neuladen läuft die gespeicherte Zeit weiter
function startLevelTime() {
    if (levelEndTime === null && currentState === GameState.PLAYING) {
        levelEndTime = Date.now() + levelSeconds * 1000;
        saveGameState();
    }
}

// Restzeit des aktuellen Levels in Sekunden
function getTimeLeft() {
    if (levelEndTime === null) return levelSeconds;

    return Math.max(0, Math.ceil((levelEndTime - Date.now()) / 1000));
}

// Zeit als mm:ss anzeigen
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

// Gespeicherte Bestzeit in Sekunden lesen (null = noch keine)
function getBestTime() {
    try {
        const saved = Number(localStorage.getItem(bestTimeKey));
        return Number.isInteger(saved) && saved > 0 ? saved : null;
    } catch (error) {
        console.error("Bestzeit konnte nicht geladen werden.", error);
        return null;
    }
}

// Benötigte Zeit messen und eine neue Bestzeit speichern
function saveRunTime() {
    if (gameStartTime === null) return;

    runSeconds = Math.max(1, Math.round((Date.now() - gameStartTime) / 1000));

    const bestTime = getBestTime();
    newBestTime = bestTime === null || runSeconds < bestTime;

    if (newBestTime) {
        try {
            localStorage.setItem(bestTimeKey, String(runSeconds));
        } catch (error) {
            console.error("Bestzeit konnte nicht gespeichert werden.", error);
        }
    }
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
    levelEndTime = null;
    gameStartTime = Date.now();
    runSeconds = null;
    newBestTime = false;
    resetAllPuzzles();
    changeState(GameState.PLAYING);
    location.href = levelPages[0];
}

// Level abschliessen: nächstes Level laden oder gewinnen
function completeLevel() {
    if (currentState !== GameState.PLAYING || levelChanging) return;

    if (currentLevel < maxLevels) {
        levelChanging = true;
        currentLevel++;
        levelEndTime = null;
        console.log("Level", currentLevel, "gestartet");
        changeState(GameState.PLAYING);
        location.href = levelPages[currentLevel - 1];
    } else {
        saveRunTime();
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
} else if (isLevelPage() && getCurrentPage() !== levelPages[currentLevel - 1]) {
    // Immer das aktuelle Level anzeigen, z.B. nach dem Zurück-Knopf des Browsers
    location.replace(levelPages[currentLevel - 1]);
}

// Der Browser kann eine Seite samt altem Zustand aus dem Speicher wiederherstellen
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        location.reload();
    }
});

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
