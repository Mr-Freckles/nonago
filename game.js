//game not started yet
let gameStart = false;
let lost = false
let level = 1;

//set gravity variables 
let gravity = 0;

//score
let score = 0;
let highScore;

//set collision variables
let allowPoint = true;
let collisionX = false;
let collisionY = false;
let collision = false;

//set hexagon variables
let radius = 200; //radius of hexagon
let startX = 300; //origin of hexagon x
let startY = 350; //origin of hexagon y
let startSpin = 1.5 //initial spin speed
let spinSpeed = startSpin; //spin speed

//colour of circle at start
let colour = ['red', 'blue', 'green']
let onColour = 'green';

//circle variables 
let maxSpeed = 5;
let downSpeed = 20;

function targetCircle(colour) {
    stroke('black');
    strokeWeight(3);
    fill(colour)
    circle(300, 60, 100);
}

//start game if any key is pressed
function keyPressed(event) {
    if (!gameStart) {
        gameStart = true;
        gravity = 0.4;
        player.x = startX;
        player.y = startY;
        player.canMove = true;
        onColour = 'green';
    }

    //stop scrolling of page when keys are pressed
    //source: 
    //https://stackoverflow.com/questions/8916620/disable-arrow-key-scrolling-in-users-browser
    if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault();
    }
}
//player class
class Player {
    constructor(x, y, radius, speed, vertSpeed, canJump, canMove) {
        this.x = x ?? startX;
        this.y = y ?? startY;
        this.r = radius ?? 25;
        this.vx = speed ?? 0;
        this.vy = vertSpeed ?? 0;
        this.canJump = canJump ?? false;
        this.canMove = canMove ?? false;
    }

    storeData() {
        console.log('highScore: ' + highScore);
        storeItem('highScore', highScore);
    }
    //draw level, score, and highscore, player
    draw() {
        noStroke()
        fill(255);
        textSize(30);
        text('Score: ' + score, 20, 70);
        text('High Score: ' + highScore, 20, 110);
        text('Level: ' + level, 20, 30)
        circle(this.x, this.y, this.r);
        
    }

    //checks for collisions
    collision() {
        for (let i = 1; i < sides + 1; i++) {

            //set buffer variable
            let buffer = this.r - 10;

            //line points 
            let x1 = startX + radius * cos(angleVar + radAngle*i);
            let y1 = startY + radius * sin(angleVar + radAngle*i);
            let x2 = startX + radius * cos(angleVar + radAngle*(i + 1));
            let y2 = startY + radius * sin(angleVar + radAngle*(i + 1));
            //solve for m
            let m = (y2 - y1) / (x2 - x1);
            //solve for c
            let c = y1 - (m * x1);
            //find y value of line if it was touching at ballX
            let lineY = m * this.x + c;
            let lineX = (this.y - c)/m
            //stop player if in contact with lines for y axis movement
            if (this.y > startY && lineY - buffer < this.y && this.y < lineY + buffer) {
                this.vy = 0;
                this.y -=2;
                this.canJump = true;
                collisionY = true;
                collision = true;
            } else if (this.y < startY && lineY - buffer < this.y && this.y < lineY + buffer) {
                this.vy = 0;
                this.y +=2;
                collisionY = true;
                collision = true;
            } else {
                collision = false;
            }
            
            //stop player if in contact with lines x axis movement
            if (this.x < startX && lineX - buffer < this.x && this.x < lineX + buffer) {
                this.vx = 0;
                this.x ++;
                collisionX = true;
            } else if (this.x > startX && lineX - buffer < this.x && this.x < lineX + buffer) {
                this.vx = 0;
                this.x --;
                collisionX = true;
            }

            //find if collision and add one point
            if (collisionY || collisionX) {
                if ((i + 1) % 3 === 0 && onColour === 'red' && allowPoint) {
                    score++;
                    spinSpeed += 0.1;
                    allowPoint = false;
                } else if ((i - 1) % 3 === 0 && onColour === 'green' && allowPoint) {
                    score++;
                    spinSpeed += 0.1;
                    allowPoint = false;
                } else if (i % 3 === 0 && onColour === 'blue' && allowPoint) {
                    score++;
                    spinSpeed += 0.1;
                    allowPoint = false; 
                } 
            } else {
                allowPoint = true; //allow for another point to be added if there is no more collision aka a jump has occured
            }
            //if collision with an incorrect colour
            if (collision && (((i + 1) % 3 === 0 && onColour !== 'red') || ((i - 1) % 3 === 0 && onColour !== 'green') || (i % 3 === 0 && onColour !== 'blue'))) {
                this.gameEnd();
            }
        }
    }

