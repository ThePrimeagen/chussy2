// Game Configuration
const GAME_CONFIG = {
    MAP_SIZE: { width: 32, height: 32 },
    TILE_SIZE: 32,
    PLAYER_SPEED: 0.2,
    ENEMY_SPEED: 2,
    SPAWN_INTERVAL: 2000,
    PATHFINDING: {
        MAX_PATH_LENGTH: 100,
        DIAGONAL_COST: 1.4,
        STRAIGHT_COST: 1
    },
    SOUND_EFFECTS: {
        // Base64 encoded short beep sound
        GUNSHOT: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' 
    }
};

// Initialize game state with type safety
const state = {
    player: {
        x: GAME_CONFIG.MAP_SIZE.width * GAME_CONFIG.TILE_SIZE / 2,
        y: GAME_CONFIG.MAP_SIZE.height * GAME_CONFIG.TILE_SIZE / 2,
        // Ensure all required properties are initialized
        health: 100,
        coins: 0,
        angle: 0,
        velocity: { x: 0, y: 0 },
        acceleration: 0.3,
        friction: 0.85,
        maxSpeed: 4,
        sprintMultiplier: 1.6,
        turnSpeed: 0.08,
        sprite: new Image(),
        lastShot: 0,
        shootCooldown: 250,
        angle: 0,
        velocity: { x: 0, y: 0 },
        acceleration: 0.3,
        friction: 0.85,
        maxSpeed: 4, // Reduced for better control
        sprintMultiplier: 1.6,
        turnSpeed: 0.08,
        sprite: new Image(),
        coins: 0,
        health: 100
    },
    map: {
        tiles: Array(GAME_CONFIG.MAP_SIZE.height).fill().map(() => 
            Array(GAME_CONFIG.MAP_SIZE.width).fill(0)
        ),
        width: GAME_CONFIG.MAP_SIZE.width,
        height: GAME_CONFIG.MAP_SIZE.height
    },
    enemies: [],
    projectiles: [],
    coins: [],
    lastStrobeTime: Date.now(),
    currentShadowColor: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`,
    keys: {
        forward: false,
        backward: false,
        turnLeft: false,
        turnRight: false,
        strafeLeft: false,
        strafeRight: false,
        sprint: false,
        shoot: false
    },
    sounds: {
        gunshot: new Audio(GAME_CONFIG.SOUND_EFFECTS.GUNSHOT)
    }
};

// Canvas initialization with error handling
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error('Failed to find gameCanvas element');
    throw new Error('Canvas initialization failed');
}
const ctx = canvas.getContext('2d');
if (!ctx) {
    console.error('Failed to get 2D context');
    throw new Error('Context initialization failed');
}

// Set canvas size to match map size
canvas.width = GAME_CONFIG.MAP_SIZE.width * GAME_CONFIG.TILE_SIZE;
canvas.height = GAME_CONFIG.MAP_SIZE.height * GAME_CONFIG.TILE_SIZE;

// Ładowanie zasobów
const MUSTACHE_SPRITE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKUSURBVFiF7ZdNaBNBFMd/s9mkTWqSJk1JW7QqVkWkKB5E/LiIBz0IHhQP4smDFBE96NGDiCBeRPCgICIePCh4EDyJKCLiQaqCn1Vr1TaxX2natGmbNLvjYZNQapKNwYvgf9h9M/P+v5n3ZnYXYmJiYmJi/jFCVJGxgQutLqt1QEF0KKDVg9MBhgaGBgt+0F0Q8MHrg4U5WJiHOQ/4QqJnGXwB8C/7cblcRQKaptWsr6tpQwfg9kDfEehsg+5OaG8Fu6263vRnmPLAu0/w8j28eAsTn8DnD4VFUcxqmhbUdd0kSZJRIVAUBYfDEVHsdMDxI3DyGBzYA4oSWby1GY7sgxMDkJmHp6/h0XOYmQNVVc2qqpbVxWAwGNzc3KxrmsZGxe6dMD4Kj27A+cHw4rXY2QaXhmFqAq4OQ0dbKLZly5b1/0QgEMDpdEYU7+2Gx7fg7jXY01V//M52uH8dHt6E/T3rx202W1ldVVUxm81/JGDRYP8eePcE7l2HzraNz7OrA+5ehwf5cPZQyJvNZkRRLBNQFAWLxVJ3YLMZTh+HyXG4NQItTRvPvxaXE26PwtvHcG4QrFYriqKU1SVJQpblugI2K1wcgk9P4MoFaLJvbvHvabLDtQswPQ6XhsFmtSLLMoqilAkEg0Hs9sgXpd0Gly/A7DhcPgeODSxc9/PrAq4Mw+cJuDgEDrsNWZYJBoNldUmSEASh7gQAkoNw/Qh8fR7e5/U2YiP6jXDqIPyYhLPHQRAEJEkqq5tMJrxeL4ZhRJ6gqRFujMBMBvp6N79wbxdkH8KFDDA0UPf5EEURn8+HYRhlAoqiYLVasVgsUcVNDZAIL7jxb0IQBERRxOfzoes6APJvjT9e8/8RQRBQVZVAIABALBATExMT8z/zC1vqIVMI2EIJAAAAAElFTkSuQmCC';
const CHEESE_SPRITE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGUlEQVQYV2P8z8Dwn4EAYBxVQEgBNs0gDQBn4gQJE+ZTogAAAABJRU5ErkJggg==';

state.player.sprite.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGUlEQVQYV2NkYGD4z4AHMP7//x8/BYyjAQCmBQYNBzg8PQAAAABJRU5ErkJggg==';

function spawnEnemy() {
    // Ensure enemies array exists
    state.enemies = state.enemies || [];
    
    // Find valid spawn location near edges
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    
    do {
        switch(edge) {
            case 0: x = Math.floor(Math.random() * (state.map.width - 2) + 1) * GAME_CONFIG.TILE_SIZE; y = GAME_CONFIG.TILE_SIZE; break;
            case 1: x = (state.map.width - 2) * GAME_CONFIG.TILE_SIZE; y = Math.floor(Math.random() * (state.map.height - 2) + 1) * GAME_CONFIG.TILE_SIZE; break;
            case 2: x = Math.floor(Math.random() * (state.map.width - 2) + 1) * GAME_CONFIG.TILE_SIZE; y = (state.map.height - 2) * GAME_CONFIG.TILE_SIZE; break;
            case 3: x = GAME_CONFIG.TILE_SIZE; y = Math.floor(Math.random() * (state.map.height - 2) + 1) * GAME_CONFIG.TILE_SIZE; break;
        }
    } while (state.map.tiles[Math.floor(y / GAME_CONFIG.TILE_SIZE)][Math.floor(x / GAME_CONFIG.TILE_SIZE)] === 1);
    const mustacheEnemy = new Image();
    mustacheEnemy.src = MUSTACHE_SPRITE;
    state.enemies.push({ 
        x, 
        y, 
        speed: 3,
        sprite: mustacheEnemy,
        catchphrase: ["MUSTACHE POWER!", "FEAR THE 'STACHE!", "MUSTACHE ATTACK!", "BEHOLD MY GLORIOUS MUSTACHE!"][Math.floor(Math.random() * 4)]
    });
}

function spawnCoin() {
    // Ensure coins array exists
    state.coins = state.coins || [];
    
    // Find valid spawn location (not in a wall)
    let x, y;
    do {
        x = Math.floor(Math.random() * (state.map.width - 2) + 1);
        y = Math.floor(Math.random() * (state.map.height - 2) + 1);
    } while (state.map.tiles[y][x] === 1);
    
    state.coins.push({
        x: x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
        y: y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2
    });
}

// A* pathfinding helpers
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(pos) {
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
        return [];
    }
    
    const neighbors = [];
    const directions = [
        {x: 0, y: -1}, {x: 1, y: 0}, 
        {x: 0, y: 1}, {x: -1, y: 0}
    ];
    
    for (const dir of directions) {
        const newX = pos.x + dir.x;
        const newY = pos.y + dir.y;
        
        if (newX >= 0 && newX < state.map.width &&
            newY >= 0 && newY < state.map.height &&
            !state.map.tiles[newY][newX]) {
            neighbors.push({x: newX, y: newY});
        }
    }
    
    return neighbors;
}

function findPath(start, end) {
    if (!start || !end || 
        typeof start.x !== 'number' || typeof start.y !== 'number' ||
        typeof end.x !== 'number' || typeof end.y !== 'number') {
        return null;
    }
    
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = `${start.x},${start.y}`;
    const endKey = `${end.x},${end.y}`;
    
    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(start, end));
    
    while (openSet.length > 0) {
        let current = openSet[0];
        let currentKey = `${current.x},${current.y}`;
        let lowestF = fScore.get(currentKey);
        
        for (let i = 1; i < openSet.length; i++) {
            const key = `${openSet[i].x},${openSet[i].y}`;
            if (fScore.get(key) < lowestF) {
                current = openSet[i];
                currentKey = key;
                lowestF = fScore.get(key);
            }
        }
        
        if (currentKey === endKey) {
            const path = [];
            let curr = current;
            while (cameFrom.has(`${curr.x},${curr.y}`)) {
                path.unshift(curr);
                curr = cameFrom.get(`${curr.x},${curr.y}`);
            }
            return path;
        }
        
        openSet.splice(openSet.indexOf(current), 1);
        
        for (const neighbor of getNeighbors(current)) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            const tentativeG = gScore.get(currentKey) + GAME_CONFIG.PATHFINDING.STRAIGHT_COST;
            
            if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeG);
                fScore.set(neighborKey, tentativeG + heuristic(neighbor, end));
                
                if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
        }
    }
    
    return null;
}

function updateGame() {
    // Update enemy positions to chase player using pathfinding
    if (state.enemies && Array.isArray(state.enemies)) {
        state.enemies.forEach(enemy => {
            if (!enemy || typeof enemy.x !== 'number' || typeof enemy.y !== 'number' || !enemy.speed) return;
            
            const enemyTile = {
                x: Math.floor(enemy.x / GAME_CONFIG.TILE_SIZE),
                y: Math.floor(enemy.y / GAME_CONFIG.TILE_SIZE)
            };
            const playerTile = {
                x: Math.floor(state.player.x / GAME_CONFIG.TILE_SIZE),
                y: Math.floor(state.player.y / GAME_CONFIG.TILE_SIZE)
            };
            
            const path = findPath(enemyTile, playerTile);
            if (path && path.length > 0) {
                const nextTile = path[0];
                const targetX = nextTile.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
                const targetY = nextTile.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
                
                const dx = targetX - enemy.x;
                const dy = targetY - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    enemy.x += (dx / distance) * enemy.speed;
                    enemy.y += (dy / distance) * enemy.speed;
                }
            }
        });
    }

    // Aktualizacja obrotu gracza z płynnym skrętem
    if (state.keys.turnLeft) state.player.angle -= state.player.turnSpeed;
    if (state.keys.turnRight) state.player.angle += state.player.turnSpeed;

    // Obliczanie wektorów ruchu
    const dx = Math.cos(state.player.angle);
    const dy = Math.sin(state.player.angle);
    
    // Pobierz aktualny mnożnik prędkości
    const speedMultiplier = state.keys.sprint ? state.player.sprintMultiplier : 1;

    // Oblicz wektor przyspieszenia
    let accelX = 0;
    let accelY = 0;

    if (state.keys.forward) {
        accelX += dx * state.player.acceleration;
        accelY += dy * state.player.acceleration;
    }
    if (state.keys.backward) {
        accelX -= dx * state.player.acceleration * 0.7; // Wolniejszy ruch do tyłu
        accelY -= dy * state.player.acceleration * 0.7;
    }
    if (state.keys.strafeLeft) {
        accelX += dy * state.player.acceleration;
        accelY -= dx * state.player.acceleration;
    }
    if (state.keys.strafeRight) {
        accelX -= dy * state.player.acceleration;
        accelY += dx * state.player.acceleration;
    }

    // Apply acceleration
    state.player.velocity.x += accelX;
    state.player.velocity.y += accelY;

    // Apply friction
    state.player.velocity.x *= state.player.friction;
    state.player.velocity.y *= state.player.friction;

    // Limit speed
    const currentSpeed = Math.sqrt(
        state.player.velocity.x * state.player.velocity.x + 
        state.player.velocity.y * state.player.velocity.y
    );
    
    if (currentSpeed > state.player.maxSpeed * speedMultiplier) {
        const scale = (state.player.maxSpeed * speedMultiplier) / currentSpeed;
        state.player.velocity.x *= scale;
        state.player.velocity.y *= scale;
    }

    // Check wall collision before updating position
    const newX = state.player.x + state.player.velocity.x;
    const newY = state.player.y + state.player.velocity.y;
    
    // Convert position to tile coordinates and ensure they're within bounds
    const tileX = Math.floor(newX / GAME_CONFIG.TILE_SIZE);
    const tileY = Math.floor(newY / GAME_CONFIG.TILE_SIZE);
    
    // Check if position is valid and won't hit a wall
    if (tileX >= 0 && tileX < state.map.width && 
        tileY >= 0 && tileY < state.map.height && 
        !state.map.tiles[tileY][tileX]) {
        state.player.x = newX;
        state.player.y = newY;
    } else {
        // Hit wall, stop movement
        state.player.velocity.x = 0;
        state.player.velocity.y = 0;
    }
    
    // Keep player in bounds
    state.player.x = Math.max(GAME_CONFIG.TILE_SIZE, Math.min(canvas.width - GAME_CONFIG.TILE_SIZE, state.player.x));
    state.player.y = Math.max(GAME_CONFIG.TILE_SIZE, Math.min(canvas.height - GAME_CONFIG.TILE_SIZE, state.player.y));
}

// Initialize minimap canvas
const minimapCanvas = document.getElementById('minimapCanvas');
const minimapCtx = minimapCanvas.getContext('2d');
minimapCanvas.width = 200;
minimapCanvas.height = 200;

function drawMinimap() {
    // Clear minimap
    minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    
    // Calculate scale factors
    const scaleX = minimapCanvas.width / (state.map.width * GAME_CONFIG.TILE_SIZE);
    const scaleY = minimapCanvas.height / (state.map.height * GAME_CONFIG.TILE_SIZE);
    
    // Draw walls
    minimapCtx.strokeStyle = '#ff4400';
    minimapCtx.lineWidth = 1;
    for (let y = 0; y < state.map.height; y++) {
        for (let x = 0; x < state.map.width; x++) {
            if (state.map.tiles[y][x] === 1) {
                minimapCtx.strokeRect(
                    x * GAME_CONFIG.TILE_SIZE * scaleX,
                    y * GAME_CONFIG.TILE_SIZE * scaleY,
                    GAME_CONFIG.TILE_SIZE * scaleX,
                    GAME_CONFIG.TILE_SIZE * scaleY
                );
            }
        }
    }
    
    // Draw player (red square)
    minimapCtx.fillStyle = '#ff0000';
    minimapCtx.fillRect(
        state.player.x * scaleX - 4,
        state.player.y * scaleY - 4,
        8, 8
    );
    
    // Draw enemies (yellow squares)
    if (state.enemies && Array.isArray(state.enemies)) {
        minimapCtx.fillStyle = '#ffff00';
        state.enemies.forEach(enemy => {
            if (!enemy || typeof enemy.x !== 'number' || typeof enemy.y !== 'number') return;
            minimapCtx.fillRect(
                enemy.x * scaleX - 4,
                enemy.y * scaleY - 4,
                8, 8
            );
        });
    }
}

function drawGame() {
    // Dark background but not too dark
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw map
    for (let y = 0; y < state.map.height; y++) {
        for (let x = 0; x < state.map.width; x++) {
            if (state.map.tiles[y][x] === 1) {
                ctx.fillStyle = '#444';
                ctx.fillRect(
                    x * GAME_CONFIG.TILE_SIZE,
                    y * GAME_CONFIG.TILE_SIZE,
                    GAME_CONFIG.TILE_SIZE,
                    GAME_CONFIG.TILE_SIZE
                );
            }
        }
    }

    // Update strobe color every 250ms
    if (Date.now() - state.lastStrobeTime > 250) {
        state.currentShadowColor = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
        state.lastStrobeTime = Date.now();
    }

    // Draw player
    ctx.shadowColor = state.currentShadowColor;
    ctx.shadowBlur = 70;
    ctx.drawImage(state.player.sprite, state.player.x - 16, state.player.y - 16);
    ctx.shadowBlur = 0;

    // Draw enemies with MAXIMUM visibility
    if (state.enemies && Array.isArray(state.enemies)) {
        state.enemies.forEach(enemy => {
            if (enemy && enemy.sprite) {
                // Draw pulsing glow effect
                const glowSize = 70 + Math.sin(Date.now() / 200) * 10;
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 40;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fill();
                
                // Draw targeting lines
                ctx.beginPath();
                ctx.moveTo(enemy.x - 100, enemy.y);
                ctx.lineTo(enemy.x + 100, enemy.y);
                ctx.moveTo(enemy.x, enemy.y - 100);
                ctx.lineTo(enemy.x, enemy.y + 100);
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw enemy sprite with EPIC outline
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 20;
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 6;
                ctx.strokeRect(enemy.x - 64, enemy.y - 64, 128, 128);
                ctx.drawImage(enemy.sprite, enemy.x - 64, enemy.y - 64, 128, 128);
                
                // Draw EPIC catchphrase with style
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 8;
                ctx.font = 'bold 24px "Press Start 2P"';
                ctx.fillStyle = '#ff4400';
                ctx.textAlign = 'center';
                const yOffset = -80 + Math.sin(Date.now() / 300) * 5;
                ctx.fillText(enemy.catchphrase, enemy.x, enemy.y + yOffset);
                
                // Draw distance indicator
                const dx = state.player.x - enemy.x;
                const dy = state.player.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                ctx.font = '16px "Press Start 2P"';
                ctx.fillStyle = '#ff6600';
                ctx.fillText(`${Math.floor(distance)}px`, enemy.x, enemy.y + 100);
                
                ctx.shadowBlur = 0;
            }
        });
    }

    // Draw coins with synchronized RGB shadows
    if (state.coins && state.coins.length > 0) {
        ctx.fillStyle = '#ff0';
        state.coins.forEach(coin => {
            if (!coin || typeof coin.x !== 'number' || typeof coin.y !== 'number') return;
            ctx.shadowColor = state.currentShadowColor;
            ctx.shadowBlur = 70;
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    // Draw debug info and score
    ctx.fillStyle = '#fff';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(`Coins: ${state.player.coins}`, 10, 30);
    
    // Draw debug overlay for enemy positions
    if (state.enemies && state.enemies.length > 0) {
        ctx.fillStyle = '#ff0000';
        state.enemies.forEach(enemy => {
            if (!enemy || typeof enemy.x !== 'number' || typeof enemy.y !== 'number') return;
            
            // Draw enemy position marker
            ctx.beginPath();
            ctx.moveTo(enemy.x, 0);
            ctx.lineTo(enemy.x, canvas.height);
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, enemy.y);
            ctx.lineTo(canvas.width, enemy.y);
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.stroke();
            
            // Draw distance to player
            const dx = state.player.x - enemy.x;
            const dy = state.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            ctx.fillText(`Enemy: ${Math.floor(distance)}px`, enemy.x + 70, enemy.y);
        });
    }
}

// Input handling
window.addEventListener('keydown', e => {
    switch(e.key) {
        case 'w': state.keys.forward = true; break;
        case 's': state.keys.backward = true; break;
        case 'a': state.keys.strafeLeft = true; break;
        case 'd': state.keys.strafeRight = true; break;
        case 'ArrowLeft': state.keys.turnLeft = true; break;
        case 'ArrowRight': state.keys.turnRight = true; break;
        case 'Shift': state.keys.sprint = true; break;
    }
    e.preventDefault(); // Prevent default browser scrolling
});

window.addEventListener('keyup', e => {
    switch(e.key) {
        case 'w': state.keys.forward = false; break;
        case 's': state.keys.backward = false; break;
        case 'a': state.keys.strafeLeft = false; break;
        case 'd': state.keys.strafeRight = false; break;
        case 'ArrowLeft': state.keys.turnLeft = false; break;
        case 'ArrowRight': state.keys.turnRight = false; break;
        case 'Shift': state.keys.sprint = false; break;
    }
});

// Shop functionality
function openShop() {
    // TODO: Implement shop UI
    console.log('Shop opened');
}

// Procedural map generation
function generateMap() {
    // Ensure map state is properly initialized
    if (!state.map || !Array.isArray(state.map.tiles)) {
        state.map = {
            tiles: Array(GAME_CONFIG.MAP_SIZE.height).fill().map(() => 
                Array(GAME_CONFIG.MAP_SIZE.width).fill(0)
            ),
            width: GAME_CONFIG.MAP_SIZE.width,
            height: GAME_CONFIG.MAP_SIZE.height
        };
    }
    
    // Initialize with walls
    for (let y = 0; y < state.map.height; y++) {
        for (let x = 0; x < state.map.width; x++) {
            state.map.tiles[y][x] = 1; // Fill with walls
        }
    }

    // Create rooms
    const numRooms = 8;
    const rooms = [];
    
    for (let i = 0; i < numRooms; i++) {
        const roomWidth = 3 + Math.floor(Math.random() * 5);
        const roomHeight = 3 + Math.floor(Math.random() * 5);
        const x = 1 + Math.floor(Math.random() * (state.map.width - roomWidth - 2));
        const y = 1 + Math.floor(Math.random() * (state.map.height - roomHeight - 2));
        
        // Carve out room
        for (let ry = y; ry < y + roomHeight; ry++) {
            for (let rx = x; rx < x + roomWidth; rx++) {
                state.map.tiles[ry][rx] = 0;
            }
        }
        
        rooms.push({ x, y, width: roomWidth, height: roomHeight });
    }
    
    // Connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
        const room1 = rooms[i];
        const room2 = rooms[i + 1];
        
        // Get center points
        const x1 = Math.floor(room1.x + room1.width / 2);
        const y1 = Math.floor(room1.y + room1.height / 2);
        const x2 = Math.floor(room2.x + room2.width / 2);
        const y2 = Math.floor(room2.y + room2.height / 2);
        
        // Create L-shaped corridor
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            state.map.tiles[y1][x] = 0;
        }
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            state.map.tiles[y][x2] = 0;
        }
    }
    
    // Ensure outer walls
    for (let x = 0; x < state.map.width; x++) {
        state.map.tiles[0][x] = 1;
        state.map.tiles[state.map.height - 1][x] = 1;
    }
    for (let y = 0; y < state.map.height; y++) {
        state.map.tiles[y][0] = 1;
        state.map.tiles[y][state.map.width - 1] = 1;
    }
    
    // Place player in first room center
    const startRoom = rooms[0];
    state.player.x = (startRoom.x + startRoom.width / 2) * GAME_CONFIG.TILE_SIZE;
    state.player.y = (startRoom.y + startRoom.height / 2) * GAME_CONFIG.TILE_SIZE;
}

// Game loop
function gameLoop() {
    updateGame();
    drawGame();
    drawMinimap();
    requestAnimationFrame(gameLoop);
}

// Spawn enemies and coins periodically
// Spawn enemies more frequently for more MUSTACHE POWER!
setInterval(spawnEnemy, 2000);
setInterval(spawnCoin, 5000);

// Initialize and start game
generateMap();
gameLoop();
