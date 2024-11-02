// store/bingoCardStore.js
import { create } from 'zustand';
import axios from 'axios';

const useBingoCardStore = create((set) => ({
    cards: [],
    selectedCard: null,
    loading: false,
    error: null,

    // Función para generar y guardar una nueva carta
    generateAndSaveCard: async (user_id, game_id) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post('http://localhost:3000/api/generate-card', { user_id, game_id });
            
            set((state) => ({
                cards: [...state.cards, response.data],
                selectedCard: response.data, // Establece la carta recién creada como seleccionada
                loading: false,
            }));
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    // Función para obtener cartas por user_id y game_id
    fetchCardsByUserAndGame: async (user_id, game_id) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`http://localhost:3000/api/cards/${user_id}/${game_id}`);
            set({ cards: response.data, selectedCard: response.data[0] || null, loading: false }); // Establece la primera carta como seleccionada, si hay
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    // Función para limpiar la carta seleccionada
    clearSelectedCard: () => set({ selectedCard: null }),
}));

export default useBingoCardStore;
