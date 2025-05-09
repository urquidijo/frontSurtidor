import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./layout.css";
import API_URL from "../../config/config";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [permisos, setPermisos] = useState([]);
  const [gestionarOpen, setGestionarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogOut = () => {
    sessionStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const usuarioId = sessionStorage.getItem("usuarioId");
    if (usuarioId) {
      fetch(`${API_URL}/usuarios/permisos/${usuarioId}`)
        .then((res) => res.json())
        .then((data) =>
          setPermisos(data.permisos.map((p) => p.nombre))
        )
        .catch((err) =>
          console.error("Error al cargar permisos:", err)
        );
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout-container">
      {/* BOTÓN TOGGLE */}
      <button
        className="toggle-sidebar-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <h2>Octano</h2>
        <ul className="menu">
          {permisos.includes("ver_dashboard") && (
            <li
              className={isActive("/home") ? "active" : ""}
              onClick={() => navigate("/home")}
            >
              Dashboard
            </li>
          )}

          {(permisos.includes("gestionar_usuarios") ||
            permisos.includes("gestionar_proveedores") ||
            permisos.includes("gestionar_compras") ||
            permisos.includes("gestionar_ventas") ||
            permisos.includes("gestionar_inventario") ||
            permisos.includes("gestionar_ofertas")) && (
            <>
              <li
                className="submenu-title"
                onClick={() => setGestionarOpen(!gestionarOpen)}
              >
                Gestionar ▾
              </li>
              {gestionarOpen && (
                <ul className="submenu">
                  {permisos.includes("gestionar_usuarios") && (
                    <li
                      className={isActive("/usuarios") ? "active" : ""}
                      onClick={() => navigate("/usuarios")}
                    >
                      Usuarios
                    </li>
                  )}
                  {permisos.includes("gestionar_proveedores") && (
                    <li
                      className={isActive("/proveedores") ? "active" : ""}
                      onClick={() => navigate("/proveedores")}
                    >
                      Proveedores
                    </li>
                  )}
                  {permisos.includes("gestionar_compras") && (
                    <li
                      className={isActive("/compras") ? "active" : ""}
                      onClick={() => navigate("/compras")}
                    >
                      Compras
                    </li>
                  )}
                  {permisos.includes("gestionar_ventas") && (
                    <li
                      className={isActive("/ventas") ? "active" : ""}
                      onClick={() => navigate("/ventas")}
                    >
                      Ventas
                    </li>
                  )}
                  {permisos.includes("gestionar_inventario") && (
                    <li
                      className={isActive("/inventario") ? "active" : ""}
                      onClick={() => navigate("/inventario")}
                    >
                      Inventario
                    </li>
                  )}
                  {permisos.includes("gestionar_ofertas") && (
                    <li
                      className={isActive("/ofertas") ? "active" : ""}
                      onClick={() => navigate("/ofertas")}
                    >
                      Descuentos
                    </li>
                  )}
                </ul>
              )}
            </>
          )}

          <li
            className={isActive("/asistencias") ? "active" : ""}
            onClick={() => navigate("/asistencias")}
          >
            Asistencias
          </li>
          <li
            className={isActive("/perfil") ? "active" : ""}
            onClick={() => navigate("/perfil")}
          >
            Perfil
          </li>
        </ul>

        <div className="logout-section">
          <li onClick={handleLogOut}>Cerrar sesión</li>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
