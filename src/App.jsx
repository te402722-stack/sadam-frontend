import { useState } from "react";
import { useEffect } from "react";

import Login from "./pages/Login";
import DatosIniciales from "./pages/DatosIniciales";
import Inicio from "./pages/Inicio";
import RegistrarActividad from "./pages/RegistrarActividad";
import RegistroExitoso from "./components/RegistroExitoso";
import Calendario from "./pages/Calendario";
import AutoCuidado from "./pages/AutoCuidado";
import Yo from "./pages/Yo";
import EstadoAnimo from "./pages/EstadoAnimo";
import Sintomas from "./pages/Sintomas";

import BottomNav from "./components/BottomNav";
import RecordatorioActivo from "./components/RecordatorioActivo";
import AlertaOlvido from "./components/AlertaOlvido";

import { solicitarPermisoNotificaciones } from "./utils/notificaciones";

import { getToken } from "firebase/messaging";
import { getMessagingSafe } from "./firebase";
import api from "./config/api";

function App() {

  const [pantalla, setPantalla] = useState("login");
  const [usuario, setUsuario] = useState(null);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  const mostrarExito = (mensaje) => {
    setMensajeExito(mensaje);
    setTimeout(() => setMensajeExito(null), 3000);
  };

  /* 🔔 Permiso inicial */
  useEffect(() => {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("Permiso de notificaciones activado 🔔");
      }
    });
  }, []);

  /* 🔥 OBTENER Y ENVIAR TOKEN (CORRECTO) */
useEffect(() => {
  const obtenerYEnviarToken = async () => {
    try {
      const messaging = await getMessagingSafe();
      if (!messaging) return;

      const token = await getToken(messaging, {
        vapidKey: "TU_VAPID_KEY" // Reemplaza esto con tu llave real de Firebase
      });

      console.log("TOKEN:", token);

      if (usuario?.id_adulto && token) {
        // Usamos 'api' que es lo que importaste arriba
        await api.post("/guardar-token", {
          id_adulto: usuario.id_adulto,
          token: token
        });
        console.log("✅ Token guardado en backend");
      }
    } catch (error) {
      console.log("Error obteniendo token:", error);
    }
  };

  if (usuario) {
    obtenerYEnviarToken();
  }
}, [usuario]);


  const renderPantalla = () => {

    switch (pantalla) {

      case "login":
        return (
          <Login
            onLogin={(usuario) => {
              setUsuario(usuario);
              setPantalla("inicio");
            }}
            onCreateAccount={() => setPantalla("datos")}
          />
        );

      case "datos":
        return (
          <DatosIniciales
            onComplete={(nombre) => {
              setUsuario(nombre);
              setPantalla("inicio");
            }}
            onBack={() => setPantalla("login")}
          />
        );

      case "inicio":
        return (
          <Inicio
            nombre={usuario?.nombre}
            onRegistrar={() => setPantalla("registrar")}
            onCalendario={() => setPantalla("calendario")}
            onCuidado={() => setPantalla("autoCuidado")}
            onYo={() => setPantalla("yo")}
            onAnimo={() => setPantalla("animo")}
            onSintomas={() => setPantalla("sintomas")}
          />
        );

      case "calendario":
        return <Calendario onBack={() => setPantalla("inicio")} />;

      case "autoCuidado":
        return <AutoCuidado onBack={() => setPantalla("inicio")} />;

      case "yo":
        return <Yo onBack={() => setPantalla("inicio")} />;

      case "registrar":
        return (
          <RegistrarActividad
            onSelect={(actividad) => {
              setActividadSeleccionada(actividad);
              mostrarExito("Actividad registrada correctamente");
            }}
            onBack={() => setPantalla("inicio")}
          />
        );

      case "animo":
        return (
          <EstadoAnimo
            onBack={() => setPantalla("inicio")}
            onGuardado={() => mostrarExito("Estado de ánimo registrado")}
          />
        );

      case "sintomas":
        return (
          <Sintomas
            onBack={() => setPantalla("inicio")}
            onGuardado={() => mostrarExito("Síntomas registrados correctamente")}
          />
        );

      default:
        return null;
    }
  };

  return (
  <div className="w-full h-screen flex flex-col overflow-hidden bg-white">

    {/* PANTALLA */}
    <div className="flex-1 overflow-hidden">
      {renderPantalla()}
    </div>

    {/* NAVBAR */}
    {pantalla !== "login" && pantalla !== "datos" && (
      <div className="shrink-0">
        <BottomNav
          activo={pantalla}
          onSelect={(pant) => setPantalla(pant)}
        />
      </div>
    )}

    {/* MENSAJE */}
    {mensajeExito && (
      <RegistroExitoso
        mensaje={mensajeExito}
        onCerrar={() => setMensajeExito(null)}
      />
    )}

  </div>
);
}

export default App;
