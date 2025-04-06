import Symbol from '../components/Symbol.js'

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        this.boardSize = 4;
        this.tileSize = 100;
        this.tileSpacing = 10;
        this.tweenSpeed = 100;
        this.score = 0;
        this.canMove = false;
        this.movingTiles = 0;
        
        this.colNum = 5;
        this.rowNum = 3;
        this.padding = 10; // 10 pixel padding
        this.symbolWidth = 145;
        this.symbolHeight = 145;
        this.columnGroup = [];
    }

    create() {
        const gameWidth = this.game.config.width;
        const gameHeight = this.game.config.height;
        // background
        const bg = this.add.graphics();
        bg.fillStyle(0xffd1dc, 1);
        bg.fillRect(0, 0, gameWidth, gameHeight);

        const boardWidth = this.symbolWidth * this.colNum + this.padding * 2;
        const boardHeight = this.symbolHeight * this.rowNum + this.padding * 2;
        const boardX = gameWidth / 2 - boardWidth / 2;
        const boardY = gameHeight / 2 - boardHeight / 2;

        // Add a board background
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0xbbada0, 1);
        this.graphics.fillRoundedRect(boardX, boardY, boardWidth, boardHeight, 16);

        this.fieldArray = [];
        this.fieldGroup = this.add.group();

        // Create the board grid
        for (let row = 0; row < this.boardSize; row++) {
            this.fieldArray[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                // Position for this tile
                const posX = this.tileDestinationX(col);
                const posY = this.tileDestinationY(row);

                // Add tile background
                const tileBG = this.add.image(posX, posY, 'tile_background');
                tileBG.setDisplaySize(this.tileSize, this.tileSize);

                // Create a tile sprite (initially invisible)
                const tile = this.add.sprite(posX, posY, 'tile2');
                tile.setVisible(false);
                // Make tiles slightly smaller than their background
                tile.setDisplaySize(this.tileSize * 0.8, this.tileSize * 0.8);
                tile.setScale(0.8); // Start with a smaller scale
                this.fieldGroup.add(tile);

                // Store the tile information
                this.fieldArray[row][col] = {
                    tileValue: 0,
                    tileSprite: tile,
                    canUpgrade: true
                };
            }
        }

        // Start the game with two tiles
        this.canMove = true;
        this.addTile();
        this.addTile();
    }

    createBoardGrid() {
        this.columnGroup = [];
        for (let col = 0; col < this.colNum; ++col) {
            for (let row = 0; row < this.rowNum; ++row) {
                // symbol position
                const posX = this.getPositionX(col);
                const posY = this.getPositionY(row);
            }
        }
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

    moveTile(tile, row, col, distance, changeNumber) {
        this.movingTiles++;

        // Get the final position for the tile
        const posX = this.tileDestinationX(col);
        const posY = this.tileDestinationY(row);

        this.tweens.add({
            targets: [tile.tileSprite],
            x: posX,
            y: posY,
            duration: this.tweenSpeed * distance,
            ease: 'Linear',
            onComplete: () => {
                this.movingTiles--;

                // If the tiles are merging, show the merge animation
                if (changeNumber) {
                    this.mergeTile(tile, row, col);
                }

                // If all moving tiles have completed their animations
                if (this.movingTiles === 0) {
                    this.resetTiles();
                    this.addTile();
                }
            }
        });
    }

    mergeTile(tile, row, col) {
        this.movingTiles++;

        tile.tileSprite.setVisible(false);

        // Show the merged tile with updated value
        const targetTile = this.fieldArray[row][col];
        targetTile.tileSprite.setTexture(`tile${targetTile.tileValue}`);
        targetTile.tileSprite.setVisible(true);

        this.tweens.add({
            targets: [targetTile.tileSprite],
            scale: 1.0,
            duration: this.tweenSpeed,
            yoyo: true,
            ease: 'Quad.easeInOut',
            onComplete: () => {
                targetTile.tileSprite.setScale(0.8); // Reset to normal scale
                this.movingTiles--;

                // If all animations have completed
                if (this.movingTiles === 0) {
                    this.resetTiles();
                    this.addTile();
                }
            }
        });
    }

    // Reset all tiles after a move
    resetTiles() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                // Reset upgrade flags
                this.fieldArray[row][col].canUpgrade = true;

                // Make sure tiles are in the correct position
                const posX = this.tileDestinationX(col);
                const posY = this.tileDestinationY(row);
                this.fieldArray[row][col].tileSprite.x = posX;
                this.fieldArray[row][col].tileSprite.y = posY;

                // Show/hide tiles based on their value
                if (this.fieldArray[row][col].tileValue > 0) {
                    this.fieldArray[row][col].tileSprite.setAlpha(1);
                    this.fieldArray[row][col].tileSprite.setVisible(true);
                    this.fieldArray[row][col].tileSprite.setTexture(`tile${this.fieldArray[row][col].tileValue}`);
                    this.fieldArray[row][col].tileSprite.setScale(0.8);
                } else {
                    this.fieldArray[row][col].tileSprite.setAlpha(0);
                    this.fieldArray[row][col].tileSprite.setVisible(false);
                }
            }
        }
    }

    isInsideBoard(row, col) {
        return (row >= 0) && (col >= 0) && (row < this.boardSize) && (col < this.boardSize);
    }

    tileDestinationX(col) {
        const boardWidth = this.boardSize * (this.tileSize + this.tileSpacing) + this.tileSpacing;
        const boardX = 512 - boardWidth / 2;
        return boardX + this.tileSpacing + (col * (this.tileSize + this.tileSpacing)) + (this.tileSize / 2);
    }

    tileDestinationY(row) {
        const boardWidth = this.boardSize * (this.tileSize + this.tileSpacing) + this.tileSpacing;
        const boardY = 384 - boardWidth / 2;
        return boardY + this.tileSpacing + (row * (this.tileSize + this.tileSpacing)) + (this.tileSize / 2);
    }

    getPositionX(col) {
        const gameWidth = this.game.config.width;
        const boardWidth = this.symbolWidth * this.colNum + this.padding * 2;
        const boardX = gameWidth / 2 - boardWidth / 2;
        return boardX + col * this.symbolWidth + this.symbolWidth / 2;
    }

    getPositionY(row) {
        const gameHeight = this.game.config.height;
        const boardHeight = this.symbolHeight * this.rowNum + this.padding * 2;
        const boardY = gameHeight / 2 - boardHeight / 2;
        return boardY + row * this.symbolHeight + this.symbolHeight / 2;
    }
}