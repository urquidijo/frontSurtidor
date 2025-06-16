import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../config/config";

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("fecha");

  const fetchHistorialVentas = async () => {
    try {
      const res = await fetch(`${API_URL}/historial-ventas`);
      if (!res.ok) throw new Error("Error al cargar historial de ventas");
      const data = await res.json();
      setVentas(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteVenta = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta venta?")) return;
    try {
      const res = await fetch(`${API_URL}/historial-ventas/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar venta");
      toast.success("Venta eliminada");
      setVentas(ventas.filter((venta) => venta.id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchHistorialVentas();
  }, []);

  const ventasFiltradas = ventas
    .filter((v) =>
      v.cliente_nombre.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "fecha") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "monto") return b.monto_por_cobrar - a.monto_por_cobrar;
      return 0;
    });

  return (
    <div className="p-8 min-h-screen bg-[#1f1f1f] text-[#f0f0f0]">
      <h2 className="text-3xl font-bold text-[#00d1b2] mb-8">
        Historial de Ventas
      </h2>

      <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#444] mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded bg-[#1f1f1f] border border-gray-600 text-white w-full sm:w-64"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded bg-[#1f1f1f] border border-gray-600 text-white w-full sm:w-64"
          >
            <option value="fecha">Ordenar por Fecha</option>
            <option value="monto">Ordenar por Monto</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center text-[#ccc] py-8">Cargando historial...</div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="text-center text-[#ccc] py-8">No hay ventas registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-[#1f1f1f] text-[#00d1b2]">
                  <th className="py-2 px-4">Código</th>
                  <th className="py-2 px-4">Cliente</th>
                  <th className="py-2 px-4">Cantidad</th>
                  <th className="py-2 px-4">Fecha</th>
                  <th className="py-2 px-4">Hora</th>
                  <th className="py-2 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map((venta) => (
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
        )}
      </div>
    </div>
  );
};

export default HistorialVentas;
