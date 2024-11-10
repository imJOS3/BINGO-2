import { motion } from "framer-motion";

export default function Ball({ letter, number, index, isExiting }) {
  return (
    <motion.div
      initial={{ y: -200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={isExiting ? { y: 500, opacity: 0, scale: 1.2 } : { y: 200, opacity: 0 }} // Gravedad simulada
      transition={{
        type: "spring",
        stiffness: 100,
        delay: index * 0.1,
        duration: isExiting ? 0.6 : 0.4, // Duración más rápida al salir
        ease: isExiting ? "easeIn" : "easeOut",
      }}
      className="flex flex-col items-center justify-center w-24 h-24 bg-blue-500 text-white rounded-full shadow-md"
    >
      <span className="text-lg font-bold">{letter}</span>
      <span className="text-xl font-semibold">{number}</span>
    </motion.div>
  );
}
