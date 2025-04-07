import Symbol from './Symbol.js'
import { GAME_EVENT, SPINCFG } from '../GameConfig.js'

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
        super(scene);

        this.scene = scene;
        this.id = id;
        this.classType = Symbol;
        this.registerEventListeners();
        this.tweenStartSwing;
        this.state = REEL_STATE.IDLE;

        scene.add.existing(this);
    }

    registerEventListeners() {
        this.scene.events.on(GAME_EVENT.SPIN_START_SWING, this.startSwing, this);
        this.scene.events.on(GAME_EVENT.SPIN_ACCELERATE, this.spinAccelerate, this);
    }

    async startSwing() {
        this.state = REEL_STATE.SPIN_START_SWING;
        // console.log('Reel ' + this.id + ' starts Swing');
        await new Promise((resolve) => {
            this.tweenStartSwing = this.scene.tweens.add({
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

    async spinAccelerate(id) {
        if (this.id != id) return;
        this.state = REEL_STATE.SPIN_ACCELERATE;
        console.log('Reel ' + this.id + ' spin accelerate');
    }
}