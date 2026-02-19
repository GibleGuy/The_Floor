# Category Creation Guide — AI Reference

> This document is a reference for the AI assistant when creating new categories for **The Floor**. It defines the methodology, constraints, and quality standards that must be followed.

---

## 1. Overview

A **category** in The Floor is a collection of visual items (typically images) that players must identify during duels. Each category is stored as a JavaScript file in `/categories/` and registered in `index.js`. The game draws items from the list during gameplay, so every entry must be unambiguous, visually recognizable, and appropriately sourced.

---

## 2. Category Composition

| Component       | Count | Purpose |
|-----------------|-------|---------|
| **Primary items** | 50    | The main pool used in gameplay |
| **Backup items**  | 10    | Substitutes if a primary item's image is broken, ambiguous, or otherwise unusable |
| **Total entries**  | 60    | All included in the active array; backups are at the end with a comment separator |

---

## 3. Item Selection Criteria

### 3.1 Visual Representability

Every item **must be something that can be clearly represented by a single photograph or image**. If you can't take a photo of it or find a clear standalone image of it, it does not belong in the list.

| ✅ Visually representable | ❌ NOT visually representable |
|---|---|
| Hockey stick, goalie mask, Zamboni | Overtime, penalty, offside |
| A specific player in uniform | "Teamwork" or "strategy" |
| Stanley Cup trophy | A rule or regulation |

> [!CAUTION]
> Abstract concepts, rules, actions, and anything that requires text overlay to identify are **not valid items**. Every item must be identifiable from its image alone.

### 3.2 Relevance

Every item **must relate directly and obviously** to the category name. A casual observer should be able to look at the image and plausibly connect it to the category without specialized knowledge.

| ✅ Good (Category: Hockey) | ❌ Bad (Category: Hockey) |
|---|---|
| Hockey stick, puck, goalie mask | A generic winter landscape |
| Wayne Gretzky in uniform | A photo of Wayne Gretzky at a restaurant |
| NHL team logo | A city skyline where an NHL team plays |

### 3.3 Item Variety

Draw from **multiple sub-types** within the category to keep the list diverse and interesting. For a sports category, this might include:

- **Equipment/objects** — core physical items (stick, puck, helmet)
- **Iconic figures/people** — well-known players, coaches, referees
- **Logos/branding** — team logos, league logos
- **Venues/scenes** — rinks, arenas, scoreboards
- **Accessories/gear** — gloves, tape, bags
- **Conceptual items** — trophies, awards, specific plays

**Interleaving rule**: Avoid placing more than 2 items of the same sub-type consecutively. Alternate sub-types to keep the list visually varied.

### 3.4 Specificity in Naming

- Names must be **ALL CAPS** (e.g., `"HOCKEY STICK"`, not `"Hockey Stick"`)
- Names should be concise but unambiguous
- For people: use the commonly known name (e.g., `"WAYNE GRETZKY"`, not `"Wayne Douglas Gretzky"`)
- For logos: include the team/brand name (e.g., `"MONTREAL CANADIENS"`, not `"LOGO"`)
- Avoid abbreviations unless universally recognized (e.g., `"NHL"` is fine, `"MTL"` is not)

---

## 4. Difficulty Ordering

Items **must be ordered from easiest to hardest** (index 0 = easiest, index 49 = hardest). Difficulty is determined by how likely a **general adult audience** would recognize the item from its image alone.

### Difficulty Tiers

| Tier | Position | Description | Examples (Hockey) |
|------|----------|-------------|-------------------|
| **Tier 1 — Obvious** | Items 1–15 | Universally recognizable; almost anyone could identify | Hockey stick, puck, helmet, skates, Stanley Cup |
| **Tier 2 — Familiar** | Items 16–30 | Known to most people with casual exposure to the topic | Zamboni, specific famous team logos, Wayne Gretzky |
| **Tier 3 — Knowledgeable** | Items 31–40 | Requires moderate familiarity with the category | Blocker, catching glove, less famous team logos |
| **Tier 4 — Expert** | Items 41–50 | Niche or specialized; only enthusiasts would know | Specific goalie stick types, lesser-known players, stick tape |
| **Backups** | Items 51–60 | Same quality as Tier 2–3; replacements for broken items | Labeled with `// BACKUP` comment |

