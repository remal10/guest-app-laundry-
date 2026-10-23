// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST APP — WELCOME SCREEN LOGIC
// ═══════════════════════════════════════════════════════════════════

function enterApp() {
    const splash = document.getElementById('splashScreen');
    const mainApp = document.getElementById('mainApp');

    if (!splash || !mainApp || splash.classList.contains('is-leaving')) return;

    // Remove the inline !important hide rule before revealing the app.
    // A CSS class cannot override display:none!important set inline.
    mainApp.style.removeProperty('display');
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

    // Fallback for browsers where transitionend does not fire.
    window.setTimeout(finishTransition, 750);

    // Subtle tactile feedback, when supported.
    if (navigator.vibrate) {
        try { navigator.vibrate(18); } catch (_) { /* optional vibration */ }
    }
}

window.enterApp = enterApp;
