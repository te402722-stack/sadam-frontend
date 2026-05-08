import { AlertTriangle } from "lucide-react";

export default function AlertaOlvido({ recordatorio, cerrar }) {

  // 🔒 evitar error si aún no hay recordatorio
  if (!recordatorio) return null;

  return (

    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-pulse z-40">

      <AlertTriangle size={22}/>

      <span>
        Olvidaste: {recordatorio.nombre}
      </span>

      <button
        onClick={cerrar}
        className="ml-3 font-bold"
      >
        ✕
      </button>

    </div>

  );

}