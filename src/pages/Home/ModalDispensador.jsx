import './modalDispensador.css';

const ModalDispensador = ({
  open,
  onClose,
  modo,
  nuevoDispensador,
  setNuevoDispensador,
  dispensadorSeleccionado,
  setDispensadorSeleccionado,
  dispensadores,
  onCrear,
  onActualizar,
}) => {
  if (!open) return null;

  const handleCancelar = () => {
    setNuevoDispensador({
      ubicacion: "",
      capacidad_maxima: "",
      estado: "Activo",
    });
    setDispensadorSeleccionado("");
    onClose();
  };

  const handleConfirmar = async () => {
    try {
      if (modo === "crear") {
        await onCrear();
      } else if (modo === "editar") {
        await onActualizar();
      }
      handleCancelar();
    } catch (error) {
      console.error("Error en la operación:", error);
      alert("Ocurrió un error. Verifica los datos o intenta de nuevo.");
    }
  };

  return (
    <div className="modal-categoria-dispensador-overlay">
      <div className="modal-categoria-dispensador">
        <h2>{modo === "crear" ? "Nuevo Dispensador" : "Editar Dispensador"}</h2>

        <div className="modal-categoria-dispensador-contenido">
          <input
            type="text"
            placeholder="Ubicación"
            value={nuevoDispensador.ubicacion}
            onChange={(e) =>
              setNuevoDispensador({ ...nuevoDispensador, ubicacion: e.target.value })
            }
          />
          <input
            type="number"
            min="0"
            placeholder="Capacidad Máxima (m^3)"
            value={nuevoDispensador.capacidad_maxima}
            onWheel={(e) => e.target.blur()}
            onChange={(e) =>
              setNuevoDispensador({ ...nuevoDispensador, capacidad_maxima: e.target.value })
            }
          />
          <select
            value={nuevoDispensador.estado}
            onChange={(e) =>
              setNuevoDispensador({ ...nuevoDispensador, estado: e.target.value })
            }
          >
            <option value="Activo">Activo</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <div className="modal-categoria-acciones">
          <button onClick={handleConfirmar} className="btn-confirmar-dispensador">
            {modo === "crear" ? "Crear Dispensador" : "Actualizar Dispensador"}
          </button>
          <button onClick={handleCancelar} className="btn-cancelar-dispensador">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDispensador;
