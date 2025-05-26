import API_URL from "../../config/config";
import React, { useState, useEffect } from 'react';


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
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] overflow-y-auto">
    <div className="bg-[#1f1f1f] text-[#f0f0f0] p-8 rounded-xl shadow-lg w-[90%] max-w-[500px] relative max-h-[90vh] overflow-y-auto animate-fadeIn">
      <h2 className="text-2xl text-[#00d1b2] mb-6 text-center">
        {modo === "crear" ? "Crear Nueva Manguera" : "Editar Manguera"}
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Dispensador */}
        <div className="flex flex-col gap-2 mb-4">
          <label className="font-bold text-[#ccc]">Dispensador:</label>
          <select
            className="w-full p-2 bg-[#2a2a2a] border border-[#444] rounded-md text-white focus:border-[#00bcd4] focus:bg-[#1c1c1c] outline-none"
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

        {/* Switch */}
        <div className="flex flex-col gap-2 mb-4">
          <label className="font-bold text-[#ccc]">¿Está Activa?</label>
          <label className="relative inline-block w-11 h-6">
            <input
              type="checkbox"
              checked={nuevaManguera.esta_activo}
              onChange={(e) =>
                setNuevaManguera({ ...nuevaManguera, esta_activo: e.target.checked })
              }
              className="sr-only peer"
              aria-label="¿Está activa la manguera?"
            />
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-[#444] rounded-full transition duration-300 peer-checked:bg-[#00d1b2]"></div>
            <div className="absolute h-4.5 w-4.5 left-1 top-1 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
          </label>
        </div>

        {/* Acciones */}
        <div className="flex justify-between gap-4 mt-6">
          <button
            type="submit"
            className="bg-[#00bcd4] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#0097a7] transition"
          >
            {modo === "crear" ? "Crear" : "Actualizar"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#444] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#666] transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
);

  };

  export default ModalManguera;