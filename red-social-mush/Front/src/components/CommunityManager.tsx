import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { communities_api } from "../services/communities.api";
import { useAuth } from "../hooks/useAuth";
import { X, Home, Plus, Globe, Users, Crown, Star, Lock, LogOut, Camera, Trash2, Hash, ArrowLeft, Loader2, ArrowRight, Upload } from "lucide-react";

interface Community {
  _id: string;
  name: string;
  description: string;
  mediaURL: string;
  hashtags: string[];
  isPrivate: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  membersCount: number;
  adminsCount: number;
  createdAt: string;
}

interface CommunityManagerProps {
  onClose: () => void;
}

const CommunityManager: React.FC<CommunityManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<"mis" | "crear" | "explorar">("mis");
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [communityData, setCommunityData] = useState({
    name: "",
    description: "",
    hashtags: "",
    image: "",
    preview: "",
  });

  const token = user?.token || localStorage.getItem("auth_token");

  useEffect(() => {
    if (section === "mis") {
      fetchMyCommunities();
    }
  }, [section, token]);

  const fetchMyCommunities = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const communities = await communities_api.getMyCommunitiesDetailed(token);
      setMyCommunities(communities);
    } catch (error) {
      console.error("Error al cargar comunidades:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (community: Community): { label: string; color: string; icon: React.ReactNode } => {
    if (community.isSuperAdmin) {
      return { label: "SuperAdmin", color: "bg-yellow-500", icon: <Crown className="w-3 h-3 text-white fill-current" /> };
    }
    if (community.isAdmin) {
      return { label: "Admin", color: "bg-[#F45C1C]", icon: <Star className="w-3 h-3 text-white fill-current" /> };
    }
    return { label: "Miembro", color: "bg-[#B24700]", icon: <Users className="w-3 h-3 text-white" /> };
  };

  const handleCommunityClick = (communityId: string) => {
    onClose();
    navigate(`/communities/${communityId}`);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("La imagen no puede superar los 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setCommunityData((prev) => ({
        ...prev,
        image: base64,
        preview: base64,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await communities_api.createComunity(
        communityData.name,
        communityData.description,
        communityData.hashtags,
        communityData.image,
        token
      );
      alert("Comunidad creada con éxito");
      setSection("mis");
      setCommunityData({ name: "", description: "", hashtags: "", image: "", preview: "" });
      fetchMyCommunities();
    } catch (error) {
      console.log("Error al crear comunidad:", error);
      alert("Error al crear la comunidad");
    }
  };

  const handleLeaveCommunity = async (e: React.MouseEvent, communityId: string, isSuperAdmin: boolean) => {
    e.stopPropagation(); 
    
    if (isSuperAdmin) {
      alert("No puedes salir de esta comunidad porque eres el creador. Debes transferir la propiedad primero.");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres salir de esta comunidad?")) {
      return;
    }

    if (!token) return;

    try {
      const response = await communities_api.leaveCommunity(communityId, token);

      if (response.success) {
        alert("Has salido de la comunidad exitosamente");
        fetchMyCommunities();
      } else {
        alert("Error al salir de la comunidad");
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al salir de la comunidad");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div 
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto border border-[#f7cda3]"
            onClick={(e) => e.stopPropagation()}
        >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-[#F45C1C] transition p-1"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-bold text-[#B24700] mb-6 text-center">
          {section === "mis"
            ? "Administrar Comunidades"
            : section === "crear"
            ? "Crear Nueva Comunidad"
            : "Explorar Comunidades"}
        </h3>

        <div className="flex justify-center space-x-3 mb-6">
          {[{ key: "mis", label: "Mis comunidades", icon: Home }, 
             { key: "explorar", label: "Explorar", icon: Globe }, 
             { key: "crear", label: "Crear", icon: Plus }].map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md flex items-center transition transform hover:scale-105 ${
                section === s.key
                  ? "bg-[#F45C1C] text-white"
                  : "bg-[#FFE5C2] text-[#B24700] hover:bg-[#FFD89C]"
              }`}
            >
                <s.icon className="w-4 h-4 mr-2" />
              {s.label}
            </button>
          ))}
        </div>

        {section === "mis" && (
          <div className="space-y-3 mb-5 max-h-[400px] overflow-y-auto p-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-[#F45C1C]" />
              </div>
            ) : myCommunities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-[#fff8f5] rounded-xl border border-[#f7cda3]/50">
                <Home className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="mb-2 text-sm">No perteneces a ninguna comunidad aún</p>
                <button
                  onClick={() => setSection("crear")}
                  className="text-[#F45C1C] hover:text-[#B24700] font-bold text-sm transition"
                >
                  Crear o unirte a una comunidad
                </button>
              </div>
            ) : (
              myCommunities.map((community) => {
                const role = getUserRole(community);
                return (
                  <div
                    key={community._id}
                    onClick={() => handleCommunityClick(community._id)}
                    className="flex items-center justify-between bg-[#fff8f5] rounded-xl p-3 shadow-md hover:shadow-lg hover:bg-[#FFE5C2]/70 transition cursor-pointer group border border-[#f7cda3]/50"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#B24700] flex-shrink-0 border-2 border-[#F45C1C]">
                        {community.mediaURL ? (
                          <img
                            src={community.mediaURL}
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xl">
                            <Home className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-[#B24700] text-base truncate">
                            {community.name}
                          </p>
                          
                          <span className={`${role.color} text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1`}>
                                {role.icon}
                            {role.label}
                          </span>
                          
                          {community.isPrivate && (
                            <Lock className="w-3 h-3 text-gray-500" />
                          )}
                        </div>

                        {community.description && (
                          <p className="text-xs text-gray-600 truncate mt-0.5">
                            {community.description}
                          </p>
                        )}

                        <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                          {community.membersCount + community.adminsCount} miembros
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleLeaveCommunity(e, community._id, community.isSuperAdmin)}
                      className={`text-sm font-bold ml-2 px-3 py-1 rounded-full transition group-hover:opacity-100 flex items-center gap-1 ${
                        community.isSuperAdmin
                          ? "text-gray-400 cursor-not-allowed bg-gray-100"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                      title={community.isSuperAdmin ? "Debes transferir la propiedad primero" : "Salir de la comunidad"}
                    >
                      {community.isSuperAdmin ? <Crown className="w-4 h-4 text-gray-500 fill-current" /> : <LogOut className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {section === "explorar" && (
          <div className="space-y-4 mb-5 max-h-[400px] overflow-y-auto p-1">
            <div className="text-center py-8 text-gray-500 bg-[#fff8f5] rounded-xl border border-[#f7cda3]/50">
              <Globe className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-semibold">Próximamente: explorar comunidades públicas</p>
            </div>
          </div>
        )}

        {section === "crear" && (
          <form onSubmit={handleCreate} className="space-y-5 p-1">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-2">
                <div className="w-24 h-24 rounded-full bg-[#FFE5C2] overflow-hidden flex items-center justify-center border-2 border-[#F45C1C]">
                  {communityData.preview ? (
                    <img
                      src={communityData.preview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Camera className="text-[#B24700] w-8 h-8" />
                  )}
                </div>
                <label
                  htmlFor="community-image"
                  className="absolute bottom-0 right-0 bg-[#F45C1C] text-white rounded-full p-2 cursor-pointer text-xs hover:bg-[#c94917] transition shadow-md border-2 border-white"
                >
                  <Upload className="w-4 h-4" />
                </label>
                <input
                  id="community-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-600">Sube una foto de tu comunidad</p>
            </div>

            <input
              type="text"
              placeholder="Nombre de la comunidad"
              value={communityData.name}
              onChange={(e) => setCommunityData({ ...communityData, name: e.target.value })}
              className="w-full border border-[#f3c7a5] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#F45C1C] focus:outline-none bg-[#fff8f5] shadow-inner"
              required
            />

            <textarea
              placeholder="Descripción"
              value={communityData.description}
              onChange={(e) => setCommunityData({ ...communityData, description: e.target.value })}
              className="w-full border border-[#f3c7a5] rounded-xl px-4 py-3 h-24 focus:ring-2 focus:ring-[#F45C1C] focus:outline-none resize-none bg-[#fff8f5] shadow-inner"
              required
            />

            <div className="relative">
                <input
                    type="text"
                    placeholder="#Hashtags separados por coma"
                    value={communityData.hashtags}
                    onChange={(e) => setCommunityData({ ...communityData, hashtags: e.target.value })}
                    className="w-full border border-[#f3c7a5] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#F45C1C] focus:outline-none bg-[#fff8f5] shadow-inner pl-10"
                />
                <Hash className="w-5 h-5 text-gray-500 absolute top-1/2 left-3 transform -translate-y-1/2" />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setSection("mis")}
                className="flex items-center bg-gray-300 text-gray-800 px-4 py-3 rounded-xl font-bold hover:bg-gray-400 transition shadow-md"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver
              </button>

              <button
                type="submit"
                className="flex items-center bg-[#F45C1C] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#c94917] transition shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CommunityManager;