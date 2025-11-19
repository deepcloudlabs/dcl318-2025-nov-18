import Move from "../components/model/Move.js";

export default function createSecret(level = 3) {
    if (level > 10)
        throw new Error("level must be less than or equal to 10!");
    const digits = [createDigit(1, 9)];
    while (digits.length < level) {
        const digit = createDigit(0, 9);
        if (digits.includes(digit))
            continue;
        digits.push(digit);
    }
    let secret = Number(digits.join(''));
    console.log(secret);
    return secret;
}

export function createDigit(minValue = 0, maxValue = 9) {
    return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
}

export function evaluateMove(guess, secret) {
    const guessAsString = guess.toString();
    const secretAsString = secret.toString();
    let perfectMatch = 0;
    let partialMatch = 0;
    for (let i = 0; i < guessAsString.length; i++) {
        const g = guessAsString.charAt(i);
        for (let j = 0; j < secretAsString.length; j++) {
            const s = secretAsString.charAt(j);
            if (s === g) {
                if (i === j) {
                    perfectMatch++;
                } else {
                    partialMatch++;
                }
            }
        }
    }
    return new Move(guess,perfectMatch,partialMatch);
}