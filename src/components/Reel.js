import Symbol from './Symbol.js'
import { GAMECFG, GAME_EVENT, SPINCFG } from '../GameConfig.js'

const REEL_STATE = {
    IDLE: 'idle',
    SPIN_START_SWING: 'spinStartSwing',
    SPIN_ACCELERATE: 'spinAccelerate',
    SPIN_CONSTANT_VELOCITY: 'spinConstantVelocity',
    SPIN_RECEIVED_RESULT: 'spinReceivedResult',
    SPIN_DECELERATE: 'spinDecelerate',
    SPIN_CONSTANT_STOP_VELOCITY: 'spinConstantStopVelocity',
    SPIN_TO_RESULT: 'spinToResult',
    SPIN_STOP_SWING: 'spinStopSwing',

    SPIN_START: 'spinStart',
    SPIN_WAIT_RESULT: 'spinWaitResult',
    SPIN_TO_RESULT: 'spinToResult',
    SHOW_WIN: 'showWin'
}

// Reel is logic unit, it is the interface of symbols on the board respective to it
// The actual parent of symbols are the board
export default class Reel extends Phaser.GameObjects.Group {
    constructor(scene, id) {
        super(scene, null, {
            createCallback: (item) => {
                // update the top symbol when new symbol is added
                if (this.children.size <= 1) {
                    this.topSymbol = item;
                } else {
                    if (item.y < this.topSymbol.y) {
                        this.topSymbol = item;
                    }
                }
            }
        });

        this.scene = scene;
        this.id = id;
        this.classType = Symbol;
        this.tweenAction;   // current tween action applying on children of reel
        this.state = REEL_STATE.IDLE;
        this.spinSpeed= 0;  // spin speed
        this.topSymbol = null; // to keep track of the top position        

        const boardHeight = GAMECFG.SYMBOLHEIGHT * GAMECFG.ROWNUM + GAMECFG.PADDING * 2;
        this.topBoardY = this.scene.game.config.height / 2 - boardHeight / 2;
        this.bottomBoardY = this.scene.game.config.height / 2 + boardHeight / 2;

        this.registerEventListeners();
        scene.add.existing(this);
    }

    registerEventListeners() {
        this.scene.events.on(GAME_EVENT.SPIN_START_SWING, this.startSwing, this);
        this.scene.events.on(GAME_EVENT.SPIN_ACCELERATE, this.spinAccelerate, this);
        this.scene.events.on(GAME_EVENT.SPIN_CONSTANT_SPEED, this.spinConstantSpeed, this);
    }

    onAddNewItem() {
        // update the top symbol when new symbol is added
        if (this.children.size == 0 || (this.children.size == 1 && this.children[0] == item)) {
            this.topSymbol = item;
        } else {
            if (item.y < this.topSymbol.y) {
                this.topSymbol = item;
            }
        }
    }

    async startSwing() {
        this.state = REEL_STATE.SPIN_START_SWING;
        // console.log('Reel ' + this.id + ' starts Swing');
        await new Promise((resolve) => {
            this.tweenAction = this.scene.tweens.add({
                targets: this.getChildren(),
                y: '-=' + SPINCFG.SWING_DISTANCE,
                duration: SPINCFG.SWING_DURATION,
                delay: SPINCFG.SPIN_START_DELAY * this.id,
                onComplete: (tween) => {
                    resolve.call();
                }
            });
        });
        this.scene.events.emit(GAME_EVENT.SPIN_ACCELERATE, this.id);
        return;
    }

    async checkUpdateOutOfSightSymbols() {
        // move out of sight symbols at the bottom to the top
        for (const symbol of this.getChildren()) {
            if (symbol.y > this.bottomBoardY + GAMECFG.SYMBOLHEIGHT / 2) {
                symbol.y = this.topSymbol.y + GAMECFG.SYMBOLHEIGHT;
                this.topSymbol = symbol;
            }
        }

        // estimate the reel move distance
        const dt = this.scene.sys.game.loop.delta;
        const moveDist = dt * this.spinSpeed;
        const topSymbolFuturePosY = this.topSymbol.y + moveDist;
        if (topSymbolFuturePosY >= this.topBoardY + GAMECFG.SYMBOLHEIGHT / 2) {
            // need to add fake symbols at top
            const toFillDist = topSymbolFuturePosY - this.topBoardY - GAMECFG.SYMBOLHEIGHT / 2;
            const toFillSymbolNum = Math.ceil(toFillDist / GAMECFG.SYMBOLHEIGHT);
            for (let i = 0; i < toFillSymbolNum; ++i) {
                this.addRandomSymbolAtTop();
            }
        }
    }

    addRandomSymbolAtTop() {
        const randomArr = Array.from({ length: GAMECFG.SYMBOLNUM }, (_, i) => i);
        const randomSymbolID = Phaser.Utils.Array.GetRandom(randomArr);
        const textureName = 'symbol' + randomSymbolID.toString();
        const posY = this.topSymbol.y - GAMECFG.SYMBOLHEIGHT;
        this.scene.board.addSymbolToBoard(this.topSymbol.x, posY, textureName, this);
    }

    async spinAccelerate(id) {
        if (this.id != id) return;
        this.state = REEL_STATE.SPIN_ACCELERATE;
        // console.log('Reel ' + this.id + ' spin accelerate');

        if (this.tweenAction)
            this.tweenAction.destroy();
        // tween the velocity from 0 to constant speed
        await new Promise((resolve) => {
            this.tweenAction = this.scene.tweens.addCounter({
                from: 0,
                to: SPINCFG.SPIN_CONSTANT_SPEED,
                duration: SPINCFG.SPIN_ACCELERATE_DURATION,
                onComplete: (tween) => {
                    this.scene.events.emit(GAME_EVENT.SPIN_CONSTANT_SPEED, this.id);
                    resolve.call();
                }
            });
            this.tweenAction.on('update', async (tween, target, key, current, previous, param) => {
                this.spinSpeed = this.tweenAction.getValue();
                await this.checkUpdateOutOfSightSymbols();
                this.updateSymbolPos();
            }, this);
        });
    }

    updateSymbolPos() {
        const dt = this.scene.sys.game.loop.delta;
        for (const symbol of this.getChildren()) {
            symbol.y += this.spinSpeed * dt;
        }
    }

    async spinConstantSpeed(id) {
        if (this.id != id) return;
        console.log('Reel ' + this.id + ' spin at constant speed');
    }
}