import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { posts_api } from '../services/posts.api';
import PostModal from './PostModal';
import { Heart, ThumbsDown, MessageSquare, Clock, Users, Home } from 'lucide-react';

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

  if (!localPost.authorID || !localPost.authorID.username) {
    console.warn('Post sin autor válido:', localPost._id);
    return null; 
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
      console.error('Error al dar dislike');
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
      <article className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#f7cda3]/50 transition-shadow hover:shadow-xl">
        
        <header className="flex items-center gap-3 p-3 border-b border-[#f7cda3]/30">
          <div className="w-9 h-9 rounded-full bg-[#B24700] overflow-hidden flex-shrink-0 border border-[#f7cda3]">
            {localPost.authorID.userPhoto ? (
              <img
                src={localPost.authorID.userPhoto}
                alt={localPost.authorID.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-md font-bold">
                {localPost.authorID.username.charAt(0).toUpperCase()}
              </div>
            )}
            </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <h3 className="font-bold text-base text-[#B24700]">
                {localPost.authorID.username}
              </h3>
              
              {localPost.community && (
                <>
                  <span className="text-gray-500 text-xs mx-1">en</span>
                  <button
                    onClick={handleCommunityClick}
                    className="flex items-center gap-1 hover:opacity-80 transition-opacity group"
                  >
                    {localPost.community.mediaURL ? (
                      <img
                        src={localPost.community.mediaURL}
                        alt={localPost.community.name}
                        className="w-4 h-4 rounded-full object-cover border border-[#F45C1C]"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-[#F45C1C] flex items-center justify-center">
                        <Home className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="font-semibold text-sm text-[#F45C1C] group-hover:underline">
                      {localPost.community.name}
                    </span>
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(localPost.createdAt)}
            </p>
          </div>
        </header>

        <div
          className="w-full h-80 bg-[#fff8f5] cursor-pointer relative"
          onClick={() => setShowModal(true)}
        >
          <img
            src={localPost.mediaURL}
            alt="Post content"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Imagen+no+disponible';
            }}
          />
          
          {localPost.community && (
            <div className="absolute top-3 left-3">
              <button
                onClick={handleCommunityClick}
                className="flex items-center gap-1.5 bg-[#B24700]/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs hover:bg-[#B24700]/80 transition-colors shadow-lg"
              >
                {localPost.community.mediaURL ? (
                  <img
                    src={localPost.community.mediaURL}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <Home className="w-4 h-4" />
                )}
                <span className="font-semibold truncate max-w-[120px]">
                  {localPost.community.name}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            
            <button
              onClick={handleLike}
              className="group flex items-center transition-transform hover:scale-110"
            >
              <Heart 
                className={`w-6 h-6 transition ${localPost.hasLiked ? 'text-red-500 fill-red-500' : 'text-gray-500 group-hover:text-red-400'}`} 
                fill={localPost.hasLiked ? 'currentColor' : 'none'}
              />
            </button>

            <button
              onClick={handleDislike}
              className="group flex items-center transition-transform hover:scale-110"
            >
              <ThumbsDown 
                className={`w-6 h-6 transition ${localPost.hasDisliked ? 'text-blue-500 fill-blue-500' : 'text-gray-500 group-hover:text-blue-400'}`}
                fill={localPost.hasDisliked ? 'currentColor' : 'none'}
              />
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="text-gray-500 hover:text-[#B24700] transition-transform hover:scale-110"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-2">
            <p className="font-bold text-sm text-[#B24700]">
              {localPost.likesCount} Me gusta
            </p>
          </div>

          {localPost.textBody && (
            <div className="mb-3 text-sm">
              <span className="font-semibold text-[#B24700] mr-2">
                {localPost.authorID.username}
              </span>
              <span className="text-gray-800">{localPost.textBody}</span>
            </div>
          )}

          {localPost.hashtags && localPost.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {localPost.hashtags.map((tag, i) => (
                <span key={i} className="text-xs text-[#F45C1C] font-medium hover:underline cursor-pointer">
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