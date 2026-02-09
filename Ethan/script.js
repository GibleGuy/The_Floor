// Dice configuration
const diceConfig = [
    { id: 'white1', color: 'white', resultId: 'result-white1' },
    { id: 'white2', color: 'white', resultId: 'result-white2' },
    { id: 'red', color: 'red', resultId: 'result-red' },
    { id: 'yellow', color: 'yellow', resultId: 'result-yellow' },
    { id: 'blue', color: 'blue', resultId: 'result-blue' },
    { id: 'green', color: 'green', resultId: 'result-green' }
];

// Face rotations for each die value (1-6)
const faceRotations = {
    1: 'rotateX(0deg) rotateY(0deg)',      // front
    2: 'rotateX(0deg) rotateY(180deg)',    // back
    3: 'rotateX(0deg) rotateY(-90deg)',    // left
    4: 'rotateX(0deg) rotateY(90deg)',     // right
    5: 'rotateX(-90deg) rotateY(0deg)',    // top
    6: 'rotateX(90deg) rotateY(0deg)'      // bottom
};

// Initialize dice faces with numbers
function initializeDice() {
    diceConfig.forEach(dice => {
        const diceElement = document.getElementById(dice.id);
        const faces = diceElement.querySelectorAll('.face');

        faces[0].setAttribute('data-value', '1'); // front
        faces[1].setAttribute('data-value', '2'); // back
        faces[2].setAttribute('data-value', '4'); // right
        faces[3].setAttribute('data-value', '3'); // left
        faces[4].setAttribute('data-value', '5'); // top
        faces[5].setAttribute('data-value', '6'); // bottom
    });
}

// Roll a single die
function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

// Roll all dice with animation
function rollAllDice() {
    const rollButton = document.getElementById('rollButton');
    rollButton.disabled = true;

    // Add rolling animation to all dice
    diceConfig.forEach(dice => {
        const diceElement = document.getElementById(dice.id);
        diceElement.classList.add('rolling');
    });

    // After animation completes, show results
    setTimeout(() => {
        const results = {};

        diceConfig.forEach(dice => {
            const value = rollDie();
            results[dice.id] = value;

            // Update dice rotation to show the rolled value
            const diceElement = document.getElementById(dice.id);
            const rotation = faceRotations[value];
            diceElement.style.transform = rotation;

            // Update result display
            const resultElement = document.getElementById(dice.resultId);
            resultElement.textContent = value;
            resultElement.classList.remove('updated');
            // Trigger reflow to restart animation
            void resultElement.offsetWidth;
            resultElement.classList.add('updated');

            // Remove rolling animation
            diceElement.classList.remove('rolling');
        });

        // Log results to console
        console.log('Dice Roll Results:', results);

        // Re-enable button
        rollButton.disabled = false;
    }, 800); // Match animation duration
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeDice();

    const rollButton = document.getElementById('rollButton');
    rollButton.addEventListener('click', rollAllDice);

    // Optional: Roll on spacebar press
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !rollButton.disabled) {
            e.preventDefault();
            rollAllDice();
        }
    });
});

// Set initial random positions for dice
window.addEventListener('load', () => {
    diceConfig.forEach(dice => {
        const value = rollDie();
        const diceElement = document.getElementById(dice.id);
        const rotation = faceRotations[value];
        diceElement.style.transform = rotation;

        const resultElement = document.getElementById(dice.resultId);
        resultElement.textContent = value;
    });
});
