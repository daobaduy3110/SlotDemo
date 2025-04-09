export const FILES = {
    symbols: {
        key: 'symbol',
        url: 'sprites/symbols/symbol'
    },
    spinButton: {
        key: 'spinButton',
        url: 'sprites/SpinButton.png'
    }
};

export const GAMECFG = {
    REELNUM: 5,
    ROWNUM: 3,
    PADDING: 10,
    SYMBOLWIDTH: 145,
    SYMBOLHEIGHT: 145,
    SYMBOLNUM: 9
}

export const GAME_EVENT = {
    PRESS_SPIN: 'pressSpin',
    SPIN_START: 'spinStart',
    SPIN_START_SWING: 'spinStartSwing',
    SPIN_ACCELERATE: 'spinAccelerate',
    SPIN_CONSTANT_SPEED: 'spinConstantVelocity',
    SPIN_RECEIVED_RESULT: 'spinReceivedResult',
    SPIN_DECELERATE: 'spinDecelerate',
    SPIN_CONSTANT_STOP_SPEED: 'spinConstantStopVelocity',
    SPIN_TO_RESULT: 'spinToResult',
    SPIN_STOP_SWING: 'spinStopSwing'
}

export const SPINCFG = {
    SWING_DURATION: 150,
    SWING_DISTANCE: 30,
    SPIN_START_DELAY: 150,
    SPIN_ACCELERATE_DURATION: 700,
    SPIN_CONSTANT_SPEED: 2500,
    SPIN_DECELERATE_DURATION: 400,
    SPIN_STOP_SPEED: 400,
}