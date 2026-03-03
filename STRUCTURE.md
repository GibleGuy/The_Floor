# Where does X live?

Quick reference for navigating the codebase.

---

## Duel Game (`duel/`)

The standalone duel/quiz game — players identify images from a chosen category under a timer.

### HTML
- **game.html** — Main game UI: timers, image area, category selector, admin board, customization modal, stats menu, help overlay.
- **admin.html** — Detachable admin control panel. Communicates with game via `postMessage`.
- **gallery.html** — Browse all items across every category. Loads all category scripts up front.

### JavaScript (`duel/game.js` — ~2100 lines)

Use **`// ========== SECTION ==========`** to jump to a block:

| What | Section |
|------|---------|
| Category keys, lazy-load helpers, `loadCategoryScript` / `getCategoryData` | **CATEGORIES & STATE** |
| Game state (timers, pool, activePlayer, hostMode, prefs, etc.) | **CATEGORIES & STATE** |
| Ding/pass sounds, preload | **SOUNDS** |
| Preferences (load/save/apply), `PREFS_KEY` | Near **SOUNDS**; `loadPreferences`, `savePreferences`, `applyPreferencesToDOM` |
| `setupGame`, `startGameFromHost`, `gameLoop`, `handleCorrect`, `handlePass`, `endGame`, `loadImage` | **GAME FLOW** |
| `resolveCategoryKey`, `startSelectedCategory` | **GAME FLOW** |
| `postStateToAdmin`, `openAdminWindow`, `closeAdminWindow` | **ADMIN WINDOW & POST-MESSAGE** |
| `switchCustomizationTab`, `setBackgroundStyle`, `setBackgroundDriftSpeed`, `setBlueVariant`, etc. | **CUSTOMIZATION & TABS** |

---

## Floor Host (`host/`)

The main grid-based "Floor" game — players own tiles, battle neighbors, and the last one standing wins.

| File | Purpose |
|------|---------|
| **floor-host.html** | Grid layout, duel overlay, edit/kill modals, settings panel |
| **floor-host.js** (~1700 lines) | Grid rendering, tile interaction, context menus, duel flow, swap animations, CSV import/export, randomizer |
| **floor-host.css** | All Floor Host styling including grid, overlays, modals, animations |

Imports from `floor-core/` for game logic.

---

## Floor Core (`floor-core/`)

Pure logic layer — no UI, HTML, or animations. Used by `host/`.

| File | Exports |
|------|---------|
| **index.js** | Barrel file re-exporting all modules |
| **GameState.js** | `createGameState`, grid dimensions, player management |
| **Player.js** | `createPlayer`, `clonePlayer`, `resetPlayerIds` |
| **Tile.js** | `createTile`, `cloneTile` |
| **BattleEngine.js** | `validateBattle`, `applyBattleResult`, `getBattleCategory`, `absorbGreySquares` |
| **Randomizer.js** | `getEligiblePlayers`, `sortByEligibility`, `pickOne`, `shuffle` |
| **UndoManager.js** | `createUndoManager` — push/pop state snapshots |

---

## Categories (`categories/`)

Each category is a standalone JS file exporting a data array to `window.<name>Data`.

- **index.js** — Central registry. Single source of truth for all categories.
- **CATEGORY_CREATION_GUIDE.md** — AI reference for creating new categories.
- **\<category\>.js** — Data file with 50–60 items ordered easiest → hardest.

Currently registered categories: Flags, Pokemon, Hockey, Math, Dogs, Advertisement, Best Picture, Golf, Girl Groups, Historic Events, Instruments, Gameshows, Taylor Swift, Logos, Food, Anime, Minecraft, Dolls, Nintendo, Retro Video Games, College Logos, Sports Logos.

The duel game **lazy-loads** category scripts on demand. The gallery loads them all at once.

---

## CSS (`css/`)

Shared styles used by `duel/game.html`. Load order: **base → game → customization → backgrounds**.

| File | Contents |
|------|----------|
| **base.css** | `:root` vars, `body`, `body.game-ended` |
| **game.css** | Timers, image area, pause overlay, input, menu, category selector, play button, admin board, stats, help |
| **customization.css** | Customization modal, tabs, panels, switch, timer warnings, stats menu, streak/score, help overlay, themes, confetti, keyboard hints, high-contrast |
| **backgrounds.css** | Blue variants, grid/tiles/diagonal/pop backgrounds, pop layer |

---

## Images (`images/`)

One subdirectory per category (e.g., `images/hockey/`, `images/logos/`). Image paths referenced in category JS files as `../images/<category>/<filename>.webp`.

---

## Sounds (`sounds/`)

| File(s) | Purpose |
|---------|---------|
| **DUEL MUSIC.wav** | Background music during duels |
| **DUEL OVER.wav** | Duel end sound |
| **RIGHT.wav** | Correct answer |
| **countdown.mp3** | Start/unpause countdown |
| **ding1–ding10.mp3** | Correct answer dings (played in sequence) |
| **pass1–pass5.mp3** | Pass sounds (played in sequence) |
| **randomizer.mp3** | Randomizer wheel sound |

---

## Tools (`tools/`)

| File | Purpose |
|------|---------|
| **image-server.py** | Local dev server for serving files + image download API |
| **image-picker.html** | Browser UI for finding and saving category images |

Run with: `python3 tools/image-server.py` → open `http://localhost:8642`
