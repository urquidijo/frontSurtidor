import { useEffect, useState } from "react";
import "./proveedores.css";
import API_URL from "../../config/config";
import ModalProveedor from "./ModalProveedor";
import { showToast } from "../../utils/toastUtils";
import {
  mostrarConfirmacion,
  mostrarExito,
  mostrarError,
} from "../../utils/alertUtils";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [proveedorEditando, setProveedorEditando] = useState(null);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const res = await fetch(`${API_URL}/proveedores`);
      const data = await res.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      showToast("warning", "Error al obtener los proveedores");
    }
  };

  const handleGuardarProveedor = async (formData) => {
    const esEdicion = !!proveedorEditando?.id;
    const url = esEdicion
      ? `${API_URL}/proveedores/${proveedorEditando.id}`
      : `${API_URL}/proveedores`;
    const method = esEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        showToast("error", "Error al guardar el proveedor");
        return;
      }
      esEdicion
        ? showToast("success", "Proveedor actualizado con éxito")
        : showToast("success", "Proveedor creado con éxito");
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      showToast("error", "Error al guardar el proveedor");
    }
  };

  const handleDelete = async (id) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar proveedor?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/proveedores/${id}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        await mostrarExito("El proveedor ha sido eliminado.");
        setProveedores((prev) => prev.filter((p) => p.id !== id));
      } else {
        const err = await res.json();
        mostrarError(err.message);
      }
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
      mostrarError("Error del servidor");
    }
  };

  const handleCloseModal = () => {
    setProveedorEditando(null);
    fetchProveedores();
  };

  return (
    <div className="proveedores-container">
      <h2 className="proveedores-title">Gestión de Proveedores</h2>
      <button className="crear-btn" onClick={() => setProveedorEditando({})}>
        Crear Nuevo Proveedor
      </button>
      <div className="tabla-proveedores-wrapper">
        <table className="tabla-proveedores">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Dirección</th>
              <th>Nit</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.telefono}</td>
                <td>{p.correo}</td>
                <td>{p.direccion}</td>
                <td>{p.nit}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => setProveedorEditando(p)}
                  >
                    Editar
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(p.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {proveedorEditando && (
        <ModalProveedor
          proveedorSeleccionado={proveedorEditando}
          onClose={handleCloseModal}
          onSubmit={handleGuardarProveedor}
        />
      )}
    </div>
  );
};

export default Proveedores;
