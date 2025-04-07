import { GAMECFG } from '../GameConfig.js'
import Symbol from './Symbol.js'
import Reel from '../components/Reel.js'

export default class Board extends Phaser.GameObjects.Sprite {
    boardData = [];
    get boardData() { return symbols; }
    set boardData(data) { symbols = data; }
    reelGroup = [];
    reels = [];

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.scene = scene;

        this.boardData = [];

        scene.add.existing(this);
    }

    init(data) {
        this.reels = [];
        this.boardData = data;
        for (let col = 0; col < GAMECFG.REELNUM; ++col) {
            this.reels[col] = new Reel(this.scene, col);
            for (let row = 0; row < GAMECFG.ROWNUM; ++row) {
                // symbol position
                const posX = this.getPositionX(col);
                const posY = this.getPositionY(row);

                // texture name
                const textureName = 'symbol' + this.boardData[col][row].toString();
                let symbol = new Symbol(this.scene, posX, posY, textureName);
                this.scene.add.existing(symbol);
                this.reels[col].add(symbol);
            }
        }
    }

    getPositionX(col) {
        const gameWidth = this.scene.game.config.width;
        const boardWidth = GAMECFG.SYMBOLWIDTH * GAMECFG.REELNUM + GAMECFG.PADDING * 2;
        const boardX = gameWidth / 2 - boardWidth / 2;
        return boardX + col * GAMECFG.SYMBOLWIDTH + GAMECFG.SYMBOLWIDTH / 2;
    }

    getPositionY(row) {
        const gameHeight = this.scene.game.config.height;
        const boardHeight = GAMECFG.SYMBOLHEIGHT * GAMECFG.ROWNUM + GAMECFG.PADDING * 2;
        const boardY = gameHeight / 2 - boardHeight / 2;
        return boardY + row * GAMECFG.SYMBOLHEIGHT + GAMECFG.SYMBOLHEIGHT / 2;
    }
}