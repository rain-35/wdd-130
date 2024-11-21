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
// Handle cell clicks
function handleCellClick(e) {
  const boardIndex = parseInt(this.parentElement.dataset.index);
  const cellIndex = parseInt(this.dataset.index);

  // Ignore clicks on disabled cells or won boards
  if (
    this.textContent || // Cell already marked
    (activeBoard !== null && activeBoard !== boardIndex) || // Not the active board
    globalBoard[Math.floor(boardIndex / 3)][boardIndex % 3] !== null // Board already won
  ) {
    return;
  }

  // Update the small board and display
  const row = Math.floor(cellIndex / 3);
  const col = cellIndex % 3;
  smallBoards[boardIndex][row][col] = currentPlayer;
  this.textContent = currentPlayer;
  this.classList.add(currentPlayer.toLowerCase());

  // Check if the small board is won
  if (checkWin(smallBoards[boardIndex])) {
    const boardElement = document.querySelector(`.board[data-index="${boardIndex}"]`);

    // Clear all cells in the board to avoid duplicates
    boardElement.querySelectorAll(".cell").forEach(cell => {
      cell.textContent = ""; // Remove any existing symbols
    });

    // Add won class and disable clicks
    boardElement.classList.add("won", "disabled");

    // Create and add the winning symbol to the board (centralized display)
    const winningSymbol = document.createElement("div");
    winningSymbol.classList.add("winning-symbol", currentPlayer.toLowerCase());
    winningSymbol.textContent = currentPlayer.trim();
    boardElement.appendChild(winningSymbol);

    // Update the global board state
    globalBoard[Math.floor(boardIndex / 3)][boardIndex % 3] = currentPlayer;

    // Check if the global board has been won
    if (checkWin(globalBoard)) {
      alert(`${currentPlayer} wins the game!`);
      resetGame();
      return;
    }
  }

  // Check if the target board is full
  const targetBoardFull = smallBoards[cellIndex].flat().every(cell => cell !== null);
  const targetBoardWon =
    globalBoard[Math.floor(cellIndex / 3)][cellIndex % 3] !== null;

  // Update the board's "full" class if it's full but not won
  const boardElement = document.querySelector(`.board[data-index="${boardIndex}"]`);
  if (targetBoardFull && !targetBoardWon) {
    boardElement.classList.add("full"); // Add red haze
  }

  // Switch turns and update active board
  currentPlayer = currentPlayer === "X" ? "O" : "X";

  // Allow free play if the target board is full or won, otherwise set active board
  activeBoard =
    !targetBoardFull && !targetBoardWon && globalBoard.flat().includes(null)
      ? cellIndex
      : null;

  updateActiveBoards();
}

// Highlight active board
function updateActiveBoards() {
  document.querySelectorAll(".board").forEach((board, index) => {
    const boardWon = globalBoard[Math.floor(index / 3)][index % 3] !== null; // Check if this board is won
    const boardFull = smallBoards[index].flat().every(cell => cell !== null); // Check if this board is full
    if (
      (activeBoard === null || activeBoard === index) &&
      !boardWon // Exclude won boards from being active
    ) {
      board.classList.add("active");
      board.classList.remove("disabled", "dimmed", "full");
    } else {
      board.classList.remove("active");
      board.classList.add("disabled", "dimmed");
      if (boardFull && !boardWon) {
        board.classList.add("full"); // Apply red haze
      } else {
        board.classList.remove("full");
      }
    }
  });
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
