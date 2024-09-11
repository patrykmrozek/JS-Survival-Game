
let canvas;
let context;

let mouseX;
let mouseY;
let mouseAngle;
let waveCount = 0;

let outcome;
let damage = 1;
let shockwaveSize = 0
let xhttp;

let frameCounter = 0;
let enemyFrameCounter = 0;

let flashCounter = 0;

let enemyAmount = 0;
// let fastEnemyAmount = 0;

let backgroundX = 0;
let backgroundY = 0;

let player = {
    x: 400,
    y: 400,
    size: 30,
    health: 100,
    width: 20,
    height: 27,
    frameX: 0,
    frameY: 0
}

let enemies = []
// let fastEnemies = []

// ghost sprites: https://dyru.itch.io/pixel-ghost-template

let enemyImage = new Image();

// player sprite: https://aaronscales.itch.io/the-mandalorian-top-down-pixel-art-sprite
let playerImage = new Image();


let healthPacks = []

let powerUps = []

let request_id;

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

let flash = false;
let flashLife = 100;

let longFlash = false;

// when longFlash is inactive
document.getElementById("longFlash").style.backgroundColor = "red"
let longFlashTimer = 0
let flashRadius = 150

//when extraDamage is inactive
let extraDamage = false;
document.getElementById("extraDamage").style.backgroundColor = "red"
let extraDamageTimer = 0;

// when waveWipe is inactive
let waveWipe = false;
document.getElementById("waveWipe").style.backgroundColor = "red"

let colours = ['red', 'yellow', 'green', 'blue', 'purple']
let colourIndex = 0

// for the waveWipe shockwave animation
let shockwaveID;


// https://stackoverflow.com/questions/14012768/html5-canvas-background-image


// background from: https://opengameart.org/content/dark-purple-bricks
var background = new Image();
background.src = "../static/darkpurplebricks.png"

background.onload = function () {
    context.clearRect(0, 0, canvas.width, canvas.height)
}


// can call functions before they are defined

let fpsInterval = 1000 / 30; // The denominator is the fps
let now;
let then = Date.now();

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");

    // keydown - key being pressed down
    window.addEventListener("keydown", activate, false)

    // keyup - when key is released
    window.addEventListener("keyup", deactivate, false)

    window.addEventListener("mousedown", activateMouse, false)
    window.addEventListener("mouseup", deactivateMouse, false)
    window.addEventListener("mousemove", mousePosition, false)

    load_assets([
        { "var": enemyImage, "url": "../static/ghost.png" },
        { "var": playerImage, "url": "../static/playerSprite.png" }
        , draw()])
    // draw();

}

function updateAngle(player, e) {

    let dx = player.x - e.x;
    let dy = player.y - e.y;
    e.distance = Math.sqrt((dx ** 2) + (dy ** 2));
    e.angle = Math.atan2(dy, dx)

    // if the enemy is moving right, down, left or right
    if (((e.angle > -Math.PI / 4 && e.angle <= Math.PI / 4) || (e.angle > Math.PI / 4 && e.angle <= 3 * Math.PI / 4) || (e.angle > 3 * Math.PI / 4 || e.angle <= -3 * Math.PI / 4) || (e.angle > -3 * Math.PI / 4 && e.angle <= -Math.PI / 4)) &&
        !(moveLeft && moveRight) &&
        (frameCounter % 5 === 0)) {
        e.frameY = (e.frameY + 1) % 4
    }
    enemyFrameCounter += 1;


    if (e.angle > -Math.PI / 4 && e.angle <= Math.PI / 4) {
        e.frameX = 0;
        // facing right
    } else if (e.angle > Math.PI / 4 && e.angle <= 3 * Math.PI / 4) {
        e.frameX = 2;
        // facing down
    } else if (e.angle > 3 * Math.PI / 4 || e.angle <= -3 * Math.PI / 4) {
        e.frameX = 1;
        // facing left
    } else {
        e.frameX = 3;
        // facing up
    }
}

