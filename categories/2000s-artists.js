// 2000s Artists — images in images/2000s-artists/
const artists2000sData = [
    // Tier 1 — Obvious (1–15)
    { n: "BEYONCÉ", u: "../images/2000s-artists/beyonce.webp" },
    { n: "EMINEM", u: "../images/2000s-artists/eminem.webp" },
    { n: "BRITNEY SPEARS", u: "../images/2000s-artists/britney-spears.webp" },
    { n: "JUSTIN TIMBERLAKE", u: "../images/2000s-artists/justin-timberlake.webp" },
    { n: "RIHANNA", u: "../images/2000s-artists/rihanna.webp" },
    { n: "LADY GAGA", u: "../images/2000s-artists/lady-gaga.webp" },
    { n: "USHER", u: "../images/2000s-artists/usher.webp" },
    { n: "TAYLOR SWIFT", u: "../images/2000s-artists/taylor-swift.webp" },
    { n: "JAY-Z", u: "../images/2000s-artists/jay-z.webp" },
    { n: "KANYE WEST", u: "../images/2000s-artists/kanye-west.webp" },
    { n: "COLDPLAY", u: "../images/2000s-artists/coldplay.webp" },
    { n: "KATY PERRY", u: "../images/2000s-artists/katy-perry.webp" },
    { n: "PINK", u: "../images/2000s-artists/pink.webp" },
    { n: "ALICIA KEYS", u: "../images/2000s-artists/alicia-keys.webp" },
    { n: "AVRIL LAVIGNE", u: "../images/2000s-artists/avril-lavigne.webp" },

    // Tier 2 — Familiar (16–30)
    { n: "BLACK EYED PEAS", u: "../images/2000s-artists/black-eyed-peas.webp" },
    { n: "SHAKIRA", u: "../images/2000s-artists/shakira.webp" },
    { n: "GREEN DAY", u: "../images/2000s-artists/green-day.webp" },
    { n: "LINKIN PARK", u: "../images/2000s-artists/linkin-park.webp" },
    { n: "RED HOT CHILI PEPPERS", u: "../images/2000s-artists/red-hot-chili-peppers.webp" },
    { n: "KELLY CLARKSON", u: "../images/2000s-artists/kelly-clarkson.webp" },
    { n: "CHRISTINA AGUILERA", u: "../images/2000s-artists/christina-aguilera.webp" },
    { n: "SNOOP DOGG", u: "../images/2000s-artists/snoop-dogg.webp" },
    { n: "GWEN STEFANI", u: "../images/2000s-artists/gwen-stefani.webp" },
    { n: "MARIAH CAREY", u: "../images/2000s-artists/mariah-carey.webp" },
    { n: "NICKELBACK", u: "../images/2000s-artists/nickelback.webp" },
    { n: "FOO FIGHTERS", u: "../images/2000s-artists/foo-fighters.webp" },
    { n: "MAROON 5", u: "../images/2000s-artists/maroon-5.webp" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "JOHN MAYER", u: "../images/2000s-artists/john-mayer.webp" },
    { n: "NELLY", u: "../images/2000s-artists/nelly.webp" },
    { n: "LIL WAYNE", u: "../images/2000s-artists/lil-wayne.webp" },
    { n: "MISSY ELLIOTT", u: "../images/2000s-artists/missy-elliott.webp" },
    { n: "T-PAIN", u: "../images/2000s-artists/t-pain.webp" },
    { n: "LUDACRIS", u: "../images/2000s-artists/ludacris.webp" },
    { n: "FALL OUT BOY", u: "../images/2000s-artists/fall-out-boy.webp" },
    { n: "MY CHEMICAL ROMANCE", u: "../images/2000s-artists/my-chemical-romance.webp" },
    { n: "PARAMORE", u: "../images/2000s-artists/paramore.webp" },
    { n: "DESTINY'S CHILD", u: "../images/2000s-artists/destinys-child.webp" },

    // Tier 4 — Expert (41–50)
    { n: "NSYNC", u: "../images/2000s-artists/nsync.webp" },
    { n: "BACKSTREET BOYS", u: "../images/2000s-artists/backstreet-boys.webp" },
    { n: "BLINK-182", u: "../images/2000s-artists/blink-182.webp" },
    { n: "THE KILLERS", u: "../images/2000s-artists/the-killers.webp" },
    { n: "EVANESCENCE", u: "../images/2000s-artists/evanescence.webp" },
    { n: "THREE DOORS DOWN", u: "../images/2000s-artists/three-doors-down.webp" },
    { n: "THE WHITE STRIPES", u: "../images/2000s-artists/the-white-stripes.webp" },
    { n: "GORILLAZ", u: "../images/2000s-artists/gorillaz.webp" },
    { n: "SEAN PAUL", u: "../images/2000s-artists/sean-paul.webp" },
    { n: "SHAGGY", u: "../images/2000s-artists/shaggy.webp" },

    // ── BACKUPS (51–60) ────────────────
    { n: "THE STROKES", u: "../images/2000s-artists/the-strokes.webp" },
    { n: "ARCTIC MONKEYS", u: "../images/2000s-artists/arctic-monkeys.webp" },
    { n: "OUTKAST", u: "../images/2000s-artists/outkast-backup.webp" }, // Note: Outkast is in tier 2
    { n: "DEATH CAB FOR CUTIE", u: "../images/2000s-artists/death-cab-for-cutie.webp" },
    { n: "SNOW PATROL", u: "../images/2000s-artists/snow-patrol.webp" },
    { n: "KINGS OF LEON", u: "../images/2000s-artists/kings-of-leon.webp" },
    { n: "TIMBALAND", u: "../images/2000s-artists/timbaland.webp" },
    { n: "KELLY ROWLAND", u: "../images/2000s-artists/kelly-rowland.webp" },
    { n: "CIARA", u: "../images/2000s-artists/ciara.webp" },
    { n: "CHRIS BROWN", u: "../images/2000s-artists/chris-brown.webp" }
];
// Replace the duplicate Outkast in backups with 50 Cent (as backup) or another artist

if (typeof window !== 'undefined') window.artists2000sData = artists2000sData;
