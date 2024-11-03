import useBingoCardStore from '../../../../../store/bingoCard';
import { useEffect } from 'react';

export default function BingoCardPlaying() {
    const { selectedCard, loading } = useBingoCardStore();

    // Muestra un mensaje o un componente de carga mientras selectedCard se está cargando
    return (
        <div className="ml-10 flex flex-col items-center gap-4 p-3 overflow-hidden">
            {loading && (
                <div className="text-xl text-gray-600">Cargando carta...</div>
            )}
            {!loading && selectedCard && (
                <div className="grid grid-cols-5 gap-8 p-6 bg-gray-100 rounded-lg shadow-md">
                    {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                        <div key={letter} className="flex flex-col gap-4 items-center">
                            <div className="text-center font-bold text-2xl text-blue-500">{letter}</div>
                            {Array.from({ length: 5 }).map((_, rowIndex) => {
                                const numbers = selectedCard.numbers[letter] || [];
                                return (
                                    <div
                                        key={`${letter}-${rowIndex}`}
                                        className="w-16 h-16 flex items-center justify-center bg-white border border-gray-300 text-gray-800 rounded-md shadow-sm text-xl font-semibold"
                                    >
                                        {letter === 'N' && rowIndex === 2 ? (
                                            <span></span>
                                        ) : (
                                            numbers[rowIndex] || ''
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
            {!loading && !selectedCard && (
                <div className="text-xl text-gray-600">No hay cartas disponibles.</div>
            )}
        </div>
    );
}
