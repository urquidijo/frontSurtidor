import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import "./registroAsistencia.css";
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
    <div className="planilla-container">
      <h2 className="planilla-title">Planilla de Asistencia</h2>

      {permisos.includes("gestionar_historial_asistencias") && (
        <div className="botones-historial">
          <button onClick={obtenerTodoElHistorial} className="btn-ver-todo">
            Mostrar todo el historial
          </button>
          <button onClick={obtenerAsistencias} className="btn-ver-todo-cerrar">
            Cerrar todo el historial
          </button>
        </div>
      )}

      <div className="tabla-responsive">
        <table className="planilla-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Fecha</th>
              <th>Hora Entrada</th>
              <th>Hora Salida</th>
              <th>Tiempo Trabajado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map((asistencia, index) => (
              <tr key={index}>
                <td>{asistencia.nombre}</td>
                <td>{asistencia.correo}</td>
                <td>{formatearFecha(asistencia.fecha)}</td>
                <td>{formatearHora(asistencia.hora_entrada) || "-"}</td>
                <td>{formatearHora(asistencia.hora_salida) || "-"}</td>
                <td>
                  {calcularTiempo(
                    asistencia.hora_entrada,
                    asistencia.hora_salida
                  ) || "-"}
                </td>
                <td>
                  {!asistencia.hora_entrada && asistencia.pendiente && (
                    <button onClick={marcarEntrada}>Marcar llegada</button>
                  )}
                  {asistencia.hora_entrada && !asistencia.hora_salida && (
                    <button onClick={marcarSalida}>Marcar salida</button>
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
