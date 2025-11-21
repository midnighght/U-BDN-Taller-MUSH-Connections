import Header from '../components/Header';
import PostGrid from '../components/PostGrid';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { communities_api } from '../services/communities.api';
import PostCard from '../components/PostCard'; // Asegúrate de que la ruta sea correcta
interface Post {
  _id: string;
  mediaURL: string;
  textBody: string;
  hashtags: string[];
  createdAt?: string;
  authorID?: any;
}

interface Member {
  _id: string;
  username: string;
  userPhoto?: string;
}

interface CommunityProfile {
  _id: string;
  name: string;
  mediaURL?: string;
  description?: string;
  isPrivate: boolean;
  hashtags: string[];
  stats: {
    members: number;
    admins: number;
    posts: number;
  };
  userRole: 'superAdmin' | 'admin' | 'member' | 'pending' | 'none';
  superAdminID: string;
}

const CommunityPage = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState<{ textBody: string; mediaURL: string; hashtags: string[] }>({
  textBody: '',
  mediaURL: '',
  hashtags: [],
});
  const [community, setCommunity] = useState<CommunityProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetchCommunityData();
  }, [communityId]);

 const fetchCommunityData = async () => {
  if (!token || !communityId) return;

  setLoading(true);
  try {
    console.log('🔍 Cargando comunidad:', communityId);
    const communityData = await communities_api.getCommunityById(communityId, token);
    console.log('✅ Comunidad cargada:', communityData);
    setCommunity(communityData);

    // ✅ Cargar posts si:
    // - Es miembro/admin/superAdmin, O
    // - La comunidad es PÚBLICA (aunque no sea miembro)
    const canViewPosts = 
      (communityData.userRole !== 'none' && communityData.userRole !== 'pending') || 
      !communityData.isPrivate;

    if (canViewPosts) {
      try {
        console.log('📝 Cargando posts...');
        const postsData = await communities_api.getCommunityPosts(communityId, token);
        console.log('✅ Posts cargados:', postsData.length);
        setPosts(postsData);
      } catch (postErr) {
        console.warn('⚠️ No se pudieron cargar posts:', postErr);
        setPosts([]);
      }
    } else {
      setPosts([]);
    }

    // Cargar miembros si tiene permisos
    if (communityData.userRole === 'superAdmin' || communityData.userRole === 'admin' || communityData.userRole === 'member') {
      try {
        console.log('👥 Cargando miembros...');
        const membersData = await communities_api.getCommunityMembers(communityId, token);
        console.log('✅ Miembros cargados:', membersData.length);
        setMembers(membersData);
      } catch (memberErr) {
        console.warn('⚠️ No se pudieron cargar miembros:', memberErr);
        setMembers([]);
      }
    }

    // Cargar solicitudes pendientes si es admin o superAdmin
    if (communityData.userRole === 'superAdmin' || communityData.userRole === 'admin') {
      try {
        console.log('📋 Cargando solicitudes...');
        const requestsData = await communities_api.getPendingRequests(communityId, token);
        console.log('✅ Solicitudes cargadas:', requestsData.length);
        setPendingRequests(requestsData);
      } catch (reqErr) {
        console.warn('⚠️ No se pudieron cargar solicitudes:', reqErr);
        setPendingRequests([]);
      }
    }
  } catch (err: any) {
    console.error('❌ Error al cargar comunidad:', err);
    setError(err.message || 'Error al cargar la comunidad');
  } finally {
    setLoading(false);
  }
};

  const handleJoinCommunity = async () => {
  if (!token || !communityId || !community) return;
  
  try {
    console.log('🔍 Intentando unirse a comunidad:', {
      communityId,
      isPrivate: community.isPrivate,
      userRole: community.userRole
    });

    if (community.isPrivate) {
      console.log('📋 Solicitando unirse a comunidad privada...');
      await communities_api.requestJoin(communityId, token);
      alert('Solicitud enviada ✅');
    } else {
      console.log('🌍 Uniéndose a comunidad pública...');
      await communities_api.joinCommunity(communityId, token);
      alert('Te uniste a la comunidad ✅');
    }
    
    await fetchCommunityData();
  } catch (error: any) {
    console.error('❌ Error completo:', error);
    console.error('❌ Mensaje:', error.message);
    console.error('❌ Stack:', error.stack);
    alert(`Error: ${error.message || 'No se pudo unir a la comunidad'}`);
  }
};

  const handleLeaveCommunity = async () => {
    if (!token || !communityId) return;
    if (!confirm('¿Seguro que deseas salir de esta comunidad?')) return;
    try {
      await communities_api.leaveCommunity(communityId, token);
      alert('Has salido de la comunidad');
      navigate('/home');
    } catch (error) {
      alert('Error al salir de la comunidad');
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    if (!token || !communityId) return;
    try {
      await communities_api.acceptRequest(communityId, userId, token);
      alert('Solicitud aceptada ✅');
      fetchCommunityData();
    } catch (error) {
      alert('Error al aceptar solicitud');
    }
  };

  const handleRejectRequest = async (userId: string) => {
    if (!token || !communityId) return;
    try {
      await communities_api.rejectRequest(communityId, userId, token);
      alert('Solicitud rechazada');
      fetchCommunityData();
    } catch (error) {
      alert('Error al rechazar solicitud');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!token || !communityId) return;
    if (!confirm('¿Seguro que deseas eliminar este miembro?')) return;
    try {
      await communities_api.removeMember(communityId, userId, token);
      alert('Miembro eliminado');
      fetchCommunityData();
    } catch (error) {
      alert('Error al eliminar miembro');
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    if (!token || !communityId) return;
    if (!confirm('¿Ascender este miembro a administrador?')) return;
    try {
      await communities_api.promoteToAdmin(communityId, userId, token);
      alert('Miembro ascendido a admin ✅');
      fetchCommunityData();
    } catch (error) {
      alert('Error al ascender miembro');
    }
  };

  const handleDemoteFromAdmin = async (userId: string) => {
    if (!token || !communityId) return;
    if (!confirm('¿Degradar este admin a miembro?')) return;
    try {
      await communities_api.demoteFromAdmin(communityId, userId, token);
      alert('Admin degradado a miembro');
      fetchCommunityData();
    } catch (error) {
      alert('Error al degradar admin');
    }
  };

  const handleTransferOwnership = async (userId: string) => {
    if (!token || !communityId) return;
    if (!confirm('⚠️ ¿TRANSFERIR la propiedad de la comunidad a este usuario? Esta acción no se puede deshacer.')) return;
    try {
      await communities_api.transferOwnership(communityId, userId, token);
      alert('Propiedad transferida exitosamente');
      navigate('/home');
    } catch (error) {
      alert('Error al transferir propiedad');
    }
  };

  const handleDeleteCommunity = async () => {
    if (!token || !communityId) return;
    if (!confirm('⚠️ ¿ELIMINAR COMUNIDAD? Esta acción eliminará todos los posts y no se puede deshacer.')) return;
    try {
      await communities_api.deleteCommunity(communityId, token);
      alert('Comunidad eliminada');
      navigate('/home');
    } catch (error) {
      alert('Error al eliminar comunidad');
    }
  };

  const renderActionButtons = () => {
    if (!community) return null;

    const { userRole, isPrivate } = community;

    // No es miembro
    if (userRole === 'none') {
      return (
        <button
          onClick={handleJoinCommunity}
          className="w-full px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
        >
          {isPrivate ? 'Solicitar unirse' : 'Unirse a la comunidad'}
        </button>
      );
    }

    // Solicitud pendiente
    if (userRole === 'pending') {
      return (
        <button className="w-full px-4 py-2 rounded-lg bg-gray-400 text-white cursor-not-allowed">
          Solicitud pendiente...
        </button>
      );
    }

    // SuperAdmin
    if (userRole === 'superAdmin') {
      return (
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => setShowRequestsModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition relative"
          >
            Solicitudes pendientes
            {pendingRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowMembersModal(true)}
            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
          >
            Gestionar miembros
          </button>
          <button
            onClick={handleDeleteCommunity}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Eliminar comunidad
          </button>
        </div>
      );
    }

    // Admin
    if (userRole === 'admin') {
      return (
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => setShowRequestsModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition relative"
          >
            Solicitudes pendientes
            {pendingRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowMembersModal(true)}
            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
          >
            Gestionar miembros
          </button>
          <button
            onClick={handleLeaveCommunity}
            className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition"
          >
            Salir de la comunidad
          </button>
        </div>
      );
    }

    // Member
    if (userRole === 'member') {
      return (
        <button
          onClick={handleLeaveCommunity}
          className="w-full px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
          Salir de la comunidad
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

  if (error || !community) {
    return (
      <div className="min-h-screen bg-[#fff8f5]">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <span className="text-6xl mb-4">😕</span>
          <p className="text-gray-600 text-lg">{error || 'Comunidad no encontrada'}</p>
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
                {/* Foto de comunidad */}
                <div className="w-32 h-32 rounded-2xl bg-white/60 shadow-md flex items-center justify-center mb-4 overflow-hidden">
                  {community.mediaURL ? (
                    <img src={community.mediaURL} alt="comunidad" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-orange-600">🏘️</span>
                  )}
                </div>

                {/* Nombre */}
                <h2 className="text-2xl font-extrabold text-orange-700 mb-2 text-center">{community.name}</h2>

                {/* Badge de privacidad */}
                <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  community.isPrivate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {community.isPrivate ? '🔒 Privada' : '🌍 Pública'}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-2 mb-4 w-full">
                  {renderActionButtons()}
                </div>

                {/* Descripción */}
                <div className="w-full bg-white rounded-lg p-4 mb-4 shadow">
                  <p className="text-sm text-gray-600 leading-5">
                    {community.description || 'Sin descripción'}
                  </p>
                </div>

                {/* Hashtags */}
                {community.hashtags && community.hashtags.length > 0 && (
                  <div className="w-full bg-white rounded-lg p-3 mb-4 shadow">
                    <div className="flex flex-wrap gap-2">
                      {community.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  <div className="bg-white rounded-lg p-3 text-center shadow">
                    <div className="text-sm text-gray-500">Miembros</div>
                    <div className="font-bold text-lg">{community.stats.members}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow">
                    <div className="text-sm text-gray-500">Admins</div>
                    <div className="font-bold text-lg">{community.stats.admins}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow">
                    <div className="text-sm text-gray-500">Posts</div>
                    <div className="font-bold text-lg">{community.stats.posts}</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        

   
         {/* Panel derecho - Posts */}
<section className="flex-1">
  {/* ✅ Solo mostrar PostCard si es miembro/admin/superAdmin */}
  {(community.userRole === 'member' || 
    community.userRole === 'admin' || 
    community.userRole === 'superAdmin') && (
    <PostCard 
      communityId={communityId} 
      onPostCreated={fetchCommunityData}
    />
  )}

  {/* ✅ Mostrar contenido según el caso */}
  {community.isPrivate && (community.userRole === 'none' || community.userRole === 'pending') ? (
    // Comunidad PRIVADA y NO es miembro
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <span className="text-6xl mb-4 block">🔒</span>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Comunidad privada</h3>
      <p className="text-gray-600 mb-4">
        Esta comunidad es privada. Debes ser aceptado como miembro para ver las publicaciones.
      </p>
      {community.userRole === 'pending' && (
        <p className="text-orange-600 font-semibold">Tu solicitud está pendiente de aprobación</p>
      )}
    </div>
  ) : (
    // Comunidad PÚBLICA o el usuario ES miembro
    <>
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <span className="text-6xl mb-4 block">📭</span>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Aún no hay publicaciones
          </h3>
          <p className="text-gray-600">
            {community.userRole === 'none' 
              ? '¡Únete a la comunidad para empezar a compartir!' 
              : '¡Sé el primero en publicar algo!'}
          </p>
        </div>
      ) : (
        <PostGrid posts={posts} cols={3} showAuthor={true} />
      )}
    </>
  )}
</section>
        </div>
      </div>

      {/* Modal de Solicitudes Pendientes */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Solicitudes Pendientes</h3>
              <button
                onClick={() => setShowRequestsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay solicitudes pendientes</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(user => (
                  <div key={user._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-200 overflow-hidden">
                        {user.userPhoto ? (
                          <img src={user.userPhoto} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-orange-600">👤</div>
                        )}
                      </div>
                      <span className="font-semibold text-gray-800">{user.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(user._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleRejectRequest(user._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Gestión de Miembros */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Gestionar Miembros</h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {members.map(member => {
                const isSuperAdmin = member._id === community.superAdminID;
                const isCurrentUser = member._id === currentUser?.id;
                
                return (
                  <div key={member._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-200 overflow-hidden">
                        {member.userPhoto ? (
                          <img src={member.userPhoto} alt={member.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-orange-600">👤</div>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">{member.username}</span>
                        {isSuperAdmin && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            👑 SuperAdmin
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!isCurrentUser && !isSuperAdmin && community.userRole === 'superAdmin' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePromoteToAdmin(member._id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                          ⬆ Admin
                        </button>
                        <button
                          onClick={() => handleTransferOwnership(member._id)}
                          className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                        >
                          👑 Transferir
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                        >
                          ✕ Eliminar
                        </button>
                      </div>
                    )}

                    {!isCurrentUser && !isSuperAdmin && community.userRole === 'admin' && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        ✕ Eliminar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;