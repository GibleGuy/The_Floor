// Capital Cities — images in images/capital-cities/
const capitalCitiesData = [
    // Tier 1 — Obvious (1–15)
    { n: "WASHINGTON D.C.", u: "../images/capital-cities/washington-d-c.webp" },
    { n: "LONDON", u: "../images/capital-cities/london.webp" },
    { n: "PARIS", u: "../images/capital-cities/paris.webp" },
    { n: "ROME", u: "../images/capital-cities/rome.webp" },
    { n: "TOKYO", u: "../images/capital-cities/tokyo.webp" },
    { n: "BEIJING", u: "../images/capital-cities/beijing.webp" },
    { n: "MOSCOW", u: "../images/capital-cities/moscow.webp" },
    { n: "BERLIN", u: "../images/capital-cities/berlin.webp" },
    { n: "MADRID", u: "../images/capital-cities/madrid.webp" },
    { n: "OTTAWA", u: "../images/capital-cities/ottawa.webp" },
    { n: "MEXICO CITY", u: "../images/capital-cities/mexico-city.webp" },
    { n: "NEW DELHI", u: "../images/capital-cities/new-delhi.webp" },
    { n: "SEOUL", u: "../images/capital-cities/seoul.webp" },
    { n: "CAIRO", u: "../images/capital-cities/cairo.webp" },
    { n: "ATHENS", u: "../images/capital-cities/athens.webp" },

    // Tier 2 — Familiar (16–30)
    { n: "BANGKOK", u: "../images/capital-cities/bangkok.webp" },
    { n: "BUENOS AIRES", u: "../images/capital-cities/buenos-aires.webp" },
    { n: "BOGOTA", u: "../images/capital-cities/bogota.webp" },
    { n: "AMSTERDAM", u: "../images/capital-cities/amsterdam.webp" },
    { n: "VIENNA", u: "../images/capital-cities/vienna.webp" },
    { n: "STOCKHOLM", u: "../images/capital-cities/stockholm.webp" },
    { n: "OSLO", u: "../images/capital-cities/oslo.webp" },
    { n: "HAVANA", u: "../images/capital-cities/havana.webp" },
    { n: "DUBLIN", u: "../images/capital-cities/dublin.webp" },
    { n: "PRAGUE", u: "../images/capital-cities/prague.webp" },
    { n: "LISBON", u: "../images/capital-cities/lisbon.webp" },
    { n: "LIMA", u: "../images/capital-cities/lima.webp" },
    { n: "SANTIAGO", u: "../images/capital-cities/santiago.webp" },
    { n: "JAKARTA", u: "../images/capital-cities/jakarta.webp" },
    { n: "MANILA", u: "../images/capital-cities/manila.webp" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "WARSAW", u: "../images/capital-cities/warsaw.webp" },
    { n: "BUDAPEST", u: "../images/capital-cities/budapest.webp" },
    { n: "ANKARA", u: "../images/capital-cities/ankara.webp" },
    { n: "RIYADH", u: "../images/capital-cities/riyadh.webp" },
    { n: "TEHRAN", u: "../images/capital-cities/tehran.webp" },
    { n: "JERUSALEM", u: "../images/capital-cities/jerusalem.webp" },
    { n: "HANOI", u: "../images/capital-cities/hanoi.webp" },
    { n: "KUALA LUMPUR", u: "../images/capital-cities/kuala-lumpur.webp" },
    { n: "NAIROBI", u: "../images/capital-cities/nairobi.webp" },
    { n: "CAPE TOWN", u: "../images/capital-cities/cape-town.webp" },

    // Tier 4 — Expert (41–50)
    { n: "ADDIS ABABA", u: "../images/capital-cities/addis-ababa.webp" },
    { n: "WELLINGTON", u: "../images/capital-cities/wellington.webp" },
    { n: "HELSINKI", u: "../images/capital-cities/helsinki.webp" },
    { n: "COPENHAGEN", u: "../images/capital-cities/copenhagen.webp" },
    { n: "REYKJAVIK", u: "../images/capital-cities/reykjavik.webp" },
    { n: "CARACAS", u: "../images/capital-cities/caracas.webp" },
    { n: "QUITO", u: "../images/capital-cities/quito.webp" },
    { n: "MONTEVIDEO", u: "../images/capital-cities/montevideo.webp" },
    { n: "BEIRUT", u: "../images/capital-cities/beirut.webp" },
    { n: "BAGHDAD", u: "../images/capital-cities/baghdad.webp" },

    // ── BACKUPS (51–60) ────────────────
    { n: "KIEV", u: "../images/capital-cities/kiev.webp" },
    { n: "DAKAR", u: "../images/capital-cities/dakar.webp" },
    { n: "ACCRA", u: "../images/capital-cities/accra.webp" },
    { n: "KATHMANDU", u: "../images/capital-cities/kathmandu.webp" },
    { n: "DHAKA", u: "../images/capital-cities/dhaka.webp" },
    { n: "SUVA", u: "../images/capital-cities/suva.webp" },
    { n: "ALGIERS", u: "../images/capital-cities/algiers.webp" },
    { n: "RABAT", u: "../images/capital-cities/rabat.webp" },
    { n: "BERN", u: "../images/capital-cities/bern.webp" },
    { n: "BRUSSELS", u: "../images/capital-cities/brussels.webp" }
];
if (typeof window !== 'undefined') window.capitalCitiesData = capitalCitiesData;
