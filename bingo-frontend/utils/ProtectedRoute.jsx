import { useEffect, useState } from "preact/hooks";
import useAuthStore from "../store/authStore";
import { route } from "preact-router";

// Componente para proteger rutas
export const ProtectedRoute = ({ Component, path }) => {
    const { auth, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        isAuthenticated(); // Verifica si el usuario está autenticado
        setLoading(false); // Cambia el estado de carga a falso
    }, []);

    useEffect(() => {
        if (!loading && !auth) {
            route("/login", true); 
        }
    }, [auth, loading]);

    if (loading) return null; 

    return auth ? <Component path={path} /> : null; // Retorna el componente si está autenticado
};
