// Game Configuration
export const GAME_CONFIG = {
    MAP_SIZE: { width: 32, height: 32 },
    TILE_SIZE: 32,
    PLAYER_SPEED: 0.033,
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
    const angle = Math.atan2(dy, dx) - playerAngle;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const screenX = (Math.tan(angle) + 1) * canvas.width / 2;
    const screenY = canvas.height / 2;
    const size = canvas.height / distance;
    return { screenX, screenY, size, distance };
}
