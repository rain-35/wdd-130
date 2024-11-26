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

  if (
    this.textContent || 
    (activeBoard !== null && activeBoard !== boardIndex) || 
    globalBoard[Math.floor(boardIndex / 3)][boardIndex % 3] !== null
  ) {
    return;
  }

  const row = Math.floor(cellIndex / 3);
  const col = cellIndex % 3;
  smallBoards[boardIndex][row][col] = currentPlayer;
  this.textContent = currentPlayer;
  this.classList.add(currentPlayer.toLowerCase());

  // Check if the small board is won
  const winningCombo = checkWin(smallBoards[boardIndex]);
  if (winningCombo) {
    const boardElement = document.querySelector(`.board[data-index="${boardIndex}"]`);

    // Clear cells and disable board
    boardElement.querySelectorAll(".cell").forEach(cell => (cell.textContent = ""));
    boardElement.classList.add("won", "disabled");

    // Add the winning symbol in the center
    const winningSymbol = document.createElement("div");
    winningSymbol.classList.add("winning-symbol", currentPlayer.toLowerCase());
    winningSymbol.textContent = currentPlayer.trim();
    boardElement.appendChild(winningSymbol);

    globalBoard[Math.floor(boardIndex / 3)][boardIndex % 3] = currentPlayer;
  }

  const globalWin = checkWin(globalBoard); // Check for global board win
  if (globalWin) {
    // Add global winning line
    const gameWinningLine = document.createElement("div");
    gameWinningLine.classList.add("global-winning-line", currentPlayer.toLowerCase());
    positionWinningLine(gameWinningLine, globalWin);  // Position the line based on the win
    gameBoard.appendChild(gameWinningLine);
    return; // Stop further processing since the game is won
  }

  const targetBoardFull = smallBoards[cellIndex].flat().every(cell => cell !== null);
  const targetBoardWon = globalBoard[Math.floor(cellIndex / 3)][cellIndex % 3] !== null;

  const boardElement = document.querySelector(`.board[data-index="${boardIndex}"]`);
  if (targetBoardFull && !targetBoardWon) {
    boardElement.classList.add("full");
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
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
      !boardWon && !boardFull // Only enable playable boards
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
    if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
      return { type: "row", index: i }; // Winning row
    }
    if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
      return { type: "col", index: i }; // Winning column
    }
  }
  if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
    return { type: "diag", index: 0 }; // Top-left to bottom-right
  }
  if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
    return { type: "diag", index: 1 }; // Top-right to bottom-left
  }
  return null;
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

updateActiveBoards();
document.getElementById("restartButton").addEventListener("click", () => {
  console.log("Restart button clicked");
  resetGame();
}); 
