// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST LAUNDRY PORTAL — Status Tracking
// Suivi des bordereaux + realtime + Timeline visuelle
// ✅ FIX K2 & K3 : Nettoyage cache Guest & robustesse
// ✅ FIX K4 : La commande reste affichée jusqu'à "Delivered"
// ═══════════════════════════════════════════════════════════════════

let currentActiveOrders = [];

// 🛡️ FIX K2 : Nettoyage du cache client à l'entrée
function secureGuestCache(roomNumber) {
    try {
        const lastRoom = localStorage.getItem('remal_last_guest_room');
        
        if (lastRoom && lastRoom !== String(roomNumber)) {
            console.log("🧹 [K2 Cache] Nouvelle chambre détectée. Nettoyage des anciennes données.");
            localStorage.removeItem('remal_guest_orders_cache');
            localStorage.removeItem('remal_guest_chat_cache');
            localStorage.removeItem('remal_guest_name');
        }
        
        localStorage.setItem('remal_last_guest_room', String(roomNumber));
    } catch (e) {
        console.warn("Erreur nettoyage cache Guest:", e);
    }
}

function obtenirReceiptId(order) {
    if (!order) return '---';
    return order.receipt_id || order.receipt_no || order.slip_no || order.receipt_number || `REC-${String(order.id).slice(-6).toUpperCase()}`;
}

