import Header from '../components/Header';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import CommunityManager from '../components/CommunityManager';
import FriendsModal from '../components/FriendsModal';
import FeedPost from '../components/FeedPost';
import { friendships_api } from '../services/friendships.api';
import { feed_api } from '../services/feed.api';
import { communities_api } from '../services/communities.api';
import type { FeedPost as FeedPostType } from '../services/feed.api';

interface Friend {
  _id: string;
  username: string;
  userPhoto?: string;
}

interface Community {
  _id: string;
  name: string;
  mediaURL: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  membersCount: number;
  adminsCount: number;
}

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  
  // ✅ Estado para comunidades
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  
  // Estados para el feed
  const [feedPosts, setFeedPosts] = useState<FeedPostType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetchFriends();
    fetchFeed();
    fetchCommunities();
  }, []);

  const fetchFriends = async () => {
    if (!token) return;
    
    try {
      setLoadingFriends(true);
      const data = await friendships_api.getFriendsLimited(token, 5);
      setFriends(data);
    } catch (error) {
      console.error('Error al cargar amigos:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  // ✅ Cargar comunidades
  const fetchCommunities = async () => {
    if (!token) return;
    
    try {
      setLoadingCommunities(true);
      const data = await communities_api.getMyCommunitiesDetailed(token);
      setCommunities(data.slice(0, 5)); // Mostrar solo las primeras 5
    } catch (error) {
      console.error('Error al cargar comunidades:', error);
    } finally {
      setLoadingCommunities(false);
    }
  };

  const fetchFeed = async (refresh = false) => {
    if (!token) return;
    
    try {
      if (!refresh) {
        setLoading(true);
      }
      
      const data = await feed_api.getFeed(token, 1, 10);
      setFeedPosts(data.posts);
      setHasMore(data.pagination.hasMore);
      setPage(1);
    } catch (error) {
      console.error('Error al cargar feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!token || loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const data = await feed_api.getFeed(token, nextPage, 10);
      
      setFeedPosts(prev => [...prev, ...data.posts]);
      setHasMore(data.pagination.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error al cargar más posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePostUpdate = () => {
    fetchFeed(true);
  };

  // ✅ Obtener badge de rol
  const getRoleBadge = (community: Community) => {
    if (community.isSuperAdmin) {
      return <span className="text-[10px] text-purple-500">👑</span>;
    }
    if (community.isAdmin) {
      return <span className="text-[10px] text-orange-500">⭐</span>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col">
      <Header />

      <main className="flex flex-1 mt-4 px-8 space-x-8 max-w-7xl mx-auto w-full">
        {/* COLUMNA IZQUIERDA: COMUNIDADES */}
        <aside className="w-1/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Comunidades</h2>
            <button
              onClick={() => setOpenModal(true)}
              className="text-sm bg-gradient-to-r from-orange-400 to-red-400 text-white px-3 py-1 rounded-full shadow hover:scale-105 transition"
            >
              ⚙️
            </button>
          </div>

          {loadingCommunities ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : communities.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <span className="text-3xl mb-2 block">🏘️</span>
              <p className="text-sm mb-2">No tienes comunidades</p>
              <button
                onClick={() => setOpenModal(true)}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Crear o unirse
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {communities.map((community) => (
                <div
                  key={community._id}
                  onClick={() => navigate(`/communities/${community._id}`)}
                  className="flex items-center p-2 rounded-xl hover:bg-white hover:shadow-md transition cursor-pointer group"
                >
                  {/* Imagen */}
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-yellow-400 rounded-full overflow-hidden flex-shrink-0">
                    {community.mediaURL ? (
                      <img
                        src={community.mediaURL}
                        alt={community.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-lg">
                        🏘️
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {community.name}
                      </p>
                      {getRoleBadge(community)}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {community.membersCount + community.adminsCount} miembros
                    </p>
                  </div>

                  {/* Flecha */}
                  <span className="text-gray-300 group-hover:text-orange-400 transition">
                    →
                  </span>
                </div>
              ))}

              {/* Ver todas */}
              {communities.length >= 5 && (
                <button
                  onClick={() => setOpenModal(true)}
                  className="w-full text-center text-sm text-orange-500 hover:text-orange-600 font-medium py-2"
                >
                  Ver todas →
                </button>
              )}
            </div>
          )}
        </aside>

        {/* COLUMNA CENTRAL: FEED */}
        <section className="flex-1">
          <div className="mb-6">
            <PostCard />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : feedPosts.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-md p-12 text-center">
              <span className="text-6xl mb-4 block">📸</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No hay publicaciones
              </h3>
              <p className="text-gray-500">
                Sigue a más personas o únete a comunidades para ver contenido aquí
              </p>
            </div>
          ) : (
            <>
              {feedPosts.map((post, index) => {
                if (index === feedPosts.length - 1) {
                  return (
                    <div key={post._id} ref={lastPostRef}>
                      <FeedPost post={post} onPostUpdate={handlePostUpdate} />
                    </div>
                  );
                }
                return <FeedPost key={post._id} post={post} onPostUpdate={handlePostUpdate} />;
              })}

              {loadingMore && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              )}

              {!hasMore && feedPosts.length > 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">🎉 Has visto todas las publicaciones</p>
                </div>
              )}
            </>
          )}
        </section>

        {/* COLUMNA DERECHA: AMIGOS */}
        <aside className="w-1/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Amigos</h2>
            <button
              onClick={() => setShowFriendsModal(true)}
              className="text-sm bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1 rounded-full shadow hover:scale-105 transition"
            >
              Ver todos
            </button>
          </div>

          {loadingFriends ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <span className="text-3xl mb-2 block">👥</span>
              <p className="text-sm">Aún no tienes amigos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  onClick={() => navigate(`/users/${friend._id}`)}
                  className="flex items-center p-2 rounded-xl hover:bg-white hover:shadow-md transition cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full overflow-hidden flex-shrink-0">
                    {friend.userPhoto ? (
                      <img
                        src={friend.userPhoto}
                        alt={friend.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {friend.username}
                    </p>
                  </div>
                  <span className="text-gray-300 group-hover:text-orange-400 transition">
                    →
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Sugerencias (placeholder) */}
          <h2 className="text-xl font-bold mt-8 mb-4 text-gray-800">
            Sugerencias
          </h2>
          <div className="text-center py-4 text-gray-400">
            <p className="text-sm">Próximamente</p>
          </div>
        </aside>
      </main>

      {openModal && (
        <CommunityManager 
          onClose={() => {
            setOpenModal(false);
            fetchCommunities(); // ✅ Recargar comunidades al cerrar
          }} 
        />
      )}
      {showFriendsModal && <FriendsModal onClose={() => setShowFriendsModal(false)} />}
    </div>
  );
};

export default HomePage;