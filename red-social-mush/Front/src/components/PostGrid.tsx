import { useState } from 'react';
import PostModal from './PostModal';

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
  authorID?: any; // Puede ser string o objeto
}

interface PostGridProps {
  posts: Post[];
  cols?: 2 | 3 | 4;
  showAuthor?: boolean;
  currentUser?: {
    username: string;
    userPhoto?: string;
  };
}

const PostGrid: React.FC<PostGridProps> = ({ 
  posts, 
  cols = 2, 
  showAuthor = true 
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  return (
    <>
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="text-6xl mb-4">📸</span>
          <p className="text-gray-600 text-lg">No hay publicaciones</p>
        </div>
      ) : (
        <div className={`grid ${gridCols[cols]} gap-6`}>
          {posts.map((post) => {
            // Normalizar datos (puede venir como author o authorID)
            const author = post.author || post.authorID;
            
            return (
              <article
                key={post._id}
                className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition transform hover:scale-105"
                onClick={() => setSelectedPostId(post._id)}
              >
                {showAuthor && author && (
                  <header className="flex items-center gap-3 p-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {author.userPhoto ? (
                        <img 
                          src={author.userPhoto} 
                          alt={author.username} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-sm">👤</span>
                      )}
                    </div>
                    <h3 className="text-sm text-gray-600 font-semibold">{author.username}</h3>
                  </header>
                )}

                {/* Imagen del post */}
                <div className={`bg-orange-100 overflow-hidden ${showAuthor ? 'h-48' : 'aspect-square'}`}>
                  <img
                    src={post.mediaURL}
                    alt="Post"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Imagen+no+disponible';
                    }}
                  />
                </div>

                {/* Descripción y hashtags */}
                {(post.textBody || (post.hashtags && post.hashtags.length > 0)) && (
                  <div className="p-3">
                    {post.textBody && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {post.textBody}
                      </p>
                    )}

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs text-blue-500">
                            #{tag}
                          </span>
                        ))}
                        {post.hashtags.length > 3 && (
                          <span className="text-xs text-gray-400">
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

      {/* Modal de Post */}
      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </>
  );
};

export default PostGrid;