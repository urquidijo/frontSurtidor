import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUser,
  faEye,
  faEyeSlash,
  faAddressCard,
} from "@fortawesome/free-regular-svg-icons";
import {
  faLock,
  faHouse,
  faPhone,
  faPerson,
  faShop,
} from "@fortawesome/free-solid-svg-icons";
import API_URL from "../../config/config";

const ModalCreateUser = ({ onClose, onUserCreated }) => {
  const [objData, setObjData] = useState({
    ci: "",
    name: "",
    telefono: "",
    sexo: "",
    email: "",
    domicilio: "",
    password: "",
    id_sucursal: "",
    id_rol: "",
  });
  const [errors, setErrors] = useState({});
  const [isDisabled, setIsDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [roles, setRoles] = useState([]);
  const usuarioId = sessionStorage.getItem("usuarioId");


  useEffect(() => {
    fetch(`${API_URL}/sucursales`)
      .then((res) => res.json())
      .then(setSucursales)
      .catch((err) => console.error("Error cargando sucursales", err));

    fetch(`${API_URL}/roles`)
      .then((res) => res.json())
      .then(setRoles)
      .catch((err) => console.error("Error cargando roles", err));
  }, []);

  useEffect(() => {
    const isValid = Object.values(errors).every((e) => !e);
    const allFilled = Object.values(objData).every((v) => v.trim() !== "");
    setIsDisabled(!isValid || !allFilled);
  }, [errors, objData]);

  const validations = (name, value) => {
    const errorMessages = {
      ci: "CI requerido",
      name: "El usuario es requerido",
      telefono: "Número de teléfono requerido",
      email: "Debes escribir un email válido",
      domicilio: "Domicilio requerido",
      password: "Debe tener 6 caracteres y una mayúscula",
    };
    let errorMessage = null;
    if (!value.trim()) {
      errorMessage = `El ${name} es requerido`;
    } else if (
      name === "password" &&
      (value.length < 6 || !/[A-Z]/.test(value))
    ) {
      errorMessage = errorMessages[name];
    } else if (name === "email" && !/\S+@\S+\.\S+/.test(value)) {
      errorMessage = errorMessages[name];
    }
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const handleChange = ({ target: { value, name } }) => {
    setObjData({ ...objData, [name]: value });
    validations(name, value);
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const sendData = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objData),
      });
      if (response.status === 400) {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "crear usuario",
            estado: "fallido",
          }),
        });
        const data = await response.json();
        const errs = {};
        data.errors.forEach((err) => (errs[err.path] = err.msg));
        setErrors(errs);
        throw new Error("Error al enviar datos");
      } else {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "crear usuario",
            estado: "exitoso",
          }),
        });
        onUserCreated();
        onClose();
      }
    } catch (err) {
      console.error("Error al crear usuario", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendData();
  };

  return (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <form
      onSubmit={handleSubmit}
      className="bg-[#1e1e1e] text-white p-6 rounded-2xl w-full max-w-lg shadow-xl"
    >
      <h2 className="text-2xl font-bold text-teal-400 mb-6">Crear Usuario</h2>

      {[
        {
          icon: faAddressCard,
          name: "ci",
          placeholder: "Cédula de Identidad",
          type: "number",
        },
        { icon: faUser, name: "name", placeholder: "Nombre" },
        {
          icon: faPhone,
          name: "telefono",
          placeholder: "Teléfono",
          type: "number",
        },
        {
          icon: faEnvelope,
          name: "email",
          placeholder: "Correo electrónico",
          type: "email",
        },
        { icon: faHouse, name: "domicilio", placeholder: "Domicilio" },
      ].map(({ icon, name, placeholder, type }) => (
        <div key={name} className="mb-4">
          <div className="flex items-center bg-[#2a2a2a] rounded-md px-3 py-2">
            <FontAwesomeIcon icon={icon} className="text-teal-400 mr-3" />
            <input
              type={type}
              name={name}
              placeholder={placeholder}
              onWheel={(e) => e.target.blur()}
              autoComplete="off"
              value={objData[name]}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-white placeholder-gray-400"
            />
          </div>
          {errors[name] && (
            <span className="text-red-500 text-sm mt-1 block">{errors[name]}</span>
          )}
        </div>
      ))}

      <div className="mb-4">
        <div className="flex items-center bg-[#2a2a2a] rounded-md px-3 py-1">
          <FontAwesomeIcon icon={faPerson} className="text-teal-400 mr-3" />
          <select
            name="sexo"
            value={objData.sexo}
            onChange={handleChange}
            className="w-full bg-[#2a2a2a] text-white outline-none appearance-none px-2 py-1 rounded-md"
          >
            <option value="">Selecciona tu sexo</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
        {errors.sexo && (
          <span className="text-red-500 text-sm mt-1 block">{errors.sexo}</span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center bg-[#2a2a2a] rounded-md px-3 py-2 relative">
          <FontAwesomeIcon icon={faLock} className="text-teal-400 mr-3" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={objData.password}
            onChange={handleChange}
            className="w-full bg-transparent outline-none text-white placeholder-gray-400"
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="absolute right-3 cursor-pointer text-gray-400 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
        {errors.password && (
          <span className="text-red-500 text-sm mt-1 block">{errors.password}</span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center bg-[#2a2a2a] rounded-md px-3 py-1">
          <FontAwesomeIcon icon={faShop} className="text-teal-400 mr-3" />
          <select
            name="id_sucursal"
            value={objData.id_sucursal}
            onChange={handleChange}
            className="w-full bg-[#2a2a2a] text-white outline-none appearance-none px-2 py-1 rounded-md"
          >
            <option value="">Selecciona una sucursal</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        {errors.id_sucursal && (
          <span className="text-red-500 text-sm mt-1 block">{errors.id_sucursal}</span>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center bg-[#2a2a2a] rounded-md px-3 py-1">
          <FontAwesomeIcon icon={faUser} className="text-teal-400 mr-3" />
          <select
            name="id_rol"
            value={objData.id_rol}
            onChange={handleChange}
            className="w-full bg-[#2a2a2a] text-white outline-none appearance-none px-2 py-1 rounded-md"
          >
            <option value="">Selecciona un rol</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>
        {errors.id_rol && (
          <span className="text-red-500 text-sm mt-1 block">{errors.id_rol}</span>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isDisabled}
          className="bg-teal-500 hover:bg-teal-600 text-black font-semibold py-2 px-4 rounded-md transition disabled:opacity-50"
        >
          Crear
        </button>
        <button
          type="button"
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </form>
  </div>
);

};

export default ModalCreateUser;
