// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST LAUNDRY PORTAL — Orders
// Création commande + politique + envoi WhatsApp
// ═══════════════════════════════════════════════════════════════════

let selectedSendMethod = 'direct';

function demanderConfirmation(methode) {
    const roomInput = document.getElementById('guestRoomInput');
    const room = roomInput ? roomInput.value.trim() : '';

    if (!room) {
        triggerErrorNotification();
        alert("⚠️ Please indicate your room number.");
        if (roomInput) roomInput.focus();
        return;
    }

    if (!isGuestVerified) {
        triggerErrorNotification();
        alert(currentLang === 'ar' ? "⚠️ يرجى تأكيد الاسم أولاً." : "⚠️ Please verify your name (e.g., Sangare or Zidane) first.");
        const nameInput = document.getElementById('guestNameInput');
        if (nameInput) nameInput.focus();
        return;
    }

    selectedSendMethod = methode;

    const policy = GUEST_POLICIES_DATA[currentLang] || GUEST_POLICIES_DATA['en'];
    const contentBox = document.getElementById('policyModalContent');

    if (contentBox) {
        if (currentLang === 'ar') {
            contentBox.setAttribute('dir', 'rtl');
            contentBox.classList.add('text-right');
        } else {
            contentBox.setAttribute('dir', 'ltr');
            contentBox.classList.remove('text-right');
        }
    }

    const elHeader = document.getElementById('policyModalHeader');
    const elVat = document.getElementById('modalVatNotice');
    const elDelTitle = document.getElementById('modalDeliveryTitle');
    const elBefore9 = document.getElementById('modalBefore9');
    const elAfter9 = document.getElementById('modalAfter9');
    const elExpress = document.getElementById('modalExpress');
    const elTermsTitle = document.getElementById('modalTermsTitle');
    const elTermsBody = document.getElementById('modalTermsBody');
    const elLiability = document.getElementById('modalLiability');
    const elAcceptText = document.getElementById('modalAcceptCheckText');

    if (elHeader) elHeader.innerText = policy.modalHeader;
    if (elVat) elVat.innerText = policy.vat;
    if (elDelTitle) elDelTitle.innerText = policy.deliveryTitle;
    if (elBefore9) elBefore9.innerText = policy.before9;
    if (elAfter9) elAfter9.innerText = policy.after9;
    if (elExpress) elExpress.innerText = policy.express;
    if (elTermsTitle) elTermsTitle.innerText = policy.termsTitle;
    if (elTermsBody) elTermsBody.innerText = policy.termsBody;
    if (elLiability) elLiability.innerText = policy.liability;
    if (elAcceptText) elAcceptText.innerText = policy.acceptText;

    const actionBtn = document.getElementById('modalActionBtn');
    const actionIcon = document.getElementById('modalActionIcon');
    const actionText = document.getElementById('modalActionText');

    if (actionBtn && actionIcon && actionText) {
        if (selectedSendMethod === 'direct') {
            actionBtn.className = "w-full bg-[#DCA773] text-stone-950 font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2.5 uppercase tracking-widest hover:scale-[1.01]";
            actionIcon.className = "fas fa-concierge-bell text-base text-stone-950";
            actionText.innerText = traductions[currentLang]?.btnDirectText || "Direct Order to Laundry";
        } else {
            actionBtn.className = "w-full bg-[#10b981] text-stone-950 font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2.5 uppercase tracking-widest hover:scale-[1.01]";
            actionIcon.className = "fab fa-whatsapp text-lg text-stone-950";
            actionText.innerText = traductions[currentLang]?.btnWhatsAppText || "Send via WhatsApp";
        }
    }

    const checkAccept = document.getElementById('acceptPolicyCheck');
    if (checkAccept) checkAccept.checked = false;

    const policyModal = document.getElementById('policyModal');
    if (policyModal) policyModal.classList.remove('hidden');
}

function closePolicyConfirmationModal() {
    const policyModal = document.getElementById('policyModal');
    if (policyModal) policyModal.classList.add('hidden');
}

