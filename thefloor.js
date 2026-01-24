        // 'flagData' is loaded from flags.js automatically
        const categories = {
        flags: (typeof flagData !== 'undefined') ? flagData : [],
        pokemon: (typeof pokemonData !== 'undefined') ? pokemonData : [],
        hockey: (typeof hockeyData !== 'undefined') ? hockeyData : []
    };

        // --- GAME LOGIC ---
        let activePlayer = 1;
        let timers = [45.0, 45.0];
        let currentPool = [];
        let currentIndex = 0;
        let gameActive = false;
        let inputLocked = true;
        let clockInterval = null;
        let isPaused = false;
        let gamemode = 'singleplayer'; // 'singleplayer' or 'classic'
        let hostMode = false; // Separate toggle that works with either gamemode
        let isPinned = false;
        let playerNames = ["Challenger", "Expert"];
        let firstPlayerIsLeft = true;
        let timeBoostsUsed = [false, false];
        let currentCategory = "";
        let itemsCompleted = 0; // Track how many items have been completed
        let categoryComplete = false;
        
        // NEW FEATURES
        let isMuted = false;
        let currentTheme = 'dark';
        let confettiEnabled = false;
        let disableExtras = false;
        let currentStreak = 0;
        
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
        
        // Sound effects: ding1–ding10 (correct), pass1–pass5 (pass). Play in order, loop after last.
        const DING_COUNT = 10;
        const PASS_COUNT = 5;
        let sounds = {
            countdown: new Audio('sounds/countdown.mp3'),
            dings: Array.from({ length: DING_COUNT }, (_, i) => new Audio(`sounds/ding${i + 1}.mp3`)),
            passes: Array.from({ length: PASS_COUNT }, (_, i) => new Audio(`sounds/pass${i + 1}.mp3`))
        };
        sounds.countdown.volume = 0.5;
        sounds.dings.forEach(s => { s.volume = 0.5; });
        sounds.passes.forEach(s => { s.volume = 0.5; });

        let dingIndex = 0;
        let passIndex = 0;

        function playDingSound() {
            if (isMuted) return;
            const src = sounds.dings[dingIndex];
            const s = src.cloneNode();
            s.volume = 0.5;
            s.currentTime = 0;
            s.play().catch(() => {});
            dingIndex = (dingIndex + 1) % DING_COUNT;
        }

        function playPassSound() {
            if (isMuted) return;
            const src = sounds.passes[passIndex];
            const s = src.cloneNode();
            s.volume = 0.5;
            s.currentTime = 0;
            s.play().catch(() => {});
            passIndex = (passIndex + 1) % PASS_COUNT;
        }

        async function setupGame(cat) {
            if (gameActive) return;
            
            // Reset background
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
            
            // Store category name
            currentCategory = cat.toUpperCase();
            document.getElementById('category-display').innerText = currentCategory;
            document.getElementById('category-display').style.display = 'block';
            
            // Set active player based on customization
            activePlayer = firstPlayerIsLeft ? 1 : 2;
            
            // Initialize timers based on gamemode
            if (gamemode === 'singleplayer') {
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
            dingIndex = 0;
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
            
            // SHUFFLE: Randomize the order every time, unless in host mode
            if (hostMode) {
                currentPool = [...categories[cat]];
            } else {
                currentPool = [...categories[cat]].sort(() => Math.random() - 0.5);
            }
            
            // In single player, always use player 1
            if (gamemode === 'singleplayer') {
                activePlayer = 1;
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
            
            // Handle host mode differently
            if (hostMode) {
                // Show category and start button instead of auto-starting
                const imgFrame = document.getElementById('img-frame');
                // Clear any existing image
                const img = document.getElementById('prompt-image');
                if (img) {
                    img.src = '';
                    img.style.display = 'none';
                }
                imgFrame.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--floor-yellow);">
                        <div style="font-size: 4rem; font-weight: bold; margin-bottom: 30px;">${currentCategory}</div>
                        <button onclick="startGameFromHost()" style="padding: 20px 40px; font-size: 2rem; background: var(--floor-green); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">START</button>
                    </div>
                `;
                
                // Hide answer input
                const answerInput = document.getElementById('answer-input');
                answerInput.disabled = true;
                answerInput.style.display = 'none';
                
                // Clear reveal text
                document.getElementById('reveal-text').innerText = "";
            } else {
                // Normal mode - 3-Second Countdown
                const overlay = document.getElementById('overlay');
                overlay.style.display = 'flex';
                // Play countdown sound once at the start
                if (!isMuted) {
                    sounds.countdown.currentTime = 0;
                    sounds.countdown.play().catch(() => {});
                }
                for(let i=3; i>0; i--) {
                    overlay.innerText = i;
                    await new Promise(r => setTimeout(r, 1000));
                }
                overlay.style.display = 'none';

                gameActive = true;
                inputLocked = false;
                loadImage();
                
                if(clockInterval) clearInterval(clockInterval);
                clockInterval = setInterval(gameLoop, 100);
                
                // Handle answer input
                const answerInput = document.getElementById('answer-input');
                answerInput.disabled = false;
                answerInput.style.display = 'block';
                answerInput.focus();
            }
        }

        async function startGameFromHost() {
            // Restore image container and ensure it's empty/hidden
            const imgFrame = document.getElementById('img-frame');
            imgFrame.innerHTML = `
                <div id="overlay"></div>
                <img id="prompt-image" src="" onerror="handleImageError(this)" style="display: none;">
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
            
            // 3-Second Countdown with fully opaque overlay
            const overlay = document.getElementById('overlay');
            overlay.style.display = 'flex';
            overlay.style.zIndex = '20';
            overlay.style.background = 'rgba(0,0,0,1)';
            // Play countdown sound once at the start
            if (!isMuted) {
                sounds.countdown.currentTime = 0;
                sounds.countdown.play().catch(() => {});
            }
            for(let i=3; i>0; i--) {
                overlay.innerText = i;
                await new Promise(r => setTimeout(r, 1000));
            }
            overlay.style.display = 'none';
            overlay.style.background = 'rgba(0,0,0,0.9)'; // Reset for other uses

            gameActive = true;
            inputLocked = false;
            
            // Reset answerStartTime now that the game actually begins (after countdown)
            answerStartTime = Date.now();
            
            // Now show and load the image after countdown
            const img = document.getElementById('prompt-image');
            img.style.display = 'block';
            loadImage();
            
            if(clockInterval) clearInterval(clockInterval);
            clockInterval = setInterval(gameLoop, 100);
        }

        function gameLoop() {
            if (!gameActive || categoryComplete) return;
            
            if (gamemode === 'singleplayer') {
                // Single player: count up
                if (!inputLocked && !isPaused) {
                    timers[0] += 0.1;
                }
            } else {
                // Classic/Host: count down
                if (!inputLocked && !isPaused) timers[activePlayer - 1] -= 0.1;
                
                if (timers[activePlayer - 1] <= 0) {
                    timers[activePlayer - 1] = 0;
                    endGame();
                }
            }
            updateDisplay();
        }

        document.getElementById('answer-input').addEventListener('input', (e) => {
            if (!gameActive || inputLocked) return;
            let val = e.target.value.toUpperCase().trim();
            // Match Logic
            if (val === currentPool[currentIndex].n) handleCorrect();
        });

        document.getElementById('answer-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && gameActive && !inputLocked) {
                if (e.target.value.trim() === "") handlePass();
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
                }
            }
        });

        async function handleCorrect() {
            inputLocked = true;
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
            if (confettiEnabled) {
                createConfetti();
            }
            
            await new Promise(r => setTimeout(r, 2000));
            // Switch players only in classic mode
            if (gamemode === 'classic') {
                activePlayer = (activePlayer === 1) ? 2 : 1;
            }
            answerStartTime = Date.now();
            nextSlide();
        }

        async function handlePass() {
            inputLocked = true;
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

            // Wait 3 seconds while timer continues (input stays locked so you can't spam pass/correct)
            for (let i = 0; i < 30; i++) {
                if (!gameActive) break;
                await new Promise(r => setTimeout(r, 100));
            }
            answerStartTime = Date.now();
            nextSlide();
        }

        function nextSlide() {
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
        }

        function handleCategoryComplete() {
            categoryComplete = true;
            gameActive = false;
            isPaused = false;
            clearInterval(clockInterval);
            
            // Stop timers
            inputLocked = true;
            
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
            
            p1Display.innerHTML = Math.max(0, timers[0]).toFixed(1);
            p2Display.innerHTML = Math.max(0, timers[1]).toFixed(1);
            
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
            
            sessionStats.gamesPlayed++;
            lifetimeStats.gamesPlayed++;
            saveLifetimeStats();
            
            updatePauseButton();
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
            
            // Reset error handler flag
            img.dataset.errorHandled = 'false';
            
            // Remove fallback if it exists
            if (fallback) {
                fallback.remove();
            }
            
            // Reset container display and show image
            container.style.display = 'block';
            img.style.display = 'block';
            
            // Load the new image
            img.src = currentPool[currentIndex].u;
        }

        function updateDisplay() {
            let t1 = Math.max(0, timers[0]).toFixed(1);
            let t2 = Math.max(0, timers[1]).toFixed(1);
            
            const p1Display = document.getElementById('p1-display');
            const p2Display = document.getElementById('p2-display');
            const p2Container = document.querySelector('.clocks > div:nth-child(2)');
            
            // Hide/show second timer based on gamemode
            if (gamemode === 'singleplayer') {
                if (p2Container) p2Container.style.display = 'none';
            } else {
                if (p2Container) p2Container.style.display = 'block';
            }
            
            // Check if we should make timers editable (host mode + paused)
            const shouldBeEditable = hostMode && isPaused && gameActive;
            
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

        function startSelectedCategory() {
            const dropdown = document.getElementById('category-dropdown');
            const category = dropdown.value.toLowerCase().trim();
            
            if (category && categories[category]) {
                setupGame(category);
                dropdown.value = '';
            }
        }

        // Allow Enter key to start game from dropdown
        document.getElementById('category-dropdown').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                startSelectedCategory();
            }
        });

        function endGame() {
        gameActive = false;
        isPaused = false;
        clearInterval(clockInterval);
        
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
    }

    // ADMIN FUNCTIONS
    function togglePause() {
        if (!gameActive || categoryComplete) return;
        isPaused = !isPaused;
        updatePauseButton();
        updateDisplay(); // Update to show/hide editable timers
        updatePauseOverlay();

        // Show/hide host pause controls
        const hostControls = document.getElementById('host-pause-controls');
        if (hostMode && isPaused && gameActive) {
            hostControls.style.display = 'block';
            // Update radio buttons to match current active player
            document.getElementById(`active-p${activePlayer}`).checked = true;
        } else {
            hostControls.style.display = 'none';
        }
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

    function resetGame() {
        if (!confirm('Are you sure you want to reset the game? This will stop the current game and reset all timers.')) {
            return;
        }
        
        // Reset background
        document.body.classList.remove('game-ended');
        
        gameActive = false;
        isPaused = false;
        inputLocked = true;
        activePlayer = firstPlayerIsLeft ? 1 : 2;
        
        // Reset timers based on gamemode
        if (gamemode === 'singleplayer') {
            timers = [0.0, 0.0];
        } else {
            timers = [
                timeBoostsUsed[0] ? 50.0 : 45.0,
                timeBoostsUsed[1] ? 50.0 : 45.0
            ];
        }
        currentPool = [];
        currentIndex = 0;
        itemsCompleted = 0;
        categoryComplete = false;
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
        
        // Clear any fallback text
        const fallback = document.getElementById('text-fallback');
        if (fallback) {
            fallback.remove();
        }
        
        // Reset image
        const imgFrame = document.getElementById('img-frame');
        imgFrame.innerHTML = `
            <div id="overlay"></div>
            <img id="prompt-image" src="" onerror="handleImageError(this)">
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
        
        // Remove red border
        imgFrame.classList.remove('pass-border');
        
        // Reset timer colors
        const p1Display = document.getElementById('p1-display');
        const p2Display = document.getElementById('p2-display');
        p1Display.style.borderColor = '';
        p1Display.style.color = '';
        p1Display.style.boxShadow = '';
        p2Display.style.borderColor = '';
        p2Display.style.color = '';
        p2Display.style.boxShadow = '';
        
        // Hide overlay
        document.getElementById('overlay').style.display = 'none';
        
        updatePauseButton();
        updateDisplay();
    }

    function changeGamemode() {
        const select = document.getElementById('gamemode-select');
        gamemode = select.value;
        
        // Update UI for single player mode
        const p2Container = document.querySelector('.clocks > div:nth-child(2)');
        if (gamemode === 'singleplayer') {
            // Hide second player timer in single player
            if (p2Container) p2Container.style.display = 'none';
        } else {
            // Show both timers in classic
            if (p2Container) p2Container.style.display = 'block';
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
        
        // Show Gallery button only in host mode
        const galleryBtn = document.getElementById('gallery-btn');
        if (galleryBtn) galleryBtn.style.display = hostMode ? 'block' : 'none';
        
        updateDisplay();
    }

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
        } else if (currentTheme === 'gible') {
            document.getElementById('theme-gible').checked = true;
        }
        document.getElementById('confetti-toggle').checked = confettiEnabled;
        document.getElementById('disable-extras-toggle').checked = disableExtras;
        
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

    function closeCustomization() {
        document.getElementById('customization-table').classList.remove('show');
        // Save player names
        playerNames[0] = document.getElementById('p1-name-input').value || 'Challenger';
        playerNames[1] = document.getElementById('p2-name-input').value || 'Expert';
        // Save first player setting
        firstPlayerIsLeft = document.getElementById('first-left').checked;
        // Update display
        updateDisplay();
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
    document.getElementById('p1-name-input').addEventListener('change', function() {
        playerNames[0] = this.value || 'Challenger';
        updateDisplay();
    });

    document.getElementById('p2-name-input').addEventListener('change', function() {
        playerNames[1] = this.value || 'Expert';
        updateDisplay();
    });

    document.getElementById('first-left').addEventListener('change', function() {
        if (this.checked) firstPlayerIsLeft = true;
    });

    document.getElementById('first-right').addEventListener('change', function() {
        if (this.checked) firstPlayerIsLeft = false;
    });

    // UPDATED FAIL-SAFE (Better for Logos)
    function handleImageError(img) {
        // Prevent multiple error handlers from firing
        if (img.dataset.errorHandled === 'true') return;
        img.dataset.errorHandled = 'true';
        
        const itemName = currentPool[currentIndex].n;
        const container = document.getElementById('img-frame');
        
        // Hide the image
        img.style.display = 'none';
        
        // Check if fallback already exists to prevent duplicates
        let fallback = document.getElementById('text-fallback');
        if (!fallback) {
            // Create fallback text element
            fallback = document.createElement('div');
            fallback.id = 'text-fallback';
            fallback.style.cssText = 'font-size:3rem; color:var(--floor-yellow); text-align:center;';
            fallback.textContent = itemName;
            container.appendChild(fallback);
        } else {
            // Update existing fallback
            fallback.textContent = itemName;
        }
    }

    // NEW FEATURE FUNCTIONS
    function toggleMute() {
        isMuted = document.getElementById('mute-toggle').checked;
    }

    function changeTheme(theme) {
        currentTheme = theme;
        document.body.classList.remove('light-theme', 'gible-theme');
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else if (theme === 'gible') {
            document.body.classList.add('gible-theme');
        }
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
                document.documentElement.requestFullscreen().catch(() => {});
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
                document.exitFullscreen().catch(() => {});
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
    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement) {
            document.body.classList.remove('fullscreen');
        }
    });
    document.addEventListener('webkitfullscreenchange', function() {
        if (!document.webkitFullscreenElement) {
            document.body.classList.remove('fullscreen');
        }
    });
    document.addEventListener('mozfullscreenchange', function() {
        if (!document.mozFullScreenElement) {
            document.body.classList.remove('fullscreen');
        }
    });
    document.addEventListener('MSFullscreenChange', function() {
        if (!document.msFullscreenElement) {
            document.body.classList.remove('fullscreen');
        }
    });
    
    // Initialize gamemode UI on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            changeGamemode(); // Set initial UI state
        });
    } else {
        // DOM already loaded
        changeGamemode();
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

