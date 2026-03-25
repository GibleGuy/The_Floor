/**
 * Central Category Registry — single source of truth.
 * To add a new category, just append one entry here.
 *
 * key    — internal identifier (lowercase, no spaces)
 * label  — display name shown in UI
 * script — filename inside categories/ folder
 * global — the window.* variable name the script creates
 */
const CATEGORY_REGISTRY = [
    // REAL DEAL
    { key: '2000s-artists', label: '2000s Artists', emoji: '🎤', script: '2000s-artists.js', global: 'artists2000sData', tier: 'REAL DEAL' },
    { key: 'advertisement', label: 'Advertisement', emoji: '📺', script: 'advertisement.js', global: 'advertisementData', tier: 'REAL DEAL' },
    { key: 'anime', label: 'Anime', emoji: '⛩️', script: 'anime.js', global: 'animeData', tier: 'REAL DEAL' },
    { key: 'best-picture', label: 'Best Picture', emoji: '🏆', script: 'best-picture.js', global: 'bestPictureData', tier: 'REAL DEAL' },
    { key: 'birds', label: 'Birds', emoji: '🐦', script: 'birds.js', global: 'birdsData', tier: 'REAL DEAL' },
    { key: 'board-games', label: 'Board Games', emoji: '🎲', script: 'board-games.js', global: 'boardGamesData', tier: 'REAL DEAL' },
    { key: 'capital-cities', label: 'Capital Cities', emoji: '🏛️', script: 'capital-cities.js', global: 'capitalCitiesData', tier: 'REAL DEAL' },
    { key: 'card-games', label: 'Card Games', emoji: '🃏', script: 'card-games.js', global: 'cardGamesData', tier: 'REAL DEAL' },
    { key: 'college-logos', label: 'College Logos', emoji: '🎓', script: 'college-logos.js', global: 'collegeLogosData', tier: 'REAL DEAL' },
    { key: 'disney-movies', label: 'Disney Movies', emoji: '🏰', script: 'disney-movies.js', global: 'disneyMoviesData', tier: 'REAL DEAL' },
    { key: 'dolls', label: 'Dolls', emoji: '🎎', script: 'dolls.js', global: 'dollsData', tier: 'REAL DEAL' },
    { key: 'f1', label: 'F1', emoji: '🏎️', script: 'f1.js', global: 'f1Data', tier: 'REAL DEAL' },
    { key: 'famous-books', label: 'Famous Books', emoji: '📚', script: 'famous-books.js', global: 'famousBooksData', tier: 'REAL DEAL' },
    { key: 'fishing', label: 'Fishing', emoji: '🎣', script: 'fishing.js', global: 'fishingData', tier: 'REAL DEAL' },
    { key: 'food', label: 'Food', emoji: '🍕', script: 'food.js', global: 'foodData', tier: 'REAL DEAL' },
    { key: 'football', label: 'Football', emoji: '🏈', script: 'football.js', global: 'footballData', tier: 'REAL DEAL' },
    { key: 'gameshows', label: 'Gameshows', emoji: '🎰', script: 'gameshows.js', global: 'gameshowsData', tier: 'REAL DEAL' },
    { key: 'girl-groups', label: 'Girl Groups', emoji: '👩‍🎤', script: 'girl-groups.js', global: 'girlGroupsData', tier: 'REAL DEAL' },
    { key: 'golf', label: 'Golf', emoji: '⛳', script: 'golf.js', global: 'golfData', tier: 'REAL DEAL' },
    { key: 'historic-events', label: 'Historic Events', emoji: '📜', script: 'historic-events.js', global: 'historicEventsData', tier: 'REAL DEAL' },
    { key: 'horror-movies', label: 'Horror Movies', emoji: '🔪', script: 'horror-movies.js', global: 'horrorMoviesData', tier: 'REAL DEAL' },
    { key: 'indiana-university', label: 'Indiana University', emoji: '🔱', script: 'indiana-university.js', global: 'indianaUniversityData', tier: 'REAL DEAL' },
    { key: 'instruments', label: 'Instruments', emoji: '🎵', script: 'instruments.js', global: 'instrumentsData', tier: 'REAL DEAL' },
    { key: 'marching-band', label: 'Marching Band', emoji: '🥁', script: 'marching-band.js', global: 'marchingBandData', tier: 'REAL DEAL' },
    { key: 'minecraft', label: 'Minecraft', emoji: '⛏️', script: 'minecraft.js', global: 'minecraftData', tier: 'REAL DEAL' },
    { key: 'mobile-apps', label: 'Mobile Apps', emoji: '📱', script: 'mobile-apps.js', global: 'mobileAppsData', tier: 'REAL DEAL' },
    { key: 'nintendo', label: 'Nintendo', emoji: '🎮', script: 'nintendo.js', global: 'nintendoData', tier: 'REAL DEAL' },
    { key: 'pokemon-everything', label: 'Pokemon Everything', emoji: '🔴', script: 'pokemon-everything.js', global: 'pokemonEverythingData', tier: 'REAL DEAL' },
    { key: 'queer-movies-tv', label: 'Queer Movies & TV', emoji: '🏳️‍🌈', script: 'queer-movies-tv.js', global: 'queerMoviesTvData', tier: 'REAL DEAL' },
    { key: 'retro-video-games', label: 'Retro Video Games', emoji: '👾', script: 'retro-video-games.js', global: 'retroVideoGamesData', tier: 'REAL DEAL' },
    { key: 'sports-logos', label: 'Sports Logos', emoji: '🏅', script: 'sports-logos.js', global: 'sportsLogosData', tier: 'REAL DEAL' },
    { key: 'state-flags', label: 'State Flags', emoji: '🇺🇸', script: 'state-flags.js', global: 'stateFlagsData', tier: 'REAL DEAL' },
    { key: 'strange-animals', label: 'Strange Animals', emoji: '🦠', script: 'strange-animals.js', global: 'strangeAnimalsData', tier: 'REAL DEAL' },
    { key: 'taylor-swift', label: 'Taylor Swift', emoji: '🎶', script: 'taylor-swift.js', global: 'taylorSwiftData', tier: 'REAL DEAL' },
    { key: 'the-90s', label: 'The 90s', emoji: '📼', script: 'the-90s.js', global: 'the90sData', tier: 'REAL DEAL' },
    { key: 'track-and-field', label: 'Track & Field', emoji: '🏃', script: 'track-and-field.js', global: 'trackAndFieldData', tier: 'REAL DEAL' },
    { key: 'visual-novels', label: 'Visual Novels', emoji: '📖', script: 'visual-novels.js', global: 'visualNovelsData', tier: 'REAL DEAL' },
    { key: 'world-leaders', label: 'World Leaders', emoji: '🌍', script: 'world-leaders.js', global: 'worldLeadersData', tier: 'REAL DEAL' },

    // EXAMPLES
    { key: 'flags', label: 'Flags', emoji: '🏁', script: 'flags.js', global: 'flagData', tier: 'EXAMPLES' },
    { key: 'hockey', label: 'Hockey', emoji: '🏒', script: 'hockey.js', global: 'hockeyData', tier: 'EXAMPLES' },
    { key: 'dogs', label: 'Dogs', emoji: '🐕', script: 'dogs.js', global: 'dogData', tier: 'EXAMPLES' },
    { key: 'attractive-men', label: 'Attractive Men', emoji: '💪', script: 'attractive-men.js', global: 'attractiveMenData', tier: 'EXAMPLES' },
    { key: 'math', label: 'Math', emoji: '➗', script: 'math.js', global: 'mathData', tier: 'EXAMPLES' },
    { key: 'pokemon', label: 'Pokemon', emoji: '⚡', script: 'pokemon.js', global: 'pokemonData', tier: 'EXAMPLES' },

    // TIEBREAK
    { key: 'orange-things', label: 'Orange Things', emoji: '🟠', script: 'orange-things.js', global: 'orangeThingsData', tier: 'TIEBREAK' },
    { key: 'baby-animals', label: 'Baby Animals', emoji: '🐣', script: 'baby-animals.js', global: 'babyAnimalsData', tier: 'TIEBREAK' },
    { key: 'furniture', label: 'Furniture', emoji: '🪑', script: 'furniture.js', global: 'furnitureData', tier: 'TIEBREAK' },

    // EXTRAS
    { key: 'logos', label: 'Logos', emoji: '🏷️', script: 'logos.js', global: 'logosData', tier: 'EXTRAS' },
    { key: 'memes', label: 'Memes', emoji: '😂', script: 'memes.js', global: 'memesData', tier: 'EXTRAS' },
    { key: 'mega', label: 'Mega Category', emoji: '🌟', script: 'mega.js', global: 'megaData', tier: 'EXTRAS' },
    { key: 'religion', label: 'Religion', emoji: '⛪', script: 'religion.js', global: 'religionData', tier: 'EXTRAS' },
];
if (typeof window !== 'undefined') window.CATEGORY_REGISTRY = CATEGORY_REGISTRY;
