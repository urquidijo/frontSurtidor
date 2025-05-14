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

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      showToast("warning","error al obtener usuarios");
    }
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
        await mostrarExito("El usuario ha sido eliminado.");
        setUsuarios((prev) => prev.filter((u) => u.ci !== ci));
      } else {
        const err = await res.json();
        mostrarError(err.message);
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      mostrarError('Error del servidor');
    }
  };

  const handleCloseModal = () => {
    setUsuarioEditando(null);
    fetchUsuarios();
  };

  return (
  <div className="p-8 text-[#f1f1f1]">
    <h2 className="text-[1.8rem] mb-6 text-[#00d1b2] font-bold">Gestión de Usuarios</h2>

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
            <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">Nombre</th>
            <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">CI</th>
            <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">Sexo</th>
            <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">Correo</th>
            <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">Teléfono</th>
            <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">Sucursal</th>
            <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">Rol</th>
            <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id} className="hover:bg-[#1f1f1f] transition">
              <td className="px-4 py-3 border-b border-[#444]">{usuario.nombre}</td>
              <td className="px-4 py-3 border-b border-[#444]">{usuario.ci}</td>
              <td className="px-4 py-3 border-b border-[#444]">{usuario.sexo}</td>
              <td className="px-4 py-3 border-b border-[#444]">{usuario.correo}</td>
              <td className="px-4 py-3 border-b border-[#444]">{usuario.telefono}</td>
              <td className="px-4 py-3 border-b border-[#444]">{usuario.sucursal}</td>
              <td className="px-4 py-3 border-b border-[#444]">{usuario.rol}</td>
              <td className="px-4 py-3 border-b border-[#444]">
                <button
                  className="bg-[#00d1b2] text-black px-3 py-1 rounded-md mr-2 text-sm hover:bg-[#00bfa4] transition"
                  onClick={() => setUsuarioEditando(usuario)}
                >
                  Permisos
                </button>
                <button
                  className="bg-[#ff5c5c] text-white px-3 py-1 rounded-md text-sm hover:bg-[#e04848] transition"
                  onClick={() => handleDelete(usuario.ci)}
                >
                  Eliminar
                </button>
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
