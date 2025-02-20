// Implementacja automatycznego odświeżania
let lastActivity = Date.now();

// Reset timer on user activity
document.addEventListener('mousemove', () => lastActivity = Date.now());
document.addEventListener('keydown', () => lastActivity = Date.now());
document.addEventListener('click', () => lastActivity = Date.now());

// Check every 10 seconds if we should refresh
setInterval(() => {
    if (Date.now() - lastActivity > 30000) { // 30 seconds
        window.location.reload();
    }
}, 10000);
