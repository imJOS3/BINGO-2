import { create } from 'zustand';
import axios from 'axios';
import { toUserMessage } from '../src/utils/userError';

const apiUrl = import.meta.env.VITE_API_URL;

const useUsersGame = create((set) => ({
    loading: false,
    error: null,
    players: [],
    // Mesa en la que estoy en cola (entré con la ronda ya empezada), o null.
    spectatorGameId: null,
    // Cartones de quienes juegan, solo visibles desde la cola.
    tableCards: [],

    fetchPlayers: async (gameId) => {
        set({ loading: true, error: null, players: [] });
        try {
            const response = await axios.get(`${apiUrl}/api/game/${gameId}/players`);
            set({ players: response.data.players, loading: false });
        } catch (error) {
            set({
                loading: false,
                players: [],
                error: toUserMessage(error, "No se pudieron cargar los jugadores"),
            });
        }
    },

    setSpectatorSeat: (gameId) =>
        set(gameId ? { spectatorGameId: gameId } : { spectatorGameId: null, tableCards: [] }),

    fetchTableCards: async (gameId, viewerId) => {
        if (!gameId || !viewerId) return [];
        try {
            const response = await axios.get(`${apiUrl}/api/game/${gameId}/cards`, {
                params: { user_id: viewerId },
            });
            const players = response.data?.players || [];
            set({ tableCards: players });
            return players;
        } catch {
            set({ tableCards: [] });
            return [];
        }
    },

    joinGame: async (gameId, userId) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${apiUrl}/api/game/${gameId}/join`, { user_id: userId });
            const data = response.data;
            set({
                loading: false,
                spectatorGameId: data?.spectator ? data.game?.id ?? gameId : null,
            });
            return data;
        } catch (error) {
            const message = toUserMessage(error, "No se pudo unir a la mesa");
            set({ loading: false, error: message });
            throw new Error(message);
        }
    },

    // Reclama la silla al entrar o recargar la página. Silencioso: si la mesa
    // ya no admite gente, la propia pantalla se encarga de redirigir.
    ensureSeat: async (gameId, userId) => {
        if (!gameId || !userId) return null;
        try {
            const response = await axios.post(`${apiUrl}/api/game/${gameId}/join`, { user_id: userId });
            const data = response.data;
            set({ spectatorGameId: data?.spectator ? data.game?.id ?? gameId : null });
            return data;
        } catch {
            return null;
        }
    },

    leaveGame: async (gameId, userId) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${apiUrl}/api/game/${gameId}/leave`, { user_id: userId });
            set({ loading: false });
            return response.data;
        } catch (error) {
            const message = toUserMessage(error, "No se pudo salir de la partida");
            set({ loading: false, error: message });
            throw new Error(message);
        }
    },
}));

export default useUsersGame;
