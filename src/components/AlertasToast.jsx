import React, { useEffect, useState } from "react";
// Importamos la instancia centralizada
import api from "../api"; 

export default function AlertasToast({ id_adulto }) {
  const [recordatorios, setRecordatorios] = useState([]);
  const [alertasActivas, setAlertasActivas] = useState([]);
  const [omitidos, setOmitidos] = useState([]);

  // 1. Cargar recordatorios del día
  const fetchRecordatorios = async () => {
    try {
      if (!id_adulto) return;
      // Usamos la ruta relativa
      const res = await api.get(`/alertas/${id_adulto}`);
      setRecordatorios(res.data);
    } catch (err) {
      console.error("Error al obtener alertas:", err);
    }
  };

  useEffect(() => {
    fetchRecordatorios();
    const interval = setInterval(fetchRecordatorios, 60000); // Refresca cada minuto
    return () => clearInterval(interval);
  }, [id_adulto]);

  // 2. Lógica del Reloj (Revisa si la hora de un recordatorio ya llegó)
  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();

      const nuevasAlertas = recordatorios.filter(r => {
        // Formateamos la fecha y hora para comparar
        const fechaHora = new Date(`${r.fecha} ${r.hora}`);
        
        return (
          fechaHora <= ahora &&
          !omitidos.includes(r.id_recordatorio) &&
          !alertasActivas.some(a => a.id_recordatorio === r.id_recordatorio)
        );
      });

      if (nuevasAlertas.length > 0) {
        setAlertasActivas(prev => [...prev, ...nuevasAlertas]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [recordatorios, alertasActivas, omitidos]);

  // 3. Acciones: Marcar como Hecho
  const marcarHecho = async (id_recordatorio) => {
    try {
      await api.post("/recordatorios/completar", {
        id_recordatorio,
        id_adulto
      });

      // Limpiar de la pantalla
      setAlertasActivas(prev => prev.filter(a => a.id_recordatorio !== id_recordatorio));
    } catch (err) {
      console.error("Error al completar:", err);
      alert("No se pudo marcar como completado");
    }
  };

  // 4. Acciones: Omitir (Solo visualmente por ahora)
  const omitir = (id_recordatorio) => {
    setAlertasActivas(prev => prev.filter(a => a.id_recordatorio !== id_recordatorio));
    setOmitidos(prev => [...prev, id_recordatorio]);
  };

  if (alertasActivas.length === 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999] p-4">
      <div className="space-y-4">
        {alertasActivas.map((r) => (
          <div
            key={r.id_recordatorio}
            className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl text-center animate-bounce-short"
          >
            <div className="text-6xl mb-4">💊</div>
            <h2 className="text-2xl font-bold text-gray-800">¡Es hora!</h2>
            <p className="text-xl font-medium text-blue-600 mt-2">{r.tipo}</p>
            <p className="text-gray-500 mt-1">Programado para las: {r.hora}</p>

            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={() => marcarHecho(r.id_recordatorio)}
                className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-lg hover:bg-green-600 transition-colors"
              >
                ✔ Marcar como hecho
              </button>
              <button
                onClick={() => omitir(r.id_recordatorio)}
                className="w-full bg-gray-100 text-gray-500 py-3 rounded-2xl hover:bg-gray-200 transition-colors"
              >
                Omitir por ahora
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}