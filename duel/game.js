// ========== CATEGORIES & STATE ==========
// Derived dynamically from CATEGORY_REGISTRY (loaded from categories/index.js)
const CATEGORY_SCRIPTS = {};
const CATEGORY_GLOBALS = {};
if (window.CATEGORY_REGISTRY) {
    window.CATEGORY_REGISTRY.forEach(function (c) {
        CATEGORY_SCRIPTS[c.key] = '../categories/' + c.script + '?v=4';
        CATEGORY_GLOBALS[c.key] = c.global;
    });
}
const categoryScriptsLoaded = new Set();

function loadCategoryScript(cat) {
    if (categoryScriptsLoaded.has(cat)) return Promise.resolve();
    const src = CATEGORY_SCRIPTS[cat];
    if (!src) return Promise.reject(new Error('Unknown category'));
    return new Promise(function (resolve, reject) {
        const s = document.createElement('script');
        s.src = src;
        s.onload = function () { categoryScriptsLoaded.add(cat); resolve(); };
        s.onerror = function () { reject(new Error('Failed to load ' + src)); };
        document.head.appendChild(s);
    });
}

async function getCategoryData(cat) {
    await loadCategoryScript(cat);
    const g = typeof window !== 'undefined' ? window[CATEGORY_GLOBALS[cat]] : undefined;
    let data = Array.isArray(g) ? [...g] : [];
    const reg = window.CATEGORY_REGISTRY && window.CATEGORY_REGISTRY.find(function(c) { return c.key === cat; });
    if (reg && reg.shuffle) {
        for (let i = data.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = data[i]; data[i] = data[j]; data[j] = tmp;
        }
    }
    return data;
}

// --- GAME LOGIC ---
let activePlayer = 1;
let timers = [45.0, 45.0];
let currentPool = [];
let studyQueue = [];
let currentIndex = 0;
let gameActive = false;
let inputLocked = true;
let clockInterval = null;
let isPaused = false;
let gamemode = 'classic'; // 'singleplayer' or 'classic'
let hostMode = false; // Separate toggle that works with either gamemode
// let gibleMode = false; // Gible mode: removed [/]
let isPinned = false;
let adminWindow = null;
let adminWindowOpen = false;
let adminInterval = null;
let gameTimerRemaining = null;
let gameTimerStartNext = null;
let categoryLoadedForHost = false;
let playerNames = ["Challenger", "Expert"];
let firstPlayerIsLeft = true;
let timeBoostsUsed = [false, false];
let currentCategory = "";
let itemsCompleted = 0; // Track how many items have been completed
let categoryComplete = false;
let moreSpecificActive = false;

// NEW FEATURES
let isMuted = false;
let musicVolume = 0.2;
let sfxVolume = 0.65;
let currentTheme = 'dark';
let confettiEnabled = false;
let disableExtras = false;
let showTimerDecimal = false;
let highContrastReducedMotion = false;
const BG_STYLES = ['solid', 'grid', 'tiles', 'diagonal', 'pop'];
let backgroundStyle = 'pop';
let backgroundDriftSpeed = 1;   // 0.25–2, multiplier for drift
let blueVariant = 'b';          // 'a'|'b'|'c'|'d'
let currentStreak = 0;
let inPassPhase = false;
let unpauseCountdownActive = false;

// Stats tracking
let answerStartTime = 0;
let lastRoundStats = {
    p1: { name: "Challenger", correct: 0, passed: 0 },
    p2: { name: "Expert", correct: 0, passed: 0 },
    totalCorrect: 0,
    totalPassed: 0,
    totalTime: 0,
    answerCount: 0
};

let perPlayerStats = {}; // Keyed by player name
let perSlotStats = {
    left: { wins: 0, correct: 0, passed: 0, totalTime: 0, answerCount: 0 },
    right: { wins: 0, correct: 0, passed: 0, totalTime: 0, answerCount: 0 }
};

let sessionStats = {
    gamesPlayed: 0,
    totalCorrect: 0,
    totalPassed: 0,
    totalTime: 0,
    answerCount: 0
};

// Load lifetime stats from localStorage
let lifetimeStats = JSON.parse(localStorage.getItem('floorLifetimeStats') || '{"gamesPlayed":0,"totalCorrect":0,"totalPassed":0,"totalTime":0,"answerCount":0}');

function saveLifetimeStats() {
    localStorage.setItem('floorLifetimeStats', JSON.stringify(lifetimeStats));
}

const PREFS_KEY = 'floorPreferences';
function loadPreferences() {
    try {
        const raw = localStorage.getItem(PREFS_KEY);
        if (!raw) return;
        const p = JSON.parse(raw);
        if (p.theme && ['dark', 'light'].includes(p.theme)) currentTheme = p.theme;
        if (typeof p.mute === 'boolean') isMuted = p.mute;
        if (typeof p.musicVolume === 'number') musicVolume = p.musicVolume;
        if (typeof p.sfxVolume === 'number') sfxVolume = p.sfxVolume;
        if (typeof p.showTimerDecimal === 'boolean') showTimerDecimal = p.showTimerDecimal;
        if (typeof p.disableExtras === 'boolean') disableExtras = p.disableExtras;
        if (typeof p.confettiEnabled === 'boolean') confettiEnabled = p.confettiEnabled;
        if (p.gamemode && ['singleplayer', 'classic', 'study'].includes(p.gamemode)) gamemode = p.gamemode;
        if (Array.isArray(p.playerNames) && p.playerNames.length >= 2) {
            playerNames[0] = String(p.playerNames[0] || 'Challenger');
            playerNames[1] = String(p.playerNames[1] || 'Expert');
        }
        if (typeof p.firstPlayerIsLeft === 'boolean') firstPlayerIsLeft = p.firstPlayerIsLeft;
        if (typeof p.highContrastReducedMotion === 'boolean') highContrastReducedMotion = p.highContrastReducedMotion;
        if (p.backgroundStyle && BG_STYLES.includes(p.backgroundStyle)) backgroundStyle = p.backgroundStyle;
        if (typeof p.backgroundDriftSpeed === 'number' && p.backgroundDriftSpeed >= 0.25 && p.backgroundDriftSpeed <= 2) backgroundDriftSpeed = p.backgroundDriftSpeed;
        if (p.blueVariant && ['a', 'b', 'c', 'd'].includes(p.blueVariant)) blueVariant = p.blueVariant;
    } catch (e) { }
}
function applyPreferencesToDOM() {
    const gs = document.getElementById('gamemode-select');
    if (gs) gs.value = gamemode;
    const p1 = document.getElementById('p1-name-input');
    const p2 = document.getElementById('p2-name-input');
    if (p1) p1.value = playerNames[0];
    if (p2) p2.value = playerNames[1];
    const fl = document.getElementById('first-left');
    const fr = document.getElementById('first-right');
    if (fl) fl.checked = firstPlayerIsLeft;
    if (fr) fr.checked = !firstPlayerIsLeft;
    const mt = document.getElementById('mute-toggle');
    if (mt) mt.checked = isMuted;
    const ct = document.getElementById('confetti-toggle');
    if (ct) ct.checked = confettiEnabled;
    const de = document.getElementById('disable-extras-toggle');
    if (de) de.checked = disableExtras;
    const std = document.getElementById('show-timer-decimal-toggle');
    if (std) std.checked = showTimerDecimal;
    const hc = document.getElementById('high-contrast-reduced-motion-toggle');
    if (hc) hc.checked = highContrastReducedMotion;
    const td = document.getElementById('theme-dark');
    const tl = document.getElementById('theme-light');
    if (td) td.checked = (currentTheme === 'dark');
    if (tl) tl.checked = (currentTheme === 'light');
    changeTheme(currentTheme);
    document.body.classList.toggle('high-contrast-reduced-motion', highContrastReducedMotion);
    document.body.style.setProperty('--bg-drift-speed', String(backgroundDriftSpeed));
    ['a', 'b', 'c', 'd'].forEach(function (v) { document.body.classList.remove('blue-' + v); });
    document.body.classList.add('blue-' + blueVariant);
    BG_STYLES.forEach(function (b) { document.body.classList.remove('bg-' + b); });
    document.body.classList.add('bg-' + backgroundStyle);
    const bsRadios = document.querySelectorAll('input[name="background-style"]');
    bsRadios.forEach(function (r) { r.checked = (r.value === backgroundStyle); });
    const speedSlider = document.getElementById('bg-drift-speed-slider');
    if (speedSlider) { speedSlider.value = backgroundDriftSpeed; }
    const speedLabel = document.getElementById('bg-drift-speed-label');
    if (speedLabel) speedLabel.textContent = backgroundDriftSpeed + '×';
    const bvRadios = document.querySelectorAll('input[name="blue-variant"]');
    bvRadios.forEach(function (r) { r.checked = (r.value === blueVariant); });
    const helpBtn = document.getElementById('help-button');
    const fullscreenBtn = document.getElementById('fullscreen-button');
    const streakDisplay = document.getElementById('streak-display');
    const scoreDisplay = document.getElementById('score-display');
    if (disableExtras) {
        if (helpBtn) helpBtn.classList.add('hidden');
        if (fullscreenBtn) fullscreenBtn.classList.add('hidden');
        if (streakDisplay) streakDisplay.classList.add('hidden');
        if (scoreDisplay) scoreDisplay.classList.add('hidden');
    } else {
        if (helpBtn) helpBtn.classList.remove('hidden');
        if (fullscreenBtn) fullscreenBtn.classList.remove('hidden');
        if (streakDisplay) streakDisplay.classList.remove('hidden');
        if (scoreDisplay) scoreDisplay.classList.remove('hidden');
    }
}
function savePreferences() {
    try {
        const p = {
            theme: currentTheme,
            mute: isMuted,
            musicVolume,
            sfxVolume,
            showTimerDecimal,
            disableExtras,
            confettiEnabled,
            gamemode,
            playerNames: playerNames.slice(),
            firstPlayerIsLeft,
            highContrastReducedMotion,
            backgroundStyle,
            backgroundDriftSpeed,
            blueVariant
        };
        localStorage.setItem(PREFS_KEY, JSON.stringify(p));
    } catch (e) { }
}

// ========== SOUNDS ==========
// Passes play in order, loop after last.
const PASS_COUNT = 5;
let sounds = {
    countdown: new Audio('../sounds/countdown.mp3'),
    right: new Audio('../sounds/RIGHT.wav'),
    passes: Array.from({ length: PASS_COUNT }, (_, i) => new Audio(`../sounds/pass${i + 1}.mp3`)),
    duelMusic: new Audio('../sounds/DUEL MUSIC.wav'),
    duelOver: new Audio('../sounds/DUEL OVER.wav')
};
sounds.countdown.volume = sfxVolume;
sounds.passes.forEach(s => { s.volume = sfxVolume; });
sounds.duelMusic.loop = true;
sounds.duelMusic.volume = musicVolume;
sounds.duelOver.volume = musicVolume;

let passIndex = 0;

function playDingSound() {
    if (isMuted) return;
    const s = sounds.right.cloneNode();
    s.volume = sfxVolume;
    s.play().catch(() => { });
}

function playPassSound() {
    if (isMuted) return;
    const s = new Audio('../sounds/pass' + (passIndex + 1) + '.mp3');
    s.volume = sfxVolume;
    s.play().catch(() => { });
    passIndex = (passIndex + 1) % PASS_COUNT;
}

const PRELOAD_COUNT = 5;
function preloadCategoryImages() {
    if (!currentPool || !currentPool.length) return;
    const n = Math.min(PRELOAD_COUNT, currentPool.length);
    for (let i = 0; i < n; i++) {
        const item = currentPool[i];
        const url = item && item.u;
        if (url) {
            const img = new Image();
            img.src = url;
        }
    }
}

