import { useState, useEffect } from "react";

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
import AlertasToast from "./components/AlertasToast"; // <--- Importamos el nuevo sistema

import { getToken } from "firebase/messaging";
import { getMessagingSafe } from "./firebase";
import api from "./config/api";

function App() {
  const [pantalla, setPantalla] = useState("login");
  const [usuario, setUsuario] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  // Extraemos el ID del adulto de forma segura
  const id_adulto = usuario?.id_adulto || localStorage.getItem("id_adulto");

  const mostrarExito = (mensaje) => {
    setMensajeExito(mensaje);
    setTimeout(() => setMensajeExito(null), 3000);
  };

  /* 🔔 Permiso inicial para Notificaciones de Sistema */
  useEffect(() => {

  const obtenerYEnviarToken = async () => {

  try {

    const permiso = await Notification.requestPermission();

    console.log("Permiso:", permiso);

    if (permiso !== "granted") {
      console.log("❌ Notificaciones bloqueadas");
      return;
    }

    const messaging = await getMessagingSafe();

    if (!messaging) return;

    console.log("🔥 Obteniendo token...");

    const token = await getToken(messaging, {
      vapidKey: "BNFJ63aLJFkhYI17rBCdDV_VvN9n123wqrkRqLCQ9cKJBkvHgBGpk1P8PyOkfSelQPINXD_0_CNokp24C53kOC4"
    });

    console.log("TOKEN:", token);

    if (id_adulto && token) {

      await api.post("/guardar-token", {
        id_adulto,
        token
      });

      console.log("✅ Token guardado en backend");
    }

  } catch (error) {

    console.log("❌ ERROR FIREBASE:", error);

  }
};

  if (usuario) {
    obtenerYEnviarToken();
  }

}, [usuario, id_adulto]);

  const renderPantalla = () => {
    switch (pantalla) {
      case "login":
        return (
          <Login
            onLogin={(u) => {
              setUsuario(u);
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
            irAEstadoAnimo={() => setPantalla("animo")}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-white">
      
      {/* 🔔 SISTEMA DE ALERTAS OMNIPRESENTE */}
      {/* Solo se activa si hay un usuario logueado */}
      {id_adulto && <AlertasToast id_adulto={id_adulto} />}

      {/* PANTALLA ACTUAL */}
      <div className="flex-1 overflow-hidden">
        {renderPantalla()}
      </div>

      {/* NAVBAR INFERIOR */}
      {pantalla !== "login" && pantalla !== "datos" && (
        <div className="shrink-0">
          <BottomNav
            activo={pantalla}
            onSelect={(pant) => setPantalla(pant)}
          />
        </div>
      )}

      {/* FEEDBACK DE ÉXITO */}
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
