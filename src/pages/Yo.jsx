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
import api from "../config/api"; // ✅ Instancia de Axios corregida

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
        // 🔹 Cuidadores (Este servicio ya debería usar Axios internamente)
        const lista = await obtenerCuidadores(adultoLocal.id_adulto);
        setCuidadores(lista);

        // 🔹 Obtener código existente usando Axios
        const res = await api.get(`/invitaciones/${adultoLocal.id_adulto}`);
        const data = res.data;

        // 🔥 Si NO existe → generarlo
        if (!data.codigo) {
          const resGen = await api.post("/invitaciones/generar", { 
            id_adulto: adultoLocal.id_adulto 
          });
          setCodigoInvitacion(resGen.data.codigo);
        } else {
          setCodigoInvitacion(data.codigo);
        }

      } catch (error) {
        console.error("Error al cargar datos de perfil:", error);
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
      // ✅ Cambiamos fetch por api.put
      await api.put(`/adulto/${adultoLocal.id_adulto}`, { 
        peso, 
        altura 
      });
      alert("Datos actualizados correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al guardar los cambios");
    }
  };

  const copiarCodigo = () => {
    if (!codigoInvitacion) return;
    navigator.clipboard.writeText(codigoInvitacion);
    alert("Código copiado al portapapeles");
  };

  if (!usuario) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse font-medium">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-b from-[#eef5ff] to-[#f4f9f4]">

      {/* HEADER */}
      <div className="bg-[#6C8CD5] p-5 text-white flex items-center shadow-md shrink-0">
        <button onClick={onBack} className="mr-4 text-xl active:scale-90 transition-transform">
          <FaArrowLeft />
        </button>
        <h1 className="text-xl font-semibold">Mi Perfil</h1>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6 pb-24">

        {/* TARJETA DE DATOS PERSONALES */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-5 border border-blue-50">

          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-[#6C8CD5]">
               <FaUser size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Nombre</p>
              <p className="font-semibold text-lg text-gray-800">{usuario.nombre}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-[#6C8CD5]">
               <FaBirthdayCake size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Edad</p>
              <p className="font-semibold text-gray-800">
                {usuario.fecha_nacimiento
                  ? `${calcularEdad(usuario.fecha_nacimiento)} años`
                  : "No disponible"}
              </p>
            </div>
          </div>

          <hr className="opacity-50" />

          {/* PESO */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-[#6C8CD5]">
               <FaWeight size={20} />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1 ml-1">Peso (kg)</p>
              <input
                type="number"
                placeholder="0.0"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-[#6C8CD5] outline-none"
              />
            </div>
          </div>

          {/* ALTURA */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-[#6C8CD5]">
               <FaRulerVertical size={20} />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1 ml-1">Altura (m)</p>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-[#6C8CD5] outline-none"
              />
            </div>
          </div>

          <button
            onClick={guardarCambios}
            className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-600 active:scale-95 transition-all mt-2"
          >
            Actualizar mis datos
          </button>

        </div>

        {/* CUIDADORES */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-blue-50">

          <div className="flex items-center gap-3 mb-6">
            <FaUsers className="text-[#6C8CD5] text-2xl" />
            <h2 className="text-lg font-bold text-gray-800">Mis cuidadores</h2>
          </div>

          {/* CÓDIGO DE INVITACIÓN */}
          <div className="bg-blue-50 p-4 rounded-2xl mb-6">
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-black mb-2">
              Código para vincular cuidador
            </p>
            <div className="flex gap-2 items-center">
              <div className="flex-1 bg-white border border-blue-100 p-3 rounded-xl font-mono font-bold text-center text-xl text-blue-700 tracking-tighter">
                {loadingCodigo ? "..." : codigoInvitacion || "---"}
              </div>
              <button
                onClick={copiarCodigo}
                className="bg-white border border-blue-100 p-4 rounded-xl text-blue-500 active:bg-blue-100 transition-colors"
              >
                <FaCopy />
              </button>
            </div>
          </div>

          {/* LISTA CUIDADORES */}
          {cuidadores.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm italic">
                Aún no tienes cuidadores vinculados
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cuidadores.map((c) => (
                <div
                  key={c.id_cuidador}
                  className="p-4 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col"
                >
                  <p className="font-bold text-gray-800">{c.nombre}</p>
                  <p className="text-xs text-gray-400 font-medium">{c.correo}</p>
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