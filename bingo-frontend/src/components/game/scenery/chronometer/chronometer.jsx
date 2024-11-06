import { useState, useEffect } from "preact/hooks";

export default function Chronometer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const secs = String(time % 60).padStart(2, '0');
    return { minutes, secs };
  };

  const { minutes, secs } = formatTime(seconds);

  return (
    <div className="border-black border-2 p-1 rounded relative h-min bg-gray-800">
      {/* boton rojo de arriba del coronometro*/ }
      <div className="absolute -top-1 z-10 right-8 bg-red-500 w-[7%] h-[5%]">

      </div>
      {/* Container para el reloj */}
      <div className="clock-container px-6 flex justify-center items-center text-6xl text-red-500 bg-black rounded-lg shadow-lg">
        <div className="mb-1">
          <span className="digit font-digital">{minutes}</span>
          <span className="digit">:</span>
          <span className="digit font-digital">{secs}</span>
        </div>
        
      </div>

      {/* Doble display con absolute */}
      <div className="clock-container flex justify-center items-center text-6xl  text-red-500 bg-black rounded-lg shadow-lg absolute inset-1 opacity-15">
        <div className="">  
          <span className="digit font-digital">88</span>
          <span className="digit">:</span>
          <span className="digit font-digital">88</span>
        </div>
      </div>
    </div>
  );
}
