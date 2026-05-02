# MazeCraze

MazeCraze is a browser-based maze game built for Ironhack. Navigate the character Sake through a randomly generated maze, reach the goal (food), and avoid the enemy (Master Shredder). The game features a procedurally generated maze, real-time collision detection, and an AI-controlled enemy opponent.

## Technologies Used
- **HTML5** - Semantic markup for structure
- **CSS3** - Styling, responsive design, and overlay effects
- **JavaScript (Vanilla)** - Game logic, maze generation, collision detection, and game loop
- **Canvas API** - Rendering the maze, player, goal, and enemy

## Features
- Randomly generated maze using depth-first search algorithm
- Real-time player movement with arrow keys
- AI-controlled enemy that chases the player
- Collision detection for walls, goal, and enemy
- Win condition when reaching the goal
- Lose condition when caught by the enemy
- Game timer and best time tracking
- Responsive game overlay for win/lose states

## How to Play
1. Use the **arrow keys** to move Sake through the maze
2. Reach the **goal (food)** without getting caught by **Master Shredder**
3. Avoid walls and navigate carefully through the maze
4. Completing the maze displays your time — try to beat your best time!
5. Click **Restart** to play again

## Installation & Running Locally
1. Clone or download this repository
2. Open `index.html` in a web browser
3. The game loads automatically and is ready to play

## Game Structure
```
project-ironhack-mazecraze/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Styling for game and overlays
├── js/
│   └── game.js         # Core game logic, maze generation, AI
├── images/             # Game assets (sprites and backgrounds)
└── readme.md          # This file
```

## Implementation Approach
- **Maze Generation**: Uses a depth-first search algorithm with backtracking to create a perfect maze
- **Collision Detection**: Checks player position against wall arrays before allowing movement
- **Enemy AI**: Simple pathfinding that moves toward the player's position each frame
- **Game Loop**: Implemented with `requestAnimationFrame` for smooth 60 FPS rendering
- **State Management**: Game states (running, won, lost) controlled by overlay display

## Unsolved Problems & Future Enhancements
- Mobile touch controls not yet implemented
- Game is not yet fully responsive on small screens
- Enemy AI could be more sophisticated (A* pathfinding)
- Score/difficulty levels not implemented
- Sound effects and background music not included
- Multiplayer modes not yet implemented

## Deployment
This game is deployed on GitHub Pages. Visit the link in the repository URL section to play online.

## Best Practices Applied
- ✅ Separate HTML, CSS, and JavaScript files
- ✅ Organized folder structure (css/, js/, images/)
- ✅ Semantic HTML markup
- ✅ DRY principles applied to CSS styling
- ✅ Clean, well-commented JavaScript code
- ✅ Proper game loop implementation with requestAnimationFrame
- ✅ Collision detection with boundary checking
- ✅ Meaningful alt text for images

## Ironhack Project Requirements

### Requirements
The app must:
- Render a game in the browser
- Use Javascript or jQuery for DOM manipulation
- Design logic for winning & visually display win/lose
- Be deployed online to GitHub Pages, where the rest of the world can access it
- Look visually appealing

### Best Practices Required
- Include separate HTML / CSS / JavaScript files
- Create a separate folder for all the js files, one for all the images, one for all the css, etc.
- The main page MUST be called index.html
- You must have a readme file that include a description of the game, etc. (create one manually, do not check the box on github)
- Stick with KISS (Keep It Simple Stupid) and DRY (Don't Repeat Yourself) principles
- Use semantic markup for HTML and CSS (adhere to best practices)
- Make sure to indent code (can use a plugin for VS code called beautify)

### Bonus Features
- Switch turns between two players
- Create a mobile version
- Make the game responsive

### Necessary Deliverables
A working game that runs in the browser
A deploy of the game in GitHub Pages
A link to the hosted working game in the URL section of your GitHub repo
A readme.md file with explanations of the technologies used, the approach taken, installation instructions, unsolved problems, etc.

### Suggested Ways to Get Started
Tips
-You can find some sample landing pages at w3layouts.com/games (or by googling similar things)
-Break the project down into different steps (logic & data structures, layout and rendering, DOM manipulation & user interaction). Use whiteboards to conceptualize your game!
-Use your Development Tools (console.log, inspector, alert statements, etc) to debug and solve problems
-Work through the lessons in class & ask questions when you need to! Think about adding relevant code to your game each night, instead of, you know… procrastinating
-Commit early, commit often, don’t be afraid to break something because you can always go back in time to a previous version
-Consult documentation resources (MDN, jQuery, etc.) to understand better the tools you are using & the available help you will get
-Don’t be afraid of the black screen, make it work and, if needed, refactor your code. If you need to create code (as in console.log) to test what you are doing, you can always delete it
