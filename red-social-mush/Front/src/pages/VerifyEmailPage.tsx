import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/api.config';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  
  const hasVerified = useRef(false);

  useEffect(() => {
    
    if (hasVerified.current) {
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

        const response = await fetch(
          `${API_BASE_URL}/auth/verify-email?token=${token}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

      
        if (data.success === true) {
          setStatus('success');
          setMessage('Email verificado exitosamente');
          
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Error al verificar el email. El enlace puede ser inválido o ya fue utilizado.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage('Error al conectar con el servidor');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFD89C] p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-[#f7cda3]">
        
        {status === 'loading' && (
          <div className="space-y-6">
            <Loader2 className="animate-spin h-12 w-12 text-[#F45C1C] mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[#B24700] mb-4">
              Verificando tu email...
            </h2>
            <p className="text-gray-600 font-medium">No cierres esta ventana</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              ¡Email Verificado!
            </h2>
            <p className="text-gray-700 font-medium">{message}</p>
            <p className="text-sm text-gray-500">
              Redirigiendo al inicio de sesión en 3 segundos...
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 px-6 py-3 bg-[#F45C1C] text-white rounded-xl font-bold hover:bg-[#c94917] transition shadow-lg flex items-center justify-center transform hover:-translate-y-0.5"
            >
              <Mail className="w-5 h-5 mr-2" /> Ir a iniciar sesión
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              Error de Verificación
            </h2>
            <p className="text-gray-700 font-medium">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-[#B24700] text-white rounded-xl font-bold hover:bg-[#8f3900] transition shadow-lg flex items-center justify-center transform hover:-translate-y-0.5"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Volver al inicio
              </button>
              <p className="text-sm text-gray-500">
                Si el problema persiste, contacta al soporte.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;