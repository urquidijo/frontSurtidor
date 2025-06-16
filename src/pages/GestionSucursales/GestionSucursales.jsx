import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import ModalSucursal from "./ModalSucursal";
import { showToast } from "../../utils/toastUtils";
import {
  mostrarConfirmacion,
  mostrarExito,
  mostrarError,
} from "../../utils/alertUtils";

const GestionSucursales = () => {
  const [sucursales, setSucursales] = useState([]);
  const [sucursalEditando, setSucursalEditando] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState("todas");
  const usuarioId = sessionStorage.getItem("usuarioId");

  useEffect(() => {
    const usuarioId = sessionStorage.getItem("usuarioId");
    if (usuarioId) {
      fetch(`${API_URL}/usuarios/permisos/${usuarioId}`)
        .then((res) => res.json())
        .then((data) => setPermisos(data.permisos.map((p) => p.nombre)))
        .catch((err) => console.error("Error al cargar permisos:", err));
    }
    fetchSucursales();
  }, []);

  const fetchSucursales = async () => {
    try {
      const endpoint = filtroActivo === "todas" ? "/all" : "";
      const res = await fetch(`${API_URL}/sucursales${endpoint}`);
      const data = await res.json();
      setSucursales(data);
    } catch (error) {
      console.error("Error al cargar sucursales:", error);
      showToast("error", "Error al obtener las sucursales");
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, [filtroActivo]);

  const handleGuardarSucursal = async (formData) => {
    const esEdicion = !!sucursalEditando?.id;
    const url = esEdicion
      ? `${API_URL}/sucursales/${sucursalEditando.id}`
      : `${API_URL}/sucursales`;
    const method = esEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.message || "Error al guardar la sucursal");
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: esEdicion ? "actualizar sucursal" : "crear sucursal",
            estado: "fallido",
          }),
        });
        return;
      }

      fetch(`${API_URL}/bitacora/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          acciones: esEdicion ? "actualizar sucursal" : "crear sucursal",
          estado: "exitoso",
        }),
      });

      showToast(
        "success",
        esEdicion
          ? "Sucursal actualizada con éxito"
          : "Sucursal creada con éxito"
      );
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar sucursal:", error);
      showToast("error", "Error al guardar la sucursal");
    }
  };

  const handleSuspender = async (id) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Suspender sucursal?",
      texto: "La sucursal será suspendida pero no eliminada permanentemente.",
      confirmText: "Sí, suspender",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/sucursales/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "suspender sucursal",
            estado: "exitoso",
          }),
        });
        await mostrarExito("La sucursal ha sido suspendida.");
        fetchSucursales();
      } else {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "suspender sucursal",
            estado: "fallido",
          }),
        });
        mostrarError(data.message || "Error al suspender sucursal");
      }
    } catch (err) {
      console.error("Error al suspender sucursal:", err);
      mostrarError("Error del servidor");
    }
  };

  const handleReactivar = async (id) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Reactivar sucursal?",
      texto: "La sucursal volverá a estar disponible.",
      confirmText: "Sí, reactivar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/sucursales/${id}/reactivar`, {
        method: "PUT",
      });

      const data = await res.json();

      if (res.ok) {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "reactivar sucursal",
            estado: "exitoso",
          }),
        });
        await mostrarExito("La sucursal ha sido reactivada.");
        fetchSucursales();
      } else {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "reactivar sucursal",
            estado: "fallido",
          }),
        });
        mostrarError(data.message || "Error al reactivar sucursal");
      }
    } catch (err) {
      console.error("Error al reactivar sucursal:", err);
      mostrarError("Error del servidor");
    }
  };

  const handleCloseModal = () => {
    setSucursalEditando(null);
    fetchSucursales();
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-ES");
  };

  const sucursalesFiltradas = sucursales.filter((sucursal) => {
    if (filtroActivo === "activas") return !sucursal.esta_suspendido;
    if (filtroActivo === "suspendidas") return sucursal.esta_suspendido;
    return true;
  });

  if (!permisos.includes("gestionar_usuarios")) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 text-[#f1f1f1]">
      <h2 className="text-2xl sm:text-3xl mb-6 text-[#00d1b2] font-bold">
        Gestión de Sucursales
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-lg transition ${
              filtroActivo === "todas"
                ? "bg-[#00d1b2] text-black"
                : "bg-[#444] text-white hover:bg-[#555]"
            }`}
            onClick={() => setFiltroActivo("todas")}
          >
            Todas
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition ${
              filtroActivo === "activas"
                ? "bg-[#00d1b2] text-black"
                : "bg-[#444] text-white hover:bg-[#555]"
            }`}
            onClick={() => setFiltroActivo("activas")}
          >
            Activas
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition ${
              filtroActivo === "suspendidas"
                ? "bg-[#00d1b2] text-black"
                : "bg-[#444] text-white hover:bg-[#555]"
            }`}
            onClick={() => setFiltroActivo("suspendidas")}
          >
            Suspendidas
          </button>
        </div>

        <button
          className="bg-[#00d1b2] text-black px-5 py-2 rounded-lg font-bold hover:bg-[#00bfa4] transition w-full sm:w-auto"
          onClick={() => setSucursalEditando({})}
        >
          + Nueva Sucursal
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-md bg-[#2a2a2a]">
        <table className="w-full min-w-[800px] border-collapse">
          <thead className="bg-[#1c1c1c]">
            <tr>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Nombre
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Dirección
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Teléfono
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Correo
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Estado
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Fecha Creación
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {sucursalesFiltradas.map((sucursal) => (
              <tr key={sucursal.id} className="hover:bg-[#1f1f1f] transition">
                <td className="px-4 py-3 border-b border-[#444]">
                  {sucursal.nombre}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {sucursal.direccion}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {sucursal.telefono || "—"}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {sucursal.correo || "—"}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {sucursal.esta_suspendido ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-red-400 bg-red-900 rounded-full">
                      Suspendida
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-green-400 bg-green-900 rounded-full">
                      Activa
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {formatFecha(sucursal.created_at)}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className="bg-[#00d1b2] text-black px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-[#00bfa4] transition"
                      onClick={() => setSucursalEditando(sucursal)}
                    >
                      Editar
                    </button>
                    {sucursal.esta_suspendido ? (
                      <button
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-green-700 transition"
                        onClick={() => handleReactivar(sucursal.id)}
                      >
                        Reactivar
                      </button>
                    ) : (
                      <button
                        className="bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-orange-700 transition"
                        onClick={() => handleSuspender(sucursal.id)}
                      >
                        Suspender
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sucursalesFiltradas.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No se encontraron sucursales.</p>
        </div>
      )}

      {sucursalEditando && (
        <ModalSucursal
          sucursalSeleccionada={sucursalEditando}
          onClose={handleCloseModal}
          onSubmit={handleGuardarSucursal}
        />
      )}
    </div>
  );
};

export default GestionSucursales;