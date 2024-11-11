import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

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
    }),
    {
        name: 'auth-store',  // Nombre de la clave en localStorage
        getStorage: () => localStorage,  // Usamos localStorage para persistencia
    }
  )
);

export default useAuthStore;
