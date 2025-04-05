//game not started yet
let gameStart = false;
let lost = false;
let level = 1;

//upgrade variables
let immune = false;
let lowG = false;
let bigBalls = 1;
let doublepoints = 1;
let colourlock = false;

//firebase stuff
const API = 'https://nonago-7f684-default-rtdb.asia-southeast1.firebasedatabase.app/';
const USER_API = API + 'users/';

//set gravity variables 
let gravity = 0;

//score
let score = 0;
let highScore;

//sidebars
let leaderboardShowing = false;
let shopShowing = false;

//nonacoins
let nonacoins;

//set collision variables
let allowPoint = true;
let collisionX = false; //for point detection
let collisionY = false;
let altcollisionY = false; //for death detection
let altcollisionX = false;

//set hexagon variables
let radius = 200; //radius of hexagon
let startX = 290; //origin of hexagon x
let startY = 350; //origin of hexagon y
let spinSpeed = 0.015; //spin speed initially

//colour of circle at start
let colour = ['red', 'blue', 'green']
let onColour = 'green';

//circle variables 
let maxSpeed = 5;
let maxDownSpeed = 20;
let currentBall = 0;

function targetCircle(colour) {
    stroke('black');
    strokeWeight(3);
    fill(colour)
    circle(startX, startY, 100);
}

//make a cool background
function fallingNonagon(x, y, r, s) {
    let bstartY = y - 20;
    let bstartX = x;
    let radius = r;
    let shade = s;

    stroke(0, shade);
    for (let i = 1; i < sides + 1; i++) {
        //draw lines 
        let x1 = bstartX + radius * cos(radAngle*i);
        let y1 = bstartY + radius * sin(radAngle*i);
        let x2 = bstartX + radius * cos(radAngle*(i + 1));
        let y2 = bstartY + radius * sin(radAngle*(i + 1));
        line(x1, y1, x2, y2);
    }   
}

//start game if any key is pressed
function keyPressed(event) {
    if (!gameStart && keyCode === 32 && !leaderboardShowing) {
        gameStart = true;
        gravity = 0.4;
        player.x = startX;
        player.y = startY;
        player.canMove = true;
        onColour = 'green';
        level = 1;
        score = 0;
    }

    //stop scrolling of page when keys are pressed
    //source: 
    //https://stackoverflow.com/questions/8916620/disable-arrow-key-scrolling-in-users-browser
    if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault();
    }
}

function mouseMoved() {
    if ((!shopShowing && !leaderboardShowing && mouseX < 600 && mouseX > 580 && mouseY > 0 && mouseY < 600)
        || (!leaderboardShowing && !shopShowing && mouseX < 20 && mouseX > 0 && mouseY < 600 && mouseY > 0)
        || (leaderboardShowing && mouseX < 20 && mouseX > 0 && mouseY < 600 && mouseY > 0)
        || (shopShowing && mouseX < 600 && mouseX > 580 && mouseY > 0 && mouseY < 600)) {
        cursor(HAND);
    } else {
        cursor(ARROW);
    }

    if (shopShowing) {
        let y = 1;
        let x = 100;
        for (let i = 0; i < upgrades.length; i++) {
            if (i % 3 === 0 && i !== 0) {
                y++;
                x -= 570;
            }
            
            if (!upgrades[i].bought && upgrades[i].cost < nonacoins && mouseX > (190 * i) + x - 70 && mouseX < (190 * i) + x + 70 && mouseY > (y * 250) - 30 + scrollElement && mouseY < (y * 250) + 140 + scrollElement) {
                cursor(HAND);
            } else if (mouseX > (190 * i) + x - 70 && mouseX < (190 * i) + x + 70 && mouseY > (y * 250) - 30 + scrollElement && mouseY < (y * 250) + 140 + scrollElement) {
                cursor(ARROW);
            }
        }

        y = finalUpgradeY;
        x = 100; 

        for (let i = 0; i < balls.length; i++) {
            if (i % 3 === 0 && i !== 0) {
                y += 200;
                x -= 570;
            } 
            
            if ((!balls[i].bought && balls[i].cost < nonacoins || balls[i].bought) && mouseX > 190 * i + x - 60 && mouseX < 190 * i + x + 60 && mouseY > y - 10 + scrollElement && mouseY < y + 110 + scrollElement) {
                cursor(HAND);
            } 
        }
    }
}

