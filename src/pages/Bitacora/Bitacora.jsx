import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import Filtros from "../../utils/Filtros.jsx";

const Bitacora = () => {
  const [bitacora, setBitacora] = useState([]);

  const [filtrosActivos, setFiltrosActivos] = useState({});
  const [valoresFiltro, setValoresFiltro] = useState({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    fetchBitacora();
  }, [filtrosActivos]);

  const fetchBitacora = async () => {
    try {
      const query = new URLSearchParams(filtrosActivos).toString();
      const res = await fetch(`${API_URL}/bitacora?${query}`);
      const data = await res.json();
      setBitacora(data);
    } catch (err) {
      console.error(err);
    }
  };
  const aplicarFiltros = () => {
    setFiltrosActivos(valoresFiltro); // Triggea el useEffect
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return fecha.split("T")[0].split("-").reverse().join("/");
  };

  return (
    <div className="p-8 text-[#f1f1f1]">
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={() => {
            if (mostrarFiltros) {
              // Al cerrar los filtros, limpiar filtros activos y valores
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
        <Filtros
          filtros={[
            { campo: "nombre", label: "Usuario" },
            { campo: "fecha_entrada", label: "Fecha", tipo: "date" },
            {
              campo: "estado",
              label: "Estado",
              tipo: "select",
              opciones: ["exitoso", "fallido"],
            },
          ]}
          onChange={setValoresFiltro}
        />
      )}

      <h2 className="text-[1.8rem] mb-6 text-[#00d1b2] font-bold">
        Gestión de Bitácora
      </h2>

      <div className="overflow-x-auto rounded-xl shadow-md bg-[#2a2a2a]">
        <table className="w-full min-w-[800px] border-collapse">
          <thead className="bg-[#1c1c1c]">
            <tr>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Usuario
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                IP
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Fecha Entrada
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Hora Entrada
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Acciones
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {bitacora.map((item, index) => (
              <tr key={index} className="hover:bg-[#1f1f1f] transition">
                <td className="px-4 py-3 border-b border-[#444]">
                  {item.nombre_usuario || item.usuario_id}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">{item.ip}</td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {formatFecha(item.fecha_entrada)}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {item.hora_entrada}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {item.acciones || "—"}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {item.estado === "exitoso" ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-green-400 bg-green-900 rounded-full">
                      Exitoso
                    </span>
                  ) : item.estado === "fallido" ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-red-400 bg-red-900 rounded-full">
                      Fallido
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bitacora;
