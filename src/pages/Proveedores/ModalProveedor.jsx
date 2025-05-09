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
    <div className="modal-overlay">
      <div className="modal-contenido">
        <h3>{esEdicion ? "Editar Proveedor" : "Crear Proveedor"}</h3>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            name="nombre"
            autoComplete="off"
            value={formData.nombre}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Teléfono:</label>
          <input
            name="telefono"
            type="number"
            onKeyDown={preventInvalidNumberInput}
            onWheel={(e) => e.target.blur()}
            autoComplete="off"
            value={formData.telefono}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Correo:</label>
          <input
            name="correo"
            autoComplete="off"
            value={formData.correo}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Dirección:</label>
          <input
            name="direccion"
            autoComplete="off"
            value={formData.direccion}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>NIT:</label>
          <input
            name="nit"
            type="number"
            onKeyDown={preventInvalidNumberInput}
            onWheel={(e) => e.target.blur()}
            autoComplete="off"
            value={formData.nit}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Detalle:</label>
          <textarea
            name="detalle"
            value={formData.detalle}
            onChange={handleChange}
          />
        </div>

        <div className="modal-prv-buttons">
        <button className="save-btn-pv" onClick={() => onSubmit(formData)}>
            {esEdicion ? "Guardar" : "Crear"}
          </button>
          <button className="cancel-btn-pv" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProveedor;
