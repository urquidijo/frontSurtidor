const ModalDispensador = ({
  open,
  onClose,
  modo,
  nuevoDispensador,
  setNuevoDispensador,
  setDispensadorSeleccionado,
  onCrear,
  onActualizar,
}) => {
  if (!open) return null;

  const handleCancelar = () => {
    onClose();
    setNuevoDispensador({
      ubicacion: "",
      capacidad_maxima: "",
      estado: "Activo",
    });
    setDispensadorSeleccionado("");
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999]">
      <div className="bg-[#1e1e1e] text-[#f0f0f0] p-8 rounded-2xl shadow-[0_0_25px_rgba(0,255,255,0.2)] w-full max-w-md animate-scaleIn">
        <h2 className="text-center text-2xl text-[#00d1b2] mb-6">
          {modo === "crear" ? "Nuevo Dispensador" : "Editar Dispensador"}
        </h2>

        <div className="flex flex-col gap-5 items-center">
          <input
            type="text"
            placeholder="Ubicación"
            value={nuevoDispensador.ubicacion}
            onChange={(e) =>
              setNuevoDispensador({
                ...nuevoDispensador,
                ubicacion: e.target.value,
              })
            }
            className="w-full max-w-[380px] px-5 py-3 rounded-xl bg-[#2c2c2c] text-[#f0f0f0] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-[#00d1b2] transition-all duration-300 shadow-sm"
          />

          <input
            type="number"
            min="0"
            placeholder="Capacidad Máxima (m³)"
            value={nuevoDispensador.capacidad_maxima}
            onWheel={(e) => e.target.blur()}
            onChange={(e) =>
              setNuevoDispensador({
                ...nuevoDispensador,
                capacidad_maxima: e.target.value,
              })
            }
            className="w-full max-w-[380px] px-5 py-3 rounded-xl bg-[#2c2c2c] text-[#f0f0f0] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-[#00d1b2] transition-all duration-300 shadow-sm"
          />

          <select
            value={nuevoDispensador.estado}
            onChange={(e) =>
              setNuevoDispensador({
                ...nuevoDispensador,
                estado: e.target.value,
              })
            }
            className="w-full max-w-[380px] px-5 py-3 rounded-xl bg-[#2c2c2c] text-[#f0f0f0] focus:outline-none focus:ring-2 focus:ring-[#00d1b2] transition-all duration-300 shadow-sm"
          >
            <option value="Activo">Activo</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleConfirmar}
            className="min-w-[140px] px-6 py-3 bg-[#00d1b2] text-[#1f1f1f] rounded-xl font-bold hover:bg-[#00a99d] transition-colors duration-300"
          >
            {modo === "crear" ? "Crear" : "Actualizar"}
          </button>
          <button
            onClick={handleCancelar}
            className="min-w-[120px] px-6 py-3 bg-[#333] text-[#f0f0f0] rounded-xl font-bold hover:bg-[#444] transition-colors duration-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDispensador;
