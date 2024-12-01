import { useState, useEffect } from "preact/hooks";
import useGameStore from "../../../../../store/gameStore";

export default function Chronometer() {
  const { selectedGame } = useGameStore(); // Acceder al juego seleccionado desde el store
  const [seconds, setSeconds] = useState(selectedGame?.game_time * 60 || 0); // Convertir minutos a segundos

  useEffect(() => {
    // Configurar un intervalo para decrementar los segundos
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 0) {
          return prev - 1; // Restar un segundo
        } else {
          clearInterval(interval); // Detener el cronómetro cuando llegue a 0
          return 0;
        }
      });
    }, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []); // Se ejecuta una vez al montar

  useEffect(() => {
    // Actualiza los segundos si `selectedGame` cambia
    if (selectedGame?.game_time !== undefined) {
      setSeconds(selectedGame.game_time * 60); // Convertir minutos a segundos
    }
  }, [selectedGame]);

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const secs = String(time % 60).padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  return (
    <div className="border-black border-2 p-1 rounded relative h-min bg-gray-800">
      <div className="absolute -top-1 z-10 right-8 bg-red-500 w-[7%] h-[5%]"></div>
      <div className="clock-container px-6 flex justify-center items-center text-6xl text-red-500 bg-black rounded-lg shadow-lg">
        <div className="mb-1">
          <span className="digit font-digital">{formatTime(seconds)}</span>
        </div>
      </div>
      <div className="clock-container flex justify-center items-center text-6xl text-red-500 bg-black rounded-lg shadow-lg absolute inset-1 opacity-15">
        <div>
          <span className="digit font-digital">88:88</span>
        </div>
      </div>
    </div>
  );
}
