// src/store/useCalledNumbersStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Ajusta según tu configuración

export const useCalledNumbersStore = create((set) => ({
    calledNumbers: [], // Números que ya fueron llamados
    nextNumber: null,  // Último número llamado

    fetchNextNumber: async (gameId) => {
        try {
            const response = await axios.post(`${API_URL}/called-number/${gameId}`);
            const newCalledNumber = response.data.number_called;
            const letter = getBingoLetter(newCalledNumber);

            set((state) => ({
                nextNumber: { number: newCalledNumber, letter },
                calledNumbers: [...state.calledNumbers, { number: newCalledNumber, letter }],
            }));
        } catch (error) {
            console.error('Error al llamar al siguiente número:', error);
        }
    },
}));

// Función para determinar la letra (B, I, N, G, O) según el número
const getBingoLetter = (number) => {
    if (number >= 1 && number <= 15) return 'B';
    if (number >= 16 && number <= 30) return 'I';
    if (number >= 31 && number <= 45) return 'N';
    if (number >= 46 && number <= 60) return 'G';
    if (number >= 61 && number <= 75) return 'O';
    return '';
};
