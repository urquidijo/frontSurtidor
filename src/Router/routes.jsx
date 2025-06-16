import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login/index.jsx";
import Home from "../pages/Home/index.jsx";
import PrivateRoutes from "./PrivateRoutes.jsx";
import Usuarios from "../pages/Usuarios/Usuarios.jsx";
import Perfil from "../pages/Perfil/Perfil.jsx";
import Layout from "../pages/Layout/Layout.jsx";
import RegistroAsistencia from "../pages/RegistroAsistencia/RegistroAsistencia.jsx";
import Proveedores from "../pages/Proveedores/Proveedores.jsx";
import Compras from "../pages/Compras/Compras.jsx";
import Ventas from "../pages/Ventas/Ventas.jsx";
import Inventario from "../pages/Inventario/Inventario.jsx";
import Ofertas from "../pages/Ofertas/Ofertas.jsx";
import ChangePassword from "../pages/Login/ChangePassword.jsx";
import InventarioCombustible from "../pages/InventarioCombustible/InventarioCombustible.jsx";
import Bitacora from "../pages/Bitacora/Bitacora.jsx";
import Success from "../pages/Ventas/Success.jsx";
import Dispensadores from "../pages/Dispensadores/Dispensadores.jsx";
import Sugerencias from "../pages/Sugerencias/Sugerencias.jsx";
import OrdenesDeCompra from '../pages/OrdenesDeCompra/OrdenesDeCompra.jsx';
import Modulos from '../pages/Modulos/Modulos.jsx';
import FormularioQuejas from "../pages/Sugerencias/FormularioQuejas.jsx";
import SalidaProductos from "../pages/SalidaProductos/SalidaProductos.jsx";
import GestionSucursales from "../pages/GestionSucursales/GestionSucursales.jsx";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/change-password/:token" element={<ChangePassword />} />
      {/* Ruta pública para quejas */}
      <Route path="/quejas-publicas" element={<FormularioQuejas />} />
      {/* Rutas protegidas */}

      <Route element={<PrivateRoutes />}>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/inventario/productos" element={<Inventario />} />
          <Route path="/inventario/combustible" element={<InventarioCombustible />} />
          <Route path="/bitacora" element={<Bitacora />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/asistencias" element={<RegistroAsistencia />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/dispensadores" element={<Dispensadores/>} />
          <Route path="/success" element={<Success/>}/>
          <Route path="/quejas" element={<Sugerencias/>}/>
          <Route path="/ordenesCompra" element={<OrdenesDeCompra/>}/>
          <Route path="/modulos" element={<Modulos/>}/>
          <Route path="/salidaProductos" element={<SalidaProductos/>}/>
          <Route path="/dispensadores" element={<Dispensadores />} />
          <Route path="/success" element={<Success />} />
          <Route path="/quejas" element={<Sugerencias />} />
          <Route path="/ordenesCompra" element={<OrdenesDeCompra />} />
          <Route path="/modulos" element={<Modulos />} />
          <Route path="/sucursales" element={<GestionSucursales />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;
