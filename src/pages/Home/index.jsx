import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalDispensador from "./ModalDispensador";
import ModalManguera from "./ModalManguera.jsx";
import "./home.css";
import API_URL from "../../config/config";
import {
  mostrarConfirmacion,
  mostrarExito,
  mostrarError,
} from "../../utils/alertUtils";
import { showToast } from "../../utils/toastUtils";

const Home = () => {
  const [sucursal, setSucursal] = useState(null);
  const [dispensadores, setDispensadores] = useState([]);
  const [permisos, setPermisos] = useState([]);

  const [openModalManguera, setOpenModalManguera] = useState(false);
  const [modoModalManguera, setModoModalManguera] = useState("crear");
  const [nuevaManguera, setNuevaManguera] = useState({
    esta_activo: true,
    id_dispensador: "",
  });
  const [mangueraSeleccionada, setMangueraSeleccionada] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [modoModal, setModoModal] = useState("crear");
  const [nuevoDispensador, setNuevoDispensador] = useState({
    ubicacion: "",
    capacidad_maxima: "",
    estado: "Activo",
  });
  const [dispensadorSeleccionado, setDispensadorSeleccionado] = useState("");

  useEffect(() => {
    const usuarioId = sessionStorage.getItem("usuarioId");
    if (usuarioId) {
      fetch(`${API_URL}/usuarios/permisos/${usuarioId}`)
        .then((res) => res.json())
        .then((data) => setPermisos(data.permisos.map((p) => p.nombre)))
        .catch((err) => console.error("Error al cargar permisos:", err));
    }

    const sucursalData = {
      id: sessionStorage.getItem("sucursalId"),
      nombre: sessionStorage.getItem("sucursalNombre"),
      direccion: sessionStorage.getItem("sucursalDireccion"),
      telefono: sessionStorage.getItem("sucursalTelefono"),
      correo: sessionStorage.getItem("sucursalCorreo"),
      esta_suspendido: sessionStorage.getItem("sucursalSuspendida") === "true",
    };

    if (sucursalData.id) {
      setSucursal(sucursalData);
      cargarDispensadoresConMangueras(sucursalData.id);
    }
  }, []);

  const cargarDispensadoresConMangueras = async (sucursalId) => {
    try {
      const res = await fetch(
        `${API_URL}/dispensadores/sucursal/${sucursalId}`
      );
      const data = await res.json();

      const dispensadoresConMangueras = await Promise.all(
        data.map(async (dispensador) => {
          const resMangueras = await fetch(
            `${API_URL}/mangueras/dispensador/${dispensador.id}`
          );
          const mangueras = await resMangueras.json();
          return { ...dispensador, mangueras };
        })
      );

      setDispensadores(dispensadoresConMangueras);
    } catch (error) {
      console.error("Error al cargar dispensadores:", error);
      showToast("warning","error al obtener los dispensasdores")
    }
  };
  // FUNCIONES DISPENSADOR

  const handleEliminarDispensador = async (dispensadorId) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar dispensador?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/dispensadores/${dispensadorId}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        await mostrarExito("El dispensador ha sido eliminado.");
        cargarDispensadoresConMangueras(sucursal.id);
      } else {
        const err = await res.json();
        mostrarError(err.message);
      }
    } catch (error) {
      console.error("Error eliminando dispensador:", error);
      mostrarError("Error del servidor");
    }
  };

  const handleCrearDispensador = async () => {
    try {
      await fetch(`${API_URL}/dispensadores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nuevoDispensador,
          capacidad_maxima: parseInt(nuevoDispensador.capacidad_maxima, 10),
          id_sucursal: sucursal.id,
        }),
      });
      showToast("success", "Dispensador creado con éxito");
      cargarDispensadoresConMangueras(sucursal.id);
    } catch (error) {
      console.error("Error creando dispensador:", error);
      showToast("error", "Dispensador creado sin éxito");
    }
  };

  const handleActualizarDispensador = async () => {
    if (!dispensadorSeleccionado) return;

    try {
      await fetch(`${API_URL}/dispensadores/${dispensadorSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nuevoDispensador,
          capacidad_maxima: parseInt(nuevoDispensador.capacidad_maxima, 10),
        }),
      });
      showToast("success", "Dispensador actualizado con éxito");
      cargarDispensadoresConMangueras(sucursal.id);
      setOpenModal(false);
    } catch (error) {
      console.error("Error actualizando dispensador:", error);
      showToast("error", "Dispensador actualizado sin éxito");
    }
  };

  const handleEditarManguera = (manguera) => {
    setModoModalManguera("editar");
    setNuevaManguera({
      esta_activo: manguera.esta_activo,
      id_dispensador: manguera.id_dispensador,
    });
    setMangueraSeleccionada(manguera);
    setOpenModalManguera(true);
  };

  const handleCrearManguera = async () => {
    try {
      await fetch(`${API_URL}/mangueras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaManguera),
      });
      showToast("success", "Manguera creda con éxito");
      cargarDispensadoresConMangueras(sucursal.id);
      setOpenModalManguera(false);
    } catch (error) {
      console.error("Error creando manguera:", error);
      showToast("error", "Manguera creada sin éxito");
    }
  };

  const handleActualizarManguera = async () => {
    if (!mangueraSeleccionada) return;

    try {
      await fetch(`${API_URL}/mangueras/${mangueraSeleccionada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaManguera),
      });
      showToast("success", "Manguera actualizada con éxito");
      cargarDispensadoresConMangueras(sucursal.id);
      setOpenModalManguera(false);
    } catch (error) {
      console.error("Error actualizando manguera:", error);
      showToast("error", "Manguera actualizada sin éxito");
    }
  };
  const handleEliminarManguera = async (mangueraId) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar manguera?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/mangueras/${mangueraId}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        await mostrarExito("La manguera ha sido eliminada.");
        cargarDispensadoresConMangueras(sucursal.id);
      } else {
        const err = await res.json();
        mostrarError(err.message);
      }
    } catch (error) {
      console.error("Error eliminando manguera:", error);
      mostrarError("Error del servidor");
    }
  };

  const handleAbrirModalCrear = () => {
    setModoModal("crear");
    setNuevoDispensador({
      ubicacion: "",
      capacidad_maxima: "",
      estado: "Activo",
    });
    setDispensadorSeleccionado(null); // ← importante limpiar selección
    setOpenModal(true);
  };
  const handleEditarDispensador = (dispensador) => {
    setModoModal("editar");
    setNuevoDispensador({
      ubicacion: dispensador.ubicacion,
      capacidad_maxima: dispensador.capacidad_maxima,
      estado: dispensador.estado,
    });
    setDispensadorSeleccionado(dispensador); // ← asignamos el dispensador actual
    setOpenModal(true);
  };

  return (
    <div className="home-wrapper">
      <main className="home-main">
        <h1 className="home-title">Bienvenido a la Sucursal</h1>

        {sucursal ? (
          <div className="home-sucursal-info">
            <h2>{sucursal.nombre}</h2>
            <p>
              <strong>Dirección:</strong> {sucursal.direccion}
            </p>
            <p>
              <strong>Teléfono:</strong> {sucursal.telefono || "No registrado"}
            </p>
            <p>
              <strong>Correo:</strong> {sucursal.correo}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              <span
                style={{ color: sucursal.esta_suspendido ? "red" : "green" }}
              >
                {sucursal.esta_suspendido ? "Suspendida" : "Activa"}
              </span>
            </p>
          </div>
        ) : (
          <p className="home-loading">Cargando datos de la sucursal...</p>
        )}

        {permisos.includes("ver_dashboard") && (
          <section className="home-dispensadores">
            <h2>Dispensadores de Combustible</h2>
            <button className="btn-crear" onClick={handleAbrirModalCrear}>
              ➕ Nuevo Dispensador
            </button>

            {dispensadores.length > 0 ? (
              <div className="home-dispensadores-grid">
                {dispensadores.map((disp, idx) => (
                  <div key={idx} className="home-dispensador-card">
                    <h3>Ubicación: {disp.ubicacion}</h3>
                    <p>
                      <strong>Estado:</strong> {disp.estado}
                    </p>
                    <p>
                      <strong>Capacidad máxima:</strong> {disp.capacidad_maxima}{" "}
                      m^3
                    </p>
                    <div className="dispensador-actions">
                      <button
                        onClick={() => handleEditarDispensador(disp)}
                        className="btn-dispensador editar"
                      >
                        Editar Dispensador
                      </button>
                      <button
                        onClick={() => handleEliminarDispensador(disp.id)}
                        className="btn-dispensador eliminar"
                      >
                        Eliminar Dispensador
                      </button>
                      <button
                        onClick={() => {
                          setModoModalManguera("crear");
                          setNuevaManguera({
                            esta_activo: true,
                            id_dispensador: disp.id,
                          });
                          setOpenModalManguera(true);
                        }}
                        className="btn-dispensador añadir"
                      >
                        Añadir Manguera
                      </button>
                    </div>
                    <h4>Mangueras:</h4>
                    {disp.mangueras.length > 0 ? (
                      <ul>
                        {disp.mangueras.map((manguera) => (
                          <li key={manguera.id}>
                            <div className="manguera-info">
                              {manguera.esta_activo ? "✅" : "❌"} Manguera{" "}
                              {manguera.id.slice(0, 8)}
                            </div>
                            <span className="manguera-actions">
                              <button
                                onClick={() => handleEditarManguera(manguera)}
                                className="editar"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() =>
                                  handleEliminarManguera(manguera.id)
                                }
                                className="eliminar"
                              >
                                Eliminar
                              </button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Sin mangueras registradas.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="home-empty">
                No se encontraron dispensadores para esta sucursal.
              </p>
            )}
          </section>
        )}
      </main>

      <ModalDispensador
        open={openModal}
        onClose={() => setOpenModal(false)}
        modo={modoModal}
        nuevoDispensador={nuevoDispensador}
        setNuevoDispensador={setNuevoDispensador}
        dispensadorSeleccionado={dispensadorSeleccionado}
        setDispensadorSeleccionado={setDispensadorSeleccionado}
        onCrear={handleCrearDispensador}
        onActualizar={handleActualizarDispensador}
        dispensadores={dispensadores}
      />
      <ModalManguera
        open={openModalManguera}
        onClose={() => setOpenModalManguera(false)}
        modo={modoModalManguera}
        nuevaManguera={nuevaManguera}
        setNuevaManguera={setNuevaManguera}
        onCrear={handleCrearManguera}
        onActualizar={handleActualizarManguera}
      />
    </div>
  );
};

export default Home;
