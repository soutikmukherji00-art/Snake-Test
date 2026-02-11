export const GRID_SIZE = 20;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export const OPPOSITE = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

function keyFor(cell) {
  return `${cell.x},${cell.y}`;
}

function isInsideBoard(cell, size) {
  return cell.x >= 0 && cell.y >= 0 && cell.x < size && cell.y < size;
}

function isSameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function nextDirection(currentDirection, requestedDirection, snakeLength = 1) {
  if (!requestedDirection || !DIRECTIONS[requestedDirection]) {
    return currentDirection;
  }

  if (snakeLength > 1 && OPPOSITE[currentDirection] === requestedDirection) {
    return currentDirection;
  }

  return requestedDirection;
}

export function spawnFood(snake, size = GRID_SIZE, randomFn = Math.random) {
  const occupied = new Set(snake.map(keyFor));
  const emptyCells = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const candidate = { x, y };
      if (!occupied.has(keyFor(candidate))) {
        emptyCells.push(candidate);
      }
    }
  }

  if (emptyCells.length === 0) {
    return null;
  }

  const idx = Math.floor(randomFn() * emptyCells.length);
  return emptyCells[idx];
}

export function createInitialState(size = GRID_SIZE, randomFn = Math.random) {
  const center = Math.floor(size / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center }
  ];

  return {
    size,
    snake,
    direction: 'right',
    queuedDirection: 'right',
    food: spawnFood(snake, size, randomFn),
    score: 0,
    status: 'running'
  };
}

export function stepGame(state, randomFn = Math.random) {
  if (state.status !== 'running') {
    return state;
  }

  const direction = nextDirection(
    state.direction,
    state.queuedDirection,
    state.snake.length
  );
  const delta = DIRECTIONS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + delta.x, y: head.y + delta.y };

  if (!isInsideBoard(nextHead, state.size)) {
    return { ...state, direction, status: 'gameover' };
  }

  const grows = Boolean(state.food && isSameCell(nextHead, state.food));
  const bodyToCheck = grows ? state.snake : state.snake.slice(0, -1);

  if (bodyToCheck.some((cell) => isSameCell(cell, nextHead))) {
    return { ...state, direction, status: 'gameover' };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!grows) {
    nextSnake.pop();
  }

  const nextFood = grows ? spawnFood(nextSnake, state.size, randomFn) : state.food;
  const nextScore = grows ? state.score + 1 : state.score;
  const status = nextFood === null ? 'gameover' : 'running';

  return {
    ...state,
    snake: nextSnake,
    direction,
    food: nextFood,
    score: nextScore,
    status
  };
}

export function queueDirection(state, requestedDirection) {
  if (state.status !== 'running') {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection(
      state.direction,
      requestedDirection,
      state.snake.length
    )
  };
}

export function togglePause(state) {
  if (state.status === 'running') {
    return { ...state, status: 'paused' };
  }

  if (state.status === 'paused') {
    return { ...state, status: 'running' };
  }

  return state;
}