//make the leaderboard come out when the right side button is pressed
function mousePressed() {
    //open tabs
    if (!shopShowing && !leaderboardShowing && mouseX < 600 && mouseX > 580 && mouseY > 0 && mouseY < 600) {
        leaderboardShowing = true;
    }
    
    if (!leaderboardShowing && !shopShowing && mouseX < 20 && mouseX > 0 && mouseY < 600 && mouseY > 0) {
        shopShowing = true;
        scrollElement = 0;
    }

    //close tabs
    if (leaderboardShowing && mouseX < 20 && mouseX > 0 && mouseY < 600 && mouseY > 0) {
        leaderboardShowing = false;
    }

    if (shopShowing && mouseX < 600 && mouseX > 580 && mouseY > 0 && mouseY < 600) {
        shopShowing = false;
    }

    //if mouse is over a upgrade that hasn't been bought
    if (shopShowing) {
        let y = 1;
        let x = 100;
        for (let i = 0; i < upgrades.length; i++) {
            if (i % 3 === 0 && i !== 0) {
                y++;
                x -= 570;
            }
            
            if (!upgrades[i].bought && upgrades[i].cost < nonacoins && mouseX > (190 * i) + x - 70 && mouseX < (190 * i) + x + 70 && mouseY > (y * 250) - 30 + scrollElement && mouseY < (y * 250) + 140 + scrollElement) {
                upgrades[i].buy();
            }
        }

        y = finalUpgradeY;
        x = 100; 

        for (let i = 0; i < balls.length; i++) {
            if (i % 3 === 0 && i !== 0) {
                y += 200;
                x -= 570;
            } 
            
            if (!balls[i].bought && balls[i].cost < nonacoins && mouseX > 190 * i + x - 60 && mouseX < 190 * i + x + 60 && mouseY > y - 10 + scrollElement && mouseY < y + 110 + scrollElement) {
                balls[i].buy();
            } else if (balls[i].bought && mouseX > 190 * i + x - 60 && mouseX < 190 * i + x + 60 && mouseY > y - 10 + scrollElement && mouseY < y + 110 + scrollElement) {
                currentBall = balls[i].id;
                storeItem('current ball', currentBall);
            }
        }
    }
}

