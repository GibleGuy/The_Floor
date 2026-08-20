// PBS Kids — images in images/pbs-kids/
const pbsKidsData = [
    // Tier 1 — Obvious (1–15)
    { n: "ARTHUR", u: "../images/pbs-kids/arthur.webp" },
    { n: "SESAME STREET", u: "../images/pbs-kids/sesame-street.webp" },
    { n: "THE MAGIC SCHOOL BUS", u: "../images/pbs-kids/the-magic-school-bus.webp" },
    { n: "CLIFFORD THE BIG RED DOG", u: "../images/pbs-kids/clifford-the-big-red-dog.webp" },
    { n: "CURIOUS GEORGE", u: "../images/pbs-kids/curious-george.webp" },
    { n: "MISTER ROGERS' NEIGHBORHOOD", u: "../images/pbs-kids/mister-rogers-neighborhood.webp" },
    { n: "READING RAINBOW", u: "../images/pbs-kids/reading-rainbow.webp" },
    { n: "DANIEL TIGER'S NEIGHBORHOOD", u: "../images/pbs-kids/daniel-tigers-neighborhood.webp" },
    { n: "BARNEY & FRIENDS", u: "../images/pbs-kids/barney-and-friends.webp" },
    { n: "TELETUBBIES", u: "../images/pbs-kids/teletubbies.webp" },
    { n: "DRAGON TALES", u: "../images/pbs-kids/dragon-tales.webp" },
    { n: "CAILLOU", u: "../images/pbs-kids/caillou.webp" },
    { n: "WILD KRATTS", u: "../images/pbs-kids/wild-kratts.webp" },
    { n: "ZOOM", u: "../images/pbs-kids/zoom.webp" },
    { n: "SUPER WHY!", u: "../images/pbs-kids/super-why.webp" },

    // Tier 2 — Familiar (16–30)
    { n: "WISHBONE", u: "../images/pbs-kids/wishbone.webp" },
    { n: "CYBERCHASE", u: "../images/pbs-kids/cyberchase.webp" },
    { n: "ZOOBOOMAFOO", u: "../images/pbs-kids/zooboomafoo.webp" },
    { n: "DINOSAUR TRAIN", u: "../images/pbs-kids/dinosaur-train.webp" },
    { n: "BETWEEN THE LIONS", u: "../images/pbs-kids/between-the-lions.webp" },
    { n: "WORDGIRL", u: "../images/pbs-kids/wordgirl.webp" },
    { n: "MARTHA SPEAKS", u: "../images/pbs-kids/martha-speaks.webp" },
    { n: "FETCH! WITH RUFF RUFFMAN", u: "../images/pbs-kids/fetch-with-ruff-ruffman.webp" },
    { n: "PEG + CAT", u: "../images/pbs-kids/peg-plus-cat.webp" },
    { n: "SID THE SCIENCE KID", u: "../images/pbs-kids/sid-the-science-kid.webp" },
    { n: "MAYA & MIGUEL", u: "../images/pbs-kids/maya-and-miguel.webp" },
    { n: "BOB THE BUILDER", u: "../images/pbs-kids/bob-the-builder.webp" },
    { n: "ODD SQUAD", u: "../images/pbs-kids/odd-squad.webp" },
    { n: "THOMAS & FRIENDS", u: "../images/pbs-kids/thomas-and-friends.webp" },
    { n: "WORDWORLD", u: "../images/pbs-kids/wordworld.webp" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "NATURE CAT", u: "../images/pbs-kids/nature-cat.webp" },
    { n: "READY JET GO!", u: "../images/pbs-kids/ready-jet-go.webp" },
    { n: "THE CAT IN THE HAT", u: "../images/pbs-kids/the-cat-in-the-hat.webp" },
    { n: "MOLLY OF DENALI", u: "../images/pbs-kids/molly-of-denali.webp" },
    { n: "ELINOR WONDERS WHY", u: "../images/pbs-kids/elinor-wonders-why.webp" },
    { n: "ROSIE'S RULES", u: "../images/pbs-kids/rosies-rules.webp" },
    { n: "DONKEY HODIE", u: "../images/pbs-kids/donkey-hodie.webp" },
    { n: "LET'S GO LUNA!", u: "../images/pbs-kids/lets-go-luna.webp" },
    { n: "SPLASH AND BUBBLES", u: "../images/pbs-kids/splash-and-bubbles.webp" },
    { n: "ANGELINA BALLERINA", u: "../images/pbs-kids/angelina-ballerina.webp" },

    // Tier 4 — Expert (41–50)
    { n: "LIBERTY'S KIDS", u: "../images/pbs-kids/libertys-kids.webp" },
    { n: "POSTCARDS FROM BUSTER", u: "../images/pbs-kids/postcards-from-buster.webp" },
    { n: "SAGWA", u: "../images/pbs-kids/sagwa.webp" },
    { n: "SHINING TIME STATION", u: "../images/pbs-kids/shining-time-station.webp" },
    { n: "JAY JAY THE JET PLANE", u: "../images/pbs-kids/jay-jay-the-jet-plane.webp" },
    { n: "GEORGE SHRINKS", u: "../images/pbs-kids/george-shrinks.webp" },
    { n: "TOAD PATROL", u: "../images/pbs-kids/toad-patrol.webp" },
    { n: "SEVEN LITTLE MONSTERS", u: "../images/pbs-kids/seven-little-monsters.webp" },
    { n: "CORDUROY", u: "../images/pbs-kids/corduroy.webp" },
    { n: "PEEP AND THE BIG WIDE WORLD", u: "../images/pbs-kids/peep-and-the-big-wide-world.webp" },

    // ── BACKUPS (51–60) ────────────────
    { n: "ALMA'S WAY", u: "../images/pbs-kids/almas-way.webp" },
    { n: "WORK IT OUT WOMBATS!", u: "../images/pbs-kids/work-it-out-wombats.webp" },
    { n: "PINKALICIOUS & PETERRIFIC", u: "../images/pbs-kids/pinkalicious-and-peterrific.webp" },
    { n: "XAVIER RIDDLE", u: "../images/pbs-kids/xavier-riddle.webp" },
    { n: "CYBERCHASE DIGIT", u: "../images/pbs-kids/cyberchase-digit.webp" },
    { n: "BOOHBAH", u: "../images/pbs-kids/boohbah.webp" },
    { n: "BILL NYE THE SCIENCE GUY", u: "../images/pbs-kids/bill-nye-the-science-guy.webp" },
    { n: "ANNE OF GREEN GABLES", u: "../images/pbs-kids/anne-of-green-gables.webp" },
    { n: "THE BERENSTAIN BEARS", u: "../images/pbs-kids/the-berenstain-bears.webp" },
    { n: "DESIGN SQUAD", u: "../images/pbs-kids/design-squad.webp" }
];
if (typeof window !== 'undefined') window.pbsKidsData = pbsKidsData;