    //end the game and reset variables
    gameEnd() {
        gameStart = false;
        angleVar = 0; //reset hexagon initial rotation
        //save score as highscore
        if (score > highScore) {
            highScore = score;
        }
        score = 0; //reset score
        onColour = 'green'; //reset colour to make start easier
        this.canJump = false; //reset variables
        this.canMove = false;
        this.vy = 0; //reset movement to 0
        this.vx = 0;
        this.x = startX; //reset spawn points
        this.y = startY;
        gravity = 0; //stop ball from moving vertically due to gravity
        lost = true; //run function for loosing the game
        collisionX = false; //reset to no collisions occuring
        collisionY = false;
        spinSpeed = startSpin; //reset spin speed
        level = 1; //reset level
        this.storeData(); //store highscore in local storage
    }

    update() {
        //move left and right
        if (keyIsDown(LEFT_ARROW) && this.canMove) {
            this.vx -= 0.8;
        } else if (keyIsDown(RIGHT_ARROW) && this.canMove) {
            this.vx += 0.8; 
        } else if (this.vx > 0) {//return speed to 0
            this.vx -= 0.1;
        } else if (this.vx < 0) {
            this.vx += 0.1;
        }
        if (0.1 > this.vx && this.vx > -0.1 && !keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
            this.vx = 0;
        }
        this.x += this.vx;

        //cap speed
        if (this.vx > maxSpeed) {
            this.vx = maxSpeed;
        } else if (this.vx < -maxSpeed) {
            this.vx = -maxSpeed;
        }
        //jump if collision and up arrow is pressed 
        if (keyIsDown(UP_ARROW) && this.canJump && this.canMove) {
            this.vy -= 14;
            onColour = random(colour);
            this.canJump = false;
            collisionX = false;
            collisionY = false;
        } 

        //drop down quickly
        if (keyIsDown(DOWN_ARROW) && this.canMove) {
            this.vy += 2;
        }

        //cap speed 
        if (this.vy > downSpeed) {
            this.vy = downSpeed;
        } else if (this.vy < -downSpeed) {
            this.vy = -downSpeed;
        }
        //set gravity
        this.vy += gravity;
        this.y += this.vy;

        //update level
        if (level*0.1 + startSpin === spinSpeed) {
            level++;
        }
        
        this.collision();
        this.draw();
    }
}

//set variables for new player
let player = new Player();

function setup() {
    createCanvas(600, 600);
    background(51);
    highScore = getItem('highScore') ?? 0;
}

//number of sides on the shape
let sides = 9;
let angle = 360 / sides; //interal angles in degrees 
let radAngle = angle * Math.PI / 180; //set to radians
let angleVar = 0; //allows for movement 0 is starting position

function draw() {
    background(51);
    //draw hexagon
    strokeWeight(5);
    //set stroke colour for each side
    for (let i = 1; i < sides + 1; i ++) {
        if ((i + 1) % 3 === 0) {
            stroke('red');
        } else if ((i - 1) % 3 === 0) {
            stroke('green');
        } else if (i % 3 === 0) {
            stroke('blue');
        }
        //draw lines 
        let x1 = startX + radius * cos(angleVar + radAngle*i);
        let y1 = startY + radius * sin(angleVar + radAngle*i);
        let x2 = startX + radius * cos(angleVar + radAngle*(i + 1));
        let y2 = startY + radius * sin(angleVar + radAngle*(i + 1));
        line(x1, y1, x2, y2);
    }

    // spin when game starts
    if (gameStart === true) {
        angleVar += spinSpeed*0.01;
        lost = false;
    }

    if (lost) {
        fill(255, 0, 0);
        noStroke();
        textSize(70);
        text('YOU LOSE', startX - 175, startY + 35);
    }


    player.update();
    targetCircle(onColour);
}