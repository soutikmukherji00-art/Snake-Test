import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  queueDirection,
  spawnFood,
  stepGame
} from '../src/gameLogic.js';

test('moves snake forward on each tick', () => {
  const state = {
    size: 6,
    snake: [
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 2 }
    ],
    direction: 'right',
    queuedDirection: 'right',
    food: { x: 0, y: 0 },
    score: 0,
    status: 'running'
  };

  const next = stepGame(state);

  assert.deepEqual(next.snake, [
    { x: 4, y: 2 },
    { x: 3, y: 2 },
    { x: 2, y: 2 }
  ]);
  assert.equal(next.score, 0);
  assert.equal(next.status, 'running');
});

test('grows and increments score when food is eaten', () => {
  const state = {
    size: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 }
    ],
    direction: 'right',
    queuedDirection: 'right',
    food: { x: 3, y: 2 },
    score: 0,
    status: 'running'
  };

  const next = stepGame(state, () => 0);

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 3);
  assert.deepEqual(next.snake[0], { x: 3, y: 2 });
  assert.ok(next.food);
});

test('game over on wall collision', () => {
  const state = {
    size: 4,
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 }
    ],
    direction: 'right',
    queuedDirection: 'right',
    food: { x: 0, y: 0 },
    score: 0,
    status: 'running'
  };

  const next = stepGame(state);
  assert.equal(next.status, 'gameover');
});

test('game over on self collision', () => {
  const state = {
    size: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 }
    ],
    direction: 'left',
    queuedDirection: 'down',
    food: { x: 5, y: 5 },
    score: 0,
    status: 'running'
  };

  const next = stepGame(state);
  assert.equal(next.status, 'gameover');
});

test('spawnFood returns an empty cell and is deterministic from randomFn', () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 }
  ];

  const food = spawnFood(snake, 3, () => 0);
  assert.deepEqual(food, { x: 0, y: 1 });
});

test('cannot instantly reverse direction', () => {
  const initial = createInitialState(10, () => 0);
  const queued = queueDirection(initial, 'left');

  assert.equal(queued.queuedDirection, 'right');
});
