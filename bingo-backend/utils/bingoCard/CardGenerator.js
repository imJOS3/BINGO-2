 export const generateBingoCard = () => {
    const card = {
        B: [],
        I: [],
        N: [],
        G: [],
        O: []
    };

    const getRandomNumbers = (min, max, count) => {
        const numbers = new Set();
        while (numbers.size < count) {
            numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return Array.from(numbers);
    };

    card.B = getRandomNumbers(1, 15, 5);
    card.I = getRandomNumbers(16, 30, 5);
    card.N = getRandomNumbers(31, 45, 4);
    card.G = getRandomNumbers(46, 60, 5);
    card.O = getRandomNumbers(61, 75, 5);

    card.N.splice(2, 0, 'FREE');  // Espacio libre

    return card;
};
