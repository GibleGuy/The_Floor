# How The Floor Works (User Perspective)

**The Floor** is an identification game inspired by the TV show: players take turns naming what’s shown on screen (images or math problems) before their time runs out.

---

## Core Idea

- **Goal:** Correctly identify each prompt (image or math question) before your timer hits zero.
- **Turns:** In two‑player mode, only one player is “on the floor” at a time. When you get one right, the turn switches to the other player.
- **Categories:** Flags, Pokemon, Hockey, Math. Each game uses one category; prompts come from that set (sometimes shuffled).

---

## Modes

### Classic (Two Players) — Default

- Two players, **left** and **right**, each with a **45‑second** countdown.
- You choose who goes **first** (left or right) before starting.
- **Active player:** The one whose turn it is. Their name and clock are highlighted; only their timer counts down.
- **Correct:** You name it right → ding, next prompt, **turn switches** to the other player. There’s a short pause (~2 seconds) before the next image.
- **Pass:** You skip the prompt → pass sound, **3‑second** wait (your timer **keeps running**), then next prompt. Turn **stays** with you.
- **Lose:** If your timer reaches **0**, you’re out and the other player wins. The round ends, winner/loser are shown, and stats update.

### Single Player

- One player, one timer that **counts up** from 0.
- No turns; you answer every prompt.
- Goal: get through the category (or as many as you can). Completion time is your “score.”

---

## How a Round Plays (Classic)

1. **Setup:** Pick a category, set player names and first player (and options like time boost, etc.).
2. **Start:** Host (or main screen) runs a **3–2–1** countdown with sound, then the first image appears.
3. **Play:**  
   - Type the correct answer and press Enter → **correct** → next image, turn switches.  
   - Or **pass** (Enter with empty input, or `` ` ``) → 3 seconds, timer keeps running, same player gets the next prompt.
4. **End:** Either someone’s timer hits 0 (that player loses, the other wins) or you finish the category (“Category complete”).

---

## Host Mode vs. Playing Yourself

### Normal (No Host)

- **Players** type answers in the text box and use pass themselves.
- **One shared screen:** everyone sees the same prompt and types on the same device.

### Host Mode

- A **host** (e.g. teacher, game master) controls the game; **players** usually don’t type.
- The host sees the same prompts and uses:
  - **J** or **Space** → mark **correct**
  - **L** → **pass**
  - **K** → **pause / resume**
  - **R** → **reset**
- Typical use: project the main display for players; host uses keyboard (or Admin Window) to advance. Useful for classrooms or group play.

---

## Admin Window (When Host Mode Is On)

- **Opens** a separate “control panel” window.
- Main screen hides admin controls, category picker, and help; the **projected view** stays clean.
- In the Admin Window you get:
  - **LOAD** → pick category, preload, show category on main.
  - **START** → 3–2–1, then game begins.
  - Host keys (J/K/L), current/next image and answer, timers, pause, reset, gamemode.
  - Customization: theme, confetti, disable extras, timer decimal, etc.
  - Player names, first player, time boosts, mute, stats.
- **Disable extras** is **on** by default when the Admin Window opens (you can turn it off). When on, it hides streak, score counter, help, fullscreen, etc. on the main display.

---

## Customization (Before or During)

- **Player names** (left/right).
- **First player** (who goes first).
- **Time boost:** +5 seconds per player, once per game (or “undo” before use).
- **Gamemode:** Classic vs. Single player.
- **Theme** (e.g. dark/light), **confetti**, **disable extras**, **show timer decimal** (for player clocks).
- **Mute** for sound effects.

---

## Sounds and Feedback

- **Countdown:** 3–2–1 at game start (and again when **resuming** from pause).
- **Correct:** Ding (cycles through ding1–ding10).
- **Pass:** Pass sound (pass1–pass5).
- **Timer:** Shown next to each player; can show seconds only or with decimals (admin always uses decimals).

---

## Winning and Stats

- **Classic:** First player whose timer hits 0 **loses**; the other **wins**. Ties (both 0) are possible but rare.
- **Stats** track last round, per‑player, per‑slot (left/right), session, and lifetime: correct, passed, wins, accuracy, average time, etc.

---

## Quick Reference

| Action        | Non‑host                    | Host              |
|---------------|-----------------------------|-------------------|
| Correct       | Type answer, Enter          | **J** or **Space**|
| Pass          | Enter (empty) or `` ` ``   | **L**             |
| Pause/Resume  | —                           | **K**             |
| Reset         | —                           | **R**             |
| Fullscreen    | —                           | **F**             |
| Help          | **?**                       | **?**             |

---

## Flow Summary

1. Open the game → see “Welcome to The Floor!”
2. (Optional) Enable **Host Mode**, open **Admin Window** if you’re hosting.
3. Set **gamemode**, **player names**, **first player**, and any **customization**.
4. Choose a **category** (e.g. Flags, Hockey, Math).
5. **LOAD** (if using Admin) or **PLAY** (if not) → category is set / preloaded.
6. **START** → 3–2–1 countdown → first prompt.
7. Play: **correct** (switch turn) or **pass** (stay, 3s, timer runs).
8. Round ends when a timer hits 0 or the category is complete → winner, stats, option to reset or play again.
