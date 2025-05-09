import { useEffect, useState } from "react";
import "./ofertas.css";
import API_URL from "../../config/config.js";
import ModalOferta from "./ModalOfertas.jsx";
import { showToast } from "../../utils/toastUtils";
import {
  mostrarConfirmacion,
  mostrarExito,
  mostrarError,
} from "../../utils/alertUtils";

const Ofertas = () => {
  const [ofertas, setOfertas] = useState([]);
  const [ofertaEditando, setOfertaEditando] = useState(null);

  useEffect(() => {
    fetchOfertas();
  }, []);

  const fetchOfertas = async () => {
    try {
      const res = await fetch(`${API_URL}/descuentos`);
      const data = await res.json();
      setOfertas(data);
    } catch (error) {
      console.error("Error al cargar ofertas:", error);
      showToast("warning", "error al obtener descuentos");
    }
  };

  const handleDelete = async (id) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar descuento?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/descuentos/${id}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        await mostrarExito("El descuento ha sido eliminado.");
        setOfertas((prev) => prev.filter((o) => o.id !== id));
      } else {
        const err = await res.json();
        console.error("Error al eliminar el descuento:", err);
        mostrarError("Error al eliminar el descuento:");
      }
    } catch (err) {
      console.error("Error al eliminar el descuento:", err);
      mostrarError("Error del servidor");
    }
  };
  const crearOferta = async (nuevaOferta) => {
    try {
      const res = await fetch(`${API_URL}/descuentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaOferta),
      });

      if (!res.ok) {
        showToast("error", "Descuento creado sin éxito");
        return;
      }
      showToast("success", "Descuento creado con éxito");
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear oferta:", error);
      showToast("error", "Descuento creado sin éxito");
    }
  };

  const actualizarOferta = async (id, ofertaActualizada) => {
    try {
      const res = await fetch(`${API_URL}/descuentos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ofertaActualizada),
      });

      if (!res.ok) {
        showToast("error", "Descuento actualizado sin éxito");
        return;
      }
      showToast("success", "Descueto actualizado con éxito");
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar oferta:", error);
      showToast("error", "Descuento actualizado sin éxito");
    }
  };

  const handleCloseModal = () => {
    setOfertaEditando(null);
    fetchOfertas();
  };

  return (
    <div className="ofertas-container">
      <h2 className="ofertas-title">Gestión de Descuentos</h2>
      <button className="crear-btn" onClick={() => setOfertaEditando({})}>
        Crear Nuevo Descuento
      </button>
      <div className="tabla-ofertas-wrapper">
        <table className="tabla-ofertas">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Porcentaje</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ofertas.map((o) => (
              <tr key={o.id}>
                <td>{o.nombre}</td>
                <td>{o.descripcion}</td>
                <td>{o.porcentaje}%</td>
                <td>{o.esta_activo ? "Sí" : "No"}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => setOfertaEditando(o)}
                  >
                    Editar
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(o.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ofertaEditando && (
        <ModalOferta
          ofertaSeleccionada={ofertaEditando}
          onClose={handleCloseModal}
          onCrear={crearOferta}
          onActualizar={actualizarOferta}
        />
      )}
    </div>
  );
};

export default Ofertas;
