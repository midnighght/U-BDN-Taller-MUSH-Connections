import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import NotificationsPanel from './NotificationsPanel';
import logoGato from '../assets/logo-gato.png';

const Header = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  if (loading) {
    return (
      <header className="bg-gradient-to-r from-orange-400 to-orange-600">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <div className="animate-pulse bg-orange-200 h-6 w-32 rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-6">
        
        {/* LOGO */}
        <div className="flex items-center space-x-2">
          <div 
            onClick={() => navigate("/home")}
            className="w-10 h-10 rounded-full overflow-hidden bg-orange-300 flex items-center justify-center cursor-pointer hover:scale-110 transition"
          >     
            <img src={logoGato} alt="Logo" className="object-cover w-full h-full" /> 
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="flex-1 mx-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar usuarios, comunidades o hashtags..."
              className="w-full bg-[#FFE0B2] text-gray-700 rounded-full py-2 pl-4 pr-10 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 text-xl hover:text-orange-700"
            >
              🔍
            </button>
          </form>
        </div>

        {/* ÍCONOS */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate("/profile")} 
            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
            title="Mi perfil"
          >
            👤
          </button>
          
          <NotificationsPanel />
          
          <button
            onClick={logout}
            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
            title="Cerrar sesión"
          >
            🚪
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;