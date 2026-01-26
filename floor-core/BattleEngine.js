/**
 * BattleEngine — Battle rules and result application.
 * Battles occur only between orthogonally adjacent tiles.
 * Defender's category is always used. Host declares winner; we apply result.
 * Logic only; no UI.
 */

const ORTH = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
];

/**
 * Check if (r2, c2) is orthogonally adjacent to (r1, c1).
 * @param {number} r1
 * @param {number} c1
 * @param {number} r2
 * @param {number} c2
 * @returns {boolean}
 */
function isOrthogonalAdjacent(r1, c1, r2, c2) {
    const dr = Math.abs(r2 - r1);
    const dc = Math.abs(c2 - c1);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

/**
 * Validate a battle: both tiles exist, adjacent, different owners, both not eliminated.
 * @param {GameState} state
 * @param {number} cr Challenger row
 * @param {number} cc Challenger col
 * @param {number} dr Defender row
 * @param {number} dc Defender col
 * @returns {{ valid: boolean, challenger?: TileData, defender?: TileData, error?: string }}
 */
function validateBattle(state, cr, cc, dr, dc) {
    const challenger = state.getTile(cr, cc);
    const defender = state.getTile(dr, dc);
    if (!challenger || !defender) {
        return { valid: false, error: 'Invalid tile position' };
    }
    if (!isOrthogonalAdjacent(cr, cc, dr, dc)) {
        return { valid: false, error: 'Tiles must be orthogonally adjacent' };
    }
    if (!challenger.ownerId || !defender.ownerId) {
        return { valid: false, error: 'Both tiles must have an owner' };
    }
    if (challenger.ownerId === defender.ownerId) {
        return { valid: false, error: 'Challenger and defender must be different players' };
    }
    const cp = state.getPlayer(challenger.ownerId);
    const dp = state.getPlayer(defender.ownerId);
    if (!cp || !dp || cp.eliminated || dp.eliminated) {
        return { valid: false, error: 'Both players must be active' };
    }
    return { valid: true, challenger, defender };
}

/**
 * Apply battle result. Host has declared winner.
 * - Loser: eliminated, loses all tiles, loses category.
 * - Winner: gains all tiles. Gains loser's category only if winner was defender; keeps category if challenger.
 *
 * @param {GameState} state
 * @param {number} cr Challenger row
 * @param {number} cc Challenger col
 * @param {number} dr Defender row
 * @param {number} dc Defender col
 * @param {boolean} winnerIsChallenger true => challenger wins, false => defender wins
 * @returns {{ success: boolean, loserId?: string, winnerId?: string, error?: string }}
 */
function applyBattleResult(state, cr, cc, dr, dc, winnerIsChallenger) {
    const v = validateBattle(state, cr, cc, dr, dc);
    if (!v.valid) return { success: false, error: v.error };

    const { challenger, defender } = v;
    const winnerId = winnerIsChallenger ? challenger.ownerId : defender.ownerId;
    const loserId = winnerIsChallenger ? defender.ownerId : challenger.ownerId;
    const winnerWasDefender = !winnerIsChallenger;

    const loser = state.getPlayer(loserId);
    const winner = state.getPlayer(winnerId);
    if (!loser || !winner) return { success: false, error: 'Player not found' };

    // Category for transferred tiles: loser's expert if winner was defender, else winner's expert
    const transferredCategory = winnerWasDefender ? loser.expertCategory : winner.expertCategory;

    // Loser loses all tiles -> reassign to winner (collect first, then reassign)
    const tiles = state.getTilesOwnedBy(loserId).map((t) => ({ r: t.row, c: t.col }));
    for (const { r, c } of tiles) {
        state.setTileOwner(r, c, winnerId, transferredCategory);
    }

    // Eliminate loser
    state.eliminatePlayer(loserId);

    // Increment duel counts for both (loser is already eliminated, but we still record they fought)
    loser.duelCount++;
    winner.duelCount++;

    state.refreshAreas();
    return { success: true, loserId, winnerId };
}

/**
 * Get the category used for a battle (always defender's tile category).
 * @param {GameState} state
 * @param {number} _cr Challenger row (unused)
 * @param {number} _cc Challenger col (unused)
 * @param {number} dr Defender row
 * @param {number} dc Defender col
 * @returns {string}
 */
function getBattleCategory(state, _cr, _cc, dr, dc) {
    const def = state.getTile(dr, dc);
    return def ? def.category : '';
}

export {
    isOrthogonalAdjacent,
    validateBattle,
    applyBattleResult,
    getBattleCategory,
    ORTH,
};
