import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import uploadIcon from '../assets/uploadIcon.png';
import { api } from '../services/api.ts';
import { posts_api } from '../services/posts.api.ts';
const PostCard = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [taggedUsers, setTaggedUsers] = useState('');
  const [hashtags, setHashtags] = useState('');
  const token = localStorage.getItem('auth_token');
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file)
    }
  };

  const handleSubmit = async () => {
    if (!imageUrl) {
      alert('¡Debes subir una imagen!');
      return;
    }
    if(!token){
      return;
    }
    try {
      const response = await posts_api.createPost(imageUrl,description,taggedUsers,hashtags, token);
      if (response) {  
        console.log('Publicacion subida');
      }
    } catch (error) {
      console.error('Error al subir la publicación: ', error);
    }
    console.log({
      image,
      description,
      taggedUsers,
      hashtags
    });
    
    // Cerrar modal y limpiar formulario
    setIsOpen(false);
    setImage(null);
    setImagePreview(null);
    setDescription('');
    setTaggedUsers('');
    setHashtags('');
  };

  return (
    <div>
      {/* Botón flotante */}
      <button 
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
        onClick={() => setIsOpen(true)}
      >
         <img src={uploadIcon} alt="Subir Publicación" className="w-10 h-10 object-contain"/>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Crear Publicación ✨</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-5">
              {/* Usuario actual */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"></div>
                <span className="ml-3 font-semibold text-gray-800 text-lg">
                  {user?.username || 'Usuario'}
                </span>
              </div>

              {/* Subir imagen (OBLIGATORIO) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Imagen * <span className="text-orange-500">(Obligatorio)</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-orange-300 rounded-3xl cursor-pointer bg-orange-50 hover:bg-orange-100 transition"
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-3xl"
                      />
                    ) : (
                      <>
                        <span className="text-5xl mb-2">📷</span>
                        <span className="text-gray-600 font-medium">Haz clic para subir una imagen</span>
                        <span className="text-gray-400 text-sm mt-1">PNG, JPG hasta 10MB</span>
                      </>
                    )}
                  </label>
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="mt-2 text-sm text-red-500 hover:text-red-700"
                  >
                    Eliminar imagen
                  </button>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Descripción 💭
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="¿Qué quieres compartir?"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Hashtags 🏷️
                </label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#viajes #aventura #naturaleza"
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <p className="text-xs text-gray-500 mt-1">Agrega # antes de cada palabra</p>
              </div>

              {/* Etiquetar usuarios */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Etiquetar usuarios 👥
                </label>
                <input
                  type="text"
                  value={taggedUsers}
                  onChange={(e) => setTaggedUsers(e.target.value)}
                  placeholder="@usuario1, @usuario2..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <p className="text-xs text-gray-500 mt-1">Separa los usuarios con comas</p>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-full font-semibold hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white py-3 rounded-full font-semibold hover:opacity-90 transition shadow-lg"
                >
                  Publicar 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;