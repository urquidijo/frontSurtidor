import { useState, useEffect } from "react";
import { showToast } from "../../utils/toastUtils";
import API_URL from "../../config/config";

const FormularioQuejas = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    tipo: "queja",
    asunto: "",
    descripcion: "",
    id_sucursal: "",
  });
  const [sucursales, setSucursales] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Cargar sucursales disponibles
    fetch(`${API_URL}/sucursales`)
      .then((res) => res.json())
      .then((data) => setSucursales(data))
      .catch((err) => console.error("Error al cargar sucursales:", err));
  }, []);

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es obligatorio";
    } else if (!validarEmail(formData.correo)) {
      newErrors.correo = "El correo no es válido";
    }

    if (!formData.asunto.trim()) {
      newErrors.asunto = "El asunto es obligatorio";
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    } else if (formData.descripcion.length < 10) {
      newErrors.descripcion = "La descripción debe tener al menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async () => {

    if (!validarFormulario()) {
      showToast("error", "Por favor, corrige los errores en el formulario");
      return;
    }

    setEnviando(true);

    try {
      const response = await fetch(`${API_URL}/quejas/public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast("success", "¡Tu mensaje ha sido enviado exitosamente!");
        setFormData({
          nombre: "",
          correo: "",
          telefono: "",
          tipo: "queja",
          asunto: "",
          descripcion: "",
          id_sucursal: "",
        });
      } else {
        const errorData = await response.json();
        showToast("error", errorData.error || "Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error de conexión. Inténtalo nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[#2a2a2a] rounded-2xl shadow-2xl border border-[#444] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00d1b2] to-[#00a99d] p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Octano - Quejas y Sugerencias
          </h1>
          <p className="text-white/90">
            Tu opinión nos ayuda a mejorar nuestros servicios
          </p>
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          {/* Información Personal */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#00d1b2] font-semibold mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg bg-[#1f1f1f] text-white border ${
                  errors.nombre ? "border-red-500" : "border-[#444]"
                } focus:border-[#00d1b2] focus:outline-none transition-colors`}
                placeholder="Ingresa tu nombre completo"
              />
              {errors.nombre && (
                <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-[#00d1b2] font-semibold mb-2">
                Correo electrónico *
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg bg-[#1f1f1f] text-white border ${
                  errors.correo ? "border-red-500" : "border-[#444]"
                } focus:border-[#00d1b2] focus:outline-none transition-colors`}
                placeholder="correo@ejemplo.com"
              />
              {errors.correo && (
                <p className="text-red-400 text-sm mt-1">{errors.correo}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#00d1b2] font-semibold mb-2">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#1f1f1f] text-white border border-[#444] focus:border-[#00d1b2] focus:outline-none transition-colors"
                placeholder="Ej: 77123456"
              />
            </div>

            <div>
              <label className="block text-[#00d1b2] font-semibold mb-2">
                Sucursal (opcional)
              </label>
              <select
                name="id_sucursal"
                value={formData.id_sucursal}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#1f1f1f] text-white border border-[#444] focus:border-[#00d1b2] focus:outline-none transition-colors"
              >
                <option value="">Selecciona una sucursal</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de mensaje */}
          <div>
            <label className="block text-[#00d1b2] font-semibold mb-2">
              Tipo de mensaje *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="queja"
                  checked={formData.tipo === "queja"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-2 ${
                    formData.tipo === "queja"
                      ? "bg-[#00d1b2] border-[#00d1b2]"
                      : "border-[#666]"
                  }`}
                >
                  {formData.tipo === "queja" && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <span className="text-white">Queja</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="sugerencia"
                  checked={formData.tipo === "sugerencia"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-2 ${
                    formData.tipo === "sugerencia"
                      ? "bg-[#00d1b2] border-[#00d1b2]"
                      : "border-[#666]"
                  }`}
                >
                  {formData.tipo === "sugerencia" && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <span className="text-white">Sugerencia</span>
              </label>
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-[#00d1b2] font-semibold mb-2">
              Asunto *
            </label>
            <input
              type="text"
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg bg-[#1f1f1f] text-white border ${
                errors.asunto ? "border-red-500" : "border-[#444]"
              } focus:border-[#00d1b2] focus:outline-none transition-colors`}
              placeholder="Resumen breve de tu mensaje"
            />
            {errors.asunto && (
              <p className="text-red-400 text-sm mt-1">{errors.asunto}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-[#00d1b2] font-semibold mb-2">
              Descripción detallada *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={5}
              className={`w-full p-3 rounded-lg bg-[#1f1f1f] text-white border ${
                errors.descripcion ? "border-red-500" : "border-[#444]"
              } focus:border-[#00d1b2] focus:outline-none transition-colors resize-none`}
              placeholder="Describe detalladamente tu queja o sugerencia..."
            />
            {errors.descripcion && (
              <p className="text-red-400 text-sm mt-1">{errors.descripcion}</p>
            )}
            <p className="text-gray-400 text-sm mt-1">
              {formData.descripcion.length}/500 caracteres
            </p>
          </div>

          {/* Botón de envío */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={enviando}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
              enviando
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-[#00d1b2] to-[#00a99d] hover:from-[#00a99d] hover:to-[#00d1b2] shadow-lg hover:shadow-xl"
            } text-white`}
          >
            {enviando ? "Enviando..." : "Enviar Mensaje"}
          </button>
        </div>

        {/* Footer */}
        <div className="bg-[#1f1f1f] p-4 text-center">
          <p className="text-gray-400 text-sm">
            Responderemos a tu mensaje en un plazo de 24-48 horas
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormularioQuejas;