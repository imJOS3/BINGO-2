export default function ContextChronometer({ contextText="Termina en:" }) {
    return (
      <div className="flex items-center justify-center text-center bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl shadow-2xl">
        <span className="text-2xl font-extrabold text-white tracking-wide">{contextText}</span>
      </div>
    );
  }
  
  