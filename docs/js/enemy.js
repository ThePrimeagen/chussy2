import { GAME_CONFIG } from './utils.js';
import { player } from './player.js';
import { MAP, checkWallCollision, castRay } from './map.js';
import { calculateDistance, spriteCache } from './utils.js';
import { findPath } from './pathfinding.js';

// *BEEP BOOP* Breaking circular dependency because SOMEONE didn't think about architecture... *MECHANICAL GROAN*
function worldToScreen(x, y, playerX, playerY, playerAngle, canvas) {
    const dx = x - playerX;
    const dy = y - playerY;
    const angle = Math.atan2(dy, dx);
    const relativeAngle = ((angle - playerAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const screenX = (Math.tan(relativeAngle) + 1) * canvas.width / 2;
    const screenY = canvas.height / 2;
    const size = canvas.height / distance;
    return { screenX, screenY, size, distance };
}

export function spawnEnemy(state) {
    if (!state.enemies || !Array.isArray(state.enemies)) {
        state.enemies = [];
    }
    
    // Get map center coordinates
    const centerX = Math.floor(MAP[0].length / 2);
    const centerY = Math.floor(MAP.length / 2);
    
    // Add some randomness to spawn position around center
    const x = centerX + (Math.random() * 2 - 1);
    const y = centerY + (Math.random() * 2 - 1);
    
    // Only spawn if position is valid (not in a wall)
    if (!checkWallCollision(x, y)) {
        state.enemies.push({
            x: x,
            y: y,
            health: 100,
            type: 'ENEMY_1',
            lastMove: Date.now(),
            lastPathUpdate: 0,
            pathIndex: 0,
            path: null
        });
    }
}

export function updateEnemies(state, player) {
    if (!state.gameOver && state.enemies && Array.isArray(state.enemies)) {
        for (let i = state.enemies.length - 1; i >= 0; i--) {
            const enemy = state.enemies[i];
            if (!enemy || typeof enemy.x !== 'number' || typeof enemy.y !== 'number') continue;
            
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Remove enemy on collision
            if (dist < 0.5) {
                state.enemies.splice(i, 1);
                continue;
            }
            
            // Update movement (10x slower)
            if (dist > 0.1) {
                const newX = enemy.x + (dx / dist) * 0.003;
                const newY = enemy.y + (dy / dist) * 0.003;
                
                if (!checkWallCollision(newX, newY)) {
                    enemy.x = newX;
                    enemy.y = newY;
                }
            }
        }
    }
}

// Enemy rendering with health bars
export function renderEnemy(ctx, enemy, player, canvas) {
    if (!enemy || typeof enemy.x !== 'number' || typeof enemy.y !== 'number') return;
    
    const { screenX, screenY, size, distance } = worldToScreen(enemy.x, enemy.y, player.x, player.y, player.angle, canvas);
    
    // Skip if behind wall
    const rayDistance = castRay(player.angle + Math.atan2(enemy.y - player.y, enemy.x - player.x), player.x, player.y);
    if (rayDistance < distance) return;
    
    // Skip if outside view
    if (screenX < -size || screenX > canvas.width + size) return;
    
    // Draw enemy with depth of field
    ctx.save();
    const blurAmount = Math.min(5, Math.max(0, distance - 2) / 2);
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(screenX, screenY, size/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw health bar
    const healthBarWidth = size/2;
    const healthBarHeight = size/10;
    const healthPercent = enemy.health / 100;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(screenX - healthBarWidth/2, screenY - size/3, healthBarWidth, healthBarHeight);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(screenX - healthBarWidth/2, screenY - size/3, healthBarWidth * healthPercent, healthBarHeight);
    ctx.filter = 'none';
    ctx.restore();
}
