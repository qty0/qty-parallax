let player, sky, piltover, clouds, building, floor, enemy, canyons = [];
let score = 0, isMuted = false, gameStarted = false;
let background_music, gameover_se, kill_se;

function preload() {
    background_music = new Audio("PaintTheTownBlue.mp3");
    gameover_se = new Audio("GameOver.mp3");
    kill_se = new Audio("shot.wav");
}

function setup() {
    createCanvas(1024, 576);
    background_music.volume = 0.2;
    gameover_se.volume = 0.45;
    kill_se.volume = 0.45;
    background_music.loop = true;

    document.getElementById('startButton').addEventListener('click', () => {
        gameStarted = true;
        background_music.play();
        this.style.display = 'none';
    });

    player = new Player();
    sky = new Sky();
    piltover = new Piltover();
    clouds = new Clouds();
    building = new Building();
    floor = new Floor();
    enemy = new Enemy();
    canyons.push(new Canyon(220, height - floor.height, 150));
}

function keyPressed() {
    if (keyCode === 77) isMuted = !isMuted;
    background_music.volume = isMuted ? 0 : 0.2;
}

function draw() {
    if (!gameStarted) return;
    background(148, 64, 77);
    sky.draw();
    piltover.draw();
    clouds.draw();
    clouds.move();
    building.draw();
    floor.draw();
    canyons.forEach(c => c.draw());
    enemy.draw();
    enemy.move();
    enemy.respawn();
    player.draw();
    player.update();
    fill(200, 200, 255);
    textSize(15);
    text("Score: " + score, 10, 30);
}

class Player {
    constructor() {
        this.x = 110;
        this.y = 210;
        this.width = 40;
        this.height = 160;
        this.speedGravity = -7;
        this.grounded = false;
        this.dead = false;
    }

    drawHead() {
        fill(202, 190, 215);
        ellipse(this.x, this.y - 100, this.width, this.width);
    }

    drawBody() {
        fill(202, 190, 215);
        rect(this.x - 20, this.y - 75, this.width, 60);
    }

    drawArms() {
        fill(202, 190, 215);
        rect(this.x + 5, this.y - 15, this.width - 25, 60);
        rect(this.x - 20, this.y - 15, this.width - 25, 60);
    }

    draw() {
        if (this.dead) return;
        this.drawHead();
        this.drawBody();
        this.drawArms();
    }

    update() {
        if (this.dead) return;
        if (this.grounded && keyIsDown(32)) this.jump();
        if (keyIsDown(68)) this.x += 10;
        if (keyIsDown(65)) this.x -= 10;
        this.gravity();
        this.checkEnemy();
        this.checkCanyon();
        this.checkOutside();
    }

    gravity() {
        if (this.speedGravity > -7) this.speedGravity--;
        if (this.y + 30 < height - floor.height) this.y -= this.speedGravity;
        else this.grounded = true;
    }

    jump() {
        this.speedGravity = 19;
        this.y -= this.speedGravity;
        this.grounded = false;
    }

    checkEnemy() {
        if (this.dead || enemy.dead) return;
        if (!this.grounded && this.y + this.height > enemy.y && this.y < enemy.y + enemy.height && Math.abs(this.x - enemy.x) < 50) {
            kill_se.play();
            enemy.dead = true;
            score += 10;
        }
        if (this.x >= enemy.x && this.x <= enemy.x + enemy.width && this.y + this.height > enemy.y) {
            this.dead = true;
            score = 0;
            gameover_se.play();
            background_music.pause();
        }
    }

    checkCanyon() {
        canyons.forEach(c => {
            if (this.y + this.height >= height - floor.height + 100 && this.x >= c.x && this.x + this.width <= c.x + c.width) {
                this.grounded = false;
                this.dead = true;
                gameover_se.play();
                background_music.pause();
            }
        });
    }

    checkOutside() {
        if (this.x < -10) this.x = width - this.width + 50;
        if (this.x > width + 10) this.x = -10;
    }
}

class Sky {
    draw() {
        fill(181, 55, 80);
        rect(0, 0, 1024, 440);
        fill(208, 47, 83);
        rect(0, 0, 1024, 388);
        fill(228, 41, 85);
        rect(0, 0, 1024, 336);
    }
}

class Piltover {
    draw() {
        fill(151, 158, 145);
        rect(50, 270, 100, height);
        fill(144, 153, 137);
        rect(70, 130, 60, height);
        fill(136, 145, 128);
        ellipse(100, 110, 60, 60);
    }
}

class Clouds {
    constructor() {
        this.x = random(0, 512);
        this.y = random(30, 150);
        this.speed = random(2, 4);
    }

    draw() {
        fill(226, 90, 124, 200);
        ellipse(this.x, this.y, 150, 100);
    }

    move() {
        this.x += this.speed;
        if (this.x > 1024) this.x = -150;
    }
}

class Building {
    draw() {
        fill(81, 91, 75);
        rect(600, 0, width, height);
    }
}

class Floor {
    constructor() {
        this.height = 140;
    }

    draw() {
        fill(40, 45, 36);
        rect(0, height - this.height, width, this.height);
    }
}

class Enemy {
    constructor() {
        this.x = 430;
        this.y = 450;
        this.width = 20;
        this.height = 60;
        this.speed = random(2, 5);
        this.dead = false;
    }

    draw() {
        if (this.dead) return;
        fill(75, 92, 96);
        rect(this.x - 33, this.y - 40, 30, 50);
    }

    move() {
        if (this.dead) return;
        this.x += this.speed;
        if (this.x < 400 || this.x > 900) this.speed *= -1;
    }

    respawn() {
        if (this.dead && millis() - this.respawnTimer >= 1000) {
            this.x = random(400, 900);
            this.dead = false;
            this.speed = random(2, 5);
        }
    }
}

class Canyon {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
    }

    draw() {
        fill(148, 64, 77);
        rect(this.x, this.y, this.width, height);
    }
}