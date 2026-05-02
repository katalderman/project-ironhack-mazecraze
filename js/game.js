// Canvas and 2D rendering context
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
// hWalls[row][col] === 1: horizontal wall on the top edge of cell (row, col)
// vWalls[row][col] === 1: vertical wall on the left edge of cell (row, col)
var hWalls;
var vWalls;

// Maze and sprite dimensions (pixels)
var playerSize = 32;
var horizontalCells = 10;
var verticalCells = 10;
var cellSize = 75;
var wallThickness = 15; // also declared inside theMaze; this global copy is used by enemy movement

canvas.width = 200 + cellSize * horizontalCells; // extra width on the right holds the timer display
canvas.height = cellSize * verticalCells;
document.body.appendChild(canvas);

var theMaze = (function() {
  var horizontalCells;
  var verticalCells;
  var cellSize;
  var wallThickness = 15;
  var visited = []; // tracks which cells have been visited during maze generation
  // Assigned without 'var' so they write to the outer-scope globals declared above,
  // making wall data accessible to player/enemy collision code outside this closure.
  vWalls = [];
  hWalls = [];

  /**
   * Initializes maze dimensions and resets all wall arrays to fully walled (1 = wall present).
   * generateMaze() will then remove interior walls to carve the passages.
   * @param {int} _horizontalCells number of cells on the horizontal axis
   * @param {int} _verticalCells number of cells on the vertical axis
   * @param {double} _cellSize size of one cell, in pixels
   */
  var init = function(_horizontalCells, _verticalCells, _cellSize) {
    cellSize = _cellSize;
    horizontalCells = _horizontalCells;
    verticalCells = _verticalCells;
    var i = 0;
    var j = 0;
    for (i = 0; i < verticalCells; i++) {
      visited[i] = [];
      for (j = 0; j < horizontalCells; j++) {
        visited[i][j] = 0;
      }
    }
    // hWalls has verticalCells+1 rows to include the top and bottom border walls
    for (i = 0; i < verticalCells + 1; i++) {
      hWalls[i] = [];
      for (j = 0; j < horizontalCells; j++) {
        hWalls[i][j] = 1;
      }
    }
    // vWalls has horizontalCells+1 columns to include the left and right border walls
    for (i = 0; i < verticalCells; i++) {
      vWalls[i] = [];
      for (j = 0; j < horizontalCells + 1; j++)
        vWalls[i][j] = 1;
    }
  };

  /**
   * Returns unvisited orthogonal neighbors of cell (x, y).
   * Note: x is the row (vertical axis) and y is the column (horizontal axis).
   * @param {int} x row index of the cell
   * @param {int} y column index of the cell
   * @return {array} unvisited neighboring cells as [row, col] pairs
   */
  var getUnvisitedNeighbors = function(x, y) {
    var unvisitedNeighbors = [];
    var neighbors = [
          [x, y - 1],
          [x, y + 1],
          [x - 1, y],
          [x + 1, y]
    ];
    for (var i = 0; i < 4; i++) {
      if (neighbors[i][0] > -1 && neighbors[i][0] < verticalCells &&
         neighbors[i][1] > -1 && neighbors[i][1] < horizontalCells &&
         visited[neighbors[i][0]][neighbors[i][1]] === 0) {
        unvisitedNeighbors.push([neighbors[i][0], neighbors[i][1]]);
      }
    }
    return (unvisitedNeighbors);
  };

  /**
   * Generates the maze using iterative depth-first search (random backtracker).
   * Starts at cell [0,0], picks a random unvisited neighbor each step, removes the
   * shared wall to carve a passage, then backtracks via the path stack when stuck.
   */
  var generateMaze = function() {
    var cell = [0, 0];
    var path = [cell]; // stack: last element is the current cell
    while (path.length > 0) {
      var current = path[path.length - 1];
      visited[current[0]][current[1]] = 1;
      var potentialNeighbors = getUnvisitedNeighbors(current[0], current[1]);
      var nbNeighbors = potentialNeighbors.length;
      if (nbNeighbors === 0) {
        // Dead end — backtrack one step
        path.pop();
      } else {
        var nextCell = potentialNeighbors[Math.floor(Math.random() * nbNeighbors)];
        if (current[0] === nextCell[0]) {
          // Same row: remove the vertical wall between the two columns.
          // ceil(average) gives the shared wall index regardless of movement direction.
          vWalls[current[0]][Math.ceil(0.5 * (current[1] + nextCell[1]))] = 0;
        } else {
          // Same column: remove the horizontal wall between the two rows.
          hWalls[Math.ceil(0.5 * (current[0] + nextCell[0]))][current[1]] = 0;
        }
        path.push(nextCell);
      }
    }
  };

  /**
   * Draws all maze walls onto the canvas using the hWalls and vWalls arrays.
   */
  var drawMaze = function() {
    ctx.beginPath();
    ctx.lineWidth = 15;
    var i;
    var j;
    for (i = 0; i < verticalCells + 1; i++) {
      for (j = 0; j < horizontalCells; j++)
        if (hWalls[i][j] === 1) {
          ctx.moveTo(j * cellSize - wallThickness / 2, i * cellSize);
          ctx.lineTo((j + 1) * cellSize + wallThickness / 2, i * cellSize);
        }
    }
    for (i = 0; i < verticalCells; i++) {
      for (j = 0; j < horizontalCells + 1; j++)
        if (vWalls[i][j] === 1) {
          ctx.moveTo(j * cellSize, i * cellSize - wallThickness / 2);
          ctx.lineTo(j * cellSize, (i + 1) * cellSize + wallThickness / 2);
        }
    }
    ctx.strokeStyle = 'black';
    ctx.stroke();
  };

  /**
   * Moves the player based on held keys, clamping against maze walls.
   * @param {object} player the player object with position and speed data
   * @param {object} keysPressed map of currently held key codes
   * @param {double} modifier seconds elapsed since last frame (for frame-rate-independent speed)
   */
  var updatePositions = function(player, keysPressed, modifier) {
    var targetX = player.x;
    var targetY = player.y;
    if (38 in keysPressed) { // up arrow
      targetY = player.y - Math.min(player.speed * modifier, cellSize);
      // Primary: block on the top wall of the current cell.
      // Corner checks: if the player is within wallThickness of a side boundary,
      // also block against the perpendicular wall to prevent clipping through corners.
      if (hWalls[player.cellY][player.cellX] === 1 ||
        (((player.cellX + 1) * cellSize - player.x) < wallThickness &&
        vWalls[player.cellY - 1][player.cellX + 1] === 1) ||
          ((player.x - player.cellX * cellSize) < wallThickness &&
          vWalls[player.cellY - 1][player.cellX] === 1)) {
        player.y = Math.max(targetY, player.cellY * cellSize + wallThickness);
      } else {
        player.y = targetY;
      }
      player.cellY = Math.floor(player.y / cellSize);
    }
    if (40 in keysPressed) { // down arrow
      targetY = player.y + Math.min(player.speed * modifier, cellSize);
      if (hWalls[player.cellY + 1][player.cellX] === 1 ||
        (((player.cellX + 1) * cellSize - player.x) < wallThickness &&
        vWalls[player.cellY + 1][player.cellX + 1] === 1) ||
          ((player.x - player.cellX * cellSize) < wallThickness &&
          vWalls[player.cellY + 1][player.cellX] === 1)) {
        player.y = Math.min(targetY, (player.cellY + 1) * cellSize - wallThickness);
      } else {
        player.y += player.speed * modifier;
      }
      player.cellY = Math.floor(player.y / cellSize);
    }
    if (37 in keysPressed) { // left arrow
      targetX = player.x - Math.min(player.speed * modifier, cellSize);
      if (vWalls[player.cellY][player.cellX] === 1 ||
        (((player.cellY + 1) * cellSize - player.y) < wallThickness &&
        hWalls[player.cellY + 1][player.cellX - 1] === 1) ||
          ((player.y - player.cellY * cellSize) < wallThickness &&
          hWalls[player.cellY][player.cellX - 1] === 1)) {
        player.x = Math.max(targetX, player.cellX * cellSize + wallThickness);
      } else {
        player.x -= player.speed * modifier;
      }
      player.cellX = Math.floor(player.x / cellSize);
    }
    if (39 in keysPressed) { // right arrow
      targetX = player.x + Math.min(player.speed * modifier, cellSize);
      if (vWalls[player.cellY][player.cellX + 1] === 1 ||
        (((player.cellY + 1) * cellSize - player.y) < wallThickness &&
        hWalls[player.cellY + 1][player.cellX + 1] === 1) ||
          ((player.y - player.cellY * cellSize) < wallThickness &&
          hWalls[player.cellY][player.cellX + 1] === 1)) {
        player.x = Math.min(targetX, (player.cellX + 1) * cellSize - wallThickness);
      } else {
        player.x += player.speed * modifier;
      }
      player.cellX = Math.floor(player.x / cellSize);
    }

    // Recalculate cell coordinates after all movement to keep them in sync with pixel position
    player.cellY = Math.floor(player.y / cellSize);
    player.cellX = Math.floor(player.x / cellSize);
  };

  return {
    init: init,
    generateMaze: generateMaze,
    drawMaze: drawMaze,
    updatePositions: updatePositions
  };
})();

