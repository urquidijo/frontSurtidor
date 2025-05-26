import { useState, useEffect } from "react";
import { mostrarConfirmacion, mostrarExito, mostrarError } from "../../utils/alertUtils";
import { showToast } from "../../utils/toastUtils";
import API_URL from "../../config/config";

const InventarioCombustible = () => {
  const [showModal, setShowModal] = useState(false);
  const [tanques, setTanques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTanqueId, setCurrentTanqueId] = useState(null);
  const sucursalId = sessionStorage.getItem("sucursalId");
  const usuarioId = sessionStorage.getItem("usuarioId");
  const [permisos, setPermisos] = useState([]);
  const [rolUsuario, setRolUsuario] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    capacidad_max: "",
    stock: "",
    esta_activo: true,
    fecha_instalacion: new Date().toISOString().split('T')[0],
    ultima_revision: new Date().toISOString().split('T')[0],
    id_sucursal: sucursalId || ""
  });
  const [error, setError] = useState("");

  // Estadísticas calculadas solo con los tanques de la sucursal actual
  const capacidadTotal = tanques.reduce((acc, t) => acc + (Number(t.capacidad_max) || 0), 0);
  const stockActual = tanques.reduce((acc, t) => acc + (Number(t.stock) || 0), 0);
  const ocupacion = capacidadTotal > 0 ? Math.round((stockActual / capacidadTotal) * 100) : 0;

  // Verificar si el usuario tiene permisos de administración
  const hasAdminPermissions = () => {
    // Verificar que el usuario tenga el rol correcto Y el permiso específico
    const hasRolePermission = rolUsuario === "administrador" || rolUsuario === "supervisor";
    const hasSpecificPermission = permisos.includes("gestionar_inventario_combustible");
    
    // Debe cumplir ambas condiciones: rol adecuado y permiso específico
    return hasRolePermission && hasSpecificPermission;
  };

  // Cargar permisos del usuario
  useEffect(() => {
    if (usuarioId) {
      fetch(`${API_URL}/usuarios/permisos/${usuarioId}`)
        .then((res) => res.json())
        .then((data) => {
          // Guardamos los permisos y el rol del usuario
          setPermisos(data.permisos.map((p) => p.nombre));
          setRolUsuario(data.rol || "");
          console.log("Rol del usuario:", data.rol);
          console.log("Permisos del usuario:", data.permisos.map(p => p.nombre));
        })
        .catch((err) => console.error("Error al cargar permisos:", err));
    }
  }, [usuarioId]);

  const fetchTanques = async () => {
    setLoading(true);
    try {
      if (!sucursalId) {
        showToast("error", "No se ha encontrado la información de la sucursal");
        return;
      }

      console.log("Fetching tanques from:", `${API_URL}/tanques?id_sucursal=${sucursalId}`);
      const res = await fetch(`${API_URL}/tanques?id_sucursal=${sucursalId}`);
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("Tanques recibidos:", data);
      setTanques(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tanques:", err);
      showToast("error", "Error al cargar los tanques");
      setTanques([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sucursalId) {
      fetchTanques();
    }
  }, [sucursalId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      capacidad_max: "",
      stock: "",
      esta_activo: true,
      fecha_instalacion: new Date().toISOString().split('T')[0],
      ultima_revision: new Date().toISOString().split('T')[0],
      id_sucursal: sucursalId || ""
    });
    setIsEditing(false);
    setCurrentTanqueId(null);
  };

  const handleOpenModal = (isEdit = false, tanque = null) => {
    // Verificar permisos antes de abrir el modal
    if (!hasAdminPermissions()) {
      showToast("warning", "No tienes permisos para realizar esta acción. Se requiere ser administrador o supervisor y tener el permiso 'gestionar_inventario_comustible'");
      return;
    }
    
    setError("");
    
    if (isEdit && tanque) {
      setIsEditing(true);
      setCurrentTanqueId(tanque.id);
      
      // Formatear las fechas para que sean compatibles con el input type="date"
      const formatDate = (dateString) => {
        if (!dateString) return new Date().toISOString().split('T')[0];
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch (error) {
          return new Date().toISOString().split('T')[0];
        }
      };
      
      setForm({
        nombre: tanque.nombre || "",
        descripcion: tanque.descripcion || "",
        capacidad_max: tanque.capacidad_max?.toString() || "",
        stock: tanque.stock?.toString() || "",
        esta_activo: typeof tanque.esta_activo === 'boolean' ? tanque.esta_activo : true,
        fecha_instalacion: formatDate(tanque.fecha_instalacion),
        ultima_revision: formatDate(tanque.ultima_revision),
        id_sucursal: tanque.id_sucursal || sucursalId || ""
      });
    } else {
      resetForm();
    }
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar permisos antes de enviar el formulario
    if (!hasAdminPermissions()) {
      showToast("warning", "No tienes permisos para realizar esta acción. Se requiere ser administrador o supervisor y tener el permiso 'gestionar_inventario'");
      return;
    }
    
    setError("");
    setFormSubmitting(true);
    
    // Validación simple
    if (!form.nombre || !form.capacidad_max || !form.stock || !form.fecha_instalacion || !form.ultima_revision) {
      setError("Completa todos los campos obligatorios.");
      setFormSubmitting(false);
      return;
    }
    
    try {
      const body = {
        ...form,
        capacidad_max: Number(form.capacidad_max),
        stock: Number(form.stock),
        esta_activo: Boolean(form.esta_activo),
        id_sucursal: sucursalId // Aseguramos que se use el ID de la sucursal actual
      };
      
      console.log(`${isEditing ? "Actualizando" : "Creando"} tanque:`, body);
      
      const url = isEditing 
        ? `${API_URL}/tanques/${currentTanqueId}` 
        : `${API_URL}/tanques`;
        
      const method = isEditing ? "PUT" : "POST";
    
      
      const res = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
      });
      
      const responseText = await res.text();
      
      if (!res.ok) {
        console.error("Error response:", responseText);
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      
      // Mostrar mensaje de éxito con toast
      isEditing 
        ? showToast("success", "Tanque actualizado con éxito")
        : showToast("success", "Tanque creado con éxito");
      
      // Cerrar modal y resetear formulario
      setShowModal(false);
      resetForm();
      
      // Recargar la lista de tanques
      fetchTanques();
    } catch (err) {
      console.error("Error submitting form:", err);
      showToast("error", `Error al ${isEditing ? "actualizar" : "crear"} tanque: ${err.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteTanque = async (id) => {
    // Verificar permisos antes de intentar eliminar
    if (!hasAdminPermissions()) {
      showToast("warning", "No tienes permisos para eliminar tanques. Se requiere ser administrador o supervisor y tener el permiso 'gestionar_inventario'");
      return;
    }

    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar tanque?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;
    
    try {
      
      const res = await fetch(`${API_URL}/tanques/${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
      fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "eliminar tanque",
            estado: "fallido",
          }),
        });
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "eliminar tanque",
            estado: "exitoso",
          }),
        });
      showToast("success", "Tanque eliminado con éxito");
      fetchTanques(); // Recargar tanques después de eliminar
    } catch (err) {
      console.error("Error eliminando tanque:", err);
      showToast("error", `Error al eliminar tanque: ${err.message}`);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#1f1f1f] text-[#f0f0f0]">
      <h2 className="text-3xl font-bold text-[#00d1b2] mb-8">Inventario de Combustible</h2>
      {!sucursalId ? (
        <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#444]">
          <p className="text-red-400">No se ha encontrado la información de la sucursal. Por favor, inicie sesión nuevamente.</p>
        </div>
      ) : (
        <>
          {/* Estadísticas */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="flex-1 bg-[#2a2a2a] rounded-lg p-6 border border-[#444]">
              <div className="text-[#00d1b2] font-semibold">Capacidad Total</div>
              <div className="text-2xl font-bold mt-2">{capacidadTotal} m³</div>
            </div>
            <div className="flex-1 bg-[#2a2a2a] rounded-lg p-6 border border-[#444]">
              <div className="text-[#00d1b2] font-semibold">Stock Actual</div>
              <div className="text-2xl font-bold mt-2">{stockActual} m³</div>
            </div>
            <div className="flex-1 bg-[#2a2a2a] rounded-lg p-6 border border-[#444]">
              <div className="text-[#00d1b2] font-semibold">Ocupación</div>
              <div className="text-2xl font-bold mt-2">{ocupacion}%</div>
              <div className="w-full h-2 bg-[#444] rounded mt-2">
                <div
                  className="h-2 bg-[#00bcd4] rounded"
                  style={{ width: `${ocupacion}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tanques */}
          <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#444]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-[#00d1b2]">Tanques de Almacenamiento</h3>
              {/* Solo mostrar botón de nuevo tanque si tiene permisos */}
              {hasAdminPermissions() ? (
                <button
                  className="bg-[#00bcd4] hover:bg-[#0097a7] text-white font-semibold px-4 py-2 rounded transition"
                  onClick={() => handleOpenModal(false)}
                >
                  + Nuevo Tanque
                </button>
              ) : (
                <span className="text-sm text-[#888]">
                  No tienes permisos para crear tanques
                </span>
              )}
            </div>
            {loading ? (
              <div className="text-center text-[#ccc] py-8">Cargando...</div>
            ) : tanques.length === 0 ? (
              <div className="bg-[#1f1f1f] rounded-lg p-6 flex flex-col items-center border border-[#444]">
                <p className="mb-4 text-[#ccc]">No se encontraron tanques registrados para esta sucursal.</p>
                {hasAdminPermissions() && (
                  <button
                    className="bg-[#00bcd4] hover:bg-[#0097a7] text-white font-semibold px-4 py-2 rounded transition"
                    onClick={() => handleOpenModal(false)}
                  >
                    Registrar primer tanque
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="bg-[#1f1f1f] text-[#00d1b2]">
                      <th className="py-2 px-4">Nombre</th>
                      <th className="py-2 px-4">Descripción</th>
                      <th className="py-2 px-4">Capacidad (m³)</th>
                      <th className="py-2 px-4">Stock (m³)</th>
                      <th className="py-2 px-4">Fecha Instalación</th>
                      <th className="py-2 px-4">Última Revisión</th>
                      <th className="py-2 px-4">Estado</th>
                      {hasAdminPermissions() && <th className="py-2 px-4">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {tanques.map((t) => (
                      <tr key={t.id} className="border-b border-[#444] hover:bg-[#232323]">
                        <td className="py-2 px-4">{t.nombre}</td>
                        <td className="py-2 px-4">{t.descripcion}</td>
                        <td className="py-2 px-4">{t.capacidad_max}</td>
                        <td className="py-2 px-4">{t.stock}</td>
                        <td className="py-2 px-4">{t.fecha_instalacion?.slice(0,10)}</td>
                        <td className="py-2 px-4">{t.ultima_revision?.slice(0,10)}</td>
                        <td className="py-2 px-4">
                          <span 
                            className={`px-2 py-1 rounded text-xs ${
                              t.esta_activo 
                                ? 'bg-green-900 text-green-200' 
                                : 'bg-red-900 text-red-200'
                            }`}
                          >
                            {t.esta_activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        {hasAdminPermissions() && (
                          <td className="py-2 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleOpenModal(true, t)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                                title="Editar tanque"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() => handleDeleteTanque(t.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                title="Eliminar tanque"
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal para Crear/Editar Tanque */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-[#2a2a2a] rounded-lg p-8 w-full max-w-lg shadow-lg relative border border-[#444]">
                <h3 className="text-xl font-bold text-[#00d1b2] mb-6">
                  {isEditing ? "Editar Tanque de Combustible" : "Nuevo Tanque de Combustible"}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block mb-1">Nombre del tanque *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-[#1f1f1f] border border-[#444] text-[#f0f0f0]"
                      placeholder="Ej: Tanque Principal"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-[#1f1f1f] border border-[#444] text-[#f0f0f0]"
                      placeholder="Breve descripción del tanque"
                    ></textarea>
                  </div>
                  <div className="mb-4 flex gap-4">
                    <div className="flex-1">
                      <label className="block mb-1">Capacidad máxima (m³) *</label>
                      <input
                        type="number"
                        name="capacidad_max"
                        value={form.capacidad_max}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-[#1f1f1f] border border-[#444] text-[#f0f0f0]"
                        placeholder="Ej: 10000"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1">Stock actual (m³) *</label>
                      <input
                        type="number"
                        name="stock"
                        value={form.stock}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-[#1f1f1f] border border-[#444] text-[#f0f0f0]"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4 flex gap-4">
                    <div className="flex-1">
                      <label className="block mb-1">Fecha de instalación *</label>
                      <input
                        type="date"
                        name="fecha_instalacion"
                        value={form.fecha_instalacion}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-[#1f1f1f] border border-[#444] text-[#f0f0f0]"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1">Fecha última revisión *</label>
                      <input
                        type="date"
                        name="ultima_revision"
                        value={form.ultima_revision}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-[#1f1f1f] border border-[#444] text-[#f0f0f0]"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-6 flex items-center gap-2">
                    <label>Estado del tanque:</label>
                    <input
                      type="checkbox"
                      name="esta_activo"
                      checked={form.esta_activo}
                      onChange={handleChange}
                      className="accent-[#00bcd4]"
                    />
                    <span className="text-[#00d1b2]">Activo</span>
                  </div>
                  {error && <div className="text-red-400 mb-2">{error}</div>}
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="submit"
                      className="bg-[#00bcd4] hover:bg-[#0097a7] text-white font-semibold px-4 py-2 rounded transition"
                      disabled={formSubmitting}
                    >
                      {formSubmitting 
                        ? (isEditing ? "Actualizando..." : "Creando...") 
                        : (isEditing ? "Actualizar Tanque" : "Crear Tanque")}
                    </button>
                    <button
                      type="button"
                      className="bg-[#444] hover:bg-[#666] text-white px-4 py-2 rounded transition"
                      onClick={() => setShowModal(false)}
                      disabled={formSubmitting}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
                <button
                  className="absolute top-2 right-2 text-[#ccc] hover:text-[#00d1b2] text-2xl"
                  onClick={() => setShowModal(false)}
                  disabled={formSubmitting}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InventarioCombustible;