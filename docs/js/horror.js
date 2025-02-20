import { GAME_CONFIG } from './utils.js';
import { calculateDistance } from './utils.js';

const horrorSounds = {
    JUMPSCARE: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'),
    AMBIENT: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'),
    HEARTBEAT: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'),
    ENEMY_GROWL: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
};

// Initialize horror state
export function initHorrorState(state) {
    state.horror = {
        lastJumpscare: 0,
        jumpscareTimeout: 3000,
        lastAmbient: 0,
        ambientTimeout: 10000,
        lastHeartbeat: 0,
        heartbeatTimeout: 1000,
        screenEffects: []
    };
}

// Add screen distortion effect
function addScreenEffect(state, type, duration) {
    state.horror.screenEffects.push({
        type,
        startTime: Date.now(),
        duration
    });
}

export function triggerJumpscare(state, ctx) {
    const now = Date.now();
    if (now - state.horror.lastJumpscare < state.horror.jumpscareTimeout) return;
    state.horror.lastJumpscare = now;

    // Flash screen red with distortion
    ctx.save();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Add screen distortion
    ctx.filter = 'blur(5px) contrast(150%)';
    ctx.drawImage(ctx.canvas, 
        Math.random() * 20 - 10, 
        Math.random() * 20 - 10, 
        ctx.canvas.width, 
        ctx.canvas.height
    );
    ctx.filter = 'none';
    ctx.restore();
    
    // Play jumpscare sound with enemy growl
    horrorSounds.JUMPSCARE.play().catch(e => console.error('Audio failed:', e));
    horrorSounds.ENEMY_GROWL.play().catch(e => console.error('Audio failed:', e));
    
    // Violent screen shake
    ctx.canvas.style.transform = `translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 4 - 2}deg)`;
    setTimeout(() => ctx.canvas.style.transform = '', 300);
    
    // Add screen effect
    addScreenEffect(state, 'distortion', 500);
}

export function updateHorror(state, player) {
    if (!state.enemies || !state.horror) return;
    
    const now = Date.now();
    
    // Update ambient sounds
    if (now - state.horror.lastAmbient > state.horror.ambientTimeout) {
        horrorSounds.AMBIENT.play().catch(e => console.error('Audio failed:', e));
        state.horror.lastAmbient = now;
    }
    
    // Update heartbeat for low health
    if (player.health < 30 && now - state.horror.lastHeartbeat > state.horror.heartbeatTimeout) {
        horrorSounds.HEARTBEAT.play().catch(e => console.error('Audio failed:', e));
        state.horror.lastHeartbeat = now;
    }
    
    // Check enemy proximity
    state.enemies.forEach(enemy => {
        const distance = calculateDistance(player.x, player.y, enemy.x, enemy.y);
        
        // Trigger jumpscare when enemy gets too close or appears suddenly
        if ((distance < 1.5 && !enemy.jumpscareTriggered) || 
            (distance < 3 && enemy.justSpawned)) {
            triggerJumpscare(state, ctx);
            enemy.jumpscareTriggered = true;
            enemy.justSpawned = false;
            setTimeout(() => enemy.jumpscareTriggered = false, 5000);
        }
        
        // Random enemy growls
        if (Math.random() < 0.001 && distance < 5) {
            horrorSounds.ENEMY_GROWL.play().catch(e => console.error('Audio failed:', e));
        }
    });
    
    // Clean up expired screen effects
    state.horror.screenEffects = state.horror.screenEffects.filter(effect => 
        now - effect.startTime < effect.duration
    );
}
