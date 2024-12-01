import { useEffect, useState } from 'preact/hooks';
import { io } from 'socket.io-client';

const Notifications = ({ isOpen, toggleNotifications }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isOpen) return; // Evitar conexiones innecesarias si las notificaciones están cerradas

    // Usar wss:// para conexiones seguras cuando el servidor usa HTTPS
    const socketUrl = process.env.VITE_API_URL.replace(/^http/, 'wss');
    const newSocket = io(socketUrl);

    setSocket(newSocket);

    // Escuchar las notificaciones del servidor
    newSocket.on('notification', (notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    // Cleanup: Cerrar la conexión cuando el componente se desmonte
    return () => {
      newSocket.close();
    };
  }, [isOpen]);

  const handleClose = () => {
    toggleNotifications(false);
  };

  if (!isOpen) return null; // No renderizar si las notificaciones están cerradas

  return (
    <div
      className="fixed top-0 right-0 w-1/4 h-1/2 p-4 backdrop-blur-sm bg-transparent border border-gray-300 rounded-lg shadow-lg flex flex-col space-y-4"
      style={{ zIndex: 1000 }}
    >
      {/* Botón para cerrar las notificaciones */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        aria-label="Cerrar notificaciones"
      >
        ✖
      </button>

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {notifications.map((notification, index) => (
            <li key={index} className="p-2 bg-green-500/70 text-white rounded-md">
              {notification}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;
