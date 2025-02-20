import { GAME_CONFIG } from './utils.js';
import { checkWallCollision } from './map.js';
import { calculateDistance, worldToScreen } from './utils.js';

export function spawnEnemy(state, playerX, playerY) {
    if (!state.enemies || !Array.isArray(state.enemies)) {
        state.enemies = [];
    }
    
    let x, y;
    do {
        const angle = Math.random() * Math.PI * 2;
        const distance = 5;
        x = playerX + Math.cos(angle) * distance;
        y = playerY + Math.sin(angle) * distance;
    } while (checkWallCollision(x, y));
    
    state.enemies.push({
        x: x,
        y: y,
        health: 100,
        type: 'chad',
        lastMove: Date.now()
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
                
                if (dist < 0.5) {
                    state.player.health = Math.max(0, state.player.health - 0.5);
                    if (state.player.health <= 0) {
                        state.gameOver = true;
                        return;
                    }
                }
                
                if (!checkWallCollision(newX, newY)) {
                    enemy.x = newX;
                    enemy.y = newY;
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
    
    // Convert world space to screen space
    const angle = Math.atan2(dy, dx) - player.angle;
    const screenX = (Math.tan(angle) + 1) * canvas.width / 2;
    const screenY = canvas.height / 2;
    const size = canvas.height / distance;
    
    // Draw enemy with bright colors and effects
    ctx.save();
    
    // Draw pulsing glow effect
    const pulseScale = 1 + Math.sin(Date.now() / 200) * 0.2;
    const glowSize = size * pulseScale;
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fill();
    
    // Draw targeting lines
    ctx.beginPath();
    ctx.moveTo(screenX - size/2, screenY);
    ctx.lineTo(screenX + size/2, screenY);
    ctx.moveTo(screenX, screenY - size/2);
    ctx.lineTo(screenX, screenY + size/2);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw enemy body with thick outline
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(screenX - size/2, screenY - size/2, size, size);
    ctx.strokeRect(screenX - size/2, screenY - size/2, size, size);
    
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
