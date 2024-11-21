const gameBoard = document.getElementById("gameBoard");

let globalBoard = Array(3).fill(null).map(() => Array(3).fill(null)); // Tracks the large board
let smallBoards = Array(9).fill(null).map(() =>
  Array(3).fill(null).map(() => Array(3).fill(null))
); // Tracks all small boards

let currentPlayer = "X";
let activeBoard = null; // Determines which small board is playable

// Create boards
for (let i = 0; i < 9; i++) {
  const board = document.createElement("div");
  board.classList.add("board");
  board.dataset.index = i;
  for (let j = 0; j < 9; j++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = j;
    cell.addEventListener("click", handleCellClick);
    board.appendChild(cell);
  }
  gameBoard.appendChild(board);
}

// Handle cell clicks
function handleCellClick(e) {
  const boardIndex = parseInt(this.parentElement.dataset.index);
  const cellIndex = parseInt(this.dataset.index);

  // Ignore clicks on disabled cells
  if (this.textContent || (activeBoard !== null && activeBoard !== boardIndex)) {
    return;
  }

  // Update the small board and display
  const row = Math.floor(cellIndex / 3);
  const col = cellIndex % 3;
  smallBoards[boardIndex][row][col] = currentPlayer;
  this.textContent = currentPlayer;
  this.classList.add(currentPlayer.toLowerCase());

  // Check if the small board is won
 // Check if the small board is won
if (checkWin(smallBoards[boardIndex])) {
  const boardElement = document.querySelector(`.board[data-index="${boardIndex}"]`);
  
  // Add won class and disable clicks
  boardElement.classList.add("won", "disabled");
  
  // Create and add the winning symbol to the board (either X or O)
  const winningSymbol = document.createElement("div");
  winningSymbol.classList.add("winning-symbol");
  winningSymbol.textContent = currentPlayer;  // This will add either X or O
  boardElement.appendChild(winningSymbol);
  
  // Mark the global board as won
  globalBoard[Math.floor(boardIndex / 3)][boardIndex % 3] = currentPlayer;
  
  // Check if the global board has been won
  if (checkWin(globalBoard)) {
    alert(`${currentPlayer} wins the game!`);
    resetGame();
    return;
  }
}


  // Switch turns and update active board
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  activeBoard = globalBoard.flat().includes(null) ? cellIndex : null; // Allow free play if the target board is full
  updateActiveBoards();
}

// Check for a win in a 3x3 grid
function checkWin(board) {
  for (let i = 0; i < 3; i++) {
    // Check rows, columns, and diagonals
    if (
      (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) ||
      (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i])
    ) {
      return true;
    }
  }
  return (
    (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) ||
    (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0])
  );
}

// Highlight active board
function updateActiveBoards() {
  document.querySelectorAll(".board").forEach((board, index) => {
    if (activeBoard === null || activeBoard === index) {
      board.classList.add("active");
      board.classList.remove("disabled", "dimmed");
    } else {
      board.classList.remove("active");
      board.classList.add("disabled", "dimmed");
    }
  });
}

// Reset the game
function resetGame() {
  globalBoard = Array(3).fill(null).map(() => Array(3).fill(null));
  smallBoards = Array(9).fill(null).map(() =>
    Array(3).fill(null).map(() => Array(3).fill(null))
  );
  currentPlayer = "X";
  activeBoard = null;
  document.querySelectorAll(".cell").forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("x", "o");
  });
  document.querySelectorAll(".board").forEach(board => {
    board.classList.remove("won", "active", "disabled", "dimmed");
    board.innerHTML = ""; // Remove winning symbols
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index = j;
      cell.addEventListener("click", handleCellClick);
      board.appendChild(cell);
    }
  });
  updateActiveBoards();
}

updateActiveBoards(); // Initial setup
