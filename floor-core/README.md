# floor-core

Core game state and rules for a host-controlled Floor-style grid game. **Logic only** — no UI, HTML, or animations.

## Modules

| Module | Role |
|--------|------|
| **GameState** | Grid (default 10×10, adjustable), players (4–100), tile ownership, snapshots for undo |
| **Player** | Name, expert category, area, duel count, time boost, eliminated |
| **Tile** | Position, owner, category (used when defending) |
| **BattleEngine** | Validate orthogonal-adjacent battles; apply result (host declares winner) |
| **Randomizer** | Eligible players (non-eliminated); priority: zero duels → lowest area → random |
| **UndoManager** | Push snapshot before action; undo restores last snapshot |

## Rules (summary)

- **Grid:** Default 10×10, adjustable. Each tile has one owner and one category.
- **Battles:** Only between orthogonally adjacent tiles. Defender’s category is used. Host declares winner.
- **Result:** Loser eliminated, loses all tiles and category. Winner gains all tiles; gains loser’s category only if winner was **defender**, else keeps own.
- **Category swap:** Host may swap categories between any two tiles; owners unchanged.
- **Randomizer:** Among non-eliminated: (1) zero duels, (2) lowest area, (3) random tie-breaker.
- **Undo:** Battles, category swaps, manual edits. Use `UndoManager.push(state)` before action, then `undo(state)` to revert.

## Usage (ES modules)

```js
import {
    createGameState,
    createUndoManager,
    applyBattleResult,
    validateBattle,
    getBattleCategory,
    pickOne,
    getOrderedEligible,
} from './floor-core/index.js';

const state = createGameState({
    rows: 10,
    cols: 10,
    players: [
        { name: 'A', expertCategory: 'Flags' },
        { name: 'B', expertCategory: 'Hockey' },
        // ... 4–100 players
    ],
});
state.distributeTilesRoundRobin();

const undo = createUndoManager();
undo.push(state);
applyBattleResult(state, 0, 0, 0, 1, false); // defender wins
// undo.undo(state) to revert

const next = pickOne(state);
```

## Initial distribution

- `createGameState` builds an empty grid and optional players. Tiles have no owner until assigned.
- Call `state.distributeTilesRoundRobin()` after adding players to assign each tile to a player (round-robin) with that player’s `expertCategory`. Alternatively, assign manually via `setTileOwner` / `setTileCategory`.
