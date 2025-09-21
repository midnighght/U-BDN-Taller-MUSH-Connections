import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MiRedSocial</h1>
          <p className="text-gray-600">Conecta con tus amigos</p>
        </div>
        <LoginForm />
        <p className="text-center mt-6 text-gray-600">
          ¿No tienes cuenta?{' '}
          <span className="text-blue-500 hover:underline cursor-pointer">
            Regístrate aquí
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;