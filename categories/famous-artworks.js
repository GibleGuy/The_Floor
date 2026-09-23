// Famous Artworks — images in images/famous-artworks/
const famousArtworksData = [
    // Tier 1 — Obvious (items 1–15)
    { n: "MONA LISA", u: "../images/famous-artworks/mona-lisa.jpg" },
    { n: "STARRY NIGHT", u: "../images/famous-artworks/starry-night.jpg" },
    { n: "THE SCREAM", u: "../images/famous-artworks/the-scream.jpg" },
    { n: "THE LAST SUPPER", u: "../images/famous-artworks/the-last-supper.jpg" },
    { n: "GIRL WITH A PEARL EARRING", u: "../images/famous-artworks/girl-with-a-pearl-earring.jpg" },
    { n: "THE PERSISTENCE OF MEMORY", u: "../images/famous-artworks/the-persistence-of-memory.jpg" },
    { n: "THE BIRTH OF VENUS", u: "../images/famous-artworks/the-birth-of-venus.jpg" },
    { n: "AMERICAN GOTHIC", u: "../images/famous-artworks/american-gothic.jpg" },
    { n: "THE GREAT WAVE", u: "../images/famous-artworks/the-great-wave.jpg" },
    { n: "DAVID", u: "../images/famous-artworks/david.jpg" },
    { n: "THE CREATION OF ADAM", u: "../images/famous-artworks/the-creation-of-adam.jpg" },
    { n: "THE THINKER", u: "../images/famous-artworks/the-thinker.jpg" },
    { n: "VENUS DE MILO", u: "../images/famous-artworks/venus-de-milo.jpg" },
    { n: "WATER LILIES", u: "../images/famous-artworks/water-lilies.jpg" },
    { n: "GUERNICA", u: "../images/famous-artworks/guernica.jpg" },

    // Tier 2 — Familiar (items 16–30)
    { n: "NIGHTHAWKS", u: "../images/famous-artworks/nighthawks.jpg" },
    { n: "THE KISS KLIMT", u: "../images/famous-artworks/the-kiss-klimt.jpg" },
    { n: "SUNFLOWERS", u: "../images/famous-artworks/sunflowers.jpg" },
    { n: "CAMPBELL'S SOUP CANS", u: "../images/famous-artworks/campbells-soup-cans.jpg" },
    { n: "WHISTLER'S MOTHER", u: "../images/famous-artworks/whistlers-mother.jpg" },
    { n: "THE NIGHT WATCH", u: "../images/famous-artworks/the-night-watch.jpg" },
    { n: "LIBERTY LEADING THE PEOPLE", u: "../images/famous-artworks/liberty-leading-the-people.jpg" },
    { n: "WANDERER ABOVE THE SEA OF FOG", u: "../images/famous-artworks/wanderer-above-the-sea-of-fog.jpg" },
    { n: "A SUNDAY ON LA GRANDE JATTE", u: "../images/famous-artworks/a-sunday-on-la-grande-jatte.jpg" },
    { n: "THE SON OF MAN", u: "../images/famous-artworks/the-son-of-man.jpg" },
    { n: "MARILYN DIPTYCH", u: "../images/famous-artworks/marilyn-diptych.jpg" },
    { n: "THE ARNOLFINI PORTRAIT", u: "../images/famous-artworks/the-arnolfini-portrait.jpg" },
    { n: "LAS MENINAS", u: "../images/famous-artworks/las-meninas.jpg" },
    { n: "THE SCHOOL OF ATHENS", u: "../images/famous-artworks/the-school-of-athens.jpg" },
    { n: "THE GARDEN OF EARTHLY DELIGHTS", u: "../images/famous-artworks/the-garden-of-earthly-delights.jpg" },

    // Tier 3 — Knowledgeable (items 31–40)
    { n: "COMPOSITION WITH RED BLUE AND YELLOW", u: "../images/famous-artworks/composition-with-red-blue-and-yellow.jpg" },
    { n: "LES DEMOISELLES D'AVIGNON", u: "../images/famous-artworks/les-demoiselles-davignon.jpg" },
    { n: "THE TWO FRIDAS", u: "../images/famous-artworks/the-two-fridas.jpg" },
    { n: "CHRISTINA'S WORLD", u: "../images/famous-artworks/christinas-world.jpg" },
    { n: "IMPRESSION SUNRISE", u: "../images/famous-artworks/impression-sunrise.jpg" },
    { n: "THE FIGHTING TEMERAIRE", u: "../images/famous-artworks/the-fighting-temeraire.jpg" },
    { n: "THE HAY WAIN", u: "../images/famous-artworks/the-hay-wain.jpg" },
    { n: "OLYMPIA", u: "../images/famous-artworks/olympia.jpg" },
    { n: "THE DEATH OF MARAT", u: "../images/famous-artworks/the-death-of-marat.jpg" },
    { n: "PIETA", u: "../images/famous-artworks/pieta.jpg" },

    // Tier 4 — Expert (items 41–50)
    { n: "NO. 5 1948", u: "../images/famous-artworks/no-5-1948.jpg" },
    { n: "SELF-PORTRAIT WITH THORN NECKLACE", u: "../images/famous-artworks/self-portrait-with-thorn-necklace.jpg" },
    { n: "ARRANGEMENT IN GREY AND BLACK", u: "../images/famous-artworks/arrangement-in-grey-and-black.jpg" },
    { n: "RAIN STEAM AND SPEED", u: "../images/famous-artworks/rain-steam-and-speed.jpg" },
    { n: "THE GHENT ALTARPIECE", u: "../images/famous-artworks/the-ghent-altarpiece.jpg" },
    { n: "THE BURIAL OF THE COUNT OF ORGAZ", u: "../images/famous-artworks/the-burial-of-the-count-of-orgaz.jpg" },
    { n: "THE RAFT OF THE MEDUSA", u: "../images/famous-artworks/the-raft-of-the-medusa.jpg" },
    { n: "THIRD OF MAY 1808", u: "../images/famous-artworks/third-of-may-1808.jpg" },
    { n: "THE MILKMAID", u: "../images/famous-artworks/the-milkmaid.jpg" },
    { n: "THE SWING", u: "../images/famous-artworks/the-swing.jpg" },

    // ── BACKUPS (items 51–60) ────────────────
    { n: "PRIMAVERA", u: "../images/famous-artworks/primavera.jpg" },
    { n: "THE KISS RODIN", u: "../images/famous-artworks/the-kiss-rodin.jpg" },
    { n: "BALLOON DOG", u: "../images/famous-artworks/balloon-dog.jpg" },
    { n: "THE PHYSICAL IMPOSSIBILITY OF DEATH", u: "../images/famous-artworks/the-physical-impossibility-of-death.jpg" },
    { n: "UNTITLED FILM STILL", u: "../images/famous-artworks/untitled-film-still.jpg" },
    { n: "ONE: NUMBER 31", u: "../images/famous-artworks/one-number-31.jpg" },
    { n: "WHEATFIELD WITH CROWS", u: "../images/famous-artworks/wheatfield-with-crows.jpg" },
    { n: "THE POTATO EATERS", u: "../images/famous-artworks/the-potato-eaters.jpg" },
    { n: "JAPANESE BRIDGE", u: "../images/famous-artworks/japanese-bridge.jpg" },
    { n: "DANCE AT LE MOULIN DE LA GALETTE", u: "../images/famous-artworks/dance-at-le-moulin-de-la-galette.jpg" },

];
if (typeof window !== 'undefined') window.famousArtworksData = famousArtworksData;
