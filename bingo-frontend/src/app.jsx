// app.jsx
import { Router, route } from "preact-router";
import { useEffect } from "preact/hooks";
import useAuthStore from "../store/authStore"; 
import NavBar from "./components/navBar/NavBar";
import Register from "./components/auth/user/Register";
import Login from "./components/auth/user/Login";
import Home from "../routes/home";
import game from "../routes/game/game";
import { ProtectedRoute } from "../utils/ProtectedRoute";
import TableGames from "./components/game/seeGames/tableGame";
import GameID from "../routes/game/ID/gameID";
import Playing from "../routes/playing/playing";

export function App() {
  const { auth, login, logout, isAuthenticated } = useAuthStore(); 

  useEffect(() => {
    isAuthenticated(); // Verifica si el usuario está autenticado al cargar
  }, []); 

  const handleLogin = (token) => {
    login(token);
    route("/games");
  };

  const handleLogout = () => {
    logout(); 
    route("/login");
  };

  return (
    <div className="h-screen overflow-x-hidden bg-gradient-to-r from-blue-400 to-teal-400 flex flex-col"> {/* Asegura que el contenedor principal ocupe la pantalla completa */}
      <NavBar isAuthenticated={auth} onLogout={handleLogout} />
      <main className="flex-1  mx-auto "> 
        <Router>
          <Home path="/" />
          <Register path="/register" />
          <Login path="/login" onLogin={handleLogin} />
          <ProtectedRoute
            Component={game}
            path="/games"
          />
          <ProtectedRoute
              Component={TableGames}
              path="/game"
          />
          <ProtectedRoute 
            Component={GameID}
            path="game/:id" 
          />
          <ProtectedRoute 
            Component={Playing}
            path="playing/:id" 
          />        
        </Router>
      </main>
    </div>
  );
}
