document.addEventListener("DOMContentLoaded", () => {
  const imagesToPreload = ["/bomb.svg", "/gem.svg"];
  imagesToPreload.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
  const DOMselectors = {
    gameContainer: document.querySelector(".game-container"),
    gameBoard: document.querySelector("#mines-board"),
    playButton: document.querySelector(".game-container button.play"),
    amountInput: document.querySelector(".game-container input[type='text']"),
    minesSelect: document.querySelector(".game-container select"),
    balancePanel: document.querySelector(".balance-panel p"),
    popup: document.createElement("div"),
    halfbutton: document.querySelector(".half"),
    doublebutton: document.querySelector(".double"),
    cheatbutton: document.querySelector(".cheat"),
    clearRandomMineButton: document.querySelector(".clear-random-mine"),
    multi: document.querySelector(".multi"),
  };

  let mines = [];
  let revealedTiles = 0;
  let gameStarted = false;
  let balance = 100;

  // Initialize popup
  DOMselectors.popup.classList.add("popup");
  DOMselectors.gameBoard.appendChild(DOMselectors.popup);

  function startGame() {
    const amount = parseFloat(DOMselectors.amountInput.value);
    const mineCount = parseInt(DOMselectors.minesSelect.value);

    if (isNaN(amount) || amount <= 0) {
      showPopup("Please enter a valid amount.");
      return;
    }

    if (amount > balance) {
      showPopup("You cannot bet more than your balance.");
      return;
    }

    mines = generateMines(mineCount);
    revealedTiles = 0;
    gameStarted = true;
    DOMselectors.playButton.textContent = "Cash Out";
    DOMselectors.playButton.removeEventListener("click", startGame);
    DOMselectors.playButton.addEventListener("click", cashOut);
    DOMselectors.minesSelect.disabled = true;
    DOMselectors.amountInput.disabled = true;
    DOMselectors.doublebutton.disabled = true;
    DOMselectors.halfbutton.disabled = true;

    DOMselectors.gameBoard.querySelectorAll(".mine").forEach((tile) => {
      tile.classList.remove("revealed", "mine-tile", "safe-tile");
      tile.innerHTML = "";
      tile.addEventListener("click", revealTile);
    });
    DOMselectors.clearRandomMineButton.classList.remove("hidden");
    DOMselectors.multi.textContent = "Multiplier: 1x";
  }

  function generateMines(count) {
    const minePositions = new Set();
    while (minePositions.size < count) {
      const randomPosition = Math.floor(Math.random() * 25) + 1;
      minePositions.add(randomPosition);
    }
    return Array.from(minePositions);
  }

  function revealTile(event) {
    if (!gameStarted) return;

    const tile = event.currentTarget;
    const tileId = parseInt(tile.id);

    if (mines.includes(tileId)) {
      tile.classList.add("mine-tile");
      tile.innerHTML =
        '<img src="/bomb.svg" alt="Mine" style="width: 100%; height: 100%;">';
      playSound("/boom.mp3");
      endGame(false);
    } else {
      tile.classList.add("safe-tile");
      tile.innerHTML =
        '<img src="/gem.svg" alt="Gem" style="width: 100%; height: 100%;">';
      console.log(`Revealed tile ${tileId} as safe.`);
      playSound("/chime.mp3");
      revealedTiles++;
      updateMultiplier();
      if (revealedTiles === 25 - mines.length) {
        endGame(true);
      }
    }

    tile.classList.add("revealed");
    tile.removeEventListener("click", revealTile);
  }

  function updateMultiplier() {
    const mineCount = parseInt(DOMselectors.minesSelect.value);
    const profit = calculateProfit(mineCount, revealedTiles);
    DOMselectors.multi.textContent = `Multiplier: ${profit.toFixed(2)}x`;
  }

  function endGame(won) {
    gameStarted = false;
    DOMselectors.playButton.textContent = "Play";
    DOMselectors.playButton.removeEventListener("click", cashOut);
    DOMselectors.playButton.addEventListener("click", startGame);
    DOMselectors.minesSelect.disabled = false;
    DOMselectors.amountInput.disabled = false;
    DOMselectors.doublebutton.disabled = false;
    DOMselectors.halfbutton.disabled = false;

    revealBoard();

    if (won) {
      playSound("/cashout.wav");
      const amount = parseFloat(DOMselectors.amountInput.value);
      const mineCount = parseInt(DOMselectors.minesSelect.value);
      const profit = calculateProfit(revealedTiles, mineCount);
      const winnings = profit * amount - amount;
      balance += winnings;
      showPopup(
        `Multiplier: ${profit.toFixed(2)}x<br>Winnings: $${winnings.toFixed(2)}`,
      );
    } else {
      const amount = parseFloat(DOMselectors.amountInput.value);
      balance -= amount;
      showPopup("You lost! Try again.");
    }

    DOMselectors.balancePanel.textContent = `Balance: $${balance.toFixed(2)}`;
    DOMselectors.clearRandomMineButton.classList.add("hidden");
  }

  function cashOut() {
    playSound("/cashout.wav");
    endGame(true);
  }

  function revealBoard() {
    DOMselectors.gameBoard.querySelectorAll(".mine").forEach((tile) => {
      const tileId = parseInt(tile.id);
      if (mines.includes(tileId)) {
        tile.classList.add("mine-tile");
        tile.innerHTML =
          '<img src="/bomb.svg" alt="Mine" style="width: 100%; height: 100%;">';
      } else {
        tile.classList.add("safe-tile");
        tile.innerHTML =
          '<img src="/gem.svg" alt="Gem" style="width: 100%; height: 100%;">';
      }
      tile.classList.add("revealed");
      tile.removeEventListener("click", revealTile);
    });
  }

  function playSound(src) {
    const audio = new Audio(src);
    audio.play();
  }

  function showPopup(message) {
    DOMselectors.popup.innerHTML = message;
    DOMselectors.popup.classList.add("show");
    setTimeout(() => {
      DOMselectors.popup.classList.remove("show");
    }, 2000);
  }

  function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  function calculateProfit(B, S) {
    //B is total bombs
    //S is Spaces cleared
    const probability =
      (factorial(25 - B) / factorial(25 - B - S)) *
      (factorial(25 - S) / factorial(25));
    return 0.99 * (1 / probability);
  }
  function randomTile() {
    if (!gameStarted) return;

    const tiles = Array.from(DOMselectors.gameBoard.querySelectorAll(".mine"));
    const unrevealedTiles = tiles.filter(
      (tile) => !tile.classList.contains("revealed"),
    );

    if (unrevealedTiles.length === 0) return;

    const randomIndex = Math.floor(Math.random() * unrevealedTiles.length);
    const randomTile = unrevealedTiles[randomIndex];

    randomTile.click();
  }

  DOMselectors.playButton.addEventListener("click", startGame);

  DOMselectors.halfbutton.addEventListener("click", () => {
    const currentAmount = parseFloat(DOMselectors.amountInput.value);
    if (!isNaN(currentAmount) && currentAmount > 0) {
      DOMselectors.amountInput.value = (currentAmount / 2).toFixed(2);
    }
  });

  DOMselectors.doublebutton.addEventListener("click", () => {
    const currentAmount = parseFloat(DOMselectors.amountInput.value);
    if (!isNaN(currentAmount) && currentAmount > 0) {
      DOMselectors.amountInput.value = (currentAmount * 2).toFixed(2);
    }
  });

  DOMselectors.cheatbutton.addEventListener("click", () => {
    DOMselectors.gameBoard.querySelectorAll(".mine").forEach((tile) => {
      const tileId = parseInt(tile.id);
      if (mines.includes(tileId)) {
        if (tile.classList.contains("revealed")) {
          tile.classList.remove("revealed", "mine-tile", "safe-tile");
          tile.innerHTML = "";
        } else {
          tile.classList.add("mine-tile", "revealed");
          tile.innerHTML =
            '<img src="/bomb.svg" alt="Mine" style="width: 100%; height: 100%;">';
        }
      }
    });
    console.log("Cheat On!");
  });
  DOMselectors.clearRandomMineButton.addEventListener("click", randomTile);
});

//AUTO MINES FUNCTIONS
console.log("running!");
