import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../../config/config";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [permisos, setPermisos] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [seguridadOpen, setSeguridadOpen] = useState(false);
  const [inventarioOpen, setInventarioOpen] = useState(false);
  const [operacionesOpen, setOperacionesOpen] = useState(false);
  const [comercialOpen, setComercialOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const handleLogOut = () => {
    const usuarioId = sessionStorage.getItem("usuarioId");
    fetch(`${API_URL}/bitacora/entrada`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId,
        acciones: "logOut",
        estado: "exitoso",
      }),
    });
    sessionStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const usuarioId = sessionStorage.getItem("usuarioId");
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // Restablecer el sidebar si se agranda la pantalla
      }
    };

    window.addEventListener("resize", handleResize);
    if (usuarioId) {
      fetch(`${API_URL}/usuarios/permisos/${usuarioId}`)
        .then((res) => res.json())
        .then((data) => setPermisos(data.permisos.map((p) => p.nombre)))
        .catch((err) => console.error("Error al cargar permisos:", err));
    }
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden bg-[#1e1e1e] text-[#f1f1f1] font-sans">
      {/* Botón Toggle en móviles */}
      <button
        className="fixed top-3 left-3 z-50 bg-[#00d1b2cc] text-black rounded-md px-3 py-2 text-base md:hidden shadow-md hover:bg-[#00d1b2] transition-all"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={` custom-scrollbar fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-[#111]/90 backdrop-blur-lg p-7 border-r border-[#333] rounded-r-2xl overflow-y-auto transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-[#00d1b2] text-[2rem] font-bold mb-8 text-center">
          Octano
        </h2>

        <ul className="space-y-2 flex-1 text-[0.95rem]">
          {permisos.includes("ver_dashboard") && (
            <li
              className={`cursor-pointer px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive("/home")
                  ? "bg-[#2c9d8c] text-white font-semibold"
                  : "hover:bg-[#2c9d8c33]"
              }`}
              onClick={() => navigate("/home")}
            >
              Dashboard
            </li>
          )}

          {/* Seguridad y acceso */}
          {permisos.includes("gestionar_usuarios") && (
            <>
              <li
                className="font-semibold cursor-pointer px-3 py-2 rounded-lg hover:bg-[#2c9d8c33] transition-all"
                onClick={() => setSeguridadOpen(!seguridadOpen)}
              >
                Seguridad y acceso ▾
              </li>
              {seguridadOpen && (
                <ul className="pl-3 border-l-2 border-[#00ffaa66] space-y-1">
                  {permisos.includes("gestionar_usuarios") && (
                    <li
                      className={`cursor-pointer px-2 py-1 rounded transition ${
                        isActive("/usuarios")
                          ? "bg-[#2c9d8c] text-white"
                          : "hover:bg-[#2c9d8c33]"
                      }`}
                      onClick={() => navigate("/usuarios")}
                    >
                      Usuarios
                    </li>
                  )}
                </ul>
              )}
            </>
          )}

          {/* Inventario */}
          {
            <>
              <li
                className="font-semibold cursor-pointer px-3 py-2 rounded-lg hover:bg-[#2c9d8c33] transition-all"
                onClick={() => setInventarioOpen(!inventarioOpen)}
              >
                Inventario ▾
              </li>
              {inventarioOpen && (
                <ul className="pl-3 border-l-2 border-[#00ffaa66] space-y-1">
                  <li
                    className={`cursor-pointer px-2 py-1 rounded transition ${
                      isActive("/inventario/combustible")
                        ? "bg-[#2c9d8c] text-white"
                        : "hover:bg-[#2c9d8c33]"
                    }`}
                    onClick={() => navigate("/inventario/combustible")}
                  >
                    Inventario de combustible
                  </li>
                  <li
                    className={`cursor-pointer px-2 py-1 rounded transition ${
                      isActive("/inventario/productos")
                        ? "bg-[#2c9d8c] text-white"
                        : "hover:bg-[#2c9d8c33]"
                    }`}
                    onClick={() => navigate("/inventario/productos")}
                  >
                    Inventario de productos
                  </li>
                </ul>
              )}
            </>
          }

          {/* Operaciones */}
          <li
            className="font-bold cursor-pointer px-4 py-3 rounded-lg hover:bg-[#2c9d8c33] transition-all"
            onClick={() => setOperacionesOpen(!operacionesOpen)}
          >
            Operaciones ▾
          </li>

          {operacionesOpen && (
            <ul className="pl-5 border-l-4 border-[#00ffaa66] space-y-2">
              <li
                className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                  isActive("/asistencias")
                    ? "bg-[#2c9d8c] text-white"
                    : "hover:bg-[#2c9d8c33]"
                }`}
                onClick={() => navigate("/asistencias")}
              >
                Planilla de asistencia
              </li>

              {permisos.includes("ver_bitacora") && (
                <li
                  className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                    isActive("/bitacora")
                      ? "bg-[#2c9d8c] text-white"
                      : "hover:bg-[#2c9d8c33]"
                  }`}
                  onClick={() => navigate("/bitacora")}
                >
                  Bitácora
                </li>
              )}
              {permisos.includes("gestionar_dispensadores") && (
                <li
                  className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                    isActive("/dispensadores")
                      ? "bg-[#2c9d8c] text-white"
                      : "hover:bg-[#2c9d8c33]"
                  }`}
                  onClick={() => navigate("/dispensadores")}
                >
                  Dispensadores
                </li>
              )}
            </ul>
          )}

          {/* Gestión comercial */}
          {(permisos.includes("gestionar_ventas") ||
            permisos.includes("gestionar_compras") ||
            permisos.includes("gestionar_proveedores") ||
            permisos.includes("gestionar_ordenes_de_compra") ||
            permisos.includes("gestionar_ofertas")) && (
            <>
              <li
                className="font-bold cursor-pointer px-4 py-3 rounded-lg hover:bg-[#2c9d8c33] transition-all"
                onClick={() => setComercialOpen(!comercialOpen)}
              >
                Gestión comercial ▾
              </li>
              {comercialOpen && (
                <ul className="pl-5 border-l-4 border-[#00ffaa66] space-y-2">
                  {permisos.includes("gestionar_ventas") && (
                    <li
                      className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                        isActive("/ventas")
                          ? "bg-[#2c9d8c] text-white"
                          : "hover:bg-[#2c9d8c33]"
                      }`}
                      onClick={() => navigate("/ventas")}
                    >
                      Ventas
                    </li>
                  )}
                  {permisos.includes("gestionar_compras") && (
                    <li
                      className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                        isActive("/compras")
                          ? "bg-[#2c9d8c] text-white"
                          : "hover:bg-[#2c9d8c33]"
                      }`}
                      onClick={() => navigate("/compras")}
                    >
                      Compras
                    </li>
                  )}
                  {permisos.includes("gestionar_proveedores") && (
                    <li
                      className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                        isActive("/proveedores")
                          ? "bg-[#2c9d8c] text-white"
                          : "hover:bg-[#2c9d8c33]"
                      }`}
                      onClick={() => navigate("/proveedores")}
                    >
                      Proveedores
                    </li>
                  )}
                  {permisos.includes("gestionar_ordenes_de_compra") && (
                    <li
                      className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                        isActive("/ordenesCompra")
                          ? "bg-[#2c9d8c] text-white"
                          : "hover:bg-[#2c9d8c33]"
                      }`}
                      onClick={() => navigate("/ordenesCompra")}
                    >
                      Ordenes_de_compra
                    </li>
                  )}
                  {permisos.includes("gestionar_ofertas") && (
                    <li
                      className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                        isActive("/ofertas")
                          ? "bg-[#2c9d8c] text-white"
                          : "hover:bg-[#2c9d8c33]"
                      }`}
                      onClick={() => navigate("/ofertas")}
                    >
                      Ofertas
                    </li>
                  )}
                </ul>
              )}
            </>
          )}

          {/* Administración */}
          <li
            className="font-bold cursor-pointer px-4 py-3 rounded-lg hover:bg-[#2c9d8c33] transition-all"
            onClick={() => setAdminOpen(!adminOpen)}
          >
            Reportes ▾
          </li>
          {adminOpen && (
            <ul className="pl-5 border-l-4 border-[#00ffaa66] space-y-2">
              <li
                className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                  isActive("/quejas")
                    ? "bg-[#2c9d8c] text-white"
                    : "hover:bg-[#2c9d8c33]"
                }`}
                onClick={() => navigate("/quejas")}
              >
                Quejas y sugerencias
              </li>
              {permisos.includes("gestionar_modulo") && (
                <li
                  className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                    isActive("/modulos")
                      ? "bg-[#2c9d8c] text-white"
                      : "hover:bg-[#2c9d8c33]"
                  }`}
                  onClick={() => navigate("/modulos")}
                >
                  Modulos
                </li>
              )}
            </ul>
          )}

          {/* Perfil */}
          <li
            className={`cursor-pointer px-4 py-3 rounded-lg transition-all ${
              isActive("/perfil")
                ? "bg-[#2c9d8c] text-white font-semibold"
                : "hover:bg-[#2c9d8c33]"
            }`}
            onClick={() => navigate("/perfil")}
          >
            Perfil
          </li>
        </ul>

        {/* Logout */}
        <div className="pt-5 border-t border-[#333]">
          <li
            className="text-red-500 cursor-pointer px-4 py-3 rounded-lg hover:text-[#ff5555] hover:bg-[#1e1e1e] transition-all text-[1.05rem]"
            onClick={handleLogOut}
          >
            Cerrar sesión
          </li>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
          sidebarOpen ? "md:ml-64" : "ml-0"
        } p-8 pt-20 md:pt-8 text-[1.1rem]`} // <- Aquí el cambio
      >
        <div className="pt-[4.5rem] md:pt-0 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
