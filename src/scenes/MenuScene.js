class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    preload() {
        //load image/audio assets
    }

    create() {
        //add menu background image 
        this.startGame = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)
    }

    update() {
        //check for keyboard input P to start game
        if (this.startGame.isDown)
        {
            this.scene.start("PlayScene")
        }
            
    }

}