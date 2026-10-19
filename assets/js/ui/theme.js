// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST LAUNDRY PORTAL — Theme
// Gestion du thème clair/sombre + notifications visuelles
// ═══════════════════════════════════════════════════════════════════

function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    if (isLight) {
        if (icon) icon.className = 'fas fa-sun text-sm';
        localStorage.setItem('remal_theme', 'light');
    } else {
        if (icon) icon.className = 'fas fa-moon text-sm';
        localStorage.setItem('remal_theme', 'dark');
    }
    if (typeof renderCatalogItems === 'function') renderCatalogItems();
}

function initTheme() {
    const savedTheme = localStorage.getItem('remal_theme');
    const icon = document.getElementById('themeIcon');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (icon) icon.className = 'fas fa-sun text-sm';
    } else {
        document.body.classList.remove('light-mode');
        if (icon) icon.className = 'fas fa-moon text-sm';
    }
}

function triggerErrorNotification() {
    if ("vibrate" in navigator) navigator.vibrate(100);
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
}

// ─── LANGUE ───────────────────────────────────────────────────────
const flags = { en: "🇬🇧", fr: "🇫🇷", ar: "🇦🇪", hi: "🇮🇳" };
const langNames = { en: "English", fr: "Français", ar: "العربية", hi: "हिन्दी" };

let currentLang = 'en';

function toggleLangDropdown() {
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.toggle('hidden');
}

function changerLangueCustom(lang) {
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.add('hidden');
    const flagEl = document.getElementById('currentLangFlag');
    const textEl = document.getElementById('currentLangText');
    if (flagEl) flagEl.innerText = flags[lang];
    if (textEl) textEl.innerText = langNames[lang];
    changerLangue(lang);
}

function changerLangue(lang) {
    currentLang = lang;
    localStorage.setItem('remal_lang', lang);
    const t = traductions[lang];
    const htmlRoot = document.getElementById('htmlRoot');
    if (htmlRoot) htmlRoot.setAttribute('dir', (lang === 'ar') ? 'rtl' : 'ltr');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t && t[key]) el.innerText = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t && t[key]) el.placeholder = t[key];
    });

    // ✨ PHASE TIMELINE : Re-générer la Timeline avec les nouveaux labels
    if (typeof currentActiveOrders !== 'undefined' && 
        typeof afficherBannerStatutGuestMultiples === 'function' && 
        Array.isArray(currentActiveOrders) && 
        currentActiveOrders.length > 0) {
        afficherBannerStatutGuestMultiples(currentActiveOrders);
    }
}
