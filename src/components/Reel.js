import Symbol from './Symbol.js'
import { GAMECFG, GAME_EVENT, SPINCFG, TURBOSPINCFG } from '../GameConfig.js'

const REEL_STATE = {
    IDLE: 'idle',
    SPIN_START_SWING: 'spinStartSwing',
    SPIN_ACCELERATE: 'spinAccelerate',
    SPIN_CONSTANT_SPEED: 'spinConstantVelocity',
    SPIN_RECEIVED_RESULT: 'spinReceivedResult',
    SPIN_DECELERATE: 'spinDecelerate',
    SPIN_TO_RESULT: 'spinToResult',
    SPIN_END_SWING: 'spinEndSwing',
    SPIN_END: 'spinEnd',
    SHOW_WIN: 'showWin'
}

// Reel is logic unit, it is the interface of symbols on the board respective to it
// The actual parent of symbols are the board
export default class Reel extends Phaser.GameObjects.Group {
    constructor(scene, id) {
        super(scene, null, {
            createCallback: (item) => {
                // update the top symbol when new symbol is added
                if (!this.topSymbol) {
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
        this.spinSpeed = 0;  // spin speed
        this.topSymbol = null; // to keep track of the top position
        this.symbolList = [];
        this.spinResult = [];
        this.isTurbo = false;
        this.spinCfg = this.isTurbo ? TURBOSPINCFG : SPINCFG;

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
        this.scene.events.on(GAME_EVENT.SPIN_DECELERATE, this.spinDecelerate, this);
        this.scene.events.on(GAME_EVENT.SPIN_TO_RESULT, this.spinToResult, this);
        this.scene.events.on(GAME_EVENT.SPIN_END_SWING, this.swingAtSpinEnd, this);   
        this.scene.events.on(GAME_EVENT.SHOW_WIN, this.showWin, this);   
    }

    async startSwing() {
        // swing up a small distance before spinning down
        this.state = REEL_STATE.SPIN_START_SWING;
        this.spinResult = [];
        // console.log('Reel ' + this.id + ' starts Swing');
        await new Promise((resolve) => {
            this.tweenAction = this.scene.tweens.add({
                targets: this.getChildren(),
                y: '-=' + this.spinCfg.SWING_DISTANCE,
                duration: this.spinCfg.SWING_DURATION,
                delay: this.spinCfg.SPIN_START_DELAY * this.id,
                onComplete: (tween) => {
                    resolve.call();
                }
            });
        });
        this.scene.events.emit(GAME_EVENT.SPIN_ACCELERATE, this.id);
    }

    async checkUpdateOutOfSightSymbols() {
        // move out of sight symbols at the bottom to the top
        for (const symbol of this.getChildren()) {
            if (symbol.y > this.bottomBoardY + GAMECFG.SYMBOLHEIGHT / 2) {
                symbol.y = this.topSymbol.y - GAMECFG.SYMBOLHEIGHT;
                this.topSymbol = symbol;
            }
        }

        // estimate the reel move distance
        const dt = this.scene.sys.game.loop.delta / 1000;
        const moveDist = dt * this.spinSpeed;
        const topSymbolFuturePosY = this.topSymbol.y + moveDist;
        if (topSymbolFuturePosY >= this.topBoardY + GAMECFG.SYMBOLHEIGHT / 2) {
            // need to add fake symbols at top
            const toFillDist = topSymbolFuturePosY - this.topBoardY - GAMECFG.SYMBOLHEIGHT / 2;
            const toFillSymbolNum = Math.ceil(toFillDist / GAMECFG.SYMBOLHEIGHT);
            // console.log('Reel #' + this.id + ' adding ' + toFillSymbolNum + ' fake symbols');
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

        if (this.tweenAction.isPlaying()) {
            this.tweenAction.complete();
            this.tweenAction.destroy();
        }
        // tween the velocity from 0 to constant speed
        await new Promise((resolve) => {
            this.tweenAction = this.scene.tweens.addCounter({
                from: 0,
                to: this.spinCfg.SPIN_CONSTANT_SPEED,
                duration: this.spinCfg.SPIN_ACCELERATE_DURATION,
                onComplete: (tween) => {
                    resolve.call();
                },
                onUpdate: async (tween, target, key, current, previous, param) => {
                    this.spinSpeed = this.tweenAction.getValue();
                    await this.checkUpdateOutOfSightSymbols();
                    this.updateSymbolPos();
                }
            });
        });
        this.state = REEL_STATE.SPIN_CONSTANT_SPEED;
        this.scene.events.emit(GAME_EVENT.SPIN_CONSTANT_SPEED, this.id);
    }

    updateSymbolPos() {
        const dt = this.scene.sys.game.loop.delta / 1000;
        const moveDist = dt * this.spinSpeed;
        for (const symbol of this.getChildren()) {
            symbol.y += moveDist;
        }
    }

    async spinConstantSpeed(id) {
        if (this.id != id) return;
        this.state = REEL_STATE.SPIN_CONSTANT_SPEED;
        // console.log('Reel ' + this.id + ' spin at constant speed. Child num = ' + this.children.size);
        if (this.tweenAction.isPlaying()) {
            this.tweenAction.complete();
        }
        await new Promise((resolve) => {
            this.tweenAction = this.scene.tweens.addCounter({
                from: 0,
                to: 5,
                duration: 5,
                repeat: -1,
                onUpdate: async (tween, target, key, current, previous, param) => {
                    await this.checkUpdateOutOfSightSymbols();
                    this.updateSymbolPos();
                },
                onStop: (tween, targets) => { 
                    resolve.call();
                }
            });
        });
    }

    async spinDecelerate(boardData) {
        // delay first
        const delayDuration = this.spinCfg.SPIN_START_DELAY * this.id;
        await new Promise((resolve) => {
            const delayCounter = this.scene.tweens.addCounter({
                from: 0,
                to: delayDuration,
                duration: delayDuration,
                onComplete: (tween) => {
                    resolve.call();
                    delayCounter.stop();
                }
            });
        });

        if (this.tweenAction.isPlaying()) {
            this.tweenAction.stop();
        }
        this.spinResult = boardData[this.id];
        this.state = REEL_STATE.SPIN_DECELERATE;
        await new Promise((resolve) => {
            this.tweenAction = this.scene.tweens.addCounter({
                from: this.spinCfg.SPIN_CONSTANT_SPEED,
                to: this.spinCfg.SPIN_TO_RESULT_SPEED,
                duration: this.spinCfg.SPIN_DECELERATE_DURATION,
                onComplete: (tween) => {
                    resolve.call();
                },
                onUpdate: async (tween, target, key, current, previous, param) => {
                    this.spinSpeed = this.tweenAction.getValue();
                    await this.checkUpdateOutOfSightSymbols();
                    this.updateSymbolPos();
                }
            });
        });
        this.spinSpeed = this.spinCfg.SPIN_TO_RESULT_SPEED;
        this.scene.events.emit(GAME_EVENT.SPIN_TO_RESULT, this.id);
    }

    async spinToResult(id) {
        if (this.id != id) return;
        this.state = REEL_STATE.SPIN_TO_RESULT;
        if (this.tweenAction.isPlaying()) {
            this.tweenAction.complete();
        }
        // console.log('Reel ' + this.id + ' spin to result');
        // remove out of sight symbols
        let it;
        const childrenSize = this.getChildren().length;
        for (let i = childrenSize - 1; i >= 0; --i) {   // removing elements while iterate the array needs to iterate from end to begin
            it = this.getChildren()[i];
            if (it.y > this.bottomBoardY + GAMECFG.SYMBOLHEIGHT / 2 || it.y < this.topBoardY - GAMECFG.SYMBOLHEIGHT / 2) {
                this.remove(this.getChildren()[i], true);                
            }
        }        
        // update top symbol
        this.topSymbol = this.getChildren()[0];
        for (const symbol of this.getChildren()) {
            if (symbol.y < this.topSymbol.y) {
                this.topSymbol = symbol;
            }
        }

        // add result symbol at tops, bottom first
        let symbolID;
        for (let i = this.spinResult.length - 1; i >= 0; --i) {
            symbolID = this.spinResult[i];
            const textureName = 'symbol' + symbolID.toString();
            const posY = this.topSymbol.y - GAMECFG.SYMBOLHEIGHT;
            this.scene.board.addSymbolToBoard(this.topSymbol.x, posY, textureName, this);
        }

        // spin to result
        const distanceToResult = this.topBoardY + GAMECFG.SYMBOLHEIGHT / 2 - this.topSymbol.y/*  + this.spinCfg.END_SWING_DISTANCE */;
        const tweenDuration = distanceToResult / this.spinSpeed * 1000; // tween duration use ms unit
        await new Promise((resolve) => {
            this.tweenAction = this.scene.tweens.addCounter({
                from: 0,
                to: tweenDuration,
                duration: tweenDuration,
                onComplete: (tween) => {
                    resolve.call();
                },
                onUpdate: async (tween, target, key, current, previous, param) => {
                    this.updateSymbolPos();
                }
            });
            // this.tweenAction.on('update', async (tween, target, key, current, previous, param) => {
            //     this.updateSymbolPos();
            // }, this);
        });

        // remove all symbols, except the result symbols, which were added last
        const newChildrenSize = this.getChildren().length;
        if (newChildrenSize > this.spinResult.length) {
            for (let i = newChildrenSize - this.spinResult.length - 1; i >= 0; --i) {   // removing elements while iterate the array needs to iterate from end to begin
                this.remove(this.getChildren()[i], true);
            }   
        }

        this.scene.events.emit(GAME_EVENT.SPIN_END_SWING, this.id);
    }

    async swingAtSpinEnd(id) {
        if (this.id != id) return;
        this.state = REEL_STATE.SPIN_END_SWING;
        // swing down a small distance before swing back and stop
        if (this.tweenAction.isPlaying()) {
            this.tweenAction.complete();
        }

        // safely reset symbol position
        for (let i = 0; i < this.getChildren().length; ++i) {
            let child = this.getChildren()[i];
            // symbols were added from bottom to top
            child.y = this.scene.board.getPositionY(GAMECFG.ROWNUM - 1 - i);
        }

        await new Promise((resolve) => {
            this.tweenAction = this.scene.tweens.add({
                targets: this.getChildren(),
                y: '+=' + this.spinCfg.END_SWING_DISTANCE,
                duration: this.spinCfg.END_SWING_DURATION,
                yoyo: true,
                // ease: 'Bounce',
                onComplete: (tween) => {
                    resolve.call();
                }
            });
        });
        this.state = REEL_STATE.SPIN_END;
        this.scene.events.emit(GAME_EVENT.SPIN_END, this.id);
        // console.log('Reel ' + this.id + ' end spin ' + this.spinResult.toString());
        if (this.tweenAction.isPlaying()) {
            this.tweenAction.complete();
        }
    }

    async showWin() {
        // test
        this.state = REEL_STATE.IDLE;
    }

    reachConstantSpeed() {
        return this.state == REEL_STATE.SPIN_CONSTANT_SPEED;
    }

    isEndSpin() {
        return this.state == REEL_STATE.SPIN_END;
    }

    setTurbo(v) {
        this.isTurbo = v;
        this.spinCfg = v ? TURBOSPINCFG : SPINCFG;
    }
}