import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../../config/config";

const ChangePassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verificarToken = async () => {
      try {
        const res = await fetch(`${API_URL}/verificar-token/${token}`);
        const data = await res.json();

        if (!res.ok || !data.valido) {
          alert("link-expirado"); // o muestra un mensaje en la misma vista
          navigate("/home");
        }
        const noErrors = Object.keys(errors).length === 0;
        const filled = form.password && form.confirm;
        const match = form.password === form.confirm;
    setIsValid(noErrors && filled && match);
      } catch (error) {
        console.error("Error al verificar token:", error);
        alert("link-expirado");
      }
    };

    verificarToken();
  },  [form, errors]);

  const handleChange = ({ target: { value, name } }) => {
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    validations(name, value, updatedForm);
  };

  const validations = (name, value, updatedForm) => {
    const newErrors = { ...errors };

    if (!value.trim()) {
      newErrors[name] = `El ${name === "confirm" ? "campo de confirmación" : name} es requerido`;
    } else if (name === "password") {
      if (value.length < 6 || !/[A-Z]/.test(value)) {
        newErrors.password = "Debe tener al menos 6 caracteres y una mayúscula";
      } else {
        delete newErrors.password;
      }
    } else if (name === "confirm") {
      if (value !== updatedForm.password) {
        newErrors.confirm = "Las contraseñas no coinciden";
      } else {
        delete newErrors.confirm;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    const res = await fetch(`${API_URL}/auth/cambiar-contra/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.password }),
    });

    if (res.ok) {
      alert("Contraseña actualizada");
      navigate("/");
    } else {
      alert("Error al actualizar contraseña");
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
    <div className="w-full max-w-md bg-[#1f1f1f] rounded-xl shadow-lg p-8 border border-[#2a2a2a]">
      <h2 className="text-2xl font-bold text-[#00d1b2] mb-2 text-center">Cambiar contraseña</h2>
      <p className="text-sm text-gray-400 text-center mb-6">Ingresa y confirma tu nueva contraseña</p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Nueva contraseña</label>
        <input
          name="password"
          type="password"
          placeholder="Nueva contraseña"
          onChange={handleChange}
          value={form.password}
          className="w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
        />
        {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar contraseña</label>
        <input
          name="confirm"
          type="password"
          placeholder="Confirmar contraseña"
          onChange={handleChange}
          value={form.confirm}
          className="w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg border border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#00d1b2]"
        />
        {errors.confirm && <span className="text-red-500 text-xs">{errors.confirm}</span>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className={`w-full py-2 rounded-lg font-semibold transition ${
          isValid
            ? "bg-[#00d1b2] hover:bg-[#00b39a] text-white"
            : "bg-gray-600 cursor-not-allowed text-gray-300"
        }`}
      >
        Guardar
      </button>
    </div>
  </div>
);

};

export default ChangePassword;
