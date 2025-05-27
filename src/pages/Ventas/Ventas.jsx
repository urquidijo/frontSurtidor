import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_URL from "../../config/config";

const Ventas = () => {
    const [placa, setPlaca] = useState('');
    const [cliente, setCliente] = useState(null);
    const [formulario, setFormulario] = useState({
        nombre: '',
        nit: '',
        b_sisa: false,
        id_sucursal: ''
    });
    const [monto, setMonto] = useState('');
    const [nuevo, setNuevo] = useState(false);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const sucursalId = sessionStorage.getItem('sucursalId');
        if (sucursalId) {
            setFormulario((prev) => ({ ...prev, id_sucursal: sucursalId }));
        }
    }, []);

    const buscarCliente = async () => {
        if (!placa.trim()) {
            toast.warning('Ingresa una placa válida');
            return;
        }

        setCargando(true);
        try {
            const res = await fetch(`${API_URL}/clientes/${placa}`);
            if (!res.ok) throw new Error('Cliente no encontrado');
            const data = await res.json();
            setCliente(data);
            localStorage.setItem('id_cliente', data.id);
            setFormulario(prev => ({
                ...prev,
                ...data
            }));
            setNuevo(false);
            toast.success('Cliente encontrado');
        } catch {
            setCliente(null);
            localStorage.removeItem('id_cliente');
            setNuevo(true);
            toast.info('Cliente no encontrado. Puedes registrarlo.');
        } finally {
            setCargando(false);
        }
    };

    const registrarCliente = async () => {
        const { nombre, nit, b_sisa, id_sucursal } = formulario;

        if (!nombre || !nit || !placa || id_sucursal === '') {
            toast.error('Completa todos los campos');
            return;
        }

        setCargando(true);
        try {
            const res = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, nit, placa, b_sisa, id_sucursal })
            });

            if (!res.ok) throw new Error('Error en el registro');
            const data = await res.json();
            setCliente(data);
            localStorage.setItem('id_cliente', data.id);
            setNuevo(false);
            toast.success('Cliente registrado correctamente');
        } catch {
            toast.error('Error al registrar el cliente');
        } finally {
            setCargando(false);
        }
    };

    const pagarConTarjeta = async () => {
        if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
            toast.error('Ingresa un monto válido en USD');
            return;
        }

        setCargando(true);
        try {
            const res = await fetch(`${API_URL}/stripe/crear-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ monto: parseFloat(monto) })
            });

            const data = await res.json();
            if (data.url) {
                localStorage.setItem('monto_pagado', monto); // ✅ Guardar monto antes de redirigir
                window.location.href = data.url;
            } else {
                toast.error('No se pudo redirigir a Stripe');
            }
        } catch {
            toast.error('Error al crear sesión de pago');
        } finally {
            setCargando(false);
        }
    };

    const cancelar = () => {
        setPlaca('');
        setFormulario({ nombre: '', nit: '', b_sisa: false, id_sucursal: sessionStorage.getItem('sucursalId') || '' });
        setMonto('');
        setCliente(null);
        setNuevo(false);
        localStorage.removeItem('id_cliente');
        localStorage.removeItem('monto_pagado'); 
        toast.info('Operación cancelada');
    };

    const handleMontoChange = (e) => {
        const value = e.target.value;
        setMonto(value);
        localStorage.setItem('monto_pagado', value); 
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Registrar Venta</h2>

            <div className="mb-4 flex items-center space-x-2">
                <input
                    type="text"
                    placeholder="Ingresar placa"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    className="border p-2 flex-1 rounded"
                />
                <button
                    onClick={buscarCliente}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={cargando}
                >
                    {cargando ? 'Buscando...' : 'Buscar'}
                </button>
            </div>

            {(cliente || nuevo) && (
                <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={formulario.nombre}
                        onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                        className="border p-2 w-full rounded"
                        disabled={!nuevo}
                    />
                    <input
                        type="text"
                        placeholder="NIT"
                        value={formulario.nit}
                        onChange={(e) => setFormulario({ ...formulario, nit: e.target.value })}
                        className="border p-2 w-full rounded"
                        disabled={!nuevo}
                    />

                    <input
                        type="text"
                        placeholder="ID Sucursal"
                        value={formulario.id_sucursal}
                        readOnly
                        className="border p-2 w-full rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    />

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formulario.b_sisa}
                            onChange={(e) => setFormulario({ ...formulario, b_sisa: e.target.checked })}
                            disabled={!nuevo}
                        />
                        <label className="ml-2">Tiene B-SISA</label>
                    </div>

                    {nuevo ? (
                        <button
                            type="button"
                            onClick={registrarCliente}
                            className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
                            disabled={cargando}
                        >
                            Registrar Cliente
                        </button>
                    ) : (
                        <>
                            <input
                                type="number"
                                placeholder="Monto en USD"
                                value={monto}
                                onChange={handleMontoChange}
                                className="border p-2 w-full rounded"
                            />
                            <button
                                type="button"
                                onClick={pagarConTarjeta}
                                className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
                                disabled={cargando || !monto}
                            >
                                Pagar
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={cancelar}
                        className="bg-gray-500 text-white px-4 py-2 rounded w-full"
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
