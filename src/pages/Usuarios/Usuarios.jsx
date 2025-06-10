import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import ModalPermisos from "./ModalPermisos";
import ModalCreateUser from "./ModalCreateUser";
import { showToast } from "../../utils/toastUtils";
import {
  mostrarConfirmacion,
  mostrarExito,
  mostrarError,
} from "../../utils/alertUtils";
import Filtros from "../../utils/Filtros.jsx";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const usuarioId = sessionStorage.getItem("usuarioId");
  const [roles, setRoles] = useState([]);

  const [filtrosActivos, setFiltrosActivos] = useState({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [valoresFiltro, setValoresFiltro] = useState({});

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, [filtrosActivos]);

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/roles`);
      if (!res.ok) {
        showToast("warning", "error al cargar roles");
      } else {
        const data = await res.json();
        const nombresRoles = data.map((rol) => rol.nombre);
        setRoles(nombresRoles);
      }
    } catch (error) {
      console.error("Error al cargar roless:", error);
      showToast("warning", "error al obtener roles");
    }
  };

  const fetchUsuarios = async () => {
    try {
      const query = new URLSearchParams(filtrosActivos).toString();
      const res = await fetch(`${API_URL}/users?${query}`);
      if (!res.ok) {
        if (res.status === 404) {
          showToast("warning", "no hay resultados en la busqueda");
          setUsuarios([]); // vacío pero no rompe
        } else {
          throw new Error("Error en la petición");
        }
      } else {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      showToast("warning", "error al obtener usuarios");
    }
  };
  const aplicarFiltros = () => {
    setFiltrosActivos(valoresFiltro); // Se activa el fetch automáticamente por useEffect
  };

  const handleDelete = async (ci) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar usuario?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/users/ci/${ci}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "eliminar usuario",
            estado: "exitoso",
          }),
        });
        await mostrarExito("El usuario ha sido eliminado.");
        setUsuarios((prev) => prev.filter((u) => u.ci !== ci));
      } else {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "eliminar usuario",
            estado: "fallido",
          }),
        });
        const err = await res.json();
        mostrarError(err.message);
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      mostrarError("Error del servidor");
    }
  };

  const handleCloseModal = () => {
    setUsuarioEditando(null);
    fetchUsuarios();
  };
  const handleCloseFiltro = () => {
    setMostrarFiltros(!mostrarFiltros)
    setValoresFiltro({})
    setFiltrosActivos({})
    useEffect()
  };
  

  return (
    <div className="p-8 text-[#f1f1f1]">
      <h2 className="text-[1.8rem] mb-6 text-[#00d1b2] font-bold">
        Gestión de Usuarios
      </h2>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={handleCloseFiltro}
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
            { campo: "nombre", label: "Nombre" },
            { campo: "ci", label: "CI" },
            { campo: "rol", label: "Rol", tipo: "select", opciones: roles },
            {
              campo: "sexo",
              label: "Sexo",
              tipo: "select",
              opciones: ["M", "F"],
            },
          ]}
          onChange={setValoresFiltro}
        />
      )}
      <div className="flex justify-start mb-4">
        <button
          className="bg-[#00d1b2] text-black px-5 py-2 rounded-lg font-bold hover:bg-[#00bfa4] transition"
          onClick={() => setModalCrearAbierto(true)}
        >
          + Crear una cuenta
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
                CI
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Sexo
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Correo
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Teléfono
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Sucursal
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Rol
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-[#1f1f1f] transition">
                <td className="px-4 py-3 border-b border-[#444]">
                  {usuario.nombre}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {usuario.ci}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {usuario.sexo}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {usuario.correo}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {usuario.telefono}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {usuario.sucursal}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {usuario.rol}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
                    <button
                      className="flex-1 min-w-[100px] bg-[#00d1b2] text-black px-2 py-1.5 rounded-md text-sm font-semibold hover:bg-[#00bfa4] transition"
                      onClick={() => setUsuarioEditando(usuario)}
                    >
                      Permisos
                    </button>
                    <button
                      className="flex-1 min-w-[100px] bg-[#ff5c5c] text-white px-2 py-1.5 rounded-md text-sm font-semibold hover:bg-[#e04848] transition"
                      onClick={() => handleDelete(usuario.ci)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {usuarioEditando && (
        <ModalPermisos
          usuarioSeleccionado={usuarioEditando}
          onClose={handleCloseModal}
        />
      )}
      {modalCrearAbierto && (
        <ModalCreateUser
          onClose={() => setModalCrearAbierto(false)}
          onUserCreated={() => fetchUsuarios()}
        />
      )}
    </div>
  );
};

export default Usuarios;
