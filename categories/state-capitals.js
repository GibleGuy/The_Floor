// State Capitals — images in images/state-capitals/
// All 50 US state capitals, ordered by recognizability
const stateCapitalsData = [
    // Tier 1 — Obvious (1–15)
    { n: "AUSTIN", u: "../images/state-capitals/austin.webp", h: "TEXAS" },
    { n: "ATLANTA", u: "../images/state-capitals/atlanta.webp", h: "GEORGIA" },
    { n: "DENVER", u: "../images/state-capitals/denver.webp", h: "COLORADO" },
    { n: "HONOLULU", u: "../images/state-capitals/honolulu.webp", h: "HAWAII" },
    { n: "NASHVILLE", u: "../images/state-capitals/nashville.webp", h: "TENNESSEE" },
    { n: "BOSTON", u: "../images/state-capitals/boston.webp", h: "MASSACHUSETTS" },
    { n: "COLUMBUS", u: "../images/state-capitals/columbus.webp", h: "OHIO" },
    { n: "SACRAMENTO", u: "../images/state-capitals/sacramento.webp", h: "CALIFORNIA" },
    { n: "PHOENIX", u: "../images/state-capitals/phoenix.webp", h: "ARIZONA" },
    { n: "SALT LAKE CITY", u: "../images/state-capitals/salt-lake-city.webp", h: "UTAH" },
    { n: "INDIANAPOLIS", u: "../images/state-capitals/indianapolis.webp", h: "INDIANA" },
    { n: "RICHMOND", u: "../images/state-capitals/richmond.webp", h: "VIRGINIA" },
    { n: "BATON ROUGE", u: "../images/state-capitals/baton-rouge.webp", h: "LOUISIANA" },
    { n: "RALEIGH", u: "../images/state-capitals/raleigh.webp", h: "NORTH CAROLINA" },
    { n: "TALLAHASSEE", u: "../images/state-capitals/tallahassee.webp", h: "FLORIDA" },

    // Tier 2 — Familiar (16–30)
    { n: "JUNEAU", u: "../images/state-capitals/juneau.webp", h: "ALASKA" },
    { n: "ANNAPOLIS", u: "../images/state-capitals/annapolis.webp", h: "MARYLAND" },
    { n: "SANTA FE", u: "../images/state-capitals/santa-fe.webp", h: "NEW MEXICO" },
    { n: "MADISON", u: "../images/state-capitals/madison.webp", h: "WISCONSIN" },
    { n: "OLYMPIA", u: "../images/state-capitals/olympia.webp", h: "WASHINGTON" },
    { n: "HARRISBURG", u: "../images/state-capitals/harrisburg.webp", h: "PENNSYLVANIA" },
    { n: "SPRINGFIELD", u: "../images/state-capitals/springfield.webp", h: "ILLINOIS" },
    { n: "ALBANY", u: "../images/state-capitals/albany.webp", h: "NEW YORK" },
    { n: "TRENTON", u: "../images/state-capitals/trenton.webp", h: "NEW JERSEY" },
    { n: "LITTLE ROCK", u: "../images/state-capitals/little-rock.webp", h: "ARKANSAS" },
    { n: "DES MOINES", u: "../images/state-capitals/des-moines.webp", h: "IOWA" },
    { n: "JACKSON", u: "../images/state-capitals/jackson.webp", h: "MISSISSIPPI" },
    { n: "OKLAHOMA CITY", u: "../images/state-capitals/oklahoma-city.webp", h: "OKLAHOMA" },
    { n: "CHARLESTON", u: "../images/state-capitals/charleston.webp", h: "WEST VIRGINIA" },
    { n: "COLUMBIA", u: "../images/state-capitals/columbia.webp", h: "SOUTH CAROLINA" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "BOISE", u: "../images/state-capitals/boise.webp", h: "IDAHO" },
    { n: "HELENA", u: "../images/state-capitals/helena.webp", h: "MONTANA" },
    { n: "TOPEKA", u: "../images/state-capitals/topeka.webp", h: "KANSAS" },
    { n: "LANSING", u: "../images/state-capitals/lansing.webp", h: "MICHIGAN" },
    { n: "CONCORD", u: "../images/state-capitals/concord.webp", h: "NEW HAMPSHIRE" },
    { n: "PROVIDENCE", u: "../images/state-capitals/providence.webp", h: "RHODE ISLAND" },
    { n: "HARTFORD", u: "../images/state-capitals/hartford.webp", h: "CONNECTICUT" },
    { n: "DOVER", u: "../images/state-capitals/dover.webp", h: "DELAWARE" },
    { n: "CARSON CITY", u: "../images/state-capitals/carson-city.webp", h: "NEVADA" },
    { n: "SALEM", u: "../images/state-capitals/salem.webp", h: "OREGON" },

    // Tier 4 — Expert (41–50)
    { n: "LINCOLN", u: "../images/state-capitals/lincoln.webp", h: "NEBRASKA" },
    { n: "SAINT PAUL", u: "../images/state-capitals/saint-paul.webp", h: "MINNESOTA" },
    { n: "JEFFERSON CITY", u: "../images/state-capitals/jefferson-city.webp", h: "MISSOURI" },
    { n: "MONTGOMERY", u: "../images/state-capitals/montgomery.webp", h: "ALABAMA" },
    { n: "FRANKFORT", u: "../images/state-capitals/frankfort.webp", h: "KENTUCKY" },
    { n: "AUGUSTA", u: "../images/state-capitals/augusta.webp", h: "MAINE" },
    { n: "BISMARCK", u: "../images/state-capitals/bismarck.webp", h: "NORTH DAKOTA" },
    { n: "PIERRE", u: "../images/state-capitals/pierre.webp", h: "SOUTH DAKOTA" },
    { n: "MONTPELIER", u: "../images/state-capitals/montpelier.webp", h: "VERMONT" },
    { n: "CHEYENNE", u: "../images/state-capitals/cheyenne.webp", h: "WYOMING" },

    // ── BACKUPS (51–60) ────────────────
    // US territory capitals + national capital
    { n: "WASHINGTON, D.C.", u: "../images/state-capitals/washington-dc.webp", h: "UNITED STATES" },
    { n: "SAN JUAN", u: "../images/state-capitals/san-juan.webp", h: "PUERTO RICO" },
    { n: "HAGÅTÑA", u: "../images/state-capitals/hagatna.webp", h: "GUAM" },
    { n: "CHARLOTTE AMALIE", u: "../images/state-capitals/charlotte-amalie.webp", h: "U.S. VIRGIN ISLANDS" },
    { n: "SAIPAN", u: "../images/state-capitals/saipan.webp", h: "NORTHERN MARIANA ISLANDS" },
    { n: "PAGO PAGO", u: "../images/state-capitals/pago-pago.webp", h: "AMERICAN SAMOA" }
];
if (typeof window !== 'undefined') window.stateCapitalsData = stateCapitalsData;