//stupid names/scores array is a placeholder for firebase top names
let stupidNames = ['harry', 'sam', 'pauline', 'lachlan'];
let stupidScores = [100, 50, 30, 20];

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

    //draw level, score, and highscore, player
    draw() {
        noStroke()
        textAlign(LEFT);
        fill(255);
        textSize(30);
        textFont('arial');
        text('Score: ' + score, 40, 70);
        text('High Score: ' + highScore, 40, 110);
        text('Level: ' + level, 40, 30)
        textAlign(RIGHT);
        fill('yellow');
        text('Nonacoins: ' + nonacoins, 560, 30);
        balls[currentBall].draw(this.x, this.y, (this.r * bigBalls));
    }

    //checks for collisions
    collision() {
        for (let i = 1; i < sides + 1; i++) {

            //set buffer variable
            let buffer = (this.r - 10) * bigBalls;

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
            if (this.y > startY && lineY - (buffer - 1) < this.y && this.y < lineY + (buffer - 1)) {
                this.vy = 0;
                this.y = lineY - buffer;
                this.canJump = true;
                collisionY = true;
                altcollisionY = true;
            } else if (this.y < startY && lineY - (buffer - 1) < this.y && this.y < lineY + (buffer - 1)) {
                this.vy = 0;
                this.y = lineY + buffer;
                collisionY = true;
                altcollisionY = true;
            } else {
                altcollisionY = false;
            }
            
            //stop player if in contact with lines x axis movement
            if (this.x < startX && lineX - (buffer - 1) < this.x && this.x < lineX + (buffer - 1)) {
                this.vx = 0;
                this.x = lineX + buffer;
                this.vy = 0;
                collisionX = true;
                altcollisionX = true;
            } else if (this.x > startX && lineX - (buffer - 1) < this.x && this.x < lineX + (buffer - 1)) {
                this.vx = 0;
                this.x = lineX - buffer;
                this.vy = 0;
                collisionX = true;
                altcollisionX = true;
            } else {
                altcollisionX = false;
            }

            //find if collision and add one point
            if (collisionY || collisionX) {
                if ((i + 1) % 3 === 0 && onColour === 'red' && allowPoint) {
                    score += doublepoints;
                    spinSpeed += 0.001;
                    allowPoint = false;
                } else if ((i - 1) % 3 === 0 && onColour === 'green' && allowPoint) {
                    score += doublepoints;
                    spinSpeed += 0.001;
                    allowPoint = false;
                } else if (i % 3 === 0 && onColour === 'blue' && allowPoint) {
                    score += doublepoints;
                    spinSpeed += 0.001;
                    allowPoint = false; 
                } 
            } else {
                allowPoint = true; //allow for another point to be added if there is no more collision aka a jump has occured
            }
            //if collision with an incorrect colour
            if (!immune && (altcollisionX || altcollisionY) && (((i + 1) % 3 === 0 && onColour !== 'red') || ((i - 1) % 3 === 0 && onColour !== 'green') || (i % 3 === 0 && onColour !== 'blue'))) {
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
            storeItem('highScore', highScore); //store highscore in local storage
        }
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
        spinSpeed = 0.015; //reset spinspeed
        upgradeImg = false;// make sure that the upgarade image is no longer showing
        immune = false;//reset upgrade variables
        lowG = false;
        bigBalls = 1;
    }

    update() {
        //move left and right
        if ((keyIsDown(LEFT_ARROW) || keyIsDown(65)) && this.canMove) {
            this.vx -= 0.8;
        } else if ((keyIsDown(RIGHT_ARROW) || keyIsDown(68)) && this.canMove) {
            this.vx += 0.8; 
        } else if (this.vx > 0) {//return speed to 0
            this.vx -= 0.1;
        } else if (this.vx < 0) {
            this.vx += 0.1;
        }
        if (0.1 > this.vx && this.vx > -0.1 && !keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW) && !keyIsDown(65) && !keyIsDown(68)) {
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
        if ((keyIsDown(UP_ARROW) || keyIsDown(87) || keyIsDown(32)) && this.canJump && this.canMove) {
            if (lowG) {
                this.vy -= 11;
            } else {
                this.vy -= 14;
            }
            if (!colourlock) {
                onColour = random(colour);
            }
            this.canJump = false;
            collisionX = false;
            collisionY = false;
        } 

        //drop down quickly
        if ((keyIsDown(DOWN_ARROW) || keyIsDown(83) || keyIsDown(16)) && this.canMove) {
            this.vy += 2;
        }

        //cap speed 
        if (this.vy > maxDownSpeed) {
            this.vy = maxDownSpeed;
        } else if (this.vy < -maxDownSpeed) {
            this.vy = -maxDownSpeed;
        }
        //set gravity
        this.vy += gravity;
        this.y += this.vy;

        //update level
        if ((level + 1) * 0.01 < spinSpeed) {
            level++;
            levelEffect();
            nonacoins += level;
            storeItem('nonacoins', nonacoins);
        }
        
        this.collision();
        this.draw();
    }
}

//set variables for new player
let player = new Player();

class Upgrade {
    constructor(cost, name, imagePath, id, effect, bought) {
        this.cost = cost;
        this.name = name;
        this.imgPath = imagePath;
        this.id = id;
        this.effect = effect;
        this.bought = bought ?? false;
    }

