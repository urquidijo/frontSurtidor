import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import { showToast } from "../../utils/toastUtils";


const RegistroAsistencia = () => {
  const [asistencias, setAsistencias] = useState([]);
  const usuarioId = sessionStorage.getItem("usuarioId");
  const [permisos, setPermisos] = useState([]);

  useEffect(() => {
    obtenerAsistencias();
    if (usuarioId) {
      fetch(`${API_URL}/usuarios/permisos/${usuarioId}`)
        .then((res) => res.json())
        .then((data) => setPermisos(data.permisos.map((p) => p.nombre)))
        .catch((err) => console.error("Error al cargar permisos:", err));
    }
  }, []);

  const obtenerAsistencias = async () => {
    try {
      const res = await fetch(`${API_URL}/asistencia/historial/${usuarioId}`);
      const data = await res.json();
      let asistencias = Array.isArray(data) ? data : [];

      const now = new Date();
      now.setHours(now.getHours() - 4); // Ajustar a Bolivia (UTC-4)
      const hoy = now.toISOString().split("T")[0]; // formato YYYY-MM-DD

      const existeHoy = asistencias.some((a) => a.fecha.startsWith(hoy));

      // Si no hay asistencia de hoy, agregamos una fila "vacía" para marcarla
      if (!existeHoy) {
        const res = await fetch(`${API_URL}/users/${usuarioId}`);
        const data = await res.json();
        const usuarioNombre = data.nombre || "Usuario";
        const usuarioCorreo = data.correo || "correo@desconocido.com";

        asistencias.unshift({
          nombre: usuarioNombre,
          correo: usuarioCorreo,
          fecha: hoy,
          hora_entrada: null,
          hora_salida: null,
          tiempo_trabajado: null,
          pendiente: true,
        });
      }

      setAsistencias(asistencias);
    } catch (err) {
      console.error("Error al obtener asistencias:", err);
      showToast("warning","error al obtener las asistencias")
    }
  };

  const marcarEntrada = async () => {
    try {
      await fetch(`${API_URL}/asistencia/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: usuarioId }),
      });
      obtenerAsistencias();
      showToast("success", "Asistencia marcada con éxito");
    } catch (err) {
      console.error("Error al marcar entrada:", err);
      showToast("error","error al marcar la entrada")
    }
  };

  const marcarSalida = async () => {
    try {
      await fetch(`${API_URL}/asistencia/salida`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: usuarioId }),
      });
      showToast("success", "Salida marcada con éxito");
      obtenerAsistencias();
    } catch (err) {
      console.error("Error al marcar salida:", err);
      showToast("error","error al marcar la salida")
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "—";
    const [año, mes, dia] = fechaStr.split("T")[0].split("-");
    return `${dia}/${mes}/${año}`;
  };

  const formatearHora = (horaStr) => {
    if (!horaStr) return "—";
    const hora = new Date(horaStr);
    return hora.toLocaleTimeString("es-BO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const obtenerTodoElHistorial = async () => {
    try {
      const res = await fetch(`${API_URL}/asistencia/historial`);
      const data = await res.json();
      const asistencias = Array.isArray(data) ? data : [];

      setAsistencias(asistencias);
    } catch (err) {
      console.error("Error al obtener todas las asistencias:", err);
    }
  };

  const calcularTiempo = (entrada, salida) => {
    if (!entrada || !salida) return "—";
    const e = new Date(entrada);
    const s = new Date(salida);
    const ms = s - e;
    const totalMin = Math.floor(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:00`;
  };

  return (
  <div className="p-8 text-[#f1f1f1]">
    <h2 className="text-[1.8rem] mb-6 text-[#00d1b2] font-bold">
      Planilla de Asistencia
    </h2>

    {permisos.includes("gestionar_historial_asistencias") && (
      <div className="flex gap-4 mb-4">
        <button
          onClick={obtenerTodoElHistorial}
          className="bg-[#00d1b2] text-black px-5 py-2 rounded-lg font-bold hover:bg-[#00bfa4] transition"
        >
          Mostrar todo el historial
        </button>
        <button
          onClick={obtenerAsistencias}
          className="bg-[#ff5c5c] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#e04848] transition"
        >
          Cerrar todo el historial
        </button>
      </div>
    )}

    <div className="overflow-x-auto rounded-xl shadow-md bg-[#2a2a2a]">
      <table className="w-full min-w-[900px] border-collapse">
        <thead className="bg-[#1c1c1c]">
          <tr>
            {["Nombre", "Correo", "Fecha", "Hora Entrada", "Hora Salida", "Tiempo Trabajado", "Acción"].map((t, i) => (
              <th
                key={i}
                className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]"
              >
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {asistencias.map((asistencia, index) => (
            <tr key={index} className="hover:bg-[#1f1f1f] transition">
              <td className="px-4 py-3 border-b border-[#444]">{asistencia.nombre}</td>
              <td className="px-4 py-3 border-b border-[#444]">{asistencia.correo}</td>
              <td className="px-4 py-3 border-b border-[#444]">{formatearFecha(asistencia.fecha)}</td>
              <td className="px-4 py-3 border-b border-[#444]">{formatearHora(asistencia.hora_entrada) || "-"}</td>
              <td className="px-4 py-3 border-b border-[#444]">{formatearHora(asistencia.hora_salida) || "-"}</td>
              <td className="px-4 py-3 border-b border-[#444]">
                {calcularTiempo(asistencia.hora_entrada, asistencia.hora_salida) || "-"}
              </td>
              <td className="px-4 py-3 border-b border-[#444]">
                {!asistencia.hora_entrada && asistencia.pendiente && (
                  <button
                    onClick={marcarEntrada}
                    className="bg-[#00d1b2] text-black px-3 py-1 rounded-md text-sm hover:bg-[#00bfa4] transition"
                  >
                    Marcar llegada
                  </button>
                )}
                {asistencia.hora_entrada && !asistencia.hora_salida && (
                  <button
                    onClick={marcarSalida}
                    className="bg-[#facc15] text-black px-3 py-1 rounded-md text-sm hover:bg-[#eab308] transition"
                  >
                    Marcar salida
                  </button>
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

export default RegistroAsistencia;
