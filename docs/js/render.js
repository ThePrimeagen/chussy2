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
    
    for (let i = 0; i < numRays; i++) {
        const rayAngle = player.angle - player.fov/2 + rayStep * i;
        const distance = castRay(rayAngle, player.x, player.y);
        // Scale wall height by distance and FOV
        const wallHeight = (canvas.height / distance) * (Math.cos(rayAngle - player.angle));
        
        // Solid dark red walls with no transparency
        ctx.fillStyle = '#8B2500';  // Dark red walls
        ctx.fillRect(i, (canvas.height-wallHeight)/2, 1, wallHeight);
    }
}

export function drawHUD(ctx, state) {
    // Health bar
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 10, 200 * (state.player.health / state.player.maxHealth), 20);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(10, 10, 200, 20);
    
    // Crosshair - perfectly centered with pixel-perfect alignment
    const centerX = Math.floor(ctx.canvas.width / 2) + 0.5;  // Add 0.5 for crisp lines
    const centerY = Math.floor(ctx.canvas.height / 2) + 0.5;
    const size = 16;  // Slightly smaller for better precision
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;  // Thinner lines for precision
    
    // Draw crosshair with single path for better performance
    ctx.beginPath();
    // Horizontal line
    ctx.moveTo(centerX - size/2, centerY);
    ctx.lineTo(centerX + size/2, centerY);
    // Vertical line
    ctx.moveTo(centerX, centerY - size/2);
    ctx.lineTo(centerX, centerY + size/2);
    ctx.stroke();
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
    
    // Draw walls with consistent color
    for (let y = 0; y < MAP.length; y++) {
        for (let x = 0; x < MAP[y].length; x++) {
            if (MAP[y][x] === 1) {
                ctx.fillStyle = '#8B2500';  // Solid dark red walls
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
