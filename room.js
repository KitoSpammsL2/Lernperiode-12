
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
    if (glitchActive) {
        message.textContent =
            "Geheimer Code entdeckt: 2048";
    } else {
        message.textContent =
            "Das Terminal zeigt verschlüsselte Daten.";
    }
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
    if (currentState !== GameState.PLAYING || levelChanging) return;
    glitchActive = !glitchActive;

    document.body.classList.toggle(
        "glitch-active",
        glitchActive
    );

    glitchButton.setAttribute("aria-pressed", String(glitchActive));
    document.dispatchEvent(new CustomEvent("glitchModeChanged", { detail: { active: glitchActive } }));
    message.textContent = glitchActive
        ? "GLITCH-MODUS AKTIVIERT"
        : "Glitch-Modus deaktiviert.";
});


// Countdown-Timer

const timerDisplay = document.getElementById("timer");

// Die Restzeit kommt aus dem Spielstand (script.js), damit sie das Neuladen übersteht
startLevelTime();

let remainingSeconds = getTimeLeft();
let timerInterval = null;

function updateTimer() {
    timerDisplay.textContent = formatTime(remainingSeconds);
}

function startTimer() {
    if (timerInterval !== null) return;

    timerInterval = setInterval(() => {
        // Beim Levelwechsel sowie nach Gewinn oder Niederlage anhalten
        if (currentState !== GameState.PLAYING || levelChanging) {
            clearInterval(timerInterval);
            timerInterval = null;
            return;
        }

        remainingSeconds = getTimeLeft();
        updateTimer();

        if (remainingSeconds === 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            message.textContent =
                "ZEIT ABGELAUFEN – SIMULATION FEHLGESCHLAGEN";
            loseGame();
        }
    }, 1000);
}


// Rätsel-Fortschritt

const progressDisplay = document.getElementById("progress");

function updateProgress() {
    const solvedCount = getSolvedCount();
    const total = Object.keys(puzzles).length;
    const text = "Rätsel: " + solvedCount + "/" + total;
    // Gleichen Text nicht wiederholt an Screenreader melden.
    if (progressDisplay.textContent !== text) progressDisplay.textContent = text;
    const bar = document.getElementById("puzzleProgress");
    bar.max = Math.max(1, total);
    bar.value = solvedCount;
    bar.setAttribute("aria-valuetext", solvedCount + " von " + total + " Rätseln gelöst");
}


// Spiel starten

updateTimer();
updateProgress();
startTimer();

// Fortschritt regelmässig aktualisieren
setInterval(updateProgress, 500);
