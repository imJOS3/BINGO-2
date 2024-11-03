// store/authStore.js
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
};

const useAuthStore = create((set) => ({
    auth: false,
    userInfo: null,

    login: (token) => {
        localStorage.setItem('authToken', token);
        const decoded = decodeToken(token);
        set({ auth: true, userInfo: decoded });
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

    setUserInfo: (newUserInfo) => {
        localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
        set({ userInfo: newUserInfo });
    },

    // Nuevo método para cargar userInfo desde localStorage
    loadUserInfo: () => {
        const savedUser = localStorage.getItem('userInfo');
        if (savedUser) {
            set({ userInfo: JSON.parse(savedUser) });
        }
    },
}));

export default useAuthStore;
