import { useState } from 'react';
import PostModal from './PostModal';
import { Camera, User, Hash } from 'lucide-react';

interface Post {
  _id: string;
  mediaURL: string;
  textBody?: string;
  hashtags?: string[];
  author?: {
    _id: string;
    username: string;
    userPhoto?: string;
  };
  authorID?: any; 
}

interface PostGridProps {
  posts: Post[];
  cols?: 2 | 3 | 4;
  showAuthor?: boolean;
  onPostDeleted?: () => void; 
  communityId?: string; 
  isAdmin?: boolean; 
}

const PostGrid: React.FC<PostGridProps> = ({ 
  posts, 
  cols = 2, 
  showAuthor = true,
  onPostDeleted,
  communityId,
  isAdmin = false
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  const handlePostDeleted = () => {
    setSelectedPostId(null);
    if (onPostDeleted) {
      onPostDeleted();
    }
  };

  return (
    <>
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-xl shadow-lg border border-[#f7cda3]/50">
          <Camera className="w-12 h-12 mb-4 text-[#B24700]" />
          <p className="text-[#B24700] text-lg font-semibold">No hay publicaciones para mostrar</p>
        </div>
      ) : (
        <div className={`grid ${gridCols[cols]} gap-6`}>
          {posts.map((post) => {
            const author = post.author || post.authorID;
            
            return (
              <article
                key={post._id}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition transform hover:scale-[1.02] border border-[#f7cda3]/50"
                onClick={() => setSelectedPostId(post._id)}
              >
                {showAuthor && author && (
                  <header className="flex items-center gap-3 p-3 border-b border-[#f7cda3]/30">
                    <div className="w-8 h-8 rounded-full bg-[#B24700] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {author.userPhoto ? (
                        <img 
                          src={author.userPhoto} 
                          alt={author.username} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <h3 className="text-sm text-[#B24700] font-bold">{author.username}</h3>
                  </header>
                )}

                <div className={`bg-[#FFE5C2] overflow-hidden ${showAuthor ? 'h-48' : 'aspect-square'}`}>
                  <img
                    src={post.mediaURL}
                    alt="Post content"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Imagen+no+disponible';
                    }}
                  />
                </div>

                {(post.textBody || (post.hashtags && post.hashtags.length > 0)) && (
                  <div className="p-3">
                    {post.textBody && (
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {post.textBody}
                      </p>
                    )}

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <Hash className="w-4 h-4 text-[#F45C1C] flex-shrink-0" />
                        {post.hashtags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs text-[#F45C1C] font-medium">
                            #{tag}
                          </span>
                        ))}
                        {post.hashtags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{post.hashtags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          onPostDeleted={handlePostDeleted}
          communityId={communityId}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
};

export default PostGrid;