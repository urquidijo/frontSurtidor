import API_URL from "../../config/config";
import React, { useState, useEffect } from 'react';
import './modalManguera.css';


const ModalManguera = ({ open, onClose, modo, nuevaManguera, setNuevaManguera, onCrear, onActualizar }) => {
    const [dispensadores, setDispensadores] = useState([]);
  
    useEffect(() => {
      if (open) {
        fetchDispensadores();
      }
    }, [open]);
  
    const fetchDispensadores = async () => {
      try {
        const sucursalId= sessionStorage.getItem("sucursalId");
        const response = await fetch(`${API_URL}/dispensadores/sucursal/${sucursalId}`);
        const data = await response.json();
        setDispensadores(data);
      } catch (error) {
        console.error('Error al cargar dispensadores:', error);
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (modo === "crear") {
        await onCrear();
      } else {
        await onActualizar();
      }
      onClose();
    };
  
    if (!open) return null;
  
    return (
      <div className="modal-manguera-overlay">
        <div className="modal-manguera">
          <h2>{modo === "crear" ? "Crear Nueva Manguera" : "Editar Manguera"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-manguera-group">
              <label>Dispensador:</label>
              <select
                value={nuevaManguera.id_dispensador}
                onChange={(e) =>
                  setNuevaManguera({ ...nuevaManguera, id_dispensador: e.target.value })
                }
                required
              >
                <option value="">Seleccione un dispensador</option>
                {dispensadores.map((disp) => (
                  <option key={disp.id} value={disp.id}>
                    {disp.ubicacion}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-manguera-group">
  <label>¿Está Activa?</label>
  <label className="switch-manguera">
    <input
      type="checkbox"
      checked={nuevaManguera.esta_activo}
      onChange={(e) =>
        setNuevaManguera({ ...nuevaManguera, esta_activo: e.target.checked })
      }
    />
    <span className="slider-manguera"></span>
  </label>
</div>

            <div className="modal-manguera-actions">
              <button type="submit">
                {modo === "crear" ? "Crear" : "Actualizar"}
              </button>
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default ModalManguera;