import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaUser,
  FaBirthdayCake,
  FaWeight,
  FaRulerVertical,
  FaUsers,
  FaCopy,
  FaCheckCircle,
  FaExclamationCircle
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
  
  // Estados para mensajes en pantalla
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" }); // tipo: "exito" o "error"
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const adultoLocal = JSON.parse(localStorage.getItem("adulto"));
      if (!adultoLocal) return;

      setUsuario(adultoLocal);
      // Inicializar peso y altura con lo que ya tenga el usuario
      setPeso(adultoLocal.peso || "");
      setAltura(adultoLocal.altura || "");

      try {
        const lista = await obtenerCuidadores(adultoLocal.id_adulto);
        setCuidadores(lista);

        const res = await api.get(`/invitaciones/${adultoLocal.id_adulto}`);
        
        if (!res.data.codigo) {
          const resGen = await api.post("/invitaciones/generar", { 
            id_adulto: adultoLocal.id_adulto 
          });
          setCodigoInvitacion(resGen.data.codigo);
        } else {
          setCodigoInvitacion(res.data.codigo);
        }
      } catch (error) {
        setMensaje({ texto: "Error al cargar la información del perfil", tipo: "error" });
      } finally {
        setLoadingCodigo(false);
      }
    };

    fetchData();
  }, []);

  // Función para mostrar mensajes temporales
  const mostrarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

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
    if (actualizando) return;
    setActualizando(true);
    
    try {
      // ✅ Enviamos los datos a la API
      const res = await api.put(`/adulto/${usuario.id_adulto}`, { 
        peso: parseFloat(peso), 
        altura: parseFloat(altura) 
      });
      
      // ✅ Actualizamos el localStorage para que los cambios persistan al recargar
      const nuevoAdulto = { ...usuario, peso, altura };
      localStorage.setItem("adulto", JSON.stringify(nuevoAdulto));
      setUsuario(nuevoAdulto);

      mostrarNotificacion("Datos actualizados correctamente", "exito");
    } catch (error) {
      mostrarNotificacion("No se pudieron guardar los cambios", "error");
    } finally {
      setActualizando(false);
    }
  };

  const copiarCodigo = () => {
    if (!codigoInvitacion) return;
    navigator.clipboard.writeText(codigoInvitacion);
    mostrarNotificacion("Código copiado al portapapeles", "exito");
  };

  if (!usuario) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-b from-[#eef5ff] to-[#f4f9f4] relative">

      {/* MENSAJE FLOTANTE INTERNO (REEMPLAZA AL ALERT) */}
      {mensaje.texto && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-2xl shadow-2xl animate-bounce-in text-white font-bold ${
          mensaje.tipo === "exito" ? "bg-green-500" : "bg-red-500"
        }`}>
          {mensaje.tipo === "exito" ? <FaCheckCircle /> : <FaExclamationCircle />}
          {mensaje.texto}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-[#6C8CD5] p-5 text-white flex items-center shadow-md shrink-0">
        <button onClick={onBack} className="mr-4 text-xl active:scale-90 transition-transform">
          <FaArrowLeft />
        </button>
        <h1 className="text-xl font-semibold">Mi Perfil</h1>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6 pb-24">

        {/* TARJETA DE DATOS PERSONALES */}
        <div className="bg-white rounded-[32px] shadow-xl p-6 space-y-5 border border-blue-50 animate-fade-in-up">

          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-[#6C8CD5]">
               <FaUser size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black">Nombre</p>
              <p className="font-bold text-lg text-gray-800">{usuario.nombre}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-[#6C8CD5]">
               <FaBirthdayCake size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black">Edad</p>
              <p className="font-bold text-gray-800 text-lg">
                {usuario.fecha_nacimiento
                  ? `${calcularEdad(usuario.fecha_nacimiento)} años`
                  : "No disponible"}
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* PESO */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-[#6C8CD5]">
               <FaWeight size={20} />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black mb-1 ml-1">Peso (kg)</p>
              <input
                type="number"
                placeholder="Ej. 70.5"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-[#6C8CD5] outline-none transition-all font-bold text-gray-700"
              />
            </div>
          </div>

          {/* ALTURA */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-[#6C8CD5]">
               <FaRulerVertical size={20} />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black mb-1 ml-1">Altura (m)</p>
              <input
                type="number"
                step="0.01"
                placeholder="Ej. 1.70"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-[#6C8CD5] outline-none transition-all font-bold text-gray-700"
              />
            </div>
          </div>

          <button
            onClick={guardarCambios}
            disabled={actualizando}
            className={`w-full py-4 rounded-[20px] font-black uppercase tracking-widest text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                actualizando ? "bg-gray-300 text-gray-500" : "bg-green-500 text-white shadow-green-100 hover:bg-green-600"
            }`}
          >
            {actualizando ? "Guardando..." : "Actualizar mis datos"}
          </button>

        </div>

        {/* CUIDADORES */}
        <div className="bg-white rounded-[32px] shadow-xl p-6 border border-blue-50 animate-fade-in-up delay-100">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-[#6C8CD5] rounded-full"></div>
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">Mis cuidadores</h2>
          </div>

          {/* CÓDIGO DE INVITACIÓN */}
          <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-[24px] mb-6">
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-black mb-3 text-center">
              Tu código de vinculación
            </p>
            <div className="flex gap-3 items-center">
              <div className="flex-1 bg-white border-2 border-dashed border-blue-200 p-4 rounded-2xl font-mono font-black text-center text-2xl text-blue-700 tracking-widest shadow-inner uppercase">
                {loadingCodigo ? "..." : codigoInvitacion || "---"}
              </div>
              <button
                onClick={copiarCodigo}
                className="bg-white border border-blue-100 p-4 rounded-2xl text-blue-500 shadow-sm active:bg-blue-600 active:text-white transition-all"
              >
                <FaCopy size={20} />
              </button>
            </div>
          </div>

          {/* LISTA CUIDADORES */}
          <div className="space-y-3">
            {cuidadores.length === 0 ? (
              <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl py-8 text-center px-4">
                <p className="text-gray-400 text-sm font-medium italic">
                  Aún no tienes cuidadores vinculados
                </p>
              </div>
            ) : (
              cuidadores.map((c) => (
                <div
                  key={c.id_cuidador}
                  className="p-4 border border-gray-100 rounded-2xl bg-gradient-to-r from-gray-50 to-white flex items-center justify-between shadow-sm"
                >
                  <div>
                    <p className="font-black text-gray-800">{c.nombre}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{c.correo}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <FaUser size={12} />
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Yo;