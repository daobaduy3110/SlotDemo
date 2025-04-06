export default class Symbol {
    _symbolID = 0;
    constructor(scene, x, y, id) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, 'symbol' + id.toString());
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