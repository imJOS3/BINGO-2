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
            isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
        ></div>

        {/* Contenedor del menú */}
        <div
          ref={wrapperRef}
          className={`fixed top-0 left-0 w-64 h-full bg-gray-800 text-white shadow-lg z-20 p-4 transform transition-transform duration-300 ${
            isTransitioning ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">Opciones</h2>

           <LeaveGame />    
          <button
            onClick={toggleMute}
            className={`text-left w-full p-3 rounded-lg transition ${
              isMuted ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isMuted ? "Reactivar Sonido" : "Silenciar Música"}
          </button>

          <button
            onClick={viewProfile}
            className="text-left w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
          >
            Ver Perfil
          </button>
        </div>
      </>
    )
  );
}
