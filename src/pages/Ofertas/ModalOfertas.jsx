import { useEffect, useState } from "react";
import { showToast } from "../../utils/toastUtils";
import API_URL from "../../config/config";

const ModalOferta = ({
  ofertaSeleccionada,
  onClose,
  onCrear,
  onActualizar,
}) => {
  const esEdicion = !!ofertaSeleccionada?.id;
  const usuarioId = sessionStorage.getItem("usuarioId");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    porcentaje: "",
    esta_activo: true,
  });

  useEffect(() => {
    if (ofertaSeleccionada) {
      setFormData({
        nombre: ofertaSeleccionada.nombre || "",
        descripcion: ofertaSeleccionada.descripcion || "",
        porcentaje: ofertaSeleccionada.porcentaje || "",
        esta_activo: ofertaSeleccionada.esta_activo ?? true,
      });
    }
  }, [ofertaSeleccionada]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const porcentaje = parseFloat(formData.porcentaje);
    if (isNaN(porcentaje) || porcentaje <= 0 || porcentaje > 100) {
      showToast(
        "warning",
        "El porcentaje debe ser mayor a 0 y menor o igual a 100."
      );
      if (esEdicion) {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "actualizar descuento",
            estado: "fallido",
          }),
        });
      } else {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "crear descuento",
            estado: "fallido",
          }),
        });
      }
      return;
    }
    if (esEdicion) {
      onActualizar(ofertaSeleccionada.id, formData);
    } else {
      onCrear(formData);
    }
    onClose();
  };
  const preventInvalidNumberInput = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
      <div className="bg-[#1f1f1f] text-white rounded-[12px] shadow-xl p-8 w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto animate-fadeIn">
        <h2 className="text-2xl font-semibold text-center text-[#00d1b2] mb-6">
          {esEdicion ? "Editar Descuento" : "Crear Descuento"}
        </h2>

        <label htmlFor="nombre" className="block mb-2 text-[#ccc] font-medium">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          autoComplete="off"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c]"
        />

        <label
          htmlFor="descripcion"
          className="block mt-4 mb-2 text-[#ccc] font-medium"
        >
          Descripción
        </label>
        <input
          id="descripcion"
          name="descripcion"
          autoComplete="off"
          value={formData.descripcion}
          onChange={handleChange}
          className="w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c]"
        />

        <label
          htmlFor="porcentaje"
          className="block mt-4 mb-2 text-[#ccc] font-medium"
        >
          Porcentaje (%)
        </label>
        <input
          id="porcentaje"
          name="porcentaje"
          type="number"
          onKeyDown={preventInvalidNumberInput}
          onWheel={(e) => e.target.blur()}
          value={formData.porcentaje}
          onChange={handleChange}
          className="w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c]"
        />

        <div className="flex items-center justify-between mt-6 mb-4">
          <span className="text-[#ccc] font-medium">Activo</span>
          <label className="relative inline-block w-11 h-6">
            <input
              type="checkbox"
              name="esta_activo"
              checked={formData.esta_activo}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="absolute inset-0 bg-gray-600 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
          </label>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleSubmit}
            className="bg-[#00d1b2] text-white px-5 py-2 rounded-lg hover:bg-[#00bfa5] transition-colors"
          >
            {esEdicion ? "Guardar" : "Crear"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalOferta;
