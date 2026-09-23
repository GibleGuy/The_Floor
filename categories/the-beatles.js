(function () {
    const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    function item(answer, question) {
        return { n: String(answer), q: question, u: TRANSPARENT_PIXEL };
    }

    const theBeatlesData = [
        // Tier 1 — Obvious (items 1–15)
        item("JUDE", "HEY ____"),
        item("YELLOW", "____ SUBMARINE"),
        item("BE", "LET IT ____"),
        item("LUCY", "____ IN THE SKY WITH DIAMONDS"),
        item("LOVE", "ALL YOU NEED IS ____"),
        item("SUN", "HERE COMES THE ____"),
        item("HAND", "I WANT TO HOLD YOUR ____"),
        item("SHOUT", "TWIST AND ____"),
        item("LANE", "PENNY ____"),
        item("TICKET", "____ TO RIDE"),
        item("WEEK", "EIGHT DAYS A ____"),
        item("NIGHT", "A HARD DAY'S ____"),
        item("ELEANOR", "____ RIGBY"),
        item("FIELDS", "STRAWBERRY ____ FOREVER"),
        item("YESTERDAY", "____, ALL MY TROUBLES SEEMED SO FAR AWAY"),

        // Tier 2 — Familiar (items 16–30)
        item("FRIENDS", "WITH A LITTLE HELP FROM MY ____"),
        item("LIFE", "A DAY IN THE ____"),
        item("WALRUS", "I AM THE ____"),
        item("SIXTY-FOUR", "WHEN I'M ____"),
        item("GUITAR", "WHILE MY ____ GENTLY WEEPS"),
        item("ROAD", "THE LONG AND WINDING ____"),
        item("USSR", "BACK IN THE ____"),
        item("TOGETHER", "COME ____"),
        item("SGT", "____ PEPPER'S LONELY HEARTS CLUB BAND"),
        item("MYSTERY", "MAGICAL ____ TOUR"),
        item("CAR", "DRIVE MY ____"),
        item("NOWHERE", "____ MAN"),
        item("WOOD", "NORWEGIAN ____"),
        item("WRITER", "PAPERBACK ____"),
        item("SKELTER", "HELTER ____"),

        // Tier 3 — Knowledgeable (items 31–40)
        item("GARDEN", "OCTOPUS'S ____"),
        item("TRIPPER", "DAY ____"),
        item("BACK", "GET ____"),
        item("DOWN", "DON'T LET ME ____"),
        item("MADONNA", "LADY ____"),
        item("UNIVERSE", "ACROSS THE ____"),
        item("LEAVING", "SHE'S ____ HOME"),
        item("HILL", "THE FOOL ON THE ____"),
        item("RITA", "LOVELY ____"),
        item("SADIE", "SEXY ____"),

        // Tier 4 — Expert (items 41–50)
        item("PRUDENCE", "DEAR ____"),
        item("ONION", "GLASS ____"),
        item("RACCOON", "ROCKY ____"),
        item("HAMMER", "MAXWELL'S SILVER ____"),
        item("PIE", "HONEY ____"),
        item("PAM", "POLYTHENE ____"),
        item("MUSTARD", "MEAN MR. ____"),
        item("TRUFFLE", "SAVOY ____"),
        item("SLUMBERS", "GOLDEN ____"),
        item("WINDOW", "SHE CAME IN THROUGH THE BATHROOM ____"),

        // ── BACKUPS (items 51–60) ────────────────
        item("DA", "OB-LA-DI, OB-LA-____"),
        item("YOKO", "THE BALLAD OF JOHN AND ____"),
        item("BILL", "BUNGALOW ____"),
        item("BLUES", "YER ____"),
        item("WEIGHT", "CARRY THAT ____"),
        item("MONEY", "YOU NEVER GIVE ME YOUR ____"),
        item("US", "TWO OF ____"),
        item("MINE", "I ME ____"),
        item("HEY", "____ BULLDOG"),
        item("KNOWS", "TOMORROW NEVER ____"),

    ];

    if (typeof window !== 'undefined') window.theBeatlesData = theBeatlesData;
})();
