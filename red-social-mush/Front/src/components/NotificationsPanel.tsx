import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications_api } from '../services/notifications.api';
import { requests_api } from '../services/requests.api';

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
  const [processingId, setProcessingId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    if (!token) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const data = await notifications_api.getUnreadCount(token);
      setUnreadCount(data?.unreadCount || 0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await notifications_api.getUnreadNotifications(token);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Aceptar solicitud directamente desde la notificación
  const handleAccept = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    if (!token || !notification.relatedID || processingId) return;

    setProcessingId(notification._id);
    try {
      await requests_api.acceptRequest(notification.relatedID, token);
      
      // Eliminar la notificación de la lista inmediatamente (optimistic update)
      setNotifications(prev => prev.filter(n => n._id !== notification._id));
      
      // Actualizar contador
      await fetchUnreadCount();
    } catch (error: any) {
      // Si la solicitud ya fue procesada, simplemente eliminar la notificación
      if (error.message?.includes('no encontrada') || error.message?.includes('procesada')) {
        console.log('⚠️ Solicitud ya procesada, eliminando notificación...');
        setNotifications(prev => prev.filter(n => n._id !== notification._id));
        
        // Intentar eliminar la notificación del servidor
        try {
          await notifications_api.deleteNotification(notification._id, token);
        } catch (delError) {
          console.error('Error eliminando notificación:', delError);
        }
      } else {
        alert(error.message || 'Error al aceptar');
      }
      
      await fetchUnreadCount();
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ Rechazar solicitud directamente desde la notificación
  const handleReject = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    if (!token || !notification.relatedID || processingId) return;

    setProcessingId(notification._id);
    try {
      await requests_api.rejectRequest(notification.relatedID, token);
      
      // Eliminar la notificación de la lista inmediatamente (optimistic update)
      setNotifications(prev => prev.filter(n => n._id !== notification._id));
      
      // Actualizar contador
      await fetchUnreadCount();
    } catch (error: any) {
      // Si la solicitud ya fue procesada, simplemente eliminar la notificación
      if (error.message?.includes('no encontrada') || error.message?.includes('procesada')) {
        console.log('⚠️ Solicitud ya procesada, eliminando notificación...');
        setNotifications(prev => prev.filter(n => n._id !== notification._id));
        
        // Intentar eliminar la notificación del servidor
        try {
          await notifications_api.deleteNotification(notification._id, token);
        } catch (delError) {
          console.error('Error eliminando notificación:', delError);
        }
      } else {
        alert(error.message || 'Error al rechazar');
      }
      
      await fetchUnreadCount();
    } finally {
      setProcessingId(null);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!token) return;

    if (!notification.isRead) {
      try {
        await notifications_api.markAsRead(notification._id, token);
        fetchUnreadCount();
        fetchNotifications();
      } catch (error) {
        console.error('Error:', error);
      }
    }

    if (notification.type === 'friend_request' || notification.type === 'friend_accept') {
      navigate(`/users/${notification.sender._id}`);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      await notifications_api.markAllAsRead(token);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      friend_request: '👋',
      friend_accept: '🤝',
      like: '❤️',
      comment: '💬',
      mention: '📢'
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
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

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">Notificaciones</h3>
            {notifications.length > 0 && (
              <button onClick={handleMarkAllAsRead} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl block mb-2">🔔</span>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition ${!notif.isRead ? 'bg-orange-50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-yellow-400 overflow-hidden flex-shrink-0">
                        {notif.sender.userPhoto ? (
                          <img src={notif.sender.userPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white">👤</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold">{notif.sender.username}</span> {notif.message}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">{getTimeAgo(notif.createdAt)}</p>

                        {/* ✅ Botones solo para solicitudes de amistad */}
                        {notif.type === 'friend_request' && notif.relatedID && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={(e) => handleAccept(e, notif)}
                              disabled={processingId === notif._id}
                              className="px-3 py-1 text-xs bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 transition"
                            >
                              {processingId === notif._id ? '...' : '✓ Aceptar'}
                            </button>
                            <button
                              onClick={(e) => handleReject(e, notif)}
                              disabled={processingId === notif._id}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition"
                            >
                              {processingId === notif._id ? '...' : '✕ Rechazar'}
                            </button>
                          </div>
                        )}
                      </div>

                      {!notif.isRead && <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => { navigate('/requests?tab=friends'); setIsOpen(false); }}
              className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Ver todas las solicitudes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;