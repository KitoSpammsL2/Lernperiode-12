// Verbindung zum Backend (backend/server.js)
// Das Spiel funktioniert auch ohne Server, z.B. direkt als Datei geöffnet.

const apiUrl = "/api";
const playerIdKey = "glitchPlayerId";
const playerNameKey = "glitchPlayerName";

// Läuft das Spiel über den Express-Server? (Der Server setzt window.glitchServer)
function isServerAvailable() {
    return window.glitchServer === true;
}

// Zufällige Kennung dieses Browsers, damit der Server den Spielstand zuordnen kann
function getPlayerId() {
    try {
        let playerId = localStorage.getItem(playerIdKey);

        if (!playerId) {
            playerId = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
            localStorage.setItem(playerIdKey, playerId);
        }

        return playerId;
    } catch (error) {
        return null;
    }
}

// Spielername für die Bestzeiten (die Abfrage folgt mit der Rangliste)
function getPlayerName() {
    try {
        return localStorage.getItem(playerNameKey) || "Anonym";
    } catch (error) {
        return "Anonym";
    }
}

// Daten an die API senden; keepalive, damit die Anfrage einen Seitenwechsel übersteht
async function sendToServer(route, body) {
    if (!isServerAvailable()) return null;

    try {
        const response = await fetch(apiUrl + route, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            keepalive: true
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.warn("Server nicht erreichbar, Daten bleiben lokal gespeichert.");
        return null;
    }
}

// Freigeschaltetes Level und Bestzeit auf dem Server speichern
function saveProgressOnServer() {
    const playerId = getPlayerId();

    if (!playerId) return Promise.resolve(null);

    return sendToServer("/spielstand", {
        playerId: playerId,
        unlockedLevel: getUnlockedLevel(),
        bestTime: getBestTime()
    });
}

// Zeit eines ganzen Durchgangs an die Bestzeiten auf dem Server senden
function saveRunOnServer(seconds) {
    return sendToServer("/bestzeiten", { name: getPlayerName(), seconds: seconds });
}

// Status des Servers abfragen (null = kein Server erreichbar)
async function getServerStatus() {
    try {
        const response = await fetch(apiUrl + "/status");

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        return null;
    }
}

// Ergebnis auf der Testseite server-test.html anzeigen
async function showServerStatus() {
    const statusText = document.getElementById("serverStatus");
    const answerText = document.getElementById("serverAnswer");

    if (!statusText) return;

    statusText.textContent = "Prüfe Verbindung …";
    answerText.textContent = "";

    const startTime = performance.now();
    const status = await getServerStatus();
    const duration = Math.round(performance.now() - startTime);

    if (status) {
        statusText.textContent = "SERVER VERBUNDEN (" + duration + " ms)";
        statusText.style.color = "#5effa6";
        answerText.textContent = JSON.stringify(status, null, 2);
    } else {
        statusText.textContent = "KEIN SERVER ERREICHBAR – starte ihn mit «npm start» im Ordner backend.";
        statusText.style.color = "#ff00aa";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const checkButton = document.getElementById("checkServer");

    if (checkButton) {
        checkButton.addEventListener("click", showServerStatus);
    }

    showServerStatus();
});
