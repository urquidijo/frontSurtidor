import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_URL from "../../config/config";

const Ventas = () => {
  const [placa, setPlaca] = useState("");
  const [cliente, setCliente] = useState(null);
  const [dispensadores, setDispensadores] = useState([]);
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [montoPagado, setMontoPagado] = useState("");
  const [montoPorCobrar, setMontoPorCobrar] = useState("");
  const [nuevo, setNuevo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [status, setStatus] = useState("loading");
  const usuarioId = sessionStorage.getItem("usuarioId");

  const [formulario, setFormulario] = useState({
    nombre: "",
    nit: "",
    b_sisa: false,
    id_dispensador: "",
    id_sucursal: sessionStorage.getItem("sucursalId") || "",
  });

  const sucursalId = sessionStorage.getItem("sucursalId");

  useEffect(() => {
    if (sucursalId) {
      setFormulario((prev) => ({ ...prev, id_sucursal: sucursalId }));
      fetch(`${API_URL}/dispensadores/sucursal/activos/${sucursalId}`)
        .then((res) => res.json())
        .then((data) => setDispensadores(data))
        .catch(() => toast.error("Error al obtener dispensadores"));
    }
  }, [sucursalId]);

  const buscarCliente = async () => {
    if (!placa.trim()) {
      toast.warning("Ingresa una placa válida");
      return;
    }

    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/clientes/${placa}`);
      if (!res.ok) throw new Error("Cliente no encontrado");
      const data = await res.json();
      setCliente(data);
      localStorage.setItem("id_cliente", data.id);
      setFormulario((prev) => ({
        ...prev,
        ...data,
      }));
      setNuevo(false);
      toast.success("Cliente encontrado");
    } catch {
      setCliente(null);
      localStorage.removeItem("id_cliente");
      setNuevo(true);
      toast.info("Cliente no encontrado. Puedes registrarlo.");
    } finally {
      setCargando(false);
    }
  };

  const registrarCliente = async () => {
    const { nombre, nit, b_sisa } = formulario;
    if (!nombre || !nit || !placa) {
      toast.error("Completa todos los campos");
      return;
    }

    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, nit, placa, b_sisa, sucursalId }),
      });

      if (!res.ok) throw new Error("Error en el registro");
      fetch(`${API_URL}/bitacora/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          acciones: "registrar cliente",
          estado: "exitoso",
        }),
      });
      const data = await res.json();
      setCliente(data);
      localStorage.setItem("id_cliente", data.id);
      setNuevo(false);
      toast.success("Cliente registrado correctamente");
    } catch {
      toast.error("Error al registrar el cliente");
    } finally {
      setCargando(false);
    }
  };

  const pagarConTarjeta = async () => {
    if (
      !montoPorCobrar ||
      isNaN(montoPorCobrar) ||
      parseFloat(montoPorCobrar) <= 0
    ) {
      toast.error("Ingresa un monto a cobrar válido en USD");
      return;
    }
    if (!formulario.id_dispensador) {
      toast.error("Debes seleccionar un dispensador antes de pagar");
      return;
    }

    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/stripe/crear-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          montoPorCobrar: parseFloat(montoPorCobrar),
          montoPagado: parseFloat(montoPorCobrar),
        }),
      });

      const data = await res.json();
      if (data.url) {
        localStorage.setItem("monto_por_cobrar", montoPorCobrar);
        localStorage.setItem("monto_pagado", montoPorCobrar); // 👈 también aquí
        localStorage.setItem("id_dispensador", formulario.id_dispensador);
        window.location.href = data.url;
      } else {
        toast.error("No se pudo redirigir a Stripe");
      }
    } catch {
      toast.error("Error al crear sesión de pago");
    } finally {
      setCargando(false);
    }
  };

  const pagarEnEfectivo = async () => {
    if (!montoPagado || isNaN(montoPagado) || parseFloat(montoPagado) <= 0) {
      toast.error("Monto pagado inválido");
      return;
    }
    if (montoPagado < montoPorCobrar) {
      toast.info("el monto pagado es menor al monto por cobrar");
      return;
    }

    if (!formulario.id_dispensador) {
      toast.error("Debes seleccionar un dispensador antes de pagar");
      return;
    }
    localStorage.setItem("id_dispensador", formulario.id_dispensador);

    setCargando(true);
    const codigo = "NV002";
    const monto_pagado = parseFloat(localStorage.getItem("monto_pagado"));
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
      toast.error("Faltan datos para generar la factura");
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
        setStatus("success");
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "generar factura",
            estado: "exitoso",
          }),
        });
        toast.success("✅ Factura generada exitosamente");
        cancelar(); // <- acá se resetea todo
      } else {
        fetch(`${API_URL}/bitacora/entrada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            acciones: "generar factura",
            estado: "fallido",
          }),
        });
        setStatus("error");
        toast.error(data?.msg || "❌ Error al registrar factura");
      }
    } catch (error) {
      console.error("Error al registrar factura:", error);
      setStatus("error");
      toast.error("❌ Error de red al registrar factura");
    }
  };

  const cancelar = () => {
    setPlaca("");
    setFormulario({
      nombre: "",
      nit: "",
      b_sisa: false,
      id_dispensador: "",
      id_sucursal: sessionStorage.getItem("sucursalId") || "",
    });
    setMontoPagado("");
    setMontoPorCobrar("");
    setCliente(null);
    setNuevo(false);
    setCargando(false);
    localStorage.removeItem("id_cliente");
    localStorage.removeItem("monto_pagado");
    localStorage.removeItem("monto_por_cobrar");
    localStorage.removeItem("id_dispensador");
  };

  const handleMontoChange = (e) => {
    const value = e.target.value;
    setMontoPorCobrar(value);
    localStorage.setItem("monto_por_cobrar", value);
    localStorage.setItem("monto_pagado", value);
  };
  const handleMontoPagadoChange = (e) => {
    const value = e.target.value;
    setMontoPagado(value);
    localStorage.setItem("monto_pagado", value);
  };

  return (
  <div className="p-4 sm:p-6 max-w-xl w-full mx-auto bg-[#1f1f1f] rounded-lg shadow-lg border border-[#333] text-white">
    <h2 className="text-2xl font-bold mb-4 text-[#00d1b2] text-center sm:text-left">
      Registrar Venta
    </h2>

    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
      <input
        type="text"
        placeholder="Ingresar placa"
        value={placa}
        onChange={(e) => setPlaca(e.target.value.toUpperCase())}
        className="bg-[#2a2a2a] border border-[#444] text-white p-2 rounded w-full"
      />
      <button
        onClick={buscarCliente}
        className="bg-[#00d1b2] text-white px-4 py-2 rounded hover:bg-[#00a89c] disabled:opacity-50 w-full sm:w-auto"
        disabled={cargando}
      >
        {cargando ? "Buscando..." : "Buscar"}
      </button>
    </div>

    {(cliente || nuevo) && (
      <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
        <input
          type="text"
          placeholder="Nombre"
          value={formulario.nombre}
          onChange={(e) =>
            setFormulario({ ...formulario, nombre: e.target.value })
          }
          className="bg-[#2a2a2a] border border-[#444] text-white p-2 w-full rounded"
          disabled={!nuevo}
        />
        <input
          type="text"
          placeholder="NIT"
          value={formulario.nit}
          onChange={(e) =>
            setFormulario({ ...formulario, nit: e.target.value })
          }
          className="bg-[#2a2a2a] border border-[#444] text-white p-2 w-full rounded"
          disabled={!nuevo}
        />

        {!nuevo && (
          <select
            value={formulario.id_dispensador}
            onChange={(e) =>
              setFormulario({ ...formulario, id_dispensador: e.target.value })
            }
            className="bg-[#2a2a2a] border border-[#444] text-white p-2 w-full rounded"
          >
            <option value="">Selecciona un dispensador</option>
            {dispensadores.map((d) => (
              <option key={d.id} value={d.id}>
                {d.ubicacion || `Dispensador ${d.id}`}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formulario.b_sisa}
            onChange={(e) =>
              setFormulario({ ...formulario, b_sisa: e.target.checked })
            }
            disabled={!nuevo}
            className="accent-[#00d1b2]"
          />
          <label className="ml-2 text-gray-300">Tiene B-SISA</label>
        </div>

        {!nuevo && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label className="text-gray-300 sm:w-1/3">Método de pago:</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="bg-[#2a2a2a] border border-[#444] text-white p-2 rounded w-full sm:w-2/3"
            >
              <option value="tarjeta">Tarjeta</option>
              <option value="efectivo">Efectivo</option>
            </select>
          </div>
        )}

        {nuevo ? (
          <button
            type="button"
            onClick={registrarCliente}
            className="bg-[#00d1b2] text-white px-4 py-2 rounded w-full hover:bg-[#00a89c] disabled:opacity-50"
            disabled={cargando}
          >
            Registrar Cliente
          </button>
        ) : (
          <>
            <input
              type="number"
              placeholder="Monto a cobrar (USD)"
              value={montoPorCobrar}
              onChange={handleMontoChange}
              className="bg-[#2a2a2a] border border-[#444] text-white p-2 w-full rounded"
            />

            <input
              type="number"
              placeholder="Monto pagado (USD)"
              value={
                metodoPago === "tarjeta" ? montoPorCobrar : montoPagado
              }
              onChange={
                metodoPago === "tarjeta" ? undefined : handleMontoPagadoChange
              }
              className={`bg-[#2a2a2a] border border-[#444] text-white p-2 w-full rounded ${
                metodoPago === "tarjeta"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={metodoPago === "tarjeta"}
            />

            <button
              type="button"
              onClick={
                metodoPago === "tarjeta"
                  ? pagarConTarjeta
                  : pagarEnEfectivo
              }
              className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700 disabled:opacity-50"
              disabled={cargando || !montoPorCobrar}
            >
              {metodoPago === "tarjeta"
                ? "Pagar con Tarjeta"
                : "Registrar Pago en Efectivo"}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={cancelar}
          className="bg-gray-600 text-white px-4 py-2 rounded w-full hover:bg-gray-700"
          disabled={cargando}
        >
          Cancelar
        </button>
      </form>
    )}
  </div>
);

};

export default Ventas;
