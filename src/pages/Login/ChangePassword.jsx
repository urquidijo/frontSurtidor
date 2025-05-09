import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../../config/config";
import "./changePassword.css";

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
    <div className="change-wrapper">
      <div className="change-form">
        <h2 className="change-title">Cambiar contraseña</h2>
        <p className="change-subtitle">Ingresa y confirma tu nueva contraseña</p>

        <div className="input-group">
          <label>Nueva contraseña</label>
          <div className="input-icon">
            <input
              name="password"
              type="password"
              placeholder="Nueva contraseña"
              onChange={handleChange}
              value={form.password}
            />
          </div>
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="input-group">
          <label>Confirmar contraseña</label>
          <div className="input-icon">
            <input
              name="confirm"
              type="password"
              placeholder="Confirmar contraseña"
              onChange={handleChange}
              value={form.confirm}
            />
          </div>
          {errors.confirm && <span className="error">{errors.confirm}</span>}
        </div>

        <button
          className="change-button"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
