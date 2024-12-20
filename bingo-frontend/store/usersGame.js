import { create } from 'zustand';
import axios from 'axios';
import { persist } from 'zustand/middleware';

// URL base de la API desde las variables de entorno
const apiUrl = import.meta.env.VITE_API_URL;

const useUsersGame = create(
  persist(
    (set) => ({
        loading: false,
        error: null,
        players: [],

        // Obtener los jugadores de un juego
        fetchPlayers: async (gameId) => {
            set({ loading: true, error: null });
            try {
                const response = await axios.get(`${apiUrl}/api/game/${gameId}/players`);
                set({ players: response.data.players, loading: false });
            } catch (error) {
                set({ loading: false, error: error.message });
            }
        },

        // Unirse a un juego
        joinGame: async (gameId, userId) => {
            set({ loading: true, error: null });
            try {
                const response = await axios.post(`${apiUrl}/api/game/${gameId}/join`, { user_id: userId });
                set({ loading: false });
                return response.data;
            } catch (error) {
                set({ loading: false, error: error.message });
                throw new Error(error.message);
            }
        },

        // Salir de un juego
        leaveGame: async (gameId, userId) => {
            set({ loading: true, error: null });
            try {
                const response = await axios.post(`${apiUrl}/api/game/${gameId}/leave`, { user_id: userId });
                set({ loading: false });
                return response.data;
            } catch (error) {
                set({ loading: false, error: error.message });
                throw new Error(error.message);
            }
        },
    }),
    {
        name: 'users-game-store', // Nombre para la clave en localStorage
        getStorage: () => localStorage, // Usamos localStorage para persistencia
    }
  )
);

export default useUsersGame;
