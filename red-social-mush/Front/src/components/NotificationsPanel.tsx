import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notifications_api } from "../services/notifications.api";
import { requests_api } from "../services/requests.api";
import {
  Bell,
  Check,
  X,
  Loader2,
  Users,
  Heart,
  MessageSquare,
  AtSign,
  Clock,
  MailOpen,
  User as UserIcon,
} from "lucide-react";

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

  const token = localStorage.getItem("auth_token");

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
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const data = await notifications_api.getUnreadCount(token);
      setUnreadCount(data?.unreadCount || 0);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await notifications_api.getUnreadNotifications(token);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (
    e: React.MouseEvent,
    notification: Notification
  ) => {
    e.stopPropagation();
    if (!token || !notification.relatedID || processingId) return;

    setProcessingId(notification._id);
    try {
      await requests_api.acceptRequest(notification.relatedID, token);
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notification._id)
      );
      await fetchUnreadCount();
    } catch (error: any) {
      if (
        error.message?.includes("no encontrada") ||
        error.message?.includes("procesada")
      ) {
        console.log("⚠️ Solicitud ya procesada, eliminando notificación...");
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notification._id)
        );
        try {
          await notifications_api.deleteNotification(notification._id, token);
        } catch (delError) {
          console.error("Error eliminando notificación:", delError);
        }
      } else {
        alert("Error al aceptar");
      }
      await fetchUnreadCount();
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (
    e: React.MouseEvent,
    notification: Notification
  ) => {
    e.stopPropagation();
    if (!token || !notification.relatedID || processingId) return;

    setProcessingId(notification._id);
    try {
      await requests_api.rejectRequest(notification.relatedID, token);
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notification._id)
      );
      await fetchUnreadCount();
    } catch (error: any) {
      if (
        error.message?.includes("no encontrada") ||
        error.message?.includes("procesada")
      ) {
        console.log("Solicitud ya procesada, eliminando notificación...");
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notification._id)
        );
        try {
          await notifications_api.deleteNotification(notification._id, token);
        } catch (delError) {
          console.error("Error eliminando notificación:", delError);
        }
      } else {
        alert("Error al rechazar");
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
        console.error("Error:", error);
      }
    }

    if (
      notification.type === "friend_request" ||
      notification.type === "friend_accept"
    ) {
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
      console.error("Error:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend_request":
        return <Users className="w-5 h-5 text-[#F45C1C]" />;
      case "friend_accept":
        return <Check className="w-5 h-5 text-green-500" />;
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "mention":
        return <AtSign className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000
    );
    if (seconds < 60) return "Ahora";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
          {" "}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#B24700] p-2 rounded-full hover:bg-[#8f3900] transition relative group shadow-md"
        title="Notificaciones"
      >
                <Bell className="w-5 h-5 text-white group-hover:scale-105" />  
          {" "}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ring-2 ring-white shadow-lg">
                        {unreadCount > 9 ? "9+" : unreadCount}        {" "}
          </span>
        )}
            {" "}
      </button>
          {" "}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl z-50 max-h-[600px] flex flex-col border border-[#f7cda3] transform transition-opacity duration-300">
                            {" "}
          <div className="p-4 border-b border-[#f7cda3] flex items-center justify-between bg-[#FFE5C2] rounded-t-2xl">
                      {" "}
            <h3 className="font-bold text-[#B24700] text-lg flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notificaciones
            </h3>
                      {" "}
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-[#F45C1C] hover:text-[#B24700] font-bold flex items-center transition"
              >
                <MailOpen className="w-4 h-4 mr-1" />                Marcar
                todas             {" "}
              </button>
            )}
                    {" "}
          </div>
                  {" "}
          <div className="overflow-y-auto flex-1 divide-y divide-[#f7cda3]/50">
                      {" "}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                              {" "}
                <Loader2 className="animate-spin h-8 w-8 text-[#F45C1C]" />    
                      {" "}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                              {" "}
                <Bell className="w-10 h-10 mx-auto mb-2 text-[#f7cda3]" />    
                        {" "}
                <p className="text-sm">No tienes notificaciones recientes</p>  
                        {" "}
              </div>
            ) : (
              <div>
                              {" "}
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-[#fff8f5] cursor-pointer transition flex items-start space-x-3 ${
                      !notif.isRead
                        ? "bg-[#FFE5C2]/40 border-l-4 border-[#F45C1C]"
                        : "bg-white"
                    }`}
                  >
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-[#F45C1C] rounded-full flex-shrink-0 mt-1"></div>
                    )}
                    <div className="flex-shrink-0 pt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                                        {" "}
                    <div className="flex-1 min-w-0">
                                            {" "}
                      <div className="flex items-start space-x-2">
                                                {" "}
                        <div className="w-8 h-8 rounded-full bg-[#FFD89C] overflow-hidden flex-shrink-0 border border-[#f7cda3]">
                                                    {" "}
                          {notif.sender.userPhoto ? (
                            <img
                              src={notif.sender.userPhoto}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white bg-[#B24700] text-sm font-bold">
                              <UserIcon className="w-4 h-4 text-white" />
                            </div>
                          )}
                                                  {" "}
                        </div>
                                                {" "}
                        <div className="flex-1 min-w-0">
                                                    {" "}
                          <p className="text-sm text-gray-800">
                                                        {" "}
                            <span className="font-bold text-[#B24700]">
                              {notif.sender.username}
                            </span>{" "}
                            {notif.message}                          {" "}
                          </p>
                                                    {" "}
                          <p className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeAgo(notif.createdAt)}
                          </p>
                                                  {" "}
                        </div>
                                              {" "}
                      </div>
                                            {" "}
                      {/* Botones solo para solicitudes de amistad */}        
                                  {" "}
                      {notif.type === "friend_request" && notif.relatedID && (
                        <div className="flex gap-2 mt-3">
                                                    {" "}
                          <button
                            onClick={(e) => handleAccept(e, notif)}
                            disabled={processingId === notif._id}
                            className="px-3 py-1 text-xs bg-[#F45C1C] text-white rounded-full font-semibold hover:bg-[#c94917] disabled:opacity-50 transition flex items-center"
                          >
                                                        {" "}
                            {processingId === notif._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Aceptar"
                            )}
                                                      {" "}
                          </button>
                                                    {" "}
                          <button
                            onClick={(e) => handleReject(e, notif)}
                            disabled={processingId === notif._id}
                            className="px-3 py-1 text-xs bg-gray-300 text-gray-800 rounded-full font-semibold hover:bg-gray-400 disabled:opacity-50 transition flex items-center"
                          >
                                                        {" "}
                            {processingId === notif._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Rechazar"
                            )}
                                                      {" "}
                          </button>
                                                  {" "}
                        </div>
                      )}
                                          {" "}
                    </div>
                                    {" "}
                  </div>
                ))}
                            {" "}
              </div>
            )}
                    {" "}
          </div>
                {" "}
        </div>
      )}
        {" "}
    </div>
  );
};

export default NotificationsPanel;
