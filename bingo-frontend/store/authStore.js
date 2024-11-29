import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiUrl = import.meta.env.VITE_API_URL;
    
const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
};

const useAuthStore = create(
  persist(
    (set) => ({
        auth: false,
        userInfo: null,
        loading: false,
        error: null,

        // Función para hacer login
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
                set({ loading: false, error: 'Credenciales incorrectas' });
                throw new Error('Credenciales incorrectas');
            }
        },

        // Función para registrar al usuario
        register: async (username, email, password) => {
            set({ loading: true, error: null });
            try {
                const response = await axios.post(`${apiUrl}/api/register`, { nickname: username, email, password });
                set({ loading: false, error: null });
                return response.data; // Retorna la respuesta para usarla en el componente
            } catch (error) {
                set({ loading: false, error: 'Error al registrar el usuario' });
                throw new Error('Error al registrar el usuario');
            }
        },

        logout: () => {
            localStorage.removeItem('authToken');
            set({ auth: false, userInfo: null });
        },

        isAuthenticated: () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                const decoded = decodeToken(token);
                set({ auth: true, userInfo: decoded });
            } else {
                set({ auth: false, userInfo: null });
            }
        },
    }),
    {
        name: 'auth-store',  // Nombre de la clave en localStorage
        getStorage: () => localStorage,  // Usamos localStorage para persistencia
    }
  )
);

export default useAuthStore;
