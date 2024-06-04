class PlayScene extends Phaser.Scene {
    constructor() {
        super("PlayScene");
        this.speed = 7; // Initialize speed variable
        this.timerCountdown = 60; // Initialize timer countdown to 60 seconds
        this.initialSpeed = 7; // Initial speed
        this.initialTimerCountdown = 61; // Initial timer countdown
        this.spawnDelay = 2000; // Initial spawn delay for traffic
    }

    preload() {
        // Load background image and car sprite
        this.load.image("road", "./assets/playbackground.png");
        this.load.image("car", "./assets/Racecar.png");
        this.load.image("traffic1", "./assets/traffic1.png");
        this.load.image("traffic2", "./assets/TrafficCar1.png");
        this.load.image("traffic3", "./assets/traffic3.png");
        this.load.audio('backgroundmusic', "./assets/8bit_racing_music.mp3");
        this.load.audio('car_driving', "./assets/car_driving.mp3");
        this.load.audio('car_crash', "./assets/car_crash.mp3");
    }

    create() {
        // Background music
        this.backgroundMusic = this.sound.add('backgroundmusic', { volume: 0.5, loop: true });
        this.backgroundMusic.play();

        // Car driving sound
        this.carDrivingSound = this.sound.add('car_driving', { volume: 0.2, loop: true });
        this.carDrivingSound.play();

        // Display background image
        this.backgroundImage = this.add.tileSprite(0, 0, 700, 700, "road").setOrigin(0, 0);

        // Create car sprite with Matter.js physics
        this.car = this.matter.add.sprite(300, 450, "car").setScale(0.3);
        // Set a smaller rectangle for the car hitbox
        this.car.setRectangle(this.car.width * 0.15, this.car.height * 0.2);
        this.car.setStatic(true); // Set the car to be static

        // Create cursor keys for movement
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Variables to track tilt angle
        this.tiltSpeed = 0.51; // Speed of tilting

        // Group for traffic
        this.trafficGroup = this.add.group();

        // Initial traffic spawn event
        this.spawnTrafficEvent = this.time.addEvent({
            delay: this.spawnDelay,
            callback: this.spawnTraffic,
            callbackScope: this,
            loop: true
        });

        // Collision between car and traffic
        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            if (bodyA.gameObject === this.car || bodyB.gameObject === this.car) {
                this.handleCollision();
            }
        });

        // Create GUI box
        this.guiBox = this.add.graphics();
        this.guiBox.fillStyle(0x000000, 0.5);
        this.guiBox.fillRect(462.5, 600, 200, 80);

        // Create timer text
        this.timerText = this.add.text(650, 650, 'Arrival in: ' + this.timerCountdown, { font: '32px Arial', fill: '#ffffff' }).setOrigin(1, 1);

        // Update the timer every second
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Create restart key
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // Initialize gameOver flag
        this.gameOver = false;

        // Create world boundaries
        this.createBoundaries();
    }

    update() {
        if (this.speed > 15) {
            this.speed = 15;
        }

        if (this.speed < 1) {
            this.speed = 1;
        }

        // Move and wrap background image
        this.backgroundImage.tilePositionY -= this.speed;
        this.wrapBackground();

        // Car movement and gradual tilting
        if (this.wKey.isDown) {
            // Increase speed
            this.speed += 0.1;
        } else if (this.wKey.isUp) {
            this.speed = this.initialSpeed;
        } else if (this.sKey.isDown) {
            // Decrease speed
            this.speed -= 0.1;
        }

        this.setTrafficVelocity(this.speed); // Set traffic speed to match the road

        if (this.aKey.isDown && this.car.x > 200) {
            this.car.setVelocityX(-20);
            this.car.setX(this.car.x - 2);
            if (this.car.angle > -7) {
                this.car.setAngle(this.car.angle - this.tiltSpeed);
            }
        } else if (this.dKey.isDown && this.car.x < 500) {
            this.car.setVelocityX(20);
            this.car.setX(this.car.x + 2);
            if (this.car.angle < 7) {
                this.car.setAngle(this.car.angle + this.tiltSpeed);
            }
        } else {
            this.car.setVelocityX(0);
            // Gradually return to 0 degrees when no key is pressed
            if (this.car.angle > 0) {
                this.car.setAngle(this.car.angle - this.tiltSpeed);
            } else if (this.car.angle < 0) {
                this.car.setAngle(this.car.angle + this.tiltSpeed);
            }
        }

        // Restart the game if R key is pressed
        if (this.restartKey.isDown && this.gameOver) {
            this.restartGame();
        }

        // Decrease spawn delay over time until it reaches 1000 ms
        if (this.spawnDelay > 1000) {
            this.spawnDelay -= 10; // Adjust the rate of decrease as needed
            this.spawnTrafficEvent.reset({
                delay: this.spawnDelay,
                callback: this.spawnTraffic,
                callbackScope: this,
                loop: true
            });
        }
    }

    setTrafficVelocity(speed) {
        this.trafficGroup.getChildren().forEach((traffic) => {
            traffic.setVelocityY(speed * 0.5); // Slow down the traffic speed
        });
    }

    wrapBackground() {
        const bgHeight = this.backgroundImage.height;

        if (this.backgroundImage.y <= -bgHeight) {
            this.backgroundImage.y = this.sys.game.config.height;
        }

        if (this.backgroundImage.y >= this.sys.game.config.height) {
            this.backgroundImage.y = -bgHeight;
        }
    }

    spawnTraffic() {
        const trafficSprites = ["traffic1", "traffic2", "traffic3"];
        const spawnPositions = [200, 300, 400, 500];
        const randomSprite = Phaser.Utils.Array.GetRandom(trafficSprites);
        const randomX = Phaser.Utils.Array.GetRandom(spawnPositions);
        const traffic = this.matter.add.sprite(randomX, -150, randomSprite).setScale(0.3);
        // Set a smaller rectangle for the traffic hitbox
        traffic.setRectangle(traffic.width * 0.3, traffic.height * 0.3);
        traffic.setVelocityY(this.speed); // Initial velocity to match the road speed
        this.trafficGroup.add(traffic);
    }

    handleCollision() {
        this.car.setTint(0xff0000);
        this.matter.world.pause();
        this.carDrivingSound.stop();
        this.backgroundMusic.stop();
        this.sound.play('car_crash');
        this.gameOver = true;

        // Stop the timer
        this.timerEvent.paused = true;

        // Create restart prompt text
        this.restartText = this.add.text(350, 350, 'Press R to Restart', { font: '32px Arial', fill: '#ffffff' }).setOrigin(0.5);
    }

    updateTimer() {
        if (this.timerCountdown > 0) {
            if (this.wKey.isDown) {
                this.timerCountdown -= 2;
            } else {
                this.timerCountdown -= 1;
            }
            this.timerText.setText('Arrival in: ' + this.timerCountdown);
        } else {
            // Timer reached 0, switch to GameOverScene
            this.scene.start('GameOverScene');
        }
    }

    restartGame() {
        this.gameOver = false;
        this.timerCountdown = this.initialTimerCountdown;
        this.speed = this.initialSpeed;

        // Remove restart text
        if (this.restartText) {
            this.restartText.destroy();
        }

        // Restart background music
        this.backgroundMusic.play();

        // Restart car driving sound
        this.carDrivingSound.play();

        // Reset car tint
        this.car.clearTint();

        // Restart physics
        this.matter.world.resume();

        // Restart the timer event
        this.timerEvent.reset({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.timerEvent.paused = false; // Resume the timer

        // Clear traffic group
        this.trafficGroup.clear(true, true);
    }

    createBoundaries() {
        const { width, height } = this.sys.game.config;
        
        // Create left boundary
        this.leftBoundary = this.matter.add.rectangle(0, height / 2, 10, height, { isStatic: true });

        // Create right boundary
        this.rightBoundary = this.matter.add.rectangle(width, height / 2, 10, height, { isStatic: true });
    }
}