    //draw the image
    draw(x, y) {
        this.img.resize(140, 140);
        imageMode(CENTER);
        image(this.img, x, y);
        textAlign(CENTER);
        fill('black');
        noStroke();
        text(this.name, x, y - 90)
        this.bought = getItem(`${this.name} status`);
        if (this.bought === null) {
            this.bought = false;
        }
        if (this.bought) {
            text('Owned', x, y + 100);
        } else {
            fill(220, 225, 0);
            text(this.cost, x, y + 100);
        }
    }

    //if a person clicks to buy an upgrade
    buy() {
        if (!this.bought) {
            boughtUpgrades.push(this.id);
            storeItem('bought upgrades', boughtUpgrades);
            nonacoins -= this.cost;
            storeItem('nonacoins', nonacoins);
            this.bought = true;
            storeItem(`${this.name} status`, this.bought);
        }
    }
}

//add new upgrades
let timeslow = new Upgrade(500, 'Time Slow', 'assets/timeslow.png', 0, () => {
    spinSpeed -= 0.005;
});
let immunity = new Upgrade(1000, 'Immunity', 'assets/immunity.png', 1, () => {
    immune = true;
    setTimeout(() => {
        immune = false;
    }, 5000);
});
let bigBall = new Upgrade(1000, 'Big Ball', 'assets/big ball.png', 2, () => {
    bigBalls = 2;
    setTimeout(() => {
        bigBalls = 1;
    }, 5000);
})
let doublePoints = new Upgrade(2000, 'Double Points', 'assets/double points.png', 3, () => {
    doublepoints = 2;
    setTimeout(() => {
        doublepoints = 1;
    }, 5000);
})
let colourLock = new Upgrade(4000, 'Colour Lock', 'assets/colour lock.png', 4, () => {
    colourlock = true;
    setTimeout(() => {
        colourlock = false;
    }, 5000);
})

//TODO get this upgrade up to scratch
// let lowGravity = new Upgrade(0, 'Low Gravity', '/assets/error.png', 2, () => {
//     gravity = 0.2;
//     lowG = true;
//     player.vy = 0;
//     setTimeout(() => {
//         gravity = 0.4;
//         lowG = false
//     }, 5000)
// }); 

//array for new upgrades
let upgrades = [timeslow, immunity, bigBall, doublePoints, colourLock];
let boughtUpgrades = [];

let effectNum;
let upgradeImg = false;

//add special effects when a new level starts
function levelEffect() {
    effectNum = random(boughtUpgrades)
    if (effectNum !== undefined) {
        upgrades[effectNum].effect();
        upgradeImg = true;
        setTimeout(() => {
            upgradeImg = false;
        }, 5000)
    }
    
}

class CustomBall {
    constructor(colour, imagePath, cost, name, id, bought) {
        this.colour = colour ?? false;
        this.imgPath = imagePath ?? false;
        this.cost = cost ?? 0;
        this.name = name;
        this.id = id;
        this.bought = bought ?? false;
    }

    //make sure that white ball is already bought
    setup() {
        storeItem(`${this.name} status`, this.bought);
    }

    //draw the image or colour ball
    draw(x, y, radius) {
        if(!this.imgPath) {
            fill(this.colour);
            stroke('white')
            strokeWeight(2);
            circle(x, y, radius);
        } else {
            this.img.resize(radius, 0);
            imageMode(CENTER);
            image(this.img, x, y);
        }
    }

    //call when a ball is bought
    buy() {
        boughtBalls.push(this.id)
        storeItem('bought balls', boughtBalls);
        this.bought = true;
        storeItem(`${this.name} status`, this.bought);
        nonacoins -= this.cost;
        storeItem('nonacoins', nonacoins);

    }
}

