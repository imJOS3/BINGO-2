const GENERIC = "Algo salió mal. Inténtalo de nuevo.";

/**
 * Mensaje seguro para mostrar en pantalla.
 * Nunca reenvía el texto del servidor (SQL, Sequelize, estados internos, etc.).
 */
export function toUserMessage(error, fallback = GENERIC) {
  if (!error) return fallback;

  const status = error.response?.status;
  const code = error.code || "";
  const raw = typeof error === "string" ? error : String(error.message || "");

  if (
    code === "ERR_NETWORK" ||
    code === "ECONNABORTED" ||
    /network error|failed to fetch|timeout/i.test(raw)
  ) {
    return "No hay conexión. Inténtalo de nuevo.";
  }

  if (status >= 500) return GENERIC;
  if (status === 403) return "No tienes permiso para hacer eso.";
  if (status === 401) return fallback;

  return fallback;
}