// Timing
var startTime;
var lastUpdateTime = Date.now();
var bestTime = 'None';

// Player sprite and state
var playerReady = false;
var playerImage = new Image();
playerImage.onload = function() {
  playerReady = true;
};
playerImage.src = 'images/player.gif';
var player = {
  speed: 256 // pixels per second
};

// Goal sprite and state
var goalReady = false;
var goalImage = new Image();
goalImage.onload = function() {
  goalReady = true;
};
goalImage.src = 'images/goal.gif';
var goal = {};

// Enemy sprite and state
var enemyReady = false;
var enemyImage = new Image();
enemyImage.onload = function() {
  enemyReady = true;
};
enemyImage.src = 'images/enemy.gif';
var enemy = {
  speed: 256 // pixels per second
};

// Track which keys are currently held down
var keysDown = {};
addEventListener('keydown', function(e) {
  keysDown[e.keyCode] = true;
}, false);
addEventListener('keyup', function(e) {
  delete keysDown[e.keyCode];
}, false);

/**
 * Resets all entity positions, generates a new maze, and restarts the timer and enemy.
 */
var reset = function() {
  // +0.5 centers each sprite within its starting cell
  player.cellX = Math.floor(Math.random() * horizontalCells);
  player.cellY = Math.floor(Math.random() * verticalCells);
  player.x = (player.cellX + 0.5) * cellSize;
  player.y = (player.cellY + 0.5) * cellSize;
  goal.cellX = Math.floor(Math.random() * horizontalCells);
  goal.cellY = Math.floor(Math.random() * verticalCells);
  goal.x = (goal.cellX + 0.5) * cellSize;
  goal.y = (goal.cellY + 0.5) * cellSize;
  enemy.cellX = Math.floor(Math.random() * horizontalCells);
  enemy.cellY = Math.floor(Math.random() * verticalCells);
  enemy.x = (enemy.cellX + 0.5) * cellSize;
  enemy.y = (enemy.cellY + 0.5) * cellSize;

  gameWon = false;
  theMaze.init(horizontalCells, verticalCells, cellSize);
  theMaze.generateMaze();
  startTime = Date.now();
  startEnemyMove();
};

