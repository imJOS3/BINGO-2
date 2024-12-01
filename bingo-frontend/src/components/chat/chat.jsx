import { useEffect, useState } from 'preact/hooks';
import { io } from 'socket.io-client';

const Chat = ({ isOpen, toggleChat }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Evitar conexión innecesaria si el chat no está abierto
    if (!isOpen) return;

    // Usar WebSockets seguros (wss://) si el backend está usando HTTPS
    const socketUrl = process.env.VITE_API_URL.replace(/^http/, 'wss');
    const newSocket = io(socketUrl);

    setSocket(newSocket);
    // Guardar la instancia de socket

    // Escuchar los mensajes del servidor
    newSocket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup: Cerrar la conexión cuando el componente se desmonte
    return () => {
      newSocket.close();
    };
  }, [isOpen]); // Solo ejecutar cuando el estado de `isOpen` cambia

  // Manejar el envío del mensaje
  const sendMessage = (e) => {
    e.preventDefault();
    if (input && socket) {
      socket.emit('chat message', input); // Enviar el mensaje al servidor
      setInput(''); // Limpiar el campo de entrada
    }
  };

  // Si el chat está cerrado, no renderizar nada
  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-0 right-0 w-1/3 h-1/2 p-4 backdrop-blur-sm bg-transparent border border-gray-300 rounded-lg shadow-lg flex flex-col"
      style={{ zIndex: 1000 }}
    >
      {/* Botón para cerrar el chat */}
      <button
        onClick={toggleChat}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        aria-label="Cerrar chat"
      >
        ✖
      </button>

      {/* Mostrar los mensajes */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {messages.map((msg, index) => (
            <li key={index} className="p-2 bg-blue-500/70 text-white rounded-md">
              {msg}
            </li>
          ))}
        </ul>
      </div>

      {/* Formulario para enviar mensajes */}
      <form onSubmit={sendMessage} className="flex">
        <input
          className="flex-1 p-2 border-none outline-none rounded-l-lg bg-white/50"
          value={input}
          onInput={(e) => setInput(e.target.value)} // Manejar el input
          placeholder="Escribe un mensaje..."
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-r-lg"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default Chat;
