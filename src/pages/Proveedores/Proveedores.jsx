import { useEffect, useState } from "react";
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
  const usuarioId = sessionStorage.getItem("usuarioId");

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
        if (esEdicion) {
          fetch(`${API_URL}/bitacora/entrada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              usuarioId,
              acciones: "actualizar proveedor",
              estado: "fallido",
            }),
          });
        } else {
          fetch(`${API_URL}/bitacora/entrada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              usuarioId,
              acciones: "crear proveedor",
              estado: "fallido",
            }),
          });
        }
        return;
      }
      if (esEdicion) {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "actualizar proveedor",
            estado: "exitoso",
          }),
        });
      } else {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "crear proveedor",
            estado: "exitoso",
          }),
        });
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
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "eliminar proveedor",
            estado: "exitoso",
          }),
        });
        await mostrarExito("El proveedor ha sido eliminado.");
        setProveedores((prev) => prev.filter((p) => p.id !== id));
      } else {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "eliminar proveedor",
            estado: "fallido",
          }),
        });
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
    <div className="p-8 text-[#f1f1f1]">
      <h2 className="text-[1.8rem] mb-6 text-[#00d1b2] font-bold">
        Gestión de Proveedores
      </h2>

      <div className="flex justify-start mb-4">
        <button
          className="bg-[#00d1b2] text-black px-5 py-2 rounded-lg font-bold hover:bg-[#00bfa4] transition"
          onClick={() => setProveedorEditando({})}
        >
          + Crear proveedor
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-md bg-[#2a2a2a]">
        <table className="w-full min-w-[800px] border-collapse">
          <thead className="bg-[#1c1c1c]">
            <tr>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Nombre
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Teléfono
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Correo
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Dirección
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                NIT
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p.id} className="hover:bg-[#1f1f1f] transition">
                <td className="px-4 py-3 border-b border-[#444]">{p.nombre}</td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {p.telefono}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">{p.correo}</td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {p.direccion}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">{p.nit}</td>
                <td className="px-4 py-3 border-b border-[#444]">
                  <button
                    className="bg-[#00d1b2] text-black px-3 py-1 rounded-md mr-2 text-sm hover:bg-[#00bfa4] transition"
                    onClick={() => setProveedorEditando(p)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-[#ff5c5c] text-white px-3 py-1 rounded-md text-sm hover:bg-[#e04848] transition"
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
