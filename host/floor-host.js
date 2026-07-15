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
const muteBtn = document.getElementById('floor-mute-btn');
const setupModalEl = document.getElementById('floor-setup-modal');
const setupOpenBtn = document.getElementById('floor-setup-open-btn');
const setupCloseBtn = document.getElementById('floor-setup-close');
const statsModalEl = document.getElementById('floor-stats-modal');
const statsCloseBtn = document.getElementById('floor-stats-close');
const statsBodyEl = document.getElementById('floor-stats-body');
let statsSortCol = 'tiles';
let statsSortAsc = false;
const bgStyleSelect = document.getElementById('floor-bg-style');
const blueVariantSelect = document.getElementById('floor-blue-variant');
const driftSpeedInput = document.getElementById('floor-drift-speed');
const randomizerHelpBtn = document.getElementById('floor-randomizer-help');
const randomizerHelpModalEl = document.getElementById('floor-randomizer-help-modal');
const randomizerHelpCloseBtn = document.getElementById('floor-randomizer-help-close');

/** Kill modal DOM refs */
const killModalEl = document.getElementById('floor-kill-modal');
const killPlayerNameEl = document.getElementById('floor-kill-player-name');
const killConfirmBtn = document.getElementById('floor-kill-confirm');
const killCancelBtn = document.getElementById('floor-kill-cancel');
const killContextBtn = document.querySelector('[data-action="kill"]');
let killTarget = null;

/** Golden Square DOM refs */
const goldenToggleEl = document.getElementById('floor-golden-square-toggle');
const goldenAnnouncementEl = document.getElementById('floor-golden-announcement');
const goldenDismissBtn = document.getElementById('floor-golden-dismiss');
if (goldenToggleEl) goldenToggleEl.checked = false;

/** Developer Mode state & DOM refs */
let isDevMode = false;
const devSidebarEl = document.getElementById('floor-dev-sidebar');
const devGoldenPosEl = document.getElementById('floor-dev-golden-pos');
const devRandomizerPickEl = document.getElementById('floor-dev-randomizer-pick');
const devStatusEl = document.getElementById('floor-dev-status');

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
let useGoldenSquare = false; // Default to false as requested
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

/** Blocks re-entry during duel/swap animations. */
let uiBusy = false;

/** Pending setTimeout ids for swap/duel animations — cleared on undo/cancel. */
let pendingAnimationTimeouts = [];

/** Golden square announced but not yet consumed (consume on duel result only). */
let pendingGoldenUse = false;

/** Randomizer: { active, timeoutId } — timeoutId used to cancel. */
let randomizerState = null;

/** When set, show "SELECTED: X" and highlight tile; dismiss clears and re-renders. */
let randomizerResult = null;

/** Undo manager. */
const undoManager = createUndoManager();

/** ========== AUTO-SAVE / RESUME ========== */
const FLOOR_STATE_KEY = 'floorHostState';

function saveFloorState() {
    if (!state) return;
    try {
        const snap = state.snapshot();
        const serializable = {
            rows: snap.rows,
            cols: snap.cols,
            grid: snap.grid.map(row => row.map(t => ({ row: t.row, col: t.col, ownerId: t.ownerId, category: t.category }))),
            players: snap.players.map(p => ({
                id: p.id, name: p.name, expertCategory: p.expertCategory,
                area: p.area, duelCount: p.duelCount, hasDueled: p.hasDueled,
                hasTimeBoost: p.hasTimeBoost, eliminated: p.eliminated
            })),
            goldenTile: snap.goldenTile || null,
            savedAt: Date.now()
        };
        localStorage.setItem(FLOOR_STATE_KEY, JSON.stringify(serializable));
    } catch (e) { console.warn('Auto-save failed:', e); }
}

function clearFloorState() {
    try { localStorage.removeItem(FLOOR_STATE_KEY); } catch (e) { }
}

