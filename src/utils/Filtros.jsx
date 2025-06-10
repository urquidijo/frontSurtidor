// Filtros.jsx
import { useEffect, useState } from "react";

const Filtros = ({ filtros, onChange }) => {
  const [valores, setValores] = useState({});

  const handleChange = (key, value) => {
    const nuevosValores = { ...valores, [key]: value };
    setValores(nuevosValores);
    onChange(nuevosValores);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {filtros.map(({ campo, label, tipo = "text", opciones = [] }) => (
        <div key={campo} className="flex flex-col">
          <label className="text-sm mb-1 text-white">{label}</label>
          {tipo === "select" ? (
            <select
              className="bg-[#444] text-white px-3 py-2 rounded"
              onChange={(e) => handleChange(campo, e.target.value)}
            >
              <option value="">Todos</option>
              {opciones.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          ) : (
            <input
              type={tipo}
              className="bg-[#444] text-white px-3 py-2 rounded"
              onChange={(e) => handleChange(campo, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Filtros;
