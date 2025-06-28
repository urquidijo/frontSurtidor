import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../config/config";
import {
  mostrarConfirmacion,
  mostrarExito,
  mostrarError,
} from "../../utils/alertUtils";
import Filtros from "../../utils/Filtros.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);

  const usuarioId = sessionStorage.getItem("usuarioId");

  const [filtrosActivos, setFiltrosActivos] = useState({});
  const [valoresFiltro, setValoresFiltro] = useState({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    fetchHistorialVentas();
  }, [filtrosActivos]);

  const fetchHistorialVentas = async () => {
    try {
      const query = new URLSearchParams(filtrosActivos).toString();
      const res = await fetch(`${API_URL}/historial-ventas?${query}`);
      const data = await res.json();
      setVentas(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const aplicarFiltros = () => {
    setFiltrosActivos(valoresFiltro); // Triggea el useEffect
  };

  const deleteVenta = async (id) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar orden de compra?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/historial-ventas/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar venta");
      fetch(`${API_URL}/bitacora/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          acciones: "eliminar venta",
          estado: "exitoso",
        }),
      });
      await mostrarExito("La venta ha sido eliminada.");
      setVentas(ventas.filter((venta) => venta.id !== id));
    } catch (error) {
      mostrarError(error);
    }
  };

  // Generar PDF
  const generarReportePDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Ventas", 14, 20);

    const tableColumn = ["Código", "Cliente", "Cantidad", "Fecha", "Hora", "Observaciones"];
    const tableRows = [];

    ventas.forEach((venta) => {
      const ventaData = [
        venta.codigo,
        venta.cliente_nombre,
        venta.cantidad,
        new Date(venta.created_at).toLocaleDateString(),
        venta.hora,
        venta.observaciones || ""
      ];
      tableRows.push(ventaData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("reporte_ventas.pdf");
  };

  // Generar Excel
  const generarReporteExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      ventas.map((venta) => ({
        Código: venta.codigo,
        Cliente: venta.cliente_nombre,
        Cantidad: venta.cantidad,
        Fecha: new Date(venta.created_at).toLocaleDateString(),
        Hora: venta.hora,
        Observaciones: venta.observaciones || ""
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "reporte_ventas.xlsx");
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#1f1f1f] text-[#f0f0f0]">
      <h2 className="text-xl md:text-3xl font-bold text-[#00d1b2] mb-6 md:mb-8">
        Historial de Ventas
      </h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={generarReportePDF}
          className="bg-[#3273dc] text-white px-4 py-2 rounded hover:bg-[#275aa8]"
        >
          📄 Exportar PDF
        </button>

        <button
          onClick={generarReporteExcel}
          className="bg-[#23d160] text-white px-4 py-2 rounded hover:bg-[#1bb24f]"
        >
          📊 Exportar Excel
        </button>

        <button
          onClick={() => {
            if (mostrarFiltros) {
              setFiltrosActivos({});
              setValoresFiltro({});
            }
            setMostrarFiltros(!mostrarFiltros);
          }}
          className="bg-[#444] text-white px-4 py-2 rounded hover:bg-[#555]"
        >
          {mostrarFiltros ? "Ocultar filtros" : "Filtrar"}
        </button>

        {mostrarFiltros && (
          <button
            onClick={aplicarFiltros}
            className="bg-[#00d1b2] text-black px-4 py-2 rounded hover:bg-[#00bfa4] font-semibold"
          >
            Buscar
          </button>
        )}
      </div>

      {mostrarFiltros && (
        <div className="mb-6">
          <Filtros
            filtros={[
              { campo: "nombre", label: "Usuario" },
              { campo: "fecha_entrada", label: "Fecha", tipo: "date" },
            ]}
            onChange={setValoresFiltro}
          />
        </div>
      )}

      <div className="bg-[#2a2a2a] rounded-lg p-4 md:p-6 border border-[#444]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-[#1f1f1f] text-[#00d1b2]">
                <th className="py-2 px-4">Código</th>
                <th className="py-2 px-4">Cliente</th>
                <th className="py-2 px-4">Cantidad</th>
                <th className="py-2 px-4">Fecha</th>
                <th className="py-2 px-4">Hora</th>
                <th className="py-2 px-4">Observaciones</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr
                  key={venta.id}
                  className="border-b border-[#444] hover:bg-[#232323]"
                >
                  <td className="py-2 px-4">{venta.codigo}</td>
                  <td className="py-2 px-4">{venta.cliente_nombre}</td>
                  <td className="py-2 px-4">{venta.cantidad}</td>
                  <td className="py-2 px-4">
                    {new Date(venta.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">{venta.hora}</td>
                  <td className="py-2 px-4">{venta.observaciones || ""}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => deleteVenta(venta.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistorialVentas;
