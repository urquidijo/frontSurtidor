import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { showToast } from "../../utils/toastUtils";

const ModalCategoria = ({
  modo,
  categoriaSeleccionada,
  nuevaCategoria,
  setNuevaCategoria,
  onClose,
  onCrear,
  onEliminar,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modo === "crear") {
      if (!nuevaCategoria.nombre || !nuevaCategoria.descripcion) {
        showToast("error", "Por favor completa todos los campos");
        return;
      }
      await onCrear();
      handleClose();
    } else if (modo === "eliminar") {
      await onEliminar();
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#00d1b2]">
            {modo === "crear" ? "Nueva Categoría" : "Eliminar Categoría"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {modo === "crear" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[#ccc] mb-2">Nombre</label>
                <input
                  type="text"
                  value={nuevaCategoria.nombre}
                  onChange={(e) =>
                    setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })
                  }
                  className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
                  placeholder="Nombre de la categoría"
                />
              </div>
              <div>
                <label className="block text-[#ccc] mb-2">Descripción</label>
                <textarea
                  value={nuevaCategoria.descripcion}
                  onChange={(e) =>
                    setNuevaCategoria({
                      ...nuevaCategoria,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
                  placeholder="Descripción de la categoría"
                  rows="3"
                />
              </div>
            </div>
          ) : (
            <div className="text-[#ccc] mb-6">
              ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-[#ccc] hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white ${
                modo === "crear"
                  ? "bg-[#00d1b2] hover:bg-[#00b89c]"
                  : "bg-red-500 hover:bg-red-600"
              } transition-colors`}
            >
              {modo === "crear" ? "Crear" : "Eliminar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCategoria;
