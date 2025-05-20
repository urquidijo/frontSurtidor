import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { showToast } from "../../utils/toastUtils";
import API_URL from "../../config/config";

const ModalProducto = ({
  modo,
  producto,
  categoriaId,
  proveedores,
  descuentos,
  onClose,
  onGuardar,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    stock: "",
    stock_minimo: "",
    unidad_medida: "",
    precio_venta: "",
    precio_compra: "",
    iva: "",
    esta_activo: true,
    categoria_id: categoriaId,
    sucursal_id: sessionStorage.getItem("sucursalId"),
    proveedor_id: "",
    descuento_id: "",
    url_image: null,
  });

  useEffect(() => {
    if (modo === "editar" && producto) {
      setFormData({
        ...producto,
        categoria_id: categoriaId,
        sucursal_id: sessionStorage.getItem("sucursalId"),
        descuento_id: producto.id_descuento || "",
      });
    }
  }, [modo, producto, categoriaId]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imagen", file);

    try {
      const res = await fetch(`${API_URL}/productos/subir-imagen`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        url_image: data.nombreArchivo,
      }));
    } catch (err) {
      showToast("error", "Error al subir la imagen");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre || !formData.descripcion || !formData.precio_venta) {
      showToast("error", "Por favor completa los campos requeridos");
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    await onGuardar(formDataToSend);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-[#2a2a2a] rounded-lg p-6 w-full max-w-2xl transform transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#00d1b2]">
            {modo === "crear" ? "Nuevo Producto" : "Editar Producto"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#ccc] mb-2">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
                required
              />
            </div>

            <div>
              <label className="block text-[#ccc] mb-2">Descripción *</label>
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
                required
              />
            </div>

            <div>
              <label className="block text-[#ccc] mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
              />
            </div>

            <div>
              <label className="block text-[#ccc] mb-2">Stock Mínimo</label>
              <input
                type="number"
                name="stock_minimo"
                value={formData.stock_minimo}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
              />
            </div>

            <div>
              <label className="block text-[#ccc] mb-2">Unidad de Medida</label>
              <input
                type="text"
                name="unidad_medida"
                value={formData.unidad_medida}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
              />
            </div>

            <div>
              <label className="block text-[#ccc] mb-2">Precio de Venta *</label>
              <input
                type="number"
                name="precio_venta"
                value={formData.precio_venta}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
                required
              />
            </div>

            <div>
              <label className="block text-[#ccc] mb-2">Precio de Compra</label>
              <input
                type="number"
                name="precio_compra"
                value={formData.precio_compra}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
              />
            </div>

            <div>
              <label className="block text-[#ccc] mb-2">IVA (%)</label>
              <input
                type="number"
                name="iva"
                value={formData.iva}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
              />
            </div>

            <div>
              <label className="block text-[#ccc] mb-2">Proveedor</label>
              <select
                name="proveedor_id"
                value={formData.proveedor_id}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
              >
                <option value="">Seleccione un proveedor</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#ccc] mb-2">Descuento</label>
              <select
                name="descuento_id"
                value={formData.descuento_id}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
              >
                <option value="">Sin descuento</option>
                {descuentos?.filter(descuento => descuento.esta_activo).map((descuento) => (
                  <option key={descuento.id} value={descuento.id}>
                    {descuento.nombre} - {descuento.porcentaje}% desc.
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#ccc] mb-2">Imagen</label>
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
                accept="image/*"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="esta_activo"
                checked={formData.esta_activo}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-[#ccc]">Producto Activo</label>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-[#ccc] hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#00d1b2] hover:bg-[#00b89c] text-white px-4 py-2 rounded-lg transition-colors"
            >
              {modo === "crear" ? "Crear" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalProducto;
