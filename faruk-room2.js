// Level-2-Oberfläche: nutzt den bestehenden Rätselstatus, ohne ihn zu verändern.
(() => {
    const room = document.querySelector('.level-two');
    if (!room) return;

    const puzzlePanel = document.getElementById('puzzleArea');
    const glitchToggle = document.getElementById('glitchButton');
    const puzzleButtons = [...document.querySelectorAll('.object:not([data-object="tuer"])')];
    const exit = document.querySelector('[data-object="tuer"]');
    let activeObject = null;
    let panelWasOpen = false;

    puzzlePanel.setAttribute('role', 'region');
    puzzlePanel.setAttribute('aria-label', 'Objekt untersuchen');
    puzzlePanel.setAttribute('tabindex', '-1');

    function syncObjects() {
        puzzleButtons.forEach(button => {
            const solved = isPuzzleSolved(puzzleObjects[button.dataset.object]);
            button.classList.toggle('solved', solved);
            button.querySelector('.object-status').textContent = solved ? 'Gelöst ✓' : 'Untersuchen →';
        });
        exit.querySelector('.object-status').textContent = allPuzzlesSolved() ? 'Freigeschaltet →' : 'Gesperrt';
    }

    puzzleButtons.forEach(button => {
        button.setAttribute('aria-controls', 'puzzleArea');
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', () => {
            if (puzzlePanel.hidden) return;
            activeObject = button;
            puzzleButtons.forEach(item => item.setAttribute('aria-expanded', String(item === button)));
            puzzlePanel.focus({ preventScroll: true });
        });
    });

    // Auch das Schliessen durch die bestehende Spielsteuerung berücksichtigen.
    new MutationObserver(() => {
        const open = !puzzlePanel.hidden;
        if (!open) {
            puzzleButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
            if (panelWasOpen && currentState === GameState.PLAYING) activeObject?.focus({ preventScroll: true });
        }
        panelWasOpen = open;
        syncObjects();
    }).observe(puzzlePanel, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !puzzlePanel.hidden) closePuzzle();
    });
    glitchToggle.addEventListener('click', () => {
        glitchToggle.setAttribute('aria-pressed', String(document.body.classList.contains('glitch-active')));
    });
    syncObjects();
})();
