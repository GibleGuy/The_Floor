/**
 * Floor Host — HTML structure, rendering, tile interaction, duel flow.
 * Context menu: Battle, Edit Details, Swap Category, Cancel.
 * Duel overlay: full-screen "X vs Y", category, result input; battle engine + animation hooks.
 */

import {
    createGameState,
    DEFAULT_ROWS,
    DEFAULT_COLS,
    validateBattle,
    applyBattleResult,
    getBattleCategory,
    absorbGreySquares,
    isOrthogonalAdjacent,
    pickOne,
    getOrderedEligible,
    getEligiblePlayers,
    createUndoManager,
} from '../floor-core/index.js';

const gridEl = document.getElementById('floor-grid');
const pickBtn = document.getElementById('floor-pick-btn');
const undoBtn = document.getElementById('floor-undo-btn');
const swapOverlayEl = document.getElementById('floor-swap-overlay');
const randomizerResultEl = document.getElementById('floor-randomizer-result');
const randomizerLabelEl = document.querySelector('.floor-randomizer-label');
const randomizerDismissBtn = document.getElementById('floor-randomizer-dismiss');
const swapPromptEl = document.getElementById('floor-swap-prompt');
const swapCancelBtn = document.getElementById('floor-swap-cancel');
const contextMenuEl = document.getElementById('floor-context-menu');
const editModalEl = document.getElementById('floor-edit-modal');
const editFormEl = document.getElementById('floor-edit-form');
const editNameEl = document.getElementById('floor-edit-name');
const editCategoryEl = document.getElementById('floor-edit-category');
const editTimeboostEl = document.getElementById('floor-edit-timeboost');
const editCancelBtn = document.getElementById('floor-edit-cancel');
const duelOverlayEl = document.getElementById('floor-duel-overlay');
const duelVsEl = document.querySelector('.floor-duel-vs');
const duelCategoryEl = document.querySelector('.floor-duel-category');
const challengerWinsBtn = document.getElementById('floor-duel-challenger-wins');
const defenderWinsBtn = document.getElementById('floor-duel-defender-wins');
const duelCancelBtn = document.getElementById('floor-duel-cancel');
const rowsInput = document.getElementById('floor-rows');
const colsInput = document.getElementById('floor-cols');
const greyCountInput = document.getElementById('floor-grey-count');
const applyBtn = document.getElementById('floor-apply-grid');
const displayRadios = document.querySelectorAll('input[name="floor-display"]');
const importFile = document.getElementById('floor-import-file');
const importBtn = document.getElementById('floor-import-btn');
const exportBtn = document.getElementById('floor-export-btn');
const randomizeCheck = document.getElementById('floor-randomize-check');
const muteBtn = document.getElementById('floor-mute-btn');
const bgStyleSelect = document.getElementById('floor-bg-style');
const blueVariantSelect = document.getElementById('floor-blue-variant');
const driftSpeedInput = document.getElementById('floor-drift-speed');

/** Kill modal DOM refs */
const killModalEl = document.getElementById('floor-kill-modal');
const killPlayerNameEl = document.getElementById('floor-kill-player-name');
const killConfirmBtn = document.getElementById('floor-kill-confirm');
const killCancelBtn = document.getElementById('floor-kill-cancel');
const killContextBtn = document.querySelector('[data-action="kill"]');
let killTarget = null;

/** Audio mute state */
let isMuted = false;
let currentAudio = null;

/** Background settings */
let backgroundStyle = 'pop';
let blueVariant = 'b';
let driftSpeed = 2;
let timerSidebarWidth = 320;
let presentationLogoWidth = null; // null = use CSS default
let anthemAudio = null;
let autoHideTimeoutId = null;
const BG_STYLES = ['solid', 'grid', 'tiles', 'diagonal', 'pop'];

/** @type {import('./floor-core/index.js').GameState} */
let state = null;

/** Tile that triggered context menu (r, c). */
let contextTile = null;

/** Tile being edited in Edit Details modal. */
let editTarget = null;

/** Swap flow: { active, first, second } */
let swapState = { active: false, first: null, second: null };

/** Battle flow: { active, defender: {r,c}, challenger: {r,c} | null } */
let battleState = { active: false, defender: null, challenger: null };

/** Randomizer: { active, timeoutId } — timeoutId used to cancel. */
let randomizerState = null;

/** When set, show "SELECTED: X" and highlight tile; dismiss clears and re-renders. */
let randomizerResult = null;

/** Undo manager. */
const undoManager = createUndoManager();

/** Animation hooks (no animation yet). */
const animationHooks = {
    onSwapStart(tile1, tile2) { },
    onSwapEnd() { },
    onDuelStart(challengerPlayer, defenderPlayer, category) { },
    onDuelEnd(winnerPlayer, loserPlayer) { },
    onRandomizerComplete(selectedPlayer) { },
};

const playerConfig = [];
// Generate enough unique players for a standard grid (e.g. 400 for 20x20)
const NAMES = ['Boston Rob', 'Parvati', 'Sandra', 'Tony', 'Kim', 'Jeremy', 'Sarah', 'Yul', 'Natalie', 'Tyson', 'Sophie', 'Denise', 'Ethan', 'Amber', 'Todd', 'Earl', 'JT', 'Fabio', 'Cochran', 'Wendell', 'Tommy', 'Ben', 'Adam', 'Nick', 'Chris', 'Michele'];
const CATEGORIES = ['History', 'Geography', 'Science', 'Math', 'Literature', 'Art', 'Music', 'Movies', 'Sports', 'Food', 'Animals', 'Technology', 'Politics', 'Religion', 'Mythology', 'Language', 'Fashion', 'Architecture', 'Business', 'Economics', 'Psychology', 'Sociology', 'Philosophy', 'Physics', 'Chemistry', 'Biology'];

for (let i = 0; i < 400; i++) {
    const name = `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`;
    const category = `${CATEGORIES[i % CATEGORIES.length]} ${Math.floor(i / CATEGORIES.length) + 1}`;
    playerConfig.push({ name, expertCategory: category });
}
if (playerConfig.length > 0) playerConfig[0].hasTimeBoost = true;

function buildState(rows, cols, greyCount = 0) {
    const s = createGameState({
        rows: Math.max(1, rows),
        cols: Math.max(1, cols),
        players: playerConfig,
    });
    s.distributeTilesRoundRobin();

    // Randomly clear greyCount tiles to create grey squares
    if (greyCount > 0) {
        const totalTiles = rows * cols;
        const count = Math.min(greyCount, totalTiles);
        // Build list of all tile coordinates and shuffle
        const allCoords = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                allCoords.push({ r, c });
            }
        }
        // Fisher-Yates shuffle
        for (let i = allCoords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allCoords[i], allCoords[j]] = [allCoords[j], allCoords[i]];
        }
        for (let k = 0; k < count; k++) {
            const { r, c } = allCoords[k];
            s.setTileOwner(r, c, '', '');
        }
        s.refreshAreas();
    }

    return s;
}

function getDisplayMode() {
    const r = document.querySelector('input[name="floor-display"]:checked');
    return (r && r.value) === 'names'
        ? 'names'
        : (r && r.value) === 'categories'
            ? 'categories'
            : 'both';
}

function getTileFromTarget(el) {
    const tile = el && el.closest('.floor-tile');
    if (!tile) return null;
    const r = parseInt(tile.dataset.row, 10);
    const c = parseInt(tile.dataset.col, 10);
    if (isNaN(r) || isNaN(c)) return null;
    return { r, c, el: tile };
}

function getTileEl(r, c) {
    if (!gridEl) return null;
    return gridEl.querySelector(`.floor-tile[data-row="${r}"][data-col="${c}"]`);
}

function showContextMenu(x, y, tile) {
    contextTile = tile;
    contextMenuEl.style.left = x + 'px';
    contextMenuEl.style.top = y + 'px';
    // Hide kill button for grey (unowned) tiles
    if (killContextBtn) {
        const tileData = state ? state.getTile(tile.r, tile.c) : null;
        killContextBtn.style.display = (tileData && tileData.ownerId) ? '' : 'none';
    }
    contextMenuEl.setAttribute('aria-hidden', 'false');
}

function hideContextMenu() {
    contextMenuEl.setAttribute('aria-hidden', 'true');
    contextTile = null;
}

function showEditModal(tile) {
    if (!tile || !state) return;
    editTarget = tile;
    const t = state.getTile(tile.r, tile.c);
    const player = t.ownerId ? state.getPlayer(t.ownerId) : null;
    editNameEl.value = player ? player.name : '';
    editCategoryEl.value = t.category || '';
    editTimeboostEl.checked = player ? !!player.hasTimeBoost : false;
    editNameEl.disabled = !player;
    editTimeboostEl.disabled = !player;
    editModalEl.setAttribute('aria-hidden', 'false');
}

