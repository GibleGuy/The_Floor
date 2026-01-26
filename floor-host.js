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
} from './floor-core/index.js';

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
    onSwapStart(tile1, tile2) {},
    onSwapEnd() {},
    onDuelStart(challengerPlayer, defenderPlayer, category) {},
    onDuelEnd(winnerPlayer, loserPlayer) {},
    onRandomizerComplete(selectedPlayer) {},
};

const playerConfig = [
    { name: 'Alice', expertCategory: 'Flags', hasTimeBoost: true },
    { name: 'Bob', expertCategory: 'Hockey' },
    { name: 'Carol', expertCategory: 'Pokemon' },
    { name: 'Dave', expertCategory: 'Math' },
];

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
    if (tile.r === d.r && tile.c === d.c) return;
    if (!isOrthogonalAdjacent(tile.r, tile.c, d.r, d.c)) {
        if (swapPromptEl) swapPromptEl.textContent = 'Not adjacent — select an adjacent tile';
        return;
    }
    const v = validateBattle(state, tile.r, tile.c, d.r, d.c);
    if (!v.valid) {
        if (swapPromptEl) swapPromptEl.textContent = v.error || 'Invalid selection';
        return;
    }
    battleState.challenger = { r: tile.r, c: tile.c };
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
    const category = getBattleCategory(state, cr, cc, dr, dc);
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
    const result = applyBattleResult(state, cr, cc, dr, dc, winnerIsChallenger);
    if (!result.success) return;

    const winner = state.getPlayer(result.winnerId);
    const loser = state.getPlayer(result.loserId);
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
    const eligible = getEligiblePlayers(state);
    if (eligible.length === 0) {
        alert('No eligible players.');
        return;
    }
    const selectedPlayer = pickOne(state);
    if (!selectedPlayer) return;

    const ordered = getOrderedEligible(state);
    const rapidTiles = ordered
        .map((p) => {
            const tiles = state.getTilesOwnedBy(p.id);
            return tiles.length ? { r: tiles[0].row, c: tiles[0].col } : null;
        })
        .filter(Boolean);

    const winnerTiles = state.getTilesOwnedBy(selectedPlayer.id).map((t) => ({ r: t.row, c: t.col }));
    if (winnerTiles.length === 0) return;

    randomizerResult = null;
    if (randomizerResultEl) randomizerResultEl.setAttribute('aria-hidden', 'true');
    if (gridEl) gridEl.classList.add('floor-grid--randomizer-active');
    if (pickBtn) pickBtn.disabled = true;

    const RAPID_LOOPS = 4;
    const WINNER_STEPS = 7;
    const rapidSteps = [];
    for (let i = 0; i < RAPID_LOOPS * rapidTiles.length; i++) {
        rapidSteps.push(rapidTiles[i % rapidTiles.length]);
    }
    const winnerSteps = [];
    for (let i = 0; i < WINNER_STEPS; i++) {
        winnerSteps.push(winnerTiles[i % winnerTiles.length]);
    }
    const allSteps = [...rapidSteps, ...winnerSteps];

    let delay = 80;
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
        if (idx >= allSteps.length) {
            stopRandomizerRun(selectedPlayer, prev || allSteps[allSteps.length - 1]);
            return;
        }
        const current = allSteps[idx];
        const isWinnerPhase = idx >= rapidSteps.length;
        setHighlight(current, false);
        prev = current;
        idx++;

        if (isWinnerPhase) {
            if (idx === rapidSteps.length + 1) delay = 120;
            else delay = Math.min(550, Math.floor(delay * 1.3));
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
    if (pickBtn) pickBtn.disabled = false;
    animationHooks.onRandomizerComplete(selectedPlayer);
}

function cancelRandomizer() {
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
    if (pickBtn) pickBtn.disabled = false;
}

function dismissRandomizer() {
    if (!randomizerResult) return;
    randomizerResult = null;
    if (randomizerResultEl) randomizerResultEl.setAttribute('aria-hidden', 'true');
    render();
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

    gridEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridEl.style.aspectRatio = `${cols} / ${rows}`;
    gridEl.innerHTML = '';

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const tile = state.getTile(r, c);
            const cell = document.createElement('div');
            cell.className = 'floor-tile floor-tile--' + mode;
            cell.setAttribute('role', 'gridcell');
            cell.dataset.row = String(r);
            cell.dataset.col = String(c);
            cell.tabIndex = 0;

            const isSwapFirst =
                swapState.active &&
                swapState.first &&
                swapState.first.r === r &&
                swapState.first.c === c;
            if (isSwapFirst) cell.classList.add('floor-tile--swap-selected');

            const isBattleDefender =
                battleState.active &&
                battleState.defender &&
                battleState.defender.r === r &&
                battleState.defender.c === c;
            if (isBattleDefender) cell.classList.add('floor-tile--battle-defender');

            const isRandomizerSelected =
                randomizerResult &&
                randomizerResult.r === r &&
                randomizerResult.c === c;
            if (isRandomizerSelected) cell.classList.add('floor-tile--randomizer-selected');

            const inner = document.createElement('div');
            inner.className = 'floor-tile-inner';

            const catEl = document.createElement('div');
            catEl.className = 'floor-tile-category';
            catEl.textContent = tile.category || '—';

            const nameEl = document.createElement('div');
            nameEl.className = 'floor-tile-name';

            if (tile.ownerId) {
                const player = state.getPlayer(tile.ownerId);
                nameEl.textContent = player ? player.name : '—';
                if (player && player.hasTimeBoost) {
                    const badge = document.createElement('span');
                    badge.className = 'floor-tile-badge';
                    badge.textContent = '+5';
                    badge.setAttribute('aria-label', 'Time boost active');
                    cell.insertBefore(badge, inner);
                }
            } else {
                cell.classList.add('floor-tile--empty');
                nameEl.textContent = '—';
            }

            inner.appendChild(catEl);
            inner.appendChild(nameEl);
            cell.appendChild(inner);
            gridEl.appendChild(cell);
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

    if (pickBtn) pickBtn.addEventListener('click', runRandomizer);
    if (randomizerDismissBtn) randomizerDismissBtn.addEventListener('click', dismissRandomizer);
    if (undoBtn) undoBtn.addEventListener('click', handleUndo);

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

    updateUndoButton();
    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export { animationHooks };
