import { GAME_CONFIG } from './utils.js';
import { player } from './player.js';
import { MAP, checkWallCollision } from './map.js';
import { calculateDistance } from './utils.js';

// *BEEP BOOP* Breaking circular dependency because SOMEONE didn't think about architecture... *MECHANICAL GROAN*
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
            damage: 25,  // Increased damage per hit
            lastMove: Date.now(),
            lastAttack: 0
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

            // Enhanced damage system
            if (dist < 0.5) {
                const now = Date.now();
                if (!enemy.lastAttack || now - enemy.lastAttack > 1000) {  // Attack once per second
                    state.player.health = Math.max(0, state.player.health - enemy.damage);
                    enemy.lastAttack = now;
                    if (state.player.health <= 0) {
                        state.gameOver = true;
                    }
                }
            }
        });
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
    
    const screenX = (Math.tan(relativeAngle) + 1) * canvas.width / 2;
    const screenY = canvas.height / 2;
    const size = canvas.height / distance;
    
    // Skip if outside view
    if (screenX < -size || screenX > canvas.width + size) return;
    
    // Draw enemy with pulsing effect
    ctx.save();
    const pulseScale = 1 + Math.sin(Date.now() * 0.005) * 0.2;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(screenX, screenY, (size/4) * pulseScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
