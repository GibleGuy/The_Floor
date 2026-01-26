/**
 * Tile — Represents a single cell on the grid.
 * Each tile belongs to exactly one player and has a category (used when defending).
 * Logic only; no UI.
 */

/**
 * @typedef {Object} TileData
 * @property {number} row
 * @property {number} col
 * @property {string} ownerId - Player id who owns this tile
 * @property {string} category - Category used when this tile defends
 */

/**
 * Create a tile.
 * @param {number} row
 * @param {number} col
 * @param {string} ownerId
 * @param {string} category
 * @returns {TileData}
 */
function createTile(row, col, ownerId, category) {
    return { row, col, ownerId, category };
}

/**
 * Clone a tile (for snapshots / undo).
 * @param {TileData} t
 * @returns {TileData}
 */
function cloneTile(t) {
    return { row: t.row, col: t.col, ownerId: t.ownerId, category: t.category };
}

export { createTile, cloneTile };
