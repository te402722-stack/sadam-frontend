import React, { useEffect, useState, useRef } from "react";
import api from "../config/api";

export default function AlertasToast({ id_adulto }) {
  const [recordatorios, setRecordatorios] = useState([]);
  const [alertasActivas, setAlertasActivas] = useState([]);
  const [omitidos, setOmitidos] = useState([]);
  
  // Usamos una referencia para no duplicar sonidos
  const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"));

  // 1. Cargar recordatorios (Optimizado)
  const fetchRecordatorios = async () => {
    try {
      if (!id_adulto) return;
      const res = await api.get(`/alertas/${id_adulto}`);
      // Solo actualizamos si hay cambios reales para evitar re-renders infinitos
      setRecordatorios(res.data);
    } catch (err) {
      console.error("Error al obtener alertas:", err);
    }
  };

  useEffect(() => {
    fetchRecordatorios();
    const interval = setInterval(fetchRecordatorios, 30000); // Revisar el servidor cada 30s
    return () => clearInterval(interval);
  }, [id_adulto]);

  // 2. Lógica del Reloj (Comparación por Minuto Exacto)
  useEffect(() => {
    const timer = setInterval(() => {
      const ahora = new Date();
      const horaActualString = ahora.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });

      recordatorios.forEach(r => {
        // Normalizamos la hora del recordatorio (ej. "08:00:00" -> "08:00")
        const horaRecordatorio = r.hora.substring(0, 5);

        if (
          horaRecordatorio === horaActualString && 
          !omitidos.includes(r.id_recordatorio) &&
          !alertasActivas.some(a => a.id_recordatorio === r.id_recordatorio)
        ) {
          // ¡DISPARAR ALERTA!
          setAlertasActivas(prev => [...prev, r]);
          
          // Sonido de alerta (opcional, pero ayuda mucho dentro de la app)
          audioRef.current.play().catch(e => console.log("Esperando interacción para sonar"));
        }
      });
    }, 1000); // Chequea cada segundo para no perder el minuto exacto

    return () => clearInterval(timer);
  }, [recordatorios, alertasActivas, omitidos]);

  const marcarHecho = async (id_recordatorio) => {
    try {
      await api.post("/recordatorios/completar", { id_recordatorio, id_adulto });
      setAlertasActivas(prev => prev.filter(a => a.id_recordatorio !== id_recordatorio));
      audioRef.current.pause();
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const omitir = (id_recordatorio) => {
    setAlertasActivas(prev => prev.filter(a => a.id_recordatorio !== id_recordatorio));
    setOmitidos(prev => [...prev, id_recordatorio]);
    audioRef.current.pause();
  };

  if (alertasActivas.length === 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 z-[9999] p-6 backdrop-blur-md">
      <div className="space-y-4 w-full max-w-sm">
        {alertasActivas.map((r) => (
          <div
            key={r.id_recordatorio}
            className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center relative overflow-hidden"
          >
            {/* Decoración superior */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-600" />
            
            <div className="text-6xl mb-4 animate-bounce">🔔</div>
            <h2 className="text-2xl font-black text-slate-800">¡Recordatorio!</h2>
            
            <div className="my-4 p-4 bg-indigo-50 rounded-2xl">
              <p className="text-2xl font-black text-indigo-600 uppercase tracking-tight">
                {r.tipo}
              </p>
              <p className="text-slate-500 font-bold mt-1">Programado: {r.hora.substring(0, 5)}</p>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => marcarHecho(r.id_recordatorio)}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-all"
              >
                HECHO
              </button>
              <button
                onClick={() => omitir(r.id_recordatorio)}
                className="w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-2xl active:scale-95 transition-all"
              >
                Omitir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}