
const ModalCategoria = ({
  open,
  onClose,
  modo,
  nuevaCategoria,
  setNuevaCategoria,
  categorias,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  onCrear,
  onEliminar,
}) => {
  if (!open) return null;

  // Función para cancelar y limpiar los campos
  const handleCancelar = () => {
    setNuevaCategoria({ nombre: "", descripcion: "" });
    setCategoriaSeleccionada("");
    onClose();
  };

  // Función para confirmar acción y cerrar modal
  const handleConfirmar = async () => {
    if (modo === "crear") {
      await onCrear(); // Llamamos la función crear
    } else {
      onClose();
      await onEliminar(); // Llamamos la función eliminar
    }
    handleCancelar(); // Limpiamos y cerramos
  };

  return (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
    <div className="bg-[#1f1f1f] text-[#f0f0f0] rounded-[12px] shadow-xl p-8 w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto animate-fadeIn">
      <h2 className="text-2xl font-semibold text-center text-[#00d1b2] mb-6">
        {modo === "crear" ? "Nueva Categoría" : "Eliminar Categoría"}
      </h2>

      <div className="modal-categoria-contenido mb-6">
        {modo === "crear" ? (
          <>
            <div className="mb-4">
              <label className="block mb-1 font-bold text-[#ccc]">Nombre:</label>
              <input
                type="text"
                placeholder="Nombre"
                value={nuevaCategoria.nombre}
                onChange={(e) =>
                  setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })
                }
                className="w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-bold text-[#ccc]">Descripción:</label>
              <input
                type="text"
                placeholder="Descripción"
                value={nuevaCategoria.descripcion}
                onChange={(e) =>
                  setNuevaCategoria({
                    ...nuevaCategoria,
                    descripcion: e.target.value,
                  })
                }
                className="w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors"
              />
            </div>
          </>
        ) : (
          <div className="mb-4">
            <label className="block mb-1 font-bold text-[#ccc]">Categoría:</label>
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors"
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="modal-categoria-acciones flex justify-between gap-4">
        <button
          onClick={handleConfirmar}
          className="bg-[#00bcd4] hover:bg-[#0097a7] text-white font-bold px-4 py-2 rounded-[10px] transition"
        >
          {modo === "crear" ? "Crear Categoría" : "Eliminar Categoría"}
        </button>
        <button
          onClick={handleCancelar}
          className="bg-[#444] hover:bg-[#666] text-white font-bold px-4 py-2 rounded-[10px] transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
);
};

export default ModalCategoria;