function hideEditModal() {
    editModalEl.setAttribute('aria-hidden', 'true');
    editTarget = null;
}

function saveEditDetails() {
    if (!editTarget || !state) return;
    const t = state.getTile(editTarget.r, editTarget.c);
    const player = t.ownerId ? state.getPlayer(t.ownerId) : null;
    undoManager.push(state);
    const category = (editCategoryEl.value || '').trim();
    state.setTileCategory(editTarget.r, editTarget.c, category);
    if (player) {
        const name = (editNameEl.value || '').trim();
        if (name) player.name = name;
        player.hasTimeBoost = editTimeboostEl.checked;
    }
    hideEditModal();
    hideContextMenu();
    editTarget = null;
    render();
    updateUndoButton();
}

function startSwapMode(initialTile) {
    if (initialTile) {
        swapState = { active: true, first: { r: initialTile.r, c: initialTile.c }, second: null };
        // Immediately prompt for the target
        if (swapPromptEl) swapPromptEl.textContent = 'Select category to steal from';
    } else {
        // Fallback or manual start
        swapState = { active: true, first: null, second: null };
        if (swapPromptEl) swapPromptEl.textContent = 'Select "thief" tile';
    }

    if (gridEl) gridEl.classList.add('floor-swap-mode');
    document.body.classList.add('floor-swap-mode');
    render();
}

function cancelSwapMode() {
    swapState = { active: false, first: null, second: null };
    if (swapPromptEl) swapPromptEl.textContent = '';
    if (gridEl) gridEl.classList.remove('floor-swap-mode');
    document.body.classList.remove('floor-swap-mode');
    render();
}

function startBattleMode(defender) {
    dismissRandomizer();
    battleState = { active: true, defender: { r: defender.r, c: defender.c }, challenger: null };
    if (swapPromptEl) swapPromptEl.textContent = 'Select challenger (adjacent tile)';
    if (gridEl) gridEl.classList.add('floor-battle-mode');
    document.body.classList.add('floor-battle-mode');
    render();
}

function cancelBattleMode() {
    battleState = { active: false, defender: null, challenger: null };
    if (swapPromptEl) swapPromptEl.textContent = '';
    if (gridEl) gridEl.classList.remove('floor-battle-mode');
    document.body.classList.remove('floor-battle-mode');
    hideDuelOverlay();
    render();
}

/** Tiles that just had category swap — add reappear animation in render. */
let swapReappearTiles = null;

function runSwap(first, second) {
    const t1 = state.getTile(first.r, first.c);
    const t2 = state.getTile(second.r, second.c);
    if (!t1 || !t2) return;
    undoManager.push(state);
    runSwapAnimation(first, second, t1, t2);
}

// Helper to get visual center of a tile group
function getGroupCentroid(tiles) {
    if (!tiles || tiles.length === 0) return null;
    let rSum = 0, cSum = 0;
    for (const t of tiles) {
        rSum += t.r;
        cSum += t.c;
    }
    const r = rSum / tiles.length;
    const c = cSum / tiles.length;

    // Convert to pixels relative to viewport
    // We can use the first tile element to get dimensions
    const el = getTileEl(tiles[0].r, tiles[0].c);
    if (!el) return null;

    // Estimate based on tile size + gap
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate top-left of the tile at (0,0) conceptually?
    // Easier: get avg of rect centers
    // Wait, grid might not be perfectly regular if responsive...
    // Let's just average the rects of first and last? Or all?
    // Averaging all rects is safest
    let xSum = 0, ySum = 0;
    let count = 0;
    for (const t of tiles) {
        const tEl = getTileEl(t.r, t.c);
        if (tEl) {
            const r = tEl.getBoundingClientRect();
            xSum += r.left + r.width / 2;
            ySum += r.top + r.height / 2;
            count++;
        }
    }
    return count > 0 ? { x: xSum / count, y: ySum / count } : null;
}

function runSwapAnimation(first, second, t1, t2) {
    animationHooks.onSwapStart(t1, t2);

    // Get full groups for proper centering
    const group1 = state.getContiguousTileGroup(first.r, first.c);
    const group2 = state.getContiguousTileGroup(second.r, second.c);

    // Calculate centroids for "Epic" text spawn
    const c1 = getGroupCentroid(group1);
    const c2 = getGroupCentroid(group2);

    if (!c1 || !c2 || !swapOverlayEl) {
        finishSwap(first, second);
        return;
    }

    const cat1 = t1.category || '—';
    const cat2 = t2.category || '—';

    // 1. Activate Dimming Mode
    gridEl.classList.add('floor-grid--steal-active');

    // 2. Highlight active tiles (Spotlight)
    const allActiveTiles = [...group1, ...group2];
    for (const t of allActiveTiles) {
        const el = getTileEl(t.r, t.c);
        if (el) el.classList.add('floor-tile--steal-focus');
    }

    // 3. Create Flying Text
    swapOverlayEl.setAttribute('aria-hidden', 'false');
    swapOverlayEl.innerHTML = ''; // Clear prev

    const fly1 = document.createElement('div');
    fly1.className = 'floor-swap-fly';
    fly1.textContent = cat1;
    fly1.style.left = c1.x + 'px';
    fly1.style.top = c1.y + 'px';
    swapOverlayEl.appendChild(fly1);

    const fly2 = document.createElement('div');
    fly2.className = 'floor-swap-fly';
    fly2.textContent = cat2;
    fly2.style.left = c2.x + 'px';
    fly2.style.top = c2.y + 'px';
    swapOverlayEl.appendChild(fly2);

    // Trigger animation via class for easier keyframe management
    // We use a small timeout to allow browser to paint initial position/scale
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            fly1.classList.add('floor-swap-fly--animate');
            fly2.classList.add('floor-swap-fly--animate');

            // Set dynamic targets for the keyframe to use? 
            // CSS Keyframes are hard to dynamicize without Vars.
            // Let's use WAAPI or just set vars on the element

            // Actually, for keyframes, we can just move the `left`/`top` to the target
            // and have the keyframe handle scale/opacity.
            // But if we move `left`/`top`, the starting position in keyframe 0% needs to be offset?
            // No, transition! 

            // HYBRID APPROACH:
            // Use Transition for X/Y translation
            // Use Animation for Scale/Opacity/Bounce

            // Set transition duration to match animation (2.5s)
            fly1.style.transition = 'left 2.5s cubic-bezier(0.22, 1, 0.36, 1), top 2.5s cubic-bezier(0.22, 1, 0.36, 1)';
            fly2.style.transition = 'left 2.5s cubic-bezier(0.22, 1, 0.36, 1), top 2.5s cubic-bezier(0.22, 1, 0.36, 1)';

            fly1.style.left = c2.x + 'px';
            fly1.style.top = c2.y + 'px';

            fly2.style.left = c1.x + 'px';
            fly2.style.top = c1.y + 'px';
        });
    });

    // 4. IMPACT (at ~3.6s - mid impact phase)
    setTimeout(() => {
        // Force flyers to vanish immediately at impact
        swapOverlayEl.innerHTML = '';

        // SCREEN SHAKE
        const main = document.querySelector('.floor-host-main');
        if (main) {
            main.classList.remove('floor-shake');
            void main.offsetWidth; // trigger reflow
            main.classList.add('floor-shake');
        }

        // FLASH
        swapOverlayEl.classList.add('floor-flash');
        setTimeout(() => {
            swapOverlayEl.classList.remove('floor-flash');
            swapOverlayEl.classList.add('floor-flash-fade');
        }, 50); // Short white burst

        // EXECUTE SWAP DATA
        state.swapTileCategories(first.r, first.c, second.r, second.c);
        animationHooks.onSwapEnd();
        render(); // Re-renders grid with new categories

        // Cleanup visuals
        gridEl.classList.remove('floor-grid--steal-active');
        // Remove individual highlights
        // (Render likely nuked the DOM elements anyway, but if not...)
        gridEl.querySelectorAll('.floor-tile--steal-focus').forEach(el => el.classList.remove('floor-tile--steal-focus'));

        cancelSwapMode();
        updateUndoButton();

        // 5. Cleanup Overlay (after flash fades)
        setTimeout(() => {
            swapOverlayEl.setAttribute('aria-hidden', 'true');
            swapOverlayEl.innerHTML = '';
            swapOverlayEl.classList.remove('floor-flash-fade');
            if (main) main.classList.remove('floor-shake');
        }, 800);

    }, 2500); // Wait for flight to finish
}

function finishSwap(first, second) {
    const t1 = state.getTile(first.r, first.c);
    const t2 = state.getTile(second.r, second.c);
    if (t1 && t2) animationHooks.onSwapStart(t1, t2);
    state.swapTileCategories(first.r, first.c, second.r, second.c);
    if (t1 && t2) animationHooks.onSwapEnd();
    cancelSwapMode();
    render();
    updateUndoButton();
}

