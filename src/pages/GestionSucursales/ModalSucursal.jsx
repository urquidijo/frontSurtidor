import { useState, useEffect } from "react";
import { X } from "lucide-react";

const ModalSucursal = ({ sucursalSeleccionada, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    correo: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const esEdicion = !!sucursalSeleccionada?.id;

  useEffect(() => {
    if (esEdicion) {
      setFormData({
        nombre: sucursalSeleccionada.nombre || "",
        direccion: sucursalSeleccionada.direccion || "",
        telefono: sucursalSeleccionada.telefono || "",
        correo: sucursalSeleccionada.correo || "",
      });
    } else {
      setFormData({
        nombre: "",
        direccion: "",
        telefono: "",
        correo: "",
      });
    }
    setErrors({});
  }, [sucursalSeleccionada, esEdicion]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es obligatoria";
    } else if (formData.direccion.length < 5) {
      newErrors.direccion = "La dirección debe tener al menos 5 caracteres";
    }

    if (formData.telefono && !/^\d{7,15}$/.test(formData.telefono.replace(/\s/g, ""))) {
      newErrors.telefono = "El teléfono debe tener entre 7 y 15 dígitos";
    }

    if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = "El correo debe tener un formato válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error específico cuando el usuario comience a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#1f1f1f] text-[#f0f0f0] rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-[#444]">
          <h2 className="text-xl font-bold text-[#00d1b2]">
            {esEdicion ? "Editar Sucursal" : "Nueva Sucursal"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#ccc] mb-2">
              Nombre de la Sucursal *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-[#2a2a2a] border rounded-md text-white focus:outline-none focus:ring-2 transition ${
                errors.nombre
                  ? "border-red-500 focus:ring-red-500"
                  : "border-[#444] focus:ring-[#00d1b2] focus:border-[#00d1b2]"
              }`}
              placeholder="Ingrese el nombre de la sucursal"
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#ccc] mb-2">
              Dirección *
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-[#2a2a2a] border rounded-md text-white focus:outline-none focus:ring-2 transition ${
                errors.direccion
                  ? "border-red-500 focus:ring-red-500"
                  : "border-[#444] focus:ring-[#00d1b2] focus:border-[#00d1b2]"
              }`}
              placeholder="Ingrese la dirección completa"
              disabled={isSubmitting}
            />
            {errors.direccion && (
              <p className="text-red-400 text-sm mt-1">{errors.direccion}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#ccc] mb-2">
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-[#2a2a2a] border rounded-md text-white focus:outline-none focus:ring-2 transition ${
                errors.telefono
                  ? "border-red-500 focus:ring-red-500"
                  : "border-[#444] focus:ring-[#00d1b2] focus:border-[#00d1b2]"
              }`}
              placeholder="Número de teléfono (opcional)"
              disabled={isSubmitting}
            />
            {errors.telefono && (
              <p className="text-red-400 text-sm mt-1">{errors.telefono}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#ccc] mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-[#2a2a2a] border rounded-md text-white focus:outline-none focus:ring-2 transition ${
                errors.correo
                  ? "border-red-500 focus:ring-red-500"
                  : "border-[#444] focus:ring-[#00d1b2] focus:border-[#00d1b2]"
              }`}
              placeholder="correo@ejemplo.com (opcional)"
              disabled={isSubmitting}
            />
            {errors.correo && (
              <p className="text-red-400 text-sm mt-1">{errors.correo}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#444] text-white rounded-md hover:bg-[#555] transition font-medium"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#00d1b2] text-black rounded-md hover:bg-[#00bfa4] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? "Guardando..." 
                : esEdicion 
                  ? "Actualizar" 
                  : "Crear Sucursal"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalSucursal;