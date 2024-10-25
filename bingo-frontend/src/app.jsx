import { Router } from 'preact-router';
import { useState, useEffect } from 'preact/hooks';
import NavBar from './components/navBar/NavBar';
import Register from './components/forms/Register';
import Login from './components/forms/Login';
import BingoGame from './components/game/bingoGame';
import { setToken, getToken, clearToken, isAuthenticated } from '../utils/auth';

export function App(){
    const [auth, setAuth] = useState(isAuthenticated());

    useEffect(() => {
        setAuth(isAuthenticated());
    }, []);

    const handleLogin = (token) => {
        setToken(token);
        setAuth(true);
    };

    const handleLogout = () => {
        clearToken();
        setAuth(false);
    };

    return (
        <div>
            <NavBar isAuthenticated={auth} onLogout={handleLogout} />
            <main className="p-4">
                <Router>
                    <Register path="/register" />
                    <Login path="/login" onLogin={handleLogin} />
                    {auth ? (
                        <BingoGame path="/games" />
                    ) : (
                        <Login path="/games" onLogin={handleLogin} />
                    )}
                    <h1 path="/">Bienvenido a Bingo Online</h1>
                </Router>
            </main>
        </div>
    );
};


