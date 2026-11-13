// Levelauswahl im Hauptmenü
// Freigeschaltete Levels können direkt gestartet werden (Logik in script.js).

function showLevelSelect() {
    const startButton = document.getElementById("startButton");

    if (!startButton) return;

    const section = document.createElement("section");
    section.className = "level-select";
    section.innerHTML = `
        <h3>LEVEL WÄHLEN</h3>
        <div class="level-buttons"></div>
        <p class="level-note">Die Bestzeit zählt nur bei einem Start in Level 1.</p>
    `;

    const buttons = section.querySelector(".level-buttons");
    const unlockedLevel = getUnlockedLevel();

    for (let level = 1; level <= maxLevels; level++) {
        const locked = level > unlockedLevel;
        const button = document.createElement("button");

        button.type = "button";
        button.dataset.level = level;
        button.disabled = locked;
        button.textContent = "LEVEL " + level + (locked ? " 🔒" : "");
        button.setAttribute(
            "aria-label",
            "Level " + level + (locked ? " (noch gesperrt)" : " starten")
        );
        button.addEventListener("click", () => startGame(level));

        buttons.appendChild(button);
    }

    startButton.after(section);
}

document.addEventListener("DOMContentLoaded", showLevelSelect);