async function verifierStatutDerniereCommande(roomNum) {
    if (!roomNum || !cachedGuestData) return;

    // 🛡️ On sécurise le cache au moment où on vérifie les commandes
    secureGuestCache(roomNum);

    const roomStr = String(roomNum).trim();
    const guestNameClean = cachedGuestData.guest_name || '';

    const ilYa24Heures = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient) {
        try {
            const { data, error } = await window.supabaseClient
                .from('guest_laundry_requests')
                .select('*')
                .eq('room_number', roomStr)
                .gte('created_at', ilYa24Heures)
                .order('created_at', { ascending: false });

            if (!error && data) {
                const maintenant = new Date();

                const filteredData = data.filter(order => {
                    const dateCreation = new Date(order.created_at);
                    const heuresDepuisCreation = (maintenant - dateCreation) / (1000 * 60 * 60);

                    if (heuresDepuisCreation >= 24) return false;

                    if (order.guest_name && order.guest_name !== 'Guest' && guestNameClean) {
                        const cleanOrderGuest = order.guest_name.toLowerCase().replace(SALUTATIONS_REGEX, '').trim();
                        const cleanPmsGuest = guestNameClean.toLowerCase().replace(SALUTATIONS_REGEX, '').trim();
                        
                        const orderParts = cleanOrderGuest.split(/\s+/);
                        const pmsParts = cleanPmsGuest.split(/\s+/);

                        const matchesName = orderParts.some(op => pmsParts.some(pp => op.includes(pp) || pp.includes(op)));
                        if (!matchesName) return false;
                    }

                    const st = String(order.status || 'Collected').toLowerCase().trim();

                    // ✅ LOGIQUE INVERSÉE : On cache SI c'est Delivered/Completed, SINON on garde
                    if (st.includes('deliver') || st.includes('complet') || st.includes('done') || st.includes('termin')) {
                        return false; // On le retire du haut (il ira dans l'historique)
                    }

                    // Pour tout le reste (Collected, Washing, Ready, Pending, In Progress, etc.)
                    return true;
                });

                currentActiveOrders = filteredData;
                afficherBannerStatutGuestMultiples(filteredData);
            }
        } catch (err) {
            console.error("Erreur récupération bordereaux buanderie:", err);
        }

        if (guestRealtimeChannel) {
            window.supabaseClient.removeChannel(guestRealtimeChannel);
        }

        guestRealtimeChannel = window.supabaseClient
            .channel(`guest_room_realtime_${roomStr}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'guest_laundry_requests'
                },
                (payload) => {
                    if (payload.new && String(payload.new.room_number).trim() === roomStr) {
                        verifierStatutDerniereCommande(roomStr);
                    }
                }
            )
            .subscribe();
    }
}

// ═══════════════════════════════════════════════════════════════════
// TIMELINE VISUELLE
// ═══════════════════════════════════════════════════════════════════

function afficherBannerStatutGuestMultiples(orders) {
    const container = document.getElementById('guestStatusDisplay');
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    const t = traductions[currentLang] || traductions['en'];

    const STEPS = [
        { key: 'Collected', icon: '🧺', label: t.timelineCollected },
        { key: 'Washing',   icon: '🧼', label: t.timelineWashing },
        { key: 'Ready',     icon: '✨', label: t.timelineReady },
        { key: 'Delivered', icon: '🚚', label: t.timelineDelivered }
    ];

    const statusToStepIndex = {
        'Pending':      0,
        'Collected':    0,
        'In Progress':  1,
        'Washing':      1,
        'Ready':        2,
        'Delivered':    3,
        'Completed':    3
    };

    let html = '';

    orders.forEach((order, index) => {
        const rawStatus = String(order.status || 'Collected').toLowerCase().trim();
        let st = 'Collected';
        if (rawStatus.includes('deliver') || rawStatus.includes('complet')) st = 'Delivered';
        else if (rawStatus.includes('ready')) st = 'Ready';
        else if (rawStatus.includes('washing') || rawStatus.includes('progress')) st = 'Washing';
        else if (rawStatus.includes('pending')) st = 'Pending';

        const currentStepIndex = statusToStepIndex[st] !== undefined ? statusToStepIndex[st] : 0;

        const totalPcs = order.total_pieces || 0;
        const grandTotal = parseFloat(order.grand_total || 0).toFixed(2);
        const receiptId = obtenirReceiptId(order);

        let estimateText = t.timelineEstimateWaiting;
        if (currentStepIndex === 1) estimateText = t.timelineEstimateWashing;
        if (currentStepIndex === 2) estimateText = t.timelineEstimateReady;
        
        const progressPercent = (currentStepIndex / (STEPS.length - 1)) * 100;

        let stepsHtml = '';
        STEPS.forEach((step, idx) => {
            let stateClass = 'future';
            if (idx < currentStepIndex) stateClass = 'completed';
            if (idx === currentStepIndex) stateClass = 'active';

            stepsHtml += `
                <div class="timeline-step ${stateClass}">
                    <div class="timeline-dot ${stateClass}">${idx < currentStepIndex ? '✓' : step.icon}</div>
                    <span class="timeline-label">${step.label}</span>
                </div>
            `;
        });

        html += `
            <div class="timeline-card" onclick="afficherDetailsBordereau(${index})">
                <div class="timeline-header">
                    <div>
                        <span class="timeline-receipt">#${receiptId}</span>
                        <span style="color: var(--text-muted); margin: 0 6px;">·</span>
                        <span style="color: var(--text-muted);">📦 ${totalPcs} pcs</span>
                    </div>
                    <span class="timeline-total">${grandTotal} AED</span>
                </div>

                <div style="position: relative;">
                    <div class="timeline-line"></div>
                    <div class="timeline-line-filled" style="width: ${progressPercent}%;"></div>
                    <div class="timeline-steps">
                        ${stepsHtml}
                    </div>
                </div>

                <div class="timeline-estimate">
                    <i class="fas fa-hourglass-half"></i>
                    <span>${estimateText}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    container.classList.remove('hidden');
}

function afficherDetailsBordereau(index) {
    const order = currentActiveOrders[index];
    if (!order) return;

    const elRef = document.getElementById('receiptRef');
    const elName = document.getElementById('receiptGuestName');
    const elRoom = document.getElementById('receiptRoom');
    const elService = document.getElementById('receiptService');
    const elStatus = document.getElementById('receiptStatus');
    const elSubtotal = document.getElementById('receiptSubtotal');
    const elVat = document.getElementById('receiptVat');
    const elGrandTotal = document.getElementById('receiptGrandTotal');
    const itemsContainer = document.getElementById('receiptItemsContainer');
    const notesBox = document.getElementById('receiptNotesBox');
    const notesText = document.getElementById('receiptNotesText');

    const receiptId = obtenirReceiptId(order);

    if (elRef) elRef.innerText = `Receipt ID: #${receiptId}`;
    if (elName) elName.innerText = order.guest_name || 'Guest';
    if (elRoom) elRoom.innerText = order.room_number || '---';
    if (elService) elService.innerText = order.service_type || 'Laundry';
    if (elStatus) elStatus.innerText = order.status || 'Collected';

    if (elSubtotal) elSubtotal.innerText = `${parseFloat(order.subtotal || 0).toFixed(2)} AED`;
    if (elVat) elVat.innerText = `${parseFloat(order.vat || 0).toFixed(2)} AED`;
    if (elGrandTotal) elGrandTotal.innerText = `${parseFloat(order.grand_total || 0).toFixed(2)} AED`;

    if (order.special_notes && order.special_notes !== 'None' && order.special_notes.trim() !== '') {
        if (notesText) notesText.innerText = order.special_notes;
        if (notesBox) notesBox.classList.remove('hidden');
    } else {
        if (notesBox) notesBox.classList.add('hidden');
    }

    if (itemsContainer) {
        itemsContainer.innerHTML = '';
        const itemsList = Array.isArray(order.items) ? order.items : [];

        if (itemsList.length === 0) {
            itemsContainer.innerHTML = `<p class="text-muted-custom italic text-[11px]">No detailed items specified.</p>`;
        } else {
            itemsList.forEach(item => {
                const qty = item.quantity || item.qty || 1;
                const name = item.name || 'Garment';
                const price = parseFloat(item.total_price || (item.unit_price * qty) || 0).toFixed(2);

                const row = document.createElement('div');
                row.className = "flex justify-between items-center text-[11px] border-b border-[var(--border-gold)] pb-1.5 last:border-0 last:pb-0";
                row.innerHTML = `
                    <span class="font-semibold text-[var(--text-main)]">${qty}x ${name}</span>
                    <span class="font-bold text-[var(--text-gold)]">${price} AED</span>
                `;
                itemsContainer.appendChild(row);
            });
        }
    }

    const modal = document.getElementById('receiptModal');
    if (modal) modal.classList.remove('hidden');
}

function closeReceiptModal() {
    const modal = document.getElementById('receiptModal');
    if (modal) modal.classList.add('hidden');
}
