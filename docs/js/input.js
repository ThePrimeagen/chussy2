import { player } from './player.js';

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

export function updateAutoplay(state, player) {
    const now = Date.now();
    
    if (!state.autoplay.enabled && now - state.autoplay.lastActivity > state.autoplay.inactivityThreshold) {
        state.autoplay.enabled = true;
        console.log('Autoplay activated');
        state.sounds.ping.play().catch(e => console.log('Audio play failed:', e));
        state.autoplay.lastPing = now;
    }
    
    if (state.autoplay.enabled && now - state.autoplay.lastPing >= state.autoplay.pingInterval) {
        state.sounds.ping.play().catch(e => console.log('Audio play failed:', e));
        state.autoplay.lastPing = now;
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
    });

    document.addEventListener('keyup', (e) => {
        if (e.key in keys) {
            keys[e.key] = false;
            state.autoplay.lastActivity = Date.now();
        }
    });

    setInterval(createFlame, 500);
}
