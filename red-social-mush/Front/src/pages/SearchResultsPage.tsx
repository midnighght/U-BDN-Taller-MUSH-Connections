import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import type { SearchResults } from '../services/search.api';
import { search_api } from '../services/search.api';
import { useAuth } from '../hooks/useAuth';

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

  return (
    <div className="min-h-screen bg-[#fff8f5]">
      <Header />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Título de búsqueda */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Resultados para: <span className="text-orange-600">"{query}"</span>
          </h1>
          {results && (
            <p className="text-gray-600 mt-1">
              {results.total} {results.total === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
          )}
        </div>

        {/* Tabs de filtrado */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          {[
            { id: 'all', label: 'Todo', count: results?.total || 0 },
            { id: 'users', label: 'Usuarios', count: results?.users.length || 0 },
            { id: 'communities', label: 'Comunidades', count: results?.communities.length || 0 },
            { id: 'posts', label: 'Posts', count: results?.posts.length || 0 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === tab.id
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* No results */}
        {!loading && results && results.total === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-gray-600 text-lg">No se encontraron resultados</p>
            <p className="text-gray-500 text-sm">Intenta con otra búsqueda</p>
          </div>
        )}

        {/* Results */}
        {!loading && results && (
          <div className="space-y-6">
            {/* USUARIOS */}
            {filtered.users.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Usuarios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.users.map(user => (
                    <div
                      key={user._id}
                      onClick={() => navigate(`/users/${user._id}`)}
                      className="bg-white rounded-xl p-4 shadow hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-yellow-400 overflow-hidden">
                          {user.userPhoto ? (
                            <img src={user.userPhoto} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xl">👤</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.username}</p>
                          <p className="text-sm text-gray-500">Ver perfil →</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* COMUNIDADES */}
            {filtered.communities.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Comunidades</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.communities.map(community => (
                    <div
                      key={community._id}
                      className="bg-white rounded-xl p-4 shadow hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-300 to-yellow-400 overflow-hidden flex-shrink-0">
                          {community.mediaURL ? (
                            <img src={community.mediaURL} alt={community.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-2xl">🏘️</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{community.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{community.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-600">{community.membersCount} miembros</span>
                            {community.hashtags && community.hashtags.length > 0 && (
                              <span className="text-xs text-orange-600">
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
                <h2 className="text-xl font-bold text-gray-800 mb-4">Publicaciones</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filtered.posts.map(post => (
                    <div
                      key={post._id}
                      className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition cursor-pointer"
                    >
                      <div className="aspect-square bg-gray-200">
                        <img 
                          src={post.mediaURL} 
                          alt="Post" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400?text=No+disponible';
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden">
                            {post.author.userPhoto ? (
                              <img src={post.author.userPhoto} alt={post.author.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{post.author.username}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{post.textBody || 'Sin descripción'}</p>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.hashtags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="text-xs text-blue-500">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;