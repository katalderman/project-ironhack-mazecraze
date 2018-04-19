// Create the canvas
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var hWalls;
var vWalls;

// Basic dimensions of the maze and player
var playerSize = 32;
var horizontalCells = 10;
var verticalCells = 10;
var cellSize = 75;

canvas.width = 200+ cellSize * horizontalCells;
canvas.height = cellSize * verticalCells;
document.body.appendChild(canvas);

var diagonal = Math.pow(Math.pow(horizontalCells * cellSize, 2) +
Math.pow(verticalCells * cellSize, 2), 0.5);

var theMaze = (function() {
  var horizontalCells;
  var verticalCells;
  var cellSize;
  var wallThickness = 15;
  // A 2D array to know if a cell is reachable; used during maze generation
  var visited = [];
  // A 2D array to know where the vertical walls are
   vWalls = [];
  // A 2D array to know where the horizontal walls are
   hWalls = [];
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
   * Generates the maze itself; i.e. fills up the wall variables vWalls and hWalls (depth first random navigation)
   * The path variable is used as a LIFO structure to back track when a dead end is reached
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
  };
  /**
   * Modifies the attributes of player to update its position.
   * @param {objects} player the player object, that contains position data
   * @param {array} keysPressed an array that contains key pressed data
   * @param {double} modifier a double to indicate how much time has passed since the last update
   */
  var updatePositions = function(player, keysPressed, modifier) {
    var targetX = player.x;
    var targetY = player.y;
    // First update pixel-position
    if (38 in keysPressed) { // Player holding up
      targetY = player.y - Math.min(player.speed * modifier, cellSize);
      if (hWalls[player.cellY][player.cellX] === 1 ||
        (((player.cellX + 1) * cellSize - player.x) < wallThickness &&
        vWalls[player.cellY - 1][player.cellX + 1] === 1) ||
          ((player.x - player.cellX * cellSize) < wallThickness &&
          vWalls[player.cellY - 1][player.cellX] === 1)) {
        player.y = Math.max(targetY,
        player.cellY * cellSize + wallThickness);
      } else {
        player.y = targetY;
      }
      player.cellY = Math.floor(player.y / cellSize);
    }
    if (40 in keysPressed) { // Player holding down
      targetY = player.y + Math.min(player.speed * modifier, cellSize);
      if (hWalls[player.cellY + 1][player.cellX] === 1 ||
        (((player.cellX + 1) * cellSize - player.x) < wallThickness &&
        vWalls[player.cellY + 1][player.cellX + 1] === 1) ||
          ((player.x - player.cellX * cellSize) < wallThickness &&
          vWalls[player.cellY + 1][player.cellX] === 1)) {
        player.y = Math.min(targetY,
        (player.cellY + 1) * cellSize - wallThickness);
      } else {
        player.y += player.speed * modifier;
      }
      player.cellY = Math.floor(player.y / cellSize);
    }
    if (37 in keysPressed) { // Player holding left
      targetX = player.x - Math.min(player.speed * modifier, cellSize);
      if (vWalls[player.cellY][player.cellX] === 1 ||
        (((player.cellY + 1) * cellSize - player.y) < wallThickness &&
        hWalls[player.cellY + 1][player.cellX - 1] === 1) ||
          ((player.y - player.cellY * cellSize) < wallThickness &&
          hWalls[player.cellY][player.cellX - 1] === 1)) {
        player.x = Math.max(targetX,
        player.cellX * cellSize + wallThickness);
      } else {
        player.x -= player.speed * modifier;
      }
      player.cellX = Math.floor(player.x / cellSize);
    }
    if (39 in keysPressed) { // Player holding right
      targetX = player.x + Math.min(player.speed * modifier, cellSize);
      if (vWalls[player.cellY][player.cellX + 1] === 1 ||
        (((player.cellY + 1) * cellSize - player.y) < wallThickness &&
        hWalls[player.cellY + 1][player.cellX + 1] === 1) ||
          ((player.y - player.cellY * cellSize) < wallThickness &&
          hWalls[player.cellY][player.cellX + 1] === 1)) {
        player.x = Math.min(targetX,
        (player.cellX + 1) * cellSize - wallThickness);
      } else {
        player.x += player.speed * modifier;
      }
      player.cellX = Math.floor(player.x / cellSize);
    }
    // Then update cell-position
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

// Declaration of useful time variables
var startTime;
var lastUpdateTime = Date.now();
var bestTime = 'None';

// player
var playerReady = false;
var playerImage = new Image();
playerImage.onload = function() {
  playerReady = true;
};
playerImage.src = 'images/player.gif';
var player = {
  speed: 256 // movement in pixels per second
};

// Goal
var goalReady = false;
var goalImage = new Image();
goalImage.onload = function() {
  goalReady = true;
};
goalImage.src = 'images/goal.gif';
var goal = {};

var enemyY = 0; // enemyY

// Enemy
var enemyReady = false;
var enemyImage = new Image();
enemyImage.onload = function() {
  enemyReady = true;
};
enemyImage.src = 'images/enemy.gif';
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
 * Resets player and goal locations, generates a new maze, and sets the starting time
 */
var reset = function() {
  // Initialize player and goal in random locations
  player.cellX = Math.floor(Math.random() * horizontalCells);
  player.cellY = Math.floor(Math.random() * verticalCells);
  player.x = (player.cellX + 0.5) * cellSize;
  player.y = (player.cellY + 0.5) * cellSize;
  goal.cellX = Math.floor(Math.random() * horizontalCells);
  goal.cellY = Math.floor(Math.random() * verticalCells);
  goal.x = (goal.cellX + 0.5) * cellSize;
  goal.y = (goal.cellY + 0.5) * cellSize;
  // ---enemy---
  enemy.cellX = Math.floor(Math.random() * horizontalCells);
  enemy.cellY = Math.floor(Math.random() * verticalCells);
  enemy.x = (enemy.cellX + 0.5) * cellSize;
  enemy.y = (enemy.cellY + 0.5) * cellSize;

  // Initialize, generate a random maze, and sets the starting time
  theMaze.init(horizontalCells, verticalCells, cellSize);
  theMaze.generateMaze();
  startTime = Date.now();
  enemyMove();
};

function enemyMove(){
  setInterval(function(){
    // console.log(enemy.x,enemy.y);

if (enemy.x < player.x && enemy.y < player.y){
  enemy.x++;
  enemy.y++;
} else if 
  (enemy.x > player.x && enemy.y < player.y){
enemy.x--;
enemy.y++;
} else if
(enemy.x < player.x && enemy.y > player.y){
  enemy.x++;
  enemy.y--;
} else if
(enemy.x > player.x && enemy.y > player.y){
  enemy.x--;
  enemy.y--;
} else if
(enemy.x > player.x && enemy.y == player.y){
  enemy.x--;
} else if
(enemy.x < player.x && enemy.y == player.y){
  enemy.x++;
} else if
(enemy.x == player.x && enemy.y < player.y){
  enemy.y++;
} else if
(enemy.x == player.x && enemy.y > player.y){
  enemy.y--;
}

},50) // higher = enemy moves slower
}

/**
 * Updates all the game elements: positions and checks for termination condition
 * @param {double} modifier a double to indicate how much time has passed since the last update
 */
var update = function(modifier) {
  // Update the player's position based on the maze design
  theMaze.updatePositions(player, keysDown, modifier);
  // If the player reaches the goal, reset the game
  if (Math.abs(player.x - goal.x) < 0.5 * cellSize &&
  Math.abs(player.y - goal.y) < 0.5 * cellSize) {
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
 * Renders all the objects on the canvas: the maze, the player, the goal, and score information
 */
var render = function() {
  // Clear all
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw the maze
  theMaze.drawMaze();
  // Draw the goal, player and enemy
  if (goalReady) {
    ctx.drawImage(goalImage, goal.x - playerSize / 2, goal.y - playerSize / 2);
  }
  if (playerReady) {
    ctx.drawImage(playerImage, player.x - playerSize / 2,
      player.y - 0.75 * playerSize);
  }
  if (enemyReady) {
    ctx.drawImage(enemyImage, enemy.x - playerSize / 2, enemy.y - playerSize / 2);
  }

  // Draw timer
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.font = '24px Helvetica';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  var currentTime = ((Date.now() - startTime) / 1000).toFixed(2);
  ctx.fillText('Time: ' + currentTime, canvas.width - 160, 32);
  ctx.fillText('Best: ' + bestTime, canvas.width - 160, 64);
};


// collision detection -- KAT NEEDS TO WORK ON THIS
// function isCollide(player, enemy) {
//   return !(
//       ((player.y + player.height) < (enemy.y)) ||
//       (player.y > (enemy.y + enemy.height)) ||
//       ((player.x + player.width) < enemy.x) ||
//       (player.x > (enemy.x + enemy.width))
//   );
// }





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



// wrote this for enemy movement -- unused in final
// switch (enemyDirection) {

//   case "down":
//   // down
//         targetY = enemy.y + cellSize;
//         if (hWalls[enemy.y + 1][enemy.x] === 1 ||
//           (((enemy.x + 1) * cellSize - enemy.x) < wallThickness &&
//           vWalls[enemy.y + 1][enemy.x + 1] === 1) ||
//             ((enemy.x - enemy.x * cellSize) < wallThickness &&
//             vWalls[enemy.y + 1][enemy.x] === 1)) {
//           enemy.y = Math.min(targetY,
//           (enemy.y + 1) * cellSize - wallThickness);
//         } else {
//           enemy.y += 1;
//         }
//         break;
//         case "up":
//         // up
//         targetY = enemy.y + cellSize;
//         if (hWalls[enemy.y + 1][enemy.x] === 1 ||
//           (((enemy.x + 1) * cellSize - enemy.x) < wallThickness &&
//           vWalls[enemy.y + 1][enemy.x + 1] === 1) ||
//             ((enemy.x - enemy.x * cellSize) < wallThickness &&
//             vWalls[enemy.y + 1][enemy.x] === 1)) {
//           enemy.y = Math.min(targetY,
//           (enemy.y - 1) * cellSize - wallThickness);
//         } else {
//           enemy.y -= 1;
//         }
//         break;
//         case "right":
//         // right
//         targetX = enemy.x + cellSize;
//         if (vWalls[enemy.x + 1][enemy.x] === 1 ||
//           (((enemy.x + 1) * cellSize - enemy.x) < wallThickness &&
//           hWalls[enemy.x + 1][enemy.x + 1] === 1) ||
//             ((enemy.x - enemy.x * cellSize) < wallThickness &&
//             hWalls[enemy.x + 1][enemy.x] === 1)) {
//           enemy.x = Math.min(targetX,
//           (enemy.x + 1) * cellSize - wallThickness);
//         } else {
//           enemy.x += 1;
//         }
//         break;
//         case "left":
//          // left
//               targetX = enemy.x + cellSize;
//               if (vWalls[enemy.x + 1][enemy.x] === 1 ||
//                 (((enemy.x + 1) * cellSize - enemy.x) < wallThickness &&
//                 hWalls[enemy.x + 1][enemy.x + 1] === 1) ||
//                   ((enemy.x - enemy.x * cellSize) < wallThickness &&
//                   hWalls[enemy.x + 1][enemy.x] === 1)) {
//                 enemy.x = Math.min(targetX,
//                 (enemy.x - 1) * cellSize - wallThickness);
//               } else {
//               }
//               break;
//             }
//     },100)