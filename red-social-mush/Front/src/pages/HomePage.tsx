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
import { suggestions_api } from '../services/suggestions.api';
import type { FeedPost as FeedPostType } from '../services/feed.api';

import { Settings, Users, ArrowRight, Home, Lightbulb, UserCheck, Loader2, Crown, Star } from 'lucide-react'; 

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

interface Suggestion {
  _id: string;
  username: string;
  userPhoto?: string;
  bio?: string;
  mutualFriends: number;
}

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  
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
    fetchSuggestions();
  }, []);

  const fetchFriends = async () => {
    if (!token) return;
    
    try {
      setLoadingFriends(true);
      const data = await friendships_api.getFriendsLimited(token, 5);
      setFriends(data);
    } catch (error) {
      console.error('Error al cargar amigos');
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!token) return;
    
    try {
      setLoadingSuggestions(true);
      const data = await suggestions_api.getFriendSuggestions(token, 5);
      setSuggestions(data);
    } catch (error) {
      console.error('Error al cargar sugerencias:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const fetchCommunities = async () => {
    if (!token) return;
    
    try {
      setLoadingCommunities(true);
      const data = await communities_api.getMyCommunitiesDetailed(token);
      setCommunities(data.slice(0, 5));
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

  const getRoleBadge = (community: Community) => {
    if (community.isSuperAdmin) {
      return <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />;
    }
    if (community.isAdmin) {
      return <Star className="w-3 h-3 text-orange-500 fill-orange-500" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col">
      <Header />
      <div className="pt-20"></div>

      <main className="flex flex-1 mt-4 px-4 md:px-8 space-x-0 md:space-x-8 max-w-7xl mx-auto w-full">
        {/* COLUMNA IZQUIERDA: COMUNIDADES */}
        <aside className="hidden lg:block lg:w-1/4 xl:w-1/5 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto pr-2">
          <div className="bg-white rounded-xl shadow-md p-4 border border-[#f7cda3]/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#B24700] flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Mis Comunidades
              </h2>
              <button
                onClick={() => setOpenModal(true)}
                className="text-sm bg-[#F45C1C] text-white p-1 rounded-full shadow-md hover:scale-110 transition group"
                title="Administrar Comunidades"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {loadingCommunities ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-6 w-6 text-[#F45C1C]" />
              </div>
            ) : communities.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Home className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-xs mb-2">No tienes comunidades</p>
                <button
                  onClick={() => setOpenModal(true)}
                  className="text-[#F45C1C] hover:text-[#B24700] text-xs font-medium"
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
                    className="flex items-center p-2 rounded-lg hover:bg-[#fff8f5] transition cursor-pointer group border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-8 h-8 bg-[#FFD89C] rounded-full overflow-hidden flex-shrink-0 border border-[#f7cda3]">
                      {community.mediaURL ? (
                        <img
                          src={community.mediaURL}
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#B24700] text-md">
                          <Home className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {community.name}
                        </p>
                        {getRoleBadge(community)}
                      </div>
                      <p className="text-[10px] text-gray-500">
                        {community.membersCount + community.adminsCount} miembros
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#F45C1C] transition opacity-0 group-hover:opacity-100" />
                  </div>
                ))}

                {communities.length >= 5 && (
                  <button
                    onClick={() => setOpenModal(true)}
                    className="w-full text-center text-sm text-[#F45C1C] hover:text-[#B24700] font-medium py-2 mt-2"
                  >
                    Ver todas <ArrowRight className="inline w-3 h-3 ml-1" />
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* COLUMNA CENTRAL: FEED */}
        <section className="w-full lg:w-3/4 xl:w-3/5">
          <div className="mb-6">
            <PostCard /> 
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin h-12 w-12 text-[#F45C1C]" />
            </div>
          ) : feedPosts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-[#f7cda3]/50">
              <Lightbulb className="w-10 h-10 mx-auto mb-4 text-[#F45C1C]" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                ¡El feed está vacío!
              </h3>
              <p className="text-gray-500">
                Sigue a más personas o únete a comunidades para ver contenido aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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
                  <Loader2 className="animate-spin h-6 w-6 text-[#F45C1C]" />
                </div>
              )}

              {!hasMore && feedPosts.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm font-medium">✨ Has visto todas las publicaciones</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* COLUMNA DERECHA: AMIGOS Y SUGERENCIAS */}
        <aside className="hidden md:block md:w-1/4 xl:w-1/5 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto pl-2">
          
          {/* Sección de Amigos */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-[#f7cda3]/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#B24700] flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Amigos
              </h2>
              <button
                onClick={() => setShowFriendsModal(true)}
                className="text-xs bg-[#F45C1C] hover:bg-[#c94917] text-white px-3 py-1 rounded-full font-semibold shadow-md transition-all"
              >
                Ver todos
              </button>
            </div>

            {loadingFriends ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-6 w-6 text-[#F45C1C]" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-xs">Aún no tienes amigos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => navigate(`/users/${friend._id}`)}
                    className="flex items-center p-2 rounded-lg hover:bg-[#fff8f5] transition cursor-pointer group border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-8 h-8 bg-[#FFD89C] rounded-full overflow-hidden flex-shrink-0 border border-[#f7cda3]">
                      {friend.userPhoto ? (
                        <img
                          src={friend.userPhoto}
                          alt={friend.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold bg-[#B24700]">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {friend.username}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#F45C1C] transition opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección de Sugerencias */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-[#f7cda3]/50">
            <h2 className="text-lg font-bold mb-4 text-[#B24700] flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Sugerencias
            </h2>

            {loadingSuggestions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-6 w-6 text-purple-600" />
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-xs">No hay sugerencias disponibles</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion._id}
                    onClick={() => navigate(`/users/${suggestion._id}`)}
                    className="flex items-center p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition cursor-pointer group border border-purple-100"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full overflow-hidden flex-shrink-0 border border-purple-200">
                      {suggestion.userPhoto ? (
                        <img
                          src={suggestion.userPhoto}
                          alt={suggestion.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold bg-purple-600 text-sm">
                          {suggestion.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {suggestion.username}
                      </p>
                      <p className="text-[10px] text-purple-600">
                        {suggestion.mutualFriends} {suggestion.mutualFriends === 1 ? 'amigo' : 'amigos'} en común
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-300 group-hover:text-purple-500 transition opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>

      {openModal && (
        <CommunityManager 
          onClose={() => {
            setOpenModal(false);
            fetchCommunities();
          }} 
        />
      )}
      {showFriendsModal && <FriendsModal onClose={() => setShowFriendsModal(false)} />}
    </div>
  );
};

export default HomePage;