function updateUndoButton() {
    if (undoBtn) undoBtn.disabled = !undoManager.canUndo();
}

function handleUndo() {
    if (!undoManager.canUndo() || !state) return;
    undoManager.undo(state);
    if (gridEl) {
        gridEl.classList.add('floor-grid--undo-revert');
        render();
        setTimeout(() => {
            gridEl.classList.remove('floor-grid--undo-revert');
        }, 520);
    } else {
        render();
    }
    updateUndoButton();
}

function handleTileClick(tile) {
    if (!swapState.active || !tile) return;
    if (!swapState.first) {
        swapState.first = { r: tile.r, c: tile.c };
        if (swapPromptEl) swapPromptEl.textContent = 'Select category to steal from';
        render();
        return;
    }
    if (tile.r === swapState.first.r && tile.c === swapState.first.c) return;
    swapState.second = { r: tile.r, c: tile.c };
    runSwap(swapState.first, swapState.second);
}

function handleBattleTileClick(tile) {
    if (!battleState.active || !battleState.defender || !tile) return;
    const d = battleState.defender;
    const subjectTile = state.getTile(d.r, d.c);
    const subjectOwner = subjectTile ? subjectTile.ownerId : null;

    if (tile.ownerId === subjectOwner) return; // Clicked self

    // 1. Identify if the clicked player is a valid candidate
    // A player is valid if ANY of their tiles are in battleState.candidates
    let isValidOpponent = false;
    let validChallengerTile = null; // The specific border tile we will use

    // Convert candidates set to an iterable of tile objects/coords to check owners
    // Optimization: We could cache candidateOwners in render, but battleState is simple enough to re-scan or we can trust the loop.
    if (battleState.candidates) {
        // PRIORITY: Check if the clicked tile ITSELF is a candidate
        const clickCoord = `${tile.r},${tile.c}`;
        if (battleState.candidates.has(clickCoord)) {
            isValidOpponent = true;
            validChallengerTile = { r: tile.r, c: tile.c };
        } else {
            // Fallback: Find ANY valid contact point for this player
            for (const coord of battleState.candidates) {
                const [r, c] = coord.split(',').map(Number);
                const t = state.getTile(r, c);
                if (t && t.ownerId === tile.ownerId) {
                    isValidOpponent = true;
                    validChallengerTile = { r, c };
                    break; // Found a valid contact point for this player
                }
            }
        }
    }

    // FALLBACK: Safe adjacency check for simple cases (1x1 vs 1x1)
    if (!isValidOpponent) {
        const dist = Math.abs(tile.r - d.r) + Math.abs(tile.c - d.c);
        if (dist === 1 && tile.ownerId !== subjectOwner) {
            isValidOpponent = true;
            validChallengerTile = { r: tile.r, c: tile.c };
        }
    }

    if (!isValidOpponent || !validChallengerTile) {
        if (swapPromptEl) swapPromptEl.textContent = 'Not a valid challenger (must be adjacent to territory)';
        return;
    }

    // 2. Find the Subject Border Tile adjacent to the validChallengerTile
    // (We found A valid border tile for the challenger, now find the subject tile touching it)
    let validSubjectTile = d; // Default

    if (subjectOwner) {
        const ownedTiles = state.getTilesOwnedBy(subjectOwner);
        for (const t of ownedTiles) {
            const dist = Math.abs(t.row - validChallengerTile.r) + Math.abs(t.col - validChallengerTile.c);
            if (dist === 1) {
                validSubjectTile = { r: t.row, c: t.col };
                break;
            }
        }
    }

    // Update state
    battleState.defender = validSubjectTile;
    battleState.challenger = validChallengerTile;
    showDuelOverlay();
}

function handleContextMenu(e) {
    const tile = getTileFromTarget(e.target);
    if (!tile) return;
    e.preventDefault();
    hideContextMenu();
    showContextMenu(e.clientX, e.clientY, tile);
}

function handleGridClick(e) {
    const tile = getTileFromTarget(e.target);
    if (!tile) return;
    if (swapState.active) {
        handleTileClick(tile);
        return;
    }
    if (battleState.active) {
        handleBattleTileClick(tile);
        return;
    }
    // New: Open Context Menu on Left Click (if no special mode)
    // Adjust position to be near the click, but keep within viewport if possible
    showContextMenu(e.clientX, e.clientY, tile);
}

function handleContextAction(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');

    if (action === 'cancel') {
        hideContextMenu();
        return;
    }

    const tile = contextTile;
    hideContextMenu();

    if (action === 'battle') {
        startBattleMode(tile);
        return;
    }

    if (action === 'edit') {
        showEditModal(tile);
        return;
    }

    if (action === 'swap') {
        startSwapMode(tile);
        return;
    }

    if (action === 'kill') {
        showKillModal(tile);
        return;
    }
}

function showKillModal(tile) {
    if (!tile || !state) return;
    const tileData = state.getTile(tile.r, tile.c);
    if (!tileData || !tileData.ownerId) return;
    const player = state.getPlayer(tileData.ownerId);
    if (!player) return;
    killTarget = { ownerId: tileData.ownerId };
    if (killPlayerNameEl) killPlayerNameEl.textContent = player.name;
    if (killModalEl) killModalEl.setAttribute('aria-hidden', 'false');
}

function hideKillModal() {
    if (killModalEl) killModalEl.setAttribute('aria-hidden', 'true');
    killTarget = null;
}

function confirmKill() {
    if (!killTarget || !state) { hideKillModal(); return; }
    const { ownerId } = killTarget;
    undoManager.push(state);
    state.killPlayer(ownerId);

    // After killing, check if any neighboring players should absorb the new grey squares
    // Find all players adjacent to the newly created grey squares and absorb for each
    const greyTiles = [];
    for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
            const t = state.getTile(r, c);
            if (t && !t.ownerId) greyTiles.push({ r, c });
        }
    }

    // Find unique adjacent owners
    const adjacentOwners = new Set();
    for (const { r, c } of greyTiles) {
        const neighbors = [
            state.getTile(r - 1, c),
            state.getTile(r + 1, c),
            state.getTile(r, c - 1),
            state.getTile(r, c + 1)
        ];
        for (const n of neighbors) {
            if (n && n.ownerId) adjacentOwners.add(n.ownerId);
        }
    }

    // Shuffle so absorption isn't always top-left first (Fisher-Yates)
    const ownerArray = [...adjacentOwners];
    for (let i = ownerArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ownerArray[i], ownerArray[j]] = [ownerArray[j], ownerArray[i]];
    }
    for (const pid of ownerArray) {
        absorbGreySquares(state, pid);
    }

    state.refreshAreas();
    hideKillModal();
    render();
    updateUndoButton();
}

function showDuelOverlay() {
    if (!state || !battleState.defender || !battleState.challenger) return;
    const { r: cr, c: cc } = battleState.challenger;
    const { r: dr, c: dc } = battleState.defender;
    const challengerTile = state.getTile(cr, cc);
    const defenderTile = state.getTile(dr, dc);
    const challengerPlayer = challengerTile?.ownerId ? state.getPlayer(challengerTile.ownerId) : null;
    const defenderPlayer = defenderTile?.ownerId ? state.getPlayer(defenderTile.ownerId) : null;
    const category = getBattleCategory(state, dr, dc, cr, cc);
    if (!challengerPlayer || !defenderPlayer) return;

    if (duelVsEl) duelVsEl.textContent = `${challengerPlayer.name} vs ${defenderPlayer.name}`;
    if (duelCategoryEl) duelCategoryEl.textContent = category;
    if (challengerWinsBtn) challengerWinsBtn.textContent = `${challengerPlayer.name} wins`;
    if (defenderWinsBtn) defenderWinsBtn.textContent = `${defenderPlayer.name} wins`;

    animationHooks.onDuelStart(challengerPlayer, defenderPlayer, category);

    duelOverlayEl.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
        duelOverlayEl.classList.add('floor-duel-overlay--visible');
    });
}

function hideDuelOverlay() {
    if (!duelOverlayEl || duelOverlayEl.getAttribute('aria-hidden') === 'true') return;
    duelOverlayEl.classList.remove('floor-duel-overlay--visible');
    const onEnd = () => {
        duelOverlayEl.setAttribute('aria-hidden', 'true');
        duelOverlayEl.removeEventListener('transitionend', onEnd);
    };
    duelOverlayEl.addEventListener('transitionend', onEnd, { once: true });
}

