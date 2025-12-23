const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");

const finalScoreElement = document.querySelector("#final-score");
const finalTimeElement = document.querySelector("#final-time");

const upBtn = document.querySelector(".up");
const downBtn = document.querySelector(".down");
const leftBtn = document.querySelector(".left");
const rightBtn = document.querySelector(".right");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

const blockWidth = window.innerWidth <= 768 ? 30 : 50;
const blockHeight = window.innerWidth <= 768 ? 30 : 50;


let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let min = 0;
let sec = 0;

highScoreElement.innerText = highScore;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let intervalId = null;
let timeIntervalId = null;

let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

const blocks = [];
let snake = [{ x: 1, y: 3 }];
let direction = "right";

// Determine speed dynamically
let speed = window.innerWidth <= 768 ? 400 : 300;

// --- Create Grid ---
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

// --- Time formatting ---
function formatGameOverTime(min, sec) {
  const m = String(min).padStart(2, "0");
  const s = String(sec).padStart(2, "0");
  return `${m} min ${s} sec`;
}

function formatTimeDisplay(min, sec) {
  if (window.innerWidth <= 768) {
    return `${min}m ${sec}s`; // Mobile
  } else {
    const m = String(min).padStart(2, "0");
    const s = String(sec).padStart(2, "0");
    return `${m}:${s}`; // Desktop
  }
}

// --- Render Snake & Food ---
function render() {
  let head = null;

  blocks[`${food.x}-${food.y}`].classList.add("food");

  if (direction === "left") head = { x: snake[0].x, y: snake[0].y - 1 };
  else if (direction === "right") head = { x: snake[0].x, y: snake[0].y + 1 };
  else if (direction === "down") head = { x: snake[0].x + 1, y: snake[0].y };
  else if (direction === "up") head = { x: snake[0].x - 1, y: snake[0].y };

  // Wall collision
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    endGame();
    return;
  }

  // Self collision
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame();
      return;
    }
  }

  // Food consumption
  if (head.x === food.x && head.y === food.y) {
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    blocks[`${food.x}-${food.y}`].classList.add("food");
    snake.unshift(head);

    score += 10;
    scoreElement.innerText = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
      highScoreElement.innerText = highScore;
    }
  }

  // Clear previous snake positions
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });

  // Move snake
  snake.unshift(head);
  snake.pop();

  // Draw snake
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.add("fill");
  });
}

// --- End Game ---
function endGame() {
  clearInterval(intervalId);
  clearInterval(timeIntervalId);

  finalScoreElement.innerText = score;
  finalTimeElement.innerText = formatGameOverTime(min, sec);

  modal.style.display = "flex";
  startGameModal.style.display = "none";
  gameOverModal.style.display = "flex";
}

// --- Start Game ---
function startGame() {
  modal.style.display = "none";
  intervalId = setInterval(render, speed);
  timeIntervalId = setInterval(() => {
    if (sec === 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }
    timeElement.innerText = formatTimeDisplay(min, sec);
  }, 1000);
}

startButton.addEventListener("click", startGame);

// --- Restart Game ---
function restartGame() {
  blocks[`${food.x}-${food.y}`].classList.remove("food");
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });

  score = 0;
  min = 0;
  sec = 0;
  direction = "down";
  snake = [{ x: 1, y: 3 }];
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };

  scoreElement.innerText = score;
  timeElement.innerText = formatTimeDisplay(min, sec);
  highScoreElement.innerText = highScore;

  startGame();
}

restartButton.addEventListener("click", restartGame);

// --- Keyboard Controls ---
addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && direction !== "down") direction = "up";
  else if (event.key === "ArrowDown" && direction !== "up") direction = "down";
  else if (event.key === "ArrowLeft" && direction !== "right")
    direction = "left";
  else if (event.key === "ArrowRight" && direction !== "left")
    direction = "right";
});

// --- Mobile Controls ---
upBtn.addEventListener("click", () => {
  if (direction !== "down") direction = "up";
});
downBtn.addEventListener("click", () => {
  if (direction !== "up") direction = "down";
});
leftBtn.addEventListener("click", () => {
  if (direction !== "right") direction = "left";
});
rightBtn.addEventListener("click", () => {
  if (direction !== "left") direction = "right";
});

// --- Dynamic speed & time format on resize ---
window.addEventListener("resize", () => {
  speed = window.innerWidth <= 768 ? 400 : 300;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = setInterval(render, speed);
  }
  timeElement.innerText = formatTimeDisplay(min, sec);
});
