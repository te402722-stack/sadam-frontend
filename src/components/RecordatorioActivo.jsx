import { CheckCircle, XCircle } from "lucide-react";
import api from "../config/api";

export default function RecordatorioActivo({ recordatorio, cerrar }) {

  // 🔒 protección
  if (!recordatorio) return null;

  const marcarHecho = async () => {
    try {
      // 2. Ya no necesitas la URL completa, solo el endpoint
      await api.patch(`/recordatorios/${recordatorio.id}`, { 
        estado: "completado" 
      });
      cerrar();
    } catch (error) {
      console.error("Error al marcar como hecho:", error);
    }
  };

  const omitir = async () => {
    try {
      await api.patch(`/recordatorios/${recordatorio.id}`, { 
        estado: "omitido" 
      });
      cerrar();
    } catch (error) {
      console.error("Error al omitir:", error);
    }
  };

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

      <div className="bg-white p-6 rounded-2xl shadow-xl w-80 animate-pop">

        <h2 className="text-xl font-bold text-blue-600 mb-2">
          Recordatorio
        </h2>

        <p className="text-gray-600 mb-6">
          {recordatorio.nombre}
        </p>

        <div className="flex justify-between">

          <button
            onClick={marcarHecho}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl"
          >
            <CheckCircle size={18}/>
            Hecho
          </button>

          <button
            onClick={omitir}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl"
          >
            <XCircle size={18}/>
            Omitir
          </button>

        </div>

      </div>

    </div>
  );
}