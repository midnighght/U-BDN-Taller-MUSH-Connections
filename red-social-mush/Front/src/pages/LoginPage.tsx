import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, UserPlus, HelpCircle } from "lucide-react"; 

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) navigate("/home");
  };
 

  return (
  
    <div className="min-h-screen flex items-center justify-center bg-[#FFD89C] relative overflow-hidden p-4">
     
      <div className="absolute left-0 bottom-0 w-1/2 h-full bg-[url('./assets/gatoLoginIzquierda.png')] bg-contain bg-no-repeat bg-left opacity-70 pointer-events-none"></div>

   
      <div className="relative z-10 w-full max-w-sm lg:max-w-md bg-[#FFE5C2]/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-[#f7cda3]">
        
        <h1 className="text-5xl font-extrabold text-[#B24700] mb-3 text-center tracking-wide">
          MUSH
        </h1>
        <p className="text-center text-[#F45C1C] mb-10 text-xl font-medium">¡Bienvenido de vuelta!</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex items-center bg-white/90 rounded-xl shadow-inner px-4 py-3 border border-[#f3c7a5] focus-within:ring-2 focus-within:ring-[#F45C1C] transition-all duration-300 ease-in-out">
            <Mail className="w-5 h-5 text-[#B24700] mr-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-base"
              placeholder="Correo electrónico"
              required
            />
          </div>

          {/* Campo de Contraseña */}
          <div className="flex items-center bg-white/90 rounded-xl shadow-inner px-4 py-3 border border-[#f3c7a5] focus-within:ring-2 focus-within:ring-[#F45C1C] transition-all duration-300 ease-in-out">
            <Lock className="w-5 h-5 text-[#B24700] mr-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-base"
              placeholder="Contraseña"
              required
            />
          </div>

          {/* Mensaje de Error  */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm text-center font-medium shadow-md">
              {error}
            </div>
          )}

          {/* Botón Principal  */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-[#F45C1C] hover:bg-[#c94917] text-white py-3 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-60 disabled:shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Enlaces Secundarios  */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm space-y-3 sm:space-y-0">
          
          <button
            type="button"
            onClick={() => navigate("/RegisterPage")}
            className="flex items-center text-[#B24700] font-medium hover:text-[#8f3900] transition-colors group"
          >
            <UserPlus className="w-4 h-4 mr-1 transition-transform group-hover:scale-110" />
            <span className="border-b border-transparent group-hover:border-[#8f3900]">
              ¿No tienes cuenta? Regístrate
            </span>
          </button>

          <button
            onClick={() => navigate("/forgot-password")}
            className="flex items-center text-[#B24700] font-medium hover:text-[#8f3900] transition-colors group"
          >
            <HelpCircle className="w-4 h-4 mr-1 transition-transform group-hover:scale-110" />
            <span className="border-b border-transparent group-hover:border-[#8f3900]">
              ¿Olvidaste tu contraseña?
            </span>
          </button>
        </div>
        
        <p className="text-xs text-gray-400 text-center mt-8">© MUSH 2025. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default LoginPage;