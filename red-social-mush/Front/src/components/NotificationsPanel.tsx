import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications_api } from '../services/notifications.api';

interface Notification {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    _id: string;
    username: string;
    userPhoto?: string;
  };
  relatedID?: string;
}

const NotificationsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    if (!token) {
      console.warn('❌ No hay token de autenticación');
      return;
    }
    
    console.log('🔄 Iniciando carga de notificaciones...');
    fetchUnreadCount();
    
    // Polling cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Polling de notificaciones...');
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      console.log('📂 Panel abierto - Cargando notificaciones...');
      fetchNotifications();
    }
  }, [isOpen]);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    if (!token) return;
    
    try {
      console.log('📊 Obteniendo contador de no leídas...');
      const data = await notifications_api.getUnreadCount(token);
      console.log('✅ Contador recibido:', data);
      
      if (data && typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
        setError(null);
      } else {
        console.warn('⚠️ Respuesta inesperada:', data);
        setUnreadCount(0);
      }
    } catch (error: any) {
      console.error('❌ Error al obtener contador:', error);
      setError(error.message || 'Error al cargar notificaciones');
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      console.log('📥 Obteniendo notificaciones no leídas...');
      const data = await notifications_api.getUnreadNotifications(token);
      console.log('✅ Notificaciones recibidas:', data);
      
      if (Array.isArray(data)) {
        setNotifications(data);
        setError(null);
      } else {
        console.warn('⚠️ Respuesta no es un array:', data);
        setNotifications([]);
      }
    } catch (error: any) {
      console.error('❌ Error al obtener notificaciones:', error);
      setError(error.message || 'Error al cargar notificaciones');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!token) return;

    console.log('👆 Click en notificación:', notification);

    // Marcar como leída
    if (!notification.isRead) {
      try {
        await notifications_api.markAsRead(notification._id, token);
        fetchUnreadCount();
        fetchNotifications(); // Recargar lista
      } catch (error) {
        console.error('❌ Error al marcar como leída:', error);
      }
    }

    // Navegar según el tipo
    if (notification.type === 'friend_request') {
      console.log('→ Navegando a solicitudes de amistad');
      navigate('/requests?tab=friends'); // Cambiar /friend-requests
    } else if (notification.type === 'friend_accept') {
      console.log('→ Navegando a perfil:', notification.sender._id);
      navigate(`/users/${notification.sender._id}`);
    } else if (notification.type === 'like' || notification.type === 'comment') {
      if (notification.relatedID) {
        console.log('→ Post relacionado:', notification.relatedID);
        // TODO: Implementar navegación a post
      }
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    
    try {
      console.log('📝 Marcando todas como leídas...');
      await notifications_api.markAllAsRead(token);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return '👋';
      case 'friend_accept':
        return '🤝';
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'mention':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  // 🔴 Debug: Mostrar estado en consola cuando cambia
  useEffect(() => {
    console.log('📌 Estado actual:', {
      isOpen,
      unreadCount,
      notificationsCount: notifications.length,
      loading,
      error,
      hasToken: !!token
    });
  }, [isOpen, unreadCount, notifications.length, loading, error, token]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => {
          console.log('🔔 Toggle panel');
          setIsOpen(!isOpen);
        }}
        className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition relative"
        title="Notificaciones"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">Notificaciones</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-600">⚠️ {error}</p>
            </div>
          )}

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl block mb-2">🔔</span>
                <p>No tienes notificaciones</p>
                {unreadCount > 0 && (
                  <p className="text-xs mt-2">
                    (Contador: {unreadCount} - intenta recargar)
                  </p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                      !notif.isRead ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar del sender */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-yellow-400 overflow-hidden flex-shrink-0">
                        {notif.sender.userPhoto ? (
                          <img
                            src={notif.sender.userPhoto}
                            alt={notif.sender.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white">
                            👤
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold">{notif.sender.username}</span>{' '}
                            {notif.message}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">{getTimeAgo(notif.createdAt)}</p>
                      </div>

                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-3 border-t border-gray-200">
              <p className="w-full text-center text-xs text-gray-500">
                Mostrando las últimas notificaciones no leídas
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;