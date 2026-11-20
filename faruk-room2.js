// Level-2-Oberfläche: nutzt den bestehenden Rätselstatus, ohne ihn zu verändern.
(() => {
    const room = document.querySelector('.level-two');
    if (!room) return;

    const puzzlePanel = document.getElementById('puzzleArea');
    const glitchToggle = document.getElementById('glitchButton');
    const puzzleButtons = [...document.querySelectorAll('.object:not([data-object="tuer"])')];
    const exit = document.querySelector('[data-object="tuer"]');

    puzzlePanel.setAttribute('role', 'region');
    puzzlePanel.setAttribute('tabindex', '-1');

    function syncObjects() {
        puzzleButtons.forEach(button => {
            const solved = isPuzzleSolved(puzzleObjects[button.dataset.object]);
            button.classList.toggle('solved', solved);
            button.querySelector('.object-status').textContent = solved ? 'Gelöst ✓' : 'Untersuchen →';
        });
        exit.querySelector('.object-status').textContent = allPuzzlesSolved() ? 'Freigeschaltet →' : 'Gesperrt';
    }

    // Die gemeinsame Rätselansicht übernimmt Fokus und Tastaturbedienung.
    new MutationObserver(syncObjects).observe(puzzlePanel, {
        childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']
    });

    const scanStatus = document.getElementById('glitchStatus');
    let scanAnimation = null;
    glitchToggle.addEventListener('click', () => {
        if (currentState !== GameState.PLAYING || levelChanging) return;
        const scanning = document.body.classList.contains('glitch-active');
        glitchToggle.setAttribute('aria-pressed', String(scanning));
        glitchToggle.textContent = scanning ? 'NORMALANSICHT' : 'GLITCH-MODUS';
        scanStatus.textContent = scanning
            ? 'HINWEISSCAN AKTIV · Untersuche die markierten Systeme'
            : 'NORMALANSICHT · Hinweisscan deaktiviert';
        clearTimeout(scanAnimation);
        document.body.classList.remove('glitch-switching');
        // Die kurze Umschaltanimation bei jedem bewussten Wechsel neu starten.
        void room.offsetWidth;
        document.body.classList.add('glitch-switching');
        scanAnimation = setTimeout(() => document.body.classList.remove('glitch-switching'), 360);
    });
    syncObjects();
})();
