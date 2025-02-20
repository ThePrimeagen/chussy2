import { GAME_CONFIG } from './utils.js';
import { player, updatePlayerMovement, shoot } from './player.js';
import { updateEnemies, renderEnemy, spawnEnemy } from './enemy.js';
import { drawWalls, drawHUD, drawArms, drawMinimap } from './render.js';
import { setupInputHandlers, keys, updateAutoplay } from './input.js';

// Canvas contexts
let canvas = null;
let ctx = null;
let minimapCanvas = null;
let minimapCtx = null;

// Initialize canvases and contexts
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

export const state = {
    projectiles: [],
    enemies: [],
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

export function gameLoop() {
    if (state.gameOver) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw walls first (behind enemies)
    drawWalls(ctx, player, canvas);
    
    // Draw enemies on top of walls
    if (state.enemies && Array.isArray(state.enemies)) {
        state.enemies.forEach(enemy => {
            renderEnemy(ctx, enemy, player, canvas);
        });
    }
    
    // Draw player arms
    drawArms(ctx, player, canvas);
    
    // Draw HUD
    drawHUD(ctx, state);
    
    // Update arm swing animation
    if (keys.w || keys.s) {
        player.arms.swingOffset += player.arms.swingSpeed;
    }
    
    // Update game state
    updatePlayerMovement(keys);
    updateEnemies(state, player);
    updateAutoplay(state, player);
    
    // Draw minimap
    drawMinimap(minimapCtx, state, player);
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
initializeCanvases();
setupInputHandlers(state);

// Spawn enemies periodically
setInterval(() => {
    if (!state.enemies || !Array.isArray(state.enemies) || state.enemies.length < 5) {
        spawnEnemy(state, player.x, player.y);
    }
}, 5000);

// Start game loop
gameLoop();
