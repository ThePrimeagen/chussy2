import { GAME_CONFIG } from './utils.js';

export const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1]
];

// Pre-calculate step size for better performance
const RAY_STEP = 0.1;
const MAX_DISTANCE = 20;

export function castRay(rayAngle, playerX, playerY) {
    // Pre-calculate ray direction once
    const rayDirX = Math.cos(rayAngle);
    const rayDirY = Math.sin(rayAngle);
    
    // Pre-calculate step increments
    const stepX = rayDirX * RAY_STEP;
    const stepY = rayDirY * RAY_STEP;
    
    let rayX = playerX;
    let rayY = playerY;
    let distance = 0;
    
    // Cache map bounds for faster bounds checking
    const mapHeight = MAP.length;
    const mapWidth = MAP[0].length;
    
    while (distance < MAX_DISTANCE) {
        rayX += stepX;
        rayY += stepY;
        distance += RAY_STEP;
        
        // Use bitwise OR 0 for faster integer conversion
        const mapX = rayX | 0;
        const mapY = rayY | 0;
        
        // Fast bounds check before array access
        if (mapY >= 0 && mapY < mapHeight && mapX >= 0 && mapX < mapWidth && MAP[mapY][mapX] === 1) {
            return distance;
        }
    }
    return distance;
}

// Cache map dimensions for faster collision checks
const MAP_HEIGHT = MAP.length;
const MAP_WIDTH = MAP[0].length;

export function checkWallCollision(x, y, radius = 0.2) {
    // Use bitwise OR 0 for faster integer conversion
    const mapY = y | 0;
    const mapX = x | 0;
    
    // Check entity corners based on radius
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const checkX = (x + dx * radius) | 0;
            const checkY = (y + dy * radius) | 0;
            if (checkY >= 0 && checkY < MAP_HEIGHT && checkX >= 0 && checkX < MAP_WIDTH && MAP[checkY][checkX] === 1) return true;
        }
    }
    return false;
}
