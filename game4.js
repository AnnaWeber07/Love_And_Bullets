const mapWidth = 40;
const mapHeight = 30;
const tileSize = 20;
const player = document.getElementById('player');
const mapContainer = document.getElementById('map-container');
const inventory = document.getElementById('inventory');
const weaponInventory = document.getElementById('weapon');
const lootInventory = document.getElementById('loot');
const craftBtn = document.getElementById('craft-btn');
let playerHp = 10;
let playerX = 1;
let playerY = 1;
let map = [];
let enemies = [];
let loot = [];

// Generate the map
function generateMap() {
    const mapData = [];

    // Initialize mapData array with empty cells
    for (let y = 0; y < mapHeight; y++) {
        const row = [];
        for (let x = 0; x < mapWidth; x++) {
            row.push(1); // Fill map with walls
        }
        mapData.push(row);
    }

    const rooms = [];
    const maxRooms = 12; // Increased number of rooms
    const minRoomSize = 4;
    const maxRoomSize = 8;

    // Function to create a room
    function createRoom(x, y, width, height) {
        for (let i = x; i < x + width; i++) {
            for (let j = y; j < y + height; j++) {
                mapData[j][i] = 0;
            }
        }
    }

    // Generate rooms
    for (let r = 0; r < maxRooms; r++) {
        const roomWidth = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
        const roomHeight = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
        const roomX = Math.floor(Math.random() * (mapWidth - roomWidth - 1)) + 1;
        const roomY = Math.floor(Math.random() * (mapHeight - roomHeight - 1)) + 1;

        const newRoom = { x: roomX, y: roomY, width: roomWidth, height: roomHeight };
        let failed = false;

        for (let otherRoom of rooms) {
            if (intersect(newRoom, otherRoom)) {
                failed = true;
                break;
            }
        }

        if (!failed) {
            createRoom(roomX, roomY, roomWidth, roomHeight);

            if (rooms.length !== 0) {
                const prevRoom = rooms[rooms.length - 1];
                const [prevX, prevY] = [Math.floor(prevRoom.x + prevRoom.width / 2), Math.floor(prevRoom.y + prevRoom.height / 2)];
                const [newX, newY] = [Math.floor(roomX + roomWidth / 2), Math.floor(roomY + roomHeight / 2)];

                if (Math.random() < 0.5) {
                    createHorizontalTunnel(prevX, newX, prevY);
                    createVerticalTunnel(prevY, newY, newX);
                } else {
                    createVerticalTunnel(prevY, newY, prevX);
                    createHorizontalTunnel(prevX, newX, newY);
                }
            }

            rooms.push(newRoom);
        }
    }

    // Function to create a horizontal tunnel
    function createHorizontalTunnel(x1, x2, y) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            mapData[y][x] = 0;
        }
    }

    // Function to create a vertical tunnel
    function createVerticalTunnel(y1, y2, x) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            mapData[y][x] = 0;
        }
    }

    // Draw map based on mapData array
    for (let y = 0; y < mapHeight; y++) {
        const row = [];
        for (let x = 0; x < mapWidth; x++) {
            if (mapData[y][x] === 1) {
                let wall = document.createElement('div');
                wall.className = 'wall';
                wall.style.top = y * tileSize + 'px';
                wall.style.left = x * tileSize + 'px';
                mapContainer.appendChild(wall);
                row.push('wall');
            } else {
                row.push('empty');
            }
        }
        map.push(row);
    }

    // Set player position in a valid empty space
    do {
        playerX = Math.floor(Math.random() * mapWidth);
        playerY = Math.floor(Math.random() * mapHeight);
    } while (map[playerY][playerX] !== 'empty');

    player.style.top = playerY * tileSize + 'px';
    player.style.left = playerX * tileSize + 'px';
}

// Function to check if two rooms intersect
function intersect(room1, room2) {
    return (
        room1.x <= room2.x + room2.width &&
        room1.x + room1.width >= room2.x &&
        room1.y <= room2.y + room2.height &&
        room1.y + room1.height >= room2.y
    );
}

// Generate enemies
function generateEnemies(numEnemies) {
    for (let i = 0; i < numEnemies; i++) {
        let enemyX = Math.floor(Math.random() * mapWidth);
        let enemyY = Math.floor(Math.random() * mapHeight);

        if (map[enemyY][enemyX] !== 'empty') {
            i--;
        } else {
            let enemy = document.createElement('div');
            enemy.className = 'enemy';
            enemy.style.top = enemyY * tileSize + 'px';
            enemy.style.left = enemyX * tileSize + 'px';
            enemy.hp = 20;
            enemy.innerHTML = `HP: ${enemy.hp}`;
            mapContainer.appendChild(enemy);
            enemies.push({ x: enemyX, y: enemyY, el: enemy });

            // Add event listener to enemy element
            enemy.addEventListener('click', () => {
                enemy.hp -= 5;
                enemy.innerHTML = `HP: ${enemy.hp}`;
                if (enemy.hp <= 0) {
                    let lootChance = Math.random();
                    if (lootChance >= 0.5) {
                        generateLoot(1, enemyX, enemyY);
                    }
                    enemy.remove();
                    let enemyIndex = enemies.findIndex(enemyObj => enemyObj.el === enemy);
                    enemies.splice(enemyIndex, 1);
                    generateEnemies(1);
                }
            });
        }
    }
}

