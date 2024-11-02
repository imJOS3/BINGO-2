export default function Base(){

    return(


      <div className="flex  mt-20    justify-start">
        {/* Parte izquierda horizontal de la rampa */}
        <div className="w-[200px] z-10 -ml-10 rounded h-[15px] bg-yellow-300 shadow-md-"></div>
        
        {/* Parte inclinada de la rampa */}
        <div className="w-[340px] h-[15px] rounded-lg bg-yellow-300 shadow-md transform rotate-[25deg] origin-top-left"></div>
        
        {/* Parte derecha horizontal de la rampa */}
        <div className="rounded relative h-[15px] w-[440px] bg-yellow-300 shadow-md -ml-11 -bottom-[140px] "></div>
      </div>

    );

}