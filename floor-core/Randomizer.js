/**
 * Randomizer — Eligibility and selection for “who goes next” (e.g. next to battle).
 * Only non-eliminated players. Priority: (1) zero duels, (2) lowest area, (3) random tie-breaker.
 * Logic only; no UI.
 */

/**
 * @param {number} min Inclusive
 * @param {number} max Inclusive
 * @returns {number}
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle array in place (Fisher–Yates). Returns the same array.
 * @param {unknown[]} a
 * @returns {unknown[]}
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Get eligible players: non-eliminated only.
 * @param {GameState} state
 * @returns {PlayerData[]}
 */
function getEligiblePlayers(state) {
    return state.players.filter((p) => !p.eliminated && (p.area ?? 0) > 0);
}

/**
 * Sort eligible players by priority: (1) duelCount ASC, (2) area ASC, (3) random tie-breaker.
 * Returns a new array; does not mutate state.
 *
 * @param {GameState} state
 * @param {Object} [opts]
 * @param {() => number} [opts.rng] Default Math.random. Used for tie-breaker.
 * @returns {PlayerData[]}
 */
function sortByEligibility(state, opts = {}) {
    const rng = opts.rng ?? Math.random;
    const eligible = getEligiblePlayers(state);
    if (eligible.length === 0) return [];

    // Assign random tie-breaker value
    const withTie = eligible.map((p) => ({ p, tie: rng() }));

    withTie.sort((a, b) => {
        if (opts.strategy === 'show') {
            const aDueled = a.p.hasDueled ? 1 : 0;
            const bDueled = b.p.hasDueled ? 1 : 0;
            if (aDueled !== bDueled) return aDueled - bDueled;
            return a.tie - b.tie;
        } else {
            if (a.p.area !== b.p.area) return a.p.area - b.p.area;
            if (a.p.duelCount !== b.p.duelCount) return a.p.duelCount - b.p.duelCount;
            return a.tie - b.tie;
        }
    });

    return withTie.map((x) => x.p);
}

/**
 * Pick one player from the eligible, prioritized list.
 * Highest priority is first; we pick from those tied for first, then random among them.
 *
 * @param {GameState} state
 * @param {Object} [opts]
 * @param {() => number} [opts.rng]
 * @returns {PlayerData | null}
 */
function pickOne(state, opts = {}) {
    const sorted = sortByEligibility(state, opts);
    if (sorted.length === 0) return null;

    if (opts.strategy === 'show') {
        const bestHasDueled = sorted[0].hasDueled;
        const tied = sorted.filter((p) => p.hasDueled === bestHasDueled);
        const idx = Math.floor((opts.rng ?? Math.random)() * tied.length);
        return tied[idx] ?? null;
    } else {
        const bestArea = sorted[0].area;
        const tied = sorted.filter((p) => p.area === bestArea);
        const idx = Math.floor((opts.rng ?? Math.random)() * tied.length);
        return tied[idx] ?? null;
    }
}

/**
 * Return the full ordered list (e.g. for “next N to battle”). Same priority rules.
 * @param {GameState} state
 * @param {Object} [opts]
 * @param {() => number} [opts.rng]
 * @returns {PlayerData[]}
 */
function getOrderedEligible(state, opts = {}) {
    return sortByEligibility(state, opts);
}

export {
    getEligiblePlayers,
    sortByEligibility,
    pickOne,
    getOrderedEligible,
    randomInt,
    shuffle,
};
