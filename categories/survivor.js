const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function item(n, q) {
    return { n: String(n), q: q, u: TRANSPARENT_PIXEL };
}

const survivorData = [
    // Most Iconic - Winners and Legendary Players
    item("TONY VLACHOS", "Cagayan Winner"),
    item("PARVATI SHALLOW", "Micronesia Winner"),
    item("BOSTON ROB MARIANO", "Redemption Island Winner"),
    item("SANDRA DIAZ-TWINE", "Pearl Islands Winner"),
    item("KIM SPRADLIN", "One World Winner"),
    item("RICHARD HATCH", "Borneo Winner"),
    item("RUSSELL HANTZ", "Samoa Runner-Up"),
    item("CIRIE FIELDS", "Panama 4th Place"),
    item("OZZY LUSTH", "Cook Islands Runner-Up"),
    item("STEPHANIE LAGROSSA", "Palau 7th Place"),

    // Very Well Known - Recent Winners and Fan Favorites
    item("JEREMY COLLINS", "Cambodia Winner"),
    item("NATALIE ANDERSON", "San Juan del Sur Winner"),
    item("SARAH LACINA", "Game Changers Winner"),
    item("TOMMY SHEEHAN", "Island of the Idols Winner"),
    item("MICHELE FITZGERALD", "Kaoh Rong Winner"),
    item("MIKE HOLLOWAY", "Worlds Apart Winner"),
    item("COCHRAN", "Caramoan Winner"),
    item("DENISE STAPLEY", "Philippines Winner"),
    item("SOPHIE CLARKE", "South Pacific Winner"),
    item("YUL KWON", "Cook Islands Winner"),

    // Well Known - Earlier Winners
    item("EARL COLE", "Fiji Winner"),
    item("TODD HERZOG", "China Winner"),
    item("JT THOMAS", "Tocantins Winner"),
    item("BOB CROWLEY", "Gabon Winner"),
    item("ETHAN ZOHN", "Africa Winner"),
    item("TOM WESTMAN", "Palau Winner"),
    item("CHRIS DAUGHERTY", "Vanuatu Winner"),
    item("AMBER BRKICH", "All-Stars Winner"),
    item("JENNA MORASCA", "Amazon Winner"),
    item("BRIAN HEIDIK", "Thailand Winner"),

    // Iconic Non-Winners
    item("AMANDA KIMMEL", "China Runner-Up"),
    item("SPENCER BLEDSOE", "Cambodia Runner-Up"),
    item("TAI TRANG", "Kaoh Rong Runner-Up"),
    item("AUBRY BRACCO", "Kaoh Rong Runner-Up"),
    item("DOMENICK ABBATE", "Ghost Island Runner-Up"),
    item("CHASE RICE", "Nicaragua Runner-Up"),
    item("MATTY WHITMORE", "Gabon Runner-Up"),
    item("COLBY DONALDSON", "Australian Outback Runner-Up"),
    item("LISA WHELCHEL", "Philippines Runner-Up"),
    item("SUSAN HAWK", "Borneo 4th Place"),

    // Memorable Players - Various Placements
    item("CHRISTIAN HUBICKI", "David vs Goliath 7th Place"),
    item("DEVON PINTO", "Heroes vs Healers vs Hustlers 3rd Place"),
    item("CHRISSY HOFBECK", "Heroes vs Healers vs Hustlers Runner-Up"),
    item("MALCOLM FREBERG", "Philippines 4th Place"),
    item("ANDREA BOEHLKE", "Caramoan 7th Place"),
    item("KELLEY WENTWORTH", "Cambodia 4th Place"),
    item("DAVID WRIGHT", "Millennials vs Gen X 4th Place"),
    item("JOE ANGLIM", "Worlds Apart 10th Place"),
    item("KASS MCQUILLEN", "Cagayan 3rd Place"),
    item("WENTWORTH", "San Juan del Sur 14th Place"),

    // Deep Cuts - Memorable Players
    item("REEM DALY", "Edge of Extinction 3rd Place"),
    item("RICK DEVENS", "Edge of Extinction 4th Place"),
    item("LAUREN O'BYRNE", "Edge of Extinction 5th Place"),
    item("VICTORIA BAAMONDE", "Edge of Extinction 7th Place"),
    item("NOURA SALMAN", "Island of the Idols Runner-Up")
];

if (typeof window !== 'undefined') window.survivorData = survivorData;
