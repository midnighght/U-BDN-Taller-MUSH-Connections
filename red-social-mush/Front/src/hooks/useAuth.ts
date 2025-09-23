import { useState } from 'react';
import { api } from '../services/api';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    
    console.log('🔄 Iniciando proceso de login...');
    
    try {
      // Llamamos al servicio API
      const result = await api.login(email, password);
      
      console.log('🎉 Respuesta del backend recibida');
      
      // Si llegamos aquí, el login fue exitoso
      return { 
        success: true, 
        data: result 
      };
      
    } catch (err: any) {
      console.log('💥 Error capturado:', err.message);
      setError(err.message);
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    login
  };
};