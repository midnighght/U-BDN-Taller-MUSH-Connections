import Header from '../components/Header';
import PostGrid from '../components/PostGrid';
import { posts_api } from '../services/posts.api.ts';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api.ts';
import { useNavigate } from 'react-router-dom';

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
  const [newBio, setNewBio] = useState('');
  const [newProfilePic, setNewProfilePic] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  
  const token = localStorage.getItem('auth_token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) return console.error('Token is null');
        const response = await api.obtainUserData(token);
        setBio(response.description);
        setProfilePic(response.userPhoto);
        setIsPrivate(response.isPrivate);
        setCommunitiesCount(response.communities);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchUserData();
  }, [token, newProfilePic]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!token) return console.error('Token is null');
        const response = await posts_api.obtainUserPosts(token);
        console.log('posts: ', response);
        setPosts(response);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchPosts();
  }, [token]);

  const handlePrivacyChange = async (privacy: boolean) => {
    setIsPrivate(privacy);
    try {
      if (!token) return console.error('Token is null');
      await api.updateAccountPrivacy(token, privacy);
    } catch (error) {
      console.error('Error:', error);
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
    if (confirm('¿Seguro que deseas borrar tu cuenta? Esta acción es irreversible.')) {
      if (!token) return;
      await api.deleteAccount(token);
      alert('Cuenta eliminada');
      navigate('/');
    }
  };

  const handleSubmit = async () => {
    if (!token) return;
    
    if (newProfilePic !== '') {
      try {
        const response = await api.updatePhoto(newProfilePic, token);
        if (response) {
          setProfilePic(newProfilePic);
          setNewProfilePic('');
        }
      } catch (error) {
        console.error('Error updating photo:', error);
      }
    }

    if (newBio !== '') {
      try {
        const response = await api.updateDescription(newBio, token);
        if (response) {
          setBio(newBio);
          setNewBio('');
        }
      } catch (error) {
        console.error('Error updating bio:', error);
      }
    }
  };

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
                  {profilePic ? (
                    <img src={profilePic} alt="perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-orange-600">👤</span>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold text-orange-700 mb-3">{user?.username}</h2>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="px-4 py-2 rounded-lg bg-white text-orange-700 shadow-sm hover:bg-orange-100 transition">
                    Ajustes
                  </button>
                  <button
                    onClick={() => setEditOpen(true)}
                    className="px-4 py-2 rounded-lg bg-white text-orange-700 shadow-sm hover:bg-orange-100 transition">
                    Editar perfil
                  </button>
                </div>

                <div className="w-full bg-white rounded-lg p-4 mb-4 shadow">
                  <p className="text-sm text-gray-600 leading-5">
                    {bio || 'Breve bio o descripción del usuario.'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full">
                  <div className="bg-white rounded-lg p-3 text-center shadow">
                    <div className="text-sm text-gray-500">Amigos</div>
                    <div className="font-bold text-lg">100k</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow">
                    <div className="text-sm text-gray-500">Posts</div>
                    <div className="font-bold text-lg">{posts.length}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow">
                    <div className="text-sm text-gray-500">Comunidades</div>
                    <div className="font-bold text-lg">{communitiesCount}</div>
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
              currentUser={{
                username: user?.username || '',
                userPhoto: profilePic
              }}
            />
          </section>
        </div>
      </div>

      {/* MODAL EDITAR PERFIL */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-orange-50 to-yellow-50 p-8 rounded-3xl shadow-2xl w-[420px] text-center relative">
            <button
              onClick={() => setEditOpen(false)}
              className="absolute top-3 right-4 text-gray-500 text-xl hover:text-gray-700">
              ×
            </button>

            <h2 className="text-2xl font-bold text-orange-700 mb-6">Editar Perfil</h2>

            <div className="flex flex-col items-center mb-4">
              <div className="w-32 h-32 rounded-full bg-orange-100 shadow-inner mb-4 overflow-hidden flex items-center justify-center">
                {newProfilePic ? (
                  <img src={newProfilePic} alt="preview" className="w-full h-full object-cover" />
                ) : profilePic ? (
                  <img src={profilePic} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-orange-600">📷</span>
                )}
              </div>

              <label className="cursor-pointer text-sm text-orange-600 font-semibold hover:underline">
                Cambiar imagen
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              placeholder={bio || "Escribe una breve descripción..."}
              className="w-full h-24 border border-orange-200 rounded-xl p-3 text-sm text-gray-700 focus:ring-2 focus:ring-orange-300 mb-4 resize-none"
            />

            <button
              onClick={() => {
                setEditOpen(false);
                handleSubmit();
              }}
              className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow transition">
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      {/* MODAL AJUSTES */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[400px] relative">
            <button onClick={() => setSettingsOpen(false)} className="absolute top-2 right-3 text-gray-500 text-xl">×</button>
            <h2 className="text-xl font-bold text-orange-700 mb-4">Ajustes</h2>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-700">Perfil privado</span>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => handlePrivacyChange(e.target.checked)}
                className="w-5 h-5 accent-orange-500"
              />
            </div>

            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg mb-3 shadow transition">
              Borrar cuenta
            </button>

            <button
              onClick={logout}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg shadow transition">
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;