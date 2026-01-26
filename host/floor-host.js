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
const applyBtn = document.getElementById('floor-apply-grid');
const displayRadios = document.querySelectorAll('input[name="floor-display"]');
const importFile = document.getElementById('floor-import-file');
const importBtn = document.getElementById('floor-import-btn');
const exportBtn = document.getElementById('floor-export-btn');
const randomizeCheck = document.getElementById('floor-randomize-check');
const muteBtn = document.getElementById('floor-mute-btn');

/** Audio mute state */
let isMuted = false;
let currentAudio = null;

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
const NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Kevin', 'Laura', 'Mike', 'Nina', 'Oscar', 'Patty', 'Quinn', 'Rupert', 'Sybil', 'Ted', 'Ursula', 'Victor', 'Wendy', 'Xavier', 'Yvonne', 'Zelda'];
const CATEGORIES = ['History', 'Geography', 'Science', 'Math', 'Literature', 'Art', 'Music', 'Movies', 'Sports', 'Food', 'Animals', 'Technology', 'Politics', 'Religion', 'Mythology', 'Language', 'Fashion', 'Architecture', 'Business', 'Economics', 'Psychology', 'Sociology', 'Philosophy', 'Physics', 'Chemistry', 'Biology'];

for (let i = 0; i < 400; i++) {
    const name = `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`;
    const category = `${CATEGORIES[i % CATEGORIES.length]} ${Math.floor(i / CATEGORIES.length) + 1}`;
    playerConfig.push({ name, expertCategory: category });
}
if (playerConfig.length > 0) playerConfig[0].hasTimeBoost = true;

