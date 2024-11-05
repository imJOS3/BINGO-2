export default function Portal() {
  return (
    <div className="flex items-center">
      <div className="w-[20px] md:w-[30px] h-[80px] md:h-[100px] rounded-full border-4 md:border-8 border-green-500 animate-pulse">
        <div className="w-full h-full rounded-full bg-green-300 opacity-50"></div>
      </div>
    </div>
  );
}
