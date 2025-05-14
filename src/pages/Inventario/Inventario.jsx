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

const Inventario = () => {
  const [categorias, setCategorias] = useState([]);
  const [productosPorCategoria, setProductosPorCategoria] = useState({});
  const sucursalId = sessionStorage.getItem("sucursalId");
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [modoCategoria, setModoCategoria] = useState("crear"); // "crear" o "eliminar"

  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
  });

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [categoriaParaProducto, setCategoriaParaProducto] = useState(null);
  const [modoProducto, setModoProducto] = useState("crear");
  const [proveedores, setProveedores] = useState([]);

  const [ofertas, setOfertas] = useState([]);

  const fetchOfertas = async () => {
    try {
      const res = await fetch(`${API_URL}/descuentos`);
      const data = await res.json();
      setOfertas(data);
    } catch (err) {
      console.error("Error cargando ofertas", err);
      showToast("warning", "error al obtener los descuentos");
    }
  };

  useEffect(() => {
    fetchCategoriasYProductos();
    fetchProveedores();
    fetchOfertas();
  }, []);

  const fetchProveedores = async () => {
    try {
      const res = await fetch(`${API_URL}/proveedores`);
      const data = await res.json();
      setProveedores(data);
    } catch (err) {
      console.error("Error cargando proveedores", err);
      showToast("warning", "error al obtener lps proveedores");
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
      showToast("warning", "error al obtener las categorias y productos");
    }
  };

  const handleCrearCategoria = async () => {
    const { nombre, descripcion } = nuevaCategoria;
    if (!nombre || !descripcion) {
      alert("Por favor, completa al menos nombre y descripción.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaCategoria),
      });

      if (res.ok) {
        showToast("success", "Categoria crada con éxito");
        setNuevaCategoria({ nombre: "", descripcion: "" });
        fetchCategoriasYProductos();
      } else {
        showToast("error", "Categoria crada sin éxito");
      }
    } catch (err) {
      showToast("error", "Categoria crada sin éxito");
      console.error("Error al crear categoría", err);
    }
  };

  const handleEliminarCategoria = async () => {
    if (!categoriaSeleccionada) return;

    const result = await mostrarConfirmacion({
      titulo: "¿Eliminar categoria?",
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
        await mostrarExito("La categoria ha sido eliminada.");
        setCategoriaSeleccionada("");
        fetchCategoriasYProductos();
      } else {
        const err = await res.json();
        mostrarError(err.message);
      }
    } catch (err) {
      console.error("Error eliminando categoria:", err);
      mostrarError("Error del servidor");
    }
  };
  const abrirModalNuevoProducto = (categoriaId) => {
    setCategoriaParaProducto(categoriaId);
    setProductoSeleccionado(null);
    setModoProducto("crear");
    setModalAbierto(true);
  };

  const abrirModalEditarProducto = (producto, categoriaId) => {
    setCategoriaParaProducto(categoriaId);
    setProductoSeleccionado(producto);
    setModoProducto("editar");
    setModalAbierto(true);
  };
  const handleGuardarProducto = async (datosProducto) => {
    try {
      const metodo = modoProducto === "crear" ? "POST" : "PUT";
      const url =
        modoProducto === "crear"
          ? `${API_URL}/productos`
          : `${API_URL}/productos/${productoSeleccionado.id}`;

      const res = await fetch(url, {
        method: metodo,
        body: datosProducto, // Importante: no ponemos headers
      });

      if (res.ok) {
        modoProducto === "crear"
          ? showToast("success", "Producto crado con éxito")
          : showToast("success", "Producto actualizado con éxito");
        fetchCategoriasYProductos();
        setModalAbierto(false);
      } else {
        alert("Error al guardar producto");
        modoProducto === "crear"
          ? showToast("error", "Producto crado sin éxito")
          : showToast("error", "Producto actualizado sin éxito");
      }
    } catch (err) {
      console.error("Error al guardar producto", err);
      showToast("error", "Error al guardar producto");
    }
  };

  const handleEliminarProducto = async (productoId) => {
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
  <div className="bg-[#1f1f1f] min-h-screen p-6 text-[#f0f0f0]">
    <h2 className="text-3xl font-semibold text-center text-[#00d1b2] mb-8">
      Inventario de Productos
    </h2>

    <div className="flex justify-center gap-6 mb-10">
      <button
        onClick={() => {
          setModoCategoria("crear");
          setModalCategoriaAbierto(true);
        }}
        className="bg-[#00bcd4] hover:bg-[#0097a7] text-white font-semibold px-5 py-2 rounded-lg transition"
      >
        Nueva Categoría
      </button>
      <button
        onClick={() => {
          setModoCategoria("eliminar");
          setModalCategoriaAbierto(true);
        }}
        className="bg-[#444] hover:bg-[#666] text-white font-semibold px-5 py-2 rounded-lg transition"
      >
        Eliminar Categoría
      </button>
    </div>

    {categorias.map((cat) => (
      <div key={cat.id} className="mb-10 bg-[#2a2a2a] rounded-xl p-6 shadow-md border border-[#444]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-2xl text-[#00d1b2] font-bold">{cat.nombre}</h3>
          <button
            className="bg-[#00bcd4] hover:bg-[#0097a7] text-white px-4 py-2 rounded-lg transition font-semibold"
            onClick={() => abrirModalNuevoProducto(cat.id)}
          >
            + Añadir producto
          </button>
        </div>
        <p className="text-[#ccc] mb-4">{cat.descripcion}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosPorCategoria[cat.id]?.map((prod) => (
            <div key={prod.id} className="bg-[#1f1f1f] border border-[#444] rounded-xl p-4 text-center shadow-lg">
              <img
                src={
                  prod.url_image
                    ? `${API_URL}/uploads/${prod.url_image}`
                    : "/default-product.png"
                }
                alt={prod.nombre}
                className="w-full h-40 object-contain rounded-lg mb-3 bg-[#333]"
              />
              <h4 className="text-lg font-bold text-[#00d1b2]">{prod.nombre}</h4>
              <p className="text-sm text-[#ccc]">Stock: {prod.stock}</p>
              <p className="text-sm text-[#ccc]">Unidad: {prod.unidad_medida}</p>
              <p className="text-sm text-[#ccc]">Precio venta: Bs. {prod.precio_venta}</p>

              <div className="flex justify-center gap-3 mt-4">
                <button
                  className="bg-[#00bcd4] hover:bg-[#0097a7] text-white px-3 py-1 rounded-md text-sm font-semibold"
                  onClick={() => abrirModalEditarProducto(prod, cat.id)}
                >
                  Editar
                </button>
                <button
                  className="bg-[#dc3545] hover:bg-[#c82333] text-white px-3 py-1 rounded-md text-sm font-semibold"
                  onClick={() => handleEliminarProducto(prod.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}

    {/* Modal para productos */}
    <ModalProducto
      open={modalAbierto}
      onClose={() => setModalAbierto(false)}
      onSubmit={handleGuardarProducto}
      producto={productoSeleccionado}
      proveedores={proveedores}
      ofertas={ofertas}
      categoriaId={categoriaParaProducto}
      sucursalId={sucursalId}
      modo={modoProducto}
    />

    {/* Modal para categorías */}
    <ModalCategoria
      open={modalCategoriaAbierto}
      onClose={() => setModalCategoriaAbierto(false)}
      modo={modoCategoria}
      nuevaCategoria={nuevaCategoria}
      setNuevaCategoria={setNuevaCategoria}
      categorias={categorias}
      categoriaSeleccionada={categoriaSeleccionada}
      setCategoriaSeleccionada={setCategoriaSeleccionada}
      onCrear={handleCrearCategoria}
      onEliminar={handleEliminarCategoria}
    />
  </div>
);
};

export default Inventario;
