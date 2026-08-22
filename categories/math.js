(function () {
    const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    function item(answer, question) {
        return { n: String(answer), q: question, u: TRANSPARENT_PIXEL };
    }

    const mathData = [
        // Tier 1 — Obvious (items 1–15)
        item("15", "8 + 7"),
        item("9", "15 - 6"),
        item("72", "9 × 8"),
        item("7", "42 ÷ 6"),
        item("121", "11 × 11"),
        item("39", "25 + 14"),
        item("36", "60 - 24"),
        item("84", "7 × 12"),
        item("7", "56 ÷ 8"),
        item("8", "√64"),
        item("27", "3³"),
        item("12", "120 ÷ 10"),
        item("83", "45 + 38"),
        item("55", "82 - 27"),
        item("52", "13 × 4"),

        // Tier 2 — Familiar (items 16–30)
        item("16", "64 ÷ 4"),
        item("75", "15 × 5"),
        item("12", "√144"),
        item("64", "4³"),
        item("150", "25 × 6"),
        item("33", "72 - 39"),
        item("13", "91 ÷ 7"),
        item("84", "14 × 6"),
        item("13", "√169"),
        item("92", "18 + 74"),
        item("25", "125 ÷ 5"),
        item("64", "16 × 4"),
        item("16", "2⁴"),
        item("55", "111 - 56"),
        item("120", "15 × 8"),

        // Tier 3 — Knowledgeable (items 31–40)
        item("98", "14 × 7"),
        item("18", "108 ÷ 6"),
        item("15", "√225"),
        item("125", "5³"),
        item("156", "13 × 12"),
        item("65", "112 - 47"),
        item("80", "16 × 5"),
        item("17", "204 ÷ 12"),
        item("17", "√289"),
        item("81", "3⁴"),

        // Tier 4 — Expert (items 41–50)
        item("225", "15 × 15"),
        item("18", "√324"),
        item("210", "14 × 15"),
        item("32", "256 ÷ 8"),
        item("216", "6³"),
        item("20", "√400"),
        item("133", "19 × 7"),
        item("140", "28 × 5"),
        item("21", "315 ÷ 15"),
        item("1024", "2¹⁰"),

        // ── BACKUPS (items 51–60) ────────────────
        item("102", "17 × 6"),
        item("19", "√361"),
        item("343", "7³"),
        item("12", "144 ÷ 12"),
        item("144", "24 × 6"),
        item("36", "2² × 3²"),
        item("25", "√625"),
        item("140", "35 × 4"),
        item("169", "13 × 13"),
        item("512", "8³")
    ];

    if (typeof window !== 'undefined') window.mathData = mathData;
})();
