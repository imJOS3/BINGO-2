import { useState } from 'preact/hooks';
import BingoCardPlaying from "../../components/game/scenery/cardBingo/BIngoCArdPlaying";
import Chronometer from "../../components/game/scenery/chronometer/chronometer";
import ContexChronometer from "../../components/game/scenery/chronometer/contexChronometer";
import GameMode from "../../components/game/scenery/gameData/gameMode";
import WrapperStructureBall from "../../components/game/scenery/structureBall/wrapperStructureBall";
import SettingIcon from '../../assets/imgs/Setting.svg';
import WrapperSetting from '../../components/game/scenery/setting/wrapperSetting';
import Chat from '../../components/chat/chat';

export default function Playing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);  // Controlar si el chat está abierto

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen); // Alternar el estado del chat
  };

  return (
    <div className="flex w-screen h-full items-center justify-between">
      <div className="h-full p-6 flex flex-col gap-4 justify-between">
        <GameMode />
        <div className="flex flex-col gap-5">
          <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200">
            Jugadores
          </button>
          <button className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-200">
            Ganadores
          </button>
        </div>
        
        {/* Icono de configuración */}
        <div>
          <img 
            src={SettingIcon} 
            alt="Configuración" 
            className="h-32 w-32 cursor-pointer hover:rotate-45 transition-transform duration-300"
            onClick={toggleMenu}
          />
        </div>
      </div>

      {/* Componente de menú de configuración */}
      <WrapperSetting isOpen={isMenuOpen} onClose={toggleMenu} />

      <div className="flex flex-col items-center">
        <div className="flex border-s border-e border-t border-gray-900 w-full gap-4 items-center justify-center bg-purple-200 p-4 rounded-lg shadow-lg">
          <ContexChronometer />
          <Chronometer /> 
        </div>
        <BingoCardPlaying />
      </div>
      
      <div className="flex flex-col mr-20 w-min h-full">
        <WrapperStructureBall />
      </div>

      {/* Botón flotante para abrir el chat */}
      <div 
        className="fixed top-4 right-4 bg-blue-600 p-4 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all duration-200"
        onClick={toggleChat}
      >
        <span className=" text-white text-xl">💬</span>
      </div>

      {/* Componente del chat */}
      {isChatOpen && (
        <Chat isOpen={isChatOpen} toggleChat={toggleChat} />
      )}
    </div>
  );
}
