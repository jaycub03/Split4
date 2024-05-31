class PlayScene extends Phaser.Scene {
    constructor() {
        super("PlayScene");
    }

    preload() {
        //load background image
        this.load.image("road", "./assets/playbackground.png");
    }

    create() {
        //display background image
        this.backgroundImage = this.add.tileSprite(0, 0, 900, 700, "road").setOrigin(0, 0);
    }

    update() {
        //move and wrap background image
        this.backgroundImage.tilePositionY -= 7;
        this.wrapBackground();
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
}