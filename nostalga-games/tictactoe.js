const gameBoard = document.getElementById("gameBoard");

let globalBoard = Array(3).fill(null).map(() => Array(3).fill(null)); // Tracks the large board
let smallBoards = Array(9).fill(null).map(() =>
  Array(3).fill(null).map(() => Array(3).fill(null))
); // Tracks all small boards

let currentPlayer = "X";
let activeBoard = null; // Determines which small board is playable
let playAgainstBot = false; // Determines if playing against a bot

// Create selector for game mode
// Attach event listeners for dropdown items


const speedButton = document.getElementById("modeButton");
const dropdownItems = document.querySelectorAll(".dropdown-content li");

dropdownItems.forEach(item => {
  item.addEventListener("click", (event) => {
    // Get the selected mode from the clicked item
    const selectedMode = event.target.dataset.mode;

    // Update the game mode logic
    playAgainstBot = selectedMode === "bot";
    resetGame();

    // Update the button text based on the selected mode
    speedButton.textContent = selectedMode === "bot" 
      ? "Player vs Computer" 
      : "Player vs Player";

    console.log(`Game mode selected: ${selectedMode}`);
  });
});



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

  console.log("Cell clicked:", { boardIndex, cellIndex, currentPlayer });


  if (
    this.textContent ||
    (activeBoard !== null && activeBoard !== boardIndex) ||
    globalBoard[Math.floor(boardIndex / 3)][boardIndex % 3] !== null
  ) {
    console.warn("Invalid move attempted:", {
      boardIndex,
      cellIndex,
      activeBoard,
      cellContent: this.textContent,
    });
    return;
  }

  const row = Math.floor(cellIndex / 3);
  const col = cellIndex % 3;

  console.log("Updating small board state:", { boardIndex, row, col });
  smallBoards[boardIndex][row][col] = currentPlayer;
  this.textContent = currentPlayer;
  this.classList.add(currentPlayer.toLowerCase());

  console.log("Updated state of small board:", smallBoards[boardIndex]);

  // Check if the small board is won
  const winningCombo = checkWin(smallBoards[boardIndex]);
  if (winningCombo) {
    console.log("Small board won:", { boardIndex, winningCombo, player: currentPlayer });
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
    console.log("Global board won:", { globalWin, player: currentPlayer });
    // Add global winning line
    const gameWinningLine = document.createElement("div");
    gameWinningLine.classList.add("global-winning-line", currentPlayer.toLowerCase());
    positionWinningLine(gameWinningLine, globalWin);  // Position the line based on the win
    gameBoard.appendChild(gameWinningLine);
    return; // Stop further processing since the game is won
  }
  console.log("Next active board will be:", activeBoard);

  const targetBoardFull = smallBoards[cellIndex].flat().every(cell => cell !== null);
  const targetBoardWon = globalBoard[Math.floor(cellIndex / 3)][cellIndex % 3] !== null;
  
  if (!targetBoardFull && !targetBoardWon) {
    activeBoard = cellIndex;
  } else {
    console.log(`Target board ${cellIndex} is full or won. Active board set to null.`);
    activeBoard = null;
  }

  const boardElement = document.querySelector(`.board[data-index="${boardIndex}"]`);
  if (targetBoardFull && !targetBoardWon) {
    boardElement.classList.add("full");
  }

  const emptyBoards = globalBoard.flat().filter(board => board === null);
  if (emptyBoards.length === 0) {
    console.log("All boards are full or won. Game might be over.");
    activeBoard = null;
  } else if (!targetBoardFull && !targetBoardWon) {
    activeBoard = cellIndex;
  } else {
    console.log(`Active board ${activeBoard} is full. Resetting to null.`);
    activeBoard = null;
  }

  if (globalWin) {
    console.warn("Game is already won. No further moves allowed.");
    return;
  }

  if (globalWin && !document.querySelector(".global-winning-line")) {
    console.log("Global board won:", { globalWin, player: currentPlayer });
    const gameWinningLine = document.createElement("div");
    gameWinningLine.classList.add("global-winning-line", currentPlayer.toLowerCase());
    positionWinningLine(gameWinningLine, globalWin); // Position the line
    gameBoard.appendChild(gameWinningLine);
    return; // Stop further processing since the game is won
  }
  
  

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  activeBoard =
    !targetBoardFull && !targetBoardWon && globalBoard.flat().includes(null)
      ? cellIndex
      : null;

  updateActiveBoards();

  // If playing against bot and it's the bot's turn
  if (playAgainstBot && currentPlayer === "O") {
    setTimeout(() => botMove(), 500); // Add slight delay for realism
  }
}



