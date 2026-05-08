export function solicitarPermisoNotificaciones() {

  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones");
    return;
  }

  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

}

export function mostrarNotificacion(titulo, mensaje) {

  if (Notification.permission === "granted") {

    new Notification(titulo, {
      body: mensaje,
      icon: "/logo192.png"
    });

  }

}