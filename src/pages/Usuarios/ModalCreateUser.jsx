import { useEffect, useState } from "react";
import "./modalCreateUser.css";
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
        const data = await response.json();
        const errs = {};
        data.errors.forEach((err) => (errs[err.path] = err.msg));
        setErrors(errs);
        throw new Error("Error al enviar datos");
      } else {
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
    <div className="modal-register-backdrop">
      <form className="modal-register-content" onSubmit={handleSubmit}>
        <h2 className="title">Crear Usuario</h2>
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
        ].map(({ icon, name, placeholder, type}) => (
          <div key={name} className="modal-Inputclass">
            <FontAwesomeIcon icon={icon} className="icon" />
            <input
              type={type}
              name={name}
              placeholder={placeholder}
              onWheel={(e) => e.target.blur()}
              autoComplete="off"
              value={objData[name]}
              onChange={handleChange}
            />
            {errors[name] && <span className="error">{errors[name]}</span>}
          </div>
        ))}

        <div className="modal-Inputclass">
          <FontAwesomeIcon icon={faPerson} className="icon" />
          <select name="sexo" value={objData.sexo} onChange={handleChange}>
            <option value="">Selecciona tu sexo</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>

        <div className="modal-Inputclass">
          <FontAwesomeIcon icon={faLock} className="icon" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={objData.password}
            onChange={handleChange}
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="modal-Inputclass">
          <FontAwesomeIcon icon={faShop} className="icon" />
          <select
            name="id_sucursal"
            value={objData.id_sucursal}
            onChange={handleChange}
          >
            <option value="">Selecciona una sucursal</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-Inputclass">
          <FontAwesomeIcon icon={faUser} className="icon" />
          <select name="id_rol" value={objData.id_rol} onChange={handleChange}>
            <option value="">Selecciona un rol</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="button-group-createUser">
          <button type="submit" disabled={isDisabled} id="buttonLogIn">
            Crear
          </button>
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModalCreateUser;
