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
];
if (typeof window !== 'undefined') window.CATEGORY_REGISTRY = CATEGORY_REGISTRY;
