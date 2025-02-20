import { MAP } from './map.js';
import { GAME_CONFIG } from './utils.js';

class Node {
    constructor(x, y, g = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.g = g;
        this.h = h;
        this.f = g + h;
        this.parent = null;
    }
}

class PriorityQueue {
    constructor() {
        this.values = [];
    }
    
    enqueue(node) {
        this.values.push(node);
        this.sort();
    }
    
    dequeue() {
        return this.values.shift();
    }
    
    sort() {
        this.values.sort((a, b) => a.f - b.f);
    }
}

export function findPath(startX, startY, endX, endY) {
    const openSet = new PriorityQueue();
    const closedSet = new Set();
    const start = new Node(Math.floor(startX), Math.floor(startY));
    const end = new Node(Math.floor(endX), Math.floor(endY));
    
    openSet.enqueue(start);
    
    while (openSet.values.length > 0) {
        const current = openSet.dequeue();
        
        if (current.x === end.x && current.y === end.y) {
            const path = [];
            let temp = current;
            while (temp.parent) {
                path.push({ x: temp.x + 0.5, y: temp.y + 0.5 });
                temp = temp.parent;
            }
            return path.reverse();
        }
        
        closedSet.add(`${current.x},${current.y}`);
        
        // Check neighbors
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const newX = current.x + dx;
                const newY = current.y + dy;
                
                if (newX < 0 || newX >= MAP[0].length || 
                    newY < 0 || newY >= MAP.length || 
                    MAP[newY][newX] === 1) continue;
                
                // Prevent diagonal movement through walls
                if (dx !== 0 && dy !== 0) {
                    if (MAP[current.y][newX] === 1 || MAP[newY][current.x] === 1) continue;
                }
                
                const neighbor = new Node(newX, newY);
                if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;
                
                const gScore = current.g + ((dx === 0 || dy === 0) ? 
                    GAME_CONFIG.PATHFINDING.STRAIGHT_COST : 
                    GAME_CONFIG.PATHFINDING.DIAGONAL_COST);
                    
                neighbor.g = gScore;
                neighbor.h = Math.abs(end.x - newX) + Math.abs(end.y - newY);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
                
                openSet.enqueue(neighbor);
            }
        }
    }
    
    return null;
}
