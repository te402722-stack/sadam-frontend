import { useEffect, useState } from "react";
import { FaSpa, FaSmile, FaTint, FaPills, FaHeartbeat, FaChevronRight } from "react-icons/fa";
import api from "../config/api";

// Recibimos 'irAEstadoAnimo' como prop desde App.js
function AutoCuidado({ irAEstadoAnimo }) {
  // ❌ BORRADO: const navigate = useNavigate(); (Esto causaba el error)

  const [animoHoy, setAnimoHoy] = useState(null);
  const [resumen, setResumen] = useState({
    agua: 0,
    medicamentos: 0,
    animoFrecuente: "-",
    sintomaFrecuente: "-"
  });
  const [loading, setLoading] = useState(true);

  const [consejoHoy] = useState(() => {
    const consejos = [
      "No olvide tomar un vasito de agua, le hará sentirse muy bien 💧",
      "Respire profundo y sienta el aire fresco en sus pulmones 🌿",
      "Un pequeño paseo por la casa le ayudará a estirar las piernas 🚶",
      "Si puede, tome un poquito de sol, es bueno para sus defensas ☀️",
      "Ponga esa canción que tanto le gusta y disfrute el momento 🎵",
      "Una llamada a un ser querido siempre alegra el corazón ☎️"
    ];
    return consejos[Math.floor(Math.random() * consejos.length)];
  });

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("adulto"));
    if (!usuario || !usuario.id_adulto) {
      setLoading(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        const resResumen = await api.get(`/resumen/${usuario.id_adulto}`);
        if (resResumen.data) {
          setResumen({
            agua: resResumen.data.agua || 0,
            medicamentos: resResumen.data.medicamentos || 0,
            animoFrecuente: resResumen.data.animoFrecuente || "-",
            sintomaFrecuente: resResumen.data.sintomaFrecuente || "-"
          });
        }

        const resDashboard = await api.get(`/dashboard-datos/${usuario.id_adulto}`);
        if (resDashboard.data && resDashboard.data.estado_animo && resDashboard.data.estado_animo !== "Sin registro") {
          setAnimoHoy(resDashboard.data.estado_animo);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="w-full flex flex-col p-6 gap-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-2xl shadow-lg">
          <FaSpa className="text-white text-xl"/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-800">Autocuidado</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Cuidando de mí</p>
        </div>
      </div>

      {/* TARJETA ESTADO DE ÁNIMO */}
      <div className="bg-white rounded-[32px] shadow-xl border border-gray-50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-6 bg-yellow-400 rounded-full"></div>
          <h2 className="font-bold text-gray-700 text-lg">¿Cómo se siente hoy?</h2>
        </div>

        {animoHoy ? (
          <div className="flex items-center justify-between bg-yellow-50/50 p-4 rounded-3xl border border-yellow-100">
            <div className="flex items-center gap-5">
              <span className="text-6xl inline-block">{animoHoy}</span>
              <div>
                <p className="text-xl font-black text-gray-800">¡Qué alegría!</p>
                <p className="text-gray-500 text-sm">Ya nos contó cómo está</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-gray-500 mb-5 text-base">Nos gustaría mucho saber cómo se encuentra.</p>
            <button
              onClick={irAEstadoAnimo} // ✅ Usamos la prop de App.js
              className="group w-full bg-[#F28B82] hover:bg-[#ee7368] text-white py-5 rounded-2xl font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
              Decir cómo me siento
              <FaChevronRight className="opacity-50 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* CONSEJO DEL DÍA */}
      <div className="bg-indigo-600 rounded-[32px] p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <span className="bg-indigo-400/30 px-3 py-1 rounded-full text-[10px] font-black uppercase mb-3 inline-block">Consejo para usted</span>
          <p className="text-xl font-medium leading-relaxed italic">
            "{consejoHoy}"
          </p>
        </div>
        <FaSpa className="absolute -right-4 -bottom-6 text-indigo-500 opacity-20 text-9xl" />
      </div>

      {/* RESUMEN SEMANAL */}
      <div>
        <h2 className="font-black text-gray-800 mb-4 ml-2 uppercase text-xs tracking-widest text-gray-400">Su progreso</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-[28px] text-center">
            <FaTint className="mx-auto text-blue-500 text-2xl mb-2"/>
            <span className="block text-3xl font-black text-blue-700">{resumen.agua}</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase">Días hidratado</span>
          </div>
          <div className="bg-green-50/50 border border-green-100 p-5 rounded-[28px] text-center">
            <FaPills className="mx-auto text-green-500 text-2xl mb-2"/>
            <span className="block text-3xl font-black text-green-700">{resumen.medicamentos}</span>
            <span className="text-[10px] font-bold text-green-400 uppercase">Medicinas al día</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutoCuidado;