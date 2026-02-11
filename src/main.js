import {
  GRID_SIZE,
  createInitialState,
  queueDirection,
  stepGame,
  togglePause
} from './gameLogic.js';

const TICK_MS = 120;

const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const pauseBtn = document.getElementById('btn-pause');
const restartBtn = document.getElementById('btn-restart');

const directionButtons = {
  'btn-up': 'up',
  'btn-down': 'down',
  'btn-left': 'left',
  'btn-right': 'right'
};

const keyMap = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right'
};

let state = createInitialState();
const cells = [];

function buildBoard(size) {
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  board.innerHTML = '';
  cells.length = 0;

  for (let i = 0; i < size * size; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    board.appendChild(cell);
    cells.push(cell);
  }
}

function idxFromCell(cell, size) {
  return cell.y * size + cell.x;
}

function render() {
  for (const cell of cells) {
    cell.classList.remove('snake', 'food');
  }

  for (const segment of state.snake) {
    const idx = idxFromCell(segment, state.size);
    if (cells[idx]) {
      cells[idx].classList.add('snake');
    }
  }

  if (state.food) {
    const foodIdx = idxFromCell(state.food, state.size);
    if (cells[foodIdx]) {
      cells[foodIdx].classList.add('food');
    }
  }

  scoreEl.textContent = String(state.score);

  if (state.status === 'running') {
    statusEl.textContent = 'Running';
    pauseBtn.textContent = 'Pause';
  } else if (state.status === 'paused') {
    statusEl.textContent = 'Paused';
    pauseBtn.textContent = 'Resume';
  } else {
    statusEl.textContent = 'Game Over';
    pauseBtn.textContent = 'Pause';
  }
}

function resetGame() {
  state = createInitialState(GRID_SIZE);
  render();
}

function handleDirection(direction) {
  state = queueDirection(state, direction);
}

document.addEventListener('keydown', (event) => {
  const direction = keyMap[event.key];

  if (direction) {
    event.preventDefault();
    handleDirection(direction);
    return;
  }

  if (event.key === ' ' || event.code === 'Space') {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  if (event.key === 'r' || event.key === 'R') {
    event.preventDefault();
    resetGame();
  }
});

for (const [id, direction] of Object.entries(directionButtons)) {
  const button = document.getElementById(id);
  button?.addEventListener('click', () => handleDirection(direction));
}

pauseBtn?.addEventListener('click', () => {
  state = togglePause(state);
  render();
});

restartBtn?.addEventListener('click', resetGame);

buildBoard(GRID_SIZE);
render();

setInterval(() => {
  state = stepGame(state);
  render();
}, TICK_MS);
