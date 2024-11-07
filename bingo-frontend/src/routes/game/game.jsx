import BingoGame from "../../components/game/homeBingoGame";

export default function game({userInfo}){

    return(
        <BingoGame userInfo={userInfo} />
    );
}