/**
 * UndoManager — Undo last action via state snapshots.
 * Supports: battles, category swaps, manual edits.
 * Logic only; no UI.
 */

/**
 * Create an undo manager.
 * @returns {{ push: (state: GameState) => void, undo: (state: GameState) => boolean, canUndo: () => boolean, clear: () => void }}
 */
function createUndoManager() {
    const stack = [];

    return {
        /**
         * Push current state snapshot before an action. Call this *before* applying battle/swap/edit.
         * @param {GameState} state
         */
        push(state) {
            stack.push(state.snapshot());
        },

        /**
         * Undo last action: restore state from most recent snapshot.
         * @param {GameState} state
         * @returns {boolean} true if undo was performed
         */
        undo(state) {
            if (stack.length === 0) return false;
            const snap = stack.pop();
            state.restore(snap);
            return true;
        },

        canUndo() {
            return stack.length > 0;
        },

        clear() {
            stack.length = 0;
        },
    };
}

export { createUndoManager };
