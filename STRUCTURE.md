# Where does X live?

Quick reference for navigating the codebase.

---

## Main game (`thefloor.html` + `thefloor.js`)

### HTML
- **Layout:** `thefloor.html` — timers, image area, category selector, admin board, customization modal, stats menu, help overlay.
- **Styles:** Four CSS files (see below). No inline styles for layout.

### JavaScript (`thefloor.js`)

Use **`// ========== SECTION ==========`** to jump to a block. Sections:

| What | Section |
|------|---------|
| Category keys, lazy-load helpers, `loadCategoryScript` / `getCategoryData` | **CATEGORIES & STATE** |
| Game state (timers, pool, activePlayer, hostMode, prefs, etc.) | **CATEGORIES & STATE** (same block) |
| Ding/pass sounds, preload | **SOUNDS** |
| Preferences (load/save/apply), `PREFS_KEY` | Near **SOUNDS**; `loadPreferences`, `savePreferences`, `applyPreferencesToDOM` |
| `setupGame`, `startGameFromHost`, `gameLoop`, `handleCorrect`, `handlePass`, `endGame`, `loadImage` | **GAME FLOW** |
| `resolveCategoryKey`, `startSelectedCategory` | **GAME FLOW** (same block) |
| `postStateToAdmin`, `openAdminWindow`, `closeAdminWindow` | **ADMIN WINDOW & POST-MESSAGE** |
| `window.addEventListener('message')` (admin sync) | **ADMIN WINDOW & POST-MESSAGE** |
| `switchCustomizationTab`, `setBackgroundStyle`, `setBackgroundDriftSpeed`, `setBlueVariant`, etc. | **CUSTOMIZATION & TABS** |
| `initPage`, `createPopLayer` | **INIT** |

### CSS (`css/`)

| File | Contents |
|------|----------|
| **css/base.css** | `:root` vars, `body`, `body.game-ended` |
| **css/game.css** | Timers, image area, pause overlay, input, menu, category selector, play button, admin board, stats, help, etc. |
| **css/customization.css** | Customization table, tabs, panels, switch, timer warnings, stats menu, streak/score, help overlay, themes (light/gible), help/fullscreen buttons, confetti, keyboard hints, high-contrast |
| **css/backgrounds.css** | Blue variants, grid/tiles/diagonal/pop backgrounds, pop layer |

Load order in HTML: **base → game → customization → backgrounds**.

---

## Admin (`admin.html`)

- **UI:** Inline in `admin.html` (header, category, LOAD/START, host controls, customization, stats).
- **Logic:** Single `<script>` block in `admin.html`. Communicates with main via `postMessage`; no shared JS files.

---

## Gallery (`gallery.html`)

- **UI + logic:** All in `gallery.html`. Loads **all** category scripts up front (`categories/flags.js`, etc.). No lazy-load.

---

## Categories (`categories/*.js`)

- **flags.js** → global `flagData`
- **pokemon.js** → global `pokemonData`
- **hockey.js** → global `hockeyData`
- **math.js** → global `mathData`

Main game **lazy-loads** these when a category is chosen (PLAY or LOAD). Gallery loads them all at once.

---

## Sounds (`sounds/`)

- **countdown.mp3** — start/unpause countdown.
- **ding1–ding10.mp3** — correct.
- **pass1–pass5.mp3** — pass.

Playback lives in **SOUNDS** in `thefloor.js`; uses `cloneNode()` for reliable reuse.

---

## Summary

- **Game logic & state:** `thefloor.js` (use section headers).
- **Styles:** `css/base.css`, `css/game.css`, `css/customization.css`, `css/backgrounds.css`.
- **Categories:** `categories/*.js`; main game loads on demand, gallery loads all.
- **Admin:** `admin.html` only; talks to main via `postMessage`.
