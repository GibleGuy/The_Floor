/**
 * floor-core — Core game state and rules for The Floor–style grid game.
 * Logic only; no UI, HTML, or animations.
 *
 * Usage:
 * - GameState: grid, players, dimensions.
 * - Player / Tile: data structures.
 * - BattleEngine: validate battles, apply results (host declares winner).
 * - Randomizer: eligibility (non-eliminated, zero duels → lowest area → random), pick one or ordered list.
 * - UndoManager: push snapshot before action, undo to restore.
 */

export { createTile, cloneTile } from './Tile.js';
export { createPlayer, clonePlayer, resetPlayerIds } from './Player.js';
export {
    createGameState,
    DEFAULT_ROWS,
    DEFAULT_COLS,
    MIN_PLAYERS,
    MAX_PLAYERS,
} from './GameState.js';
export {
    isOrthogonalAdjacent,
    validateBattle,
    applyBattleResult,
    getBattleCategory,
    ORTH,
} from './BattleEngine.js';
export {
    getEligiblePlayers,
    sortByEligibility,
    pickOne,
    getOrderedEligible,
    randomInt,
    shuffle,
} from './Randomizer.js';
export { createUndoManager } from './UndoManager.js';
