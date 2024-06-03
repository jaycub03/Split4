class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    preload() {
        // Load image/audio/atlas assets
        this.load.atlas("menuanims", "./assets/texture.png", "./assets/texture.json");
        this.load.audio("menuaudio", "./assets/menu_sound.wav");
    }

    create() {
        // Set the size of the sprite to match the screen dimensions
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // Add menu anim sprite and scale it to fit the screen
        this.menuAnimation = this.add.sprite(screenWidth / 2, screenHeight / 2, "menuanims").setOrigin(0.5);

        // Scale the sprite to fit the screen
        this.menuAnimation.setScale(screenWidth / this.menuAnimation.width, screenHeight / this.menuAnimation.height);

        // Set up menu anims
        this.anims.create({
            key: "menu_anims",
            frames: this.anims.generateFrameNames("menuanims", {
                prefix: "frame",
                start: 1,
                end: 15,
                suffix: ".png",
                zeroPad: 2 
            }),
            frameRate: 1
        });

        // Add pointer (click) event to start the animations and sound
        this.input.on('pointerdown', this.startGame, this);

        // Initialize menu sound
        this.menuSound = this.sound.add("menuaudio");
        this.menuSound.setVolume(0.3);



        //create play scene transition
        this.transitionToPlay = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);


    }

    update()
    {
        if (this.transitionToPlay.isDown)
        {
            this.menuSound.stop();
            this.scene.start("PlayScene");
        }
    }

    startGame() { 
        //play menu animation/sound
        this.menuAnimation.play("menu_anims");
        this.menuSound.play();
    }
}
