const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = globalThis.innerWidth;
canvas.height = globalThis.innerHeight;
const vh = parseFloat(canvas.height) / 100;
const aspect = canvas.width / canvas.height;

const IMAGES = {
    "C": document.getElementById("classroom"),
    "S": document.getElementById("stairs"),
    "#": document.getElementById("wall"),
    player: "011234566789".split("").map((c) =>
        document.getElementById("man" + c)
    ),
};
console.log(IMAGES.C.height, IMAGES.C.width);

// const CLASSROOM_SIZE = 120 * vw;
const CLASSROOM_SIZE = 100 * vh * IMAGES.C.width / IMAGES.C.height;
// const STAIRS_SIZE = 45 * vw;
const STAIRS_SIZE = 100 * vh * IMAGES.S.width / IMAGES.S.height;
const PLAYER_HEIGHT = 50 * vh;
const PLAYER_WIDTH = PLAYER_HEIGHT * IMAGES.player[0].width /
    IMAGES.player[0].height;
// const PLAYER_WIDTH = 10 * vh;
const FLOOR_HEIGHT = 10 * vh; // Number of
const TILE_SIZE = {
    "C": CLASSROOM_SIZE,
    "S": STAIRS_SIZE,
    "#": CLASSROOM_SIZE,
};
const TILE_COLOR = {
    "C": "#CbAb8b",
    "S": "#ffcc00",
    "#": "#000",
    ".": "#fff",
};
const gameMap = `
#####################
####CSCCCCSCC########
#####S###############
###CCSCCCCSCCCS######
##S###########S######
#CSCCSCCCC#CCCS#CSC##
##S##S####S###S##S###
#CSCCSCCCCSCCCSSCSCC#
#####S####S##########
#####################
`.trim().split("\n");

class ClassroomInfo {
    constructor(
        blackboard = "乱七八糟的鬼画符",
        front_door = false,
        back_door = false,
        name = "",
        description = "",
    ) {
        this.front_door = front_door;
        this.back_door = back_door;
        this.blackboard = blackboard;
        this.name = name;
        this.description = description;
    }
    static fromString(str) {
        const [front_door, back_door, name, blackboard, description] = str
            .split("|");
        return new ClassroomInfo(
            blackboard,
            front_door === "true",
            back_door === "true",
            name || "",
            description || "",
        );
    }
    static fromStrArr(arr) {
        const res = [new ClassroomInfo()];
        res.pop();
        res.push(...arr.map((s) => ClassroomInfo.fromString(s)));
        return res;
    }
    static fromStrArr2(arr2) {
        const res = [[new ClassroomInfo()]];
        res.pop();
        res.push(...arr2.map((s) => ClassroomInfo.fromStrArr(s)));
        return res;
    }
    toString() {
        return `${this.blackboard}|${this.front_door}|${this.back_door}|${this.name}|${this.description}`;
    }
}
const classrooms = ClassroomInfo.fromStrArr2([[]]);

const gameState = {
    playerX: 1, // Player's position in the map grid (X)
    playerY: gameMap.length - 3, // Player's current floor (Y)
    offsetX: TILE_SIZE[gameMap[gameMap.length - 2][1]] / 2, // Player's offset to current tile
    offsetY: 0, // Stairs offset
    speed: 2 * vh, // Movement speed per frame
    stair_speed: 2 * vh, // Stairs movement speed per frame
    menuOpen: false,

    player_frame: 0,
    face_right: true,
    changing_scene: 0,
    // 0 none, 1 up, 2 down, 3 enter door
    changing_scene_type: 0,

    fps: {
        last_time: performance.now(),
        count: 0,
        fps: 0,
    },
};

const menu = document.getElementById("menu");
const restartButton = document.getElementById("restartButton");
const homeButton = document.getElementById("homeButton");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const upButton = document.getElementById("upButton");
const downButton = document.getElementById("downButton");
const popup_region = document.getElementById("pop_up_messages");

const controls = {
    up: false,
    down: false,
    left: false,
    right: false,
};

function popup(message) {
    const popup = document.createElement("p");
    popup.innerHTML = message;
    popup_region.appendChild(popup);
    setTimeout(() => {
        popup_region.removeChild(popup);
    }, 2500);
    popup.style.opacity = 1;
    setTimeout(() => {
        popup.style.opacity = 0;
    });
}

globalThis.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "w":
            controls.up = true;
            break;
        case "s":
            controls.down = true;
            break;
        case "a":
            controls.left = true;
            gameState.face_right = false;
            break;
        case "d":
            controls.right = true;
            gameState.face_right = true;
            break;
        case "Escape":
            toggleMenu();
            break;
    }
});

globalThis.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "w":
            controls.up = false;
            break;
        case "s":
            controls.down = false;
            break;
        case "a":
            controls.left = false;
            break;
        case "d":
            controls.right = false;
            break;
    }
});

restartButton.addEventListener("click", () => {
    gameState.playerX = 1;
    gameState.playerY = gameMap.length - 3;
    gameState.offsetX = TILE_SIZE[gameMap[gameMap.length - 2][1]] / 2;
    gameState.player_frame = 0;
    gameState.face_right = true;
    toggleMenu();
});

homeButton.addEventListener("click", () => {
    globalThis.location.href = "../index.html"; // Placeholder for home page
});

