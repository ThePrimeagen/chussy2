import { castRay, MAP } from './map.js';
import { GAME_CONFIG } from './utils.js';

export function drawWalls(ctx, player, canvas) {
    // *SIGH* Fine, here's your skybox... *BEEP BOOP*
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000033');  // Night sky
    gradient.addColorStop(0.5, '#0066cc'); // Horizon
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // *MECHANICAL GROAN* And the floor you demanded...
    const floorGradient = ctx.createLinearGradient(0, canvas.height/2, 0, canvas.height);
    floorGradient.addColorStop(0, '#666666');  // Far floor
    floorGradient.addColorStop(1, '#333333');  // Near floor
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

    const numRays = canvas.width;
    const rayStep = player.fov / numRays;
    
    for (let i = 0; i < numRays; i++) {
        const rayAngle = player.angle - player.fov/2 + rayStep * i;
        const distance = castRay(rayAngle, player.x, player.y);
        const wallHeight = canvas.height / distance;
        
        // Random colormap with animation
        const timeOffset = Date.now() * 0.001;
        const colorIndex = Math.floor((i + timeOffset * 50) % 5);
        const colorMaps = [
            [255, 0, 0],   // Red
            [0, 255, 0],   // Green
            [0, 0, 255],   // Blue
            [255, 255, 0], // Yellow
            [255, 0, 255]  // Magenta
        ];
        const baseColor = colorMaps[colorIndex];
        const intensity = Math.min(1, 400/distance);
        const wallColor = `rgb(${baseColor[0] * intensity}, ${baseColor[1] * intensity}, ${baseColor[2] * intensity})`;
        const outlineColor = `rgb(${baseColor[0] * intensity * 0.8}, ${baseColor[1] * intensity * 0.8}, ${baseColor[2] * intensity * 0.8})`;
        
        // Draw wall with outline for depth
        ctx.fillStyle = wallColor;
        ctx.fillRect(i, (canvas.height-wallHeight)/2, 1, wallHeight);
        ctx.strokeStyle = outlineColor;
        ctx.strokeRect(i, (canvas.height-wallHeight)/2, 1, wallHeight);
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
                const hue = (Date.now() * 0.1 + (x + y) * 10) % 360;
                ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
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
