// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST APP — WELCOME SCREEN LOGIC
// ═══════════════════════════════════════════════════════════════════

function enterApp() {
    const splash = document.getElementById('splashScreen');
    const mainApp = document.getElementById('mainApp');

    if (!splash || !mainApp || splash.classList.contains('is-leaving')) return;

    // Utiliser la classe CSS plutôt que style.display : le CSS du splash
    // utilise !important et doit rester la source de vérité de l'affichage.
    mainApp.classList.add('visible');
    splash.classList.add('is-leaving');

    const finishTransition = () => {
        splash.style.display = 'none';
        splash.setAttribute('aria-hidden', 'true');
    };

    splash.addEventListener('transitionend', (event) => {
        if (event.target === splash && event.propertyName === 'opacity') {
            finishTransition();
        }
    }, { once: true });

    // Secours pour les navigateurs où transitionend n'est pas déclenché.
    window.setTimeout(finishTransition, 750);

    // Retour tactile discret, si pris en charge par l'appareil.
    if (navigator.vibrate) {
        try { navigator.vibrate(18); } catch (_) { /* vibration optionnelle */ }
    }
}

window.enterApp = enterApp;
