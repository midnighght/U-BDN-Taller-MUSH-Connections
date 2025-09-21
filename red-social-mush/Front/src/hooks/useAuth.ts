import { useState } from 'react';
import { api } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // ESTA ES UNA PETICIÓN SIMULADA - LA CAMBIAREMOS LUEGO
      console.log('Intentando login con:', email, password);
      
      // Simulamos una respuesta exitosa después de 1 segundo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de usuario de prueba
      const mockUser = {
        id: '1',
        name: 'Usuario de Prueba',
        email: email,
        avatar: ''
      };
      
      setUser(mockUser);
      localStorage.setItem('token', 'token-simulado-para-pruebas');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error en el login' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return { user, loading, login, logout };
};