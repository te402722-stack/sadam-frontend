import actividad from "../assets/icons/actividad.svg";
import animo from "../assets/icons/animo.svg";
import sintomas from "../assets/icons/sintomas.svg";
import recordatorio from "../assets/icons/recordatorio.svg";

export const IconActividad = ({ className }) => (
  <img src={actividad} className={className} alt="Actividad" />
);

export const IconAnimo = ({ className }) => (
  <img src={animo} className={className} alt="Ánimo" />
);

export const IconSintomas = ({ className }) => (
  <img src={sintomas} className={className} alt="Síntomas" />
);

export const IconRecordatorio = ({ className }) => (
  <img src={recordatorio} className={className} alt="Recordatorio" />
);