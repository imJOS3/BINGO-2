import { motion } from 'framer-motion';
import Base from './base';
import Portal from './portal';
import { useEffect, useState } from 'react';

export default function Balls() {
  const [positions, setPositions] = useState({ x: [20, 170, 500, 870], y: [10, 10, 150, 150] });

  useEffect(() => {
    // Define posiciones en función del ancho de la pantalla
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setPositions({ x: [10, 100, 200, 250], y: [5, 5, 80, 80] });
      } else if (width < 1024) {
        setPositions({ x: [20, 150, 400, 700], y: [10, 10, 130, 130] });
      } else {
        setPositions({ x: [20, 170, 500, 870], y: [10, 10, 150, 150] });
      }
    };

    handleResize(); // Configura posiciones iniciales
    window.addEventListener('resize', handleResize); // Actualiza cuando cambia el tamaño de pantalla
    return () => window.removeEventListener('resize', handleResize); // Limpia el evento
  }, []);

  return (
    <div className="flex justify-start items-end relative h-[70vh]">
      <div className="mt-5 mr-4">
        <Portal />
      </div>
      
      <motion.div
        key={JSON.stringify(positions)} // Re-renderiza la animación en cada cambio de posiciones
        className="relative w-[20px] md:w-[30px] h-[60px] md:h-[80px] z-30 flex justify-center items-center"
        initial={{ x: 0, y: 0, rotate: 0 }}
        animate={{
          x: positions.x, // Ajuste dinámico en función del tamaño de pantalla
          y: positions.y,
          rotate: 860
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {/* Parte roja de la bola */}
        <div className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600"></div>
        
        {/* Parte blanca de la bola con un espacio */}
        <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-white rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-red-600"></div>
        
        {/* Número de la bola */}
        <span className="absolute text-red-600 font-bold text-xl md:text-3xl z-10">1</span>
      </motion.div>
      
      <Base />
      
      <div className="-mb-20 md:-mb-36">
        <Portal />
      </div>
    </div>
  );
}
