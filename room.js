
// Spielraum

const message = document.getElementById("message");
const objects = document.querySelectorAll(".object");
const glitchButton = document.getElementById("glitchButton");

let glitchActive = false;

// Gegenstände anklicken
objects.forEach(object => {
    object.addEventListener("click", () => {
        const objectName = object.dataset.object;

        if (objectName === "terminal") {
            message.textContent =
                "Das Terminal zeigt verschlüsselte Daten.";
        }

        if (objectName === "schrank") {
            message.textContent =
                "Der Schrank ist verschlossen.";
        }

        if (objectName === "tuer") {
            message.textContent =
                "Die Ausgangstür ist noch verschlossen.";
        }
    });
});

// Glitch-Modus aktivieren
glitchButton.addEventListener("click", () => {
    glitchActive = !glitchActive;

    document.body.classList.toggle(
        "glitch-active",
        glitchActive
    );

    message.textContent = glitchActive
        ? "GLITCH-MODUS AKTIVIERT"
        : "Glitch-Modus deaktiviert.";
});


// Countdown-Timer

const timerDisplay = document.getElementById("timer");

let remainingSeconds = 300;
let timerInterval = null;

function updateTimer() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}

function startTimer() {
    if (timerInterval !== null) return;

    timerInterval = setInterval(() => {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            updateTimer();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            message.textContent =
                "ZEIT ABGELAUFEN – SIMULATION FEHLGESCHLAGEN";
        }
    }, 1000);
}


// Rätsel-Fortschritt

const progressDisplay = document.getElementById("progress");

function updateProgress() {
    let solvedCount = 0;

    // Später mit Kaitos puzzles.js verbunden
    if (typeof getSolvedCount === "function") {
        solvedCount = getSolvedCount();
    }

    progressDisplay.textContent =
        "Rätsel: " + solvedCount + "/3";
}


// Spiel starten

updateTimer();
updateProgress();
startTimer();

// Fortschritt regelmässig aktualisieren
setInterval(updateProgress, 500);