function applyDuelResult(winnerIsChallenger) {
    if (!state || !battleState.defender || !battleState.challenger) return;
    const { r: cr, c: cc } = battleState.challenger;
    const { r: dr, c: dc } = battleState.defender;
    const challenger = state.getTile(cr, cc);
    const defender = state.getTile(dr, dc);
    const loserId = winnerIsChallenger ? defender?.ownerId : challenger?.ownerId;
    const wonTiles = loserId ? state.getTilesOwnedBy(loserId).map((t) => ({ r: t.row, c: t.col })) : [];

    undoManager.push(state);
    const result = applyBattleResult(state, dr, dc, cr, cc, !winnerIsChallenger);
    if (!result.success) return;

    const winner = state.getPlayer(result.winnerId);
    const loser = state.getPlayer(result.loserId);
    if (winner) winner.duelCount = (winner.duelCount || 0) + 1; // Track duel counts
    if (winner && loser) animationHooks.onDuelEnd(winner, loser);

    battleState = { active: false, defender: null, challenger: null };
    if (gridEl) gridEl.classList.remove('floor-battle-mode');
    document.body.classList.remove('floor-battle-mode');
    if (swapPromptEl) swapPromptEl.textContent = '';
    hideDuelOverlay();
    render();
    updateUndoButton();

    for (const { r, c } of wonTiles) {
        const el = getTileEl(r, c);
        if (el) el.classList.add('floor-tile--takeover');
    }
    setTimeout(() => {
        gridEl?.querySelectorAll('.floor-tile--takeover').forEach((el) => el.classList.remove('floor-tile--takeover'));
        updateUndoButton();
    }, 1100);
}

function handleDuelChallengerWins() {
    applyDuelResult(true);
}

function handleDuelDefenderWins() {
    applyDuelResult(false);
}

function handleDuelCancel() {
    battleState = { active: false, defender: null, challenger: null };
    if (gridEl) gridEl.classList.remove('floor-battle-mode');
    document.body.classList.remove('floor-battle-mode');
    if (swapPromptEl) swapPromptEl.textContent = '';
    hideDuelOverlay();
    render();
}

function runRandomizer() {
    if (!state || randomizerState) return;

    const statusEl = document.getElementById('floor-debug-status');

    // Pick Logic: Prioritize fresh players (duelCount = 0 or undefined).
    // CRITICAL FIX: Only consider players who actually OWN tiles.
    let eligible = getEligiblePlayers(state).filter(p => state.getTilesOwnedBy(p.id).length > 0);

    if (eligible.length === 0) {
        alert('No eligible players with tiles.');
        return;
    }

    const freshPlayers = eligible.filter(p => !p.duelCount);
    const pool = freshPlayers.length > 0 ? freshPlayers : eligible;

    if (statusEl) statusEl.textContent = `Randomizer: Pool ${pool.length} (Total eligible: ${eligible.length})`;

    // Simple random pick from the pool
    const selectedPlayer = pool[Math.floor(Math.random() * pool.length)];

    if (!selectedPlayer) {
        console.error("Failed to select player");
        return;
    }

    // Get tiles for animation - ensure randomizer works even if "ordered" list logic is tricky
    // Just pick random tiles from grid to flash?
    // The original logic followed a pattern "getOrderedEligible".
    // Let's stick to that but ensure it doesn't fail.
    const ordered = getOrderedEligible(state);
    let rapidTiles = ordered
        .map((p) => {
            const tiles = state.getTilesOwnedBy(p.id);
            return tiles.length ? { r: tiles[0].row, c: tiles[0].col } : null;
        })
        .filter(Boolean);

    // Fallback: If ordered list is empty/broken for some reason, just use all tiles
    if (rapidTiles.length === 0) {
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                rapidTiles.push({ r, c });
            }
        }
    }

    const winnerTiles = state.getTilesOwnedBy(selectedPlayer.id).map((t) => ({ r: t.row, c: t.col }));
    if (winnerTiles.length === 0) {
        alert("Selected player has no tiles!");
        return;
    }

    randomizerResult = null;
    if (randomizerResultEl) randomizerResultEl.setAttribute('aria-hidden', 'true');
    if (gridEl) gridEl.classList.add('floor-grid--randomizer-active');
    if (pickBtn) {
        pickBtn.textContent = 'Stop the Randomizer';
        pickBtn.classList.add('floor-btn--stop');
    }

    // Play randomizer sound effect (always play but respect mute state)
    const audio = new Audio('../sounds/randomizer.mp3');
    currentAudio = audio;
    audio.muted = isMuted;
    audio.play().catch(err => console.warn('Audio play failed:', err));

    // Animation Timing: Target ~13 seconds to match audio.
    // We want a fast phase, then slowing down.
    // Let's do a fixed number of steps that roughly sums to 13s with increasing delay.

    // Strategy:
    // Phase 1: Rapid constant speed.
    // Phase 2: Slowing down to winner.

    const RAPID_COUNT = 100; // 100 steps at 80ms = 8 seconds
    const SLOW_COUNT = 10;  // 10 steps over ~5 seconds

    const combinedSteps = [];

    // Build rapid sequence
    for (let i = 0; i < RAPID_COUNT; i++) {
        combinedSteps.push(rapidTiles[i % rapidTiles.length]);
    }

    // Build slow sequence (converging to winner)
    // We'll just keep cycling rapidTiles but end on winner
    for (let i = 0; i < SLOW_COUNT; i++) {
        if (i === SLOW_COUNT - 1) {
            combinedSteps.push(winnerTiles[0]); // End on winner
        } else {
            combinedSteps.push(rapidTiles[(RAPID_COUNT + i) % rapidTiles.length]);
        }
    }

    let delay = 200; // Start of slow phase delay
    let idx = 0;
    let prev = null;

    function clearHighlight(tile) {
        if (!tile) return;
        const el = getTileEl(tile.r, tile.c);
        if (el) {
            el.classList.remove('floor-tile--randomizer-active');
            el.classList.remove('floor-tile--randomizer-selected');
        }
    }

    function setHighlight(tile, selected) {
        if (!tile) return;
        const el = getTileEl(tile.r, tile.c);
        if (el) {
            el.classList.add(selected ? 'floor-tile--randomizer-selected' : 'floor-tile--randomizer-active');
        }
    }

    function tick() {
        clearHighlight(prev);
        if (idx >= combinedSteps.length) {
            stopRandomizerRun(selectedPlayer, prev || combinedSteps[combinedSteps.length - 1]);
            return;
        }

        const current = combinedSteps[idx];
        const isSlowPhase = idx >= RAPID_COUNT;

        setHighlight(current, false);
        prev = current;
        idx++;

        if (isSlowPhase) {
            // Exponential slowdown for dramatic finale (~5s total)
            delay = delay * 1.35;
        } else {
            // Constant speed in rapid phase
            delay = 80;
        }

        const tid = setTimeout(tick, delay);
        randomizerState = randomizerState || {};
        randomizerState.timeoutId = tid;
    }

    randomizerState = { active: true };
    tick();
}

function stopRandomizerRun(selectedPlayer, finalTile) {
    const tid = randomizerState && randomizerState.timeoutId;
    randomizerState = null;
    if (tid) clearTimeout(tid);
    if (gridEl) gridEl.classList.remove('floor-grid--randomizer-active');

    const el = getTileEl(finalTile.r, finalTile.c);
    if (el) {
        el.classList.remove('floor-tile--randomizer-active');
        el.classList.add('floor-tile--randomizer-selected');
    }

    randomizerResult = { r: finalTile.r, c: finalTile.c, playerName: selectedPlayer.name };
    if (randomizerLabelEl) randomizerLabelEl.textContent = `SELECTED: ${selectedPlayer.name}`;
    if (randomizerResultEl) randomizerResultEl.setAttribute('aria-hidden', 'false');
    // Keep button as "Stop" while result is pulse-displaying (still part of active state)
    animationHooks.onRandomizerComplete(selectedPlayer);
}

function cancelRandomizer() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    if (!randomizerState && !randomizerResult) return;
    const tid = randomizerState && randomizerState.timeoutId;
    randomizerState = null;
    if (tid) clearTimeout(tid);
    if (gridEl) {
        gridEl.classList.remove('floor-grid--randomizer-active');
        gridEl.querySelectorAll('.floor-tile--randomizer-active, .floor-tile--randomizer-selected').forEach((el) => {
            el.classList.remove('floor-tile--randomizer-active', 'floor-tile--randomizer-selected');
        });
    }
    randomizerResult = null;
    if (randomizerResultEl) randomizerResultEl.setAttribute('aria-hidden', 'true');
    if (pickBtn) {
        pickBtn.disabled = false;
        pickBtn.textContent = 'Run Randomizer';
        pickBtn.classList.remove('floor-btn--stop');
    }
}

