// State Capitals — images in images/state-capitals/
// All 50 US state capitals, ordered by recognizability
const stateCapitalsData = [
    // Tier 1 — Obvious (1–15)
    { n: "AUSTIN", u: "../images/state-capitals/austin.webp" },
    { n: "ATLANTA", u: "../images/state-capitals/atlanta.webp" },
    { n: "DENVER", u: "../images/state-capitals/denver.webp" },
    { n: "HONOLULU", u: "../images/state-capitals/honolulu.webp" },
    { n: "NASHVILLE", u: "../images/state-capitals/nashville.webp" },
    { n: "BOSTON", u: "../images/state-capitals/boston.webp" },
    { n: "COLUMBUS", u: "../images/state-capitals/columbus.webp" },
    { n: "SACRAMENTO", u: "../images/state-capitals/sacramento.webp" },
    { n: "PHOENIX", u: "../images/state-capitals/phoenix.webp" },
    { n: "SALT LAKE CITY", u: "../images/state-capitals/salt-lake-city.webp" },
    { n: "INDIANAPOLIS", u: "../images/state-capitals/indianapolis.webp" },
    { n: "RICHMOND", u: "../images/state-capitals/richmond.webp" },
    { n: "BATON ROUGE", u: "../images/state-capitals/baton-rouge.webp" },
    { n: "RALEIGH", u: "../images/state-capitals/raleigh.webp" },
    { n: "TALLAHASSEE", u: "../images/state-capitals/tallahassee.webp" },

    // Tier 2 — Familiar (16–30)
    { n: "JUNEAU", u: "../images/state-capitals/juneau.webp" },
    { n: "ANNAPOLIS", u: "../images/state-capitals/annapolis.webp" },
    { n: "SANTA FE", u: "../images/state-capitals/santa-fe.webp" },
    { n: "MADISON", u: "../images/state-capitals/madison.webp" },
    { n: "OLYMPIA", u: "../images/state-capitals/olympia.webp" },
    { n: "HARRISBURG", u: "../images/state-capitals/harrisburg.webp" },
    { n: "SPRINGFIELD", u: "../images/state-capitals/springfield.webp" },
    { n: "ALBANY", u: "../images/state-capitals/albany.webp" },
    { n: "TRENTON", u: "../images/state-capitals/trenton.webp" },
    { n: "LITTLE ROCK", u: "../images/state-capitals/little-rock.webp" },
    { n: "DES MOINES", u: "../images/state-capitals/des-moines.webp" },
    { n: "JACKSON", u: "../images/state-capitals/jackson.webp" },
    { n: "OKLAHOMA CITY", u: "../images/state-capitals/oklahoma-city.webp" },
    { n: "CHARLESTON", u: "../images/state-capitals/charleston.webp" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "BOISE", u: "../images/state-capitals/boise.webp" },
    { n: "HELENA", u: "../images/state-capitals/helena.webp" },
    { n: "TOPEKA", u: "../images/state-capitals/topeka.webp" },
    { n: "LANSING", u: "../images/state-capitals/lansing.webp" },
    { n: "CONCORD", u: "../images/state-capitals/concord.webp" },

    // Tier 4 — Expert (41–50)

    // ── BACKUPS (51–60) ────────────────
    // US territory capitals + national capital
];
if (typeof window !== 'undefined') window.stateCapitalsData = stateCapitalsData;
