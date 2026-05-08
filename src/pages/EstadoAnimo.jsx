import { useState } from "react";
import { FaHome, FaCalendarAlt, FaUser } from "react-icons/fa";
import RegistroExitoso from "../components/RegistroExitoso";
import IconAnimo from "../assets/icons/animo.svg";
import felizIcon from "../assets/icons/feliz.svg";
import tristeIcon from "../assets/icons/triste.svg";
import aburridoIcon from "../assets/icons/aburrido.svg";
import enfermoIcon from "../assets/icons/enfermo.svg";
import preocupadoIcon from "../assets/icons/preocupado.svg";
import debilIcon from "../assets/icons/debil.svg";
import api from "../config/api";

function EstadoAnimo({ onBack,onCalendario, onInicio, onGuardado }) {
  const [seleccionados, setSeleccionados] = useState([]);
  const [guardado, setGuardado] = useState(false);

  const estados = [
    { nombre: "Feliz", icono: felizIcon },
    { nombre: "Triste", icono: tristeIcon },
    { nombre: "Aburrido", icono: aburridoIcon },
    { nombre: "Enfermo", icono: enfermoIcon },
    { nombre: "Preocupado", icono: preocupadoIcon },
    { nombre: "Débil", icono: debilIcon },
  ];

  const toggleEstado = (nombre) => {
    if (seleccionados.includes(nombre)) {
      setSeleccionados(seleccionados.filter((e) => e !== nombre));
    } else {
      setSeleccionados([...seleccionados, nombre]);
    }
  };

  const guardarAnimo = async () => {

  const id_adulto = localStorage.getItem("id_adulto");

  if (!seleccionados || seleccionados.length === 0) {
    alert("Selecciona al menos un estado de ánimo");
    return;
  }

  try {

    for (let animo of seleccionados) {

      await fetch(`${API_URL}/animo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_adulto,
          animo
        })
      });

    }

    setGuardado(true);

    if (onGuardado) {
      onGuardado();
    }

  } catch (error) {

    console.error(error);
    alert("Error al guardar estado de ánimo");

  }

};

return (
  /* Usamos h-screen para asegurar que ocupe toda la vista disponible */
  <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
    
    {/* HEADER: Fijo */}
    <header className="bg-[#F28B82] p-5 text-white flex items-center shadow-md shrink-0 z-10">
      <button 
        onClick={onBack} 
        className="mr-4 text-3xl active:scale-90 transition-transform"
        aria-label="Volver"
      >
        ←
      </button>
      <h1 className="text-xl font-bold">Estado de ánimo</h1>
    </header>

    {/* CONTENIDO: Scrollable, pero con margen inferior para la Nav y el Botón */}
    <main className="flex-1 overflow-y-auto px-6 pt-6 pb-40"> 
      {/* pb-40 asegura que el último emoji no quede tapado por el botón flotante */}
      
      <h2 className="text-2xl font-semibold mb-8 text-center text-gray-700 leading-tight">
        ¿Cómo se siente <br/> usted hoy?
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {estados.map((item, index) => {
          const isSelected = seleccionados.includes(item.nombre);
          return (
            <button
              key={index}
              onClick={() => toggleEstado(item.nombre)}
              className={`
                flex flex-col items-center justify-center
                py-6 px-2 rounded-[2rem] transition-all border-4
                ${isSelected 
                  ? "bg-pink-100 border-[#F28B82] shadow-inner" 
                  : "bg-white border-transparent shadow-sm active:bg-gray-100"}
              `}
            >
              <img
                src={item.icono}
                alt=""
                className="w-20 h-20 mb-3 object-contain"
              />
              <span className={`text-xl font-bold ${isSelected ? "text-[#F28B82]" : "text-gray-700"}`}>
                {item.nombre}
              </span>
            </button>
          );
        })}
      </div>
    </main>

    {/* SECCIÓN DE ACCIÓN: Flotando sobre la BottomNav */}
    <div className="fixed bottom-[76px] left-0 w-full px-6 z-40">
      {/* 76px es el alto aproximado de tu BottomNav + un pequeño margen */}
      <button
        onClick={guardarAnimo}
        className="w-full py-5 bg-[#F28B82] text-white rounded-2xl font-black text-2xl shadow-[0_10px_20px_rgba(242,139,130,0.4)] active:scale-95 transition-all uppercase tracking-wide"
      >
        Guardar
      </button>
    </div>

    {/* Espacio fantasma para que la BottomNav no pise nada (opcional si la Nav es fixed) */}
    <div className="h-[72px] shrink-0" />

    {guardado && (
      <RegistroExitoso
        mensaje="¡Listo! Lo hemos guardado"
        onClose={() => setGuardado(false)}
      />
    )}
  </div>
);
}

export default EstadoAnimo;