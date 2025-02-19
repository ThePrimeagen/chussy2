// Autoplay AI for demo purposes
function updateAutoplay() {
    if (!state.autoplay) return;

    // Find closest enemy
    let closestEnemy = null;
    let closestDist = Infinity;
    
    state.enemies.forEach(enemy => {
        const dx = enemy.x - state.player.x;
        const dy = enemy.y - state.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
            closestDist = dist;
            closestEnemy = enemy;
        }
    });

    if (closestEnemy) {
        // Calculate angle to enemy
        const dx = closestEnemy.x - state.player.x;
        const dy = closestEnemy.y - state.player.y;
        const targetAngle = Math.atan2(dy, dx);
        
        // Turn towards enemy
        const angleDiff = (targetAngle - state.player.angle + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        if (angleDiff > 0.1) {
            state.keys.turnRight = true;
            state.keys.turnLeft = false;
        } else if (angleDiff < -0.1) {
            state.keys.turnLeft = true;
            state.keys.turnRight = false;
        } else {
            state.keys.turnLeft = false;
            state.keys.turnRight = false;
        }

        // Move towards enemy if too far, away if too close
        if (closestDist > 200) {
            state.keys.forward = true;
            state.keys.backward = false;
        } else if (closestDist < 150) {
            state.keys.backward = true;
            state.keys.forward = false;
        } else {
            state.keys.forward = false;
            state.keys.backward = false;
        }

        // Shoot if facing enemy
        if (Math.abs(angleDiff) < 0.2) {
            state.keys.shoot = true;
        }
    }
}

// Add autoplay toggle button
const autoplayBtn = document.createElement('button');
autoplayBtn.textContent = 'Toggle Autoplay';
autoplayBtn.style.position = 'fixed';
autoplayBtn.style.top = '80px';
autoplayBtn.style.right = '10px';
autoplayBtn.style.zIndex = 1000;
autoplayBtn.onclick = () => {
    state.autoplay = !state.autoplay;
    autoplayBtn.textContent = state.autoplay ? 'Disable Autoplay' : 'Enable Autoplay';
};
document.body.appendChild(autoplayBtn);
