import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Intentando login con:', email);
    
    const result = await login(email, password);
    if (result.success) {
      console.log('✅ Login exitoso');
      navigate('/home');
    } else {
      console.log('Error:', result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFD89C] relative overflow-hidden">
      {/* Imagen de fondo izquierda */}
      <div className="absolute left-0 bottom-0 w-1/2 h-full bg-[url('./assets/gatoLoginIzquierda.png')] bg-contain bg-no-repeat bg-left opacity-80"></div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-4xl bg-[#FFE5C2]/80 backdrop-blur-md rounded-3xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Formulario */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          <h1 className="text-5xl font-extrabold text-[#B24700] mb-10 text-center">MUSH</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Correo electrónico"
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Contraseña"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F45C1C] hover:bg-[#e05318] text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="flex justify-center items-center mt-6 text-sm">
            <button
              type="button"
              onClick={() => navigate("/RegisterPage")}
              className="text-[#B24700] font-medium hover:underline"
            >
              Registrarse
            </button>
            <span className="mx-2 text-gray-400">|</span>
            <button
              type="button"
              onClick={() => console.log("Olvidé contraseña")}
              className="text-[#B24700] font-medium hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        {/* Imagen derecha visible solo en pantallas grandes */}
        <div className="hidden md:flex flex-1 items-center justify-center p-10">
          <img
            src="./assets/gatoLoginIzquierda.png"
            alt="Mush Cat"
            className="w-96 h-auto drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
