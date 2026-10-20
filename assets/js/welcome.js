// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST APP — WELCOME SCREEN LOGIC (IMMERSIVE)
// ═══════════════════════════════════════════════════════════════════

function enterApp() {
    const splash = document.getElementById('splashScreen');
    const mainApp = document.getElementById('mainApp');

    if (!splash || !mainApp) return;

    // 1. On affiche l'application en fond
    mainApp.style.display = 'block';
    void mainApp.offsetWidth;

    // 2. On lance l'animation de disparition du Splash
    splash.style.opacity = '0';
    splash.style.visibility = 'hidden';
    
    // 3. On nettoie après l'animation
    setTimeout(() => {
        splash.style.display = 'none';
        mainApp.classList.add('visible');
    }, 1000);

    // 4. Vibration "haptique" premium
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
}

// Exposer globalement
window.enterApp = enterApp;

// Effet de machine à écrire au chargement
document.addEventListener('DOMContentLoaded', () => {
    const textElement = document.querySelector('.remal-welcome-text');
    if (textElement) {
        const text = `"Every detail matters.<br>We are delighted to serve you."`;
        // On garde le texte tel quel mais on peut ajouter une logique ici si besoin
        // L'animation de base est gérée par le CSS (fadeUp)
    }
});
