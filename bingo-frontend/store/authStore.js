// store/authStore.js
import { create } from 'zustand';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiUrl = import.meta.env.VITE_API_URL;

// Función para decodificar el token
const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
};

// Store para autenticación
const useAuthStore = create((set) => ({
    auth: false,
    userInfo: null,
    loading: false,
    error: null,

    // Función para iniciar sesión
    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${apiUrl}/api/login`, { email, password });
            const token = response.data.token;

            localStorage.setItem('authToken', token);
            const decoded = decodeToken(token);
            set({ auth: true, userInfo: decoded, loading: false });
            return response.data;
        } catch (error) {
            set({ loading: false, error: 'Error en el inicio de sesión' });
            throw new Error(error.response?.data?.message || 'Credenciales incorrectas');
        }
    },

    // Función para registrar un nuevo usuario
    register: async (username, email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${apiUrl}/api/register`, { nickname: username, email, password });
            set({ loading: false, error: null });
            return response.data;
        } catch (error) {
            set({ loading: false, error: 'Error al registrar el usuario' });
            throw new Error(error.response?.data?.message || 'Error al registrar el usuario');
        }
    },

    // Función para cerrar sesión
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        set({ auth: false, userInfo: null });
    },

    // Verificar si el usuario está autenticado
    isAuthenticated: () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decoded = decodeToken(token);
            set({ auth: true, userInfo: decoded });
        } else {
            set({ auth: false, userInfo: null });
        }
    },

    // Actualizar información del usuario
    setUserInfo: (newUserInfo) => {
        localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
        set({ userInfo: newUserInfo });
    },

    // Cargar información del usuario desde localStorage
    loadUserInfo: () => {
        const savedUser = localStorage.getItem('userInfo');
        if (savedUser) {
            set({ userInfo: JSON.parse(savedUser) });
        }
    },
}));

export default useAuthStore;
