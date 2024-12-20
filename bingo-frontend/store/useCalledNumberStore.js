import { create } from 'zustand';
import axios from 'axios';
import { persist } from 'zustand/middleware';

// URL base de la API desde las variables de entorno
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const useCalledNumbersStore = create(
  persist(
    (set) => ({
        calledNumbers: [],
        nextNumber: null,

        // Función para obtener el siguiente número llamado
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
    }),
    {
        name: 'called-numbers-store', // Nombre para la clave en localStorage
        getStorage: () => localStorage, // Usamos localStorage para persistencia
    }
  )
);

export default useCalledNumbersStore;

// Función para determinar la letra de bingo en base al número
const getBingoLetter = (number) => {
    if (number >= 1 && number <= 15) return 'B';
    if (number >= 16 && number <= 30) return 'I';
    if (number >= 31 && number <= 45) return 'N';
    if (number >= 46 && number <= 60) return 'G';
    if (number >= 61 && number <= 75) return 'O';
    return '';
};
