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
            type: 'CHEESE_ENEMY',
            lastMove: Date.now(),
            lastPathUpdate: 0,
            pathIndex: 0,
            path: null,
            clicked: false
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

// Simple enemy rendering
export function renderEnemy(ctx, enemy, player, canvas) {
    if (!enemy || typeof enemy.x !== 'number' || typeof enemy.y !== 'number') return;
    
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const relativeAngle = ((angle - player.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    
    // Check if enemy is behind a wall
    const rayDistance = castRay(player.angle + relativeAngle, player.x, player.y);
    if (rayDistance < distance) return;
    
    const screenX = (Math.tan(relativeAngle) + 1) * canvas.width / 2;
    const screenY = canvas.height / 2;
    
    // Calculate size with max constraint
    const maxSize = canvas.height / 4;
    const size = Math.min(maxSize, canvas.height / distance);
    
    // Skip if outside view
    if (screenX < -size || screenX > canvas.width + size) return;
    
    // Draw enemy
    ctx.save();
    
    // Draw cheese enemy with health bar
    if (enemy.type === 'CHEESE_ENEMY') {
        // Draw health bar
        const barWidth = size;
        const barHeight = size / 8;
        const healthPercent = enemy.health / 100;
        
        // Health bar background
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX - barWidth/2, screenY - size/2 - barHeight*2, barWidth, barHeight);
        
        // Health bar fill
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(screenX - barWidth/2, screenY - size/2 - barHeight*2, barWidth * healthPercent, barHeight);
        
        // Draw cheese enemy
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(screenX, screenY, size/3, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Draw default enemy shape
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(screenX, screenY, size/4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}
