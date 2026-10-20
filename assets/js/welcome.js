// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST APP — WELCOME SCREEN LOGIC
// ═══════════════════════════════════════════════════════════════════

function enterApp() {
    const splash = document.getElementById('splashScreen');
    const mainApp = document.getElementById('mainApp');

    if (!splash || !mainApp) return;

    // Fade out du splash
    splash.style.opacity = '0';
    splash.style.visibility = 'hidden';

    // Affiche l'app principale
    mainApp.classList.add('visible');

    // Retire le splash du DOM après l'animation (pour libérer la mémoire)
    setTimeout(() => {
        splash.style.display = 'none';
    }, 800);

    // Vibration premium (si supportée)
    if (navigator.vibrate) navigator.vibrate(50);
}

// Init : lance la page d'accueil automatiquement au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ [Welcome] Splash screen loaded');
});
