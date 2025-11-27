import Header from "../components/Header";
import PostGrid from "../components/PostGrid";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { communities_api } from "../services/communities.api";
import PostCard from "../components/PostCard";
import {
  Loader2,
  Home,
  Lock,
  Globe,
  Settings,
  Users,
  ArrowUp,
  ArrowDown,
  Crown,
  Trash2,
  X,
  Plus,
  Star,
  User,
  Camera,
  Edit,
  Hash,
  ChevronsRight,
  Check,
  UserMinus,
  Send,
  UserCheck,
  Upload,
  MinusCircle,
} from "lucide-react";

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
  role: "superAdmin" | "admin" | "member";
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
  userRole: "superAdmin" | "admin" | "member" | "pending" | "none";
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
  const [error, setError] = useState("");
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [editingPhoto, setEditingPhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState("");
  const [newPhotoPreview, setNewPhotoPreview] = useState(""); // Estado para la previsualización
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [editingHashtags, setEditingHashtags] = useState(false);
  const [newHashtags, setNewHashtags] = useState("");

  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    fetchCommunityData();
  }, [communityId]);

  const fetchCommunityData = async () => {
    if (!token || !communityId) return;

    setLoading(true);
    try {
      const communityData = await communities_api.getCommunityById(
        communityId,
        token
      );
      setCommunity(communityData);
      setNewDescription(communityData.description || "");
      setNewHashtags(
        communityData.hashtags?.map((tag: string) => `#${tag}`).join(" ") || ""
      );
      setNewPhotoPreview(communityData.mediaURL || ""); // Inicializar preview con la URL actual

      const canViewPosts =
        (communityData.userRole !== "none" &&
          communityData.userRole !== "pending") ||
        !communityData.isPrivate;

      if (canViewPosts) {
        try {
          const postsData = await communities_api.getCommunityPosts(
            communityId,
            token
          );
          setPosts(postsData);
        } catch {
          setPosts([]);
        }
      } else {
        setPosts([]);
      }

      if (["superAdmin", "admin", "member"].includes(communityData.userRole)) {
        try {
          const membersData = await communities_api.getCommunityMembers(
            communityId,
            token
          );
          setMembers(membersData);
        } catch {
          setMembers([]);
        }
      }

      if (
        communityData.isPrivate &&
        ["superAdmin", "admin"].includes(communityData.userRole)
      ) {
        try {
          const requestsData = await communities_api.getPendingRequests(
            communityId,
            token
          );
          setPendingRequests(requestsData);
        } catch {
          setPendingRequests([]);
        }
      } else {
        setPendingRequests([]);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar la comunidad");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhoto = async () => {
    if (!newPhoto || !token || !communityId) return;
    try {
      await communities_api.updateCommunityPhoto(communityId, newPhoto, token);
      alert("Foto actualizada");
      setEditingPhoto(false);
      setNewPhoto("");
      fetchCommunityData();
    } catch (error: any) {
      alert("Error al actualizar foto");
    }
  };

  const handleUpdateDescription = async () => {
    if (!token || !communityId) return;
    try {
      await communities_api.updateCommunityDescription(
        communityId,
        newDescription,
        token
      );
      alert("Descripción actualizada");
      setEditingDescription(false);
      fetchCommunityData();
    } catch (error: any) {
      alert("Error al actualizar descripción");
    }
  };

  const handleUpdateHashtags = async () => {
    if (!token || !communityId) return;
    try {
      const hashtagsArray = newHashtags
        .split("#")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      await communities_api.updateCommunityHashtags(
        communityId,
        hashtagsArray,
        token
      );
      alert("Hashtags actualizados");
      setEditingHashtags(false);
      fetchCommunityData();
    } catch (error: any) {
      alert("Error al actualizar hashtags");
    }
  };

  const handleTogglePrivacy = async () => {
    if (!token || !communityId || !community) return;
    const newPrivacy = !community.isPrivate;
    const confirmMsg = newPrivacy
      ? "¿Cambiar a comunidad PRIVADA? Los nuevos miembros necesitarán aprobación."
      : "¿Cambiar a comunidad PÚBLICA? Cualquiera podrá unirse sin aprobación.";
    if (!confirm(confirmMsg)) return;
    try {
      await communities_api.updateCommunityPrivacy(
        communityId,
        newPrivacy,
        token
      );
      alert("Privacidad actualizada");
      fetchCommunityData();
    } catch (error: any) {
      alert("Error al actualizar privacidad");
    }
  };

  const handlePhotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setNewPhoto(base64);
      setNewPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveNewPhoto = () => {
    setNewPhoto("");
    setNewPhotoPreview(community?.mediaURL || "");
  };
  const getRoleBadge = (role: Member["role"]) => {
    switch (role) {
      case "superAdmin":
        return (
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <Crown className="w-3 h-3 fill-yellow-600" /> SuperAdmin
          </span>
        );
      case "admin":
        return (
          <span className="ml-2 text-xs bg-[#FFE5C2] text-[#B24700] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-[#B24700]" /> Admin
          </span>
        );
      default:
        return (
          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
            Miembro
          </span>
        );
    }
  };

  const handleJoinCommunity = async () => {
    if (!token || !communityId || !community) return;
    try {
      if (community.isPrivate) {
        await communities_api.requestJoin(communityId, token);
        alert("Solicitud enviada");
      } else {
        await communities_api.joinCommunity(communityId, token);
        alert("Te uniste a la comunidad");
      }
      await fetchCommunityData();
    } catch (error: any) {
      alert("No se pudo unir a la comunidad");
    }
  };

  const handleLeaveCommunity = async () => {
    if (!token || !communityId) return;
    if (!confirm("¿Seguro que deseas salir de esta comunidad?")) return;
    try {
      await communities_api.leaveCommunity(communityId, token);
      alert("Has salido de la comunidad");
      navigate("/home");
    } catch {
      alert("Error al salir de la comunidad");
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    if (!token || !communityId) return;
    try {
      await communities_api.acceptRequest(communityId, userId, token);
      alert("Solicitud aceptada ");
      fetchCommunityData();
    } catch {
      alert("Error al aceptar solicitud");
    }
  };

  const handleRejectRequest = async (userId: string) => {
    if (!token || !communityId) return;
    try {
      await communities_api.rejectRequest(communityId, userId, token);
      alert("Solicitud rechazada");
      fetchCommunityData();
    } catch {
      alert("Error al rechazar solicitud");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!token || !communityId) return;
    if (!confirm("¿Seguro que deseas eliminar este miembro?")) return;
    try {
      await communities_api.removeMember(communityId, userId, token);
      alert("Miembro eliminado");
      fetchCommunityData();
    } catch {
      alert("Error al eliminar miembro");
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    if (!token || !communityId) return;
    if (!confirm("¿Ascender este miembro a administrador?")) return;
    try {
      await communities_api.promoteToAdmin(communityId, userId, token);
      alert("Miembro ascendido a admin");
      fetchCommunityData();
    } catch {
      alert("Error al ascender miembro");
    }
  };

  const handleDemoteFromAdmin = async (userId: string) => {
    if (!token || !communityId) return;
    if (!confirm("¿Degradar este admin a miembro?")) return;
    try {
      await communities_api.demoteFromAdmin(communityId, userId, token);
      alert("Admin degradado a miembro");
      fetchCommunityData();
    } catch {
      alert("Error al degradar admin");
    }
  };

  const handleTransferOwnership = async (userId: string) => {
    if (!token || !communityId) return;
    if (
      !confirm(
        "¿TRANSFERIR el rol de Super Admin de la comunidad? Esta acción no se puede deshacer."
      )
    )
      return;
    try {
      await communities_api.transferOwnership(communityId, userId, token);
      alert("Rol transferido exitosamente");
      await fetchCommunityData();
      setShowMembersModal(false);
    } catch (error: any) {
      alert("Error al transferir rol");
    }
  };

  const handleDeleteCommunity = async () => {
    if (!token || !communityId) return;
    if (!confirm("¿ELIMINAR COMUNIDAD? Esta acción eliminará todos los posts."))
      return;
    try {
      await communities_api.deleteCommunity(communityId, token);
      alert("Comunidad eliminada");
      navigate("/home");
    } catch {
      alert("Error al eliminar comunidad");
    }
  };

  const renderMemberActions = (member: Member) => {
    if (!community) return null;
    const isCurrentUser = member._id === currentUser?.id;
    const isSuperAdmin = member.role === "superAdmin";
    const isAdmin = member.role === "admin";
    const isMember = member.role === "member";

    if (isCurrentUser || isSuperAdmin) return null;

    if (community.userRole === "superAdmin") {
      return (
        <div className="flex gap-2 flex-wrap justify-end">
          {" "}
          {isMember && (
            <button
              onClick={() => handlePromoteToAdmin(member._id)}
              className="px-3 py-1 bg-[#F45C1C] text-white rounded-full text-xs font-semibold hover:bg-[#c94917] transition flex items-center"
            >
              <ArrowUp className="w-3 h-3 mr-1" /> Ascender
              {" "}
            </button>
          )}
          {" "}
          {isAdmin && (
            <button
              onClick={() => handleDemoteFromAdmin(member._id)}
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded-full text-xs font-semibold hover:bg-gray-400 transition flex items-center"
            >
              <ArrowDown className="w-3 h-3 mr-1" /> Degradar
              {" "}
            </button>
          )}
          {" "}
          <button
            onClick={() => handleTransferOwnership(member._id)}
            className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold hover:bg-purple-700 transition flex items-center"
          >
            <Crown className="w-3 h-3 mr-1 fill-white" /> Transferir
            {" "}
          </button>
          {" "}
          <button
            onClick={() => handleRemoveMember(member._id)}
            className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-semibold hover:bg-red-700 transition flex items-center"
          >
            <X className="w-3 h-3 mr-1" /> Eliminar         {" "}
          </button>
          {" "}
        </div>
      );
    }

    if (community.userRole === "admin" && isMember) {
      return (
        <button
          onClick={() => handleRemoveMember(member._id)}
          className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-semibold hover:bg-red-700 transition flex items-center"
        >
          <X className="w-3 h-3 mr-1" /> Eliminar       {" "}
        </button>
      );
    }

    return null;
  };

  const renderActionButtons = () => {
    if (!community) return null;
    const { userRole, isPrivate } = community;

    if (userRole === "none") {
      return (
        <button
          onClick={handleJoinCommunity}
          className="w-full px-4 py-3 rounded-xl bg-[#F45C1C] text-white font-bold hover:bg-[#c94917] transition shadow-md flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />        {" "}
          {isPrivate ? "Solicitar unirse" : "Unirse a la comunidad"}      {" "}
        </button>
      );
    }

    if (userRole === "pending") {
      return (
        <button className="w-full px-4 py-3 rounded-xl bg-gray-400 text-white cursor-not-allowed font-bold flex items-center justify-center">
          <UserCheck className="w-5 h-5 mr-2" /> Solicitud pendiente...
        </button>
      );
    }

    if (userRole === "superAdmin") {
      return (
        <div className="flex flex-col gap-3 w-full">
          {" "}
          {isPrivate && (
            <button
              onClick={() => setShowRequestsModal(true)}
              className="px-4 py-3 rounded-xl bg-[#B24700] text-white font-bold hover:bg-[#8f3900] transition relative flex items-center justify-center"
            >
              <Send className="w-5 h-5 mr-2" />
              Solicitudes pendientes             {" "}
              {pendingRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ring-2 ring-white">
                  {pendingRequests.length}
                </span>
              )}
              {" "}
            </button>
          )}
          {" "}
          <button
            onClick={() => setShowMembersModal(true)}
            className="px-4 py-3 rounded-xl bg-gray-200 text-[#B24700] font-bold hover:bg-gray-300 transition flex items-center justify-center"
          >
            <Users className="w-5 h-5 mr-2" /> Gestionar miembros
          </button>
          {" "}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-3 rounded-xl bg-gray-200 text-[#B24700] font-bold hover:bg-gray-300 transition flex items-center justify-center"
          >
            <Settings className="w-5 h-5 mr-2" /> Ajustes
          </button>
          {" "}
          <button
            onClick={handleDeleteCommunity}
            className="px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition flex items-center justify-center"
          >
            <Trash2 className="w-5 h-5 mr-2" /> Eliminar comunidad
          </button>
          {" "}
        </div>
      );
    }

    if (userRole === "admin") {
      return (
        <div className="flex flex-col gap-3 w-full">
          {" "}
          {isPrivate && (
            <button
              onClick={() => setShowRequestsModal(true)}
              className="px-4 py-3 rounded-xl bg-[#B24700] text-white font-bold hover:bg-[#8f3900] transition relative flex items-center justify-center"
            >
              <Send className="w-5 h-5 mr-2" />
              Solicitudes pendientes             {" "}
              {pendingRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ring-2 ring-white">
                  {pendingRequests.length}
                </span>
              )}
              {" "}
            </button>
          )}
          {" "}
          <button
            onClick={() => setShowMembersModal(true)}
            className="px-4 py-3 rounded-xl bg-gray-200 text-[#B24700] font-bold hover:bg-gray-300 transition flex items-center justify-center"
          >
            <Users className="w-5 h-5 mr-2" /> Gestionar miembros
          </button>
          {" "}
          <button
            onClick={handleLeaveCommunity}
            className="px-4 py-3 rounded-xl bg-gray-500 text-white font-bold hover:bg-gray-600 transition flex items-center justify-center"
          >
            <X className="w-5 h-5 mr-2" /> Salir de la comunidad
          </button>
          {" "}
        </div>
      );
    }

    if (userRole === "member") {
      return (
        <button
          onClick={handleLeaveCommunity}
          className="w-full px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition flex items-center justify-center"
        >
          <X className="w-5 h-5 mr-2" /> Salir de la comunidad
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f5]">
        <Header />      {" "}
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          {" "}
          <Loader2 className="animate-spin h-12 w-12 text-[#F45C1C]" />      {" "}
        </div>
        {" "}
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-[#fff8f5]">
        <Header />      {" "}
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <X className="w-12 h-12 mb-4 text-red-500" />        {" "}
          <p className="text-gray-600 text-lg font-semibold">
            {error || "Comunidad no encontrada"}
          </p>
          {" "}
          <button
            onClick={() => navigate("/home")}
            className="mt-6 px-6 py-2 bg-[#F45C1C] text-white rounded-xl font-bold hover:bg-[#c94917] transition"
          >
            Volver al inicio
          </button>
          {" "}
        </div>
        {" "}
      </div>
    );
  }

  const isUserAdmin =
    community.userRole === "superAdmin" || community.userRole === "admin";

  return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col">
      <Header />    {" "}
      <div className="pt-20 flex-1 bg-gradient-to-b from-[#FFE5C2] to-[#FFD89C] p-6">
        {" "}
        <div className="max-w-6xl mx-auto flex gap-8">
          {" "}
          <aside className="w-80 sticky top-20 h-fit">
            {" "}
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-[#f7cda3]">
              {" "}
              <div className="flex flex-col items-center">
                {" "}
                <div className="w-32 h-32 rounded-xl bg-[#FFD89C] shadow-md flex items-center justify-center mb-4 overflow-hidden border-4 border-[#F45C1C]">
                  {" "}
                  {community.mediaURL ? (
                    <img
                      src={community.mediaURL}
                      alt="comunidad"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Home className="w-12 h-12 text-[#B24700]" />
                  )}
                  {" "}
                </div>
                {" "}
                <h2 className="text-2xl font-extrabold text-[#B24700] mb-2 text-center">
                  {community.name}
                </h2>
                {" "}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold mb-4 flex items-center gap-1 ${community.isPrivate
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                    }`}
                >
                  {" "}
                  {community.isPrivate ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Globe className="w-3 h-3" />
                  )}{" "}
                  {community.isPrivate ? "Privada" : "Pública"}              {" "}
                </div>
                {" "}
                <div className="flex flex-col gap-3 mb-4 w-full">
                  {renderActionButtons()}
                </div>
                {" "}
                <div className="w-full bg-[#fff8f5] rounded-xl p-4 mb-4 shadow-inner border border-[#f7cda3]/50">
                  {" "}
                  <p className="text-sm text-gray-700 leading-5">
                    {community.description || "Sin descripción"}
                  </p>
                  {" "}
                </div>
                {" "}
                {community.hashtags?.length > 0 && (
                  <div className="w-full bg-[#fff8f5] rounded-xl p-3 mb-4 shadow-inner border border-[#f7cda3]/50">
                    {" "}
                    <div className="flex flex-wrap gap-2">
                      <Hash className="w-4 h-4 text-[#F45C1C]" />
                      {" "}
                      {community.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-[#FFE5C2] text-[#B24700] px-2 py-1 rounded-full font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                      {" "}
                    </div>
                    {" "}
                  </div>
                )}
                {" "}
                <div className="grid grid-cols-3 gap-3 w-full">
                  {" "}
                  <div className="bg-[#fff8f5] rounded-xl p-3 text-center shadow-sm border border-[#f7cda3]/50">
                    {" "}
                    <div className="text-sm text-gray-600 font-medium">
                      Miembros
                    </div>
                    {" "}
                    <div className="font-bold text-lg text-[#B24700]">
                      {community.stats.members}
                    </div>
                    {" "}
                  </div>
                  {" "}
                  <div className="bg-[#fff8f5] rounded-xl p-3 text-center shadow-sm border border-[#f7cda3]/50">
                    {" "}
                    <div className="text-sm text-gray-600 font-medium">
                      Admins
                    </div>
                    {" "}
                    <div className="font-bold text-lg text-[#B24700]">
                      {community.stats.admins}
                    </div>
                    {" "}
                  </div>
                  {" "}
                  <div className="bg-[#fff8f5] rounded-xl p-3 text-center shadow-sm border border-[#f7cda3]/50">
                    {" "}
                    <div className="text-sm text-gray-600 font-medium">
                      Posts
                    </div>
                    {" "}
                    <div className="font-bold text-lg text-[#B24700]">
                      {community.stats.posts}
                    </div>
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </aside>
          {" "}
          <section className="flex-1">
            {" "}
            {["member", "admin", "superAdmin"].includes(community.userRole) && (
              <div className="mb-6">
                {" "}
                <PostCard
                  communityId={communityId}
                  onPostCreated={fetchCommunityData}
                />
                {" "}
              </div>
            )}
            {" "}
            {community.isPrivate &&
              ["none", "pending"].includes(community.userRole) ? (
              <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-[#f7cda3]/50">
                {" "}
                <Lock className="w-12 h-12 mb-4 block mx-auto text-[#B24700]" />
                {" "}
                <h3 className="text-xl font-bold text-[#B24700] mb-3">
                  Comunidad privada
                </h3>
                {" "}
                <p className="text-gray-600 mb-4">
                  Debes ser aceptado como miembro para ver las publicaciones.
                </p>
                {" "}
                {community.userRole === "pending" && (
                  <p className="text-[#F45C1C] font-bold flex items-center justify-center">
                    <ChevronsRight className="w-5 h-5 mr-1" /> Tu solicitud está
                    pendiente de aprobación
                  </p>
                )}
                {" "}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-[#f7cda3]/50">
                {" "}
                <Home className="w-12 h-12 mb-4 block mx-auto text-[#F45C1C]" />
                {" "}
                <h3 className="text-xl font-bold text-[#B24700] mb-3">
                  Aún no hay publicaciones
                </h3>
                {" "}
                <p className="text-gray-600">
                  {community.userRole === "none"
                    ? "¡Únete para compartir!"
                    : "¡Sé el primero en publicar!"}
                </p>
                {" "}
              </div>
            ) : (
              <PostGrid
                posts={posts}
                cols={3}
                showAuthor
                onPostDeleted={fetchCommunityData}
                communityId={communityId}
                isAdmin={isUserAdmin}
              />
            )}
            {" "}
          </section>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
      {showSettingsModal && community.userRole === "superAdmin" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          {" "}
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#f7cda3]">
            {" "}
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-[#f7cda3]">
              {" "}
              <h3 className="text-2xl font-bold text-[#B24700] flex items-center">
                <Settings className="w-6 h-6 mr-2" /> Ajustes de Comunidad
              </h3>
              {" "}
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-500 hover:text-[#F45C1C] transition p-2"
              >
                <X className="w-6 h-6" />
              </button>
              {" "}
            </div>
            {" "}
            <div className="mb-6 p-4 bg-[#fff8f5] rounded-xl border border-[#f7cda3]/50">
              {" "}
              <div className="flex items-center justify-between mb-3">
                {" "}
                <h4 className="font-bold text-[#B24700] flex items-center">
                  <Camera className="w-5 h-5 mr-2" /> Foto de la comunidad
                </h4>
                {" "}
                <button
                  onClick={() => {
                    setEditingPhoto(!editingPhoto);
                    setNewPhoto("");
                    if (!editingPhoto)
                      setNewPhotoPreview(community.mediaURL || "");
                  }}
                  className="text-sm text-[#F45C1C] font-semibold hover:text-[#B24700] transition"
                >
                  {editingPhoto ? "Cancelar" : "Cambiar"}
                  {" "}
                </button>
                {" "}
              </div>
              {" "}
              {editingPhoto && (
                <div className="space-y-3">
                  {" "}
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-32 rounded-xl bg-[#FFD89C] shadow-md flex items-center justify-center overflow-hidden border-4 border-[#F45C1C]">
                      {newPhotoPreview ? (
                        <img
                          src={newPhotoPreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-12 h-12 text-[#B24700]" />
                      )}
                    </div>
                  </div>
                  {" "}
                  <label
                    htmlFor="community-photo-upload"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#F45C1C] rounded-xl cursor-pointer bg-white hover:bg-[#FFE5C2]/50 transition shadow-inner"
                  >
                    {newPhoto ? (
                      <span className="font-semibold text-green-600 flex items-center">
                        <Check className="w-4 h-4 mr-1" /> Imagen seleccionada
                      </span>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mb-1 text-[#F45C1C]" />
                        <span className="text-sm text-[#B24700] font-medium">
                          Haz clic para subir una imagen
                        </span>
                      </>
                    )}
                    <input
                      id="community-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoInput}
                      className="hidden"
                    />
                  </label>
                  {newPhoto && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdatePhoto}
                        className="flex-1 px-4 py-2 bg-[#F45C1C] text-white rounded-xl font-bold hover:bg-[#c94917] transition shadow-md"
                      >
                        Guardar foto
                      </button>
                      <button
                        onClick={handleRemoveNewPhoto}
                        className="px-3 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition flex items-center font-bold"
                      >
                        <MinusCircle className="w-4 h-4 mr-1" /> Eliminar
                      </button>
                    </div>
                  )}
                  {" "}
                </div>
              )}
              {" "}
            </div>
            {" "}
            <div className="mb-6 p-4 bg-[#fff8f5] rounded-xl border border-[#f7cda3]/50">
              {" "}
              <div className="flex items-center justify-between mb-3">
                {" "}
                <h4 className="font-bold text-[#B24700] flex items-center">
                  <Edit className="w-5 h-5 mr-2" /> Descripción
                </h4>
                {" "}
                <button
                  onClick={() => setEditingDescription(!editingDescription)}
                  className="text-sm text-[#F45C1C] font-semibold hover:text-[#B24700] transition"
                >
                  {editingDescription ? "Cancelar" : "Editar"}
                  {" "}
                </button>
                {" "}
              </div>
              {" "}
              {editingDescription ? (
                <div className="space-y-3">
                  {" "}
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-3 border border-[#f3c7a5] rounded-xl resize-none bg-white shadow-inner focus:ring-2 focus:ring-[#F45C1C] focus:outline-none"
                    rows={4}
                    placeholder="Descripción de la comunidad..."
                  />
                  {" "}
                  <button
                    onClick={handleUpdateDescription}
                    className="w-full px-4 py-2 bg-[#F45C1C] text-white rounded-xl font-bold hover:bg-[#c94917] transition shadow-md"
                  >
                    Guardar descripción                 {" "}
                  </button>
                  {" "}
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  {community.description || "Sin descripción"}
                </p>
              )}
              {" "}
            </div>
            {" "}
            <div className="mb-6 p-4 bg-[#fff8f5] rounded-xl border border-[#f7cda3]/50">
              {" "}
              <div className="flex items-center justify-between mb-3">
                {" "}
                <h4 className="font-bold text-[#B24700] flex items-center">
                  <Hash className="w-5 h-5 mr-2" /> Hashtags
                </h4>
                {" "}
                <button
                  onClick={() => setEditingHashtags(!editingHashtags)}
                  className="text-sm text-[#F45C1C] font-semibold hover:text-[#B24700] transition"
                >
                  {editingHashtags ? "Cancelar" : "Editar"}
                  {" "}
                </button>
                {" "}
              </div>
              {" "}
              {editingHashtags ? (
                <div className="space-y-3">
                  {" "}
                  <input
                    type="text"
                    value={newHashtags}
                    onChange={(e) => setNewHashtags(e.target.value)}
                    className="w-full p-3 border border-[#f3c7a5] rounded-xl bg-white shadow-inner focus:ring-2 focus:ring-[#F45C1C] focus:outline-none"
                    placeholder="#tech #coding #innovation"
                  />
                  {" "}
                  <p className="text-xs text-gray-500">
                    Separa los hashtags con # (ejemplo: #tech #coding)
                  </p>
                  {" "}
                  <button
                    onClick={handleUpdateHashtags}
                    className="w-full px-4 py-2 bg-[#F45C1C] text-white rounded-xl font-bold hover:bg-[#c94917] transition shadow-md"
                  >
                    Guardar hashtags                 {" "}
                  </button>
                  {" "}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {" "}
                  {community.hashtags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-[#FFE5C2] text-[#B24700] px-2 py-1 rounded-full font-semibold"
                    >
                      #{tag}
                    </span>
                  )) || (
                      <span className="text-sm text-gray-500">Sin hashtags</span>
                    )}
                  {" "}
                </div>
              )}
              {" "}
            </div>
            {" "}
            <div className="p-4 bg-[#fff8f5] rounded-xl border border-[#f7cda3]/50">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <h4 className="font-bold text-[#B24700] mb-1 flex items-center">
                    {community.isPrivate ? (
                      <Lock className="w-4 h-4 mr-2" />
                    ) : (
                      <Globe className="w-4 h-4 mr-2" />
                    )}{" "}
                    Privacidad
                  </h4>
                  {" "}
                  <p className="text-sm text-gray-700">
                    {" "}
                    {community.isPrivate
                      ? "La comunidad es privada. Los nuevos miembros necesitan aprobación."
                      : "La comunidad es pública. Cualquiera puede unirse."}
                    {" "}
                  </p>
                  {" "}
                </div>
                {" "}
                <button
                  onClick={handleTogglePrivacy}
                  className={`px-4 py-2 rounded-xl font-bold transition shadow-md ${community.isPrivate
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                >
                  {" "}
                  {community.isPrivate ? "Hacer pública" : "Hacer privada"}
                  {" "}
                </button>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </div>
      )}
      {" "}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          {" "}
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#f7cda3]">
            {" "}
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-[#f7cda3]">
              {" "}
              <h3 className="text-xl font-bold text-[#B24700] flex items-center">
                <Send className="w-5 h-5 mr-2" /> Solicitudes Pendientes
              </h3>
              {" "}
              <button
                onClick={() => setShowRequestsModal(false)}
                className="text-gray-500 hover:text-[#F45C1C] transition p-2"
              >
                <X className="w-6 h-6" />
              </button>
              {" "}
            </div>
            {" "}
            {pendingRequests.length === 0 ? (
              <div className="text-gray-500 text-center py-8 bg-[#fff8f5] rounded-xl border border-[#f7cda3]/50">
                {" "}
                <UserCheck className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                {" "}
                <p className="font-semibold">No hay solicitudes pendientes</p>
                {" "}
              </div>
            ) : (
              <div className="space-y-3">
                {" "}
                {pendingRequests.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between bg-[#fff8f5] p-3 rounded-xl shadow-sm border border-[#f7cda3]/50"
                  >
                    {" "}
                    <div className="flex items-center gap-3">
                      {" "}
                      <div className="w-10 h-10 rounded-full bg-[#B24700] overflow-hidden flex-shrink-0 border-2 border-[#F45C1C]">
                        {" "}
                        {user.userPhoto ? (
                          <img
                            src={user.userPhoto}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white m-auto" />
                        )}
                        {" "}
                      </div>
                      {" "}
                      <span className="font-bold text-[#B24700]">
                        {user.username}
                      </span>
                      {" "}
                    </div>
                    {" "}
                    <div className="flex gap-2">
                      {" "}
                      <button
                        onClick={() => handleAcceptRequest(user._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 text-sm font-semibold flex items-center"
                      >
                        <Check className="w-3 h-3 mr-1" /> Aceptar
                      </button>
                      {" "}
                      <button
                        onClick={() => handleRejectRequest(user._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm font-semibold flex items-center"
                      >
                        <X className="w-3 h-3 mr-1" /> Rechazar
                      </button>
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
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          {" "}
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#f7cda3]">
            {" "}
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-[#f7cda3]">
              {" "}
              <h3 className="text-2xl font-bold text-[#B24700] flex items-center">
                <Users className="w-6 h-6 mr-2" /> Gestionar Miembros
              </h3>
              {" "}
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-500 hover:text-[#F45C1C] transition p-2"
              >
                <X className="w-6 h-6" />
              </button>
              {" "}
            </div>
            {" "}
            {members.length === 0 ? (
              <div className="text-gray-500 text-center py-8 bg-[#fff8f5] rounded-xl border border-[#f7cda3]/50">
                {" "}
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                {" "}
                <p className="font-semibold">
                  No hay miembros en esta comunidad.
                </p>
                {" "}
              </div>
            ) : (
              <div className="space-y-4">
                {" "}
                {[...members]
                  .sort((a, b) => {
                    const order = { superAdmin: 0, admin: 1, member: 2 };
                    return order[a.role] - order[b.role];
                  })
                  .map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between bg-[#fff8f5] p-3 rounded-xl shadow-sm border border-[#f7cda3]/50"
                    >
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <div className="w-10 h-10 rounded-full bg-[#B24700] overflow-hidden border-2 border-[#F45C1C] flex-shrink-0">
                          {" "}
                          {member.userPhoto ? (
                            <img
                              src={member.userPhoto}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-white m-auto" />
                          )}
                          {" "}
                        </div>
                        {" "}
                        <div className="flex items-center">
                          {" "}
                          <span className="font-bold text-[#B24700]">
                            {member.username}
                          </span>
                          {getRoleBadge(member.role)}
                          {" "}
                          {member._id === currentUser?.id && (
                            <span className="ml-2 text-xs text-gray-500 font-semibold">
                              (Tú)
                            </span>
                          )}
                          {" "}
                        </div>
                        {" "}
                      </div>
                      {" "}
                      {renderMemberActions(member)}                  {" "}
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

export default CommunityPage;
