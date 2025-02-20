import { GAME_CONFIG } from './utils.js';
import { checkWallCollision } from './map.js';

export const player = {
    x: 1.5,
    y: 1.5,
    angle: 0,
    fov: GAME_CONFIG.FOV,
    speed: GAME_CONFIG.PLAYER_SPEED * 0.3, // Reduced movement speed
    turnSpeed: 0.075,  // Increased by 1.5x
    rotationVelocity: 0,
    rotationAcceleration: 0.016, // Doubled for faster response
    rotationFriction: 0.85,     // Increased for smoother turning
    velocity: { x: 0, y: 0 },
    acceleration: 0.005, // Reduced for slower movement
    friction: 0.92, // Increased friction to slow movement
    health: 100,
    maxHealth: 100,
    arms: {
        swingOffset: 0,
        swingSpeed: 0.1
    }
};

export function updatePlayerMovement(keys) {
    // Apply acceleration based on input
    if (keys.w) {
        player.velocity.x += Math.cos(player.angle) * player.acceleration;
        player.velocity.y += Math.sin(player.angle) * player.acceleration;
    }
    if (keys.s) {
        player.velocity.x -= Math.cos(player.angle) * player.acceleration;
        player.velocity.y -= Math.sin(player.angle) * player.acceleration;
    }
    
    // Apply friction
    player.velocity.x *= player.friction;
    player.velocity.y *= player.friction;
    
    // Update position with collision check
    const newX = player.x + player.velocity.x;
    const newY = player.y + player.velocity.y;
    if (!checkWallCollision(newX, newY)) {
        player.x = newX;
        player.y = newY;
    } else {
        // Reset velocity on collision
        player.velocity.x = 0;
        player.velocity.y = 0;
    }
    
    // Smoother turning
    // Apply rotation acceleration
    if (keys.a) {
        player.rotationVelocity -= player.rotationAcceleration;
    }
    if (keys.d) {
        player.rotationVelocity += player.rotationAcceleration;
    }
    
    // Apply rotation friction
    player.rotationVelocity *= player.rotationFriction;
    player.angle += player.rotationVelocity;
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