// Enemy movement runs on its own 40ms interval, independent of the ~60fps render loop.
// Clearing the previous interval before starting a new one prevents stacking on reset.
var enemyMoveInterval = null;
function startEnemyMove() {
  if (enemyMoveInterval) {
    clearInterval(enemyMoveInterval);
  }
  enemyMoveInterval = setInterval(function() {
    var dx = 0, dy = 0;
    if (enemy.x < player.x) dx = 1;
    else if (enemy.x > player.x) dx = -1;
    if (enemy.y < player.y) dy = 1;
    else if (enemy.y > player.y) dy = -1;

    // Handle horizontal and vertical movement separately so the enemy can slide along
    // a wall it can't pass rather than stopping dead on diagonal approaches.
    if (dx !== 0) {
      var newX = enemy.x + dx;
      if (dx > 0 && vWalls[enemy.cellY][enemy.cellX + 1] === 1) {
        newX = Math.min(newX, (enemy.cellX + 1) * cellSize - wallThickness);
      } else if (dx < 0 && vWalls[enemy.cellY][enemy.cellX] === 1) {
        newX = Math.max(newX, enemy.cellX * cellSize + wallThickness);
      }
      enemy.x = newX;
      enemy.cellX = Math.floor(enemy.x / cellSize);
    }

    if (dy !== 0) {
      var newY = enemy.y + dy;
      if (dy > 0 && hWalls[enemy.cellY + 1][enemy.cellX] === 1) {
        newY = Math.min(newY, (enemy.cellY + 1) * cellSize - wallThickness);
      } else if (dy < 0 && hWalls[enemy.cellY][enemy.cellX] === 1) {
        newY = Math.max(newY, enemy.cellY * cellSize + wallThickness);
      }
      enemy.y = newY;
      enemy.cellY = Math.floor(enemy.y / cellSize);
    }
  }, 40);
}

