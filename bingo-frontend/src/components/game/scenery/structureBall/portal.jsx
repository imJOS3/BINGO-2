import { motion } from "framer-motion";

export default function Portal({ isOpen }) {
  return (
    <motion.div
      initial={{ scaleY: 0 }}
      animate={{ scaleY: isOpen ? 1 : 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="flex items-center justify-center overflow-hidden"
    >
      <div className="w-24 md:w-32 h-[80px] md:h-6 rounded-full border-4 md:border-8 border-green-500 bg-green-300 opacity-50">
      </div>
    </motion.div>
  );
}
