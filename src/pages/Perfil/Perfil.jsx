import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import { Pencil, Save, X } from "lucide-react"; 
import { showToast } from "../../utils/toastUtils";
import "./perfil.css";

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDisabled, setIsDisabled] = useState(true);

  const usuarioId = sessionStorage.getItem("usuarioId");

  const cargarPerfil = () => {
    fetch(`${API_URL}/users/${usuarioId}`)
      .then((res) => res.json())
      .then((data) => setUsuario(data))
      .catch((err) => console.error("Error al cargar perfil:", err));
  };

  useEffect(() => {
    if (usuarioId) cargarPerfil();
  }, [usuarioId]);

  useEffect(() => {
    if (usuario) {
      const isValid = Object.values(errors).every((error) => !error);
      const allFieldsFilled = ["nombre", "correo", "telefono", "sexo", "domicilio"].every(
        (field) => usuario[field]?.trim() !== ""
      );
      setIsDisabled(!isValid || !allFieldsFilled);
    }
  }, [errors, usuario]);

  const validations = (name, value) => {
    const errorMessages = {
      nombre: "El nombre es requerido",
      correo: "Debes escribir un email válido",
      telefono: "Número de teléfono requerido",
      domicilio: "Domicilio requerido",
    };
    let errorMessage = null;

    if (!value.trim()) {
      errorMessage = `El ${name} es requerido`;
    } else if (name === "correo") {
      const isValidEmail = /\S+@\S+\.\S+/.test(value);
      if (!isValidEmail) {
        errorMessage = errorMessages[name];
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario({ ...usuario, [name]: value });
    validations(name, value);
  };

  const handleGuardar = async () => {
    try {
      const res = await fetch(`${API_URL}/users/${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      const data = await res.json();
      if (res.ok) {
        setUsuario(data);
        showToast("success", "Perfil actualizado con éxito");
        setEditando(false);
      } else {
        showToast("error", "Error al actualizar perfil");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Error del servidor");
      
    }
  };

  const handleCancelar = () => {
    cargarPerfil(); // vuelve a traer los datos de la base
    setEditando(false);
    setErrors({});
  };

  if (!usuario) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-container">
      <h2>Mi Perfil</h2>

      <div className="perfil-form">
        {/* Campos con validaciones */}
        <label>
          Nombre:
          <input
            type="text"
            name="nombre"
            autoComplete="off"
            value={usuario.nombre}
            onChange={handleChange}
            disabled
          />
          {errors.nombre && <span className="error">{errors.nombre}</span>}
        </label>
        {/* resto de los campos igual... */}
        <label>
          Correo:
          <input
            type="email"
            name="correo"
            autoComplete="off"
            value={usuario.correo}
            onChange={handleChange}
            disabled={!editando}
          />
          {errors.correo && <span className="error">{errors.correo}</span>}
        </label>
        <label>
          Teléfono:
          <input
            type="number"
            name="telefono"
            autoComplete="off"
            onWheel={(e) => e.target.blur()}
            value={usuario.telefono}
            onChange={handleChange}
            disabled={!editando}
          />
          {errors.telefono && <span className="error">{errors.telefono}</span>}
        </label>
        <label>
          Sexo:
          <select
            name="sexo"
            value={usuario.sexo}
            onChange={handleChange}
            disabled={!editando}
          >
            <option value="">Selecciona tu sexo</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </label>
        <label>
          Domicilio:
          <input
            type="text"
            name="domicilio"
            autoComplete="off"
            value={usuario.domicilio}
            onChange={handleChange}
            disabled={!editando}
          />
          {errors.domicilio && <span className="error">{errors.domicilio}</span>}
        </label>
        <label>
          CI:
          <input type="text" value={usuario.ci} disabled />
        </label>
      </div>

      <div className="perfil-actions">
        {editando ? (
          <>
            <button onClick={handleGuardar} disabled={isDisabled}>
              <Save size={14} /> Guardar
            </button>
            <button onClick={handleCancelar}>
              <X size={14} /> Cancelar
            </button>
          </>
        ) : (
          <button onClick={() => setEditando(true)}>
            <Pencil size={16} /> Editar Perfil
          </button>
        )}
      </div>
    </div>
  );
};

export default Perfil;
