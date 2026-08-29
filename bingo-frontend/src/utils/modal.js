/**
 * Handler para el fondo de un modal: cierra solo si el clic cae en el propio
 * backdrop y no en el panel ni en ninguno de sus hijos.
 */
export function backdropClose(onClose, disabled = false) {
  if (disabled || typeof onClose !== "function") return undefined;
  return (event) => {
    if (event.target !== event.currentTarget) return;
    onClose();
  };
}
