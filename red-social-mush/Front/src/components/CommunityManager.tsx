import React, { useState, useEffect } from "react";
import { communities_api } from "../services/communities.api";

interface Community {
  _id: string;
  name: string;
  description: string;
  mediaURL: string;
  hashtags: string[];
  isPrivate: boolean;
  isAdmin: boolean;
  membersCount: number;
  adminsCount: number;
  createdAt: string;
}

interface CommunityManagerProps {
  onClose: () => void;
}

const token = localStorage.getItem('auth_token');

const CommunityManager: React.FC<CommunityManagerProps> = ({ onClose }) => {
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

  // Cargar comunidades cuando se abre la sección "mis"
  useEffect(() => {
    if (section === "mis") {
      fetchMyCommunities();
    }
  }, [section]);

  const fetchMyCommunities = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const communities = await communities_api.getMyCommunitiesDetailed(token);
      setMyCommunities(communities);
      console.log('Mis comunidades:', communities);
    } catch (error) {
      console.error('Error al cargar comunidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // ✅ VALIDAR TIPO
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes');
    return;
  }

  // ✅ VALIDAR TAMAÑO (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert('La imagen no puede superar los 5MB. Por favor, elige una imagen más pequeña.');
    return;
  }

  console.log('Tamaño de imagen:', (file.size / 1024 / 1024).toFixed(2), 'MB'); // Ver tamaño

  const reader = new FileReader();
  reader.onloadend = () => {
    const base64 = reader.result as string;
    console.log('Tamaño base64:', (base64.length / 1024 / 1024).toFixed(2), 'MB'); // Ver tamaño en base64
    
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
      // Recargar las comunidades
      fetchMyCommunities();
    } catch (error) {
      console.log('Error al crear comunidad:', error);
      alert('Error al crear la comunidad');
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!confirm('¿Estás seguro de que quieres salir de esta comunidad?')) return;
    
    // TODO: Implementar la lógica para salir de la comunidad
    console.log('Salir de comunidad:', communityId);

    
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[430px] shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg"
        >
          ✖
        </button>

        {/* === TÍTULO === */}
        <h3 className="text-2xl font-semibold text-orange-700 mb-6 text-center">
          {section === "mis"
            ? "Mis comunidades"
            : section === "crear"
            ? "Crear nueva comunidad"
            : "Explorar comunidades"}
        </h3>

        {/* === NAVEGACIÓN ENTRE SECCIONES === */}
        <div className="flex justify-center space-x-3 mb-6">
          <button
            onClick={() => setSection("mis")}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              section === "mis"
                ? "bg-orange-400 text-white"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            Mis comunidades
          </button>
          <button
            onClick={() => setSection("explorar")}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              section === "explorar"
                ? "bg-orange-400 text-white"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            Explorar
          </button>
          <button
            onClick={() => setSection("crear")}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              section === "crear"
                ? "bg-orange-400 text-white"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            Crear
          </button>
        </div>

        {/* === SECCIÓN: MIS COMUNIDADES === */}
        {section === "mis" && (
          <div className="space-y-3 mb-5 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando comunidades...
              </div>
            ) : myCommunities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">No perteneces a ninguna comunidad aún</p>
                <button
                  onClick={() => setSection("crear")}
                  className="text-orange-500 hover:text-orange-600 font-semibold"
                >
                  Crear una comunidad
                </button>
              </div>
            ) : (
              myCommunities.map((community) => (
                <div
                  key={community._id}
                  className="flex items-center justify-between bg-orange-50 rounded-lg p-3 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Imagen de la comunidad */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-orange-300 to-yellow-400 flex-shrink-0">
                      {community.mediaURL ? (
                        <img
                          src={community.mediaURL}
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xl">
                          👥
                        </div>
                      )}
                    </div>

                    {/* Información de la comunidad */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-700 text-sm truncate">
                          {community.name}
                        </p>
                        {community.isAdmin && (
                          <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                        {community.isPrivate && (
                          <span className="text-gray-500 text-xs">🔒</span>
                        )}
                      </div>
                      
                      {community.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {community.description}
                        </p>
                      )}
                      
                      {community.hashtags && community.hashtags.length > 0 && (
                        <p className="text-xs text-orange-600 truncate">
                          {community.hashtags.map(tag => `#${tag}`).join(', ')}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        {community.membersCount} miembros • {community.adminsCount} admins
                      </p>
                    </div>
                  </div>

                  {/* Botón de salir */}
                  <button
                    onClick={() => handleLeaveCommunity(community._id)}
                    className="text-sm text-red-500 hover:text-red-700 font-semibold ml-2"
                  >
                    Salir
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* === SECCIÓN: EXPLORAR COMUNIDADES === */}
        {section === "explorar" && (
          <div className="space-y-4 mb-5 max-h-60 overflow-y-auto">
            {[1, 2, 3, 4].map((c) => (
              <div
                key={c}
                className="flex items-center justify-between bg-orange-50 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-yellow-400 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">
                      Comunidad Popular {c}
                    </p>
                    <p className="text-xs text-gray-500">#tecnología, #arte</p>
                  </div>
                </div>
                <button className="bg-orange-500 text-white text-xs px-3 py-1 rounded hover:bg-orange-600">
                  Unirse
                </button>
              </div>
            ))}
          </div>
        )}

        {/* === SECCIÓN: CREAR COMUNIDAD === */}
        {section === "crear" && (
          <form onSubmit={handleCreate} className="space-y-5">
            {/* Imagen tipo red social */}
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
              <p className="text-xs text-gray-500 mt-2">
                Sube una foto de tu comunidad
              </p>
            </div>

            <input
              type="text"
              placeholder="Nombre de la comunidad"
              value={communityData.name}
              onChange={(e) =>
                setCommunityData({ ...communityData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400"
              required
            />

            <textarea
              placeholder="Descripción"
              value={communityData.description}
              onChange={(e) =>
                setCommunityData({
                  ...communityData,
                  description: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-orange-400"
              required
            />

            <input
              type="text"
              placeholder="#Hashtags separados por coma"
              value={communityData.hashtags}
              onChange={(e) =>
                setCommunityData({ ...communityData, hashtags: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400"
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setSection("mis")}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              >
                Volver
              </button>

              <button
                type="submit"
                className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-2 rounded-lg font-semibold"
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