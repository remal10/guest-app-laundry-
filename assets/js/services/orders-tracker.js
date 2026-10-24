// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST APP — MY ORDERS TRACKER (v3 - Corrigé)
// Affiche les commandes actives ET l'historique + Badge intelligent
// ═══════════════════════════════════════════════════════════════════

window.GuestOrders = (function () {
    let currentGuest = null;    // { room, name }
    let orders = [];
    let realtimeChannel = null;
    let isVisible = false;

    // ───────────────────────────────────────────────────────────────
    // INIT
    // ───────────────────────────────────────────────────────────────
    function init(room, name) {
        if (!room) return;
        if (currentGuest && currentGuest.room === String(room) && orders.length > 0) {
            return;
        }
        
        currentGuest = { room: String(room), name: String(name || '') };
        console.log('📦 [GuestOrders] Init for room', room);
        refresh();
        subscribeRealtime();
        updateNavBadge();
    }

    // ───────────────────────────────────────────────────────────────
    // REFRESH — Load orders for this guest
    // ───────────────────────────────────────────────────────────────
    async function refresh() {
        if (!currentGuest || !window.supabaseClient) return;

        const roomStr = String(currentGuest.room);
        
        const { data, error } = await window.supabaseClient
            .from('guest_laundry_requests')
            .select('*')
            .or(`guest_room.eq.${roomStr},room_number.eq.${roomStr}`)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('[GuestOrders] Load error:', error.message);
            return;
        }

        orders = (data || []).map(o => {
            let items = o.items;
            if (typeof items === 'string') {
                try { items = JSON.parse(items); } catch (e) { items = []; }
            }
            if (items && typeof items === 'object' && !Array.isArray(items)) {
                items = Object.values(items);
            }
            if (!Array.isArray(items)) items = [];
            return { ...o, items };
        });

        renderOrders();
        updateNavBadge();
    }

    // ───────────────────────────────────────────────────────────────
    // RENDER ORDERS LIST (Sépare Actifs et Historique)
    // ───────────────────────────────────────────────────────────────
    function renderOrders() {
        const container = document.getElementById('myOrdersList');
        if (!container) return;

        // 🛡️ SÉPARATION STRICTE : La commande n'est "terminée" QUE si elle est "delivered"
        const activeOrders = orders.filter(o => normalizeStatus(o.status).key !== 'delivered');
        const pastOrders = orders.filter(o => normalizeStatus(o.status).key === 'delivered');

        if (activeOrders.length === 0 && pastOrders.length === 0) {
            container.innerHTML = `
                <div class="orders-empty">
                    <div style="font-size: 48px; margin-bottom: 12px;">🕰️</div>
                    <p style="font-size: 15px; font-weight: 700; color: #DCA773; margin-bottom: 6px;">
                        No orders yet
                    </p>
                    <p style="font-size: 12px; color: #78716c;">
                        Your laundry orders will appear here.
                    </p>
                </div>
            `;
            return;
        }

        let html = '';

        // 1. Section "Active Orders"
        if (activeOrders.length > 0) {
            html += `
                <div class="my-orders-section-title" style="font-size:11px; font-weight:800; color:#DCA773; text-transform:uppercase; letter-spacing:1px; margin: 16px 0 8px 4px;">
                    🧺 Active Orders
                </div>
                ${activeOrders.map(o => renderOrderCard(o)).join('')}
            `;
        }

        // 2. Section "Past Orders"
        if (pastOrders.length > 0) {
            html += `
                <div class="my-orders-section-title" style="font-size:11px; font-weight:800; color:#78716c; text-transform:uppercase; letter-spacing:1px; margin: 24px 0 8px 4px;">
                    ✅ Past Orders
                </div>
                ${pastOrders.map(o => renderOrderCard(o)).join('')}
            `;
        }

        container.innerHTML = html;
    }

    // ───────────────────────────────────────────────────────────────
    // RENDER ONE ORDER CARD
    // ───────────────────────────────────────────────────────────────
    function renderOrderCard(order) {
        const status = normalizeStatus(order.status);
        const isActive = status.key !== 'delivered';
        const orderRef = order.receipt_id || 'REC-' + String(order.id).slice(-6).toUpperCase();
        const dateStr = formatDate(order.created_at);
        const totalPcs = order.total_pieces || order.total_clothes || 0;
        const total = Number(order.grand_total || order.total || 0).toFixed(2);

        const steps = buildTimeline(order);

        const itemsHTML = (order.items || []).slice(0, 5).map(item => `
            <div class="my-order-item-row">
                <span>${escapeHtml(item.name || 'Item')}</span>
                <span class="my-order-item-qty">×${item.quantity || item.qty || 0}</span>
            </div>
        `).join('');

        const moreItems = (order.items || []).length > 5
            ? `<div style="font-size:10px; color:#78716c; font-style:italic; margin-top:4px; border-top:1px dashed rgba(220,167,115,0.15); padding-top:4px;">+ ${(order.items || []).length - 5} more item(s)</div>`
            : '';

        return `
            <div class="my-order-card ${isActive ? 'active' : 'done'}">
                <div class="my-order-header">
                    <div>
                        <div class="my-order-ref">${escapeHtml(orderRef)}</div>
                        <div class="my-order-date">${dateStr}</div>
                    </div>
                    <div class="my-order-badge ${status.key}">
                        ${status.icon} ${status.label}
                    </div>
                </div>

                <div class="my-order-timeline">
                    ${steps.map(s => `
                        <div class="my-order-step ${s.state}">
                            <div class="my-order-dot">${s.icon}</div>
                            <div class="my-order-label">${s.label}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="my-order-items">
                    ${itemsHTML}
                    ${moreItems}
                </div>

                <div class="my-order-footer">
                    <div class="my-order-meta">
                        <span>🧺 ${totalPcs} piece${totalPcs > 1 ? 's' : ''}</span>
                        <span class="my-order-total">${total} AED</span>
                    </div>
                    ${isActive ? `
                        <button onclick="GuestOrders.scrollToChat()" class="my-order-chat-btn">
                            💬 Questions?
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ───────────────────────────────────────────────────────────────
    // BUILD TIMELINE (4 steps)
    // ───────────────────────────────────────────────────────────────
    function buildTimeline(order) {
        const status = normalizeStatus(order.status);
        const stepDefs = [
            { key: 'collected', label: 'Collected', icon: '📥', order: 0 },
            { key: 'washing',   label: 'Washing',   icon: '🧼', order: 1 },
            { key: 'ready',     label: 'Ready',     icon: '✨', order: 2 },
            { key: 'delivered', label: 'Delivered', icon: '✅', order: 3 }
        ];

        const currentOrder = stepDefs.find(s => s.key === status.key)?.order ?? 0;

        return stepDefs.map(s => {
            let state = 'pending';
            if (s.order < currentOrder) state = 'done';
            else if (s.order === currentOrder) state = 'active';
            return { ...s, state };
        });
    }

    // ───────────────────────────────────────────────────────────────
    // NORMALIZE STATUS (Version robuste - corrige le bug)
    // ═══════════════════════════════════════════════════════════════
    function normalizeStatus(raw) {
        const s = String(raw || 'collected').toLowerCase().trim();
        
        // 1. Si le statut contient "deliver" ou "complet" ou "done", c'est TERMINÉ
        if (s.includes('deliver') || s.includes('complet') || s.includes('done') || s.includes('termin')) {
            return { key: 'delivered', label: 'Delivered', icon: '✅' };
        }
        
        // 2. Si "ready" ou "pret", c'est PRÊT
        if (s.includes('ready') || s.includes('pret')) {
            return { key: 'ready', label: 'Ready', icon: '✨' };
        }
        
        // 3. Si "washing", "progress", "lavage", c'est EN COURS
        if (s.includes('washing') || s.includes('in_progress') || s.includes('progress') || s.includes('lavage')) {
            return { key: 'washing', label: 'Washing', icon: '🧼' };
        }
        
        // 4. Si "pending" ou "attente", c'est EN ATTENTE (mais toujours actif)
        if (s.includes('pending') || s.includes('attente') || s.includes('new')) {
            return { key: 'collected', label: 'Pending', icon: '📥' };
        }

        // 5. Par défaut (si le staff a mis "Collected" ou rien), c'est COLLECTÉ
        return { key: 'collected', label: 'Collected', icon: '📥' };
    }

    // ───────────────────────────────────────────────────────────────
    // NAV BADGE (compte uniquement les commandes EN COURS)
    // ───────────────────────────────────────────────────────────────
    function updateNavBadge() {
        const badge = document.getElementById('myOrdersBadge');
        if (!badge) return;

        const activeCount = orders.filter(o => {
            const k = normalizeStatus(o.status).key;
            return k !== 'delivered';
        }).length;

        if (activeCount > 0) {
            badge.textContent = activeCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // ───────────────────────────────────────────────────────────────
    // REALTIME — listen for status updates
    // ───────────────────────────────────────────────────────────────
    function subscribeRealtime() {
        if (!currentGuest || realtimeChannel) return;

        realtimeChannel = window.supabaseClient
            .channel('guest-orders-' + currentGuest.room)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'guest_laundry_requests', filter: `guest_room=eq.${currentGuest.room}` },
                (payload) => {
                    console.log('🔔 [GuestOrders] Realtime update:', payload.eventType);
                    refresh();
                }
            )
            .subscribe((status) => {
                console.log('📦 [GuestOrders] Realtime:', status);
            });
    }

    // ───────────────────────────────────────────────────────────────
    // UI — SHOW/HIDE MODAL
    // ───────────────────────────────────────────────────────────────
    function show() {
        isVisible = true;
        const modal = document.getElementById('myOrdersModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.setProperty('display', 'flex', 'important');
        }
        refresh();
    }

    function hide() {
        isVisible = false;
        const modal = document.getElementById('myOrdersModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.setProperty('display', 'none', 'important');
        }
    }

    function toggle() {
        if (isVisible) hide();
        else show();
    }

    function close() {
        hide();
    }

    function scrollToChat() {
        if (window.GuestChat && typeof window.GuestChat.open === 'function') {
            window.GuestChat.open();
        }
    }

    // ───────────────────────────────────────────────────────────────
    // UTIL
    // ───────────────────────────────────────────────────────────────
    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function formatDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    return {
        init,
        refresh,
        show,
        hide,
        toggle,
        close,
        scrollToChat,
        _getOrders: () => orders
    };
})();

console.log('✅ [GuestOrders] Loaded (Active & Past Orders - v3 Corrigé)');
