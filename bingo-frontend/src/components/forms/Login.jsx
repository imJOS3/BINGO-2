import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/login', { email, password });
            onLogin(response.data.token);
            setSuccess('¡Inicio de sesión exitoso!');
            
            // Redirige a la página de juegos de bingo
            setTimeout(() => route('/games'), 1000); // Espera un segundo para mostrar el mensaje
        } catch (err) {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md">
            <h2 className="text-xl font-bold mb-4">Iniciar Sesión</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                Iniciar Sesión
            </button>
        </form>
    );
};

export default Login;
