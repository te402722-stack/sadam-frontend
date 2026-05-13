import { useState, useEffect } from "react";
import { 
  FaArrowLeft, FaChevronLeft, FaChevronRight, 
  FaBell, FaPills, FaTint, FaHeartbeat, FaWalking, FaCheck, FaClock, FaExclamationCircle 
} from "react-icons/fa";
import api from "../config/api";

function Calendario({ onBack }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Lógica de validación de tiempo CORREGIDA ---
  const obtenerEstadoRecordatorio = (r) => {
    if (r.completado) return "COMPLETADO";

    const ahora = new Date();
    
    // Extraemos año, mes y día de la cadena "YYYY-MM-DD"
    const [y, m, d] = r.fecha.split("-").map(Number);
    // Extraemos hora y minuto de "HH:MM"
    const [hh, mm] = r.hora.split(":").map(Number);

    // Creamos la fecha exacta del evento (Mes es 0-indexed en JS, por eso m-1)
    const fechaProg = new Date(y, m - 1, d, hh, mm, 0);

    // Definir el límite de los 15 minutos
    const limiteMaximo = new Date(fechaProg.getTime() + 15 * 60000);

    if (ahora < fechaProg) {
      return "PROXIMO"; 
    } else if (ahora >= fechaProg && ahora <= limiteMaximo) {
      return "DISPONIBLE"; 
    } else {
      return "VENCIDO"; 
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("es-MX", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const marcarHecho = async (id_recordatorio, fecha) => {
    try {
      const id_adulto = localStorage.getItem("id_adulto");
      await api.post("/recordatorios/completar", { id_recordatorio, id_adulto, fecha });

      setRecordatorios(prev => prev.map(r => 
        (r.id_recordatorio === id_recordatorio && r.fecha === fecha) ? { ...r, completado: 1 } : r
      ));
    } catch (err) {
      console.error("Error al completar:", err);
    }
  };

  const parseFechaLocal = (fechaStr) => {
    if (!fechaStr) return null;
    const limpia = fechaStr.split('T')[0];
    const [y, m, d] = limpia.split("-").map(Number);
    return new Date(y, m - 1, d); // Quitamos las 12:00:00 para evitar choques
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

  const iconoTipo = (tipo, colorClass = "") => {
    switch (tipo?.toLowerCase()) {
      case "medicamento": return <FaPills className={`text-red-500 ${colorClass}`} />;
      case "agua": return <FaTint className={`text-blue-500 ${colorClass}`} />;
      case "cita": return <FaHeartbeat className={`text-green-500 ${colorClass}`} />;
      case "actividad": return <FaWalking className={`text-purple-500 ${colorClass}`} />;
      default: return <FaBell className={`text-gray-400 ${colorClass}`} />;
    }
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const id = localStorage.getItem("id_adulto");
        const res = await api.get(`/recordatorios/${id}`);
        const data = res.data || [];
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
              expandido.push({ ...r, fecha: formatearFechaLocal(fechaBase) });
            }
          }
        });
        setRecordatorios(expandido);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    cargar();
  }, [currentDate]);

  const recordatoriosDelDia = recordatorios.filter(r => {
    const f = parseFechaLocal(r.fecha);
    return esMismoDia(f, selectedDay, month, year);
  });

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col overflow-hidden">
      <div className="bg-[#8FAEE6] p-5 text-white flex items-center shadow-md shrink-0">
        <button onClick={onBack} className="mr-4 text-xl"><FaArrowLeft /></button>
        <h1 className="text-xl font-semibold">Mi Calendario</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(1); }}><FaChevronLeft /></button>
          <h2 className="text-lg font-bold capitalize text-gray-700">{monthName} {year}</h2>
          <button onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(1); }}><FaChevronRight /></button>
        </div>

        <div className="px-5 mb-4">
          <div className="bg-white rounded-3xl shadow-sm p-4">
            <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-2">
              <p>L</p><p>M</p><p>M</p><p>J</p><p>V</p><p>S</p><p>D</p>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (!day) return <div key={i}></div>;
                const recsDia = recordatorios.filter(r => esMismoDia(parseFechaLocal(r.fecha), day, month, year));
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(day)}
                    className={`h-14 rounded-2xl flex flex-col items-center justify-center relative transition-all
                    ${selectedDay === day ? "bg-[#8FAEE6] text-white shadow-md scale-105" : "text-gray-700 hover:bg-blue-50"}`}
                  >
                    <span className="font-semibold text-sm">{day}</span>
                    <div className="flex gap-0.5 mt-1">
                      {recsDia.slice(0, 3).map((r, idx) => (
                        <div key={idx} className="scale-75">{iconoTipo(r.tipo)}</div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-5 pb-10">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
            <FaBell className="text-[#8FAEE6]" /> Eventos del día
          </h3>
          
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-gray-500">Cargando...</p>
            ) : recordatoriosDelDia.length > 0 ? (
              recordatoriosDelDia.map((r, idx) => {
                const estado = obtenerEstadoRecordatorio(r);
                return (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-xl">
                        {iconoTipo(r.tipo, "text-xl")}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#8FAEE6]">{r.hora}</p>
                        <p className="font-bold text-gray-800 capitalize text-md">
                          {r.nombre_medicamento || r.titulo || r.tipo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {r.dosis ? `Dosis: ${r.dosis}` : "Revisar indicaciones"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      {estado === "COMPLETADO" && (
                        <div className="bg-green-100 text-green-600 p-2 rounded-full">
                          <FaCheck size={14} />
                        </div>
                      )}
                      
                      {estado === "PROXIMO" && (
                        <div className="text-gray-400 text-[10px] font-bold uppercase flex items-center gap-1">
                          <FaClock /> Próximo
                        </div>
                      )}

                      {estado === "DISPONIBLE" && (
                        <button
                          onClick={() => marcarHecho(r.id_recordatorio, r.fecha)}
                          className="bg-amber-400 text-white text-[10px] px-3 py-1.5 rounded-xl font-black uppercase shadow-md active:scale-95"
                        >
                          Marcar Hecho
                        </button>
                      )}

                      {estado === "VENCIDO" && (
                        <div className="text-red-500 text-[10px] font-black uppercase flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                          <FaExclamationCircle /> No completado
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No hay recordatorios programados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendario;