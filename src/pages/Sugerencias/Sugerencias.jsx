import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_URL from "../../config/config";
import { showToast } from "../../utils/toastUtils";
import {
  mostrarConfirmacion,
  mostrarExito,
  mostrarError,
} from "../../utils/alertUtils";

const Sugerencias = () => {
  const [quejas, setQuejas] = useState([]);
  const [filtros, setFiltros] = useState({
    tipo: "",
    estado: "",
  });
  const [estadisticas, setEstadisticas] = useState({});
  const [quejaSeleccionada, setQuejaSeleccionada] = useState(null);
  const [modalRespuesta, setModalRespuesta] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");
  const usuarioId = sessionStorage.getItem("usuarioId");

  useEffect(() => {
    cargarQuejas();
    cargarEstadisticas();
  }, [filtros]);

  const cargarQuejas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.tipo) params.append("tipo", filtros.tipo);
      if (filtros.estado) params.append("estado", filtros.estado);

      const res = await fetch(`${API_URL}/quejas?${params}`);
      const data = await res.json();
      setQuejas(data);
    } catch (error) {
      console.error("Error al cargar quejas:", error);
      showToast("error", "Error al cargar quejas y sugerencias");
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const res = await fetch(`${API_URL}/quejas/estadisticas`);
      const data = await res.json();
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  const abrirModalRespuesta = (queja) => {
    setQuejaSeleccionada(queja);
    setRespuesta(queja.respuesta || "");
    setNuevoEstado(queja.estado);
    setModalRespuesta(true);
  };

  const cerrarModal = () => {
    setModalRespuesta(false);
    setQuejaSeleccionada(null);
    setRespuesta("");
    setNuevoEstado("");
  };

  const manejarRespuesta = async () => {
    if (!quejaSeleccionada) return;

    try {
      const res = await fetch(`${API_URL}/quejas/${quejaSeleccionada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: nuevoEstado,
          respuesta: respuesta,
        }),
      });

      if (res.ok) {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "responder queja/sugerencia",
            estado: "exitoso",
          }),
        });
        showToast("success", "Respuesta enviada exitosamente");
        cargarQuejas();
        cargarEstadisticas();
        cerrarModal();
      } else {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "responder queja/sugerencia",
            estado: "fallido",
          }),
        });
        showToast("error", "Error al enviar respuesta");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error de conexión");
    }
  };

  const eliminarQueja = async (id) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar queja/sugerencia?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/quejas/${id}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "eliminar queja/sugerencia",
            estado: "exitoso",
          }),
        });
        await mostrarExito("Queja/sugerencia eliminada.");
        cargarQuejas();
        cargarEstadisticas();
      } else {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "eliminar queja/sugerencia",
            estado: "fallido",
          }),
        });
        mostrarError("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarError("Error de conexión");
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: "bg-yellow-600",
      en_revision: "bg-blue-600",
      resuelto: "bg-green-600",
      cerrado: "bg-gray-600",
    };
    return colores[estado] || "bg-gray-600";
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: "Pendiente",
      en_revision: "En Revisión",
      resuelto: "Resuelto",
      cerrado: "Cerrado",
    };
    return textos[estado] || estado;
  };

  return (
    <div className="p-4 sm:p-6 text-[#f1f1f1]">
      <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6 text-[#00d1b2] font-bold">
        Gestión de Quejas y Sugerencias
      </h2>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm text-gray-400">Total</h3>
          <p className="text-lg sm:text-2xl font-bold text-[#00d1b2]">
            {estadisticas.total || 0}
          </p>
        </div>
        <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm text-gray-400">Quejas</h3>
          <p className="text-lg sm:text-2xl font-bold text-red-400">
            {estadisticas.total_quejas || 0}
          </p>
        </div>
        <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm text-gray-400">Sugerencias</h3>
          <p className="text-lg sm:text-2xl font-bold text-blue-400">
            {estadisticas.total_sugerencias || 0}
          </p>
        </div>
        <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm text-gray-400">Pendientes</h3>
          <p className="text-lg sm:text-2xl font-bold text-yellow-400">
            {estadisticas.pendientes || 0}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
        <select
          value={filtros.tipo}
          onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
          className="bg-[#2a2a2a] text-white px-3 sm:px-4 py-2 rounded-lg border border-[#444] text-sm sm:text-base w-full sm:w-auto"
        >
          <option value="">Todos los tipos</option>
          <option value="queja">Solo Quejas</option>
          <option value="sugerencia">Solo Sugerencias</option>
        </select>

        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          className="bg-[#2a2a2a] text-white px-3 sm:px-4 py-2 rounded-lg border border-[#444] text-sm sm:text-base w-full sm:w-auto"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="en_revision">En Revisión</option>
          <option value="resuelto">Resueltos</option>
          <option value="cerrado">Cerrados</option>
        </select>
      </div>

      {/* Lista de quejas */}
      <div className="space-y-4">
        {quejas.map((queja) => (
          <div
            key={queja.id}
            className="bg-[#2a2a2a] rounded-xl p-4 sm:p-6 border border-[#444]"
          >
            {/* Header responsive */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold text-white ${
                      queja.tipo === "queja" ? "bg-red-600" : "bg-blue-600"
                    }`}
                  >
                    {queja.tipo.toUpperCase()}
                  </span>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold text-white ${getEstadoColor(
                      queja.estado
                    )}`}
                  >
                    {getEstadoTexto(queja.estado)}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 break-words">
                  {queja.asunto}
                </h3>
                <div className="space-y-1 text-xs sm:text-sm text-gray-400">
                  <p className="break-words">
                    De: {queja.nombre} ({queja.correo})
                  </p>
                  {queja.sucursal_nombre && (
                    <p>Sucursal: {queja.sucursal_nombre}</p>
                  )}
                  <p>{formatearFecha(queja.fecha_creacion)}</p>
                </div>
              </div>
              
              {/* Botones responsive */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto lg:flex-shrink-0">
                
                <button
                  onClick={() => eliminarQueja(queja.id)}
                  className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors w-full sm:w-auto whitespace-nowrap"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-4">
              <p className="text-sm sm:text-base text-gray-300 break-words leading-relaxed">
                {queja.descripcion}
              </p>
            </div>

           
          </div>
        ))}
        
        {/* Mensaje cuando no hay quejas */}
        {quejas.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-lg mb-2">📭</p>
            <p>No hay quejas o sugerencias que mostrar</p>
          </div>
        )}
      </div>

      {/* Modal de respuesta */}
      {modalRespuesta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-[#00d1b2] mb-4 break-words">
              Responder a: {quejaSeleccionada?.asunto}
            </h3>

            {/* Mensaje original */}
            <div className="mb-4 p-3 sm:p-4 bg-[#1f1f1f] rounded-lg">
              <p className="text-sm sm:text-base text-gray-300 break-words leading-relaxed">
                {quejaSeleccionada?.descripcion}
              </p>
            </div>

            {/* Estado */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#00d1b2] mb-2">
                Estado:
              </label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                className="w-full bg-[#1f1f1f] text-white px-3 sm:px-4 py-2 rounded-lg border border-[#444] text-sm sm:text-base"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_revision">En Revisión</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>

            {/* Respuesta */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#00d1b2] mb-2">
                Respuesta:
              </label>
              <textarea
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={5}
                className="w-full bg-[#1f1f1f] text-white px-3 sm:px-4 py-2 rounded-lg border border-[#444] resize-none text-sm sm:text-base"
                placeholder="Escribe tu respuesta aquí..."
              />
            </div>

            {/* Botones del modal */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={manejarRespuesta}
                className="bg-[#00d1b2] text-black px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-[#00bfa4] transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                ✅ Enviar Respuesta
              </button>
              <button
                onClick={cerrarModal}
                className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sugerencias