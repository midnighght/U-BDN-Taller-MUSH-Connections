import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { communities_api } from "../services/communities.api";
import { useAuth } from "../hooks/useAuth";

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

  // ✅ Obtener el rol del usuario en la comunidad
  const getUserRole = (community: Community): { label: string; color: string } => {
    if (community.isSuperAdmin) {
      return { label: "SuperAdmin", color: "bg-purple-500" };
    }
    if (community.isAdmin) {
      return { label: "Admin", color: "bg-orange-500" };
    }
    return { label: "Miembro", color: "bg-blue-500" };
  };

  // ✅ Navegar a la página de la comunidad
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
      alert("Comunidad creada con éxito 🎉");
      setSection("mis");
      setCommunityData({ name: "", description: "", hashtags: "", image: "", preview: "" });
      fetchMyCommunities();
    } catch (error) {
      console.log("Error al crear comunidad:", error);
      alert("Error al crear la comunidad");
    }
  };

  const handleLeaveCommunity = async (e: React.MouseEvent, communityId: string, isSuperAdmin: boolean) => {
    e.stopPropagation(); // ✅ Evitar que se dispare el click de la comunidad
    
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
        alert(response.message || "Error al salir de la comunidad");
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(error.message || "Error al salir de la comunidad");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[480px] shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg"
        >
          ✖
        </button>

        <h3 className="text-2xl font-semibold text-orange-700 mb-6 text-center">
          {section === "mis"
            ? "Mis comunidades"
            : section === "crear"
            ? "Crear nueva comunidad"
            : "Explorar comunidades"}
        </h3>

        {/* Navegación */}
        <div className="flex justify-center space-x-3 mb-6">
          {["mis", "explorar", "crear"].map((s) => (
            <button
              key={s}
              onClick={() => setSection(s as any)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                section === s
                  ? "bg-orange-400 text-white"
                  : "bg-orange-100 text-orange-600 hover:bg-orange-200"
              }`}
            >
              {s === "mis" ? "Mis comunidades" : s === "explorar" ? "Explorar" : "Crear"}
            </button>
          ))}
        </div>

        {/* === MIS COMUNIDADES === */}
        {section === "mis" && (
          <div className="space-y-3 mb-5 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : myCommunities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl block mb-2">🏘️</span>
                <p className="mb-2">No perteneces a ninguna comunidad aún</p>
                <button
                  onClick={() => setSection("crear")}
                  className="text-orange-500 hover:text-orange-600 font-semibold"
                >
                  Crear una comunidad
                </button>
              </div>
            ) : (
              myCommunities.map((community) => {
                const role = getUserRole(community);
                return (
                  <div
                    key={community._id}
                    onClick={() => handleCommunityClick(community._id)}
                    className="flex items-center justify-between bg-orange-50 rounded-xl p-3 shadow-sm hover:shadow-md hover:bg-orange-100 transition cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Imagen */}
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-orange-300 to-yellow-400 flex-shrink-0">
                        {community.mediaURL ? (
                          <img
                            src={community.mediaURL}
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xl">
                            🏘️
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-700 text-sm truncate">
                            {community.name}
                          </p>
                          
                          {/* ✅ Badge de rol */}
                          <span className={`${role.color} text-white text-[10px] px-2 py-0.5 rounded-full font-medium`}>
                            {role.label}
                          </span>
                          
                          {community.isPrivate && (
                            <span className="text-gray-400 text-xs">🔒</span>
                          )}
                        </div>

                        {community.description && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {community.description}
                          </p>
                        )}

                        <p className="text-[10px] text-gray-400 mt-1">
                          {community.membersCount + community.adminsCount} miembros
                        </p>
                      </div>
                    </div>

                    {/* Botón salir */}
                    <button
                      onClick={(e) => handleLeaveCommunity(e, community._id, community.isSuperAdmin)}
                      className={`text-xs font-semibold ml-2 px-2 py-1 rounded transition opacity-0 group-hover:opacity-100 ${
                        community.isSuperAdmin
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-500 hover:text-red-700 hover:bg-red-50"
                      }`}
                      title={community.isSuperAdmin ? "Debes transferir la propiedad primero" : "Salir de la comunidad"}
                    >
                      {community.isSuperAdmin ? "👑" : "Salir"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* === EXPLORAR === */}
        {section === "explorar" && (
          <div className="space-y-4 mb-5 max-h-60 overflow-y-auto">
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">🔍</span>
              <p>Próximamente: explorar comunidades públicas</p>
            </div>
          </div>
        )}

        {/* === CREAR === */}
        {section === "crear" && (
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {communityData.preview ? (
                    <img
                      src={communityData.preview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-gray-500 text-3xl">📸</span>
                  )}
                </div>
                <label
                  htmlFor="community-image"
                  className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-1.5 cursor-pointer text-xs hover:bg-orange-600"
                >
                  ⬆
                </label>
                <input
                  id="community-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Sube una foto de tu comunidad</p>
            </div>

            <input
              type="text"
              placeholder="Nombre de la comunidad"
              value={communityData.name}
              onChange={(e) => setCommunityData({ ...communityData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
              required
            />

            <textarea
              placeholder="Descripción"
              value={communityData.description}
              onChange={(e) => setCommunityData({ ...communityData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-orange-400 focus:outline-none resize-none"
              required
            />

            <input
              type="text"
              placeholder="#Hashtags separados por coma"
              value={communityData.hashtags}
              onChange={(e) => setCommunityData({ ...communityData, hashtags: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setSection("mis")}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Volver
              </button>

              <button
                type="submit"
                className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
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