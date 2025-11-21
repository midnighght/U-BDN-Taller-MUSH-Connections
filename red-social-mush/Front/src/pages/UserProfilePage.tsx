import Header from '../components/Header';
import PostGrid from '../components/PostGrid';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { user_api } from '../services/user.api';

interface Post {
  _id: string;
  mediaURL: string;
  textBody: string;
  hashtags: string[];
  createdAt?: string;
  authorID?: any;
}

interface UserProfile {
  _id: string;
  username: string;
  userPhoto?: string;
  bio?: string;
  isPrivate?: boolean; // ✅ Asegurarse que exista
  stats: {
    friends: number;
    posts: number;
    communities: number;
  };
  relationship: {
    friendship: {
      status: string;
      canSendRequest: boolean;
      isSender?: boolean;
      friendshipId?: string;
    };
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
      // backend puede devolver { profile, posts } o solo profile
      const fetchedProfile = data.profile ?? data;
      setProfile(fetchedProfile);

      // Decide si podemos ver posts:
      const isFriend = fetchedProfile.relationship?.friendship?.status === 'friends';
      const isPrivate = !!fetchedProfile.private;

      if (!isPrivate || isFriend) {
        // intentar usar posts devueltos o pedirlos explícitamente
        const postsFromProfile = data.posts ?? null;
        if (Array.isArray(postsFromProfile)) {
          setPosts(postsFromProfile.map((post: Post) => ({
            ...post,
            author: {
              _id: fetchedProfile._id,
              username: fetchedProfile.username,
              userPhoto: fetchedProfile.userPhoto
            }
          })));
        } else {
          // pedir posts por separado
          try {
            const postsData = await user_api.getUserPosts(userId, token);
            setPosts((postsData || []).map((post: Post) => ({
              ...post,
              author: {
                _id: fetchedProfile._id,
                username: fetchedProfile.username,
                userPhoto: fetchedProfile.userPhoto
              }
            })));
          } catch (err) {
            // si backend devuelve 403 por privacidad u otro error, dejamos posts vacíos
            console.warn('No se pudieron cargar posts (posible privacidad):', err);
            setPosts([]);
          }
        }
      } else {
        // perfil privado y no amigo: no mostrar posts
        setPosts([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!token || !userId) return;
    try {
      await user_api.sendFriendRequest(userId, token);
      alert('Solicitud de amistad enviada ✅');
      fetchUserProfile();
    } catch (error) {
      alert('Error al enviar solicitud');
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!token || !profile?.relationship.friendship.friendshipId) return;
    try {
      await user_api.acceptFriendRequest(profile.relationship.friendship.friendshipId, token);
      alert('Solicitud aceptada ✅');
      fetchUserProfile();
    } catch (error) {
      alert('Error al aceptar solicitud');
    }
  };

  const handleRejectFriendRequest = async () => {
    if (!token || !profile?.relationship.friendship.friendshipId) return;
    try {
      await user_api.rejectFriendRequest(profile.relationship.friendship.friendshipId, token);
      alert('Solicitud rechazada');
      fetchUserProfile();
    } catch (error) {
      alert('Error al rechazar solicitud');
    }
  };

  const handleRemoveFriend = async () => {
    if (!token || !userId) return;
    if (!confirm('¿Seguro que deseas eliminar esta amistad?')) return;
    try {
      await user_api.removeFriend(userId, token);
      alert('Amistad eliminada');
      fetchUserProfile();
    } catch (error) {
      alert('Error al eliminar amistad');
    }
  };

  const handleBlockUser = async () => {
    if (!token || !userId) return;
    if (!confirm('¿Seguro que deseas bloquear a este usuario?')) return;
    try {
      await user_api.blockUser(userId, token);
      alert('Usuario bloqueado');
      navigate('/home');
    } catch (error) {
      alert('Error al bloquear usuario');
    }
  };

  const renderFriendshipButton = () => {
    if (!profile) return null;
    const { friendship, isBlockedByMe } = profile.relationship;

    if (isBlockedByMe) {
      return (
        <button className="px-4 py-2 rounded-lg bg-gray-400 text-white cursor-not-allowed">
          Usuario bloqueado
        </button>
      );
    }

    if (friendship.status === 'friends') {
      return (
        <button
          onClick={handleRemoveFriend}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
          Eliminar amistad
        </button>
      );
    }

    if (friendship.status === 'pending') {
      if (friendship.isSender) {
        return (
          <button className="px-4 py-2 rounded-lg bg-gray-400 text-white cursor-not-allowed">
            Solicitud enviada
          </button>
        );
      } else {
        return (
          <div className="flex gap-2">
            <button
              onClick={handleAcceptFriendRequest}
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
            >
              Aceptar solicitud
            </button>
            <button
              onClick={handleRejectFriendRequest}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Rechazar
            </button>
          </div>
        );
      }
    }

    if (friendship.canSendRequest) {
      return (
        <button
          onClick={handleSendFriendRequest}
          className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
        >
          Enviar solicitud
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
          <button
            onClick={() => navigate('/home')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

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
                {profile.userPhoto ? (
                  <img src={profile.userPhoto} alt="perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-orange-600">👤</span>
                )}
              </div>

              <h2 className="text-2xl font-extrabold text-orange-700 mb-3">{profile.username}</h2>

              {/* ✅ Badge de perfil privado */}
              {profile.isPrivate && (
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
                <p className="text-sm text-gray-600 leading-5">
                  {profile.bio || 'Sin descripción'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="bg-white rounded-lg p-3 text-center shadow">
                  <div className="text-sm text-gray-500">Amigos</div>
                  <div className="font-bold text-lg">{profile.stats.friends}</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow">
                  <div className="text-sm text-gray-500">Posts</div>
                  <div className="font-bold text-lg">{profile.stats.posts}</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow">
                  <div className="text-sm text-gray-500">Comunidades</div>
                  <div className="font-bold text-lg">{profile.stats.communities}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ✅ Panel derecho - SOLO UNA SECCIÓN */}
        <section className="flex-1">
          {profile.isPrivate && profile.relationship?.friendship?.status !== 'friends' ? (
            // Perfil privado y NO son amigos
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <span className="text-6xl mb-4 block">🔒</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Perfil privado</h3>
              <p className="text-gray-600 mb-4">
                Este usuario tiene su perfil privado. Debes ser su amigo para ver sus publicaciones.
              </p>
              {profile.relationship?.friendship?.status === 'pending' && (
                <p className="text-orange-600 font-semibold mb-4">
                  {profile.relationship.friendship.isSender 
                    ? 'Solicitud de amistad enviada ⏳' 
                    : 'Este usuario te envió una solicitud de amistad'}
                </p>
              )}
              <div className="flex justify-center gap-3">
                {renderFriendshipButton()}
              </div>
            </div>
          ) : (
            // Perfil público o son amigos - Mostrar posts
            <>
              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <span className="text-6xl mb-4 block">📭</span>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Sin publicaciones
                  </h3>
                  <p className="text-gray-600">
                    Este usuario aún no ha compartido nada
                  </p>
                </div>
              ) : (
                <PostGrid posts={posts} cols={2} showAuthor={false} />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  </div>
);
};

export default UserProfilePage; 