//new balls
let whiteBall = new CustomBall('white', false, 0, 'White Ball', 0, true);
let blackBall = new CustomBall('black', false, 50, 'Black Ball', 1);
let greyBall = new CustomBall('silver', false, 50, 'Grey Ball', 2);
let redBall = new CustomBall('red', false, 200, 'Red Ball', 3);
let greenBall = new CustomBall('green', false, 200, 'Green Ball', 4);
let blueBall = new CustomBall('blue', false, 200, 'Blue Ball', 5);
let purpleBall = new CustomBall('purple', false, 400, 'Purple Ball', 6);
let yellowBall = new CustomBall('yellow', false, 400, 'Yellow Ball', 7);
let pinkBall = new CustomBall('pink', false, 400, 'Pink Ball', 8);
let orangeBall = new CustomBall('orange', false, 500, 'Orange Ball', 9);
let tealBall = new CustomBall('teal', false, 500, 'Teal Ball', 10);
let tanBall = new CustomBall('tan', false, 500, 'Tan Ball', 11);

//image balls
let imgBall1 = new CustomBall(false, 'assets/ball1.png', 600, 'Green Cross', 12);
let imgBall2 = new CustomBall(false, 'assets/ball2.png', 600, 'Blue Swirl', 13);
let imgBall3 = new CustomBall(false, 'assets/ball3.png', 600, 'Red Cross', 14);
let imgBall4 = new CustomBall(false, 'assets/ball4.png', 800, 'Yellow Cross', 15);
let imgBall5 = new CustomBall(false, 'assets/ball5.png', 800, 'Purple Cross', 16);
let imgBall6 = new CustomBall(false, 'assets/ball6.png', 800, 'Purple Spiral', 17);
let imgBall7 = new CustomBall(false, 'assets/ball7.png', 900, 'Sun Ball', 18);
let imgBall8 = new CustomBall(false, 'assets/ball8.png', 900, 'Love Ball', 19);
let imgBall9 = new CustomBall(false, 'assets/ball9.png', 900, 'Star Ball', 20);
let imgBall10 = new CustomBall(false, 'assets/ball10.png', 1000, 'Cloud Ball', 21);
let imgBall11 = new CustomBall(false, 'assets/ball11.png', 1000, 'Lapis Ball', 22);
let imgBall12 = new CustomBall(false, 'assets/ball12.png', 1000, 'Murkey Ball', 23);
let imgBall13 = new CustomBall(false, 'assets/ball13.png', 1250, 'Vibrant Cloud', 24);
let imgBall14 = new CustomBall(false, 'assets/ball14.png', 1250, 'Spiral Ball', 25);
let imgBall15 = new CustomBall(false, 'assets/ball15.png', 1250, 'Heaven Ball', 26);
let imgBall16 = new CustomBall(false, 'assets/ball16.png', 1500, 'Wave Ball', 27);
let imgBall17 = new CustomBall(false, 'assets/ball17.png', 1500, 'Beach Ball', 28);
let imgBall18 = new CustomBall(false, 'assets/ball18.png', 1500, 'Mountain Ball', 29);
let imgBall19 = new CustomBall(false, 'assets/ball19.png', 2000, 'Show Off Ball', 30);

//set variables for balls 
let balls = [whiteBall, blackBall, greyBall, redBall, greenBall, blueBall, purpleBall, yellowBall, pinkBall, orangeBall, tealBall, tanBall, imgBall1, imgBall2, imgBall3, imgBall4, imgBall5, imgBall6, imgBall7, imgBall8, imgBall9, imgBall10, imgBall11, imgBall12, imgBall13, imgBall14, imgBall15, imgBall16, imgBall17, imgBall18, imgBall19];
let boughtBalls = [];

//make the leaderboard come out and show the top scorers 
function leaderboard() {
    //draw background
    strokeWeight(3);
    fill('grey');
    rect(20, -3, 590, 606);

    stroke('black');
    rect(-10, -3, 30, 606);
    line(15, 300, 5, 290);
    line(15, 300, 5, 310);

    //draw title
    textSize(40);
    noStroke();
    fill('black');
    textFont('arial', 30);
    textAlign(CENTER);
    text("Leaderboard", 310, 50);
    // TODO remove once leaderboard is completed
    fill('red');
    textSize(60);
    text("Coming Soon", 310, 300);

//     // draw places
//     for(let i = 0; i < 10; i++) {
//         noStroke();
//         textAlign(RIGHT);
//         text(i + 1 + ':', 85, 50 * i + 100);

//         //get top scores from firebase
//         //for now top scores are in array called stupid names
//         textAlign(CENTER);
//         text(stupidNames[i], 310, 50 * i + 100);
//         textAlign(CENTER);
//         text(stupidScores[i], 550, 50 * i + 100);
//     }
}

