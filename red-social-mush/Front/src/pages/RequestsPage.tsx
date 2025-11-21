import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { requests_api } from '../services/requests.api';

interface Request {
  _id: string;
  type: 'friend_request' | 'community_join' | 'community_invite';
  requester: {
    _id: string;
    username: string;
    userPhoto?: string;
  };
  communityID?: string;
  communityName?: string;
  metadata?: {
    message?: string;
  };
  createdAt: string;
}

const RequestsPage = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'friends';
  
  const [friendRequests, setFriendRequests] = useState<Request[]>([]);
  const [communityRequests, setCommunityRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    if (!token) {
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'friends') {
        const data = await requests_api.getFriendRequests(token);
        setFriendRequests(Array.isArray(data) ? data : []);
      } else if (activeTab === 'communities') {
        // TODO: Implementar cuando haya comunidades específicas
        setCommunityRequests([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar solicitudes:', error);
      setFriendRequests([]);
      setCommunityRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string, type: string) => {
    if (!token || processingId) return;

    setProcessingId(requestId);
    console.log('✅ Aceptando solicitud:', requestId);

    try {
      await requests_api.acceptRequest(requestId, token);
      alert('✅ Solicitud aceptada');
      await fetchRequests();
    } catch (error: any) {
      console.error('❌ Error al aceptar:', error);
      alert(`Error: ${error.message || 'No se pudo aceptar'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!token || processingId) return;
    if (!confirm('¿Seguro que deseas rechazar esta solicitud?')) return;

    setProcessingId(requestId);
    console.log('❌ Rechazando solicitud:', requestId);

    try {
      await requests_api.rejectRequest(requestId, token);
      alert('Solicitud rechazada');
      await fetchRequests();
    } catch (error: any) {
      console.error('❌ Error al rechazar:', error);
      alert(`Error: ${error.message || 'No se pudo rechazar'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
    return date.toLocaleDateString();
  };

  const renderRequest = (request: Request) => {
    const isFriendRequest = request.type === 'friend_request';

    return (
      <div
        key={request._id}
        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
      >
        <div className="flex items-center space-x-4 flex-1">
          {/* Avatar */}
          <div
            onClick={() => navigate(`/users/${request.requester._id}`)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-yellow-400 overflow-hidden cursor-pointer hover:scale-105 transition"
          >
            {request.requester.userPhoto ? (
              <img
                src={request.requester.userPhoto}
                alt={request.requester.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl">
                👤
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3
              onClick={() => navigate(`/users/${request.requester._id}`)}
              className="font-bold text-gray-800 text-lg cursor-pointer hover:text-orange-600"
            >
              {request.requester.username}
            </h3>
            
            {isFriendRequest ? (
              <p className="text-sm text-gray-500">
                Quiere ser tu amigo
              </p>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  Quiere unirse a <span className="font-semibold">{request.communityName}</span>
                </p>
                {request.metadata?.message && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    "{request.metadata.message}"
                  </p>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-1">
              {getTimeAgo(request.createdAt)}
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleAccept(request._id, request.type)}
            disabled={processingId === request._id}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {processingId === request._id ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>✓ Aceptar</>
            )}
          </button>

          <button
            onClick={() => handleReject(request._id)}
            disabled={processingId === request._id}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✕ Rechazar
          </button>
        </div>
      </div>
    );
  };

  const currentRequests = activeTab === 'friends' ? friendRequests : communityRequests;

  return (
    <div className="min-h-screen bg-[#fff8f5]">
      <Header />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-orange-600 hover:text-orange-700 flex items-center gap-2"
          >
            ← Volver
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => navigate('/requests?tab=friends')}
              className={`flex-1 py-4 text-center font-semibold transition ${
                activeTab === 'friends'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👋 Amistades
              {friendRequests.length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                  {friendRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/requests?tab=communities')}
              className={`flex-1 py-4 text-center font-semibold transition ${
                activeTab === 'communities'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🏠 Comunidades
              {communityRequests.length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                  {communityRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : currentRequests.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">
                  {activeTab === 'friends' ? '👋' : '🏠'}
                </span>
                <p className="text-gray-600 text-lg">
                  {activeTab === 'friends' 
                    ? 'No tienes solicitudes de amistad pendientes'
                    : 'No tienes solicitudes de comunidades pendientes'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentRequests.map(renderRequest)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;