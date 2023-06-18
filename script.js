window.addEventListener('load', function(){
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.font = '40px Bangers';
    ctx.textAlign = 'center';

    class Player {
        constructor (game) {
            this.game = game;
            this.collisionX = this.game.width*0.5;
            this.collisionY = this.game.height*0.5;
            this.collisionRadius = 40;
            this.speedX = 0;
            this.speedY = 0;
            this.dx = 0;
            this.dy = 0;
            this.spriteWidth = 250;
            this.spriteHeight = 260;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY;
            this.speedModifier = 5;
            this.image = document.getElementById("bull");
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            context.beginPath();
            if (this.game.debug) {
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI*2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                context.beginPath();
                context.moveTo(this.collisionX, this.collisionY);
                context.lineTo(this.game.mouse.x, this.game.mouse.y);
                context.stroke();
            }
        }
        restart () {
            this.collisionX = this.game.width*0.5;
            this.collisionY = this.game.height*0.5;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;
        }
        update() {
            // movement of player
            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY;
            const angle = Math.atan2(this.dy, this.dx);
            if (angle < -2.74 || angle > 2.74) this.frameY = 6;
            else if (angle < -1.96) this.frameY = 7;
            else if (angle < -1.17) this.frameY = 0;
            else if (angle < -0.39) this.frameY = 1;
            else if (angle < 0.39) this.frameY = 2;
            else if (angle < 1.17) this.frameY = 3;
            else if (angle < -1.96) this.frameY = 4;
            else if (angle < 2.74) this.frameY = 5;
            const distance = Math.hypot(this.dy, this.dx);
            if (distance > this.speedModifier) {
                this.speedX = this.dx/distance || 0;
                this.speedY = this.dy/distance || 0;
            }
            else {
                this.speedX = 0;
                this.speedY = 0;
            }
            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;
            if (this.collisionX < this.collisionRadius) this.collisionX = this.collisionRadius;
            else if (this.collisionX > this.game.width - this.collisionRadius) this.collisionX = this.game.width - this.collisionRadius;
            if (this.collisionY < this.game.topMargin + this.collisionRadius) this.collisionY = this.game.topMargin + this.collisionRadius;
            else if (this.collisionY > this.game.height - this.collisionRadius) this.collisionY = this.game.height - this.collisionRadius;
            //collision with obstacles
            this.game.obstacles.forEach(obtacle => {
                let [collision, distance, sumOfRadius, dx, dy] = game.checkCollision(this, obtacle);
                const unit_x = dx / distance;
                const unit_y = dy / distance;
                if (collision) {
                    this.collisionX = obtacle.collisionX + (sumOfRadius + 1) * unit_x;
                    this.collisionY = obtacle.collisionY + (sumOfRadius + 1) * unit_y;
                }
            })
        }
    }

    class Obstacle {
        constructor(game) {
            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 40;
            this.spriteWidth = 250;
            this.spriteHeight = 250;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 70;
            this.image = document.getElementById("obstacle");
            this.frameX = Math.floor(Math.random() * 4);
            this.frameY = Math.floor(Math.random() * 3);
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI*2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update () {}
    }

    class Egg {
        constructor (game) {
            this.game = game;
            this.collisionRadius = 40;
            this.margin = this.collisionRadius * 2;
            this.collisionX = this.margin + (Math.random() * (this.game.width - this.margin * 2));
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.margin));
            this.spriteWidth = 110;
            this.spriteHeight = 135;
            this.hatchTimer = 0;
            this.hatchInterval = 3000;
            this.markedForDeletion = false;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 30;
            this.image = document.getElementById("egg");
        }

        draw (context) {
            context.drawImage(this.image, this.spriteX, this.spriteY);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI*2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                const displayTimer = (this.hatchTimer * 0.001).toFixed(0);
                context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius * 2.5);
            }
        }

        update (deltaTime) {
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 30;
            let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.enemies];
            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadius, dx, dy] = game.checkCollision(this, object);
                const unit_x = dx / distance;
                const unit_y = dy / distance;
                if (collision) {
                    this.collisionX = object.collisionX + (sumOfRadius + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadius + 1) * unit_y;
                }
            });
            // hatching
            if (this.hatchTimer > this.hatchInterval || this.collisionY <= this.game.topMargin) {
                this.game.hatchling.push(new Larva(this.game, this.collisionX, this.collisionY));
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            }
            else {
                this.hatchTimer += deltaTime;
            }
        }
    }

    class Enemy {
        constructor (game) {
            this.game = game;
            this.collisionRadius = 30;
            this.spriteWidth = 140;
            this.spriteHeight = 260;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
            this.collisionY = this.game.topMargin +  (Math.random() * (this.game.height - this.game.topMargin));
            this.speedX = Math.random() * 3 + 0.5;
            this.image = document.getElementById("toad");
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 4);
        }

        draw (context) {
            context.drawImage(this.image, 0, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI*2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update () {
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height + 40;
            this.collisionX -= this.speedX;
            if (this.spriteX + this.width < 0 && !this.game.gameOver) {
                this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
                this.collisionY = this.game.topMargin +  (Math.random() * (this.game.height - this.game.topMargin));
            }
            let collisionObjects = [this.game.player, ...this.game.obstacles];
            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadius, dx, dy] = game.checkCollision(this, object);
                const unit_x = dx / distance;
                const unit_y = dy / distance;
                if (collision) {
                    this.collisionX = object.collisionX + (sumOfRadius + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadius + 1) * unit_y;
                }
            });
        }
    }

    class Larva {
        constructor (game, x, y) {
            this.game = game;
            this.collisionRadius = 30;
            this.spriteWidth = 150;
            this.spriteHeight = 150;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.collisionX = x;
            this.collisionY = y;
            this.speedY = Math.random() + 1;
            this.image = document.getElementById("larva");
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 2);
            this.markedForDeletion = false;
        }

        draw (context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI*2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update () {
            this.collisionY -= this.speedY;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 50;
            // safety
            if (this.collisionY < this.game.topMargin) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
                if (!this.game.gameOver) this.game.score++;
                for (let i = 0; i < 3; i++) {
                    this.game.particles.push(new Firefly(this.game, this.collisionX, this.collisionY, 'yellow'));
                }
            }
            // collision
            let collisionObjects = [this.game.player, ...this.game.obstacles];
            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadius, dx, dy] = game.checkCollision(this, object);
                const unit_x = dx / distance;
                const unit_y = dy / distance;
                if (collision) {
                    this.collisionX = object.collisionX + (sumOfRadius + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadius + 1) * unit_y;
                }
            });
            //collision with enemies
            this.game.enemies.forEach(enemy => {
                if (this.game.checkCollision(this, enemy)[0]) {
                    this.markedForDeletion = true;
                    this.game.removeGameObjects();
                    if (!this.game.gameOver) this.game.lostHatchling++;
                    for (let i = 0; i < 3; i++) {
                        this.game.particles.push(new Spark(this.game, this.collisionX, this.collisionY, 'red'));
                    }
                }
            });
        }
    }

    class Particle {
        constructor (game, x, y, color) {
            this.game = game;
            this.collisionRadius = Math.floor(Math.random() * 10 + 5);
            this.collisionX = x;
            this.collisionY = y;
            this.color = color;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * 2 + 0.5;
            this.angle = 0;
            this.va = Math.random() * 0.1;
            this.markedForDeletion = false;
        }

        draw (context) {
            context.save();
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.restore();
        }
    }

    class Firefly extends Particle {
        update () {
            this.angle += this.va;
            this.collisionX += this.speedX;
            this.collisionY -= this.speedY;
            if (this.collisionY < 0 - this.collisionRadius) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            }
        }
    }

    class Spark extends Particle {
        update () {
            this.angle += this.va * 0.5;
            this.collisionX -= Math.sin(this.angle) * this.speedX;
            this.collisionY -= Math.cos(this.angle) * this.speedY;
            if (this.collisionY < 0 - this.collisionRadius) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            }
            if (this.collisionRadius > 0.1) this.collisionRadius -= 0.05;
            else if (this.collisionRadius < 0.2) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            }
        }
    }

    class Game {
        constructor (canvas) {
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.topMargin = 260;
            this.debug = false;
            this.gameOver = false;
            this.gameObjects = [];
            this.fps = 70;
            this.timer = 0;
            this.winningTimer = 0;
            this.interval = 1000/this.fps;
            this.eggTimer = 0;
            this.eggInterval = 1000;
            this.player = new Player(this);
            this.obstacles = [];
            this.hatchling = [];
            this.particles = [];
            this.numberOfObstacles = 5;
            this.eggs = [];
            this.enemies = [];
            this.maxEggs = 10;
            this.score = 0;
            this.lostHatchling = 0;
            this.winningCondition = 30000;
            this.mouse = {
                x: this.width*0.5,
                y: this.height*0.5,
                pressed: false
            }

            canvas.addEventListener('mousedown', (e) => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = true;
            })
            canvas.addEventListener('mouseup', (e) => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = false;
            })
            canvas.addEventListener('mousemove', (e) => {
                if (this.mouse.pressed) {
                    this.mouse.x = e.offsetX;
                    this.mouse.y = e.offsetY;
                }
            })
            window.addEventListener('keydown', (e) => {
                if (e.key == 'd') this.debug = !this.debug;
                if (e.key == 'r' && this.gameOver) this.restart();
            })
        }

        render(context, deltaTime) {
            if (this.timer > this.interval) {
                this.timer = 0;
                context.clearRect(0, 0, this.width, this.height);
                this.gameObjects = [...this.obstacles, ...this.eggs, ...this.enemies, ...this.hatchling, ...this.particles, this.player];
                this.gameObjects.sort((a, b) => {
                    return a.collisionY - b.collisionY;
                });
                this.gameObjects.forEach(object => {
                    object.draw(context);
                    object.update(deltaTime + this.interval);
                });
            }
            this.timer += deltaTime;
            if (!this.gameOver) this.winningTimer += deltaTime;

            if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs && !this.gameOver) {
                this.addEgg();
                this.eggTimer = 0;
            }
            else {
                this.eggTimer += deltaTime;
            }

            context.save();
            context.textAlign = 'left';
            context.fillText('Score: ' + this.score, 25, 50);
            const timeLeft = (Math.abs(30000 - this.winningTimer) * 0.001).toFixed(0);
            context.fillText('Time left: ' + timeLeft, 25, 100);
            if (this.debug) {
                context.fillText('Lost: ' + this.lostHatchling, 25, 150);
            }
            context.restore();
            //win or lose
            if (this.winningTimer >= this.winningCondition) {
                this.gameOver = true;
                context.save();
                context.fillStyle = 'rgba(0,0,0,0.5)';
                context.fillRect(0, 0, this.width, this.height);
                context.fillStyle = 'white';
                context.textAlign = 'center';
                context.shadowOffsetX = 4;
                context.shadowOffsetY = 4;
                context.shadowColor = 'black';
                let message1;
                let message2;
                if (this.lostHatchling <= 5) {
                    message1 = "Bulleye!!!";
                    message2 = "You bullied the bullies!";
                }
                else {
                    message1 = "Bullocks!";
                    message2 = "You lost " + this.lostHatchling + "hatchling. Don't be a pushover!";
                }
                context.font = '130px Bangers';
                context.fillText(message1, this.width * 0.5, this.height * 0.5 - 20);
                context.font = '40px Bangers';
                context.fillText(message2, this.width * 0.5, this.height * 0.5 + 30);
                context.fillText("Final score " + this.score + ". Press R to play again!", this.width * 0.5, this.height * 0.5 + 80);
                context.restore();
            }
        }

        init() {
            for (let i = 0; i < 3; i++) {
                this.addEnemy();
            }
            let attemps = 0;
            while (this.obstacles.length < this.numberOfObstacles && attemps <= 500) {
                let testObtacle = new Obstacle(this);
                let overlap = false;
                this.obstacles.forEach(obtacle => {
                    const dx = testObtacle.collisionX - obtacle.collisionX;
                    const dy = testObtacle.collisionY - obtacle.collisionY;
                    const distance = Math.hypot(dy, dx);
                    const sumOfRadius = testObtacle.collisionRadius + obtacle.collisionRadius;
                    if (distance < sumOfRadius + 100) overlap = true;
                })
                const margin = testObtacle.collisionRadius * 2;
                if (!overlap && testObtacle.spriteX > 0 && testObtacle.spriteX < this.width - testObtacle.width && testObtacle.collisionY > this.topMargin + margin && testObtacle.collisionY < this.height - margin) this.obstacles.push(testObtacle);
                attemps++;
            }
        }

        restart() {
            this.player.restart();
            this.gameOver = false;
            this.obstacles = [];
            this.hatchling = [];
            this.particles = [];
            this.eggs = [];
            this.enemies = [];
            this.init();
            this.mouse = {
                x: this.width*0.5,
                y: this.height*0.5,
                pressed: false
            }
            this.score = 0;
            this.lostHatchling = 0;
            this.winningTimer = 0;
        }

        addEgg () {
            this.eggs.push(new Egg(this));
        }

        addEnemy () {
            this.enemies.push(new Enemy(this));
        }

        removeGameObjects () {
            this.eggs = this.eggs.filter(object => !object.markedForDeletion);
            this.hatchling = this.hatchling.filter(object => !object.markedForDeletion);
            this.particles = this.particles.filter(object => !object.markedForDeletion);
        }

        checkCollision(a, b) {
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dy, dx);
            const sumOfRadius = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadius), distance, sumOfRadius, dx, dy];
        }
    }

    const game = new Game(canvas);
    game.init();

    let lastTime = 0;
    function animate (timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.render(ctx, deltaTime);
        requestAnimationFrame(animate);
    }
    animate(0);
})