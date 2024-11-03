// store/useUsersGame.js
import { create } from 'zustand';
import axios from 'axios';

const useUsersGame = create((set) => ({
    loading: false,
    error: null,
    players: [], // Agrega un estado para los jugadores

    // Función para obtener los jugadores de la partida
    fetchPlayers: async (gameId) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`http://localhost:3000/api/game/${gameId}/players`);
            set({ players: response.data.players, loading: false });
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    // Función para unirse a un juego
    joinGame: async (gameId, userId) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`http://localhost:3000/api/game/${gameId}/join`, { user_id: userId });
            set({ loading: false });
            return response.data;
        } catch (error) {
            set({ loading: false, error: error.message });
            throw new Error(error.message);
        }
    },

    // Función para salir de un juego
    leaveGame: async (gameId, userId) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`http://localhost:3000/api/game/${gameId}/leave`, { user_id: userId });
            set({ loading: false });
            return response.data;
        } catch (error) {
            set({ loading: false, error: error.message });
            throw new Error(error.message);
        }
    },
}));

export default useUsersGame;
