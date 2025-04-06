import { Boot } from './scenes/Boot.js';
import { GameScene } from './scenes/Game.js';
import { LoadingScene } from './scenes/LoadingScene.js';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#d3d3d3',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        LoadingScene,
        GameScene
    ]
};

new Phaser.Game(config);