function loadFloorState() {
    try {
        const raw = localStorage.getItem(FLOOR_STATE_KEY);
        if (!raw) return false;
        const saved = JSON.parse(raw);
        // Only offer resume if less than 24 hours old
        if (Date.now() - saved.savedAt > 86400000) {
            clearFloorState();
            return false;
        }
        if (!confirm('A saved Floor board was found. Resume where you left off?')) {
            clearFloorState();
            return false;
        }
        // Rebuild state from saved data
        state = createGameState({
            rows: saved.rows,
            cols: saved.cols,
            players: saved.players.map(p => ({
                name: p.name,
                expertCategory: p.expertCategory,
                hasTimeBoost: p.hasTimeBoost
            }))
        });
        // Restore grid tile assignments
        for (let r = 0; r < saved.rows; r++) {
            for (let c = 0; c < saved.cols; c++) {
                const savedTile = saved.grid[r][c];
                state.grid[r][c].ownerId = savedTile.ownerId;
                state.grid[r][c].category = savedTile.category;
            }
        }
        // Restore player properties (duelCount, eliminated, etc.)
        // Need to map saved IDs to new IDs since createGameState generates fresh IDs
        const idMap = new Map();
        for (let i = 0; i < saved.players.length && i < state.players.length; i++) {
            idMap.set(saved.players[i].id, state.players[i].id);
            state.players[i].duelCount = saved.players[i].duelCount || 0;
            state.players[i].hasDueled = saved.players[i].hasDueled || false;
            state.players[i].eliminated = saved.players[i].eliminated || false;
        }
        // Remap grid ownerIds from saved IDs to new IDs
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                const oldId = state.grid[r][c].ownerId;
                if (oldId && idMap.has(oldId)) {
                    state.grid[r][c].ownerId = idMap.get(oldId);
                } else if (oldId) {
                    state.grid[r][c].ownerId = '';
                    state.grid[r][c].category = '';
                }
            }
        }
        // Restore golden tile
        if (saved.goldenTile) {
            state.goldenTile = { r: saved.goldenTile.r, c: saved.goldenTile.c };
        }
        state.refreshAreas();
        // Update grid dimension inputs
        if (rowsInput) rowsInput.value = String(saved.rows);
        if (colsInput) colsInput.value = String(saved.cols);
        return true;
    } catch (e) {
        console.error('Failed to restore Floor state:', e);
        clearFloorState();
        return false;
    }
}

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
const NAMES = ['Boston Rob', 'Parvati', 'Sandra', 'Brandon', 'Rob C.', 'Sam', 'Gible', 'Derek', 'Tony', 'Kim', 'Jeremy', 'Sarah', 'Yul', 'Natalie', 'Tyson', 'Sophie', 'Denise', 'Ethan', 'Amber', 'Todd', 'Earl', 'JT', 'Fabio', 'Cochran', 'Wendell', 'Tommy', 'Ben', 'Adam', 'Nick', 'Chris', 'Michele'];
const CATEGORIES = ['History', 'Geography', 'Science', 'Math', 'Literature', 'Art', 'Music', 'Movies', 'Sports', 'Food', 'Animals', 'Technology', 'Politics', 'Religion', 'Mythology', 'Language', 'Fashion', 'Architecture', 'Business', 'Economics', 'Psychology', 'Sociology', 'Philosophy', 'Physics', 'Chemistry', 'Biology'];

for (let i = 0; i < 400; i++) {
    const nameCycle = Math.floor(i / NAMES.length);
    const categoryCycle = Math.floor(i / CATEGORIES.length);
    const name = NAMES[i % NAMES.length] + (nameCycle > 0 ? ` ${nameCycle + 1}` : '');
    const category = CATEGORIES[i % CATEGORIES.length] + (categoryCycle > 0 ? ` ${categoryCycle + 1}` : '');
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

    if (useGoldenSquare) {
        assignGoldenSquare(s);
    }

    return s;
}

function assignGoldenSquare(s) {
    const validTiles = [];
    for (let r = 0; r < s.rows; r++) {
        for (let c = 0; c < s.cols; c++) {
            const t = s.getTile(r, c);
            if (t && t.ownerId) {
                validTiles.push({ r, c });
            }
        }
    }
    if (validTiles.length > 0) {
        const picked = validTiles[Math.floor(Math.random() * validTiles.length)];
        s.goldenTile = picked;
        updateDevSidebar();
    }
}

function updateDevSidebar() {
    if (!devSidebarEl) return;
    if (state && state.goldenTile) {
        devGoldenPosEl.textContent = `(${state.goldenTile.r}, ${state.goldenTile.c})`;
        const tile = state.getTile(state.goldenTile.r, state.goldenTile.c);
        if (tile) {
            devGoldenPosEl.textContent += ` - ${tile.category || 'No Category'}`;
        }
    } else {
        devGoldenPosEl.textContent = 'Not Assigned';
    }
    devSidebarEl.classList.toggle('active', isDevMode);
}

function toggleDevMode() {
    isDevMode = !isDevMode;
    updateDevSidebar();
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
    if (gridEl) gridEl.classList.remove('floor-swap-mode', 'floor-grid--steal-active');
    document.body.classList.remove('floor-swap-mode');
    render();
}

/** Abort an in-flight swap (Escape / Undo) — clears pending timeouts so categories are not applied late. */
function abortInFlightSwap() {
    clearPendingAnimations();
    if (swapOverlayEl) {
        swapOverlayEl.setAttribute('aria-hidden', 'true');
        swapOverlayEl.innerHTML = '';
        swapOverlayEl.classList.remove('floor-flash', 'floor-flash-fade');
    }
    const main = document.querySelector('.floor-host-main');
    if (main) main.classList.remove('floor-shake');
    cancelSwapMode();
    uiBusy = false;
}

function startBattleMode(attacker) {
    if (uiBusy || !attacker || !state) return;
    dismissRandomizer();

    const clickedTile = state.getTile(attacker.r, attacker.c);
    const subjectOwnerId = clickedTile?.ownerId || null;

    // Precompute candidates once (avoid rebuilding inside every render cell)
    const candidates = new Set();
    const candidateOwners = new Set();
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
                    candidates.add(`${n.r},${n.c}`);
                    candidateOwners.add(tObj.ownerId);
                }
            }
        }
    }

    battleState = {
        active: true,
        challenger: { r: attacker.r, c: attacker.c },
        defender: null,
        candidates,
        candidateOwners,
    };
    if (swapPromptEl) swapPromptEl.textContent = 'Select defender (opponent)';
    if (gridEl) gridEl.classList.add('floor-battle-mode');
    document.body.classList.add('floor-battle-mode');
    render();
}

