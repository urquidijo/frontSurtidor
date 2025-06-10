import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
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
  const [resetUser, setResetUser] = useState({ ci: "", email: "" });

  useEffect(() => {
    const isValid = Object.values(errors).every((error) => !error);
    const allFieldsFilled = Object.values(objData).every(
      (v) => v.trim() !== ""
    );
    setIsDisabled(!isValid || !allFieldsFilled);
  }, [errors, objData]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validations = (name, value) => {
    let error = null;
    if (!value.trim()) {
      error = `El ${name} es requerido`;
    } else if (name === "password") {
      if (value.length < 6 || !/[A-Z]/.test(value)) {
        error = "Debe tener 6 caracteres y una mayúscula";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = ({ target: { value, name } }) => {
    setObjData((prev) => ({ ...prev, [name]: value }));
    validations(name, value);
  };

  const sendData = async () => {
    try {
      const res = await fetch(`${API_URL}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objData),
      });

      if (res.status === 400) {
        const { errors } = await res.json();
        const errorMessages = {};
        errors.forEach((e) => (errorMessages[e.path] = e.msg));
        setErrors(errorMessages);
        return;
      }

      if (!res.ok) throw new Error("Error en el servidor");

      const data = await res.json();
      sessionStorage.setItem("authToken", data.token);
      sessionStorage.setItem("usuarioId", data.usuario.id);

      const usuarioId = sessionStorage.getItem("usuarioId");
      fetch(`${API_URL}/bitacora/entrada`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, acciones: "logIn",estado: "exitoso", }),
      });

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
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReset = async () => {
    try {
      if (!resetUser.ci.trim()) return setResetError("El usuario es requerido");
      if (!resetUser.email.trim())
        return setResetError("El correo es requerido");
      if (!/\S+@\S+\.\S+/.test(resetUser.email))
        return setResetError("Correo no válido");

      const loading = toast.loading("Enviando correo...");
      const res = await fetch(`${API_URL}/auth/enviar-reset`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: resetUser }),
      });
      const data = await res.json();
      toast.dismiss(loading);

      if (res.status === 400 || res.status === 401 || res.status === 500) {
        setResetError(data.msg);
        toast.error(data.msg);
        return;
      }

      toast.success("Correo enviado 📬. Revisá tu bandeja o spam");
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Error al conectar con el servidor");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendData();
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-black/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md text-slate-200"
      >
        <h2 className="text-3xl font-bold text-center text-cyan-400 mb-2">
          Bienvenidos a Octano
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Por favor ingrese sus datos
        </p>

        <div className="mb-4">
          <label className="block mb-1 text-slate-300">Usuario</label>
          <div className="flex items-center bg-[#1e1e1e] border border-[#444] rounded-lg p-2">
            <FontAwesomeIcon icon={faUser} className="text-slate-400 mr-2" />
            <input
              type="text"
              name="ci"
              placeholder="CI"
              autoComplete="off"
              value={objData.ci}
              onChange={handleChange}
              className="bg-transparent outline-none text-white flex-1"
            />
          </div>
          {errors.ci && (
            <span className="text-red-400 text-sm">{errors.ci}</span>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-slate-300">Contraseña</label>
          <div className="flex items-center bg-[#1e1e1e] border border-[#444] rounded-lg p-2">
            <FontAwesomeIcon icon={faLock} className="text-slate-400 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              value={objData.password}
              onChange={handleChange}
              className="bg-transparent outline-none text-white flex-1"
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              onClick={togglePasswordVisibility}
              className="text-slate-400 cursor-pointer ml-2"
            />
          </div>
          {errors.password && (
            <span className="text-red-400 text-sm">{errors.password}</span>
          )}
        </div>

        <button
          disabled={isDisabled}
          className="w-full bg-cyan-400 text-black font-bold py-2 rounded-lg mt-2 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Iniciar sesión
        </button>

        <p
          className="mt-4 text-center text-slate-300 hover:text-cyan-400 cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          ¿Olvidaste tu contraseña?
        </p>
      </form>

      {/* Modal de recuperación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl p-6 w-full max-w-sm shadow-2xl text-center animate-fade-in">
            <h3 className="text-xl font-semibold mb-3">
              Restablecer contraseña
            </h3>
            <h4 className="text-sm mb-4 text-slate-300">
              Revisá spam en tu correo 📬
            </h4>

            <input
              type="text"
              placeholder="Ingresa tu CI"
              autoComplete="off"
              value={resetUser.ci}
              onChange={(e) => {
                setResetUser((prev) => ({ ...prev, ci: e.target.value }));
                setResetError("");
              }}
              className="w-full mb-3 p-2 rounded bg-white/80 text-black outline-none"
            />
            <input
              type="email"
              placeholder="Ingresa el correo del CI"
              autoComplete="off"
              value={resetUser.email}
              onChange={(e) => {
                setResetUser((prev) => ({ ...prev, email: e.target.value }));
                setResetError("");
              }}
              className="w-full mb-3 p-2 rounded bg-white/80 text-black outline-none"
            />
            {resetError && (
              <p className="text-red-400 text-sm mb-2">{resetError}</p>
            )}

            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSendReset}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Enviar correo
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
