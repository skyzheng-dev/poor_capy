//this game grid is 9X16 (playable) (extra head space for the top) and 11X18 (including unplayable)
const grid = [
     0,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10, 10, 0,
     4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
     4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
     4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
     4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
     4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
     4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
     4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
     4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
     4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
     0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0
];
// 1 = air, 3 = ground, 4 = left wall, 5 = right wall, 0 = corner, 10 = obstacle shooter


const toStartContainer = document.querySelector(".to-start-container");
const game = document.querySelector(".game-container");
const capy = document.querySelector(".capy");
const capyImg = capy.querySelector("img");


for (let i=0; i < grid.length; i++) {
    game.innerHTML += `<div id="ID${grid[i]}" class="pixel"></div>`;
}   
const pixels = document.querySelectorAll(".pixel");


const leftWalls = [];
const rightWalls = [];

for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 4) {
        leftWalls.push(pixels[i]); // Add left wall elements
    } else if (grid[i] === 5) {
        rightWalls.push(pixels[i]); // Add right wall elements
    }
}


let score = 0;
let gameStarted = true;
let y = 15;
let x = 85; // left = 255px, right = 1380px

const error = 10;
let difficulty = {
    shooter_speed: 200,
    object_speed: 100
}


toStartContainer.addEventListener("click", (button)=> {
    if (gameStarted) {
        gameStarted = false;
        if (button.target.classList.value == "medium") {
            difficulty.shooter_speed = 75; 
            difficulty.object_speed = 75; 
        }
        else if (button.target.classList.value == "hard"){
            difficulty.shooter_speed = 50; 
            difficulty.object_speed = 50; 
        } 
        toStartContainer.innerHTML = `<p>${score}</p>`;
        startGame();
    }
})



let fallingInterval;
let jumpingInterval;
let shooterInterval;

const keys = {};
const object_dict = {};

let isFalling = true;
let isJumping = true;
let goingLeft = false;
let goingRight = false;
let gameOver = false;


function startGame() {
    
    fallingInterval = setInterval(() => {
        if (isFalling) {
            y -= 4;
            if (y < 15) y+=4;
            capy.style.bottom = `${y}vh`;
        }

    },50);
    
    shooterInterval = setInterval(()=>{
        let index = Math.floor(Math.random()*16+1);
        let binary = Math.floor(Math.random()*5)

        
        if (!object_dict[index]) {
            if (binary < 1.6) {
                pixels[index].innerHTML += `<img class="watermelon object" src='Watermelon.png'>`
            }
            else {
                pixels[index].innerHTML += `<img class="boulder object" src='Boulder.png'>`
            }
            object_dict[index] = true; //true means occupied
            
            let object = pixels[index].querySelector('.object'); 
            let height = 0;
            
            let objectInterval = setInterval(()=>{
                if (isCapyTouching(capyImg, object, objectInterval, index)) {
                    flashObject(object);
                    clearInterval(shooterInterval);
                    clearInterval(objectInterval);
                    clearInterval(fallingInterval);
                    fallingInterval = setInterval(() => {
                        y -= 4;
                        if (y < 15) {
                            clearInterval(fallingInterval);
                            capyImg.style.transform = "scaleY(-1)";
                        }
                        capy.style.bottom = `${y}vh`;
                        
                    },50)

                    gameOver = true;
                    if (gameOver) toStartContainer.innerHTML += '<button onclick="location.reload()" class="retry"><i class="fa-solid fa-rotate-right"></i></button>'

                    return;
                }
                else if (gameOver) {
                    clearInterval(objectInterval);
                }


                height += 2

                if (height>=70 || isCapyTouching(capyImg, object, objectInterval, index)) {
                    pixels[index].innerHTML = '';
                    object_dict[index] = false;

                    clearInterval(objectInterval); 
                }
                else {
                    object.style.bottom = `${height}vh`;
                }
            },difficulty.object_speed);
        }
        
    },difficulty.shooter_speed) // easy = 250:100, medium = 100:75, hard = 50:50, impossible = 50:25 
    
    document.addEventListener("keydown", (event) => {
        keys[event.key] = true; 
        updateMovement(); 
    });
    
    document.addEventListener("keyup", (event) => {
        keys[event.key] = false; 
        updateMovement(); 
    });

    requestAnimationFrame(gameLoop);
    
}

function isCapyTouchingWall(capy, walls) {
    const rect1 = capy.getBoundingClientRect();

    for (const wall of walls) {
        const rect2 = wall.getBoundingClientRect();

        if (!(
            rect1.right < rect2.left || // capy is to the left of wall
            rect1.left > rect2.right || // capy is to the right of wall
            rect1.bottom < rect2.top || // capy is above wall
            rect1.top > rect2.bottom    // capy is below wall
        )) {
            return true; 
        }
    }

    return false; 
}

function right() {
    if (!goingRight || gameOver) return;

    capy.style.transform = "scaleX(-1)";
    x += 0.7;

    if (isCapyTouchingWall(capy, rightWalls)) {
        x -= 0.7; 
    }

    capy.style.left = `${x}vh`;
}

function left() {
    if (!goingLeft || gameOver) return;

    capy.style.transform = "scaleX(1)";
    x -= 0.7;

    if (isCapyTouchingWall(capy, leftWalls)) {
        x += 0.7; 
    }

    capy.style.left = `${x}vh`;
}

function jump() {
    if (!isJumping || gameOver) return;
    isFalling = false
    isJumping = false;
    jumpingInterval = setInterval(()=>{
        if (gameOver) return;
        y+=4
        capy.style.bottom = `${y}vh`;
    },50)
    

    setTimeout(() => { isFalling = true; clearInterval(jumpingInterval); }, 300);
    setTimeout(() => { isJumping = true }, 600);
}

function gameLoop() {
    if(!gameOver) {
        if (goingRight) right();
        if (goingLeft) left();
        toStartContainer.innerHTML = `<p>${score}</p>`
        requestAnimationFrame(gameLoop); 
    }
}

function updateMovement() {
    goingRight = keys["ArrowRight"];
    goingLeft = keys["ArrowLeft"];

    if (keys["ArrowUp"] && isJumping) {
        jump();
    }
}

function isCapyTouching(capy, object, objectInterval, index) {
    const rect1 = capy.getBoundingClientRect();
    const rect2 = object.getBoundingClientRect();

    if (object.classList.contains('watermelon') && !(rect1.right-error < rect2.left || rect1.left+error > rect2.right || rect1.bottom-error < rect2.top || rect1.top+error > rect2.bottom)) {
        score++;

        pixels[index].innerHTML = '';
        object_dict[index] = false;
        
        clearInterval(objectInterval);
        return false;
    }


    return !(
        rect1.right-error < rect2.left || // capy is to the left of object
        rect1.left+error > rect2.right || // capy is to the right of object
        rect1.bottom-error < rect2.top || // capy is above object
        rect1.top+error > rect2.bottom    // capy is below object
    );
}

function flashObject(object) {
    let counter = 0;

    object.style.borderRadius = "50px";

    let flasher = setInterval(() => {
        if (counter > 4) clearInterval(flasher)
        counter++;

        if(counter%2==0) {
            object.style.backgroundColor = "red";
        }
        else{
            object.style.backgroundColor = "black";
        }
    }, 200);
    
}