//set variables to allow for scrolling
let scrollElement = 0;
let maxScroll;
let finalUpgradeY;

function mouseWheel(event) {
    if (scrollElement !== -maxScroll && event.delta > 0) {
        scrollElement -= 20;
    } else if (scrollElement !== 0 && event.delta < 0) {
        scrollElement += 20;
    } 
} 

function shop() {
    //background
    strokeWeight(3);
    fill('grey');
    rect(-3, -3, 583, 606);
    stroke('black');
    rect(580, -3, 30, 606);
    line(585, 300, 595, 290);
    line(585, 300, 595, 310);

    //title
    noStroke();
    fill('black');
    textAlign(CENTER);
    textFont('arial', 30);
    textSize(60);
    text("SHOP", 290, 100 + scrollElement);
    textSize(40);
    fill('red');
    text('Upgrades', 290, 150 + scrollElement);
    
    //actual upgrades
    //upgrades
    let y = 1
    let x = 100;
    textSize(30);
    for (let i = 0; i < upgrades.length; i++) {
        if (i % 3 === 0 && i !== 0) {
            y++;
            x -= 570;
        }
        upgrades[i].draw(190 * i + x, (y * 250) + 50 + scrollElement, i);
    }

    y = finalUpgradeY;
    x = 100;
    fill('red');
    textAlign(CENTER);
    textSize(40);
    text('Balls', 290, y - 50 + scrollElement);

    //balls
    for (let i = 0; i < balls.length; i++) {
        if (i % 3 === 0 && i !== 0) {
            y += 200;
            x -= 570;
        } 
        balls[i].draw(190 * i + x, y + 50 + scrollElement, 60);
        textSize(30);
        fill('black');
        noStroke();
        text(balls[i].name, 190 * i + x, y + scrollElement);
        balls[i].bought = getItem(`${balls[i].name} status`);
        if (!balls[i].bought) {
            fill('yellow');
            text(balls[i].cost, 190 * i + x, y + 120 + scrollElement);
        } else {
            if (currentBall === i) {
                fill('black');
                text('Current Ball', 190 * i + x, y + 120 + scrollElement);
            } else {
                fill('black');
                text('Owned', 190 * i + x, y + 120 + scrollElement);
            }
                
        } 
    }   

    //nonacoins
    textSize(30);
    fill('black');
    stroke('white');
    rect(327, 2, 250, 40);
    noStroke();
    fill('yellow');
    textAlign(LEFT);
    text('Nonacoins:', 330, 32);
    textAlign(RIGHT);
    text(nonacoins, 570, 32);

    if (upgrades.length % 3 === 0) {
        finalUpgradeY = ((upgrades.length/3) * 250) + 250;
    } else if ((upgrades.length + 1) % 3 === 0) {
        finalUpgradeY = (((upgrades.length + 1)/3) * 250) + 250;
    } else if ((upgrades.length + 2) % 3 === 0) {
        finalUpgradeY = (((upgrades.length + 2)/3) * 250) + 250;
    }

    //autoset the bottom of the page
    if (balls.length % 3 === 0) {
        maxScroll = ((balls.length/3) * 200) - 650 + finalUpgradeY;
    } else if ((balls.length + 1) % 3 === 0) {
        maxScroll = (((balls.length + 1)/3) * 200) - 650 + finalUpgradeY;
    } else if ((balls.length + 2) % 3 === 0) {
        maxScroll = (((balls.length + 2)/3) * 200) - 650 + finalUpgradeY;
    }

    //set max and min scroll amounts
    if (scrollElement > 0) {
        scrollElement = 0;
    } else if (scrollElement < -maxScroll) {
        scrollElement = -maxScroll;
    }
}

