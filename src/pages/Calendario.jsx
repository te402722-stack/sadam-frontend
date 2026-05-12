import { useState, useEffect } from "react";
import { 
  FaArrowLeft, FaChevronLeft, FaChevronRight, 
  FaBell, FaPills, FaTint, FaHeartbeat, FaWalking 
} from "react-icons/fa";
import api from "../config/api";

function Calendario({ onBack }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(true); // Para saber si está cargando

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("es-MX", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // --- HELPERS DE FECHA ---
  const parseFechaLocal = (fechaStr) => {
    if (!fechaStr) return null;
    // Si ya es objeto Date, devolverlo
    if (fechaStr instanceof Date) return fechaStr;
    // Limpiar el string si viene con T00:00:00...
    const limpia = fechaStr.split('T')[0];
    const [y, m, d] = limpia.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0); // Forzar mediodía
  };

  const formatearFechaLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const esMismoDia = (fecha, d, m, y) => {
    if (!fecha) return false;
    return fecha.getDate() === d && fecha.getMonth() === m && fecha.getFullYear() === y;
  };

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const id = localStorage.getItem("id_adulto");
        console.log("Cargando para ID:", id); // DEBUG

        const res = await api.get(`/recordatorios/${id}`);
        const data = res.data || [];
        console.log("Datos recibidos de API:", data); // DEBUG

        const expandido = [];
        data.forEach(r => {
          const inicio = parseFechaLocal(r.fecha);
          if (!inicio) return;

          const duracion = parseInt(r.duracion) || 1;
          const frecuencia = r.frecuencia || "Una vez";

          for (let d = 0; d < duracion; d++) {
            const fechaBase = new Date(inicio.getTime());
            fechaBase.setDate(inicio.getDate() + d);

            if (frecuencia.startsWith("Cada")) {
              const cadaHoras = parseInt(frecuencia.split(" ")[1]) || 1;
              const [hIni, mIni] = (r.hora || "00:00").split(":").map(Number);
              
              for (let h = 0; h < 24; h += cadaHoras) {
                expandido.push({
                  ...r,
                  fecha: formatearFechaLocal(fechaBase),
                  hora: `${String((hIni + h) % 24).padStart(2, "0")}:${String(mIni).padStart(2, "0")}`
                });
              }
            } else {
              expandido.push({
                ...r,
                fecha: formatearFechaLocal(fechaBase)
              });
            }
          }
        });

        console.log("Datos expandidos final:", expandido); // DEBUG
        setRecordatorios(expandido);
      } catch (e) {
        console.error("Error en API:", e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [currentDate]); // Recargar si cambiamos de mes

  // --- FILTRO ---
  const recordatoriosDelDia = recordatorios.filter(r => {
    const f = parseFechaLocal(r.fecha);
    return esMismoDia(f, selectedDay, month, year);
  });

  const iconoTipo = (tipo) => {
    if (tipo === "medicamento") return <FaPills className="text-red-500"/>;
    if (tipo === "agua") return <FaTint className="text-blue-500"/>;
    if (tipo === "cita") return <FaHeartbeat className="text-green-500"/>;
    if (tipo === "actividad") return <FaWalking className="text-purple-500"/>;
    return null;
  };

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col">
      {/* Cabecera */}
      <div className="bg-[#8FAEE6] p-5 text-white flex items-center shadow-md">
        <button onClick={onBack} className="mr-4 text-xl"><FaArrowLeft /></button>
        <h1 className="text-xl font-semibold">Calendario</h1>
      </div>

      {/* Selector de Mes */}
      <div className="flex items-center justify-between px-6 pt-5">
        <button onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(1); }}><FaChevronLeft /></button>
        <h2 className="text-lg font-semibold capitalize">{monthName} {year}</h2>
        <button onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(1); }}><FaChevronRight /></button>
      </div>

      {/* Calendario */}
      <div className="p-5">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-3">
            <p>L</p><p>M</p><p>M</p><p>J</p><p>V</p><p>S</p><p>D</p>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              if (!day) return <div key={i}></div>;
              const tieneTareas = recordatorios.some(r => esMismoDia(parseFechaLocal(r.fecha), day, month, year));
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={`h-10 rounded-lg flex flex-col items-center justify-center text-sm relative
                  ${selectedDay === day ? "bg-[#8FAEE6] text-white" : "text-gray-700"}`}
                >
                  {day}
                  {tieneTareas && <div className={`w-1 h-1 rounded-full mt-0.5 ${selectedDay === day ? "bg-white" : "bg-red-500"}`}></div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lista de recordatorios */}
      <div className="flex-1 p-5 overflow-y-auto">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaBell className="text-[#8FAEE6]" /> Recordatorios
        </h3>
        
        {loading ? (
          <p className="text-center text-gray-500 text-sm">Buscando...</p>
        ) : recordatoriosDelDia.length > 0 ? (
          recordatoriosDelDia.map((r, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-4 mb-3 flex justify-between items-center border-l-4 border-[#8FAEE6]">
              <div className="flex items-center gap-3">
                {iconoTipo(r.tipo)}
                <div>
                  <p className="text-xs text-gray-400">{r.hora}</p>
                  <p className="font-bold text-gray-700 capitalize">{r.tipo}</p>
                  <p className="text-xs text-gray-500">{r.medicamento || r.titulo || ""}</p>
                </div>
              </div>
              {r.completado ? (
                <span className="text-xs text-green-500 font-bold">Hecho</span>
              ) : (
                <button className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-md font-bold">Pendiente</button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">No hay nada para el día {selectedDay}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendario;
