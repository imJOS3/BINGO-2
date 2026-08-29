// store/authStore.js
import { create } from 'zustand';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toUserMessage } from '../src/utils/userError';

const apiUrl = import.meta.env.VITE_API_URL;

const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
};

const applySession = (set, token) => {
    localStorage.setItem('authToken', token);
    const decoded = decodeToken(token);
    const isGuest = Boolean(decoded?.isGuest || decoded?.provider === 'guest');
    if (isGuest) {
        localStorage.setItem('isGuest', '1');
    } else {
        localStorage.removeItem('isGuest');
    }
    set({
        auth: true,
        userInfo: decoded ? { ...decoded, isGuest } : null,
        loading: false,
        error: null,
    });
    return decoded;
};

const useAuthStore = create((set, get) => ({
    auth: false,
    userInfo: null,
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${apiUrl}/api/login`, { email, password });
            applySession(set, response.data.token);
            return response.data;
        } catch (error) {
            const message = toUserMessage(error, 'No se pudo iniciar sesión');
            set({ loading: false, error: message });
            throw new Error(message);
        }
    },

    register: async (username, email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${apiUrl}/api/register`, {
                nickname: username,
                email,
                password,
            });
            if (response.data.token) {
                applySession(set, response.data.token);
            } else {
                set({ loading: false, error: null });
            }
            return response.data;
        } catch (error) {
            const message = toUserMessage(error, 'No se pudo crear la cuenta');
            set({ loading: false, error: message });
            throw new Error(message);
        }
    },

    /** Entra solo con un nombre — sin email ni contraseña */
    loginAsGuest: async (nickname) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${apiUrl}/api/auth/guest`, {
                nickname: nickname.trim(),
            });
            applySession(set, response.data.token);
            return response.data;
        } catch (error) {
            const message = toUserMessage(error, 'No se pudo entrar como invitado');
            set({ loading: false, error: message });
            throw new Error(message);
        }
    },

    loginWithGoogle: async (credential) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${apiUrl}/api/auth/google`, { credential });
            applySession(set, response.data.token);
            return response.data;
        } catch (error) {
            const message = toUserMessage(error, 'No se pudo iniciar sesión');
            set({ loading: false, error: message });
            throw new Error(message);
        }
    },

    loginWithFacebook: async (accessToken) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${apiUrl}/api/auth/facebook`, { accessToken });
            applySession(set, response.data.token);
            return response.data;
        } catch (error) {
            const message = toUserMessage(error, 'No se pudo iniciar sesión');
            set({ loading: false, error: message });
            throw new Error(message);
        }
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('isGuest');
        set({ auth: false, userInfo: null });
    },

    isGuest: () => Boolean(get().userInfo?.isGuest || localStorage.getItem('isGuest') === '1'),

    isAuthenticated: () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decoded = decodeToken(token);
            if (!decoded) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('isGuest');
                set({ auth: false, userInfo: null });
                return;
            }
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('isGuest');
                set({ auth: false, userInfo: null });
                return;
            }
            const isGuest = Boolean(decoded.isGuest || decoded.provider === 'guest');
            set({ auth: true, userInfo: { ...decoded, isGuest } });
        } else {
            set({ auth: false, userInfo: null });
        }
    },

    setUserInfo: (newUserInfo) => {
        localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
        set({ userInfo: newUserInfo });
    },

    loadUserInfo: () => {
        const savedUser = localStorage.getItem('userInfo');
        if (savedUser) {
            set({ userInfo: JSON.parse(savedUser) });
        }
    },
}));

export default useAuthStore;
