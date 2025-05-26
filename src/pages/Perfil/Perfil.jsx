import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import { Pencil, Save, X } from "lucide-react";
import { showToast } from "../../utils/toastUtils";

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
      const allFieldsFilled = [
        "nombre",
        "correo",
        "telefono",
        "sexo",
        "domicilio",
      ].every((field) => usuario[field]?.trim() !== "");
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
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "actualizar perfil",
            estado: "exitoso",
          }),
        });
        showToast("success", "Perfil actualizado con éxito");
        setEditando(false);
      } else {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "actualizar perfil",
            estado: "fallido",
          }),
        });
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
  <div className="p-8 text-[#f1f1f1]">
    <h2 className="text-2xl mb-6 text-[#00d1b2] font-bold border-b border-[#444] pb-2">Mi Perfil</h2>

    <div className="grid gap-5 bg-[#2a2a2a] p-6 rounded-xl shadow-lg max-w-2xl">
      {[
        { label: "Nombre", name: "nombre", type: "text", disabled: true },
        { label: "Correo", name: "correo", type: "email", disabled: !editando },
        { label: "Teléfono", name: "telefono", type: "number", disabled: !editando },
        { label: "Sexo", name: "sexo", type: "select", disabled: !editando },
        { label: "Domicilio", name: "domicilio", type: "text", disabled: !editando },
        { label: "CI", name: "ci", type: "text", disabled: true }
      ].map((field) => (
        <label key={field.name} className="flex flex-col gap-1 text-sm">
          <span className="text-[#00d1b2] font-medium">{field.label}:</span>
          {field.type === "select" ? (
            <select
              name={field.name}
              value={usuario[field.name]}
              onChange={handleChange}
              disabled={field.disabled}
              className="bg-[#1f1f1f] text-white px-4 py-2 rounded-md border border-[#444] disabled:opacity-60"
            >
              <option value="">Selecciona tu sexo</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          ) : (
            <input
              type={field.type}
              name={field.name}
              autoComplete="off"
              value={usuario[field.name]}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              disabled={field.disabled}
              className="bg-[#1f1f1f] text-white px-4 py-2 rounded-md border border-[#444] disabled:opacity-60"
            />
          )}
          {errors[field.name] && (
            <span className="text-red-500 text-xs">{errors[field.name]}</span>
          )}
        </label>
      ))}
    </div>

    <div className="flex gap-4 mt-6">
      {editando ? (
        <>
          <button
            onClick={handleGuardar}
            disabled={isDisabled}
            className="flex items-center gap-2 bg-[#00d1b2] text-black px-5 py-2 rounded-md font-semibold hover:bg-[#00bfa4] disabled:opacity-50 transition"
          >
            <Save size={16} /> Guardar
          </button>
          <button
            onClick={handleCancelar}
            className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-gray-500 transition"
          >
            <X size={16} /> Cancelar
          </button>
        </>
      ) : (
        <button
          onClick={() => setEditando(true)}
          className="flex items-center gap-2 bg-[#00d1b2] text-black px-5 py-2 rounded-md font-semibold hover:bg-[#00bfa4] transition"
        >
          <Pencil size={16} /> Editar Perfil
        </button>
      )}
    </div>
  </div>
);

};

export default Perfil;
