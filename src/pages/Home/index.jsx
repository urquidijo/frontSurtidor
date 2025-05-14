import { useEffect, useState } from "react";
import ModalDispensador from "./ModalDispensador";
import ModalManguera from "./ModalManguera.jsx";
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
      showToast("warning", "error al obtener los dispensasdores");
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
  <div className=" p-8 bg-[#121212] min-h-screen text-[#f0f0f0] font-sans tracking-wide">
    <main className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-[#00d1b2] mb-8 drop-shadow-md">
        Bienvenido a la Sucursal
      </h1>

      {sucursal ? (
        <div className="bg-[#1f1f1f] rounded-xl p-6 shadow-lg mb-10 border border-[#2a2a2a]">
          <h2 className="text-2xl font-bold text-[#00d1b2] mb-3">
            {sucursal.nombre}
          </h2>
          <div className="space-y-2 text-sm text-[#ddd]">
            <p>
              <span className="font-semibold text-[#ccc]">Dirección:</span> {sucursal.direccion}
            </p>
            <p>
              <span className="font-semibold text-[#ccc]">Teléfono:</span> {sucursal.telefono || "No registrado"}
            </p>
            <p>
              <span className="font-semibold text-[#ccc]">Correo:</span> {sucursal.correo}
            </p>
            <p>
              <span className="font-semibold text-[#ccc]">Estado:</span>{" "}
              <span className={`font-bold ${sucursal.esta_suspendido ? "text-red-500" : "text-green-500"}`}>
                {sucursal.esta_suspendido ? "Suspendida" : "Activa"}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-400">Cargando datos de la sucursal...</p>
      )}

      {permisos.includes("ver_dashboard") && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-semibold text-[#00d1b2]">Dispensadores de Combustible</h2>
            <button
              className="bg-[#00d1b2] text-white px-5 py-2 rounded-lg hover:bg-[#00a89c] transition-all duration-200 shadow-md"
              onClick={handleAbrirModalCrear}
            >
              ➕ Nuevo Dispensador
            </button>
          </div>

          {dispensadores.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dispensadores.map((disp, idx) => (
                <div key={idx} className="bg-[#1f1f1f] rounded-xl shadow-lg p-5 border border-[#2a2a2a]">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Ubicación: <span className="text-[#ccc]">{disp.ubicacion}</span>
                  </h3>
                  <p><span className="font-semibold text-[#ccc]">Estado:</span> {disp.estado}</p>
                  <p><span className="font-semibold text-[#ccc]">Capacidad máxima:</span> {disp.capacidad_maxima} m³</p>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => handleEditarDispensador(disp)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
                    >
                      ✏️ Editar Dispensador
                    </button>
                    <button
                      onClick={() => handleEliminarDispensador(disp.id)}
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
                    >
                      🗑️ Eliminar Dispensador
                    </button>
                    <button
                      onClick={() => {
                        setModoModalManguera("crear");
                        setNuevaManguera({ esta_activo: true, id_dispensador: disp.id });
                        setOpenModalManguera(true);
                      }}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all duration-200"
                    >
                      ➕ Añadir Manguera
                    </button>
                  </div>

                  <h4 className="mt-4 font-semibold text-[#ccc]">Mangueras:</h4>
                  {disp.mangueras.length > 0 ? (
                    <ul className="space-y-1 mt-2">
                      {disp.mangueras.map((manguera) => (
                        <li
                          key={manguera.id}
                          className="flex items-center justify-between bg-[#2a2a2a] p-2 rounded-lg"
                        >
                          <span>
                            {manguera.esta_activo ? "✅" : "❌"} Manguera {manguera.id.slice(0, 8)}
                          </span>
                          <div className="flex space-x-3 text-sm">
                            <button
                              onClick={() => handleEditarManguera(manguera)}
                              className="text-blue-400 hover:underline"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminarManguera(manguera.id)}
                              className="text-red-400 hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 mt-2 text-sm">Sin mangueras registradas.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mt-4 text-sm">
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
