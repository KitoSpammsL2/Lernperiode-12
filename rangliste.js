// Spielername und Rangliste im Hauptmenü
// Erscheinen nur, wenn das Spiel über den Express-Server läuft (api.js).

function showRankingMessage(list, text) {
    const item = document.createElement("li");
    item.className = "ranking-empty";
    item.textContent = text;
    list.replaceChildren(item);
}

async function showRanking() {
    const startButton = document.getElementById("startButton");

    if (!startButton || !isServerAvailable()) return;

    const section = document.createElement("section");
    section.className = "ranking";
    section.innerHTML = `
        <label class="player-name">SPIELERNAME
            <input id="playerName" type="text" maxlength="20" autocomplete="nickname" placeholder="Anonym">
        </label>
        <h3>RANGLISTE</h3>
        <ol id="rankingList"></ol>
    `;

    // Nach der Levelauswahl einfügen, sonst direkt nach dem Startknopf
    (document.querySelector(".level-select") || startButton).after(section);

    const nameInput = section.querySelector("#playerName");
    nameInput.value = getSavedPlayerName();
    nameInput.addEventListener("input", () => setPlayerName(nameInput.value));

    const list = section.querySelector("#rankingList");
    showRankingMessage(list, "Lade Bestzeiten …");

    const bestTimes = await loadBestTimesFromServer();

    if (!bestTimes) {
        showRankingMessage(list, "Rangliste nicht erreichbar.");
        return;
    }

    if (bestTimes.length === 0) {
        showRankingMessage(list, "Noch keine Zeiten. Sei die erste Person!");
        return;
    }

    // Namen kommen von anderen Spielern: nur als Text einsetzen, nie als HTML
    list.replaceChildren(...bestTimes.map(entry => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const time = document.createElement("span");

        name.className = "ranking-name";
        name.textContent = entry.name;
        time.textContent = formatTime(entry.seconds);

        item.append(name, time);
        return item;
    }));
}

document.addEventListener("DOMContentLoaded", showRanking);
