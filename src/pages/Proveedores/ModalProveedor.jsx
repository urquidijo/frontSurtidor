import { useEffect, useState } from "react";

const ModalProveedor = ({ proveedorSeleccionado, onClose, onSubmit }) => {
  const esEdicion = !!proveedorSeleccionado?.id;

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    direccion: "",
    nit: "",
    detalle: "",
    estado: "activo", // valor por defecto
  });

  const preventInvalidNumberInput = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (proveedorSeleccionado) {
      setFormData({
        nombre: proveedorSeleccionado.nombre || "",
        telefono: proveedorSeleccionado.telefono || "",
        correo: proveedorSeleccionado.correo || "",
        direccion: proveedorSeleccionado.direccion || "",
        nit: proveedorSeleccionado.nit || "",
        detalle: proveedorSeleccionado.detalle || "",
        estado: proveedorSeleccionado.estado || "activo",
      });
    }
  }, [proveedorSeleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
      <div className="bg-[#1f1f1f] text-[#f0f0f0] rounded-[12px] shadow-xl p-8 w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto animate-fadeIn">
        <h2 className="text-2xl font-semibold text-center text-[#00d1b2] mb-6">
          {esEdicion ? "Editar Proveedor" : "Crear Proveedor"}
        </h2>

        {["nombre", "telefono", "correo", "direccion", "nit"].map(
          (campo, index) => (
            <div className="mb-4" key={index}>
              <label className="block mb-1 capitalize font-bold text-[#ccc]">
                {campo}:
              </label>
              <input
                name={campo}
                type={["telefono", "nit"].includes(campo) ? "number" : "text"}
                onKeyDown={
                  ["telefono", "nit"].includes(campo)
                    ? preventInvalidNumberInput
                    : undefined
                }
                onWheel={(e) => e.target.blur()}
                autoComplete="off"
                value={formData[campo]}
                onChange={handleChange}
                className="w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors"
              />
            </div>
          )
        )}
        <div className="mb-6">
          <label className="block mb-1 font-bold text-[#ccc]">Estado:</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="frecuente">Frecuente</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-bold text-[#ccc]">Detalle:</label>
          <textarea
            name="detalle"
            value={formData.detalle}
            onChange={handleChange}
            className="w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] resize-none focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors"
          />
        </div>

        <div className="flex justify-between gap-4">
          <button
            className="bg-[#00bcd4] hover:bg-[#0097a7] text-white font-bold px-4 py-2 rounded-[10px] transition"
            onClick={() => onSubmit(formData)}
          >
            {esEdicion ? "Guardar" : "Crear"}
          </button>
          <button
            className="bg-[#444] hover:bg-[#666] text-white font-bold px-4 py-2 rounded-[10px] transition"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProveedor;
