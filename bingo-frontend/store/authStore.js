
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

// Función para decodificar el token
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
    
    // Método para iniciar sesión
    login: (token) => {
        localStorage.setItem('authToken', token);
        const decoded = decodeToken(token);
        set({ auth: true, userInfo: decoded });
    },

    // Método para cerrar sesión
    logout: () => {
        localStorage.removeItem('authToken');
        set({ auth: false, userInfo: null });
    },

    // Método para verificar si está autenticado
    isAuthenticated: () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decoded = decodeToken(token);
            set({ auth: true, userInfo: decoded });
        } else {
            set({ auth: false, userInfo: null });
        }
    },

    // Nuevo método para actualizar `userInfo`
    setUserInfo: (newUserInfo) => set({ userInfo: newUserInfo }),
}));

export default useAuthStore;
