import { GAMECFG, GAME_EVENT } from '../GameConfig.js'
import Symbol from './Symbol.js'
import Reel from '../components/Reel.js'

const BOARD_STATE = {
    IDLE: 'idle',
    SPIN_START: 'spinStart',
    SPIN_WAIT_RESULT: 'spinWaitResult',
    SPIN_TO_RESULT: 'spinToResult',
    SHOW_WIN: 'showWin'
}

export default class Board extends Phaser.GameObjects.Sprite {
    boardData = [];
    get boardData() { return symbols; }
    set boardData(data) { symbols = data; }
    reels = [];

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.scene = scene;

        this.boardData = [];
        this.state = BOARD_STATE.IDLE;
        this.registerEventListeners();
        this.allReelsReachConstantSpeed = false;

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
                this.addSymbolToBoard(posX, posY, textureName, this.reels[col]);
            }
        }
    }

    registerEventListeners() {
        this.scene.events.on(GAME_EVENT.PRESS_SPIN, this.onSpinPressed, this);
        this.scene.events.on(GAME_EVENT.SPIN_CONSTANT_SPEED, this.onReelReachConstantSpeed, this);
        this.scene.events.on(GAME_EVENT.SPIN_WAIT_RESULT, this.onWaitForResult, this);
        this.scene.events.on(GAME_EVENT.SPIN_END, this.onReelSpinEnd, this);
        this.scene.events.on(GAME_EVENT.SHOW_WIN, this.showWin, this);
    }

    async onSpinPressed() {
        if (this.isAbleToSpin()) {
            // this.emit(GAME_EVENT.SPIN_START);   // unused for now
            this.state = BOARD_STATE.SPIN_START;
            this.scene.events.emit(GAME_EVENT.SPIN_START_SWING);
            this.allReelsReachConstantSpeed = false;
        } else {
            console.log('Not able to spin, board is not idle!');
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

    isAbleToSpin() { return this.state == BOARD_STATE.IDLE; }

    async checkUpdateOutOfSightSymbols() {
        let promises = [];
        for (const reel of this.reels) {
            promises.push(reel.checkUpdateOutOfSightSymbols());
        }
        await Promise.all(promises);
    }
    
    addSymbolToBoard(posX, posY, textureName, reel) {
        let symbol = new Symbol(this.scene, posX, posY, textureName);
        this.scene.boardLayer.add(symbol);  // add to boardLayer to apply masking
        if (reel) {
            reel.add(symbol);
        }
    }

    onReelReachConstantSpeed(id) {
        let result = true;
        for (let col = 0; col < GAMECFG.REELNUM; ++col) {
            if (!this.reels[col].reachConstantSpeed()) {
                result = false;
                break;
            }
        }
        if (result) {
            this.state = BOARD_STATE.SPIN_WAIT_RESULT;
            this.scene.events.emit(GAME_EVENT.SPIN_WAIT_RESULT);
        }
    }

    async onWaitForResult() {
        // generate result after a delay
        await new Promise((resolve) => {
            this.scene.tweens.addCounter({
                from: 0,
                to: 2,
                duration: 2,
                onComplete: (tween) => {
                    this.boardData = this.scene.randomizeBoardData();
                    this.scene.events.emit(GAME_EVENT.SPIN_DECELERATE, this.boardData);
                    resolve.call();
                }
            });
        });
    }

    async onReelSpinEnd(id) {
        let result = true;
        for (let col = 0; col < GAMECFG.REELNUM; ++col) {
            if (!this.reels[col].isEndSpin()) {
                result = false;
                break;
            }
        }
        if (result) {
            this.state = BOARD_STATE.SHOW_WIN;
            this.scene.events.emit(GAME_EVENT.SHOW_WIN);
        }
    }

    async showWin() {
        console.log('Show win');
        // test
        this.state = BOARD_STATE.IDLE;
    }
}