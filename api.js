// Verbindung zum Backend (backend/server.js)
// Das Spiel funktioniert auch ohne Server, z.B. direkt als Datei geöffnet.

const apiUrl = "/api";

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
