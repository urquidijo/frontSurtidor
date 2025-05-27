import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_URL from '../../config/config';

const Success = () => {
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const yaFacturado = localStorage.getItem('factura_generada');
    const ventanaActiva = localStorage.getItem('ventana_proceso_abierta');

    if (ventanaActiva === 'true' || yaFacturado === 'true') {
      console.log('Otra ventana ya está procesando...');
      setStatus('success');
      return;
    }

    localStorage.setItem('ventana_proceso_abierta', 'true');

    const registrarFactura = async () => {
      const codigo = 'NV002';
      const monto_pagado = localStorage.getItem('monto_pagado') ;
      const monto_por_cobrar = 0;
      const monto_cambio = '0';

      const hora = new Date().toLocaleTimeString('it-IT');
      const created_at = new Date().toISOString();

      const id_sucursal = sessionStorage.getItem('sucursalId');
      const id_usuario = sessionStorage.getItem('usuarioId');
      const id_dispensador = localStorage.getItem('id_dispensador') || "26451b02-a209-437b-bd56-089d8a77c4a4";
      const id_cliente = localStorage.getItem('id_cliente');

      if (!monto_pagado || !id_sucursal || !id_usuario || !id_cliente) {
        toast.error('Faltan datos para generar la factura');
        setStatus('error');
        localStorage.removeItem('ventana_proceso_abierta');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/stripe/verificar-factura`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            codigo,
            monto_pagado: String(monto_pagado), // asegurar que sea string
            monto_por_cobrar,
            monto_cambio: String(monto_cambio), // asegurar que sea string
            hora,
            created_at,
            id_sucursal,
            id_usuario,
            id_dispensador,
            id_cliente,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.ok) {
          localStorage.setItem('factura_generada', 'true');
          setStatus('success');
          toast.success('✅ Factura generada exitosamente');
        } else {
          setStatus('error');
          toast.error(data?.msg || '❌ Error al registrar factura');
        }
      } catch (error) {
        console.error('Error al registrar factura:', error);
        setStatus('error');
        toast.error('❌ Error de red al registrar factura');
      }
    };

    registrarFactura();

    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('ventana_proceso_abierta');
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-xl font-bold mb-4">Resultado del Pago</h1>
      {status === 'loading' && <p>Verificando pago...</p>}
      {status === 'success' && (
        <div className="text-green-600 font-semibold">
          ✅ ¡Pago exitoso y factura generada!
        </div>
      )}
      {status === 'error' && (
        <div className="text-red-600 font-semibold">
          ❌ Hubo un problema al registrar tu factura.
        </div>
      )}
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => {
          localStorage.removeItem('factura_generada');
          localStorage.removeItem('ventana_proceso_abierta');
          localStorage.removeItem('monto_pagado');
          navigate('/ventas');
        }}
      >
        Volver a ventas
      </button>
    </div>
  );
};

export default Success;
