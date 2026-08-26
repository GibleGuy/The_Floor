// Roller Coasters — images in images/roller-coasters/
const rollerCoastersData = [
    // Tier 1 — Obvious (1–15)
    { n: "SPACE MOUNTAIN", u: "../images/roller-coasters/space-mountain.jpg", h: "MAGIC KINGDOM" },
    { n: "BIG THUNDER MOUNTAIN", u: "../images/roller-coasters/big-thunder-mountain.jpg", h: "MAGIC KINGDOM" },
    { n: "EXPEDITION EVEREST", u: "../images/roller-coasters/expedition-everest.jpg", h: "DISNEY'S ANIMAL KINGDOM" },
    { n: "MATTERHORN BOBSLEDS", u: "../images/roller-coasters/matterhorn-bobsleds.jpg", h: "DISNEYLAND" },
    { n: "THE INCREDIBLE HULK", u: "../images/roller-coasters/the-incredible-hulk.jpg", h: "ISLANDS OF ADVENTURE" },
    { n: "KINGDA KA", u: "../images/roller-coasters/kingda-ka.jpg", h: "SIX FLAGS GREAT ADVENTURE" },
    { n: "MILLENNIUM FORCE", u: "../images/roller-coasters/millennium-force.jpg", h: "CEDAR POINT" },
    { n: "THE BEAST", u: "../images/roller-coasters/the-beast.jpg", h: "KINGS ISLAND" },
    { n: "TOP THRILL DRAGSTER", u: "../images/roller-coasters/top-thrill-dragster.jpg", h: "CEDAR POINT" },
    { n: "ROCK 'N' ROLLER COASTER", u: "../images/roller-coasters/rock-n-roller-coaster.jpg", h: "DISNEY'S HOLLYWOOD STUDIOS" },
    { n: "INCREDICOASTER", u: "../images/roller-coasters/incredicoaster.jpg", h: "DISNEY CALIFORNIA ADVENTURE" },
    { n: "VELOCICOASTER", u: "../images/roller-coasters/velocicoaster.jpg", h: "ISLANDS OF ADVENTURE" },
    { n: "REVENGE OF THE MUMMY", u: "../images/roller-coasters/revenge-of-the-mummy.jpg", h: "UNIVERSAL STUDIOS" },
    { n: "BATMAN: THE RIDE", u: "../images/roller-coasters/batman-the-ride.jpg", h: "SIX FLAGS" },
    { n: "SEVEN DWARFS MINE TRAIN", u: "../images/roller-coasters/seven-dwarfs-mine-train.jpg", h: "MAGIC KINGDOM" },

    // Tier 2 — Familiar (16–30)
    { n: "STEEL VENGEANCE", u: "../images/roller-coasters/steel-vengeance.jpg", h: "CEDAR POINT" },
    { n: "SUPERMAN: RIDE OF STEEL", u: "../images/roller-coasters/superman-ride-of-steel.jpg", h: "SIX FLAGS" },
    { n: "FURY 325", u: "../images/roller-coasters/fury-325.jpg", h: "CAROWINDS" },
    { n: "EL TORO", u: "../images/roller-coasters/el-toro.jpg", h: "SIX FLAGS GREAT ADVENTURE" },
    { n: "MAVERICK", u: "../images/roller-coasters/maverick.jpg", h: "CEDAR POINT" },
    { n: "X2", u: "../images/roller-coasters/x2.jpg", h: "SIX FLAGS MAGIC MOUNTAIN" },
    { n: "NITRO", u: "../images/roller-coasters/nitro.jpg", h: "SIX FLAGS GREAT ADVENTURE" },
    { n: "CONEY ISLAND CYCLONE", u: "../images/roller-coasters/coney-island-cyclone.jpg", h: "LUNA PARK" },
    { n: "SHEIKRA", u: "../images/roller-coasters/sheikra.jpg", h: "BUSCH GARDENS TAMPA" },
    { n: "IRON GWAZI", u: "../images/roller-coasters/iron-gwazi.jpg", h: "BUSCH GARDENS TAMPA" },
    { n: "APOLLO'S CHARIOT", u: "../images/roller-coasters/apollos-chariot.jpg", h: "BUSCH GARDENS WILLIAMSBURG" },
    { n: "MAGNUM XL-200", u: "../images/roller-coasters/magnum-xl-200.jpg", h: "CEDAR POINT" },
    { n: "DIAMONDBACK", u: "../images/roller-coasters/diamondback.jpg", h: "KINGS ISLAND" },
    { n: "GHOSTRIDER", u: "../images/roller-coasters/ghostrider.jpg", h: "KNOTT'S BERRY FARM" },
    { n: "HAGRID'S MOTORBIKE ADVENTURE", u: "../images/roller-coasters/hagrids-motorbike-adventure.jpg", h: "ISLANDS OF ADVENTURE" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "TATSU", u: "../images/roller-coasters/tatsu.jpg", h: "SIX FLAGS MAGIC MOUNTAIN" },
    { n: "LEVIATHAN", u: "../images/roller-coasters/leviathan.jpg", h: "CANADA'S WONDERLAND" },
    { n: "THE SMILER", u: "../images/roller-coasters/the-smiler.jpg", h: "ALTON TOWERS" },
    { n: "NEMESIS", u: "../images/roller-coasters/nemesis.jpg", h: "ALTON TOWERS" },
    { n: "MONTU", u: "../images/roller-coasters/montu.jpg", h: "BUSCH GARDENS TAMPA" },
    { n: "BANSHEE", u: "../images/roller-coasters/banshee.jpg", h: "KINGS ISLAND" },
    { n: "MAKO", u: "../images/roller-coasters/mako.jpg", h: "SEAWORLD ORLANDO" },
    { n: "CHEETAH HUNT", u: "../images/roller-coasters/cheetah-hunt.jpg", h: "BUSCH GARDENS TAMPA" },
    { n: "YUKON STRIKER", u: "../images/roller-coasters/yukon-striker.jpg", h: "CANADA'S WONDERLAND" },
    { n: "INTIMIDATOR 305", u: "../images/roller-coasters/intimidator-305.jpg", h: "KINGS DOMINION" },

    // Tier 4 — Expert (41–50)
    { n: "FORMULA ROSSA", u: "../images/roller-coasters/formula-rossa.jpg", h: "FERRARI WORLD" },
    { n: "EEJANAIKA", u: "../images/roller-coasters/eejanaika.jpg", h: "FUJI-Q HIGHLAND" },
    { n: "STEEL DRAGON 2000", u: "../images/roller-coasters/steel-dragon-2000.jpg", h: "NAGASHIMA SPA LAND" },
    { n: "HELIX", u: "../images/roller-coasters/helix.jpg", h: "LISEBERG" },

    // ── BACKUPS (51–60) ────────────────
];
if (typeof window !== 'undefined') window.rollerCoastersData = rollerCoastersData;
