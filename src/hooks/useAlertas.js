// hooks/useAlertas.js
import { useState, useEffect, useCallback } from 'react';
import API_URL from '../config/config';

export const useAlertas = (usuarioId) => {
  const [alertasPendientes, setAlertasPendientes] = useState([]);
  const [contadorNoLeidas, setContadorNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar contador de notificaciones no leídas
  const cargarContador = useCallback(async () => {
    if (!usuarioId) return;
    
    try {
      const response = await fetch(`${API_URL}/notificaciones/usuario/${usuarioId}/count`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setContadorNoLeidas(data.count || 0);
    } catch (error) {
      console.error('Error al cargar contador de alertas:', error);
      setContadorNoLeidas(0);
    }
  }, [usuarioId]);

  // Cargar alertas pendientes del usuario
  const cargarAlertasPendientes = useCallback(async () => {
    if (!usuarioId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/alertas/usuario/${usuarioId}/pendientes`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setAlertasPendientes(Array.isArray(data.alertas_pendientes) ? data.alertas_pendientes : []);
    } catch (error) {
      console.error('Error al cargar alertas pendientes:', error);
      setAlertasPendientes([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  // Marcar alerta como leída
  const marcarComoLeida = useCallback(async (notificacionId) => {
    try {
      const response = await fetch(`${API_URL}/notificaciones/marcar-leida/${notificacionId}`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Actualizar estado local
      setAlertasPendientes(prev => prev.filter(a => a.id !== notificacionId));
      setContadorNoLeidas(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error al marcar alerta como leída:', error);
      return false;
    }
  }, []);

  // Verificar stocks manualmente
  const verificarStocks = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/alertas/verificar-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Recargar contador después de la verificación
      await cargarContador();
      
      return data;
    } catch (error) {
      console.error('Error al verificar stocks:', error);
      throw error;
    }
  }, [usuarioId, cargarContador]);

  // Efecto para cargar datos iniciales y configurar polling
  useEffect(() => {
    if (usuarioId) {
      cargarContador();
      cargarAlertasPendientes();

      // Polling cada 60 segundos para verificar nuevas alertas
      const interval = setInterval(() => {
        cargarContador();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [usuarioId, cargarContador, cargarAlertasPendientes]);

  return {
    alertasPendientes,
    contadorNoLeidas,
    loading,
    cargarContador,
    cargarAlertasPendientes,
    marcarComoLeida,
    verificarStocks
  };
};

// Hook específico para detectar nuevas alertas críticas
export const useAlertasCriticas = (usuarioId) => {
  const [alertasCriticas, setAlertasCriticas] = useState([]);
  const [hayNuevasAlertas, setHayNuevasAlertas] = useState(false);

  useEffect(() => {
    if (!usuarioId) return;

    const verificarAlertasCriticas = async () => {
      try {
        const sucursalId = sessionStorage.getItem('sucursalId');
        const params = new URLSearchParams();
        params.append('nivel', 'CRÍTICO');
        if (sucursalId) params.append('sucursal_id', sucursalId);
        
        const response = await fetch(`${API_URL}/alertas?${params}`);
        
        if (!response.ok) {
          console.error('Error al obtener alertas críticas:', response.status, response.statusText);
          return;
        }
        
        const data = await response.json();
        
        // Verificar que data es un array
        const alertasCriticasActuales = Array.isArray(data) ? 
          data.filter(alerta => alerta.nivel_alerta === 'CRÍTICO' && alerta.porcentaje_stock < 10) : [];

        // Detectar si hay nuevas alertas críticas
        if (alertasCriticasActuales.length > alertasCriticas.length) {
          setHayNuevasAlertas(true);
          
          // Mostrar notificación del sistema si es compatible
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🚨 Alerta Crítica de Inventario', {
              body: `Se detectaron ${alertasCriticasActuales.length} tanques con stock crítico`,
              icon: '/favicon.ico',
              tag: 'alerta-critica'
            });
          }
        }

        setAlertasCriticas(alertasCriticasActuales);
      } catch (error) {
        console.error('Error al verificar alertas críticas:', error);
        setAlertasCriticas([]);
      }
    };

    // Verificar alertas críticas cada 2 minutos
    const interval = setInterval(verificarAlertasCriticas, 120000);
    verificarAlertasCriticas(); // Verificación inicial

    return () => clearInterval(interval);
  }, [usuarioId, alertasCriticas.length]);

  const dismissNuevasAlertas = () => {
    setHayNuevasAlertas(false);
  };

  return {
    alertasCriticas,
    hayNuevasAlertas,
    dismissNuevasAlertas
  };
};