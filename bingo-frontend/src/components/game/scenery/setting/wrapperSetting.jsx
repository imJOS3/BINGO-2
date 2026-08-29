import { useState } from "preact/hooks";
import { route } from "preact-router";
import BingoSidebar from "../../../navBar/BingoSidebar";
import LeaveConfirmModal from "./LeaveConfirmModal";
import EditGameModal from "../../create/EditGameModal";
import useUsersGame from "../../../../../store/usersGame";
import useAuthStore from "../../../../../store/authStore";
import useGameStore from "../../../../../store/gameStore";

export default function WrapperSetting({ isOpen, onClose }) {
  const [muted, setMuted] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [leaveError, setLeaveError] = useState(null);
  const { leaveGame, loading } = useUsersGame();
  const { userInfo } = useAuthStore();
  const { selectedGame, clearSelectedGame } = useGameStore();

  const isHost =
    userInfo?.id != null &&
    selectedGame?.creator_id != null &&
    String(userInfo.id) === String(selectedGame.creator_id);
  const canEdit = isHost && selectedGame?.game_status === "active";

  const handleLeave = async () => {
    setLeaveError(null);
    try {
      if (selectedGame?.id && userInfo?.id) {
        await leaveGame(selectedGame.id, userInfo.id);
      }
      clearSelectedGame?.();
      setShowLeaveConfirm(false);
      onClose();
      route("/game");
    } catch (err) {
      console.error(err);
      setLeaveError("No se pudo salir de la partida. Inténtalo de nuevo.");
    }
  };

  const actions = [
    {
      id: "leave",
      label: "Salir de la partida",
      hint: "Pide confirmación antes de irte",
      tone: "danger",
      keepOpen: true,
      onClick: () => {
        setLeaveError(null);
        setShowLeaveConfirm(true);
      },
    },
    ...(canEdit
      ? [
          {
            id: "configure",
            label: "Configurar mesa",
            hint: "Modo, tiempo, nombre y visibilidad",
            keepOpen: true,
            onClick: () => setShowEdit(true),
          },
        ]
      : []),
    {
      id: "sound",
      label: muted ? "Activar sonido" : "Silenciar",
      hint: muted ? "El audio está apagado" : "El audio está encendido",
      tone: "accent",
      keepOpen: true,
      onClick: () => setMuted((v) => !v),
    },
    {
      id: "mesas",
      label: "Ver mesas",
      hint: "Lista de partidas",
      onClick: () => {
        onClose();
        route("/game");
      },
    },
    {
      id: "lobby",
      label: "Lobby",
      hint: "Pantalla de inicio del juego",
      onClick: () => {
        onClose();
        route("/games");
      },
    },
  ];

  return (
    <>
      <BingoSidebar
        isOpen={isOpen}
        onClose={onClose}
        title="Opciones"
        subtitle="En partida"
        actions={actions}
      />
      {showLeaveConfirm && (
        <LeaveConfirmModal
          gameName={selectedGame?.game_name}
          loading={loading}
          error={leaveError}
          onCancel={() => setShowLeaveConfirm(false)}
          onConfirm={handleLeave}
        />
      )}
      {showEdit && selectedGame && (
        <EditGameModal
          game={selectedGame}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
