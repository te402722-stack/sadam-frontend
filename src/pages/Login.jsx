import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import api from "../config/api";

function Login({ onLogin, onCreateAccount }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const validarEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async () => {
    setError("");

    if (!correo.trim() || !password.trim()) {
      setError("Debes completar todos los campos.");
      return;
    }

    if (!validarEmail(correo)) {
      setError("El correo electrónico no es válido.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Activamos el estado de carga
    setCargando(true);

    try {
      const res = await api.post("/login", {
        correo,
        password,
      });

      const usuario = res.data.usuario;

      // Guardamos en localStorage como ya lo hacías
      localStorage.setItem("usuario", JSON.stringify(usuario));
      localStorage.setItem("adulto", JSON.stringify(usuario));

      const id_adulto = usuario.id_adulto;

      if (id_adulto) {
        localStorage.setItem("id_adulto", id_adulto.toString());
      }

      console.log("ID adulto guardado:", id_adulto);

      // Pequeña pausa de 1 segundo para que el usuario aprecie la animación 
      // de éxito antes de pasar a la siguiente pantalla
      setTimeout(() => {
        if (onLogin) {
          onLogin(usuario);
        }
      }, 1000);

    } catch (err) {
      console.error("ERROR LOGIN:", err);
      // Solo quitamos el cargando si hay un error para que el usuario pueda corregir
      setCargando(false);

      if (err.response) {
        setError(err.response.data.mensaje || "Error en login");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-b from-[#e9edff] to-white overflow-hidden">
      
      {/* --- OVERLAY DE CARGA (Aparece sobre todo) --- */}
      {cargando && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md transition-all duration-500">
          <div className="relative flex items-center justify-center">
            {/* Círculo animado exterior */}
            <div className="w-24 h-24 border-8 border-[#6C63FF]/20 border-t-[#6C63FF] rounded-full animate-spin"></div>
            {/* Logo o icono central con pulso */}
            <div className="absolute">
              <div className="w-10 h-10 bg-[#6C63FF] rounded-lg animate-pulse shadow-lg shadow-[#6C63FF]/50 rotate-45"></div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-[#6C63FF] animate-bounce">
              Iniciando sesión
            </h2>
            <p className="text-gray-500 font-medium tracking-widest uppercase text-[10px]">
              Espera un momento
            </p>
          </div>
        </div>
      )}

      {/* --- CONTENEDOR DEL LOGIN --- */}
      <div 
        className={`w-[380px] bg-white p-8 rounded-3xl shadow-2xl transition-all duration-700 ${
          cargando ? "scale-90 opacity-20 blur-md" : "scale-100 opacity-100"
        }`}
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="logo" className="w-20 mb-2 hover:scale-110 transition-transform duration-300" />
          <h1 className="text-2xl font-bold text-[#6C63FF]">SADAM</h1>
          <p className="text-gray-500 text-sm text-center">
            Sistema de acompañamiento
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        {/* CAMPOS DE TEXTO */}
        <div className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={cargando}
              className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={cargando}
              className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all"
            />
          </div>
        </div>

        {/* ACCIONES */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleLogin}
            disabled={cargando}
            className="w-full bg-[#6C63FF] text-white py-3 rounded-xl font-bold shadow-lg shadow-[#6C63FF]/30 hover:bg-[#5a52d4] active:scale-95 transition-all disabled:bg-gray-400"
          >
            {cargando ? "Validando..." : "Iniciar sesión"}
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 h-[1px] bg-gray-200"></div>
            <span className="px-3 text-gray-400 text-xs uppercase">o</span>
            <div className="flex-1 h-[1px] bg-gray-200"></div>
          </div>

          <button
            onClick={onCreateAccount}
            disabled={cargando}
            className="w-full border-2 border-[#6C63FF] text-[#6C63FF] py-3 rounded-xl font-bold hover:bg-[#6C63FF]/5 active:scale-95 transition-all"
          >
            Crear cuenta
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default Login;