var config = 
{
    type: Phaser.AUTO,
    width: 700,
    height: 700,
    physics: {
        default: 'matter',
        arcade: {
            debug: true
        }
    },

    scene: [MenuScene, PlayScene, GameOverScene]
};



const game = new Phaser.Game(config);