function buildState(rows, cols) {
    const s = createGameState({
        rows: Math.max(1, rows),
        cols: Math.max(1, cols),
        players: playerConfig,
    });
    s.distributeTilesRoundRobin();
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

function startSwapMode() {
    swapState = { active: true, first: null, second: null };
    if (swapPromptEl) swapPromptEl.textContent = 'Select first tile';
    if (gridEl) gridEl.classList.add('floor-swap-mode');
    document.body.classList.add('floor-swap-mode');
}

function cancelSwapMode() {
    swapState = { active: false, first: null, second: null };
    if (swapPromptEl) swapPromptEl.textContent = '';
    if (gridEl) gridEl.classList.remove('floor-swap-mode');
    document.body.classList.remove('floor-swap-mode');
    render();
}

function startBattleMode(defender) {
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

function runSwapAnimation(first, second, t1, t2) {
    animationHooks.onSwapStart(t1, t2);
    const el1 = getTileEl(first.r, first.c);
    const el2 = getTileEl(second.r, second.c);
    if (!el1 || !el2 || !swapOverlayEl) {
        finishSwap(first, second);
        return;
    }
    const cat1 = t1.category || '—';
    const cat2 = t2.category || '—';
    const catEl1 = el1.querySelector('.floor-tile-category');
    const catEl2 = el2.querySelector('.floor-tile-category');
    if (!catEl1 || !catEl2) {
        finishSwap(first, second);
        return;
    }

    catEl1.classList.add('floor-tile-category--swap-shrink');
    catEl2.classList.add('floor-tile-category--swap-shrink');

    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    const x1 = r1.left + r1.width / 2;
    const y1 = r1.top + r1.height / 2;
    const x2 = r2.left + r2.width / 2;
    const y2 = r2.top + r2.height / 2;

    swapOverlayEl.setAttribute('aria-hidden', 'false');
    swapOverlayEl.innerHTML = '';

    const fly1 = document.createElement('div');
    fly1.className = 'floor-swap-fly';
    fly1.textContent = cat1;
    fly1.style.left = x1 + 'px';
    fly1.style.top = y1 + 'px';
    swapOverlayEl.appendChild(fly1);

    const fly2 = document.createElement('div');
    fly2.className = 'floor-swap-fly';
    fly2.textContent = cat2;
    fly2.style.left = x2 + 'px';
    fly2.style.top = y2 + 'px';
    swapOverlayEl.appendChild(fly2);

    const arrow = document.createElement('div');
    arrow.className = 'floor-swap-arrow';
    arrow.style.left = (x1 + x2) / 2 + 'px';
    arrow.style.top = (y1 + y2) / 2 + 'px';
    swapOverlayEl.appendChild(arrow);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            fly1.style.left = x2 + 'px';
            fly1.style.top = y2 + 'px';
            fly2.style.left = x1 + 'px';
            fly2.style.top = y1 + 'px';
        });
    });

    setTimeout(() => {
        catEl1.classList.remove('floor-tile-category--swap-shrink');
        catEl2.classList.remove('floor-tile-category--swap-shrink');
        swapOverlayEl.setAttribute('aria-hidden', 'true');
        swapOverlayEl.innerHTML = '';
        state.swapTileCategories(first.r, first.c, second.r, second.c);
        animationHooks.onSwapEnd();
        swapReappearTiles = [first, second];
        cancelSwapMode();
        render();
        const a = getTileEl(first.r, first.c)?.querySelector('.floor-tile-category');
        const b = getTileEl(second.r, second.c)?.querySelector('.floor-tile-category');
        if (a) a.classList.add('floor-tile-category--swap-reappear');
        if (b) b.classList.add('floor-tile-category--swap-reappear');
        setTimeout(() => {
            a?.classList.remove('floor-tile-category--swap-reappear');
            b?.classList.remove('floor-tile-category--swap-reappear');
            swapReappearTiles = null;
        }, 400);
        updateUndoButton();
    }, 450);
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
        if (swapPromptEl) swapPromptEl.textContent = 'Select second tile';
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
        startSwapMode();
        return;
    }
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
        if (editModalEl.getAttribute('aria-hidden') === 'false') {
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
                cat.textContent = player.expertCategory;
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
    rowsInput.value = String(rows);
    colsInput.value = String(cols);
    cancelSwapMode();
    cancelBattleMode();
    cancelRandomizer();
    randomizerResult = null;
    undoManager.clear();
    state = buildState(rows, cols);
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

    // Build blank state with no players
    state = createGameState({
        rows: maxR + 1,
        cols: maxC + 1,
        players: []
    });

    // Manually populate
    let pidCounter = 1;
    for (const item of items) {
        const pid = `p${pidCounter++}`;
        state.players.set(pid, {
            id: pid,
            name: item.name,
            expertCategory: item.category, // initial expert category
            hasTimeBoost: item.hasTimeBoost,
            color: null
        });
        state.grid[item.r][item.c] = {
            row: item.r,
            col: item.c,
            ownerId: pid,
            category: item.category
        };
    }
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

    // Create config for buildState
    // We need to override the default playerConfig logic in buildState or just create state manually
    // Since buildState uses the hardcoded playerConfig, let's just make a fresh state here.

    state = createGameState({
        rows: r,
        cols: c,
        players: []
    });

    // We can use distributeTilesRoundRobin but we need to feed it players
    // However, distributeTilesRoundRobin assigns in order (0,0), (0,1)...
    // If we want linear fill of our items list (which might be shuffled), we can just loop.

    let idx = 0;
    for (let row = 0; row < r; row++) {
        for (let col = 0; col < c; col++) {
            if (idx < items.length) {
                const item = items[idx];
                const pid = `p${idx + 1}`;
                state.players.set(pid, {
                    id: pid,
                    name: item.name,
                    expertCategory: item.category,
                    hasTimeBoost: false,
                    color: null
                });
                state.grid[row][col] = {
                    row, col,
                    ownerId: pid,
                    category: item.category
                };
                idx++;
            } else {
                // Empty tile if grid bigger than count
                state.grid[row][col] = {
                    row, col,
                    ownerId: null,
                    category: null
                };
            }
        }
    }
}

function init() {
    state = buildState(DEFAULT_ROWS, DEFAULT_COLS);

    gridEl.addEventListener('contextmenu', handleContextMenu);
    gridEl.addEventListener('click', handleGridClick);

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

    if (pickBtn) pickBtn.addEventListener('click', handleRandomizerToggle);
    if (randomizerDismissBtn) randomizerDismissBtn.addEventListener('click', dismissRandomizer);
    if (undoBtn) undoBtn.addEventListener('click', handleUndo);
    if (muteBtn) muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
        if (currentAudio) {
            currentAudio.muted = isMuted;
        }
    });

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
