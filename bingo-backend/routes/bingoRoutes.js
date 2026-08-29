import express from 'express';
import { optionalAuth } from '../middleware/authMiddleware.js';
import {
    createBingoCard,
    getBingoCardsByUserAndGame,
    getBingoCardById,
    getGameCards,
    updateBingoCardByUserAndGame,
    updateBingoCardById,
    deleteBingoCardById,
    deleteBingoCardByUserAndGame,
    updateMarkedNumbers,
} from '../controller/bingoControllerCard.js';
import {
    activateGame,
    claimWin,
    createGame,
    finalizeGame,
    getAllGames,
    getGameById,
    restartGame,
    searchGames,
    startGame,
    updateGame,
} from '../controller/bingoGameController.js';
import { getPlayersByGameId, leaveGame, joinGame } from '../controller/bingoUsersGameController.js';
import { LoginUser, RegisterUser, GoogleAuth, FacebookAuth, GuestAuth } from '../controller/bingoUserController.js';
import {
    BingoControllerCalledNumber,
    getCalledNumbersByGame,
} from '../controller/bingoControllerCalledNumber.js';
import { getCasinoStats } from '../controller/bingoStatsController.js';

const router = express.Router();

// Auth (público)
router.post('/login', LoginUser);
router.post('/register', RegisterUser);
router.post('/auth/guest', GuestAuth);
router.post('/auth/google', GoogleAuth);
router.post('/auth/facebook', FacebookAuth);

// Lecturas públicas / con auth opcional
router.get('/stats', getCasinoStats);
router.get('/game', getAllGames);
router.get('/game/search', searchGames);
router.get('/game/:id', getGameById);
router.get('/game/:id/players', getPlayersByGameId);
router.get('/game/:game_id/cards', optionalAuth, getGameCards);
router.get('/cards/:user_id/:game_id', getBingoCardsByUserAndGame);
router.get('/card/:id', getBingoCardById);
router.get('/called-number/:game_id', getCalledNumbersByGame);

// Acciones (auth recomendado; optionalAuth mantiene compatibilidad con el frontend actual)
router.post('/game', optionalAuth, createGame);
router.put('/games/:id', optionalAuth, updateGame);
router.post('/games/:id/start', optionalAuth, startGame);
router.post('/games/:id/restart', optionalAuth, restartGame);
router.post('/games/:id/claim-win', optionalAuth, claimWin);
router.patch('/games/:id/finalize', optionalAuth, finalizeGame);
router.patch('/games/:id/activate', optionalAuth, activateGame);

router.post('/game/:game_id/join', optionalAuth, joinGame);
router.post('/game/:game_id/leave', optionalAuth, leaveGame);

router.post('/generate-card', optionalAuth, createBingoCard);
router.put('/bingo-cards/:id', optionalAuth, updateBingoCardById);
router.put('/bingo-cards/:user_id/:game_id', optionalAuth, updateBingoCardByUserAndGame);
router.patch('/bingo-cards/:user_id/:game_id/marks', optionalAuth, updateMarkedNumbers);
router.delete('/bingo-card/:id', optionalAuth, deleteBingoCardById);
router.delete('/bingo-card/user/:user_id/game/:game_id', optionalAuth, deleteBingoCardByUserAndGame);

router.post('/called-number/:game_id', optionalAuth, BingoControllerCalledNumber);

export default router;
