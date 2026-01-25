# Pull Request: Backgrounds, Customization Tabs, Preferences & UX Polish

All work since the previous PR (Admin window, UX improvements, gameplay fixes).

---

## Summary

- **Backgrounds:** Geometric patterns (Grid, Tiles, Diagonal, Pop), drift speed slider, blue variants, diagonal static.
- **Customization:** Gameplay vs Graphics tabs, persisted preferences, keyboard hints, high-contrast / reduced-motion.
- **UX:** Customization glow fixes, default Pop + Blue B, game explanation doc.

---

## Backgrounds & Patterns

### Geometric background styles
- **Solid** — flat color (unchanged).
- **Grid** — horizontal/vertical grid lines, slow drift **down-and-left**.
- **Tiles** — diamond tile pattern, drift down-and-left; positions use **positive-only** values to avoid glitchy animation at different speeds.
- **Diagonal** — continuous **stripes** (no triangles), `repeating-linear-gradient`; **static** (no animation) to avoid tiling issues.
- **Pop** — grid of squares that scale/opacity animate in and out; **random** per-cell `animation-delay` and `animation-duration`, plus **negative** delays so all cells are moving immediately on load.

### Drift speed
- **Slider** (0.25×–2×) in Customization (main + admin). Persisted.
- Effective speed doubled: **1×** matches previous **2×**; formula uses `(var(--bg-drift-speed) * 2)` in duration calc.
- Affects Grid and Tiles only (Diagonal is static).

### Blue variants
- **Blue Style** A/B/C/D in Customization. **B** is default for new users.
- Body classes `blue-a`–`blue-d` override `--floor-blue` (navy → vibrant).

### Defaults
- **Background:** Pop (new users).
- **Blue:** B (new users). Returning users keep saved preferences.

---

## Customization

### Tabs
- **Gameplay** — player names, first player, time boosts, View Statistics, Mute.
- **Graphics** — theme, confetti, disable extras, show timer decimal, high contrast & reduced motion, background style, drift speed, blue style.
- Tabs + panels on **main** and **admin**; tab switch updates visible panel.

### Glow fixes
- **Yellow border** restored on the customization box (3px, theme-aware).
- **Inner glow** removed: `.custom-tab.active` and `.custom-tab-panel.active` both use class `active` (shared with clock). Generic `.active` added `box-shadow: 0 0 30px rgba(255,204,0,0.5)`, which created a glow inside the options area.
  - **Fix:** `box-shadow: none` and `border: none` on `.custom-tab` and `.custom-tab-panel` (and `.active`), plus `color: inherit` on `.custom-tab-panel.active`, so the options area has no yellow glow. Outer box-shadow on the whole customization box unchanged.

---

## Preferences & persistence

- **localStorage** key `floorPreferences` stores: theme, mute, show timer decimal, disable extras, confetti, gamemode, player names, first player, background style, drift speed, blue variant, high contrast & reduced motion.
- **Load** on init; **save** on change. Admin updates (theme, confetti, etc.) sync to main and persist.

---

## Accessibility & UX

### High contrast & reduced motion
- Toggle in Customization (Gameplay tab → **Graphics** in new layout: it’s under Graphics). Persisted.
- **High contrast:** stronger borders, clearer UI.
- **Reduced motion:** disables background drift, pop-cell animation, confetti, timer pulse, etc.

### Keyboard shortcut hints
- **Main:** subtle hint bar (J/K/L/R/F/?) when host mode on and admin window closed; hidden when “Disable extras” is on.
- **Admin:** hint bar at bottom. Both remind users of host shortcuts.

---

## Other

- **HOW_THE_GAME_WORKS.md** — user-facing explanation of modes, flow, and controls.
- **Admin customization** — same Gameplay/Graphics tabs, drift speed, blue style; synced with main.
- **Removed** `update-hockey-extensions.js` (unused).
- **Removed** previous `PULL_REQUEST.md` (replaced by this writeup).

---

## Files changed

| File | Changes |
|------|---------|
| `thefloor.html` | Gameplay/Graphics tabs, Pop layer, default checked states (Pop, Blue B), drift speed + blue variant UI. |
| `thefloor.css` | Blue variants, grid/tiles/diagonal/pop styles, drift keyframes, speed formula, tabs, customization border/glow fixes, high-contrast/reduced-motion overrides. |
| `thefloor.js` | `BG_STYLES`, drift speed, blue variant, pop randomness, tabs, preferences load/save, `switchCustomizationTab`, `setBackgroundDriftSpeed`, `setBlueVariant`, `createPopLayer`, admin message handlers. |
| `admin.html` | Gameplay/Graphics tabs, drift speed + blue style controls, tab switch logic, Pop option. |
| `HOW_THE_GAME_WORKS.md` | New; user guide. |
| `PULL_REQUEST.md` | New PR writeup (this file). |
| `update-hockey-extensions.js` | Removed. |

---

## How to test

1. **Backgrounds:** Customize → Graphics → try Solid, Grid, Tiles, Diagonal, Pop. Use drift speed slider with Grid/Tiles.
2. **Blue style:** Switch A/B/C/D; confirm default B for new users (clear `floorPreferences` if needed).
3. **Tabs:** Open Customize → switch Gameplay / Graphics; confirm options and persistence.
4. **Glow:** Open Customize → confirm yellow border on box, no yellow glow inside the options area.
5. **Preferences:** Change theme, mute, etc. → refresh → confirm settings restored.
6. **Admin:** Open Admin Window → use tabs, drift speed, blue style; confirm sync with main and persistence.
