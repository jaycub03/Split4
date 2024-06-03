class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    preload() {
        this.load.image("credits", "./assets/creditsbackground.png");
        
    }

    create() {

        // Display background image
        this.backgroundImage = this.add.tileSprite(0, 0, 700, 700, "credits").setOrigin(0, 0);
    }

    update() {
        
    }
}