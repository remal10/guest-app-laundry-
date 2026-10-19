// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST LAUNDRY PORTAL — Cart & Catalog Core
// Gestion du panier, sélection articles, quotas
// ═══════════════════════════════════════════════════════════════════

// ─── STATE GLOBAL ──────────────────────────────────────────────────
let catalogService = 'laundry';
let currentCountType = 'hotel';
let catalogCart = {};

// ─── MODAL CATALOGUE ──────────────────────────────────────────────
function openLaundryModal() {
    const modal = document.getElementById('laundryModal');
    if (modal) modal.classList.remove('hidden');
    renderCatalogItems();
}

function closeLaundryModal() {
    const modal = document.getElementById('laundryModal');
    if (modal) modal.classList.add('hidden');
}

// ─── PARSE PMS QUOTA ──────────────────────────────────────────────
function parsePMSQuotaNumber(quotaStr) {
    if (!quotaStr) return 0;
    let cleaned = quotaStr.toLowerCase();
    if (cleaned.includes('chargeable') || cleaned.includes('no free') || cleaned.includes('standard')) return 0;
    const match = cleaned.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

// ─── SÉLECTION TYPE DE COMPTE ─────────────────────────────────────
function selectCountType(type, isManualClick = false) {
    const quotaText = (cachedGuestData && cachedGuestData.quota_text) ? cachedGuestData.quota_text : 'Standard';
    const allowedFreePcs = parsePMSQuotaNumber(quotaText);
    const isChargeable = quotaText.toLowerCase().includes('chargeable') || allowedFreePcs === 0;

    let currentTotalPcs = 0;
    Object.values(catalogCart).forEach(i => { if (i && i.qty) currentTotalPcs += i.qty; });

    let enforcedType = type;

    if (isChargeable) {
        enforcedType = 'guest';
        if (isManualClick && type !== 'guest') {
            if (typeof triggerErrorNotification === 'function') triggerErrorNotification();
            alert(currentLang === 'ar' ? '⚠️ هذه الغرفة غير مشمولة بالحصة المجانية. يتم تطبيق رسوم الكاملة تلقائياً.' : '⚠️ This room has no free quota package. Full Guest Count applies.');
        }
    } else {
        if (currentTotalPcs > allowedFreePcs) {
            enforcedType = 'quota_extra';
            if (isManualClick && type !== 'quota_extra') {
                if (typeof triggerErrorNotification === 'function') triggerErrorNotification();
                alert(currentLang === 'ar' ? `⚠️ لقد تجاوزت الحصة المجانية (${allowedFreePcs} قطع).` : `⚠️ You have exceeded your free quota of ${allowedFreePcs} pcs.`);
            }
        } else {
            enforcedType = 'hotel';
        }
    }

    currentCountType = enforcedType;

    const btnHotel = document.getElementById('btnCountHotel');
    const btnExtra = document.getElementById('btnCountQuotaExtra');
    const btnGuest = document.getElementById('btnCountGuest');

    if (btnHotel) btnHotel.className = currentCountType === 'hotel' ? 'py-2.5 px-1 rounded-xl bg-[var(--text-gold)] text-stone-950 shadow font-bold leading-tight' : 'py-2.5 px-1 rounded-xl text-muted-custom transition leading-tight opacity-50 cursor-not-allowed';
    if (btnExtra) btnExtra.className = currentCountType === 'quota_extra' ? 'py-2.5 px-1 rounded-xl bg-[var(--text-gold)] text-stone-950 shadow font-bold leading-tight' : 'py-2.5 px-1 rounded-xl text-muted-custom transition leading-tight opacity-50 cursor-not-allowed';
    if (btnGuest) btnGuest.className = currentCountType === 'guest' ? 'py-2.5 px-1 rounded-xl bg-[var(--text-gold)] text-stone-950 shadow font-bold leading-tight' : 'py-2.5 px-1 rounded-xl text-muted-custom transition leading-tight opacity-50 cursor-not-allowed';

    renderCatalogItems();
}

// ─── SWITCH SERVICE (Laundry / Dry / Pressing) ────────────────────
function switchCatalogService(service) {
    catalogService = service;
    ['laundry', 'dry', 'pressing'].forEach(s => {
        const btn = document.getElementById(`catTab${s.charAt(0).toUpperCase() + s.slice(1)}`);
        if (btn) {
            btn.className = (s === service) ? "flex-1 py-2.5 rounded-xl bg-[var(--text-gold)] text-stone-950 shadow font-bold transition" : "flex-1 py-2.5 rounded-xl bg-[var(--bg-dark)] text-muted-custom border border-[var(--border-gold)] transition";
        }
    });
    renderCatalogItems();
}

// ─── RENDER CATALOGUE ─────────────────────────────────────────────
function renderCatalogItems() {
    const container = document.getElementById('catalogItemsContainer');
    if (!container) return;

    const searchInput = document.getElementById('catalogSearchInput');
    const searchFilter = searchInput ? searchInput.value.toLowerCase().trim() : '';

    container.innerHTML = '';
    const serviceData = database[catalogService] || {};
    let totalPieces = 0;
    let subtotal = 0;

    for (const [catName, items] of Object.entries(serviceData)) {
        const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchFilter) || (item.ar && item.ar.includes(searchFilter)));
        if (filteredItems.length === 0) continue;

        const catHeader = document.createElement('div');
        catHeader.className = 'bg-[var(--bg-dark)] text-[var(--text-gold)] px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest mb-2 mt-2 border border-[var(--border-gold-strong)]';
        catHeader.innerText = catName;
        container.appendChild(catHeader);

        filteredItems.forEach(item => {
            const key = `${catalogService}_${catName}_${item.name}`;
            const entry = catalogCart[key] || { qty: 0, freeQty: 0, name: item.name, category: catName, price: item.price };
            const qty = entry.qty || 0;
            const freeQty = entry.freeQty || 0;
            totalPieces += qty;

            if (currentCountType === 'guest') {
                subtotal += item.price * qty;
            } else if (currentCountType === 'quota_extra') {
                let chargeable = qty - freeQty;
                if (chargeable < 0) chargeable = 0;
                subtotal += item.price * chargeable;
            }

            const priceDisplay = currentCountType === 'hotel' ? '0.00 AED' : `${item.price.toFixed(2)} AED`;

            let freeControlsHtml = '';
            if (currentCountType === 'quota_extra' && qty > 0) {
                freeControlsHtml = `
                    <div class="flex items-center gap-1 mt-1 bg-[var(--bg-dark)] px-2 py-0.5 rounded-lg border border-[var(--border-gold)] text-[9px]">
                        <span class="text-muted-custom font-semibold">Free:</span>
                        <button onclick="updateCatalogFreeQty('${key}', -1)" class="w-5 h-5 bg-[var(--bg-card-hover)] text-[var(--text-main)] rounded font-bold">-</button>
                        <span class="text-emerald-400 font-bold px-1">${freeQty}</span>
                        <button onclick="updateCatalogFreeQty('${key}', 1)" class="w-5 h-5 bg-[var(--text-gold)] text-stone-950 rounded font-bold">+</button>
                    </div>
                `;
            }

            const row = document.createElement('div');
            row.className = 'flex justify-between items-center py-2.5 border-b border-[var(--border-gold)] text-xs';
            row.innerHTML = `
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-gold)] text-[var(--text-gold)] flex items-center justify-center text-xs shadow-inner">
                        <i class="fas ${item.icon || 'fa-shirt'}"></i>
                    </div>
                    <div>
                        <p class="font-bold text-[var(--text-main)]">${(typeof currentLang !== 'undefined' && currentLang === 'ar') ? item.ar : item.name}</p>
                        <p class="text-[10px] ${currentCountType === 'hotel' ? 'text-emerald-400 font-bold' : 'text-[var(--text-gold)] font-bold'}">${priceDisplay}</p>
                        ${freeControlsHtml}
                    </div>
                </div>
                <div class="flex items-center space-x-2 bg-[var(--bg-dark)] p-1 rounded-xl border border-[var(--border-gold)]">
                    <button onclick="updateCatalogQty('${key}', '${item.name}', ${item.price}, -1, '${catName}')" class="w-6 h-6 bg-[var(--bg-card-hover)] text-[var(--text-main)] rounded-lg font-bold transition active:scale-90">-</button>
                    <span class="font-bold px-2 text-xs text-[var(--text-main)]">${qty}</span>
                    <button onclick="updateCatalogQty('${key}', '${item.name}', ${item.price}, 1, '${catName}')" class="w-6 h-6 bg-[var(--text-gold)] text-stone-950 rounded-lg font-bold transition active:scale-90">+</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    const summaryEl = document.getElementById('modalCatalogTotalSummary');
    if (summaryEl) summaryEl.innerText = `${totalPieces} pcs · ${subtotal.toFixed(2)} AED`;
}

// ─── UPDATE QTY ────────────────────────────────────────────────────
function updateCatalogQty(key, name, price, delta, catName = '') {
    if (!catalogCart[key]) {
        catalogCart[key] = { name: name, category: catName, price: price, qty: 0, freeQty: 0 };
    }
    catalogCart[key].qty += delta;
    if (catalogCart[key].qty <= 0) delete catalogCart[key];

    const quotaText = (cachedGuestData && cachedGuestData.quota_text) ? cachedGuestData.quota_text : 'Standard';
    const allowedFreePcs = parsePMSQuotaNumber(quotaText);

    selectCountType(currentCountType, false);

    if (currentCountType === 'quota_extra') {
        const checkExtra = document.getElementById('extraChargedCheck');
        if (checkExtra) checkExtra.checked = true;
        
        let remainingFree = allowedFreePcs;
        Object.keys(catalogCart).forEach(itemKey => {
            let item = catalogCart[itemKey];
            if (item.qty <= remainingFree) {
                item.freeQty = item.qty;
                remainingFree -= item.qty;
            } else {
                item.freeQty = remainingFree;
                remainingFree = 0;
            }
        });
    } else if (currentCountType === 'hotel') {
        Object.values(catalogCart).forEach(i => i.freeQty = i.qty);
    }

    renderCatalogItems();
}

// ─── UPDATE FREE QTY ───────────────────────────────────────────────
function updateCatalogFreeQty(key, delta) {
    if (!catalogCart[key]) return;
    catalogCart[key].freeQty += delta;
    if (catalogCart[key].freeQty < 0) catalogCart[key].freeQty = 0;
    if (catalogCart[key].freeQty > catalogCart[key].qty) catalogCart[key].freeQty = catalogCart[key].qty;
    renderCatalogItems();
    
    // ✨ PATCH 3 : Pulse sur le badge panier
    const badge = document.getElementById('selectedBadgeCount');
    if (badge && delta > 0) {
        badge.classList.remove('badge-pulse');
        void badge.offsetWidth;
        badge.classList.add('badge-pulse');
    }
}

// ─── CONFIRM SÉLECTION ────────────────────────────────────────────
function confirmLaundrySelection() {
    let totalPcs = 0;
    let subtotalCalc = 0;

    Object.values(catalogCart).forEach(item => {
        if (item && item.qty > 0) {
            totalPcs += item.qty;
            let countMode = currentCountType || 'hotel';
            if (countMode === 'guest') {
                subtotalCalc += item.price * item.qty;
            } else if (countMode === 'quota_extra') {
                let free = item.freeQty || 0;
                let extra = item.qty - free;
                if (extra < 0) extra = 0;
                subtotalCalc += item.price * extra;
            }
        }
    });

    const badge = document.getElementById('selectedBadgeCount');
    if (badge) badge.innerText = `${totalPcs} pcs`;
    
 const floatingBar = document.getElementById('floatingCartBar');
if (totalPcs > 0) {
    const pcsEl = document.getElementById('floatingCartPieces');
    const priceEl = document.getElementById('floatingCartPrice');
    if (pcsEl) pcsEl.innerText = `${totalPcs} pieces selected`;
    if (priceEl) priceEl.innerText = `${subtotalCalc.toFixed(2)} AED`;
    
    if (floatingBar) {
        const wasHidden = floatingBar.classList.contains('hidden');
        floatingBar.classList.remove('hidden');
        
        // ✨ PATCH 3 : Animation slide si c'est la 1ère fois
        if (wasHidden) {
            floatingBar.classList.remove('floating-cart-pulse');
            void floatingBar.offsetWidth;
            floatingBar.classList.add('floating-cart-pulse');
        }
    }
} else if (floatingBar) {
    floatingBar.classList.add('hidden');
}
    window.finalLaundryCart = catalogCart;
    window.finalLaundryCountType = currentCountType;
    closeLaundryModal();
}
