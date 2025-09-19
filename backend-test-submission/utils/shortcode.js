const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomShortcode(length = 6) {
    let s = '';
    for (let i = 0; i < length; i++) {
        s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    return s;
}

module.exports = { randomShortcode };
