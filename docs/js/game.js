import { GAME_CONFIG, loadSprite, calculateDistance, worldToScreen, spriteCache } from './utils.js';
import { player, updatePlayerMovement, shoot } from './player.js';
import { updateEnemies, renderEnemy, spawnEnemy } from './enemy.js';
import { updateCollectibles, renderCollectibles, spawnCheese } from './collectibles.js';
import { drawWalls, drawHUD, drawArms, drawMinimap } from './render.js';
import { setupInputHandlers, keys, updateAutoplay } from './input.js';
import { checkWallCollision } from './map.js';

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
    score: 0,
    gameOver: false,
    lastShot: 0,
    shootCooldown: 250,
    player: player,
    bullets: 30,  // Current bullets
    maxBullets: 30,  // Max bullets,
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
    
    // Update and render projectiles
    if (state.projectiles) {
        const now = Date.now();
        state.projectiles = state.projectiles.filter(projectile => {
            // Update position
            projectile.x += Math.cos(projectile.angle) * projectile.speed;
            projectile.y += Math.sin(projectile.angle) * projectile.speed;
            
            // Check wall collision
            if (checkWallCollision(projectile.x, projectile.y)) {
                // Draw wall impact effect
                const { screenX, screenY, size } = worldToScreen(
                    projectile.x, projectile.y,
                    player.x, player.y,
                    player.angle,
                    canvas
                );
                ctx.save();
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(screenX, screenY, size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                return false;
            }
            
            // Check enemy collisions
            if (state.enemies) {
                for (let i = state.enemies.length - 1; i >= 0; i--) {
                    const enemy = state.enemies[i];
                    const dist = calculateDistance(projectile.x, projectile.y, enemy.x, enemy.y);
                    if (dist < 0.5) {
                        enemy.health -= projectile.damage;
                        // Draw enemy hit impact effect
                        const { screenX, screenY, size } = worldToScreen(
                            enemy.x, enemy.y,
                            player.x, player.y,
                            player.angle,
                            canvas
                        );
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        ctx.fillStyle = '#ff0000';
                        ctx.beginPath();
                        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                        
                        if (enemy.health <= 0) {
                            // Drop ammo when enemy dies
                            const ammoAmount = Math.floor(Math.random() * 5) + 3; // 3-7 bullets
                            state.bullets = Math.min(state.maxBullets, state.bullets + ammoAmount);
                            state.enemies.splice(i, 1);
                        }
                        return false;  // Remove bullet on hit
                    }
                }
            }
            
            // Check lifetime
            if (now - projectile.created > projectile.lifetime) {
                return false;
            }
            
            // Render bullet using worldToScreen
            const { screenX, screenY, size } = worldToScreen(
                projectile.x, projectile.y,
                player.x, player.y,
                player.angle,
                canvas
            );
            
            // Only render if in view
            if (screenX >= 0 && screenX <= canvas.width) {
                ctx.save();
                const sprite = spriteCache['BULLET'];
                if (sprite) {
                    const width = Math.max(12, size * 0.6);  // Visible yellow bullets per ThePrimeagen
                    const height = width;
                    
                    // Draw smoke tracer
                    ctx.save();
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = '#888888';
                    ctx.beginPath();
                    ctx.moveTo(screenX, screenY);
                    ctx.lineTo(screenX - Math.cos(projectile.angle) * width * 2, 
                             screenY - Math.sin(projectile.angle) * width * 2);
                    ctx.lineTo(screenX - Math.cos(projectile.angle) * width * 3,
                             screenY - Math.sin(projectile.angle) * width * 3);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                    
                    // Draw yellow bullet
                    // Draw smoke tracer
                    ctx.save();
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = '#888888';
                    ctx.beginPath();
                    ctx.moveTo(screenX, screenY);
                    ctx.lineTo(screenX - Math.cos(projectile.angle) * width * 2, 
                             screenY - Math.sin(projectile.angle) * width * 2);
                    ctx.lineTo(screenX - Math.cos(projectile.angle) * width * 3,
                             screenY - Math.sin(projectile.angle) * width * 3);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                    
                    // Draw yellow bullet
                    ctx.save();
                    ctx.fillStyle = 'yellow';
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, width/2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                ctx.restore();
            }
            
            return true;
        });
    }
    
    drawArms(ctx, player, canvas);
    drawHUD(ctx, state, canvas);
    
    // Update arm swing animation
    if (keys.w || keys.s) {
        player.arms.swingOffset += player.arms.swingSpeed;
    }
    
    updatePlayerMovement(keys);
    if (hasEnemies) {
        updateEnemies(state, player);
    }
    updateCollectibles(state, player);
    // Update autoplay with shooting
    updateAutoplay(state, player);
    if (state.autoplay.enabled && state.autoplay.targetEnemy && state.bullets > 0) {
        shoot(state);
    }
    
    drawMinimap(minimapCtx, state, player);
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
initializeCanvases();
setupInputHandlers(state);

// Spawn initial cheese
spawnCheese(state);

// Cache enemy check and reduce spawn frequency
const MAX_ENEMIES = 5;
setInterval(() => {
    if (!state.enemies?.length || state.enemies.length < MAX_ENEMIES) {
        spawnEnemy(state);
    }
}, 5000);

// Preload enemy sprites, bullet sprite, and collectibles
[
    ...Object.keys(GAME_CONFIG.SPRITES.ENEMIES),
    ...Object.keys(GAME_CONFIG.SPRITES.COLLECTIBLES)
].forEach(async (spriteName) => {
    try {
        spriteCache[spriteName] = await loadSprite(spriteName);
    } catch (error) {
        console.error(`Failed to load sprite ${spriteName}:`, error);
    }
});



// Preload enemy sprites before starting game
async function initGame() {
    try {
        const spritePromises = [
            ...Object.keys(GAME_CONFIG.SPRITES.ENEMIES).map(spriteName => loadSprite(spriteName)),
            loadSprite('BULLET'),
            ...Object.keys(GAME_CONFIG.SPRITES.COLLECTIBLES).map(spriteName => loadSprite(spriteName))
        ];
        await Promise.all(spritePromises);
        console.log('All sprites loaded successfully');
        gameLoop();
    } catch (error) {
        console.error('Failed to load sprites:', error);
    }
}

// Initialize game
initGame();
