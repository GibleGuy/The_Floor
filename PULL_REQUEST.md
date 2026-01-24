# Pull Request: Admin Window, UX Improvements & Gameplay Fixes

**Branch:** `add-sounds-refactor` → `main`

---

## Summary

This PR adds an Admin Window pop-out for hosts, improves several UX and display options, and fixes gameplay behavior (first player, pass-phase timer, unpause countdown, etc.).

---

## Changes

### Admin Window
- **New `admin.html`**: Pop-out window for hosts with:
  - Host controls (J Correct, K Pause, L Pass) and keyboard shortcuts
  - **LOAD** / **START** flow: select category → LOAD (preload, show category on main) → START (3–2–1 countdown, begin game)
  - Current image/answer and next image/answer
  - P1/P2 timers and **Game** timer (local 3s/2s countdown)
  - Full admin controls (Pause, Reset, Gamemode)
  - Customization: Theme, Confetti, Disable Extras, Show Timer Decimal
  - Statistics: Last Round and Session stats
  - Player names, First Player, Time Boosts, Mute
- When Admin Window is open: main page hides admin board, category selector, and help button; host mode is auto-enabled; Gallery button appears.
- When Admin Window is closed: those elements return to the main page.
- Cross-window sync via `postMessage`; admin always shows decimals on timers.

### Disable Extras
- Disable Extras now also hides **STREAK** (top right) and the **score counter** (answered/passed).
- **Disable Extras is turned ON by default when the Admin Window is opened** (can still be turned off).
- Toggle available on main (Customize) and in Admin Window; state synced.

### Gameplay & Timers
- **Pass phase:** The active player’s timer **continues counting down** during the 3‑second pass delay (no longer paused).
- **Admin Game timer:** Uses a **local** 3s or 2s countdown instead of syncing with main (smoother, no stagger).
- **Player timers:** Default is **seconds only** (no decimal). New **“Show Timer Decimal (Player Screen)”** toggle in Customize; Admin timers always show decimal.

### Unpause
- **Unpause countdown:** Before resuming, a **3–2–1 countdown** with **countdown.mp3** plays (same overlay as game start).
- Sound uses clone-and-play for reliable playback when unpausing.

### First Player & Active Player
- **First Player** selection is **applied when START is pressed** (not only at LOAD), so the choice before START is used.
- The correct player is **highlighted** (name + clock) when the game begins.
- **First Player** and **Active Player** options now use **player names** instead of “Left”/“Right” or “Player 1”/“Player 2” (on both main and Admin).

### Defaults & Misc
- **Default gamemode** is now **Classic** (was Singleplayer) on main and Admin.
- **Admin player name inputs:** No longer overwritten while focused; you can edit/delete without instant reset. Values sync on blur (change).

### Testing
- **`testing folder/`**: Simple `postMessage` demo (`test-game.html` + `popout.html`) used to validate cross-window communication patterns for the Admin Window.

### Other
- **`thefloor.css`**: Styles for Disable Extras (streak/score hidden), overlay, pause UI, etc.
- **`thefloor.html`**: Customize toggles (Disable Extras, Show Timer Decimal), gamemode default, First Player labels.
- **`thefloor.js`**: All of the above logic (admin window, state sync, countdowns, first player, timers, etc.).

---

## How to Test

1. Open `thefloor.html`, enable Host Mode, open **Admin Window**.
2. Confirm Disable Extras is ON and STREAK/score are hidden; toggle off/on as desired.
3. Select a category, **LOAD**, then **START**; confirm 3–2–1 countdown and that the chosen First Player is highlighted.
4. During game: Pass (L) and confirm active timer keeps counting; unpause and confirm 3–2–1 + countdown sound.
5. Edit player names in Admin; confirm they don’t reset while typing and update on blur.
6. Check Admin Game timer countdown (3s/2s) and player timers (default no decimal; toggle decimal in Customize).

---

## Checklist

- [x] Admin Window opens, syncs state, and closes cleanly.
- [x] LOAD → START flow works; first player and highlighting correct.
- [x] Disable Extras hides STREAK + score; default ON when Admin opens.
- [x] Pass-phase timer counts down; unpause countdown + sound.
- [x] Admin Game timer local; player timer decimal toggle.
- [x] First Player / Active Player use names; default gamemode Classic.
- [x] Admin player names editable without reset while focused.
