

// Guardar el token en el almacenamiento local
export const setToken = (token) => {
    localStorage.setItem('authToken', token);
};

// Obtener el token del almacenamiento local
export const getToken = () => {
    return localStorage.getItem('authToken');
};

// Eliminar el token del almacenamiento local
export const clearToken = () => {
    localStorage.removeItem('authToken');
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
    return !!getToken();
};
