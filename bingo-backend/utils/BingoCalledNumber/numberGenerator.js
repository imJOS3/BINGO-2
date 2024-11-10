export const NumberGenerator = () => {
    let availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    let calledNumbers = new Set();

    const resetNumbers = () => {
        availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);  // Vuelve a llenar los números disponibles
        calledNumbers.clear();  // Limpia los números llamados
    };

    const getNextNumber = () => {
        if (availableNumbers.length === 0) {
            throw new Error("Todos los números han sido llamados.");
        }

        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const number = availableNumbers.splice(randomIndex, 1)[0];
        calledNumbers.add(number);

        return number;
    };

    const isGameOver = () => {
        return availableNumbers.length === 0; // Retorna true si no hay más números disponibles
    };

    return { getNextNumber, resetNumbers, isGameOver };  // Devuelve la función
};
