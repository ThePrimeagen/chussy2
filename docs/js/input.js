import { worldToScreen } from './utils.js';
import { player } from './player.js';
import { shoot } from './player.js';

export const keys = {
    w: false,
    s: false,
    a: false,
    d: false,
    ' ': false
};

export function createFlame() {
    const flame = document.createElement('div');
    flame.className = 'flame';
    flame.textContent = Math.random() > 0.5 ? '🔥' : '🥟';
    flame.style.left = Math.random() * 100 + 'vw';
    flame.style.animationDuration = Math.random() * 3 + 2 + 's';
    document.getElementById('flameContainer').appendChild(flame);
    flame.addEventListener('animationend', () => flame.remove());
}

export async function updateAutoplay(state, player) {
    const now = Date.now();
    
    if (!state.autoplay.enabled && now - state.autoplay.lastActivity > state.autoplay.inactivityThreshold) {
        state.autoplay.enabled = true;
        console.log('Autoplay activated');
        state.sounds.ping.play().catch(e => console.log('Audio play failed:', e));
        state.autoplay.lastPing = now;
    }
    
    if (state.autoplay.enabled && now - state.autoplay.lastPing >= state.autoplay.pingInterval) {
        try {
            await state.sounds.ping.play();
            state.autoplay.lastPing = now;
        } catch (error) {
            console.error('Audio playback failed:', error);
            // Continue without audio rather than breaking gameplay
            state.autoplay.lastPing = now;
        }
    }

    if (state.autoplay.enabled) {
        let nearestEnemy = null;
        let minDist = Infinity;
        state.enemies.forEach(enemy => {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearestEnemy = enemy;
            }
        });
        state.autoplay.targetEnemy = nearestEnemy;

        if (now > state.autoplay.nextMoveTime) {
            state.autoplay.nextMoveTime = now + state.autoplay.moveInterval;
            keys.w = Math.random() > 0.5;
            keys.s = !keys.w;
            keys.a = Math.random() > 0.5;
            keys.d = !keys.a;
        }

        if (nearestEnemy) {
            const targetAngle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x);
            player.angle = targetAngle;
            keys[' '] = true;
        }
    }
}

export function setupInputHandlers(state) {
    document.addEventListener('keydown', (e) => {
        if (e.key in keys) {
            keys[e.key] = true;
            state.autoplay.enabled = false;
            state.autoplay.lastActivity = Date.now();
        }
        // Toggle streamer mode with 'V' key
        if (e.key.toLowerCase() === 'v') {
            const webcam = document.getElementById('webcamVideo');
            webcam.classList.toggle('streamer-mode');
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key in keys) {
            keys[e.key] = false;
            state.autoplay.lastActivity = Date.now();
        }
    });
    
    // Handle mouse camera control and pointer lock
    document.addEventListener('mousedown', () => {
        const canvas = document.getElementById('gameCanvas');
        canvas.requestPointerLock();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === document.getElementById('gameCanvas')) {
            const sensitivity = 0.003;  // Adjust for smooth control
            player.angle += e.movementX * sensitivity;
            
            // Keep angle normalized
            player.angle = ((player.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            
            state.autoplay.enabled = false;
            state.autoplay.lastActivity = Date.now();
        }
    });
    
    // Handle left mouse button shooting
    document.addEventListener('click', (e) => {
        if (e.button !== 0) return;  // Only left click
        
        shoot(state);
        state.autoplay.enabled = false;
        state.autoplay.lastActivity = Date.now();
    });

    setInterval(createFlame, 500);
}
