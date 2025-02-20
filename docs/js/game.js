import { GAME_CONFIG, loadSprite } from './utils.js';
import { player, updatePlayerMovement, shoot } from './player.js';
import { updateEnemies, renderEnemy, spawnEnemy } from './enemy.js';
import { updateCollectibles, renderCollectibles, spawnCheese } from './collectibles.js';
import { drawWalls, drawHUD, drawArms, drawMinimap } from './render.js';
import { setupInputHandlers, keys, updateAutoplay } from './input.js';
import { spawnDuck, updateDucks, renderDuck, duckTypes } from './ducks.js';
import { renderStore, handleStoreClick } from './store.js';
import { updateHorror } from './horror.js';

// Canvas contexts
let canvas = null;
let ctx = null;
let minimapCanvas = null;
let minimapCtx = null;

// Initialize canvases, contexts, and webcam
function initializeCanvases() {
    try {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) throw new Error('Canvas initialization failed');
        ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Context initialization failed');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        minimapCanvas = document.getElementById('minimapCanvas');
        if (!minimapCanvas) throw new Error('Minimap canvas initialization failed');
        minimapCtx = minimapCanvas.getContext('2d');
        if (!minimapCtx) throw new Error('Minimap context initialization failed');
        minimapCanvas.width = 200;
        minimapCanvas.height = 200;
    } catch (error) {
        console.error('Canvas initialization error:', error);
        throw error;
    }
}

// Add FPS limiting constants
const TARGET_FPS = 60;  // Doubled for smoother gameplay
const FRAME_TIME = 1000 / TARGET_FPS;
let lastFrameTime = 0;

export const state = {
    projectiles: [],
    enemies: [],
    collectibles: [],
    ducks: [],
    coins: 0,
    score: 0,
    gameOver: false,
    lastShot: 0,
    shootCooldown: 250,
    player: player,
    autoplay: {
        enabled: false,
        lastActivity: Date.now(),
        inactivityThreshold: 5000,
        targetEnemy: null,
        nextMoveTime: 0,
        moveInterval: 1000,
        lastPing: Date.now(),
        pingInterval: 300000
    },
    sounds: {
        ping: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
    }
};

export function handlePlayerDeath() {
    const popup = document.getElementById('deathPopup');
    if (popup) {
        popup.style.display = 'block';
    }
    state.gameOver = true;
}

export function restartGame() {
    state.player.health = state.player.maxHealth;
    player.x = 1.5;
    player.y = 1.5;
    player.angle = 0;
    
    state.enemies = [];
    
    const popup = document.getElementById('deathPopup');
    if (popup) {
        popup.style.display = 'none';
    }
    
    state.gameOver = false;
    requestAnimationFrame(gameLoop);
}

export function gameLoop(timestamp) {
    if (state.gameOver) return;
    
    // Limit FPS
    const elapsed = timestamp - lastFrameTime;
    if (elapsed < FRAME_TIME) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastFrameTime = timestamp;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Cache array checks
    const hasEnemies = state.enemies && Array.isArray(state.enemies);
    
    drawWalls(ctx, player, canvas);
    
    if (hasEnemies) {
        state.enemies.forEach(enemy => {
            renderEnemy(ctx, enemy, player, canvas);
        });
    }
    
    if (state.player.health <= 0) {
        handlePlayerDeath();
        return;
    }
    
    drawArms(ctx, player, canvas);
    drawHUD(ctx, state);
    
    // Update arm swing animation
    if (keys.w || keys.s) {
        player.arms.swingOffset += player.arms.swingSpeed;
    }
    
    updatePlayerMovement(keys);
    if (hasEnemies) {
        updateEnemies(state, player);
    }
    updateCollectibles(state, player);
    updateDucks(state, player);
    updateHorror(state, player);
    updateAutoplay(state, player);
    
    drawMinimap(minimapCtx, state, player);
    
    // Render ducks
    if (state.ducks) {
        state.ducks.forEach(duck => {
            renderDuck(ctx, duck, player, canvas);
        });
    }
    
    // Render store UI
    renderStore(ctx, state);
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
initializeCanvases();
setupInputHandlers(state);

// Spawn initial cheese and ducks
spawnCheese(state);
spawnDuck(state, duckTypes.NORMAL);
spawnDuck(state, duckTypes.GOLDEN);
spawnDuck(state, duckTypes.RAINBOW);

// Cache enemy check and reduce spawn frequency
const MAX_ENEMIES = 5;
setInterval(() => {
    if (!state.enemies?.length || state.enemies.length < MAX_ENEMIES) {
        spawnEnemy(state);
    }
}, 5000);

// Preload enemy sprites
Object.keys(GAME_CONFIG.SPRITES.ENEMIES).forEach(async (spriteName) => {
    try {
        await loadSprite(spriteName);
    } catch (error) {
        console.error(`Failed to load sprite ${spriteName}:`, error);
    }
});

// Preload enemy sprites before starting game
async function initGame() {
    try {
        const spritePromises = Object.keys(GAME_CONFIG.SPRITES.ENEMIES).map(spriteName => loadSprite(spriteName));
        await Promise.all(spritePromises);
        console.log('All enemy sprites loaded successfully');
        gameLoop();
    } catch (error) {
        console.error('Failed to load enemy sprites:', error);
    }
}

// Initialize game
initGame();
