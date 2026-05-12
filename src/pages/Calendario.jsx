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
     HELPERS FECHA PRO
  ========================= */

  const parseFechaLocal = (fechaStr) => {
    if (!fechaStr) return null;

    try {
      if (fechaStr instanceof Date) return fechaStr;

      if (fechaStr.includes("T")) {
        const d = new Date(fechaStr);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }

      const [y, m, d] = fechaStr.split("-").map(Number);
      return new Date(y, m - 1, d);

    } catch {
      return null;
    }
  };

  const formatearFechaLocal = (date) => {
    if (!date) return "";
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  };

  const parseHora = (horaStr) => {
    if (!horaStr) return [0,0];
    const partes = horaStr.split(":").map(Number);
    return [partes[0] || 0, partes[1] || 0];
  };

  const esMismoDia = (fecha, day, month, year) => {
    if (!fecha) return false;

    return (
      fecha.getDate() === day &&
      fecha.getMonth() === month &&
      fecha.getFullYear() === year
    );
  };

  /* =========================
     ICONOS
  ========================= */

  const iconoTipo = (tipo) => {
    if (tipo === "medicamento") return <FaPills className="text-red-500"/>;
    if (tipo === "agua") return <FaTint className="text-blue-500"/>;
    if (tipo === "cita") return <FaHeartbeat className="text-green-500"/>;
    if (tipo === "actividad") return <FaWalking className="text-purple-500"/>;
    return null;
  };

  /* =========================
     ESTADO
  ========================= */

  const estadoRecordatorio = (r) => {
    try {
      if (r.completado) return "completado";

      const fecha = parseFechaLocal(r.fecha);
      if (!fecha) return "activo";

      const [hora, minuto] = parseHora(r.hora);

      const fechaHora = new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        hora,
        minuto
      );

      const ahora = new Date();
      const diff = (ahora - fechaHora) / 60000;

      if (diff < 0) return "activo";
      if (diff <= 10) return "puede_completar";
      if (diff <= 30) return "retraso";
      return "no_cumplido";

    } catch {
      return "activo";
    }
  };

  const estiloEstado = (estado) => {
    if (estado === "activo") return "bg-green-100 text-green-700";
    if (estado === "puede_completar") return "bg-blue-100 text-blue-700";
    if (estado === "retraso") return "bg-yellow-100 text-yellow-700";
    if (estado === "no_cumplido") return "bg-red-100 text-red-700";
    if (estado === "completado") return "bg-gray-200 text-gray-700";
    return "";
  };

  const textoEstado = (estado) => {
    if (estado === "activo") return "Programado";
    if (estado === "puede_completar") return "Confirmar";
    if (estado === "retraso") return "Retraso";
    if (estado === "no_cumplido") return "No cumplido";
    if (estado === "completado") return "Completado";
    return "";
  };

  /* =========================
     CARGAR
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
          const [hora, minuto] = parseHora(r.hora);

          if (!inicio || isNaN(inicio)) return;

          for (let d = 0; d < duracion; d++) {

            const fechaBase = new Date(inicio);
            fechaBase.setDate(fechaBase.getDate() + d);

            if (frecuencia === "Diario") {

              expandido.push({
                ...r,
                fecha: formatearFechaLocal(fechaBase),
                hora: r.hora
              });

            } else if (frecuencia.startsWith("Cada")) {

              const cadaHoras = parseInt(frecuencia.split(" ")[1]) || 1;

              for (let h = 0; h < 24; h += cadaHoras) {

                const fh = new Date(fechaBase);
                fh.setHours((hora + h) % 24, minuto);

                expandido.push({
                  ...r,
                  fecha: formatearFechaLocal(fh),
                  hora: `${String(fh.getHours()).padStart(2,"0")}:${String(fh.getMinutes()).padStart(2,"0")}`
                });
              }

            } else {

              expandido.push({
                ...r,
                fecha: formatearFechaLocal(fechaBase),
                hora: r.hora
              });

            }
          }
        });

        setRecordatorios(expandido);

      } catch (e) {
        console.error("Error cargando", e);
      }
    };

    cargar();

  }, []);

  /* =========================
     FILTRO
  ========================= */

  const recordatoriosDelDia = recordatorios.filter(r => {
    const f = parseFechaLocal(r.fecha);
    return esMismoDia(f, selectedDay, month, year);
  });

  /* =========================
     NAVEGACIÓN
  ========================= */

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  const completarRecordatorio = async (id) => {
    try {
      await api.post("/recordatorios/completar", {
        id_recordatorio: id,
        id_adulto: localStorage.getItem("id_adulto")
      });

      setRecordatorios(prev =>
        prev.map(r =>
          r.id_recordatorio === id ? { ...r, completado: true } : r
        )
      );

    } catch (e) {
      console.error(e);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col">

      <div className="bg-[#8FAEE6] p-5 text-white flex items-center shadow-md">
        <button onClick={onBack} className="mr-4 text-xl"><FaArrowLeft /></button>
        <h1 className="text-xl font-semibold">Calendario</h1>
      </div>

      <div className="flex items-center justify-between px-6 pt-5">
        <button onClick={prevMonth}><FaChevronLeft /></button>
        <h2 className="text-lg font-semibold capitalize">{monthName} {year}</h2>
        <button onClick={nextMonth}><FaChevronRight /></button>
      </div>

      <div className="p-5">
        <div className="bg-white rounded-2xl shadow-lg p-4">

          <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-3">
            <p>L</p><p>M</p><p>Mi</p><p>J</p><p>V</p><p>S</p><p>D</p>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              if (!day) return <div key={i}></div>;

              const recordatoriosDia = recordatorios.filter(r => {
                const f = parseFechaLocal(r.fecha);
                return esMismoDia(f, day, month, year);
              });

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={`h-12 rounded-xl flex items-center justify-center text-sm relative
                  ${selectedDay === day ? "bg-[#8FAEE6] text-white" : "hover:bg-gray-100"}`}
                >
                  {day}

                  {recordatoriosDia.length > 0 && (
                    <div className="absolute bottom-1 flex gap-1">
                      {recordatoriosDia.slice(0,3).map((r,i) => (
                        <span key={i} className="text-xs">
                          {iconoTipo(r.tipo)}
                        </span>
                      ))}
                    </div>
                  )}

                </button>
              );
            })}
          </div>

        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">

        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaBell className="text-[#8FAEE6]" />
          Recordatorios del día
        </h3>

        <div className="space-y-3">

          {recordatoriosDelDia.length > 0 ? recordatoriosDelDia.map(r => {

            const estado = estadoRecordatorio(r);

            return (
              <div key={r.id_recordatorio} className="bg-white rounded-xl shadow-md p-4 flex justify-between">

                <div className="flex items-center gap-3">
                  {iconoTipo(r.tipo)}
                  <div>
                    <p className="text-sm text-gray-500">{r.hora}</p>
                    <p className="font-medium capitalize">{r.tipo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">

                  {estado === "puede_completar" && !r.completado && (
                    <button
                      onClick={() => completarRecordatorio(r.id_recordatorio)}
                      className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg"
                    >
                      Completar
                    </button>
                  )}

                  <div className={`px-3 py-1 rounded-full text-xs ${estiloEstado(estado)}`}>
                    {textoEstado(estado)}
                  </div>

                </div>

              </div>
            );

          }) : (
            <p className="text-gray-500 text-sm">No hay recordatorios este día</p>
          )}

        </div>
      </div>

    </div>
  );
}

export default Calendario;
