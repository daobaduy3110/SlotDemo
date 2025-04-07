export default class Symbol extends Phaser.GameObjects.Sprite {
    _symbolID = 0;
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
    }

    setSymbolID(id) {
        this._symbolID = id;
        // change to new sprite
        const textureName = 'symbol' + this._symbolID.toString();
        this.setTexture(textureName);
    }
    
}