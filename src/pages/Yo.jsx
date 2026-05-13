import { useState, useEffect } from "react";
import {
  FaArrowLeft, FaUser, FaBirthdayCake, FaWeight, FaRulerVertical,
  FaUsers, FaCopy, FaCheckCircle, FaExclamationCircle,
  FaTint, FaMapMarkerAlt, FaPhoneAlt, FaStickyNote
} from "react-icons/fa";
import { obtenerCuidadores } from "../services/cuidadoresService";
import api from "../config/api";

function Yo({ onBack }) {
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    peso: "",
    altura: "",
    tipo_sangre: "",
    direccion: "",
    contacto_emergency: "",
    notas_medicas: "",
    fecha_nacimiento: ""
  });
  
  const [cuidadores, setCuidadores] = useState([]);
  const [codigoInvitacion, setCodigoInvitacion] = useState("");
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Importante: Asegúrate de que en el login guardas 'adulto' en el localStorage
      const adultoLocal = JSON.parse(localStorage.getItem("adulto"));
      if (!adultoLocal) return;

      try {
        // 1. Traer datos frescos del adulto desde la BD para ver cambios
        const resAdulto = await api.get(`/adulto/${adultoLocal.id_adulto}`);
        const datosBD = resAdulto.data;

        setUsuario(datosBD);
        setFormData({
          peso: datosBD.peso || "",
          altura: datosBD.altura || "",
          tipo_sangre: datosBD.tipo_sangre || "",
          direccion: datosBD.direccion || "",
          contacto_emergencia: datosBD.contacto_emergencia || "",
          notas_medicas: datosBD.notas_medicas || "",
          fecha_nacimiento: datosBD.fecha_nacimiento ? datosBD.fecha_nacimiento.split('T')[0] : ""
        });

        // 2. Traer Cuidadores
        const lista = await obtenerCuidadores(adultoLocal.id_adulto);
        setCuidadores(lista);

        // 3. Traer Código de Invitación
        // 3. Obtener código desde adulto_mayor
setCodigoInvitacion(datosBD.codigo_invitacion || "");

      } catch (error) {
        setMensaje({ texto: "No pudimos cargar toda su información", tipo: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const mostrarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const guardarCambios = async () => {
    setActualizando(true);
    try {
      await api.put(`/adulto/${usuario.id_adulto}`, formData);
      
      // Actualizar localmente
      const usuarioActualizado = { ...usuario, ...formData };
      localStorage.setItem("adulto", JSON.stringify(usuarioActualizado));
      setUsuario(usuarioActualizado);
      
      mostrarNotificacion("¡Información guardada con éxito!", "exito");
    } catch (error) {
      mostrarNotificacion("Hubo un error al guardar", "error");
    } finally {
      setActualizando(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Cargando sus datos...</div>;

  return (
    <div className="w-full h-screen flex flex-col bg-[#F8FAFC] relative overflow-hidden">
      
      {/* NOTIFICACIÓN */}
      {mensaje.texto && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl text-white font-bold animate-bounce ${mensaje.tipo === 'exito' ? 'bg-green-500' : 'bg-red-500'}`}>
          {mensaje.tipo === 'exito' ? <FaCheckCircle /> : <FaExclamationCircle />}
          {mensaje.texto}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-[#6C8CD5] p-6 text-white flex items-center shrink-0 shadow-lg">
        <button onClick={onBack} className="mr-4 text-2xl"><FaArrowLeft /></button>
        <h1 className="text-xl font-bold">Mi Información Personal</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-28">
        
        {/* TARJETA PRINCIPAL */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 space-y-6">
          
          {/* Nombre y Fecha (Solo lectura o edición simple) */}
          <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-500"><FaUser size={24}/></div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</p>
              <p className="text-xl font-black text-gray-800">{usuario?.nombre || "No registrado"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* FECHA DE NACIMIENTO */}
            <ItemInput 
              icon={<FaBirthdayCake/>} 
              label="Fecha de Nacimiento" 
              type="date" 
              value={formData.fecha_nacimiento}
              onChange={(v) => setFormData({...formData, fecha_nacimiento: v})}
            />

            <div className="grid grid-cols-2 gap-4">
               <ItemInput 
                icon={<FaWeight/>} 
                label="Peso (kg)" 
                type="number" 
                value={formData.peso}
                onChange={(v) => setFormData({...formData, peso: v})}
              />
               <ItemInput 
                icon={<FaRulerVertical/>} 
                label="Altura (m)" 
                type="number" 
                value={formData.altura}
                onChange={(v) => setFormData({...formData, altura: v})}
              />
            </div>

            <ItemInput 
              icon={<FaTint/>} 
              label="Tipo de Sangre" 
              placeholder="Ej: O+" 
              value={formData.tipo_sangre}
              onChange={(v) => setFormData({...formData, tipo_sangre: v})}
            />

            <ItemInput 
              icon={<FaMapMarkerAlt/>} 
              label="Dirección de Casa" 
              placeholder="Su dirección" 
              value={formData.direccion}
              onChange={(v) => setFormData({...formData, direccion: v})}
            />

            <ItemInput 
              icon={<FaPhoneAlt/>} 
              label="Contacto de Emergencia" 
              placeholder="Nombre o teléfono" 
              value={formData.contacto_emergencia}
              onChange={(v) => setFormData({...formData, contacto_emergencia: v})}
            />

            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notas Médicas</p>
              <textarea 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-700 font-medium focus:ring-2 focus:ring-blue-400"
                rows="3"
                placeholder="Alergias o condiciones..."
                value={formData.notas_medicas}
                onChange={(e) => setFormData({...formData, notas_medicas: e.target.value})}
              />
            </div>
          </div>

          <button
            onClick={guardarCambios}
            disabled={actualizando}
            className="w-full bg-green-500 text-white py-5 rounded-2xl font-black shadow-lg shadow-green-100 active:scale-95 transition-all"
          >
            {actualizando ? "GUARDANDO..." : "ACTUALIZAR MI PERFIL"}
          </button>
        </div>

        {/* SECCIÓN CUIDADORES Y CÓDIGO */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaUsers className="text-blue-500" />
            <h2 className="text-lg font-black text-gray-800">MI CÓDIGO DE AYUDA</h2>
          </div>

          <div className="bg-blue-50 p-6 rounded-[24px] text-center border-2 border-dashed border-blue-200">
            <p className="text-[10px] font-black text-blue-400 uppercase mb-2">Comparta este código con su cuidador</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-3xl font-mono font-black text-blue-700 tracking-widest">
                {codigoInvitacion || "---"}
              </span>
              <button onClick={() => {
                navigator.clipboard.writeText(codigoInvitacion);
                mostrarNotificacion("¡Código copiado!", "exito");
              }} className="p-3 bg-white rounded-xl text-blue-500 shadow-sm"><FaCopy/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente pequeño para los inputs para no repetir código
function ItemInput({ icon, label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-xl text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <input 
          type={type}
          step="any"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 border-none rounded-xl p-3 text-gray-700 font-bold focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>
    </div>
  );
}

export default Yo;