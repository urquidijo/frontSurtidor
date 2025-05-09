import "./modalCategoria.css";

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
      await onEliminar(); // Llamamos la función eliminar
    }
    handleCancelar(); // Limpiamos y cerramos
  };

  return (
    <div className="modal-categoria-overlay">
      <div className="modal-categoria">
        <h2>{modo === "crear" ? "Nueva Categoría" : "Eliminar Categoría"}</h2>

        <div className="modal-categoria-contenido">
          {modo === "crear" ? (
            <>
              <input
                type="text"
                placeholder="Nombre"
                value={nuevaCategoria.nombre}
                onChange={(e) =>
                  setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })
                }
              />
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
              />
            </>
          ) : (
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="modal-categoria-acciones">
          <button onClick={handleConfirmar} className="btn-confirmar">
            {modo === "crear" ? "Crear Categoría" : "Eliminar Categoría"}
          </button>
          <button onClick={handleCancelar} className="btn-cancelar">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCategoria;
