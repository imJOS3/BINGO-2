
export default function Base() {
  return (
    <div className="flex mt-20 justify-start relative"> {/* Agregado `relative` */}
      {/* Parte izquierda horizontal de la rampa */}
      <div className="w-[150px]  md:w-[200px] h-[10px] z-10 md:h-[15px] rounded-s bg-yellow-300 shadow-md -ml-4 md:-ml-10"></div>
      
      {/* Parte inclinada de la rampa */}
      <div className="w-[252px] md:w-[340px] h-[10px] md:h-[15px] rounded -lg bg-yellow-300 shadow-md transform rotate-[25deg] origin-top-left"></div>
      
      {/* Parte derecha horizontal de la rampa */}
      <div className="h-[10px] md:h-[15px] w-[300px] md:w-[440px] bg-yellow-300 shadow-md rounded-e -ml-7 md:-ml-11 relative -bottom-[105px] md:-bottom-[141px]"></div>
    </div>
  );
}