//load images for upgrades
function preload() {
    //load upgrade images
    for (let i = 0; i < upgrades.length; i++) {
        upgrades[i].img = loadImage(window.location.pathname + upgrades[i].imgPath);
    }

    //load custom ball images
    for (let i = 0; i < balls.length; i++) {
        if (!balls[i].colour) {
            balls[i].img = loadImage(window.location.pathname + balls[i].imgPath);
        }
    }

    //get bought items
    boughtBalls = [0];
    storeItem('bought balls', boughtBalls);
}

function setup() {
    createCanvas(600, 600);
    background(51);
    //get high score and nonagons amounts saved on computer
    highScore = getItem('highScore') ?? 0;
    nonacoins = getItem('nonacoins') ?? 0;

    //get bought items
    boughtUpgrades = getItem('bought upgrades') ?? [];
    boughtballs = getItem('bought balls') ?? [];

    //get current ball
    currentBall = getItem('current ball');

    //setup white ball as bought no matter what
    whiteBall.setup();
}

//number of sides on the shape
let sides = 9;
let angle = 360 / sides; //interal angles in degrees 
let radAngle = angle * Math.PI / 180; //set to radians
let angleVar = 0; //allows for movement 0 is starting position

//background nonagon variables
let nstartY = [200, 400, 0, 500, 300, 100, 450, 50, 200, 600];
let nradius = [30, 50, 20, 40, 35, 50, 20, 35, 40, 50];
let shade = [100, 130, 150, 50, 100, 130, 70, 100, 130, 50];

function draw() {
    //make leaderboard a shop pop out 
    if (leaderboardShowing) {
        leaderboard();  
    } else if (shopShowing) {
        shop();
    }  else { // make the game stop drawing when a tab is showing
        background(51);
        textFont('Courier New');
        //make cool background falling nonagons
        for (let i = 0; i < 10; i++) {
            if (i < 5) {
                nstartX = 100 * (i + 1);
            } else {
                nstartX = 100 * (i - 4);
            }
            
            fallingNonagon(nstartX, nstartY[i], nradius[i], shade[i]);

            nstartY[i]++;
            nstartY[i + 5]++;

            if (nstartY[i] > 650) {
                nstartY[i] = -50;
            } 
        } 

        //draw target circle
        targetCircle(onColour);

        //draw upgrade image when the effect is inacted
        if (upgradeImg) {
            upgrades[effectNum].img.resize(50, 50);
            imageMode(CENTER);
            image(upgrades[effectNum].img, startX, startY);
        }

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
            if (lowG) {
                angleVar += 0.0015;
            } else {
                angleVar += spinSpeed;
                lost = false;
            }
            
        }

        //update player.update function
        player.update();

        if (lost) {
            fill(255, 0, 0);
            noStroke();
            textSize(60);
            textFont('original')
            textAlign(CENTER);
            text('GAME OVER', startX, startY + 20);
        }

        //draw side bars
        fill('grey');
        stroke('black');
        strokeWeight(3);
        rect(580, -3, 30, 606);
        line(585, 300, 595, 290);
        line(585, 300, 595, 310);
        rect(-10, -3, 30, 606);
        line(15, 300, 5, 290);
        line(15, 300, 5, 310);
    }
}

//dev tools
function reset(number) {
    boughtUpgrades = [];
    storeItem('bought upgrades', boughtUpgrades);
    for (let i = 0; i < upgrades.length; i++) {
        upgrades[i].bought = false;
        storeItem(`${upgrades[i].name} status`, false);
    }

    for (let i = 0; i < balls.length; i++) {
    storeItem(`${balls[i].name} status`, false);
    }

    nonacoins += number;
    storeItem('nonacoins', nonacoins);
}

function giveNonagons(number) {
    nonacoins += number;
    storeItem('nonacoins', nonacoins);
}