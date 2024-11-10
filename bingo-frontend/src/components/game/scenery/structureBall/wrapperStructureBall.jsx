import { useEffect, useState } from 'preact/hooks';
import { useCalledNumbersStore } from '../../../../../store/useCalledNumberStore';
import Ball from './ball';
import Portal from './portal';
import TubeBall from './tubeBall';
import { AnimatePresence, motion } from 'framer-motion';

export default function WrapperStructureBall() {
    const { nextNumber, fetchNextNumber } = useCalledNumbersStore();
    const [balls, setBalls] = useState([]);
    const [isPortalOpen, setIsPortalOpen] = useState(false);
    const [isBottomPortalOpen, setIsBottomPortalOpen] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const gameId = 26;
    const maxBalls = 5;

    // Lógica para llamar a un nuevo número cada 5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNextNumber(gameId);
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchNextNumber, gameId]);

    // Actualiza la lista de bolas con animación 
    useEffect(() => {
        if (nextNumber) {
            setIsPortalOpen(true); // Abrir portal superior
            setBalls((prevBalls) => {
                const updatedBalls = [nextNumber, ...prevBalls];
                if (updatedBalls.length > maxBalls) {
                    updatedBalls.pop();
                }
                return updatedBalls;
            });

            // Cerrar portal superior después de 1 segundo
            setTimeout(() => setIsPortalOpen(false), 1000);
        }
    }, [nextNumber]);

    // Aplicar efecto de gravedad cuando se elimina una bola (utima bola)
    const handleRemoveBall = () => {
        if (balls.length > 0) {
            setIsBottomPortalOpen(true);
            setIsReordering(true); // Iniciar animación de reordenamiento para todas las bolas

            setTimeout(() => {
                setBalls((prevBalls) => prevBalls.slice(0, -1)); // Eliminar la última bola
                setTimeout(() => {
                    setIsReordering(false);
                    setIsBottomPortalOpen(false);
                }, 500); // Finalizar animación de caída después de 0.5s
            }, 2500); // Esperar 1 segundo antes de eliminar la bola
        }
    };
 
    // Cada vez que haya 5 bolas, eliminar la última con animación
    useEffect(() => {
        if (balls.length === maxBalls) {
            handleRemoveBall();
        }
    }, [balls]);

    return (
        <div className="relative h-full flex flex-col">
            {/* Portal Superior */}
            <div>
                <Portal isOpen={isPortalOpen} />
            </div>
            {/* Pelotas dentro del tubo */}
            <div className="flex flex-col grow w-full h-full justify-end items-center overflow-hidden">
                <TubeBall />
                <AnimatePresence>
                    {balls.map((ball, index) => (
                        <motion.div
                            key={ball.number}
                            initial={{ y: isReordering ? -50 : 0 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100, opacity: 0 }} // Animación de caída al salir
                            transition={{
                                duration: isReordering ? 0.3 : 0.2,
                                ease: "easeOut",
                            }}
                        >
                            <Ball
                                letter={ball.letter}
                                number={ball.number}
                                index={index}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            {/* Portal Inferior */}
            <div className="flex items-end">
                <Portal isOpen={isBottomPortalOpen} />
            </div>
        </div>
    );
}
