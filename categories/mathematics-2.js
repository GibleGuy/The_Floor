(function () {
    const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    function item(answer, question) {
        return { n: String(answer), q: question, u: TRANSPARENT_PIXEL };
    }

    const mathematics2Data = [
        // Tier 1 — Obvious (items 1–15)
        item("15", "6 + 9"),
        item("12", "20 - 8"),
        item("42", "6 × 7"),
        item("9", "36 ÷ 4"),
        item("144", "12 × 12"),
        item("48", "31 + 17"),
        item("31", "50 - 19"),
        item("88", "8 × 11"),
        item("7", "63 ÷ 9"),
        item("9", "√81"),
        item("8", "2³"),
        item("10", "90 ÷ 9"),
        item("63", "27 + 36"),
        item("52", "70 - 18"),
        item("45", "9 × 5"),

        // Tier 2 — Familiar (items 16–30)
        item("9", "81 ÷ 9"),
        item("96", "12 × 8"),
        item("10", "√100"),
        item("32", "2⁵"),
        item("126", "18 × 7"),
        item("47", "95 - 48"),
        item("12", "96 ÷ 8"),
        item("66", "11 × 6"),
        item("14", "√196"),
        item("82", "29 + 53"),
        item("25", "200 ÷ 8"),
        item("81", "9 × 9"),
        item("49", "7²"),
        item("63", "130 - 67"),
        item("99", "11 × 9"),

        // Tier 3 — Knowledgeable (items 31–40)
        item("132", "12 × 11"),
        item("18", "144 ÷ 8"),
        item("16", "√256"),
        item("256", "4⁴"),
        item("136", "17 × 8"),
        item("113", "201 - 88"),
        item("144", "16 × 9"),
        item("19", "247 ÷ 13"),
        item("21", "√441"),
        item("64", "2⁶"),

        // Tier 4 — Expert (items 41–50)
        item("256", "16 × 16"),
        item("22", "√484"),
        item("221", "17 × 13"),
        item("27", "432 ÷ 16"),
        item("729", "9³"),
        item("23", "√529"),
        item("184", "23 × 8"),
        item("171", "19 × 9"),
        item("21", "378 ÷ 18"),
        item("128", "2⁷"),

        // ── BACKUPS (items 51–60) ────────────────
        item("162", "18 × 9"),
        item("24", "√576"),
        item("1728", "12³"),
        item("15", "165 ÷ 11"),
        item("154", "22 × 7"),
        item("108", "3³ × 2²"),
        item("26", "√676"),
        item("164", "41 × 4"),
        item("196", "14 × 14"),
        item("625", "5⁴")
    ];

    if (typeof window !== 'undefined') window.mathematics2Data = mathematics2Data;
})();
