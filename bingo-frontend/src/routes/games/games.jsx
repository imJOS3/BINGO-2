import { useState } from "preact/hooks";
import FormSearchGame from "../../components/game/searchGame/formSearchGame";
import TableGames from "../../components/game/seeGames/tableGame";
import CreateGameModal from "../../components/game/create/CreateGameModal";


export default function Games() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <div className="flex justify-between items-center p-4">
                <h1 className="text-2xl font-bold">Games</h1>
                <button
                    onClick={openModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Create
                </button>
            </div>
            <FormSearchGame />
            <TableGames />
            {isModalOpen && <CreateGameModal onClose={closeModal} />}
        </>
    );
}
