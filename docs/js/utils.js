// Game Configuration
export const GAME_CONFIG = {
    MAP_SIZE: { width: 32, height: 32 },
    TILE_SIZE: 32,
    PLAYER_SPEED: 0.008,
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
            CHEESE_1: { src: 'sprites/cheese_1.png', width: 32, height: 32 },
            CHEESE_2: { src: 'sprites/cheese_2.png', width: 32, height: 32 },
            CHEESE_3: { src: 'sprites/cheese_3.png', width: 32, height: 32 }
        },
        ENEMIES: {
            ANIME_GIRL_1: { src: 'sprites/anime_girl_1.png', width: 64, height: 64 },
            ANIME_GIRL_2: { src: 'sprites/anime_girl_2.png', width: 64, height: 64 },
            ANIME_GIRL_3: { src: 'sprites/anime_girl_3.png', width: 64, height: 64 },
            ANIME_GIRL_4: { src: 'sprites/anime_girl_4.png', width: 64, height: 64 },
            ANIME_GIRL_5: { src: 'sprites/anime_girl_5.png', width: 64, height: 64 },
            ANIME_GIRL_6: { src: 'sprites/anime_girl_6.png', width: 64, height: 64 },
            ANIME_GIRL_7: { src: 'sprites/anime_girl_7.png', width: 64, height: 64 },
            ANIME_GIRL_8: { src: 'sprites/anime_girl_8.png', width: 64, height: 64 },
            ANIME_GIRL_9: { src: 'sprites/anime_girl_9.png', width: 64, height: 64 },
            ANIME_GIRL_10: { src: 'sprites/anime_girl_10.png', width: 64, height: 64 }
        }
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
    const angle = Math.atan2(dy, dx);
    const relativeAngle = ((angle - playerAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const screenX = (Math.tan(relativeAngle) + 1) * canvas.width / 2;
    const screenY = canvas.height / 2;
    const size = canvas.height / distance;
    return { screenX, screenY, size, distance };
}

export const spriteCache = {};

export async function loadSprite(spriteName) {
    if (spriteCache[spriteName]) return spriteCache[spriteName];
    
    const sprite = GAME_CONFIG.SPRITES.ENEMIES[spriteName];
    const img = new Image();
    img.src = sprite.src;
    
    return new Promise((resolve, reject) => {
        img.onload = () => {
            spriteCache[spriteName] = img;
            resolve(img);
        };
        img.onerror = reject;
    });
}
