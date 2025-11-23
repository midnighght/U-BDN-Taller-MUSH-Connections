import Header from '../components/Header';
import PostGrid from '../components/PostGrid';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { user_api } from '../services/user.api';
import { requests_api } from '../services/requests.api';

interface Post {
  _id: string;
  mediaURL: string;
  textBody: string;
  hashtags: string[];
  createdAt?: string;
}

interface UserProfile {
  _id: string;
  username: string;
  userPhoto?: string;
  bio?: string;
  isPrivate?: boolean;
  stats: { friends: number; posts: number; communities: number };
  relationship: {
    friendship: { status: string; canSendRequest: boolean };
    request: { status: string; canSendRequest: boolean; isSender?: boolean; requestId?: string };
    isBlockedByMe: boolean;
  };
}

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    if (userId === currentUser?.id) {
      navigate('/profile');
      return;
    }
    fetchUserProfile();
  }, [userId, currentUser, navigate]);

  const fetchUserProfile = async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      console.log('🔄 Fetching profile for userId:', userId);
      const data = await user_api.getUserProfile(userId, token);
      console.log('📦 Data recibida completa:', data);
      const fetchedProfile = data.profile ?? data;
      console.log('🔍 Profile después de fetch:', fetchedProfile);
      console.log('🔍 Request status:', fetchedProfile.relationship?.request);
      console.log('🔍 Friendship status:', fetchedProfile.relationship?.friendship);
      setProfile(fetchedProfile);

      const isFriend = fetchedProfile.relationship?.friendship?.status === 'friends';
      const isPrivate = !!fetchedProfile.isPrivate;

      if (!isPrivate || isFriend) {
        const postsFromProfile = data.posts ?? [];
        setPosts(postsFromProfile.map((post: Post) => ({
          ...post,
          author: { _id: fetchedProfile._id, username: fetchedProfile.username, userPhoto: fetchedProfile.userPhoto }
        })));
      } else {
        setPosts([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!token || !userId || actionLoading) return;
    setActionLoading(true);
    try {
      await requests_api.sendFriendRequest(userId, token);
      alert('Solicitud de amistad enviada ✅');
      await fetchUserProfile();
    } catch (error: any) {
      alert(error.message || 'Error al enviar solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!token || !profile?.relationship.request.requestId || actionLoading) return;
    setActionLoading(true);
    try {
      await requests_api.acceptRequest(profile.relationship.request.requestId, token);
      alert('Solicitud aceptada ✅');
      await fetchUserProfile();
    } catch (error: any) {
      alert(error.message || 'Error al aceptar solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectFriendRequest = async () => {
    if (!token || !profile?.relationship.request.requestId || actionLoading) return;
    setActionLoading(true);
    try {
      await requests_api.rejectRequest(profile.relationship.request.requestId, token);
      alert('Solicitud rechazada');
      await fetchUserProfile();
    } catch (error: any) {
      alert(error.message || 'Error al rechazar solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!token || !userId || actionLoading) return;
    if (!confirm('¿Seguro que deseas eliminar esta amistad?')) return;
    setActionLoading(true);
    try {
      await user_api.removeFriend(userId, token);
      alert('Amistad eliminada');
      await fetchUserProfile();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar amistad');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!token || !profile?.relationship.request.requestId || actionLoading) return;
    setActionLoading(true);
    try {
      await requests_api.cancelRequest(profile.relationship.request.requestId, token);
      alert('Solicitud cancelada');
      await fetchUserProfile();
    } catch (error: any) {
      alert(error.message || 'Error al cancelar solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!token || !userId) return;
    if (!confirm('¿Seguro que deseas bloquear a este usuario?')) return;
    try {
      await user_api.blockUser(userId, token);
      alert('Usuario bloqueado');
      navigate('/home');
    } catch (error: any) {
      alert(error.message || 'Error al bloquear usuario');
    }
  };

  const renderFriendshipButton = () => {
    if (!profile) return null;
    
    const { friendship, request, isBlockedByMe } = profile.relationship;

    if (isBlockedByMe) {
      return (
        <button className="px-4 py-2 rounded-lg bg-gray-400 text-white cursor-not-allowed">
          Usuario bloqueado
        </button>
      );
    }

    // Ya son amigos
    if (friendship?.status === 'friends') {
      return (
        <button
          onClick={handleRemoveFriend}
          disabled={actionLoading}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
        >
          {actionLoading ? 'Procesando...' : 'Eliminar amistad'}
        </button>
      );
    }

    // Hay solicitud pendiente
    if (request?.status === 'pending') {
      if (request.isSender) {
        // Yo envié la solicitud - permitir cancelar
        return (
          <button
            onClick={handleCancelRequest}
            disabled={actionLoading}
            className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition disabled:opacity-50"
          >
            {actionLoading ? 'Procesando...' : '✕ Cancelar solicitud'}
          </button>
        );
      } else {
        // Me enviaron solicitud - mostrar aceptar/rechazar
        return (
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleAcceptFriendRequest}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50"
            >
              {actionLoading ? 'Procesando...' : '✓ Aceptar solicitud'}
            </button>
            <button
              onClick={handleRejectFriendRequest}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
            >
              ✕ Rechazar
            </button>
          </div>
        );
      }
    }

    // No hay relación - mostrar enviar solicitud
    if (request?.canSendRequest || friendship?.canSendRequest) {
      return (
        <button
          onClick={handleSendFriendRequest}
          disabled={actionLoading}
          className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50"
        >
          {actionLoading ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f5]">
        <Header />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#fff8f5]">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <span className="text-6xl mb-4">😕</span>
          <p className="text-gray-600 text-lg">{error || 'Usuario no encontrado'}</p>
          <button onClick={() => navigate('/home')} className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const areFriends = profile.relationship?.friendship?.status === 'friends';

  return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col">
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-orange-100 to-yellow-100 p-6">
        <div className="max-w-6xl mx-auto flex gap-8">
          
          {/* Panel izquierdo */}
          <aside className="w-80 bg-transparent">
            <div className="bg-orange-200 rounded-2xl p-6 shadow-inner">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-white/60 shadow-md flex items-center justify-center mb-4 overflow-hidden">
                  {profile?.userPhoto ? (
                    <img src={profile.userPhoto} alt="perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-orange-600">👤</span>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold text-orange-700 mb-3">{profile?.username}</h2>

                {profile?.isPrivate && (
                  <div className="px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-gray-100 text-gray-700">
                    🔒 Perfil privado
                  </div>
                )}

                <div className="flex flex-col gap-2 mb-4 w-full">
                  {renderFriendshipButton()}
                  <button
                    onClick={handleBlockUser}
                    className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
                  >
                    Bloquear usuario
                  </button>
                </div>

                <div className="w-full bg-white rounded-lg p-4 mb-4 shadow">
                  <p className="text-sm text-gray-600 leading-5">{profile?.bio || 'Sin descripción'}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full">
                  <div className="bg-white rounded-lg p-3 text-center shadow">
                    <div className="text-sm text-gray-500">Amigos</div>
                    <div className="font-bold text-lg">{profile?.stats.friends}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow">
                    <div className="text-sm text-gray-500">Posts</div>
                    <div className="font-bold text-lg">{profile?.stats.posts}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow">
                    <div className="text-sm text-gray-500">Comunidades</div>
                    <div className="font-bold text-lg">{profile?.stats.communities}</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Panel derecho */}
          <section className="flex-1">
            {profile?.isPrivate && !areFriends ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <span className="text-6xl mb-4 block">🔒</span>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Perfil privado</h3>
                <p className="text-gray-600 mb-4">
                  Este usuario tiene su perfil privado. Debes ser su amigo para ver sus publicaciones.
                </p>
                {profile.relationship?.request?.status === 'pending' && (
                  <p className="text-orange-600 font-semibold mb-4">
                    {profile.relationship.request.isSender 
                      ? 'Solicitud de amistad enviada ⏳' 
                      : 'Este usuario te envió una solicitud de amistad'}
                  </p>
                )}
                <div className="flex justify-center gap-3">
                  {renderFriendshipButton()}
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <span className="text-6xl mb-4 block">📭</span>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Sin publicaciones</h3>
                <p className="text-gray-600">Este usuario aún no ha compartido nada</p>
              </div>
            ) : (
              <PostGrid posts={posts} cols={2} showAuthor={false} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;