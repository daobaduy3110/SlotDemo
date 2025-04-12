export default class WinLine {
    positions = [];
    symbolID = -1;
    winAmount = 0;
    constructor(pos, symID, amount) {
        this.positions = pos;
        this.symbolID = symID;
        this.winAmount = amount;
    }

    toString() {
        let str = '';
        for (const pos of this.positions) {
            str += '[' + pos.col + ',' + pos.row + ']';
        }
        str += ' symbol ' + this.symbolID + ' win amount ' + this.winAmount;
        return str;
    }
}