### Ordering Heuristics

1. **Generic objects first** — a photo of "a hockey stick" is easier than "Sidney Crosby"
2. **Famous before obscure** — Wayne Gretzky before Bobby Orr; Pikachu before Farfetch'd
3. **Standalone items before context-dependent** — a puck by itself is easier than a blocker (which requires hockey knowledge)
4. **Whole items before parts** — "skates" before "skate blade"

---

## 5. Image Requirements

> [!IMPORTANT]
> The **user** is responsible for sourcing and providing all images. The AI should **not** generate images or look for image URLs unless the user explicitly asks.

### 5.1 Image Quality Standards (for the user's reference)

- Image should **clearly depict the item** — not a collage, not a diagram, not a screenshot of a search result
- **Clean background preferred** (solid color or simple) — especially for objects and logos
- For people: a **recognizable portrait or action shot** in context (e.g., a player in uniform)
- Minimum resolution: at least 400×400 pixels (the game scales images)
- Accepted formats: `.jpg`, `.jpeg`, `.png`, `.webp`
- Store images locally in `images/<category-key>/`

---

## 6. File Format & Registration

### 6.1 Category Data File

File location: `/categories/<category-key>.js`

```javascript
const <category>Data = [
    // Tier 1 — Obvious (items 1–15)
    { n: "ITEM NAME", u: "../images/<category>/filename.ext" },
    // ...

    // Tier 2 — Familiar (items 16–30)
    // ...

    // Tier 3 — Knowledgeable (items 31–40)
    // ...

    // Tier 4 — Expert (items 41–50)
    // ...

    // ── BACKUPS (items 51–60) ────────────────
    { n: "BACKUP ITEM", u: "../images/<category>/backup-filename.ext" },
    // ...
];
if (typeof window !== 'undefined') window.<category>Data = <category>Data;
```

**Data shape per item:**
| Property | Type | Description |
|----------|------|-------------|
| `n` | `string` | Display name, ALL CAPS |
| `u` | `string` | Image URL (local relative path or remote URL) |
| `q` | `string` | *(Optional)* Question text, used only for non-image categories like Math |

### 6.2 Registry Entry

Add to `categories/index.js`:
```javascript
{ key: '<category-key>', label: '<Display Name>', script: '<category-key>.js', global: '<category>Data' }
```

### 6.3 Local Image Folder

If using local images, create the folder: `images/<category-key>/`

---

## 7. Special Category Types

### 7.1 Non-Image Categories (e.g., Math)

Some categories don't display images — they display text questions instead. These use:
- A transparent 1×1 pixel as the `u` value
- A `q` property for the question text
- The answer goes in the `n` property

This is an exception to the standard format. Most categories should be image-based.

---

## 8. AI Workflow — Step by Step

When the user requests a new category, follow this procedure:

1. **Acknowledge the category** — confirm understanding of the topic scope and any guidelines the user provides
2. **Draft the 60-item list** (50 primary + 10 backup), ordered easiest → hardest
3. **Present the list to the user for review** — the user will provide feedback and source the images
4. **Write the `.js` file** once the user approves the list and provides images
5. **Register** the category in `index.js`
6. **Verify** by confirming the category loads in the gallery without errors

---

## 9. Quality Checklist

Before delivering a new category, confirm:

- [ ] Exactly 50 primary items + 10 backups
- [ ] All names are ALL CAPS
- [ ] Items ordered easiest → hardest
- [ ] No two items are visually identical or too similar
- [ ] Sub-types are interleaved (no 3+ same type in a row)
- [ ] Image paths are set up for the user to populate
- [ ] File follows the exact JS format with `window` export
- [ ] Category is registered in `index.js`
- [ ] Category loads in the gallery page without errors
