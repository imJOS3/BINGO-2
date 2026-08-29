import { useEffect, useState } from "preact/hooks";
import useAuthStore from "../store/authStore";
import { route } from "preact-router";

/**
 * Requiere una sesión (cuenta o invitado).
 * El login formal es opcional: basta con entrar como invitado desde la home.
 */
export const ProtectedRoute = ({ Component, ...rest }) => {
  const { auth, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isAuthenticated();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !auth) {
      route("/", true);
    }
  }, [auth, loading]);

  if (loading) return null;

  return auth ? (
    <div className="h-full min-h-0 overflow-hidden">
      <Component {...rest} />
    </div>
  ) : null;
};
