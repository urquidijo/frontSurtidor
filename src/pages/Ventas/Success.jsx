import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/toastUtils";
import API_URL from "../../config/config";

const Success = () => {
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("ventana_proceso_abierta", "true");

    const registrarFactura = async () => {
      const codigo = "NV002";
      const monto_pagado = parseFloat(localStorage.getItem("monto_pagado"));
      const usuarioId = sessionStorage.getItem("usuarioId");
      const monto_por_cobrar = parseFloat(
        localStorage.getItem("monto_por_cobrar")
      );
      const monto_cambio = 0;

      const hora = new Date().toLocaleTimeString("it-IT");
      const created_at = new Date().toISOString();

      const id_sucursal = sessionStorage.getItem("sucursalId");
      const id_usuario = sessionStorage.getItem("usuarioId");
      const id_dispensador = localStorage.getItem("id_dispensador");
      const id_cliente = localStorage.getItem("id_cliente");
      if (!monto_pagado || !id_sucursal || !id_usuario || !id_cliente) {
        showToast("error", "Faltan datos para generar la factura");
        setStatus("error");
        localStorage.removeItem("ventana_proceso_abierta");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/stripe/verificar-factura`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo: codigo,
            monto_pagado: monto_pagado,
            monto_por_cobrar: monto_por_cobrar,
            monto_cambio: monto_cambio,
            hora: hora,
            created_at: created_at,
            id_sucursal: id_sucursal,
            id_usuario: id_usuario,
            id_dispensador: id_dispensador,
            id_cliente: id_cliente,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.ok) {
          localStorage.setItem("factura_generada", "true");
          fetch(`${API_URL}/bitacora/entrada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              usuarioId,
              acciones: "generar factura",
              estado: "exitoso",
            }),
          });
          setStatus("success");
          showToast("success", "✅ Factura generada exitosamente");
        } else {
          setStatus("error");
          showToast("error", data?.msg || "❌ Error al registrar factura");
        }
      } catch (error) {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "generar factura",
            estado: "fallido",
          }),
        });
        console.error("Error al registrar factura:", error);
        setStatus("error");
        showToast("error","❌ Error de red al registrar factura");
      }
    };

    registrarFactura();

    window.addEventListener("beforeunload", () => {
      localStorage.removeItem("ventana_proceso_abierta");
    });
  }, []);

  return (
  <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#1f1f1f] text-white">
    <div className="w-full max-w-md bg-[#2a2a2a] p-6 rounded-lg shadow-lg text-center">
      <h1 className="text-2xl font-bold mb-4 text-[#00d1b2]">Resultado del Pago</h1>

      {status === "loading" && (
        <p className="text-gray-300">Verificando pago...</p>
      )}

      {status === "success" && (
        <div className="text-green-400 font-semibold">
          ✅ ¡Pago exitoso y factura generada!
        </div>
      )}

      {status === "error" && (
        <div className="text-red-400 font-semibold">
          ❌ Hubo un problema al registrar tu factura.
        </div>
      )}

      <button
        className="mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        onClick={() => {
          localStorage.removeItem("factura_generada");
          localStorage.removeItem("ventana_proceso_abierta");
          localStorage.removeItem("monto_pagado");
          localStorage.removeItem("monto_por_cobrar");
          localStorage.removeItem("id_dispensador");
          localStorage.removeItem("id_cliente");
          navigate("/ventas");
        }}
      >
        Volver a ventas
      </button>
    </div>
  </div>
);

};

export default Success;
