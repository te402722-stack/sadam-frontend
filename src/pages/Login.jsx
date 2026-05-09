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

  setCargando(true);

  try {

    const res = await api.post("/login", {
      correo,
      password
    });

    const usuario = res.data.usuario;

    localStorage.setItem("usuario", JSON.stringify(usuario));
    localStorage.setItem("adulto", JSON.stringify(usuario));

    const id_adulto = usuario.id_adulto;

    if (id_adulto) {
      localStorage.setItem("id_adulto", id_adulto.toString());
    }

    console.log("ID adulto guardado:", id_adulto);

    if (onLogin) {
      onLogin(usuario);
    }

  } catch (err) {

    console.error("ERROR LOGIN:", err);

    if (err.response) {
      setError(err.response.data.mensaje || "Error en login");
    } else {
      setError("No se pudo conectar con el servidor.");
    }

  } finally {

    setCargando(false);

  }

};

  return (

    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-[#e9edff] to-white">

      <div className="w-[380px] bg-white p-8 rounded-3xl shadow-xl">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">

          <img src="/logo.png" alt="logo" className="w-20 mb-2"/>

          <h1 className="text-2xl font-bold text-[#6C63FF]">
            SADAM
          </h1>

          <p className="text-gray-500 text-sm text-center">
            Sistema de acompañamiento
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* CORREO */}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e)=>setCorreo(e.target.value)}
          className="w-full p-3 border rounded-xl mb-3"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full p-3 border rounded-xl mb-4"
        />

        {/* LOGIN */}
        <button
          onClick={handleLogin}
          disabled={cargando}
          className="w-full bg-[#6C63FF] text-white py-3 rounded-xl font-semibold mb-3"
        >
          {cargando ? "Ingresando..." : "Iniciar sesión"}
        </button>

        {/* CREAR CUENTA */}
        <button
          onClick={onCreateAccount}
          className="w-full border-2 border-[#6C63FF] text-[#6C63FF] py-3 rounded-xl font-semibold mb-4"
        >
          Crear cuenta
        </button>


      </div>

    </div>

  );
}

export default Login;