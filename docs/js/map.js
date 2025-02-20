import { GAME_CONFIG } from './utils.js';

export const MAP = [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1],
    [1,1,1,1,1,1,1,1]
];

export function castRay(rayAngle, playerX, playerY) {
    let rayX = playerX;
    let rayY = playerY;
    let rayDirX = Math.cos(rayAngle);
    let rayDirY = Math.sin(rayAngle);
    
    let distance = 0;
    while (distance < 20) {
        rayX += rayDirX * 0.1;
        rayY += rayDirY * 0.1;
        distance += 0.1;
        
        let mapX = Math.floor(rayX);
        let mapY = Math.floor(rayY);
        
        if (MAP[mapY] && MAP[mapY][mapX] === 1) {
            return distance;
        }
    }
    return distance;
}

export function checkWallCollision(x, y) {
    return MAP[Math.floor(y)][Math.floor(x)] === 1;
}