function spawnEnemies() {
    if (enemies.length === 0) {
        // console.log("AMOUNT: " + enemyAmount)
        enemyAmount += 1;
        waveCount += 1;

        for (let i = 0; i < enemyAmount; i++) {
            let e = {
                x: randint(0, canvas.width),
                y: randint(0, canvas.height),
                size: randint(20, 40),
                xChange: 0,
                yChange: 0,
                width: 25,
                height: 25,
                frameX: 0,
                frameY: 0
            };
            e.health = e.size * 3;
            updateAngle(player, e)
            enemies.push(e);
        };
    };

}

function drawLongFlash() {
    // draws an arc double the radius of the default
    context.beginPath();
    context.arc(player.x + (player.size / 2), player.y + (player.size / 2), (flashRadius * 2), mouseAngle - (1.5 / Math.PI), mouseAngle + (1.5 / Math.PI));
    context.stroke();

    longFlashTimer += 1;
    // when the powerup is active, the background colour of the element is changed to green for the duration of its activity
    document.getElementById("longFlash").style.backgroundColor = "green"

    // it lasts for 300 frames, would run into problems if fps is changed
    if (longFlashTimer === 300) {
        longFlash = false;
        longFlashTimer = 0;
        document.getElementById("longFlash").style.backgroundColor = "red"
    };
};
// same premise as longFlash, just double damage
function dealExtraDamage() {
    context.strokeStyle = "rgba(0, 255, 0, 1)";
    damage = 2;


    extraDamageTimer += 1
    document.getElementById("extraDamage").style.backgroundColor = "green"

    if (extraDamageTimer >= 300) {
        extraDamage = false;
        extraDamageTimer = 0;
        damage = 1;
        document.getElementById("extraDamage").style.backgroundColor = "red"
    };
};





// scrapped idea
// function spawnFastEnemies() {
//     if (fastEnemies.length < waveCount) {
//         fastEnemyAmount += 1;
//         console.log(fastEnemies)

//         for (let i = 0; i < fastEnemyAmount; i++) {
//             let fe = {
//                 x: 1,
//                 y: randint(0, canvas.height),
//                 size: randint(20, 40),
//                 xChange: 0,
//                 yChange: 0,
//             };
//             fe.health = fe.size*3;

//             fastEnemies.push(fe);
//         };
//     };

// }


// when an enemy dies, the players flash increases proportional to the enemies size/3 - health cant go over 100
function increaseFlash(enemy) {
    flashLife += enemy.size / 3;
    if (flashLife >= 90) {
        flashLife = 100;
    }
    // console.log("FLASH LIFE: " + flashLife)
}

// spawns healthpacks - similar set up as enemies
function spawnHealthPack(x, y) {
    let healthPack = {
        x: x,
        y: y,
        size: 20,
    };
    healthPacks.push(healthPack);
}

// draws healthpacks in the position of the enemy that dropped it
function drawHealthPacks() {
    context.fillStyle = 'yellow';
    for (let healthPack of healthPacks) {
        context.fillRect(healthPack.x, healthPack.y, healthPack.size, healthPack.size);
    }
}

function spawnPowerUps(x, y) {
    let powerUp = {
        x: x,
        y: y,
        size: 30
    }
    powerUps.push(powerUp)
}

// https://stackoverflow.com/questions/41099739/how-to-change-background-color-continuously-without-refreshing-the-page
function drawPowerUps() {
    for (let powerUp of powerUps) {
        context.fillStyle = colours[colourIndex]
        context.fillRect(powerUp.x, powerUp.y, powerUp.size, powerUp.size)
    }
    colourIndex = (colourIndex + 1) % colours.length

}