async function enregistrerCommandeDansSupabase() {
    const room = document.getElementById('guestRoomInput').value.trim();
    const service = document.getElementById('guestServiceSelect').value;
    const specialNotes = document.getElementById('guestDetailsArea').value.trim();
    const isExtraCharged = document.getElementById('extraChargedCheck').checked;

    let itemsArray = [];
    let itemsListText = "";
    let totalPiecesCalc = 0;
    let subtotalCalc = 0;

    if (window.finalLaundryCart && Object.keys(window.finalLaundryCart).length > 0) {
        let formattedItems = [];
        Object.values(window.finalLaundryCart).forEach(item => {
            if (item && item.qty > 0) {
                totalPiecesCalc += item.qty;
                let linePrice = 0;
                let countMode = window.finalLaundryCountType || 'hotel';
                
                let free = item.freeQty || 0;
                let extra = item.qty - free;
                if (extra < 0) extra = 0;

                if (countMode === 'guest') {
                    linePrice = item.price * item.qty;
                } else if (countMode === 'quota_extra') {
                    linePrice = item.price * extra;
                }

                subtotalCalc += linePrice;

                itemsArray.push({
                    name: item.name,
                    category: item.category || '',
                    quantity: item.qty,
                    free_quantity: free,
                    extra_quantity: extra,
                    unit_price: item.price,
                    total_price: linePrice
                });

                let line = `• ${item.qty}x ${item.name}`;
                if (countMode === 'guest') {
                    line += ` (${linePrice.toFixed(2)} AED)`;
                } else if (countMode === 'quota_extra') {
                    line += ` [${free} Free, ${extra} Extra - ${linePrice.toFixed(2)} AED]`;
                } else {
                    line += ` (Hotel Free Count)`;
                }
                formattedItems.push(line);
            }
        });
        if (formattedItems.length > 0) {
            itemsListText = formattedItems.join('\n');
        }
    }

    const guestName = cachedGuestData ? cachedGuestData.guest_name : 'Guest';
    const quotaText = cachedGuestData ? cachedGuestData.quota_text : 'Standard';
    const vatCalc = subtotalCalc * 0.05;
    const grandTotalCalc = subtotalCalc + vatCalc;

    const payload = {
        room_number: room,
        guest_name: guestName,
        pms_quota: quotaText,
        extra_charged: isExtraCharged,
        service_type: service,
        items: itemsArray,
        total_pieces: totalPiecesCalc,
        subtotal: subtotalCalc,
        vat: vatCalc,
        grand_total: grandTotalCalc,
        special_notes: specialNotes || 'None',
        status: 'Pending',
        accepted_policy: true,
        created_by: 'pending'
    };

    const { data, error } = await window.supabaseClient
        .from('guest_laundry_requests')
        .insert([payload])
        .select();

    if (error) {
        console.error("Erreur Insertion Supabase :", error.message || error);
        throw error;
    }

    const insertedOrder = (data && data.length > 0) ? data[0] : null;

    return {
        insertedOrder, room, guestName, quotaText, isExtraCharged, service,
        itemsListText, totalPiecesCalc, subtotalCalc, vatCalc, grandTotalCalc, specialNotes
    };
}

function reinitialiserPanierEtChamps() {
    window.finalLaundryCart = {};
    catalogCart = {};
    const badge = document.getElementById('selectedBadgeCount');
    const floatBar = document.getElementById('floatingCartBar');
    const notesArea = document.getElementById('guestDetailsArea');

    if (badge) badge.innerText = "0 pcs";
    if (floatBar) floatBar.classList.add('hidden');
    if (notesArea) notesArea.value = '';
}

