import { useEffect, useState } from "react";
import "./usuarios.css";
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
    <div className="usuarios-container">
      <h2 className="usuarios-title">Gestión de Usuarios</h2>

      <div className="crear-usuario-btn-wrapper">
        <button
          className="crear-usuario-btn"
          onClick={() => setModalCrearAbierto(true)}
        >
          + Crear una cuenta
        </button>
      </div>

      <div className="tabla-usuarios-wrapper">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>CI</th>
              <th>Sexo</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Sucursal</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.ci}</td>
                <td>{usuario.sexo}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.telefono}</td>
                <td>{usuario.sucursal}</td>
                <td>{usuario.rol}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => setUsuarioEditando(usuario)}
                  >
                    Permisos
                  </button>
                  <button
                    className="delete-btn"
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