/**
 * Updates game state each frame: moves the player and checks the win condition.
 * @param {double} modifier seconds elapsed since the last frame
 */
var update = function(modifier) {
  theMaze.updatePositions(player, keysDown, modifier);
  // Trigger win when the player's center is within half a cell of the goal's center
  if (Math.abs(player.x - goal.x) < 0.5 * cellSize &&
  Math.abs(player.y - goal.y) < 0.5 * cellSize) {
    var thisTime = ((Date.now() - startTime) / 1000);
    console.log(thisTime);
    if (bestTime === 'None' || thisTime < bestTime) {
      bestTime = thisTime;
    }
    gameOver();
  }
};

/**
 * Clears and redraws the canvas each frame: maze, sprites, and timer.
 */
var render = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  theMaze.drawMaze();
  if (goalReady) {
    ctx.drawImage(goalImage, goal.x - playerSize / 2, goal.y - playerSize / 2);
  }
  if (playerReady) {
    // -0.75 * playerSize shifts the sprite up so the feet align with the cell center
    ctx.drawImage(playerImage, player.x - playerSize / 2, player.y - 0.75 * playerSize);
  }
  if (enemyReady) {
    ctx.drawImage(enemyImage, enemy.x - playerSize / 2, enemy.y - playerSize / 2);
  }

  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.font = '24px Helvetica';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  // Freeze the displayed time at winTime once the player has won
  var currentTime = gameWon ? winTime : ((Date.now() - startTime) / 1000).toFixed(2);
  ctx.fillText('Time: ' + currentTime, canvas.width - 160, 32);

  collides();
};

/**
 * Checks if the enemy has caught the player (within 50px) and triggers a loss.
 * The gameWon guard prevents this from firing after the player has already won.
 */
function collides() {
  if (gameWon) return;
  if (Math.abs(player.x - enemy.x) <= 50 && Math.abs(player.y - enemy.y) <= 50) {
    youLost();
  }
}

// NOTE: this function declaration is overwritten at runtime by the var gameOver assignment
// further below. Only the var version executes during gameplay.
function gameOver() {
  document.getElementById('game-over').style.display = 'block';
}

function youLost() {
  if (enemyMoveInterval) {
    clearInterval(enemyMoveInterval);
  }
  document.getElementById('you-lost').style.display = 'block';
}

function restartGame() {
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('you-lost').style.display = 'none';
  reset();
}

var gameWon = false;
var winTime = 0;

// NOTE: this function declaration is overwritten at runtime by the var main assignment
// further below. Only the var version runs the game loop.
var gameRunning = true;
function main() {
  var now = Date.now();
  var delta = now - lastUpdateTime;
  lastUpdateTime = now;
  if (gameRunning) {
    update(delta / 1000);
    render();
    collides();
  }
  requestAnimationFrame(main);
}

reset();
requestAnimationFrame(main);

// Active gameOver — overwrites the function declaration above.
// Stops the enemy, freezes the timer, and shows the win screen.
var gameOver = function() {
  gameWon = true;
  winTime = ((Date.now() - startTime) / 1000).toFixed(2);
  if (enemyMoveInterval) {
    clearInterval(enemyMoveInterval);
    enemyMoveInterval = null;
  }
  document.getElementById('game-over').style.display = "block";
};

// Active game loop — overwrites the function declaration above.
// requestAnimationFrame targets ~60fps; delta normalizes movement to real elapsed time.
var main = function() {
  var now = Date.now();
  var delta = now - lastUpdateTime;
  update(delta / 1000);
  render();
  lastUpdateTime = now;
  requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame ||
w.webkitRequestAnimationFrame || w.msRequestAnimationFrame ||
w.mozRequestAnimationFrame;

reset();
main();
