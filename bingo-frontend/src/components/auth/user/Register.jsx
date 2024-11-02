import { useState } from 'preact/hooks';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Register () {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await axios.post('http://localhost:3000/api/register', {
                nickname: username,
                email,
                password
            });
            setSuccess('Usuario registrado con éxito');
        } catch (err) {
            setError('Error al registrar el usuario');
        }
    };

    return (
        <div className="flex items-center justify-center rounded-2xl mt-10 bg-gray-100">
            <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-semibold mb-6 text-center text-blue-700">Crear una Cuenta</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Campo de nombre de usuario con ícono */}
                    <div className="relative">
                        <label className="block text-gray-700 font-semibold mb-2">Nombre de usuario</label>
                        <div className="flex items-center border h-fu border-gray-300 rounded-lg shadow-sm overflow-hidden">
                            <span className="flex items-center justify-center p-4 bg-blue-100 text-blue-500">
                                <i className="fas fa-user"></i>
                            </span>
                            <input 
                                type="text"
                                placeholder="Nombre de usuario"
                                className="w-full p-3 outline-none focus:bg-blue-50 transition"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Campo de email con ícono */}
                    <div className="relative">
                        <label className="block text-gray-700 font-semibold mb-2">Correo electrónico</label>
                        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                            <span className="flex items-center justify-center p-4 bg-blue-100 text-blue-500">
                                <i className="fas fa-envelope"></i>
                            </span>
                            <input 
                                type="email" 
                                placeholder="Correo electrónico"
                                className="w-full p-3 outline-none focus:bg-blue-50 transition"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Campo de contraseña con ícono */}
                    <div className="relative">
                        <label className="block text-gray-700 font-semibold mb-2">Contraseña</label>
                        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                            <span className="flex items-center justify-center p-4 bg-blue-100 text-blue-500">
                                <i className="fas fa-lock"></i>
                            </span>
                            <input 
                                type="password" 
                                placeholder="Contraseña"
                                className="w-full p-3 outline-none focus:bg-blue-50 transition"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Botón de registro */}
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                    >
                        Registrarse
                    </button>

                    {success && <p className="text-green-600 mt-4 text-center animate-fade-in">{success}</p>}
                    {error && <p className="text-red-600 mt-4 text-center animate-fade-in">{error}</p>}
                </form>
            </div>
        </div>
    );
};


