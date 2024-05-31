var config = 
{
    type: Phaser.AUTO,
    width: 700,
    height: 700,
    backgroundColor: 0x000000,
    physics: 
    {
        default: 'arcade',
        arcade: 
        {
            gravity: { y: 5000 },
            debug: true
        }
    },

    scene: [MenuScene, PlayScene, GameOverScene]
};

const game = new Phaser.Game(config);