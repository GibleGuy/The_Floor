// Famous Books — images in images/famous-books/
const famousBooksData = [
    // Tier 1 — Obvious (New 15 Easy Books)
    { n: "WINNIE-THE-POOH", u: "../images/famous-books/winnie-the-pooh.webp" },
    { n: "THE WIZARD OF OZ", u: "../images/famous-books/the-wizard-of-oz.webp" },
    { n: "DIARY OF A WIMPY KID", u: "../images/famous-books/diary-of-a-wimpy-kid.webp" },
    { n: "CAPTAIN UNDERPANTS", u: "../images/famous-books/captain-underpants.webp" },
    { n: "MATILDA", u: "../images/famous-books/matilda.webp" },
    { n: "CHARLIE AND THE CHOCOLATE FACTORY", u: "../images/famous-books/charlie-and-the-chocolate-factory.webp" },
    { n: "GREEN EGGS AND HAM", u: "../images/famous-books/green-eggs-and-ham.webp" },
    { n: "THE LORAX", u: "../images/famous-books/the-lorax.webp" },
    { n: "CURIOUS GEORGE", u: "../images/famous-books/curious-george.webp" },
    { n: "CLIFFORD THE BIG RED DOG", u: "../images/famous-books/clifford-the-big-red-dog.webp" },
    { n: "THE LITTLE PRINCE", u: "../images/famous-books/the-little-prince.webp" },
    { n: "WHERE'S WALDO?", u: "../images/famous-books/wheres-waldo.webp" },
    { n: "PETER PAN", u: "../images/famous-books/peter-pan.webp" },
    { n: "THE SNOWY DAY", u: "../images/famous-books/the-snowy-day.webp" },

    // Tier 2 — Familiar (Existing)
    { n: "HARRY POTTER", u: "../images/famous-books/harry-potter.jpg" },
    { n: "THE LORD OF THE RINGS", u: "../images/famous-books/the-lord-of-the-rings.jpg" },
    { n: "THE CAT IN THE HAT", u: "../images/famous-books/the-cat-in-the-hat.webp" },
    { n: "ROMEO AND JULIET", u: "../images/famous-books/romeo-and-juliet.jpg" },
    { n: "TO KILL A MOCKINGBIRD", u: "../images/famous-books/to-kill-a-mockingbird.jpg" },
    { n: "THE GREAT GATSBY", u: "../images/famous-books/the-great-gatsby.jpg" },
    { n: "1984", u: "../images/famous-books/1984.jpg" },
    { n: "ALICE IN WONDERLAND", u: "../images/famous-books/alice-in-wonderland.webp" },
    { n: "THE DIARY OF A YOUNG GIRL", u: "../images/famous-books/the-diary-of-a-young-girl.png" },
    { n: "THE HOBBIT", u: "../images/famous-books/the-hobbit.webp" },
    { n: "THE HUNGER GAMES", u: "../images/famous-books/the-hunger-games.jpg" },
    { n: "TWILIGHT", u: "../images/famous-books/twilight.jpg" },
    { n: "CHARLOTTE'S WEB", u: "../images/famous-books/charlottes-web.jpg" },
    { n: "THE VERY HUNGRY CATERPILLAR", u: "../images/famous-books/the-very-hungry-caterpillar.gif" },
    { n: "FRANKENSTEIN", u: "../images/famous-books/frankenstein.jpg" },
    
    // Tier 3 — Knowledgeable (Existing)
    { n: "PRIDE AND PREJUDICE", u: "../images/famous-books/pride-and-prejudice.jpg" },
    { n: "THE CATCHER IN THE RYE", u: "../images/famous-books/the-catcher-in-the-rye.jpg" },
    { n: "WHERE THE WILD THINGS ARE", u: "../images/famous-books/where-the-wild-things-are.jpg" },
    { n: "ANIMAL FARM", u: "../images/famous-books/animal-farm.jpg" },
    { n: "FAHRENHEIT 451", u: "../images/famous-books/fahrenheit-451.jpg" },
    { n: "LITTLE WOMEN", u: "../images/famous-books/little-women.jpg" },
    { n: "THE CHRONICLES OF NARNIA", u: "../images/famous-books/the-chronicles-of-narnia.png" },
    { n: "DRACULA", u: "../images/famous-books/dracula.jpg" },
    { n: "THE ODYSSEY", u: "../images/famous-books/the-odyssey.png" },
    { n: "MOBY-DICK", u: "../images/famous-books/moby-dick.jpg" },
    { n: "GOODNIGHT MOON", u: "../images/famous-books/goodnight-moon.jpg" },
    { n: "THE GIVING TREE", u: "../images/famous-books/the-giving-tree.jpg" },
    { n: "DUNE", u: "../images/famous-books/dune.jpg" },
    { n: "THE TALE OF PETER RABBIT", u: "../images/famous-books/the-tale-of-peter-rabbit.jpg" },
    { n: "THE FAULT IN OUR STARS", u: "../images/famous-books/the-fault-in-our-stars.webp" },
    
    // Tier 4 — Expert (Existing)
    { n: "PERCY JACKSON", u: "../images/famous-books/percy-jackson.jpg" },
    { n: "A GAME OF THRONES", u: "../images/famous-books/a-game-of-thrones.png" },
    { n: "THE DA VINCI CODE", u: "../images/famous-books/the-da-vinci-code.webp" },
    { n: "JANE EYRE", u: "../images/famous-books/jane-eyre.jpg" },
    { n: "OF MICE AND MEN", u: "../images/famous-books/of-mice-and-men.jpg" },
    { n: "LORD OF THE FLIES", u: "../images/famous-books/lord-of-the-flies.jpg" },
    { n: "A TALE OF TWO CITIES", u: "../images/famous-books/a-tale-of-two-cities.webp" },
    { n: "LES MISÉRABLES", u: "../images/famous-books/les-miserables.webp" },
    { n: "WUTHERING HEIGHTS", u: "../images/famous-books/wuthering-heights.jpg" },
    { n: "THE ALCHEMIST", u: "../images/famous-books/the-alchemist.webp" },

    // ── BACKUPS (51–60) ──────────────── (Existing)
    { n: "THE COLOR PURPLE", u: "../images/famous-books/the-color-purple.png" },
    { n: "THE HITCHHIKER'S GUIDE", u: "../images/famous-books/the-hitchhikers-guide.webp" },
    { n: "THE HANDMAID'S TALE", u: "../images/famous-books/the-handmaids-tale.jpg" },
    { n: "LIFE OF PI", u: "../images/famous-books/life-of-pi.jpg" },
    { n: "IT", u: "../images/famous-books/it.png" },
    { n: "THE SHINING", u: "../images/famous-books/the-shining.jpg" },
    { n: "A WRINKLE IN TIME", u: "../images/famous-books/a-wrinkle-in-time.png" }
];
if (typeof window !== 'undefined') window.famousBooksData = famousBooksData;
