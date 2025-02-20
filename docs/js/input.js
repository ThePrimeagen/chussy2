import { worldToScreen } from './enemy.js';
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
    
    // Add mouse click shooting and enemy damage *BEEP BOOP*
    document.addEventListener('click', (e) => {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicked on enemy
        state.enemies.forEach(enemy => {
            const { screenX, screenY, size } = worldToScreen(enemy.x, enemy.y, state.player.x, state.player.y, state.player.angle, canvas);
            const clickDist = Math.sqrt(Math.pow(x - screenX, 2) + Math.pow(y - screenY, 2));
            if (clickDist < size/4) {
                enemy.health -= 20;  // Reduce enemy health by 20
                if (enemy.health <= 0) {
                    state.enemies = state.enemies.filter(e => e !== enemy);
                }
            }
        });
        
        shoot(state);
        state.autoplay.enabled = false;
        state.autoplay.lastActivity = Date.now();
        
        // Add yellow star flash *WHIRR*
        const flash = document.createElement('div');
        flash.innerHTML = '⭐';
        flash.style.position = 'absolute';
        flash.style.left = e.clientX + 'px';
        flash.style.top = e.clientY + 'px';
        flash.style.color = '#ffff00';
        flash.style.animation = 'flash 0.2s forwards';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '9999';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 200);
    });

    setInterval(createFlame, 500);
}
