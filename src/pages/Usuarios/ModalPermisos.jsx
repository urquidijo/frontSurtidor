import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import "./modalPermisos.css";
import { showToast } from "../../utils/toastUtils";
import toast from "react-hot-toast";

const ModalPermisos = ({ usuarioSeleccionado, onClose, onRolActualizado }) => {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [permisosUsuario, setPermisosUsuario] = useState(new Set());
  const [rolSeleccionado, setRolSeleccionado] = useState("");


  useEffect(() => {
    if (usuarioSeleccionado) {
      const fetchDatos = async () => {
        try {
          const [rolesRes, permisosRes, usuarioPermisosRes] = await Promise.all(
            [
              fetch(`${API_URL}/roles`),
              fetch(`${API_URL}/permisos`),
              fetch(`${API_URL}/usuarios/permisos/${usuarioSeleccionado.id}`),
            ]
          );

          const [rolesData, permisosData, usuarioPermisosData] =
            await Promise.all([
              rolesRes.json(),
              permisosRes.json(),
              usuarioPermisosRes.json(),
            ]);

          setRoles(rolesData);
          setPermisos(permisosData);

          const permisosDelUsuario = new Set(
            usuarioPermisosData.permisos.map((p) => p.id)
          );
          setPermisosUsuario(permisosDelUsuario);

          const rolActual = rolesData.find(
            (r) => r.nombre === usuarioPermisosData.rol
          );
          setRolSeleccionado(rolActual?.id || "");
          
        } catch (error) {
          console.error("Error al cargar datos del modal:", error);
          showToast("warning","error al obtener los datos")
        }
      };

      fetchDatos();
    }
  }, [usuarioSeleccionado]);

  const handlePermisoChange = (permisoId) => {
    const updated = new Set(permisosUsuario);
    if (updated.has(permisoId)) {
      updated.delete(permisoId);
    } else {
      updated.add(permisoId);
    }
    setPermisosUsuario(updated);
  };

  const handleGuardar = async () => {
    try {
      if (!rolSeleccionado) {
        alert("Debe seleccionar un rol antes de guardar.");
        return;
      }
      const loadingToast = toast.loading("Guardando Permisos...");
      const response = await fetch(
        `${API_URL}/usuarios/permisos/${usuarioSeleccionado.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_rol: rolSeleccionado,
            permisosSeleccionados: Array.from(permisosUsuario),
          }),
        }
      );
      toast.dismiss(loadingToast);
  
      if (response.ok) {
        toast.success("Permisos actualizados correctamente");
        // Recargar los permisos desde backend
        const usuarioPermisosRes = await fetch(`${API_URL}/usuarios/permisos/${usuarioSeleccionado.id}`);
        const usuarioPermisosData = await usuarioPermisosRes.json();
  
        const permisosActualizados = new Set(usuarioPermisosData.permisos.map(p => p.id));
        setPermisosUsuario(permisosActualizados);
  
        const rolNombre = roles.find((r) => r.id === rolSeleccionado)?.nombre || "Rol desconocido";
        if (onRolActualizado) {
          onRolActualizado(usuarioSeleccionado.id, rolNombre);
        }
        onClose();
  
      } else {
        const error = await response.json();
        showToast("error", "Error al actualizar los Permisos");
      }
    } catch (error) {
      console.error("Error al guardar permisos:", error);
      showToast("error", "Error del servidor");
    }
  };
  

  return (
    <div className="modal-permiso-overlay">
      <div className="modal-permiso-content">
        <h2>Gestionar Permisos</h2>

        <label>Rol:</label>
        <select
          value={rolSeleccionado}
          onChange={(e) => setRolSeleccionado(e.target.value)}
        >
          {roles.map((rol) => (
            <option key={rol.id} value={rol.id}>
              {rol.nombre}
            </option>
          ))}
        </select>

        <div className="permisos-lista">
          {permisos.map((permiso) => (
            <div key={permiso.id} className="permiso-item">
              <span>{permiso.nombre}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={permisosUsuario.has(permiso.id)}
                  onChange={() => handlePermisoChange(permiso.id)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>

        <div className="modal-buttons">
          <button className="guardar-btn" onClick={handleGuardar}>
            Guardar
          </button>
          <button className="cerrar-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPermisos;
