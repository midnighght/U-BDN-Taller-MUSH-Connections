import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  console.log('=== 🚀 INICIANDO PRUEBA COMPLETA ===');
  console.log('1. 📝 Datos del formulario:');
  console.log('   Email:', email);
  console.log('   Password:', password);
  
  const result = await login(email, password);
  
  if (result.success) {
    console.log('=== ✅ PRUEBA EXITOSA ===');
    alert('¡FELICIDADES! 🎉\nFrontend y backend comunicándose correctamente.\n\nToken: ' + result.data.access_token);
    setEmail('');
    setPassword('');
  } else {
    console.log('=== ❌ PRUEBA FALLIDA ===');
    console.log('Error:', result.error);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          🔴 Error: {error}
        </div>
      )}
      
      {/* Campo email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email:
        </label>
        <input
          type="email"
          placeholder="test@test.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
          disabled={loading}
        />
      </div>
      
      {/* Campo password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña:
        </label>
        <input
          type="password"
          placeholder="cualquier contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
          disabled={loading}
        />
      </div>
      
      {/* Botón */}
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-medium"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
              <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Conectando con backend...
          </span>
        ) : (
          '🔗 Probar Conexión con Backend REAL'
        )}
      </button>
      
      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p>💡 <strong>Para probar:</strong></p>
        <p>• Email: cualquier email válido</p>
        <p>• Password: cualquier contraseña</p>
        <p>• Deberías ver una alerta de éxito</p>
      </div>
    </form>
  );
};

export default LoginForm;