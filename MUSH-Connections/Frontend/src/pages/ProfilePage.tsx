import Header from '../components/Header';
import { posts_api } from '../services/posts.api.ts';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
const API_BASE_URL = 'http://localhost:3000';

//Falta obtener posts del usuario.
const ProfilePage = () =>{
    const {user} = useAuth();
 const [posts, setPosts] = useState([]);
  const token = localStorage.getItem('auth_token');
 useEffect(() => {
    const fetchPosts = async () => {
  try {
    if (!token) {
      console.error('Token is null');
      return;
    }
    const response = await posts_api.obtainUserPosts(token);
    
    console.log(response);
    setPosts(response);
      
    
  } catch (error) {
    console.error('Error:', error);
  }
};

    fetchPosts();
  }, [user?.id]);

return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col">
      {/* HEADER */}
      <Header />
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-yellow-100 p-6">
      <div className="max-w-6xl mx-auto flex gap-8">
{/* Panel izquierdo */}
    <aside className="w-80 bg-transparent">
    <div className="bg-orange-200 rounded-2xl p-6 shadow-inner">
    <div className="flex flex-col items-center">
    <div className="w-32 h-32 rounded-full bg-white/60 shadow-md flex items-center justify-center mb-4">
    <span className="text-4xl text-orange-600">👤</span>
    </div>
    <h2 className="text-2xl font-extrabold text-orange-700 mb-3">{user?.username}</h2>


<div className="flex gap-3 mb-4">
<button className="px-4 py-2 rounded-lg bg-white text-orange-700 shadow-sm">Ajustes</button>
<button className="px-4 py-2 rounded-lg bg-white text-orange-700 shadow-sm">Editar perfil</button>
</div>


<div className="w-full bg-white rounded-lg p-4 mb-4 shadow">
<p className="text-sm text-gray-600 leading-5">Breve bio o descripción del usuario. Aquí puede ir información corta sobre gustos, ubicación o estado.</p>
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
        <div className="font-bold text-lg">3</div>
      </div>
</div>
</div>
</div>


{/* Espacio inferior */}
<div className="mt-6 h-40 rounded-2xl bg-transparent" />
</aside>


{/* Feed principal */}
 <section className="flex-1">
            <div className="grid grid-cols-2 gap-6">
              {posts.map(({mediaURL, textBody  }) => (
                <article  className="bg-white rounded-2xl shadow-md p-4">
                  <header className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">👤</div>
                    <h3 className="text-lg text-gray-600 font-semibold">{user?.username}</h3>
                  </header>

                  {/* ✅ Imagen del post */}
                  <div className="bg-orange-100 rounded-lg h-40 mb-3 overflow-hidden">
                    <img 
                      src={mediaURL}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* ✅ Descripción del post */}
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {textBody || 'Sin descripción'}
                  </p>
                </article>
              ))}
            </div>
          </section>
</div>
</div>
</div>
);
};
export default ProfilePage