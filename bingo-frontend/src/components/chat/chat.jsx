import { useEffect, useState } from 'preact/hooks';
import { io } from 'socket.io-client';

const Chat = ({ isOpen, toggleChat }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!isOpen) return; // Evita conexiones innecesarias si el chat está cerrado

    // Usar wss:// para conexiones seguras cuando el servidor usa HTTPS
    const newSocket = io(process.env.VITE_API_URL.replace(/^http/, 'wss'));
    setSocket(newSocket);

    newSocket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => newSocket.close();
  }, [isOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input && socket) {
      socket.emit('chat message', input);
      setInput('');
    }
  };

  if (!isOpen) return null; // No renderizar si está cerrado

  return (
    <div
      className="fixed bottom-0 z-50 right-0 w-1/3 h-1/2 p-4 backdrop-blur-sm bg-transparent border border-gray-300 rounded-lg shadow-lg flex flex-col"
      style={{ zIndex: 1000 }}
    >
      {/* Botón para cerrar */}
      <button
        onClick={toggleChat}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        aria-label="Cerrar chat"
      >
        ✖
      </button>

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {messages.map((msg, index) => (
            <li key={index} className="p-2 bg-blue-500/70 text-white rounded-md">
              {msg}
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          className="flex-1 p-2 border-none outline-none rounded-l-lg bg-white/50"
          value={input}
          onInput={(e) => setInput(e.target.value)}
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