// ========== CATEGORY REVEAL ==========
let categoryRevealAudio = null;
async function showCategoryReveal(categoryName) {
    return new Promise(resolve => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'category-reveal-overlay';
        overlay.innerHTML = `
            <div class="category-reveal-label">Category</div>
            <div class="category-reveal-name">${categoryName}</div>
            <div class="category-reveal-line"></div>
        `;
        document.body.appendChild(overlay);

        // Play anthem sound
        if (!isMuted) {
            categoryRevealAudio = new Audio('../sounds/MainAnthem.mp3');
            categoryRevealAudio.volume = sfxVolume;
            categoryRevealAudio.play().catch(() => {});
        }

        // Trigger fade-in
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
        });

        // After zoom completes, add glow pulse
        setTimeout(() => {
            const nameEl = overlay.querySelector('.category-reveal-name');
            if (nameEl) nameEl.classList.add('glow');
        }, 1200);

        // Hold for 2.5s total, then fade out
        setTimeout(() => {
            overlay.classList.add('fade-out');
            // Stop audio fade
            if (categoryRevealAudio) {
                const fadeAudio = setInterval(() => {
                    if (categoryRevealAudio && categoryRevealAudio.volume > 0.05) {
                        categoryRevealAudio.volume = Math.max(0, categoryRevealAudio.volume - 0.05);
                    } else {
                        clearInterval(fadeAudio);
                        if (categoryRevealAudio) {
                            categoryRevealAudio.pause();
                            categoryRevealAudio = null;
                        }
                    }
                }, 50);
            }
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 500);
        }, 2500);
    });
}

// ========== GAME FLOW (setup, start, loop, correct, pass, end) ==========
async function setupGame(cat, opts) {
    if (gameActive) return;
    const fromAdminWindow = !!(opts && opts.fromAdminWindow);
    const loadOnly = !!(opts && opts.loadOnly);
    const data = await getCategoryData(cat);
    if (!data || !data.length) return;
    const w = document.getElementById('welcome-message');
    if (w) w.classList.add('hide');
    document.body.classList.remove('game-ended');

    // Reset last round stats
    lastRoundStats = {
        p1: { name: playerNames[0], correct: 0, passed: 0 },
        p2: { name: playerNames[1], correct: 0, passed: 0 },
        totalCorrect: 0,
        totalPassed: 0,
        totalTime: 0,
        answerCount: 0
    };
    currentStreak = 0;
    answerStartTime = Date.now();

    // Lookup proper label from the registry
    const registryItem = window.CATEGORY_REGISTRY.find(c => c.key === cat);
    let label = (registryItem ? registryItem.label : cat.replace(/-/g, ' '));
    
    // Specifically strip "PPT" or "ppt" prefixes and (PPT) suffixes
    currentCategory = label.replace(/^(PPT|ppt)[\s-]?/i, '').replace(/[\s-]\(PPT\)$/i, '').toUpperCase();
    
    document.getElementById('category-display').innerText = currentCategory;
    document.getElementById('category-display').style.display = 'block';

    // Set active player based on customization
    activePlayer = firstPlayerIsLeft ? 1 : 2;

    // Initialize timers based on gamemode
    if (gamemode === 'singleplayer' || gamemode === 'study') {
        timers = [0.0, 0.0]; // Start at 0, count up
    } else {
        // Apply time boosts if they were used before game start
        timers = [
            timeBoostsUsed[0] ? 50.0 : 45.0,
            timeBoostsUsed[1] ? 50.0 : 45.0
        ];
    }
    currentIndex = 0;
    isPaused = false;
    itemsCompleted = 0;
    categoryComplete = false;
    passIndex = 0;

    // Reset boost buttons if game is starting fresh
    if (!timeBoostsUsed[0] && !timeBoostsUsed[1]) {
        document.getElementById('p1-boost-btn').classList.remove('used');
        document.getElementById('p1-boost-btn').disabled = false;
        document.getElementById('p1-boost-btn').textContent = 'Time Boost? (+5s)';
        document.getElementById('p2-boost-btn').classList.remove('used');
        document.getElementById('p2-boost-btn').disabled = false;
        document.getElementById('p2-boost-btn').textContent = 'Time Boost? (+5s)';
    }
    if (hostMode || cat === 'math' || gamemode === 'study') {
        currentPool = [...data];
    } else {
        // Shuffle normal games
        let arr = [...data];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        currentPool = arr;
    }

    if (gamemode === 'study') {
        studyQueue = Array.from({length: currentPool.length}, (_, i) => i);
        
        // Shuffle if the option is checked
        const shuffleToggle = document.getElementById('study-shuffle-toggle');
        if (shuffleToggle && shuffleToggle.checked) {
            for (let i = studyQueue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [studyQueue[i], studyQueue[j]] = [studyQueue[j], studyQueue[i]];
            }
        }
        
        if (studyQueue.length > 0) {
            currentIndex = studyQueue.shift();
        }
    }

    updateClueDropdown();

    // In single player or study mode, always use player 1
    if (gamemode === 'singleplayer' || gamemode === 'study') {
        activePlayer = 1;
    }

    const p1Container = document.querySelector('.clocks > div:nth-child(1)');
    const p2Container = document.querySelector('.clocks > div:nth-child(2)');

    if (gamemode === 'study') {
        // Study mode: hide both timer containers entirely
        if (p1Container) p1Container.style.display = 'none';
        if (p2Container) p2Container.style.display = 'none';
    } else if (gamemode === 'singleplayer') {
        if (p1Container) p1Container.style.display = 'block';
        if (p2Container) p2Container.style.display = 'none';
    } else {
        if (p1Container) p1Container.style.display = 'block';
        if (p2Container) p2Container.style.display = 'block';
    }

    updateDisplay();
    updatePauseButton();
    document.getElementById('reveal-text').innerText = "";
    document.getElementById('answer-input').value = "";
    document.getElementById('img-frame').className = "image-container";

    // Clear any fallback text
    const fallback = document.getElementById('text-fallback');
    if (fallback) {
        fallback.remove();
    }
    const imgEl = document.getElementById('prompt-image');
    if (imgEl) { imgEl.src = ''; imgEl.style.display = 'none'; }
    const mathEl = document.getElementById('math-problem');
    if (mathEl) { mathEl.innerHTML = ''; mathEl.style.display = 'none'; }

    resetTimerStyles();
    // Handle host mode differently
    if (hostMode && !fromAdminWindow) {
        // Main-page host: show category and start button instead of auto-starting
        const imgFrame = document.getElementById('img-frame');
        const img = document.getElementById('prompt-image');
        if (img) { img.src = ''; img.style.display = 'none'; }
        imgFrame.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--floor-yellow);">
                        <div style="font-size: 4rem; font-weight: bold; margin-bottom: 30px;">${currentCategory}</div>
                        <button onclick="startGameFromHost()" style="padding: 20px 40px; font-size: 2rem; background: var(--floor-green); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">START</button>
                    </div>
                `;


        
        const answerInput = document.getElementById('answer-input');
        answerInput.disabled = true;
        answerInput.style.display = 'none';
        document.getElementById('reveal-text').innerText = "";
        
    } else if (hostMode && fromAdminWindow && loadOnly) {
        // Admin Window LOAD: show category in display, preload, enable START on admin
        const imgFrame = document.getElementById('img-frame');
        const img = document.getElementById('prompt-image');
        if (img) { img.src = ''; img.style.display = 'none'; }
        imgFrame.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--floor-yellow); text-align: center;">
                        <div style="font-size: 4rem; font-weight: bold;">${currentCategory}</div>
                    </div>
                `;
        const answerInput = document.getElementById('answer-input');
        if (answerInput) { answerInput.disabled = true; answerInput.style.display = 'none'; }
        document.getElementById('reveal-text').innerText = "";
        preloadCategoryImages();
        categoryLoadedForHost = true;
    } else if (hostMode && fromAdminWindow) {
        // Admin Window start (legacy): leave img-frame as-is; startGameFromHost will overwrite it
        const answerInput = document.getElementById('answer-input');
        if (answerInput) { answerInput.disabled = true; answerInput.style.display = 'none'; }
        document.getElementById('reveal-text').innerText = "";
    } else {
        // Normal mode - Category Reveal then 3-Second Countdown
        if (gamemode !== 'study') {
            await showCategoryReveal(currentCategory);
            const overlay = document.getElementById('overlay');
            overlay.style.display = 'flex';
            // Play countdown sound once at the start
            if (!isMuted) {
                sounds.countdown.currentTime = 0;
                sounds.countdown.play().catch(() => { });
            }
            for (let i = 3; i > 0; i--) {
                overlay.innerText = i;
                await new Promise(r => setTimeout(r, 1000));
            }
            overlay.style.display = 'none';

            if (!isMuted) {
                sounds.duelMusic.currentTime = 0;
                sounds.duelMusic.play().catch(() => { });
            }
        }

        gameActive = true;
        inputLocked = false;
        loadImage();
        updateMenuVisibility();
        if (clockInterval) clearInterval(clockInterval);
        clockInterval = setInterval(gameLoop, 100);

        // Handle answer input
        const answerInput = document.getElementById('answer-input');
        answerInput.disabled = false;
        answerInput.style.display = 'block';
        answerInput.placeholder = 'TYPE ANSWER HERE';
        answerInput.focus();

        if (gamemode === 'study') {
            const studyControls = document.getElementById('study-controls');
            if (studyControls) {
                studyControls.style.display = 'flex';
                document.getElementById('study-reveal-btn').style.display = 'block';
                document.getElementById('study-knew-btn').style.display = 'none';
                document.getElementById('study-again-btn').style.display = 'none';
            }
        }
    }
}

async function startGameFromHost() {
    categoryLoadedForHost = false;
    // Apply first-player selection (from main or admin) before starting
    const fl = document.getElementById('first-left');
    if (fl) firstPlayerIsLeft = fl.checked;
    activePlayer = firstPlayerIsLeft ? 1 : 2;
    updateDisplay();
    // Restore image container and ensure it's empty/hidden
    const imgFrame = document.getElementById('img-frame');
    imgFrame.innerHTML = `
                <div id="overlay"></div>
                <img id="prompt-image" src="" onerror="handleImageError(this)" style="display: none;">
                <div id="math-problem" class="math-problem"></div>
                <div id="pause-overlay">
                    <span class="pause-text">PAUSED</span>
                    <button type="button" class="pause-unhide-btn" onclick="unhidePauseImage()">UNHIDE</button>
                </div>
                <div id="pause-hide-bar">
                    <button type="button" class="pause-hide-btn" onclick="hidePauseImage()">HIDE</button>
                </div>
            `;

    // Clear any reveal text
    document.getElementById('reveal-text').innerText = "";

    // Category Reveal then 3-Second Countdown
    const overlay = document.getElementById('overlay');
    
    if (gamemode !== 'study') {
        await showCategoryReveal(currentCategory);
        overlay.style.display = 'flex';
        overlay.style.zIndex = '20';
        overlay.style.background = 'rgba(0,0,0,1)';
        // Play countdown sound once at the start
        if (!isMuted) {
            sounds.countdown.currentTime = 0;
            sounds.countdown.play().catch(() => { });
        }
        for (let i = 3; i > 0; i--) {
            overlay.innerText = i;
            await new Promise(r => setTimeout(r, 1000));
        }
        overlay.style.display = 'none';
        overlay.style.background = 'rgba(0,0,0,0.9)'; // Reset for other uses

        if (!isMuted) {
            sounds.duelMusic.currentTime = 0;
            sounds.duelMusic.play().catch(() => { });
        }
    } else {
        overlay.style.display = 'none';
    }

    gameActive = true;
    inputLocked = false;

    // Reset answerStartTime now that the game actually begins (after countdown)
    answerStartTime = Date.now();

    // Now show and load the image after countdown
    const img = document.getElementById('prompt-image');
    if (img) img.style.display = 'block';
    loadImage();

    if (gamemode === 'study') {
        const studyControls = document.getElementById('study-controls');
        if (studyControls) {
            studyControls.style.display = 'flex';
            document.getElementById('study-reveal-btn').style.display = 'block';
            document.getElementById('study-knew-btn').style.display = 'none';
            document.getElementById('study-again-btn').style.display = 'none';
        }
    }

    updateMenuVisibility();
    if (clockInterval) clearInterval(clockInterval);
    clockInterval = setInterval(gameLoop, 100);
}

function gameLoop() {
    if (!gameActive || categoryComplete) return;

    if (gamemode === 'study') {
        // Study mode: no timer logic needed, just update display
        updateDisplay();
        return;
    }

    if (gamemode === 'singleplayer') {
        // Single player: count up
        if (!inputLocked && !isPaused) {
            timers[0] += 0.1;
        }
    } else {
        // Classic/Host: count down (continue during pass phase)
        if ((!inputLocked || inPassPhase) && !isPaused) timers[activePlayer - 1] -= 0.1;

        if (timers[activePlayer - 1] <= 0) {
            timers[activePlayer - 1] = 0;
            endGame();
        }
    }
    updateDisplay();
}

