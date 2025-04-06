const FILES = {
    symbols: {
        key: 'symbol',
        url: 'sprites/symbols/symbol'
    },
    symbolNum: 9,
    spinButton: {
        key: 'spinButton',
        url: 'sprites/SpinButton.png'
    }
};

export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.setPath('assets');

        for (let i = 0; i < FILES.symbolNum; ++i) {
            this.load.image(FILES.symbols.key + i.toString(), FILES.symbols.url + i.toString() + '.png');
        }
        this.load.image(FILES.spinButton);
    }

    create() {
        this.scene.start('LoadingScene');
    }
}
