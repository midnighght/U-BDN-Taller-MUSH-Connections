import Header from '../components/Header';
import PostGrid from '../components/PostGrid';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { user_api } from '../services/user.api';
import { requests_api } from '../services/requests.api';
import { Loader2, User, Users, Camera, Home, Lock, Send, UserCheck, X, Ban, ArrowLeft, Check, UserMinus } from 'lucide-react';


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
      const data = await user_api.getUserProfile(userId, token);
      const fetchedProfile = data.profile ?? data;
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
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!token || !userId || actionLoading) return;
    setActionLoading(true);
    try {
      await requests_api.sendFriendRequest(userId, token);
      alert('Solicitud de amistad enviada');
      await fetchUserProfile();
    } catch (error: any) {
      alert('Error al enviar solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!token || !profile?.relationship.request.requestId || actionLoading) return;
    setActionLoading(true);
    try {
      await requests_api.acceptRequest(profile.relationship.request.requestId, token);
      alert('Solicitud aceptada');
      await fetchUserProfile();
    } catch (error: any) {
      alert('Error al aceptar solicitud');
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
      alert('Error al rechazar solicitud');
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
      alert('Error al eliminar amistad');
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
      alert('Error al cancelar solicitud');
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
      alert('Error al bloquear usuario');
    }
  };

  const renderFriendshipButton = () => {
    if (!profile) return null;
    
    const { friendship, request, isBlockedByMe } = profile.relationship;

    if (isBlockedByMe) {
      return (
        <button className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-gray-500 text-white font-bold cursor-not-allowed shadow-md">
          <Ban className="w-5 h-5 mr-2" /> Usuario bloqueado
        </button>
      );
    }

    if (friendship?.status === 'friends') {
      return (
        <button
          onClick={handleRemoveFriend}
          disabled={actionLoading}
          className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition disabled:opacity-50 shadow-md"
        >
          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserMinus className="w-5 h-5 mr-2" />}
          {actionLoading ? 'Procesando...' : 'Eliminar amistad'}
        </button>
      );
    }

    if (request?.status === 'pending') {
      if (request.isSender) {
        return (
          <button
            onClick={handleCancelRequest}
            disabled={actionLoading}
            className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-gray-500 text-white font-bold hover:bg-gray-600 transition disabled:opacity-50 shadow-md"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5 mr-2" />}
            {actionLoading ? 'Procesando...' : 'Cancelar solicitud'}
          </button>
        );
      } else {
        return (
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleAcceptFriendRequest}
              disabled={actionLoading}
              className="flex items-center justify-center px-4 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition disabled:opacity-50 shadow-md"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
              {actionLoading ? 'Procesando...' : 'Aceptar solicitud'}
            </button>
            <button
              onClick={handleRejectFriendRequest}
              disabled={actionLoading}
              className="flex items-center justify-center px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition disabled:opacity-50 shadow-md"
            >
              <X className="w-5 h-5 mr-2" /> Rechazar
            </button>
          </div>
        );
      }
    }

    if (request?.canSendRequest || friendship?.canSendRequest) {
      return (
        <button
          onClick={handleSendFriendRequest}
          disabled={actionLoading}
          className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-[#F45C1C] text-white font-bold hover:bg-[#c94917] transition disabled:opacity-50 shadow-md transform hover:-translate-y-0.5"
        >
          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5 mr-2" />}
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
        <div className="flex justify-center items-center h-[calc(100vh-4rem)] pt-16">
          <Loader2 className="animate-spin h-12 w-12 text-[#F45C1C]" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#fff8f5]">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <X className="w-12 h-12 mb-4 text-red-500" />
          <p className="text-gray-600 text-lg font-semibold">{error || 'Usuario no encontrado'}</p>
          <button onClick={() => navigate('/home')} className="mt-6 px-6 py-2 bg-[#F45C1C] text-white rounded-xl font-bold hover:bg-[#c94917] transition flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" /> Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const areFriends = profile.relationship?.friendship?.status === 'friends';

  return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col">
      <Header />
      <div className="pt-20 min-h-screen bg-gradient-to-b from-[#FFE5C2] to-[#FFD89C] p-6">
        <div className="max-w-6xl mx-auto flex gap-8">
          
          <aside className="w-80 sticky top-20 h-fit">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-[#f7cda3]">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-[#B24700] shadow-xl flex items-center justify-center mb-4 overflow-hidden border-4 border-[#F45C1C]">
                  {profile?.userPhoto ? (
                    <img src={profile.userPhoto} alt="perfil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>

                <h2 className="text-3xl font-extrabold text-[#B24700] mb-3">@{profile?.username}</h2>

                {profile?.isPrivate && (
                  <div className="px-3 py-1 rounded-full text-sm font-semibold mb-4 bg-gray-100 text-gray-700 flex items-center gap-1">
                    <Lock className="w-4 h-4" /> Perfil privado
                  </div>
                )}

                <div className="flex flex-col gap-3 mb-4 w-full">
                  {renderFriendshipButton()}
                  <button
                    onClick={handleBlockUser}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-gray-600 text-white font-bold hover:bg-gray-700 transition shadow-md"
                  >
                    <Ban className="w-5 h-5 mr-2" /> Bloquear usuario
                  </button>
                </div>

                <div className="w-full bg-[#fff8f5] rounded-xl p-4 mb-4 shadow-inner border border-[#f7cda3]/50">
                  <p className="text-sm text-gray-700 leading-5">{profile?.bio || 'Sin descripción'}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full">
                  <div className="bg-[#fff8f5] rounded-xl p-3 text-center shadow-sm border border-[#f7cda3]/50">
                    <div className="text-sm text-gray-600 font-medium flex items-center justify-center gap-1"><Users className="w-4 h-4" /> Amigos</div>
                    <div className="font-bold text-lg text-[#B24700]">{profile?.stats.friends}</div>
                  </div>
                  <div className="bg-[#fff8f5] rounded-xl p-3 text-center shadow-sm border border-[#f7cda3]/50">
                    <div className="text-sm text-gray-600 font-medium flex items-center justify-center gap-1"><Camera className="w-4 h-4" /> Posts</div>
                    <div className="font-bold text-lg text-[#B24700]">{profile?.stats.posts}</div>
                  </div>
                  <div className="bg-[#fff8f5] rounded-xl p-3 text-center shadow-sm border border-[#f7cda3]/50">
                    <div className="text-sm text-gray-600 font-medium flex items-center justify-center gap-1"><Home className="w-4 h-4" /> Comunidades</div>
                    <div className="font-bold text-lg text-[#B24700]">{profile?.stats.communities}</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Panel derecho */}
          <section className="flex-1">
            {profile?.isPrivate && !areFriends ? (
              <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-[#f7cda3]/50">
                <Lock className="w-12 h-12 mb-4 block mx-auto text-[#B24700]" />
                <h3 className="text-xl font-bold text-[#B24700] mb-3">Perfil privado</h3>
                <p className="text-gray-600 mb-4">
                  Este usuario tiene su perfil privado. Debes ser su amigo para ver sus publicaciones.
                </p>
                {profile.relationship?.request?.status === 'pending' && (
                  <p className="text-[#F45C1C] font-bold mb-4 flex items-center justify-center">
                    <Send className="w-5 h-5 mr-1" />
                    {profile.relationship.request.isSender 
                      ? 'Solicitud de amistad enviada' 
                      : 'Este usuario te envió una solicitud de amistad'}
                  </p>
                )}
                <div className="flex justify-center gap-3">
                  {renderFriendshipButton()}
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-[#f7cda3]/50">
                <Camera className="w-12 h-12 mb-4 block mx-auto text-[#F45C1C]" />
                <h3 className="text-xl font-bold text-[#B24700] mb-3">Sin publicaciones</h3>
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