# Optimizations & Structure

Quick wins are done. Structure changes (split CSS, lazy-load, docs) are in place. JS split is deferred.

---

## Done (Quick Wins)

### 1. Admin sync throttle
- **Before:** `postStateToAdmin` every **150 ms** when admin window open.
- **After:** **250 ms**. Fewer `postMessage` calls, less work when admin is open.
- **Where:** `thefloor.js` → `adminInterval` in `openAdminWindow()`.

### 2. Pop layer size
- **Before:** **300** cells (20×15 grid).
- **After:** **150** cells (15×10). Fewer DOM nodes and animations.
- **Where:** `thefloor.js` → `createPopLayer()`; `css/backgrounds.css` → `#bg-pop-layer` grid.

### 3. Section headers (JS & CSS)
- **JS:** `// ========== SECTION ==========` for Categories & state, Sounds, Game flow, Admin, Customization, Init.
- **CSS:** `/* ========== SECTION ========== */` in each `css/*.css` file.

Use these to jump to the right place when editing or when asking an AI to work on a specific part.

---

## Done (Structure)

### 4. Split CSS
- **base.css** — `:root`, body, game-ended.
- **game.css** — timers, image area, input, pause, menu, admin board, stats, help.
- **customization.css** — customization table, tabs, panels, themes, help/fullscreen buttons, confetti, keyboard hints, high-contrast.
- **backgrounds.css** — blue variants, grid/tiles/diagonal/pop.
- **HTML:** `thefloor.html` links all four in that order. Single `thefloor.css` removed.

### 5. Lazy-load category scripts
- **Before:** All four category scripts (`flags.js`, `pokemon.js`, `hockey.js`, `math.js`) loaded in `<head>`.
- **After:** None loaded up front. When user selects a category and clicks PLAY (or LOAD on admin), we inject `<script src="categories/…">`, wait for `onload`, then read the global (`flagData`, etc.) and run `setupGame`.
- **Where:** `thefloor.js` → `CATEGORY_SCRIPTS`, `CATEGORY_GLOBALS`, `loadCategoryScript`, `getCategoryData`; `setupGame` awaits `getCategoryData(cat)` before building the pool.
- **Gallery:** Still loads all category scripts up front (separate page).

### 6. “Where does X live?” docs
- **STRUCTURE.md** — short map of where timers, admin sync, prefs, sounds, game flow, CSS, etc. live. Use it to navigate.

---

## Deferred

### Split JS (ES modules)
- **Planned:** `game.js`, `ui.js`, `admin-sync.js`, `prefs.js`, `sounds.js`, `main.js` with `type="module"` and `import`/`export`.
- **Status:** Deferred. Current `thefloor.js` is one file; splitting would require a shared state module and many call-site updates. Section headers already make it easier to navigate. Revisit when you want a deeper refactor.

---

## Optional follow-ups (performance)

| Change | Effect | Effort |
|--------|--------|--------|
| **Game loop 100 ms → 200 ms** | Fewer timer ticks and DOM updates. Slight loss of smoothness. | Low |
| **Throttle `updateDisplay`** | Skip when values unchanged, or batch with `requestAnimationFrame`. | Medium |
| **Simplify Pop further** | e.g. 100 cells. | Low |

---

## File layout (current)

| File | Role |
|------|------|
| **thefloor.html** | Main game UI; links `css/base.css`, `css/game.css`, `css/customization.css`, `css/backgrounds.css`, `thefloor.js`. |
| **thefloor.js** | All game logic, state, sounds, prefs, admin sync. Section headers for navigation. |
| **css/base.css** | Vars, body. |
| **css/game.css** | Game UI, admin board, stats, help. |
| **css/customization.css** | Customization, themes, high-contrast. |
| **css/backgrounds.css** | Blue variants, grid/tiles/diagonal/pop. |
| **admin.html** | Admin window; own inline script. |
| **gallery.html** | Gallery; loads all category scripts. |
| **STRUCTURE.md** | “Where does X live?” map. |

---

## Summary

- **Done:** Admin 250 ms, Pop 150 cells, section headers, **split CSS**, **lazy-load categories**, **STRUCTURE.md**.
- **Deferred:** JS ES modules split.
- **Avoid:** Faster game loop, removing section headers, heavy build tooling.

Use **STRUCTURE.md** and the `==========` markers to find things quickly.
