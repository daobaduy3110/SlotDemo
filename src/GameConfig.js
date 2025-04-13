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
    SPIN_TO_RESULT: 'spinToResult',
    SPIN_END_SWING: 'spinEndSwing',
    SPIN_END: 'spinEnd',
    SHOW_WIN: 'showWin',
    // SHOW_INFOBAR_WIN: 'showInfobarWin',
    SHOW_WIN_END: 'showWinEnd',
    SPIN_SKIP_TO_RESULT: 'spinSkipToResult',

    PRESS_TURBO: 'pressTurbo',
    PRESS_AUTO: 'pressAuto',
}

export const SPINCFG = {
    SWING_DURATION: 150,
    SWING_DISTANCE: 30,
    SPIN_START_DELAY: 150,
    SPIN_ACCELERATE_DURATION: 700,
    SPIN_CONSTANT_SPEED: 2500,
    SPIN_DECELERATE_DURATION: 700,
    SPIN_TO_RESULT_SPEED: 1200,
    END_SWING_DURATION: 150,
    END_SWING_DISTANCE: 30,
}

export const TURBOSPINCFG = {
    SWING_DURATION: 100,
    SWING_DISTANCE: 30,
    SPIN_START_DELAY: 0,
    SPIN_ACCELERATE_DURATION: 100,
    SPIN_CONSTANT_SPEED: 4000,
    SPIN_DECELERATE_DURATION: 100,
    SPIN_TO_RESULT_SPEED: 3000,
    END_SWING_DURATION: 100,
    END_SWING_DISTANCE: 30,
}