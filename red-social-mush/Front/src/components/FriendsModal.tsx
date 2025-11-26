import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendships_api } from '../services/friendships.api';
import { Users, Search, X, User, Trash2, UserCheck, Loader2, MinusCircle } from 'lucide-react';

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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[#f7cda3]"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="bg-[#FFE5C2] p-6 text-[#B24700] rounded-t-3xl border-b border-[#f7cda3]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Mis Amigos
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-[#F45C1C] transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar amigos..."
              className="w-full px-4 py-3 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F45C1C] shadow-inner"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              <Search className="w-5 h-5" />
            </span>
          </div>

          <p className="text-sm text-[#B24700] font-medium mt-3">
            {filteredFriends.length} {filteredFriends.length === 1 ? 'amigo' : 'amigos'}
            {searchQuery && ` encontrado${filteredFriends.length === 1 ? '' : 's'}`}
          </p>
        </div>

        
        <div className="flex-1 overflow-y-auto p-6 bg-[#fff8f5]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin h-8 w-8 text-[#F45C1C]" />
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <UserCheck className="w-10 h-10 mb-2 text-gray-400" />
              <p className="text-sm font-medium">
                {searchQuery ? 'No se encontraron amigos' : 'Aún no tienes amigos'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredFriends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center justify-between bg-white hover:bg-[#FFE5C2]/50 p-4 rounded-xl transition shadow-md border border-[#f7cda3]/50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    
                    <div className="w-12 h-12 rounded-full bg-[#B24700] flex-shrink-0 overflow-hidden border-2 border-[#F45C1C]">
                      {friend.userPhoto ? (
                        <img
                          src={friend.userPhoto}
                          alt={friend.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#B24700] truncate text-lg">
                        {friend.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleVisitProfile(friend._id)}
                      className="flex items-center px-4 py-2 bg-[#F45C1C] text-white rounded-xl hover:bg-[#c94917] transition text-sm font-bold shadow-md transform hover:scale-105"
                    >
                        <User className="w-4 h-4 mr-1" />
                      Ver perfil
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friend._id, friend.username)}
                      className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition text-sm font-bold shadow-md transform hover:scale-105"
                    >
                        <MinusCircle className="w-4 h-4 mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        
        <div className="border-t border-[#f7cda3] p-4 bg-white rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#B24700] text-white rounded-xl hover:bg-[#8f3900] transition font-bold shadow-lg transform hover:-translate-y-0.5"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendsModal;