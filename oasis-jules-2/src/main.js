const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 960;

const config = {
    type: Phaser.AUTO,
    width: LOGICAL_WIDTH,
    height: LOGICAL_HEIGHT,
    zoom: 0.8,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container'
    },
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
        }
    },
    scene: [
        BootScene,
        MainMenuScene,
        LevelSelectScene,
        LevelScene,
        HUDScene
    ]
};

const game = new Phaser.Game(config);
