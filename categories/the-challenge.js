// The Challenge — images in images/the-challenge/
const theChallengeData = [
    // Tier 1 — Obvious (items 1–15)
    { n: "JOHNNY BANANAS", u: "../images/the-challenge/johnny-bananas.jpg" },
    { n: "CT TAMBURELLO", u: "../images/the-challenge/ct-tamburello.jpg" },
    { n: "THE CHALLENGE LOGO", u: "../images/the-challenge/the-challenge-logo.jpg" },
    { n: "WES BERGMANN", u: "../images/the-challenge/wes-bergmann.jpg" },
    { n: "CARA MARIA", u: "../images/the-challenge/cara-maria.jpg" },
    { n: "ELIMINATION PIT", u: "../images/the-challenge/elimination-pit.jpg" },
    { n: "LAUREL STUCKY", u: "../images/the-challenge/laurel-stucky.jpg" },
    { n: "JORDAN WISELEY", u: "../images/the-challenge/jordan-wiseley.jpg" },
    { n: "FINAL", u: "../images/the-challenge/final.jpg" },
    { n: "TORI DEAL", u: "../images/the-challenge/tori-deal.jpg" },
    { n: "ANEESA FERREIRA", u: "../images/the-challenge/aneesa-ferreira.jpg" },
    { n: "THE GAUNTLET", u: "../images/the-challenge/the-gauntlet.jpg" },
    { n: "DARRELL TAYLOR", u: "../images/the-challenge/darrell-taylor.jpg" },
    { n: "RIVALS", u: "../images/the-challenge/rivals.jpg" },
    { n: "LANDON LUECK", u: "../images/the-challenge/landon-lueck.jpg" },

    // Tier 2 — Familiar (items 16–30)
    { n: "THE INFERNO", u: "../images/the-challenge/the-inferno.jpg" },
    { n: "KAM WILLIAMS", u: "../images/the-challenge/kam-williams.jpg" },
    { n: "FRESH MEAT", u: "../images/the-challenge/fresh-meat.jpg" },
    { n: "EMILY SCHROMM", u: "../images/the-challenge/emily-schromm.jpg" },
    { n: "THE ISLAND", u: "../images/the-challenge/the-island.jpg" },
    { n: "EVELYN SMITH", u: "../images/the-challenge/evelyn-smith.jpg" },
    { n: "THE RUINS", u: "../images/the-challenge/the-ruins.jpg" },
    { n: "ZACH NICHOLS", u: "../images/the-challenge/zach-nichols.jpg" },
    { n: "CUTTHROAT", u: "../images/the-challenge/cutthroat.jpg" },
    { n: "LEROY GARRETT", u: "../images/the-challenge/leroy-garrett.jpg" },
    { n: "BATTLE OF THE EXES", u: "../images/the-challenge/battle-of-the-exes.jpg" },
    { n: "DEVIN WALKER", u: "../images/the-challenge/devin-walker.jpg" },
    { n: "FREE AGENTS", u: "../images/the-challenge/free-agents.jpg" },
    { n: "KAYCEE CLARK", u: "../images/the-challenge/kaycee-clark.jpg" },
    { n: "WAR OF THE WORLDS", u: "../images/the-challenge/war-of-the-worlds.jpg" },

    // Tier 3 — Knowledgeable (items 31–40)
    { n: "FESSY SHAFAAT", u: "../images/the-challenge/fessy-shafaat.jpg" },
    { n: "DIRTY 30", u: "../images/the-challenge/dirty-30.jpg" },
    { n: "HORACIO GUTIERREZ", u: "../images/the-challenge/horacio-gutierrez.jpg" },
    { n: "VENDETTAS", u: "../images/the-challenge/vendettas.jpg" },
    { n: "NURYS MATEO", u: "../images/the-challenge/nurys-mateo.jpg" },
    { n: "RIDE OR DIES", u: "../images/the-challenge/ride-or-dies.jpg" },
    { n: "OLIVIA KAISER", u: "../images/the-challenge/olivia-kaiser.jpg" },
    { n: "ALL STARS", u: "../images/the-challenge/all-stars.jpg" },
    { n: "TURBO", u: "../images/the-challenge/turbo.jpg" },
    { n: "BATTLE FOR A NEW CHAMPION", u: "../images/the-challenge/battle-for-a-new-champion.jpg" },

    // Tier 4 — Expert (items 41–50)
    { n: "THEO CAMPBELL", u: "../images/the-challenge/theo-campbell.jpg" },
    { n: "SPIES LIES AND ALLIES", u: "../images/the-challenge/spies-lies-and-allies.jpg" },
    { n: "JONNA MANNION", u: "../images/the-challenge/jonna-mannion.jpg" },
    { n: "DOUBLE AGENTS", u: "../images/the-challenge/double-agents.jpg" },
    { n: "NANY GONZALEZ", u: "../images/the-challenge/nany-gonzalez.jpg" },
    { n: "TOTAL MADNESS", u: "../images/the-challenge/total-madness.jpg" },
    { n: "DERRICK KOSINSKI", u: "../images/the-challenge/derrick-kosinski.jpg" },
    { n: "FINAL RECKONING", u: "../images/the-challenge/final-reckoning.jpg" },
    { n: "MARK LONG", u: "../images/the-challenge/mark-long.jpg" },
    { n: "BATTLE OF THE ERAS", u: "../images/the-challenge/battle-of-the-eras.jpg" },

    // ── BACKUPS (items 51–60) ────────────────
    { n: "CORAL SMITH", u: "../images/the-challenge/coral-smith.jpg" },
    { n: "VERONICA PORTILLO", u: "../images/the-challenge/veronica-portillo.jpg" },
    { n: "RACHEL ROBINSON", u: "../images/the-challenge/rachel-robinson.jpg" },
    { n: "KENNY SANTUCCI", u: "../images/the-challenge/kenny-santucci.jpg" },
    { n: "PAULA MERONEK", u: "../images/the-challenge/paula-meronek.jpg" },
    { n: "SARAH RICE", u: "../images/the-challenge/sarah-rice.jpg" },
    { n: "THE MIZ", u: "../images/the-challenge/the-miz.jpg" },
    { n: "TRISHELLE CANNATELLA", u: "../images/the-challenge/trishelle-cannatella.jpg" },
    { n: "BRAD FIORENZA", u: "../images/the-challenge/brad-fiorenza.jpg" },
    { n: "KATIE DOYLE", u: "../images/the-challenge/katie-doyle.jpg" },

];
if (typeof window !== 'undefined') window.theChallengeData = theChallengeData;
