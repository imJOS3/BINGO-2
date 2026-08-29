import { motion } from "framer-motion";

export default function JoiningOverlay({
  title = "Uniendo a la mesa",
  subtitle = "Preparando tu lugar en la ronda…",
}) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#062820]/75 px-6 text-center backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-white/20 border-t-[var(--bingo-amber)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
      />
      <p className="mt-4 font-bingo text-2xl text-white">{title}</p>
      <p className="mt-1 text-sm font-semibold text-white/75">{subtitle}</p>
    </motion.div>
  );
}
