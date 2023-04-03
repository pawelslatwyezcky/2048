import { Grid } from './grid.js';
import { Tile } from './tile.js';

const gameBoard = document.getElementById('game-board');

let pageXStart;
let pageYStart;
let pageXEnd;
let pageYEnd;

const grid = new Grid(gameBoard);
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));

setupInputOnce();

function setupInputOnce() {
  window.addEventListener('keydown', handleInput, { once: true });
  window.addEventListener('touchstart', setTouchInput, { once: true });
  window.addEventListener('touchend', setTouchEnd, { once: true });
}

function setTouchInput(event) {
  pageXStart = event.changedTouches[0].pageX;
  pageYStart = event.changedTouches[0].pageY;
}

function setTouchEnd(event) {
  pageXEnd = event.changedTouches[0].pageX;
  pageYEnd = event.changedTouches[0].pageY;

  let direction;
  if (
    Math.abs(pageXEnd - pageXStart) < 50 &&
    Math.abs(pageYEnd - pageYStart) < 50
  ) {
    setupInputOnce();
    return;
  }
  if (pageXEnd - pageXStart > 50) direction = 'right';
  if (pageXEnd - pageXStart < -50) direction = 'left';
  if (pageYEnd - pageYStart > 50) direction = 'down';
  if (pageYEnd - pageYStart < -50) direction = 'up';
  console.log(direction);
  handleTouchInput(direction);
}

async function handleTouchInput(direction) {
  switch (direction) {
    case 'up':
      if (!canMoveUp()) {
        setupInputOnce();
        return;
      }
      await moveUp();
      break;
    case 'down':
      if (!canMoveDown()) {
        setupInputOnce();
        return;
      }
      await moveDown();
      break;
    case 'left':
      if (!canMoveLeft()) {
        setupInputOnce();
        return;
      }
      await moveLeft();
      break;
    case 'right':
      if (!canMoveRight()) {
        setupInputOnce();
        return;
      }
      await moveRight();
      break;

    default:
      setupInputOnce();
      return;
  }

  const newTile = new Tile(gameBoard);
  grid.getRandomEmptyCell().linkTile(newTile);

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    await newTile.wairForAnimationEnd();
    alert('Game Over!');
    return;
  }

  setupInputOnce();
}

async function handleInput(event) {
  switch (event.key) {
    case 'ArrowUp':
      if (!canMoveUp()) {
        setupInputOnce();
        return;
      }
      await moveUp();
      break;
    case 'ArrowDown':
      if (!canMoveDown()) {
        setupInputOnce();
        return;
      }
      await moveDown();
      break;
    case 'ArrowLeft':
      if (!canMoveLeft()) {
        setupInputOnce();
        return;
      }
      await moveLeft();
      break;
    case 'ArrowRight':
      if (!canMoveRight()) {
        setupInputOnce();
        return;
      }
      await moveRight();
      break;

    default:
      setupInputOnce();
      return;
  }

  const newTile = new Tile(gameBoard);
  grid.getRandomEmptyCell().linkTile(newTile);

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    await newTile.wairForAnimationEnd();
    alert('Game Over!');
    return;
  }

  setupInputOnce();
}

async function moveUp() {
  await slideTiles(grid.cellsGroupedByColumn);
}

async function moveDown() {
  await slideTiles(grid.cellsGroupedByReversedColumn);
}

async function moveLeft() {
  await slideTiles(grid.cellsGroupedByRow);
}

async function moveRight() {
  await slideTiles(grid.cellsGroupedByReversedRow);
}

async function slideTiles(groupedCells) {
  const promises = [];
  groupedCells.forEach((group) => slideTilesInGroup(group, promises));
  await Promise.all(promises);
  grid.cells.forEach((cell) => {
    cell.hasTileForMerge() && cell.mergeTiles();
  });
}

function slideTilesInGroup(group, promises) {
  for (let i = 1; i < group.length; i++) {
    if (group[i].isEmpty()) {
      continue;
    }

    const cellWithTile = group[i];

    let targetCell;
    let j = i - 1;
    while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
      targetCell = group[j];
      j--;
    }

    if (!targetCell) {
      continue;
    }

    promises.push(cellWithTile.linkedTile.waitForTransitionEnd());

    if (targetCell.isEmpty()) {
      targetCell.linkTile(cellWithTile.linkedTile);
    } else {
      targetCell.linkTileForMerge(cellWithTile.linkedTile);
    }

    cellWithTile.unlinkTile();
  }
}

function canMoveUp() {
  return canMove(grid.cellsGroupedByColumn);
}

function canMoveDown() {
  return canMove(grid.cellsGroupedByReversedColumn);
}

function canMoveLeft() {
  return canMove(grid.cellsGroupedByRow);
}

function canMoveRight() {
  return canMove(grid.cellsGroupedByReversedRow);
}

function canMove(groupedCells) {
  return groupedCells.some((group) => canMoveInGroup(group));
}

function canMoveInGroup(group) {
  return group.some((cell, index) => {
    if (index === 0) {
      return false;
    }

    if (cell.isEmpty()) {
      return false;
    }

    const targetCell = group[index - 1];
    return targetCell.canAccept(cell.linkedTile);
  });
}
