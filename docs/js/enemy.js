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
    
    // Convert world space to screen space
    const angle = Math.atan2(dy, dx) - player.angle;
    const screenX = (Math.tan(angle) + 1) * canvas.width / 2;
    const screenY = canvas.height / 2;
    const size = canvas.height / distance;
    
    // Draw enemy with distinct colors and effects
    ctx.save();
    
    // Draw pulsing glow effect with unique color
    const pulseScale = 1 + Math.sin(Date.now() / 200) * 0.2;
    const glowSize = size * pulseScale;
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 102, 0, 0.3)';
    ctx.fill();
    
    // Draw enemy body with contrasting colors
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#ff3300';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#ff9900';
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
