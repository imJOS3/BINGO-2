import { create } from "zustand";
import axios from 'axios';
import { persist } from "zustand/middleware";
import { toUserMessage } from "../src/utils/userError"; 

// URL base de la API desde las variables de entorno
const apiUrl = import.meta.env.VITE_API_URL;

const useGameStore = create(
  persist(
    (set) => ({
      games: [],
      loading: false,
      error: null,
      selectedGame: null,
      winner: null,

      // Obtener la lista de juegos
      // silent evita el parpadeo de "cargando" en los refrescos automáticos.
      fetchGames: async ({ silent = false } = {}) => {
        if (!silent) set({ loading: true, error: null });
        try {
          const response = await axios.get(`${apiUrl}/api/game`);
          set({ games: response.data, loading: false, error: null });
        } catch (error) {
          if (silent) return;
          set({ loading: false, error: toUserMessage(error, "No se pudieron cargar las mesas") });
        }
      },

      // Obtener un juego por ID numérico o código de 6 caracteres
      fetchGameById: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(`${apiUrl}/api/game/${encodeURIComponent(id)}`);
          set({ selectedGame: response.data, loading: false });
        } catch (error) {
          set({
            loading: false,
            error: toUserMessage(error, "No se pudo abrir esa mesa"),
            selectedGame: null,
          });
        }
      },

      searchGames: async (query) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(`${apiUrl}/api/game/search`, {
            params: { q: query },
          });
          set({ loading: false });
          return response.data || [];
        } catch (error) {
          set({
            loading: false,
            error: toUserMessage(error, "No se pudo buscar la mesa"),
            selectedGame: null,
          });
          return [];
        }
      },

      // Establecer manualmente un juego seleccionado
      setSelectedGame: (game) => {
        set((state) => {
          if (
            game &&
            state.selectedGame &&
            String(state.selectedGame.id) === String(game.id)
          ) {
            return { selectedGame: { ...state.selectedGame, ...game } };
          }
          return { selectedGame: game };
        });
      },

      // Limpiar el juego seleccionado
      clearSelectedGame: () => {
        set({ selectedGame: null });
      },

      dropGame: (gameId) => {
        set((state) => ({
          games: (state.games || []).filter((g) => String(g.id) !== String(gameId)),
          selectedGame:
            state.selectedGame && String(state.selectedGame.id) === String(gameId)
              ? null
              : state.selectedGame,
        }));
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
            const message = toUserMessage(error, "No se pudo crear la mesa");
            set({ loading: false, error: message });
            throw new Error(message);
        }
      },

      updateGame: async (gameId, creatorId, payload) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.put(`${apiUrl}/api/games/${gameId}`, {
            creator_id: creatorId,
            ...payload,
          });
          const game = response.data;
          set((state) => ({
            selectedGame: game,
            loading: false,
            games: state.games.map((g) => (g.id === game.id ? game : g)),
          }));
          return game;
        } catch (error) {
          const message = toUserMessage(error, "No se pudo guardar");
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },

      startGame: async (gameId, creatorId) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${apiUrl}/api/games/${gameId}/start`, {
            creator_id: creatorId,
          });
          const startedGame = response.data.game || response.data;
          set({
            selectedGame: startedGame,
            winner: null,
            loading: false,
          });
          return startedGame;
        } catch (error) {
          const message = toUserMessage(error, "No se pudo iniciar la partida");
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },

      // Declarar ganador y finalizar
      claimWin: async (gameId, userId, nickname) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${apiUrl}/api/games/${gameId}/claim-win`, {
            user_id: userId,
            nickname,
          });
          const game = response.data.game;
          const winner = response.data.winner;
          set({
            selectedGame: game,
            winner,
            loading: false,
          });
          return response.data;
        } catch (error) {
          const message = toUserMessage(error, "No se pudo declarar el bingo");
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },

      setWinner: (winner) => set({ winner }),

      clearWinner: () => set({ winner: null }),

      applyRestart: (game) => {
        set((state) => ({
          selectedGame: game,
          winner: null,
          games: state.games.map((g) => (g.id === game.id ? game : g)),
        }));
      },

      restartGame: async (gameId, creatorId, payload) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${apiUrl}/api/games/${gameId}/restart`, {
            creator_id: creatorId,
            ...payload,
          });
          const game = response.data.game;
          set((state) => ({
            selectedGame: game,
            winner: null,
            loading: false,
            games: state.games.map((g) => (g.id === game.id ? game : g)),
          }));
          return response.data;
        } catch (error) {
          const message = toUserMessage(error, "No se pudo pasar de ronda");
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },
    }),
    {
      name: "game-store",
      getStorage: () => localStorage,
      partialize: (state) => ({
        games: state.games,
        selectedGame: state.selectedGame,
      }),
    }
  )
);

export default useGameStore;
