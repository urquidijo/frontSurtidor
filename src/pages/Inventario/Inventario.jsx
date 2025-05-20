import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import ModalProducto from "./ModalProducto.jsx";
import ModalCategoria from "./ModalCategoria.jsx";
import { showToast } from "../../utils/toastUtils";
import {
  mostrarConfirmacion,
  mostrarExito,
  mostrarError,
} from "../../utils/alertUtils";
import { FaBox, FaPlus, FaEdit, FaTrash, FaTags, FaShoppingCart } from 'react-icons/fa';

const Inventario = () => {
  const [categorias, setCategorias] = useState([]);
  const [productosPorCategoria, setProductosPorCategoria] = useState({});
  const [descuentos, setDescuentos] = useState([]);
  const sucursalId = sessionStorage.getItem("sucursalId");
  const usuarioId = sessionStorage.getItem("usuarioId");
  const [permisos, setPermisos] = useState([]);
  const [rolUsuario, setRolUsuario] = useState("");
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [modoCategoria, setModoCategoria] = useState("crear"); // "crear" o "eliminar"

  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
  });

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [categoriaParaProducto, setCategoriaParaProducto] = useState(null);
  const [modoProducto, setModoProducto] = useState("crear");
  const [proveedores, setProveedores] = useState([]);

  const [ofertas, setOfertas] = useState([]);

  // Verificar si el usuario tiene permisos de administración
  const hasAdminPermissions = () => {
    // Verificar que el usuario tenga el rol correcto Y el permiso específico
    const hasSpecificPermission = permisos.includes("gestionar_inventario");
    
    // Debe cumplir ambas condiciones: rol adecuado y permiso específico
    return hasSpecificPermission;
  };

  const fetchOfertas = async () => {
    try {
      const res = await fetch(`${API_URL}/descuentos`);
      const data = await res.json();
      setOfertas(data);
    } catch (err) {
      console.error("Error cargando ofertas", err);
      showToast("warning", "Error al obtener los descuentos");
    }
  };

  // Cargar permisos del usuario
  useEffect(() => {
    if (usuarioId) {
      fetch(`${API_URL}/usuarios/permisos/${usuarioId}`)
        .then((res) => res.json())
        .then((data) => {
          // Guardamos los permisos y el rol del usuario
          setPermisos(data.permisos.map((p) => p.nombre));
          setRolUsuario(data.rol || "");
          console.log("Rol del usuario:", data.rol);
          console.log("Permisos del usuario:", data.permisos.map(p => p.nombre));
        })
        .catch((err) => console.error("Error al cargar permisos:", err));
    }
  }, [usuarioId]);

  const fetchDescuentos = async () => {
    try {
      const res = await fetch(`${API_URL}/descuentos`);
      const data = await res.json();
      setDescuentos(data);
    } catch (err) {
      console.error("Error cargando descuentos", err);
      showToast("warning", "Error al obtener los descuentos");
    }
  };

  useEffect(() => {
    fetchCategoriasYProductos();
    fetchProveedores();
    fetchOfertas();
    fetchDescuentos();
  }, []);

  const fetchProveedores = async () => {
    try {
      const res = await fetch(`${API_URL}/proveedores`);
      const data = await res.json();
      setProveedores(data);
    } catch (err) {
      console.error("Error cargando proveedores", err);
      showToast("warning", "Error al obtener los proveedores");
    }
  };

  const fetchCategoriasYProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/categorias`);
      const data = await res.json();
      setCategorias(data);
      const productosPorCategoriaArray = await Promise.all(
        data.map(async (categoria) => {
          const resProd = await fetch(
            `${API_URL}/productos/categoria/${categoria.id}?sucursal=${sucursalId}`
          );
          const productos = await resProd.json();
          return { categoriaId: categoria.id, productos };
        })
      );

      const productosMap = {};
      productosPorCategoriaArray.forEach(({ categoriaId, productos }) => {
        productosMap[categoriaId] = productos;
      });

      setProductosPorCategoria(productosMap);
    } catch (err) {
      console.error("Error cargando categorías o productos", err);
      showToast("warning", "Error al obtener las categorías y productos");
    }
  };

  const handleCrearCategoria = async () => {
    // Verificar permisos
    if (!hasAdminPermissions()) {
      showToast("warning", "No tienes permisos para crear categorías. Se requiere ser administrador o supervisor y tener el permiso 'gestionar_inventario'");
      return;
    }

    const { nombre, descripcion } = nuevaCategoria;
    if (!nombre || !descripcion) {
      mostrarError("Por favor, completa al menos nombre y descripción.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaCategoria),
      });

      if (res.ok) {
        showToast("success", "Categoría creada con éxito");
        setNuevaCategoria({ nombre: "", descripcion: "" });
        setModalCategoriaAbierto(false);
        fetchCategoriasYProductos();
      } else {
        showToast("error", "Error al crear la categoría");
      }
    } catch (err) {
      showToast("error", "Error al crear la categoría");
      console.error("Error al crear categoría", err);
    }
  };

  const handleEliminarCategoria = async () => {
    // Verificar permisos
    if (!hasAdminPermissions()) {
      showToast("warning", "No tienes permisos para eliminar categorías. Se requiere ser administrador o supervisor y tener el permiso 'gestionar_inventario'");
      return;
    }

    if (!categoriaSeleccionada) return;

    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar categoría?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;
    try {
      const res = await fetch(
        `${API_URL}/categorias/${categoriaSeleccionada}`,
        {
          method: "DELETE",
        }
      );

      if (res.status === 204) {
        await mostrarExito("La categoría ha sido eliminada.");
        setCategoriaSeleccionada(null);
        setModalCategoriaAbierto(false);
        fetchCategoriasYProductos();
      } else {
        const err = await res.json();
        mostrarError(err.message);
      }
    } catch (err) {
      console.error("Error eliminando categoría:", err);
      mostrarError("Error del servidor");
    }
  };

  const abrirModalNuevoProducto = (categoriaId) => {
    // Verificar permisos
    if (!hasAdminPermissions()) {
      showToast("warning", "No tienes permisos para crear productos. Se requiere ser administrador o supervisor y tener el permiso 'gestionar_inventario'");
      return;
    }

    setCategoriaParaProducto(categoriaId);
    setProductoSeleccionado(null);
    setModoProducto("crear");
    setModalAbierto(true);
  };

  const abrirModalEditarProducto = (producto, categoriaId) => {
    // Verificar permisos
    if (!hasAdminPermissions()) {
      showToast("warning", "No tienes permisos para editar productos. Se requiere ser administrador o supervisor y tener el permiso 'gestionar_inventario'");
      return;
    }

    setCategoriaParaProducto(categoriaId);
    setProductoSeleccionado(producto);
    setModoProducto("editar");
    setModalAbierto(true);
  };

  const handleGuardarProducto = async (datosProducto) => {
    // Verificar permisos
    if (!hasAdminPermissions()) {
      showToast("warning", "No tienes permisos para guardar productos. Se requiere ser administrador o supervisor y tener el permiso 'gestionar_inventario'");
      return;
    }

    try {
      const metodo = modoProducto === "crear" ? "POST" : "PUT";
      const url =
        modoProducto === "crear"
          ? `${API_URL}/productos`
          : `${API_URL}/productos/${productoSeleccionado.id}`;

      const res = await fetch(url, {
        method: metodo,
        body: datosProducto,
      });

      if (res.ok) {
        modoProducto === "crear"
          ? showToast("success", "Producto creado con éxito")
          : showToast("success", "Producto actualizado con éxito");
        setModalAbierto(false);
        fetchCategoriasYProductos();
      } else {
        modoProducto === "crear"
          ? showToast("error", "Error al crear el producto")
          : showToast("error", "Error al actualizar el producto");
      }
    } catch (err) {
      console.error("Error al guardar producto", err);
      showToast("error", "Error al guardar producto");
    }
  };

  const handleEliminarProducto = async (productoId) => {
    // Verificar permisos
    if (!hasAdminPermissions()) {
      showToast("warning", "No tienes permisos para eliminar productos. Se requiere ser administrador o supervisor y tener el permiso 'gestionar_inventario'");
      return;
    }

    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar producto?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/productos/${productoId}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        await mostrarExito("El producto ha sido eliminado.");
        fetchCategoriasYProductos();
      } else {
        const err = await res.json();
        mostrarError(err.message);
      }
    } catch (err) {
      console.error("Error eliminando producto:", err);
      mostrarError("Error del servidor");
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#00d1b2] mb-2">Gestión de Inventario</h1>
        <p className="text-[#ccc]">Administra tus productos y categorías de manera eficiente</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg border border-[#444] hover:border-[#00d1b2] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#ccc] text-sm">Total Categorías</p>
              <h3 className="text-2xl font-bold text-[#00d1b2] mt-1">{categorias.length}</h3>
            </div>
            <div className="bg-[#00d1b2]/10 p-3 rounded-lg">
              <FaTags className="text-[#00d1b2] text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg border border-[#444] hover:border-[#00d1b2] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#ccc] text-sm">Total Productos</p>
              <h3 className="text-2xl font-bold text-[#00d1b2] mt-1">
                {Object.values(productosPorCategoria).reduce((acc, productos) => acc + productos.length, 0)}
              </h3>
            </div>
            <div className="bg-[#00d1b2]/10 p-3 rounded-lg">
              <FaBox className="text-[#00d1b2] text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg border border-[#444] hover:border-[#00d1b2] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#ccc] text-sm">Ofertas Activas</p>
              <h3 className="text-2xl font-bold text-[#00d1b2] mt-1">{ofertas.length}</h3>
            </div>
            <div className="bg-[#00d1b2]/10 p-3 rounded-lg">
              <FaShoppingCart className="text-[#00d1b2] text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg border border-[#444] mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#00d1b2]">Categorías</h2>
          {hasAdminPermissions() ? (
            <button
              onClick={() => {
                setModoCategoria("crear");
                setModalCategoriaAbierto(true);
              }}
              className="bg-[#00d1b2] hover:bg-[#00b89c] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300"
            >
              <FaPlus /> Nueva Categoría
            </button>
          ) : (
            <span className="text-sm text-[#888]">
              No tienes permisos para crear categorías
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              onClick={() => setCategoriaSeleccionada(categoria.id)}
              className={`bg-[#1f1f1f] rounded-lg p-4 hover:bg-[#2a2a2a] transition-all duration-300 border border-[#444] cursor-pointer ${
                categoriaSeleccionada === categoria.id ? 'bg-[#2a2a2a] border-[#00d1b2]' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-[#00d1b2]">{categoria.nombre}</h3>
                <div className="flex gap-2">
                  {hasAdminPermissions() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoriaSeleccionada(categoria.id);
                        setModoCategoria("eliminar");
                        setModalCategoriaAbierto(true);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[#ccc] text-sm mb-4">{categoria.descripcion}</p>
              <div className="flex justify-between items-center">
                <span className="text-[#ccc] text-sm">
                  {productosPorCategoria[categoria.id]?.length || 0} productos
                </span>
                {hasAdminPermissions() ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModalNuevoProducto(categoria.id);
                    }}
                    className="text-[#00d1b2] hover:text-[#00b89c] text-sm flex items-center gap-1 transition-colors"
                  >
                    <FaPlus className="text-xs" /> Agregar Producto
                  </button>
                ) : (
                  <span className="text-xs text-[#888]">
                    Sin permiso para agregar
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg border border-[#444]">
        <h2 className="text-2xl font-bold text-[#00d1b2] mb-6">Productos por Categoría</h2>
        <div className="space-y-8">
          {categorias
            .filter(categoria => !categoriaSeleccionada || categoria.id === categoriaSeleccionada)
            .map((categoria) => (
              <div key={categoria.id} className="bg-[#1f1f1f] rounded-lg p-6 border border-[#444]">
                <h3 className="text-xl font-semibold text-[#00d1b2] mb-6">{categoria.nombre}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {productosPorCategoria[categoria.id]?.map((producto) => (
                    <div
                      key={producto.id}
                      className="bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#333] transition-all duration-300 border border-[#444]"
                    >
                      <div className="aspect-square mb-4 bg-[#1f1f1f] rounded-lg overflow-hidden">
                        <img
                          src={producto.url_image ? `${API_URL}/uploads/${producto.url_image}` : "/default-product.png"}
                          alt={producto.nombre}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-[#00d1b2]">{producto.nombre}</h4>
                        <p className="text-[#ccc] text-sm line-clamp-2">{producto.descripcion}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-[#ccc]">Stock</p>
                            <p className="text-white font-semibold">{producto.stock} {producto.unidad_medida}</p>
                          </div>
                          <div>
                            <p className="text-[#ccc]">Precio</p>
                            <p className="text-white font-semibold">Bs. {producto.precio_venta}</p>
                          </div>
                        </div>
                        {hasAdminPermissions() ? (
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => abrirModalEditarProducto(producto, categoria.id)}
                              className="bg-[#00d1b2] hover:bg-[#00b89c] text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                            >
                              <FaEdit className="text-xs" /> Editar
                            </button>
                            <button
                              onClick={() => handleEliminarProducto(producto.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                            >
                              <FaTrash className="text-xs" /> Eliminar
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end mt-4">
                            <span className="text-xs text-[#888] italic">Sin permiso de edición</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modals */}
      {modalCategoriaAbierto && (
        <ModalCategoria
          modo={modoCategoria}
          categoriaSeleccionada={categoriaSeleccionada}
          nuevaCategoria={nuevaCategoria}
          setNuevaCategoria={setNuevaCategoria}
          onClose={() => setModalCategoriaAbierto(false)}
          onCrear={handleCrearCategoria}
          onEliminar={handleEliminarCategoria}
        />
      )}

      {modalAbierto && (
        <ModalProducto
          modo={modoProducto}
          producto={productoSeleccionado}
          categoriaId={categoriaParaProducto}
          proveedores={proveedores}
          ofertas={ofertas}
          descuentos={descuentos}
          onClose={() => setModalAbierto(false)}
          onGuardar={handleGuardarProducto}
        />
      )}
    </div>
  );
};

export default Inventario;