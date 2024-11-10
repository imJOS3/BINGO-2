export const BingoNumberCaller = (numberGenerator, calledNumberRepository) => ({
    async callNextNumber(gameId) {
        try {
            const nextNumber = numberGenerator.getNextNumber();
            const savedNumber = await calledNumberRepository.saveCalledNumber(gameId, nextNumber);
            return savedNumber;
        } catch (error) {
            console.error('Error al llamar el siguiente número:', error);
            throw new Error('No se pudo llamar el siguiente número');
        }
    }
});
