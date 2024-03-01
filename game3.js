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
let playerX = 0;
let playerY = 0;
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
            row.push(0);
        }
        mapData.push(row);
    }

    // Set starting position
    let cx = Math.floor(mapWidth / 2);
    let cy = Math.floor(mapHeight / 2);
    mapData[cy][cx] = 1;

    // Generate map using recursive backtracking algorithm
    const stack = [[cx, cy]];
    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const directions = shuffle([[0, -1], [1, 0], [0, 1], [-1, 0]]);
        for (const [dx, dy] of directions) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;
            if (nx >= 2 && nx < mapWidth - 2 && ny >= 2 && ny < mapHeight - 2 && mapData[ny][nx] === 0) {
                mapData[y + dy][x + dx] = 1;
                mapData[ny][nx] = 1;
                stack.push([nx, ny]);
            }
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
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function autoGenerateEnemies() {
    setTimeout(() => {
        generateEnemies(enemies.length + 0.01);
        autoGenerateEnemies();
    }, 6000000 / (enemies.length + 0.01));
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
                    let goToNextPage = confirm("You won! Now you can save Your love");
                    if (goToNextPage) {
                        window.location.href = "win.html";
                    }
                }

            }

            if (playerHp <= 0) {
                let goToNextPage = confirm("You died! You can try to com back from the hell!");
                if (goToNextPage) {
                    window.location.href = "level4.html";
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
                let goToNextPage = confirm("You died! You can Try to com back from the hell!");
                if (goToNextPage) {
                    window.location.href = "level4.html";
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
generateEnemies(5);
generateLoot(2);


// Move the enemies every 500ms
setInterval(moveEnemies, 500);

