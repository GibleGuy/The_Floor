/**
 * floor-core — Core game state and rules for The Floor–style grid game.
 * Logic only; no UI, HTML, or animations.
 *
 * Public surface used by host/; internals stay in their modules.
 */

export {
    createGameState,
    DEFAULT_ROWS,
    DEFAULT_COLS,
} from './GameState.js';
export {
    validateBattle,
    applyBattleResult,
    getBattleCategory,
    absorbGreySquares,
} from './BattleEngine.js';
export {
    getEligiblePlayers,
    pickOne,
    getOrderedEligible,
} from './Randomizer.js';
export { createUndoManager } from './UndoManager.js';