function dismissRandomizer() {
    if (!randomizerResult) return;
    randomizerResult = null;
    if (randomizerResultEl) randomizerResultEl.setAttribute('aria-hidden', 'true');
    if (pickBtn) {
        pickBtn.textContent = 'Run Randomizer';
        pickBtn.classList.remove('floor-btn--stop');
    }
    render();
}

function handleRandomizerToggle() {
    // If randomizer is running or result is showing, cancel/dismiss it
    if (randomizerState || randomizerResult) {
        cancelRandomizer();
    } else {
        // Otherwise, start the randomizer
        runRandomizer();
    }
}

function handleEditCancel() {
    hideEditModal();
    hideContextMenu();
}

function handleEditSubmit(e) {
    e.preventDefault();
    saveEditDetails();
}

function handleKeydown(e) {
    if (e.key === 'Escape') {
        if (killModalEl && killModalEl.getAttribute('aria-hidden') === 'false') {
            hideKillModal();
        } else if (editModalEl.getAttribute('aria-hidden') === 'false') {
            hideEditModal();
            hideContextMenu();
        } else if (duelOverlayEl && duelOverlayEl.getAttribute('aria-hidden') === 'false') {
            handleDuelCancel();
        } else if (randomizerResult) {
            dismissRandomizer();
        } else if (randomizerState) {
            cancelRandomizer();
        } else if (battleState.active) {
            cancelBattleMode();
        } else if (swapState.active) {
            cancelSwapMode();
        } else {
            hideContextMenu();
        }
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
    }
    const key = e.key.toLowerCase();
    if (key === 'j' || key === 'r') {
        // Don't trigger if typing in an input or contenteditable
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        handleRandomizerToggle();
    }
    if (key === 'k' || key === 'c') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        toggleFloorTimer();
    }
    if (key === 'p') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        togglePresentationMode();
    }
    if (key === 'a') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        toggleAnthem();
    }
}

function handleClickOutside(e) {
    if (contextMenuEl.getAttribute('aria-hidden') === 'false') {
        if (!contextMenuEl.contains(e.target)) {
            hideContextMenu();
        }
    }
}

function render() {
    if (!state || !gridEl) return;

    const rows = state.rows;
    const cols = state.cols;
    const mode = getDisplayMode();
    const statusEl = document.getElementById('floor-debug-status');

    try {
        // Clear grid
        gridEl.innerHTML = '';

        gridEl.style.display = 'grid';
        gridEl.style.position = 'relative';
        gridEl.style.gap = '0';
        gridEl.style.backgroundColor = 'transparent';

        // Update CSS grid layout
        gridEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridEl.style.aspectRatio = `${cols} / ${rows}`;
        // Set variable on parent to ensure inheritance
        gridEl.style.setProperty('--grid-cols', String(cols));

        const labelsLayer = document.createElement('div');
        labelsLayer.className = 'floor-labels-layer';
        // Also set on layer to be double sure
        labelsLayer.style.setProperty('--grid-cols', String(cols));
        gridEl.appendChild(labelsLayer);

        const playerCentroids = new Map();

        // 1. Grid Loop - Draw Tiles
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const tile = state.getTile(r, c);
                if (!tile) throw new Error(`Tile missing at ${r},${c}`);

                // Centroid Calc
                if (tile.ownerId) {
                    if (!playerCentroids.has(tile.ownerId)) {
                        playerCentroids.set(tile.ownerId, { rSum: 0, cSum: 0, count: 0, tiles: [] });
                    }
                    const pc = playerCentroids.get(tile.ownerId);
                    pc.rSum += r;
                    pc.cSum += c;
                    pc.count++;
                    pc.tiles.push({ r, c });
                }

                const cell = document.createElement('div');
                cell.className = 'floor-tile floor-tile--' + mode;
                // cell.style.backgroundColor = '#111'; // Fixed: Let CSS control background
                cell.style.border = '1px solid rgba(255,255,255,0.3)'; // Default border
                cell.style.color = '#fff';
                cell.style.minHeight = '20px';
                cell.setAttribute('role', 'gridcell');
                cell.dataset.row = String(r);
                cell.dataset.col = String(c);
                cell.tabIndex = 0;

                // Grey square styling for unowned tiles
                if (!tile.ownerId) {
                    cell.classList.add('floor-tile--grey');
                }

                // Merge Borders & Edge Shading
                if (tile.ownerId) {
                    const top = state.getTile(r - 1, c);
                    const bottom = state.getTile(r + 1, c);
                    const left = state.getTile(r, c - 1);
                    const right = state.getTile(r, c + 1);

                    // Top
                    if (top && top.ownerId === tile.ownerId) {
                        cell.classList.add('floor-tile--merge-top');
                    } else {
                        cell.classList.add('floor-edge-top');
                    }
                    // Bottom
                    if (bottom && bottom.ownerId === tile.ownerId) {
                        cell.classList.add('floor-tile--merge-bottom');
                    } else {
                        cell.classList.add('floor-edge-bottom');
                    }
                    // Left
                    if (left && left.ownerId === tile.ownerId) {
                        cell.classList.add('floor-tile--merge-left');
                    } else {
                        cell.classList.add('floor-edge-left');
                    }
                    // Right
                    if (right && right.ownerId === tile.ownerId) {
                        cell.classList.add('floor-tile--merge-right');
                    } else {
                        cell.classList.add('floor-edge-right');
                    }
                }

                // Battle Mode Logic
                if (battleState.active && battleState.defender) {
                    const d = battleState.defender;
                    const clickedTile = state.getTile(d.r, d.c);
                    const subjectOwnerId = clickedTile?.ownerId;

                    const isSubject = tile.ownerId === subjectOwnerId;
                    let isCandidate = false;

                    if (!battleState.candidates) {
                        battleState.candidates = new Set();
                        if (subjectOwnerId) {
                            const subjectTiles = state.getTilesOwnedBy(subjectOwnerId);
                            for (const st of subjectTiles) {
                                const neighbors = [
                                    { r: st.row - 1, c: st.col },
                                    { r: st.row + 1, c: st.col },
                                    { r: st.row, c: st.col - 1 },
                                    { r: st.row, c: st.col + 1 }
                                ];
                                for (const n of neighbors) {
                                    const tObj = state.getTile(n.r, n.c);
                                    if (tObj && tObj.ownerId && tObj.ownerId !== subjectOwnerId) {
                                        battleState.candidates.add(`${n.r},${n.c}`);
                                    }
                                }
                            }
                        }
                    }

                    // Lazy init Owners Set for Full Territory Highlighting
                    if (!battleState.candidateOwners) {
                        battleState.candidateOwners = new Set();
                        if (battleState.candidates) {
                            for (const coord of battleState.candidates) {
                                const [cr, cc] = coord.split(',').map(Number);
                                const t = state.getTile(cr, cc);
                                if (t && t.ownerId) battleState.candidateOwners.add(t.ownerId);
                            }
                        }
                    }

                    // Check if this tile belongs to a candidate OWNER
                    if (tile.ownerId && battleState.candidateOwners.has(tile.ownerId)) {
                        isCandidate = true;
                    }

                    if (isSubject) {
                        cell.classList.add('floor-tile--battle-defender');
                    } else if (isCandidate) {
                        cell.classList.add('floor-tile--battle-candidate');
                    } else {
                        cell.classList.add('floor-tile--battle-dimmed');
                    }
                } else {
                    if (battleState.candidates) delete battleState.candidates;
                    if (battleState.candidateOwners) delete battleState.candidateOwners;
                }

                // Other Modes
                const isSwapFirst =
                    swapState.active &&
                    swapState.first &&
                    swapState.first.r === r &&
                    swapState.first.c === c;
                if (isSwapFirst) cell.classList.add('floor-tile--swap-selected');

                const isRandomizerSelected =
                    randomizerResult &&
                    randomizerResult.r === r &&
                    randomizerResult.c === c;
                if (isRandomizerSelected) cell.classList.add('floor-tile--randomizer-selected');

                // Content
                const inner = document.createElement('div');
                inner.className = 'floor-tile-inner';

                // Category element
                const catEl = document.createElement('div');
                catEl.className = 'floor-tile-category';
                catEl.textContent = tile.category || '';
                inner.appendChild(catEl);

                // Name element (especially needed for randomizer-selected to show content)
                const nameEl = document.createElement('div');
                nameEl.className = 'floor-tile-name';
                const ownerPlayer = tile.ownerId ? state.getPlayer(tile.ownerId) : null;
                nameEl.textContent = ownerPlayer ? ownerPlayer.name : '';
                inner.appendChild(nameEl);

                cell.appendChild(inner);
                gridEl.appendChild(cell);
            }
        }

        // 2. Labels Loop - Draw Overlays
        for (const [pid, pc] of playerCentroids) {
            const player = state.getPlayer(pid);
            if (!player) continue;

            const cenR = pc.rSum / pc.count;
            const cenC = pc.cSum / pc.count;

            // Find tile closest to centroid
            let bestTile = pc.tiles[0];
            let minDst = Infinity;

            for (const t of pc.tiles) {
                const dst = (t.r - cenR) ** 2 + (t.c - cenC) ** 2;
                if (dst < minDst) {
                    minDst = dst;
                    bestTile = t;
                }
            }

            // Use optimal position
            const finalR = bestTile ? bestTile.r : cenR;
            const finalC = bestTile ? bestTile.c : cenC;

            const label = document.createElement('div');
            label.className = 'floor-player-label';

            const topPct = ((finalR + 0.5) / rows) * 100;
            const leftPct = ((finalC + 0.5) / cols) * 100;

            label.style.top = topPct + '%';
            label.style.left = leftPct + '%';

            // Hardcode width/height constraints to ensure it ALWAYS works regardless of zoom/rendering
            // Use percentage relative to the grid container (labels layer) to ensure it matches grid size even on zoom out
            // 95% of the slot width. Slot width is (100 / cols) %.
            const slotPct = 100 / cols;
            const sizePct = slotPct * 0.90; // 90% of slot

            label.style.maxWidth = sizePct + '%';
            label.style.maxHeight = sizePct + '%';

            // If this player is the randomizer result, add pulsing class
            if (randomizerResult && randomizerResult.playerName === player.name) {
                label.classList.add('floor-label--randomizer-selected');
            }

            // Logic to restrain width if needed?
            // CSS max-width is 200px.
            // If the region is larger, we can allow more?
            // Let's scale based on tile count? 
            // Simple logic: max-width relative to grid size logic is hard.
            // We'll rely on CSS constraints for now, ensuring center is valid.

            if (player.hasTimeBoost) {
                const badge = document.createElement('div');
                badge.className = 'label-badge';
                badge.textContent = '+5';
                label.appendChild(badge);
            }

            if (mode !== 'names') {
                const cat = document.createElement('div');
                cat.className = 'label-cat';
                // Read category from the actual tile data (which updates during swaps)
                // instead of player.expertCategory (which is immutable)
                const firstTile = state.getTile(pc.tiles[0].r, pc.tiles[0].c);
                cat.textContent = firstTile?.category || player.expertCategory;
                label.appendChild(cat);
            }

            if (mode !== 'categories') {
                const name = document.createElement('div');
                name.className = 'label-name';
                name.textContent = player.name;
                label.appendChild(name);
            }

            labelsLayer.appendChild(label);
        }

        if (statusEl) statusEl.textContent = `Render OK: ${rows}x${cols} | Children: ${gridEl.childElementCount}`;

    } catch (err) {
        console.error(err);
        if (statusEl) {
            statusEl.textContent = `ERROR: ${err.message}`;
            statusEl.style.color = 'red';
        }
    }
}
function applyGrid() {
    const rows = Math.max(1, parseInt(rowsInput.value, 10) || DEFAULT_ROWS);
    const cols = Math.max(1, parseInt(colsInput.value, 10) || DEFAULT_COLS);
    const greyCount = Math.max(0, parseInt(greyCountInput?.value, 10) || 0);
    rowsInput.value = String(rows);
    colsInput.value = String(cols);
    cancelSwapMode();
    cancelBattleMode();
    cancelRandomizer();
    randomizerResult = null;
    undoManager.clear();
    state = buildState(rows, cols, greyCount);
    render();
    updateUndoButton();
}

