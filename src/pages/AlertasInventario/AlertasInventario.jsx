import { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, CheckCircle, BarChart3, Filter } from "lucide-react";
import API_URL from "../../config/config";
import { showToast } from "../../utils/toastUtils";
import { mostrarConfirmacion, mostrarExito } from "../../utils/alertUtils";

const AlertasInventario = () => {
  const [alertas, setAlertas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_alertas: 0,
    alertas_criticas: 0,
    alertas_bajas: 0,
    alertas_hoy: 0,
    alertas_semana: 0,
    promedio_stock_porcentaje: 0
  });
  const [tanquesCriticos, setTanquesCriticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    nivel: '',
    fecha_desde: '',
    fecha_hasta: '',
    sucursal_id: ''
  });
  const [permisos, setPermisos] = useState([]);
  
  const usuarioId = sessionStorage.getItem("usuarioId");
  const sucursalId = sessionStorage.getItem("sucursalId");

  useEffect(() => {
    cargarDatos();
    // Verificar permisos
    if (usuarioId) {
      fetch(`${API_URL}/usuarios/permisos/${usuarioId}`)
        .then((res) => res.json())
        .then((data) => setPermisos(data.permisos.map((p) => p.nombre)))
        .catch((err) => console.error("Error al cargar permisos:", err));
    }
  }, [filtros]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construir query params para filtros
      const params = new URLSearchParams();
      if (sucursalId) params.append('sucursal_id', sucursalId);
      if (filtros.nivel) params.append('nivel', filtros.nivel);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

      // Cargar alertas
      const alertasRes = await fetch(`${API_URL}/alertas?${params}`);
      if (!alertasRes.ok) {
        throw new Error(`Error ${alertasRes.status}: ${alertasRes.statusText}`);
      }
      const alertasData = await alertasRes.json();
      setAlertas(Array.isArray(alertasData) ? alertasData : []);

      // Cargar estadísticas
      const statsParams = new URLSearchParams();
      if (sucursalId) statsParams.append('sucursal_id', sucursalId);
      
      const statsRes = await fetch(`${API_URL}/alertas/estadisticas?${statsParams}`);
      if (!statsRes.ok) {
        throw new Error(`Error ${statsRes.status}: ${statsRes.statusText}`);
      }
      const statsData = await statsRes.json();
      
      setEstadisticas(statsData.estadisticas || {
        total_alertas: 0,
        alertas_criticas: 0,
        alertas_bajas: 0,
        alertas_hoy: 0,
        alertas_semana: 0,
        promedio_stock_porcentaje: 0
      });
      setTanquesCriticos(Array.isArray(statsData.tanques_criticos) ? statsData.tanques_criticos : []);

    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError(error.message);
      showToast("error", `Error al cargar alertas: ${error.message}`);
      
      // Establecer valores por defecto en caso de error
      setAlertas([]);
      setEstadisticas({
        total_alertas: 0,
        alertas_criticas: 0,
        alertas_bajas: 0,
        alertas_hoy: 0,
        alertas_semana: 0,
        promedio_stock_porcentaje: 0
      });
      setTanquesCriticos([]);
    } finally {
      setLoading(false);
    }
  };

  const verificarStocksManual = async () => {
    try {
      const response = await fetch(`${API_URL}/alertas/verificar-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId })
      });
      
      const data = await response.json();
      showToast("success", `Verificación completada. ${data.tanques_criticos} tanques críticos encontrados.`);
      
      // Registrar en bitácora
      fetch(`${API_URL}/bitacora/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          acciones: "verificación manual de stocks",
          estado: "exitoso",
        }),
      });
      
      cargarDatos();
    } catch (error) {
      console.error("Error en verificación manual:", error);
      showToast("error", "Error al verificar stocks");
    }
  };

  const resolverAlerta = async (alertaId) => {
    const result = await mostrarConfirmacion({
      titulo: "¿Resolver alerta?",
      texto: "Esto eliminará la alerta del sistema. ¿Está seguro?",
      confirmText: "Sí, resolver",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_URL}/alertas/resolver/${alertaId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId })
      });

      await mostrarExito("Alerta resuelta correctamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al resolver alerta:", error);
      showToast("error", "Error al resolver la alerta");
    }
  };

  const getNivelAlertaColor = (nivel) => {
    switch (nivel) {
      case 'CRÍTICO': return 'text-red-400 bg-red-900/20';
      case 'BAJO': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-green-400 bg-green-900/20';
    }
  };

  const getNivelAlertaIcon = (nivel) => {
    switch (nivel) {
      case 'CRÍTICO': return '🔴';
      case 'BAJO': return '🟡';
      default: return '🟢';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#00d1b2]">Cargando alertas de inventario...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-[#f1f1f1]">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error al cargar alertas</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={cargarDatos}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-[#f1f1f1]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-[1.8rem] text-[#00d1b2] font-bold flex items-center gap-2">
          <AlertTriangle className="w-8 h-8" />
          Gestión de Alertas de Inventario
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={verificarStocksManual}
            className="bg-[#00d1b2] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#00bfa4] transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Verificar Stocks
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#444]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Alertas</p>
              <p className="text-2xl font-bold text-white">{estadisticas.total_alertas || 0}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-[#00d1b2]" />
          </div>
        </div>
        
        <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#444]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Críticas</p>
              <p className="text-2xl font-bold text-red-400">{estadisticas.alertas_criticas || 0}</p>
            </div>
            <div className="text-2xl">🔴</div>
          </div>
        </div>
        
        <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#444]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-400">{estadisticas.alertas_bajas || 0}</p>
            </div>
            <div className="text-2xl">🟡</div>
          </div>
        </div>
        
        <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#444]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Hoy</p>
              <p className="text-2xl font-bold text-[#00d1b2]">{estadisticas.alertas_hoy || 0}</p>
            </div>
            <div className="text-2xl">📅</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#444] mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[#00d1b2]" />
          <h3 className="font-semibold text-[#00d1b2]">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filtros.nivel}
            onChange={(e) => setFiltros({...filtros, nivel: e.target.value})}
            className="bg-[#1f1f1f] border border-[#444] text-white px-3 py-2 rounded"
          >
            <option value="">Todos los niveles</option>
            <option value="CRÍTICO">Crítico</option>
            <option value="BAJO">Bajo</option>
            <option value="NORMAL">Normal</option>
          </select>
          
          <input
            type="date"
            value={filtros.fecha_desde}
            onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
            className="bg-[#1f1f1f] border border-[#444] text-white px-3 py-2 rounded"
            placeholder="Fecha desde"
          />
          
          <input
            type="date"
            value={filtros.fecha_hasta}
            onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
            className="bg-[#1f1f1f] border border-[#444] text-white px-3 py-2 rounded"
            placeholder="Fecha hasta"
          />
          
          <button
            onClick={() => setFiltros({nivel: '', fecha_desde: '', fecha_hasta: '', sucursal_id: ''})}
            className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-500 transition"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="bg-[#2a2a2a] rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead className="bg-[#1c1c1c]">
              <tr>
                <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                  Nivel
                </th>
                <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                  Tanque
                </th>
                <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                  Stock Actual
                </th>
                <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                  Porcentaje
                </th>
                <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                  Sucursal
                </th>
                <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                  Fecha
                </th>
                <th className="text-left text-[#00d1b2] font-semibold px-4 py-3 border-b border-[#444]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {alertas.length > 0 ? (
                alertas.map((alerta) => (
                  <tr key={alerta.id} className="hover:bg-[#1f1f1f] transition">
                    <td className="px-4 py-3 border-b border-[#444]">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getNivelAlertaColor(alerta.nivel_alerta)}`}>
                        {getNivelAlertaIcon(alerta.nivel_alerta)} {alerta.nivel_alerta}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-[#444] font-medium">
                      {alerta.tanque_nombre}
                    </td>
                    <td className="px-4 py-3 border-b border-[#444]">
                      {alerta.stock_actual}m³ / {alerta.capacidad_max}m³
                    </td>
                    <td className="px-4 py-3 border-b border-[#444]">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              alerta.porcentaje_stock < 10 ? 'bg-red-500' :
                              alerta.porcentaje_stock < 20 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.max(alerta.porcentaje_stock, 2)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{alerta.porcentaje_stock}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-[#444]">
                      {alerta.sucursal_nombre}
                    </td>
                    <td className="px-4 py-3 border-b border-[#444] text-sm">
                      {formatFecha(alerta.fecha)}
                    </td>
                    <td className="px-4 py-3 border-b border-[#444]">
                      <button
                        onClick={() => resolverAlerta(alerta.id)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-green-700 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                    {filtros.nivel || filtros.fecha_desde ? 
                      "No se encontraron alertas con los filtros aplicados" : 
                      "🎉 No hay alertas de inventario activas"
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tanques más críticos */}
      {tanquesCriticos.length > 0 && (
        <div className="mt-6 bg-[#2a2a2a] rounded-xl p-6 border border-[#444]">
          <h3 className="text-lg font-semibold text-[#00d1b2] mb-4">Tanques con Stock Más Bajo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tanquesCriticos.map((tanque, index) => (
              <div key={index} className="bg-[#1f1f1f] p-4 rounded-lg border border-[#444]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{tanque.tanque_nombre}</h4>
                  <span className={`text-sm px-2 py-1 rounded ${
                    tanque.porcentaje_stock < 10 ? 'bg-red-900 text-red-400' :
                    tanque.porcentaje_stock < 20 ? 'bg-yellow-900 text-yellow-400' : 'bg-green-900 text-green-400'
                  }`}>
                    {tanque.porcentaje_stock}%
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{tanque.sucursal_nombre}</p>
                <div className="text-sm">
                  <span className="text-gray-300">{tanque.stock}m³</span>
                  <span className="text-gray-500"> / {tanque.capacidad_max}m³</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasInventario;