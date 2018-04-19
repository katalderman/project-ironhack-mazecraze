// Create the canvas
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

// Basic dimensions of the maze and avatar
var avatarSize = 32;
var horizontalCells = 15;
var verticalCells = 15;
var cellSize = 50;

canvas.width = 200 + cellSize * horizontalCells;
canvas.height = cellSize * verticalCells;
document.body.appendChild(canvas);

var diagonal = Math.pow(Math.pow(horizontalCells * cellSize, 2) +
Math.pow(verticalCells * cellSize, 2), 0.5);

var theMaze = (function() {
  var horizontalCells;
  var verticalCells;
  var cellSize;
  var wallThickness = 16;
  // A 2D array to know if a cell is reachable; used during maze generation
  var visited = [];
  // A 2D array to know where the vertical walls are
  var vWalls = [];
  // A 2D array to know where the horizontal walls are
  var hWalls = [];
  /**
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
    // horizontal walls (1=there is a wall)
    for (i = 0; i < verticalCells + 1; i++) {
      hWalls[i] = [];
      for (j = 0; j < horizontalCells; j++) {
        hWalls[i][j] = 1;
      }
    }
    // vertical walls (1=there is a wall)
    for (i = 0; i < verticalCells; i++) {
      vWalls[i] = [];
      for (j = 0; j < horizontalCells + 1; j++)
        vWalls[i][j] = 1;
    }
  };
  /**
   * @param {int} x vertical integer coordinate of the input cell
   * @param {int} y horizontal integer coordinate of the input cell
   * @return {array} This returns an array containing the unvisited neighboring cells.
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
   * Generates the maze itself; i.e. fills up the wall variables vWalls and hWalls
   * It uses a simple depth first random navigation.
   * The path variable is used as a LIFO structure to back track
   * when we reach a dead end.
   */
  var generateMaze = function() {
    // current cell for generation
    var cell = [0, 0];
    // path (last element is the current cell)
    var path = [cell];
    while (path.length > 0) {
      var current = path[path.length - 1];
      visited[current[0]][current[1]] = 1;
      var potentialNeighbors = getUnvisitedNeighbors(current[0], current[1]);
      var nbNeighbors = potentialNeighbors.length;
      // If there are no neighbor cells to visit (they are already visited),
      // we pop the last element of path - go back one step.
      if (nbNeighbors === 0) {
        path.pop();
      } else {  // else, we pick a random reachable neighbor and destroy the wall
        var nextCell = potentialNeighbors[Math.floor(Math.random() *
           nbNeighbors)];
        if (current[0] === nextCell[0]) { // vertical wall broken
          vWalls[current[0]][Math.ceil(0.5 * (current[1] + nextCell[1]))] = 0;
        } else {
          hWalls[Math.ceil(0.5 * (current[0] + nextCell[0]))][current[1]] = 0;
        }
        path.push(nextCell);
      }
    }
  };
  /**
   * Uses the vWalls and hWalls variables to draw the maze (i.e. all the walls)
   */
  var drawMaze = function() {
    ctx.beginPath();
    ctx.lineWidth = 15;
    var i;
    var j;
    // Draw horizontal walls first
    for (i = 0; i < verticalCells + 1; i++) {
      for (j = 0; j < horizontalCells; j++)
        if (hWalls[i][j] === 1) {
          ctx.moveTo(j * cellSize - wallThickness / 2, i * cellSize);
          ctx.lineTo((j + 1) * cellSize + wallThickness / 2, i * cellSize);
        }
    }
    // Then draw the vertical walls
    for (i = 0; i < verticalCells; i++) {
      for (j = 0; j < horizontalCells + 1; j++)
        if (vWalls[i][j] === 1) {
          ctx.moveTo(j * cellSize, i * cellSize - wallThickness / 2);
          ctx.lineTo(j * cellSize, (i + 1) * cellSize + wallThickness / 2);
        }
    }
    ctx.strokeStyle = 'black';
    ctx.stroke();
  ctx.lineCap = "round";
  };
  /**
   * Modifies the attributes of avatar to update its position.
   * @param {objects} avatar the avatar object, that contains position data
   * @param {array} keysPressed an array that contains key pressed data
   * @param {double} modifier a double to indicate how much time has passed since the last update
   */
  var updatePositions = function(avatar, keysPressed, modifier) {
    var targetX = avatar.x;
    var targetY = avatar.y;
    // First update pixel-position
    if (38 in keysPressed) { // Player holding up
      targetY = avatar.y - Math.min(avatar.speed * modifier, cellSize);
      if (hWalls[avatar.cellY][avatar.cellX] === 1 ||
        (((avatar.cellX + 1) * cellSize - avatar.x) < wallThickness &&
        vWalls[avatar.cellY - 1][avatar.cellX + 1] === 1) ||
          ((avatar.x - avatar.cellX * cellSize) < wallThickness &&
          vWalls[avatar.cellY - 1][avatar.cellX] === 1)) {
        avatar.y = Math.max(targetY,
        avatar.cellY * cellSize + wallThickness);
      } else {
        avatar.y = targetY;
      }
      avatar.cellY = Math.floor(avatar.y / cellSize);
    }
    if (40 in keysPressed) { // Player holding down
      targetY = avatar.y + Math.min(avatar.speed * modifier, cellSize);
      if (hWalls[avatar.cellY + 1][avatar.cellX] === 1 ||
        (((avatar.cellX + 1) * cellSize - avatar.x) < wallThickness &&
        vWalls[avatar.cellY + 1][avatar.cellX + 1] === 1) ||
          ((avatar.x - avatar.cellX * cellSize) < wallThickness &&
          vWalls[avatar.cellY + 1][avatar.cellX] === 1)) {
        avatar.y = Math.min(targetY,
        (avatar.cellY + 1) * cellSize - wallThickness);
      } else {
        avatar.y += avatar.speed * modifier;
      }
      avatar.cellY = Math.floor(avatar.y / cellSize);
    }
    if (37 in keysPressed) { // Player holding left
      targetX = avatar.x - Math.min(avatar.speed * modifier, cellSize);
      if (vWalls[avatar.cellY][avatar.cellX] === 1 ||
        (((avatar.cellY + 1) * cellSize - avatar.y) < wallThickness &&
        hWalls[avatar.cellY + 1][avatar.cellX - 1] === 1) ||
          ((avatar.y - avatar.cellY * cellSize) < wallThickness &&
          hWalls[avatar.cellY][avatar.cellX - 1] === 1)) {
        avatar.x = Math.max(targetX,
        avatar.cellX * cellSize + wallThickness);
      } else {
        avatar.x -= avatar.speed * modifier;
      }
      avatar.cellX = Math.floor(avatar.x / cellSize);
    }
    if (39 in keysPressed) { // Player holding right
      targetX = avatar.x + Math.min(avatar.speed * modifier, cellSize);
      if (vWalls[avatar.cellY][avatar.cellX + 1] === 1 ||
        (((avatar.cellY + 1) * cellSize - avatar.y) < wallThickness &&
        hWalls[avatar.cellY + 1][avatar.cellX + 1] === 1) ||
          ((avatar.y - avatar.cellY * cellSize) < wallThickness &&
          hWalls[avatar.cellY][avatar.cellX + 1] === 1)) {
        avatar.x = Math.min(targetX,
        (avatar.cellX + 1) * cellSize - wallThickness);
      } else {
        avatar.x += avatar.speed * modifier;
      }
      avatar.cellX = Math.floor(avatar.x / cellSize);
    }
    // Then update cell-position
    avatar.cellY = Math.floor(avatar.y / cellSize);
    avatar.cellX = Math.floor(avatar.x / cellSize);



  };
  return {
    init: init,
    generateMaze: generateMaze,
    drawMaze: drawMaze,
    updatePositions: updatePositions
  };
})();

// Declaration of useful time variables
var startTime;
var lastUpdateTime = Date.now();
var bestTime = 'None';

// Avatar
var avatarReady = false;
var avatarImage = new Image();
avatarImage.onload = function() {
  avatarReady = true;
};
avatarImage.src = 'images/avatar.png';
var avatar = {
  speed: 256 // movement in pixels per second
};

// Goal
var goalReady = false;
var goalImage = new Image();
goalImage.onload = function() {
  goalReady = true;
};
goalImage.src = 'images/goal.png';
var goal = {};

var enemyY = 0; // kat

// Enemy
var enemyReady = false;
var enemyImage = new Image();
enemyImage.onload = function() {
  enemyReady = true;
};
enemyImage.src = 'images/enemy2.png';
var enemy = {
  speed: 256 // movement in pixels per second
};


// Keyboard controls
var keysDown = {};
addEventListener('keydown', function(e) {
  keysDown[e.keyCode] = true;
}, false);
addEventListener('keyup', function(e) {
  delete keysDown[e.keyCode];
}, false);

/**
 * Resets avatar and goal locations, generates a new maze, and sets the starting time
 */
var reset = function() {
  // Initialize avatar and goal in random locations
  avatar.cellX = Math.floor(Math.random() * horizontalCells);
  avatar.cellY = Math.floor(Math.random() * verticalCells);
  avatar.x = (avatar.cellX + 0.5) * cellSize;
  avatar.y = (avatar.cellY + 0.5) * cellSize;
  goal.cellX = Math.floor(Math.random() * horizontalCells);
  goal.cellY = Math.floor(Math.random() * verticalCells);
  goal.x = (goal.cellX + 0.5) * cellSize;
  goal.y = (goal.cellY + 0.5) * cellSize;
  // ---KAT---
  enemy.cellX = Math.floor(Math.random() * horizontalCells);
  enemy.cellY = Math.floor(Math.random() * verticalCells);
  enemy.x = (enemy.cellX + 0.5) * cellSize;
  enemy.y = (enemy.cellY + 0.5) * cellSize;

  // Initialize, generate a random maze, and sets the starting time
  theMaze.init(horizontalCells, verticalCells, cellSize);
  theMaze.generateMaze();
  startTime = Date.now();
};



