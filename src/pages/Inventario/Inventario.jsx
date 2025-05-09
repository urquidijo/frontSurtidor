import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import "./inventario.css";
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
    <div className="inventario-container">
      <h2>Inventario por Categoría</h2>

      <div className="acciones-inventario">
        <button
          onClick={() => {
            setModoCategoria("crear");
            setModalCategoriaAbierto(true);
          }}
          className="btn-nueva-categoria"
        >
          Nueva Categoría
        </button>
        <button
          onClick={() => {
            setModoCategoria("eliminar");
            setModalCategoriaAbierto(true);
          }}
          className="btn-eliminar-categoria"
        >
          Eliminar Categoría
        </button>
      </div>

      {categorias.map((cat) => (
        <div key={cat.id} className="categoria-bloque">
          <div className="categoria-header">
            <h3>{cat.nombre}</h3>
            <button
              className="btn-agregar-producto"
              onClick={() => abrirModalNuevoProducto(cat.id)}
            >
              + Añadir producto
            </button>
          </div>
          <p>{cat.descripcion}</p>

          <div className="productos-grid">
            {productosPorCategoria[cat.id]?.map((prod) => (
              <div key={prod.id} className="producto-card">
                <img
                  src={
                    prod.url_image
                      ? `${API_URL}/uploads/${prod.url_image}`
                      : "/default-product.png"
                  }
                  alt={prod.nombre}
                />
                <h4>{prod.nombre}</h4>
                <p>Stock: {prod.stock}</p>
                <p>Unidad: {prod.unidad_medida}</p>
                <p>Precio venta: Bs. {prod.precio_venta}</p>
                <div className="acciones-producto">
                  <button
                    className="btn-editar-producto"
                    onClick={() => abrirModalEditarProducto(prod, cat.id)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-eliminar-producto"
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

      {/* Modal para crear o editar productos */}
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

      {/* Modal para crear o eliminar categorías */}
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
