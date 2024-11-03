// store/gameStore.js
import { create } from "zustand";
import axios from 'axios';

const useGameStore = create((set) => ({
    games: [],
    loading: false,
    error: null,
    selectedGame: null,

    fetchGames: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get('http://localhost:3000/api/game'); 
            set({ games: response.data, loading: false });
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    fetchGameById: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`http://localhost:3000/api/game/${id}`);
            set({ selectedGame: response.data, loading: false });
        } catch (error) {
            set({ loading: false, error: error.message, selectedGame: null });
        }
    },

    setSelectedGame: (game) => {
        localStorage.setItem('selectedGame', JSON.stringify(game));
        set({ selectedGame: game });
    },

    clearSelectedGame: () => {
        localStorage.removeItem('selectedGame');
        set({ selectedGame: null });
    },

    loadSelectedGame: () => {
        const savedGame = localStorage.getItem('selectedGame');
        if (savedGame) {
            set({ selectedGame: JSON.parse(savedGame) });
        }
    },

    createGame: async (gameData) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post('http://localhost:3000/api/game', gameData);
            set((state) => ({
                games: [...state.games, response.data],
                loading: false,
            }));
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },
}));

export default useGameStore;
