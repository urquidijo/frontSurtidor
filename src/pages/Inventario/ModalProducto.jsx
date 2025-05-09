import { useState, useEffect, useRef } from "react";
import "./ModalProducto.css";

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
    <div className="modal-producto-backdrop">
      <div className="modal-producto-contenido">
        <h2>{modo === "editar" ? "Editar Producto" : "Nuevo Producto"}</h2>

        <label htmlFor="nombre">Nombre</label>
        <input
          ref={inputRef}
          id="nombre"
          name="nombre"
          className={!form.nombre ? "input-error" : ""}
          value={form.nombre}
          onChange={handleChange}
          autoComplete="off"
        />

        <label htmlFor="unidad_medida">Unidad de medida</label>
        <input
          id="unidad_medida"
          name="unidad_medida"
          className={!form.unidad_medida ? "input-error" : ""}
          value={form.unidad_medida}
          onChange={handleChange}
          autoComplete="off"
        />

        <label htmlFor="precio_venta">Precio venta</label>
        <input
          id="precio_venta"
          name="precio_venta"
          type="number"
          onWheel={(e) => e.target.blur()}
          onKeyDown={preventInvalidNumberInput}
          className={!form.precio_venta ? "input-error" : ""}
          value={form.precio_venta}
          onChange={handleChange}
          autoComplete="off"
        />

        <label htmlFor="precio_compra">Precio compra</label>
        <input
          id="precio_compra"
          name="precio_compra"
          type="number"
          onKeyDown={preventInvalidNumberInput}
          onWheel={(e) => e.target.blur()}
          value={form.precio_compra}
          onChange={handleChange}
          autoComplete="off"
        />

        <label htmlFor="iva">IVA (%)</label>
        <input
          id="iva"
          name="iva"
          type="number"
          onKeyDown={preventInvalidNumberInput}
          onWheel={(e) => e.target.blur()}
          value={form.iva}
          onChange={handleChange}
          autoComplete="off"
        />

        <label htmlFor="stock">Stock</label>
        <input
          id="stock"
          name="stock"
          type="number"
          onKeyDown={preventInvalidNumberInput}
          onWheel={(e) => e.target.blur()}
          value={form.stock}
          onChange={handleChange}
          autoComplete="off"
        />

        <label htmlFor="stock_minimo">Stock mínimo</label>
        <input
          id="stock_minimo"
          name="stock_minimo"
          type="number"
          onKeyDown={preventInvalidNumberInput}
          onWheel={(e) => e.target.blur()}
          value={form.stock_minimo}
          onChange={handleChange}
          autoComplete="off"
        />

        <div className="image-upload-container">
          <label htmlFor="url_image">Imagen</label>
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
          />

          {form.url_image && (
            <div className="preview-img">
              <img src={previewImage} alt="Vista previa" />
            </div>
          )}
        </div>

        <label htmlFor="descripcion">Descripción</label>
        <input
          id="descripcion"
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          autoComplete="off"
        />

        <div className="switch-group">
          <span>Activo</span>
          <label className="switch">
            <input
              type="checkbox"
              name="esta_activo"
              checked={form.esta_activo}
              onChange={handleChange}
            />
            <span className="slider"></span>
          </label>
        </div>

        <label htmlFor="proveedor_id">Proveedor</label>
        <select
          name="proveedor_id"
          id="proveedor_id"
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

        <label htmlFor="oferta_id">Oferta</label>
        <select
          name="oferta_id"
          id="oferta_id"
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

        <div className="modal-actions">
          <button onClick={handleSubmit}>Guardar</button>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="btn-cancelar-producto"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProducto;
