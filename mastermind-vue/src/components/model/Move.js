export default class Move {
    constructor(guess, perfectMatch, partialMatch) {
        this.guess = guess;
        this.perfectMatch = perfectMatch;
        this.partialMatch = partialMatch;
        this.message = "";
        if (partialMatch === 0 && perfectMatch === 0) {
            this.message = "No match";
        } else {
            if (partialMatch > 0) {
                this.message = `-${partialMatch}`;
            }
            if (perfectMatch > 0) {
                this.message = `${this.message}+${perfectMatch}`;
            }
        }
    }
}