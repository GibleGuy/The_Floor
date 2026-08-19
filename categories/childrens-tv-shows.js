// Children's TV Shows — images in images/childrens-tv-shows/
const childrensTvShowsData = [
    // Tier 1 — Obvious (1–15)
    { n: "SPONGEBOB SQUAREPANTS", u: "../images/childrens-tv-shows/spongebob-squarepants.webp" },
    { n: "SESAME STREET", u: "../images/childrens-tv-shows/sesame-street.webp" },
    { n: "PEPPA PIG", u: "../images/childrens-tv-shows/peppa-pig.webp" },
    { n: "DORA THE EXPLORER", u: "../images/childrens-tv-shows/dora-the-explorer.webp" },
    { n: "PAW PATROL", u: "../images/childrens-tv-shows/paw-patrol.webp" },
    { n: "BLUEY", u: "../images/childrens-tv-shows/bluey.webp" },
    { n: "THE FLINTSTONES", u: "../images/childrens-tv-shows/the-flintstones.webp" },
    { n: "MICKEY MOUSE CLUBHOUSE", u: "../images/childrens-tv-shows/mickey-mouse-clubhouse.webp" },
    { n: "SCOOBY-DOO", u: "../images/childrens-tv-shows/scooby-doo.webp" },
    { n: "BARNEY & FRIENDS", u: "../images/childrens-tv-shows/barney-and-friends.webp" },
    { n: "THOMAS & FRIENDS", u: "../images/childrens-tv-shows/thomas-and-friends.webp" },
    { n: "TELETUBBIES", u: "../images/childrens-tv-shows/teletubbies.webp" },
    { n: "ARTHUR", u: "../images/childrens-tv-shows/arthur.webp" },
    { n: "TOM AND JERRY", u: "../images/childrens-tv-shows/tom-and-jerry.webp" },
    { n: "LOONEY TUNES", u: "../images/childrens-tv-shows/looney-tunes.webp" },

    // Tier 2 — Familiar (16–30)
    { n: "THE MAGIC SCHOOL BUS", u: "../images/childrens-tv-shows/the-magic-school-bus.webp" },
    { n: "BLUE'S CLUES", u: "../images/childrens-tv-shows/blues-clues.webp" },
    { n: "PHINEAS AND FERB", u: "../images/childrens-tv-shows/phineas-and-ferb.webp" },
    { n: "THE POWERPUFF GIRLS", u: "../images/childrens-tv-shows/the-powerpuff-girls.webp" },
    { n: "CURIOUS GEORGE", u: "../images/childrens-tv-shows/curious-george.webp" },
    { n: "RUGRATS", u: "../images/childrens-tv-shows/rugrats.webp" },
    { n: "MISTER ROGERS' NEIGHBORHOOD", u: "../images/childrens-tv-shows/mister-rogers-neighborhood.webp" },
    { n: "THE FAIRLY ODDPARENTS", u: "../images/childrens-tv-shows/the-fairly-oddparents.webp" },
    { n: "BOB THE BUILDER", u: "../images/childrens-tv-shows/bob-the-builder.webp" },
    { n: "CAILLOU", u: "../images/childrens-tv-shows/caillou.webp" },
    { n: "AVATAR: THE LAST AIRBENDER", u: "../images/childrens-tv-shows/avatar-the-last-airbender.webp" },
    { n: "COCOMELON", u: "../images/childrens-tv-shows/cocomelon.webp" },
    { n: "DANIEL TIGER'S NEIGHBORHOOD", u: "../images/childrens-tv-shows/daniel-tigers-neighborhood.webp" },
    { n: "DOC MCSTUFFINS", u: "../images/childrens-tv-shows/doc-mcstuffins.webp" },
    { n: "BILL NYE THE SCIENCE GUY", u: "../images/childrens-tv-shows/bill-nye-the-science-guy.webp" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "DEXTER'S LABORATORY", u: "../images/childrens-tv-shows/dexters-laboratory.webp" },
    { n: "BEAR IN THE BIG BLUE HOUSE", u: "../images/childrens-tv-shows/bear-in-the-big-blue-house.webp" },
    { n: "HEY ARNOLD!", u: "../images/childrens-tv-shows/hey-arnold.webp" },
    { n: "THE WIGGLES", u: "../images/childrens-tv-shows/the-wiggles.webp" },
    { n: "CLIFFORD THE BIG RED DOG", u: "../images/childrens-tv-shows/clifford-the-big-red-dog.webp" },
    { n: "THE PROUD FAMILY", u: "../images/childrens-tv-shows/the-proud-family.webp" },
    { n: "ZOOBOOMAFOO", u: "../images/childrens-tv-shows/zooboomafoo.webp" },
    { n: "KIM POSSIBLE", u: "../images/childrens-tv-shows/kim-possible.webp" },
    { n: "POSTMAN PAT", u: "../images/childrens-tv-shows/postman-pat.webp" },
    { n: "THE BACKYARDIGANS", u: "../images/childrens-tv-shows/the-backyardigans.webp" },

    // Tier 4 — Expert (41–50)
    { n: "LAZYTOWN", u: "../images/childrens-tv-shows/lazytown.webp" },
    { n: "THE BIG COMFY COUCH", u: "../images/childrens-tv-shows/the-big-comfy-couch.webp" },
    { n: "READING RAINBOW", u: "../images/childrens-tv-shows/reading-rainbow.webp" },
    { n: "DRAGON TALES", u: "../images/childrens-tv-shows/dragon-tales.webp" },
    { n: "OUT OF THE BOX", u: "../images/childrens-tv-shows/out-of-the-box.webp" },
    { n: "LITTLE BEAR", u: "../images/childrens-tv-shows/little-bear.webp" },
    { n: "FRANKLIN", u: "../images/childrens-tv-shows/franklin.webp" },
    { n: "MAX & RUBY", u: "../images/childrens-tv-shows/max-and-ruby.webp" },
    { n: "ROLIE POLIE OLIE", u: "../images/childrens-tv-shows/rolie-polie-olie.webp" },
    { n: "WISHBONE", u: "../images/childrens-tv-shows/wishbone.webp" },

    // ── BACKUPS (51–60) ────────────────
    { n: "GABBY'S DOLLHOUSE", u: "../images/childrens-tv-shows/gabbys-dollhouse.webp" },
    { n: "PJ MASKS", u: "../images/childrens-tv-shows/pj-masks.webp" },
    { n: "OCTONAUTS", u: "../images/childrens-tv-shows/octonauts.webp" },
    { n: "SUPER WHY!", u: "../images/childrens-tv-shows/super-why.webp" },
    { n: "YO GABBA GABBA!", u: "../images/childrens-tv-shows/yo-gabba-gabba.webp" },
    { n: "CYBERCHASE", u: "../images/childrens-tv-shows/cyberchase.webp" },
    { n: "CAPTAIN KANGAROO", u: "../images/childrens-tv-shows/captain-kangaroo.webp" },
    { n: "WILD KRATTS", u: "../images/childrens-tv-shows/wild-kratts.webp" },
    { n: "BOOHBAH", u: "../images/childrens-tv-shows/boohbah.webp" },
    { n: "NODDY", u: "../images/childrens-tv-shows/noddy.webp" }
];
if (typeof window !== 'undefined') window.childrensTvShowsData = childrensTvShowsData;
