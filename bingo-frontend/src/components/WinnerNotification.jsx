import { useEffect } from 'preact/hooks';

const WinnerNotification = ({ winner, setWinner }) => {
  useEffect(() => {
    const timeout = setTimeout(() => setWinner(null), 5000);
    return () => clearTimeout(timeout);
  }, [winner]);

  return (
    <div class="winner-notification">
      <div id="winner-message">¡Felicidades {winner.name}! Has ganado.</div>
    </div>
  );
};

export default WinnerNotification;
