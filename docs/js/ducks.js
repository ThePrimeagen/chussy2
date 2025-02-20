import { GAME_CONFIG } from './utils.js';
import { checkWallCollision } from './map.js';
import { findPath } from './pathfinding.js';

export class Duck {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = GAME_CONFIG.DUCK_SPEED;
        this.health = 100;
        this.unlocked = false;
        this.price = 100; // coins needed to unlock
    }
}

export const duckTypes = {
    NORMAL: 'NORMAL',
    GOLDEN: 'GOLDEN',
    RAINBOW: 'RAINBOW',
    CYBER: 'CYBER',
    NINJA: 'NINJA'
};

// Update GAME_CONFIG in utils.js with duck sprites and settings
const duckConfig = {
    DUCK_SPEED: 0.05,
    SPRITES: {
        DUCKS: {
            NORMAL: { src: 'sprites/duck_normal.png', width: 32, height: 32 },
            GOLDEN: { src: 'sprites/duck_golden.png', width: 32, height: 32 },
            RAINBOW: { src: 'sprites/duck_rainbow.png', width: 32, height: 32 },
            CYBER: { src: 'sprites/duck_cyber.png', width: 32, height: 32 },
            NINJA: { src: 'sprites/duck_ninja.png', width: 32, height: 32 }
        }
    }
};

export function spawnDuck(state, type = duckTypes.NORMAL) {
    // Find valid spawn position
    let x, y;
    do {
        x = Math.random() * (MAP[0].length - 2) + 1;
        y = Math.random() * (MAP.length - 2) + 1;
    } while (checkWallCollision(x, y));

    const duck = new Duck(x, y);
    duck.type = type;
    state.ducks.push(duck);
}

export function updateDucks(state, player) {
    if (!state.ducks) return;

    state.ducks.forEach(duck => {
        if (!duck.unlocked) return; // Only move unlocked ducks
        
        // Use pathfinding to follow player
        const path = findPath(duck.x, duck.y, player.x, player.y);
        if (path && path.length > 0) {
            const nextPoint = path[0];
            const angle = Math.atan2(nextPoint.y - duck.y, nextPoint.x - duck.x);
            
            // Move towards next point
            const newX = duck.x + Math.cos(angle) * duck.speed;
            const newY = duck.y + Math.sin(angle) * duck.speed;
            
            if (!checkWallCollision(newX, newY)) {
                duck.x = newX;
                duck.y = newY;
            }
        }
    });
}

export function renderDuck(ctx, duck, player, canvas) {
    // Similar to enemy rendering but with duck sprites
    const { screenX, screenY, size } = worldToScreen(duck.x, duck.y, player.x, player.y, player.angle, canvas);
    
    // Draw duck sprite
    ctx.save();
    ctx.fillStyle = duck.unlocked ? '#00ff00' : '#ff0000';
    ctx.beginPath();
    ctx.arc(screenX, screenY, size/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw price if not unlocked
    if (!duck.unlocked) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${duck.price} coins`, screenX, screenY - size/2);
    }
    
    ctx.restore();
}