function draw() {

    request_id = window.requestAnimationFrame(draw)

    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }

    // clears the entire canvas, same layout as fillRect
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x += 200) {
        for (let y = 0; y < canvas.height; y += 200) {
            context.drawImage(background, x, y, 200, 200)
        }
    }

    if (moveRight) {
        player.x += player.size / 5;
        player.frameY = 3;
    } if (moveUp) {
        player.y -= player.size / 5;
        player.frameY = 2;
    } if (moveDown) {
        player.y += player.size / 5;
        player.frameY = 0;
    } if (moveLeft) {
        player.x -= player.size / 5;
        player.frameY = 1;
    }

    drawHealthPacks();
    drawPowerUps();
    // console.log("WIPE STAT: " + waveWipe)

    function shockwave() {
        // console.log("WIPE")
        if (shockwaveSize < canvas.width) {
            shockwaveSize += 70;
            context.fillStyle = "white";
            context.fillRect((canvas.width / 2) - (shockwaveSize / 2), (canvas.height / 2) - (shockwaveSize / 4), player.size + shockwaveSize, player.size + shockwaveSize / 2);
            shockwaveID = requestAnimationFrame(shockwave);
            document.getElementById("waveWipe").style.backgroundColor = "green"

        } else {
            shockwaveSize = 0
            waveWipe = false;
            shockwaveID = null;
            document.getElementById("waveWipe").style.backgroundColor = "red"
        }

    }

    if (waveWipe && !shockwaveID) {
        shockwave();
        enemies = [];
    }


    let waveCountElement = document.querySelector("#waveCount")
    waveCountElement.innerHTML = "Wave: " + waveCount



    // context.fillStyle = "green";
    // context.fillRect(player.x+300*Math.cos(mouseAngle-(1.5/Math.PI)),player.y+300*Math.sin(mouseAngle-(1.5/Math.PI)), 10, 10 )
    // context.fillRect(player.x+300*Math.cos(mouseAngle+(1.5/Math.PI)), player.y+300*Math.sin(mouseAngle+(1.5/Math.PI)), 10, 10 )





    // sets the paint colour to yellow

    context.fillStyle = "white";

    if (enemies.length > 0) {
        for (let e of enemies) {
            // context.fillRect(e.x, e.y, e.size, e.size);
            context.drawImage(enemyImage, e.frameX * e.width, e.frameY * e.height, e.width, e.height, e.x - (e.size * 2), e.y - (e.size * 2), e.width * (e.size / 5), e.height * (e.size / 5))
            // console.log("EX: " + e.xChange)
            if (e.xChange < 0) {
                e.frameX = 1;
            }
            enemyHealthBar(e);
            updateAngle(player, e);
            // let speed = 16 - e.size;
            let speed = 6 - (e.size / 10);
            e.x += Math.cos(e.angle) * speed;
            e.y += Math.sin(e.angle) * speed;


            if (e.health <= 0) {
                enemies.splice(enemies.indexOf(e), 1);
                increaseFlash(e);

                let healthPackRNG = randint(1, 6)

                if (healthPackRNG === 1) {
                    spawnHealthPack(e.x, e.y);
                };
                let powerUpRNG = randint(1, 15)

                if (powerUpRNG === 1) {
                    spawnPowerUps(e.x, e.y);
                }

            }
            if (flash && flashLife > 0 && longFlash) {
                if (e.distance < (flashRadius * 3) && (enemyInFlash(e) <= (Math.PI) / 4)) {
                    e.health -= damage

                }
            } else if (flash && flashLife > 0) {
                if (e.distance < (flashRadius * 2) && (enemyInFlash(e) <= (Math.PI) / 4)) {
                    e.health -= damage

                }
            }
        }
    }

    // console.log("DAMAGE: " + damage)

    // if (fastEnemies.length > 0) {
    //     for (let fe of fastEnemies) {
    //         context.fillRect(fe.x, fe.y, fe.size, fe.size);


    //         // let speed = 16 - e.size;
    //         let fedx = player.x - fe.x;
    //         let fedy = player.y - fe.y
    //         let feDist = Math.sqrt(fedx*fedx + fedy*fedy)

    //         let speed = 5;
    //         fe.x += (player.x/feDist)*speed;
    //         fe.y += (player.y/feDist)*speed;


    //         if (fe.x < 0 || fe.x > canvas.width || fe.y < 0 || fe.y > canvas.height) {
    //             fastEnemies.splice(fastEnemies.indexOf(fe), 1);
    //         }
    //     }
    // }



    // The following lines of code were written with the help of the following link:
    // https://stackoverflow.com/questions/27533331/problems-making-enemy-follow-moving-player

    function mousePlayerAngle(player, mouseX, mouseY) {
        mouseAngle = Math.atan2(mouseY - player.y, mouseX - player.x)
    }

    function enemyInFlash(enemy) {
        let enemyAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        let enemyPlayerAngle = Math.abs(mouseAngle - enemyAngle);
        // console.log("ANGLE E: " + enemyAngle)
        return enemyPlayerAngle;

    }

    function enemyHealthBar(enemy) {
        context.fillStyle = "red";
        context.fillRect(enemy.x - (enemy.size * 1.3), enemy.y - enemy.size, enemy.health, enemy.size / 2.5);
        context.fillStyle = 'rgba(0, 255, 0, ' + enemy.health / 100 + ')';
        context.fillRect(enemy.x - (enemy.size * 1.3), enemy.y - enemy.size, enemy.health, enemy.size / 2.5);
        context.fillStyle = "white"

    }

    function playerHealthBar() {
        context.fillStyle = "red";
        context.fillRect(20, 20, player.health * 12, 20);
        context.fillStyle = 'rgba(0, 255, 0, ' + player.health / 150 + ')';
        context.fillRect(20, 20, player.health * 12, 20);
    }

    function flashHealthBar(flashLife) {
        context.fillStyle = "white";
        context.fillRect(20, 40, flashLife * 12, 10)
    }

    context.fillStyle = "rgba(0, 0, 0, 0.5)"
    context.fillRect(0, 0, canvas.width, canvas.height)


    if (flash) {

        // context.fillStyle = "grey"
        // context.fillRect(player.x, player.y, canvas.height, canvas.width);

        // console.log("px" + player.x)
        // console.log("py" + player.y)
        // console.log("mx" + mouseX)
        // console.log("my" + mouseY)


        if (flashCounter % (Math.round(flashLife / 2)) === 0) {
            context.strokeStyle = "rgba(255, 255, 200, 0.3)";
            context.lineWidth = 300;
            flashCounter = 0;
        } else {
            context.strokeStyle = "rgba(255, 255, 200, 0.5)";
            context.lineWidth = 300;
        }
        flashCounter += 1;

        // console.log("FLASHLIFE: "+ flashLife)


        // https://www.w3schools.com/tags/canvas_arc.asp

        mousePlayerAngle(player, mouseX, mouseY)

        if (flashLife > 0) {
            context.beginPath();
            context.arc(player.x + (player.size / 2), player.y + (player.size / 2), flashRadius, mouseAngle - (1.5 / Math.PI), mouseAngle + (1.5 / Math.PI));
            context.stroke();

            if (longFlash) {
                drawLongFlash();
            }

            if (extraDamage) {
                dealExtraDamage();
            }

        }

        flashLife -= 0.2

    }


    context.fillStyle = "blue";
    // context.fillRect(player.x, player.y, player.size, player.size);
    context.drawImage(playerImage, player.frameX * player.width, player.frameY * player.height, player.width, player.height, player.x - 20, player.y - 20, player.width * 4, player.height * 4)

    if ((moveLeft || moveRight || moveUp || moveDown) &&
        !(moveLeft && moveRight) &&
        (frameCounter % 3 === 0)) {
        player.frameX = (player.frameX + 1) % 4
    }
    frameCounter += 1;



    playerHealthBar(player)

    if (flashLife > 0) {
        flashHealthBar(flashLife);
    };

    if (flashLife <= 0) {
        stop("RAN OUT OF BATTERY")
    }



    spawnEnemies();
    // spawnFastEnemies();


    if (enemies.length < 1) {
        let e = {
            x: randint(0, canvas.width),
            y: randint(0, canvas.height),
            size: randint(20, 30),
            xChange: 0,
            yChange: 0,
            width: 25,
            height: 25,
            health: 100,
            frameX: 0,
            frameY: 0
        };
        updateAngle(player, e)
        enemies.push(e);
    };

    if (player.x >= canvas.width + player.size) {
        player.x = 0
    } else if (player.x < 0) {
        player.x = canvas.width;
    }

    if (player.y >= canvas.height) {
        player.y = 0;
    } else if (player.y < 0) {
        player.y = canvas.height;
    }



    for (let e of enemies) {
        if (player_collides(e)) {
            player.health -= e.size / 30
            if (player.health <= 0) {
                stop("YOU DIED");
            }
        }
    }

    for (let healthPack of healthPacks) {
        if (player_collides(healthPack) && player.health < 100) {
            player.health += 10;
            if (player.health >= 100) {
                player.health = 100;
            }
            healthPacks.splice(healthPacks.indexOf(healthPack), 1);
        }
    }


    for (let powerUp of powerUps) {
        if (player_collides(powerUp)) {
            // console.log("COLLIDED")


            powerUps.splice(powerUps.indexOf(powerUp), 1);

            let powerUpSelector = randint(1, 3);

            if (powerUpSelector === 1) {
                longFlash = true;
            } else if (powerUpSelector === 2) {
                extraDamage = true;
            } else if (powerUpSelector === 3) {
                waveWipe = true;
            }

            // console.log("COLL: " + longFlash + ' ' + extraDamage + ' ' + waveWipe)

        }
    }




}

