import { create } from "zustand";
import axios from 'axios';
import { persist } from "zustand/middleware";  // Importamos el middleware de persistencia

const useGameStore = create(
  persist(
    (set) => ({
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
        set({ selectedGame: game });
      },

      clearSelectedGame: () => {
        set({ selectedGame: null });
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
    }),
    {
      name: "game-store",  // Nombre para la clave en localStorage
      getStorage: () => localStorage,  // Usamos localStorage para persistencia
    }
  )
);

export default useGameStore;
