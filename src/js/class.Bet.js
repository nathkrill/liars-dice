export default class Bet {
    /**
     * 
     * @param {Number} dice 
     * @param {Number} count 
     * @param {Boolean} exact
     */
    constructor(dice, count, exact) {
        this.dice = dice;
        this.count = count;
        this.exact = exact;
    }

    getValue() {
        if (this.exact) {
            return 'exact';
        }
        return {
            dice: this.dice,
            count: this.count
        }
    }
}