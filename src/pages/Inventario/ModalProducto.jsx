import { useState, useEffect, useRef } from "react";

const ModalProducto = ({
  open,
  onClose,
  onSubmit,
  producto,
  proveedores,
  ofertas,
  categoriaId,
  sucursalId,
  modo,
}) => {
  const [form, setForm] = useState({
    nombre: "",
    unidad_medida: "",
    precio_venta: "",
    precio_compra: "",
    iva: "",
    stock: "",
    stock_minimo: "",
    url_image: "",
    descripcion: "",
    esta_activo: true,
    proveedor_id: "",
    oferta_id: "",
    sucursal_id: sucursalId,
  });

  const inputRef = useRef();
  const [previewImage, setPreviewImage] = useState("");

  const resetForm = () => {
    setForm({
      nombre: "",
      unidad_medida: "",
      precio_venta: "",
      precio_compra: "",
      iva: "",
      stock: "",
      stock_minimo: "",
      url_image: "",
      descripcion: "",
      esta_activo: true,
      proveedor_id: "",
      oferta_id: "",
      sucursal_id: sucursalId,
    });
  };

  useEffect(() => {
    if (open) {
      if (producto) {
        setForm({
          nombre: producto.nombre || "",
          unidad_medida: producto.unidad_medida || "",
          precio_venta: producto.precio_venta || "",
          precio_compra: producto.precio_compra || "",
          iva: producto.iva || "",
          stock: producto.stock || "",
          stock_minimo: producto.stock_minimo || "",
          url_image: producto.url_image || "",
          descripcion: producto.descripcion || "",
          esta_activo: producto.esta_activo ?? true,
          oferta_id: producto.id_descuento || "",
          proveedor_id: producto.id_proveedor || "",
          sucursal_id: producto.id_sucursal || sucursalId,
        });
      } else {
        resetForm();
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [open, producto, sucursalId]);

  useEffect(() => {
    const ofertaSeleccionada = ofertas.find((o) => o.id === form.oferta_id);
    setForm((prev) => ({
      ...prev,
      descuento: ofertaSeleccionada ? ofertaSeleccionada.porcentaje : 0,
    }));
  }, [form.oferta_id, ofertas]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si es number y menor que 0, no actualices
    if (type === "number" && value !== "" && parseFloat(value) < 0) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const {
      nombre,
      unidad_medida,
      precio_venta,
      precio_compra,
      iva,
      stock,
      stock_minimo,
      url_image,
      descripcion,
      esta_activo,
      proveedor_id,
      oferta_id,
    } = form;

    if (!nombre || !unidad_medida || !precio_venta) {
      alert("Nombre, unidad y precio de venta son obligatorios.");
      return;
    }

    if (
      precio_venta < 0 ||
      precio_compra < 0 ||
      iva < 0 ||
      stock < 0 ||
      stock_minimo < 0
    ) {
      alert("No se permiten valores negativos.");
      return;
    }

    if (parseFloat(stock_minimo) >= parseFloat(stock)) {
      alert("El stock mínimo debe ser menor al stock.");
      return;
    }
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("unidad_medida", unidad_medida);
    formData.append("precio_venta", precio_venta);
    formData.append("precio_compra", precio_compra);
    formData.append("iva", iva);
    formData.append("stock", stock);
    formData.append("stock_minimo", stock_minimo);
    formData.append("descripcion", descripcion);
    formData.append("esta_activo", esta_activo);
    formData.append("proveedor_id", proveedor_id);
    formData.append("oferta_id", oferta_id);
    formData.append("categoria_id", categoriaId);
    formData.append("sucursal_id", sucursalId);

    if (form.url_image instanceof File) {
      formData.append("url_image", form.url_image); // aquí mandas el archivo real
    }

    onSubmit(formData);
  };

  const preventInvalidNumberInput = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
      <div className="bg-[#1f1f1f] text-[#f0f0f0] rounded-[12px] shadow-xl p-8 w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto animate-fadeIn">
        <h2 className="text-2xl font-semibold text-center text-[#00d1b2] mb-6">
          {modo === "crear" ? "Nuevo Producto" : "Editar Producto"}
        </h2>

        <label htmlFor="nombre" className="block mb-2 text-[#ccc] font-medium">
          Nombre
        </label>
        <input
          ref={inputRef}
          id="nombre"
          name="nombre"
          className={`w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors ${
            !form.nombre ? "input-error" : ""
          }`}
          value={form.nombre}
          onChange={handleChange}
          autoComplete="off"
        />

        <label
          htmlFor="unidad_medida"
          className="block mb-2 text-[#ccc] font-medium"
        >
          Unidad de medida
        </label>
        <input
          id="unidad_medida"
          name="unidad_medida"
          className={`w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors ${
            !form.unidad_medida ? "input-error" : ""
          }`}
          value={form.unidad_medida}
          onChange={handleChange}
          autoComplete="off"
        />

        <label
          htmlFor="precio_venta"
          className="block mb-2 text-[#ccc] font-medium"
        >
          Precio venta
        </label>
        <input
          id="precio_venta"
          name="precio_venta"
          type="number"
          onWheel={(e) => e.target.blur()}
          onKeyDown={preventInvalidNumberInput}
          className={`w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors ${
            !form.precio_venta ? "input-error" : ""
          }`}
          value={form.precio_venta}
          onChange={handleChange}
          autoComplete="off"
        />

        <label
          htmlFor="precio_compra"
          className="block mb-2 text-[#ccc] font-medium"
        >
          Precio compra
        </label>
        <input
          id="precio_compra"
          name="precio_compra"
          type="number"
          onKeyDown={preventInvalidNumberInput}
          onWheel={(e) => e.target.blur()}
          className={`w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors`}
          value={form.precio_compra}
          onChange={handleChange}
          autoComplete="off"
        />
        <label htmlFor="iva" className="block mb-2 text-[#ccc] font-medium">
          IVA(%)
        </label>
        <input
          id="iva"
          name="iva"
          type="number"
          onKeyDown={preventInvalidNumberInput}
          onWheel={(e) => e.target.blur()}
          className={`w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors`}
          value={form.iva}
          onChange={handleChange}
          autoComplete="off"
        />
        <label htmlFor="stock" className="block mb-2 text-[#ccc] font-medium">
          Stock
        </label>
        <input
          id="stock"
          name="stock"
          type="number"
          onKeyDown={preventInvalidNumberInput}
          onWheel={(e) => e.target.blur()}
          className={`w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors`}
          value={form.stock}
          onChange={handleChange}
          autoComplete="off"
        />
        <label
          htmlFor="stock_minimo"
          className="block mb-2 text-[#ccc] font-medium"
        >
          Stock Minimo
        </label>
        <input
          id="stock_minimo"
          name="stock_minimo"
          type="number"
          onKeyDown={preventInvalidNumberInput}
          onWheel={(e) => e.target.blur()}
          className={`w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors`}
          value={form.stock_minimo}
          onChange={handleChange}
          autoComplete="off"
        />

        <div className="image-upload-container">
          <label
            htmlFor="url_image"
            className="block mb-2 text-[#ccc] font-medium"
          >
            Imagen
          </label>
          <input
            type="file"
            id="url_image"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setForm((prev) => ({
                  ...prev,
                  url_image: file,
                }));
                setPreviewImage(URL.createObjectURL(file));
              }
            }}
            className="w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors"
          />
          {form.url_image && (
            <div className="preview-img">
              <img src={previewImage} alt="Vista previa" />
            </div>
          )}
        </div>
        <label
          htmlFor="descripcion"
          className="block mb-2 text-[#ccc] font-medium"
        >
          Descripcion
        </label>
        <input
          id="descripcion"
          name="descripcion"
          type="number"
          onKeyDown={preventInvalidNumberInput}
          onWheel={(e) => e.target.blur()}
          className={`w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors`}
          value={form.descripcion}
          onChange={handleChange}
          autoComplete="off"
        />
        <div className="flex gap-4 mb-3 items-center">
          <label htmlFor="esta_activo" className="text-[#ccc] font-medium">
            Activo
          </label>
          <label className="relative inline-block w-11 h-6 mt-1">
            <input
              type="checkbox"
              name="esta_activo"
              checked={form.esta_activo}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-600 rounded-full transition duration-300 peer-checked:bg-green-500"></div>
            <div className="absolute h-4.5 w-4.5 left-1 top-1 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
          </label>
        </div>

        <label
          htmlFor="proveedor_id"
          className="block mb-2 text-[#ccc] font-medium"
        >
          Proveedor
        </label>
        <select
          name="proveedor_id"
          id="proveedor_id"
          className={`w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors`}
          value={form.proveedor_id}
          onChange={handleChange}
        >
          <option value="">Seleccione proveedor</option>
          {proveedores.map((prov) => (
            <option key={prov.id} value={prov.id}>
              {prov.nombre}
            </option>
          ))}
        </select>

        <label
          htmlFor="oferta_id"
          className="block mb-2 text-[#ccc] font-medium"
        >
          Oferta
        </label>
        <select
          name="oferta_id"
          id="oferta_id"
          className={`w-full p-2.5 rounded-[8px] bg-[#2a2a2a] border border-[#444] text-white text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-[#1c1c1c] transition-colors`}
          value={form.oferta_id}
          onChange={handleChange}
        >
          <option value="">Sin oferta</option>
          {ofertas.map((oferta) => (
            <option key={oferta.id} value={oferta.id}>
              {oferta.nombre} - {oferta.porcentaje}% desc.
            </option>
          ))}
        </select>

        <div className="modal-actions flex justify-between gap-4 mt-6">
          <button
            onClick={handleSubmit}
            className="bg-[#00bcd4] hover:bg-[#0097a7] text-white font-bold px-4 py-2 rounded-[10px] transition"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="bg-[#444] hover:bg-[#666] text-white font-bold px-4 py-2 rounded-[10px] transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProducto;
