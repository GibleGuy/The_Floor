# Pull Request: Fix sounds, structure (CSS split, lazy-load), reset & UX

Branch: **fix-sounds-structure-reset-ux**

---

## Summary

- **Structure:** Split CSS into `css/base.css`, `game.css`, `customization.css`, `backgrounds.css`; remove `thefloor.css`. Lazy-load category scripts (flags, pokemon, hockey, math) only when a category is chosen.
- **Fixes:** Ding/pass sounds use `new Audio()` per play; category data exposed on `window` so images and admin load work after lazy-load. Hide "Type or select category" during gameplay; fix reset (timer colors, welcome only); show answer reveal on main when admin window is open.

---

## Structure & lazy-load

### CSS split
- **css/base.css** — `:root` vars, `body`, `body.game-ended`
- **css/game.css** — timers, image area, input, pause, menu, admin board, stats, help
- **css/customization.css** — customization table, tabs, themes, help/fullscreen, keyboard hints, high-contrast
- **css/backgrounds.css** — blue variants, grid/tiles/diagonal/pop
- **thefloor.html** — links all four; **thefloor.css** removed

### Lazy-load categories
- Category scripts (**flags.js**, **pokemon.js**, **hockey.js**, **math.js**) no longer loaded in `<head>`.
- When user selects a category and clicks PLAY (or LOAD on admin), we inject `<script src="categories/...">`, await load, then run `setupGame`.
- Each category file ends with `if (typeof window !== 'undefined') window.flagData = flagData;` (etc.) so `getCategoryData` can read from `window` after load.
- **Gallery** still loads all category scripts up front (separate page).

### Docs
- **STRUCTURE.md** — “Where does X live?” map (JS sections, CSS files, admin, gallery, categories, sounds).
- **OPTIMIZATION.md** — quick wins, lazy-load, CSS split, deferred JS split.

---

## Fixes

### Sounds (ding / pass)
- **Issue:** Ding and pass sounds stopped working after lazy-load / structure changes; countdown still worked.
- **Change:** `playDingSound` / `playPassSound` now use `new Audio('sounds/ding' + (dingIndex + 1) + '.mp3')` (and pass equivalent) per play instead of `cloneNode()` on preloaded `Audio` elements. Same sequential index/loop logic; more reliable playback.

### Images & admin load
- **Issue:** Images didn’t load; admin couldn’t load categories.
- **Cause:** Category files use `const flagData = [...]` etc. Top-level `const` doesn’t add to `window`, so `getCategoryData` was reading `window.flagData` → `undefined` → empty pool.
- **Change:** Each category file sets `window.flagData = flagData` (etc.) at the end. After lazy-load, `getCategoryData` works, pool is built, images load, admin LOAD works.

### “Type or select category” during gameplay
- **Change:** Add `updateMenuVisibility()`. Hide `.menu` (category selector + PLAY) when `adminWindowOpen || gameActive`; show when both false.
- **Call sites:** open/close admin window, setupGame (normal start), startGameFromHost, endGame, handleCategoryComplete, resetGame.
- **Result:** Category selector hidden during play, shown when no game (including after reset).

### Reset (timer colors, welcome, no “Category complete”)
- **Change:** In `resetGame`: clear clock inline styles; set `p1Display.className = 'clock'` and `p2Display.className = 'clock'` to clear winner/loser styling; remove both `correct-border` and `pass-border` from `img-frame`; keep welcome message only, hide category-display.
- **Result:** Reset shows “Welcome to The Floor!”; no red/green timer persistence, no “Category complete”.

### Answer reveal when admin window open
- **Issue:** Main screen didn’t show correct answer on correct/pass when admin window was open.
- **Cause:** CSS hid both `#answer-input` and `.answer-reveal` when `body.admin-window-open`.
- **Change:** Only hide `#answer-input` when admin open; `.answer-reveal` (#reveal-text) stays visible.
- **Result:** Main screen still shows correct/pass answers; only the type-in box is hidden.

---

## Files changed

| File | Change |
|------|--------|
| **thefloor.html** | Use `css/base.css`, `game.css`, `customization.css`, `backgrounds.css`; remove category script tags |
| **thefloor.js** | Lazy-load helpers (`loadCategoryScript`, `getCategoryData`); ding/pass `new Audio()`; `updateMenuVisibility`, reset fixes |
| **thefloor.css** | **Deleted** (replaced by `css/*`) |
| **css/base.css** | New — base vars, body |
| **css/game.css** | New — game UI |
| **css/customization.css** | New — customization, themes, hints; admin-open rule only hides `#answer-input` |
| **css/backgrounds.css** | New — blue variants, backgrounds |
| **categories/flags.js** | `window.flagData = flagData` at end |
| **categories/pokemon.js** | `window.pokemonData = pokemonData` at end |
| **categories/hockey.js** | `window.hockeyData = hockeyData` at end |
| **categories/math.js** | `window.mathData = mathData` at end |
| **OPTIMIZATION.md** | New — optimizations, structure, lazy-load |
| **STRUCTURE.md** | New — “Where does X live?” |

---

## How to test

1. **Lazy-load + images:** Choose a category (e.g. Flags), click PLAY. Confirm images load and game runs.
2. **Sounds:** Get a few correct (ding) and pass (pass). Confirm sounds play.
3. **Admin:** Open admin window, select category, LOAD → START. Confirm category loads, game runs, main shows images.
4. **Menu during play:** Start a game; confirm “Type or select category” + PLAY are hidden. Reset or end game; confirm they reappear.
5. **Reset:** Play then reset. Confirm “Welcome to The Floor!”, no red/green timers, no “Category complete”.
6. **Answer reveal + admin:** Open admin, start a game. Correct/pass from main or admin; confirm main screen shows the answer below the image.
