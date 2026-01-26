# The Floor — Host Visualization Tool
## Setup (Fixing "Could not load")
Because this project uses modern JavaScript modules, you cannot simply double-click `floor-host.html` to open it. Browsers block this for security reasons (CORS).

To run it, you need a local server.

**Option 1: Using Python (Recommended for most Macs)**
Macs usually come with Python installed.
1. Open Terminal.
2. Navigate to this folder (`cd /path/to/folder`).
3. Run:
   ```bash
   python3 -m http.server 8000
   ```
4. Open `http://localhost:8000/floor-host.html` in your browser.

**Option 2: Using Node.js (If installed)**
If you have Node.js installed:
1. Open Terminal.
2. Run:
   ```bash
   npx serve .
   ```
3. Open the URL shown (usually port 3000).

This project is a **host-controlled HTML visualization tool** inspired by the Fox TV show **_The Floor_**.  
It is designed for **one person (the host)** to manage, visualize, and present the game live (e.g., on a projector or stream).

Contestants **do not interact** with the site.  
All outcomes are **manually controlled by the host**.

---

## Purpose

The tool exists to:
- Visually represent *The Floor* grid
- Track players, categories, and area
- Randomly select contestants
- Run duels with clear, TV-style presentation
- Handle eliminations, category transfers, and takeovers
- Provide undo support for host mistakes

This is **not** an online multiplayer game.

---

## Core Concepts

### The Floor (Grid)
- The game is played on a **2D grid** (“The Floor”).
- Default size: **10 × 10**
- Adjustable by the host.
- Supports **4 to 100 players**.

Each square on the grid represents:
- A **player**
- That player’s **expert category**

---

### Tile Display
Each tile shows:
- **Expert Category** (large, centered)
- **Player Name** (smaller, bottom-aligned)

Optional visual elements:
- A **“+5” badge** next to the category if the player has a time boost.

Display modes (host-toggleable):
- Names only
- Categories only
- Names + categories

---

## Player State

Each player tracks:
- Name
- Expert category
- Number of tiles owned (area)
- Duel count
- Time boost status
- Eliminated status

---

## Battles (Duels)

### Initiating a Battle
1. Host clicks a tile.
2. Host selects **Battle** from the context menu.
3. Host selects an **orthogonally adjacent** tile (no diagonals).

---

### Category Rule (Important)
- The **defending player’s category** is always used.

**Example:**
- You are randomly selected.
- You challenge Ryan.
- Ryan’s category is **Flags**.
- The duel category is **Flags**.

---

### Duel Presentation
When a duel begins, a full-screen overlay appears:
- Large text:  
  **“John vs Nick”**
- Centered below:  
  **Category Name**

This is designed to be easily readable on a big screen.

---

### Duel Results
The host manually selects the winner.

#### Result Logic
- **The loser is immediately eliminated.**
- The loser:
  - Loses **all tiles**
  - Loses their expert category
- The winner:
  - Gains **all of the loser’s tiles**
  - Gains the loser’s category **only if the winner was the defender**
  - Keeps their category if they were the challenger and won

**Summary:**
- Challenge and win → keep your category
- Lose → opponent takes your area *and* your category

---

## Area Takeover Visuals

When a player gains tiles:
- All newly won tiles:
  - Light up at once
  - Fill simultaneously with a **gold liquid animation**
- This emphasizes major momentum swings and eliminations.

---

## Category Swapping (Manual)

The host may manually swap categories between two tiles.

- Player names remain the same.
- Only the **categories** are exchanged.

### Swap Animation
- Rotating double-arrow icon
- Category text:
  - Shrinks and fades
  - Crosses to the other tile
  - Reappears simultaneously

---

## Randomizer System

The randomizer is **host-triggered** and purely visual.

### Eligibility
- Only players **still in the game** (not eliminated).

### Selection Priority
1. Players who have **not dueled yet**
2. Players with the **least area**
3. Random choice if tied

### Visual Style
- Rapid cycling through candidates
- Gradual slowdown
- Clear final selection moment
- Designed to feel like a TV game show reveal

---

## Context Menu Options

Clicking a tile opens a menu with:
- **Battle**
- **Edit Details**
- **Swap Category**
- **Cancel**

### Edit Details
The host may:
- Change player name
- Change category
- Toggle time boost (+5)

---

## Undo System

The tool supports **Undo Last Action**.

Undoable actions include:
- Battles
- Category swaps
- Manual edits

Undo restores:
- Player states
- Tile ownership
- Categories
- Visual state

This exists to protect against host mistakes during live play.

---

## Visual Style

- Graphics and layout should match the style of **`thefloor.html`**
- Clean, high-contrast, screen-share friendly
- Animations should be expressive and readable, not subtle

---

## What This Tool Does NOT Do

Out of scope:
- Question databases
- Timers or scoring logic
- Automatic win determination
- Online multiplayer
- Accounts or persistence

---

## Summary

This tool is a **live hosting companion**:
- The host controls everything
- The audience sees a clear, exciting visualization
- The rules match *The Floor*’s structure
- The system is forgiving (undo) but dramatic (animations)

It is designed to be **reliable, readable, and fun to run live**.
