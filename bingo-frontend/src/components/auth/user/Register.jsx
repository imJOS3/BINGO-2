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
        setError(null);
        setSuccess(null);

        if (!username || !email || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        try {
            const response = await register(username, email, password);
            console.log('Registro exitoso:', response);
            setSuccess('Usuario registrado con éxito');
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (err) {
            setSuccess(null); // Reset success message on error
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-10 p-6 bg-white shadow-md rounded-lg transition-all duration-300 ease-in-out">
            <h1 className="text-2xl font-semibold mb-6 text-center text-blue-600">Crear una Cuenta</h1>
            {error && <p className="mb-4 text-red-500 text-center">{error}</p>}
            {success && <p className="mb-4 text-green-500 text-center">{success}</p>}
            <div className="mb-4">
                <input 
                    type="text" 
                    placeholder="Nombre de usuario" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="w-full p-3 border rounded-md" 
                    required 
                />
            </div>
            <div className="mb-4">
                <input 
                    type="email" 
                    placeholder="Correo electrónico" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full p-3 border rounded-md" 
                    required 
                />
            </div>
            <div className="mb-4">
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full p-3 border rounded-md" 
                    required 
                />
            </div>
            <button 
                type="submit" 
                className="w-full bg-blue-500 text-white p-3 rounded-lg" 
                disabled={loading}
            >
                Registrarse
            </button>
            <p className="mt-4 text-center">
                ¿Ya tienes cuenta? 
                <button 
                    onClick={() => setShowLogin(true)} 
                    type="button" 
                    className="text-blue-500"
                >
                    Inicia sesión aquí
                </button>
            </p>
        </form>
    );
}
