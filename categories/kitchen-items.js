// Kitchen Items — images in images/kitchen-items/
const kitchenItemsData = [
    // Tier 1 — Obvious (1–15)
    { n: "FRYING PAN", u: "../images/kitchen-items/frying-pan.webp" },
    { n: "TOASTER", u: "../images/kitchen-items/toaster.webp" },
    { n: "MICROWAVE", u: "../images/kitchen-items/microwave.webp" },
    { n: "ROLLING PIN", u: "../images/kitchen-items/rolling-pin.webp" },
    { n: "BLENDER", u: "../images/kitchen-items/blender.webp" },
    { n: "KNIVES", u: "../images/kitchen-items/knives.webp" },
    { n: "WHISK", u: "../images/kitchen-items/whisk.webp" },
    { n: "CUTTING BOARD", u: "../images/kitchen-items/cutting-board.webp" },
    { n: "REFRIGERATOR", u: "../images/kitchen-items/refrigerator.webp" },
    { n: "MEASURING CUP", u: "../images/kitchen-items/measuring-cup.webp" },
    { n: "OVEN MITT", u: "../images/kitchen-items/oven-mitt.webp" },
    { n: "CAN OPENER", u: "../images/kitchen-items/can-opener.webp" },
    { n: "KETTLE", u: "../images/kitchen-items/kettle.webp" },
    { n: "COLANDER/STRAINER", u: "../images/kitchen-items/colanderstrainer.webp" },
    { n: "CHEESE GRATER", u: "../images/kitchen-items/cheese-grater.webp" },

    // Tier 2 — Familiar (16–30)
    { n: "STAND MIXER", u: "../images/kitchen-items/stand-mixer.webp" },
    { n: "LADLE", u: "../images/kitchen-items/ladle.webp" },
    { n: "SPATULA", u: "../images/kitchen-items/spatula.webp" },
    { n: "PEELER", u: "../images/kitchen-items/peeler.webp" },
    { n: "COFFEE MAKER", u: "../images/kitchen-items/coffee-maker.webp" },
    { n: "POTATO MASHER", u: "../images/kitchen-items/potato-masher.webp" },
    { n: "WAFFLE MAKER", u: "../images/kitchen-items/waffle-maker.webp" },
    { n: "TONGS", u: "../images/kitchen-items/tongs.webp" },
    { n: "PRESSURE COOKER", u: "../images/kitchen-items/pressure-cooker.webp" },
    { n: "ICE CREAM SCOOP", u: "../images/kitchen-items/ice-cream-scoop.webp" },
    { n: "FOOD PROCESSOR", u: "../images/kitchen-items/food-processor.webp" },
    { n: "GARLIC PRESS", u: "../images/kitchen-items/garlic-press.webp" },
    { n: "SLOW COOKER/CROCKPOT", u: "../images/kitchen-items/slow-cookercrockpot.webp" },
    { n: "CORKSCREW", u: "../images/kitchen-items/corkscrew.webp" },
    { n: "BAKING SHEET", u: "../images/kitchen-items/baking-sheet.webp" },

    // Tier 3 — Knowledgeable (31–40)
    { n: "MEAT THERMOMETER", u: "../images/kitchen-items/meat-thermometer.webp" },
    { n: "SALAD SPINNER", u: "../images/kitchen-items/salad-spinner.webp" },
    { n: "MORTAR AND PESTLE", u: "../images/kitchen-items/mortar-and-pestle.webp" },
    { n: "DUTCH OVEN", u: "../images/kitchen-items/dutch-oven.webp" },
    { n: "AIR FRYER", u: "../images/kitchen-items/air-fryer.webp" },
    { n: "KITCHEN SCALE", u: "../images/kitchen-items/kitchen-scale.webp" },
    { n: "PIZZA CUTTER", u: "../images/kitchen-items/pizza-cutter.webp" },
    { n: "ZESTER", u: "../images/kitchen-items/zester.webp" },
    { n: "STOCK POT", u: "../images/kitchen-items/stock-pot.webp" },
    { n: "SLOTTED SPOON", u: "../images/kitchen-items/slotted-spoon.webp" },

    // Tier 4 — Expert (41–50)
    { n: "MANDOLINE SLICER", u: "../images/kitchen-items/mandoline-slicer.webp" },
    { n: "PIPING BAG", u: "../images/kitchen-items/piping-bag.webp" },
    { n: "MEAT TENDERIZER", u: "../images/kitchen-items/meat-tenderizer.webp" },
    { n: "SOUS VIDE MACHINE", u: "../images/kitchen-items/sous-vide-machine.webp" },
    { n: "SIEVE", u: "../images/kitchen-items/sieve.webp" },
    { n: "PASTRY BRUSH", u: "../images/kitchen-items/pastry-brush.webp" },
    { n: "BUTTER DISH", u: "../images/kitchen-items/butter-dish.webp" },
    { n: "GRAVY BOAT", u: "../images/kitchen-items/gravy-boat.webp" },
    { n: "SPLATTER SCREEN", u: "../images/kitchen-items/splatter-screen.webp" },
    { n: "MEAT CLEAVER", u: "../images/kitchen-items/meat-cleaver.webp" },

    // ── BACKUPS (51–60) ────────────────
    { n: "EGG SLICER", u: "../images/kitchen-items/egg-slicer.webp" },
    { n: "HONING STEEL", u: "../images/kitchen-items/honing-steel.webp" },
    { n: "OIL DISPENSER", u: "../images/kitchen-items/oil-dispenser.webp" },
    { n: "BREAD BOX", u: "../images/kitchen-items/bread-box.webp" },
    { n: "RICE COOKER", u: "../images/kitchen-items/rice-cooker.webp" },
    { n: "TORTILLA PRESS", u: "../images/kitchen-items/tortilla-press.webp" },
    { n: "PEPPER MILL", u: "../images/kitchen-items/pepper-mill.webp" },
    { n: "CARVING FORK", u: "../images/kitchen-items/carving-fork.webp" },
    { n: "EGG POACHER", u: "../images/kitchen-items/egg-poacher.webp" },
    { n: "BASTER", u: "../images/kitchen-items/baster.webp" }
];
if (typeof window !== 'undefined') window.kitchenItemsData = kitchenItemsData;
