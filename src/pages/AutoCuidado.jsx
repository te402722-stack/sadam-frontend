import { useEffect, useState } from "react";
import { FaSpa, FaSmile, FaTint, FaPills, FaHeartbeat, FaChevronRight } from "react-icons/fa";
import api from "../config/api";

function AutoCuidado({ irAEstadoAnimo }) {
  const [animoHoy, setAnimoHoy] = useState(null);
  const [resumen, setResumen] = useState({
    agua: 0,
    medicamentos: 0,
    animoFrecuente: "-",
    sintomaFrecuente: "-"
  });
  const [loading, setLoading] = useState(true);

  // Generar el consejo una sola vez al montar el componente
  const [consejoHoy] = useState(() => {
    const consejos = [
      "Recuerda beber agua durante el día 💧",
      "Tómate un momento para respirar profundo 🌿",
      "Camina unos pasos para mantenerte activo 🚶",
      "Sal un momento al aire libre ☀️",
      "Escucha tu música favorita un momento 🎵"
    ];
    return consejos[Math.floor(Math.random() * consejos.length)];
  });

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario || !usuario.id_adulto) {
      console.error("No hay adulto logueado");
      setLoading(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        // En Axios se usa .data directamente, no .json()
        
        // 1. Obtener Resumen (Agua, Medicamentos, etc.)
        const resResumen = await api.get(`/resumen/${usuario.id_adulto}`);
        if (resResumen.data) {
          setResumen({
            agua: resResumen.data.agua || 0,
            medicamentos: resResumen.data.medicamentos || 0,
            animoFrecuente: resResumen.data.animoFrecuente || "-",
            sintomaFrecuente: resResumen.data.sintomaFrecuente || "-"
          });
        }

        // 2. Obtener Estado de Ánimo actual del Dashboard
        const resDashboard = await api.get(`/dashboard-datos/${usuario.id_adulto}`);
        if (resDashboard.data && resDashboard.data.estado_animo && resDashboard.data.estado_animo !== "Sin registro") {
          setAnimoHoy(resDashboard.data.estado_animo);
        }

      } catch (error) {
        console.error("Error cargando datos de autocuidado:", error);
      } finally {
        // Simulamos un pequeño delay para que la transición no sea brusca
        setTimeout(() => setLoading(false), 600);
      }
    };

    cargarDatos();
  }, []);

  // PANTALLA DE CARGA BONITA
  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-green-100 border-t-green-500 rounded-full animate-spin"></div>
          <FaSpa className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500/50" />
        </div>
        <p className="text-gray-400 font-medium animate-pulse">Sincronizando bienestar...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col p-6 gap-6 animate-in fade-in zoom-in duration-500">
      
      {/* SECCIÓN HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-2xl shadow-lg shadow-green-100">
            <FaSpa className="text-white text-xl"/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Autocuidado</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Mi Diario Vital</p>
          </div>
        </div>
      </div>

      {/* TARJETA ESTADO DE ÁNIMO */}
      <div className="relative overflow-hidden bg-white rounded-[32px] shadow-xl shadow-gray-100 border border-gray-50 p-6 transition-all hover:shadow-2xl hover:shadow-gray-200">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-6 bg-yellow-400 rounded-full"></div>
          <h2 className="font-bold text-gray-700 text-lg">¿Cómo vas hoy?</h2>
        </div>

        {animoHoy ? (
          <div className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-transparent p-4 rounded-3xl border border-yellow-50">
            <div className="flex items-center gap-5">
              <span className="text-6xl filter drop-shadow-md animate-bounce-slow inline-block">
                {animoHoy}
              </span>
              <div>
                <p className="text-xl font-black text-gray-800">¡Registrado!</p>
                <p className="text-gray-500 text-sm">Te sientes {animoHoy} hoy</p>
              </div>
            </div>
            <div className="bg-white p-2 rounded-full text-yellow-500 shadow-sm">
               <FaSmile size={20} />
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-gray-400 mb-5 text-sm">Tu bienestar emocional es importante, tómate un segundo para marcarlo.</p>
            <button
              onClick={irAEstadoAnimo}
              className="group w-full bg-[#F28B82] hover:bg-[#ee7368] text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Registrar estado de ánimo
              <FaChevronRight className="text-white/50 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* CONSEJO DEL DÍA (ESTILO BANNER) */}
      <div className="bg-indigo-600 rounded-[32px] p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-100">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-400/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Tip del día</span>
          </div>
          <p className="text-lg font-medium leading-tight">
            {consejoHoy}
          </p>
        </div>
        {/* Decoración de fondo */}
        <div className="absolute -right-4 -bottom-6 text-indigo-500 opacity-20 text-9xl">
          <FaSpa />
        </div>
      </div>

      {/* GRID DE RESUMEN */}
      <div>
        <h2 className="font-black text-gray-800 mb-4 ml-2">Resumen Semanal</h2>
        <div className="grid grid-cols-2 gap-4">
          
          {/* AGUA */}
          <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-[28px] flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-default">
            <div className="bg-white p-3 rounded-2xl shadow-sm mb-3">
              <FaTint className="text-blue-500 text-xl"/>
            </div>
            <span className="text-3xl font-black text-blue-700">{resumen.agua}</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase">Días con Agua</span>
          </div>

          {/* MEDICAMENTOS */}
          <div className="bg-green-50/50 border border-green-100 p-5 rounded-[28px] flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-default">
            <div className="bg-white p-3 rounded-2xl shadow-sm mb-3">
              <FaPills className="text-green-500 text-xl"/>
            </div>
            <span className="text-3xl font-black text-green-700">{resumen.medicamentos}</span>
            <span className="text-[10px] font-bold text-green-400 uppercase">Tomas éxito</span>
          </div>

          {/* ANIMO FRECUENTE */}
          <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-[28px] flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-default">
            <div className="bg-white p-3 rounded-2xl shadow-sm mb-3">
              <FaSmile className="text-purple-500 text-xl"/>
            </div>
            <span className="text-2xl font-black text-purple-700 truncate w-full text-center">
              {resumen.animoFrecuente}
            </span>
            <span className="text-[10px] font-bold text-purple-400 uppercase">Ánimo común</span>
          </div>

          {/* SINTOMA FRECUENTE */}
          <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-[28px] flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-default">
            <div className="bg-white p-3 rounded-2xl shadow-sm mb-3">
              <FaHeartbeat className="text-rose-500 text-xl"/>
            </div>
            <span className="text-2xl font-black text-rose-700 truncate w-full text-center">
              {resumen.sintomaFrecuente}
            </span>
            <span className="text-[10px] font-bold text-rose-400 uppercase">Molestia común</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AutoCuidado;