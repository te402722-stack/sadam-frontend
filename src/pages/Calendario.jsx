import { useState, useEffect } from "react";
import { 
  FaArrowLeft, 
  FaChevronLeft, 
  FaChevronRight, 
  FaBell,
  FaPills,
  FaTint,
  FaHeartbeat,
  FaWalking
} from "react-icons/fa";
import api from "../config/api";

function Calendario({ onBack }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [recordatorios, setRecordatorios] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("es-MX", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  /* =========================
      HELPERS FECHA (SIN DESFASE)
  ========================= */

  const parseFechaLocal = (fechaStr) => {
    if (!fechaStr) return null;
    if (fechaStr instanceof Date) return fechaStr;
    
    // Si viene de la base de datos como YYYY-MM-DD
    const [y, m, d] = fechaStr.split("-").map(Number);
    // Forzamos las 12:00 PM para evitar que el cambio de zona horaria mueva el día
    return new Date(y, m - 1, d, 12, 0, 0);
  };

  const formatearFechaLocal = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const esMismoDia = (fecha, d, m, y) => {
    if (!fecha) return false;
    return (
      fecha.getDate() === d &&
      fecha.getMonth() === m &&
      fecha.getFullYear() === y
    );
  };

  /* =========================
      ESTADO Y UI
  ========================= */

  const iconoTipo = (tipo) => {
    const iconos = {
      medicamento: <FaPills className="text-red-500"/>,
      agua: <FaTint className="text-blue-500"/>,
      cita: <FaHeartbeat className="text-green-500"/>,
      actividad: <FaWalking className="text-purple-500"/>
    };
    return iconos[tipo] || null;
  };

  const estadoRecordatorio = (r) => {
    if (r.completado) return "completado";
    return "activo"; // Simplificado para asegurar visualización
  };

  /* =========================
      CARGAR Y EXPANDIR
  ========================= */

  useEffect(() => {
    const cargar = async () => {
      try {
        const id = localStorage.getItem("id_adulto");
        const res = await api.get(`/recordatorios/${id}`);
        const data = res.data;
        const expandido = [];

        data.forEach(r => {
          const frecuencia = r.frecuencia || "";
          const duracion = parseInt(r.duracion) || 1;
          const inicio = parseFechaLocal(r.fecha);

          if (!inicio || isNaN(inicio)) return;

          for (let d = 0; d < duracion; d++) {
            const fechaBase = new Date(inicio.getTime());
            fechaBase.setDate(inicio.getDate() + d);

            if (frecuencia === "Diario" || frecuencia === "Una vez") {
              expandido.push({
                ...r,
                fecha: formatearFechaLocal(fechaBase)
              });
            } else if (frecuencia.startsWith("Cada")) {
              const cadaHoras = parseInt(frecuencia.split(" ")[1]) || 1;
              const [horaIni, minIni] = (r.hora || "08:00").split(":").map(Number);
              
              for (let h = 0; h < 24; h += cadaHoras) {
                expandido.push({
                  ...r,
                  fecha: formatearFechaLocal(fechaBase),
                  hora: `${String((horaIni + h) % 24).padStart(2,"0")}:${String(minIni).padStart(2,"0")}`
                });
              }
            } else {
              expandido.push({ ...r, fecha: formatearFechaLocal(fechaBase) });
            }
          }
        });
        setRecordatorios(expandido);
      } catch (e) {
        console.error("Error cargando recordatorios", e);
      }
    };
    cargar();
  }, []);

  // FILTRO CRÍTICO: Aseguramos que se compare contra el día seleccionado
  const recordatoriosDelDia = recordatorios.filter(r => {
    const f = parseFechaLocal(r.fecha);
    return esMismoDia(f, selectedDay, month, year);
  });

  /* =========================
      NAVEGACIÓN Y ACCIONES
  ========================= */

  const completarRecordatorio = async (id) => {
    try {
      await api.post("/recordatorios/completar", {
        id_recordatorio: id,
        id_adulto: localStorage.getItem("id_adulto")
      });
      setRecordatorios(prev => prev.map(r => 
        r.id_recordatorio === id ? { ...r, completado: true } : r
      ));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col">
      <div className="bg-[#8FAEE6] p-5 text-white flex items-center shadow-md">
        <button onClick={onBack} className="mr-4 text-xl"><FaArrowLeft /></button>
        <h1 className="text-xl font-semibold">Calendario</h1>
      </div>

      <div className="flex items-center justify-between px-6 pt-5">
        <button onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(1); }}><FaChevronLeft /></button>
        <h2 className="text-lg font-semibold capitalize">{monthName} {year}</h2>
        <button onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(1); }}><FaChevronRight /></button>
      </div>

      <div className="p-5">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-3">
            <p>L</p><p>M</p><p>Mi</p><p>J</p><p>V</p><p>S</p><p>D</p>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              if (!day) return <div key={i}></div>;
              const tieneAlgo = recordatorios.some(r => esMismoDia(parseFechaLocal(r.fecha), day, month, year));
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={`h-12 rounded-xl flex flex-col items-center justify-center text-sm relative
                  ${selectedDay === day ? "bg-[#8FAEE6] text-white" : "hover:bg-gray-100"}`}
                >
                  {day}
                  {tieneAlgo && <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1"></div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaBell className="text-[#8FAEE6]" /> Recordatorios del día
        </h3>
        <div className="space-y-3">
          {recordatoriosDelDia.length > 0 ? recordatoriosDelDia.map((r, idx) => (
            <div key={`${r.id_recordatorio}-${idx}`} className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {iconoTipo(r.tipo)}
                <div>
                  <p className="text-sm text-gray-500">{r.hora}</p>
                  <p className="font-medium capitalize">{r.tipo}</p>
                </div>
              </div>
              {!r.completado && (
                <button 
                  onClick={() => completarRecordatorio(r.id_recordatorio)}
                  className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg"
                >
                  Completar
                </button>
              )}
            </div>
          )) : (
            <p className="text-gray-500 text-sm text-center py-10">No hay tareas para este día</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calendario;
