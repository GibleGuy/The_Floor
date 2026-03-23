// Visual Novels — images in images/visual-novels/
const visualNovelsData = [
    // Tier 1 — Obvious (1–15)
    { n: "DOKI DOKI LITERATURE CLUB!", u: "../images/visual-novels/doki-doki-literature-club.webp" },
    { n: "PHOENIX WRIGHT: ACE ATTORNEY", u: "../images/visual-novels/phoenix-wright-ace-attorney.webp" },
    { n: "DANGANRONPA: TRIGGER HAPPY HAVOC", u: "../images/visual-novels/danganronpa.webp" },
    { n: "STEINS;GATE", u: "../images/visual-novels/steins-gate.webp" },
    { n: "CLANNAD", u: "../images/visual-novels/clannad.webp" },
    { n: "FATE/STAY NIGHT", u: "../images/visual-novels/fate-stay-night.webp" },
    { n: "HATOFUL BOYFRIEND", u: "../images/visual-novels/hatoful-boyfriend.webp" },
    { n: "ZERO ESCAPE: NINE HOURS, NINE PERSONS, NINE DOORS", u: "../images/visual-novels/zero-escape-999.webp" },
    { n: "VA-11 HALL-A", u: "../images/visual-novels/va-11-hall-a.webp" },
    { n: "DREAM DADDY", u: "../images/visual-novels/dream-daddy.webp" },
    { n: "KATAWA SHOUJO", u: "../images/visual-novels/katawa-shoujo.webp" },
    { n: "MONSTER PROM", u: "../images/visual-novels/monster-prom.webp" },
    { n: "NEKOPARA", u: "../images/visual-novels/nekopara.webp" },
    { n: "THE FRUIT OF GRISAIA", u: "../images/visual-novels/the-fruit-of-grisaia.webp" },
    { n: "HIGURASHI WHEN THEY CRY", u: "../images/visual-novels/higurashi-when-they-cry.webp" },

    // Tier 2 — Familiar (16–30)
    { n: "UMINEKO WHEN THEY CRY", u: "../images/visual-novels/umineko-when-they-cry.webp" },
    { n: "MUV-LUV ALTERNATIVE", u: "../images/visual-novels/muv-luv-alternative.webp" },
    { n: "AI: THE SOMNIUM FILES", u: "../images/visual-novels/ai-the-somnium-files.webp" },
    { n: "DANGANRONPA 2: GOODBYE DESPAIR", u: "../images/visual-novels/danganronpa-2.webp" },
    { n: "ZERO ESCAPE: VIRTUE'S LAST REWARD", u: "../images/visual-novels/zero-escape-vlr.webp" },
    { n: "CLANNAD AFTER STORY", u: "../images/visual-novels/clannad-after-story.webp" },
    { n: "EVER17: THE OUT OF INFINITY", u: "../images/visual-novels/ever17.webp" },
    { n: "SCIENCE ADVENTURE SERIES", u: "../images/visual-novels/science-adventure-series.webp" },
    { n: "MAJIKOI!", u: "../images/visual-novels/majikoi.webp" },
    { n: "TSUKIHIME", u: "../images/visual-novels/tsukihime.webp" },
    { n: "DIABOLIK LOVERS", u: "../images/visual-novels/diabolik-lovers.webp" },
    { n: "MYSTIC MESSENGER", u: "../images/visual-novels/mystic-messenger.webp" },
    { n: "AMNESIA: MEMORIES", u: "../images/visual-novels/amnesia-memories.webp" },
    { n: "CODE: REALIZE", u: "../images/visual-novels/code-realize.webp" },
    { n: "HAKUOKI", u: "../images/visual-novels/hakuoki.webp" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "BALDR SKY", u: "../images/visual-novels/baldr-sky.webp" },
    { n: "WHITE ALBUM 2", u: "../images/visual-novels/white-album-2.webp" },
    { n: "DIES IRAE", u: "../images/visual-novels/dies-irae.webp" },
    { n: "LITTLE BUSTERS!", u: "../images/visual-novels/little-busters.webp" },
    { n: "REWRITE", u: "../images/visual-novels/rewrite.webp" },
    { n: "KANNAGI NO TORI", u: "../images/visual-novels/kannagi-no-tori.webp" },
    { n: "YUME MIRU KUSURI", u: "../images/visual-novels/yume-miru-kusuri.webp" },
    { n: "THE HOUSE IN FATA MORGANA", u: "../images/visual-novels/the-house-in-fata-morgana.webp" },
    { n: "WONDERFUL EVERYDAY", u: "../images/visual-novels/wonderful-everyday.webp" },
    { n: "ROOT DOUBLE", u: "../images/visual-novels/root-double.webp" },

    // Tier 4 — Expert (41–50)
    { n: "SUMMER POCKETS", u: "../images/visual-novels/summer-pockets.webp" },
    { n: "UTOWARERUMONO", u: "../images/visual-novels/utawarerumono.webp" },
    { n: "KIMINOZO", u: "../images/visual-novels/kiminozo.webp" },
    { n: "AIR", u: "../images/visual-novels/air.webp" },
    { n: "KANON", u: "../images/visual-novels/kanon.webp" },
    { n: "SCHOOL DAYS", u: "../images/visual-novels/school-days.webp" },
    { n: "SAYA NO UTA", u: "../images/visual-novels/saya-no-uta.webp" },
    { n: "KARA NO SHOUJO", u: "../images/visual-novels/kara-no-shoujo.webp" },
    { n: "STEINS;GATE 0", u: "../images/visual-novels/steins-gate-zero.webp" },
    { n: "CHAOS;HEAD", u: "../images/visual-novels/chaos-head.webp" },

    // ── BACKUPS (51–60) ────────────────
    { n: "CHAOS;CHILD", u: "../images/visual-novels/chaos-child.webp" },
    { n: "ROBOTICS;NOTES", u: "../images/visual-novels/robotics-notes.webp" },
    { n: "ANONYMOUS;CODE", u: "../images/visual-novels/anonymous-code.webp" },
    { n: "G-SENJOU NO MAOU", u: "../images/visual-novels/g-senjou-no-maou.webp" },
    { n: "SHACHIBATO", u: "../images/visual-novels/shachibato.webp" },
    { n: "GRISAIA NO RAKUEN", u: "../images/visual-novels/grisaia-no-rakuen.webp" },
    { n: "GRISAIA NO MEIKYUU", u: "../images/visual-novels/grisaia-no-meikyuu.webp" },
    { n: "MARBLE PHANTASM", u: "../images/visual-novels/marble-phantasm.webp" },
    { n: "NUKITASHI", u: "../images/visual-novels/nukitashi.webp" },
    { n: "ATRI: MY DEAR MOMENTS", u: "../images/visual-novels/atri-my-dear-moments.webp" }
];
if (typeof window !== 'undefined') window.visualNovelsData = visualNovelsData;
