
import { create } from 'zustand';
import axios from 'axios';

// Función para obtener datos de localStorage
const getLocalStorageData = () => {
    const data = localStorage.getItem('bingoCardStore');
    return data ? JSON.parse(data) : null;
};

// Función para guardar datos en localStorage
const setLocalStorageData = (data) => {
    localStorage.setItem('bingoCardStore', JSON.stringify(data));
};

const useBingoCardStore = create((set) => {
    const initialState = getLocalStorageData() || {
        cards: [],
        selectedCard: null,
        loading: false,
        error: null,
    };

    // Guardar el estado en localStorage al cambiar
    const saveToLocalStorage = (newState) => {
        setLocalStorageData(newState);
    };

    return {
        ...initialState,
        // Función para generar y guardar una nueva carta
        generateAndSaveCard: async (user_id, game_id) => {
            set({ loading: true, error: null });
            try {
                const response = await axios.post('http://localhost:3000/api/generate-card', { user_id, game_id });
                set((state) => {
                    const updatedState = {
                        cards: [...state.cards, response.data],
                        selectedCard: response.data,
                        loading: false,
                    };
                    saveToLocalStorage(updatedState);
                    return updatedState;
                });
            } catch (error) {
                set({ loading: false, error: error.message });
            }
        },

        // Función para obtener cartas por user_id y game_id
        fetchCardsByUserAndGame: async (user_id, game_id) => {
            set({ loading: true, error: null });
            try {
                const response = await axios.get(`http://localhost:3000/api/cards/${user_id}/${game_id}`);
                const updatedState = {
                    cards: response.data,
                    selectedCard: response.data.length > 0 ? response.data[response.data.length - 1] : null,
                    loading: false,
                };
                saveToLocalStorage(updatedState);
                set(updatedState);
            } catch (error) {
                set({ loading: false, error: error.message });
            }
        },

        // Función para establecer una carta seleccionada manualmente
        setSelectedCard: (card) => {
            set((state) => {
                const updatedState = { ...state, selectedCard: card };
                saveToLocalStorage(updatedState);
                return updatedState;
            });
        },

        // Función para limpiar la carta seleccionada
        clearSelectedCard: () => set((state) => {
            const updatedState = { ...state, selectedCard: null };
            saveToLocalStorage(updatedState);
            return updatedState;
        }),

        // Función para actualizar la carta de bingo por id
        updateCardById: async (id, numbers) => {
            set({ loading: true, error: null });
            try {
                const response = await axios.put(`http://localhost:3000/api/bingo-cards/${id}`, { numbers });
                set((state) => {
                    const updatedState = {
                        cards: state.cards.map(card => card.id === id ? response.data.card : card),
                        selectedCard: response.data.card,
                        loading: false,
                    };
                    saveToLocalStorage(updatedState);
                    return updatedState;
                });
            } catch (error) {
                set({ loading: false, error: error.message });
            }
        },

        // Función para actualizar la carta de bingo por user_id y game_id
        updateCardByUserAndGame: async (user_id, game_id, numbers) => {
            set({ loading: true, error: null });
            try {
                const response = await axios.put(`http://localhost:3000/api/bingo-cards/${user_id}/${game_id}`, { numbers });
                set((state) => {
                    const updatedState = {
                        cards: state.cards.map(card => 
                            card.user_id === user_id && card.game_id === game_id ? response.data.card : card),
                        selectedCard: response.data.card,
                        loading: false,
                    };
                    saveToLocalStorage(updatedState);
                    return updatedState;
                });
            } catch (error) {
                set({ loading: false, error: error.message });
            }
        },
    };
});

export default useBingoCardStore;
