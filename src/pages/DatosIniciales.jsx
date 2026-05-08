import { useState } from "react";
import { FaUser, FaPhone, FaHome, FaLock, FaEnvelope, FaCopy, FaBirthdayCake } from "react-icons/fa";
import api from "../config/api";
function DatosIniciales({ onComplete, onBack }) {

  const [pantalla, setPantalla] = useState("form");
  const [loadingCorreo, setLoadingCorreo] = useState(false);
  const [codigoInvitacion, setCodigoInvitacion] = useState("");

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
      else if (!/^\d+$/.test(value)) error = "Solo números";
      else if (value.length !== 10) error = "Debe tener 10 dígitos";
    }

    if (name === "direccion") {
      if (value && value.length < 5) error = "Dirección muy corta";
    }

    if (name === "fechaNacimiento") {
      if (!value) {
        error = "La fecha es obligatoria";
      } else {
        const hoy = new Date();
        const fecha = new Date(value);

        const edad = hoy.getFullYear() - fecha.getFullYear();

        if (fecha > hoy) {
          error = "No puede ser futura";
        } else if (edad < 18) {
          error = "Debe ser mayor de edad";
        } else if (edad > 120) {
          error = "Edad no válida";
        }
      }
    }

    setErrores((prev) => ({ ...prev, [name]: error }));
  };

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "telefono" && !/^\d*$/.test(value)) return;

    setForm({ ...form, [name]: value });

    validarCampo(name, value);

    if (name === "correo" && value.length > 5) {
      try {
        setLoadingCorreo(true);
        const res = await fetch(`${API_URL}/verificar-correo?correo=${value}`);
        const data = await res.json();

        if (data.existe) {
          setErrores((prev) => ({
            ...prev,
            correo: "Este correo ya está registrado"
          }));
        }

        setLoadingCorreo(false);
      } catch {
        setLoadingCorreo(false);
      }
    }
  };

  /* =========================
     VALIDAR TODO
  ========================= */

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

    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          correo: form.correo,
          telefono: form.telefono,
          password: form.contraseña,
          fechaNacimiento: form.fechaNacimiento
        })
      });

      const data = await res.json();

      if (res.ok) {
        setCodigoInvitacion(data.codigo_invitacion);
        setPantalla("creada");
      } else {
        alert(data.message || "Error al crear usuario");
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  /* =========================
     FORMULARIO
  ========================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f7ff] to-[#eef5ff] p-6">

      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">

        <button onClick={onBack} className="text-indigo-600 text-sm mb-4">
          ← Volver
        </button>

        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Crear Cuenta
        </h1>

        {/* NOMBRE */}
        <div className="mb-3">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
            <FaUser />
            <input name="nombre" placeholder="Nombre completo"
              value={form.nombre} onChange={handleChange}
              className="bg-transparent w-full outline-none"/>
          </div>
          {errores.nombre && <p className="text-red-500 text-sm">{errores.nombre}</p>}
        </div>

        {/* FECHA */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-1">Fecha de nacimiento</p>
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
            <FaBirthdayCake />
            <input type="date" name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="bg-transparent w-full outline-none"/>
          </div>
          {errores.fechaNacimiento && <p className="text-red-500 text-sm">{errores.fechaNacimiento}</p>}
        </div>

        {/* CORREO */}
        <div className="mb-3">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
            <FaEnvelope />
            <input name="correo" placeholder="Correo"
              value={form.correo} onChange={handleChange}
              className="bg-transparent w-full outline-none"/>
          </div>
          {loadingCorreo && <p className="text-gray-400 text-sm">Verificando...</p>}
          {errores.correo && <p className="text-red-500 text-sm">{errores.correo}</p>}
        </div>

        {/* PASSWORD */}
        <div className="mb-3">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
            <FaLock />
            <input type="password" name="contraseña"
              placeholder="Contraseña"
              value={form.contraseña} onChange={handleChange}
              className="bg-transparent w-full outline-none"/>
          </div>
          {errores.contraseña && <p className="text-red-500 text-sm">{errores.contraseña}</p>}
        </div>

        {/* TELEFONO */}
        <div className="mb-3">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
            <FaPhone />
            <input name="telefono" placeholder="Teléfono (10 dígitos)"
              value={form.telefono} onChange={handleChange}
              className="bg-transparent w-full outline-none"/>
          </div>
          {errores.telefono && <p className="text-red-500 text-sm">{errores.telefono}</p>}
        </div>

        {/* DIRECCION */}
        <div className="mb-4">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
            <FaHome />
            <input name="direccion" placeholder="Dirección"
              value={form.direccion} onChange={handleChange}
              className="bg-transparent w-full outline-none"/>
          </div>
          {errores.direccion && <p className="text-red-500 text-sm">{errores.direccion}</p>}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-indigo-500 text-white rounded-xl font-semibold active:scale-95"
        >
          Crear Cuenta
        </button>

      </div>
    </div>
  );
}

export default DatosIniciales;