import Header from "../components/Header";
import PostGrid from "../components/PostGrid";
import { posts_api } from "../services/posts.api.ts";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api.ts";
import { useNavigate } from "react-router-dom";
import { User, Settings, Edit, Users, Image, Bookmark, Trash2, Lock, Unlock, LogOut, X, Check, Camera, MessageCircle, Heart } from "lucide-react"; 

interface Post {
  _id: string;
  mediaURL: string;
  textBody: string;
  authorID: string;
  usertags: string[];
  hashtags: string[];
  createdAt?: string;
}

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [communitiesCount, setCommunitiesCount] = useState(0);
  const [newBio, setNewBio] = useState("");
  const [newProfilePic, setNewProfilePic] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [friendsCount, setFriendsCount] = useState(0);
  const token = localStorage.getItem("auth_token");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) return console.error("Token is null");
        const response = await api.obtainUserData(token);
        setBio(response.description);
        setProfilePic(response.userPhoto);
        setIsPrivate(response.isPrivate);
        setCommunitiesCount(response.communities);
        setFriendsCount(response.friends || 0);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchUserData();
  }, [token, newProfilePic]);

  const fetchPosts = async () => {
    try {
      if (!token) return console.error("Token is null");
      const response = await posts_api.obtainUserPosts(token);
      console.log("posts: ", response);
      setPosts(response);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handlePrivacyChange = async (privacy: boolean) => {
    setIsPrivate(privacy);
    try {
      if (!token) return console.error("Token is null");
      await api.updateAccountPrivacy(token, privacy);
    } catch (error) {
      console.error("Error:", error);
      setIsPrivate(!privacy);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewProfilePic(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "¿Seguro que deseas borrar tu cuenta? Esta acción es irreversible."
      )
    ) {
      if (!token) return;
      await api.deleteAccount(token);
      alert("Cuenta eliminada");
      navigate("/");
    }
  };

  const handleSubmit = async () => {
    if (!token) return;

    if (newProfilePic !== "") {
      try {
        const response = await api.updatePhoto(newProfilePic, token);
        if (response) {
          setProfilePic(newProfilePic);
          setNewProfilePic("");
        }
      } catch (error) {
        console.error("Error updating photo:", error);
      }
    }

    if (newBio !== "") {
      try {
        const response = await api.updateDescription(newBio, token);
        if (response) {
          setBio(newBio);
          setNewBio("");
        }
      } catch (error) {
        console.error("Error updating bio:", error);
      }
    }
  };


  return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col pt-16">
      <Header />
      {/* Contenedor Principal */}
      <div className="flex-1 bg-gradient-to-b from-[#FFE5C2] to-[#FFD89C] p-6">
        <div className="max-w-6xl mx-auto flex gap-8">
          {/* Panel izquierdo */}
          <aside className="w-80 bg-transparent sticky top-20 h-fit">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-[#f7cda3]">
              <div className="flex flex-col items-center">
                {/* Foto de Perfil */}
                <div className="w-32 h-32 rounded-full bg-[#FFE5C2] shadow-xl border-4 border-white flex items-center justify-center mb-4 overflow-hidden">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-[#B24700]" />
                  )}
                </div>

                <h2 className="text-3xl font-extrabold text-[#B24700] mb-1">
                  @{user?.username}
                </h2>
                


                {/* Botones de Acción */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="flex items-center px-4 py-2 rounded-xl bg-gray-100 text-[#B24700] font-semibold shadow-md hover:bg-gray-200 transition"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Ajustes
                  </button>
                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex items-center px-4 py-2 rounded-xl bg-[#F45C1C] text-white font-semibold shadow-md hover:bg-[#c94917] transition"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar perfil
                  </button>
                </div>

                {/* Biografía */}
                <div className="w-full bg-[#fff8f5] rounded-xl p-4 mb-6 shadow-inner border border-[#f7cda3]/50">
                  <p className="text-sm text-gray-700 leading-5">
                    {bio || "Breve bio o descripción del usuario. ¡Haz clic en Editar para añadir una!"}
                  </p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  {/* Amigos */}
                  <div className="bg-[#FFE5C2]/60 rounded-xl p-3 text-center shadow-sm">
                    <Users className="w-5 h-5 mx-auto mb-1 text-[#B24700]" />
                    <div className="text-xs text-gray-600">Amigos</div>
                    <div className="font-bold text-lg text-[#B24700]">{friendsCount}</div>
                  </div>
                  {/* Posts */}
                  <div className="bg-[#FFE5C2]/60 rounded-xl p-3 text-center shadow-sm">
                    <Image className="w-5 h-5 mx-auto mb-1 text-[#B24700]" />
                    <div className="text-xs text-gray-600">Posts</div>
                    <div className="font-bold text-lg text-[#B24700]">{posts.length}</div>
                  </div>
                  {/* Comunidades */}
                  <div className="bg-[#FFE5C2]/60 rounded-xl p-3 text-center shadow-sm">
                    <Bookmark className="w-5 h-5 mx-auto mb-1 text-[#B24700]" />
                    <div className="text-xs text-gray-600">Comunidades</div>
                    <div className="font-bold text-lg text-[#B24700]">{communitiesCount}</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Feed principal */}
          <section className="flex-1">
            <PostGrid
              posts={posts}
              cols={2}
              showAuthor={false}
              onPostDeleted={fetchPosts}
            />
          </section>
        </div>
      </div>

      {/* MODAL EDITAR PERFIL  */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[420px] text-center relative border border-[#f7cda3]">
            <button
              onClick={() => { setEditOpen(false); setNewBio(""); setNewProfilePic(""); }} // Limpiar estados al cerrar
              className="absolute top-4 right-4 text-gray-500 hover:text-[#F45C1C] transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-[#B24700] mb-6">
              Editar Perfil
            </h2>

            <div className="flex flex-col items-center mb-6">
              {/* Contenedor de la imagen  */}
              <div className="w-32 h-32 rounded-full bg-[#FFE5C2] shadow-xl border-4 border-[#f7cda3] mb-4 overflow-hidden flex items-center justify-center">
                {newProfilePic || profilePic ? (
                  <img
                    src={newProfilePic || profilePic}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-10 h-10 text-[#B24700]" />
                )}
              </div>

              <label className="flex items-center cursor-pointer text-sm text-[#F45C1C] font-bold hover:text-[#B24700] transition">
                <Image className="w-4 h-4 mr-1" />
                Cambiar imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              placeholder={bio || "Escribe una breve descripción..."}
              className="w-full h-24 border border-[#f3c7a5] rounded-xl p-3 text-sm text-gray-700 bg-[#fff8f5] focus:ring-2 focus:ring-[#F45C1C] mb-6 resize-none shadow-inner"
            />

            <button
              onClick={() => {
                setEditOpen(false);
                handleSubmit();
              }}
              className="w-full py-3 rounded-xl bg-[#F45C1C] hover:bg-[#c94917] text-white font-bold shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center"
            >
                <Check className="w-5 h-5 mr-2" />
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      {/* MODAL AJUSTES  */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-[400px] relative border border-[#f7cda3]">
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#F45C1C] transition"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-[#B24700] mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Ajustes
            </h2>

            {/* Opción de Privacidad */}
            <div className="flex items-center justify-between mb-8 bg-[#fff8f5] p-3 rounded-xl border border-[#f7cda3]/50">
              <span className="text-sm text-gray-700 font-medium flex items-center">
                    {isPrivate ? <Lock className="w-4 h-4 mr-2 text-red-500" /> : <Unlock className="w-4 h-4 mr-2 text-green-500" />}
                    Perfil privado
                </span>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => handlePrivacyChange(e.target.checked)}
                className="w-5 h-5 appearance-none rounded-full bg-gray-300 checked:bg-[#F45C1C] focus:ring-0 cursor-pointer transition"
              />
            </div>

            {/* Botón Borrar cuenta */}
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl mb-3 font-bold shadow-md transition flex items-center justify-center transform hover:-translate-y-0.5"
            >
                <Trash2 className="w-5 h-5 mr-2" />
              Borrar cuenta
            </button>

            {/* Botón Cerrar sesión */}
            <button
              onClick={logout}
              className="w-full bg-[#B24700] hover:bg-[#8f3900] text-white py-3 rounded-xl font-bold shadow-md transition flex items-center justify-center transform hover:-translate-y-0.5"
            >
                <LogOut className="w-5 h-5 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;