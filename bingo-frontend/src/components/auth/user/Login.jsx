import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import useAuthStore from '../../../../store/authStore';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Asegúrate de que Font Awesome esté disponible

const Login = () => {
    const { login } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/login', { email, password });
            login(response.data.token);
            setSuccess('¡Inicio de sesión exitoso!');
            
            setTimeout(() => {
                route('/games');
                setSuccess(null);
            }, 1000);
        } catch (err) {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-20 max-w-md mx-auto p-6 bg-white shadow-2xl rounded-lg transition-all duration-300 ease-in-out">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Iniciar Sesión</h2>
            
            {error && (
                <p className="text-red-500 text-center mb-4 animate-pulse">
                    {error}
                </p>
            )}
            {success && (
                <p className="text-green-500 text-center mb-4 animate-fade-in">
                    {success}
                </p>
            )}

            <div className="flex items-center border border-gray-300 rounded-lg mb-4 overflow-hidden">
                <span className="flex items-center justify-center bg-blue-100 text-blue-500 p-3">
                    <i className="fas fa-envelope"></i> {/* Icono de email */}
                </span>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent p-2 focus:outline-none focus:ring focus:ring-blue-200"
                />
            </div>

            <div className="flex items-center border border-gray-300 rounded-lg mb-4 overflow-hidden">
                <span className="flex items-center justify-center bg-blue-100 text-blue-500 p-3">
                    <i className="fas fa-lock"></i> {/* Icono de candado */}
                </span>
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent p-2 focus:outline-none focus:ring focus:ring-blue-200"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-500 text-white p-3 rounded-lg transition-transform duration-200 transform hover:scale-105 hover:bg-blue-600"
            >
                Iniciar Sesión
            </button>
        </form>
    );
};

export default Login;
