// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST LAUNDRY PORTAL — Auth
// ═══════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://kmtnkjhjbmsietrlebhs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdG5ramhqYm1zaWV0cmxlYmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMjQ1MTMsImV4cCI6MjEwMTkwMDUxM30.fOMotE-gsxKkTtrgzbrk5qsC22qWdQmF__k89Xt-ErA';

let cachedGuestData = null;
let isGuestVerified = false;
let guestRealtimeChannel = null;

const SALUTATIONS_REGEX = /\b(mr|mrs|ms|miss|m|mme|mlle|dr|prof|eng|sir|madam|lady|lord|sheikh|sheikha|he|h\.e\.)\.?\b/gi;

function onRoomNumberTyped(roomNum) {
    if (isGuestVerified) return;

    const verifyBox = document.getElementById('guestVerificationBox');
    const infoBox = document.getElementById('roomInfoBox');
    
    isGuestVerified = false;
    cachedGuestData = null;
    if (infoBox) infoBox.classList.add('hidden');

    if (roomNum && String(roomNum).trim().length >= 1) {
        if (verifyBox) verifyBox.classList.remove('hidden');
    } else {
        if (verifyBox) verifyBox.classList.add('hidden');
    }
}

function appliquerEtatGuestVerifie(data, roomNum) {
    cachedGuestData = data;
    isGuestVerified = true;

    const roomInput = document.getElementById('guestRoomInput');
    const guestNameEl = document.getElementById('displayGuestName');
    const quotaEl = document.getElementById('displayQuota');

    if (roomInput) {
        roomInput.value = roomNum;
        roomInput.setAttribute('readonly', true);
    }
    if (guestNameEl) guestNameEl.innerText = data.guest_name;
    if (quotaEl) quotaEl.innerText = data.quota_text;

    const verifyBox = document.getElementById('guestVerificationBox');
    const infoBox = document.getElementById('roomInfoBox');
    const btnChange = document.getElementById('btnChangeRoom');

    if (verifyBox) verifyBox.classList.add('hidden');
    if (infoBox) infoBox.classList.remove('hidden');
    if (btnChange) btnChange.classList.remove('hidden');

    const isChargeable = data.quota_text.toLowerCase().includes('chargeable');
    if (isChargeable) {
        selectCountType('guest', false);
        const extraCheck = document.getElementById('extraChargedCheck');
        if (extraCheck) extraCheck.checked = true;
    } else {
        selectCountType('hotel', false);
    }

    if (typeof verifierStatutDerniereCommande === 'function') {
        verifierStatutDerniereCommande(roomNum);
    }

    // 🎯 FIX : Déclencher l'init du Chat et My Orders IMMÉDIATEMENT
    initGuestServices(roomNum, data.guest_name);
}

// 🎯 NOUVELLE FONCTION : Initialise le chat et l'historique de manière centralisée
function initGuestServices(room, name) {
    // Petit délai pour laisser le DOM se stabiliser
    setTimeout(() => {
        // Init Chat
        if (window.GuestChat && typeof window.GuestChat.init === 'function') {
            window.GuestChat.init(room, name);
            document.getElementById('chatFab')?.classList.remove('hidden');
            const sub = document.getElementById('chatModalSub');
            if (sub) sub.textContent = 'Room ' + room;
            console.log('💬 [Auth] Chat initialisé');
        }

        // Init My Orders
        if (window.GuestOrders && typeof window.GuestOrders.init === 'function') {
            window.GuestOrders.init(room, name);
            document.getElementById('myOrdersNavBtn')?.classList.remove('hidden');
            console.log('🧾 [Auth] My Orders initialisé');
        }
    }, 300);
}

async function verifierNomClient() {
    const roomInput = document.getElementById('guestRoomInput');
    const nameInput = document.getElementById('guestNameInput');
    
    const rawRoom = roomInput ? roomInput.value.trim() : '';
    let inputName = nameInput ? nameInput.value.trim().toLowerCase() : '';

    inputName = inputName.replace(SALUTATIONS_REGEX, '').trim();

    if (!rawRoom) {
        alert("Please enter room number.");
        return;
    }

    if (!inputName || inputName.length < 2) {
        alert(currentLang === 'ar' ? "⚠️ يرجى أدخال اسم صحيح." : "⚠️ Please enter a valid name (e.g., Sangare or Zidane).");
        return;
    }

    const cleanInputName = inputName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

    const { data: roomsList, error } = await window.supabaseClient
        .from('pms_guests')
        .select('*')
        .ilike('room', `%${rawRoom}%`);

    if (error || !roomsList || roomsList.length === 0) {
        triggerErrorNotification();
        alert(currentLang === 'ar' ? "❌ لم يتم العثور على هذه الغرفة في تقرير PMS." : "❌ Room number not found in PMS records.");
        isGuestVerified = false;
        const infoBox = document.getElementById('roomInfoBox');
        if (infoBox) infoBox.classList.add('hidden');
        return;
    }

    let matchedData = null;

    for (const item of roomsList) {
        if (!item.guest_name) continue;

        const cleanPmsFull = item.guest_name.toLowerCase()
            .replace(SALUTATIONS_REGEX, '')
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

        const pmsWords = cleanPmsFull
            .split(/[\s\-_,]+/)
            .map(w => w.replace(/[^a-z0-9]/g, ""))
            .filter(w => w.length > 1);

        const isMatchStrict = pmsWords.some(word => {
            if (cleanInputName.length <= 3) {
                return word === cleanInputName;
            }
            return word === cleanInputName || word.includes(cleanInputName) || cleanInputName.includes(word);
        });

        if (isMatchStrict) {
            matchedData = item;
            break;
        }
    }

    if (!matchedData) {
        triggerErrorNotification();
        alert(currentLang === 'ar' 
            ? "❌ الاسم غير مطابق لسجلات هذه الغرفة." 
            : "❌ The name provided does not match PMS records for this room.");
        isGuestVerified = false;
        const infoBox = document.getElementById('roomInfoBox');
        if (infoBox) infoBox.classList.add('hidden');
        return;
    }

    localStorage.setItem('remal_guest_room', matchedData.room);
    localStorage.setItem('remal_guest_data', JSON.stringify(matchedData));

    appliquerEtatGuestVerifie(matchedData, matchedData.room);
}

function changerDeChambre() {
    localStorage.removeItem('remal_guest_room');
    localStorage.removeItem('remal_guest_data');

    const roomField = document.getElementById('guestRoomInput');
    const nameField = document.getElementById('guestNameInput');

    if (roomField) {
        roomField.removeAttribute('readonly');
        roomField.value = '';
        roomField.focus();
    }
    if (nameField) nameField.value = '';

    isGuestVerified = false;
    cachedGuestData = null;

    const infoBox = document.getElementById('roomInfoBox');
    const verifyBox = document.getElementById('guestVerificationBox');
    const btnChange = document.getElementById('btnChangeRoom');
    const statusDisplay = document.getElementById('guestStatusDisplay');

    if (infoBox) infoBox.classList.add('hidden');
    if (verifyBox) verifyBox.classList.add('hidden');
    if (btnChange) btnChange.classList.add('hidden');
    if (statusDisplay) {
        statusDisplay.innerHTML = '';
        statusDisplay.classList.add('hidden');
    }

    if (guestRealtimeChannel && window.supabaseClient) {
        window.supabaseClient.removeChannel(guestRealtimeChannel);
        guestRealtimeChannel = null;
    }
}
