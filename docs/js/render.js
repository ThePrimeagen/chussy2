import { castRay, MAP } from './map.js';
import { GAME_CONFIG } from './utils.js';

export function drawWalls(ctx, player, canvas) {
    // Elementary sky rendering with animated stars
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000033');  // Deep space
    gradient.addColorStop(0.3, '#000066'); // Upper atmosphere
    gradient.addColorStop(0.5, '#0066cc'); // Horizon
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animate twinkling stars
    const starCount = 100;
    const starTime = Date.now() * 0.001;
    for (let i = 0; i < starCount; i++) {
        const x = Math.sin(i * 567.5) * canvas.width;
        const y = Math.cos(i * 321.7) * canvas.height/2;
        const twinkle = Math.sin(starTime + i * 0.5) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    // Enhanced floor with depth gradient
    const floorGradient = ctx.createLinearGradient(0, canvas.height/2, 0, canvas.height);
    floorGradient.addColorStop(0, '#666666');  // Far floor
    floorGradient.addColorStop(1, '#333333');  // Near floor
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

    const numRays = canvas.width;
    const rayStep = player.fov / numRays;
    
    // Soothing wall colors with subtle gradient
    for (let i = 0; i < numRays; i++) {
        const rayAngle = player.angle - player.fov/2 + rayStep * i;
        const distance = castRay(rayAngle, player.x, player.y);
        const wallHeight = canvas.height / distance;
        
        // Create a soothing blue-gray gradient based on distance
        const intensity = Math.min(255, 180 + (distance * 10));
        ctx.fillStyle = `rgb(${intensity-40}, ${intensity-20}, ${intensity})`;
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
    // Clear minimap
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw walls
    const tileSize = ctx.canvas.width / MAP[0].length;
    for (let y = 0; y < MAP.length; y++) {
        for (let x = 0; x < MAP[y].length; x++) {
            if (MAP[y][x] === 1) {
                ctx.fillStyle = '#8090a0';  // Soothing blue-gray to match main view
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
    
    // Draw enemies
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
