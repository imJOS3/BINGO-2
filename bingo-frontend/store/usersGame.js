import { create } from 'zustand';
import axios from 'axios';
import { persist } from 'zustand/middleware';

const useUsersGame = create(
  persist(
    (set) => ({
        loading: false,
        error: null,
        players: [],

        fetchPlayers: async (gameId) => {
            set({ loading: true, error: null });
            try {
                const response = await axios.get(`http://localhost:3000/api/game/${gameId}/players`);
                set({ players: response.data.players, loading: false });
            } catch (error) {
                set({ loading: false, error: error.message });
            }
        },

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
    }),
    {
        name: 'users-game-store', // Nombre para la clave en localStorage
        getStorage: () => localStorage, // Usamos localStorage para persistencia
    }
  )
);

export default useUsersGame;
