import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {createBingoCard, getBingoCardsByUserAndGame, getBingoCardById, updateBingoCardByUserAndGame, updateBingoCardById, deleteBingoCardById, deleteBingoCardByUserAndGame } from '../controller/bingoControllerCard.js'
import { createGame, getAllGames, getGameById} from '../controller/bingoGameController.js';
import { getPlayersByGameId, leaveGame, joinGame } from '../controller/bingoUsersGameController.js';
import { LoginUser, RegisterUser } from '../controller/bingoUserController.js';
import { BingoControllerCalledNumber } from '../controller/bingoControllerCalledNumber.js';


const router = express.Router();

// Rutas de API para cartas de bingo
router.get('/cards/:user_id/:game_id', getBingoCardsByUserAndGame);// Ruta para obtener cartas por user_id y game_id
router.get('card/:id', getBingoCardById)//obenter bingo card por el id
router.post('/generate-card', createBingoCard);// Ruta para crear carton de bingo
router.put('/bingo-cards/:id', updateBingoCardById);// Actualización por id
router.put('/bingo-cards/:user_id/:game_id', updateBingoCardByUserAndGame); // Actualización por user_id y game_id
router.delete('/bingo-card/:id', deleteBingoCardById);  // Eliminar por ID
router.delete('/bingo-card/user/:user_id/game/:game_id', deleteBingoCardByUserAndGame);  // Eliminar por user_id y game_id



// Rutas de API para juegos
router.get('/game', getAllGames);
router.get('/game/:id',  getGameById);
router.post('/game',  createGame);

//Rutas para la partida 
router.post('/game/:game_id/join', joinGame);   // Ruta para unirse al juego
router.post('/game/:game_id/leave', leaveGame); // Ruta para salir del juego
router.get('/game/:id/players', getPlayersByGameId); //Ruta para obtener todos los jugadores de la partida 

//lamar numeros en una partida
router.post('/called-number/:game_id', BingoControllerCalledNumber)

//usarios rutas
router.post('/login', LoginUser);
router.post('/register', RegisterUser);


export default router;
