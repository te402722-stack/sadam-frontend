import API_URL from "../config/api";
export const obtenerCuidadores = async (idAdulto) => {

  const res = await fetch(`${API_URL}/adulto/${idAdulto}/cuidadores`);

  if (!res.ok) {
    throw new Error("Error al obtener cuidadores");
  }

  const data = await res.json();

  return data;

};