/**
 * Updates all the game elements: distances between objects, positions, and checks for termination condition
 * @param {double} modifier a double to indicate how much time has passed since the last update
 */
var update = function(modifier) {
  // Update distances and avatar's radar
  // var distanceToGoal = Math.pow(Math.pow(avatar.x - goal.x, 2) +
  // Math.pow(avatar.y - goal.y, 2), 0.5);
  // radius = (radius + (1 / (distanceToGoal / diagonal) - 1)) %
  //  (distanceToGoal / 2);
  // Update the avatar's position based on the maze design
  theMaze.updatePositions(avatar, keysDown, modifier);
  // If the avatar reaches the goal, reset the game
  if (Math.abs(avatar.x - goal.x) < 0.2 * cellSize &&
  Math.abs(avatar.y - goal.y) < 0.2 * cellSize) {
    var thisTime = ((Date.now() - startTime) / 1000);
    console.log(thisTime);
    console.log(bestTime);
    console.log(Date.now());
    console.log(startTime);
    if (bestTime === 'None' || thisTime < bestTime) {
      console.log('changing besttime');
      bestTime = thisTime;
    }
    reset();
  }
};

/**
 * Renders all the objects on the canvas: the maze, the avatar, the goal, and score information
 */
var render = function() {
  // Clear all
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw the maze
  theMaze.drawMaze();
  // Draw the goal and the avatar
  if (goalReady) {
    ctx.drawImage(goalImage, goal.x - avatarSize / 2, goal.y - avatarSize / 2);
  }
  if (avatarReady) {
    ctx.drawImage(avatarImage, avatar.x - avatarSize / 2,
      avatar.y - 0.75 * avatarSize);
  }
  // draw the enemy ---KAT---
  if (enemyReady) {
    ctx.drawImage(enemyImage, enemy.x - avatarSize / 2, enemy.y - avatarSize / 2);
  }

  // Draw timer
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  ctx.font = '24px Helvetica';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  var currentTime = ((Date.now() - startTime) / 1000).toFixed(2);
  ctx.fillText('Time: ' + currentTime, canvas.width - 128, 32);
  ctx.fillText('Best: ' + bestTime, canvas.width - 128, 64);
};

/**
 * The main game loop
 */
var main = function() {
  var now = Date.now();
  // Estimate the time since the last update was made
  var delta = now - lastUpdateTime;

  // Update the game according to how much time has passed
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

// Actual functions called
reset();
main();
