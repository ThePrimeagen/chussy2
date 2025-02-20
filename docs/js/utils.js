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
            CHEESE_1: { src: 'resources/sprites/cheese.png', x: 0, y: 0, width: 32, height: 32 },
            CHEESE_2: { src: 'resources/sprites/cheese.png', x: 0, y: 0, width: 32, height: 32 },
            CHEESE_3: { src: 'resources/sprites/cheese.png', x: 0, y: 0, width: 32, height: 32 }
        },
        ENEMIES: {
            ENEMY_1: { src: 'resources/sprites/anime_girls.png', x: 0, y: 0, width: 32, height: 32 },
            ENEMY_2: { src: 'resources/sprites/anime_girls.png', x: 32, y: 0, width: 32, height: 32 },
            ENEMY_3: { src: 'resources/sprites/anime_girls.png', x: 64, y: 0, width: 32, height: 32 },
            ENEMY_4: { src: 'resources/sprites/anime_girls.png', x: 96, y: 0, width: 32, height: 32 },
            ENEMY_5: { src: 'resources/sprites/anime_girls.png', x: 128, y: 0, width: 32, height: 32 },
            ENEMY_6: { src: 'resources/sprites/anime_girls.png', x: 160, y: 0, width: 32, height: 32 },
            ENEMY_7: { src: 'resources/sprites/anime_girls.png', x: 192, y: 0, width: 32, height: 32 },
            ENEMY_8: { src: 'resources/sprites/anime_girls.png', x: 224, y: 0, width: 32, height: 32 }
        },
        BULLET: { src: 'resources/sprites/ships_packed.png', x: 192, y: 0, width: 16, height: 16, color: 'yellow' },
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
    
    // Calculate angle in world space
    const angle = Math.atan2(dy, dx);
    // Calculate relative angle for screen position only
    const relativeAngle = ((angle - playerAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    
    const fov = GAME_CONFIG.FOV;
    // Project onto screen space while preserving world position
    const screenX = ((relativeAngle / fov) + 1) * canvas.width / 2;
    const screenY = canvas.height / 2;
    const size = (canvas.height / distance) * (Math.cos(relativeAngle) * 0.8);
    
    return { screenX, screenY, size, distance };
}

export const spriteCache = {};

function generateAnimeSprite(index) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Base colors for variety
    const colors = ['#FFB6C1', '#FFD700', '#87CEEB', '#98FB98', '#DDA0DD'];
    const hairColor = colors[index % colors.length];
    
    // Draw face
    ctx.fillStyle = '#FFE4E1';
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw hair
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.moveTo(4, 16);
    ctx.quadraticCurveTo(16, 0, 28, 16);
    ctx.lineTo(28, 24);
    ctx.lineTo(4, 24);
    ctx.fill();
    
    // Draw eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(12, 14, 2, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(20, 14, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
}

export async function loadSprite(spriteName) {
    if (spriteCache[spriteName]) return spriteCache[spriteName];
    
    let sprite;
    if (spriteName === 'BULLET') {
        sprite = GAME_CONFIG.SPRITES.BULLET;
    } else if (spriteName.startsWith('ENEMY_')) {
        const index = parseInt(spriteName.split('_')[1]) - 1;
        spriteCache[spriteName] = generateAnimeSprite(index);
        return spriteCache[spriteName];
    } else if (spriteName.startsWith('CHEESE_')) {
        sprite = GAME_CONFIG.SPRITES.COLLECTIBLES[spriteName];
    }
    
    if (!sprite) {
        console.error(`Sprite ${spriteName} not found, using fallback`);
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
