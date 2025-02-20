import { GAME_CONFIG } from './utils.js';
import { duckTypes } from './ducks.js';

export const store = {
    items: {
        [duckTypes.NORMAL]: {
            price: 100,
            description: "Just a regular duck. Quack!",
            unlocked: false
        },
        [duckTypes.GOLDEN]: {
            price: 500,
            description: "A rare golden duck! Shiny!",
            unlocked: false
        },
        [duckTypes.RAINBOW]: {
            price: 1000,
            description: "RGB duck for maximum FPS!",
            unlocked: false
        },
        [duckTypes.CYBER]: {
            price: 2000,
            description: "Cyberduck 2077",
            unlocked: false
        },
        [duckTypes.NINJA]: {
            price: 5000,
            description: "Silent but deadly",
            unlocked: false
        }
    }
};

export function purchaseDuck(state, duckType) {
    const item = store.items[duckType];
    if (!item || item.unlocked || state.coins < item.price) return false;
    
    state.coins -= item.price;
    item.unlocked = true;
    
    // Find and unlock the corresponding duck
    const duck = state.ducks.find(d => d.type === duckType);
    if (duck) duck.unlocked = true;
    
    return true;
}

export function renderStore(ctx, state) {
    const storeHeight = 200;
    const padding = 10;
    
    // Draw store background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, ctx.canvas.height - storeHeight, ctx.canvas.width, storeHeight);
    
    // Draw store title
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Duck Store', ctx.canvas.width / 2, ctx.canvas.height - storeHeight + 30);
    
    // Draw coins
    ctx.font = '18px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Coins: ${state.coins}`, ctx.canvas.width - padding, ctx.canvas.height - storeHeight + 30);
    
    // Draw items
    const itemWidth = 150;
    const itemHeight = 100;
    const itemsPerRow = Math.floor((ctx.canvas.width - padding * 2) / itemWidth);
    let x = padding;
    let y = ctx.canvas.height - storeHeight + 50;
    
    Object.entries(store.items).forEach(([type, item], index) => {
        if (index > 0 && index % itemsPerRow === 0) {
            x = padding;
            y += itemHeight + padding;
        }
        
        // Draw item background
        ctx.fillStyle = item.unlocked ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, itemWidth - padding, itemHeight - padding);
        
        // Draw item info
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(type, x + 5, y + 20);
        ctx.font = '14px Arial';
        ctx.fillText(item.description, x + 5, y + 40);
        ctx.fillText(`${item.price} coins`, x + 5, y + 60);
        
        if (!item.unlocked && state.coins >= item.price) {
            ctx.fillStyle = '#00ff00';
            ctx.fillText('Click to Purchase!', x + 5, y + 80);
        }
        
        x += itemWidth;
    });
}

export function handleStoreClick(state, x, y) {
    const storeHeight = 200;
    const padding = 10;
    const itemWidth = 150;
    const itemHeight = 100;
    const itemsPerRow = Math.floor((state.canvas.width - padding * 2) / itemWidth);
    
    // Only handle clicks in store area
    if (y < state.canvas.height - storeHeight) return;
    
    // Calculate which item was clicked
    const row = Math.floor((y - (state.canvas.height - storeHeight + 50)) / (itemHeight + padding));
    const col = Math.floor((x - padding) / itemWidth);
    const index = row * itemsPerRow + col;
    
    const duckType = Object.keys(store.items)[index];
    if (duckType) {
        purchaseDuck(state, duckType);
    }
}
