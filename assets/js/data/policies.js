// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST LAUNDRY PORTAL — Policies
// Conditions de service (4 langues)
// ═══════════════════════════════════════════════════════════════════

const GUEST_POLICIES_DATA = {
    en: {
        modalHeader: "Order Confirmation & Policy",
        vat: "ALL PRICES ARE IN UAE DIRHAM AND ARE INCLUSIVE OF ALL APPLICABLE SERVICE CHARGES, LOCAL FEES AND 5% VAT*",
        deliveryTitle: "Delivery Schedule & Express Service",
        before9: "• Garment received before 9 am will be delivered the same day after 5 pm.",
        after9: "• Garment received after 9 am will be delivered the following day after 5 pm.",
        express: "• For express service delivery within 2 hours will be charged 100% additional.",
        termsTitle: "PLEASE NOTE :",
        termsBody: "Fill in the list and place in laundry bag provided. The hotel count must be accepted as correct if no list has been enclosed. Any claim connecting the finished articles must be accompanied by this list and reported within 24 hours. Whilst every care will be taken, the hotel cannot be held responsible for fading or change of colour, shrinkage or wear and tear.",
        liability: "In case of damage or loss, the hotel will be liable only for a maximum value equal 5 times the cost of the service rendered.",
        acceptText: "I have read and agree to the hotel laundry policies and delivery terms."
    },
    fr: {
        modalHeader: "Confirmation & Conditions",
        vat: "TOUS LES PRIX SONT EN DIRHAMS EAU ET INCLUENT LES FRAIS DE SERVICE ET LA TVA DE 5%*",
        deliveryTitle: "Horaires de Livraison & Service Express",
        before9: "• Les vêtements reçus avant 9h seront livrés le jour même après 17h.",
        after9: "• Les vêtements reçus après 9h seront livrés le lendemain après 17h.",
        express: "• Pour un service express en moins de 2 heures, un supplément de 100% sera appliqué.",
        termsTitle: "REMARQUE IMPORTANTE :",
        termsBody: "Remplissez la liste et placez-la dans le sac à linge fourni. Le comptage de l'hôtel sera considéré comme exact si aucune liste n'est jointe. Toute réclamation doit être faite sous 24 heures avec cette liste. L'hôtel décline toute responsabilité en cas de décoloration, rétrécissement ou usure normale.",
        liability: "En cas de dommage ou de perte, la responsabilité de l'hôtel est limitée à un maximum de 5 fois le coût du service rendu.",
        acceptText: "J'ai lu et j'accepte les conditions de service et politiques de buanderie de l'hôtel."
    },
    ar: {
        modalHeader: "تأكيد الطلب الشروط والأحكام",
        vat: "جميع الأسعار بالدرهم الإماراتي وتشمل جميع رسوم الخدمة والرسوم المحلية وضريبة القيمة المضافة*",
        deliveryTitle: "مواعيد التسليم والخدمة السريعة",
        before9: "• يتم إعادة الثياب التي يتم استلامها قبل الساعة التاسعة صباحاً في نفس اليوم بعد الساعة الخامسة مساءً.",
        after9: "• يتم إعادة الثياب التي يتم استلامها بعد الساعة التاسعة صباحاً في اليوم التالي بعد الساعة الخامسة مساءً.",
        express: "• للخدمات السريعة خلال ساعتين يضاف 100% تكليف إضافية.",
        termsTitle: "يرجى ملاحظة مايلي :",
        termsBody: "يرجى مليء القائمة المرفقة ووضعها ضمن كيس الغسيل، ويتم اعتبار تعداد الفندق صحيحاً إذا لم تكن القائمة مرفقة. يتعين عند الإبلاغ عن أي شكوى بشأن القطع المنجزة أن يتم ذلك خلال 24 ساعة مع إرفاق هذه القائمة.",
        liability: "مسؤولية الفندق في حدها الأقصى عند التلف أو الفقدان خمسة أضعاف رسوم الخدمة المقدمة.",
        acceptText: "لقد قرأت وأوافق على شروط خدمة المغسلة وسياسة الفندق."
    },
    hi: {
        modalHeader: "आदेश पुष्टि और नीति",
        vat: "सभी कीमतें संयुक्त अरब अमीरात दिरहाम में हैं और वैट शामिल है*",
        deliveryTitle: "डिलीवरी का समय और एक्सप्रेस सेवा",
        before9: "• सुबह 9 बजे से पहले प्राप्त कपड़े उसी दिन शाम 5 बजे के बाद डिलीवर किए जाएंगे।",
        after9: "• सुबह 9 बजे के बाद प्राप्त कपड़े अगले दिन शाम 5 बजे के बाद डिलीवर किए जाएंगे।",
        express: "• 2 घंटे के भीतर एक्सप्रेस डिलीवरी के लिए 100% अतिरिक्त शुल्क लिया जाएगा।",
        termsTitle: "कृपया ध्यान दें :",
        termsBody: "कृपया सूची भरें और कपड़े के बैग में रखें।",
        liability: "क्षति या हानि के मामले में, होटल की देनदारी ली गई सेवा की लागत के अधिकतम 5 गुना तक सीमित होगी।",
        acceptText: "मैंने होटल की लांड्री नीतियों को पढ़ लिया है और सहमत हूँ।"
    }
};
