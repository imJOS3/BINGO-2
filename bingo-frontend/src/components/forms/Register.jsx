import { useState } from 'react';
import axios from 'axios';

const Register = () => {
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
            const response = await axios.post('http://localhost:3000/api/register', {
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
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Registrar Usuario</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo de nombre de usuario */}
                <div>
                    <label className="block mb-1 font-bold">Nombre de usuario</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                {/* Campo de email */}
                <div>
                    <label className="block mb-1 font-bold">Correo electrónico</label>
                    <input 
                        type="email" 
                        className="w-full p-2 border border-gray-300 rounded" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Campo de contraseña */}
                <div>
                    <label className="block mb-1 font-bold">Contraseña</label>
                    <input 
                        type="password" 
                        className="w-full p-2 border border-gray-300 rounded" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Botón de registro */}
                <button 
                    type="submit" 
                    className="bg-blue-500 text-white p-2 rounded w-full"
                >
                    Registrarse
                </button>

                {/* Mostrar éxito o error */}
                {success && <p className="text-green-500 mt-4">{success}</p>}
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </form>
        </div>
    );
};

export default Register;
