import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import './App.css';

// Componente de carga
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

function App() {
  const { user, loading } = useAuth();

  // Mostrar spinner mientras carga la autenticación
  if (loading) {
    return <LoadingSpinner />;
  }

  // Mostrar HomePage si está autenticado, LoginPage si no
  return user ? <HomePage /> : <LoginPage />;
}

export default App;