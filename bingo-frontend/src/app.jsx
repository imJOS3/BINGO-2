import { Router, route } from "preact-router";
import { useEffect, useState } from "preact/hooks";
import useAuthStore from "../store/authStore";
import NavBar from "./components/navBar/NavBar";
import Register from "./routes/regiter/register";
import Home from "./routes/home";
import Game from "./routes/game/game";
import { ProtectedRoute } from "../utils/ProtectedRoute";
import GameID from "./routes/game/ID/gameID";
import Playing from "./routes/playing/playing";
import Games from "./routes/games/games";

export function App() {
  const { auth, login, logout, isAuthenticated } = useAuthStore();
  const [showNavBar, setShowNavBar] = useState(true);

  useEffect(() => {
    isAuthenticated();
  }, []);

  const handleLogin = (token) => {
    login(token);
    route("/games");
  };

  const handleLogout = () => {
    logout();
    route("/login");
  };

  const handleRouteChange = (e) => {
    const currentPath = e.url;
    // Oculta el NavBar solo en la ruta `/playing/:id`
    setShowNavBar(!currentPath.startsWith("/playing/"));
  };

  return (
    <div className="h-screen overflow-x-hidden bg-gradient-to-r from-blue-400 to-teal-400 flex flex-col">
      {showNavBar && <NavBar isAuthenticated={auth} onLogout={handleLogout} />}
      <main className="flex-1 mx-auto">
        <Router onChange={handleRouteChange}>
          <Home path="/" />
          <Register path="/login" onLogin={handleLogin} />
          <ProtectedRoute Component={Game} path="/games" />
          <ProtectedRoute Component={Games} path="/game" />
          <ProtectedRoute Component={GameID} path="/game/:id" />
          <ProtectedRoute Component={Playing} path="/playing/:id" />
        </Router>
      </main>
    </div>
  );
}
