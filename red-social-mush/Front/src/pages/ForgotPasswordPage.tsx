import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoGato from '../assets/logo-gato.png';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/api.config';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError('Error al enviar el correo');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFD89C] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-1/2 h-full bg-[url('./assets/gatoLoginIzquierda.png')] bg-contain bg-no-repeat bg-left opacity-60 pointer-events-none"></div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-[#f7cda3]">
        <div className="flex justify-center mb-6">
          <img src={logoGato} alt="MUSH" className="w-16 h-16 object-contain rounded-full border-2 border-[#F45C1C]" />
        </div>

        <h1 className="text-3xl font-extrabold text-center text-[#B24700] mb-2">
          ¿Contraseña olvidada?
        </h1>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Ingresa tu correo para recibir las instrucciones
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-300 rounded-xl p-6 text-center shadow-md">
            <CheckCircle className="w-12 h-12 mb-4 mx-auto text-green-600" />
            <h3 className="text-lg font-bold text-green-800 mb-2">
              ¡Correo enviado!
            </h3>
            <p className="text-sm text-green-700 mb-4">
              Revisa tu bandeja de entrada (y spam) para restablecer tu contraseña.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-[#B24700] text-white py-3 rounded-xl font-bold hover:bg-[#8f3900] transition shadow-lg mt-4"
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center bg-[#fff8f5] rounded-xl shadow-inner px-4 py-3 border border-[#f3c7a5] focus-within:ring-2 focus-within:ring-[#F45C1C] transition-all">
                <Mail className="w-5 h-5 text-[#B24700] mr-3" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 rounded-xl p-4 text-red-700 text-sm font-medium shadow-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F45C1C] text-white py-3 rounded-xl font-bold hover:bg-[#c94917] transition shadow-lg disabled:opacity-60 flex items-center justify-center transform hover:-translate-y-0.5"
            >
              {loading ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                    <Mail className="w-5 h-5 mr-2" />
                )}
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full text-[#B24700] font-bold hover:text-[#8f3900] transition flex items-center justify-center group mt-4"
            >
                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;