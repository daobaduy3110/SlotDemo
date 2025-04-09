import Symbol from '../components/Symbol.js'
import Board from '../components/Board.js'
import { GAMECFG, GAME_EVENT } from '../GameConfig.js'

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        this.board;
        this.spinButton;
        this.registerEventListeners();
    }

    create() {
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

        // spin button
        this.spinButton = this.add.sprite(gameWidth / 2, gameHeight - 80, 'spinButton').setInteractive();
        this.spinButton.on('pointerup', function (pointer, localX, localY, event) {
            this.events.emit(GAME_EVENT.PRESS_SPIN);
        }, this);
    }

    registerEventListeners() {
        
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
        return data;
    }

    // Add a new tile (2 or 4) to a random empty cell
    addTile() {
        const emptyTiles = [];

        // Find all empty tiles
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.fieldArray[row][col].tileValue === 0) {
                    emptyTiles.push({
                        row: row,
                        col: col
                    });
                }
            }
        }

        if (emptyTiles.length === 0) return false;

        // Choose a random empty tile
        const chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);

        // 90% chance for a 2, 10% chance for a 4
        const value = Math.random() < 0.9 ? 2 : 4;

        // Update the tile value
        this.fieldArray[chosenTile.row][chosenTile.col].tileValue = value;
        const tileSprite = this.fieldArray[chosenTile.row][chosenTile.col].tileSprite;

        // Update the sprite texture based on value
        tileSprite.setTexture(`tile${value}`);
        tileSprite.setVisible(true);

        // Animate the new tile appearing
        tileSprite.setScale(0);
        this.tweens.add({
            targets: [tileSprite],
            scale: 0.8,
            alpha: 1,
            duration: this.tweenSpeed,
            ease: 'Back.out',
            onComplete: (tween) => {
                // Allow the player to move again
                this.canMove = true;
            }
        });

        return true;
    }
}