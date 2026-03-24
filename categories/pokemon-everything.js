// Pokémon — images in images/pokemon/
const pokemonEverythingData = [
    // Tier 1 — Obvious (1–15)
    { n: "PIKACHU", u: "../images/pokemon-everything/pikachu.webp" },
    { n: "POKÉ BALL", u: "../images/pokemon-everything/poke-ball.webp" },
    { n: "ASH KETCHUM", u: "../images/pokemon-everything/ash-ketchum.webp" },
    { n: "CHARIZARD", u: "../images/pokemon-everything/charizard.webp" },
    { n: "GYM BADGE", u: "../images/pokemon-everything/gym-badge.webp" },
    { n: "EEVEE", u: "../images/pokemon-everything/eevee.webp" },
    { n: "POKÉDEX", u: "../images/pokemon-everything/pokedex.webp" },
    { n: "MEWTWO", u: "../images/pokemon-everything/mewtwo.webp" },
    { n: "POTION", u: "../images/pokemon-everything/potion.webp" },
    { n: "SQUIRTLE", u: "../images/pokemon-everything/squirtle.webp" },
    { n: "PROFESSOR OAK", u: "../images/pokemon-everything/professor-oak.webp" },
    { n: "BULBASAUR", u: "../images/pokemon-everything/bulbasaur.webp" },
    { n: "TEAM ROCKET", u: "../images/pokemon-everything/team-rocket.webp" },
    { n: "JIGGLYPUFF", u: "../images/pokemon-everything/jigglypuff.webp" },
    { n: "POKÉMON CENTER", u: "../images/pokemon-everything/pokemon-center.webp" },

    // Tier 2 — Familiar (16–30)
    { n: "GREAT BALL", u: "../images/pokemon-everything/great-ball.webp" },
    { n: "SNORLAX", u: "../images/pokemon-everything/snorlax.webp" },
    { n: "MISTY", u: "../images/pokemon-everything/misty.webp" },
    { n: "RARE CANDY", u: "../images/pokemon-everything/rare-candy.webp" },
    { n: "GENGAR", u: "../images/pokemon-everything/gengar.webp" },
    { n: "BICYCLE", u: "../images/pokemon-everything/bicycle.webp" },
    { n: "MEOWTH", u: "../images/pokemon-everything/meowth.webp" },
    { n: "NURSE JOY", u: "../images/pokemon-everything/nurse-joy.webp" },
    { n: "LUCARIO", u: "../images/pokemon-everything/lucario.webp" },
    { n: "BROCK", u: "../images/pokemon-everything/brock.webp" },
    { n: "LUGIA", u: "../images/pokemon-everything/lugia.webp" },
    { n: "EXP. SHARE", u: "../images/pokemon-everything/exp-share.webp" },
    { n: "GRENINJA", u: "../images/pokemon-everything/greninja.webp" },
    { n: "OFFICER JENNY", u: "../images/pokemon-everything/officer-jenny.webp" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "ULTRA BALL", u: "../images/pokemon-everything/ultra-ball.webp" },
    { n: "HO-OH", u: "../images/pokemon-everything/ho-oh.webp" },
    { n: "GYM LEADER", u: "../images/pokemon-everything/gym-leader.webp" },
    { n: "FULL RESTORE", u: "../images/pokemon-everything/full-restore.webp" },
    { n: "RAYQUAZA", u: "../images/pokemon-everything/rayquaza.webp" },
    { n: "ELITE FOUR", u: "../images/pokemon-everything/elite-four.webp" },
    { n: "TOGEPI", u: "../images/pokemon-everything/togepi.webp" },
    { n: "KANTO REGION", u: "../images/pokemon-everything/kanto-region.webp" },

    // Tier 4 — Expert (41–50)
    { n: "MASTER BALL", u: "../images/pokemon-everything/master-ball.webp" },
    { n: "CHAMPION", u: "../images/pokemon-everything/champion.webp" },
    { n: "LAPRAS", u: "../images/pokemon-everything/lapras.webp" },
    { n: "BERRY", u: "../images/pokemon-everything/berry.webp" },
    { n: "SAFARI BALL", u: "../images/pokemon-everything/safari-ball.webp" },
    { n: "LEFTOVERS", u: "../images/pokemon-everything/leftovers.webp" },
    { n: "MEW", u: "../images/pokemon-everything/mew.webp" },
    { n: "Z-RING", u: "../images/pokemon-everything/z-ring.webp" },

    // ── BACKUPS (51–60) ────────────────
    { n: "PREMIER BALL", u: "../images/pokemon-everything/premier-ball.webp" },
    { n: "DESTINY KNOT", u: "../images/pokemon-everything/destiny-knot.webp" },
    { n: "POKÉBLOCK", u: "../images/pokemon-everything/pokeblock.webp" },
    { n: "EVERSTONE", u: "../images/pokemon-everything/everstone.webp" },
    { n: "SILPH SCOPE", u: "../images/pokemon-everything/silph-scope.webp" },
    { n: "CHOICE BAND", u: "../images/pokemon-everything/choice-band.webp" },
    { n: "DYNAMAX BAND", u: "../images/pokemon-everything/dynamax-band.webp" },
    { n: "SITRUS BERRY", u: "../images/pokemon-everything/sitrus-berry.webp" }
];
// Note: "pokemon" is already registered in index.js, but I'm updating the data content below to `pokemonEverythingData` just in case.
if (typeof window !== 'undefined') window.pokemonEverythingData = pokemonEverythingData;