const NUM_WORDS = {
    'ONE': '1', 'TWO': '2', 'THREE': '3', 'FOUR': '4', 'FIVE': '5',
    'SIX': '6', 'SEVEN': '7', 'EIGHT': '8', 'NINE': '9', 'TEN': '10',
    'ELEVEN': '11', 'TWELVE': '12', 'THIRTEEN': '13', 'FOURTEEN': '14',
    'FIFTEEN': '15', 'SIXTEEN': '16', 'SEVENTEEN': '17', 'EIGHTEEN': '18',
    'NINETEEN': '19', 'TWENTY': '20', 'THIRTY': '30', 'FORTY': '40',
    'FIFTY': '50', 'SIXTY': '60', 'SEVENTY': '70', 'EIGHTY': '80',
    'NINETY': '90', 'HUNDRED': '100'
};

function normalizeAnswer(str) {
    if (!str) return "";
    let s = str.toUpperCase();
    
    // Convert number words to digits using word boundaries
    for (const [word, num] of Object.entries(NUM_WORDS)) {
        s = s.replace(new RegExp('\\b' + word + '\\b', 'g'), num);
    }
    
    // Normalize & to AND, remove punctuation, strip leading articles
    return s.replace(/&/g, 'AND')
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/^\s*(THE|A|AN)\s+/i, '')
        .replace(/\s+/g, '');
}

document.getElementById('answer-input').addEventListener('input', (e) => {
    if (!gameActive || inputLocked) return;
    let val = e.target.value;
    // Match Logic: ignore spaces and punctuation
    if (normalizeAnswer(val) === normalizeAnswer(currentPool[currentIndex].n)) handleCorrect();
});

document.getElementById('answer-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && gameActive && !inputLocked) {
        const val = e.target.value.trim();
        if (gamemode === 'study') {
            // In study mode: Enter with wrong/empty answer reveals it
            if (val === "" || normalizeAnswer(val) !== normalizeAnswer(currentPool[currentIndex].n)) {
                revealAnswer();
            }
            return;
        }
        if (val === "") {
            handlePass();
        } else if (normalizeAnswer(val) !== normalizeAnswer(currentPool[currentIndex].n)) {
            // Incorrect answer - flash red and clear
            const input = e.target;
            input.style.backgroundColor = 'rgba(231, 76, 60, 0.3)';
            input.style.borderColor = 'var(--floor-red)';
            setTimeout(() => {
                input.style.backgroundColor = '';
                input.style.borderColor = '';
            }, 300);
            input.value = '';
        }
    }
    // Add ` key to pass in non-host mode
    if ((e.key === '`' || e.key === '~') && gameActive && !inputLocked && !hostMode) {
        e.preventDefault();
        handlePass();
    }
});

// Global keyboard handler
document.addEventListener('keydown', (e) => {
    // Help menu (works anytime)
    if (e.key === '?') {
        e.preventDefault();
        toggleHelp();
        return;
    }

    // Fullscreen (works anytime in host mode)
    if ((e.key === 'f' || e.key === 'F') && hostMode) {
        e.preventDefault();
        toggleFullscreen();
        return;
    }

    if (!gameActive) return;

    // Host mode controls
    if (hostMode) {
        if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'j' || e.key === 'J') {
            e.preventDefault();
            if (!inputLocked) handleCorrect();
        } else if (e.key === 'k' || e.key === 'K') {
            e.preventDefault();
            togglePause();
        } else if (e.key === 'l' || e.key === 'L') {
            e.preventDefault();
            if (!inputLocked) handlePass();
        } else if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            resetGame();
        } else if (e.key === 'h' || e.key === 'H') {
            e.preventDefault();
            if (gameActive && !isPaused) toggleMoreSpecific();
        }
    }
});

function toggleMoreSpecific(forceState) {
    if (typeof forceState !== 'undefined') {
        moreSpecificActive = forceState;
    } else {
        moreSpecificActive = !moreSpecificActive;
    }
    const alertBox = document.getElementById('more-specific-alert');
    if (alertBox) {
        if (moreSpecificActive) alertBox.classList.add('show');
        else alertBox.classList.remove('show');
    }
}

function revealAnswer() {
    if (!gameActive || gamemode !== 'study') return;
    const answerText = currentPool[currentIndex].n;
    document.getElementById('reveal-text').innerText = answerText;
    document.getElementById('reveal-text').style.color = 'var(--floor-yellow)';
    document.getElementById('study-reveal-btn').style.display = 'none';
    document.getElementById('study-knew-btn').style.display = 'inline-block';
    document.getElementById('study-again-btn').style.display = 'inline-block';
    // Lock the text input while choosing
    document.getElementById('answer-input').disabled = true;
}

async function handleStudyKnewIt() {
    if (!gameActive || gamemode !== 'study') return;
    inputLocked = true;
    playDingSound();
    
    // Show correct answer with green flash
    document.getElementById('reveal-text').innerText = currentPool[currentIndex].n;
    document.getElementById('reveal-text').style.color = 'var(--floor-green)';
    document.getElementById('img-frame').classList.add('correct-border');
    
    // Hide study controls during transition
    document.getElementById('study-controls').style.display = 'none';
    
    await new Promise(r => setTimeout(r, 600));
    
    // Clean up border
    document.getElementById('img-frame').classList.remove('correct-border');
    
    // Re-enable input for next slide
    const answerInput = document.getElementById('answer-input');
    answerInput.disabled = false;
    answerInput.value = '';
    
    nextSlide();
}

