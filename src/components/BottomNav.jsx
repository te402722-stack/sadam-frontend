import { FaHome, FaCalendarAlt, FaHeart, FaUser } from "react-icons/fa";

const botones = [
  { nombre: "inicio", icono: FaHome, label: "Inicio" },
  { nombre: "calendario", icono: FaCalendarAlt, label: "Calendario" },
  { nombre: "autoCuidado", icono: FaHeart, label: "Autocuidado" },
  { nombre: "yo", icono: FaUser, label: "Yo" },
];

function BottomNav({ activo, onSelect }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-inner flex justify-around py-2 z-50">
      {botones.map((boton) => {
        const Icono = boton.icono;
        const esActivo = activo === boton.nombre;

        return (
          <div
            key={boton.nombre}
            onClick={() => onSelect(boton.nombre)}
            className="flex flex-col items-center text-sm cursor-pointer relative transition-all duration-300"
          >
            <div
              className={`p-2 rounded-full transition-all duration-300 ${
                esActivo ? "bg-[#5fbf5a] text-white scale-110 shadow-lg" : "text-gray-500"
              }`}
            >
              <Icono size={20} />
            </div>
            <span
              className={`mt-1 text-xs font-semibold transition-colors duration-300 ${
                esActivo ? "text-[#5fbf5a]" : "text-gray-500"
              }`}
            >
              {boton.label}
            </span>
          </div>
        );
      })}

      {/* Indicador animado debajo del icono activo */}
      <div
        className="absolute bottom-0 h-1 bg-[#5fbf5a] rounded-full transition-all duration-300"
        style={{
          width: `${100 / botones.length}%`,
          left: `${botones.findIndex(b => b.nombre === activo) * (100 / botones.length)}%`,
        }}
      />
    </div>
  );
}

export default BottomNav;