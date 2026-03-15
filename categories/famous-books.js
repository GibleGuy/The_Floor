// Famous Books — images in images/famous-books/
const famousBooksData = [
    // Tier 1 — Obvious (1–15)
    { n: "HARRY POTTER", u: "../images/famous-books/harry-potter.webp" },
    { n: "THE LORD OF THE RINGS", u: "../images/famous-books/the-lord-of-the-rings.webp" },
    { n: "THE CAT IN THE HAT", u: "../images/famous-books/the-cat-in-the-hat.webp" },
    { n: "ROMEO AND JULIET", u: "../images/famous-books/romeo-and-juliet.webp" },
    { n: "TO KILL A MOCKINGBIRD", u: "../images/famous-books/to-kill-a-mockingbird.webp" },
    { n: "THE GREAT GATSBY", u: "../images/famous-books/the-great-gatsby.webp" },
    { n: "1984", u: "../images/famous-books/1984.webp" },
    { n: "ALICE IN WONDERLAND", u: "../images/famous-books/alice-in-wonderland.webp" },
    { n: "THE DIARY OF A YOUNG GIRL", u: "../images/famous-books/the-diary-of-a-young-girl.webp" },
    { n: "THE HOBBIT", u: "../images/famous-books/the-hobbit.webp" },
    { n: "THE HUNGER GAMES", u: "../images/famous-books/the-hunger-games.webp" },
    { n: "TWILIGHT", u: "../images/famous-books/twilight.webp" },
    { n: "CHARLOTTE'S WEB", u: "../images/famous-books/charlottes-web.webp" },
    { n: "THE VERY HUNGRY CATERPILLAR", u: "../images/famous-books/the-very-hungry-caterpillar.webp" },
    { n: "FRANKENSTEIN", u: "../images/famous-books/frankenstein.webp" },

    // Tier 2 — Familiar (16–30)
    { n: "PRIDE AND PREJUDICE", u: "../images/famous-books/pride-and-prejudice.webp" },
    { n: "THE CATCHER IN THE RYE", u: "../images/famous-books/the-catcher-in-the-rye.webp" },
    { n: "WHERE THE WILD THINGS ARE", u: "../images/famous-books/where-the-wild-things-are.webp" },
    { n: "ANIMAL FARM", u: "../images/famous-books/animal-farm.webp" },
    { n: "FAHRENHEIT 451", u: "../images/famous-books/fahrenheit-451.webp" },
    { n: "LITTLE WOMEN", u: "../images/famous-books/little-women.webp" },
    { n: "THE CHRONICLES OF NARNIA", u: "../images/famous-books/the-chronicles-of-narnia.webp" },
    { n: "DRACULA", u: "../images/famous-books/dracula.webp" },
    { n: "THE ODYSSEY", u: "../images/famous-books/the-odyssey.webp" },
    { n: "MOBY-DICK", u: "../images/famous-books/moby-dick.webp" },
    { n: "GOODNIGHT MOON", u: "../images/famous-books/goodnight-moon.webp" },
    { n: "THE GIVING TREE", u: "../images/famous-books/the-giving-tree.webp" },
    { n: "DUNE", u: "../images/famous-books/dune.webp" },
    { n: "THE TALE OF PETER RABBIT", u: "../images/famous-books/the-tale-of-peter-rabbit.webp" },
    { n: "DON QUIXOTE", u: "../images/famous-books/don-quixote.webp" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "THE FAULT IN OUR STARS", u: "../images/famous-books/the-fault-in-our-stars.webp" },
    { n: "PERCY JACKSON", u: "../images/famous-books/percy-jackson.webp" },
    { n: "A GAME OF THRONES", u: "../images/famous-books/a-game-of-thrones.webp" },
    { n: "THE DA VINCI CODE", u: "../images/famous-books/the-da-vinci-code.webp" },
    { n: "JANE EYRE", u: "../images/famous-books/jane-eyre.webp" },
    { n: "OF MICE AND MEN", u: "../images/famous-books/of-mice-and-men.webp" },
    { n: "THE GRAPES OF WRATH", u: "../images/famous-books/the-grapes-of-wrath.webp" },
    { n: "LORD OF THE FLIES", u: "../images/famous-books/lord-of-the-flies.webp" },
    { n: "A TALE OF TWO CITIES", u: "../images/famous-books/a-tale-of-two-cities.webp" },
    { n: "BRAVE NEW WORLD", u: "../images/famous-books/brave-new-world.webp" },

    // Tier 4 — Expert (41–50)
    { n: "THE PICTURE OF DORIAN GRAY", u: "../images/famous-books/the-picture-of-dorian-gray.webp" },
    { n: "LES MISÉRABLES", u: "../images/famous-books/les-miserables.webp" },
    { n: "WUTHERING HEIGHTS", u: "../images/famous-books/wuthering-heights.webp" },
    { n: "CRIME AND PUNISHMENT", u: "../images/famous-books/crime-and-punishment.webp" },
    { n: "ANNE OF GREEN GABLES", u: "../images/famous-books/anne-of-green-gables.webp" },
    { n: "THE ALCHEMIST", u: "../images/famous-books/the-alchemist.webp" },
    { n: "CATCH-22", u: "../images/famous-books/catch-22.webp" },
    { n: "ONE HUNDRED YEARS OF SOLITUDE", u: "../images/famous-books/one-hundred-years-of-solitude.webp" },
    { n: "THE COLOR PURPLE", u: "../images/famous-books/the-color-purple.webp" },
    { n: "THE HITCHHIKER'S GUIDE", u: "../images/famous-books/the-hitchhikers-guide.webp" },

    // ── BACKUPS (51–60) ────────────────
    { n: "THE HANDMAID'S TALE", u: "../images/famous-books/the-handmaids-tale.webp" },
    { n: "GREAT EXPECTATIONS", u: "../images/famous-books/great-expectations.webp" },
    { n: "THE KITE RUNNER", u: "../images/famous-books/the-kite-runner.webp" },
    { n: "WAR AND PEACE", u: "../images/famous-books/war-and-peace.webp" },
    { n: "SLAUGHTERHOUSE-FIVE", u: "../images/famous-books/slaughterhouse-five.webp" },
    { n: "THE SECRET GARDEN", u: "../images/famous-books/the-secret-garden.webp" },
    { n: "LIFE OF PI", u: "../images/famous-books/life-of-pi.webp" },
    { n: "IT", u: "../images/famous-books/it.webp" },
    { n: "THE SHINING", u: "../images/famous-books/the-shining.webp" },
    { n: "A WRINKLE IN TIME", u: "../images/famous-books/a-wrinkle-in-time.webp" }
];
if (typeof window !== 'undefined') window.famousBooksData = famousBooksData;
