import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaUser,
  FaBirthdayCake,
  FaWeight,
  FaRulerVertical,
  FaUsers,
  FaCopy
} from "react-icons/fa";

import { obtenerCuidadores } from "../services/cuidadoresService";
import api from "../config/api";

function Yo({ onBack }) {

  const [usuario, setUsuario] = useState(null);
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [cuidadores, setCuidadores] = useState([]);
  const [codigoInvitacion, setCodigoInvitacion] = useState("");
  const [loadingCodigo, setLoadingCodigo] = useState(true);

  useEffect(() => {

    const fetchData = async () => {

      const adultoLocal = JSON.parse(localStorage.getItem("adulto"));
      if (!adultoLocal) return;

      setUsuario(adultoLocal);

      try {

        // 🔹 Cuidadores
        const lista = await obtenerCuidadores(adultoLocal.id_adulto);
        setCuidadores(lista);

        // 🔹 Obtener código existente
        const res = await fetch(
          `${API_URL}/invitaciones/${adultoLocal.id_adulto}`
        );

        const data = await res.json();

        // 🔥 Si NO existe → generarlo una sola vez
        if (!data.codigo) {

          const resGen = await fetch(
            `${API_URL}/invitaciones/generar`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_adulto: adultoLocal.id_adulto })
            }
          );

          const dataGen = await resGen.json();
          setCodigoInvitacion(dataGen.codigo);

        } else {
          setCodigoInvitacion(data.codigo);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCodigo(false);
      }
    };

    fetchData();

  }, []);

  const calcularEdad = (fecha) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  const guardarCambios = async () => {

    const adultoLocal = JSON.parse(localStorage.getItem("adulto"));

    try {

      await fetch(`${API_URL}/adulto/${adultoLocal.id_adulto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peso, altura })
      });

      alert("Datos actualizados correctamente");

    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  const copiarCodigo = () => {
    if (!codigoInvitacion) return;
    navigator.clipboard.writeText(codigoInvitacion);
    alert("Código copiado");
  };

  if (!usuario) {
    return <div className="p-6 text-gray-500">Cargando...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#eef5ff] to-[#f4f9f4]">

      {/* HEADER */}
      <div className="bg-[#6C8CD5] p-5 text-white flex items-center shadow-md">
        <button onClick={onBack} className="mr-4 text-xl">
          <FaArrowLeft />
        </button>
        <h1 className="text-xl font-semibold">Mi Perfil</h1>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">

        {/* PERFIL */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-5">

          <div className="flex items-center gap-4">
            <FaUser className="text-[#6C8CD5] text-2xl" />
            <div>
              <p className="text-gray-400 text-sm">Nombre</p>
              <p className="font-semibold text-lg">{usuario.nombre}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FaBirthdayCake className="text-[#6C8CD5] text-2xl" />
            <div>
              <p className="text-gray-400 text-sm">Edad</p>
              <p className="font-semibold">
                {usuario.fecha_nacimiento
                  ? `${calcularEdad(usuario.fecha_nacimiento)} años`
                  : "No disponible"}
              </p>
            </div>
          </div>

          {/* PESO */}
          <div className="flex items-center gap-4">
            <FaWeight className="text-[#6C8CD5] text-2xl" />
            <input
              type="number"
              placeholder="Peso (kg)"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#6C8CD5]"
            />
          </div>

          {/* ALTURA */}
          <div className="flex items-center gap-4">
            <FaRulerVertical className="text-[#6C8CD5] text-2xl" />
            <input
              type="number"
              step="0.01"
              placeholder="Altura (m)"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#6C8CD5]"
            />
          </div>

          <button
            onClick={guardarCambios}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold shadow-md hover:bg-green-600 transition"
          >
            Guardar cambios
          </button>

        </div>

        {/* CUIDADORES */}
        <div className="bg-white rounded-3xl shadow-lg p-6">

          <div className="flex items-center gap-3 mb-4">
            <FaUsers className="text-[#6C8CD5] text-2xl" />
            <h2 className="text-lg font-semibold">Mis cuidadores</h2>
          </div>

          {/* CÓDIGO */}
          <div className="bg-gray-50 p-4 rounded-xl mb-5">

            <p className="text-sm text-gray-500 mb-2">
              Código de invitación
            </p>

            <div className="flex gap-2 items-center">

              <div className="flex-1 bg-white border p-3 rounded-xl font-bold text-center">
                {loadingCodigo
                  ? "Generando..."
                  : codigoInvitacion || "Sin código"}
              </div>

              <button
                onClick={copiarCodigo}
                className="bg-gray-200 p-3 rounded-xl hover:bg-gray-300"
              >
                <FaCopy />
              </button>

            </div>

          </div>

          {/* LISTA CUIDADORES */}
          {cuidadores.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Aún no tienes cuidadores vinculados
            </p>
          ) : (
            <div className="space-y-3">
              {cuidadores.map((c) => (
                <div
                  key={c.id_cuidador}
                  className="p-3 border rounded-xl bg-gray-50"
                >
                  <p className="font-semibold">{c.nombre}</p>
                  <p className="text-sm text-gray-400">{c.correo}</p>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Yo;