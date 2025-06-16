import React, { useState, useEffect } from "react";
import API_URL from "../../config/config";

const ModalCrearOrden = ({ onClose, onCrear }) => {
  const [proveedores, setProveedores] = useState([]);
  const [tanques, setTanques] = useState([]);
  const sucursalId = sessionStorage.getItem('sucursalId');
  const [formData, setFormData] = useState({
    id_proveedor: "",
    id_tanque: "",
    monto_total: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/proveedores`)
      .then((res) => res.json())
      .then((data) => setProveedores(data))
      .catch((err) => console.error("Error al cargar proveedores:", err));
    fetch(`${API_URL}/tanques?id_sucursal=${sucursalId}`)
      .then((res) => res.json())
      .then((data) => setTanques(data))
      .catch((err) => console.error("Error al cargar tanques:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.id_proveedor)
      nuevosErrores.id_proveedor = "Debe seleccionar un proveedor";
    if (!formData.monto_total || parseFloat(formData.monto_total) <= 0) {
      nuevosErrores.monto_total = "Ingrese un monto válido";
    }
    if (!formData.id_tanque)
      nuevosErrores.id_tanque = "Debe seleccionar un tanque";

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = () => {
    if (!validarFormulario()) return;

    const nuevaOrden = {
      id_proveedor: formData.id_proveedor,
      id_sucursal: sucursalId,
      hora: new Date().toLocaleTimeString([], { hour12: false }),
      monto_total: parseFloat(formData.monto_total),
      id_usuario: sessionStorage.getItem("usuarioId"),
      id_tanque: formData.id_tanque,
    };

    onCrear(nuevaOrden);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-zinc-900 p-6 rounded-xl shadow-lg w-[400px]">
        <h2 className="text-teal-400 text-lg font-bold text-center mb-4">
          Crear Orden
        </h2>

        {/* Proveedor */}
        <div className="mb-3">
          <label className="text-white block mb-1">Proveedor:</label>
          <select
            name="id_proveedor"
            value={formData.id_proveedor}
            onChange={handleChange}
            className={`w-full bg-zinc-800 text-white p-2 rounded ${
              errors.id_proveedor ? "border border-red-500" : ""
            }`}
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.nombre}
              </option>
            ))}
          </select>
          {errors.id_proveedor && (
            <p className="text-red-500 text-sm mt-1">{errors.id_proveedor}</p>
          )}
        </div>

        {/* Tanque */}
        <div className="mb-3">
          <label className="text-white block mb-1">Tanque:</label>
          <select
            name="id_tanque"
            value={formData.id_tanque}
            onChange={handleChange}
            className={`w-full bg-zinc-800 text-white p-2 rounded ${
              errors.id_tanque ? "border border-red-500" : ""
            }`}
          >
            <option value="">Seleccione un tanque</option>
            {tanques.map((tanque) => (
              <option key={tanque.id} value={tanque.id}>
                {tanque.nombre}
              </option>
            ))}
          </select>
          {errors.id_tanque && (
            <p className="text-red-500 text-sm mt-1">{errors.id_tanque}</p>
          )}
        </div>

        {/* Monto total */}
        <div className="mb-4">
          <label className="text-white block mb-1">Monto total:</label>
          <input
            type="number"
            name="monto_total"
            value={formData.monto_total}
            onChange={handleChange}
            className={`w-full bg-zinc-800 text-white p-2 rounded ${
              errors.monto_total ? "border border-red-500" : ""
            }`}
            placeholder="Ingrese el monto total"
            min="0"
          />
          {errors.monto_total && (
            <p className="text-red-500 text-sm mt-1">{errors.monto_total}</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-between">
          <button
            onClick={handleSubmit}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Crear
          </button>
          <button
            onClick={onClose}
            className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCrearOrden;
