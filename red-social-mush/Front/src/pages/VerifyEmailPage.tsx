import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  
  const hasVerified = useRef(false);

  useEffect(() => {
    
    if (hasVerified.current) {
      console.log('⚠️ Ya se ejecutó la verificación, saltando...');
      return;
    }

    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado');
        return;
      }

      
      hasVerified.current = true;

      try {
        console.log('🔑 Token:', token);

        const response = await fetch(
          `http://localhost:3000/auth/verify-email?token=${token}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        const data = await response.json();
        console.log('Data recibida:', data);
        console.log('data.success:', data.success); // ✅ NUEVO
        console.log('data.message:', data.message); // ✅ NUEVO

      
        if (data.success === true) {
          console.log('Verificación exitosa');
          setStatus('success');
          setMessage(data.message || 'Email verificado exitosamente');
          
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          console.log('Verificación fallida:', data.message);
          setStatus('error');
          setMessage(data.message || 'Error al verificar el email');
        }
      } catch (error: any) {
        console.error('Error en fetch:', error);
        setStatus('error');
        setMessage('Error al conectar con el servidor');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFD89C]">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Verificando tu email...
            </h2>
            <p className="text-gray-600">Por favor espera un momento</p>
          </>
        )}

        {status === 'success' && (
          <>
            
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              ¡Email Verificado!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Redirigiendo al inicio de sesión en 3 segundos...
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Ir al inicio de sesión ahora
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Error de Verificación
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Volver al inicio
              </button>
              <p className="text-sm text-gray-500">
                Si el problema persiste, contacta al soporte
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;