function handleExport() {
    if (!state) return;
    const rows = [];
    rows.push('Row,Col,Name,Category,TimeBoost');
    for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
            const tile = state.getTile(r, c);
            const player = tile.ownerId ? state.getPlayer(tile.ownerId) : null;
            if (player) {
                // Escape quotes if needed
                const name = player.name.includes(',') ? `"${player.name}"` : player.name;
                const cat = tile.category.includes(',') ? `"${tile.category}"` : tile.category;
                const boost = player.hasTimeBoost ? 'true' : 'false';
                rows.push(`${r},${c},${name},${cat},${boost}`);
            } else {
                // Grey/empty square — mark with __GREY__ so import preserves it
                rows.push(`${r},${c},__GREY__,,false`);
            }
        }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the_floor_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleImport(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) return; // Header + at least one row

        // Simple heuristic: check header to see if it includes Row/Col
        const header = lines[0].toLowerCase();
        const isFullState = header.includes('row') && header.includes('col');

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
            // Regex handles quoted CSV values
            const parts = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            // fallback simple split if regex fails or simple structure
            const rowData = parts ? parts.map(p => p.replace(/^"|"$/g, '')) : lines[i].split(',').map(s => s.trim());

            // Adjust to robust split that handles empty fields
            const simpleParts = lines[i].split(',').map(s => s.trim());
            // If comma parsing without quotes is sufficient (simple names)
            // Let's stick to a simpler parse for now:
            // Assume content doesn't have commas for simplicity unless quoted.

            parsed.push(simpleParts);
        }

        undoManager.clear();

        if (isFullState) {
            importFullState(parsed);
        } else {
            // Simple List: Name, Category
            importSimpleList(parsed);
        }

        // Clear mode states to prevent stale player references
        randomizerResult = null;
        battleState = { active: false, defender: null, challenger: null };
        swapState = { active: false, first: null, second: null };

        render();
        updateUndoButton();
    };
    reader.readAsText(file);
}

function importFullState(rowsData) {
    // Expected: Row, Col, Name, Category, [TimeBoost]
    // Find max row/col
    let maxR = 0;
    let maxC = 0;
    const items = [];
    for (const row of rowsData) {
        if (row.length < 4) continue;
        const r = parseInt(row[0], 10);
        const c = parseInt(row[1], 10);
        if (!isNaN(r) && !isNaN(c)) {
            maxR = Math.max(maxR, r);
            maxC = Math.max(maxC, c);
            items.push({
                r, c,
                name: row[2],
                category: row[3],
                hasTimeBoost: row[4] === 'true'
            });
        }
    }

    // Update inputs
    rowsInput.value = maxR + 1;
    colsInput.value = maxC + 1;

    // Build blank state - don't pass players parameter to avoid MIN_PLAYERS enforcement
    state = createGameState({
        rows: maxR + 1,
        cols: maxC + 1
    });

    // Track unique players to handle duplicates (same player on multiple tiles)
    const playerCache = new Map(); // name -> player object

    for (const item of items) {
        // Skip grey/empty tiles — they remain unassigned
        if (item.name === '__GREY__' || !item.name || !item.name.trim()) continue;

        let player;

        // Check if we've already created this player
        if (playerCache.has(item.name)) {
            player = playerCache.get(item.name);
        } else {
            // Create new player using state.addPlayer()
            player = state.addPlayer({
                name: item.name,
                expertCategory: item.category,
                hasTimeBoost: item.hasTimeBoost
            });
            playerCache.set(item.name, player);
        }

        // Set tile owner using the proper API
        state.setTileOwner(item.r, item.c, player.id, item.category);
    }

    // Refresh player areas
    state.refreshAreas();
}

function importSimpleList(rowsData) {
    // Expected: Name, Category
    let items = [];
    for (const row of rowsData) {
        if (row.length < 2) continue;
        items.push({ name: row[0], category: row[1] });
    }

    if (items.length === 0) return;

    if (randomizeCheck && randomizeCheck.checked) {
        // Fisher-Yates shuffle
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
    }

    // Determine grid size (closest square)
    const count = items.length;
    const side = Math.ceil(Math.sqrt(count));
    const r = side;
    const c = Math.ceil(count / side);

    rowsInput.value = r;
    colsInput.value = c;

    // Create fresh state - don't pass players parameter to avoid MIN_PLAYERS enforcement
    state = createGameState({
        rows: r,
        cols: c
    });

    // Populate grid with players from the simple list
    let idx = 0;
    for (let row = 0; row < r; row++) {
        for (let col = 0; col < c; col++) {
            if (idx < items.length) {
                const item = items[idx];

                // Create player using state.addPlayer()
                const player = state.addPlayer({
                    name: item.name,
                    expertCategory: item.category,
                    hasTimeBoost: false
                });

                // Set tile owner using the proper API
                state.setTileOwner(row, col, player.id, item.category);

                idx++;
            }
            // Empty tiles are already created by createGameState, no need to set them
        }
    }

    // Refresh player areas
    state.refreshAreas();
}



function createPopLayer() {
    const layer = document.getElementById('bg-pop-layer');
    if (!layer || layer.children.length) return;
    for (let i = 0; i < 150; i++) {
        const cell = document.createElement('div');
        cell.className = 'pop-cell';
        cell.style.animationDelay = -(Math.random() * 7) + 's';
        cell.style.animationDuration = (3.5 + Math.random() * 3.5) + 's';
        layer.appendChild(cell);
    }
}

