import Header from '../components/Header';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a tu red social! 🎉
          </h1>
          <p className="text-gray-600 mb-4">
            Has iniciado sesión exitosamente. Aquí construirás tu feed de publicaciones.
          </p>
          <div className="text-gray-400">
            <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p>Próximamente: Publicaciones, amigos, comunidades...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;