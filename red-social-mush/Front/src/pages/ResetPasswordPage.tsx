import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logoGato from '../assets/logo-gato.png';
import { Lock, Loader2, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido');
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Por favor completa ambos campos');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/'), 3000);
      } else {
        setError('Error al restablecer la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FFD89C] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-1/2 h-full bg-[url('./assets/gatoLoginIzquierda.png')] bg-contain bg-no-repeat bg-left opacity-60 pointer-events-none"></div>
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border border-[#f7cda3]">
          <AlertTriangle className="w-12 h-12 mb-4 mx-auto text-red-600" />
          <h1 className="text-2xl font-bold text-[#B24700] mb-4">
            Enlace inválido
          </h1>
          <p className="text-gray-600 mb-6 text-sm">
            El enlace de recuperación no es válido o ha expirado.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-[#F45C1C] text-white py-3 rounded-xl font-bold hover:bg-[#c94917] transition shadow-md flex items-center justify-center transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFD89C] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-1/2 h-full bg-[url('./assets/gatoLoginIzquierda.png')] bg-contain bg-no-repeat bg-left opacity-60 pointer-events-none"></div>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-[#f7cda3]">
        <div className="flex justify-center mb-6">
          <img src={logoGato} alt="MUSH" className="w-16 h-16 object-contain rounded-full border-2 border-[#F45C1C]" />
        </div>

        <h1 className="text-3xl font-extrabold text-center text-[#B24700] mb-2">
          Restablecer contraseña
        </h1>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Ingresa tu nueva contraseña para continuar
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-300 rounded-xl p-6 text-center shadow-md">
            <CheckCircle className="w-12 h-12 mb-4 mx-auto text-green-600" />
            <h3 className="text-lg font-bold text-green-800 mb-2">
              ¡Contraseña restablecida!
            </h3>
            <p className="text-sm text-green-700 mb-4">
              Tu contraseña ha sido cambiada exitosamente. Redirigiendo...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center bg-[#fff8f5] rounded-xl shadow-inner px-4 py-3 border border-[#f3c7a5] focus-within:ring-2 focus-within:ring-[#F45C1C] transition-all">
                <Lock className="w-5 h-5 text-[#B24700] mr-3" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña (mín. 6 caracteres)"
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center bg-[#fff8f5] rounded-xl shadow-inner px-4 py-3 border border-[#f3c7a5] focus-within:ring-2 focus-within:ring-[#F45C1C] transition-all">
                <Lock className="w-5 h-5 text-[#B24700] mr-3" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar contraseña"
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 rounded-xl p-4 text-red-700 text-sm font-medium shadow-md">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#F45C1C] text-white py-3 rounded-xl font-bold hover:bg-[#c94917] transition shadow-lg disabled:opacity-60 flex items-center justify-center transform hover:-translate-y-0.5"
            >
              {loading ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                    <Lock className="w-5 h-5 mr-2" />
                )}
              {loading ? 'Procesando...' : 'Cambiar contraseña'}
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full text-[#B24700] font-bold hover:text-[#8f3900] transition flex items-center justify-center group mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
              Volver al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;