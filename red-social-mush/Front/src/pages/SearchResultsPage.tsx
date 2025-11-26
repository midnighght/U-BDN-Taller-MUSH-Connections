import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PostGrid from '../components/PostGrid';
import { search_api } from '../services/search.api';
import type { SearchResults } from '../services/search.api';
import { useAuth } from '../hooks/useAuth';
import { Loader2, Search, Users, Home, Camera, Lock, ArrowRight, User } from 'lucide-react';


const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'communities' | 'posts'>('all');

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || !token) return;
      
      setLoading(true);
      try {
        const data = await search_api.globalSearch(query, token);
        setResults(data);
      } catch (error) {
        console.error('Error en búsqueda:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, token]);

  const filteredResults = () => {
    if (!results) return { users: [], communities: [], posts: [] };
    
    switch (activeTab) {
      case 'users':
        return { users: results.users, communities: [], posts: [] };
      case 'communities':
        return { users: [], communities: results.communities, posts: [] };
      case 'posts':
        return { users: [], communities: [], posts: results.posts };
      default:
        return results;
    }
  };

  const filtered = filteredResults();

  const handleCommunityClick = (communityId: string) => {
    navigate(`/communities/${communityId}`);
  };

  return (
    <div className="min-h-screen bg-[#fff8f5]">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-20">
        
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#B24700] flex items-center">
                <Search className="w-6 h-6 mr-2" />
            Resultados para: <span className="text-[#F45C1C] ml-2">"{query}"</span>
          </h1>
          {results && (
            <p className="text-gray-600 mt-2 font-medium">
              {results.total} {results.total === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
          )}
        </div>

        
        <div className="flex space-x-4 mb-8 border-b border-[#f7cda3]">
          {[
            { id: 'all', label: 'Todo', count: results?.total || 0, icon: Search },
            { id: 'users', label: 'Usuarios', count: results?.users.length || 0, icon: Users },
            { id: 'communities', label: 'Comunidades', count: results?.communities.length || 0, icon: Home },
            { id: 'posts', label: 'Posts', count: results?.posts.length || 0, icon: Camera }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-bold transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-[#F45C1C] border-b-4 border-[#F45C1C]'
                  : 'text-gray-600 hover:text-[#B24700]'
              }`}
            >
                <tab.icon className="w-5 h-5" />
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-12 w-12 border-b-2 text-[#F45C1C]" />
          </div>
        )}

        
        {!loading && results && results.total === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-[#f7cda3]/50">
            <Search className="w-12 h-12 mb-4 block mx-auto text-[#F45C1C]" />
            <p className="text-[#B24700] text-xl font-semibold">No se encontraron resultados</p>
            <p className="text-gray-600 text-sm mt-2">Intenta con otra búsqueda o revisa la ortografía.</p>
          </div>
        )}

        
        {!loading && results && (
          <div className="space-y-10">
            {/* USUARIOS */}
            {filtered.users.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-[#B24700] mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" /> Usuarios
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.users.map(user => (
                    <div
                      key={user._id}
                      onClick={() => navigate(`/users/${user._id}`)}
                      className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition cursor-pointer border border-[#f7cda3]/50 transform hover:scale-[1.01]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-[#B24700] overflow-hidden flex-shrink-0 border-2 border-[#F45C1C]">
                            {user.userPhoto ? (
                              <img src={user.userPhoto} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-white m-auto" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#B24700] text-lg">{user.username}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                                Ver perfil <ArrowRight className="w-3 h-3 ml-1" />
                            </p>
                          </div>
                        </div>
                        
                        {user.isPrivate && (
                          <div className="flex items-center gap-1 text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">
                            <Lock className="w-4 h-4" />
                            <span>Privado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

           {/* COMUNIDADES */}
            {filtered.communities.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-[#B24700] mb-4 flex items-center gap-2">
                        <Home className="w-5 h-5" /> Comunidades
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.communities.map(community => (
                            <div
                              key={community._id}
                              onClick={() => handleCommunityClick(community._id)}
                              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition cursor-pointer border border-[#f7cda3]/50 transform hover:scale-[1.01]"
                              >
                                  <div className="flex items-start space-x-4">
                                      <div className="w-16 h-16 rounded-xl bg-[#F45C1C] overflow-hidden flex-shrink-0 border-2 border-[#B24700]">
                                          {community.mediaURL ? (
                                              <img src={community.mediaURL} alt={community.name} className="w-full h-full object-cover" />
                                          ) : (
                                              <Home className="w-8 h-8 text-white m-auto" />
                                          )}
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                              <h3 className="font-bold text-[#B24700] text-xl">{community.name}</h3>
                                              {community.isPrivate && (
                                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                                      <Lock className="w-3 h-3" /> Privada
                                                  </span>
                                              )}
                                          </div>
                                          <p className="text-sm text-gray-700 line-clamp-2">{community.description}</p>
                                          <div className="flex items-center gap-3 mt-2">
                                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {community.membersCount} miembros
                                            </span>
                                              {community.hashtags && community.hashtags.length > 0 && (
                                                  <span className="text-xs text-[#F45C1C] font-semibold">
                                                      #{community.hashtags[0]}
                                                  </span>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                            ))}
                        </div>
                    </section>
            )}

            {/* POSTS */}
            {filtered.posts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-[#B24700] mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5" /> Publicaciones
                </h2>
                <PostGrid 
                  posts={filtered.posts} 
                  cols={3} 
                  showAuthor={true} 
                />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;