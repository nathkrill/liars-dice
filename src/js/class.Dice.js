const min = 1;
const max = 6;

export default class Dice {

    constructor() {
        this.value = null;
    }

    roll() {
        let rollMin = Math.ceil(min);
        let rollMax = Math.floor(max);
        this.value = Math.floor(Math.random() * (rollMax - rollMin + 1)) + rollMin;
    }

    getValue() {
        return this.value;
    }
}