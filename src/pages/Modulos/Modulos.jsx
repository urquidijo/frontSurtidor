import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_URL from "../../config/config";

const Switch = ({ checked, onChange }) => (
  <button
    type="button"
    className={`w-12 h-7 sm:w-10 sm:h-6 flex items-center rounded-full p-1 duration-300 focus:outline-none ${
      checked ? "bg-[#00d1b2]" : "bg-[#444]"
    }`}
    onClick={onChange}
  >
    <span
      className={`bg-white w-5 h-5 sm:w-4 sm:h-4 rounded-full shadow-md transform duration-300 ${
        checked ? "translate-x-5 sm:translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
);

const Modulos = () => {
  const [modulos, setModulos] = useState([]); // todos los módulos
  const [modulosSucursal, setModulosSucursal] = useState([]); // ids de módulos asignados
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(
    () => sessionStorage.getItem("sucursalId") || ""
  );
  const nombreSucursalSeleccionada =
    sucursales.find((s) => s.id === sucursalSeleccionada)?.nombre ||
    "Sucursales";

  // Cargar sucursales y módulos al inicio
  useEffect(() => {
    fetchSucursales();
    fetchModulos();
  }, []);

  // Cargar módulos de la sucursal seleccionada
  useEffect(() => {
    if (sucursalSeleccionada) {
      fetchModulosSucursal(sucursalSeleccionada);
      sessionStorage.setItem("sucursalId", sucursalSeleccionada);
    }
  }, [sucursalSeleccionada]);

  const fetchSucursales = async () => {
    try {
      const res = await fetch(`${API_URL}/sucursales`);
      const data = await res.json();
      setSucursales(data);
      // Si no hay sucursal seleccionada, seleccionar la primera
      // Ya no es necesario seleccionar la primera si el usuario no puede cambiarla.
      // if (!sucursalSeleccionada && data.length > 0) {
      //   setSucursalSeleccionada(data[0].id);
      // }
    } catch (err) {
      toast.error("Error al cargar sucursales");
    }
  };

  const fetchModulos = async () => {
    try {
      const res = await fetch(`${API_URL}/modulos`);
      const data = await res.json();
      setModulos(data);
    } catch (err) {
      toast.error("Error al cargar módulos");
    }
  };

  const fetchModulosSucursal = async (sucursalId) => {
    try {
      const res = await fetch(`${API_URL}/sucursal/${sucursalId}/modulos`);
      const data = await res.json();
      setModulosSucursal(data.map((m) => m.id));
    } catch (err) {
      toast.error("Error al cargar módulos de la sucursal");
    }
  };

  const handleToggleModulo = async (moduloId, checked) => {
    if (!sucursalSeleccionada) return;
    try {
      if (checked) {
        // Añadir módulo
        const res = await fetch(
          `${API_URL}/sucursal/${sucursalSeleccionada}/modulos`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_modulo: moduloId }),
          }
        );
        if (!res.ok) throw new Error();
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "editar modulos",
            estado: "exitoso",
          }),
        });
        toast.success("Módulo añadido");
      } else {
        // Quitar módulo
        const res = await fetch(
          `${API_URL}/sucursal/${sucursalSeleccionada}/modulos/${moduloId}`,
          {
            method: "DELETE",
          }
        );
        if (!res.ok) throw new Error();
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "editar modulos",
            estado: "exitoso",
          }),
        });
        toast.success("Módulo ocultado");
      }
      fetchModulosSucursal(sucursalSeleccionada);
      // Disparar un evento personalizado para que el Layout se actualice
      window.dispatchEvent(new CustomEvent("sucursalModulesUpdated"));
    } catch (err) {
      toast.error("Error al actualizar módulo");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-[#1e1e1e] rounded-xl shadow-lg border border-[#333] text-[#f1f1f1] font-sans">
      {/* Botón de sucursales */}
      <button
        className="absolute top-6 right-8 px-5 py-2 rounded-lg bg-[#00d1b2] text-black font-semibold text-lg"
        disabled
      >
        {nombreSucursalSeleccionada}
      </button>

      <h1 className="text-4xl font-bold text-[#00d1b2] mb-8">
        Gestión de Módulos
      </h1>
      <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-md border border-[#444]">
        {modulos.length === 0 ? (
          <p className="text-center text-gray-400">
            No hay módulos disponibles.
          </p>
        ) : (
          <ul className="space-y-4">
            {modulos.map((modulo) => (
              <li
                key={modulo.id}
                className="flex flex-wrap items-center justify-between gap-4 text-xl font-semibold bg-[#1f1f1f] p-4 rounded-lg border border-[#333]"
              >
                <span className="flex-1 min-w-[150px]">{modulo.nombre}</span>
                <Switch
                  checked={modulosSucursal.includes(modulo.id)}
                  onChange={() =>
                    handleToggleModulo(
                      modulo.id,
                      !modulosSucursal.includes(modulo.id)
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Modulos;
