import { useState } from "preact/hooks";
 import axios from "axios";

const CallNumber = ({ gameId }) => {
  const [numberCalled, setNumberCalled] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callNextNumber = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:3000/api/call-number`,
        { game_id: gameId }
      );
      setNumberCalled(response.data.number_called); // Suponiendo que la respuesta tiene el número llamado
    } catch (err) {
      setError("Error al llamar el número");
    } finally {
    }
    setLoading(false);
  };

  return (
    <div className="mt-4">
      <button
        onClick={callNextNumber}
        className="bg-green-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Llamando..." : "Llamar Siguiente Número"}
      </button>

      {error && <p className="text-red-500">{error}</p>}
      {numberCalled && (
        <p className="text-xl mt-4">Número Llamado: {numberCalled}</p>
      )}
    </div>
  );
};

export default CallNumber;
