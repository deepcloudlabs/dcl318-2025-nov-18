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
    return Number(digits.join(''));
}

export function createDigit(minValue = 0, maxValue = 9) {
    return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
}