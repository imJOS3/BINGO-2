import { create } from "zustand";
import axios from 'axios';
import { persist } from "zustand/middleware"; 

// URL base de la API desde las variables de entorno
const apiUrl = import.meta.env.VITE_API_URL;

const useGameStore = create(
  persist(
    (set) => ({
      games: [],
      loading: false,
      error: null,
      selectedGame: null,

      // Obtener la lista de juegos
      fetchGames: async () => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(`${apiUrl}/api/game`);
          set({ games: response.data, loading: false });
        } catch (error) {
          set({ loading: false, error: error.message });
        }
      },

      // Obtener un juego por ID
      fetchGameById: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(`${apiUrl}/api/game/${id}`);
          set({ selectedGame: response.data, loading: false });
        } catch (error) {
          set({ loading: false, error: error.message, selectedGame: null });
        }
      },

      // Establecer manualmente un juego seleccionado
      setSelectedGame: (game) => {
        set({ selectedGame: game });
      },

      // Limpiar el juego seleccionado
      clearSelectedGame: () => {
        set({ selectedGame: null });
      },

      // Crear un nuevo juego
      createGame: async (gameData) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${apiUrl}/api/game`, gameData);
            const createdGame = response.data; // Obtenemos el juego creado
            
            if (!createdGame || !createdGame.id) {
                throw new Error("Game creation failed, no valid response from server.");
            }
    
            set((state) => ({
                games: [...state.games, createdGame],
                loading: false,
                selectedGame: createdGame, // Seleccionamos el nuevo juego creado
            }));
    
            return createdGame; // Devuelve el juego creado
        } catch (error) {
            set({ loading: false, error: error.message });
            throw error; // Re-lanza el error para manejarlo en el componente
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
