// Getting links to DOM elements
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const themeSwitch = document.getElementById('theme-switch');
const arrowButtons = document.querySelectorAll('.arrow');
const modeWithWalls = document.getElementById('mode-walls');
const modeNoWalls = document.getElementById('mode-no-walls');
const speedSlow = document.getElementById('speed-slow');
const speedMedium = document.getElementById('speed-medium');
const speedFast = document.getElementById('speed-fast');
const speedInsane = document.getElementById('speed-insane');

// Game settings
const gridSize = 20;
const defaultCanvasSize = 400; // Standard field size
const insaneCanvasSize = 600; // Same size for insane mode
let canvasSize = defaultCanvasSize;
let tileCount = canvasSize / gridSize;

// Speed settings (FPS)
const SPEED_SLOW = 5;    // Slow speed
const SPEED_MEDIUM = 7;  // Medium speed
const SPEED_FAST = 10;   // Fast speed
const SPEED_INSANE = 15; // Insane speed
let speed = SPEED_MEDIUM; // Medium speed by default
let wallsMode = false; // No walls mode by default
// Initialization of the class for background to default insane
document.body.classList.add('body-pre-insane');

// Obstacles and puddles (only for insane mode)
let obstacles = []; // Obstacles array
let puddles = [];   // Puddles array
let insaneMode = false; // Insane mode flag
let puddleTimer = null; // Timer for puddles

// Snake
let snake = [];
let snakeLength = 3;

// Snake movement direction
let dx = 0;
let dy = 0;

// Food
let foodX;
let foodY;

// Score
let score = 0;

// Game state
let gameRunning = false;
let gameLoop;

// Colors
const colors = {
    light: {
        snakeHead: '#4e54c8',
        snakeBody: '#8f94fb',
        food: '#ff6b6b',
        background: '#f0f2f5',
        border: '#e1e5ee'
    },
    dark: {
        snakeHead: '#8f94fb',
        snakeBody: '#4e54c8',
        food: '#ff6b6b',
        background: '#2c3344',
        border: '#4a5568'
    }
};

// Current theme
let currentTheme = 'light';

// Theme switching
themeSwitch.addEventListener('change', function() {
    if (this.checked) {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        currentTheme = 'dark';
    } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        currentTheme = 'light';
    }
    drawGame();
});

// Game mode switch handlers
modeWithWalls.addEventListener('change', function() {
    if (this.checked) {
        wallsMode = true;
    }
});

modeNoWalls.addEventListener('change', function() {
    if (this.checked) {
        wallsMode = false;
    }
});

// Speed changeover handlers
speedSlow.addEventListener('change', function() {
    if (this.checked) {
        speed = SPEED_SLOW;
    }
});

speedMedium.addEventListener('change', function() {
    if (this.checked) {
        speed = SPEED_MEDIUM;
    }
});

speedFast.addEventListener('change', function() {
    if (this.checked) {
        speed = SPEED_FAST;
    }
});

speedInsane.addEventListener('change', function() {
    if (this.checked) {
        speed = SPEED_INSANE;
        insaneMode = true;
        canvasSize = insaneCanvasSize;

        // Switching backgrounds: remove the background to insane and add an insane background
        document.body.classList.remove('body-pre-insane');
        document.body.classList.add('body-insane');

        // Show the Mad Mode rules window
        // Only if the game has not been started yet
        if (!gameRunning) {
            showInsaneRules();
        }
    } else {
        insaneMode = false;
        canvasSize = defaultCanvasSize;

        // Return the background to insane when exiting insane mode
        document.body.classList.remove('body-insane');
        document.body.classList.add('body-pre-insane');
    }
    
    // Updating the size of the canvas
    updateCanvasSize();
});

