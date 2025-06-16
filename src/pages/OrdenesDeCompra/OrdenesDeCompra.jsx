import React, { useEffect, useState } from "react";
import ModalCrearOrden from "./ModalCrearOrden";
import { showToast } from "../../utils/toastUtils";
import API_URL from "../../config/config";

const OrdenesDeCompra = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [ordenAEditar, setOrdenAEditar] = useState(null);
  const usuarioId = sessionStorage.getItem("usuarioId");

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      const res = await fetch(`${API_URL}/ordenes-compra`);
      const data = await res.json();
      setOrdenes(data);
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await fetch(`${API_URL}/ordenes-compra/${id}`, { method: "DELETE" });
      fetch(`${API_URL}/bitacora/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          acciones: "eliminar orden de compra",
          estado: "exitoso",
        }),
      });
      showToast("error", "Orden eliminada exitosamente");
      fetchOrdenes();
    } catch (error) {
      console.error("Error al eliminar orden:", error);
      showToast("error", "Error al eliminar la orden");
    }
  };

  const handleAgregar = () => {
    setModalVisible(true);
  };

  const crearOrden = async (nuevaOrden) => {
    try {
      await fetch(`${API_URL}/ordenes-compra`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaOrden),
      });
      fetchOrdenes();
      fetch(`${API_URL}/bitacora/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          acciones: "crear orden de compra",
          estado: "exitoso",
        }),
      });
      showToast("success", "Orden creada exitosamente");
      setModalVisible(false);
    } catch (error) {
      console.error("Error al crear orden:", error);
      showToast("error", "Error al crear la orden");
    }
  };

  const handleEditar = (orden) => {
    setOrdenAEditar(orden);
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await fetch(`${API_URL}/ordenes-compra/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      fetch(`${API_URL}/bitacora/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          acciones: "actualizar compra",
          estado: "exitoso",
        }),
      });
      showToast("success", "Estado actualizado correctamente");
      setOrdenAEditar(null);
      fetchOrdenes();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      showToast("error", "Error al actualizar el estado");
    }
  };

  return (
    <div className="bg-[#1e1e1e] min-h-screen p-4 sm:p-8 text-white">
      <div className="bg-[#2c2c2c] p-4 sm:p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold text-teal-400">
            Órdenes de Compra
          </h1>
          <button
            onClick={handleAgregar}
            className="bg-teal-400 hover:bg-teal-500 text-black font-semibold px-4 py-2 rounded"
          >
            + Agregar Orden
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-auto">
            <thead className="bg-[#1a1a1a] text-teal-400">
              <tr>
                <th className="px-4 py-2 text-left whitespace-nowrap">Fecha</th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Proveedor
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Sucursal
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Usuario
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Monto Bs
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Cantidad m3
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Estado
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-4 text-center text-gray-400"
                  >
                    No hay órdenes registradas.
                  </td>
                </tr>
              ) : (
                ordenes.map((orden) => (
                  <tr
                    key={orden.id}
                    className="border-b border-gray-700 hover:bg-[#2a2a2a]"
                  >
                    <td className="px-4 py-2">
                      {new Date(orden.created_at).toLocaleDateString("es-BO", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2">{orden.proveedor}</td>
                    <td className="px-4 py-2">{orden.sucursal}</td>
                    <td className="px-4 py-2">{orden.usuario}</td>
                    <td className="px-4 py-2">
                      {orden.monto_total.toLocaleString("es-BO", {
                        style: "currency",
                        currency: "BOB",
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-2">{orden.cantidad}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-sm font-semibold
                        ${
                          orden.estado === "pendiente"
                            ? "bg-yellow-400 text-black"
                            : orden.estado === "finalizado"
                            ? "bg-green-500 text-white"
                            : orden.estado === "cancelado"
                            ? "bg-red-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {orden.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEditar(orden)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(orden.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalVisible && (
        <ModalCrearOrden
          onClose={() => setModalVisible(false)}
          onCrear={crearOrden}
        />
      )}

      {ordenAEditar && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 px-4">
          <div className="bg-zinc-900 p-6 rounded-xl shadow-lg w-full max-w-sm">
            <h2 className="text-teal-400 text-lg font-bold text-center mb-4">
              Editar Estado
            </h2>
            <div className="mb-4">
              <label className="block text-white mb-1">Estado:</label>
              <select
                value={ordenAEditar.estado}
                onChange={(e) =>
                  setOrdenAEditar({ ...ordenAEditar, estado: e.target.value })
                }
                className="w-full bg-zinc-800 text-white p-2 rounded"
              >
                <option value="pendiente">Pendiente</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() =>
                  actualizarEstado(ordenAEditar.id, ordenAEditar.estado)
                }
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
              >
                Guardar
              </button>
              <button
                onClick={() => setOrdenAEditar(null)}
                className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesDeCompra;
