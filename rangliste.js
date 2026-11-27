// Spielerprofil und Rangliste verwenden Kaitos bestehende Bestzeiten-API.
function showRankingMessage(list, text, state = 'empty') {
    const item = document.createElement('li');
    item.className = 'ranking-empty';
    item.textContent = text;
    list.dataset.state = state;
    list.replaceChildren(item);
}

async function showRanking() {
    const startButton = document.getElementById('startButton');
    if (!startButton || !isServerAvailable() || document.querySelector('.ranking')) return;
    const section = document.createElement('section');
    section.className = 'ranking';
    section.setAttribute('aria-labelledby', 'rankingTitle');
    section.innerHTML = `
        <p class="ranking-eyebrow">DEIN PROFIL</p>
        <label class="player-name" for="playerName">SPIELERNAME</label>
        <input id="playerName" type="text" maxlength="20" autocomplete="nickname" placeholder="Anonym" aria-describedby="playerNameHelp">
        <p id="playerNameHelp" class="ranking-help">Dein Name für die Rangliste. Ohne Eingabe spielst du als Anonym.</p>
        <div class="ranking-head"><div><p class="ranking-eyebrow">TOP 10</p><h3 id="rankingTitle">BESTZEITEN</h3></div>
            <button type="button" id="refreshRanking">AKTUALISIEREN</button></div>
        <p class="ranking-help">Die schnellsten vollständigen Durchgänge ab Level 1.</p>
        <div class="ranking-columns" aria-hidden="true"><span>PLATZ / NAME</span><span>ZEIT</span></div>
        <ol id="rankingList" aria-label="Rangliste der Bestzeiten" aria-live="polite"></ol>`;
    (document.querySelector('.level-select') || startButton).after(section);
    const nameInput = section.querySelector('#playerName');
    nameInput.value = getSavedPlayerName();
    nameInput.addEventListener('input', () => setPlayerName(nameInput.value));
    const list = section.querySelector('#rankingList');
    const refresh = section.querySelector('#refreshRanking');
    async function refreshRanking() {
        if (refresh.disabled) return;
        refresh.disabled = true;
        list.setAttribute('aria-busy', 'true');
        showRankingMessage(list, 'Lade Bestzeiten …', 'loading');
        const bestTimes = await loadBestTimesFromServer();
        if (!bestTimes) {
            showRankingMessage(list, 'Rangliste nicht erreichbar. Versuche es mit Aktualisieren erneut.', 'error');
        } else if (bestTimes.length === 0) {
            showRankingMessage(list, 'Noch keine Zeiten. Sei die erste Person!');
        } else {
            list.dataset.state = 'ready';
            // Spielernamen weiterhin ausschliesslich als Text darstellen.
            list.replaceChildren(...bestTimes.map((entry, index) => {
                const item = document.createElement('li');
                item.className = 'ranking-row';
                const place = document.createElement('span');
                place.className = 'ranking-place';
                place.textContent = String(index + 1).padStart(2, '0');
                const name = document.createElement('span');
                name.className = 'ranking-name';
                name.textContent = entry.name;
                const time = document.createElement('span');
                time.className = 'ranking-time';
                time.textContent = formatTime(entry.seconds);
                item.append(place, name, time);
                return item;
            }));
        }
        list.setAttribute('aria-busy', 'false');
        refresh.disabled = false;
    }
    refresh.addEventListener('click', refreshRanking);
    await refreshRanking();
}
document.addEventListener('DOMContentLoaded', showRanking);