function randint(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}



function activate(event) {
    // finds out which key was pressed
    let key = event.key;
    if (key === "a") {
        moveLeft = true;
    } else if (key === "d") {
        moveRight = true;
    } else if (key === "w") {
        moveUp = true;
    } else if (key === "s") {
        moveDown = true;
    }
}

function deactivate(event) {
    // finds out which key was released
    let key = event.key;
    if (key === "a") {
        moveLeft = false;
    } else if (key === "d") {
        moveRight = false;
    } else if (key === "w") {
        moveUp = false;
    } else if (key === "s") {
        moveDown = false;
    }
}

function activateMouse(event) {
    if (event.button === 0) {
        flash = true;
    }
    // console.log("pressed:" + event.button)

}

function deactivateMouse(event) {
    if (event.button === 0) {
        flash = false;
    }
}

function player_collides(obj) {

    if (player.x + player.size < obj.x ||
        obj.x + obj.size < player.x ||
        player.y > obj.y + obj.size ||
        obj.y > player.y + player.size) {
        return false
    } else {
        return true
    }
}

function mousePosition(event) {
    // the lines of code below were written using the assistance of the following webpage:
    // https://www.geeksforgeeks.org/how-to-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/
    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    // console.log(mouseX);
    // console.log(mouseY);
}

