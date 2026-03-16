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
    { key: 'flags', label: 'Flags', script: 'flags.js', global: 'flagData' },
    { key: 'pokemon', label: 'Pokemon', script: 'pokemon.js', global: 'pokemonData' },
    { key: 'hockey', label: 'Hockey', script: 'hockey.js', global: 'hockeyData' },
    { key: 'math', label: 'Math', script: 'math.js', global: 'mathData' },
    { key: 'dogs', label: 'Dogs', script: 'dogs.js', global: 'dogData' },
    { key: 'advertisement', label: 'Advertisement', script: 'advertisement.js', global: 'advertisementData', gibleOnly: true },
    { key: 'best-picture', label: 'Best Picture', script: 'best-picture.js', global: 'bestPictureData', gibleOnly: true },
    { key: 'golf', label: 'Golf', script: 'golf.js', global: 'golfData', gibleOnly: true },
    { key: 'girl-groups', label: 'Girl Groups', script: 'girl-groups.js', global: 'girlGroupsData', gibleOnly: true },
    { key: 'historic-events', label: 'Historic Events', script: 'historic-events.js', global: 'historicEventsData', gibleOnly: true },
    { key: 'instruments', label: 'Instruments', script: 'instruments.js', global: 'instrumentsData' },
    { key: 'gameshows', label: 'Gameshows', script: 'gameshows.js', global: 'gameshowsData', gibleOnly: true },
    { key: 'taylor-swift', label: 'Taylor Swift', script: 'taylor-swift.js', global: 'taylorSwiftData', gibleOnly: true },
    { key: 'logos', label: 'Logos', script: 'logos.js', global: 'logosData', gibleOnly: true },
    { key: 'food', label: 'Food', script: 'food.js', global: 'foodData', gibleOnly: true },
    { key: 'anime', label: 'Anime', script: 'anime.js', global: 'animeData', gibleOnly: true },
    { key: 'minecraft', label: 'Minecraft', script: 'minecraft.js', global: 'minecraftData', gibleOnly: true },
    { key: 'dolls', label: 'Dolls', script: 'dolls.js', global: 'dollsData', gibleOnly: true },
    { key: 'nintendo', label: 'Nintendo', script: 'nintendo.js', global: 'nintendoData', gibleOnly: true },
    { key: 'retro-video-games', label: 'Retro Video Games', script: 'retro-video-games.js', global: 'retroVideoGamesData', gibleOnly: true },
    { key: 'college-logos', label: 'College Logos', script: 'college-logos.js', global: 'collegeLogosData', gibleOnly: true },
    { key: 'sports-logos', label: 'Sports Logos', script: 'sports-logos.js', global: 'sportsLogosData', gibleOnly: true },
    { key: 'memes', label: 'Memes', script: 'memes.js', global: 'memesData', gibleOnly: true },
    { key: 'board-games', label: 'Board Games', script: 'board-games.js', global: 'boardGamesData', gibleOnly: true },
    { key: 'attractive-men', label: 'Attractive Men', script: 'attractive-men.js', global: 'attractiveMenData', gibleOnly: true },
    { key: 'capital-cities', label: 'Capital Cities', script: 'capital-cities.js', global: 'capitalCitiesData', gibleOnly: true },
    { key: 'football', label: 'Football', script: 'football.js', global: 'footballData', gibleOnly: true },
    { key: 'disney-movies', label: 'Disney Movies', script: 'disney-movies.js', global: 'disneyMoviesData', gibleOnly: true },
    { key: '2000s-artists', label: '2000s Artists', script: '2000s-artists.js', global: 'artists2000sData', gibleOnly: true },
    { key: 'puppets', label: 'Puppets', script: 'puppets.js', global: 'puppetsData', gibleOnly: true },
    { key: 'world-leaders', label: 'World Leaders', script: 'world-leaders.js', global: 'worldLeadersData', gibleOnly: true },
    { key: 'queer-movies-tv', label: 'Queer Movies & TV', script: 'queer-movies-tv.js', global: 'queerMoviesTvData', gibleOnly: true },
    { key: 'card-games', label: 'Card Games', script: 'card-games.js', global: 'cardGamesData', gibleOnly: true },
    { key: 'the-90s', label: 'The 90s', script: 'the-90s.js', global: 'the90sData', gibleOnly: true },
    { key: 'famous-books', label: 'Famous Books', script: 'famous-books.js', global: 'famousBooksData', gibleOnly: true },
    { key: 'orange-things', label: 'Orange Things', script: 'orange-things.js', global: 'orangeThingsData', gibleOnly: true },
    { key: 'baby-animals', label: 'Baby Animals', script: 'baby-animals.js', global: 'babyAnimalsData', gibleOnly: true },
    { key: 'furniture', label: 'Furniture', script: 'furniture.js', global: 'furnitureData', gibleOnly: true },
];
if (typeof window !== 'undefined') window.CATEGORY_REGISTRY = CATEGORY_REGISTRY;
