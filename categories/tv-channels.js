// TV Channels — image of the show, hint is the show name, answer is the network
const tvChannelsData = [
    // Tier 1 — Obvious (items 1–15)
    { n: "PBS", u: "../images/tv-channels/sesame-street.jpg", h: "SESAME STREET" },
    { n: "ABC", u: "../images/tv-channels/the-bachelor.jpg", h: "THE BACHELOR" },
    { n: "CBS", u: "../images/tv-channels/survivor.jpg", h: "SURVIVOR" },
    { n: "DISNEY CHANNEL", u: "../images/tv-channels/hannah-montana.jpg", h: "HANNAH MONTANA" },
    { n: "COMEDY CENTRAL", u: "../images/tv-channels/the-daily-show.jpg", h: "THE DAILY SHOW" },
    { n: "CARTOON NETWORK", u: "../images/tv-channels/adventure-time.jpg", h: "ADVENTURE TIME" },
    { n: "ESPN", u: "../images/tv-channels/sportscenter.jpg", h: "SPORTSCENTER" },
    { n: "BRAVO", u: "../images/tv-channels/the-real-housewives.jpg", h: "THE REAL HOUSEWIVES" },
    { n: "MTV", u: "../images/tv-channels/the-challenge.jpg", h: "THE CHALLENGE" },

    // Tier 2 — Familiar (items 16–30)
    { n: "AMC", u: "../images/tv-channels/breaking-bad.jpg", h: "BREAKING BAD" },
    { n: "ABC", u: "../images/tv-channels/greys-anatomy.jpg", h: "GREY'S ANATOMY" },
    { n: "CBS", u: "../images/tv-channels/ncis.jpg", h: "NCIS" },
    { n: "ADULT SWIM", u: "../images/tv-channels/rick-and-morty.jpg", h: "RICK AND MORTY" },
    { n: "COMEDY CENTRAL", u: "../images/tv-channels/south-park.jpg", h: "SOUTH PARK" },
    { n: "ABC", u: "../images/tv-channels/lost.jpg", h: "LOST" },
    { n: "DISNEY CHANNEL", u: "../images/tv-channels/wizards-of-waverly-place.jpg", h: "WIZARDS OF WAVERLY PLACE" },
    { n: "CBS", u: "../images/tv-channels/big-brother.jpg", h: "BIG BROTHER" },
    { n: "BBC", u: "../images/tv-channels/doctor-who.jpg", h: "DOCTOR WHO" },
    { n: "AMC", u: "../images/tv-channels/the-walking-dead.jpg", h: "THE WALKING DEAD" },
    { n: "MTV", u: "../images/tv-channels/jersey-shore.jpg", h: "JERSEY SHORE" },

    // Tier 3 — Knowledgeable (items 31–40)
    { n: "HISTORY CHANNEL", u: "../images/tv-channels/pawn-stars.jpg", h: "PAWN STARS" },
    { n: "FX", u: "../images/tv-channels/its-always-sunny-in-philadelphia.jpg", h: "IT'S ALWAYS SUNNY IN PHILADELPHIA" },
    { n: "USA NETWORK", u: "../images/tv-channels/wwe-raw.jpg", h: "WWE RAW" },
    { n: "TLC", u: "../images/tv-channels/90-day-fiance.jpg", h: "90 DAY FIANCE" },
    { n: "E!", u: "../images/tv-channels/keeping-up-with-the-kardashians.jpg", h: "KEEPING UP WITH THE KARDASHIANS" },
    { n: "TNT", u: "../images/tv-channels/inside-the-nba.jpg", h: "INSIDE THE NBA" },
    { n: "CNN", u: "../images/tv-channels/anderson-cooper-360.jpg", h: "ANDERSON COOPER 360" },

    // Tier 4 — Expert (items 41–50)
    { n: "OXYGEN", u: "../images/tv-channels/snapped.jpg", h: "SNAPPED" },
    { n: "FREEFORM", u: "../images/tv-channels/pretty-little-liars.jpg", h: "PRETTY LITTLE LIARS" },
    { n: "LIFETIME", u: "../images/tv-channels/dance-moms.jpg", h: "DANCE MOMS" },

    // ── BACKUPS (items 51–60) ────────────────
    { n: "NBC", u: "../images/tv-channels/this-is-us.jpg", h: "THIS IS US" },
];
if (typeof window !== 'undefined') window.tvChannelsData = tvChannelsData;
