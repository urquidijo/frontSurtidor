import { useEffect, useState } from "react";
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
    <div className="p-8 text-[#f1f1f1]">
      <h2 className="text-[1.8rem] mb-6 text-[#00d1b2] font-bold">
        Gestión de Descuentos
      </h2>

      <div className="flex justify-start mb-4">
        <button
          className="bg-[#00d1b2] text-black px-5 py-2 rounded-lg font-bold hover:bg-[#00bfa4] transition"
          onClick={() => setOfertaEditando({})}
        >
          + Crear Nuevo Descuento
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
                Descripción
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Porcentaje
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Activo
              </th>
              <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {ofertas.map((o) => (
              <tr key={o.id} className="hover:bg-[#1f1f1f] transition">
                <td className="px-4 py-3 border-b border-[#444]">{o.nombre}</td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {o.descripcion}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {o.porcentaje}%
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  {o.esta_activo ? "Sí" : "No"}
                </td>
                <td className="px-4 py-3 border-b border-[#444]">
                  <button
                    className="bg-[#00d1b2] text-black px-3 py-1 rounded-md mr-2 text-sm hover:bg-[#00bfa4] transition"
                    onClick={() => setOfertaEditando(o)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-[#ff5c5c] text-white px-3 py-1 rounded-md text-sm hover:bg-[#e04848] transition"
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
