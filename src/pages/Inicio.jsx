import { useState, useEffect } from "react";
import { IconActividad, IconAnimo, IconSintomas } from "../components/Iconos";
import useRecordatorios from "../hooks/useRecordatorios";
import RecordatorioActivo from "../components/RecordatorioActivo";
import AlertaOlvido from "../components/AlertaOlvido";

function Inicio({ nombre, onRegistrar, onCalendario, onAnimo, onSintomas }) {
  const id_adulto = localStorage.getItem("id_adulto");
  const { activo, olvidado } = useRecordatorios(id_adulto);

  const [mostrarOlvidado, setMostrarOlvidado] = useState(true);
  const [mostrarActivo, setMostrarActivo] = useState(true);

  // Mapeo de días para evitar confusiones (M = Martes, Mi = Miércoles)
  const diasSemanaLetras = ["L", "M", "Mi", "J", "V", "S", "D"];

  return (
    <div className="w-full min-h-screen flex flex-col p-6 gap-7 bg-gradient-to-br from-[#f0f7ff] via-[#f8fbff] to-[#fdfefe] pb-28">
      
      {/* HEADER - Texto más grande y legible */}
      <div className="mt-4">
        <h1 className="text-3xl font-extrabold text-[#1f4d3a] tracking-tight">
          Hola, {nombre}
        </h1>
        <p className="text-base text-gray-600 font-medium mt-1">
          ¿Cómo te sientes hoy?
        </p>
      </div>

      {/* ALERTAS - Prioridad visual alta */}
      {(olvidado || activo) && (
        <div className="flex flex-col gap-3">
          {olvidado && mostrarOlvidado && (
            <AlertaOlvido recordatorio={olvidado} cerrar={() => setMostrarOlvidado(false)} />
          )}
          {activo && mostrarActivo && (
            <RecordatorioActivo recordatorio={activo} cerrar={() => setMostrarActivo(false)} />
          )}
        </div>
      )}

      {/* CALENDARIO - Círculos más grandes para facilitar lectura */}
      <div
        onClick={onCalendario}
        className="rounded-[2rem] p-5 bg-white border-2 border-blue-50 shadow-md active:scale-[0.97] transition-all"
      >
        <div className="flex justify-between items-center mb-5">
          <p className="text-sm font-black text-[#2b4f81] uppercase tracking-widest flex items-center gap-2">
            📅 Calendario Semanal
          </p>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">VER TODO</span>
        </div>

        <div className="flex justify-between items-center">
          {(() => {
            const hoy = new Date();
            const diaSemanaActual = hoy.getDay(); 
            const indiceHoy = diaSemanaActual === 0 ? 6 : diaSemanaActual - 1;
            const lunes = new Date(hoy);
            lunes.setDate(hoy.getDate() - indiceHoy);

            return diasSemanaLetras.map((letra, index) => {
              const fecha = new Date(lunes);
              fecha.setDate(lunes.getDate() + index);
              const esHoy = fecha.toDateString() === hoy.toDateString();

              return (
                <div key={index} className="flex flex-col items-center gap-3">
                  <span className={`text-xs font-bold ${esHoy ? 'text-blue-600' : 'text-gray-400'}`}>
                    {letra}
                  </span>
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-base font-black transition-all
                    ${esHoy 
                      ? "bg-[#4f8cff] text-white shadow-lg shadow-blue-300 ring-4 ring-blue-100" 
                      : "bg-gray-50 text-[#2b4f81] border border-gray-100"}`}
                  >
                    {fecha.getDate()}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* ESTADO - Más visible */}
      {!activo && !olvidado && (
        <div className="flex items-center justify-center">
          <span className="bg-[#e8f5e9] text-[#2e7d32] px-6 py-2 rounded-full text-sm font-bold border border-[#c8e6c9]">
            ✨ Todo está en orden por ahora
          </span>
        </div>
      )}

      {/* BOTONES PRINCIPALES - Tamaño "Finger-friendly" */}
      <div className="flex flex-col gap-5">
        <button
          onClick={onRegistrar}
          className="flex items-center justify-center gap-4 bg-[#FFEB85] py-6 rounded-[2rem] text-lg font-black text-[#5c4d00] shadow-[0_4px_0_0_#e6d377] active:shadow-none active:translate-y-1 transition-all"
        >
          <IconActividad className="w-8 h-8" />
          REGISTRAR ACTIVIDAD
        </button>

        <div className="grid grid-cols-2 gap-5">
          <button
            onClick={onAnimo}
            className="flex flex-col items-center justify-center bg-[#FFD1E3] py-7 rounded-[2rem] shadow-[0_4px_0_0_#e6bccd] active:shadow-none active:translate-y-1 transition-all"
          >
            <div className="bg-white/60 p-3 rounded-full mb-3">
               <IconAnimo className="w-8 h-8 text-[#a33b66]" />
            </div>
            <span className="text-base font-black text-[#a33b66]">Ánimo</span>
          </button>

          <button
            onClick={onSintomas}
            className="flex flex-col items-center justify-center bg-[#FFD8B8] py-7 rounded-[2rem] shadow-[0_4px_0_0_#e6c2a5] active:shadow-none active:translate-y-1 transition-all"
          >
            <div className="bg-white/60 p-3 rounded-full mb-3">
              <IconSintomas className="w-8 h-8 text-[#8a4a1a]" />
            </div>
            <span className="text-base font-black text-[#8a4a1a]">Síntomas</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inicio;