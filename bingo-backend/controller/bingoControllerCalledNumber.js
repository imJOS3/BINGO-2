import { NumberGenerator } from '../utils/BingoCalledNumber/numberGenerator.js';
import { CalledNumberRepository } from '../repository/CalledNumberRepository.js';
import { BingoNumberCaller } from '../utils/BingoCalledNumber/bingoNumberCaller.js';

export class BingoControllerCalledNumber {
    constructor() {
        this.numberGenerator = new NumberGenerator();
        this.calledNumberRepository = new CalledNumberRepository();
        this.bingoNumberCaller = new BingoNumberCaller(this.numberGenerator, this.calledNumberRepository);
    }

    async callNumber(req, res) {
        try {
            const gameId = req.body.game_id;
            const calledNumber = await this.bingoNumberCaller.callNextNumber(gameId);
            res.status(200).json(calledNumber);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
