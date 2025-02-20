import { GAME_CONFIG } from './utils.js';

function generateMap(width, height) {
    const map = Array(height).fill().map(() => Array(width).fill(0));
    
    // Create outer walls
    for (let i = 0; i < width; i++) {
        map[0][i] = 1;
        map[height-1][i] = 1;
    }
    for (let i = 0; i < height; i++) {
        map[i][0] = 1;
        map[i][width-1] = 1;
    }
    
    // Generate maze-like pattern
    for (let y = 2; y < height-2; y += 2) {
        for (let x = 2; x < width-2; x += 2) {
            if (Math.random() < 0.4) {
                map[y][x] = 1;
                // Create connecting walls
                const direction = Math.floor(Math.random() * 4);
                switch(direction) {
                    case 0: if (y > 1) map[y-1][x] = 1; break;
                    case 1: if (x < width-2) map[y][x+1] = 1; break;
                    case 2: if (y < height-2) map[y+1][x] = 1; break;
                    case 3: if (x > 1) map[y][x-1] = 1; break;
                }
            }
        }
    }
    
    // Clear center area for enemy spawning
    const centerX = Math.floor(width/2);
    const centerY = Math.floor(height/2);
    for (let y = centerY-2; y <= centerY+2; y++) {
        for (let x = centerX-2; x <= centerX+2; x++) {
            map[y][x] = 0;
        }
    }
    
    // Clear starting area
    map[1][1] = 0;
    map[1][2] = 0;
    map[2][1] = 0;
    map[2][2] = 0;
    
    return map;
}

export const MAP = generateMap(GAME_CONFIG.MAP_SIZE.width, GAME_CONFIG.MAP_SIZE.height);

export function castRay(rayAngle, playerX, playerY) {
    const rayDirX = Math.cos(rayAngle);
    const rayDirY = Math.sin(rayAngle);
    
    let mapX = Math.floor(playerX);
    let mapY = Math.floor(playerY);
    
    // Calculate ray step and initial side distance
    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);
    
    let stepX, sideDistX;
    let stepY, sideDistY;
    
    if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (playerX - mapX) * deltaDistX;
    } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - playerX) * deltaDistX;
    }
    if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (playerY - mapY) * deltaDistY;
    } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - playerY) * deltaDistY;
    }
    
    // DDA algorithm
    let hit = 0;
    let side = 0;
    let distance = 0;
    
    while (hit === 0 && distance < 20) {
        if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0;
            distance = sideDistX - deltaDistX;
        } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1;
            distance = sideDistY - deltaDistY;
        }
        
        if (MAP[mapY] && MAP[mapY][mapX] === 1) {
            hit = 1;
        }
    }
    
    // Calculate exact hit position for texture mapping
    let wallX;
    if (side === 0) {
        wallX = playerY + distance * rayDirY;
    } else {
        wallX = playerX + distance * rayDirX;
    }
    wallX -= Math.floor(wallX);
    
    return {
        distance,
        side,
        wallX,
        mapX,
        mapY,
        rayDirX,
        rayDirY
    };
}

export function checkWallCollision(x, y) {
    const mapY = Math.floor(y);
    const mapX = Math.floor(x);
    return mapY >= 0 && mapY < MAP.length && mapX >= 0 && mapX < MAP[0].length && MAP[mapY][mapX] === 1;
}
