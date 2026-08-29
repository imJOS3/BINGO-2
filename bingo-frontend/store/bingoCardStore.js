import { create } from 'zustand';
import axios from 'axios';
import { toUserMessage } from '../src/utils/userError';

const apiUrl = import.meta.env.VITE_API_URL; // Usar la variable de entorno para la URL base

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
                const response = await axios.post(`${apiUrl}/api/generate-card`, { user_id, game_id });
                set((state) => {
                    const updatedState = {
                        cards: [...state.cards, response.data],
                        selectedCard: response.data,
                        loading: false,
                    };
                    saveToLocalStorage(updatedState);
                    return updatedState;
                });
                return response.data;
            } catch (error) {
                set({ loading: false, error: toUserMessage(error, "No se pudo crear el cartón") });
                return null;
            }
         },

        // Función para obtener cartas por user_id y game_id
        fetchCardsByUserAndGame: async (user_id, game_id) => {
            set({ loading: true, error: null });
            try {
                const response = await axios.get(`${apiUrl}/api/cards/${user_id}/${game_id}`);
                const cards = Array.isArray(response.data) ? response.data : [];
                const selectedCard = cards.length > 0 ? cards[cards.length - 1] : null;
                const updatedState = {
                    cards,
                    selectedCard,
                    loading: false,
                };
                saveToLocalStorage(updatedState);
                set(updatedState);
                return selectedCard;
            } catch (error) {
                set({ loading: false, error: toUserMessage(error, "No se pudo cargar el cartón") });
                return null;
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
                const response = await axios.put(`${apiUrl}/api/bingo-cards/${id}`, { numbers });
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
                set({ loading: false, error: toUserMessage(error, "No se pudo actualizar el cartón") });
            }
        },

        // Función para actualizar la carta de bingo por user_id y game_id
        updateCardByUserAndGame: async (user_id, game_id, numbers) => {
            set({ loading: true, error: null });
            try {
                const response = await axios.put(`${apiUrl}/api/bingo-cards/${user_id}/${game_id}`, { numbers });
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
                set({ loading: false, error: toUserMessage(error, "No se pudo actualizar el cartón") });
            }
        },

        /** Guarda fichas marcadas en el servidor */
        saveMarkedNumbers: async (user_id, game_id, marked_numbers) => {
            try {
                const response = await axios.patch(
                    `${apiUrl}/api/bingo-cards/${user_id}/${game_id}/marks`,
                    { marked_numbers }
                );
                const card = response.data.card;
                set((state) => {
                    const updatedState = {
                        ...state,
                        cards: state.cards.map((c) =>
                            c.user_id == user_id && c.game_id == game_id ? card : c
                        ),
                        selectedCard:
                            state.selectedCard &&
                            state.selectedCard.user_id == user_id &&
                            state.selectedCard.game_id == game_id
                                ? card
                                : state.selectedCard,
                    };
                    saveToLocalStorage(updatedState);
                    return updatedState;
                });
                return card;
            } catch (error) {
                console.error('Error al guardar fichas marcadas:', error);
                return null;
            }
        },
    };
});

export default useBingoCardStore;
