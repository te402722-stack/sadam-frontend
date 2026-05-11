import { useState } from "react";
import { FaUser, FaPhone, FaHome, FaLock, FaEnvelope, FaCopy, FaBirthdayCake, FaCheckCircle } from "react-icons/fa";
import api from "../config/api";

function DatosIniciales({ onComplete, onBack }) {
  const [pantalla, setPantalla] = useState("form"); // "form", "creando", "creada"
  const [loadingCorreo, setLoadingCorreo] = useState(false);
  const [codigoInvitacion, setCodigoInvitacion] = useState("");
  const [errorServidor, setErrorServidor] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: ""
  });

  const [errores, setErrores] = useState({});

  /* =========================
      VALIDACIONES
  ========================= */
  const validarCampo = (name, value) => {
    let error = "";

    if (name === "nombre") {
      if (!value) error = "El nombre es obligatorio";
      else if (value.length < 3) error = "Mínimo 3 caracteres";
    }

    if (name === "correo") {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = "El correo es obligatorio";
      else if (!regex.test(value)) error = "Correo no válido";
    }

    if (name === "contraseña") {
      if (!value) error = "La contraseña es obligatoria";
      else if (value.length < 6) error = "Mínimo 6 caracteres";
    }

    if (name === "telefono") {
      if (!value) error = "El teléfono es obligatorio";
      else if (value.length !== 10) error = "Debe tener 10 dígitos";
    }

    if (name === "fechaNacimiento") {
      if (!value) {
        error = "La fecha es obligatoria";
      } else {
        const hoy = new Date();
        const fecha = new Date(value);
        const edad = hoy.getFullYear() - fecha.getFullYear();
        if (fecha > hoy) error = "No puede ser futura";
        else if (edad < 18) error = "Debe ser mayor de edad";
      }
    }

    setErrores((prev) => ({ ...prev, [name]: error }));
  };

  /* =========================
      HANDLE CHANGE
  ========================= */
  const handleChange = async (e) => {
    const { name, value } = e.target;

    // Restricción de 10 dígitos para teléfono y solo números
    if (name === "telefono") {
      const soloNumeros = value.replace(/\D/g, "");
      if (soloNumeros.length > 10) return; 
      setForm({ ...form, [name]: soloNumeros });
      validarCampo(name, soloNumeros);
      return;
    }

    setForm({ ...form, [name]: value });
    validarCampo(name, value);

    if (name === "correo" && value.length > 5) {
      try {
        setLoadingCorreo(true);
        const res = await api.get("/verificar-correo", { params: { correo: value } });
        if (res.data.existe) {
          setErrores((prev) => ({ ...prev, correo: "Este correo ya está registrado" }));
        }
        setLoadingCorreo(false);
      } catch {
        setLoadingCorreo(false);
      }
    }
  };

  const validarTodo = () => {
    const nuevosErrores = {};
    Object.keys(form).forEach((campo) => {
      validarCampo(campo, form[campo]);
      if (!form[campo] && campo !== "direccion") {
        nuevosErrores[campo] = "Campo obligatorio";
      }
    });
    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every((e) => !e);
  };

  /* =========================
      SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!validarTodo()) return;
    setErrorServidor("");
    setPantalla("creando"); // Activamos animación de carga

    try {
      const res = await api.post("/usuarios", {
        nombre: form.nombre,
        correo: form.correo,
        telefono: form.telefono,
        password: form.contraseña,
        fecha_nacimiento: form.fechaNacimiento
      });

      if (res.status === 200 || res.status === 201) {
        setCodigoInvitacion(res.data.codigo_invitacion);
        // Pequeña pausa para que se vea el proceso "bonito"
        setTimeout(() => setPantalla("creada"), 1500);
      }
    } catch (error) {
      setPantalla("form"); // Regresamos al formulario si falla
      if (error.response) {
        setErrorServidor(error.response.data.mensaje || "Error al crear usuario");
      } else {
        setErrorServidor("Error al conectar con el servidor");
      }
    }
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoInvitacion);
    alert("¡Código copiado!");
  };

  /* =========================
      VISTAS
  ========================= */

  // 1. VISTA DE CARGA (PROCESANDO)
  if (pantalla === "creando") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <FaUser className="absolute text-indigo-600 text-3xl animate-pulse" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-800 animate-bounce">Creando tu cuenta...</h2>
        <p className="text-gray-500">Estamos preparando todo para ti.</p>
      </div>
    );
  }

  // 2. VISTA DE ÉXITO (CÓDIGO DE INVITACIÓN)
  if (pantalla === "creada") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center animate-fadeIn">
          <div className="flex justify-center mb-4">
            <FaCheckCircle className="text-green-500 text-6xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Cuenta creada con éxito!</h1>
          <p className="text-gray-600 mb-6">Este es tu código de invitación para tus cuidadores:</p>
          
          <div className="bg-indigo-50 p-4 rounded-2xl flex items-center justify-between border-2 border-dashed border-indigo-200 mb-6">
            <span className="text-3xl font-mono font-bold text-indigo-700 tracking-widest uppercase">
              {codigoInvitacion}
            </span>
            <button onClick={copiarCodigo} className="p-3 bg-white rounded-xl shadow-sm text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
              <FaCopy size={20} />
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-500 mb-8 leading-relaxed">
            Si deseas agregar a más cuidadores, tu código de invitación se encuentra siempre disponible en el apartado de <strong>"Yo"</strong>.
          </div>

          <button
            onClick={() => onComplete()}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  // 3. VISTA DE FORMULARIO (ORIGINAL)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f7ff] to-[#eef5ff] p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">
        <button onClick={onBack} className="text-indigo-600 text-sm mb-4 font-medium">
          ← Volver
        </button>

        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">Crear Cuenta</h1>

        {/* ERROR GENERAL DEL SERVIDOR */}
        {errorServidor && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 text-center border border-red-100">
            {errorServidor}
          </div>
        )}

        <div className="space-y-3">
          {/* NOMBRE */}
          <div>
            <div className={`flex items-center gap-3 bg-gray-100 rounded-xl p-3 transition-all ${errores.nombre ? 'ring-1 ring-red-400' : ''}`}>
              <FaUser className="text-gray-400" />
              <input name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={handleChange} className="bg-transparent w-full outline-none" />
            </div>
            {errores.nombre && <p className="text-red-500 text-xs mt-1 ml-2">{errores.nombre}</p>}
          </div>

          {/* FECHA */}
          <div>
            <p className="text-xs text-gray-500 mb-1 ml-1">Fecha de nacimiento</p>
            <div className={`flex items-center gap-3 bg-gray-100 rounded-xl p-3 transition-all ${errores.fechaNacimiento ? 'ring-1 ring-red-400' : ''}`}>
              <FaBirthdayCake className="text-gray-400" />
              <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} className="bg-transparent w-full outline-none" />
            </div>
            {errores.fechaNacimiento && <p className="text-red-500 text-xs mt-1 ml-2">{errores.fechaNacimiento}</p>}
          </div>

          {/* CORREO */}
          <div>
            <div className={`flex items-center gap-3 bg-gray-100 rounded-xl p-3 transition-all ${errores.correo ? 'ring-1 ring-red-400' : ''}`}>
              <FaEnvelope className="text-gray-400" />
              <input name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} className="bg-transparent w-full outline-none" />
            </div>
            {loadingCorreo && <p className="text-indigo-400 text-xs mt-1 ml-2">Verificando...</p>}
            {errores.correo && <p className="text-red-500 text-xs mt-1 ml-2">{errores.correo}</p>}
          </div>

          {/* PASSWORD */}
          <div>
            <div className={`flex items-center gap-3 bg-gray-100 rounded-xl p-3 transition-all ${errores.contraseña ? 'ring-1 ring-red-400' : ''}`}>
              <FaLock className="text-gray-400" />
              <input type="password" name="contraseña" placeholder="Contraseña" value={form.contraseña} onChange={handleChange} className="bg-transparent w-full outline-none" />
            </div>
            {errores.contraseña && <p className="text-red-500 text-xs mt-1 ml-2">{errores.contraseña}</p>}
          </div>

          {/* TELEFONO */}
          <div>
            <div className={`flex items-center gap-3 bg-gray-100 rounded-xl p-3 transition-all ${errores.telefono ? 'ring-1 ring-red-400' : ''}`}>
              <FaPhone className="text-gray-400" />
              <input name="telefono" placeholder="Teléfono (10 dígitos)" value={form.telefono} onChange={handleChange} className="bg-transparent w-full outline-none" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 ml-2">{form.telefono.length}/10 dígitos</p>
            {errores.telefono && <p className="text-red-500 text-xs mt-1 ml-2">{errores.telefono}</p>}
          </div>

          {/* DIRECCION */}
          <div className="mb-6">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
              <FaHome className="text-gray-400" />
              <input name="direccion" placeholder="Dirección (Opcional)" value={form.direccion} onChange={handleChange} className="bg-transparent w-full outline-none" />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all mt-4 hover:bg-indigo-600"
        >
          Crear Cuenta
        </button>
      </div>
    </div>
  );
}

export default DatosIniciales;