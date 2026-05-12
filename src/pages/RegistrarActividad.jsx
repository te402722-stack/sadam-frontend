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
  const [otraActividadNombre, setOtraActividadNombre] = useState("");
  
  const [actividades, setActividades] = useState([
    { nombre: "Comer", icono: comerIcon, color: "bg-orange-100", circulo: "bg-orange-200", completado: false },
    { nombre: "Dormir", icono: dormirIcon, color: "bg-purple-100", circulo: "bg-purple-200", completado: false },
    { nombre: "Caminata", icono: caminarIcon, color: "bg-green-100", circulo: "bg-green-200", completado: false },
    { nombre: "Otra Actividad", icono: otroIcon, color: "bg-gray-100", circulo: "bg-gray-200", completado: false, esPersonalizada: true }
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

    if (seleccionadas.find(a => a.esPersonalizada && !otraActividadNombre.trim())) {
      alert("Escribe el nombre de la otra actividad");
      return;
    }

    try {
      setCargando(true);
      const id_adulto = localStorage.getItem("id_adulto");
      const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

      await api.post("/actividades", {
        id_adulto,
        actividades: seleccionadas.map(a => ({
          actividad: a.esPersonalizada ? otraActividadNombre : a.nombre,
          hora: horaActual
        }))
      });
      setGuardado(true);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    // Centramos el contenido con max-w-md para que en Web no se vea gigante
    <div className="flex flex-col h-screen bg-[#F4F7FF] max-w-md mx-auto shadow-2xl relative overflow-hidden">
      
      {/* HEADER ORIGINAL */}
      <header className="px-6 pt-4 pb-2 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="text-2xl font-bold text-gray-700 p-1"> ← </button>
        <h1 className="text-xl font-bold text-gray-800">Actividades de Hoy</h1>
      </header>

      {/* PROGRESO ORIGINAL */}
      <section className="px-6 mb-4 shrink-0">
        <div className="bg-white p-4 rounded-2xl shadow-md border border-blue-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 font-medium">Progreso</span>
            <span className="text-sm font-bold text-gray-800 bg-blue-50 px-2 py-1 rounded-lg">
              {completadas} de {actividades.length}
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-green-500" animate={{ width: `${progreso}%` }} />
          </div>
        </div>
      </section>

      {/* LISTA ORIGINAL */}
      <main className="flex-1 px-6 space-y-2 overflow-y-auto pb-44"> 
        {actividades.map((item, index) => (
          <div key={index}>
            <div
              onClick={() => toggleActividad(index)}
              className={`flex items-center justify-between p-3 rounded-2xl shadow-sm border-2 transition-all
                ${item.completado ? "bg-white border-green-400" : `${item.color} border-transparent`}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${item.circulo}`}>
                  <img src={item.icono} alt="" className="w-6 h-6" />
                </div>
                <span className="text-base font-bold text-gray-800">{item.nombre}</span>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${item.completado ? "bg-green-500 border-green-500 text-white" : "border-gray-300 bg-white"}`}>
                {item.completado && <FaCheck size={12} />}
              </div>
            </div>

            {/* Input para Otra Actividad (solo si se selecciona) */}
            <AnimatePresence>
              {item.esPersonalizada && item.completado && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 px-2"
                >
                  <input
                    type="text"
                    placeholder="¿Qué otra actividad hizo?"
                    value={otraActividadNombre}
                    onChange={(e) => setOtraActividadNombre(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-gray-200 text-sm font-medium outline-none focus:border-blue-400 transition-all shadow-inner"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </main>

      {/* BOTÓN FLOTANTE ORIGINAL */}
      <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={guardarActividad}
          className={`w-full py-4 rounded-2xl text-lg font-black uppercase shadow-lg transition-all
            ${completadas === 0 || cargando ? "bg-gray-300 text-gray-500" : "bg-[#E6ED3B] text-gray-800"}
          `}
        >
          {cargando ? "Guardando..." : "Guardar Actividades"}
        </motion.button>
      </div>

      <div className="h-[75px] shrink-0" />

      {guardado && <RegistroExitoso mensaje="Actividad registrada" onClose={() => setGuardado(false)} />}
    </div>
  );
}

export default RegistrarActividad;