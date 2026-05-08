import { useState } from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

import RegistroExitoso from "../components/RegistroExitoso";
import comerIcon from "../assets/icons/comer.svg";
import dormirIcon from "../assets/icons/dormir.svg";
import caminarIcon from "../assets/icons/caminar.svg";
import otroIcon from "../assets/icons/otros.svg";
import api from "../config/api";

function RegistrarActividad({ onBack }) {
const [guardado, setGuardado] = useState(false);
  const [actividades, setActividades] = useState([
    {
      nombre: "Comer",
      icono: comerIcon,
      color: "bg-orange-100",
      circulo: "bg-orange-200",
      completado: false
    },
    {
      nombre: "Dormir",
      icono: dormirIcon,
      color: "bg-purple-100",
      circulo: "bg-purple-200",
      completado: false
    },
    {
      nombre: "Caminata",
      icono: caminarIcon,
      color: "bg-green-100",
      circulo: "bg-green-200",
      completado: false
    },
    {
      nombre: "Otra Actividad",
      icono: otroIcon,
      color: "bg-gray-100",
      circulo: "bg-gray-200",
      completado: false
    }
  ]);

  

  const toggleActividad = (index) => {
    const nuevas = [...actividades];
    nuevas[index].completado = !nuevas[index].completado;
    setActividades(nuevas);
  };

  const completadas = actividades.filter(a => a.completado).length;
  const progreso = (completadas / actividades.length) * 100;

  const guardarActividad = async () => {

  try {

    const id_adulto = localStorage.getItem("id_adulto");

    const actividadesCompletadas = actividades
      .filter(a => a.completado)
      .map(a => ({
        actividad: a.nombre
      }));

    if (actividadesCompletadas.length === 0) {
      alert("No seleccionaste actividades");
      return;
    }

    await api.post("/actividades", {
        id_adulto,
        actividades: actividadesCompletadas
      });
    setGuardado(true);

    alert("Actividades guardadas");

  } catch (error) {

    console.error("Error guardando actividades", error);

  }

};

  return (
  <div className="flex flex-col h-screen bg-gradient-to-b from-[#F4F7FF] to-[#E5ECFF] overflow-hidden">
    
    {/* HEADER: Más compacto */}
    <header className="px-6 pt-4 pb-2 flex items-center gap-4 shrink-0">
      <button
        onClick={onBack}
        className="text-2xl font-bold text-gray-700 p-1"
      >
        ←
      </button>
      <h1 className="text-xl font-bold text-gray-800">
        Actividades de Hoy
      </h1>
    </header>

    {/* TARJETA PROGRESO: Reducida en altura */}
    <section className="px-6 mb-4 shrink-0">
      <div className="bg-white p-4 rounded-2xl shadow-md border border-blue-50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 font-medium">Progreso</span>
          <span className="text-sm font-bold text-gray-800 bg-blue-50 px-2 py-1 rounded-lg">
            {completadas} de {actividades.length}
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-green-500"
            animate={{ width: `${progreso}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </section>

  {/* LISTA DE ACTIVIDADES */}
    <main className="flex-1 px-6 space-y-2 overflow-y-auto pb-44"> 
      {/* El pb-44 es para que al hacer scroll, la última actividad no quede tapada por el botón */}
      {actividades.map((item, index) => (
        <div
          key={index}
          onClick={() => toggleActividad(index)}
          className={`
            flex items-center justify-between
            p-3 rounded-2xl shadow-sm border-2 transition-all
            ${item.completado ? "bg-white border-green-400 opacity-90" : `${item.color} border-transparent`}
          `}
        >
          {/* ... resto del contenido del item (icono y nombre) ... */}
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
      ))}
    </main>

    {/* CONTENEDOR FLOTANTE DEL BOTÓN */}
    {/* Lo posicionamos a 80px del suelo para que libre la BottomNav, pero sin padding extra arriba */}
    <div className="fixed bottom-[80px] left-0 w-full px-6 z-40">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={guardarActividad}
        className="w-full py-4 rounded-2xl text-lg font-black text-gray-800 bg-[#E6ED3B] shadow-[0_-5px_15px_rgba(0,0,0,0.1)] uppercase"
      >
        Guardar Actividades
      </motion.button>
    </div>

    {/* Espacio invisible final para la BottomNav */}
    <div className="h-[75px] shrink-0" />

    {guardado && (
      <RegistroExitoso
        mensaje="Actividad registrada"
        onClose={() => setGuardado(false)}
      />
    )}
  </div>
);
}

export default RegistrarActividad;