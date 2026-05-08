import { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";

function RegistroExitoso({ mensaje, onClose }) {

  useEffect(() => {

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 2000);

    return () => clearTimeout(timer);

  }, [onClose]);

  return (

    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl p-10 flex flex-col items-center shadow-xl animate-bounce">

        <FaCheckCircle className="text-green-500 text-6xl mb-4"/>

        <h2 className="text-xl font-bold text-gray-700">
          Registro exitoso
        </h2>

        <p className="text-gray-500 mt-2 text-center">
          {mensaje}
        </p>

      </div>

    </div>

  );
}

export default RegistroExitoso;