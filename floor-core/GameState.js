/**
 * GameState — Central state: grid, players, dimensions.
 * Logic only; no UI.
 */

import { createTile, cloneTile } from './Tile.js';
import { createPlayer, clonePlayer } from './Player.js';

const DEFAULT_ROWS = 5;
const DEFAULT_COLS = 5;
const MIN_PLAYERS = 4;
const MAX_PLAYERS = 400;

/**
 * Build a fresh game state.
 * @param {Object} [opts]
 * @param {number} [opts.rows=10]
 * @param {number} [opts.cols=10]
 * @param {Array<{name: string, expertCategory: string, hasTimeBoost?: boolean}>} [opts.players]
 * @returns {GameState}
 */
function createGameState(opts = {}) {
    const rows = Math.max(1, opts.rows ?? DEFAULT_ROWS);
    const cols = Math.max(1, opts.cols ?? DEFAULT_COLS);
    const players = [];
    const playerMap = new Map();

    if (opts.players && Array.isArray(opts.players)) {
        const n = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, opts.players.length));
        for (let i = 0; i < n; i++) {
            const p = createPlayer(opts.players[i]);
            players.push(p);
            playerMap.set(p.id, p);
        }
    }

    /** @type {TileData[][]} */
    const grid = [];
    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            grid[r][c] = createTile(r, c, '', '');
        }
    }

    return {
        rows,
        cols,
        grid,
        players,
        playerMap,

        getTile(r, c) {
            if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
            return grid[r][c];
        },

        getPlayer(id) {
            return playerMap.get(id) ?? null;
        },

        /** Recompute each player's area from the grid. */
        refreshAreas() {
            for (const p of players) {
                p.area = 0;
            }
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const t = grid[r][c];
                    if (t.ownerId) {
                        const p = playerMap.get(t.ownerId);
                        if (p) p.area++;
                    }
                }
            }
        },

        /** Set tile owner and category. Used for initial distribution and battle results. */
        setTileOwner(r, c, ownerId, category) {
            const t = this.getTile(r, c);
            if (!t) return false;
            t.ownerId = ownerId;
            t.category = category || '';
            return true;
        },

        /** Set only the category of a tile (e.g. category swap). */
        setTileCategory(r, c, category) {
            const t = this.getTile(r, c);
            if (!t) return false;
            t.category = category || '';
            return true;
        },

        /**
         * Get all tiles in a contiguous cell group (flood-fill).
         * Returns all orthogonally connected tiles with the same ownerId.
         * @param {number} r - Row of starting tile
         * @param {number} c - Column of starting tile
         * @returns {Array<{r: number, c: number}>} Array of tile coordinates in the group
         */
        getContiguousTileGroup(r, c) {
            const startTile = this.getTile(r, c);
            if (!startTile || !startTile.ownerId) return [{ r, c }];

            const targetOwnerId = startTile.ownerId;
            const visited = new Set();
            const group = [];
            const queue = [{ r, c }];

            while (queue.length > 0) {
                const current = queue.shift();
                const key = `${current.r},${current.c}`;

                if (visited.has(key)) continue;
                visited.add(key);

                const tile = this.getTile(current.r, current.c);
                if (!tile || tile.ownerId !== targetOwnerId) continue;

                group.push({ r: current.r, c: current.c });

                // Add orthogonally adjacent tiles to queue
                queue.push({ r: current.r - 1, c: current.c }); // Top
                queue.push({ r: current.r + 1, c: current.c }); // Bottom
                queue.push({ r: current.r, c: current.c - 1 }); // Left
                queue.push({ r: current.r, c: current.c + 1 }); // Right
            }

            return group;
        },

        /**
         * Swap categories between two cell groups. Owners unchanged.
         * Finds all contiguous tiles with the same owner and swaps their categories.
         */
        swapTileCategories(r1, c1, r2, c2) {
            const a = this.getTile(r1, c1);
            const b = this.getTile(r2, c2);
            if (!a || !b) return false;

            // Get all tiles in each cell group
            const group1 = this.getContiguousTileGroup(r1, c1);
            const group2 = this.getContiguousTileGroup(r2, c2);

            // Store the categories to swap
            const category1 = a.category;
            const category2 = b.category;

            // Update all tiles in group 1 with category from group 2
            for (const pos of group1) {
                const tile = this.getTile(pos.r, pos.c);
                if (tile) tile.category = category2;
            }

            // Update all tiles in group 2 with category from group 1
            for (const pos of group2) {
                const tile = this.getTile(pos.r, pos.c);
                if (tile) tile.category = category1;
            }

            return true;
        },

        addPlayer(opts) {
            if (players.length >= MAX_PLAYERS) return null;
            const p = createPlayer(opts);
            players.push(p);
            playerMap.set(p.id, p);
            return p;
        },

        eliminatePlayer(id) {
            const p = playerMap.get(id);
            if (!p) return false;
            p.eliminated = true;
            return true;
        },

        /** Get all tiles owned by a player. */
        getTilesOwnedBy(ownerId) {
            const out = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (grid[r][c].ownerId === ownerId) out.push(grid[r][c]);
                }
            }
            return out;
        },

        /**
         * Initial distribution: assign all tiles to players round-robin.
         * Each tile gets owner's expertCategory. Call after adding players; no-op if no players.
         */
        distributeTilesRoundRobin() {
            if (players.length === 0) return;
            let i = 0;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const p = players[i % players.length];
                    grid[r][c].ownerId = p.id;
                    grid[r][c].category = p.expertCategory;
                    i++;
                }
            }
            this.refreshAreas();
        },

        /** Return a deep clone of the full state (for undo snapshots). */
        snapshot() {
            const gridCopy = [];
            for (let r = 0; r < rows; r++) {
                gridCopy[r] = [];
                for (let c = 0; c < cols; c++) {
                    gridCopy[r][c] = cloneTile(grid[r][c]);
                }
            }
            const playersCopy = players.map(clonePlayer);
            const playerMapCopy = new Map();
            for (const p of playersCopy) playerMapCopy.set(p.id, p);
            return {
                rows,
                cols,
                grid: gridCopy,
                players: playersCopy,
                playerMap: playerMapCopy,
            };
        },

        /** Restore state from a snapshot. Mutates current state to match. */
        restore(snap) {
            for (let r = 0; r < snap.rows && r < rows; r++) {
                for (let c = 0; c < snap.cols && c < cols; c++) {
                    const t = snap.grid[r][c];
                    if (t) {
                        grid[r][c].ownerId = t.ownerId;
                        grid[r][c].category = t.category;
                    }
                }
            }
            players.length = 0;
            playerMap.clear();
            for (const p of snap.players) {
                players.push(clonePlayer(p));
                playerMap.set(p.id, players[players.length - 1]);
            }
        },
    };
}

export { createGameState, DEFAULT_ROWS, DEFAULT_COLS, MIN_PLAYERS, MAX_PLAYERS };
