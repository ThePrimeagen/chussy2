// Game state
const state = {
    player: {
        x: 400,
        y: 300,
        speed: 5,
        sprite: new Image(),
        coins: 0
    },
    enemies: [],
    coins: [],
    shopItems: [
        { name: 'Speed Boost', price: 100, effect: () => { state.player.speed += 1; } },
        { name: 'Invincibility', price: 200, effect: () => { /* TODO */ } }
    ]
};

// Initialize canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load assets
state.player.sprite.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGUlEQVQYV2NkYGD4z4AHMP7//x8/BYyjAQCmBQYNBzg8PQAAAABJRU5ErkJggg==';

function spawnEnemy() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    switch(edge) {
        case 0: x = Math.random() * canvas.width; y = -32; break;
        case 1: x = canvas.width + 32; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + 32; break;
        case 3: x = -32; y = Math.random() * canvas.height; break;
    }
    state.enemies.push({ x, y, speed: 2 });
}

function spawnCoin() {
    state.coins.push({
        x: Math.random() * (canvas.width - 20),
        y: Math.random() * (canvas.height - 20)
    });
}

function updateGame() {
    // Move player
    if (keys.ArrowLeft) state.player.x -= state.player.speed;
    if (keys.ArrowRight) state.player.x += state.player.speed;
    if (keys.ArrowUp) state.player.y -= state.player.speed;
    if (keys.ArrowDown) state.player.y += state.player.speed;

    // Keep player in bounds
    state.player.x = Math.max(0, Math.min(canvas.width, state.player.x));
    state.player.y = Math.max(0, Math.min(canvas.height, state.player.y));

    // Update enemies
    state.enemies.forEach(enemy => {
        const dx = state.player.x - enemy.x;
        const dy = state.player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        enemy.x += (dx / dist) * enemy.speed;
        enemy.y += (dy / dist) * enemy.speed;
    });

    // Collect coins
    state.coins = state.coins.filter(coin => {
        const dx = state.player.x - coin.x;
        const dy = state.player.y - coin.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
            state.player.coins += 10;
            return false;
        }
        return true;
    });
}

function drawGame() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.drawImage(state.player.sprite, state.player.x - 16, state.player.y - 16);

    // Draw enemies
    ctx.fillStyle = '#f00';
    state.enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 16, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw coins
    ctx.fillStyle = '#ff0';
    state.coins.forEach(coin => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(`Coins: ${state.player.coins}`, 10, 30);
}

// Input handling
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Shop functionality
function openShop() {
    // TODO: Implement shop UI
    console.log('Shop opened');
}

// Game loop
function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Spawn enemies and coins periodically
setInterval(spawnEnemy, 3000);
setInterval(spawnCoin, 5000);

// Start game
gameLoop();
