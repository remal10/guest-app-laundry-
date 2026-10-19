// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST LAUNDRY PORTAL — Database
// Catalogue articles (Laundry / Dry / Pressing)
// ⚠️ NE PAS MODIFIER les prix/articles sans validation
// ═══════════════════════════════════════════════════════════════════

const database = {
    laundry: {
        "GENTLEMEN": [
            { name: "Shirt", ar: "قميص", price: 22, icon: "fa-shirt" },
            { name: "T-Shirt", ar: "فانيلة", price: 15, icon: "fa-shirt" },
            { name: "Trousers", ar: "بنطلون", price: 24, icon: "fa-vest" },
            { name: "Under Shirt", ar: "قميص داخلي", price: 10, icon: "fa-shirt" },
            { name: "Under Pants", ar: "سروال داخلي", price: 12, icon: "fa-vest" },
            { name: "Pajama Slack", ar: "بيجامة سلاك", price: 11, icon: "fa-bed" },
            { name: "Pajamas (2 Pcs)", ar: "بيجامة قطعتين", price: 22, icon: "fa-bed" },
            { name: "Socks", ar: "جوارب", price: 6, icon: "fa-socks" },
            { name: "Jacket", ar: "جاكيت", price: 34, icon: "fa-vest" },
            { name: "Dishdash", ar: "دشداشة", price: 30, icon: "fa-user-tie" },
            { name: "Gutra", ar: "غترة", price: 10, icon: "fa-head-side-mask" },
            { name: "Khafia", ar: "كوفية", price: 10, icon: "fa-hat-cowboy" },
            { name: "Lungi", ar: "وزار", price: 15, icon: "fa-vest" },
            { name: "Shorts", ar: "سروال قصير", price: 18, icon: "fa-vest" },
            { name: "Track Suit", ar: "بدلة رياضة", price: 30, icon: "fa-person-running" },
            { name: "Overall", ar: "افرول", price: 36, icon: "fa-user-gear" },
            { name: "Gloves", ar: "قفازات", price: 6, icon: "fa-mitten" },
            { name: "Knee Pad", ar: "واقي الركبة", price: 6, icon: "fa-shield-halved" },
            { name: "Bandages", ar: "مشد رباط", price: 6, icon: "fa-bandage" }
        ],
        "LADIES": [
            { name: "Dress", ar: "فستان", price: 42, icon: "fa-person-dress" },
            { name: "Blouse", ar: "بلوزة", price: 24, icon: "fa-shirt" },
            { name: "Skirt", ar: "تنورة", price: 24, icon: "fa-person-dress" },
            { name: "Jacket", ar: "سترة/جاكيت", price: 30, icon: "fa-vest" },
            { name: "Petticoat", ar: "كومبليزون", price: 10, icon: "fa-person-dress" },
            { name: "Brassiere", ar: "صدرية/سوتيان", price: 12, icon: "fa-vest" },
            { name: "Trousers", ar: "بنطلون", price: 18, icon: "fa-vest" },
            { name: "Night Gown", ar: "قميص نوم", price: 30, icon: "fa-bed" },
            { name: "Dressing Gown", ar: "عباية", price: 30, icon: "fa-person-dress" },
            { name: "Panties", ar: "سروال داخلي", price: 12, icon: "fa-vest" },
            { name: "Handkerchief", ar: "منديل", price: 6, icon: "fa-note-sticky" },
            { name: "Scarf", ar: "حجاب/شيلة", price: 15, icon: "fa-head-side-mask" },
            { name: "Saree", ar: "ساري", price: 36, icon: "fa-person-dress" }
        ],
        "CHILDREN": [
            { name: "Child - Shorts", ar: "شورت", price: 7, icon: "fa-child" },
            { name: "Child - Trouser", ar: "بنطلون", price: 12, icon: "fa-child" },
            { name: "Child - Shirt", ar: "قميص", price: 7, icon: "fa-child" },
            { name: "Child - T-Shirt", ar: "قميص خفيف", price: 12, icon: "fa-child" },
            { name: "Child - Dishdasha", ar: "دشداشة", price: 7, icon: "fa-child" },
            { name: "Child - Dress", ar: "فستان", price: 22, icon: "fa-child" }
        ]
    },
    dry: {
        "GENTLEMEN": [
            { name: "Suit (2 pcs.)", ar: "بدلة قطعتين", price: 54, icon: "fa-user-tie" },
            { name: "Trousers", ar: "بنطلون", price: 36, icon: "fa-vest" },
            { name: "Jacket", ar: "جاكيت", price: 30, icon: "fa-vest" },
            { name: "Necktie", ar: "ربطة عنق", price: 18, icon: "fa-user-tie" },
            { name: "Sweater", ar: "كنزة", price: 22, icon: "fa-shirt" },
            { name: "Shirt (Silk)", ar: "قميص حرير", price: 24, icon: "fa-shirt" },
            { name: "Dishdash", ar: "دشداشة", price: 36, icon: "fa-user-tie" },
            { name: "Gutra", ar: "غترة", price: 12, icon: "fa-head-side-mask" },
            { name: "T-Shirt", ar: "قميص خفيف", price: 27, icon: "fa-shirt" },
            { name: "Waist Coat", ar: "سترة", price: 22, icon: "fa-vest" },
            { name: "Overall", ar: "افرول", price: 42, icon: "fa-user-gear" },
            { name: "Cap / Hat", ar: "قبعة", price: 12, icon: "fa-hat-cowboy" }
        ],
        "LADIES": [
            { name: "Dress", ar: "فستان", price: 48, icon: "fa-person-dress" },
            { name: "Evening Dress", ar: "فستان سهرة", price: 54, icon: "fa-person-dress" },
            { name: "Blouse", ar: "بلوزة", price: 36, icon: "fa-shirt" },
            { name: "Skirt", ar: "تنورة", price: 27, icon: "fa-person-dress" },
            { name: "Slacks / Trousers", ar: "بنطلون", price: 24, icon: "fa-vest" },
            { name: "Jacket", ar: "جاكيت", price: 30, icon: "fa-vest" },
            { name: "Saree", ar: "ساري", price: 42, icon: "fa-person-dress" },
            { name: "Abbaya", ar: "عباية", price: 36, icon: "fa-person-dress" },
            { name: "T-Shirt", ar: "قميص خفيف", price: 27, icon: "fa-shirt" },
            { name: "Scarf", ar: "حجاب/شيلة", price: 18, icon: "fa-head-side-mask" },
            { name: "Pajama", ar: "بيجامة", price: 30, icon: "fa-bed" },
            { name: "Child - Dress", ar: "فستان", price: 24, icon: "fa-child" },
            { name: "Child - T-Shirt", ar: "قميص الأطفال", price: 12, icon: "fa-child" },
            { name: "Shawl", ar: "شال", price: 12, icon: "fa-head-side-mask" }
        ]
    },
    pressing: {
        "GENTLEMEN": [
            { name: "Suit (2 pcs.)", ar: "بدلة قطعتين", price: 30, icon: "fa-user-tie" },
            { name: "Trousers", ar: "بنطلون", price: 12, icon: "fa-vest" },
            { name: "Jacket", ar: "جاكيت", price: 18, icon: "fa-vest" },
            { name: "Shirt", ar: "قميص", price: 12, icon: "fa-shirt" },
            { name: "Necktie", ar: "ربطة عنق", price: 12, icon: "fa-user-tie" },
            { name: "Dishdash", ar: "دشداشة", price: 18, icon: "fa-user-tie" },
            { name: "Lungi", ar: "وزار", price: 12, icon: "fa-vest" },
            { name: "T-Shirt", ar: "قميص خفيف", price: 10, icon: "fa-shirt" },
            { name: "Overall", ar: "افرول", price: 24, icon: "fa-user-gear" },
            { name: "Pajama Slack", ar: "بيجامة سلاك", price: 15, icon: "fa-bed" },
            { name: "Gutra", ar: "غترة", price: 6, icon: "fa-head-side-mask" },
            { name: "Shorts", ar: "سروال قصير / شورت", price: 10, icon: "fa-vest" },
            { name: "Abbaya", ar: "عباية", price: 18, icon: "fa-person-dress" }
        ],
        "LADIES": [
            { name: "Blouse", ar: "بلوزة", price: 12, icon: "fa-shirt" },
            { name: "Dress", ar: "فستان", price: 30, icon: "fa-person-dress" },
            { name: "Evening Dress", ar: "فستان سهرة", price: 42, icon: "fa-person-dress" },
            { name: "Skirt", ar: "تنورة", price: 15, icon: "fa-person-dress" },
            { name: "Slacks / Trousers", ar: "بنطلون", price: 12, icon: "fa-vest" },
            { name: "Jacket", ar: "جاكيت", price: 24, icon: "fa-vest" },
            { name: "Saree", ar: "ساري", price: 24, icon: "fa-person-dress" },
            { name: "Abbaya", ar: "عباية", price: 21, icon: "fa-person-dress" },
            { name: "Night Gown", ar: "قميص نوم", price: 18, icon: "fa-bed" },
            { name: "Scarf", ar: "حجاب/شيلة", price: 10, icon: "fa-head-side-mask" },
            { name: "Shawl", ar: "شال", price: 10, icon: "fa-head-side-mask" }
        ]
    }
};
