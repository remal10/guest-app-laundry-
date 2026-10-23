// REMAL GUEST APP — ROBUST WELCOME SCREEN LOGIC
function enterApp() {
    const splash = document.getElementById('splashScreen');
    const mainApp = document.getElementById('mainApp');

    if (!mainApp) {
        console.error('[Welcome] #mainApp not found.');
        return;
    }

    // Force the main app visible even if an inline !important rule or CSS
    // specificity would otherwise keep it hidden.
    mainApp.style.setProperty('display', 'block', 'important');
    mainApp.style.setProperty('visibility', 'visible', 'important');
    mainApp.style.setProperty('opacity', '1', 'important');
    mainApp.classList.add('visible');
    mainApp.removeAttribute('aria-hidden');

    if (!splash) return;

    // Only hide the welcome layer after the app has been made visible.
    splash.classList.add('is-leaving');
    const finishTransition = () => {
        splash.style.setProperty('display', 'none', 'important');
        splash.setAttribute('aria-hidden', 'true');
    };

    splash.addEventListener('transitionend', (event) => {
        if (event.target === splash && event.propertyName === 'opacity') {
            finishTransition();
        }
    }, { once: true });

    window.setTimeout(finishTransition, 800);

    if (navigator.vibrate) {
        try { navigator.vibrate(18); } catch (_) {}
    }
}
window.enterApp = enterApp;
