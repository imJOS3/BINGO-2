// /src/store/authStore.js
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

//funcion para decodifcar el token
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
}));

export default useAuthStore;
