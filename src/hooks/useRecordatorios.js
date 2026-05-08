import { useEffect, useState, useRef } from "react";
import api from "../api";

export default function useRecordatorios(id_adulto) {

  const [activo, setActivo] = useState(null);
  const [olvidado, setOlvidado] = useState(null);
  const [proximos, setProximos] = useState([]);

  const audioReproducido = useRef(false);

  const revisarRecordatorios = async () => {

    if (!id_adulto) return;

    try {

      const response = await api.get(`/recordatorios/${id_adulto}`);

      const recordatorios = response.data;
      const ahora = new Date();

      let futuroMasCercano = null;
      let pasadoMasReciente = null;
      const futuros = [];

      for (const r of recordatorios) {

        const fechaHora = new Date(`${r.fecha}T${r.hora}`);

        if (fechaHora >= ahora) {

          futuros.push(r);

          if (
            !futuroMasCercano ||
            fechaHora < new Date(`${futuroMasCercano.fecha}T${futuroMasCercano.hora}`)
          ) {
            futuroMasCercano = r;
          }

        } else {

          if (
            !pasadoMasReciente ||
            fechaHora > new Date(`${pasadoMasReciente.fecha}T${pasadoMasReciente.hora}`)
          ) {
            pasadoMasReciente = r;
          }

        }

      }

      // ordenar futuros
      futuros.sort(
        (a, b) =>
          new Date(`${a.fecha}T${a.hora}`) -
          new Date(`${b.fecha}T${b.hora}`)
      );

      setActivo(futuroMasCercano);
      setOlvidado(pasadoMasReciente);
      setProximos(futuros);

      // 🔔 sonido SOLO si es muy cercano (opcional)
      if (futuroMasCercano) {

        const fechaHora = new Date(`${futuroMasCercano.fecha}T${futuroMasCercano.hora}`);
        const diffMin = (fechaHora - ahora) / 60000;

        if (diffMin <= 5 && diffMin >= 0 && !audioReproducido.current) {
          try {
            const audio = new Audio("/alarma.mp3");
            audio.play();
          } catch {}
          audioReproducido.current = true;
        }

      }

      if (!futuroMasCercano) {
        audioReproducido.current = false;
      }

    } catch (error) {
      console.error("Error cargando recordatorios:", error);
    }

  };

  useEffect(() => {

    revisarRecordatorios();

    const intervalo = setInterval(revisarRecordatorios, 60000);

    return () => clearInterval(intervalo);

  }, [id_adulto]);

  return {
    activo,
    olvidado,
    proximos
  };

}
