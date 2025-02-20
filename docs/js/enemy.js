import { GAME_CONFIG } from './utils.js';
import { MAP, checkWallCollision, castRay } from './map.js';
import { calculateDistance, spriteCache } from './utils.js';

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

export function spawnEnemy(state, playerX, playerY) {
    if (!state.enemies || !Array.isArray(state.enemies)) {
        state.enemies = [];
    }
    
    let x, y;
    const MIN_WALL_DISTANCE = 2.0;  // Increased minimum wall distance
    const MIN_PLAYER_DISTANCE = 4.0; // Minimum distance from player
    const MAX_PLAYER_DISTANCE = 8.0; // Maximum distance from player
    let attempts = 0;
    const maxAttempts = 20;  // Increased max attempts
    
    function isValidSpawnPoint(x, y) {
        // Check map boundaries
        if (x < 1 || x >= MAP[0].length - 1 || y < 1 || y >= MAP.length - 1) return false;
        
        // Check distance from player
        const playerDist = Math.sqrt((x - playerX) * (x - playerX) + (y - playerY) * (y - playerY));
        if (playerDist < MIN_PLAYER_DISTANCE || playerDist > MAX_PLAYER_DISTANCE) return false;
        
        // Check immediate position
        if (checkWallCollision(x, y)) return false;
        
        // Check surrounding area more thoroughly
        for (let dx = -MIN_WALL_DISTANCE; dx <= MIN_WALL_DISTANCE; dx += 0.5) {
            for (let dy = -MIN_WALL_DISTANCE; dy <= MIN_WALL_DISTANCE; dy += 0.5) {
                const checkX = x + dx;
                const checkY = y + dy;
                if (checkX < 1 || checkX >= MAP[0].length - 1 || checkY < 1 || checkY >= MAP.length - 1) return false;
                if (checkWallCollision(checkX, checkY)) return false;
            }
        }
        
        // Validate path to player exists
        let pathX = x;
        let pathY = y;
        let steps = 0;
        const maxSteps = 50;
        
        while (steps < maxSteps) {
            const dx = playerX - pathX;
            const dy = playerY - pathY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 0.5) return true;  // Path found
            
            const stepX = pathX + (dx / dist) * 0.5;
            const stepY = pathY + (dy / dist) * 0.5;
            
            if (checkWallCollision(stepX, stepY)) return false;
            
            pathX = stepX;
            pathY = stepY;
            steps++;
        }
        
        return false;  // No valid path found
    }
    
    do {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 3 + 4; // Spawn between 4-7 units away
        x = playerX + Math.cos(angle) * distance;
        y = playerY + Math.sin(angle) * distance;
        attempts++;
        
        if (attempts >= maxAttempts) {
            // If initial attempts fail, try spawning in a valid location within map bounds
            for (let distance = 4; distance <= 7; distance++) {
                for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                    x = playerX + Math.cos(angle) * distance;
                    y = playerY + Math.sin(angle) * distance;
                    if (isValidSpawnPoint(x, y)) {
                        return; // Valid spawn point found
                    }
                }
            }
            // If no valid point found, don't spawn enemy
            x = -1;
            y = -1;
            break;
        }
    } while (!isValidSpawnPoint(x, y));
    
    // Only add enemy if valid position found *BEEP BOOP*
    if (x >= 0 && y >= 0) {
        state.enemies.push({
            x: x,
            y: y,
            health: 100,
            type: `ENEMY_${Math.floor(Math.random() * 5) + 1}`,  // Use new pixel art enemies *BEEP BOOP*
            lastMove: Date.now(),
            frame: 0,
            animationSpeed: 0.1
        });
    }
}

export function updateEnemies(state, player) {
    if (!state.gameOver && state.enemies && Array.isArray(state.enemies)) {
        state.enemies.forEach(enemy => {
            if (!enemy || typeof enemy.x !== 'number' || typeof enemy.y !== 'number') return;
            
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0.1) {
                const newX = enemy.x + (dx / dist) * 0.03;
                const newY = enemy.y + (dy / dist) * 0.03;
                
                if (!checkWallCollision(newX, newY)) {
                    enemy.x = newX;
                    enemy.y = newY;
                }
            }

            // Damage player if too close
            if (dist < 0.5) {
                state.player.health = Math.max(0, state.player.health - 0.5);
                if (state.player.health <= 0) {
                    state.gameOver = true;
                }
            }
        });
    }
}

// Enemy rendering with proper coordinate transforms
export function renderEnemy(ctx, enemy, player, canvas) {
    if (!enemy || typeof enemy.x !== 'number' || typeof enemy.y !== 'number') return;
    
    // Calculate screen position and check wall occlusion *BEEP BOOP*
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const relativeAngle = ((angle - player.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    
    // Check if enemy is behind a wall *MECHANICAL SIGH*
    const rayDistance = castRay(player.angle + relativeAngle, player.x, player.y);
    if (rayDistance < distance) return; // Enemy is occluded *WHIRR*
    
    const screenX = (Math.tan(relativeAngle) + 1) * canvas.width / 2;
    const screenY = canvas.height / 2;
    const size = canvas.height / distance;
    
    // Skip if outside view
    if (screenX < -size || screenX > canvas.width + size) return;
    
    // Draw enemy with pixel art *BEEP BOOP*
    ctx.save();
    
    const sprite = spriteCache[enemy.type] || spriteCache['ENEMY_1'];
    if (sprite) {
        const width = size * 1.5;  // Make enemies a bit wider for visibility
        const height = size * 1.5;
        
        ctx.drawImage(
            sprite,
            screenX - width/2,
            screenY - height/2,
            width,
            height
        );
        
        // Add depth-based glow effect *WHIRR*
        ctx.shadowColor = 'rgba(255, 0, 128, 0.5)';
        ctx.shadowBlur = Math.min(20, size/2);
    }
    
    ctx.restore();
    
    // Draw distance indicator
    ctx.font = 'bold 16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff0000';
    ctx.fillText(`${Math.floor(distance)}m`, screenX, screenY - size/2 - 10);
    
    // Draw warning for close enemies
    if (distance < 2) {
        ctx.font = 'bold 14px "Press Start 2P"';
        ctx.fillStyle = '#ff0000';
        ctx.fillText('⚠️ DANGER!', screenX, screenY - size);
    }
    
    ctx.restore();
}
