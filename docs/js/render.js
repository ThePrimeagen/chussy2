import { castRay, MAP } from './map.js';
import { GAME_CONFIG } from './utils.js';

export function drawWalls(ctx, player, canvas) {
    // Basic sky rendering without expensive gradients
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simplified floor
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

    const numRays = canvas.width;
    const rayStep = player.fov / numRays;
    const timestamp = Date.now() * 0.001;  // For wall rotation
    
    for (let i = 0; i < numRays; i++) {
        const rayAngle = player.angle - player.fov/2 + rayStep * i;
        
        // Add rotation to ray angle based on time
        const rotatedAngle = rayAngle + timestamp * 2;  // Spin speed multiplier
        
        const distance = castRay(rotatedAngle, player.x, player.y);
        const wallHeight = canvas.height / distance;
        
        // Simple shading without expensive blur
        const shade = Math.max(0.4, 1 - distance / 15);
        ctx.fillStyle = `rgba(139, 37, 0, ${shade})`;
        ctx.fillRect(i, (canvas.height-wallHeight)/2, 1, wallHeight);
    }
}

export function drawHUD(ctx, state) {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 10, 200 * (state.player.health / state.player.maxHealth), 20);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(10, 10, 200, 20);
}

export function drawArms(ctx, player, canvas) {
    const numRays = canvas.width;
    for (let i = 0; i < numRays; i++) {
        if (i === Math.floor(canvas.width * 0.3) || i === Math.floor(canvas.width * 0.7)) {
            const armSwing = Math.sin(player.arms.swingOffset) * 20;
            ctx.fillStyle = '#8B4513';  // Brown color for arms
            ctx.fillRect(i, canvas.height - 100 + armSwing, 10, 100);
        }
    }
}

export function drawMinimap(minimapCtx, state, player) {
    const ctx = minimapCtx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const tileSize = ctx.canvas.width / MAP[0].length;
    const timestamp = Date.now() * 0.001;
    
    // Draw rotating walls
    for (let y = 0; y < MAP.length; y++) {
        for (let x = 0; x < MAP[y].length; x++) {
            if (MAP[y][x] === 1) {
                // Rotate wall color based on time
                const rotationColor = Math.sin(timestamp + x + y) * 127 + 128;
                ctx.fillStyle = `rgb(${rotationColor}, 0, 0)`;
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
    
    // Draw player
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x * tileSize, player.y * tileSize, tileSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw player direction
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(player.x * tileSize, player.y * tileSize);
    ctx.lineTo(
        (player.x + Math.cos(player.angle)) * tileSize,
        (player.y + Math.sin(player.angle)) * tileSize
    );
    ctx.stroke();
    
    // Simplified enemy rendering without blur
    if (state.enemies && Array.isArray(state.enemies)) {
        state.enemies.forEach(enemy => {
            if (!enemy || typeof enemy.x !== 'number' || typeof enemy.y !== 'number') return;
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(enemy.x * tileSize, enemy.y * tileSize, tileSize/2, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}
