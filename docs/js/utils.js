// Game Configuration
export const GAME_CONFIG = {
    MAP_SIZE: { width: 32, height: 32 },
    TILE_SIZE: 32,
    PLAYER_SPEED: 0.0035,  // *WHIRR* PRECISE MOVEMENT ENGAGED! 🤖
    ENEMY_SPEED: 2,
    SPAWN_INTERVAL: 2000,
    FOV: Math.PI / 3,
    PATHFINDING: {
        MAX_PATH_LENGTH: 100,
        DIAGONAL_COST: 1.4,
        STRAIGHT_COST: 1
    },
    SOUND_EFFECTS: {
        GUNSHOT: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'
    },
    SPRITES: {
        COLLECTIBLES: {
            CHEESE_1: { src: 'resources/sprites/ships_packed.png', x: 256, y: 0, width: 32, height: 32 },
            CHEESE_2: { src: 'resources/sprites/ships_packed.png', x: 288, y: 0, width: 32, height: 32 },
            CHEESE_3: { src: 'resources/sprites/ships_packed.png', x: 320, y: 0, width: 32, height: 32 }
        },
        ENEMIES: {
            ENEMY_1: { src: 'resources/sprites/ships_packed.png', x: 0, y: 0, width: 32, height: 32 },
            ENEMY_2: { src: 'resources/sprites/ships_packed.png', x: 32, y: 0, width: 32, height: 32 },
            ENEMY_3: { src: 'resources/sprites/ships_packed.png', x: 64, y: 0, width: 32, height: 32 },
            ENEMY_4: { src: 'resources/sprites/ships_packed.png', x: 96, y: 0, width: 32, height: 32 },
            ENEMY_5: { src: 'resources/sprites/ships_packed.png', x: 128, y: 0, width: 32, height: 32 }
        },
        BULLET: { src: 'resources/sprites/ships_packed.png', x: 192, y: 0, width: 16, height: 16 },
        TARGET: { src: 'resources/sprites/ships_packed.png', x: 224, y: 0, width: 32, height: 32 }
    }
};

export function calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function worldToScreen(x, y, playerX, playerY, playerAngle, canvas) {
    const dx = x - playerX;
    const dy = y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate angle in world space without applying player rotation
    const angle = Math.atan2(dy, dx);
    const relativeAngle = ((angle - playerAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    
    const fov = GAME_CONFIG.FOV;
    // Project onto screen space while preserving world position
    const screenX = ((relativeAngle / fov) + 1) * canvas.width / 2;
    const screenY = canvas.height / 2;
    const size = (canvas.height / distance) * (Math.cos(relativeAngle) * 0.8);
    
    return { screenX, screenY, size, distance };
}

export const spriteCache = {};

export async function loadSprite(spriteName) {
    if (spriteCache[spriteName]) return spriteCache[spriteName];
    
    let sprite;
    if (spriteName === 'BULLET') {
        sprite = GAME_CONFIG.SPRITES.BULLET;
    } else if (spriteName.startsWith('ENEMY_')) {
        sprite = GAME_CONFIG.SPRITES.ENEMIES[spriteName];
    } else {
        sprite = GAME_CONFIG.SPRITES.COLLECTIBLES[spriteName];
    }
    
    if (!sprite) {
        // Use yellow square as placeholder per ThePrimeagen's instruction
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'yellow';
        ctx.fillRect(0, 0, 16, 16);
        spriteCache[spriteName] = canvas;
        return canvas;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = sprite.width;
    canvas.height = sprite.height;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.src = sprite.src;
    
    return new Promise((resolve, reject) => {
        img.onload = () => {
            ctx.drawImage(img, 
                sprite.x || 0, sprite.y || 0, 
                sprite.width, sprite.height,
                0, 0, 
                sprite.width, sprite.height
            );
            spriteCache[spriteName] = canvas;
            resolve(canvas);
        };
        img.onerror = () => {
            // Fallback to yellow square on error
            ctx.fillStyle = 'yellow';
            ctx.fillRect(0, 0, sprite.width, sprite.height);
            spriteCache[spriteName] = canvas;
            resolve(canvas);
        };
    });
}
