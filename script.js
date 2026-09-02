const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


canvas.width = 800;
canvas.height = 400;

const gravity = 0.8;
const player = {
    x: 50, y: 300, width: 30, height: 30,
    dx: 0, dy: 0, speed: 5, jumpForce: -15, grounded: false
};

const platforms = [
    {x: 0, y: 350, w: 200, h: 50},
    {x: 250, y: 280, w: 150, h: 20},
    {x: 450, y: 200, w: 150, h: 20},
    {x: 700, y: 250, w: 200, h: 20}, // Added extra platform
    {x: 1000, y: 200, w: 200, h: 20}, // Added extra platform
    {x: 1300, y: 150, w: 150, h: 20}  // Final platform
];

const corn = { 
    x: 1350,  // Moved to the far right of the 1500px canvas
    y: 80,    // Adjusted height to sit on the last platform
    w: 50,    // Doubled width
    h: 70,    // Doubled height
    found: false 
};

// Input State
const keys = { left: false, right: false };

let cameraX = 0;

function update() {
    // Horizontal Movement
    if (keys.left) player.dx = -player.speed;
    else if (keys.right) player.dx = player.speed;
    else player.dx = 0;

    player.x += player.dx;
    
    // --- CAMERA LOGIC ---
    // This centers the camera on the player
    cameraX = player.x - canvas.width / 4; 
    
    // Prevent camera from showing out-of-bounds (left side)
    if (cameraX < 0) cameraX = 0;
    // Prevent camera from showing out-of-bounds (right side)
    if (cameraX > 1500 - canvas.width) cameraX = 1500 - canvas.width;

    player.dy += gravity;
    player.y += player.dy;
    player.grounded = false;

    // Platform Collision
    platforms.forEach(plat => {
        if (player.x < plat.x + plat.w && player.x + player.width > plat.x &&
            player.y < plat.y + plat.h && player.y + player.height > plat.y) {
            if (player.dy > 0 && player.y + player.height - player.dy <= plat.y) {
                player.dy = 0;
                player.y = plat.y - player.height;
                player.grounded = true;
            }
        }
    });

    // Check Corn Win
    if (player.x < corn.x + corn.w && player.x + player.width > corn.x &&
        player.y < corn.y + corn.h && player.y + player.height > corn.y) {
        if (!corn.found) {
            corn.found = true;

            // Send event to GoatCounter
            if (window.goatcounter && window.goatcounter.count) {
                window.goatcounter.count({
                    path: 'found-corn',
                    title: 'Player Won Corn',
                    event: true,
                });
            }

            alert("YOU FOUND THE BIG CORN! 🌽✨");
            window.location.href = "https://lastdannce.carrd.co";
        }
    }

    if (player.y > canvas.height) {
        player.x = 50; player.y = 300; player.dy = 0;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save(); // Save the current state
    ctx.translate(-cameraX, 0); // Move everything based on camera

    // Draw Platforms
    ctx.fillStyle = "#4e342e";
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // Draw Player
    ctx.fillStyle = "#ff5722";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw BIG Corn
    ctx.font = "80px serif"; 
    ctx.fillText("🌽", corn.x, corn.y + 70); 

    ctx.restore(); // Restore state so UI doesn't move
} 

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Mobile Button Listeners
const setupBtn = (id, key) => {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; });
    // Also support mouse for testing on desktop
    btn.addEventListener('mousedown', () => keys[key] = true);
    btn.addEventListener('mouseup', () => keys[key] = false);
};

setupBtn('leftBtn', 'left');
setupBtn('rightBtn', 'right');

document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (player.grounded) player.dy = player.jumpForce;
});
document.getElementById('jumpBtn').addEventListener('mousedown', () => {
    if (player.grounded) player.dy = player.jumpForce;
});

// Keyboard Support
window.addEventListener('keydown', (e) => {
    if (e.code === "ArrowLeft") keys.left = true;
    if (e.code === "ArrowRight") keys.right = true;
    if (e.code === "Space" && player.grounded) player.dy = player.jumpForce;
});
window.addEventListener('keyup', (e) => {
    if (e.code === "ArrowLeft") keys.left = false;
    if (e.code === "ArrowRight") keys.right = false;
});

loop();