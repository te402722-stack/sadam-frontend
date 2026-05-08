import api from "../config/api";

export const obtenerCuidadores = async (idAdulto) => {
  try {
    // ✅ Usamos la instancia 'api' que ya tiene la URL base configurada
    const res = await api.get(`/adulto/${idAdulto}/cuidadores`);

    // Con Axios, los datos vienen en la propiedad 'data'
    return res.data;
    
  } catch (error) {
    console.error("Error en obtenerCuidadores:", error);
    // Lanzamos el error para que el componente 'Yo.jsx' pueda capturarlo
    throw new Error(error.response?.data?.mensaje || "Error al obtener cuidadores");
  }
};