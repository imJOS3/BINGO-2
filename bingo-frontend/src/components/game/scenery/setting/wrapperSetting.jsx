import { useState, useEffect, useRef } from 'preact/hooks';
import LeaveGame from './leaveGame';

export default function WrapperSetting({ isOpen, onClose }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(isOpen);
  const wrapperRef = useRef(null);

  // Manejar transiciones al abrir/cerrar el menú
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsTransitioning(true), 10); // Iniciar la animación de apertura
    } else {
      setIsTransitioning(false);
      setTimeout(() => setIsVisible(false), 300); // Terminar la animación de cierre
    }
  }, [isOpen]);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, onClose]);

  const [isMuted, setIsMuted] = useState(false);

  const handleLogout = () => {
    alert("Cerrando sesión...");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    alert(isMuted ? "Sonido activado" : "Sonido silenciado");
  };

  const viewProfile = () => {
    alert("Viendo perfil...");
  };

  return (
    isVisible && (
      <>
        {/* Overlay oscuro con transparencia */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity duration-300 ${
            isTransitioning ? "opacity-100" : "opacity-0"
          }`}
        ></div>

        {/* Contenedor del menú */}
        <div
          ref={wrapperRef}
          className={`fixed top-0 left-0 w-80 max-w-xs h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white shadow-lg z-20 p-6 transform transition-transform duration-300 ${
            isTransitioning ? "translate-x-0" : "-translate-x-full"
          } flex flex-col gap-4`}
        >
          <h2 className="text-2xl font-bold mb-4 text-center border-b border-gray-600 pb-2">
            Opciones
          </h2>

          <div className="flex flex-col gap-4">
            <LeaveGame />

            <button
              onClick={toggleMute}
              className={`w-full p-3 rounded-lg font-medium text-center transition ${
                isMuted
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isMuted ? "Reactivar Sonido" : "Silenciar Música"}
            </button>

            <button
              onClick={viewProfile}
              className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium text-center transition"
            >
              Ver Perfil
            </button>

            <button
              onClick={handleLogout}
              
              className="w-full p-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 font-medium text-center transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </>
    )
  );
}