function add_listener(button, key, face_right = null) {
    button.addEventListener("mousedown", () => {
        controls[key] = true;
        if (face_right !== null) {
            gameState.face_right = face_right;
        }
        console.log(key, controls[key], gameState.face_right);
    });
    button.addEventListener("touchstart", () => {
        controls[key] = true;
        if (face_right !== null) {
            gameState.face_right = face_right;
        }
        console.log(key, controls[key], gameState.face_right);
    });
    button.addEventListener("mouseup", () => {
        controls[key] = false;
    });
    button.addEventListener("touchend", () => {
        controls[key] = true;
        if (face_right !== null) {
            gameState.face_right = face_right;
        }
        console.log(key, controls[key], gameState.face_right);
    });
}
add_listener(leftButton, "left", false);
add_listener(rightButton, "right", true);
add_listener(upButton, "up");
add_listener(downButton, "down");

function toggleMenu() {
    gameState.menuOpen = !gameState.menuOpen;
    menu.style.display = gameState.menuOpen ? "block" : "none";
}

function update() {
    if (gameState.menuOpen) return;
    if (gameState.changing_scene_type === 0) {
        const currentRow = gameMap[gameState.playerY];
        if (controls.left) {
            gameState.offsetX -= gameState.speed;
            if (gameState.offsetX < 0) {
                if (currentRow[gameState.playerX - 1] !== "#") {
                    gameState.playerX -= 1;
                    gameState.offsetX +=
                        TILE_SIZE[currentRow[gameState.playerX]];
                } else {
                    gameState.offsetX = 0;
                }
            }
        }
        if (controls.right) {
            gameState.offsetX += gameState.speed;
            if (gameState.offsetX > TILE_SIZE[currentRow[gameState.playerX]]) {
                if (currentRow[gameState.playerX + 1] !== "#") {
                    gameState.offsetX -=
                        TILE_SIZE[currentRow[gameState.playerX]];
                    gameState.playerX += 1;
                } else {
                    gameState.offsetX =
                        TILE_SIZE[currentRow[gameState.playerX]];
                }
            }
        }
        if (controls.up) {
            // if (nextTile === "S") {
            gameState.changing_scene = 20;
            gameState.changing_scene_type = 1;
            // }
        }
        if (controls.down) {
            // const nextTile = gameMap[gameState.playerY + 1][gameState.playerX];
            // if (nextTile === "S") {
            gameState.changing_scene = 20;
            gameState.changing_scene_type = 2;
            // }
        }
    } else {
        gameState.changing_scene -= 1;
        switch (gameState.changing_scene_type) {
            case 1:
                gameState.offsetY += gameState.stair_speed;
                break;
            case 2:
                gameState.offsetY -= gameState.stair_speed;
                break;
        }
        if (gameState.changing_scene <= 0) {
            switch (gameState.changing_scene_type) {
                case 1:
                    if (
                        gameMap[gameState.playerY - 1][gameState.playerX] ===
                            "S"
                    ) {
                        gameState.playerY -= 1;
                    } else {
                        popup("<span red>楼梯无法继续向上</span>");
                    }
                    controls.up = false;
                    break;
                case 2:
                    if (
                        gameMap[gameState.playerY + 1][gameState.playerX] ===
                            "S"
                    ) {
                        gameState.playerY += 1;
                    } else {
                        popup("<span red>楼梯无法继续向下</span>");
                    }
                    controls.down = false;
                    break;
            }
            gameState.changing_scene = 0;
            gameState.offsetY = 0;
            gameState.changing_scene_type = 0;
        }
    }
    gameState.player_frame += 1;
    if (controls.left || controls.right) {
        gameState.player_frame += 1.5;
    }
}

function draw() {
    const currentRow = gameMap[gameState.playerY];
    let screenX = canvas.width / 2 - gameState.offsetX;
    for (let x = 0; x < gameState.playerX; x++) {
        screenX -= TILE_SIZE[currentRow[x]];
    }
    for (let x = 0; x < currentRow.length; x++) {
        const tile = currentRow[x];
        screenX += TILE_SIZE[tile];

        if (
            screenX + TILE_SIZE[tile] > 0 &&
            screenX - TILE_SIZE[tile] < canvas.width
        ) {
            ctx.drawImage(
                IMAGES[tile],
                screenX - TILE_SIZE[tile],
                gameState.offsetY,
                TILE_SIZE[tile],
                canvas.height,
            );
        }
    }

    // Draw player
    const frame = Math.floor(gameState.player_frame / 6) %
        IMAGES.player.length;
    if (gameState.face_right) {
        ctx.save();
        ctx.translate(
            canvas.width / 2 + PLAYER_WIDTH / 2,
            canvas.height - FLOOR_HEIGHT - PLAYER_HEIGHT,
        );
        ctx.scale(-1, 1);
        ctx.drawImage(IMAGES.player[frame], 0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
        ctx.restore();
    } else {
        ctx.drawImage(
            IMAGES.player[frame],
            canvas.width / 2 - PLAYER_WIDTH / 2,
            canvas.height - FLOOR_HEIGHT - PLAYER_HEIGHT,
            PLAYER_WIDTH,
            PLAYER_HEIGHT,
        );
    }
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(debug_info(), 50 * vh, 16);
}

function debug_info() {
    return "fps: " + gameState.fps.fps.toFixed(1) + " x: " + gameState.playerX +
        " y: " + gameState.playerY + " offsetX: " +
        gameState.offsetX.toFixed(0) + " frame: " +
        (gameState.player_frame / 6).toFixed(0) + " face_right: " +
        gameState.face_right + " menuOpen: " + gameState.menuOpen;
}

function gameLoop() {
    if (++gameState.fps.count > 20) {
        const now = performance.now();
        const dt = now - gameState.fps.last_time;
        gameState.fps.fps = 1000 / dt * gameState.fps.count;
        gameState.fps.last_time = now;
        gameState.fps.count = 0;
    }
    update();
    // ctx.fillStyle = TILE_COLOR["."];
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
