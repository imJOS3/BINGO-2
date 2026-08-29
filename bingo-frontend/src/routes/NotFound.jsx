import { route } from "preact-router";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-r from-blue-400 to-teal-400 overflow-hidden">
      <div className="text-center relative">
        {/* Bolas de bingo flotando alrededor del 404 */}
        <div className="relative w-80 h-80 mb-8 mx-auto">
          {/* Bola 1 - Arriba izquierda */}
          <div 
            className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center font-bold text-white text-lg shadow-lg"
            style={{
              top: '10px',
              left: '20px',
              animation: 'float1 3s ease-in-out infinite'
            }}
          >B</div>

          {/* Bola 2 - Arriba derecha */}
          <div 
            className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center font-bold text-gray-800 text-lg shadow-lg"
            style={{
              top: '20px',
              right: '30px',
              animation: 'float2 3.5s ease-in-out infinite'
            }}
          >I</div>

          {/* Bola 3 - Centro derecha */}
          <div 
            className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center font-bold text-white text-lg shadow-lg"
            style={{
              top: '50%',
              right: '10px',
              transform: 'translateY(-50%)',
              animation: 'float3 3.2s ease-in-out infinite'
            }}
          >N</div>

          {/* Bola 4 - Abajo derecha */}
          <div 
            className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg"
            style={{
              bottom: '20px',
              right: '30px',
              animation: 'float4 3.4s ease-in-out infinite'
            }}
          >G</div>

          {/* Bola 5 - Abajo izquierda */}
          <div 
            className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center font-bold text-white text-lg shadow-lg"
            style={{
              bottom: '10px',
              left: '20px',
              animation: 'float5 3.3s ease-in-out infinite'
            }}
          >O</div>

          {/* Centro con pulsación */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              animation: 'pulse-scale 2s ease-in-out infinite'
            }}
          >
            <h1 className="text-9xl font-bold text-white drop-shadow-lg">404</h1>
          </div>
        </div>

        <p className="text-3xl font-semibold text-white mb-6 drop-shadow-md">
          Página no encontrada
        </p>
        <p className="text-lg text-white mb-8 drop-shadow-md max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <button
          onClick={() => route("/")}
          className="px-8 py-3 bg-white text-blue-500 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Volver al inicio
        </button>
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, 20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 25px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(-50%) translate(0, 0); }
          50% { transform: translateY(-50%) translate(-25px, 0); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, -20px); }
        }
        @keyframes float5 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -25px); }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
}