import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { BingoControllerCalledNumber } from '../controller/bingoControllerCalledNumber.js';
import { BingoControllerCard } from '../controller/bingoControllerCard.js';
import { createGame, getAllGames, getGameById, joinGame } from '../controller/bingoGameController.js';
import { login, register } from '../services/authServices.js';
import { getPlayersByGameId } from '../controller/bingoUsersGameController.js';

const router = express.Router();

// Crear instancias de los controladores
const bingoControllerCalledNumber = new BingoControllerCalledNumber();
const bingoControllerCard = new BingoControllerCard(); 


// Rutas de API para cartas de bingo
router.post('/generate-card', (req, res) => bingoControllerCard.generateAndSaveCard(req, res));

// Ruta para obtener cartas por user_id y game_id
router.get('/cards/:user_id/:game_id', (req, res) => bingoControllerCard.getCardsByUserAndGame(req, res));

// Ruta para obtener una carta por ID
router.get('/card/:id', (req, res) => bingoControllerCard.getCardById(req, res));

router.post('/call-number', (req, res) => bingoControllerCalledNumber.callNumber(req, res));

// Rutas de API para juegos
router.get('/game', getAllGames);
router.get('/game/:id',  getGameById);
router.post('/game',  createGame);
router.post('/game/:game_id/join', joinGame);

router.get('/game/:id/players', getPlayersByGameId);


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await login(email, password);
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { email, password, nickname } = req.body;
        const token = await register(email, password, nickname);
        res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


export default router;
