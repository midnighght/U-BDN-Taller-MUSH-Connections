import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">MiRedSocial</span>
          </div>

          {/* Menú de usuario */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700">Hola, {user.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <span className="text-gray-500">Inicia sesión</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;