async function executerEnvoiApresAcceptation() {
    const checkAccept = document.getElementById('acceptPolicyCheck');
    const isAccepted = checkAccept ? checkAccept.checked : false;

    if (!isAccepted) {
        triggerErrorNotification();
        alert(currentLang === 'ar' ? '⚠️ يرجى الموافقة على الشروط والأحكام للمتابعة.' : '⚠️ Please accept the terms and policies to proceed.');
        return;
    }

    const actionBtn = document.getElementById('modalActionBtn');
    const actionIcon = document.getElementById('modalActionIcon');
    const actionText = document.getElementById('modalActionText');

    if (actionBtn) {
        actionBtn.disabled = true;
        actionBtn.classList.add('opacity-80', 'cursor-not-allowed');
    }
    if (actionIcon) actionIcon.className = "fas fa-spinner fa-spin text-base text-stone-950";
    if (actionText) actionText.innerText = currentLang === 'ar' ? 'جاري الإرسال...' : 'Processing...';

    if (selectedSendMethod === 'direct') {
        try {
            const result = await enregistrerCommandeDansSupabase();
            setTimeout(() => {
                closePolicyConfirmationModal();
                if (actionBtn) {
                    actionBtn.disabled = false;
                    actionBtn.classList.remove('opacity-80', 'cursor-not-allowed');
                }

                alert(currentLang === 'ar' 
                    ? '✅ تم إرسال طلب الغسيل بنجاح إلى قسم المغسلة!' 
                    : '✅ Your laundry order has been submitted directly to hotel laundry service!');
                
                reinitialiserPanierEtChamps();

                const room = document.getElementById('guestRoomInput').value.trim();
                verifierStatutDerniereCommande(room);

            }, 800);
        } catch (err) {
            alert(currentLang === 'ar' ? '❌ حدث خطأ أثناء إرسال الطلب.' : '❌ An error occurred while submitting your request.');
            if (actionBtn) {
                actionBtn.disabled = false;
                actionBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            }
            if (actionIcon) actionIcon.className = "fas fa-concierge-bell text-base text-stone-950";
            if (actionText) actionText.innerText = traductions[currentLang]?.btnDirectText || "Direct Order to Laundry";
        }
    } else {
        let result;
        try {
            result = await enregistrerCommandeDansSupabase();
        } catch (e) {
            console.warn("Échec écriture Supabase, poursuite vers WhatsApp...");
        }

        const numeroWhatsAppLaundry = "971561314938";
        const room = document.getElementById('guestRoomInput').value.trim();
        const service = document.getElementById('guestServiceSelect').value;
        const specialNotes = document.getElementById('guestDetailsArea').value.trim();
        const isExtraCharged = document.getElementById('extraChargedCheck').checked;
        const guestName = cachedGuestData ? cachedGuestData.guest_name : 'Guest';
        const quotaText = cachedGuestData ? cachedGuestData.quota_text : 'Standard';

        const extraChargedText = isExtraCharged ? "✅ YES (Accepts Extra Charges)" : "❌ NO";
        const finalItemsText = result ? result.itemsListText : "Catalog Items Selected";
        const finalNotesText = specialNotes || "None";
        const subtotalCalc = result ? result.subtotalCalc : 0;
        const vatCalc = result ? result.vatCalc : 0;
        const grandTotalCalc = result ? result.grandTotalCalc : 0;
        const totalPiecesCalc = result ? result.totalPiecesCalc : 0;

        const message = `*🛎️ NEW LAUNDRY REQUEST - GUEST*\n\n` +
                        `🏨 *Room:* ${room}\n` +
                        `👤 *Guest Name:* ${guestName}\n` +
                        `📋 *PMS Quota:* ${quotaText}\n` +
                        `💳 *Extra Charged:* ${extraChargedText}\n` +
                        `🛠️ *Service:* ${service}\n\n` +
                        `🧺 *Selected Items (${totalPiecesCalc} pcs):*\n${finalItemsText}\n\n` +
                        `💰 *Subtotal:* ${subtotalCalc.toFixed(2)} AED\n` +
                        `🧾 *VAT (5%):* ${vatCalc.toFixed(2)} AED\n` +
                        `💎 *Grand Total:* ${grandTotalCalc.toFixed(2)} AED\n\n` +
                        `📝 *Special Recommendations / Notes:*\n${finalNotesText}\n\n` +
                        `_Sent from Guest Portal (Terms Accepted)._`;

        const urlWhatsApp = `https://wa.me/${numeroWhatsAppLaundry}?text=${encodeURIComponent(message)}`;
        window.open(urlWhatsApp, '_blank');

        reinitialiserPanierEtChamps();
        verifierStatutDerniereCommande(room);

        setTimeout(() => {
            closePolicyConfirmationModal();
            if (actionBtn) {
                actionBtn.disabled = false;
                actionBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            }
        }, 1000);
    }
}
