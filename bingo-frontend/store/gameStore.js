import { create } from "zustand";
import axios from 'axios';

const useGameStore = create((set) => ({
    games: [], //alamcena todos los juegos
    loading: false,
    error: null,
    selectedGame: null, // Estado para almacenar el juego seleccionado

    // Función para obtener todos los juegos
    fetchGames: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get('http://localhost:3000/api/game'); 
            set({ games: response.data, loading: false });
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    // Función para obtener un juego por su ID
    fetchGameById: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`http://localhost:3000/api/game/${id}`);
            set({ selectedGame: response.data, loading: false });
        } catch (error) {
            set({ loading: false, error: error.message, selectedGame: null });
        }
    },

    // Función para establecer un juego seleccionado
    setSelectedGame: (game) => set({ selectedGame: game }),

    // Función para limpiar el juego seleccionado
    clearSelectedGame: () => set({ selectedGame: null }),

    // Función para crear un nuevo juego
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
