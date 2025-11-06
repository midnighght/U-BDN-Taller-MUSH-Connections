import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// Definimos el tipo de usuario
interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  description?: string;
  token: string
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verificar si hay sesión guardada al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      // Si NO hay token, no hacer nada
      if (!token) {
        console.log('ℹ️ No hay token guardado');
        setLoading(false);
        return;
      }

      // Si hay token, verificar que sea válido
      try {
        console.log('🔍 Token encontrado, verificando...');
        const response = await api.obtainUserData(token);
        
        if (response) {
          console.log('✅ Token válido. Usuario:', response.username);
          setUser(response);

        } else {
          // Token inválido o expirado
          console.warn('⚠️ Token inválido, limpiando localStorage');
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      } catch (err: any) {
        console.error('❌ Error al verificar autenticación:', err);
        localStorage.removeItem('auth_token');
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await api.login(email, password);
      
      // Guardar el token
      if (result.access_token) {
        localStorage.setItem('auth_token', result.access_token);
      }
      
      // Guardar el usuario
      setUser(result);
      
      return { success: true, data: result };
      
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await api.register(email, password, username);
      return { success: true, data: result };
      
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    
    localStorage.removeItem('auth_token');
    setUser(null);
    setError('');
    navigate('/');
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };
};