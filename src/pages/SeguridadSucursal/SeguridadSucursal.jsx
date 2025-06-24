import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../config/config";
import {
  mostrarConfirmacion,
  mostrarExito,
  mostrarError,
} from "../../utils/alertUtils";
import Filtros from "../../utils/Filtros";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SeguridadSucursal = () => {
  const [protocolos, setProtocolos] = useState([]);
  const [filtrosActivos, setFiltrosActivos] = useState({});
  const [valoresFiltro, setValoresFiltro] = useState({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [protocoloEditando, setProtocoloEditando] = useState(null);

  const usuarioId = sessionStorage.getItem("usuarioId");

  useEffect(() => {
    fetchProtocolos();
  }, [filtrosActivos]);

  const fetchProtocolos = async () => {
    try {
      const query = new URLSearchParams(filtrosActivos).toString();
      const res = await fetch(`${API_URL}/seguridad-sucursal?${query}`);
      const data = await res.json();
      setProtocolos(data);
    } catch (error) {
      toast.error("Error al obtener protocolos");
    }
  };

  const aplicarFiltros = () => {
    setFiltrosActivos(valoresFiltro);
  };

  const eliminarProtocolo = async (id) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar protocolo?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/seguridad-sucursal/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");

      await fetch(`${API_URL}/bitacora/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          acciones: "eliminar protocolo",
          estado: "exitoso",
        }),
      });

      setProtocolos(protocolos.filter((p) => p.id !== id));
      mostrarExito("Protocolo eliminado");
    } catch (error) {
      mostrarError(error);
    }
  };

  const handleEditar = (protocolo) => {
    setProtocoloEditando({ ...protocolo, nuevo: false });
    setModalVisible(true);
  };

  const guardarCambios = async () => {
    const nuevo = protocoloEditando?.nuevo;
    const url = nuevo
      ? `${API_URL}/seguridad-sucursal`
      : `${API_URL}/seguridad-sucursal/${protocoloEditando.id}`;

    const method = nuevo ? "POST" : "PUT";

    const payload = {
      tipo: protocoloEditando.tipo,
      descripcion: protocoloEditando.descripcion,
      estado: protocoloEditando.estado,
      fecha: protocoloEditando.fecha,
      observaciones: protocoloEditando.observaciones,
      ...(nuevo && { sucursal_id: "3202fa9c-e1b1-4e64-a1b6-0bdab6efc67b" }),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar protocolo");

      const data = await res.json();

      if (nuevo) {
        setProtocolos((prev) => [...prev, data]);
        mostrarExito("Protocolo creado");
      } else {
        setProtocolos((prev) =>
          prev.map((p) => (p.id === data.id ? data : p))
        );
        mostrarExito("Protocolo actualizado");
      }

      setModalVisible(false);
    } catch (error) {
      mostrarError("No se pudo guardar");
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Seguridad - Protocolos", 14, 20);
    const columnas = ["Tipo", "Estado", "Fecha", "Sucursal", "Responsable"];
    const filas = protocolos.map((p) => [
      p.tipo,
      p.estado,
      new Date(p.fecha_verificacion).toLocaleDateString(),
      p.sucursal,
      p.responsable,
    ]);
    autoTable(doc, { head: [columnas], body: filas, startY: 30 });
    doc.save("protocolos_seguridad.pdf");
  };

  const generarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      protocolos.map((p) => ({
        Tipo: p.tipo,
        Estado: p.estado,
        Fecha: new Date(p.fecha_verificacion).toLocaleDateString(),
        Sucursal: p.sucursal,
        Responsable: p.responsable,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Protocolos");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), "protocolos.xlsx");
  };

  const renderEstado = (estado) => {
    const e = estado.toLowerCase();
    if (e === "verificado") return <span className="text-green-500 font-bold text-lg">✅</span>;
    if (e === "pendiente") return <span className="text-yellow-400 font-bold text-lg">⚠️</span>;
    return <span className="text-red-500 font-bold text-lg">❌</span>;
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#1f1f1f] text-[#f0f0f0]">
      <h2 className="text-xl md:text-3xl font-bold text-[#00d1b2] mb-6">Protocolos de Seguridad</h2>

      <div className="flex gap-4 mb-6 flex-wrap">
        <button onClick={generarPDF} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800">
          📄 PDF
        </button>
        <button onClick={generarExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800">
          📊 Excel
        </button>
        <button
          onClick={() => {
            if (mostrarFiltros) {
              setFiltrosActivos({});
              setValoresFiltro({});
            }
            setMostrarFiltros(!mostrarFiltros);
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {mostrarFiltros ? "Ocultar filtros" : "Filtrar"}
        </button>
        {mostrarFiltros && (
          <button onClick={aplicarFiltros} className="bg-[#00d1b2] text-black px-4 py-2 rounded font-semibold">
            Buscar
          </button>
        )}
        <button
          onClick={() => {
            setProtocoloEditando({
              tipo: "",
              descripcion: "",
              estado: "Verificado",
              fecha: new Date().toISOString().split("T")[0],
              observaciones: "",
              nuevo: true,
            });
            setModalVisible(true);
          }}
          className="bg-[#00d1b2] text-black px-4 py-2 rounded font-semibold"
        >
          ➕ Crear protocolo
        </button>
      </div>

      {mostrarFiltros && (
        <div className="mb-4">
          <Filtros
            filtros={[
              { campo: "estado", label: "Estado" },
              { campo: "fecha", label: "Fecha", tipo: "date" },
            ]}
            onChange={setValoresFiltro}
          />
        </div>
      )}

      <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#444]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#1f1f1f] text-[#00d1b2]">
              <tr>
                <th className="py-2 px-4">Tipo</th>
                <th className="py-2 px-4">Descripción</th>
                <th className="py-2 px-4">Estado</th>
                <th className="py-2 px-4">Fecha</th>
                <th className="py-2 px-4">Observaciones</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {protocolos.map((p) => (
                <tr key={p.id} className="border-b border-[#444] hover:bg-[#232323]">
                  <td className="py-2 px-4">{p.tipo}</td>
                  <td className="py-2 px-4">{p.descripcion}</td>
                  <td className="py-2 px-4 text-center">{renderEstado(p.estado)}</td>
                  <td className="py-2 px-4">{new Date(p.fecha).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{p.observaciones}</td>
                  <td className="py-2 px-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEditar(p)}
                      className="bg-blue-500 text-black px-2 py-1 rounded text-xs hover:bg-yellow-600"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => eliminarProtocolo(p.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-800"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {protocolos.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-400">
                    No se encontraron protocolos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-[90%] max-w-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">
              {protocoloEditando?.nuevo ? "Crear Protocolo" : "Editar Protocolo"}
            </h3>
            <div className="grid gap-3">
              <input
                type="text"
                placeholder="Tipo"
                value={protocoloEditando.tipo}
                onChange={(e) => setProtocoloEditando({ ...protocoloEditando, tipo: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Descripción"
                value={protocoloEditando.descripcion}
                onChange={(e) => setProtocoloEditando({ ...protocoloEditando, descripcion: e.target.value })}
                className="border p-2 rounded"
              />
              <select
                value={protocoloEditando.estado}
                onChange={(e) => setProtocoloEditando({ ...protocoloEditando, estado: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="Verificado">✅ Verificado</option>
                <option value="Pendiente">⚠️ Pendiente</option>
                <option value="Falla">❌ Falla</option>
              </select>
              <input
                type="date"
                value={
                  protocoloEditando.fecha
                    ? new Date(protocoloEditando.fecha).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setProtocoloEditando({ ...protocoloEditando, fecha: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Observaciones"
                value={protocoloEditando.observaciones || ""}
                onChange={(e) =>
                  setProtocoloEditando({ ...protocoloEditando, observaciones: e.target.value })
                }
                className="border p-2 rounded"
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setModalVisible(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambios}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeguridadSucursal;
