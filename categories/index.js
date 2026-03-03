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
];
if (typeof window !== 'undefined') window.CATEGORY_REGISTRY = CATEGORY_REGISTRY;
