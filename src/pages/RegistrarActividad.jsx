import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaArrowLeft, FaEdit } from "react-icons/fa";

import RegistroExitoso from "../components/RegistroExitoso";
import comerIcon from "../assets/icons/comer.svg";
import dormirIcon from "../assets/icons/dormir.svg";
import caminarIcon from "../assets/icons/caminar.svg";
import otroIcon from "../assets/icons/otros.svg";
import api from "../config/api";

function RegistrarActividad({ onBack }) {
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [otraActividadNombre, setOtraActividadNombre] = useState(""); // Estado para el texto personalizado
  
  const [actividades, setActividades] = useState([
    { id: 1, nombre: "Comer", icono: comerIcon, color: "bg-orange-50", circulo: "bg-orange-200", completado: false },
    { id: 2, nombre: "Dormir", icono: dormirIcon, color: "bg-purple-50", circulo: "bg-purple-200", completado: false },
    { id: 3, nombre: "Caminata", icono: caminarIcon, color: "bg-green-50", circulo: "bg-green-200", completado: false },
    { id: 4, nombre: "Otra Actividad", icono: otroIcon, color: "bg-gray-50", circulo: "bg-gray-200", completado: false, esPersonalizada: true }
  ]);

  const toggleActividad = (index) => {
    const nuevas = [...actividades];
    nuevas[index].completado = !nuevas[index].completado;
    setActividades(nuevas);
  };

  const completadas = actividades.filter(a => a.completado).length;
  const progreso = (completadas / actividades.length) * 100;

  const guardarActividad = async () => {
    const seleccionadas = actividades.filter(a => a.completado);
    if (seleccionadas.length === 0) return;

    // Validar si seleccionó "Otra" pero no escribió nada
    const tieneOtraSinNombre = seleccionadas.find(a => a.esPersonalizada && !otraActividadNombre.trim());
    if (tieneOtraSinNombre) {
      alert("Por favor, escribe el nombre de la otra actividad");
      return;
    }

    try {
      setCargando(true);
      const id_adulto = localStorage.getItem("id_adulto");
      const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

      const payload = {
        id_adulto,
        actividades: seleccionadas.map(a => ({
          // Si es la personalizada, usamos el texto del input, si no, su nombre normal
          actividad: a.esPersonalizada ? otraActividadNombre : a.nombre,
          hora: horaActual
        }))
      };

      await api.post("/actividades", payload);
      setGuardado(true);
      setTimeout(() => onBack(), 2000);
    } catch (error) {
      console.error("Error guardando actividades", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F4F7FF] overflow-hidden">
      <header className="px-6 pt-6 pb-4 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="bg-white p-3 rounded-xl shadow-sm text-gray-600">
          <FaArrowLeft />
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Actividades</h1>
      </header>

      <section className="px-6 mb-6 shrink-0">
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-400 uppercase">Progreso</span>
            <span className="text-xs font-black text-indigo-600">{completadas} / {actividades.length}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-indigo-500" animate={{ width: `${progreso}%` }} />
          </div>
        </div>
      </section>

      <main className="flex-1 px-6 space-y-3 overflow-y-auto pb-40">
        {actividades.map((item, index) => (
          <div key={item.id} className="flex flex-col gap-2">
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleActividad(index)}
              className={`flex items-center justify-between p-5 rounded-[2rem] transition-all border-2 cursor-pointer
                ${item.completado ? "bg-white border-indigo-500 shadow-lg" : `${item.color} border-transparent shadow-sm`}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.circulo}`}>
                  <img src={item.icono} alt="" className="w-8 h-8" />
                </div>
                <span className="text-lg font-bold text-slate-800">{item.nombre}</span>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${item.completado ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-200 bg-white"}`}>
                {item.completado && <FaCheck size={14} />}
              </div>
            </motion.div>

            {/* INPUT DINÁMICO: Solo aparece si selecciona "Otra Actividad" */}
            <AnimatePresence>
              {item.esPersonalizada && item.completado && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-4 pb-2"
                >
                  <div className="relative">
                    <FaEdit className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                    <input
                      type="text"
                      placeholder="¿Qué actividad realizó?"
                      value={otraActividadNombre}
                      onChange={(e) => setOtraActividadNombre(e.target.value)}
                      className="w-full bg-white border-2 border-indigo-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#F4F7FF] to-transparent">
        <motion.button
          disabled={completadas === 0 || cargando}
          whileTap={{ scale: 0.95 }}
          onClick={guardarActividad}
          className={`w-full py-5 rounded-[2rem] text-lg font-black uppercase tracking-widest shadow-xl transition-all
            ${completadas === 0 || cargando ? "bg-slate-200 text-slate-400" : "bg-[#E6ED3B] text-slate-800"}
          `}
        >
          {cargando ? "Guardando..." : "Finalizar Registro"}
        </motion.button>
      </div>

      {guardado && <RegistroExitoso mensaje="¡Guardado con éxito!" onClose={() => setGuardado(false)} />}
    </div>
  );
}

export default RegistrarActividad;