// src/components/Chat.jsx
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { io } from 'socket.io-client';

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Conectar al servidor de WebSockets
    const newSocket = io('http://localhost:3000'); // Asegúrate de que esta URL coincida con tu servidor backend
    setSocket(newSocket);

    // Escucha mensajes del servidor
    newSocket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Limpiar al desmontar
    return () => newSocket.close();
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input && socket) {
      socket.emit('chat message', input);
      setInput(''); // Limpia el campo de entrada
    }
  };

  return (
    <div className="flex flex-col h-96 w-80 border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        <ul className="space-y-2">
          {messages.map((msg, index) => (
            <li key={index} className="p-2 bg-blue-200 rounded-md">{msg}</li>
          ))}
        </ul>
      </div>
      <form onSubmit={sendMessage} className="flex border-t border-gray-300">
        <input
          className="flex-1 p-2 border-none outline-none"
          value={input}
          onInput={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button type="submit" className="p-2 bg-blue-500 text-white hover:bg-blue-600">Enviar</button>
      </form>
    </div>
  );
};

export default Chat;
