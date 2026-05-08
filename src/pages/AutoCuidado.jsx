import { useEffect, useState } from "react";
import { FaSpa, FaSmile, FaTint, FaPills, FaHeartbeat } from "react-icons/fa";
import API_URL from "../config/api";

function AutoCuidado({ irAEstadoAnimo }) {

  const [animoHoy, setAnimoHoy] = useState(null);

  const [resumen, setResumen] = useState({
    agua: 0,
    medicamentos: 0,
    animoFrecuente: "-",
    sintomaFrecuente: "-"
  });

  const [loading, setLoading] = useState(true);

  const consejos = [
    "Recuerda beber agua durante el día 💧",
    "Tómate un momento para respirar profundo 🌿",
    "Camina unos pasos para mantenerte activo 🚶",
    "Sal un momento al aire libre ☀️",
  ];

  const consejoHoy = consejos[Math.floor(Math.random() * consejos.length)];

  useEffect(() => {

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario || !usuario.id_adulto) {
      console.error("No hay adulto logueado");
      setLoading(false);
      return;
    }

    const cargarDatos = async () => {
      try {

        // 🔥 1. RESUMEN
        const resResumen = await fetch(`${API_URL}/resumen/${usuario.id_adulto}`);
        const dataResumen = await resResumen.json();

        setResumen({
          agua: dataResumen.agua || 0,
          medicamentos: dataResumen.medicamentos || 0,
          animoFrecuente: dataResumen.animoFrecuente || "-",
          sintomaFrecuente: dataResumen.sintomaFrecuente || "-"
        });

        // 🔥 2. DASHBOARD (AQUÍ VIENE EL ÁNIMO REAL)
        const resDashboard = await fetch(`${API_URL}/dashboard-datos/${usuario.id_adulto}`);
        const dataDashboard = await resDashboard.json();

        if (dataDashboard.estado_animo && dataDashboard.estado_animo !== "Sin registro") {
          setAnimoHoy(dataDashboard.estado_animo);
        }

      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();

  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Cargando información...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col p-6 gap-6">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="bg-green-100 p-3 rounded-xl">
          <FaSpa className="text-green-600 text-xl"/>
        </div>

        <h1 className="text-2xl font-bold text-gray-700">
          Autocuidado
        </h1>
      </div>

      {/* ESTADO DE ANIMO */}
      <div className="bg-white rounded-2xl shadow-md p-5">

        <div className="flex items-center gap-2 mb-3">
          <FaSmile className="text-yellow-500"/>
          <h2 className="font-semibold text-gray-700">
            Estado de ánimo de hoy
          </h2>
        </div>

        {animoHoy ? (

          <div className="flex justify-between items-center">
            <span className="text-3xl">{animoHoy}</span>

            <p className="text-gray-500 text-sm">
              Ya registraste cómo te sientes hoy
            </p>
          </div>

        ) : (

          <div className="flex flex-col gap-3">

            <p className="text-gray-500">
              Aún no registras cómo te sientes hoy
            </p>

            <button
              onClick={irAEstadoAnimo}
              className="bg-[#F28B82] text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Registrar estado de ánimo
            </button>

          </div>

        )}

      </div>

      {/* CONSEJO */}
      <div className="bg-yellow-50 rounded-2xl shadow-md p-5">
        <h2 className="font-semibold text-gray-700 mb-2">
          Consejo del día
        </h2>
        <p className="text-gray-600">
          {consejoHoy}
        </p>
      </div>

      {/* RESUMEN */}
      <div className="bg-white rounded-2xl shadow-md p-5">

        <h2 className="font-semibold text-gray-700 mb-4">
          Resumen de bienestar
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <div className="bg-blue-50 p-4 rounded-xl text-center">
            <FaTint className="mx-auto text-blue-500 text-xl mb-1"/>
            <p className="text-lg font-bold text-blue-600">
              {resumen.agua}
            </p>
            <p className="text-xs text-gray-500">
              Días que tomó agua
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-xl text-center">
            <FaPills className="mx-auto text-green-500 text-xl mb-1"/>
            <p className="text-lg font-bold text-green-600">
              {resumen.medicamentos}
            </p>
            <p className="text-xs text-gray-500">
              Medicamentos tomados
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl text-center">
            <FaSmile className="mx-auto text-yellow-500 text-xl mb-1"/>
            <p className="text-lg font-bold text-yellow-600">
              {resumen.animoFrecuente}
            </p>
            <p className="text-xs text-gray-500">
              Ánimo más frecuente
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-xl text-center">
            <FaHeartbeat className="mx-auto text-red-500 text-xl mb-1"/>
            <p className="text-lg font-bold text-red-600">
              {resumen.sintomaFrecuente}
            </p>
            <p className="text-xs text-gray-500">
              Síntoma más frecuente
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AutoCuidado;