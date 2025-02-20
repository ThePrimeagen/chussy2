import { GAME_CONFIG } from './utils.js';
import { checkWallCollision } from './map.js';
import { calculateDistance, worldToScreen, spriteCache } from './utils.js';

export function spawnCheese(state, x, y) {
    if (!state.collectibles) {
        state.collectibles = [];
    }
    
    const cheeseType = `CHEESE_${Math.floor(Math.random() * 3) + 1}`;
    state.collectibles.push({
        x,
        y,
        type: cheeseType,
        collected: false,
        rotationAngle: Math.random() * Math.PI * 2,
        bobHeight: 0,
        bobSpeed: 0.05
    });
}

export function updateCollectibles(state, player) {
    if (!state.collectibles) return;
    
    state.collectibles.forEach(cheese => {
        if (cheese.collected) return;
        
        // Update floating animation
        cheese.bobHeight = Math.sin(Date.now() * cheese.bobSpeed) * 0.1;
        
        // Check collection
        const dx = player.x - cheese.x;
        const dy = player.y - cheese.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.5) {
            cheese.collected = true;
            if (!state.score) state.score = 0;
            state.score += 100;
        }
    });
}

export function renderCollectibles(ctx, state, player, canvas) {
    if (!state.collectibles) return;
    
    state.collectibles.forEach(cheese => {
        if (cheese.collected) return;
        
        const { screenX, screenY, size } = worldToScreen(
            cheese.x,
            cheese.y + cheese.bobHeight,
            player.x,
            player.y,
            player.angle,
            canvas
        );
        
        // Skip if outside view
        if (screenX < -size || screenX > canvas.width + size) return;
        
        // Draw cheese sprite
        ctx.save();
        
        const sprite = spriteCache[cheese.type];
        if (sprite) {
            const height = size;
            const width = height;
            
            ctx.drawImage(
                sprite,
                screenX - width/2,
                screenY - height/2,
                width,
                height
            );
            
            // Add glow effect
            ctx.shadowColor = 'rgba(255, 255, 0, 0.5)';
            ctx.shadowBlur = 15;
        }
        
        ctx.restore();
    });
}
