import { GAMECFG } from '../GameConfig.js'
import Symbol from './Symbol.js'

export default class Board extends Phaser.GameObjects.Sprite {
    boardData = [];
    get boardData() { return symbols; }
    set boardData(data) { symbols = data; }
    reelGroup = [];

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.scene = scene;

        this.boardData = [];
        this.reelGroup =[];

        scene.add.existing(this);
    }

    init(data) {
        this.reelGroup = [];
        this.boardData = data;
        for (let col = 0; col < GAMECFG.REELNUM; ++col) {
            this.reelGroup[col] = this.scene.add.group();
            for (let row = 0; row < GAMECFG.ROWNUM; ++row) {
                // symbol position
                const posX = this.getPositionX(col);
                const posY = this.getPositionY(row);

                // texture name
                const textureName = 'symbol' + this.boardData[col][row].toString();
                let symbol = new Symbol(this.scene, posX, posY, textureName);
                this.scene.add.existing(symbol);
                this.reelGroup[col].add(symbol);
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