function stop(outcome) {
    window.cancelAnimationFrame(request_id);
    window.cancelAnimationFrame(shockwaveID);
    window.removeEventListener("keydown", activate, false);
    window.removeEventListener("keyup", deactivate, false);
    window.removeEventListener("mousedown", activateMouse, false);
    window.removeEventListener("mouseup", deactivateMouse, false);

    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, canvas.width, canvas.height)

    let outcome_element = document.querySelector("#outcome");
    outcome_element.innerHTML = outcome;

    let replayButton = document.getElementById("replay");
    replayButton.style.display = "block";

    let waveNumber = document.getElementById("waveCount");
    waveNumber.style.left = "45%";
    waveNumber.style.top = "40%";

    // let endlessForm = document.getElementById("endlessForm");
    // endlessForm.style.display = "block";


    let data = new FormData();
    data.append("waveCount", waveCount);

    xhttp = new XMLHttpRequest();
    xhttp.addEventListener("readystatechange", handle_response, false);
    xhttp.open("POST", "store_score", true);
    xhttp.send(data);

}

function handle_response() {
    // check if response fully arrived
    if (xhttp.readyState === 4) {
        //check the request was successful
        if (xhttp.status === 200) {
            if (xhttp.responseText === "success") {
                //score was successfully stored in db
                console.log("yes")
            } else {
                //not stored
                console.log("no")
            }
        }
    }
}


function load_assets(assets, callback) {
    let num_assets = assets.length;
    let loaded = function () {
        console.log("loaded");
        num_assets -= 1;
        if (num_assets === 0) {
            callback();
        }
    };
    for (let asset of assets) {
        let element = asset.var;
        if (element instanceof HTMLImageElement) {
            console.log("img");
            element.addEventListener("load", loaded, false);
        }
        else if (element instanceof HTMLAudioElement) {
            console.log("audio")
            element.addEventListener("canplaythrough", loaded, false);
        }
        element.src = asset.url;
    }
}