import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {createBingoCard, getBingoCardsByUserAndGame, getBingoCardById } from '../controller/bingoControllerCard.js'
import { BingoControllerCalledNumber } from '../controller/bingoControllerCalledNumber.js';
import { createGame, getAllGames, getGameById} from '../controller/bingoGameController.js';
import { getPlayersByGameId, leaveGame, joinGame } from '../controller/bingoUsersGameController.js';
import { LoginUser, RegisterUser } from '../controller/bingoUserController.js';

const router = express.Router();

// Rutas de API para cartas de bingo
router.post('/generate-card', createBingoCard);// Ruta para crear carton de bingo
router.get('/cards/:user_id/:game_id', getBingoCardsByUserAndGame);// Ruta para obtener cartas por user_id y game_id
router.get('card/:id', getBingoCardById)

//ruta ppara llamar los numeros de un juego
// router.post('/call-number', (req, res) => bingoControllerCalledNumber.callNumber(req, res));

// Rutas de API para juegos
router.get('/game', getAllGames);
router.get('/game/:id',  getGameById);
router.post('/game',  createGame);

//Rutas para la partida 
router.post('/game/:game_id/join', joinGame);   // Ruta para unirse al juego
router.post('/game/:game_id/leave', leaveGame); // Ruta para salir del juego
router.get('/game/:id/players', getPlayersByGameId); //Ruta para obtener todos los jugadores de la partida 


//usarios rutas
router.post('/login', LoginUser);
router.post('/register', RegisterUser);


export default router;