function trackTimeout(fn, ms) {
    const id = setTimeout(() => {
        pendingAnimationTimeouts = pendingAnimationTimeouts.filter((t) => t !== id);
        fn();
    }, ms);
    pendingAnimationTimeouts.push(id);
    return id;
}

function clearPendingAnimations() {
    for (const id of pendingAnimationTimeouts) clearTimeout(id);
    pendingAnimationTimeouts = [];
}

function cancelBattleMode() {
    pendingGoldenUse = false;
    uiBusy = false;
    if (goldenAnnouncementEl) goldenAnnouncementEl.setAttribute('aria-hidden', 'true');
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
    if (uiBusy) return;
    const t1 = state.getTile(first.r, first.c);
    const t2 = state.getTile(second.r, second.c);
    if (!t1 || !t2) return;
    uiBusy = true;
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
    trackTimeout(() => {
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
        trackTimeout(() => {
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
        uiBusy = false;
        updateUndoButton();

        // 5. Cleanup Overlay (after flash fades)
        trackTimeout(() => {
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
    uiBusy = false;
    render();
    updateUndoButton();
}

function updateUndoButton() {
    if (undoBtn) undoBtn.disabled = !undoManager.canUndo();
    saveFloorState();
}

function handleUndo() {
    if (!state) return;

    // Allow Undo to abort an in-flight swap; block during duel elim animation
    if (uiBusy) {
        const swapOverlayOpen = swapOverlayEl && swapOverlayEl.getAttribute('aria-hidden') === 'false';
        if (swapState.active || swapOverlayOpen) {
            abortInFlightSwap();
        } else {
            return;
        }
    }

    if (!undoManager.canUndo()) return;

    pendingGoldenUse = false;
    undoManager.undo(state);
    if (gridEl) {
        gridEl.classList.add('floor-grid--undo-revert');
        render();
        trackTimeout(() => {
            gridEl.classList.remove('floor-grid--undo-revert');
        }, 520);
    } else {
        render();
    }
    updateUndoButton();
    updateDevSidebar();
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
    if (!battleState.active || !battleState.challenger || !tile || !state) return;
    const c = battleState.challenger;
    const subjectTile = state.getTile(c.r, c.c);
    const subjectOwner = subjectTile ? subjectTile.ownerId : null;

    // getTileFromTarget only has r/c — resolve ownership from game state
    const clicked = state.getTile(tile.r, tile.c);
    if (!clicked?.ownerId) return;
    if (clicked.ownerId === subjectOwner) return; // Clicked self

    // Valid if this player shares ANY border contact with the challenger's territory
    let validDefenderTile = null;

    if (battleState.candidateOwners && battleState.candidateOwners.has(clicked.ownerId)) {
        // Prefer the clicked cell if it is itself a contact point
        const clickCoord = `${tile.r},${tile.c}`;
        if (battleState.candidates && battleState.candidates.has(clickCoord)) {
            validDefenderTile = { r: tile.r, c: tile.c };
        } else if (battleState.candidates) {
            for (const coord of battleState.candidates) {
                const [r, c0] = coord.split(',').map(Number);
                const t = state.getTile(r, c0);
                if (t && t.ownerId === clicked.ownerId) {
                    validDefenderTile = { r, c: c0 };
                    break;
                }
            }
        }
    }

    // Fallback: orthogonal adjacency to the double-clicked challenger tile (1x1 cases)
    if (!validDefenderTile) {
        const dist = Math.abs(tile.r - c.r) + Math.abs(tile.c - c.c);
        if (dist === 1) {
            validDefenderTile = { r: tile.r, c: tile.c };
        }
    }

    if (!validDefenderTile) {
        if (swapPromptEl) swapPromptEl.textContent = 'Not a valid defender (must be adjacent to territory)';
        return;
    }

    // Remap challenger to a border tile that actually touches the defender contact
    let validSubjectTile = c;
    if (subjectOwner) {
        const ownedTiles = state.getTilesOwnedBy(subjectOwner);
        for (const t of ownedTiles) {
            const dist = Math.abs(t.row - validDefenderTile.r) + Math.abs(t.col - validDefenderTile.c);
            if (dist === 1) {
                validSubjectTile = { r: t.row, c: t.col };
                break;
            }
        }
    }

    battleState.challenger = validSubjectTile;
    battleState.defender = validDefenderTile;

    const v = validateBattle(
        state,
        validSubjectTile.r, validSubjectTile.c,
        validDefenderTile.r, validDefenderTile.c
    );
    if (!v.valid) {
        if (swapPromptEl) swapPromptEl.textContent = v.error || 'Not a valid battle';
        return;
    }

    // Flash whole defender territory before duel overlay
    if (uiBusy) return;
    uiBusy = true;

    const defenderOwnerId = clicked.ownerId;
    if (defenderOwnerId) {
        const defTiles = state.getTilesOwnedBy(defenderOwnerId);
        for (const t of defTiles) {
            const el = getTileEl(t.row, t.col);
            if (el) {
                el.classList.remove('floor-tile--battle-candidate');
                el.classList.add('floor-tile--battle-defender', 'floor-tile--battle-lockin');
            }
        }
    }
    // Let the lock-in paint, then open duel
    requestAnimationFrame(() => {
        setTimeout(() => {
            uiBusy = false;
            showDuelOverlay();
        }, 160);
    });
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

    // Dev Tool: Reset randomizer pick when a battle is finalized
    if (devRandomizerPickEl) devRandomizerPickEl.textContent = '---';

    const { r: cr, c: cc } = battleState.challenger;
    const { r: dr, c: dc } = battleState.defender;
    const challengerTile = state.getTile(cr, cc);
    const defenderTile = state.getTile(dr, dc);
    const challengerPlayer = challengerTile?.ownerId ? state.getPlayer(challengerTile.ownerId) : null;
    const defenderPlayer = defenderTile?.ownerId ? state.getPlayer(defenderTile.ownerId) : null;
    const category = getBattleCategory(state, cr, cc, dr, dc);
    if (!challengerPlayer || !defenderPlayer) return;

    if (duelVsEl) duelVsEl.textContent = `${challengerPlayer.name} vs ${defenderPlayer.name}`;
    if (duelCategoryEl) duelCategoryEl.textContent = category;
    if (challengerWinsBtn) challengerWinsBtn.textContent = `${challengerPlayer.name} wins`;
    if (defenderWinsBtn) defenderWinsBtn.textContent = `${defenderPlayer.name} wins`;

    // Reset visibility before logic
    if (goldenAnnouncementEl) goldenAnnouncementEl.setAttribute('aria-hidden', 'true');

    // Check for Golden Square (Area-wide logic) — defer consume until duel result
    if (useGoldenSquare && state.goldenTile) {
        const goldenOwnerId = state.getTile(state.goldenTile.r, state.goldenTile.c)?.ownerId;
        if (goldenOwnerId && defenderPlayer.id === goldenOwnerId) {
            pendingGoldenUse = true;
            updateDevSidebar();
            showGoldenAnnouncement();
            return; // Wait for dismissal to show duel overlay
        }
    }

    proceedToDuel(challengerPlayer, defenderPlayer, category);
}

function showGoldenAnnouncement() {
    if (goldenAnnouncementEl) {
        goldenAnnouncementEl.setAttribute('aria-hidden', 'false');
    }
}

function dismissGoldenAnnouncement() {
    if (goldenAnnouncementEl) {
        goldenAnnouncementEl.setAttribute('aria-hidden', 'true');
    }
    // After dismissal, proceed to the duel overlay
    const { r: cr, c: cc } = battleState.challenger;
    const { r: dr, c: dc } = battleState.defender;
    const challengerTile = state.getTile(cr, cc);
    const defenderTile = state.getTile(dr, dc);
    const challengerPlayer = challengerTile?.ownerId ? state.getPlayer(challengerTile.ownerId) : null;
    const defenderPlayer = defenderTile?.ownerId ? state.getPlayer(defenderTile.ownerId) : null;
    const category = getBattleCategory(state, cr, cc, dr, dc);

    proceedToDuel(challengerPlayer, defenderPlayer, category);
}

function proceedToDuel(challengerPlayer, defenderPlayer, category) {
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

async function applyDuelResult(winnerIsChallenger) {
    if (uiBusy || !state || !battleState.defender || !battleState.challenger) return;
    uiBusy = true;

    const { r: cr, c: cc } = battleState.challenger;
    const { r: dr, c: dc } = battleState.defender;
    const challenger = state.getTile(cr, cc);
    const defender = state.getTile(dr, dc);
    const loserId = winnerIsChallenger ? defender?.ownerId : challenger?.ownerId;
    const wonTiles = loserId ? state.getTilesOwnedBy(loserId).map((t) => ({ r: t.row, c: t.col })) : [];

    // Lock battle state to prevent double-clicks
    battleState.active = false;
    hideDuelOverlay();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
        // Phase 1: Elimination Animation (capped particles — 20/tile was a main-thread bottleneck)
        const particlesPerTile = reduceMotion
            ? 0
            : Math.max(2, Math.min(5, Math.floor(36 / Math.max(1, wonTiles.length))));

        for (const { r, c } of wonTiles) {
            const el = getTileEl(r, c);
            if (!el) continue;
            el.classList.add('floor-tile--eliminating');
            if (particlesPerTile === 0) continue;

            const frag = document.createDocumentFragment();
            for (let i = 0; i < particlesPerTile; i++) {
                const particle = document.createElement('div');
                particle.className = 'floor-tile-particle';
                const angle = Math.random() * Math.PI * 2;
                const dist = 40 + Math.random() * 55;
                particle.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
                particle.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
                particle.style.left = '50%';
                particle.style.top = '50%';
                frag.appendChild(particle);
            }
            el.appendChild(frag);
        }

        if (wonTiles.length > 0) {
            await new Promise((res) => setTimeout(res, reduceMotion ? 120 : 480));
        }

        // Phase 2: State Update & Takeover Animation
        undoManager.push(state);
        const result = applyBattleResult(state, cr, cc, dr, dc, winnerIsChallenger);
        if (!result.success) {
            render(); // clear eliminating classes
            if (swapPromptEl) swapPromptEl.textContent = result.error || 'Battle failed';
            return;
        }

        if (pendingGoldenUse) {
            state.goldenTile = null;
            pendingGoldenUse = false;
            updateDevSidebar();
        }

        const winner = state.getPlayer(result.winnerId);
        const loser = state.getPlayer(result.loserId);
        if (winner && loser) animationHooks.onDuelEnd(winner, loser);

        if (gridEl) gridEl.classList.remove('floor-battle-mode');
        document.body.classList.remove('floor-battle-mode');
        if (swapPromptEl) swapPromptEl.textContent = '';

        render();
        updateUndoButton();

        for (const { r, c } of wonTiles) {
            const el = getTileEl(r, c);
            if (el) el.classList.add('floor-tile--takeover');
        }
        trackTimeout(() => {
            gridEl?.querySelectorAll('.floor-tile--takeover').forEach((el) => el.classList.remove('floor-tile--takeover'));
            updateUndoButton();
        }, reduceMotion ? 80 : 520);
    } finally {
        battleState = { active: false, defender: null, challenger: null };
        uiBusy = false;
    }
}

function handleDuelChallengerWins() {
    applyDuelResult(true);
}

function handleDuelDefenderWins() {
    applyDuelResult(false);
}

function handleDuelCancel() {
    pendingGoldenUse = false;
    if (goldenAnnouncementEl) goldenAnnouncementEl.setAttribute('aria-hidden', 'true');
    battleState = { active: false, defender: null, challenger: null };
    if (gridEl) gridEl.classList.remove('floor-battle-mode');
    document.body.classList.remove('floor-battle-mode');
    if (swapPromptEl) swapPromptEl.textContent = '';
    hideDuelOverlay();
    render();
    updateDevSidebar();
}

function runRandomizer() {
    if (!state || randomizerState) return;

    // Ensure area counts are fresh before selection
    state.refreshAreas();

    const statusEl = document.getElementById('floor-debug-status');
    const modeSelect = document.getElementById('floor-randomizer-mode');
    const strategy = modeSelect ? modeSelect.value : 'show';

    // Consolidated selection logic from floor-core
    const selectedPlayer = pickOne(state, { strategy });

    if (!selectedPlayer) {
        alert('No eligible players with tiles.');
        return;
    }

    const eligible = getEligiblePlayers(state);
    if (statusEl) statusEl.textContent = `Randomizer: Pool ${eligible.length} eligible`;

    // Cycle through eligible players; highlight each player's full territory
    const ordered = getOrderedEligible(state, { strategy });
    let rapidPlayers = ordered.filter((p) => state.getTilesOwnedBy(p.id).length > 0);

    if (rapidPlayers.length === 0) {
        rapidPlayers = [selectedPlayer];
    }

    const winnerTiles = state.getTilesOwnedBy(selectedPlayer.id);
    if (winnerTiles.length === 0) {
        alert('Selected player has no tiles!');
        return;
    }

    randomizerResult = null;
    if (randomizerResultEl) randomizerResultEl.setAttribute('aria-hidden', 'true');
    if (gridEl) gridEl.classList.add('floor-grid--randomizer-active');
    if (pickBtn) {
        pickBtn.textContent = 'Stop the Randomizer';
        pickBtn.classList.add('floor-btn--stop');
    }

    // Dev Tool: Leak the winner immediately in the console
    if (devRandomizerPickEl) {
        devRandomizerPickEl.textContent = `${selectedPlayer.name} (${selectedPlayer.expertCategory})`;
    }

    // Play randomizer sound effect (always play but respect mute state)
    const audio = new Audio('../sounds/randomizer.mp3');
    currentAudio = audio;
    audio.muted = isMuted;
    audio.play().catch(err => console.warn('Audio play failed:', err));

    // Animation Timing: Target ~13 seconds to match audio.
    // Phase 1: Rapid constant speed. Phase 2: Slowing down to winner.

    const RAPID_COUNT = 100; // 100 steps at 80ms = 8 seconds
    const SLOW_COUNT = 10;  // 10 steps over ~5 seconds

    const combinedSteps = [];

    for (let i = 0; i < RAPID_COUNT; i++) {
        combinedSteps.push(rapidPlayers[i % rapidPlayers.length]);
    }

    for (let i = 0; i < SLOW_COUNT; i++) {
        if (i === SLOW_COUNT - 1) {
            combinedSteps.push(selectedPlayer);
        } else {
            combinedSteps.push(rapidPlayers[(RAPID_COUNT + i) % rapidPlayers.length]);
        }
    }

    let delay = 200;
    let idx = 0;
    let prevPlayerId = null;

    function clearHighlight(playerId) {
        if (!playerId || !state) return;
        for (const t of state.getTilesOwnedBy(playerId)) {
            const el = getTileEl(t.row, t.col);
            if (el) {
                el.classList.remove('floor-tile--randomizer-active', 'floor-tile--randomizer-selected');
            }
        }
    }

    function setHighlight(player, selected) {
        if (!player || !state) return;
        for (const t of state.getTilesOwnedBy(player.id)) {
            const el = getTileEl(t.row, t.col);
            if (el) {
                el.classList.add(selected ? 'floor-tile--randomizer-selected' : 'floor-tile--randomizer-active');
            }
        }
    }

    function tick() {
        clearHighlight(prevPlayerId);
        if (idx >= combinedSteps.length) {
            stopRandomizerRun(selectedPlayer);
            return;
        }

        const current = combinedSteps[idx];
        const isSlowPhase = idx >= RAPID_COUNT;

        setHighlight(current, false);
        prevPlayerId = current.id;
        idx++;

        if (isSlowPhase) {
            delay = delay * 1.35;
        } else {
            delay = 80;
        }

        const tid = setTimeout(tick, delay);
        randomizerState = randomizerState || {};
        randomizerState.timeoutId = tid;
    }

    randomizerState = { active: true };
    tick();
}

function stopRandomizerRun(selectedPlayer) {
    const tid = randomizerState && randomizerState.timeoutId;
    randomizerState = null;
    if (tid) clearTimeout(tid);
    if (gridEl) gridEl.classList.remove('floor-grid--randomizer-active');

    // Light up the winner's entire territory
    if (state && selectedPlayer) {
        for (const t of state.getTilesOwnedBy(selectedPlayer.id)) {
            const el = getTileEl(t.row, t.col);
            if (el) {
                el.classList.remove('floor-tile--randomizer-active');
                el.classList.add('floor-tile--randomizer-selected');
            }
        }
    }

    const firstTile = state.getTilesOwnedBy(selectedPlayer.id)[0];
    randomizerResult = {
        r: firstTile ? firstTile.row : 0,
        c: firstTile ? firstTile.col : 0,
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name
    };
    if (randomizerLabelEl) randomizerLabelEl.textContent = `SELECTED: ${selectedPlayer.name}`;
    if (randomizerResultEl) randomizerResultEl.setAttribute('aria-hidden', 'false');
    animationHooks.onRandomizerComplete(selectedPlayer);
}

function cancelRandomizer() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    if (!randomizerState && !randomizerResult) return;

    // Clear dev pick when cancelled
    if (devRandomizerPickEl) devRandomizerPickEl.textContent = '---';

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

    // Clear dev pick when dismissed
    if (devRandomizerPickEl) devRandomizerPickEl.textContent = '---';

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
        } else if (setupModalEl && setupModalEl.getAttribute('aria-hidden') === 'false') {
            hideSetupModal();
        } else if (statsModalEl && statsModalEl.getAttribute('aria-hidden') === 'false') {
            hideStatsModal();
        } else if (goldenAnnouncementEl && goldenAnnouncementEl.getAttribute('aria-hidden') === 'false') {
            handleDuelCancel();
        } else if (duelOverlayEl && duelOverlayEl.getAttribute('aria-hidden') === 'false') {
            handleDuelCancel();
        } else if (randomizerResult) {
            dismissRandomizer();
        } else if (randomizerState) {
            cancelRandomizer();
        } else if (battleState.active) {
            cancelBattleMode();
        } else if (swapState.active) {
            abortInFlightSwap();
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
    if (key === 'm') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        toggleMute();
    }
    if (key === 'z') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        toggleDevMode();
    }
    if (key === 's') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        toggleStatsModal();
    }
}

function toggleMute() {
    isMuted = !isMuted;
    updateMuteButton();
    if (currentAudio) currentAudio.muted = isMuted;
    if (anthemAudio) anthemAudio.muted = isMuted;
    saveHostPreferences();
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
                cell.style.border = '1px solid rgba(255,255,255,0.3)';
                cell.style.color = '#fff';
                cell.style.minHeight = '20px';
                cell.setAttribute('role', 'gridcell');
                cell.dataset.row = String(r);
                cell.dataset.col = String(c);
                if (state.goldenTile && state.goldenTile.r === r && state.goldenTile.c === c) {
                    cell.dataset.golden = 'true';
                }
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
                if (battleState.active && battleState.challenger) {
                    const c = battleState.challenger;
                    const clickedTile = state.getTile(c.r, c.c);
                    const subjectOwnerId = clickedTile?.ownerId;

                    const isSubject = tile.ownerId === subjectOwnerId;
                    let isCandidate = false;

                    if (tile.ownerId && battleState.candidateOwners && battleState.candidateOwners.has(tile.ownerId)) {
                        isCandidate = true;
                    }

                    const defenderOwnerId = battleState.defender
                        ? state.getTile(battleState.defender.r, battleState.defender.c)?.ownerId
                        : null;
                    const isDefenderTerritory = defenderOwnerId && tile.ownerId === defenderOwnerId;

                    if (isSubject) {
                        cell.classList.add('floor-tile--battle-challenger');
                    } else if (isDefenderTerritory) {
                        cell.classList.add('floor-tile--battle-defender');
                    } else if (isCandidate) {
                        cell.classList.add('floor-tile--battle-candidate');
                    } else {
                        cell.classList.add('floor-tile--battle-dimmed');
                    }
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
                    tile.ownerId &&
                    (randomizerResult.playerId
                        ? tile.ownerId === randomizerResult.playerId
                        : randomizerResult.r === r && randomizerResult.c === c);
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

            // Larger territories get more label width so multi-word categories stay readable
            const slotPct = 100 / cols;
            const spanFactor = Math.min(3.4, Math.max(1, Math.sqrt(pc.count) * 0.9));
            label.style.maxWidth = (slotPct * 0.92 * spanFactor) + '%';
            label.style.maxHeight = Math.min(slotPct * spanFactor * 1.1, 42) + '%';

            // If this player is the randomizer result, add pulsing class
            if (randomizerResult && randomizerResult.playerName === player.name) {
                label.classList.add('floor-label--randomizer-selected');
            }

            const stack = document.createElement('div');
            stack.className = 'label-stack';

            if (player.hasTimeBoost) {
                const badge = document.createElement('div');
                badge.className = 'label-badge';
                badge.textContent = '+5';
                stack.appendChild(badge);
            }

            if (mode !== 'names') {
                const cat = document.createElement('div');
                cat.className = 'label-cat';
                // Read category from the actual tile data (which updates during swaps)
                // instead of player.expertCategory (which is immutable)
                const firstTile = state.getTile(pc.tiles[0].r, pc.tiles[0].c);
                cat.textContent = firstTile?.category || player.expertCategory;
                stack.appendChild(cat);
            }

            if (mode !== 'categories') {
                const name = document.createElement('div');
                name.className = 'label-name';
                name.textContent = player.name;
                stack.appendChild(name);
            }

            label.appendChild(stack);
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
    if (devRandomizerPickEl) devRandomizerPickEl.textContent = '---';
    render();
    updateUndoButton();
    updateDevSidebar();
}

function handleExport() {
    if (!state) return;
    const rows = [];
    rows.push('Row,Col,Name,Category,TimeBoost');
    if (state.goldenTile) {
        rows.push(`__METADATA__,goldenSquare,${state.goldenTile.r},${state.goldenTile.c},`);
    }
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

function parseCsvLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"') {
                if (line[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                cur += ch;
            }
        } else if (ch === '"') {
            inQuotes = true;
        } else if (ch === ',') {
            result.push(cur.trim());
            cur = '';
        } else {
            cur += ch;
        }
    }
    result.push(cur.trim());
    return result;
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
        let skipped = 0;
        for (let i = 1; i < lines.length; i++) {
            const rowData = parseCsvLine(lines[i]);
            if (rowData.length < 2) {
                skipped++;
                continue;
            }
            parsed.push(rowData);
        }

        if (skipped > 0) {
            console.warn(`CSV import: skipped ${skipped} malformed row(s)`);
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
        pendingGoldenUse = false;
        uiBusy = false;
        clearPendingAnimations();

        // Dev Tool: Refresh Console
        if (devRandomizerPickEl) devRandomizerPickEl.textContent = '---';
        if (devStatusEl) devStatusEl.textContent = 'Data Loaded';
        updateDevSidebar();

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
    let goldenTileFromCSV = null;

    for (const row of rowsData) {
        if (row.length < 4) continue;

        if (row[0] === '__METADATA__' && row[1] === 'goldenSquare') {
            const gr = parseInt(row[2], 10);
            const gc = parseInt(row[3], 10);
            if (!isNaN(gr) && !isNaN(gc)) {
                goldenTileFromCSV = { r: gr, c: gc };
            }
            continue;
        }

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

    if (goldenTileFromCSV) {
        state.goldenTile = goldenTileFromCSV;
    } else if (useGoldenSquare) {
        assignGoldenSquare(state);
    }

    if (devRandomizerPickEl) devRandomizerPickEl.textContent = '---';
    render();
    saveFloorState();
    updateDevSidebar();
}

function importSimpleList(rowsData) {
    // Expected: Name, Category
    let items = [];
    for (const row of rowsData) {
        if (row.length < 2) continue;
        items.push({ name: row[0], category: row[1] });
    }

    if (items.length === 0) return;

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

    if (useGoldenSquare) {
        assignGoldenSquare(state);
    }
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
        if (typeof p.useGoldenSquare === 'boolean') {
            useGoldenSquare = p.useGoldenSquare;
            if (goldenToggleEl) goldenToggleEl.checked = useGoldenSquare;
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
            isMuted,
            useGoldenSquare
        };
        localStorage.setItem(HOST_PREFS_KEY, JSON.stringify(p));
    } catch (e) { }
}

function updateHostPreferencesUI() {
    if (bgStyleSelect) bgStyleSelect.value = backgroundStyle;
    if (blueVariantSelect) blueVariantSelect.value = blueVariant;
    if (driftSpeedInput) driftSpeedInput.value = driftSpeed;
    if (goldenToggleEl) goldenToggleEl.checked = useGoldenSquare;
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
        muteBtn.textContent = isMuted ? '🔇 Muted (M)' : '🔊 Sound (M)';
        if (isMuted) {
            muteBtn.classList.add('floor-btn-danger'); // optional style
            // or just keep secondary, depending on taste. Let's stick to simple text change
        } else {
            muteBtn.classList.remove('floor-btn-danger');
            muteBtn.classList.add('floor-btn-secondary');
        }
    }
}

function showSetupModal() {
    if (setupModalEl) setupModalEl.setAttribute('aria-hidden', 'false');
}

function hideSetupModal() {
    if (setupModalEl) setupModalEl.setAttribute('aria-hidden', 'true');
}

function toggleStatsModal() {
    if (statsModalEl && statsModalEl.getAttribute('aria-hidden') === 'false') {
        hideStatsModal();
    } else {
        showStatsModal();
    }
}

function showStatsModal() {
    if (statsModalEl) {
        statsModalEl.setAttribute('aria-hidden', 'false');
        renderStatsTable();
    }
}

function hideStatsModal() {
    if (statsModalEl) statsModalEl.setAttribute('aria-hidden', 'true');
}

function renderStatsTable() {
    if (!state || !statsBodyEl) return;
    
    // Get active players
    let rows = state.players
        .filter(p => !p.eliminated && typeof p.area === 'number' && p.area > 0)
        .map(p => ({
            name: p.name || 'Unknown',
            category: p.expertCategory || '—',
            duels: p.duelCount || 0,
            tiles: p.area,
            hasDueled: !!p.hasDueled
        }));

    // Sort
    rows.sort((a, b) => {
        let valA = a[statsSortCol];
        let valB = b[statsSortCol];
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return statsSortAsc ? -1 : 1;
        if (valA > valB) return statsSortAsc ? 1 : -1;
        return 0;
    });

    // Render body
    statsBodyEl.innerHTML = '';
    for (const row of rows) {
        const tr = document.createElement('tr');
        
        const tdName = document.createElement('td');
        tdName.textContent = row.name;
        
        const tdCat = document.createElement('td');
        tdCat.textContent = row.category;
        
        const tdDuels = document.createElement('td');
        tdDuels.textContent = row.duels;
        
        const tdTiles = document.createElement('td');
        tdTiles.textContent = row.tiles;
        
        const tdHasDueled = document.createElement('td');
        tdHasDueled.textContent = row.hasDueled ? 'True' : 'False';
        
        tr.appendChild(tdName);
        tr.appendChild(tdCat);
        tr.appendChild(tdDuels);
        tr.appendChild(tdTiles);
        tr.appendChild(tdHasDueled);
        
        statsBodyEl.appendChild(tr);
    }
    
    // Update header classes
    const headers = statsModalEl.querySelectorAll('th[data-sort]');
    headers.forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.getAttribute('data-sort') === statsSortCol) {
            th.classList.add(statsSortAsc ? 'sort-asc' : 'sort-desc');
        }
    });
}

