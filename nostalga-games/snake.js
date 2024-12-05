const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const speedButton = document.getElementById('speedButton'); // Button for dropdown
const speedOptions = document.getElementById('speedOptions'); // Dropdown content
const speedListItems = document.querySelectorAll('#speedOptions li'); // Dropdown options
const scoreDisplay = document.getElementById('scoreDisplay');

const boxSize = 20; // Size of each grid unit (snake segment, food)
let gameSpeed = 200; // Default snake speed
let snake = [];
let food = {};
let direction = { x: 0, y: 0 };
let canvasSize = { width: 700, height: 700 }; // Fixed size
let initialSnakeLength = 5; // Default starting snake length
let gameInterval;
let score = 0; // Score counter

// Sizes for different selections
canvas.width = canvasSize.width;
canvas.height = canvasSize.height;

// Speed settings
const speedSettings = {
    fast: 50,   // Adjust this value for fast
    medium: 150, // Adjust this value for medium
    slow: 300,   // Adjust this value for slow
};

// Dropdown toggle
speedButton.addEventListener('click', () => {
    speedOptions.classList.toggle('show'); // Show or hide the dropdown
});

// Handle speed selection
speedListItems.forEach(item => {
    item.addEventListener('click', () => {
        const selectedSpeed = item.getAttribute('data-value'); // Get selected speed value
        gameSpeed = speedSettings[selectedSpeed]; // Set gameSpeed based on selection

        // Update button text
        speedButton.textContent = `Speed: ${selectedSpeed.charAt(0).toUpperCase() + selectedSpeed.slice(1)}`;

        // Hide the dropdown after selection
        speedOptions.classList.remove('show');

        console.log(`Selected Speed: ${selectedSpeed}, Interval: ${gameSpeed}`);
    });
});

// Close dropdown if clicking outside
document.addEventListener('click', (event) => {
    if (!speedButton.contains(event.target) && !speedOptions.contains(event.target)) {
        speedOptions.classList.remove('show');
    }
});

// Start button logic
startButton.addEventListener('click', () => {
    if (!gameSpeed) {
        alert('Please select a speed before starting the game!');
        return;
    }

    console.log(`Starting game with speed: ${gameSpeed}`);
    score = 0; // Reset score
    scoreDisplay.textContent = score; // Update score display

    resetGame();
});

// Initialize or reset the game
function resetGame() {
    snake = [];
    
    // Position snake in the center of the grid
    const centerX = Math.floor(canvasSize.width / 2 / boxSize) * boxSize;
    const centerY = Math.floor(canvasSize.height / 2 / boxSize) * boxSize;

    for (let i = 0; i < initialSnakeLength; i++) {
        snake.push({ x: centerX - i * boxSize, y: centerY });
    }

    direction = { x: boxSize, y: 0 }; // Snake starts moving to the right
    spawnFood();
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// Spawn food in a random location, ensuring it aligns with the grid
function spawnFood() {
    const gridWidth = Math.floor(canvasSize.width / boxSize);
    const gridHeight = Math.floor(canvasSize.height / boxSize);

    const x = Math.floor(Math.random() * gridWidth) * boxSize;
    const y = Math.floor(Math.random() * gridHeight) * boxSize;

    // Make sure food doesn't spawn on the snake
    if (snake.some(segment => segment.x === x && segment.y === y)) {
        spawnFood();
    } else {
        food = { x, y };
    }
}

// Game loop: updates the snake and renders the game
function gameLoop() {
    updateSnake();
    if (checkCollision()) {
        clearInterval(gameInterval);
        alert('Game Over! Your score: ' + score);
    } else {
        drawGame();
    }
}

// Update the snake's position and handle food collision
function updateSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Wrap snake around the edges
    if (head.x >= canvasSize.width) head.x = 0;
    if (head.x < 0) head.x = canvasSize.width - boxSize;
    if (head.y >= canvasSize.height) head.y = 0;
    if (head.y < 0) head.y = canvasSize.height - boxSize;

    snake.unshift(head);

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
        score += 1; // Increase score
        scoreDisplay.textContent = score; // Update score display
        spawnFood(); // Generate new food
    } else {
        snake.pop(); // Remove last segment if no food is eaten
    }
}

// Check for collisions (snake colliding with itself)
function checkCollision() {
    const head = snake[0];
    return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

// Draw the game (snake, food, etc.)
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw the head of the snake
    ctx.fillStyle = '#90EE90'; // Light green color for the head
    ctx.fillRect(snake[0].x, snake[0].y, boxSize, boxSize);

    // Draw the body of the snake
    ctx.fillStyle = '#32CD32'; // Darker green color for the body
    snake.slice(1).forEach(segment => {
        ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
    });

    // Draw the food
    ctx.fillStyle = 'red'; // Food color
    ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

// Prevent scrolling when using arrow keys
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); // Prevent default scrolling behavior
    }
    if ((e.key === 'ArrowUp' || e.key === 'w') && direction.y === 0) {
        direction = { x: 0, y: -boxSize };
    } else if ((e.key === 'ArrowDown' || e.key === 's') && direction.y === 0) {
        direction = { x: 0, y: boxSize };
    } else if ((e.key === 'ArrowLeft' || e.key === 'a') && direction.x === 0) {
        direction = { x: -boxSize, y: 0 };
    } else if ((e.key === 'ArrowRight' || e.key === 'd') && direction.x === 0) {
        direction = { x: boxSize, y: 0 };
    }
});
