
const answers = {
  puzzle1: "2048",
  puzzle2: "GLITCH",
  puzzle3: "SYSTEM"
};


function getProgress() {
  try {
    return JSON.parse(localStorage.getItem("glitchPuzzles") || "{}");
  } catch (error) {
    return {};
  }
}

function isSolved(id) {
  return getProgress()[id] === true;
}


function verifyPuzzle(id, answer) {
  if (typeof checkPuzzle === "function") {
    return checkPuzzle(id, answer);
  }

  if (answer !== answers[id]) return false;

  const progress = getProgress();
  progress[id] = true;
  localStorage.setItem("glitchPuzzles", JSON.stringify(progress));
  return true;
}

function showMessage(elementId, message, success) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = success ? "message success" : "message error";
}

function updateProgress() {
  const ids = ["puzzle1", "puzzle2", "puzzle3"];
  let count = 0;

  for (const id of ids) {
    if (isSolved(id)) {
      count++;
      document.getElementById(id).classList.add("solved");
    }
  }

  document.getElementById("progress").textContent =
    "Gelöste Rätsel: " + count + " / 3";
  document.getElementById("door").textContent =
    count === 3 ? "Ausgangstür: OFFEN!" : "Ausgangstür: GESPERRT";
}

function finishPuzzle(id, answer, messageId) {
  if (isSolved(id)) {
    showMessage(messageId, "Dieses Rätsel ist schon gelöst.", true);
    return true;
  }

  const correct = verifyPuzzle(id, answer);
  if (correct) {
    showMessage(messageId, "Richtig! Rätsel gelöst.", true);
    updateProgress();
  } else {
    showMessage(messageId, "Leider falsch. Versuche es nochmals.", false);
  }
  return correct;
}


document.getElementById("glitch-button").addEventListener("click", function () {
    const active = document.body.classList.toggle("glitch-active");

    this.textContent = "Glitch-Modus: " + (active ? "AN" : "AUS");
});

document.getElementById("code-form").addEventListener("submit", function (event) {
  event.preventDefault();
  const code = document.getElementById("code").value.trim();

  if (!/^\d{4}$/.test(code)) {
    showMessage("code-message", "Bitte genau 4 Zahlen eingeben.", false);
    return;
  }

  finishPuzzle("puzzle1", code, "code-message");
});

let selectedLetters = "";
const symbolButtons = document.querySelectorAll("[data-letter]");

function clearSelection() {
  selectedLetters = "";
  document.getElementById("selected").textContent = "Ausgewählt: 0 / 6";
  symbolButtons.forEach(button => button.disabled = isSolved("puzzle2"));
}

symbolButtons.forEach(button => {
  button.addEventListener("click", function () {
    if (isSolved("puzzle2")) return;
    selectedLetters += this.dataset.letter;
    this.disabled = true;
    document.getElementById("selected").textContent =
      "Ausgewählt: " + selectedLetters.length + " / 6";

    if (selectedLetters.length === 6) {
      const correct = finishPuzzle("puzzle2", selectedLetters, "symbols-message");
      if (!correct) clearSelection();
    }
  });
});

document.getElementById("symbols-reset").addEventListener("click", function () {
  if (!isSolved("puzzle2")) {
    clearSelection();
    showMessage("symbols-message", "Auswahl gelöscht.", true);
  }
});


document.getElementById("switch-submit").addEventListener("click", function () {
  if (isSolved("puzzle3")) {
    showMessage("switch-message", "Dieses Rätsel ist schon gelöst.", true);
    return;
}
  const a = document.getElementById("switch-a").checked;
  const b = document.getElementById("switch-b").checked;
  const c = document.getElementById("switch-c").checked;

  if (a && !b && c) {
    finishPuzzle("puzzle3", "SYSTEM", "switch-message");
  } else {
    showMessage("switch-message", "Falsche Schalter. Versuche es nochmals.", false);
  }
});

updateProgress();
clearSelection();
document.getElementById("reset-progress").addEventListener("click", function () {
    localStorage.removeItem("glitchPuzzles");
    location.reload();
});