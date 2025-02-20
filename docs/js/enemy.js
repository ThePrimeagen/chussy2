import { GAME_CONFIG, spriteCache } from './utils.js';
import { checkWallCollision } from './map.js';
import { calculateDistance, worldToScreen } from './utils.js';

export function spawnEnemy(state, playerX, playerY) {
    if (!state.enemies || !Array.isArray(state.enemies)) {
        state.enemies = [];
    }
    
    let x, y;
    const MIN_WALL_DISTANCE = 1.5;
    let attempts = 0;
    const maxAttempts = 15;
    
    function isValidSpawnPoint(x, y) {
        // Check immediate position
        if (checkWallCollision(x, y)) return false;
        
        // Check surrounding area
        for (let dx = -MIN_WALL_DISTANCE; dx <= MIN_WALL_DISTANCE; dx += 0.5) {
            for (let dy = -MIN_WALL_DISTANCE; dy <= MIN_WALL_DISTANCE; dy += 0.5) {
                if (checkWallCollision(x + dx, y + dy)) {
                    return false;
                }
            }
        }
        return true;
    }
    
    do {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 3 + 4; // Spawn between 4-7 units away
        x = playerX + Math.cos(angle) * distance;
        y = playerY + Math.sin(angle) * distance;
        attempts++;
        
        if (attempts >= maxAttempts) {
            // If we can't find a valid spawn point, try further out
            const safeAngle = Math.random() * Math.PI * 2;
            x = playerX + Math.cos(safeAngle) * 10;
            y = playerY + Math.sin(safeAngle) * 10;
            if (!isValidSpawnPoint(x, y)) {
                // If still invalid, use last valid position or default
                x = playerX + 8;
                y = playerY + 8;
            }
            break;
        }
    } while (!isValidSpawnPoint(x, y));
    
    state.enemies.push({
        x: x,
        y: y,
        health: 100,
        type: `ANIME_GIRL_${Math.floor(Math.random() * 10) + 1}`,
        lastMove: Date.now(),
        frame: 0,
        animationSpeed: 0.1
    });
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
    
    // Calculate screen position
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Convert world space to screen space with correct camera alignment
    const angle = Math.atan2(dy, dx);
    const relativeAngle = ((angle - player.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const screenX = (Math.tan(relativeAngle) + 1) * canvas.width / 2;
    const screenY = canvas.height / 2;
    const size = canvas.height / distance;
    
    // Skip if outside view
    if (screenX < -size || screenX > canvas.width + size) return;
    
    // Draw enemy sprite
    ctx.save();
    
    const sprite = spriteCache[enemy.type];
    if (sprite) {
        // Draw sprite with proper scaling
        const height = size * 1.5; // Taller than walls for visibility
        const width = height * (sprite.width / sprite.height);
        
        ctx.drawImage(
            sprite,
            screenX - width/2,
            screenY - height/2,
            width,
            height
        );
        
        // Add subtle glow effect for visibility
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 20;
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
