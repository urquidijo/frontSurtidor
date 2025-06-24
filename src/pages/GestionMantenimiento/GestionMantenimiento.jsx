import React, { useEffect, useState } from "react";
import API_URL from "../../config/config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { showToast } from "../../utils/toastUtils";
import { mostrarConfirmacion, mostrarExito, mostrarError } from "../../utils/alertUtils";

const estados = [
  { value: "Reparado", label: "Reparado" },
  { value: "En revisión", label: "En revisión" },
  { value: "Cancelado", label: "Cancelado" },
];

const GestionMantenimiento = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [dispensadores, setDispensadores] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    id: null,
    dispensador_id: "",
    tipo_mantenimiento_id: "",
    fecha: new Date().toISOString().split("T")[0],
    estado: "En revisión",
    observaciones: "",
  });
  const [filtros, setFiltros] = useState({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [valoresFiltro, setValoresFiltro] = useState({});
  const [tabEstado, setTabEstado] = useState("Todos");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (Object.keys(filtros).length > 0) {
      fetchMantenimientos(filtros);
    }
  }, [filtros]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMantenimientos(),
        fetchDispensadores(),
        fetchTipos(),
      ]);
    } catch (err) {
      showToast("error", "Error al cargar datos iniciales");
    } finally {
      setLoading(false);
    }
  };

  const fetchMantenimientos = async (filtrosActivos = {}) => {
    let query = new URLSearchParams(filtrosActivos).toString();
    try {
      const res = await fetch(`${API_URL}/mantenimientos/mantenimientos${query ? `?${query}` : ""}`);
      if (!res.ok) throw new Error("Error al obtener mantenimientos");
      const data = await res.json();
      setMantenimientos(data);
    } catch (err) {
      showToast("error", "Error al cargar mantenimientos");
    }
  };

  const fetchDispensadores = async () => {
    try {
      const sucursalId = sessionStorage.getItem("sucursalId");
      if (!sucursalId) return setDispensadores([]);
      const res = await fetch(`${API_URL}/dispensadores/sucursal/${sucursalId}`);
      if (!res.ok) throw new Error("Error al obtener dispensadores");
      const data = await res.json();
      setDispensadores(data);
    } catch (err) {
      showToast("error", "Error al cargar dispensadores");
    }
  };

  const fetchTipos = async () => {
    try {
      const res = await fetch(`${API_URL}/mantenimientos/tipos`);
      if (!res.ok) throw new Error("Error al obtener tipos de mantenimiento");
      const data = await res.json();
      setTipos(data);
    } catch (err) {
      showToast("error", "Error al cargar tipos de mantenimiento");
    }
  };

  const handleOpenModal = (edit = false, mantenimiento = null) => {
    setIsEditing(edit);
    if (edit && mantenimiento) {
      setForm({
        id: mantenimiento.id,
        dispensador_id: mantenimiento.dispensador_id,
        tipo_mantenimiento_id: mantenimiento.tipo_mantenimiento_id,
        fecha: mantenimiento.fecha,
        estado: mantenimiento.estado,
        observaciones: mantenimiento.observaciones || "",
      });
    } else {
      setForm({
        id: null,
        dispensador_id: "",
        tipo_mantenimiento_id: "",
        fecha: new Date().toISOString().split("T")[0],
        estado: "En revisión",
        observaciones: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({
      id: null,
      dispensador_id: "",
      tipo_mantenimiento_id: "",
      fecha: new Date().toISOString().split("T")[0],
      estado: "En revisión",
      observaciones: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dispensador_id || !form.tipo_mantenimiento_id || !form.fecha) {
      showToast("warning", "Completa todos los campos obligatorios");
      return;
    }
    const payload = {
      dispensador_id: form.dispensador_id,
      tipo_mantenimiento_id: form.tipo_mantenimiento_id,
      fecha: form.fecha,
      estado: form.estado,
      observaciones: form.observaciones,
    };
    try {
      let res;
      if (isEditing) {
        res = await fetch(`${API_URL}/mantenimientos/mantenimientos/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/mantenimientos/mantenimientos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error("Error al guardar el mantenimiento");
      await fetchMantenimientos(filtros);
      setShowModal(false);
      mostrarExito(isEditing ? "Mantenimiento actualizado con éxito" : "Mantenimiento creado con éxito");
    } catch (err) {
      mostrarError("Ocurrió un error al guardar el mantenimiento");
    }
  };

  const handleDelete = async (id) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar mantenimiento?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/mantenimientos/mantenimientos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar mantenimiento");
      await fetchMantenimientos(filtros);
      mostrarExito("Mantenimiento eliminado con éxito");
    } catch (err) {
      mostrarError("Ocurrió un error al eliminar el mantenimiento");
    }
  };

  // Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Mantenimientos de Dispensadores", 14, 20);
    const tableColumn = ["Dispensador", "Tipo", "Fecha", "Estado", "Observaciones"];
    const tableRows = [];
    mantenimientosFiltrados.forEach((m) => {
      tableRows.push([
        m.dispensador,
        m.tipo_mantenimiento,
        m.fecha?.slice(0, 10),
        m.estado,
        m.observaciones,
      ]);
    });
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });
    doc.save("reporte_mantenimientos.pdf");
  };

  // Exportar Excel
  const exportarExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      mantenimientosFiltrados.map((m) => ({
        Dispensador: m.dispensador,
        Tipo: m.tipo_mantenimiento,
        Fecha: m.fecha?.slice(0, 10),
        Estado: m.estado,
        Observaciones: m.observaciones,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mantenimientos");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "reporte_mantenimientos.xlsx");
  };

  // Filtrar mantenimientos por estado según el tab
  const mantenimientosFiltrados = tabEstado === "Todos"
    ? mantenimientos
    : mantenimientos.filter(m => m.estado === tabEstado);

  return (
    <div className="p-8 bg-[#232323] rounded-xl shadow-lg border border-[#333] text-[#f1f1f1] font-sans max-w-7xl mx-auto mt-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#00d1b2]">Mantenimientos de Dispensadores</h1>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <button
            onClick={exportarPDF}
            className="flex items-center gap-2 bg-[#3273dc] text-white px-4 py-2 rounded hover:bg-[#275aa8] font-semibold shadow"
          >
            <span role="img" aria-label="pdf">📄</span> PDF
          </button>
          <button
            onClick={exportarExcel}
            className="flex items-center gap-2 bg-[#23d160] text-white px-4 py-2 rounded hover:bg-[#1bb24f] font-semibold shadow"
          >
            <span role="img" aria-label="excel">📊</span> Excel
          </button>
          <button
            className="bg-[#00d1b2] text-white px-5 py-2 rounded-lg font-semibold text-lg hover:bg-[#00bfa3]"
            onClick={() => handleOpenModal(false)}
          >
            + Nuevo Mantenimiento
          </button>
        </div>
      </div>
      {/* Tabs de estado */}
      <div className="flex gap-2 mb-6">
        {['Todos', 'En revisión', 'Reparado', 'Cancelado'].map((estado) => (
          <button
            key={estado}
            onClick={() => setTabEstado(estado)}
            className={`px-4 py-2 rounded font-semibold transition-all text-sm md:text-base ${
              tabEstado === estado
                ? 'bg-[#00d1b2] text-black shadow'
                : 'bg-[#333] text-[#f1f1f1] hover:bg-[#444]'
            }`}
          >
            {estado}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#232323] rounded-lg">
          <thead>
            <tr className="bg-[#181818] text-[#00d1b2]">
              <th className="px-4 py-2 whitespace-nowrap">Dispensador</th>
              <th className="px-4 py-2 whitespace-nowrap">Tipo</th>
              <th className="px-4 py-2 whitespace-nowrap">Fecha</th>
              <th className="px-4 py-2 whitespace-nowrap">Estado</th>
              <th className="px-4 py-2 whitespace-nowrap">Observaciones</th>
              <th className="px-4 py-2 whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#ccc]">Cargando...</td>
              </tr>
            ) : mantenimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#ccc]">No hay mantenimientos registrados.</td>
              </tr>
            ) : (
              mantenimientosFiltrados.map((m) => (
                <tr key={m.id} className="border-b border-[#333] hover:bg-[#222] transition">
                  <td className="px-4 py-2 whitespace-nowrap">{m.dispensador}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{m.tipo_mantenimiento}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{m.fecha?.slice(0, 10)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-bold min-w-[90px] text-center ${
                      m.estado === "Reparado"
                        ? "bg-green-700 text-white"
                        : m.estado === "En revisión"
                        ? "bg-cyan-600 text-white"
                        : "bg-red-700 text-white"
                    }`}>
                      {m.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-normal max-w-xs break-words">{m.observaciones}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                      <button
                        className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-semibold shadow transition-all duration-200 text-sm"
                        onClick={() => handleOpenModal(true, m)}
                      >
                        <span role="img" aria-label="editar">✏️</span> Editar
                      </button>
                      <button
                        className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 py-2 rounded-lg font-semibold shadow transition-all duration-200 text-sm"
                        onClick={() => handleDelete(m.id)}
                      >
                        <span role="img" aria-label="eliminar">🗑️</span> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#232323] p-8 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-[#00d1b2]">
              {isEditing ? "Editar Mantenimiento" : "Nuevo Mantenimiento"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Dispensador</label>
                <select
                  name="dispensador_id"
                  value={form.dispensador_id}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-[#181818] border border-[#333] text-white"
                  required
                >
                  <option value="">Selecciona un dispensador</option>
                  {dispensadores.map((d) => (
                    <option key={d.id} value={d.id}>{d.ubicacion}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Tipo de mantenimiento</label>
                <select
                  name="tipo_mantenimiento_id"
                  value={form.tipo_mantenimiento_id}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-[#181818] border border-[#333] text-white"
                  required
                >
                  <option value="">Selecciona un tipo</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-[#181818] border border-[#333] text-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Estado</label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-[#181818] border border-[#333] text-white"
                  required
                >
                  {estados.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Observaciones</label>
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-[#181818] border border-[#333] text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#00d1b2] hover:bg-[#00bfa3] text-white font-semibold"
                >
                  {isEditing ? "Guardar cambios" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionMantenimiento;
