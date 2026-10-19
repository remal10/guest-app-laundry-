// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST APP — CHAT SERVICE (v2 avec Son & Badge Fix)
// ═══════════════════════════════════════════════════════════════════

window.GuestChat = (function () {
    let conversation = null;
    let realtimeChannel = null;
    let currentGuest = null;
    let isOpen = false;

    async function init(room, name) {
        if (!room || !name) {
            console.warn('[Chat] init: missing room or name');
            return;
        }
        if (currentGuest && currentGuest.room === String(room) && conversation) {
            console.log('💬 [Chat] Already initialized for', room);
            return; // 🎯 Éviter la double init
        }

        currentGuest = { room: String(room), name: String(name) };
        console.log('💬 [Chat] Init for room', room, '/', name);

        await ensureConversation();
        if (!conversation) return;

        await loadMessages();
        subscribeRealtime();
        updateUnreadBadge();
    }

    async function ensureConversation() {
        if (!window.supabaseClient || !currentGuest) return null;
        const { room, name } = currentGuest;

        const { data: existing, error: fetchErr } = await window.supabaseClient
            .from('chat_conversations')
            .select('*')
            .eq('room', room)
            .maybeSingle();

        if (fetchErr) console.warn('[Chat] Fetch conversation error:', fetchErr.message);

        if (existing) {
            conversation = existing;
            if (existing.status === 'archived') {
                await window.supabaseClient
                    .from('chat_conversations')
                    .update({ status: 'open', guest_name: name })
                    .eq('id', existing.id);
                conversation.status = 'open';
            }
            return conversation;
        }

        const { data: created, error: createErr } = await window.supabaseClient
            .from('chat_conversations')
            .insert([{ room, guest_name: name, status: 'open' }])
            .select()
            .single();

        if (createErr) {
            console.error('[Chat] Create conversation error:', createErr.message);
            return null;
        }

        conversation = created;
        return conversation;
    }

    async function loadMessages() {
        if (!conversation) return [];
        const { data, error } = await window.supabaseClient
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[Chat] Load messages error:', error.message);
            return [];
        }

        renderMessages(data || []);
        markGuestMessagesAsRead(data || []);
        return data || [];
    }

    async function sendMessage(content) {
        if (!conversation || !currentGuest) return false;
        const text = String(content || '').trim();
        if (!text) return false;

        // 🎯 UI Optimiste — On affiche le message TOUT DE SUITE
        const tempMsg = {
            id: 'temp-' + Date.now(),
            sender_type: 'guest',
            sender_name: currentGuest.name,
            content: text,
            created_at: new Date().toISOString()
        };
        appendMessage(tempMsg);

        const { data, error } = await window.supabaseClient
            .from('chat_messages')
            .insert([{
                conversation_id: conversation.id,
                sender_type: 'guest',
                sender_name: currentGuest.name,
                content: text,
                is_read_by_admin: false,
                is_read_by_guest: true
            }])
            .select()
            .single();

        if (error) {
            console.error('[Chat] Send error:', error.message);
            const container = document.getElementById('chatMessagesContainer');
            if (container) {
                const tempEl = container.querySelector('[data-msg-id="' + tempMsg.id + '"]');
                if (tempEl) tempEl.remove();
            }
            return false;
        }
        return true;
    }

    function subscribeRealtime() {
        if (!conversation || realtimeChannel) return;

        realtimeChannel = window.supabaseClient
            .channel('guest-chat-' + conversation.id)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `conversation_id=eq.${conversation.id}`
                },
                (payload) => {
                    const msg = payload.new;
                    if (msg.sender_type === 'admin') {
                        appendMessage(msg);

                        // 🔊 1. JOUER LE SON À L'ARRIVÉE D'UN MESSAGE
                        if (typeof playLuxuryHotelChime === 'function') {
                            playLuxuryHotelChime();
                        } else {
                            try {
                                const audio = new Audio('assets/notification.mp3'); 
                                audio.play().catch(e => console.log('Audio bloqué par le navigateur'));
                            } catch(e) {}
                        }

                        // 👁️ 2. SI LA MODALE EST OUVERTE, MARQUER COMME LU
                        if (isOpen) {
                            markOneAsReadByGuest(msg.id);
                        }
                        
                        // 3. METTRE A JOUR LE BADGE
                        updateUnreadBadge();
                    }
                }
            )
            .subscribe((status) => {
                console.log('💬 [Chat] Realtime status:', status);
            });
    }

    function renderMessages(messages) {
        const container = document.getElementById('chatMessagesContainer');
        if (!container) return;

        if (!messages || messages.length === 0) {
            container.innerHTML = `
                <div class="chat-empty">
                    <p>👋 Welcome, ${escapeHtml(currentGuest?.name || '')}!</p>
                    <p>Send a message to reception — we'll reply as soon as possible.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(m => buildBubble(m)).join('');
        scrollToBottom();
    }

    function appendMessage(msg) {
        const container = document.getElementById('chatMessagesContainer');
        if (!container) return;

        // Empêcher les doublons (si l'ID existe déjà)
        if (msg.id && container.querySelector(`[data-msg-id="${msg.id}"]`)) {
            return; 
        }

        const empty = container.querySelector('.chat-empty');
        if (empty) empty.remove();

        const wrap = document.createElement('div');
        wrap.innerHTML = buildBubble(msg);
        const bubbleEl = wrap.firstElementChild;
        
        if (msg.id) bubbleEl.dataset.msgId = msg.id;

        container.appendChild(bubbleEl);
        scrollToBottom();
    }

    function buildBubble(msg) {
        const isGuest = msg.sender_type === 'guest';
        const time = new Date(msg.created_at).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const align = isGuest ? 'chat-msg--guest' : 'chat-msg--admin';
        const label = isGuest ? 'You' : (msg.sender_name || 'Reception');

        return `
            <div class="chat-msg ${align}">
                <div class="chat-msg-label">${escapeHtml(label)} · ${time}</div>
                <div class="chat-msg-bubble">${escapeHtml(msg.content)}</div>
            </div>
        `;
    }

    function scrollToBottom() {
        const container = document.getElementById('chatMessagesContainer');
        if (container) container.scrollTop = container.scrollHeight;
    }

    async function updateUnreadBadge() {
        if (!conversation) return;
        const { count, error } = await window.supabaseClient
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .eq('sender_type', 'admin')
            .eq('is_read_by_guest', false);

        if (error) return;

        const badge = document.getElementById('chatFabBadge');
        if (!badge) return;

        if (count && count > 0) {
            badge.textContent = count > 9 ? '9+' : String(count);
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
            badge.textContent = '0';
        }
    }

    async function markGuestMessagesAsRead(messages) {
        if (!conversation || !messages || messages.length === 0) return;
        const unreadIds = messages
            .filter(m => m.sender_type === 'admin' && m.is_read_by_guest === false)
            .map(m => m.id);
        if (unreadIds.length === 0) return;

        await window.supabaseClient
            .from('chat_messages')
            .update({ is_read_by_guest: true })
            .in('id', unreadIds);
    }

    async function markOneAsReadByGuest(msgId) {
        if (!msgId) return;
        await window.supabaseClient
            .from('chat_messages')
            .update({ is_read_by_guest: true })
            .eq('id', msgId);
    }

    function open() {
        const modal = document.getElementById('chatModal');
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.style.setProperty('display', 'flex', 'important');
        isOpen = true;

        // 🎯 FIX : On cache le badge IMMÉDIATEMENT quand on ouvre
        const badge = document.getElementById('chatFabBadge');
        if (badge) {
            badge.classList.add('hidden');
            badge.textContent = '0';
        }

        setTimeout(() => {
            const input = document.getElementById('chatInput');
            if (input) input.focus();
            scrollToBottom();
            // Le loadMessages() va aussi marquer les messages comme lus en base
            loadMessages(); 
        }, 100);
    }

    function close() {
        const modal = document.getElementById('chatModal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.style.setProperty('display', 'none', 'important');
        isOpen = false;
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\n/g, '<br>');
    }

    return {
        init,
        open,
        close,
        sendMessage,
        updateUnreadBadge,
        _getConversation: () => conversation
    };
})();

console.log('✅ [Chat] Guest chat service loaded (Sound & Badge FIX)');
