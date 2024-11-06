import BingoGame from "../../components/homeBingoGame";

export default function game({userInfo}){

    return(
        <BingoGame userInfo={userInfo} />
    );
}