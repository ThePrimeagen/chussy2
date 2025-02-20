import { GAME_CONFIG } from './utils.js';
import { calculateDistance } from './utils.js';

const horrorSounds = {
    JUMPSCARE: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'),
    AMBIENT: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
};

export function triggerJumpscare(state, ctx) {
    // Flash screen red
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Play jumpscare sound
    horrorSounds.JUMPSCARE.play().catch(e => console.error('Audio failed:', e));
    
    // Shake screen
    ctx.canvas.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
    setTimeout(() => ctx.canvas.style.transform = '', 200);
}

export function updateHorror(state, player) {
    if (!state.enemies) return;
    
    state.enemies.forEach(enemy => {
        const distance = calculateDistance(player.x, player.y, enemy.x, enemy.y);
        
        // Trigger jumpscare when enemy gets too close
        if (distance < 1.5 && !enemy.jumpscareTriggered) {
            triggerJumpscare(state, ctx);
            enemy.jumpscareTriggered = true;
            setTimeout(() => enemy.jumpscareTriggered = false, 5000);
        }
    });
}
