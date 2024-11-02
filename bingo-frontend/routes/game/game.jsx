import BingoGame from "../../src/components/homeBingoGame";

export default function game({userInfo}){

    return(
        <BingoGame userInfo={userInfo} />
    );
}