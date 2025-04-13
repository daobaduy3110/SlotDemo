import Board from '../components/Board.js'
import BoardPos from '../utils/BoardPos.js'
import { GAMECFG, GAME_EVENT } from '../GameConfig.js'
import WinLine from '../components/WinLine.js'

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        this.board;
        this.spinButton;
        this.infoBarText;
        this.infoBarTween;
        this.isAutoSpin = false;
    }

    create() {
        this.registerEventListeners();

        const gameWidth = this.game.config.width;
        const gameHeight = this.game.config.height;
        // background
        const bg = this.add.graphics();
        bg.fillStyle(0xffd1dc, 1);
        bg.fillRect(0, 0, gameWidth, gameHeight);

        const boardWidth = GAMECFG.SYMBOLWIDTH * GAMECFG.REELNUM + GAMECFG.PADDING * 2;
        const boardHeight = GAMECFG.SYMBOLHEIGHT * GAMECFG.ROWNUM + GAMECFG.PADDING * 2;
        const boardX = gameWidth / 2 - boardWidth / 2;
        const boardY = gameHeight / 2 - boardHeight / 2;

        // Add a board background
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0xbbada0, 1);
        this.graphics.fillRoundedRect(boardX, boardY, boardWidth, boardHeight, 16);

        // Board layer
        this.boardLayer = this.add.layer();
        const boardMask = this.graphics.createGeometryMask();
        this.boardLayer.setMask(boardMask);

        // board
        this.board = new Board(this, boardX, boardY);
        const boardData = this.randomizeBoardData();
        this.board.init(boardData);

        // turbo button
        this.turboButton = this.add.text(100, gameHeight - 80, 'TURBO', {
            fontSize: '36px',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
            borderRadius: 10,
        }).setOrigin(0.5).setInteractive();
        this.turboButton.on('pointerup', function (pointer, localX, localY, event) {
            this.events.emit(GAME_EVENT.PRESS_TURBO);
        }, this);
        this.turboButton.setBackgroundColor(this.board.isTurbo ? '#d3d3d3' : '#ffffff');

        // auto button
        this.autoButton = this.add.text(gameWidth - 100, gameHeight - 80, 'AUTO', {
            fontSize: '36px',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
            borderRadius: 10,
        }).setOrigin(0.5).setInteractive();
        this.autoButton.on('pointerup', function (pointer, localX, localY, event) {
            this.isAutoSpin = !this.isAutoSpin;
            this.autoButton.setBackgroundColor(this.isAutoSpin ? '#d3d3d3' : '#ffffff');
            this.events.emit(GAME_EVENT.PRESS_AUTO);
        }, this);
        this.autoButton.setBackgroundColor(this.isAutoSpin ? '#d3d3d3' : '#ffffff');

        // spin button
        this.spinButton = this.add.text(gameWidth / 2, gameHeight - 80, 'SPIN', {
            fontSize: '36px',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
            borderRadius: 10,
        }).setOrigin(0.5).setInteractive();
        this.spinButton.on('pointerup', function (pointer, localX, localY, event) {
            this.events.emit(GAME_EVENT.PRESS_SPIN);
        }, this);

        // infor bar text
        this.infoBarText = this.add.text(gameWidth / 2, 80, 'WIN ', {
            fontSize: '36px',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
            borderRadius: 10,
        }).setOrigin(0.5).setVisible(false);
    }

    registerEventListeners() {
        this.events.on(GAME_EVENT.SHOW_WIN, this.showWin, this);  
        this.events.on(GAME_EVENT.SPIN_START_SWING, () => {
            this.infoBarText.setVisible(false);
        });
        this.input.keyboard.on('keydown-' + 'SPACE', (ev) => {
            this.events.emit(GAME_EVENT.PRESS_SPIN);
        });
    }

    randomizeBoardData() {
        let data = [];
        const randomArr = Array.from( { length: GAMECFG.SYMBOLNUM }, (_, i) => i);
        for (let col = 0; col < GAMECFG.REELNUM; ++col) {
            data[col] = [];
            for (let row = 0; row < GAMECFG.ROWNUM; ++row) {
                data[col][row] = Phaser.Utils.Array.GetRandom(randomArr);
            }
        }
        console.log('Random board data ' + data.toString());
        return data;
    }

    async showWin() {
        await this.showWinAnim();
        await this.showTotalWinAnim();
        this.events.emit(GAME_EVENT.SHOW_WIN_END);
    }

    async showWinAnim() {
        const winLines = await this.calculateWinLines(this.board.boardData);
        let promChain = Promise.resolve();
        let posList = [];
        for (const winLine of winLines) {
            console.log('Win line ' + winLine.toString());
            posList = winLine.positions;
            await Promise.all([
                this.board.showWinSymbols(posList),
                this.displayWinAmount(winLine.winAmount, true, false)
            ]);
            // delay 1 sec
            let tweenCounter;
            await new Promise(async (resolve) => {
                // delay 0.3 sec
                tweenCounter = await this.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: 300,
                    onComplete: (tween) => {
                        resolve.call();
                    }
                });
            });
            tweenCounter.stop();
        }
        return promChain;
    }

    async showTotalWinAnim() {
        const winLines = await this.calculateWinLines(this.board.boardData);
        let promList = [];
        let posList = [];
        let totalWinAmount = 0;
        for (const winLine of winLines) {
            posList = posList.concat(winLine.positions);
            totalWinAmount += winLine.winAmount;
        }
        // make unique array
        posList = posList.filter((value, index, array) => {
            return array.findIndex((v) => (v.col == value.col && v.row == value.row)) === index;
        });
        promList.push(this.board.showWinSymbols(posList));
        promList.push(this.displayWinAmount(totalWinAmount, false, true));
        await Promise.all(promList);
        let tweenCounter;
        await new Promise( (resolve) => {
            // delay 0.3 sec
            tweenCounter = this.tweens.addCounter({
                from: 0,
                to: 1,
                duration: 300,
                onComplete: (tween) => {
                    resolve.call();
                }
            });
        });
        tweenCounter.stop();
    }

    async calculateWinLines(boardData) {
        // a win happens when the same symbol appear on at least 3 consecutive reels, starting from reel #1
        let winLines = [];
        let firstCol = boardData[0];
        let symbolID = -1, foundIdList = [], winAmount = 0;
        let consecutivePos = [];    // [ [{0,1}], [{1,0},{1,1}], [{2, 2}] ]
        for (let row = 0; row < GAMECFG.ROWNUM; ++row) {
            consecutivePos = [];
            consecutivePos[0] = [];
            consecutivePos[0].push(new BoardPos(0, row));
            symbolID = firstCol[row];
            // check appearance on consecutive reels
            let col = 1;
            while (col < GAMECFG.REELNUM) {
                foundIdList = boardData[col].reduce((prev, cur, index) => {
                    if (cur == symbolID)
                        prev.push(index);
                    return prev;
                }, []);
                if (foundIdList.length > 0) {
                    consecutivePos[col] = [];
                    for (const foundID of foundIdList) {
                        consecutivePos[col].push(new BoardPos(col, foundID));
                    }
                    ++col;
                } else {
                    break;
                }
            }
            if (consecutivePos.length >= 3) {
                // valid win line
                winAmount = (consecutivePos.length - 2) * 5;
                const winLinePosList = this.generateWinLineList(consecutivePos);
                const winLineList = Array.from(winLinePosList, (v) => new WinLine(v, symbolID, winAmount));
                winLines = winLines.concat(winLineList);
            }
        }
        return winLines;
    }

    generateWinLineList(consecutivePos) {
        const result = [];

        const backtrack = (path, colIndex) => {
            if (colIndex === consecutivePos.length) {
                result.push([...path]);
                return;
            }

            for (const element of consecutivePos[colIndex]) {
                path.push(element);
                backtrack(path, colIndex + 1);
                path.pop();
            }
        }

        backtrack([], 0);
        return result;
    }

    async displayWinAmount(winAmount, useIncrement, isTotal) {
        if (!winAmount) return;
        const totalText = (isTotal ? 'TOTAL WIN ' : 'WIN ');
        this.infoBarText.setVisible(true);
        if (!useIncrement) {
            this.infoBarText.setText(totalText + winAmount.toLocaleString(
                undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            ));
            return;
        }

        await new Promise((resolve) => {
            this.infoBarTween = this.tweens.addCounter(
                {
                    from: 0,
                    to: winAmount,
                    duration: 500,
                    onComplete: (tween) => {
                        this.infoBarText.setText(totalText + winAmount.toLocaleString(
                            undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2}
                        ));
                        resolve.call();
                    },
                    onUpdate: async (tween, target, key, current, previous, param) => {
                        let displayNum = this.infoBarTween.getValue();
                        this.infoBarText.setText(totalText + displayNum.toLocaleString(
                            undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2}
                        ));
                    }
                }
            )
        });
        this.infoBarTween.complete();
    }
}