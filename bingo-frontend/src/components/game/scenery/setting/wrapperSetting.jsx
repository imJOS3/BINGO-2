import { useState } from "preact/hooks";
import { route } from "preact-router";
import BingoSidebar from "../../../navBar/BingoSidebar";
import LeaveConfirmModal from "./LeaveConfirmModal";
import EditGameModal from "../../create/EditGameModal";
import useUsersGame from "../../../../../store/usersGame";
import useAuthStore from "../../../../../store/authStore";
import useGameStore from "../../../../../store/gameStore";

export default function WrapperSetting({ isOpen, onClose }) {
  const [leavePrompt, setLeavePrompt] = useState(null);
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
  const gameStatus = selectedGame?.game_status || "active";

  const closeLeavePrompt = () => {
    if (loading) return;
    setLeaveError(null);
    setLeavePrompt(null);
  };

  const exitGame = async (path = "/game") => {
    setLeaveError(null);
    try {
      if (selectedGame?.id && userInfo?.id) {
        await leaveGame(selectedGame.id, userInfo.id);
      }
      clearSelectedGame?.();
      closeLeavePrompt();
      onClose();
      route(path);
    } catch (err) {
      console.error(err);
      setLeaveError("No se pudo salir de la partida. Inténtalo de nuevo.");
    }
  };

  const openLeavePrompt = (prompt) => {
    setLeaveError(null);
    setLeavePrompt(prompt);
  };

  const actions = [
    {
      id: "leave",
      label: "Salir de la partida",
      hint: "Pide confirmación antes de irte",
      tone: "danger",
      keepOpen: true,
      onClick: () => openLeavePrompt({ variant: "leave", path: "/game" }),
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
      id: "mesas",
      label: "Ver mesas",
      hint: "Saldrás de la partida actual",
      keepOpen: true,
      onClick: () =>
        openLeavePrompt({
          variant: "navigate",
          path: "/game",
          destinationLabel: "Ver mesas",
        }),
    },
    {
      id: "lobby",
      label: "Lobby",
      hint: "Saldrás de la partida actual",
      keepOpen: true,
      onClick: () =>
        openLeavePrompt({
          variant: "navigate",
          path: "/games",
          destinationLabel: "Lobby",
        }),
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
      {leavePrompt && (
        <LeaveConfirmModal
          gameName={selectedGame?.game_name}
          gameStatus={gameStatus}
          variant={leavePrompt.variant}
          destinationLabel={leavePrompt.destinationLabel}
          loading={loading}
          error={leaveError}
          onCancel={closeLeavePrompt}
          onConfirm={() => exitGame(leavePrompt.path)}
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
