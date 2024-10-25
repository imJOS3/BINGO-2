import { Link } from 'preact-router';

const NavBar = ({ isAuthenticated, onLogout }) => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-white text-2xl font-bold">Bingo Online</h1>
                
                <div className="flex space-x-4">
                    <Link href="/" className="text-white hover:text-gray-300">Inicio</Link>

                    {isAuthenticated ? (
                        <>
                            <Link href="/games" className="text-white hover:text-gray-300">Juegos</Link>
                            <button 
                                onClick={onLogout} 
                                className="text-white hover:text-gray-300"
                            >
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/register" className="text-white hover:text-gray-300">Registrar</Link>
                            <Link href="/login" className="text-white hover:text-gray-300">Login</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
