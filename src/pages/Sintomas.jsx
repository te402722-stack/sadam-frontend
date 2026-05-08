import { useState } from "react";
import { FaHome, FaCalendarAlt, FaUser } from "react-icons/fa";
import RegistroExitoso from "../components/RegistroExitoso";
import IconAnimo from "../assets/icons/animo.svg";
import dolorCabezaIcon from "../assets/icons/dolorCabeza.svg";
import mareoIcon from "../assets/icons/mareo.svg";
import dolorMuscularIcon from "../assets/icons/dolorMuscular.svg";
import tosIcon from "../assets/icons/tos.svg";
import fiebreIcon from "../assets/icons/fiebre.svg";
import faltaAireIcon from "../assets/icons/faltaAire.svg";
import nauseasIcon from "../assets/icons/nauseas.svg";
import debilidadIcon from "../assets/icons/debilidad.svg";
import api from "../config/api";

function Sintomas({ onBack, onCalendario, onInicio, onGuardado}) {
  const [seleccionados, setSeleccionados] = useState([]);
  const [guardado, setGuardado] = useState(false);

  const sintomas = [
    { nombre: "Dolor de cabeza", icono: dolorCabezaIcon },
    { nombre: "Mareo", icono: mareoIcon },
    { nombre: "Dolor muscular", icono: dolorMuscularIcon },
    { nombre: "Tos", icono: tosIcon },
    { nombre: "Fiebre", icono: fiebreIcon },
    { nombre: "Falta de aire", icono: faltaAireIcon },
    { nombre: "Náuseas", icono: nauseasIcon },
    { nombre: "Debilidad", icono: debilidadIcon },
  ];

  const toggleSintoma = (nombre) => {
    if (seleccionados.includes(nombre)) {
      setSeleccionados(seleccionados.filter((s) => s !== nombre));
    } else {
      setSeleccionados([...seleccionados, nombre]);
    }
  };

 const guardarSintomas = async () => {

  const id_adulto = localStorage.getItem("id_adulto");

  if (!id_adulto) {
    alert("No se encontró el adulto");
    return;
  }

  if (seleccionados.length === 0) {
    alert("Selecciona al menos un síntoma");
    return;
  }

  try {
      // ✅ Usamos la instancia 'api' (Axios) en lugar de fetch
      for (let sintoma of seleccionados) {
        await api.post("/sintomas", {
          id_adulto: id_adulto,
          sintoma: sintoma
        });
      }

    setGuardado(true);

    setTimeout(() => {
      setGuardado(false);
      setSeleccionados([]);
    }, 2000);

  } catch (error) {

    console.error("Error guardando síntomas:", error);
    alert("Error al guardar síntomas");

  }

};

  return (
    <div className="w-full h-full bg-white flex flex-col">

      {/* HEADER FIJO */}
      <div className="bg-[#F6A04D] p-5 text-white text-lg font-semibold flex items-center shrink-0">
        <button onClick={onBack} className="mr-4 text-2xl">←</button>
        Síntomas
      </div>

      {/* CONTENIDO CON SCROLL */}
      <div className="flex-1 overflow-y-auto p-6 text-center">

        <h2 className="text-lg font-semibold mb-8">
          ¿Tiene algún síntoma?
        </h2>

        <div className="grid grid-cols-2 gap-8 text-base font-medium pb-10">

          {sintomas.map((item, index) => (
            <div
              key={index}
              onClick={() => toggleSintoma(item.nombre)}
              className={`
                flex flex-col items-center 
                cursor-pointer 
                p-4 
                rounded-2xl 
                transition-all duration-200
                ${seleccionados.includes(item.nombre)
                  ? "bg-orange-200 shadow-lg scale-105 border-2 border-[#F6A04D]"
                  : "bg-white hover:scale-105"}
              `}
            >
              <img
                src={item.icono}
                alt={item.nombre}
                className="w-24 h-24 mb-3"
              />
              {item.nombre}
            </div>
          ))}

        </div>

        <button
          onClick={guardarSintomas}
          className="mt-6 mb-10 bg-[#F6A04D] text-white w-full py-4 rounded-2xl font-semibold text-lg shadow-md hover:shadow-lg transition"
        >
          Guardar
        </button>

      </div>
      {guardado && (
  <RegistroExitoso
    mensaje="Sintóma registrado"
    onClose={() => setGuardado(false)}
  />
      )}
    </div>
  );

}

export default Sintomas;