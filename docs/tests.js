// Game functionality tests
function runTests() {
    console.log('Running game functionality tests...');
    
    // Test state initialization
    console.assert(state.enemies && Array.isArray(state.enemies), 'state.enemies should be initialized as array');
    console.assert(state.coins && Array.isArray(state.coins), 'state.coins should be initialized as array');
    console.assert(state.projectiles && Array.isArray(state.projectiles), 'state.projectiles should be initialized as array');
    
    // Test player movement.
    const originalX = state.player.x;
    const originalY = state.player.y;
    state.keys.forward = true;
    updateGame();
    console.assert(state.player.x !== originalX || state.player.y !== originalY, 'Player should move when forward key pressed');
    state.keys.forward = false;
    
    // Test RGB shadow strobing
    const originalShadowColor = state.currentShadowColor;
    state.lastStrobeTime = Date.now() - 251; // Force strobe update
    drawGame();
    console.assert(state.currentShadowColor !== originalShadowColor, 'Shadow color should change every 250ms');
    
    console.log('Tests completed!');
}

// Run tests on game load
runTests();
