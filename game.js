const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');

let score = 0;
let lives = 3;
let gameOver = false;

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0
};

// Obstacles
const obstacles = [];
const obstacleProps = {
    width: 30,
    height: 30,
    // speed, gravity, and spawnRate are now dynamic based on score
};

let obstacleSpawnTimer = 0;

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = 'brown';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updatePlayer() {
    player.x += player.dx;

    // Wall detection
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

function updateObstacles() {
    // Dynamic difficulty based on score
    const spawnRate = Math.max(300, 1500 - score * 10); // Starts at 1.5s, reaches 1s at score 50, caps at 0.3s
    const initialSpeed = 2 + score * 0.03;
    const gravity = 0.05 + score * 0.0002;

    obstacleSpawnTimer += 16; // Approximate ms per frame

    if (obstacleSpawnTimer > spawnRate) {
        obstacleSpawnTimer = 0;
        const numToSpawn = (score > 50 && Math.random() > 0.5) ? 2 : 1; // Spawn 1 or 2 obstacles at higher scores

        for (let i = 0; i < numToSpawn; i++) {
            obstacles.push({
                x: Math.random() * (canvas.width - obstacleProps.width),
                y: -obstacleProps.height,
                width: obstacleProps.width,
                height: obstacleProps.height,
                dy: initialSpeed
            });
        }
    }

    obstacles.forEach((obstacle, index) => {
        obstacle.dy += gravity; // Apply current gravity
        obstacle.y += obstacle.dy;

        // Collision with player
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            obstacles.splice(index, 1);
            lives--;
            livesEl.textContent = lives;
            if (lives <= 0) {
                endGame();
            }
        }

        // Remove if off-screen
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
            score++;
            scoreEl.textContent = score;
        }
    });
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
    if (gameOver) return;

    clear();
    drawPlayer();
    drawObstacles();
    updatePlayer();
    updateObstacles();

    requestAnimationFrame(update);
}

function movePlayer(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = -player.speed;
    }
}

function stopPlayer(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left'
    ) {
        player.dx = 0;
    }
}

function restartGame(e) {
    if (e.code === 'Space' && gameOver) {
        score = 0;
        lives = 3;
        gameOver = false;
        obstacles.length = 0;
        player.x = canvas.width / 2 - 25;
        scoreEl.textContent = score;
        livesEl.textContent = lives;
        gameOverScreen.style.display = 'none';
        update();
    }
}

function endGame() {
    gameOver = true;
    finalScoreEl.textContent = score;
    gameOverScreen.style.display = 'block';
}

document.addEventListener('keydown', movePlayer);
document.addEventListener('keyup', stopPlayer);
document.addEventListener('keydown', restartGame);

update();