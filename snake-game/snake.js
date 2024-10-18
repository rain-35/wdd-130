const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const boxSize = 20;
let snake = [{ x: 200, y: 200 }];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let food = spawnFood();
let score = 0;

// Game loop
function gameLoop() {
  direction = { ...nextDirection }; // Update direction at the start of each frame
  if (checkCollision()) {
    alert("Game Over! Final Score: " + score);
    resetGame();
    return;
  }
  
  moveSnake();
  if (checkFoodCollision()) {
    score++;
    // Grow the snake without removing the last part
    snake.push({ ...snake[snake.length - 1] });
    food = spawnFood(); // Spawn new food
  }

  clearCanvas();
  drawFood();
  drawSnake();
}

function moveSnake() {
    const head = { 
      x: snake[0].x + direction.x * boxSize, 
      y: snake[0].y + direction.y * boxSize 
    };
  
    // Wrap around the edges
    if (head.x >= canvas.width) head.x = 0;
    if (head.x < 0) head.x = canvas.width - boxSize;
    if (head.y >= canvas.height) head.y = 0;
    if (head.y < 0) head.y = canvas.height - boxSize;
  
    snake.unshift(head); // Add new head to the front
    if (!checkFoodCollision()) {
      snake.pop(); // Remove last element only if not eating food
    }
  }

function drawSnake() {
    // Draw the head
    ctx.fillStyle = "lightgreen"; // Lighter shade for the head
    ctx.fillRect(snake[0].x, snake[0].y, boxSize, boxSize);
    
    // Draw the body
    ctx.fillStyle = "green"; // Regular shade for the body
    for (let i = 1; i < snake.length; i++) {
      ctx.fillRect(snake[i].x, snake[i].y, boxSize, boxSize);
    }
  }

function spawnFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
    y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
  };
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function checkCollision() {
  const head = snake[0];
  // Check wall collisions
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    return true;
  }
  // Check self collisions (after the snake has more than one segment)
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  return false;
}

function checkFoodCollision() {
  const head = snake[0];
  return head.x === food.x && head.y === food.y;
}

function resetGame() {
  snake = [{ x: 200, y: 200 }];
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  food = spawnFood();
  score = 0;
}

// Handling direction change to prevent reversing direction immediately
document.addEventListener("keydown", event => {
  if (event.key === "ArrowUp" && direction.y === 0) {
    nextDirection = { x: 0, y: -1 };
  } else if (event.key === "ArrowDown" && direction.y === 0) {
    nextDirection = { x: 0, y: 1 };
  } else if (event.key === "ArrowLeft" && direction.x === 0) {
    nextDirection = { x: -1, y: 0 };
  } else if (event.key === "ArrowRight" && direction.x === 0) {
    nextDirection = { x: 1, y: 0 };
  }
});

// Run game loop every 100 milliseconds
setInterval(gameLoop, 200);
