import { motion } from 'framer-motion';
import Base from './base';
import Portal from './portal';

export default function Balls() {
  return (
    <div className='flex h-full w-full justify-start items-end mb-[148px] absolute left-0 bottom-0'> {/* Cambiado a absolute y alineado al fondo */}
      <div className='mt-5'> 
        <Portal />
      </div>
      
      <motion.div
        className="relative w-[30px] h-[80px] z-30 flex justify-center items-center"
        initial={{ x: 0, y: 0, rotate: 0 }}
        animate={{
          x: [20, 170, 500, 870], // Mueve la bola a través de la rampa
          y: [10 , 10, 150, 150], // Ajustado para la altura de la bola
          rotate: 860 // Rotación completa mientras se mueve
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {/* Parte roja de la bola */}
        <div className="absolute w-20 h-20 rounded-full bg-red-600"></div>
        
        {/* Parte blanca de la bola con un espacio */}
        <div className="absolute w-12 h-12 bg-white rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-red-600"></div>
        
        {/* Número de la bola */}
        <span className="absolute text-red-600 font-bold text-3xl z-10">1</span>
      </motion.div>
      <Base />
      <div className=' -mb-36'>
        <Portal />
      </div>
    </div>
  );
}
