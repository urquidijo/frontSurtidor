import { useEffect, useState } from "react";
import API_URL from "../../config/config";

const Bitacora = () => {
  const [bitacora, setBitacora] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/bitacora`)
      .then((res) => res.json())
      .then((data) => setBitacora(data))
      .catch((err) => console.error(err));
  }, []);

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-BO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="p-8 text-[#f1f1f1]">
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
