
const PlayerTable = ({ players, setPlayers }) => {
  const removePlayer = (index) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
  };

  const refreshCard = (index) => {
    const updatedPlayers = players.map((player, i) => 
      i === index ? { ...player, card: Math.floor(Math.random() * 10000) } : player
    );
    setPlayers(updatedPlayers);
  };

  return (
    <div class="table">
      <h2>Jugadores en Línea</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cartón</th>
            <th>IP</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={index}>
              <td>{player.name}</td>
              <td>{player.card}</td>
              <td>{player.ip}</td>
              <td>
                <button onClick={() => refreshCard(index)}>🔄</button>
                <button onClick={() => removePlayer(index)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
