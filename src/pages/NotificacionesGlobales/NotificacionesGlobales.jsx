import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, X, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { showToast } from "../../utils/toastUtils";
import API_URL from "../../config/config";

const NotificacionesGlobales = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [mostrarPanel, setMostrarPanel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [contadorNoLeidas, setContadorNoLeidas] = useState(0);

    const usuarioId = sessionStorage.getItem("usuarioId");

    const cargarNotificaciones = async () => {
        if (!usuarioId) return;

        setLoading(true);
        try {
            console.log(`📄 Cargando notificaciones para usuario: ${usuarioId}`);

            // Usar el endpoint simple que auto-vincula notificaciones
            const response = await fetch(`${API_URL}/notificaciones/simple/${usuarioId}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Notificaciones cargadas:`, data);

            setNotificaciones(data);

            // Contar las no leídas
            const noLeidas = data.filter(n => !n.visto).length;
            setContadorNoLeidas(noLeidas);

        } catch (error) {
            console.error("❌ Error al cargar notificaciones:", error);
            showToast("error", "Error al cargar notificaciones");
        } finally {
            setLoading(false);
        }
    };

    const vincularNotificacionesExistentes = async () => {
        try {
            setLoading(true);
            console.log("🔗 Vinculando notificaciones existentes...");

            const response = await fetch(`${API_URL}/notificaciones/vincular-existentes`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("✅ Vinculación completada:", data);

            showToast("success", data.message);

            // Recargar notificaciones después de vincular
            await cargarNotificaciones();

        } catch (error) {
            console.error("❌ Error vinculando notificaciones:", error);
            showToast("error", "Error al vincular notificaciones");
        } finally {
            setLoading(false);
        }
    };

    const marcarComoLeida = async (notificacionId) => {
        try {
            const response = await fetch(`${API_URL}/notificaciones/marcar-leida/${notificacionId}`, {
                method: 'PUT'
            });

            if (response.ok) {
                // Actualizar estado local
                setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
                setContadorNoLeidas(prev => Math.max(0, prev - 1));
                showToast("success", "Notificación marcada como leída");
            }
        } catch (error) {
            console.error("Error al marcar como leída:", error);
            showToast("error", "Error al marcar notificación");
        }
    };

    const marcarTodasComoLeidas = async () => {
        try {
            const response = await fetch(`${API_URL}/notificaciones/usuario/${usuarioId}/marcar-todas-leidas`, {
                method: 'PUT'
            });

            if (response.ok) {
                setNotificaciones([]);
                setContadorNoLeidas(0);
                showToast("success", "Todas las notificaciones marcadas como leídas");
            }
        } catch (error) {
            console.error("Error al marcar todas como leídas:", error);
            showToast("error", "Error al marcar las notificaciones");
        }
    };

    const togglePanel = () => {
        if (!mostrarPanel) {
            cargarNotificaciones();
        }
        setMostrarPanel(!mostrarPanel);
    };

    const formatearFecha = (fecha) => {
        const now = new Date();
        const notifDate = new Date(fecha);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;

        return notifDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    const getIconoNotificacion = (titulo) => {
        if (titulo && (titulo.includes('Crítico') || titulo.includes('Stock') || titulo.includes('ALERTA'))) {
            return <AlertTriangle className="w-4 h-4 text-red-400" />;
        }
        return <Bell className="w-4 h-4 text-[#00d1b2]" />;
    };

    // Cargar notificaciones al montar el componente
    useEffect(() => {
        if (usuarioId) {
            cargarNotificaciones();

            // Polling cada 10 segundos
            const interval = setInterval(cargarNotificaciones, 1000*10);
            return () => clearInterval(interval);
        }
    }, [usuarioId]);

    // Componente del panel
    const PanelNotificaciones = () => (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={() => setMostrarPanel(false)}
            />

            <div className="fixed z-50 top-16 left-1/2 -translate-x-1/2 md:top-5 md:left-5 md:translate-x-0 sm:top-0 sm:left-0 bg-[#2a2a2a] border border-[#444] rounded-xl shadow-xl max-h-96 overflow-hidden w-80 sm:w-96">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#444]">
                    <h3 className="font-semibold text-[#00d1b2] flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notificaciones
                        {contadorNoLeidas > 0 && (
                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                {contadorNoLeidas}
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={vincularNotificacionesExistentes}
                            disabled={loading}
                            className="text-xs text-[#00d1b2] hover:text-[#00bfa4] transition flex items-center gap-1"
                            title="Vincular notificaciones existentes"
                        >
                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                            Vincular
                        </button>
                        {contadorNoLeidas > 0 && (
                            <button
                                onClick={marcarTodasComoLeidas}
                                className="text-xs text-[#00d1b2] hover:text-[#00bfa4] transition"
                            >
                                Marcar todas
                            </button>
                        )}
                        <button
                            onClick={() => setMostrarPanel(false)}
                            className="text-gray-400 hover:text-white transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Lista de notificaciones */}
                <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400">
                            Cargando notificaciones...
                        </div>
                    ) : notificaciones.length > 0 ? (
                        notificaciones.map((notificacion) => (
                            <div
                                key={notificacion.id}
                                className={`p-4 border-b border-[#444] hover:bg-[#1f1f1f] transition-colors ${notificacion.titulo && notificacion.titulo.includes('Crítico') ? 'border-l-4 border-red-500' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getIconoNotificacion(notificacion.titulo)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-medium leading-tight ${notificacion.titulo && notificacion.titulo.includes('Crítico') ? 'text-red-400' : 'text-white'
                                                    }`}>
                                                    {notificacion.titulo || 'Notificación'}
                                                </h4>
                                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                                    {notificacion.descripcion || 'Sin descripción'}
                                                </p>
                                                {notificacion.tanque_nombre && (
                                                    <p className="text-xs text-[#00d1b2] mt-1">
                                                        Tanque: {notificacion.tanque_nombre}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs text-gray-500">
                                                    {formatearFecha(notificacion.fecha_notificacion)}
                                                </span>
                                                {!notificacion.visto && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            marcarComoLeida(notificacion.id);
                                                        }}
                                                        className="text-xs text-[#00d1b2] hover:text-[#00bfa4] transition"
                                                        title="Marcar como leída"
                                                    >
                                                        <CheckCircle className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-gray-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No tienes notificaciones</p>
                            <button
                                onClick={vincularNotificacionesExistentes}
                                className="mt-2 text-xs text-[#00d1b2] hover:text-[#00bfa4] transition"
                            >
                                Vincular notificaciones existentes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <div className="relative">
            {/* Botón de notificaciones */}
            <button
                onClick={togglePanel}
                className="relative p-2 text-[#f1f1f1] hover:bg-[#2c9d8c33] rounded-lg transition-all duration-200"
                aria-label="Notificaciones"
            >
                <Bell className="w-6 h-6" />
                {contadorNoLeidas > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {contadorNoLeidas > 99 ? '99+' : contadorNoLeidas}
                    </span>
                )}
            </button>

            {/* Panel renderizado usando portal */}
            {mostrarPanel && createPortal(
                <PanelNotificaciones />,
                document.body
            )}
        </div>
    );
};

export default NotificacionesGlobales;