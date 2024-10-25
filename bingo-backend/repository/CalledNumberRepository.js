import CalledNumbers from "../model/calledNumber.js";

export class CalledNumberRepository {
    async saveCalledNumber(gameId, number) {
        try {
            const newCalledNumber = await CalledNumbers.create({
                game_id: gameId,
                number_called: number
            });
            return newCalledNumber;
        } catch (error) {
            console.error('Error al guardar el número llamado:', error);
            throw new Error('No se pudo guardar el número llamado');
        }
    }
}
