import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import NotificationsPanel from './NotificationsPanel';
import logoGato from '../assets/logo-gato.png';
import { Search, User, LogOut, Loader2, Bell } from 'lucide-react'; 

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
      <header className="bg-[#FFD89C] fixed top-0 left-0 w-full z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <div className="animate-pulse bg-[#f7cda3] h-6 w-32 rounded-lg"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-[#FFD89C] text-gray-800 shadow-lg fixed top-0 left-0 w-full z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4 sm:px-6">
        
        <div className="flex items-center space-x-2">
          <div 
            onClick={() => navigate("/home")}
            className="w-10 h-10 rounded-full overflow-hidden bg-[#F45C1C] flex items-center justify-center cursor-pointer hover:scale-110 transition shadow-md"
          >     
            <img src={logoGato} alt="MUSH Logo" className="object-cover w-full h-full" /> 
          </div>
          <h1 
            onClick={() => navigate("/home")} 
            className="text-2xl font-extrabold cursor-pointer text-[#B24700] hidden md:block"
          >
            MUSH
          </h1>
        </div>

        <div className="flex-1 mx-4 md:mx-8 max-w-lg hidden sm:block">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar usuarios, comunidades o hashtags..."
              className="w-full bg-white rounded-full py-2 pl-4 pr-10 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F45C1C] shadow-inner border border-[#f7cda3]/50"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B24700] hover:text-[#F45C1C] transition"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="flex items-center space-x-3">
          
          {/* Botón Perfil  */}
          <button 
            onClick={() => navigate("/profile")} 
            className="bg-[#B24700] p-2 rounded-full hover:bg-[#8f3900] transition shadow-md group"
            title="Mi perfil"
          >
            <User className="w-5 h-5 text-white group-hover:scale-105" />
          </button>
          
          {/* Botón de Notificaciones  */}
          <NotificationsPanel />
          
          {/* Botón Cerrar Sesión  */}
          <button
            onClick={logout}
            className="bg-[#B24700] p-2 rounded-full hover:bg-[#8f3900] transition shadow-md group"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5 text-white group-hover:scale-105" />
          </button>
        </div>
      </div >
    </header>
  );
};

export default Header;