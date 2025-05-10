import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/config";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [objData, setObjData] = useState({ ci: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isDisabled, setIsDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [resetError, setResetError] = useState("");

  const [resetUser, setResetUser] = useState({
    ci: "",
    email: "",
  });

  useEffect(() => {
    const isValid = Object.values(errors).every((error) => !error);
    const allFieldsFilled = Object.values(objData).every(
      (value) => value.trim() !== ""
    );
    setIsDisabled(!isValid || !allFieldsFilled);
  }, [errors, objData]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validations = (name, value) => {
    const errorMessages = {
      ci: "El ci es requerido",
      password: "Debe tener 6 caracteres y una mayuscula",
    };
    let errorMessage = null;
    if (!value.trim()) {
      errorMessage = `El ${name} es requerido`;
    } else if (name === "password") {
      if (value.length < 6 || !/[A-Z]/.test(value)) {
        errorMessage = errorMessages[name];
      }
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  };

  const handleChange = ({ target: { value, name } }) => {
    let data = { [name]: value };
    setObjData({
      ...objData,
      ...data,
    });
    validations(name, value);
  };

  const sendData = async () => {
    try {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(objData),
      });

      if (response.status === 400) {
        const responseData = await response.json();
        const errorMessages = {};
        responseData.errors.forEach((error) => {
          errorMessages[error.path] = error.msg;
        });
        setErrors(errorMessages);
        console.warn("Errores del backend:", errorMessages);
        return;
      }

      if (!response.ok) {
        throw new Error("Error en el servidor");
      }

      const data = await response.json();
      console.log("Login successful");

      sessionStorage.setItem("authToken", data.token);
      sessionStorage.setItem("usuarioId", data.usuario.id);

      // ✅ Guardamos info útil para la homepage:
      const { sucursal } = data.usuario;

      if (sucursal) {
        sessionStorage.setItem("sucursalId", sucursal.id);
        sessionStorage.setItem("sucursalNombre", sucursal.nombre);
        sessionStorage.setItem("sucursalDireccion", sucursal.direccion);
        sessionStorage.setItem("sucursalTelefono", sucursal.telefono);
        sessionStorage.setItem("sucursalCorreo", sucursal.correo);
        sessionStorage.setItem("sucursalSuspendida", sucursal.esta_suspendido);
      }

      navigate("/home");
    } catch (error) {
      console.error("Error al enviar los datos del front:", error);
    }
  };
  const handleSendReset = async () => {
    try {
      if (!resetUser.ci.trim()) {
        setResetError("El usuario es requerido");
        return;
      }
      if (!resetUser.email.trim()) {
        setResetError("El correo es requerido");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(resetUser.email)) {
        setResetError("El correo no es válido");
        return;
      }

      const loadingToast = toast.loading("Enviando correo...");
      const res = await fetch(`${API_URL}/auth/enviar-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: resetUser }),
      });
      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.status === 400) {
        setResetError(data.msg || "CI no encontrado");
        toast.error(data.msg || "CI no encontrado");
        return;
      }
      if (res.status === 401) {
        setResetError(data.msg || "Correo no coincide con el del CI");
        toast.error(data.msg || "Correo no coincide con el del CI");
        return;
      }
      if (res.status === 500) {
        setResetError(data.msg || "error al enviar el correo");
        toast.error("Ocurrió un error al enviar el correo");
        return;
      }

      toast.success("Correo enviado 📬. Revisá tu bandeja o spam");
      //setShowModal(false);
    } catch (err) {
      console.error("Error al enviar correo", err);
      toast.dismiss();
      toast.error("Error al conectar con el servidor");
      setResetError("Error al conectar con el servidor");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendData();
  };
  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Bienvenidos</h2>
        <p className="login-subtitle">Por favor ingrese sus datos</p>

        <div className="input-group">
          <label htmlFor="name">Usuario</label>
          <div className="input-icon">
            <FontAwesomeIcon icon={faUser} className="icon" />
            <input
              type="text"
              name="ci"
              placeholder="CI"
              autoComplete="off"
              onChange={handleChange}
              value={objData.ci}
            />
          </div>
          {errors && <span className="error">{errors.ci}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <div className="input-icon">
            <FontAwesomeIcon icon={faLock} className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="contraseña"
              autoComplete="off"
              onChange={handleChange}
              value={objData.password}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="eye-icon"
              onClick={togglePasswordVisibility}
            />
          </div>
          {errors && <span className="error">{errors.password}</span>}
        </div>

        <button disabled={isDisabled} className="login-button">
          Iniciar sesión
        </button>
        <p className="forgot-password" onClick={() => setShowModal(true)}>
          ¿Olvidaste tu contraseña?
        </p>
      </form>
      {showModal && (
        <div className="modal-login-overlay">
          <div className="modal-login">
            <h3>Restablecer contraseña</h3>
            <h4>revisar el correo enviado en spam</h4>
            <input
              type="text"
              placeholder="Ingresa tu CI"
              value={resetUser.ci}
              autoComplete="off"
              onChange={(e) => {
                setResetUser((prev) => ({ ...prev, ci: e.target.value }));
                setResetError(""); // Limpiar error al escribir
              }}
            />
            <input
              type="email"
              placeholder="Ingresa el correo del CI"
              value={resetUser.email}
              autoComplete="off"
              onChange={(e) => {
                setResetUser((prev) => ({ ...prev, email: e.target.value }));
                setResetError(""); // Limpiar error al escribir
              }}
            />
            {resetError && <span className="error">{resetError}</span>}
            <button onClick={handleSendReset}>Enviar correo</button>
            <button onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Login;
