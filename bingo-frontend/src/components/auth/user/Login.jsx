import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import useAuthStore from '../../../../store/authStore';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = ({ setShowLogin }) => {
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
            route('/games');
            setSuccess(null);
        } catch (err) {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-10 p-6 bg-white shadow-md rounded-lg transition-all duration-300 ease-in-out">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Iniciar Sesión</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {success && <p className="text-green-500 text-center mb-4">{success}</p>}
            <div className="mb-4">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-md" />
            </div>
            <div className="mb-4">
                <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-md" />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-lg">Iniciar Sesión</button>
            <p className="mt-4 text-center">
                ¿No estás registrado? 
                <button 
                    type="button" // Cambiado a button para evitar submit
                    onClick={(e) => {
                        e.preventDefault(); // Evitar el submit
                        setShowLogin(false); // Cambiar al formulario de registro
                    }} 
                    className="text-blue-500"
                >
                    Regístrate aquí
                </button>
            </p>
        </form>
    );
};

export default Login;