// A feature to explain the rules of crazy mode
function showInsaneRules() {
    modalOpen = true; // Set the flag that the modal window is open
    
    const rulesModal = document.createElement('div');
    rulesModal.className = 'rules-modal';
    rulesModal.innerHTML = `
        <div class="rules-content">
            <h2>INSANE MODE</h2>
            <div class="rules-section">
                <h3>Rules:</h3>
                <ul>
                    <li>Maximum snake speed</li>
                    <li>Obstacles - collision with them ends the game</li>
                    <li>Toxic puddles slow the snake by 50%</li>
                    <li>Every second in the puddle, the snake loses 10 points and shortens</li>
                    <li>If the snake length reduces to 1 segment - game over</li>
                    <li>These changes can no longer be reversed!</li>
                </ul>
            </div>
            <div class="rules-key">
                <div class="key-item"><span class="key-color" style="background-color: #4e54c8;"></span> Snake</div>
                <div class="key-item"><span class="key-color" style="background-color: #FF5252;"></span> Food</div>
                <div class="key-item"><span class="key-color" style="background-color: #333;"></span> Obstacle</div>
                <div class="key-item"><span class="key-color" style="background-color: rgba(0, 255, 0, 0.3);"></span> Toxic puddle</div>
            </div>
            <button id="start-insane-btn">I'M READY FOR INSANITY!</button>
        </div>
    `;
    
    // Styles for modal window
    rulesModal.style.position = 'fixed';
    rulesModal.style.top = '0';
    rulesModal.style.left = '0';
    rulesModal.style.width = '100%';
    rulesModal.style.height = '100%';
    rulesModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    rulesModal.style.display = 'flex';
    rulesModal.style.justifyContent = 'center';
    rulesModal.style.alignItems = 'center';
    rulesModal.style.zIndex = '1000';
    
    const rulesContent = rulesModal.querySelector('.rules-content');
    rulesContent.style.backgroundColor = '#222';
    rulesContent.style.color = 'white';
    rulesContent.style.padding = '30px';
    rulesContent.style.borderRadius = '10px';
    rulesContent.style.maxWidth = '500px';
    rulesContent.style.textAlign = 'center';
    rulesContent.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.6)';
    rulesContent.style.border = '2px solid #FF5252';
    
    // Styles for the header
    const h2 = rulesModal.querySelector('h2');
    h2.style.color = '#FF5252';
    h2.style.marginBottom = '20px';
    h2.style.fontWeight = 'bold';
    h2.style.fontSize = '28px';
    
    // Styles for the rules section
    const rulesSection = rulesModal.querySelector('.rules-section');
    rulesSection.style.textAlign = 'left';
    rulesSection.style.marginBottom = '20px';
    
    // Styles for the list
    const list = rulesModal.querySelector('ul');
    list.style.paddingLeft = '20px';
    list.style.marginBottom = '20px';
    
    // Styles for the key
    const rulesKey = rulesModal.querySelector('.rules-key');
    rulesKey.style.display = 'flex';
    rulesKey.style.flexWrap = 'wrap';
    rulesKey.style.justifyContent = 'center';
    rulesKey.style.gap = '15px';
    rulesKey.style.marginBottom = '25px';
    
    // Styles for key elements
    const keyItems = rulesModal.querySelectorAll('.key-item');
    keyItems.forEach(item => {
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '5px';
    });
    
    // Styles for colored squares
    const keyColors = rulesModal.querySelectorAll('.key-color');
    keyColors.forEach(color => {
        color.style.width = '15px';
        color.style.height = '15px';
        color.style.display = 'inline-block';
        color.style.borderRadius = '3px';
    });
    
    // Styles for button
    const startButton = rulesModal.querySelector('#start-insane-btn');
    startButton.style.backgroundColor = '#FF5252';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.padding = '10px 20px';
    startButton.style.borderRadius = '5px';
    startButton.style.cursor = 'pointer';
    startButton.style.fontSize = '16px';
    startButton.style.fontWeight = 'bold';
    startButton.style.marginTop = '10px';
    startButton.style.transition = 'all 0.3s';
    
    startButton.addEventListener('mouseover', () => {
        startButton.style.backgroundColor = '#ff0033';
        startButton.style.transform = 'scale(1.05)';
    });
    
    startButton.addEventListener('mouseout', () => {
        startButton.style.backgroundColor = '#FF5252';
        startButton.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(rulesModal);
    
    // Button handler
    startButton.addEventListener('click', () => {
        rulesModal.remove();
        modalOpen = false; // Reset the modal window flag
        
        // Immediately start the game when you click on the button "I'M READY FOR INSANITY!"
        startGame();
    });
}

// Function to update the kanvas size
function updateCanvasSize() {
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    tileCount = canvasSize / gridSize;
    
    // Обновляем стили
    resizeCanvas();
}

// Game initialization
function initGame() {
    try {
        snake = [];
        snakeLength = 5;
        score = 0;
        dx = gridSize;
        dy = 0;
        
        // Reset direction variables
        lastAppliedDx = dx;
        lastAppliedDy = dy;
        nextDx = dx;
        nextDy = dy;
        directionChanged = false;
        
        // Reset collision flag
        collision = false;
        collisionType = null;
        
        // Clear obstacles and puddles
        obstacles = [];
        puddles = [];
        
        // Clear poison particles
        poisonParticles = [];
        
        // Stop previous puddleTimer if exists
        if (puddleTimer) {
            clearInterval(puddleTimer);
            puddleTimer = null;
        }
        
        // If there is an existing game timer, let's stop it
        if (gameLoop) {
            clearTimeout(gameLoop);
            gameLoop = null;
        }
        
        // Create initial snake
        const startX = Math.floor(tileCount / 2) * gridSize;
        const startY = Math.floor(tileCount / 2) * gridSize;
        
        for (let i = 0; i < snakeLength; i++) {
            snake.push({
                x: startX - i * gridSize,
                y: startY
            });
        }
        
        // Create obstacles and puddles only for insane mode
        if (insaneMode) {
            // Use setTimeout for heavy operations
            setTimeout(() => {
                if (gameRunning) {
                    createObstacles();
                    createPuddles();
                    
                    // Start timer for puddles
                    startPuddleTimer();
                }
            }, 0);
        }
        
        createFood();
        updateScore();
    } catch (error) {
        console.error("Error initializing game:", error);
        // Return the game to its initial state
        gameRunning = false;
        startButton.textContent = 'Start Game';
    }
}

// Creating complex shaped obstacles
function createObstacles() {
    try {
        // Limit the number of obstacles
        const numObstacles = 2;
        const maxAttempts = 50; // Add a limit on the number of attempts
        
        for (let obsIndex = 0; obsIndex < numObstacles; obsIndex++) {
            // Find the starting point for the obstacle
            let startX, startY;
            let validPosition = false;
            let positionAttempts = 0;
            
            while (!validPosition && positionAttempts < maxAttempts) {
                positionAttempts++;
                
                startX = Math.floor(Math.random() * (tileCount - 5)) * gridSize;
                startY = Math.floor(Math.random() * (tileCount - 5)) * gridSize;
                
                validPosition = true;
                
                // Checking that the starting point is not close to the snake
                for (let j = 0; j < snake.length; j++) {
                    const distance = Math.sqrt(
                        Math.pow(snake[j].x - startX, 2) + 
                        Math.pow(snake[j].y - startY, 2)
                    );
                    
                    if (distance < gridSize * 8) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check that the starting point is not close to other obstacles
                if (validPosition) {
                    for (let j = 0; j < obstacles.length; j++) {
                        const distance = Math.sqrt(
                            Math.pow(obstacles[j].x - startX, 2) + 
                            Math.pow(obstacles[j].y - startY, 2)
                        );
                        
                        if (distance < gridSize * 15) {
                            validPosition = false;
                            break;
                        }
                    }
                }
            }
            
            // If we can't find a suitable position, we skip this obstacle
            if (!validPosition) {
                continue;
            }
            
            // Easier obstacles for better performance
            const obstacleBlockCount = 10 + Math.floor(Math.random() * 6);
            const obstacleBlocks = [];
            
            // Adding the first block
            obstacleBlocks.push({x: startX, y: startY});
            
            // Add the remaining blocks connected to existing blocks
            for (let i = 1; i < obstacleBlockCount; i++) {
                let blockAdded = false;
                let attempts = 0;
                const blockMaxAttempts = 30;
                
                while (!blockAdded && attempts < blockMaxAttempts) {
                    attempts++;
                    
                    // Select a random existing block
                    const baseBlock = obstacleBlocks[Math.floor(Math.random() * obstacleBlocks.length)];
                    
                    // Identify possible areas of growth
                    const directions = [
                        {dx: 1, dy: 0},  // вправо
                        {dx: -1, dy: 0}, // влево
                        {dx: 0, dy: 1},  // вниз
                        {dx: 0, dy: -1}  // вверх
                    ];
                    
                    // Stirring directions (faster)
                    const randomDir = Math.floor(Math.random() * 4);
                    [directions[0], directions[randomDir]] = [directions[randomDir], directions[0]];
                    
                    // Trying every direction
                    for (let j = 0; j < directions.length; j++) {
                        const newX = baseBlock.x + directions[j].dx * gridSize;
                        const newY = baseBlock.y + directions[j].dy * gridSize;
                        
                        // Check that the new block is within the field
                        if (newX < 0 || newX >= canvas.width || newY < 0 || newY >= canvas.height) {
                            continue;
                        }
                        
                        // Check that the new block does not overlap with existing blocks
                        let canAdd = true;
                        for (let k = 0; k < obstacleBlocks.length; k++) {
                            if (obstacleBlocks[k].x === newX && obstacleBlocks[k].y === newY) {
                                canAdd = false;
                                break;
                            }
                        }
                        
                        // Simple snake distance test
                        if (canAdd) {
                            const headDist = Math.sqrt(
                                Math.pow(snake[0].x - newX, 2) + 
                                Math.pow(snake[0].y - newY, 2)
                            );
                            
                            if (headDist < gridSize * 5) {
                                canAdd = false;
                            }
                        }
                        
                        // Add a new block
                        if (canAdd) {
                            obstacleBlocks.push({x: newX, y: newY});
                            blockAdded = true;
                            break;
                        }
                    }
                }
                
                // If you can't add the block after several attempts, exit
                if (!blockAdded) {
                    break;
                }
            }
            
            // Add all obstacle blocks to the common array
            for (let i = 0; i < obstacleBlocks.length; i++) {
                obstacles.push(obstacleBlocks[i]);
            }
        }
    } catch (error) {
        console.error("Error creating obstacles:", error);
        // In the event of a mistake, we just create a couple of simple obstacles
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(Math.random() * (tileCount - 5) + 3) * gridSize;
            const y = Math.floor(Math.random() * (tileCount - 5) + 3) * gridSize;
            if (Math.sqrt(Math.pow(snake[0].x - x, 2) + Math.pow(snake[0].y - y, 2)) > gridSize * 5) {
                obstacles.push({x, y});
            }
        }
    }
}

// Creating puddles with complex shapes
function createPuddles() {
    try {
        // Create fewer puddles for better performance
        const numPuddles = 2;
        
        for (let puddleIndex = 0; puddleIndex < numPuddles; puddleIndex++) {
            // Find the starting point for the puddle
            let startX, startY;
            let validPosition = false;
            
            // Trying to find the right position to start the puddle
            let attempts = 0;
            const maxPositionAttempts = 20;
            
            while (!validPosition && attempts < maxPositionAttempts) {
                attempts++;
                
                // Simplified position selection - only within the field
                startX = Math.floor(Math.random() * (tileCount - 6) + 3) * gridSize;
                startY = Math.floor(Math.random() * (tileCount - 6) + 3) * gridSize;
                
                validPosition = true;
                
                // Checking only the snake's head instead of the whole body.
                const headDistance = Math.sqrt(
                    Math.pow(snake[0].x - startX, 2) + 
                    Math.pow(snake[0].y - startY, 2)
                );
                
                if (headDistance < gridSize * 6) {
                    validPosition = false;
                    continue;
                }
                
                // Check that the starting point is not on an obstacle
                for (let j = 0; j < obstacles.length; j++) {
                    if (obstacles[j].x === startX && obstacles[j].y === startY) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Checking that the starting point is not close to other puddles
                if (validPosition && puddles.length > 0) {
                    for (let j = 0; j < puddles.length; j++) {
                        const distance = Math.sqrt(
                            Math.pow(puddles[j].x - startX, 2) + 
                            Math.pow(puddles[j].y - startY, 2)
                        );
                        
                        if (distance < gridSize * 8) {
                            validPosition = false;
                            break;
                        }
                    }
                }
            }
            
            // If you can't find a suitable position, we skip this puddle
            if (!validPosition) {
                continue;
            }
            
            // Generate puddle shape (reduced size)
            const puddleBlockCount = 5 + Math.floor(Math.random() * 4); // 5-8 блоков вместо 10-15
            const puddleBlocks = [];
            
            // Adding the first block
            puddleBlocks.push({x: startX, y: startY});
            
            // Add the remaining blocks connected to existing blocks
            for (let i = 1; i < puddleBlockCount; i++) {
                let blockAdded = false;
                let attempts = 0;
                const maxAttempts = 30;
                
                while (!blockAdded && attempts < maxAttempts) {
                    attempts++;
                    
                    // Select a random existing block
                    const baseBlock = puddleBlocks[Math.floor(Math.random() * puddleBlocks.length)];
                    
                    // Identify possible areas of growth
                    const directions = [
                        {dx: 1, dy: 0},
                        {dx: -1, dy: 0},
                        {dx: 0, dy: 1},
                        {dx: 0, dy: -1}
                    ];
                    
                    // Mixing directions is more efficient
                    const randomDir = Math.floor(Math.random() * 4);
                    [directions[0], directions[randomDir]] = [directions[randomDir], directions[0]];
                    
                    // Trying every direction
                    for (let j = 0; j < directions.length; j++) {
                        const newX = baseBlock.x + directions[j].dx * gridSize;
                        const newY = baseBlock.y + directions[j].dy * gridSize;
                        
                        // Check that the new block is within the field
                        if (newX < 0 || newX >= canvas.width || newY < 0 || newY >= canvas.height) {
                            continue;
                        }
                        
                        // Checking that the new block does not intersect with existing puddles
                        let canAdd = true;
                        for (let k = 0; k < puddleBlocks.length; k++) {
                            if (puddleBlocks[k].x === newX && puddleBlocks[k].y === newY) {
                                canAdd = false;
                                break;
                            }
                        }
                        
                        // Checking that the new unit is not on an obstruction
                        if (canAdd) {
                            for (let k = 0; k < obstacles.length; k++) {
                                if (obstacles[k].x === newX && obstacles[k].y === newY) {
                                    canAdd = false;
                                    break;
                                }
                            }
                        }
                        
                        // Add a new block
                        if (canAdd) {
                            puddleBlocks.push({x: newX, y: newY});
                            blockAdded = true;
                            break;
                        }
                    }
                }
                
                // If you can't add the block after several attempts, exit
                if (!blockAdded) {
                    break;
                }
            }
            
            // Add all puddle blocks to the common array
            for (let i = 0; i < puddleBlocks.length; i++) {
                puddles.push(puddleBlocks[i]);
            }
        }
    } catch (error) {
        console.error("Error creating puddles:", error);
        // In case there's a mistake, we'll add a couple of simple puddles
        for (let i = 0; i < 3; i++) {
            const x = Math.floor(Math.random() * (tileCount - 4) + 2) * gridSize;
            const y = Math.floor(Math.random() * (tileCount - 4) + 2) * gridSize;
            
            // Checking that the puddle is not on an obstacle.
            let canAdd = true;
            for (let j = 0; j < obstacles.length; j++) {
                if (obstacles[j].x === x && obstacles[j].y === y) {
                    canAdd = false;
                    break;
                }
            }
            
            if (canAdd) {
                puddles.push({x, y});
            }
        }
    }
}

// Variables for the effect of slowing down in puddles
let snakeSpeed = 1.0;
let isInPuddle = false;
let poisonParticles = []; // Particles for the poison effect

// Запуск таймера для луж
function startPuddleTimer() {
    puddleTimer = setInterval(() => {
        // Checking to see if there's a snake in the puddle.
        const head = snake[0];
        isInPuddle = false;
        
        for (let i = 0; i < puddles.length; i++) {
            if (head.x === puddles[i].x && head.y === puddles[i].y) {
                isInPuddle = true;
                
                // Отнимаем очки
                score = Math.max(0, score - 10);
                updateScore();

                // Shorten the snake, but not less than 2 segments
                // If there is only 1 segment left - game over
                if (snake.length > 2) {
                    snake.pop();
                } else {
                    // If there are only 2 segments left and we want to reduce more - end of game
                    playCollisionAnimation('poison');
                    return;
                }
                
                // Visual damage effect
                const damage = document.createElement('div');
                damage.className = 'damage-effect';
                damage.textContent = '-10';
                damage.style.position = 'absolute';
                damage.style.top = `${head.y + gridSize / 2}px`;
                damage.style.left = `${head.x + gridSize / 2}px`;
                damage.style.color = '#ff0000';
                damage.style.fontSize = '18px';
                damage.style.fontWeight = 'bold';
                damage.style.textShadow = '0 0 5px black';
                damage.style.zIndex = '100';
                damage.style.pointerEvents = 'none';
                document.body.appendChild(damage);
                
                // Animation of raising and disappearing damage text
                let y = head.y + gridSize / 2;
                const animateDamage = () => {
                    y -= 2;
                    damage.style.top = `${y}px`;
                    damage.style.opacity = parseFloat(damage.style.opacity || 1) - 0.05;
                    
                    if (parseFloat(damage.style.opacity || 1) > 0) {
                        requestAnimationFrame(animateDamage);
                    } else {
                        damage.remove();
                    }
                };
                
                requestAnimationFrame(animateDamage);
                
                // Create an enhanced poisoning effect (more particles)
                createPoisonParticles(head.x, head.y, 12);
                
                break;
            }
        }
    }, 1000);
}

// Function for creating poison effect particles
function createPoisonParticles(x, y, count = 8) {
     // Number of particles (default 8, but can be changed)
    for (let i = 0; i < count; i++) {
        // Random displacement and velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        
        poisonParticles.push({
            x: x + gridSize / 2,
            y: y + gridSize / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3,
            life: 30 + Math.random() * 20, // Particle lifetime
            currentLife: 0
        });
    }
}

// Function for updating and rendering of poisoning particles
function updatePoisonParticles() {
    // Updating the state of the particles
    for (let i = poisonParticles.length - 1; i >= 0; i--) {
        const particle = poisonParticles[i];
        
        // Moving the particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Increase the life meter
        particle.currentLife++;
        
        // Removing particles that have outlived their time
        if (particle.currentLife >= particle.life) {
            poisonParticles.splice(i, 1);
        }
    }
}

// Creating food in a random location
function createFood() {
    function getRandomPosition() {
        return Math.floor(Math.random() * tileCount) * gridSize;
    }
    
    // Set the starting position
    let isValidPosition = false;
    
    while (!isValidPosition) {
        foodX = getRandomPosition();
        foodY = getRandomPosition();
        isValidPosition = true;
        
        // Checking to make sure the food didn't show up on the snake.
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                isValidPosition = false;
                break;
            }
        }
        
        // Check that food has not appeared on the obstacles (only for crazy mode)
        if (isValidPosition && insaneMode) {
            for (let i = 0; i < obstacles.length; i++) {
                if (obstacles[i].x === foodX && obstacles[i].y === foodY) {
                    isValidPosition = false;
                    break;
                }
            }
        }
        
        // Checking that food hasn't appeared on the puddles (only for crazy mode)
        if (isValidPosition && insaneMode) {
            for (let i = 0; i < puddles.length; i++) {
                if (puddles[i].x === foodX && puddles[i].y === foodY) {
                    isValidPosition = false;
                    break;
                }
            }
        }
    }
    
    // If we're in crazy mode, let's make sure we can get to food
    if (insaneMode) {
        // Here, for simplicity, we just check that there is a path without obstacles from the snake to the food
        // In a real application, we can implement a pathfinding algorithm (A* or BFS)

        // If we notice that the game becomes unrealistic due to barriers, we can
        // add more complex logic for checking the reachability
    }
}