// Bot logic (rule-based for current small board)
function botMove() {
  // Get all available boards based on the current state
  const availableBoards =
    activeBoard === null
      ? globalBoard.flatMap((board, index) => (board === null ? index : []))
      : [activeBoard];

  console.log("Available Boards:", availableBoards); // Debugging line
  


  
  // Check if no boards are available (shouldn't happen in normal play)
  if (availableBoards.length === 0) {
     
    // Check active boards and add a random one to availableBoards if no valid board is found
    const activeBoards = Array.from(document.querySelectorAll(".board")).filter(board => !board.classList.contains("disabled"));
    if (activeBoards.length > 0) {
      // Pick a random active board
      const randomActiveBoard = activeBoards[Math.floor(Math.random() * activeBoards.length)];
      const randomBoardIndex = parseInt(randomActiveBoard.dataset.index);
      availableBoards.push(randomBoardIndex);
      console.log("Bot added a random active board:", randomBoardIndex);
    } else {
      console.error("No active boards found. Game might be over.");
      return;
    }
  }

  console.log("Available Boards again:", availableBoards); // Debugging line

  // Step 1: Try to win the chosen board
  for (let i = 0; i < availableBoards.length; i++) {
    const chosenBoardIndex = availableBoards[i];
    const chosenBoard = smallBoards[chosenBoardIndex];

    console.log("Current state of the chosen board:", chosenBoard);

    // Try to find a winning move
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (chosenBoard[row][col] === null) {
          chosenBoard[row][col] = "O"; // Bot plays as "O"
          if (checkWin(chosenBoard)) {
            console.log("Bot found a winning move:", { row, col });
            makeBotMove(chosenBoardIndex, row, col);
            return;
          }
          chosenBoard[row][col] = null; // Undo simulation
        }
      }
    }

    // Step 2: Try to block the opponent's win
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (chosenBoard[row][col] === null) {
          chosenBoard[row][col] = "X"; // Simulate opponent's move
          if (checkWin(chosenBoard)) {
            console.log("Bot is blocking opponent's winning move:", { row, col });
            chosenBoard[row][col] = null; // Undo simulation
            makeBotMove(chosenBoardIndex, row, col);
            return;
          }
          chosenBoard[row][col] = null; // Undo simulation
        }
      }
    }
  }

  // Step 3: If no win/block, pick a random move within the chosen board
  const emptyCells = [];

  availableBoards.forEach((boardIndex) => {
    const chosenBoard = smallBoards[boardIndex];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (chosenBoard[row][col] === null) {
          emptyCells.push({ boardIndex, row, col });
        }
      }
    }
  });

  console.log("Available empty cells across boards:", emptyCells); // Debugging line

  // Choose a random cell from available empty cells
  if (emptyCells.length > 0) {
    const { boardIndex, row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    console.log("Bot is making a random move:", { boardIndex, row, col });
    makeBotMove(boardIndex, row, col);
  }
}





function makeBotMove(boardIndex, row, col) {
  const boardElement = document.querySelector(`.board[data-index="${boardIndex}"]`);
  const cellIndex = row * 3 + col;
  const cell = boardElement.querySelector(`.cell[data-index="${cellIndex}"]`);
  if (cell && !cell.textContent) {
    cell.click(); // Trigger the cell click event
  }
}


// Highlight active board
function updateActiveBoards() {
  document.querySelectorAll(".board").forEach((board, index) => {
    const isBoardWon = globalBoard[Math.floor(index / 3)][index % 3] !== null;
    const isBoardFull = smallBoards[index].flat().every(cell => cell !== null);

    if (!isBoardWon && !isBoardFull && (activeBoard === null || activeBoard === index)) {
      console.log("Board is now active:", index);
      board.classList.add("active");
      board.classList.remove("disabled", "dimmed", "full");
    } else {
      console.log("Board is disabled or full:", index);
      board.classList.remove("active");
      board.classList.add("disabled", "dimmed");
      if (isBoardFull && !isBoardWon) {
        board.classList.add("full"); // Apply red haze
      } else {
        board.classList.remove("full");
      }
      if (!globalBoard.flat().includes(null)) {
        console.log("No playable boards left. Resetting active board to null.");
        activeBoard = null;
      }
    }
  });
}




// Check for a win in a 3x3 grid
function checkWin(board) {
  for (let i = 0; i < 3; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
      console.log("Next active board will be:", activeBoard);
      return { type: "row", index: i }; // Winning row
    }
    if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
      console.log("Winning column detected:", { col: i, player: board[0][i] });
      return { type: "col", index: i }; // Winning column
    }
  }
  if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
    console.log("Diagonal win detected (top-left to bottom-right):", { player: board[0][0] });
    return { type: "diag", index: 0 }; // Top-left to bottom-right
  }
  if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
    console.log("Diagonal win detected (top-right to bottom-left):", { player: board[0][2] });
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
