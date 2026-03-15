// Pokémon — images in images/pokemon/
const pokemonData = [
    // Tier 1 — Obvious (1–15)
    { n: "PIKACHU", u: "../images/pokemon/pikachu.webp" },
    { n: "POKÉ BALL", u: "../images/pokemon/poke-ball.webp" },
    { n: "ASH KETCHUM", u: "../images/pokemon/ash-ketchum.webp" },
    { n: "CHARIZARD", u: "../images/pokemon/charizard.webp" },
    { n: "GYM BADGE", u: "../images/pokemon/gym-badge.webp" },
    { n: "EEVEE", u: "../images/pokemon/eevee.webp" },
    { n: "POKÉDEX", u: "../images/pokemon/pokedex.webp" },
    { n: "MEWTWO", u: "../images/pokemon/mewtwo.webp" },
    { n: "POTION", u: "../images/pokemon/potion.webp" },
    { n: "SQUIRTLE", u: "../images/pokemon/squirtle.webp" },
    { n: "PROFESSOR OAK", u: "../images/pokemon/professor-oak.webp" },
    { n: "BULBASAUR", u: "../images/pokemon/bulbasaur.webp" },
    { n: "TEAM ROCKET", u: "../images/pokemon/team-rocket.webp" },
    { n: "JIGGLYPUFF", u: "../images/pokemon/jigglypuff.webp" },
    { n: "POKÉMON CENTER", u: "../images/pokemon/pokemon-center.webp" },

    // Tier 2 — Familiar (16–30)
    { n: "GREAT BALL", u: "../images/pokemon/great-ball.webp" },
    { n: "SNORLAX", u: "../images/pokemon/snorlax.webp" },
    { n: "MISTY", u: "../images/pokemon/misty.webp" },
    { n: "RARE CANDY", u: "../images/pokemon/rare-candy.webp" },
    { n: "GENGAR", u: "../images/pokemon/gengar.webp" },
    { n: "BICYCLE", u: "../images/pokemon/bicycle.webp" },
    { n: "MEOWTH", u: "../images/pokemon/meowth.webp" },
    { n: "NURSE JOY", u: "../images/pokemon/nurse-joy.webp" },
    { n: "LUCARIO", u: "../images/pokemon/lucario.webp" },
    { n: "EVOLUTION STONE", u: "../images/pokemon/evolution-stone.webp" },
    { n: "BROCK", u: "../images/pokemon/brock.webp" },
    { n: "LUGIA", u: "../images/pokemon/lugia.webp" },
    { n: "EXP. SHARE", u: "../images/pokemon/exp-share.webp" },
    { n: "GRENINJA", u: "../images/pokemon/greninja.webp" },
    { n: "OFFICER JENNY", u: "../images/pokemon/officer-jenny.webp" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "ULTRA BALL", u: "../images/pokemon/ultra-ball.webp" },
    { n: "HO-OH", u: "../images/pokemon/ho-oh.webp" },
    { n: "GYM LEADER", u: "../images/pokemon/gym-leader.webp" },
    { n: "FULL RESTORE", u: "../images/pokemon/full-restore.webp" },
    { n: "RAYQUAZA", u: "../images/pokemon/rayquaza.webp" },
    { n: "ELITE FOUR", u: "../images/pokemon/elite-four.webp" },
    { n: "TM (TECHNICAL MACHINE)", u: "../images/pokemon/tm-technical-machine.webp" },
    { n: "TOGEPI", u: "../images/pokemon/togepi.webp" },
    { n: "KANTO REGION", u: "../images/pokemon/kanto-region.webp" },
    { n: "MAX REPEL", u: "../images/pokemon/max-repel.webp" },

    // Tier 4 — Expert (41–50)
    { n: "MASTER BALL", u: "../images/pokemon/master-ball.webp" },
    { n: "CHAMPION", u: "../images/pokemon/champion.webp" },
    { n: "HM01 (CUT)", u: "../images/pokemon/hm01-cut.webp" },
    { n: "LAPRAS", u: "../images/pokemon/lapras.webp" },
    { n: "BERRY", u: "../images/pokemon/berry.webp" },
    { n: "SAFARI BALL", u: "../images/pokemon/safari-ball.webp" },
    { n: "LEFTOVERS", u: "../images/pokemon/leftovers.webp" },
    { n: "MEW", u: "../images/pokemon/mew.webp" },
    { n: "Z-RING", u: "../images/pokemon/z-ring.webp" },
    { n: "POFFIN", u: "../images/pokemon/poffin.webp" },

    // ── BACKUPS (51–60) ────────────────
    { n: "PREMIER BALL", u: "../images/pokemon/premier-ball.webp" },
    { n: "DESTINY KNOT", u: "../images/pokemon/destiny-knot.webp" },
    { n: "OLD ROD", u: "../images/pokemon/old-rod.webp" },
    { n: "POKÉBLOCK", u: "../images/pokemon/pokeblock.webp" },
    { n: "EVERSTONE", u: "../images/pokemon/everstone.webp" },
    { n: "SILPH SCOPE", u: "../images/pokemon/silph-scope.webp" },
    { n: "CHOICE BAND", u: "../images/pokemon/choice-band.webp" },
    { n: "DYNAMAX BAND", u: "../images/pokemon/dynamax-band.webp" },
    { n: "GOOD ROD", u: "../images/pokemon/good-rod.webp" },
    { n: "SITRUS BERRY", u: "../images/pokemon/sitrus-berry.webp" }
];
// Note: "pokemon" is already registered in index.js, but I'm updating the data content below to `pokemonEverythingData` just in case, but using the global `pokemonData`.
if (typeof window !== 'undefined') window.pokemonEverythingData = pokemonData;
