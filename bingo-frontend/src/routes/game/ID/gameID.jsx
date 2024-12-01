import { useState, useEffect } from 'preact/hooks';
import GameData from "../../../components/game/seeGames/InGameData/GameData";
import Chat from '../../../components/chat/chat';
import WrapperSetting from '../../../components/game/scenery/setting/wrapperSetting';
import SettingIcon from '../../../assets/imgs/Setting.svg';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL); // Conexión con el servidor WebSocket

export default function GameID() {
    const [isChatOpen, setIsChatOpen] = useState(false); // Controlar si el chat está abierto
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Controlar si el menú de configuración está abierto
    const [notifications, setNotifications] = useState([]); // Estado para las notificaciones

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        // Escuchar notificaciones desde el servidor
        socket.on('notification', (notification) => {
            const id = Date.now(); // Crear un ID único para la notificación
            setNotifications((prev) => [...prev, { ...notification, id }]);

            // Eliminar notificación automáticamente después de 10 segundos
            setTimeout(() => {
                setNotifications((prev) => prev.filter((notif) => notif.id !== id));
            }, 10000);
        });

        // Limpiar socket cuando el componente se desmonta
        return () => {
            socket.off('notification');
        };
    }, []);

    const closeNotification = (id) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    };

    return (
            <div className="">
        <div className="relative ">
            {/* Contenido principal */}
                <GameData />
            </div>

            {/* Botón flotante para abrir el chat */}
            <div
                className="fixed bottom-4 right-4 bg-blue-600 p-4 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all duration-200"
                onClick={toggleChat}
            >
                <span className="text-white text-xl">💬</span>
            </div>

            {/* Componente del chat */}
            {isChatOpen && <Chat isOpen={isChatOpen} toggleChat={toggleChat} />}

            {/* Icono flotante para abrir el menú de configuración */}
            <div
                className="fixed bottom-4 left-4 cursor-pointer"
                onClick={toggleMenu}
            >
                <img
                    src={SettingIcon}
                    alt="Configuración"
                    className="h-16 w-16 hover:rotate-45 transition-transform duration-300"
                />
            </div>

            {/* Menú de configuración */}
            <WrapperSetting isOpen={isMenuOpen} onClose={toggleMenu} />

            {/* Notificaciones en la esquina superior derecha */}
            <div className="fixed top-4 right-4 space-y-2">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className="flex items-center justify-between p-4 bg-blue-500 text-white rounded-lg shadow-lg animate-slide-in"
                    >
                        <p>{notif.message}</p>
                        <button
                            onClick={() => closeNotification(notif.id)}
                            className="ml-4 text-white hover:text-red-200"
                        >
                            ✖
                        </button>
                    </div>
                ))}
            </div>
        </div>

    );
}
