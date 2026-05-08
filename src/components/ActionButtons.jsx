import { useState } from "react";
import { FaHome, FaUser, FaArrowLeft } from "react-icons/fa";

function AutoCuidado({ onBack }) {
  const [pantalla, setPantalla] = useState("autocuidado");
  const [animo, setAnimo] = useState(null);
  const [nota, setNota] = useState("");
  const [historial, setHistorial] = useState([
    { fecha: "2026-03-01", animo: "😊", nota: "Buen día" },
    { fecha: "2026-03-02", animo: "😐", nota: "Un poco cansada" },
  ]);

  const consejos = [
    "Recuerda beber agua durante el día 💧",
    "Tómate un momento para respirar profundo 🌿",
    "Camina unos pasos para mantenerte activo 🚶",
  ];
  const consejoHoy = consejos[Math.floor(Math.random() * consejos.length)];

  const handleGuardar = () => {
    if (!animo) return alert("Selecciona tu estado de ánimo 😊😐😟");
    const hoy = new Date().toLocaleDateString("en-CA")
    setHistorial([...historial, { fecha: hoy, animo, nota }]);
    alert("¡Registro guardado! 😊");
    setAnimo(null);
    setNota("");
  };

  const resumenSemanal = historial.slice(-7);
  const animoPromedio = resumenSemanal.reduce(
    (acc, item) => {
      if (item.animo === "😊") acc.feliz++;
      if (item.animo === "😐") acc.neutro++;
      if (item.animo === "😟") acc.triste++;
      return acc;
    },
    { feliz: 0, neutro: 0, triste: 0 }
  );

  const botones = [
    { key: "inicio", nombre: "Inicio", icon: FaHome, onClick: onBack },
    { key: "yo", nombre: "Yo", icon: FaUser, onClick: () => alert("Ir a Yo") },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#f4f9f4] to-[#eef5ff]">
      {/* Encabezado */}
      <div className="flex items-center w-full p-4 bg-white shadow-md mb-4">
        <button onClick={onBack} className="mr-4 text-gray-600 hover:text-blue-600">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Autocuidado</h1>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        {/* Reflexión diaria */}
        <div className="p-4 bg-blue-100 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">¿Cómo te sientes hoy?</h2>
          <div className="flex justify-around mt-2">
            {["😊", "😐", "😟"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setAnimo(emoji)}
                className={`text-3xl p-4 rounded-full border-2 ${
                  animo === emoji ? "border-blue-500 scale-110" : "border-gray-300"
                } transition-transform duration-200`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Nota opcional */}
        <div className="p-4 bg-green-100 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">¿Algo que quieras compartir?</h2>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Escribe aquí..."
            className="w-full p-2 rounded border border-gray-300 text-lg"
            rows={3}
          />
        </div>

        {/* Consejo diario */}
        <div className="p-4 bg-yellow-100 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Consejo de hoy</h2>
          <p className="text-lg">{consejoHoy}</p>
        </div>

        {/* Resumen semanal */}
        <div className="p-4 bg-purple-100 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Resumen semanal</h2>
          <p className="text-lg">
            😊 Felices: {animoPromedio.feliz} | 😐 Neutros: {animoPromedio.neutro} | 😟 Tristes: {animoPromedio.triste}
          </p>
        </div>

        {/* Mini ejercicio */}
        <div className="p-4 bg-purple-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Mini ejercicio</h2>
          <p className="text-lg mb-2">Respira profundamente durante 1 minuto 🌬️</p>
          <button className="bg-purple-500 text-white px-6 py-2 rounded-lg text-lg">
            Comenzar
          </button>
        </div>

        {/* Guardar */}
        <button
          onClick={handleGuardar}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg w-full mt-4"
        >
          Guardar
        </button>
      </div>

      {/* Barra inferior */}
      <div className="bg-white border-t py-3 relative shadow-md flex justify-around">
        <div
          className="absolute bottom-0 h-1 w-1/2 bg-[#4f6df5] rounded-t-full transition-all duration-300"
          style={{ left: `${botones.findIndex(b => b.key === pantalla) * 50}%` }}
        />
        {botones.map((btn) => {
          const Icono = btn.icon;
          const activo = pantalla === btn.key;
          return (
            <div
              key={btn.key}
              onClick={btn.onClick}
              className="flex flex-col items-center cursor-pointer px-3 pt-1 transition-colors duration-300"
            >
              <Icono size={24} className={`${activo ? "text-[#4f6df5]" : "text-gray-400"}`} />
              <span className={`text-sm font-medium ${activo ? "text-[#4f6df5]" : "text-gray-400"}`}>
                {btn.nombre}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AutoCuidado;