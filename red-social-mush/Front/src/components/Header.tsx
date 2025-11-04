import { useAuth } from '../hooks/useAuth';
import logoGato from '../assets/logo-gato.png';
import { useNavigate } from 'react-router-dom';
const Header = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const redirectProfilePage = () => {
  return () => {
    navigate("/profile");
    return true;
  };
}
 const redirectHomePage = () => {
  navigate("/home");
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
        
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-300 flex items-center justify-center">     
             <img onClick ={redirectHomePage} src={logoGato} alt="Logo" className="object-cover w-full h-full" /> 
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="flex-1 mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full bg-[#FFE0B2] text-gray-700 rounded-full py-2 pl-4 pr-10 placeholder-gray-500 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 text-xl">🔍</span>
          </div>
        </div>

        {/* ÍCONOS DE USUARIO */}
        <div className="flex items-center space-x-4">
          <button onClick={redirectProfilePage()} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">👤</button>
          <button className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">🔔</button>
          
            <button
              onClick={logout}
              className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
            >🚪
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
