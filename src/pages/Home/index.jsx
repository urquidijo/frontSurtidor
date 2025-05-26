import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import {
  mostrarConfirmacion,
  mostrarExito,
  mostrarError,
} from "../../utils/alertUtils";
import { showToast } from "../../utils/toastUtils";

const Home = () => {
  const [sucursal, setSucursal] = useState(null);
  useEffect(() => {
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
    }
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="bg-gradient-to-br from-[#1a1a1a] to-[#222222] border border-[#2a2a2a] rounded-2xl shadow-2xl p-8 sm:p-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-[#00d1b2] drop-shadow mb-8">
          ¡Bienvenido a la Sucursal!
        </h1>

        {sucursal ? (
          <div className="bg-[#121212] rounded-xl p-6 sm:p-8 border border-[#2c2c2c] shadow-inner">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#00d1b2] mb-6 text-center">
              {sucursal.nombre}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[#ddd] text-base sm:text-lg">
              <div>
                <p className="font-semibold text-[#aaa] mb-1">Dirección</p>
                <p>{sucursal.direccion}</p>
              </div>
              <div>
                <p className="font-semibold text-[#aaa] mb-1">Teléfono</p>
                <p>{sucursal.telefono || "No registrado"}</p>
              </div>
              <div>
                <p className="font-semibold text-[#aaa] mb-1">Correo</p>
                <p>{sucursal.correo}</p>
              </div>
              <div>
                <p className="font-semibold text-[#aaa] mb-1">Estado</p>
                <p
                  className={`font-bold ${
                    sucursal.esta_suspendido ? "text-red-500" : "text-green-400"
                  }`}
                >
                  {sucursal.esta_suspendido ? "Suspendida" : "Activa"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-6">
            Cargando datos de la sucursal...
          </p>
        )}
      </section>
    </main>
  );
};

export default Home;