// Generate loot
function generateLoot(numLoot, x, y) {
    for (let i = 0; i < numLoot; i++) {
        let lootX = x || Math.floor(Math.random() * mapWidth);
        let lootY = y || Math.floor(Math.random() * mapHeight);

        if (map[lootY][lootX] !== 'empty') {
            i--;
        } else {
            let lootEl = document.createElement('div');
            lootEl.className = 'loot';
            lootEl.style.top = lootY * tileSize + 'px';
            lootEl.style.left = lootX * tileSize + 'px';
            mapContainer.appendChild(lootEl);
            loot.push({ x: lootX, y: lootY, el: lootEl });
        }
    }
}

// Automatically generate enemies after a certain amount of time
function autoGenerateEnemies() {
    setTimeout(() => {
        generateEnemies(enemies.length + 0.01);
        autoGenerateEnemies();
    }, 60000 / (enemies.length + 0.01));
}

// Move the player
function movePlayer(dx, dy) {
    // Check if the player is moving out of bounds or hitting a wall
    if (playerX + dx < 0 || playerX + dx >= mapWidth || playerY + dy < 0 || playerY + dy >= mapHeight || map[playerY + dy][playerX + dx] === 'wall') {
        return;
    }

    // Move the player
    playerX += dx;
    playerY += dy;

    // Check for loot
    checkForLoot();

    // Update the player's position on the screen
    player.style.top = playerY * tileSize + 'px';
    player.style.left = playerX * tileSize + 'px';

    // Check for enemies
    checkForEnemies();
}

// Check for loot
function checkForLoot() {
    for (let i = 0; i < loot.length; i++) {
        if (loot[i].x === playerX && loot[i].y === playerY) {
            loot.splice(i, 1);
            let lootItem = document.querySelectorAll('.loot')[i];
            lootItem.parentNode.removeChild(lootItem);
            inventory.innerHTML += '<li>Loot:</li>';

            playerHp += 10;
            player.innerHTML = `HP: ${playerHp}`;
        }
    }
}

function checkForEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        if (enemy.x === playerX && enemy.y === playerY) {
            enemy.hp = enemy.hp - 5;

            if (isNaN(enemy.hp) || enemy.hp <= 0) {
                // remove the enemy from the map
                let enemyEl = enemy.el;
                enemyEl.parentNode.removeChild(enemyEl);
                enemies.splice(i, 1);
                generateLoot(1);


                // check if all enemies are dead
                if (enemies.length === 0) {
                    let goToNextPage = confirm("You won! Do you want to go to the next level?");
                    if (goToNextPage) {
                        window.location.href = "level1.html";
                    }
                }

            }

            if (playerHp <= 0) {
                let goToNextPage = confirm("You died! You can now watch the future without you!");
                if (goToNextPage) {
                    window.location.href = "index.html";
                }

            }


            // Show player's HP on top of the player
            player.innerHTML = `HP: ${playerHp}`;

            // Show enemy's HP on top of the enemy
            if (!isNaN(enemy.hp)) {
                enemy.el.innerHTML = `HP: ${enemy.hp}`;
            }
        }
    }
}

// Move the enemies
function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        // Calculate the distance between the player and the enemy
        let dx = enemy.x - playerX;
        let dy = enemy.y - playerY;

        // Move the enemy towards the player
        if (dx > 0) {
            enemy.x--;
        } else if (dx < 0) {
            enemy.x++;
        }

        if (dy > 0) {
            enemy.y--;
        } else if (dy < 0) {
            enemy.y++;
        }

        // Check if the enemy hits a wall
        if (map[enemy.y][enemy.x] === 'wall') {
            if (dx > 0) {
                enemy.x++;
            } else if (dx < 0) {
                enemy.x--;
            }

            if (dy > 0) {
                enemy.y++;
            } else if (dy < 0) {
                enemy.y--;
            }
        }

        // Check if the enemy hits the player
        if (enemy.x === playerX && enemy.y === playerY) {
            playerHp -= 4;
            if (playerHp <= 0) {
                let goToNextPage = confirm("You died! You can now watch the future without you!");
                if (goToNextPage) {
                    window.location.href = "index.html";
                }
            }

            player.innerHTML = `HP: ${playerHp}`;
        }

        // Show enemy's position on the screen
        enemy.el.style.top = enemy.y * tileSize + 'px';
        enemy.el.style.left = enemy.x * tileSize + 'px';
    }

    // Check if the player has won the game
    if (enemies.length === 0 && loot.length === 0) {
        alert('Congratulations! You have won the game!');
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            checkForEnemies()
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            checkForEnemies()
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            checkForEnemies()
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            checkForEnemies()
            break;
    }
});
const controls = document.getElementById('controls');
const upControl = document.querySelector('.up');
const downControl = document.querySelector('.down');
const leftControl = document.querySelector('.left');
const rightControl = document.querySelector('.right');

upControl.addEventListener('pointerdown', function() {
    movePlayer(0, -1);
});

downControl.addEventListener('pointerdown', function() {
    movePlayer(0, 1);
});

leftControl.addEventListener('pointerdown', function() {
    movePlayer(-1, 0);
});

rightControl.addEventListener('pointerdown', function() {
    movePlayer(1, 0);
});

upControl.addEventListener('pointerup', function() {
    movePlayer(0, 0);
});

downControl.addEventListener('pointerup', function() {
    movePlayer(0, 0);
});

leftControl.addEventListener('pointerup', function() {
    movePlayer(0, 0);
});

rightControl.addEventListener('pointerup', function() {
    movePlayer(0, 0);
});

// Generate the map, enemies, and loot
generateMap();
generateEnemies(10); // Increased number of enemies
generateLoot(5); // Increased number of loot
autoGenerateEnemies();

// Move the enemies every 500ms
setInterval(moveEnemies, 500);
