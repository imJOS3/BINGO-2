import Ball from "./ball";
import Portal from "./portal";
import TubeBall from "./tubeBall";

export default function WrapperStructureBall (){

    return(

        <div className="relative h-full flex flex-col ">
            <div className="">
                <Portal />
            </div>
            <div className="flex flex-col grow w-full h-full justify-end items-center">
                <Ball />
                <Ball />
                <Ball />

            </div>
            <div className="">
                <TubeBall />
            </div>
           

            <div className="flex items-end">
                <Portal />
            </div>
        </div>

    );
}