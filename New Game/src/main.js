// This is the "Logical" or "Native" resolution of your game.
// --- THE ONLY CHANGE IS HERE ---
// We are increasing the width again, from 640 to 800, to give all UI
// and menu screens even more horizontal space to work with.
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
    // The list of all scenes in our game.
    scene: [
        BootScene,
        MainMenuScene,
        LevelSelectScene,
        LevelScene,
        HUDScene
    ]
};

const game = new Phaser.Game(config);