async function handleStudyAgain() {
    if (!gameActive || gamemode !== 'study') return;
    inputLocked = true;
    playPassSound();
    
    // Show answer with red flash
    document.getElementById('reveal-text').innerText = currentPool[currentIndex].n;
    document.getElementById('reveal-text').style.color = 'var(--floor-red)';
    document.getElementById('img-frame').classList.add('pass-border');
    
    // Hide study controls during transition
    document.getElementById('study-controls').style.display = 'none';
    
    // Reinsert: once nearby (3 items from now) and once at the end
    const idx = currentIndex;
    if (studyQueue.length >= 3) {
        studyQueue.splice(3, 0, idx);
        studyQueue.push(idx);
    } else {
        studyQueue.push(idx);
        if (studyQueue.length >= 2) {
            studyQueue.push(idx);
        }
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Clean up border
    document.getElementById('img-frame').classList.remove('pass-border');
    
    // Re-enable input for next slide
    const answerInput = document.getElementById('answer-input');
    answerInput.disabled = false;
    answerInput.value = '';
    
    nextSlide();
}

async function handleCorrect() {
    if (gamemode === 'study') {
        handleStudyKnewIt();
        return;
    }
    inputLocked = true;
    toggleMoreSpecific(false);
    document.getElementById('img-frame').classList.add('correct-border');
    if (hostMode) {
        document.getElementById('reveal-text').innerText = currentPool[currentIndex].n;
    } else {
        document.getElementById('reveal-text').innerText = "CORRECT!";
    }

    // Calculate time taken for this answer
    const timeTaken = (Date.now() - answerStartTime) / 1000;

    // Stats tracking
    currentStreak++;
    const currentPlayer = activePlayer === 1 ? 'p1' : 'p2';
    const currentSlot = activePlayer === 1 ? 'left' : 'right';
    const currentPlayerName = playerNames[activePlayer - 1];

    // Last round stats
    lastRoundStats[currentPlayer].correct++;
    lastRoundStats.totalCorrect++;
    lastRoundStats.totalTime += timeTaken;
    lastRoundStats.answerCount++;

    // Per player stats
    if (!perPlayerStats[currentPlayerName]) {
        perPlayerStats[currentPlayerName] = { wins: 0, correct: 0, passed: 0, totalTime: 0, answerCount: 0 };
    }
    perPlayerStats[currentPlayerName].correct++;
    perPlayerStats[currentPlayerName].totalTime += timeTaken;
    perPlayerStats[currentPlayerName].answerCount++;

    // Per slot stats
    perSlotStats[currentSlot].correct++;
    perSlotStats[currentSlot].totalTime += timeTaken;
    perSlotStats[currentSlot].answerCount++;

    // Session stats
    sessionStats.totalCorrect++;
    sessionStats.totalTime += timeTaken;
    sessionStats.answerCount++;

    // Lifetime stats
    lifetimeStats.totalCorrect++;
    lifetimeStats.totalTime += timeTaken;
    lifetimeStats.answerCount++;
    saveLifetimeStats();

    // Play sound
    playDingSound();

    // Confetti
    if (confettiEnabled && !highContrastReducedMotion) {
        createConfetti();
    }

    gameTimerRemaining = 2;
    gameTimerStartNext = 2;
    for (let i = 0; i < 20; i++) {
        if (!gameActive) break;
        await new Promise(r => setTimeout(r, 100));
        if (isPaused) { i--; continue; }
        gameTimerRemaining = Math.max(0, 2 - (i + 1) * 0.1);
    }
    gameTimerRemaining = null;
    // Switch players only in classic mode
    if (gamemode === 'classic') {
        activePlayer = (activePlayer === 1) ? 2 : 1;
    }
    answerStartTime = Date.now();
    nextSlide();
}

async function handlePass() {
    if (gamemode === 'study') {
        handleStudyAgain();
        return;
    }
    inputLocked = true;
    inPassPhase = true; // Mark as pass phase so timer continues
    toggleMoreSpecific(false);
    document.getElementById('img-frame').classList.add('pass-border');
    document.getElementById('reveal-text').innerText = `PASSED: ${currentPool[currentIndex].n}`;

    // Calculate time taken for this answer
    const timeTaken = (Date.now() - answerStartTime) / 1000;

    // Stats tracking
    currentStreak = 0;
    const currentPlayer = activePlayer === 1 ? 'p1' : 'p2';
    const currentSlot = activePlayer === 1 ? 'left' : 'right';
    const currentPlayerName = playerNames[activePlayer - 1];

    // Last round stats
    lastRoundStats[currentPlayer].passed++;
    lastRoundStats.totalPassed++;
    lastRoundStats.totalTime += timeTaken;
    lastRoundStats.answerCount++;

    // Per player stats
    if (!perPlayerStats[currentPlayerName]) {
        perPlayerStats[currentPlayerName] = { wins: 0, correct: 0, passed: 0, totalTime: 0, answerCount: 0 };
    }
    perPlayerStats[currentPlayerName].passed++;
    perPlayerStats[currentPlayerName].totalTime += timeTaken;
    perPlayerStats[currentPlayerName].answerCount++;

    // Per slot stats
    perSlotStats[currentSlot].passed++;
    perSlotStats[currentSlot].totalTime += timeTaken;
    perSlotStats[currentSlot].answerCount++;

    // Session stats
    sessionStats.totalPassed++;
    sessionStats.totalTime += timeTaken;
    sessionStats.answerCount++;

    // Lifetime stats
    lifetimeStats.totalPassed++;
    lifetimeStats.totalTime += timeTaken;
    lifetimeStats.answerCount++;
    saveLifetimeStats();

    // Play sound
    playPassSound();

    gameTimerRemaining = 3;
    gameTimerStartNext = 3;
    for (let i = 0; i < 30; i++) {
        if (!gameActive) break;
        await new Promise(r => setTimeout(r, 100));
        if (isPaused) { i--; continue; }
        gameTimerRemaining = Math.max(0, 3 - (i + 1) * 0.1);
    }
    gameTimerRemaining = null;
    inPassPhase = false;
    answerStartTime = Date.now();
    nextSlide();
}

function nextSlide() {
    if (gamemode === 'study') {
        if (studyQueue.length === 0) {
            handleCategoryComplete();
            return;
        }
        currentIndex = studyQueue.shift();
        document.getElementById('answer-input').value = "";
        document.getElementById('reveal-text').innerText = "";
        
        const studyControls = document.getElementById('study-controls');
        if (studyControls) {
            studyControls.style.display = 'flex';
            document.getElementById('study-reveal-btn').style.display = 'block';
            document.getElementById('study-knew-btn').style.display = 'none';
            document.getElementById('study-again-btn').style.display = 'none';
        }
        
        const imgFrame = document.getElementById('img-frame');
        imgFrame.className = "image-container";
        if (!imgFrame.querySelector('#prompt-image')) {
            imgFrame.innerHTML = `
                        <div id="overlay"></div>
                        <img id="prompt-image" src="" onerror="handleImageError(this)">
                        <div id="math-problem" class="math-problem"></div>
                        <div id="pause-overlay">
                            <span class="pause-text">PAUSED</span>
                            <button type="button" class="pause-unhide-btn" onclick="unhidePauseImage()">UNHIDE</button>
                        </div>
                        <div id="pause-hide-bar">
                            <button type="button" class="pause-hide-btn" onclick="hidePauseImage()">HIDE</button>
                        </div>
                    `;
        }
        loadImage();
        inputLocked = false;
        answerStartTime = Date.now();
        updateClueDropdown();
        // Update category display to show progress
        document.getElementById('category-display').innerText = `${currentCategory} — ${studyQueue.length + 1} LEFT`;
        // Focus the input for typing
        const answerInput = document.getElementById('answer-input');
        if (answerInput) { answerInput.focus(); }
        return;
    }

    itemsCompleted++;

    // Check if all items have been completed
    if (itemsCompleted >= currentPool.length) {
        handleCategoryComplete();
        return;
    }

    currentIndex++;
    if (currentIndex >= currentPool.length) currentIndex = 0;
    document.getElementById('answer-input').value = "";
    document.getElementById('reveal-text').innerText = "";
    const imgFrame = document.getElementById('img-frame');
    imgFrame.className = "image-container";
    // Make sure image container has the right structure
    if (!imgFrame.querySelector('#prompt-image')) {
        imgFrame.innerHTML = `
                    <div id="overlay"></div>
                    <img id="prompt-image" src="" onerror="handleImageError(this)">
                    <div id="math-problem" class="math-problem"></div>
                    <div id="pause-overlay">
                        <span class="pause-text">PAUSED</span>
                        <button type="button" class="pause-unhide-btn" onclick="unhidePauseImage()">UNHIDE</button>
                    </div>
                    <div id="pause-hide-bar">
                        <button type="button" class="pause-hide-btn" onclick="hidePauseImage()">HIDE</button>
                    </div>
                `;
    }
    loadImage();
    inputLocked = false;
    answerStartTime = Date.now();
    updateClueDropdown();
}

function updateClueDropdown() {
    const select = document.getElementById('clue-jump-select');
    if (!select) return;
    
    if (!currentPool || currentPool.length === 0) {
        select.innerHTML = '<option value="">-- Start Game First --</option>';
        return;
    }
    
    if (select.options.length - 1 !== currentPool.length) {
        select.innerHTML = '<option value="">-- Jump to Clue --</option>';
        currentPool.forEach((item, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${i + 1}. ${item.n}`;
            select.appendChild(opt);
        });
    }
    
    if (select.value !== String(currentIndex)) {
        select.value = currentIndex;
    }
}

function jumpToClue(index) {
    if (gameActive && !isPaused) return; // Only allow jump when paused or not started yet
    if (!currentPool || currentPool.length === 0) return;
    
    const newIndex = parseInt(index);
    if (isNaN(newIndex) || newIndex < 0 || newIndex >= currentPool.length) return;
    
    currentIndex = newIndex;
    itemsCompleted = currentIndex; // Adjust items completed so completion logic works
    categoryComplete = false; // Reset if we jump back from end
    
    if (gameActive) {
        const answerInput = document.getElementById('answer-input');
        if (answerInput) answerInput.value = "";
        document.getElementById('reveal-text').innerText = "";
        
        const imgFrame = document.getElementById('img-frame');
        imgFrame.className = "image-container";
        
        loadImage();
        
        if (isPaused) {
            answerStartTime = Date.now();
            updatePauseOverlay(); // Re-hide the image behind the pause overlay
        }
    }
    
    updateClueDropdown();
    postStateToAdmin();
}

function handleCategoryComplete() {
    categoryComplete = true;
    gameActive = false;
    isPaused = false;
    toggleMoreSpecific(false);
    clearInterval(clockInterval);

    // Stop timers
    inputLocked = true;

    // Hide study controls
    const studyControls = document.getElementById('study-controls');
    if (studyControls) studyControls.style.display = 'none';

    if (gamemode === 'study') {
        // Study mode: celebratory completion
        if (!isMuted) {
            // Play a nice sound for study completion
            sounds.duelOver.currentTime = 0;
            sounds.duelOver.play().catch(() => {});
        }

        const imgFrame = document.getElementById('img-frame');
        imgFrame.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--floor-green); gap: 15px;">
                        <div style="font-size: 3rem; font-weight: bold; text-align: center;">STUDY COMPLETE! 🎉</div>
                        <div style="font-size: 1.5rem; color: var(--floor-yellow); text-align: center;">You've mastered all ${currentPool.length} items in ${currentCategory}</div>
                    </div>
                `;

        document.getElementById('p1-name').innerText = 'ALL DONE!';
        document.getElementById('p1-name').style.color = 'var(--floor-green)';
        return;
    }

    if (!isMuted) {
        sounds.duelMusic.pause();
        sounds.duelMusic.currentTime = 0;
        sounds.duelOver.currentTime = 0;
        sounds.duelOver.play().catch(() => {});
    }

    // Display category complete message
    const imgFrame = document.getElementById('img-frame');
    imgFrame.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--floor-yellow);">
                    <div style="font-size: 3rem; font-weight: bold; text-align: center;">CATEGORY COMPLETE</div>
                </div>
            `;

    // Update timer displays
    const p1Display = document.getElementById('p1-display');
    const p2Display = document.getElementById('p2-display');

    p1Display.innerHTML = formatTimer(timers[0]);
    p2Display.innerHTML = formatTimer(timers[1]);

    // Remove all classes first
    p1Display.className = 'clock';
    p2Display.className = 'clock';

    if (gamemode === 'singleplayer') {
        // Single player: show completion time in green
        p1Display.classList.add('active');
        p1Display.style.borderColor = 'var(--floor-green)';
        p1Display.style.color = 'var(--floor-green)';
        p1Display.style.boxShadow = '0 0 30px rgba(46, 204, 113, 0.5)';
    } else {
        // Classic/Host: Determine winner (player with more time)
        const winner = timers[0] > timers[1] ? 1 : 2;

        // Add winner/loser colors
        if (winner === 1) {
            p1Display.classList.add('active');
            p1Display.style.borderColor = 'var(--floor-green)';
            p1Display.style.color = 'var(--floor-green)';
            p1Display.style.boxShadow = '0 0 30px rgba(46, 204, 113, 0.5)';

            p2Display.style.borderColor = 'var(--floor-red)';
            p2Display.style.color = 'var(--floor-red)';
            p2Display.style.boxShadow = '0 0 30px rgba(231, 76, 60, 0.5)';
        } else {
            p2Display.classList.add('active');
            p2Display.style.borderColor = 'var(--floor-green)';
            p2Display.style.color = 'var(--floor-green)';
            p2Display.style.boxShadow = '0 0 30px rgba(46, 204, 113, 0.5)';

            p1Display.style.borderColor = 'var(--floor-red)';
            p1Display.style.color = 'var(--floor-red)';
            p1Display.style.boxShadow = '0 0 30px rgba(231, 76, 60, 0.5)';
        }

        // Record win in stats
        const winnerName = playerNames[winner - 1];
        const winnerSlot = winner === 1 ? 'left' : 'right';

        if (!perPlayerStats[winnerName]) {
            perPlayerStats[winnerName] = { wins: 0, correct: 0, passed: 0, totalTime: 0, answerCount: 0 };
        }
        perPlayerStats[winnerName].wins++;
        perSlotStats[winnerSlot].wins++;
    }

    updateMenuVisibility();
    sessionStats.gamesPlayed++;
    lifetimeStats.gamesPlayed++;
    saveLifetimeStats();

    updatePauseButton();

    // Reset placeholder text
    const answerInput = document.getElementById('answer-input');
    if (answerInput) answerInput.placeholder = 'SELECT A CATEGORY';
}

function loadImage() {
    const container = document.getElementById('img-frame');
    let img = document.getElementById('prompt-image');
    const fallback = document.getElementById('text-fallback');

    // Ensure image container has the right structure
    if (!img) {
        container.innerHTML = `
                    <div id="overlay"></div>
                    <img id="prompt-image" src="" onerror="handleImageError(this)">
                    <div id="math-problem" class="math-problem"></div>
                    <div id="pause-overlay">
                        <span class="pause-text">PAUSED</span>
                        <button type="button" class="pause-unhide-btn" onclick="unhidePauseImage()">UNHIDE</button>
                    </div>
                    <div id="pause-hide-bar">
                        <button type="button" class="pause-hide-btn" onclick="hidePauseImage()">HIDE</button>
                    </div>
                `;
        img = document.getElementById('prompt-image');
    }

    const item = currentPool[currentIndex];
    const isMath = item && typeof item.q === 'string';

    // Reset error handler flag for new image load
    img.dataset.errorHandled = 'false';

    // Remove fallback if it exists
    if (fallback) {
        fallback.remove();
    }

    container.style.display = 'block';

    const mp = document.getElementById('math-problem');

    // Resolve image src: absolute URLs stay as-is, relative paths that already
    // start with ../ are used directly, otherwise prepend ../ for duel/ context.
    function resolveImageSrc(rawSrc) {
        const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
        const cb = isFileProtocol ? '' : (rawSrc.includes('?') ? '&v=' + Date.now() : '?v=' + Date.now());
        if (rawSrc.match(/^https?:\/\//) || rawSrc.startsWith('//')) {
            return rawSrc + cb;
        } else if (rawSrc.startsWith('../')) {
            return rawSrc + cb;
        } else {
            return '../' + rawSrc + cb;
        }
    }

    if (isMath) {
        img.style.display = 'none';
        if (mp) {
            mp.textContent = item.q;
            mp.classList.add('show');
        }
        img.src = resolveImageSrc(item.u);
    } else {
        img.style.display = 'block';
        if (mp) mp.classList.remove('show');
        img.src = resolveImageSrc(item.u);
    }
}

function formatTimer(val) {
    const n = Math.max(0, val);
    return showTimerDecimal ? n.toFixed(1) : Math.floor(n).toString();
}

function updateDisplay() {
    // Study mode: don't touch timers or player names — they're managed by study logic
    if (gamemode === 'study') {
        // Hide extras in study mode
        document.getElementById('streak-display').classList.remove('show');
        document.getElementById('score-display').classList.remove('show');
        return;
    }

    let t1 = formatTimer(timers[0]);
    let t2 = formatTimer(timers[1]);

    const p1Display = document.getElementById('p1-display');
    const p2Display = document.getElementById('p2-display');
    const p2Container = document.querySelector('.clocks > div:nth-child(2)');

    // Hide/show second timer based on gamemode
    if (gamemode === 'singleplayer') {
        if (p2Container) p2Container.style.display = 'none';
    } else {
        if (p2Container) p2Container.style.display = 'block';
    }

    // Check if we should make timers editable (host mode + paused OR before game starts)
    const shouldBeEditable = hostMode && ((isPaused && gameActive) || (!gameActive && !categoryComplete));

    if (shouldBeEditable) {
        // Make timers editable
        const p1Input = p1Display.querySelector('input');
        const p2Input = p2Display.querySelector('input');

        if (!p1Input) {
            p1Display.innerHTML = `<input type="number" step="0.1" value="${t1}" onchange="updateTimer(1, this.value)" onblur="updateTimer(1, this.value)">`;
        } else if (document.activeElement !== p1Input) {
            // Only update if not currently focused
            p1Input.value = t1;
        }

        if (!p2Input) {
            p2Display.innerHTML = `<input type="number" step="0.1" value="${t2}" onchange="updateTimer(2, this.value)" onblur="updateTimer(2, this.value)">`;
        } else if (document.activeElement !== p2Input) {
            // Only update if not currently focused
            p2Input.value = t2;
        }

        p1Display.className = `clock editable ${activePlayer === 1 ? 'active' : ''}`;
        p2Display.className = `clock editable ${activePlayer === 2 ? 'active' : ''}`;
    } else {
        // Regular display
        p1Display.innerHTML = t1;
        p2Display.innerHTML = t2;

        // Timer warnings (only if category not complete)
        if (!categoryComplete) {
            let p1Class = `clock ${activePlayer === 1 ? 'active' : ''}`;
            let p2Class = `clock ${activePlayer === 2 ? 'active' : ''}`;

            const t1Num = parseFloat(t1);
            const t2Num = parseFloat(t2);

            if (activePlayer === 1) {
                if (t1Num <= 5) p1Class += ' danger';
                else if (t1Num <= 10) p1Class += ' warning';
            } else {
                if (t2Num <= 5) p2Class += ' danger';
                else if (t2Num <= 10) p2Class += ' warning';
            }

            p1Display.className = p1Class;
            p2Display.className = p2Class;
        }

    }

    // Update player names
    document.getElementById('p1-name').innerText = playerNames[0];
    document.getElementById('p2-name').innerText = playerNames[1];
    document.getElementById('p1-name').style.color = activePlayer === 1 ? 'var(--floor-yellow)' : '#888';
    document.getElementById('p2-name').style.color = activePlayer === 2 ? 'var(--floor-yellow)' : '#888';

    // Update in-game displays (only if extras not disabled)
    if (!disableExtras) {
        document.getElementById('streak-display').classList.add('show');
        document.getElementById('streak-display').textContent = `STREAK: ${currentStreak}`;

        const totalAnswers = lastRoundStats.totalCorrect + lastRoundStats.totalPassed;
        document.getElementById('score-display').classList.add('show');
        document.getElementById('score-display').textContent = `${lastRoundStats.totalCorrect} / ${totalAnswers}`;
    } else {
        document.getElementById('streak-display').classList.remove('show');
        document.getElementById('score-display').classList.remove('show');
    }
}
function updateTimer(playerNum, value) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
        timers[playerNum - 1] = numValue;
        // Don't call updateDisplay here to avoid overwriting the input
    }
}

const CATEGORY_KEYS = {};
if (window.CATEGORY_REGISTRY) { window.CATEGORY_REGISTRY.forEach(function (c) { CATEGORY_KEYS[c.key] = c.key; }); }
function resolveCategoryKey(input) {
    const v = String(input || '').toLowerCase().trim();
    if (CATEGORY_KEYS[v]) return v;
    const k = Object.keys(CATEGORY_SCRIPTS).find(function (c) { return c.toLowerCase() === v; });
    return k || null;
}

// ========== CATEGORY SELECT GRID ==========
function populateCategoryGrid() {
    const grid = document.getElementById('category-grid');
    if (!grid || !window.CATEGORY_REGISTRY) return;
    grid.innerHTML = '';
    
    const tiers = { 'Gible Verified': [], 'PPTGAMES': [] };
    window.CATEGORY_REGISTRY.forEach(function (c) {
        const t = c.tier || 'Gible Verified';
        if (tiers[t]) tiers[t].push(c);
        else tiers['Gible Verified'].push(c);
    });

    Object.keys(tiers).forEach(function(tier) {
        const cats = tiers[tier];
        if (cats.length === 0) return;
        
        // Alphabetize categories by label
        cats.sort((a, b) => a.label.localeCompare(b.label));
        
        const header = document.createElement('h3');
        header.className = 'tier-header';
        header.style.gridColumn = '1 / -1';
        header.style.color = 'var(--floor-yellow)';
        header.style.margin = '15px 0 5px';
        header.style.textAlign = 'center';
        header.style.textTransform = 'uppercase';
        header.style.fontSize = '1.2rem';
        header.textContent = tier;
        grid.appendChild(header);
        
        cats.forEach(function(c) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'cat-btn';
            btn.innerHTML = '<span class="cat-emoji">' + (c.emoji || '') + '</span><span class="cat-label">' + c.label + '</span>';
            btn.addEventListener('click', function () { selectCategory(c.key); });
            grid.appendChild(btn);
        });
    });
}

function openCategoryMenu() {
    populateCategoryGrid();
    document.getElementById('category-menu').classList.add('show');
}

function closeCategoryMenu() {
    document.getElementById('category-menu').classList.remove('show');
}

async function selectCategory(cat) {
    closeCategoryMenu();
    if (!cat || !CATEGORY_SCRIPTS[cat]) return;
    try {
        if (hostMode) {
            await setupGame(cat, { fromAdminWindow: false });
            startGameFromHost();
        } else {
            await setupGame(cat);
        }
    } catch (e) { console.error('Category load failed:', e); }
}

function endGame() {
    gameActive = false;
    isPaused = false;
    toggleMoreSpecific(false);
    clearInterval(clockInterval);

    if (!isMuted) {
        sounds.duelMusic.pause();
        sounds.duelMusic.currentTime = 0;
        sounds.duelOver.currentTime = 0;
        sounds.duelOver.play().catch(() => {});
    }

    // Determine winner (only in classic/host mode)
    // When endGame() is called, activePlayer's timer expired, so the opponent wins
    if (gamemode !== 'singleplayer') {
        // activePlayer's timer expired (they lost), so the opponent wins
        // If activePlayer is 1 (lost), winner is player 2 (index 1)
        // If activePlayer is 2 (lost), winner is player 1 (index 0)
        const winnerIndex = activePlayer === 1 ? 1 : 0;
        const winnerName = playerNames[winnerIndex];
        const winnerSlot = winnerIndex === 0 ? 'left' : 'right';

        // Stats tracking - record win
        if (!perPlayerStats[winnerName]) {
            perPlayerStats[winnerName] = { wins: 0, correct: 0, passed: 0, totalTime: 0, answerCount: 0 };
        }
        perPlayerStats[winnerName].wins++;
        perSlotStats[winnerSlot].wins++;
    }

    sessionStats.gamesPlayed++;
    lifetimeStats.gamesPlayed++;
    saveLifetimeStats();

    currentStreak = 0;

    // Get the answer that the player failed on
    const finalAnswer = currentPool[currentIndex].n;

    // Just add red border to image
    document.getElementById('img-frame').classList.add('pass-border');

    // Display the answer below the screen
    document.getElementById('reveal-text').innerText = finalAnswer;

    // Hide overlay if it's showing
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none';

    // Change background to darker theme
    document.body.classList.add('game-ended');

    // Update pause button and hide pause overlay
    updatePauseButton();
    updatePauseOverlay();
    updateMenuVisibility();

    // Reset placeholder text
    const answerInput = document.getElementById('answer-input');
    if (answerInput) answerInput.placeholder = 'SELECT A CATEGORY';
}

// ADMIN FUNCTIONS
async function runUnpauseCountdown() {
    const overlay = document.getElementById('overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.style.zIndex = '30';
    overlay.style.background = 'rgba(0,0,0,1)';
    if (!isMuted) {
        const c = sounds.countdown.cloneNode();
        c.volume = sfxVolume;
        c.currentTime = 0;
        c.play().catch(() => { });
    }
    for (let i = 3; i > 0; i--) {
        overlay.innerText = i;
        await new Promise(r => setTimeout(r, 1000));
    }
    overlay.style.display = 'none';
    overlay.style.background = '';
    overlay.style.zIndex = '20';
    isPaused = false;
    unpauseCountdownActive = false;
    if (!isMuted && gameActive && !categoryComplete) {
        sounds.duelMusic.play().catch(() => {});
    }
    updatePauseButton();
    updateDisplay();
    updatePauseOverlay();
    const hostControls = document.getElementById('host-pause-controls');
    if (hostControls) hostControls.style.display = 'none';
    postStateToAdmin();
}

function togglePause() {
    if (!gameActive || categoryComplete) return;
    if (unpauseCountdownActive) return;
    if (isPaused) {
        unpauseCountdownActive = true;
        runUnpauseCountdown();
        return;
    }
    isPaused = !isPaused;
    if (isPaused) {
        sounds.duelMusic.pause();
    }
    updatePauseButton();
    updateDisplay(); // Update to show/hide editable timers
    updatePauseOverlay();

    // Show/hide host pause controls
    const hostControls = document.getElementById('host-pause-controls');
    if (hostMode && isPaused && gameActive) {
        hostControls.style.display = 'block';
        updateActivePlayerLabels();
        document.getElementById(`active-p${activePlayer}`).checked = true;
    } else {
        hostControls.style.display = 'none';
    }
}

function updateActivePlayerLabels() {
    const l1 = document.querySelector('label[for="active-p1"]');
    const l2 = document.querySelector('label[for="active-p2"]');
    if (l1) l1.textContent = playerNames[0] || 'Player 1';
    if (l2) l2.textContent = playerNames[1] || 'Player 2';
}

function updateFirstPlayerLabels() {
    const l1 = document.querySelector('label[for="first-left"]');
    const l2 = document.querySelector('label[for="first-right"]');
    if (l1) l1.textContent = playerNames[0] || 'Left Player';
    if (l2) l2.textContent = playerNames[1] || 'Right Player';
}


function updateMenuVisibility() {
    const menu = document.querySelector('.menu');
    if (!menu) return;
    menu.style.display = (adminWindowOpen || gameActive) ? 'none' : '';
}

function updatePauseOverlay() {
    const po = document.getElementById('pause-overlay');
    const ph = document.getElementById('pause-hide-bar');
    if (!po || !ph) return;
    if (isPaused && gameActive && !categoryComplete) {
        po.classList.add('show');
        ph.classList.remove('show');
    } else {
        po.classList.remove('show');
        ph.classList.remove('show');
    }
}

function unhidePauseImage() {
    if (!isPaused || !gameActive) return;
    const po = document.getElementById('pause-overlay');
    const ph = document.getElementById('pause-hide-bar');
    if (!po || !ph) return;
    po.classList.remove('show');
    ph.classList.add('show');
}

function hidePauseImage() {
    if (!isPaused || !gameActive) return;
    const po = document.getElementById('pause-overlay');
    const ph = document.getElementById('pause-hide-bar');
    if (!po || !ph) return;
    po.classList.add('show');
    ph.classList.remove('show');
}

function changeActivePlayer(playerNum) {
    if (!gameActive || !isPaused || !hostMode) return;
    activePlayer = playerNum;
    updateDisplay();
}

function updatePauseButton() {
    const btn = document.getElementById('pause-btn');
    if (isPaused) {
        btn.textContent = 'RESUME';
        btn.classList.add('paused');
    } else {
        btn.textContent = 'PAUSE';
        btn.classList.remove('paused');
    }
}

function resetGame(skipConfirm) {
    if (!skipConfirm && !confirm('Are you sure you want to reset the game? This will clear all progress and stats.')) return;

    toggleMoreSpecific(false);
    if (clockInterval) clearInterval(clockInterval);

    // Stop audio immediately
    sounds.duelMusic.pause();
    sounds.duelMusic.currentTime = 0;
    sounds.duelOver.pause();
    sounds.duelOver.currentTime = 0;

    // Reset background
    document.body.classList.remove('game-ended');

    gameActive = false;
    isPaused = false;
    inputLocked = true;
    activePlayer = firstPlayerIsLeft ? 1 : 2;

    // Reset timers based on gamemode
    if (gamemode === 'singleplayer' || gamemode === 'study') {
        timers = [0.0, 0.0];
    } else {
        timers = [
            timeBoostsUsed[0] ? 50.0 : 45.0,
            timeBoostsUsed[1] ? 50.0 : 45.0
        ];
    }
    currentPool = [];
    studyQueue = [];
    currentIndex = 0;
    itemsCompleted = 0;
    categoryComplete = false;
    inPassPhase = false;
    updateClueDropdown();
    // Reset time boosts on reset
    timeBoostsUsed = [false, false];

    // Hide host pause controls
    document.getElementById('host-pause-controls').style.display = 'none';
    document.getElementById('p1-boost-btn').classList.remove('used');
    document.getElementById('p1-boost-btn').disabled = false;
    document.getElementById('p1-boost-btn').textContent = 'Time Boost? (+5s)';
    document.getElementById('p2-boost-btn').classList.remove('used');
    document.getElementById('p2-boost-btn').disabled = false;
    document.getElementById('p2-boost-btn').textContent = 'Time Boost? (+5s)';

    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }

    // Hide study controls
    const studyControls = document.getElementById('study-controls');
    if (studyControls) studyControls.style.display = 'none';

    // Reset UI
    updateDisplay();
    document.getElementById('reveal-text').innerText = "";
    document.getElementById('answer-input').value = "";
    document.getElementById('answer-input').disabled = true;
    document.getElementById('answer-input').style.display = 'block';
    document.getElementById('img-frame').className = "image-container";
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('category-display').style.display = 'none';
    currentCategory = "";
    categoryLoadedForHost = false;

    // Clear any fallback text
    const fallback = document.getElementById('text-fallback');
    if (fallback) {
        fallback.remove();
    }

    // Reset image
    const imgFrame = document.getElementById('img-frame');
    imgFrame.innerHTML = `
            <div id="welcome-message" class="welcome-message"><span class="welcome-line1">Welcome to</span><span class="welcome-line2">The Floor!</span></div>
            <div id="overlay"></div>
            <img id="prompt-image" src="" onerror="handleImageError(this)">
            <div id="math-problem" class="math-problem"></div>
            <div id="pause-overlay">
                <span class="pause-text">PAUSED</span>
                <button type="button" class="pause-unhide-btn" onclick="unhidePauseImage()">UNHIDE</button>
            </div>
            <div id="pause-hide-bar">
                <button type="button" class="pause-hide-btn" onclick="hidePauseImage()">HIDE</button>
            </div>
        `;
    const img = document.getElementById('prompt-image');
    img.src = "";
    img.style.display = 'block';
    img.dataset.errorHandled = 'false';

    // Reset timer colors and classes (clear winner/loser styling)
    resetTimerStyles();

    imgFrame.classList.remove('correct-border');
    imgFrame.classList.remove('pass-border');

    // Hide overlay
    document.getElementById('overlay').style.display = 'none';

    updateMenuVisibility();
    updatePauseButton();
    updateDisplay();

    // Reset placeholder text
    const answerInput = document.getElementById('answer-input');
    if (answerInput) answerInput.placeholder = 'SELECT A CATEGORY';
}

function showWelcomeOnMain() {
    const imgFrame = document.getElementById('img-frame');
    if (!imgFrame) return;
    imgFrame.className = 'image-container';
    imgFrame.innerHTML = `
            <div id="welcome-message" class="welcome-message"><span class="welcome-line1">Welcome to</span><span class="welcome-line2">The Floor!</span></div>
            <div id="overlay"></div>
            <img id="prompt-image" src="" onerror="handleImageError(this)" style="display: none;">
            <div id="math-problem" class="math-problem"></div>
            <div id="pause-overlay">
                <span class="pause-text">PAUSED</span>
                <button type="button" class="pause-unhide-btn" onclick="unhidePauseImage()">UNHIDE</button>
            </div>
            <div id="pause-hide-bar">
                <button type="button" class="pause-hide-btn" onclick="hidePauseImage()">HIDE</button>
            </div>
        `;
    document.getElementById('reveal-text').innerText = '';
    const ai = document.getElementById('answer-input');
    if (ai) { ai.value = ''; ai.disabled = true; ai.style.display = 'block'; }
    document.getElementById('category-display').style.display = 'none';
    currentCategory = '';
    categoryLoadedForHost = false;
}

function changeGamemode() {
    const select = document.getElementById('gamemode-select');
    gamemode = select.value;
    savePreferences();

    // Update UI based on gamemode
    const p1Container = document.querySelector('.clocks > div:nth-child(1)');
    const p2Container = document.querySelector('.clocks > div:nth-child(2)');
    const studyControls = document.getElementById('study-controls');
    const shuffleRow = document.getElementById('study-shuffle-row');

    if (gamemode === 'study') {
        // Hide both timer containers for study
        if (p1Container) p1Container.style.display = 'none';
        if (p2Container) p2Container.style.display = 'none';
        if (studyControls) studyControls.style.display = 'none';
        if (shuffleRow) shuffleRow.style.display = 'flex';
    } else if (gamemode === 'singleplayer') {
        if (p1Container) p1Container.style.display = 'block';
        if (p2Container) p2Container.style.display = 'none';
        if (studyControls) studyControls.style.display = 'none';
        if (shuffleRow) shuffleRow.style.display = 'none';
    } else {
        if (p1Container) p1Container.style.display = 'block';
        if (p2Container) p2Container.style.display = 'block';
        if (studyControls) studyControls.style.display = 'none';
        if (shuffleRow) shuffleRow.style.display = 'none';
    }

    // Update answer input based on host mode (if enabled)
    if (hostMode) {
        const answerInput = document.getElementById('answer-input');
        if (gameActive) {
            answerInput.disabled = true;
            answerInput.style.display = 'none';
        }
    }

    updateDisplay();
}

function toggleHostMode() {
    hostMode = document.getElementById('host-mode-toggle').checked;

    // Disable answer input in host mode
    const answerInput = document.getElementById('answer-input');
    if (hostMode && gameActive) {
        answerInput.disabled = true;
        answerInput.style.display = 'none';
    } else if (!hostMode && gameActive) {
        answerInput.disabled = false;
        answerInput.style.display = 'block';
    }

    const galleryBtn = document.getElementById('gallery-btn');
    if (galleryBtn) galleryBtn.style.display = hostMode ? 'block' : 'none';
    const adminWindowBtn = document.getElementById('admin-window-btn');
    if (adminWindowBtn) adminWindowBtn.style.display = hostMode ? 'block' : 'none';




    updateDisplay();
}

/* toggleGibleMode removed */

function togglePin() {
    isPinned = document.getElementById('pin-toggle').checked;
    const adminBoard = document.getElementById('admin-board');
    if (isPinned) {
        adminBoard.classList.add('pinned');
        document.body.classList.add('pinned-admin');
    } else {
        adminBoard.classList.remove('pinned');
        document.body.classList.remove('pinned-admin');
    }
}

function openAdminWindow() {
    if (adminWindowOpen && adminWindow && !adminWindow.closed) {
        adminWindow.focus();
        return;
    }
    adminWindow = window.open('admin.html', 'floor-admin', 'width=720,height=720,menubar=no,toolbar=no,location=no');
    if (!adminWindow) return;
    adminWindowOpen = true;
    hostMode = true;
    const hostToggle = document.getElementById('host-mode-toggle');
    if (hostToggle) hostToggle.checked = true;
    disableExtras = true;
    const deToggle = document.getElementById('disable-extras-toggle');
    if (deToggle) deToggle.checked = true;
    const helpBtn = document.getElementById('help-button');
    const fullscreenBtn = document.getElementById('fullscreen-button');
    const streakDisplay = document.getElementById('streak-display');
    const scoreDisplay = document.getElementById('score-display');
    if (helpBtn) helpBtn.classList.add('hidden');
    if (fullscreenBtn) fullscreenBtn.classList.add('hidden');
    if (streakDisplay) streakDisplay.classList.add('hidden');
    if (scoreDisplay) scoreDisplay.classList.add('hidden');
    updateDisplay();
    const galleryBtn = document.getElementById('gallery-btn');
    if (galleryBtn) galleryBtn.style.display = 'block';
    document.getElementById('admin-board').style.display = 'none';
    updateMenuVisibility();
    document.getElementById('help-button').style.display = 'none';
    document.body.classList.add('admin-window-open');
    if (!gameActive) showWelcomeOnMain();

    if (adminInterval) clearInterval(adminInterval);
    postStateToAdmin();
    adminInterval = setInterval(function () {
        if (!adminWindow || adminWindow.closed) {
            closeAdminWindow();
            return;
        }
        postStateToAdmin();
    }, 250);
}

function closeAdminWindow() {
    if (adminInterval) { clearInterval(adminInterval); adminInterval = null; }
    adminWindow = null;
    adminWindowOpen = false;
    hostMode = false;
    const hostToggle = document.getElementById('host-mode-toggle');
    if (hostToggle) hostToggle.checked = false;
    const galleryBtn = document.getElementById('gallery-btn');
    if (galleryBtn) galleryBtn.style.display = 'none';
    const adminBoard = document.getElementById('admin-board');
    if (adminBoard) adminBoard.style.display = '';
    updateMenuVisibility();
    const helpBtn = document.getElementById('help-button');
    if (helpBtn) helpBtn.style.display = '';
    document.body.classList.remove('admin-window-open');
    toggleHostMode();
    updateDisplay();
}

// ========== ADMIN WINDOW & POST-MESSAGE ==========
function postStateToAdmin() {
    if (!adminWindow || adminWindow.closed) return;
    const t1 = Math.max(0, timers[0]);
    const t2 = Math.max(0, timers[1]);
    let current = null, next = null;
    if (currentPool.length) {
        const cur = currentPool[currentIndex];
        if (cur) {
            current = { answer: cur.n, isMath: !!cur.q, question: cur.q || null, imageUrl: (!cur.q && cur.u) ? cur.u : null };
        }
        const nextIdx = (currentIndex + 1) % currentPool.length;
        const nxt = currentPool[nextIdx];
        if (nxt) next = { answer: nxt.n, isMath: !!nxt.q, question: nxt.q || null, imageUrl: (!nxt.q && nxt.u) ? nxt.u : null };
    }
    try {
        adminWindow.postMessage({
            source: 'floor',
            type: 'state',
            t1, t2,
            playerNames: playerNames.slice(),
            gamemode,
            moreSpecificActive: moreSpecificActive,
            poolNames: currentPool.map(c => c.n),
            currentIndex: currentIndex,
            current,
            next,
            firstPlayerIsLeft,
            timeBoostsUsed: timeBoostsUsed.slice(),
            isMuted,
            musicVolume,
            sfxVolume,
            gameActive,
            isPaused,
            activePlayer,
            categoryLoaded: categoryLoadedForHost,
            gameTimer: gameTimerRemaining,
            gameTimerStart: gameTimerStartNext,
            currentTheme: currentTheme,
            confettiEnabled: confettiEnabled,
            disableExtras: disableExtras,
            showTimerDecimal: showTimerDecimal,
            highContrastReducedMotion: highContrastReducedMotion,
            backgroundStyle: backgroundStyle,
            backgroundDriftSpeed: backgroundDriftSpeed,
            blueVariant: blueVariant,
            lastRound: lastRoundStats,
            session: sessionStats
        }, '*');
        if (gameTimerStartNext != null) gameTimerStartNext = null;
    } catch (e) { }
}

window.addEventListener('message', function (e) {
    if (!e.data || e.data.source !== 'admin') return;
    if (e.source !== adminWindow || !adminWindow || adminWindow.closed) return;
    const d = e.data;
    if (d.action === 'adminClosed' || d.action === 'adminReady') {
        if (d.action === 'adminClosed') closeAdminWindow();
        else if (d.action === 'adminReady' && adminWindow && !adminWindow.closed) postStateToAdmin();
        return;
    }
    if (d.action === 'loadCategory' && d.category) {
        const cat = resolveCategoryKey(d.category);
        if (cat && CATEGORY_SCRIPTS[cat]) {
            setupGame(cat, { fromAdminWindow: true, loadOnly: true }).catch(function (e) { console.error('Category load failed:', e); });
        }
        return;
    }
    if (d.action === 'startGame') {
        if (categoryLoadedForHost) startGameFromHost();
        return;
    }
    if (d.action === 'correct' && gameActive && !inputLocked) handleCorrect();
    else if (d.action === 'pause' && gameActive) togglePause();
    else if (d.action === 'pass' && gameActive && !inputLocked) handlePass();
    else if (d.action === 'reset') resetGame(true);
    else if (d.action === 'jumpToClue' && d.index != null) jumpToClue(d.index);
    else if (d.action === 'moreSpecific') toggleMoreSpecific();
    else if (d.action === 'gamemode' && d.value) {
        const sel = document.getElementById('gamemode-select');
        if (sel && (sel.value !== d.value)) { sel.value = d.value; changeGamemode(); }
    }
    else if (d.action === 'setPlayerNames') {
        if (d.p1 != null) playerNames[0] = String(d.p1) || 'Challenger';
        if (d.p2 != null) playerNames[1] = String(d.p2) || 'Expert';
        updateActivePlayerLabels();
        updateFirstPlayerLabels();
        updateDisplay();
        savePreferences();
    }
    else if (d.action === 'setFirstPlayer' && d.left != null) {
        firstPlayerIsLeft = !!d.left;
        if (document.getElementById('first-left')) document.getElementById('first-left').checked = firstPlayerIsLeft;
        if (document.getElementById('first-right')) document.getElementById('first-right').checked = !firstPlayerIsLeft;
        updateFirstPlayerLabels();
        updateDisplay();
        savePreferences();
    }
    else if (d.action === 'applyTimeBoost' && (d.playerNum === 1 || d.playerNum === 2)) {
        applyTimeBoost(d.playerNum);
    }
    else if (d.action === 'mute' && d.value != null) {
        isMuted = !!d.value;
        const mt = document.getElementById('mute-toggle');
        if (mt && mt.checked !== isMuted) mt.checked = isMuted;
        if (isMuted) {
            sounds.duelMusic.pause();
        } else if (gameActive && !isPaused && !categoryComplete) {
            sounds.duelMusic.play().catch(() => {});
        }
    }
    else if (d.action === 'volume' && d.type === 'music' && d.value != null) {
        musicVolume = d.value;
        sounds.duelMusic.volume = musicVolume;
        sounds.duelOver.volume = musicVolume;
        savePreferences();
    }
    else if (d.action === 'volume' && d.type === 'sfx' && d.value != null) {
        sfxVolume = d.value;
        sounds.countdown.volume = sfxVolume;
        sounds.passes.forEach(s => { s.volume = sfxVolume; });
        savePreferences();
    }
    else if (d.action === 'changeActivePlayer' && (d.playerNum === 1 || d.playerNum === 2)) {
        changeActivePlayer(d.playerNum);
    }
    else if (d.action === 'theme' && d.value) {
        currentTheme = d.value;
        changeTheme(d.value);
    }
    else if (d.action === 'confetti' && d.value != null) {
        confettiEnabled = !!d.value;
        var ct = document.getElementById('confetti-toggle');
        if (ct && ct.checked !== confettiEnabled) ct.checked = confettiEnabled;
        savePreferences();
    }
    else if (d.action === 'disableExtras' && d.value != null) {
        disableExtras = !!d.value;
        var de = document.getElementById('disable-extras-toggle');
        if (de && de.checked !== disableExtras) de.checked = disableExtras;
        if (disableExtras) {
            var helpBtn = document.getElementById('help-button');
            var fullscreenBtn = document.getElementById('fullscreen-button');
            var streakDisplay = document.getElementById('streak-display');
            var scoreDisplay = document.getElementById('score-display');
            if (helpBtn) helpBtn.classList.add('hidden');
            if (fullscreenBtn) fullscreenBtn.classList.add('hidden');
            if (streakDisplay) streakDisplay.classList.add('hidden');
            if (scoreDisplay) scoreDisplay.classList.add('hidden');
        } else {
            var helpBtn = document.getElementById('help-button');
            var fullscreenBtn = document.getElementById('fullscreen-button');
            var streakDisplay = document.getElementById('streak-display');
            var scoreDisplay = document.getElementById('score-display');
            if (helpBtn) helpBtn.classList.remove('hidden');
            if (fullscreenBtn) fullscreenBtn.classList.remove('hidden');
            if (streakDisplay) streakDisplay.classList.remove('hidden');
            if (scoreDisplay) scoreDisplay.classList.remove('hidden');
        }
        updateDisplay();
        savePreferences();

    }
    else if (d.action === 'showTimerDecimal' && d.value != null) {
        showTimerDecimal = !!d.value;
        var st = document.getElementById('show-timer-decimal-toggle');
        if (st && st.checked !== showTimerDecimal) st.checked = showTimerDecimal;
        updateDisplay();
        savePreferences();
    }
    else if (d.action === 'highContrastReducedMotion' && d.value != null) {
        highContrastReducedMotion = !!d.value;
        document.body.classList.toggle('high-contrast-reduced-motion', highContrastReducedMotion);
        var hc = document.getElementById('high-contrast-reduced-motion-toggle');
        if (hc && hc.checked !== highContrastReducedMotion) hc.checked = highContrastReducedMotion;
        savePreferences();
    }
    else if (d.action === 'backgroundStyle' && d.value && BG_STYLES.includes(d.value)) {
        backgroundStyle = d.value;
        BG_STYLES.forEach(function (b) { document.body.classList.remove('bg-' + b); });
        document.body.classList.add('bg-' + backgroundStyle);
        var bs = document.querySelectorAll('input[name="background-style"]');
        bs.forEach(function (r) { r.checked = (r.value === backgroundStyle); });
        savePreferences();
    }
    else if (d.action === 'backgroundDriftSpeed' && typeof d.value === 'number' && d.value >= 0.25 && d.value <= 2) {
        backgroundDriftSpeed = d.value;
        document.body.style.setProperty('--bg-drift-speed', String(backgroundDriftSpeed));
        var sl = document.getElementById('bg-drift-speed-slider');
        if (sl) sl.value = backgroundDriftSpeed;
        var lbl = document.getElementById('bg-drift-speed-label');
        if (lbl) lbl.textContent = backgroundDriftSpeed + '×';
        savePreferences();
    }
    else if (d.action === 'blueVariant' && d.value && ['a', 'b', 'c', 'd'].includes(d.value)) {
        blueVariant = d.value;
        ['a', 'b', 'c', 'd'].forEach(function (v) { document.body.classList.remove('blue-' + v); });
        document.body.classList.add('blue-' + blueVariant);
        var bv = document.querySelectorAll('input[name="blue-variant"]');
        bv.forEach(function (r) { r.checked = (r.value === blueVariant); });
        savePreferences();
    }
});

// CUSTOMIZATION FUNCTIONS
function openCustomization() {
    document.getElementById('customization-table').classList.add('show');
    // Update inputs with current values
    document.getElementById('p1-name-input').value = playerNames[0];
    document.getElementById('p2-name-input').value = playerNames[1];
    document.getElementById(firstPlayerIsLeft ? 'first-left' : 'first-right').checked = true;
    document.getElementById('mute-toggle').checked = isMuted;
    if (currentTheme === 'dark') {
        document.getElementById('theme-dark').checked = true;
    } else if (currentTheme === 'light') {
        document.getElementById('theme-light').checked = true;
    }
    document.getElementById('confetti-toggle').checked = confettiEnabled;
    document.getElementById('disable-extras-toggle').checked = disableExtras;
    document.getElementById('show-timer-decimal-toggle').checked = showTimerDecimal;
    const hcToggle = document.getElementById('high-contrast-reduced-motion-toggle');
    if (hcToggle) hcToggle.checked = highContrastReducedMotion;
    const bsRadios = document.querySelectorAll('input[name="background-style"]');
    if (bsRadios.length) bsRadios.forEach(function (r) { r.checked = (r.value === backgroundStyle); });
    const speedSlider = document.getElementById('bg-drift-speed-slider');
    if (speedSlider) speedSlider.value = backgroundDriftSpeed;
    const speedLabel = document.getElementById('bg-drift-speed-label');
    if (speedLabel) speedLabel.textContent = backgroundDriftSpeed + '×';
    const bvRadios = document.querySelectorAll('input[name="blue-variant"]');
    if (bvRadios.length) bvRadios.forEach(function (r) { r.checked = (r.value === blueVariant); });
    updateFirstPlayerLabels();

    // Update button visibility
    const helpBtn = document.getElementById('help-button');
    const fullscreenBtn = document.getElementById('fullscreen-button');
    const streakDisplay = document.getElementById('streak-display');
    const scoreDisplay = document.getElementById('score-display');
    if (disableExtras) {
        helpBtn.classList.add('hidden');
        fullscreenBtn.classList.add('hidden');
        streakDisplay.classList.add('hidden');
        scoreDisplay.classList.add('hidden');
    } else {
        helpBtn.classList.remove('hidden');
        fullscreenBtn.classList.remove('hidden');
        streakDisplay.classList.remove('hidden');
        scoreDisplay.classList.remove('hidden');
    }

    // Update boost button states
    const p1Btn = document.getElementById('p1-boost-btn');
    const p2Btn = document.getElementById('p2-boost-btn');
    if (timeBoostsUsed[0]) {
        p1Btn.classList.add('used');
        p1Btn.textContent = 'Undo Time Boost';
    } else {
        p1Btn.classList.remove('used');
        p1Btn.textContent = 'Time Boost? (+5s)';
    }
    if (timeBoostsUsed[1]) {
        p2Btn.classList.add('used');
        p2Btn.textContent = 'Undo Time Boost';
    } else {
        p2Btn.classList.remove('used');
        p2Btn.textContent = 'Time Boost? (+5s)';
    }
}

// ========== CUSTOMIZATION & TABS ==========
function switchCustomizationTab(tab) {
    const tabs = document.querySelectorAll('.custom-tab');
    const panels = document.querySelectorAll('.custom-tab-panel');
    tabs.forEach(function (t) {
        t.classList.toggle('active', t.getAttribute('data-tab') === tab);
    });
    panels.forEach(function (p) {
        p.classList.toggle('active', p.id === 'custom-tab-' + tab);
    });
}

function closeCustomization() {
    document.getElementById('customization-table').classList.remove('show');
    // Save player names
    playerNames[0] = document.getElementById('p1-name-input').value || 'Challenger';
    playerNames[1] = document.getElementById('p2-name-input').value || 'Expert';
    // Save first player setting
    firstPlayerIsLeft = document.getElementById('first-left').checked;
    updateActivePlayerLabels();
    updateFirstPlayerLabels();
    updateDisplay();
    savePreferences();
}

function applyTimeBoost(playerNum) {
    const btn = document.getElementById(`p${playerNum}-boost-btn`);

    if (!timeBoostsUsed[playerNum - 1]) {
        // Apply boost
        if (gameActive) {
            timers[playerNum - 1] += 5.0;
        }
        timeBoostsUsed[playerNum - 1] = true;
        btn.classList.add('used');
        btn.textContent = 'Undo Time Boost';
        updateDisplay();
    } else {
        // Undo boost
        if (gameActive) {
            timers[playerNum - 1] = Math.max(0, timers[playerNum - 1] - 5.0);
        }
        timeBoostsUsed[playerNum - 1] = false;
        btn.classList.remove('used');
        btn.textContent = 'Time Boost? (+5s)';
        updateDisplay();
    }
}

// Save customization on input change
document.getElementById('p1-name-input').addEventListener('change', function () {
    playerNames[0] = this.value || 'Challenger';
    updateDisplay();
});

document.getElementById('p2-name-input').addEventListener('change', function () {
    playerNames[1] = this.value || 'Expert';
    updateDisplay();
});

document.getElementById('first-left').addEventListener('change', function () {
    if (this.checked) firstPlayerIsLeft = true;
});

document.getElementById('first-right').addEventListener('change', function () {
    if (this.checked) firstPlayerIsLeft = false;
});

// UPDATED FAIL-SAFE (Better for Logos)
function showTextFallback(itemName) {
    const container = document.getElementById('img-frame');
    const img = document.getElementById('prompt-image');
    if (img) img.style.display = 'none';

    let fallback = document.getElementById('text-fallback');
    if (!fallback) {
        fallback = document.createElement('div');
        fallback.id = 'text-fallback';
        fallback.style.cssText = 'font-size:3rem; color:var(--floor-yellow); text-align:center;';
        fallback.textContent = itemName;
        container.appendChild(fallback);
    } else {
        fallback.textContent = itemName;
    }
}

function handleImageError(img) {
    if (!img.src || img.src === '' || img.src === window.location.href) return;

    // Prevent multiple error handlers from firing for the same load attempt
    if (img.dataset.errorHandled === 'true') return;

    // Mark handled immediately so the inline onerror doesn't re-enter
    img.dataset.errorHandled = 'true';

    const item = currentPool[currentIndex];
    const itemName = item.n;
    const isMath = item && typeof item.q === 'string';

    // Skip fallback for math category - it uses its own display element
    if (isMath) {
        img.style.display = 'none';
        return;
    }

    // --- Derive the base path (without extension) from the resolved src ---
    const currentSrc = img.src;
    const urlWithoutQuery = currentSrc.split('?')[0];
    const dotIndex = urlWithoutQuery.lastIndexOf('.');
    const basePath = dotIndex > 0 ? urlWithoutQuery.substring(0, dotIndex) : urlWithoutQuery;

    // Find the original extension from the category data to skip it
    const originalSrc = item.u || '';
    const originalUrlNoQ = originalSrc.split('?')[0];
    const originalDotIdx = originalUrlNoQ.lastIndexOf('.');
    const originalExt = originalDotIdx > 0
        ? originalUrlNoQ.substring(originalDotIdx + 1).toLowerCase() : '';

    // Extensions to probe (excluding the one that already failed)
    const ALT_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg', 'avif', 'svg', 'gif'];
    const toTry = ALT_EXTENSIONS.filter(ext => ext !== originalExt);
    const isFileProtocol = window.location.protocol === 'file:';
    const cb = isFileProtocol ? '' : '?v=' + Date.now();

    // Use independent Image() probes so we don't rely on onerror re-firing
    // on the same DOM <img> element (which is unreliable under file://).
    let probeIndex = 0;

    function tryNextExtension() {
        if (probeIndex >= toTry.length) {
            // All alternatives exhausted — show text fallback
            showTextFallback(itemName);
            return;
        }
        const probe = new Image();
        const testSrc = basePath + '.' + toTry[probeIndex] + cb;
        probeIndex++;
        probe.onload = function () {
            // Found a working extension — apply it to the DOM image
            img.src = testSrc;
            img.style.display = 'block';
        };
        probe.onerror = function () {
            tryNextExtension();
        };
        probe.src = testSrc;
    }

    tryNextExtension();
}

// NEW FEATURE FUNCTIONS
function toggleMute() {
    isMuted = document.getElementById('mute-toggle').checked;
    if (isMuted) {
        sounds.duelMusic.pause();
    } else if (gameActive && !isPaused && !categoryComplete) {
        sounds.duelMusic.play().catch(() => {});
    }
    savePreferences();
}

function changeTheme(theme) {
    currentTheme = theme;
    document.body.classList.remove('light-theme', 'gible-theme');
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    }
    savePreferences();
}

function openStatsMenu() {
    document.getElementById('stats-menu').classList.add('show');
    updateStatsDisplay();
    switchStatsTab('last-round');
}

function closeStatsMenu() {
    document.getElementById('stats-menu').classList.remove('show');
}

function switchStatsTab(tab, button) {
    // Hide all sections
    document.querySelectorAll('.stats-section').forEach(section => {
        section.classList.remove('show');
    });
    document.querySelectorAll('.stats-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    document.getElementById(`stats-${tab}`).classList.add('show');
    // Activate the clicked button
    if (button) {
        button.classList.add('active');
    }
    updateStatsDisplay();
}

function updateStatsDisplay() {
    // Last Round Stats
    document.getElementById('lr-correct').textContent = lastRoundStats.totalCorrect;
    document.getElementById('lr-passed').textContent = lastRoundStats.totalPassed;
    const lrTotal = lastRoundStats.totalCorrect + lastRoundStats.totalPassed;
    const lrAccuracy = lrTotal > 0 ? ((lastRoundStats.totalCorrect / lrTotal) * 100).toFixed(1) : '0.0';
    document.getElementById('lr-accuracy').textContent = lrAccuracy + '%';
    const lrAvgTime = lastRoundStats.answerCount > 0 ? (lastRoundStats.totalTime / lastRoundStats.answerCount).toFixed(1) : '0.0';
    document.getElementById('lr-avg-time').textContent = lrAvgTime + 's';
    document.getElementById('lr-p1-name').textContent = lastRoundStats.p1.name;
    document.getElementById('lr-p1-correct').textContent = lastRoundStats.p1.correct;
    document.getElementById('lr-p1-passed').textContent = lastRoundStats.p1.passed;
    document.getElementById('lr-p2-name').textContent = lastRoundStats.p2.name;
    document.getElementById('lr-p2-correct').textContent = lastRoundStats.p2.correct;
    document.getElementById('lr-p2-passed').textContent = lastRoundStats.p2.passed;

    // Per Player Stats
    const p1Name = playerNames[0];
    const p2Name = playerNames[1];
    const p1Stats = perPlayerStats[p1Name] || { wins: 0, correct: 0, passed: 0, totalTime: 0, answerCount: 0 };
    const p2Stats = perPlayerStats[p2Name] || { wins: 0, correct: 0, passed: 0, totalTime: 0, answerCount: 0 };

    document.getElementById('pp-p1-name').textContent = p1Name;
    document.getElementById('pp-p1-wins').textContent = p1Stats.wins;
    document.getElementById('pp-p1-correct').textContent = p1Stats.correct;
    document.getElementById('pp-p1-passed').textContent = p1Stats.passed;
    const p1Total = p1Stats.correct + p1Stats.passed;
    const p1Accuracy = p1Total > 0 ? ((p1Stats.correct / p1Total) * 100).toFixed(1) : '0.0';
    document.getElementById('pp-p1-accuracy').textContent = p1Accuracy + '%';

    document.getElementById('pp-p2-name').textContent = p2Name;
    document.getElementById('pp-p2-wins').textContent = p2Stats.wins;
    document.getElementById('pp-p2-correct').textContent = p2Stats.correct;
    document.getElementById('pp-p2-passed').textContent = p2Stats.passed;
    const p2Total = p2Stats.correct + p2Stats.passed;
    const p2Accuracy = p2Total > 0 ? ((p2Stats.correct / p2Total) * 100).toFixed(1) : '0.0';
    document.getElementById('pp-p2-accuracy').textContent = p2Accuracy + '%';

    // Per Slot Stats
    document.getElementById('ps-left-wins').textContent = perSlotStats.left.wins;
    document.getElementById('ps-left-correct').textContent = perSlotStats.left.correct;
    document.getElementById('ps-left-passed').textContent = perSlotStats.left.passed;
    const leftTotal = perSlotStats.left.correct + perSlotStats.left.passed;
    const leftAccuracy = leftTotal > 0 ? ((perSlotStats.left.correct / leftTotal) * 100).toFixed(1) : '0.0';
    document.getElementById('ps-left-accuracy').textContent = leftAccuracy + '%';

    document.getElementById('ps-right-wins').textContent = perSlotStats.right.wins;
    document.getElementById('ps-right-correct').textContent = perSlotStats.right.correct;
    document.getElementById('ps-right-passed').textContent = perSlotStats.right.passed;
    const rightTotal = perSlotStats.right.correct + perSlotStats.right.passed;
    const rightAccuracy = rightTotal > 0 ? ((perSlotStats.right.correct / rightTotal) * 100).toFixed(1) : '0.0';
    document.getElementById('ps-right-accuracy').textContent = rightAccuracy + '%';

    // Session Stats
    document.getElementById('ss-games').textContent = sessionStats.gamesPlayed;
    document.getElementById('ss-correct').textContent = sessionStats.totalCorrect;
    document.getElementById('ss-passed').textContent = sessionStats.totalPassed;
    const ssTotal = sessionStats.totalCorrect + sessionStats.totalPassed;
    const ssAccuracy = ssTotal > 0 ? ((sessionStats.totalCorrect / ssTotal) * 100).toFixed(1) : '0.0';
    document.getElementById('ss-accuracy').textContent = ssAccuracy + '%';
    const ssAvgTime = sessionStats.answerCount > 0 ? (sessionStats.totalTime / sessionStats.answerCount).toFixed(1) : '0.0';
    document.getElementById('ss-avg-time').textContent = ssAvgTime + 's';

    // Lifetime Stats
    document.getElementById('lt-games').textContent = lifetimeStats.gamesPlayed;
    document.getElementById('lt-correct').textContent = lifetimeStats.totalCorrect;
    document.getElementById('lt-passed').textContent = lifetimeStats.totalPassed;
    const ltTotal = lifetimeStats.totalCorrect + lifetimeStats.totalPassed;
    const ltAccuracy = ltTotal > 0 ? ((lifetimeStats.totalCorrect / ltTotal) * 100).toFixed(1) : '0.0';
    document.getElementById('lt-accuracy').textContent = ltAccuracy + '%';
    const ltAvgTime = lifetimeStats.answerCount > 0 ? (lifetimeStats.totalTime / lifetimeStats.answerCount).toFixed(1) : '0.0';
    document.getElementById('lt-avg-time').textContent = ltAvgTime + 's';
}

function toggleConfetti() {
    confettiEnabled = document.getElementById('confetti-toggle').checked;
    savePreferences();
}

function toggleDisableExtras() {
    disableExtras = document.getElementById('disable-extras-toggle').checked;
    const helpBtn = document.getElementById('help-button');
    const fullscreenBtn = document.getElementById('fullscreen-button');
    const streakDisplay = document.getElementById('streak-display');
    const scoreDisplay = document.getElementById('score-display');

    if (disableExtras) {
        helpBtn.classList.add('hidden');
        fullscreenBtn.classList.add('hidden');
        streakDisplay.classList.add('hidden');
        scoreDisplay.classList.add('hidden');
    } else {
        helpBtn.classList.remove('hidden');
        fullscreenBtn.classList.remove('hidden');
        streakDisplay.classList.remove('hidden');
        scoreDisplay.classList.remove('hidden');
    }
    updateDisplay();

    savePreferences();
}

function toggleShowTimerDecimal() {
    showTimerDecimal = document.getElementById('show-timer-decimal-toggle').checked;
    updateDisplay();
    savePreferences();
}

function toggleHighContrastReducedMotion() {
    highContrastReducedMotion = document.getElementById('high-contrast-reduced-motion-toggle').checked;
    document.body.classList.toggle('high-contrast-reduced-motion', highContrastReducedMotion);
    savePreferences();
}

function setBackgroundStyle(style) {
    backgroundStyle = style;
    BG_STYLES.forEach(function (b) { document.body.classList.remove('bg-' + b); });
    document.body.classList.add('bg-' + backgroundStyle);
    savePreferences();
}

function setBackgroundDriftSpeed(speed) {
    const v = parseFloat(speed);
    if (isNaN(v)) return;
    backgroundDriftSpeed = Math.max(0.25, Math.min(2, v));
    document.body.style.setProperty('--bg-drift-speed', String(backgroundDriftSpeed));
    var sl = document.getElementById('bg-drift-speed-slider');
    if (sl) sl.value = backgroundDriftSpeed;
    var lbl = document.getElementById('bg-drift-speed-label');
    if (lbl) lbl.textContent = backgroundDriftSpeed + '×';
    savePreferences();
}

function setBlueVariant(v) {
    blueVariant = v;
    ['a', 'b', 'c', 'd'].forEach(function (x) { document.body.classList.remove('blue-' + x); });
    document.body.classList.add('blue-' + blueVariant);
    savePreferences();
}

function toggleHelp() {
    const overlay = document.getElementById('help-overlay');
    overlay.classList.toggle('show');
}

function closeHelp() {
    document.getElementById('help-overlay').classList.remove('show');
}

function toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
        document.body.classList.add('fullscreen');
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => { });
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        document.body.classList.remove('fullscreen');
    }
}

// Listen for fullscreen changes to update class
document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement) {
        document.body.classList.remove('fullscreen');
    }
});
document.addEventListener('webkitfullscreenchange', function () {
    if (!document.webkitFullscreenElement) {
        document.body.classList.remove('fullscreen');
    }
});
document.addEventListener('mozfullscreenchange', function () {
    if (!document.mozFullScreenElement) {
        document.body.classList.remove('fullscreen');
    }
});
document.addEventListener('MSFullscreenChange', function () {
    if (!document.msFullscreenElement) {
        document.body.classList.remove('fullscreen');
    }
});

// Initialize: load persisted preferences, apply to DOM, then gamemode UI
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

// ========== INIT ==========
function initPage() {
    createPopLayer();
    loadPreferences();
    applyPreferencesToDOM();
    changeGamemode();
    updateFirstPlayerLabels();

}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['var(--floor-yellow)', 'var(--floor-green)', 'var(--floor-red)', '#fff'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        container.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

function resetTimerStyles() {
    const p1Display = document.getElementById('p1-display');
    const p2Display = document.getElementById('p2-display');
    const p1Name = document.getElementById('p1-name');
    const p2Name = document.getElementById('p2-name');

    if (p1Display) {
        p1Display.style.borderColor = '';
        p1Display.style.color = '';
        p1Display.style.boxShadow = '';
        p1Display.className = 'clock';
    }
    if (p2Display) {
        p2Display.style.borderColor = '';
        p2Display.style.color = '';
        p2Display.style.boxShadow = '';
        p2Display.className = 'clock';
    }
    if (p1Name) p1Name.style.color = '#888';
    if (p2Name) p2Name.style.color = '#888';
}
