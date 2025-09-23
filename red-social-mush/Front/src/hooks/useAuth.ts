import { useState, useEffect } from 'react';
import { api } from '../services/api';

// Definimos el tipo de usuario
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verificar si hay sesión guardada al cargar la página
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Simulamos un usuario existente (luego lo traeremos del backend)
      setUser({
        id: '1',
        email: 'usuario@existente.com',
        name: 'Usuario Existente'
      });
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

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setError('');
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
};