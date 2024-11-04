import { useState } from 'preact/hooks';
import Login from './Login';
import Register from './Register';

export default function FormWrapper() {
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className="flex flex-col h-[80vh] w-[35vw] overflow-hidden">
            {/* Contenedor de formularios con animaciones de entrada */}
            <div className="relative w-full h-full">
                {/* Login Form */}
                <div className={`absolute top-0 w-full h-full transition-transform duration-500 ease-in-out transform ${showLogin ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
                    <Login setShowLogin={setShowLogin} />
                </div>

                {/* Register Form */}
                <div className={`absolute top-0 w-full h-full transition-transform duration-500 ease-in-out transform ${showLogin ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
                    <Register setShowLogin={setShowLogin} />
                </div>
            </div>
        </div>
    );
}
