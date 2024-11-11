import { create } from 'zustand';
import axios from 'axios';

const useBingoCardStore = create((set) => ({
    cards: [],
    selectedCard: null,
    loading: false,
    error: null,

    // Función para generar y guardar una carta de bingo
    generateAndSaveCard: async (user_id, game_id) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post('http://localhost:3000/api/generate-card', { user_id, game_id });
            set((state) => ({
                cards: [...state.cards, response.data],
                selectedCard: response.data,
                loading: false,
            }));
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    // Función para obtener las cartas de bingo por user_id y game_id
    fetchCardsByUserAndGame: async (user_id, game_id) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`http://localhost:3000/api/cards/${user_id}/${game_id}`);
            set({
                cards: response.data,
                selectedCard: response.data.length > 0 ? response.data[response.data.length - 1] : null,
                loading: false,
            });
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    // Función para establecer la carta seleccionada
    setSelectedCard: (card) => {
        set({ selectedCard: card });
    },

    // Función para limpiar la carta seleccionada
    clearSelectedCard: () => set({ selectedCard: null }),

    // Función para actualizar la carta de bingo por ID
    updateCardById: async (id, numbers) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.put(`http://localhost:3000/api/bingo-cards/${id}`, { numbers });
            set((state) => ({
                cards: state.cards.map((card) => (card.id === id ? response.data.card : card)),
                selectedCard: response.data.card,
                loading: false,
            }));
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    // Función para actualizar la carta de bingo por user_id y game_id
    updateCardByUserAndGame: async (user_id, game_id) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.put(`http://localhost:3000/api/bingo-cards/${user_id}/${game_id}`);
            set((state) => ({
                cards: state.cards.map((card) =>
                    card.user_id === user_id && card.game_id === game_id ? response.data.card : card
                ),
                selectedCard: response.data.card,
                loading: false,
            }));
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    // Función para eliminar una carta de bingo por ID
    deleteCardById: async (id) => {
        set({ loading: true, error: null });
        try {
            await axios.delete(`http://localhost:3000/api/bingo-cards/${id}`);
            set((state) => ({
                cards: state.cards.filter((card) => card.id !== id),
                selectedCard: null,
                loading: false,
            }));
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    // Función para eliminar una carta de bingo por user_id y game_id
    deleteCardByUserAndGame: async (user_id, game_id) => {
        set({ loading: true, error: null });
        try {
            await axios.delete(`http://localhost:3000/api/bingo-cards/user/${user_id}/game/${game_id}`);
            set((state) => ({
                cards: state.cards.filter((card) => card.user_id !== user_id || card.game_id !== game_id),
                selectedCard: null,
                loading: false,
            }));
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },
}));

export default useBingoCardStore;
