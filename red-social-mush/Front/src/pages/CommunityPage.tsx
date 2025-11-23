import Header from '../components/Header';
import PostGrid from '../components/PostGrid';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { communities_api } from '../services/communities.api';
import PostCard from '../components/PostCard';

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
  role: 'superAdmin' | 'admin' | 'member';
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
  const [community, setCommunity] = useState<CommunityProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Estados para edición en modal de ajustes
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [editingHashtags, setEditingHashtags] = useState(false);
  const [newHashtags, setNewHashtags] = useState('');

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetchCommunityData();
  }, [communityId]);

  const fetchCommunityData = async () => {
    if (!token || !communityId) return;

    setLoading(true);
    try {
      const communityData = await communities_api.getCommunityById(communityId, token);
      setCommunity(communityData);
      
      // Inicializar valores para edición
      setNewDescription(communityData.description || '');
      setNewHashtags(communityData.hashtags?.map((tag: string) => `#${tag}`).join(' ') || '');

      const canViewPosts = 
        (communityData.userRole !== 'none' && communityData.userRole !== 'pending') || 
        !communityData.isPrivate;

      if (canViewPosts) {
        try {
          const postsData = await communities_api.getCommunityPosts(communityId, token);
          setPosts(postsData);
        } catch {
          setPosts([]);
        }
      } else {
        setPosts([]);
      }

      if (['superAdmin', 'admin', 'member'].includes(communityData.userRole)) {
        try {
          const membersData = await communities_api.getCommunityMembers(communityId, token);
          setMembers(membersData);
        } catch {
          setMembers([]);
        }
      }

      // Solo cargar solicitudes si la comunidad es PRIVADA
      if (communityData.isPrivate && ['superAdmin', 'admin'].includes(communityData.userRole)) {
        try {
          const requestsData = await communities_api.getPendingRequests(communityId, token);
          setPendingRequests(requestsData);
        } catch {
          setPendingRequests([]);
        }
      } else {
        setPendingRequests([]); // Limpiar si es pública
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar la comunidad');
    } finally {
      setLoading(false);
    }
  };

  // ============= HANDLERS DE AJUSTES (SOLO SUPERADMIN) =============
  
  const handleUpdatePhoto = async () => {
    if (!newPhoto || !token || !communityId) return;
    try {
      await communities_api.updateCommunityPhoto(communityId, newPhoto, token);
      alert('Foto actualizada ✅');
      setEditingPhoto(false);
      setNewPhoto('');
      fetchCommunityData();
    } catch (error: any) {
      alert(`Error: ${error.message || 'Error al actualizar foto'}`);
    }
  };

  const handleUpdateDescription = async () => {
    if (!token || !communityId) return;
    try {
      await communities_api.updateCommunityDescription(communityId, newDescription, token);
      alert('Descripción actualizada ✅');
      setEditingDescription(false);
      fetchCommunityData();
    } catch (error: any) {
      alert(`Error: ${error.message || 'Error al actualizar descripción'}`);
    }
  };

  const handleUpdateHashtags = async () => {
    if (!token || !communityId) return;
    try {
      // Procesar hashtags: remover espacios, split por #, filtrar vacíos
      const hashtagsArray = newHashtags
        .split('#')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      await communities_api.updateCommunityHashtags(communityId, hashtagsArray, token);
      alert('Hashtags actualizados ✅');
      setEditingHashtags(false);
      fetchCommunityData();
    } catch (error: any) {
      alert(`Error: ${error.message || 'Error al actualizar hashtags'}`);
    }
  };

  const handleTogglePrivacy = async () => {
    if (!token || !communityId || !community) return;
    const newPrivacy = !community.isPrivate;
    const confirmMsg = newPrivacy 
      ? '¿Cambiar a comunidad PRIVADA? Los nuevos miembros necesitarán aprobación.'
      : '¿Cambiar a comunidad PÚBLICA? Cualquiera podrá unirse sin aprobación.';
    
    if (!confirm(confirmMsg)) return;
    
    try {
      await communities_api.updateCommunityPrivacy(communityId, newPrivacy, token);
      alert('Privacidad actualizada ✅');
      fetchCommunityData();
    } catch (error: any) {
      alert(`Error: ${error.message || 'Error al actualizar privacidad'}`);
    }
  };

  const handlePhotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ============= HANDLERS DE MIEMBROS =============

  const getRoleBadge = (role: Member['role']) => {
    switch (role) {
      case 'superAdmin':
        return <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">👑 SuperAdmin</span>;
      case 'admin':
        return <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">⭐ Admin</span>;
      default:
        return <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Miembro</span>;
    }
  };

  const handleJoinCommunity = async () => {
    if (!token || !communityId || !community) return;
    
    try {
      if (community.isPrivate) {
        await communities_api.requestJoin(communityId, token);
        alert('Solicitud enviada ✅');
      } else {
        await communities_api.joinCommunity(communityId, token);
        alert('Te uniste a la comunidad ✅');
      }
      await fetchCommunityData();
    } catch (error: any) {
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
    } catch {
      alert('Error al salir de la comunidad');
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    if (!token || !communityId) return;
    try {
      await communities_api.acceptRequest(communityId, userId, token);
      alert('Solicitud aceptada ✅');
      fetchCommunityData();
    } catch {
      alert('Error al aceptar solicitud');
    }
  };

  const handleRejectRequest = async (userId: string) => {
    if (!token || !communityId) return;
    try {
      await communities_api.rejectRequest(communityId, userId, token);
      alert('Solicitud rechazada');
      fetchCommunityData();
    } catch {
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
    } catch {
      alert('Error al eliminar miembro');
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    if (!token || !communityId) return;
    if (!confirm('¿Ascender este miembro a administrador?')) return;
    try {
      await communities_api.promoteToAdmin(communityId, userId, token);
      alert('Miembro ascendido a Admin ✅');
      fetchCommunityData();
    } catch {
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
    } catch {
      alert('Error al degradar admin');
    }
  };

  const handleTransferOwnership = async (userId: string) => {
    if (!token || !communityId) return;
    if (!confirm('⚠️ ¿TRANSFERIR la propiedad de la comunidad? Esta acción no se puede deshacer.')) return;
    try {
      await communities_api.transferOwnership(communityId, userId, token);
      alert('Propiedad transferida exitosamente');
      await fetchCommunityData();
      setShowMembersModal(false);
    } catch (error: any) {
      alert(`Error: ${error.message || 'Error al transferir propiedad'}`);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!token || !communityId) return;
    if (!confirm('⚠️ ¿ELIMINAR COMUNIDAD? Esta acción eliminará todos los posts.')) return;
    try {
      await communities_api.deleteCommunity(communityId, token);
      alert('Comunidad eliminada');
      navigate('/home');
    } catch {
      alert('Error al eliminar comunidad');
    }
  };

  const renderMemberActions = (member: Member) => {
    if (!community) return null;
    
    const isCurrentUser = member._id === currentUser?.id;
    const isSuperAdmin = member.role === 'superAdmin';
    const isAdmin = member.role === 'admin';
    const isMember = member.role === 'member';

    if (isCurrentUser || isSuperAdmin) return null;

    if (community.userRole === 'superAdmin') {
      return (
        <div className="flex gap-2 flex-wrap">
          {isMember && (
            <button
              onClick={() => handlePromoteToAdmin(member._id)}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              ⬆ Ascender
            </button>
          )}
          
          {isAdmin && (
            <button
              onClick={() => handleDemoteFromAdmin(member._id)}
              className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
            >
              ⬇ Degradar
            </button>
          )}
          
          <button
            onClick={() => handleTransferOwnership(member._id)}
            className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
          >
            👑 Transferir
          </button>
          
          <button
            onClick={() => handleRemoveMember(member._id)}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            ✕ Eliminar
          </button>
        </div>
      );
    }

    if (community.userRole === 'admin' && isMember) {
      return (
        <button
          onClick={() => handleRemoveMember(member._id)}
          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
        >
          ✕ Eliminar
        </button>
      );
    }

    return null;
  };

  const renderActionButtons = () => {
    if (!community) return null;
    const { userRole, isPrivate } = community;

    if (userRole === 'none') {
      return (
        <button onClick={handleJoinCommunity} className="w-full px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition">
          {isPrivate ? 'Solicitar unirse' : 'Unirse a la comunidad'}
        </button>
      );
    }

    if (userRole === 'pending') {
      return <button className="w-full px-4 py-2 rounded-lg bg-gray-400 text-white cursor-not-allowed">Solicitud pendiente...</button>;
    }

    if (userRole === 'superAdmin') {
      return (
        <div className="flex flex-col gap-2 w-full">
          {/* ✅ Solo mostrar solicitudes si la comunidad es PRIVADA */}
          {isPrivate && (
            <button onClick={() => setShowRequestsModal(true)} className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition relative">
              Solicitudes pendientes
              {pendingRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{pendingRequests.length}</span>
              )}
            </button>
          )}
          <button onClick={() => setShowMembersModal(true)} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition">Gestionar miembros</button>
          <button onClick={() => setShowSettingsModal(true)} className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition">⚙️ Ajustes</button>
          <button onClick={handleDeleteCommunity} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">Eliminar comunidad</button>
        </div>
      );
    }

    if (userRole === 'admin') {
      return (
        <div className="flex flex-col gap-2 w-full">
          {/* ✅ Solo mostrar solicitudes si la comunidad es PRIVADA */}
          {isPrivate && (
            <button onClick={() => setShowRequestsModal(true)} className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition relative">
              Solicitudes pendientes
              {pendingRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{pendingRequests.length}</span>
              )}
            </button>
          )}
          <button onClick={() => setShowMembersModal(true)} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition">Gestionar miembros</button>
          <button onClick={handleLeaveCommunity} className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition">Salir de la comunidad</button>
        </div>
      );
    }

    if (userRole === 'member') {
      return <button onClick={handleLeaveCommunity} className="w-full px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">Salir de la comunidad</button>;
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
          <button onClick={() => navigate('/home')} className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">Volver al inicio</button>
        </div>
      </div>
    );
  }

  const isUserAdmin = community.userRole === 'superAdmin' || community.userRole === 'admin';

  return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col">
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-orange-100 to-yellow-100 p-6">
        <div className="max-w-6xl mx-auto flex gap-8">
          
          {/* Panel izquierdo */}
          <aside className="w-80 bg-transparent">
            <div className="bg-orange-200 rounded-2xl p-6 shadow-inner">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-2xl bg-white/60 shadow-md flex items-center justify-center mb-4 overflow-hidden">
                  {community.mediaURL ? (
                    <img src={community.mediaURL} alt="comunidad" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-orange-600">🏘️</span>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold text-orange-700 mb-2 text-center">{community.name}</h2>

                <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-3 ${community.isPrivate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {community.isPrivate ? '🔒 Privada' : '🌍 Pública'}
                </div>

                <div className="flex flex-col gap-2 mb-4 w-full">{renderActionButtons()}</div>

                <div className="w-full bg-white rounded-lg p-4 mb-4 shadow">
                  <p className="text-sm text-gray-600 leading-5">{community.description || 'Sin descripción'}</p>
                </div>

                {community.hashtags?.length > 0 && (
                  <div className="w-full bg-white rounded-lg p-3 mb-4 shadow">
                    <div className="flex flex-wrap gap-2">
                      {community.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

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
            {['member', 'admin', 'superAdmin'].includes(community.userRole) && (
              <PostCard communityId={communityId} onPostCreated={fetchCommunityData} />
            )}

            {community.isPrivate && ['none', 'pending'].includes(community.userRole) ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <span className="text-6xl mb-4 block">🔒</span>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Comunidad privada</h3>
                <p className="text-gray-600 mb-4">Debes ser aceptado como miembro para ver las publicaciones.</p>
                {community.userRole === 'pending' && <p className="text-orange-600 font-semibold">Tu solicitud está pendiente de aprobación</p>}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <span className="text-6xl mb-4 block">📭</span>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Aún no hay publicaciones</h3>
                <p className="text-gray-600">{community.userRole === 'none' ? '¡Únete para compartir!' : '¡Sé el primero en publicar!'}</p>
              </div>
            ) : (
              <PostGrid posts={posts} cols={3} showAuthor onPostDeleted={fetchCommunityData} communityId={communityId} isAdmin={isUserAdmin} />
            )}
          </section>
        </div>
      </div>

      {/* ============= MODAL AJUSTES (SOLO SUPERADMIN) ============= */}
      {showSettingsModal && community.userRole === 'superAdmin' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">⚙️ Ajustes de Comunidad</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>

            {/* Cambiar foto */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">📷 Foto de la comunidad</h4>
                <button 
                  onClick={() => setEditingPhoto(!editingPhoto)} 
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {editingPhoto ? 'Cancelar' : 'Cambiar'}
                </button>
              </div>
              {editingPhoto && (
                <div className="space-y-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoInput}
                    className="w-full p-2 border rounded-lg"
                  />
                  {newPhoto && (
                    <>
                      <img src={newPhoto} alt="preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                      <button 
                        onClick={handleUpdatePhoto}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Guardar foto
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cambiar descripción */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">📝 Descripción</h4>
                <button 
                  onClick={() => setEditingDescription(!editingDescription)} 
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {editingDescription ? 'Cancelar' : 'Editar'}
                </button>
              </div>
              {editingDescription ? (
                <div className="space-y-3">
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={4}
                    placeholder="Descripción de la comunidad..."
                  />
                  <button 
                    onClick={handleUpdateDescription}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Guardar descripción
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-600">{community.description || 'Sin descripción'}</p>
              )}
            </div>

            {/* Cambiar hashtags */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">#️⃣ Hashtags</h4>
                <button 
                  onClick={() => setEditingHashtags(!editingHashtags)} 
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {editingHashtags ? 'Cancelar' : 'Editar'}
                </button>
              </div>
              {editingHashtags ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newHashtags}
                    onChange={(e) => setNewHashtags(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="#tech #coding #innovation"
                  />
                  <p className="text-xs text-gray-500">Separa los hashtags con # (ejemplo: #tech #coding)</p>
                  <button 
                    onClick={handleUpdateHashtags}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Guardar hashtags
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {community.hashtags?.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">#{tag}</span>
                  )) || <span className="text-sm text-gray-500">Sin hashtags</span>}
                </div>
              )}
            </div>

            {/* Cambiar privacidad */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">🔒 Privacidad</h4>
                  <p className="text-sm text-gray-600">
                    {community.isPrivate 
                      ? 'La comunidad es privada. Los nuevos miembros necesitan aprobación.' 
                      : 'La comunidad es pública. Cualquiera puede unirse.'}
                  </p>
                </div>
                <button 
                  onClick={handleTogglePrivacy}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    community.isPrivate 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {community.isPrivate ? 'Hacer pública' : 'Hacer privada'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============= MODAL SOLICITUDES ============= */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Solicitudes Pendientes</h3>
              <button onClick={() => setShowRequestsModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>

            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay solicitudes pendientes</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(user => (
                  <div key={user._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-200 overflow-hidden">
                        {user.userPhoto ? <img src={user.userPhoto} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-orange-600">👤</div>}
                      </div>
                      <span className="font-semibold text-gray-800">{user.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAcceptRequest(user._id)} className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">✓</button>
                      <button onClick={() => handleRejectRequest(user._id)} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============= MODAL MIEMBROS ============= */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Gestionar Miembros</h3>
              <button onClick={() => setShowMembersModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>

            {members.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay miembros</p>
            ) : (
              <div className="space-y-3">
                {[...members]
                  .sort((a, b) => {
                    const order = { superAdmin: 0, admin: 1, member: 2 };
                    return order[a.role] - order[b.role];
                  })
                  .map(member => (
                    <div key={member._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-200 overflow-hidden">
                          {member.userPhoto ? (
                            <img src={member.userPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-orange-600">👤</div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-800">{member.username}</span>
                          {getRoleBadge(member.role)}
                          {member._id === currentUser?.id && (
                            <span className="ml-2 text-xs text-gray-400">(Tú)</span>
                          )}
                        </div>
                      </div>
                      
                      {renderMemberActions(member)}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;