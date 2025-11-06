import Header from '../components/Header';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/PostCard';
import CommunityManager from '../components/CommunityManager';

const HomePage = () => {
  const user = useAuth();
  const [openModal, setOpenModal] = useState(false);

  console.log("Usuario en HomePage:", user);

  return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col">
      {/* HEADER */}
      <Header />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex flex-1 mt-4 px-8 space-x-8 max-w-7xl mx-auto w-full">
        {/* === COLUMNA IZQUIERDA: COMUNIDADES === */}
        <aside className="w-1/5 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Comunidades</h2>

            {/* Botón para abrir modal */}
            <button
              onClick={() => setOpenModal(true)}
              className="text-sm bg-gradient-to-r from-orange-400 to-red-400 text-white px-3 py-1 rounded-full shadow hover:scale-105 transition"
            >
              ⚙️
            </button>
          </div>

          {[1, 2].map((i) => (
            <div key={i} className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-yellow-400 rounded-full flex items-center justify-center text-2xl">
                🦴
              </div>
              <div className="ml-3">
                <p className="font-semibold text-gray-800 text-sm">
                  Nombre de Comunidad
                </p>
                <div className="flex space-x-2 mt-1">
                  <button className="bg-orange-500 text-white text-xs px-3 py-1 rounded">
                    Página
                  </button>
                  <button className="bg-red-500 text-white text-xs px-3 py-1 rounded">
                    Miembros
                  </button>
                </div>
              </div>
            </div>
          ))}
        </aside>

        {/* === COLUMNA CENTRAL: PUBLICACIONES === */}
        <section className="flex-1 space-y-8">
          <PostCard />
          {[1, 2].map((post) => (
            <div key={post} className="bg-white rounded-3xl shadow p-5">
              {/* Usuario */}
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <span className="ml-3 font-semibold text-gray-800 text-lg">
                  Nombre de Usuario
                </span>
              </div>

              {/* Imagen principal */}
              <div className="w-full h-64 bg-orange-200 rounded-3xl mb-3"></div>

              {/* Reacciones */}
              <div className="flex space-x-5 text-2xl mb-4">
                <button>🤍</button>
                <button>💔</button>
                <button>💬</button>
              </div>

              {/* Comentarios */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-bold text-gray-700 mb-3">Comentarios 💬</h4>

                {[1, 2, 3].map((c) => (
                  <div key={c} className="flex items-start mb-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full mt-1"></div>
                    <div className="ml-2 text-sm">
                      <p className="font-semibold text-gray-700">
                        Nombre de Usuario
                      </p>
                      <p className="text-gray-500 text-xs">Responder</p>
                    </div>
                  </div>
                ))}

                <input
                  type="text"
                  placeholder="Comenta algo..."
                  className="w-full mt-2 border border-gray-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          ))}
        </section>

        {/* === COLUMNA DERECHA: AMIGOS Y SUGERENCIAS === */}
        <aside className="w-1/5">
          {/* Amigos */}
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Amigos</h2>
          {[1, 2, 3].map((a) => (
            <div key={a} className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full"></div>
              <div className="ml-3">
                <p className="font-semibold text-gray-800 text-sm">
                  Nombre de Usuario
                </p>
                <button className="bg-orange-500 text-white text-xs px-3 py-1 rounded">
                  Perfil
                </button>
              </div>
            </div>
          ))}

          {/* Sugerencias */}
          <h2 className="text-2xl font-bold mt-8 mb-6 text-gray-800">
            Sugerencias
          </h2>
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-yellow-400 rounded-full"></div>
              <div className="ml-3">
                <p className="font-semibold text-gray-800 text-sm">
                  Nombre de Usuario
                </p>
                <div className="flex space-x-2 mt-1">
                  <button className="bg-orange-500 text-white text-xs px-3 py-1 rounded">
                    Perfil
                  </button>
                  <button className="bg-red-500 text-white text-xs px-3 py-1 rounded">
                    Seguir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </aside>
      </main>

      {/* === MODAL GESTIÓN DE COMUNIDADES === */}
      {openModal && (
        <CommunityManager onClose={() => setOpenModal(false)} />
      )}
    </div>
  );
};

export default HomePage;
