import { useEffect, useState } from "react";
import API_URL from "../../config/config";
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
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
    <div className="bg-[#1f1f1f] text-[#f0f0f0] rounded-[12px] shadow-xl p-8 w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto animate-fadeIn">
      <h2 className="text-2xl font-semibold text-center text-[#00d1b2] mb-6">Gestionar Permisos</h2>

      <label className="block mb-2 text-[#ccc] font-bold">Rol:</label>
      <select
        value={rolSeleccionado}
        onChange={(e) => setRolSeleccionado(e.target.value)}
        className="w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white mb-4 text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors"
      >
        {roles.map((rol) => (
          <option key={rol.id} value={rol.id}>
            {rol.nombre}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-6 pr-1 custom-scrollbar">
        {permisos.map((permiso) => (
          <div
            key={permiso.id}
            className="flex justify-between items-center bg-[#2a2a2a] text-[#ccc] rounded-[10px] px-4 py-2 text-[0.95rem]"
          >
            <span>{permiso.nombre}</span>
            <label className="relative inline-block w-[46px] h-[24px]">
              <input
                type="checkbox"
                checked={permisosUsuario.has(permiso.id)}
                onChange={() => handlePermisoChange(permiso.id)}
                className="opacity-0 w-0 h-0 peer"
              />
              <span className="absolute top-0 left-0 right-0 bottom-0 bg-[#444] rounded-full transition duration-300 peer-checked:bg-[#00d1b2]"></span>
              <span className="absolute left-[3px] bottom-[3px] w-[18px] h-[18px] bg-white rounded-full transition duration-300 peer-checked:translate-x-[22px]"></span>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={handleGuardar}
          className="bg-[#00bcd4] hover:bg-[#0097a7] text-white font-bold px-4 py-2 rounded-[10px] transition"
        >
          Guardar
        </button>
        <button
          onClick={onClose}
          className="bg-[#444] hover:bg-[#666] text-white font-bold px-4 py-2 rounded-[10px] transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
);


};

export default ModalPermisos;
