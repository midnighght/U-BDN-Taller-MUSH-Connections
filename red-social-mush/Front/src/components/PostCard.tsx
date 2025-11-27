import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import uploadIcon from "../assets/uploadIcon.png";
import { posts_api } from "../services/posts.api";
import {
  Upload,
  X,
  Camera,
  Hash,
  Users,
  Send,
  Loader2,
  MinusCircle,
  User,
} from "lucide-react";

interface PostCardProps {
  communityId?: string;
  onPostCreated?: () => void;
}

const PostCard = ({ communityId, onPostCreated }: PostCardProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [taggedUsers, setTaggedUsers] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("auth_token");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona una imagen válida");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("La imagen no puede superar los 10MB");
        return;
      }

      setImage(file);
      setError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      setError("¡Debes subir una imagen!");
      return;
    }
    if (!token) {
      setError("No hay token de autenticación");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const response = await posts_api.createPost(
        image,
        description,
        taggedUsers,
        hashtags,
        token,
        communityId
      );

      if (response) {
        console.log("Publicación creada");
        setIsOpen(false);
        setImage(null);
        setImagePreview(null);
        setDescription("");
        setTaggedUsers("");
        setHashtags("");
        setError("");

        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (error: any) {
      console.error("Error al subir la publicación:", error);
      setError("Error al crear el post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
          {" "}
      <button
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#F45C1C] text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-50 ring-4 ring-white ring-opacity-50"
        onClick={() => setIsOpen(true)}
      >
                <Upload className="w-8 h-8" />    {" "}
      </button>
          {" "}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                  {" "}
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#f7cda3]">
                                  {" "}
            <div className="sticky top-0 bg-[#FFE5C2]/80 backdrop-blur-sm border-b border-[#f7cda3] px-6 py-4 rounded-t-3xl flex items-center justify-between">
                          {" "}
              <h2 className="text-2xl font-bold text-[#B24700] flex items-center">
                <Camera className="w-6 h-6 mr-2" />              {" "}
                {communityId ? "Publicar en Comunidad" : "Nueva Publicación"}  
                        {" "}
              </h2>
                          {" "}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-[#F45C1C] text-2xl p-1 transition"
                disabled={uploading}
              >
                                <X className="w-6 h-6" />            {" "}
              </button>
                        {" "}
            </div>
                      {" "}
            <div className="p-6 space-y-5">
                          {" "}
              <div className="flex items-center mb-4">
                              {" "}
                <div className="w-10 h-10 bg-[#B24700] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                              {" "}
                <span className="ml-3 font-bold text-[#B24700] text-lg">
                                    {user?.username || "Usuario"}              {" "}
                </span>
                            {" "}
              </div>
                          {" "}
              <div>
                              {" "}
                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Imagen *{" "}
                  <span className="text-[#F45C1C] font-normal text-xs">
                    (Obligatorio)
                  </span>
                                {" "}
                </label>
                              {" "}
                <div className="relative">
                                  {" "}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                                  {" "}
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#F45C1C] rounded-2xl cursor-pointer bg-[#fff8f5] hover:bg-[#FFE5C2]/50 transition shadow-inner ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                                      {" "}
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <>
                                              {" "}
                        <Camera className="w-12 h-12 mb-2 text-[#F45C1C]" />  
                                          {" "}
                        <span className="text-[#B24700] font-medium">
                          Haz clic o arrastra una imagen
                        </span>
                                              {" "}
                        <span className="text-gray-500 text-sm mt-1">
                          PNG, JPG, GIF, WEBP (máximo 10MB)
                        </span>
                                            {" "}
                      </>
                    )}
                                    {" "}
                  </label>
                                {" "}
                </div>
                              {" "}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    disabled={uploading}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 flex items-center"
                  >
                    <MinusCircle className="w-4 h-4 mr-1" />                  
                    Eliminar imagen                 {" "}
                  </button>
                )}
                            {" "}
              </div>
                          {" "}
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-xl">
                                  {" "}
                  <p className="text-red-700 text-sm font-medium">
                    <X className="w-4 h-4 inline mr-1" />
                    {error}
                  </p>
                                {" "}
                </div>
              )}
                          {" "}
              <div>
                              {" "}
                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Descripción               {" "}
                </label>
                              {" "}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="¿Qué quieres compartir?"
                  rows={4}
                  disabled={uploading}
                  className="w-full px-4 py-3 border border-[#f3c7a5] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F45C1C] resize-none disabled:opacity-50 bg-[#fff8f5] shadow-inner"
                />
                            {" "}
              </div>
                          {" "}
              <div>
                              {" "}
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Hash className="w-4 h-4 mr-1" />                  Hashtags 
                              {" "}
                </label>
                              {" "}
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#viajes #aventura #naturaleza"
                  disabled={uploading}
                  className="w-full px-4 py-3 border border-[#f3c7a5] rounded-full focus:outline-none focus:ring-2 focus:ring-[#F45C1C] disabled:opacity-50 bg-[#fff8f5] shadow-inner"
                />
                              {" "}
                <p className="text-xs text-gray-500 mt-1">
                  Agrega # antes de cada palabra
                </p>
                            {" "}
              </div>
                          {" "}
              <div>
                              {" "}
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-1" />                  Etiquetar
                  usuarios               {" "}
                </label>
                              {" "}
                <input
                  type="text"
                  value={taggedUsers}
                  onChange={(e) => setTaggedUsers(e.target.value)}
                  placeholder="@usuario1, @usuario2..."
                  disabled={uploading}
                  className="w-full px-4 py-3 border border-[#f3c7a5] rounded-full focus:outline-none focus:ring-2 focus:ring-[#F45C1C] disabled:opacity-50 bg-[#fff8f5] shadow-inner"
                />
                              {" "}
                <p className="text-xs text-gray-500 mt-1">
                  Separa los usuarios con comas
                </p>
                            {" "}
              </div>
                          {" "}
              <div className="flex space-x-3 pt-4">
                              {" "}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={uploading}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-400 transition disabled:opacity-50 shadow-md"
                >
                                    Cancelar               {" "}
                </button>
                              {" "}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={uploading || !image}
                  className="flex-1 bg-[#F45C1C] text-white py-3 rounded-xl font-bold hover:bg-[#c94917] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:-translate-y-0.5"
                >
                                  {" "}
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                                          {" "}
                      <Loader2 className="h-5 w-5 animate-spin" />            
                              Publicando...                   {" "}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Send className="w-5 h-5 mr-2" />
                      Publicar
                    </span>
                  )}
                                {" "}
                </button>
                            {" "}
              </div>
                        {" "}
            </div>
                    {" "}
          </div>
                {" "}
        </div>
      )}
        {" "}
    </div>
  );
};

export default PostCard;
