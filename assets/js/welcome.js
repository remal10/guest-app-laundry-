// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST APP — WELCOME SCREEN LOGIC
// ═══════════════════════════════════════════════════════════════════

function enterApp() {
    console.log('🎬 [Welcome] Enter button clicked');
    
    const splash = document.getElementById('splashScreen');
    const mainApp = document.getElementById('mainApp');

    if (!splash || !mainApp) {
        console.error('❌ [Welcome] Elements not found');
        return;
    }

    // 1. Afficher l'app principale (on enlève le style inline display:none)
    mainApp.style.display = 'block';
    
    // 2. Forcer l'application du style (pour la transition)
    void mainApp.offsetWidth;
    
    // 3. Animer le fade out du splash
    splash.style.opacity = '0';
    splash.style.visibility = 'hidden';
    
    // 4. Retirer le splash du DOM après l'animation
    setTimeout(() => {
        splash.style.display = 'none';
        mainApp.classList.add('visible');
    }, 800);

    // 5. Vibration premium
    if (navigator.vibrate) navigator.vibrate(50);
    
    console.log('✅ [Welcome] App revealed');
}

// Exposer globalement
window.enterApp = enterApp;

// Init
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ [Welcome] Splash screen loaded');
});
