// Basic Three.js setup for 3D shooter
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('gameCanvas'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Basic lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Add a floor
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Add some walls
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
const walls = [];
const wallPositions = [
    { pos: [0, 2, -10], scale: [20, 4, 1] },
    { pos: [0, 2, 10], scale: [20, 4, 1] },
    { pos: [-10, 2, 0], scale: [1, 4, 20] },
    { pos: [10, 2, 0], scale: [1, 4, 20] }
];

wallPositions.forEach(({ pos, scale }) => {
    const wallGeometry = new THREE.BoxGeometry(scale[0], scale[1], scale[2]);
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(...pos);
    walls.push(wall);
    scene.add(wall);
});

// Position camera
camera.position.set(0, 2, 5);
camera.lookAt(0, 2, 0);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
