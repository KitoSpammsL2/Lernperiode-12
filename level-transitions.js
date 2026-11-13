// Gemeinsamer Abschluss- und Ladebildschirm für den Wechsel zum nächsten Level.
function showLevelTransition(completedLevel, nextLevel, navigate) {
    const screen = document.createElement('section');
    screen.id = 'levelTransition';
    screen.className = 'level-transition';
    screen.setAttribute('role', 'dialog');
    screen.setAttribute('aria-modal', 'true');
    screen.setAttribute('aria-labelledby', 'transitionTitle');
    screen.setAttribute('aria-describedby', 'transitionStatus');
    screen.tabIndex = -1;
    screen.innerHTML = `
        <div class="transition-card">
            <p class="transition-eyebrow">GLITCH // SEKTOR GESICHERT</p>
            <span class="transition-symbol" aria-hidden="true">◇</span>
            <h1 id="transitionTitle">LEVEL ${String(completedLevel).padStart(2, '0')} ABGESCHLOSSEN</h1>
            <p>Alle Systeme entschlüsselt. Der nächste Sektor wartet.</p>
            <div class="transition-loader" aria-hidden="true"><span></span></div>
            <p id="transitionStatus" role="status">LEVEL ${String(nextLevel).padStart(2, '0')} WIRD GELADEN …</p>
        </div>`;

    document.body.appendChild(screen);
    document.body.classList.add('level-leaving');
    document.querySelectorAll('.game-room, .hud').forEach(element => { element.inert = true; });
    screen.focus({ preventScroll: true });

    // Nicht vom animationend-Ereignis abhängig: auch bei reduzierter Bewegung
    // und in Hintergrund-Tabs muss der Wechsel zuverlässig stattfinden.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(navigate, reducedMotion ? 100 : 1100);
}