// Account update
function updateScore() {
    scoreElement.textContent = score;
    
    // Add animation when increasing the count
    scoreElement.classList.add('score-update');
    setTimeout(() => {
        scoreElement.classList.remove('score-update');
    }, 300);
}

// Game rendering
function drawGame() {

    // Get the current colors depending on the theme
    const themeColors = colors[currentTheme];

    try {
        // Error check
        if (!canvas || !ctx) {
            console.error("Canvas context is not available");
            return;
        }

        // Cleaning the canvas
        ctx.fillStyle = themeColors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Drawing the grid
        ctx.strokeStyle = themeColors.border;
        ctx.lineWidth = 0.5;

        for (let i = 0; i < tileCount; i++) {
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();

            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
        }

        if (!gameRunning) {
            const gameSettings = document.getElementById('game-settings');
            // Do not draw a header if the settings are visible
            if (gameSettings && gameSettings.style.display !== 'none') {
                return;
            }

            // Draw “Snake Game” on the start screen.
            ctx.fillStyle = themeColors.snakeHead;
            ctx.font = 'bold 30px Roboto';
            ctx.textAlign = 'center';
            ctx.fillText('Snake Game', canvas.width / 2, canvas.height / 2 - 30);

            // Drawing a clue
            ctx.fillStyle = themeColors.snakeBody;
            ctx.font = '16px Roboto';
            ctx.fillText('Press "Start Game"', canvas.width / 2, canvas.height / 2 + 10);
            return;
        }
    } catch (error) {
        console.error("An error occurred during the drawGame process:", error);
    }
        
    // Drawing of food (apple)
    ctx.fillStyle = themeColors.food;
    ctx.beginPath();
    ctx.arc(foodX + gridSize / 2, foodY + gridSize / 2, gridSize / 2 - 1, 0, Math.PI * 2);
    ctx.fill();

    // Adding the cuttings to the apple
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(foodX + gridSize / 2 - 1, foodY + 3, 2, 5);
    
    // Obstacle drawing (only for crazy mode)
    if (insaneMode) {
        // Determine colors for obstacles based on the theme
        let obstacleColor, obstacleInnerColor;
        
        if (currentTheme === 'dark') {
            obstacleColor = '#666'; // Lighter for a darker theme
            obstacleInnerColor = '#444';
        } else {
            obstacleColor = '#333';
            obstacleInnerColor = '#222';
        }
        
        // Drawing obstacles
        ctx.fillStyle = obstacleColor;
        for (let i = 0; i < obstacles.length; i++) {
            ctx.fillRect(obstacles[i].x, obstacles[i].y, gridSize, gridSize);
            
            // Adding a pattern for the obstacles
            ctx.fillStyle = obstacleInnerColor;
            ctx.fillRect(obstacles[i].x + 3, obstacles[i].y + 3, gridSize - 6, gridSize - 6);
            ctx.fillStyle = obstacleColor;
        }
        
        // Drawing puddles
        for (let i = 0; i < puddles.length; i++) {
            // Create a gradient effect for puddles
            const gradient = ctx.createRadialGradient(
                puddles[i].x + gridSize / 2, puddles[i].y + gridSize / 2, 0,
                puddles[i].x + gridSize / 2, puddles[i].y + gridSize / 2, gridSize
            );
            gradient.addColorStop(0, 'rgba(0, 255, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 180, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(puddles[i].x + gridSize / 2, puddles[i].y + gridSize / 2, gridSize * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            // Add acid effects in puddles
            ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
            const bubbleOffset = (Date.now() % 1000) / 1000; // Для анимации
            ctx.beginPath();
            ctx.arc(puddles[i].x + gridSize * 0.3, puddles[i].y + gridSize * (0.3 + bubbleOffset * 0.2), 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(puddles[i].x + gridSize * 0.7, puddles[i].y + gridSize * (0.6 - bubbleOffset * 0.2), 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Add a “reflection” effect to a puddle
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(
                puddles[i].x + gridSize / 2, 
                puddles[i].y + gridSize / 2, 
                gridSize * 0.5, 
                gridSize * 0.2, 
                0, 0, Math.PI * 2
            );
            ctx.stroke();
        }
        
        // Drawing of the poison particles
        ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
        for (let i = 0; i < poisonParticles.length; i++) {
            const particle = poisonParticles[i];
            const alpha = 1 - (particle.currentLife / particle.life); // Transparency decreases over time
            
            ctx.fillStyle = `rgba(0, 255, 0, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Drawing a snake
    for (let i = 0; i < snake.length; i++) {
        // Use different colors for the head and body
        if (i === 0) {
            ctx.fillStyle = themeColors.snakeHead;
        } else {
            ctx.fillStyle = themeColors.snakeBody;
        }
        
        // Create a snake segment with rounded corners
        ctx.beginPath();
        ctx.roundRect(snake[i].x, snake[i].y, gridSize - 1, gridSize - 1, [5]);
        ctx.fill();
        
        // Add eyes for the snake's head
        if (i === 0) {
            ctx.fillStyle = 'white';
            
            // Determining the position of the eyes depending on the direction of travel
            let eyeX1, eyeY1, eyeX2, eyeY2;
            const eyeSize = 3;
            const eyeOffset = 4;
            
            if (dx > 0) { // To the right
                eyeX1 = snake[i].x + gridSize - eyeOffset;
                eyeY1 = snake[i].y + eyeOffset;
                eyeX2 = snake[i].x + gridSize - eyeOffset;
                eyeY2 = snake[i].y + gridSize - eyeOffset;
            } else if (dx < 0) { // To the left
                eyeX1 = snake[i].x + eyeOffset;
                eyeY1 = snake[i].y + eyeOffset;
                eyeX2 = snake[i].x + eyeOffset;
                eyeY2 = snake[i].y + gridSize - eyeOffset;
            } else if (dy > 0) { // Down
                eyeX1 = snake[i].x + eyeOffset;
                eyeY1 = snake[i].y + gridSize - eyeOffset;
                eyeX2 = snake[i].x + gridSize - eyeOffset;
                eyeY2 = snake[i].y + gridSize - eyeOffset;
            } else { // Up
                eyeX1 = snake[i].x + eyeOffset;
                eyeY1 = snake[i].y + eyeOffset;
                eyeX2 = snake[i].x + gridSize - eyeOffset;
                eyeY2 = snake[i].y + eyeOffset;
            }
            
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
            ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Apply the following direction if it has been changed
    if (directionChanged) {
        dx = nextDx;
        dy = nextDy;
        directionChanged = false;
    }

    // Memorize the applied direction
    lastAppliedDx = dx;
    lastAppliedDy = dy;

    // Move the snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Food collision check
    if (head.x === foodX && head.y === foodY) {
        score += 10;
        updateScore();
        createFood();
        // The effect of eating food
        playEatEffect(head.x, head.y);
        // Increase the speed after every 50 points.
        if (score % 50 === 0) {
            speed += 1;
        }
    } else {
        snake.pop();
    }

    // Check for collision with a wall or movement through a wall
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        if (wallsMode) {
            // Mode with walls - collision leads to the end of the game
            playCollisionAnimation('wall');
            return;
        } else {
            // Mode without walls - move to the opposite side
            if (head.x < 0) {
                head.x = canvas.width - gridSize;
            } else if (head.x >= canvas.width) {
                head.x = 0;
            }
            
            if (head.y < 0) {
                head.y = canvas.height - gridSize;
            } else if (head.y >= canvas.height) {
                head.y = 0;
            }

            // Update the head position in the snake array
            snake[0] = head;
        }
    }

    // Self-collision check
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            playCollisionAnimation('self');
            return;
        }
    }

    // Check for collision with obstacles (only for crazy mode)
    if (insaneMode) {
        for (let i = 0; i < obstacles.length; i++) {
            if (head.x === obstacles[i].x && head.y === obstacles[i].y) {
                playCollisionAnimation('obstacle');
                return;
            }
        }
    }

    // Check if the snake is in the puddle.
    isInPuddle = false;
    for (let i = 0; i < puddles.length; i++) {
        if (head.x === puddles[i].x && head.y === puddles[i].y) {
            isInPuddle = true;

            // If the snake is in a puddle, create a poison bubble effect
            if (Math.random() < 0.2) { // 20% chance to create particles on every upgrade

                createPoisonParticles(head.x, head.y);
            }
            break;
        }
    }

    // Set the speed depending on whether we are in a puddle.
    if (isInPuddle) {
        snakeSpeed = 0.5; // Slow down by 50%
    } else {
        snakeSpeed = 1.0; // Normal speed
    }

    // Update the particles
    updatePoisonParticles();

    // Continue the game cycle taking into account the speed
    if (gameLoop) {
        clearTimeout(gameLoop);
    }

    // Use requestAnimationFrame and setTimeout for more reliable operation
    if (gameRunning) {
        gameLoop = setTimeout(() => {
                try {
                    if (gameRunning) {
                        requestAnimationFrame(drawGame);
                    }
                } catch (error) {
                    console.error("Error in game loop:", error);
                } finally {
                    console.log("Game loop execution ended");
                }
        }, 1000 / (speed * snakeSpeed));
    }
}

// The effect of eating food
function playEatEffect(x, y) {
    const themeColors = colors[currentTheme];

    // Animation of a circle diverging from the eating place
    let radius = 5;
    const maxRadius = 30;
    const animationSpeed = 2;
    
    function drawCircle() {
        ctx.beginPath();
        ctx.arc(x + gridSize / 2, y + gridSize / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = themeColors.food;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        radius += animationSpeed;
        
        if (radius < maxRadius) {
            requestAnimationFrame(drawCircle);
        }
    }
    
    drawCircle();

    // Additional effects for crazy mode
    if (speed === SPEED_INSANE) {
        // Random flashes on the screen
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // An additional sound effect can be added if required
        // Or background flashing
        setTimeout(() => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }, 50);

        // Return to normal view
        setTimeout(() => {
            drawGame();
        }, 100);
    }
}

// Variable for collision tracking
let collision = false;
let collisionType = null;

// Save the original snake for the collision animation
let originalSnake = [];

// Collision animation function
function playCollisionAnimation(type) {
    // Stop the game
    gameRunning = false;
    
    if (gameLoop) {
        clearTimeout(gameLoop);
        gameLoop = null;
    }

    // Stop the timer for puddles
    if (puddleTimer) {
        clearInterval(puddleTimer);
        puddleTimer = null;
    }

    // Set collision flag
    collision = true;
    collisionType = type;

    // Save a copy of the current snake
    originalSnake = JSON.parse(JSON.stringify(snake));

    // Get the theme colors
    const themeColors = colors[currentTheme];

    // Show collision animation
    let flashCount = 0;
    const maxFlashes = 6;
    let flashTimer;

    // Use setTimeout to avoid freezing
    setTimeout(() => {
        function flashAnimation() {
            try {
                // Clear the previous timer
                if (flashTimer) clearTimeout(flashTimer);

                // If the maximum number of blinks is reached, show the end of game message.
                if (flashCount >= maxFlashes) {
                    gameOver();
                    return;
                }

                // Clean the canvas
                ctx.fillStyle = themeColors.background;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw the grid
                ctx.strokeStyle = themeColors.border;
                ctx.lineWidth = 0.5;
                
                for (let i = 0; i < tileCount; i++) {
                    ctx.beginPath();
                    ctx.moveTo(0, i * gridSize);
                    ctx.lineTo(canvas.width, i * gridSize);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(i * gridSize, 0);
                    ctx.lineTo(i * gridSize, canvas.height);
                    ctx.stroke();
                }

                // Drawing obstacles and puddles for crazy mode
                if (insaneMode) {
                    // Obstacle Drawing
                    for (let i = 0; i < obstacles.length; i++) {
                        // Illuminate the obstacle we encountered
                        if (type === 'obstacle' && 
                            originalSnake[0].x === obstacles[i].x && 
                            originalSnake[0].y === obstacles[i].y) {
                            
                            if (flashCount % 2 === 0) {
                                ctx.fillStyle = '#FF5252'; // Red illumination for the obstacle
                            } else {
                                ctx.fillStyle = '#333';
                            }
                        } else {
                            ctx.fillStyle = '#333';
                        }
                        
                        ctx.fillRect(obstacles[i].x, obstacles[i].y, gridSize, gridSize);
                        
                        // Adding a pattern for the obstacles
                        ctx.fillStyle = '#222';
                        ctx.fillRect(obstacles[i].x + 3, obstacles[i].y + 3, gridSize - 6, gridSize - 6);
                    }

                    // Drawing puddles
                    for (let i = 0; i < puddles.length; i++) {
                        const gradient = ctx.createRadialGradient(
                            puddles[i].x + gridSize / 2, puddles[i].y + gridSize / 2, 0,
                            puddles[i].x + gridSize / 2, puddles[i].y + gridSize / 2, gridSize
                        );
                        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.5)');
                        gradient.addColorStop(1, 'rgba(0, 180, 0, 0)');
                        
                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.arc(puddles[i].x + gridSize / 2, puddles[i].y + gridSize / 2, gridSize * 0.8, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Define the color for the current animation frame
                let snakeColor;
                if (flashCount % 2 === 0) {
                    // Red color for even frames
                    snakeColor = '#FF5252';
                } else {
                    // Normal snake color for odd frames
                    snakeColor = null;
                }

                // Drawing the snake
                for (let i = 0; i < originalSnake.length; i++) {
                    if (snakeColor) {
                        ctx.fillStyle = snakeColor;
                    } else {
                        if (i === 0) {
                            ctx.fillStyle = themeColors.snakeHead;
                        } else {
                            ctx.fillStyle = themeColors.snakeBody;
                        }
                    }
                    
                    ctx.beginPath();
                    ctx.roundRect(originalSnake[i].x, originalSnake[i].y, gridSize - 1, gridSize - 1, [5]);
                    ctx.fill();

                    // Add eyes for the head (only for odd frames)
                    if (i === 0 && !snakeColor) {
                        ctx.fillStyle = 'white';
                        
                        let eyeX1, eyeY1, eyeX2, eyeY2;
                        const eyeSize = 3;
                        const eyeOffset = 4;
                        
                        if (dx > 0) { // To the right
                            eyeX1 = originalSnake[i].x + gridSize - eyeOffset;
                            eyeY1 = originalSnake[i].y + eyeOffset;
                            eyeX2 = originalSnake[i].x + gridSize - eyeOffset;
                            eyeY2 = originalSnake[i].y + gridSize - eyeOffset;
                        } else if (dx < 0) { // To the left
                            eyeX1 = originalSnake[i].x + eyeOffset;
                            eyeY1 = originalSnake[i].y + eyeOffset;
                            eyeX2 = originalSnake[i].x + eyeOffset;
                            eyeY2 = originalSnake[i].y + gridSize - eyeOffset;
                        } else if (dy > 0) { // Down
                            eyeX1 = originalSnake[i].x + eyeOffset;
                            eyeY1 = originalSnake[i].y + gridSize - eyeOffset;
                            eyeX2 = originalSnake[i].x + gridSize - eyeOffset;
                            eyeY2 = originalSnake[i].y + gridSize - eyeOffset;
                        } else { // Up
                            eyeX1 = originalSnake[i].x + eyeOffset;
                            eyeY1 = originalSnake[i].y + eyeOffset;
                            eyeX2 = originalSnake[i].x + gridSize - eyeOffset;
                            eyeY2 = originalSnake[i].y + eyeOffset;
                        }
                        
                        ctx.beginPath();
                        ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
                        ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Illuminate the wall when colliding with it (only for even frames)
                if (type === 'wall' && flashCount % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 82, 82, 0.5)';
                    const head = originalSnake[0];
                    
                    if (head.x < 0) { // Left wall
                        ctx.fillRect(0, 0, gridSize, canvas.height);
                    } else if (head.x >= canvas.width) { // Right wall
                        ctx.fillRect(canvas.width - gridSize, 0, gridSize, canvas.height);
                    } else if (head.y < 0) { // Upper wall
                        ctx.fillRect(0, 0, canvas.width, gridSize);
                    } else if (head.y >= canvas.height) { // Lower wall
                        ctx.fillRect(0, canvas.height - gridSize, canvas.width, gridSize);
                    }
                }

                // Effects for crazy mode
                if (insaneMode && flashCount % 2 === 0) {
                    // Add screen shake effect
                    const shakeAmount = 5;
                    const offsetX = Math.random() * shakeAmount - shakeAmount / 2;
                    const offsetY = Math.random() * shakeAmount - shakeAmount / 2;
                    
                    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                } else {
                    canvas.style.transform = 'translate(0, 0)';
                }
                
                flashCount++;
                // Next animation frame using requestAnimationFrame instead of setTimeout
                // for smoother animation and less chance of freezing
                if (flashCount < maxFlashes) {
                    flashTimer = setTimeout(flashAnimation, 200);
                } else {
                    gameOver();
                }
            } catch (error) {
                console.error("Error in flash animation:", error);
                // In case of an error, stop the animation and show the end of the game
                gameOver();
            }
        }

        // Start the animation
        flashAnimation();
    }, 0);
}

// The last direction that has been applied
let lastAppliedDx = 0;
let lastAppliedDy = 0;
// Next direction awaiting application
let nextDx = 0;
let nextDy = 0;
// Flag indicating whether the direction has been changed in the current cycle
let directionChanged = false;

// Keystroke handler
function changeDirection(e) {
    const key = e.key || e.dataset?.key;

    // Check current movement (lastAppliedDx/Dy, not dx/dy)
    // to avoid 180 degree turns
    if ((key === 'ArrowUp' || key === 'w' || key === 'W') && lastAppliedDy === 0) {
        nextDx = 0;
        nextDy = -gridSize;
        directionChanged = true;
    } else if ((key === 'ArrowDown' || key === 's' || key === 'S') && lastAppliedDy === 0) {
        nextDx = 0;
        nextDy = gridSize;
        directionChanged = true;
    } else if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && lastAppliedDx === 0) {
        nextDx = -gridSize;
        nextDy = 0;
        directionChanged = true;
    } else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && lastAppliedDx === 0) {
        nextDx = gridSize;
        nextDy = 0;
        directionChanged = true;
    }
}

// Processing of arrow button presses
arrowButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Check that the modal window is not open and there is no collision
        if (modalOpen || collision) return;
        
        if (!gameRunning) {
            startGame();
        }
        
        if (gameRunning && keyPressAllowed) {
            changeDirection({dataset: this.dataset});
            keyPressAllowed = false;

            // Reset the restriction after a short time
            clearTimeout(keyPressTimeout);
            keyPressTimeout = setTimeout(() => {
                keyPressAllowed = true;
            }, 50);
        }
    });
});

// Variable for tracking whether the modal window is open or not
let modalOpen = false;

// Game over
function gameOver() {
    gameRunning = false;

    // Stop all timers
    if (gameLoop) {
        clearTimeout(gameLoop);
        gameLoop = null;
    }
    
    startButton.textContent = 'Restart Game';
    
    // Show settings again when game ends
    const gameSettings = document.getElementById('game-settings');
    gameSettings.style.display = 'flex';
    
    // If modal window is already open, don't create a new one
    if (modalOpen) return;

    // Use setTimeout to avoid hangs.
    setTimeout(() => {
        modalOpen = true;
        
        // Create modal window instead of alert
        const modal = document.createElement('div');
        modal.id = 'game-over-modal';
        modal.className = 'game-over-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Game Over!</h2>
                <p>Your score: <span class="final-score">${score}</span></p>
                <p class="game-mode-info">
                    ${wallsMode ? 'Mode: with walls' : 'Mode: no walls'} | 
                    Speed: ${
                        speed === SPEED_SLOW ? 'slow' : 
                        speed === SPEED_MEDIUM ? 'medium' : 
                        speed === SPEED_FAST ? 'fast' : 'INSANE'
                    }
                    ${insaneMode ? '🔥' : ''}
                </p>
                ${insaneMode ? `<p class="death-reason">Cause of death: ${
                    collisionType === 'self' ? 'collision with self' :
                    collisionType === 'wall' ? 'collision with wall' :
                    collisionType === 'obstacle' ? 'collision with obstacle' :
                    collisionType === 'poison' ? 'severe poisoning' : 'unknown'
                }</p>` : ''}
                <button id="close-modal">OK</button>
            </div>
        `;
        document.body.appendChild(modal);

        // Closing the modal window
        const closeButton = document.getElementById('close-modal');
        closeButton.onclick = closeModal;

        // Also close by clicking outside the modal window
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Closing by Escape or Enter key
        document.addEventListener('keydown', handleModalKeyPress);
    }, 0);

    // Add styles for the modal window, only if they don't exist yet
    if (!document.getElementById('modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .game-over-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .modal-content {
                background-color: var(--container-bg);
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
            }
            
            .modal-content h2 {
                color: var(--primary-color);
                margin-bottom: 15px;
            }
            
            .final-score {
                color: var(--accent-color);
                font-weight: bold;
                font-size: 24px;
            }
            
            .game-mode-info {
                color: var(--text-color);
                margin-top: 5px;
                font-style: italic;
                opacity: 0.8;
            }
            
            .death-reason {
                margin-top: 10px;
                color: #FF5252;
                font-weight: bold;
                font-size: 16px;
            }
            
            #close-modal {
                background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                color: white;
                border: none;
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
                border-radius: 30px;
                margin-top: 20px;
                min-width: 100px;
            }
            
            #close-modal:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(78, 84, 200, 0.4);
            }
            
            #close-modal:active {
                transform: translateY(1px);
                box-shadow: 0 2px 6px rgba(78, 84, 200, 0.3);
            }
            
            .score-update {
                animation: pulse 0.3s ease-in-out;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Function for closing the modal window
function closeModal() {
    const modal = document.getElementById('game-over-modal');
    if (modal) {
        modal.remove();
        modalOpen = false;

        // Reset the collision flag so we can start a new game
        collision = false;
        collisionType = null;

        // Remove the key handler when closing the modal window
        document.removeEventListener('keydown', handleModalKeyPress);
    }
}

// Keystroke handler for modal window
function handleModalKeyPress(e) {
    if (e.key === 'Escape' || e.key === 'Enter') {
        closeModal();
        // Prevent the game from starting when you press Enter
        e.preventDefault();
        e.stopPropagation();
    }
}

// Start game
function startGame() {
    // Check that the game is not running yet and there are no open modal windows
    if (gameRunning || modalOpen) {
        return;
    }
    
    console.log("Starting game...");

    // Hide settings at game startup
    const gameSettings = document.getElementById('game-settings');
    if (gameSettings) {
        gameSettings.style.display = 'none';
    }

    // Update the button
    startButton.textContent = 'Game in progress...';
    startButton.classList.add('btn-pressed');

    // Set the flag that the game is running
    gameRunning = true;

    // Initialize the game (without complicated calculations for obstacles)
    snake = [];
    snakeLength = 5;
    score = 0;
    dx = gridSize;
    dy = 0;
    
    // Reset direction variables
    lastAppliedDx = dx;
    lastAppliedDy = dy;
    nextDx = dx;
    nextDy = dy;
    directionChanged = false;
    
    // Reset collision flag
    collision = false;
    collisionType = null;
    
    // Clear obstacles and puddles
    obstacles = [];
    puddles = [];
    
    // Clear poison particles
    poisonParticles = [];
    
    // Stop previous puddleTimer if exists
    if (puddleTimer) {
        clearInterval(puddleTimer);
        puddleTimer = null;
    }

    // If there is an existing game timer, stop it
    if (gameLoop) {
        clearTimeout(gameLoop);
        gameLoop = null;
    }
    
    // Create initial snake
    const startX = Math.floor(tileCount / 2) * gridSize;
    const startY = Math.floor(tileCount / 2) * gridSize;
    
    for (let i = 0; i < snakeLength; i++) {
        snake.push({
            x: startX - i * gridSize,
            y: startY
        });
    }

    // Creating food
    createFood();

    // Update the account
    updateScore();

    // Draw the game
    drawGame();

    // Start creating obstacles and puddles in the background for insane mode
    if (insaneMode) {
        setTimeout(() => {
            if (gameRunning) {
                createObstacles();
                createPuddles();
                startPuddleTimer();
            }
        }, 100);
    }

    // Remove the button animation
    setTimeout(() => {
        startButton.classList.remove('btn-pressed');
    }, 200);
}

// Variable to limit the frequency of key press processing
let keyPressAllowed = true;
let keyPressTimeout = null;

// Event listeners
document.addEventListener('keydown', function(e) {
    // Check that modal window is not open and there is no collision
    if (modalOpen || collision) return;
    
    // Check that a control key is pressed
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        // Start the game if it's not running yet and a control key is pressed
        if (!gameRunning) {
            startGame();
        }
        
        // Limit the frequency of key presses to prevent "double turns"
        if (keyPressAllowed) {
            changeDirection(e);
            keyPressAllowed = false;
            
            // Reset the limitation after a short time to process the direction change
            clearTimeout(keyPressTimeout);
            keyPressTimeout = setTimeout(() => {
                keyPressAllowed = true;
            }, 50); // 50ms should be enough to avoid "double turns" when quickly pressing keys
        }
    }
});

startButton.addEventListener('click', function() {
    // Check that collision animation is not running
    if (collision) return;
    startGame();
});

// Add styles for button animation
const btnAnimation = document.createElement('style');
btnAnimation.textContent = `
    .btn-pressed {
        transform: scale(0.95);
        opacity: 0.9;
    }
`;
document.head.appendChild(btnAnimation);

// Adapt canvas size when window size changes and update tooltip
function resizeCanvas() {
    // Save the aspect ratio of the canvas
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth - 50; // Take into account padding

    // Customize the canvas size depending on the device and mode
    let canvasDisplaySize;
    
    if (window.innerWidth <= 768) {
        // On mobile devices, the canvas is full width
        canvasDisplaySize = containerWidth;
    } else {
        // On the desktop, the kanvas can be larger in crazy mode
        canvasDisplaySize = containerWidth;

        // Limit the maximum display size on the desktop
        if (canvasDisplaySize > 450) {
            canvasDisplaySize = 450;
        }
    }

    // Set styles for canvas
    canvas.style.width = canvasDisplaySize + 'px';
    canvas.style.height = canvasDisplaySize + 'px';

    // Update the tooltip text depending on the device
    const infoText = document.querySelector('.info');
    if (window.innerWidth <= 768) {
        infoText.textContent = 'Use the arrow buttons to control the snake';
    } else {
        infoText.textContent = 'Use the arrows on your keyboard to control the snake';
    }

    // Add crazy mode indicator if it is active
    if (insaneMode) {
        if (!document.querySelector('.insane-indicator')) {
            const insaneIndicator = document.createElement('div');
            insaneIndicator.className = 'insane-indicator';
            insaneIndicator.textContent = '🔥 INSANE 🔥';
            insaneIndicator.style.position = 'absolute';
            insaneIndicator.style.top = '5px';
            insaneIndicator.style.left = '50%';
            insaneIndicator.style.transform = 'translateX(-50%)';
            insaneIndicator.style.color = '#FF5252';
            insaneIndicator.style.fontWeight = 'bold';
            insaneIndicator.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
            insaneIndicator.style.zIndex = '10';
            container.appendChild(insaneIndicator);
        }
    } else {
        const insaneIndicator = document.querySelector('.insane-indicator');
        if (insaneIndicator) {
            insaneIndicator.remove();
        }
    }

    // Redraw the game
    drawGame();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Initial rendering of the game
drawGame();