function setBackgroundStyle(style) {
    if (!BG_STYLES.includes(style)) return;
    backgroundStyle = style;
    applyHostPreferencesToDOM();
    saveHostPreferences();
}

function setBlueVariant(variant) {
    if (!['a', 'b', 'c', 'd'].includes(variant)) return;
    blueVariant = variant;
    applyHostPreferencesToDOM();
    saveHostPreferences();
}

function setDriftSpeed(speed) {
    if (isNaN(speed)) return;
    driftSpeed = speed;
    applyHostPreferencesToDOM();
    saveHostPreferences();
}

const HOST_PREFS_KEY = 'floorHostPreferences';

function loadHostPreferences() {
    try {
        const raw = localStorage.getItem(HOST_PREFS_KEY);
        if (!raw) return;
        const p = JSON.parse(raw);
        if (p.backgroundStyle && BG_STYLES.includes(p.backgroundStyle)) backgroundStyle = p.backgroundStyle;
        if (p.blueVariant && ['a', 'b', 'c', 'd'].includes(p.blueVariant)) blueVariant = p.blueVariant;
        if (typeof p.driftSpeed === 'number') driftSpeed = p.driftSpeed;
        if (typeof p.timerSidebarWidth === 'number') timerSidebarWidth = p.timerSidebarWidth;
        if (typeof p.presentationLogoWidth === 'number') presentationLogoWidth = p.presentationLogoWidth;
        if (typeof p.isMuted === 'boolean') {
            isMuted = p.isMuted;
            updateMuteButton();
        }
    } catch (e) { console.error('Failed to load prefs', e); }
}

function saveHostPreferences() {
    try {
        const p = {
            backgroundStyle,
            blueVariant,
            driftSpeed,
            timerSidebarWidth,
            presentationLogoWidth,
            isMuted
        };
        localStorage.setItem(HOST_PREFS_KEY, JSON.stringify(p));
    } catch (e) { }
}

function updateHostPreferencesUI() {
    if (bgStyleSelect) bgStyleSelect.value = backgroundStyle;
    if (blueVariantSelect) blueVariantSelect.value = blueVariant;
    if (driftSpeedInput) driftSpeedInput.value = driftSpeed;
}

function applyHostPreferencesToDOM() {
    // Remove old classes
    BG_STYLES.forEach(s => document.body.classList.remove('bg-' + s));
    ['a', 'b', 'c', 'd'].forEach(v => document.body.classList.remove('blue-' + v));

    // Add new classes
    document.body.classList.add('bg-' + backgroundStyle);
    document.body.classList.add('blue-' + blueVariant);
    document.body.style.setProperty('--bg-drift-speed', String(driftSpeed));
    const wrapper = document.querySelector('.floor-host-body-wrapper');
    if (wrapper) wrapper.style.setProperty('--timer-sidebar-width', timerSidebarWidth + 'px');

    const logoContainer = document.getElementById('floor-presentation-logo-container');
    if (logoContainer && presentationLogoWidth) {
        logoContainer.style.width = presentationLogoWidth + 'px';
    }
}

function updateMuteButton() {
    if (muteBtn) {
        muteBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
        if (isMuted) {
            muteBtn.classList.add('floor-btn-danger'); // optional style
            // or just keep secondary, depending on taste. Let's stick to simple text change
        } else {
            muteBtn.classList.remove('floor-btn-danger');
            muteBtn.classList.add('floor-btn-secondary');
        }
    }
}


/** Timer variables */
let floorTimerRemaining = 900; // 15 mins
let floorTimerStartValue = 900;
let floorTimerInterval = null;
let floorTimerIsRunning = false;
let idleTimeoutId = null;

function updateFloorTimerDisplay() {
    const display = document.getElementById('floor-timer-display');
    const pClock = document.getElementById('floor-presentation-clock');
    if (!display) return;
    const mins = Math.floor(Math.max(0, floorTimerRemaining) / 60);
    const secs = Math.floor(Math.max(0, floorTimerRemaining) % 60);
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    display.textContent = timeStr;
    if (pClock) pClock.textContent = timeStr;
}

function startFloorTimer() {
    if (floorTimerIsRunning) {
        stopFloorTimer();
        return;
    }
    floorTimerIsRunning = true;
    const startBtn = document.getElementById('floor-timer-start-btn');
    const pStartBtn = document.getElementById('floor-presentation-start-btn');
    if (startBtn) {
        startBtn.textContent = 'Stop';
        startBtn.classList.add('running');
    }
    if (pStartBtn) {
        pStartBtn.textContent = 'Stop';
        pStartBtn.classList.add('running');
    }
    floorTimerInterval = setInterval(() => {
        floorTimerRemaining--;
        if (floorTimerRemaining <= 0) {
            floorTimerRemaining = 0;
            stopFloorTimer();
            // Auto-hide clock after 10 seconds
            if (autoHideTimeoutId) clearTimeout(autoHideTimeoutId);
            autoHideTimeoutId = setTimeout(() => {
                if (floorTimerRemaining === 0) {
                    // Close sidebar if open (this also hides presentation clock)
                    const sidebar = document.getElementById('floor-timer-sidebar');
                    if (sidebar && sidebar.classList.contains('open')) {
                        toggleFloorTimer();
                    }
                }
            }, 10000);
        }
        updateFloorTimerDisplay();
    }, 1000);
}

function stopFloorTimer() {
    floorTimerIsRunning = false;
    if (floorTimerInterval) clearInterval(floorTimerInterval);
    const startBtn = document.getElementById('floor-timer-start-btn');
    const pStartBtn = document.getElementById('floor-presentation-start-btn');
    if (startBtn) {
        startBtn.textContent = 'Start';
        startBtn.classList.remove('running');
    }
    if (pStartBtn) {
        pStartBtn.textContent = 'Start';
        pStartBtn.classList.remove('running');
    }
}

function resetFloorTimer() {
    stopFloorTimer();
    if (autoHideTimeoutId) {
        clearTimeout(autoHideTimeoutId);
        autoHideTimeoutId = null;
    }
    floorTimerRemaining = floorTimerStartValue;
    updateFloorTimerDisplay();
}

function handleTimerEdit(e) {
    const text = e.target.textContent.trim();
    const parts = text.split(':');
    let totalSeconds = 0;
    if (parts.length === 2) {
        const m = parseInt(parts[0]);
        const s = parseInt(parts[1]);
        if (!isNaN(m) && !isNaN(s)) {
            totalSeconds = (m * 60) + s;
        }
    } else if (parts.length === 1) {
        const m = parseInt(parts[0]);
        if (!isNaN(m)) totalSeconds = m * 60;
    }

    if (totalSeconds > 0) {
        floorTimerStartValue = totalSeconds;
        floorTimerRemaining = totalSeconds;
        if (autoHideTimeoutId) {
            clearTimeout(autoHideTimeoutId);
            autoHideTimeoutId = null;
        }
    }
    updateFloorTimerDisplay();
}

function resetIdleTimer() {
    const controls = document.getElementById('floor-timer-controls');
    if (!controls) return;
    controls.classList.remove('idle-hidden');
    if (idleTimeoutId) clearTimeout(idleTimeoutId);
    idleTimeoutId = setTimeout(() => {
        if (floorTimerIsRunning) {
            controls.classList.add('idle-hidden');
        }
    }, 10000);
}

function toggleFloorTimer() {
    const sidebar = document.getElementById('floor-timer-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        const isOpen = sidebar.classList.contains('open');
        const toggleBtn = document.getElementById('floor-timer-toggle');
        if (toggleBtn) toggleBtn.classList.toggle('active', isOpen);
        updatePresentationClockVisibility();
    }
}

function togglePresentationMode() {
    const overlay = document.getElementById('floor-presentation-overlay');
    const btn = document.getElementById('floor-presentation-btn');
    if (!overlay) return;

    const isHidden = overlay.getAttribute('aria-hidden') === 'true';
    overlay.setAttribute('aria-hidden', !isHidden);
    document.body.classList.toggle('presentation-active', isHidden);
    if (btn) btn.classList.toggle('active', isHidden);

    if (isHidden) updateFloorTimerDisplay();
    updatePresentationClockVisibility();
}

function updatePresentationClockVisibility() {
    const sidebar = document.getElementById('floor-timer-sidebar');
    const pClockSection = document.querySelector('.floor-presentation-clock-section');
    if (!sidebar || !pClockSection) return;

    const isTimerSidebarOpen = sidebar.classList.contains('open');
    pClockSection.style.display = isTimerSidebarOpen ? 'flex' : 'none';
}

