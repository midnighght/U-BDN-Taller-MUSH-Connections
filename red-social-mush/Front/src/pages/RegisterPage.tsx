import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Intentando registro con:', email, username, password);
    const result = await register(email, password, username);
    if (result.success) {
      alert('Registro exitoso');
      navigate('/')
    } else {
      alert(result.error);
    }

    alert('Registro enviado (aquí va la lógica)');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFD89C] relative overflow-hidden">
      {/* Fondo con el gato */}
      <div className="absolute left-0 top-0 w-[700px] h-full bg-[url('./assets/gatoLoginIzquierda.png')] bg-contain bg-no-repeat bg-left opacity-95"></div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center w-full">
        {/* Tarjeta */}
        <div className="w-[480px] bg-[#FFE5C2]/90 backdrop-blur-md rounded-3xl shadow-lg px-10 py-12 flex flex-col">
          <h1 className="text-4xl font-extrabold text-[#B24700] mb-10 text-center">
            Crear cuenta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Nombre completo"
              required
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Correo electrónico"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Contraseña"
              required
            />

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
              {loading ? 'Registrando...' : 'Registrarme'}
            </button>

            {/* Botón para volver al login */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-[#B24700] hover:underline font-medium"
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Logo MUSH */}
      <h2 className="absolute bottom-6 left-12 text-5xl font-extrabold text-[#B24700]">
        MUSH
      </h2>
    </div>
  );
};

export default RegisterPage;
