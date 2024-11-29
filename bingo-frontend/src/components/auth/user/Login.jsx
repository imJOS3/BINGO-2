import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import useAuthStore from '../../../../store/authStore';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = ({ setShowLogin }) => {
    const { login, error, loading } = useAuthStore(); // Usamos el store
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        // Verificamos si el usuario ya está autenticado al cargar el componente
        useAuthStore.getState().isAuthenticated();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setSuccess(null); // Reset success message
            return; // Evitamos continuar si los campos están vacíos
        }

        try {
            const response = await login(email, password);
            setSuccess('¡Inicio de sesión exitoso!');
            route('/games');
            setSuccess(null); // Reset success after redirect
        } catch (err) {
            setSuccess(null); // Reset success message
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <form 
                onSubmit={handleSubmit} 
                className="bg-white/70 backdrop-blur-md p-8 rounded-lg shadow-md w-full sm:w-96"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-center mb-4">{success}</p>}
                <div className="mb-4">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-all duration-300"
                    disabled={loading}
                >
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>
                <p className="mt-4 text-center text-gray-600">
                    ¿No estás registrado? 
                    <button 
                        type="button" 
                        onClick={(e) => {
                            e.preventDefault(); 
                            setShowLogin(false); 
                        }} 
                        className="text-blue-500 font-semibold"
                    >
                        Regístrate aquí
                    </button>
                </p>
            </form>
        </div>
    );
};

export default Login;
