import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { posts_api } from '../services/posts.api';
import PostModal from './PostModal';

interface Author {
  _id: string;
  username: string;
  userPhoto?: string;
}

interface Community {
  _id: string;
  name: string;
  mediaURL?: string;
}

interface FeedPostProps {
  post: {
    _id: string;
    mediaURL: string;
    textBody: string;
    hashtags: string[];
    createdAt: string;
    authorID: Author;
    likesCount: number;
    dislikesCount: number;
    hasLiked: boolean;
    hasDisliked: boolean;
    comunityID?: string | null;
    community?: Community | null;
  };
  onPostUpdate?: () => void;
}

const FeedPost: React.FC<FeedPostProps> = ({ post, onPostUpdate }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const token = localStorage.getItem('auth_token');

   // ✅ VALIDACIÓN: Si no hay autor, no renderizar el post
  if (!localPost.authorID || !localPost.authorID.username) {
    console.warn('⚠️ Post sin autor válido:', localPost._id);
    return null; // No renderizar este post
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    try {
      await posts_api.toggleLike(post._id, token);
      setLocalPost(prev => ({
        ...prev,
        hasLiked: !prev.hasLiked,
        likesCount: prev.hasLiked ? prev.likesCount - 1 : prev.likesCount + 1,
        hasDisliked: false,
        dislikesCount: prev.hasDisliked ? prev.dislikesCount - 1 : prev.dislikesCount,
      }));
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleDislike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    try {
      await posts_api.toggleDislike(post._id, token);
      setLocalPost(prev => ({
        ...prev,
        hasDisliked: !prev.hasDisliked,
        dislikesCount: prev.hasDisliked ? prev.dislikesCount - 1 : prev.dislikesCount + 1,
        hasLiked: false,
        likesCount: prev.hasLiked ? prev.likesCount - 1 : prev.likesCount,
      }));
    } catch (error) {
      console.error('Error al dar dislike:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(dateString).toLocaleDateString();
  };

  const handleCommunityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localPost.community?._id) {
      navigate(`/communities/${localPost.community._id}`);
    }
  };

  return (
    <>
      <article className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
        {/* Header */}
        <header className="flex items-center gap-2 p-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 overflow-hidden flex-shrink-0">
            {localPost.authorID.userPhoto ? (
              <img
                src={localPost.authorID.userPhoto}
                alt={localPost.authorID.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                {localPost.authorID.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <h3 className="font-semibold text-sm text-gray-900">
                {localPost.authorID.username}
              </h3>
              
              {/* ✅ Badge de comunidad */}
              {localPost.community && (
                <>
                  <span className="text-gray-400 text-xs">en</span>
                  <button
                    onClick={handleCommunityClick}
                    className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                  >
                    {localPost.community.mediaURL ? (
                      <img
                        src={localPost.community.mediaURL}
                        alt={localPost.community.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                        <span className="text-white text-[8px]">🏘️</span>
                      </div>
                    )}
                    <span className="font-semibold text-sm text-purple-600 hover:text-purple-700">
                      {localPost.community.name}
                    </span>
                  </button>
                </>
              )}
            </div>
            <p className="text-[10px] text-gray-500">{formatTimeAgo(localPost.createdAt)}</p>
          </div>
        </header>

        {/* Imagen */}
        <div
          className="w-full h-64 bg-gray-100 cursor-pointer relative"
          onClick={() => setShowModal(true)}
        >
          <img
            src={localPost.mediaURL}
            alt="Post"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Imagen+no+disponible';
            }}
          />
          
          {/* ✅ Badge flotante de comunidad (opcional, más visible) */}
          {localPost.community && (
            <div className="absolute top-2 left-2">
              <button
                onClick={handleCommunityClick}
                className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs hover:bg-black/70 transition-colors"
              >
                {localPost.community.mediaURL ? (
                  <img
                    src={localPost.community.mediaURL}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <span>🏘️</span>
                )}
                <span className="font-medium truncate max-w-[120px]">
                  {localPost.community.name}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="p-3">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={handleLike}
              className="transition-transform hover:scale-110"
            >
              <svg
                className={`w-7 h-7 ${localPost.hasLiked ? 'text-red-500 fill-current' : 'text-gray-700'}`}
                fill={localPost.hasLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            <button
              onClick={handleDislike}
              className="transition-transform hover:scale-110"
            >
              <svg
                className={`w-7 h-7 ${localPost.hasDisliked ? 'text-blue-500' : 'text-gray-700'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                />
              </svg>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="text-gray-700 hover:text-gray-900 transition-transform hover:scale-110"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>

          {/* Contadores */}
          <div className="mb-2">
            <p className="font-semibold text-sm text-gray-900">
              {localPost.likesCount} Me gusta
            </p>
          </div>

          {/* Descripción */}
          {localPost.textBody && (
            <div className="mb-2">
              <span className="font-semibold text-sm text-gray-900 mr-2">
                {localPost.authorID.username}
              </span>
              <span className="text-sm text-gray-800">{localPost.textBody}</span>
            </div>
          )}

          {/* Hashtags */}
          {localPost.hashtags && localPost.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {localPost.hashtags.map((tag, i) => (
                <span key={i} className="text-sm text-blue-500">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {showModal && (
        <PostModal
          postId={post._id}
          onClose={() => setShowModal(false)}
          onPostDeleted={onPostUpdate}
          communityId={post.comunityID || undefined}
        />
      )}
    </>
  );
};

export default FeedPost;