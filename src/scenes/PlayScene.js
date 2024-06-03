class PlayScene extends Phaser.Scene {
    constructor() {
        super("PlayScene");
        this.speed = 7; // Initialize speed variable
        this.timerCountdown = 60; // Initialize timer countdown to 60 seconds
    }

    preload() {
        // Load background image and car sprite
        this.load.image("road", "./assets/playbackground.png");
        this.load.image("car", "./assets/car.png");
        this.load.image("traffic1", "./assets/traffic1.png");
        this.load.image("traffic2", "./assets/TrafficCar1.png");
        this.load.image("traffic3", "./assets/traffic3.png");
    }

    create() {
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
        this.time.addEvent({
            delay: 2000,
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
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
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
            this.speed = 7;
        } else if (this.sKey.isDown) {
            // Decrease speed
            this.speed -= 0.1;
        }

        this.setTrafficVelocity(this.speed); // Set traffic speed to match the road

        if (this.aKey.isDown) {
            this.car.setVelocityX(-20);
            this.car.setX(this.car.x - 2);
            if (this.car.angle > -7) {
                this.car.setAngle(this.car.angle - this.tiltSpeed);
            }
        } else if (this.dKey.isDown) {
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
    }

    updateTimer() {
        if (this.timerCountdown > 0) {
            this.timerCountdown -= 1;
            this.timerText.setText('Arrival in: ' + this.timerCountdown);
        } else {
            // Timer reached 0, switch to GameOverScene
            this.scene.start('GameOverScene');
        }
    }
    
}