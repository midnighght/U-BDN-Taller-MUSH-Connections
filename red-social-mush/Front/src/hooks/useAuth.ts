import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// Definimos el tipo de usuario
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verificar si hay sesión guardada al cargar la página
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Hacer un fetch con la info del usuario
      const fetchUser = async () => {
        try {
          const response = await api.obtainUserData(token);
          if (response !=  null){
            console.log('token existente' + token + '  usuario:' + response.name);

            setUser(response.user);
            navigate('/home');
          }
          
        } catch (err: any) {
          setError(err.message);
          navigate('/login');
        }
      }
      fetchUser();

    }else if (token == null){
      navigate('/login');
    }
    setLoading(false);
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
      setUser(result.user);
      
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
    navigate('/login');
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