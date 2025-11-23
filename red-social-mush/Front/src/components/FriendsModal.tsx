import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendships_api } from '../services/friendships.api';

interface Friend {
  _id: string;
  username: string;
  userPhoto?: string;
}

interface FriendsModalProps {
  onClose: () => void;
}

const FriendsModal: React.FC<FriendsModalProps> = ({ onClose }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetchAllFriends();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = friends.filter(friend =>
        friend.username.toLowerCase().includes(query)
      );
      setFilteredFriends(filtered);
    }
  }, [searchQuery, friends]);

  const fetchAllFriends = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await friendships_api.getFriends(token);
      setFriends(data);
      setFilteredFriends(data);
    } catch (error) {
      console.error('Error al cargar amigos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string, username: string) => {
    if (!token) return;
    
    if (!confirm(`¿Eliminar a ${username} de tus amigos?`)) return;

    try {
      await friendships_api.removeFriend(friendId, token);
      setFriends(prev => prev.filter(f => f._id !== friendId));
      alert('Amigo eliminado');
    } catch (error) {
      console.error('Error al eliminar amigo:', error);
      alert('No se pudo eliminar al amigo');
    }
  };

  const handleVisitProfile = (friendId: string) => {
    navigate(`/users/${friendId}`);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Mis Amigos</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar amigos..."
              className="w-full px-4 py-3 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              🔍
            </span>
          </div>

          {/* Contador */}
          <p className="text-sm text-white/80 mt-2">
            {filteredFriends.length} {filteredFriends.length === 1 ? 'amigo' : 'amigos'}
            {searchQuery && ` encontrado${filteredFriends.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {/* Lista de amigos */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <span className="text-5xl mb-2">😕</span>
              <p className="text-sm">
                {searchQuery ? 'No se encontraron amigos' : 'Aún no tienes amigos'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredFriends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0 overflow-hidden">
                      {friend.userPhoto ? (
                        <img
                          src={friend.userPhoto}
                          alt={friend.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Nombre */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {friend.username}
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleVisitProfile(friend._id)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
                    >
                      Ver perfil
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friend._id, friend.username)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendsModal;