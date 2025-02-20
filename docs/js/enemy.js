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
        // Sort enemies by distance for proper z-indexing
        state.enemies.sort((a, b) => {
            if (!a || !b) return 0;
            const distA = Math.sqrt(Math.pow(a.x - player.x, 2) + Math.pow(a.y - player.y, 2));
            const distB = Math.sqrt(Math.pow(b.x - player.x, 2) + Math.pow(b.y - player.y, 2));
            return distB - distA; // Sort furthest to closest
        });
        
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
            
            // Update pathfinding more frequently for smoother movement
            const now = Date.now();
            if (now - enemy.lastPathUpdate > 100) { // Reduced from 500ms to 100ms
                enemy.path = findPath(enemy.x, enemy.y, player.x, player.y);
                enemy.lastPathUpdate = now;
                enemy.pathIndex = 0;
            }
            
            // Follow path if available with improved movement
            if (enemy.path && enemy.path.length > 0 && enemy.pathIndex < enemy.path.length) {
                const target = enemy.path[enemy.pathIndex];
                const tdx = target.x - enemy.x;
                const tdy = target.y - enemy.y;
                const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
                
                if (tdist < 0.1) {
                    enemy.pathIndex++;
                } else {
                    // Smoother movement with proper collision radius
                    const speed = 0.003;
                    const newX = enemy.x + (tdx / tdist) * speed;
                    const newY = enemy.y + (tdy / tdist) * speed;
                    
                    // Check collision with entity radius
                    if (!checkWallCollision(newX, newY, 0.3)) {
                        enemy.x = newX;
                        enemy.y = newY;
                    } else {
                        // Try sliding along walls if direct path is blocked
                        if (!checkWallCollision(newX, enemy.y, 0.3)) {
                            enemy.x = newX;
                        } else if (!checkWallCollision(enemy.x, newY, 0.3)) {
                            enemy.y = newY;
                        }
                    }
                }
            }
        }
    }
}

// Enemy rendering with health bars
export function renderEnemy(ctx, enemy, player, canvas) {
    if (!enemy || typeof enemy.x !== 'number' || typeof enemy.y !== 'number') return;
    
    const { screenX, screenY, size, distance } = worldToScreen(enemy.x, enemy.y, player.x, player.y, player.angle, canvas);
    
    // Improved occlusion check with multiple rays
    const angleToEnemy = Math.atan2(enemy.y - player.y, enemy.x - player.x);
    const angleDiff = 0.1; // Check multiple points on enemy
    
    // Check corners and center of enemy
    const angles = [
        angleToEnemy - angleDiff,
        angleToEnemy,
        angleToEnemy + angleDiff
    ];
    
    let visible = false;
    for (const angle of angles) {
        const rayDistance = castRay(player.angle + angle, player.x, player.y);
        if (Math.abs(rayDistance - distance) < 0.5) {
            visible = true;
            break;
        }
    }
    
    if (!visible) return;
    
    // Skip if outside view with margin
    const margin = size * 0.5;
    if (screenX < -margin || screenX > canvas.width + margin) return;
    
    // Draw enemy with proper z-indexing and health bar
    ctx.save();
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
    
    ctx.restore();
}
