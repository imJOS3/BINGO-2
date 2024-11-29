import { useState } from 'preact/hooks';
import useAuthStore from '../../../../store/authStore';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Register({ setShowLogin }) { 
    const { register, error, loading } = useAuthStore(); // Usamos el store
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(null);

        if (!username || !email || !password) {
            setSuccess(null);
            setError('Por favor, completa todos los campos.');
            return;
        }

        try {
            const response = await register(username, email, password);
            setSuccess('¡Usuario creado correctamente! Ahora puedes iniciar sesión.');
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (err) {
            console.error('Error al registrar usuario:', err.message);
            setSuccess(null); // Reset success message on error
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <form 
                onSubmit={handleSubmit} 
                className="bg-white/70 backdrop-blur-md p-8 rounded-lg shadow-md w-full sm:w-96"
            >
                <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">Crear una Cuenta</h1>
                {error && <p className="mb-4 text-red-500 text-center">{error}</p>}
                {success && <p className="mb-4 text-green-500 text-center">{success}</p>}
                <div className="mb-4">
                    <input 
                        type="text" 
                        placeholder="Nombre de usuario" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <input 
                        type="email" 
                        placeholder="Correo electrónico" 
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
                    {loading ? 'Cargando...' : 'Registrarse'}
                </button>
                {success && (
                    <div className="mt-4 text-center">
                        <button 
                            onClick={() => setShowLogin(true)} 
                            type="button" 
                            className="text-blue-500 font-semibold underline"
                        >
                            Inicia sesión aquí
                        </button>
                    </div>
                )}
                <p className="mt-4 text-center text-gray-600">
                    ¿Ya tienes cuenta?  
                    <button 
                        onClick={() => setShowLogin(true)} 
                        type="button" 
                        className="text-blue-500 font-semibold"
                    >
                        Inicia sesión aquí
                    </button>
                </p>
            </form>
        </div>
    );
}
