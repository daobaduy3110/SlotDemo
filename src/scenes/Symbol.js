export class Symbol {
    _symbolID = 0;
    constructor(scene, x, y, frame) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, 'symbols', frame);
    }

    setID(id) {
        this._symbolID = id;
        // change to new sprite
        const frameName = this._symbolID + 10;
        this.sprite.setFrame(frameName);
    }

    setPosition(x, y) {
        this.sprite.setPosition(x, y);
    }

    destroy() {
        this.sprite.destroy();
    }
    
}