function initPresentationFeatures() {
    const overlay = document.getElementById('floor-presentation-overlay');
    const pClock = document.getElementById('floor-presentation-clock');
    const pControls = document.getElementById('floor-presentation-timer-controls');
    const pStartBtn = document.getElementById('floor-presentation-start-btn');
    const pResetBtn = document.getElementById('floor-presentation-reset-btn');

    if (pClock) {
        pClock.addEventListener('blur', handleTimerEdit);
        pClock.addEventListener('focus', stopFloorTimer);
        pClock.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                pClock.blur();
            }
        });
    }

    if (pStartBtn) pStartBtn.addEventListener('click', startFloorTimer);
    if (pResetBtn) pResetBtn.addEventListener('click', resetFloorTimer);

    // Idle Hide for Presentation Controls (3s)
    let pIdleTimeout = null;
    function resetPIdleTimer() {
        if (!pControls) return;
        pControls.classList.remove('idle-hidden');
        const resizer = document.getElementById('floor-logo-resizer');
        if (resizer) resizer.classList.remove('idle-hidden');

        if (pIdleTimeout) clearTimeout(pIdleTimeout);
        pIdleTimeout = setTimeout(() => {
            if (floorTimerIsRunning || overlay.getAttribute('aria-hidden') === 'false') {
                pControls.classList.add('idle-hidden');
                if (resizer) resizer.classList.add('idle-hidden');
            }
        }, 3000);
    }
    document.addEventListener('mousemove', resetPIdleTimer);
    document.addEventListener('keydown', resetPIdleTimer);

    // Logo Resizer
    const resizer = document.getElementById('floor-logo-resizer');
    const logoContainer = document.getElementById('floor-presentation-logo-container');
    if (resizer && logoContainer) {
        let isResizing = false;
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'nwse-resize';
            e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const rect = logoContainer.getBoundingClientRect();
            // Resizing from bottom-right, so new width is mouseX - rectLeft
            const newWidth = e.clientX - rect.left;
            if (newWidth > 100 && newWidth < window.innerWidth * 0.95) {
                presentationLogoWidth = newWidth;
                logoContainer.style.width = newWidth + 'px';
            }
        });
        window.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                saveHostPreferences();
            }
        });
    }
}

function toggleAnthem() {
    if (anthemAudio) {
        if (!anthemAudio.paused) {
            anthemAudio.pause();
            return;
        }
        anthemAudio.currentTime = 0;
        anthemAudio.play().catch(e => console.error('Audio play failed', e));
    } else {
        anthemAudio = new Audio('../sounds/MainAnthem.mp3');
        anthemAudio.muted = isMuted;
        anthemAudio.play().catch(e => console.error('Audio play failed', e));
    }
}

let headerIdleTimeout = null;
function initHeaderAutoHide() {
    const header = document.querySelector('.floor-host-header');
    if (!header) return;

    function showHeader() {
        header.classList.remove('header-idle');
        if (headerIdleTimeout) clearTimeout(headerIdleTimeout);
    }

    function startHeaderIdleTimer() {
        if (headerIdleTimeout) clearTimeout(headerIdleTimeout);
        headerIdleTimeout = setTimeout(() => {
            header.classList.add('header-idle');
        }, 5000);
    }

    window.addEventListener('mousemove', (e) => {
        // If mouse is in top 150px, show header
        if (e.clientY < 150) {
            showHeader();
        } else {
            // Only start counting down if it's currently showing
            if (!header.classList.contains('header-idle') && !headerIdleTimeout) {
                startHeaderIdleTimer();
            } else if (!header.classList.contains('header-idle')) {
                // If moving outside header area, keep/reset the timer
                startHeaderIdleTimer();
            }
        }
    });

    // Start hidden or visible? Let's start visible then hide after 5s.
    startHeaderIdleTimer();
}

function handleGridDblClick(e) {
    const tile = getTileFromTarget(e.target);
    if (tile) {
        startBattleMode(tile);
    }
}

function initResizableTimerSidebar() {
    const resizer = document.getElementById('floor-timer-resizer');
    const sidebar = document.getElementById('floor-timer-sidebar');
    const wrapper = document.querySelector('.floor-host-body-wrapper');
    if (!resizer || !sidebar || !wrapper) return;

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        // Sidebar is on the right, so width is (windowWidth - mouseX)
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 150 && newWidth < window.innerWidth * 0.8) {
            timerSidebarWidth = newWidth;
            wrapper.style.setProperty('--timer-sidebar-width', timerSidebarWidth + 'px');
        }
    });

    window.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            saveHostPreferences();
        }
    });
}

function init() {
    state = buildState(DEFAULT_ROWS, DEFAULT_COLS);

    gridEl.addEventListener('contextmenu', handleContextMenu);
    gridEl.addEventListener('click', handleGridClick);
    gridEl.addEventListener('dblclick', handleGridDblClick);

    contextMenuEl.addEventListener('click', handleContextAction);

    editFormEl.addEventListener('submit', handleEditSubmit);
    editCancelBtn.addEventListener('click', handleEditCancel);

    if (swapCancelBtn) {
        swapCancelBtn.addEventListener('click', () => {
            if (battleState.active) cancelBattleMode();
            else if (swapState.active) cancelSwapMode();
        });
    }
    if (challengerWinsBtn) challengerWinsBtn.addEventListener('click', handleDuelChallengerWins);
    if (defenderWinsBtn) defenderWinsBtn.addEventListener('click', handleDuelDefenderWins);
    if (duelCancelBtn) duelCancelBtn.addEventListener('click', handleDuelCancel);

    // Kill modal listeners
    if (killConfirmBtn) killConfirmBtn.addEventListener('click', confirmKill);
    if (killCancelBtn) killCancelBtn.addEventListener('click', hideKillModal);

    if (pickBtn) pickBtn.addEventListener('click', handleRandomizerToggle);
    if (randomizerDismissBtn) randomizerDismissBtn.addEventListener('click', dismissRandomizer);
    if (undoBtn) undoBtn.addEventListener('click', handleUndo);
    if (muteBtn) muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        updateMuteButton();
        if (currentAudio) currentAudio.muted = isMuted;
        if (anthemAudio) anthemAudio.muted = isMuted;
        saveHostPreferences();
    });

    // Background controls
    if (bgStyleSelect) {
        bgStyleSelect.addEventListener('change', (e) => setBackgroundStyle(e.target.value));
    }
    if (blueVariantSelect) {
        blueVariantSelect.addEventListener('change', (e) => setBlueVariant(e.target.value));
    }
    if (driftSpeedInput) {
        driftSpeedInput.addEventListener('input', (e) => setDriftSpeed(parseFloat(e.target.value)));
    }

    // Timer controls
    const timerToggle = document.getElementById('floor-timer-toggle');
    if (timerToggle) timerToggle.addEventListener('click', toggleFloorTimer);

    const presentationToggle = document.getElementById('floor-presentation-btn');
    if (presentationToggle) presentationToggle.addEventListener('click', togglePresentationMode);

    const timerStartBtn = document.getElementById('floor-timer-start-btn');
    if (timerStartBtn) timerStartBtn.addEventListener('click', startFloorTimer);

    const timerResetBtn = document.getElementById('floor-timer-reset-btn');
    if (timerResetBtn) timerResetBtn.addEventListener('click', resetFloorTimer);

    const timerDisplay = document.getElementById('floor-timer-display');
    if (timerDisplay) {
        timerDisplay.addEventListener('blur', handleTimerEdit);
        timerDisplay.addEventListener('focus', () => {
            stopFloorTimer();
        });
        timerDisplay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                timerDisplay.blur();
            }
        });
    }

    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keydown', resetIdleTimer);

    createPopLayer();
    initResizableTimerSidebar();
    initPresentationFeatures();
    initHeaderAutoHide();
    loadHostPreferences();
    updateHostPreferencesUI();
    applyHostPreferencesToDOM();

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleClickOutside);

    applyBtn.addEventListener('click', applyGrid);
    rowsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') applyGrid();
    });
    colsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') applyGrid();
    });

    for (const r of displayRadios) {
        r.addEventListener('change', () => render());
    }

    if (importBtn) {
        importBtn.addEventListener('click', () => {
            if (importFile) importFile.click();
        });
    }
    if (importFile) {
        importFile.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleImport(e.target.files[0]);
                e.target.value = '';
            }
        });
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }

    // Header toggle
    const headerToggle = document.getElementById('floor-header-toggle');
    const controlsContainer = document.getElementById('floor-controls-container');
    if (headerToggle && controlsContainer) {
        headerToggle.addEventListener('click', () => {
            controlsContainer.classList.toggle('collapsed');
            const isCollapsed = controlsContainer.classList.contains('collapsed');
            headerToggle.setAttribute('aria-expanded', !isCollapsed);
        });
    }

    updateUndoButton();
    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export { animationHooks };

