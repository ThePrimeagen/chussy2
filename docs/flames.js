// Create falling flame emojis
function createFlame() {
    const flame = document.createElement('div');
    flame.className = 'flame';
    flame.textContent = '🔥';
    flame.style.left = Math.random() * 100 + 'vw';
    flame.style.animationDuration = Math.random() * 3 + 2 + 's';
    document.getElementById('flameContainer').appendChild(flame);
    
    flame.addEventListener('animationend', () => {
        flame.remove();
    });
}

// Create new flames periodically
setInterval(createFlame, 500);
