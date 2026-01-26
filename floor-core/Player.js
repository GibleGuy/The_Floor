/**
 * Player — Tracks per-player state.
 * Logic only; no UI.
 */

/**
 * @typedef {Object} PlayerData
 * @property {string} id
 * @property {string} name
 * @property {string} expertCategory
 * @property {number} area - Tile count (cached; recompute from grid when needed)
 * @property {number} duelCount
 * @property {boolean} hasTimeBoost
 * @property {boolean} eliminated
 */

let _nextId = 1;

/**
 * Create a player. Area is 0 until assigned tiles.
 * @param {Object} opts
 * @param {string} opts.name
 * @param {string} opts.expertCategory
 * @param {boolean} [opts.hasTimeBoost=false]
 * @returns {PlayerData}
 */
function createPlayer(opts) {
    const id = 'p' + _nextId++;
    return {
        id,
        name: opts.name || 'Player',
        expertCategory: opts.expertCategory || '',
        area: 0,
        duelCount: 0,
        hasTimeBoost: opts.hasTimeBoost ?? false,
        eliminated: false,
    };
}

/**
 * Reset internal id counter (e.g. for tests). Not used in normal gameplay.
 */
function resetPlayerIds() {
    _nextId = 1;
}

/**
 * Clone a player (for snapshots / undo).
 * @param {PlayerData} p
 * @returns {PlayerData}
 */
function clonePlayer(p) {
    return {
        id: p.id,
        name: p.name,
        expertCategory: p.expertCategory,
        area: p.area,
        duelCount: p.duelCount,
        hasTimeBoost: p.hasTimeBoost,
        eliminated: p.eliminated,
    };
}

export { createPlayer, clonePlayer, resetPlayerIds };
