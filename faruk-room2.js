// Level-2-Oberfläche: nutzt den bestehenden Rätselstatus, ohne ihn zu verändern.
(() => {
    const room = document.querySelector('.level-two');
    if (!room) return;

    const glitchToggle = document.getElementById('glitchButton');
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
})();
