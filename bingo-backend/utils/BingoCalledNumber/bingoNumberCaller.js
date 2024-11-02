export class BingoNumberCaller {
    constructor(numberGenerator, calledNumberRepository) {
        this.numberGenerator = numberGenerator;
        this.calledNumberRepository = calledNumberRepository;
    }

    async callNextNumber(gameId) {
        try {
            const nextNumber = this.numberGenerator.getNextNumber();
            const savedNumber = await this.calledNumberRepository.saveCalledNumber(gameId, nextNumber);
            return savedNumber;
        } catch (error) {
            console.error('Error al llamar el siguiente número:', error);
            throw new Error('No se pudo llamar el siguiente número');
        }
    }
}
