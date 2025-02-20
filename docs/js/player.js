import { GAME_CONFIG } from './utils.js';
import { checkWallCollision } from './map.js';

export const player = {
    x: 1.5,
    y: 1.5,
    angle: 0,
    fov: GAME_CONFIG.FOV,
    speed: GAME_CONFIG.PLAYER_SPEED,
    arms: {
        swingOffset: 0,
        swingSpeed: 0.1
    }
};

export function updatePlayerMovement(keys) {
    if (keys.w) {
        const newX = player.x + Math.cos(player.angle) * player.speed;
        const newY = player.y + Math.sin(player.angle) * player.speed;
        if (!checkWallCollision(newX, newY)) {
            player.x = newX;
            player.y = newY;
        }
    }
    if (keys.s) {
        const newX = player.x - Math.cos(player.angle) * player.speed;
        const newY = player.y - Math.sin(player.angle) * player.speed;
        if (!checkWallCollision(newX, newY)) {
            player.x = newX;
            player.y = newY;
        }
    }
    if (keys.a) {
        player.angle -= 0.1;
    }
    if (keys.d) {
        player.angle += 0.1;
    }
}

export function shoot(state) {
    const now = Date.now();
    if (now - state.lastShot >= state.shootCooldown) {
        state.projectiles.push({
            x: player.x,
            y: player.y,
            angle: player.angle,
            speed: 0.5
        });
        state.lastShot = now;
    }
}
