// Capital Cities — images in images/capital-cities/
const capitalCitiesData = [
    // Tier 1 — Obvious (1–15)
    { n: "WASHINGTON D.C.", u: "../images/capital-cities/washington-d-c.webp", h: "UNITED STATES" },
    { n: "LONDON", u: "../images/capital-cities/london.webp", h: "UNITED KINGDOM" },
    { n: "PARIS", u: "../images/capital-cities/paris.webp", h: "FRANCE" },
    { n: "ROME", u: "../images/capital-cities/rome.webp", h: "ITALY" },
    { n: "TOKYO", u: "../images/capital-cities/tokyo.webp", h: "JAPAN" },
    { n: "BEIJING", u: "../images/capital-cities/beijing.webp", h: "CHINA" },
    { n: "MOSCOW", u: "../images/capital-cities/moscow.webp", h: "RUSSIA" },
    { n: "BERLIN", u: "../images/capital-cities/berlin.webp", h: "GERMANY" },
    { n: "MADRID", u: "../images/capital-cities/madrid.webp", h: "SPAIN" },
    { n: "OTTAWA", u: "../images/capital-cities/ottawa.webp", h: "CANADA" },
    { n: "MEXICO CITY", u: "../images/capital-cities/mexico-city.webp", h: "MEXICO" },
    { n: "NEW DELHI", u: "../images/capital-cities/new-delhi.webp", h: "INDIA" },
    { n: "SEOUL", u: "../images/capital-cities/seoul.webp", h: "SOUTH KOREA" },
    { n: "CAIRO", u: "../images/capital-cities/cairo.webp", h: "EGYPT" },
    { n: "ATHENS", u: "../images/capital-cities/athens.webp", h: "GREECE" },

    // Tier 2 — Familiar (16–30)
    { n: "BANGKOK", u: "../images/capital-cities/bangkok.webp", h: "THAILAND" },
    { n: "BUENOS AIRES", u: "../images/capital-cities/buenos-aires.webp", h: "ARGENTINA" },
    { n: "BOGOTA", u: "../images/capital-cities/bogota.webp", h: "COLOMBIA" },
    { n: "AMSTERDAM", u: "../images/capital-cities/amsterdam.webp", h: "NETHERLANDS" },
    { n: "VIENNA", u: "../images/capital-cities/vienna.webp", h: "AUSTRIA" },
    { n: "STOCKHOLM", u: "../images/capital-cities/stockholm.webp", h: "SWEDEN" },
    { n: "OSLO", u: "../images/capital-cities/oslo.webp", h: "NORWAY" },
    { n: "HAVANA", u: "../images/capital-cities/havana.webp", h: "CUBA" },
    { n: "DUBLIN", u: "../images/capital-cities/dublin.webp", h: "IRELAND" },
    { n: "PRAGUE", u: "../images/capital-cities/prague.webp", h: "CZECH REPUBLIC" },
    { n: "LISBON", u: "../images/capital-cities/lisbon.webp", h: "PORTUGAL" },
    { n: "LIMA", u: "../images/capital-cities/lima.webp", h: "PERU" },
    { n: "SANTIAGO", u: "../images/capital-cities/santiago.webp", h: "CHILE" },
    { n: "JAKARTA", u: "../images/capital-cities/jakarta.webp", h: "INDONESIA" },
    { n: "MANILA", u: "../images/capital-cities/manila.webp", h: "PHILIPPINES" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "WARSAW", u: "../images/capital-cities/warsaw.webp", h: "POLAND" },
    { n: "BUDAPEST", u: "../images/capital-cities/budapest.webp", h: "HUNGARY" },
    { n: "ANKARA", u: "../images/capital-cities/ankara.webp", h: "TURKEY" },
    { n: "RIYADH", u: "../images/capital-cities/riyadh.webp", h: "SAUDI ARABIA" },
    { n: "TEHRAN", u: "../images/capital-cities/tehran.webp", h: "IRAN" },
    { n: "JERUSALEM", u: "../images/capital-cities/jerusalem.webp", h: "ISRAEL" },
    { n: "HANOI", u: "../images/capital-cities/hanoi.webp", h: "VIETNAM" },
    { n: "KUALA LUMPUR", u: "../images/capital-cities/kuala-lumpur.webp", h: "MALAYSIA" },
    { n: "NAIROBI", u: "../images/capital-cities/nairobi.webp", h: "KENYA" },
    { n: "CAPE TOWN", u: "../images/capital-cities/cape-town.webp", h: "SOUTH AFRICA" },

    // Tier 4 — Expert (41–50)
    { n: "ADDIS ABABA", u: "../images/capital-cities/addis-ababa.webp", h: "ETHIOPIA" },
    { n: "WELLINGTON", u: "../images/capital-cities/wellington.webp", h: "NEW ZEALAND" },
    { n: "HELSINKI", u: "../images/capital-cities/helsinki.webp", h: "FINLAND" },
    { n: "COPENHAGEN", u: "../images/capital-cities/copenhagen.webp", h: "DENMARK" },
    { n: "REYKJAVIK", u: "../images/capital-cities/reykjavik.webp", h: "ICELAND" },
    { n: "CARACAS", u: "../images/capital-cities/caracas.webp", h: "VENEZUELA" },
    { n: "QUITO", u: "../images/capital-cities/quito.webp", h: "ECUADOR" },
    { n: "MONTEVIDEO", u: "../images/capital-cities/montevideo.webp", h: "URUGUAY" },
    { n: "BEIRUT", u: "../images/capital-cities/beirut.webp", h: "LEBANON" },
    { n: "BAGHDAD", u: "../images/capital-cities/baghdad.webp", h: "IRAQ" },

    // ── BACKUPS (51–60) ────────────────
    { n: "KIEV", u: "../images/capital-cities/kiev.webp", h: "UKRAINE" },
    { n: "DAKAR", u: "../images/capital-cities/dakar.webp", h: "SENEGAL" },
    { n: "ACCRA", u: "../images/capital-cities/accra.webp", h: "GHANA" },
    { n: "KATHMANDU", u: "../images/capital-cities/kathmandu.webp", h: "NEPAL" },
    { n: "DHAKA", u: "../images/capital-cities/dhaka.webp", h: "BANGLADESH" },
    { n: "SUVA", u: "../images/capital-cities/suva.webp", h: "FIJI" },
    { n: "ALGIERS", u: "../images/capital-cities/algiers.webp", h: "ALGERIA" },
    { n: "RABAT", u: "../images/capital-cities/rabat.webp", h: "MOROCCO" },
    { n: "BERN", u: "../images/capital-cities/bern.webp", h: "SWITZERLAND" },
    { n: "BRUSSELS", u: "../images/capital-cities/brussels.webp", h: "BELGIUM" }
];
if (typeof window !== 'undefined') window.capitalCitiesData = capitalCitiesData;
