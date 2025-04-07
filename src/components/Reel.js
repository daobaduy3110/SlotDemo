import Symbol from './Symbol.js'

// Reel is logic unit, it is the interface of symbols on the board respective to it
// The actual parent of symbols are the board
export default class Reel extends Phaser.GameObjects.Group {
    constructor(scene, id) {
        super(scene);
        this.scene = scene;
        this.classType = Symbol;
        scene.add.existing(this);
    }
}