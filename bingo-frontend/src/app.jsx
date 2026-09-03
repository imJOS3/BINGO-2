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
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./routes/NotFound";


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
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* {showNavBar && <NavBar isAuthenticated={auth} onLogout={handleLogout} />} */}
      <main className={`min-h-0 flex-1 overflow-x-hidden ${showNavBar ? "overflow-y-auto" : "overflow-hidden"}`}>
        <Router onChange={handleRouteChange}>
          <Home path="/" />
          <Register path="/login" onLogin={handleLogin} />
          <Terms path="/terms" />
          <Privacy path="/privacy" />
          <ProtectedRoute Component={Game} path="/games" />
          <ProtectedRoute Component={Games} path="/game" />
          <ProtectedRoute Component={GameID} path="/game/:id" />
          <ProtectedRoute Component={Playing} path="/playing/:id" />
          <NotFound default />
        </Router>
      </main>
    </div>
  );
}
