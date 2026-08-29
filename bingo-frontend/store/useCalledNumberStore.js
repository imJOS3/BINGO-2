import { create } from 'zustand';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const getBingoLetter = (number) => {
    if (number >= 1 && number <= 15) return 'B';
    if (number >= 16 && number <= 30) return 'I';
    if (number >= 31 && number <= 45) return 'N';
    if (number >= 46 && number <= 60) return 'G';
    if (number >= 61 && number <= 75) return 'O';
    return '';
};

const mapCalledRows = (rows) =>
    (Array.isArray(rows) ? rows : []).map((row) => {
        const number = row.number_called;
        return { number, letter: getBingoLetter(number) };
    });

const mergeCalled = (serverRows, localRows) => {
    const server = Array.isArray(serverRows) ? serverRows : [];
    const local = Array.isArray(localRows) ? localRows : [];
    const seen = new Set(server.map((item) => item.number));
    const extras = local.filter((item) => !seen.has(item.number));
    return [...server, ...extras];
};

const useCalledNumbersStore = create((set, get) => ({
    calledNumbers: [],
    nextNumber: null,
    gameId: null,
    loaded: false,
    roundNonce: 0,

    resetCalledNumbers: () => {
        set({
            calledNumbers: [],
            nextNumber: null,
            gameId: null,
            loaded: false,
            roundNonce: get().roundNonce + 1,
        });
    },

    /** Vacía las bolas de esta mesa para una ronda nueva (mismo gameId). */
    startNewRound: (gameId) => {
        set({
            calledNumbers: [],
            nextNumber: null,
            gameId,
            loaded: true,
            roundNonce: get().roundNonce + 1,
        });
    },

    /** Prepara contexto al cambiar de partida (no borra si es la misma) */
    prepareForGame: (gameId) => {
        const current = get().gameId;
        if (String(current) !== String(gameId)) {
            set({
                calledNumbers: [],
                nextNumber: null,
                gameId,
                loaded: false,
                roundNonce: get().roundNonce + 1,
            });
        }
    },

    /** Carga desde el servidor los números ya salidos (misma partida tras recargar) */
    loadCalledNumbers: async (gameId) => {
        if (!gameId) return [];
        const nonce = get().roundNonce;
        try {
            const response = await axios.get(`${API_URL}/called-number/${gameId}`);
            const serverRows = mapCalledRows(response.data);
            let merged = [];
            set((prev) => {
                if (prev.roundNonce !== nonce) return prev;
                if (String(prev.gameId) !== String(gameId) && prev.gameId != null) {
                    return prev;
                }
                merged = mergeCalled(serverRows, prev.calledNumbers);
                const last = merged[merged.length - 1] || null;
                return {
                    gameId,
                    calledNumbers: merged,
                    nextNumber: last,
                    loaded: true,
                };
            });
            return merged;
        } catch (error) {
            console.error('Error al cargar números llamados:', error);
            if (get().roundNonce !== nonce) return [];
            set({ gameId, calledNumbers: [], nextNumber: null, loaded: true });
            return [];
        }
    },

    applyCalledNumber: (gameId, number, letter) => {
        if (!gameId || number == null) return;
        const entry = { number, letter: letter || getBingoLetter(number) };
        set((prev) => {
            if (prev.gameId && String(prev.gameId) !== String(gameId)) return prev;
            const base = prev.calledNumbers || [];
            if (base.some((n) => n.number === entry.number)) {
                return { ...prev, gameId, nextNumber: entry, loaded: true };
            }
            return {
                gameId,
                nextNumber: entry,
                calledNumbers: [...base, entry],
                loaded: true,
            };
        });
    },

    fetchNextNumber: async (gameId) => {
        if (!gameId) return null;

        const state = get();
        if (String(state.gameId) !== String(gameId)) {
            set({
                calledNumbers: [],
                nextNumber: null,
                gameId,
                loaded: false,
                roundNonce: state.roundNonce + 1,
            });
        }

        try {
            const response = await axios.post(`${API_URL}/called-number/${gameId}`);
            const newCalledNumber = response.data.number_called;
            const letter = getBingoLetter(newCalledNumber);
            const entry = { number: newCalledNumber, letter };

            set((prev) => {
                const base =
                    String(prev.gameId) === String(gameId) ? prev.calledNumbers : [];
                const already = base.some((n) => n.number === newCalledNumber);
                return {
                    gameId,
                    nextNumber: entry,
                    calledNumbers: already ? base : [...base, entry],
                    loaded: true,
                };
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 409) {
                return { finished: true, ...error.response.data };
            }
            console.error('Error al llamar al siguiente número:', error);
            return null;
        }
    },
}));

export default useCalledNumbersStore;