function showRandomizerHelpModal() {
    if (randomizerHelpModalEl) randomizerHelpModalEl.setAttribute('aria-hidden', 'false');
}

function hideRandomizerHelpModal() {
    if (randomizerHelpModalEl) randomizerHelpModalEl.setAttribute('aria-hidden', 'true');
}


/** Timer variables */
let floorTimerRemaining = 900; // 15 mins
let floorTimerStartValue = 900;
let floorTimerInterval = null;
let floorTimerIsRunning = false;
let floorTimerDeadline = null;
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
    floorTimerDeadline = Date.now() + floorTimerRemaining * 1000;
    floorTimerInterval = setInterval(() => {
        floorTimerRemaining = Math.max(0, Math.ceil((floorTimerDeadline - Date.now()) / 1000));
        updateFloorTimerDisplay();
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
    }, 250);
}

function stopFloorTimer() {
    floorTimerIsRunning = false;
    floorTimerDeadline = null;
    if (floorTimerInterval) {
        clearInterval(floorTimerInterval);
        floorTimerInterval = null;
    }
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
    if (uiBusy || swapState.active || battleState.active || randomizerState || randomizerResult) return;
    if (duelOverlayEl && duelOverlayEl.getAttribute('aria-hidden') === 'false') return;
    if (goldenAnnouncementEl && goldenAnnouncementEl.getAttribute('aria-hidden') === 'false') return;
    const tile = getTileFromTarget(e.target);
    if (!tile || !state?.getTile(tile.r, tile.c)?.ownerId) return;
    e.preventDefault();
    hideContextMenu();
    startBattleMode(tile);
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
    if (!loadFloorState()) {
        state = buildState(DEFAULT_ROWS, DEFAULT_COLS);
    }

    gridEl.addEventListener('contextmenu', handleContextMenu);
    gridEl.addEventListener('click', handleGridClick);
    gridEl.addEventListener('dblclick', handleGridDblClick);

    contextMenuEl.addEventListener('click', handleContextAction);

    editFormEl.addEventListener('submit', handleEditSubmit);
    editCancelBtn.addEventListener('click', handleEditCancel);

    if (swapCancelBtn) {
        swapCancelBtn.addEventListener('click', () => {
            if (battleState.active) cancelBattleMode();
            else if (swapState.active || uiBusy) abortInFlightSwap();
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
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);

    if (setupOpenBtn) setupOpenBtn.addEventListener('click', showSetupModal);
    if (setupCloseBtn) setupCloseBtn.addEventListener('click', hideSetupModal);

    if (randomizerHelpBtn) randomizerHelpBtn.addEventListener('click', showRandomizerHelpModal);
    if (randomizerHelpCloseBtn) randomizerHelpCloseBtn.addEventListener('click', hideRandomizerHelpModal);

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
    if (goldenToggleEl) {
        goldenToggleEl.addEventListener('change', (e) => {
            useGoldenSquare = e.target.checked;
            saveHostPreferences();
            if (useGoldenSquare && state && !state.goldenTile) {
                assignGoldenSquare(state);
            } else if (!useGoldenSquare && state) {
                state.goldenTile = null;
                updateDevSidebar();
            }
        });
    }
    if (goldenDismissBtn) {
        goldenDismissBtn.addEventListener('click', dismissGoldenAnnouncement);
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

    if (statsCloseBtn) {
        statsCloseBtn.addEventListener('click', hideStatsModal);
    }

    if (statsModalEl) {
        const headers = statsModalEl.querySelectorAll('th[data-sort]');
        headers.forEach(th => {
            th.addEventListener('click', () => {
                const sortKey = th.getAttribute('data-sort');
                if (statsSortCol === sortKey) {
                    statsSortAsc = !statsSortAsc;
                } else {
                    statsSortCol = sortKey;
                    statsSortAsc = false; // default to descending for new category
                }
                renderStatsTable();
            });
        });
    }

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

