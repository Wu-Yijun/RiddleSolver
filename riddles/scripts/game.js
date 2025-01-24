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
        return res.reverse();
    }
    toString() {
        return `${this.blackboard}|${this.front_door}|${this.back_door}|${this.name}|${this.description}`;
    }
}

function load_classrooms() {
    const classrooms = fetch("./assets/classrooms.txt")
        .then((res) => res.text())
        .then((text) => text.split("\n\n").map((s) => s.trim().split("\n")))
        .then((arr) => ClassroomInfo.fromStrArr2(arr));
    return classrooms;
}

function main(classrooms = ClassroomInfo.fromStrArr2([[]])) {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.willReadFrequently = true;

    canvas.width = globalThis.innerWidth;
    canvas.height = globalThis.innerHeight;
    const vh = parseFloat(canvas.height) / 100;
    const aspect = canvas.width / canvas.height;

    const IMAGES = {
        "C": document.getElementById("classroom"),
        "S": document.getElementById("stairs"),
        "#": document.getElementById("wall"),
        ".": document.getElementById("wall"),
        player: "011234566789".split("").map((c) =>
            document.getElementById("man" + c)
        ),
    };
    // console.log(IMAGES.C.height, IMAGES.C.width);

    // const CLASSROOM_SIZE = 120 * vw;
    const CLASSROOM_SIZE = 100 * vh * IMAGES.C.width / IMAGES.C.height;
    // const STAIRS_SIZE = 45 * vw;
    const STAIRS_SIZE = 100 * vh * IMAGES.S.width / IMAGES.S.height;
    const PLAYER_HEIGHT = 50 * vh;
    const PLAYER_WIDTH = PLAYER_HEIGHT * IMAGES.player[0].width /
        IMAGES.player[0].height;
    const BUTTON_SIZE = 5 * vh;
    // const PLAYER_WIDTH = 10 * vh;
    const FLOOR_HEIGHT = 10 * vh; // Number of
    const TILE_SIZE = {
        "C": CLASSROOM_SIZE,
        "S": STAIRS_SIZE,
        "#": CLASSROOM_SIZE,
        ".": 0,
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
#CSCCSCCCCSCCCS.CSCC#
#####S####S##########
#####################
`.trim().split("\n");

    const FINAL_CLASSROOMS = 19;
    const gameMap2 = [
        [],
        [13, -1, -1, -1, 0, -1, -1],
        [-1, -1, -1, 2, -1, 15, 6, 1, 4],
        [10, 3, 11, 17, -1, 14, 7, 5, -1, -1, -1, -1, -1],
        [-1, 16, FINAL_CLASSROOMS, -1, -1, 9, 18, -1, -1, -1, 8, -1, 12, -1],
        [],
    ].reverse();

    // const classrooms = ClassroomInfo.fromStrArr2([[]]);

    const SCENE = {
        CORRIDOR: 0,
        CLASSROOM: 1,
    };

    const gameState = {
        playerX: 1, // Player's position in the map grid (X)
        playerY: gameMap.length - 3, // Player's current floor (Y)
        offsetX: TILE_SIZE[gameMap[gameMap.length - 2][1]] / 2, // Player's offset to current tile
        offsetY: 0, // Stairs offset
        classroomX: 0,
        classroomY: 0,
        speed: 2 * vh, // Movement speed per frame
        speed_cr: 1 * vh, // Movement speed per frame
        stair_speed: 2 * vh, // Stairs movement speed per frame
        menuOpen: false,

        player_frame: 0,
        face_right: true,
        changing_scene: 0,
        // 0 none, 1 up, 2 down, 3 enter door
        changing_scene_type: 0,
        darkness: 0,
        visited: Array.from({ length: FINAL_CLASSROOMS }, (_) => false),
        get visit_all() {
            return this.visited.every((v) => v);
        },

        scene: SCENE.CORRIDOR,
        classroom: classrooms[0][0],
        desks: [],
        on_desk: 0,
        can_interact: false,

        fps: {
            last_time: performance.now(),
            count: 0,
            fps: 0,
        },

        debug_info: false,

        get currentFloor() {
            return (gameMap.length - gameState.playerY - 1) / 2;
        },
        set currentFloor(floor) {
            gameState.playerY = gameMap.length - floor * 2 - 1;
        },
        get currentClassroom() {
            if (gameMap[gameState.playerY][gameState.playerX] !== "C") {
                return -1;
            }
            let index = 0;
            for (let i = 0; i < gameState.playerX; i++) {
                if (gameMap[gameState.playerY][i] === "C") {
                    index++;
                }
            }
            return index;
        },
        set currentClassroom(index) {
            let x = 1;
            for (let i = 0; i < index; i++) {
                while (gameMap[gameState.playerY][x] !== "C") {
                    x++;
                }
                x++;
            }
            gameState.playerX = x;
        },
    };

    const menu = document.getElementById("menu");
    const blackboard_dom = document.getElementById("blackboard");
    const blackboard_text = document.getElementById("blackboard_text");
    const restartButton = document.getElementById("restartButton");
    const homeButton = document.getElementById("homeButton");
    const leftButton = document.getElementById("leftButton");
    const rightButton = document.getElementById("rightButton");
    const upButton = document.getElementById("upButton");
    const downButton = document.getElementById("downButton");
    const interactButton = document.getElementById("interactButton");
    const popup_region = document.getElementById("pop_up_messages");

    const controls = {
        up: false,
        down: false,
        left: false,
        right: false,
        interact: false,
        get any() {
            return this.up || this.down || this.left || this.right ||
                this.interact;
        },
    };

    const CR_SIZE = {
        width: 180 * vh,
        height: 100 * vh,
        top_wall: 25 * vh,
        left_wall: 40 * vh,
        door_width: 12 * vh,
        door_height: 20 * vh,
        left_door: 20 * vh,
        right_door: 150 * vh,
        blackboard_width: 30 * vh,
        blackboard_height: 80 * vh,
        blackboard_x: 5 * vh,
        blackboard_y: 10 * vh,
        desk_width: 20 * vh,
        desk_height: 40 * vh,
        desk_x: 10 * vh,
        desk_y: 30 * vh,
        desk_w: 10 * vh,
        desk_h: 15 * vh,
    };
    const CR_COLOR = {
        classroom: "orange",
        wall: "yellow",
        door: "brown",
        blackboard: "darkgreen",
        desk: "#654321",
        // desks: "#7647",
        desks: "#b73a",
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

    function gen_desks() {
        gameState.desks = [];
        const num = Math.floor(Math.random() * 50);
        for (let i = 0; i < num; i++) {
            gameState.desks.push({
                x: Math.random() * CR_SIZE.width,
                y: Math.random() * CR_SIZE.height,
                r: Math.random() * 2 * Math.PI,
            });
        }
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
            case "e":
                controls.interact = true;
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
            case "e":
                controls.interact = false;
                break;
        }
    });

    restartButton.addEventListener("click", () => {
        globalThis.window.location.reload();
        // gameState.playerX = 1;
        // gameState.playerY = gameMap.length - 3;
        // gameState.offsetX = TILE_SIZE[gameMap[gameMap.length - 2][1]] / 2;
        // gameState.player_frame = 0;
        // gameState.face_right = true;
        // toggleMenu();
    });

    homeButton.addEventListener("click", () => {
        globalThis.location.href = "./Treasure-Hunter.html"; // Placeholder for home page
    });

    function add_listener(button, key, face_right = null) {
        button.addEventListener("mousedown", () => {
            controls[key] = true;
            if (face_right !== null) {
                gameState.face_right = face_right;
            }
            // console.log(key, controls[key], gameState.face_right);
        });
        button.addEventListener("touchstart", () => {
            controls[key] = true;
            if (face_right !== null) {
                gameState.face_right = face_right;
            }
            // console.log(key, controls[key], gameState.face_right);
        });
        button.addEventListener("mouseup", () => {
            controls[key] = false;
        });
        button.addEventListener("touchend", () => {
            controls[key] = true;
            if (face_right !== null) {
                gameState.face_right = face_right;
            }
            // console.log(key, controls[key], gameState.face_right);
        });
    }
    add_listener(leftButton, "left", false);
    add_listener(rightButton, "right", true);
    add_listener(upButton, "up");
    add_listener(downButton, "down");
    add_listener(interactButton, "interact");

    function toggleMenu() {
        gameState.menuOpen = !gameState.menuOpen;
        menu.style.display = gameState.menuOpen ? "block" : "none";
    }

    function update_corridor() {
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
        if (controls.up && currentRow[gameState.playerX] === "S") {
            // if (nextTile === "S") {
            gameState.changing_scene = 20;
            gameState.changing_scene_type = 1;
            // }
        }
        if (controls.down && currentRow[gameState.playerX] === "S") {
            // const nextTile = gameMap[gameState.playerY + 1][gameState.playerX];
            // if (nextTile === "S") {
            gameState.changing_scene = 20;
            gameState.changing_scene_type = 2;
            // }
        }
    }

    function update_classroom() {
        let speed = gameState.speed_cr;
        if (gameState.on_desk) {
            speed /= 3;
        }
        if (controls.left) {
            gameState.classroomX -= speed;
            if (gameState.classroomX <= CR_SIZE.left_wall) {
                gameState.classroomX = CR_SIZE.left_wall + 1;
            }
        }
        if (controls.right) {
            gameState.classroomX += speed;
            if (gameState.classroomX >= CR_SIZE.left_wall + CR_SIZE.width) {
                gameState.classroomX = CR_SIZE.left_wall + CR_SIZE.width - 1;
            }
        }
        if (controls.up) {
            gameState.classroomY -= speed;
            if (gameState.classroomY <= CR_SIZE.top_wall) {
                gameState.classroomY = CR_SIZE.top_wall + 1;
            }
        }
        if (controls.down) {
            gameState.classroomY += speed;
            if (gameState.classroomY >= CR_SIZE.top_wall + CR_SIZE.height) {
                gameState.classroomY = CR_SIZE.top_wall + CR_SIZE.height - 1;
            }
        }
    }

    function update() {
        if (gameState.menuOpen) return;
        if (gameState.changing_scene_type === 0) {
            if (gameState.scene === SCENE.CORRIDOR) {
                update_corridor();
                if (controls.left || controls.right) {
                    gameState.player_frame += 1.5;
                }
            } else {
                update_classroom();
                if (
                    controls.left || controls.right || controls.up ||
                    controls.down
                ) {
                    gameState.player_frame += 1.5;
                }
            }
        }
        if (gameState.changing_scene_type !== 0) {
            if (
                gameState.changing_scene_type === 1 ||
                gameState.changing_scene_type === 2
            ) {
                const up = gameState.changing_scene_type === 1;
                gameState.offsetY += gameState.stair_speed * (up ? 1 : -1);
                gameState.darkness = 1 - gameState.changing_scene / 20;
                gameState.changing_scene -= 1;
                if (gameState.changing_scene <= 0) {
                    gameState.darkness = 0;
                    gameState.changing_scene_type = 0;
                    gameState.offsetY = 0;
                    const y = gameState.playerY - (up ? 1 : -1);
                    if (
                        gameMap[y][gameState.playerX] === "S"
                    ) {
                        gameState.playerY = y;
                    } else if (up) {
                        popup("<span red>楼梯无法继续向上</span>");
                    } else {
                        popup("<span red>楼梯无法继续向下</span>");
                    }
                    controls.up = false;
                    controls.down = false;
                }
            } else if (gameState.changing_scene_type === 3) {
                gameState.changing_scene -= 0.5;
                gameState.darkness = gameState.changing_scene / 20;
                if (gameState.changing_scene <= 0) {
                    gameState.changing_scene_type = 0;
                }
            }
        }
        gameState.player_frame += 1;
    }

    function update_button() {
        // console.log(leftButton,rightButton);
        if (controls.left) {
            leftButton.classList.add("pressed");
        } else {
            leftButton.classList.remove("pressed");
        }
        if (controls.right) {
            rightButton.classList.add("pressed");
        } else {
            rightButton.classList.remove("pressed");
        }
        if (controls.up) {
            upButton.classList.add("pressed");
        } else {
            upButton.classList.remove("pressed");
        }
        if (controls.down) {
            downButton.classList.add("pressed");
        } else {
            downButton.classList.remove("pressed");
        }
        if (controls.interact) {
            interactButton.classList.add("pressed");
        } else {
            interactButton.classList.remove("pressed");
        }

        if (gameState.currentClassroom >= 0) {
            upButton.classList.remove("interact");
            downButton.classList.remove("interact");
        } else {
            upButton.classList.add("interact");
            downButton.classList.add("interact");
        }
        if (gameState.can_interact) {
            interactButton.classList.add("interact");
        } else {
            interactButton.classList.remove("interact");
        }
    }

    function see_blackboard() {
        const id = gameMap2[gameState.currentFloor][gameState.currentClassroom];
        if (id !== -1 && id < FINAL_CLASSROOMS) {
            gameState.visited[id] = true;
        }
    }
    function check_desk() {
        const id = gameMap2[gameState.currentFloor][gameState.currentClassroom];
        if (id !== FINAL_CLASSROOMS) {
            return popup("<span>一无所获</span>");
        }
        if (!gameState.visit_all) {
            return popup("<span red>请先看完前置教室的黑板</span>");
        }
        // find the final classroom
        popup("<span green>恭喜你找到了线索!</span>");
        document.getElementById("finalButton").style.display = "block";
        document.getElementById("finalButton").addEventListener("click", () => {
            globalThis.location.href = "./Treasure-Hunter-Final.html";
        });
        toggleMenu();
    }

    function draw_corridor() {
        const currentRow = gameMap[gameState.playerY];
        let screenX = canvas.width / 2 - gameState.offsetX;
        for (let x = 0; x < gameState.playerX; x++) {
            screenX -= TILE_SIZE[currentRow[x]];
        }
        let classroomIndex = 0;
        for (let x = 0; x < currentRow.length; x++) {
            const tile = currentRow[x];
            screenX += TILE_SIZE[tile];

            if (tile === "C") {
                classroomIndex++;
            }
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
                if (tile === "C") {
                    ctx.fillStyle = "white";
                    ctx.font = (3 * vh).toFixed(1) + "px Arial";
                    ctx.textAlign = "center";
                    const text =
                        classrooms[gameState.currentFloor][classroomIndex - 1]
                            .name;
                    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                    ctx.fillRect(
                        screenX - 53 * vh,
                        22 * vh,
                        16 * vh,
                        10 * vh,
                    );
                    ctx.fillStyle = "white";
                    ctx.fillText(
                        text,
                        screenX - 45 * vh,
                        28 * vh,
                    );
                    // console.log(vh);
                }
            }
        }
    }

    function draw_player(x, y, scale = 1) {
        // Draw player
        const frame = Math.floor(gameState.player_frame / 6) %
            IMAGES.player.length;
        ctx.save();
        if (gameState.face_right) {
            ctx.translate(x, y);
            ctx.scale(-scale, scale);
            ctx.drawImage(
                IMAGES.player[frame],
                -PLAYER_WIDTH / 2,
                -PLAYER_HEIGHT * 0.8,
                PLAYER_WIDTH,
                PLAYER_HEIGHT,
            );
        } else {
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.drawImage(
                IMAGES.player[frame],
                -PLAYER_WIDTH / 2,
                -PLAYER_HEIGHT * 0.8,
                PLAYER_WIDTH,
                PLAYER_HEIGHT,
            );
        }
        ctx.restore();
    }

    function draw_interact_button(x = canvas.width / 2, y = canvas.height / 2) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(
            x - BUTTON_SIZE,
            y - BUTTON_SIZE / 2,
            BUTTON_SIZE * 2,
            BUTTON_SIZE,
        );
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fontWeight = "bold";
        ctx.textAlign = "center";
        ctx.fillText("E交互", x, y + 8);
    }

    function draw_debug_info() {
        ctx.textAlign = "left";
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(debug_info(), 3 * vh, 16);
    }

    function draw_classroom() {
        ctx.save();
        ctx.translate(
            canvas.width / 2 - gameState.classroomX,
            canvas.height / 2 - gameState.classroomY,
        );

        // Draw classroom
        ctx.fillStyle = CR_COLOR.classroom;
        ctx.fillRect(
            CR_SIZE.left_wall,
            CR_SIZE.top_wall,
            CR_SIZE.width,
            CR_SIZE.height,
        );

        // Draw walls
        ctx.fillStyle = CR_COLOR.wall;
        ctx.fillRect(
            0,
            0,
            CR_SIZE.left_wall,
            CR_SIZE.height + CR_SIZE.top_wall,
        );
        ctx.fillRect(CR_SIZE.left_wall, 0, CR_SIZE.width, CR_SIZE.top_wall);
        // Draw doors
        ctx.fillStyle = CR_COLOR.door;
        ctx.fillRect(
            CR_SIZE.left_wall + CR_SIZE.left_door,
            CR_SIZE.top_wall - CR_SIZE.door_height,
            CR_SIZE.door_width,
            CR_SIZE.door_height,
        );
        ctx.fillRect(
            CR_SIZE.left_wall + CR_SIZE.right_door,
            CR_SIZE.top_wall - CR_SIZE.door_height,
            CR_SIZE.door_width,
            CR_SIZE.door_height,
        );
        // Draw blackboard
        ctx.fillStyle = CR_COLOR.blackboard;
        ctx.fillRect(
            CR_SIZE.blackboard_x,
            CR_SIZE.top_wall + CR_SIZE.blackboard_y,
            CR_SIZE.blackboard_width,
            CR_SIZE.blackboard_height,
        );
        // Draw desk
        ctx.fillStyle = CR_COLOR.desk;
        ctx.fillRect(
            CR_SIZE.left_wall + CR_SIZE.desk_x,
            CR_SIZE.top_wall + CR_SIZE.desk_y,
            CR_SIZE.desk_width,
            CR_SIZE.desk_height,
        );
        // Draw desks
        ctx.fillStyle = CR_COLOR.desks;
        for (const desk of gameState.desks) {
            ctx.save();
            ctx.translate(
                CR_SIZE.left_wall + desk.x,
                CR_SIZE.top_wall + desk.y,
            );
            ctx.rotate(desk.r);
            ctx.fillRect(
                -CR_SIZE.desk_w / 2,
                -CR_SIZE.desk_h / 2,
                CR_SIZE.desk_w,
                CR_SIZE.desk_h,
            );
            ctx.restore();
        }
        ctx.restore();
        // test desks
        const [s, r, g, b] =
            ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1)
                .data;
        // const cmp = [255 165 0 255];
        gameState.on_desk = (s === 255 && r === 165 && g === 0 && b === 255)
            ? 0
            : 1;
        // const d1 = ctx.getImageData(
        //     canvas.width / 2,
        //     canvas.height / 2,
        //     10,
        //     10,
        // );
        // ctx.putImageData(d1, 0, 0);
        // console.log(s, r, g, b, gameState.classroomX, gameState.classroomY);
    }

    function interact_door() {
        let front_door = false;
        let back_door = false;
        if (gameState.currentClassroom >= 0) {
            const pos = gameState.offsetX / vh;
            // near the door
            front_door = pos >= 20 && pos <= 40;
            back_door = pos >= 160 && pos <= 180;
        }
        gameState.can_interact = front_door || back_door;
        if (gameState.can_interact && controls.interact) {
            gameState.classroom =
                classrooms[gameState.currentFloor][gameState.currentClassroom];
            if (front_door && gameState.classroom.front_door) {
                gameState.changing_scene = 20;
                gameState.changing_scene_type = 3;
                gameState.scene = SCENE.CLASSROOM;
                gameState.classroomX = CR_SIZE.left_wall + CR_SIZE.right_door +
                    CR_SIZE.door_width / 2;
                gameState.classroomY = CR_SIZE.top_wall;
                gen_desks();
            } else if (back_door && gameState.classroom.back_door) {
                gameState.changing_scene = 20;
                gameState.changing_scene_type = 3;
                gameState.scene = SCENE.CLASSROOM;
                gameState.classroomX = CR_SIZE.left_wall + CR_SIZE.left_door +
                    CR_SIZE.door_width / 2;
                gameState.classroomY = CR_SIZE.top_wall;
                gen_desks();
            } else {
                popup(
                    "<span orange>门不能从这一侧打开</span><br><span green>O 好</span> <span red>X 取消</span>",
                );
            }
            // console.log(gameState.classroom);
        }
        controls.interact = false;
    }

    function interact_cr_door() {
        const x = gameState.classroomX - CR_SIZE.left_wall;
        const y = gameState.classroomY - CR_SIZE.top_wall;
        const front_door = x >= CR_SIZE.right_door &&
            x <= CR_SIZE.right_door + CR_SIZE.door_width &&
            y >= 0 && y <= CR_SIZE.door_height;
        const back_door = x >= CR_SIZE.left_door &&
            x <= CR_SIZE.left_door + CR_SIZE.door_width &&
            y >= 0 && y <= CR_SIZE.door_height;
        gameState.can_interact = front_door || back_door;
        if (front_door && controls.interact) {
            controls.interact = false;
            if (gameState.classroom.front_door) {
                gameState.changing_scene = 20;
                gameState.changing_scene_type = 3;
                gameState.scene = SCENE.CORRIDOR;
            } else {
                popup(
                    "<span orange>门紧锁着</span><br><span green>O 好</span> <span red>X 取消</span>",
                );
            }
        }
        if (back_door && controls.interact) {
            controls.interact = false;
            if (gameState.classroom.back_door) {
                gameState.changing_scene = 20;
                gameState.changing_scene_type = 3;
                gameState.scene = SCENE.CORRIDOR;
            } else {
                popup(
                    "<span orange>门紧锁着</span><br><span green>O 好</span> <span red>X 取消</span>",
                );
            }
        }
    }

    function interact_cr_desk() {
        const x = gameState.classroomX - CR_SIZE.left_wall;
        const y = gameState.classroomY - CR_SIZE.top_wall;
        const desk = x >= CR_SIZE.desk_x &&
            x <= CR_SIZE.desk_x + CR_SIZE.desk_width &&
            y >= CR_SIZE.desk_y &&
            y <= CR_SIZE.desk_y + CR_SIZE.desk_height;
        gameState.on_desk |= desk ? 2 : 0;
        gameState.can_interact |= gameState.on_desk !== 0;
        if (desk && controls.interact) {
            controls.interact = false;
            check_desk();
            // popup("<span>桌子是空的</span>");
        }
        if (gameState.on_desk === 1 && controls.interact) {
            controls.interact = false;
            popup("<span>桌子是空的</span>");
        }
    }

    function interact_cr_blackboard() {
        const x = gameState.classroomX - CR_SIZE.left_wall;
        const y = gameState.classroomY - CR_SIZE.top_wall;
        const blackboard = x <= 3 * vh &&
            y >= CR_SIZE.blackboard_y &&
            y <= CR_SIZE.blackboard_y + CR_SIZE.blackboard_height;
        gameState.can_interact |= blackboard;

        if (gameState.blackboard_hide && controls.any) {
            controls.interact = false;
            // console.log("hide blackboard");
            clearTimeout(gameState.blackboard_hide);
            gameState.blackboard_hide = null;
            blackboard_dom.style.display = "none";
        } else if (blackboard && controls.interact) {
            controls.interact = false;
            if (gameState.blackboard_hide) {
                clearTimeout(gameState.blackboard_hide);
            }
            blackboard_dom.style.display = "block";
            blackboard_text.innerHTML = gameState.classroom.blackboard;
            gameState.blackboard_hide = setTimeout(() => {
                gameState.blackboard_hide = null;
                blackboard_dom.style.display = "none";
            }, 5000);
        }
    }

    function debug_info() {
        return "fps: " + gameState.fps.fps.toFixed(1) +
            " x: " + gameState.playerX +
            " y: " + gameState.playerY +
            " classroom: " + gameState.currentClassroom +
            " floor: " + gameState.currentFloor +
            " offsetX: " + (gameState.offsetX / vh).toFixed(2) +
            " frame: " + (gameState.player_frame / 6).toFixed(0) +
            " face_right: " + gameState.face_right +
            " can_interact: " + gameState.can_interact +
            " scene: " + (gameState.scene ? "classroom" : "corridor");
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
        update_button();
        // ctx.fillStyle = TILE_COLOR["."];
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        switch (gameState.scene) {
            case SCENE.CORRIDOR: {
                draw_corridor();
                draw_player(
                    canvas.width / 2,
                    canvas.height - FLOOR_HEIGHT,
                );
                interact_door();
                break;
            }
            case SCENE.CLASSROOM: {
                draw_classroom();
                draw_player(
                    canvas.width / 2,
                    canvas.height / 2,
                    0.5,
                );
                interact_cr_door();
                interact_cr_blackboard();
                interact_cr_desk();
                break;
            }
        }
        if (gameState.changing_scene_type !== 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${gameState.darkness})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // console.log(`rgba(0, 0, 0, ${gameState.darkness})`);
        }
        if (gameState.can_interact) {
            draw_interact_button(canvas.width / 2 + 10 * vh, canvas.height / 2);
        }

        if (gameState.debug_info) {
            draw_debug_info();
        }
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
    // gameState.debug_info = true;
    // console.log(ctx);
    // gameState.scene = SCENE.CLASSROOM;
    // console.log(JSON.stringify(gameState));
}

globalThis.addEventListener("load", () => {
    load_classrooms().then((classrooms) => main(classrooms));
});
