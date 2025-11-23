import { useState, useEffect, useRef } from 'react';
import { posts_api } from '../services/posts.api';
import { comments_api } from '../services/comments.api';
import { useAuth } from '../hooks/useAuth';

interface Author {
  _id: string;
  username: string;
  userPhoto?: string;
}

interface Comment {
  _id: string;
  textBody: string;
  authorID: Author;
  createdAt: string;
  isEdited: boolean;
  replies: Comment[];
}

interface PostDetails {
  _id: string;
  mediaURL: string;
  textBody: string;
  hashtags: string[];
  authorID: Author | string;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  hasDisliked: boolean;
  createdAt: string;
}

interface PostModalProps {
  postId: string;
  onClose: () => void;
  onPostDeleted?: () => void;
  communityId?: string;
  isAdmin?: boolean;
}

const PostModal: React.FC<PostModalProps> = ({ 
  postId, 
  onClose, 
  onPostDeleted,
  communityId,
  isAdmin = false 
}) => {
  const { user } = useAuth();
  const [post, setPost] = useState<PostDetails | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('auth_token');

  // Helper para obtener datos del autor (puede venir como string u objeto)
  const getAuthorData = (author: Author | string | undefined): Author => {
    if (!author) return { _id: '', username: 'Usuario', userPhoto: '' };
    if (typeof author === 'string') {
      return { _id: author, username: 'Usuario', userPhoto: '' };
    }
    return author;
  };

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const fetchPostDetails = async () => {
    if (!token) return;
    try {
      const data = await posts_api.getPostById(postId, token);
      console.log('📸 Post cargado:', data);
      setPost(data);
    } catch (error) {
      console.error('Error cargando post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!token) return;
    try {
      const data = await comments_api.getCommentsByPost(postId, token);
      console.log('💬 Comentarios cargados (raw):', JSON.stringify(data, null, 2));
      
      const normalizeComment = (comment: any): Comment => ({
        _id: comment._id,
        textBody: comment.textBody,
        authorID: getAuthorData(comment.authorID),
        createdAt: comment.createdAt,
        isEdited: comment.isEdited || false,
        replies: Array.isArray(comment.replies) 
          ? comment.replies.map(normalizeComment) 
          : [],
      });
      
      const normalizedComments = Array.isArray(data) 
        ? data.map(normalizeComment) 
        : [];
      
      console.log('💬 Comentarios normalizados:', normalizedComments);
      setComments(normalizedComments);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      setComments([]);
    }
  };

  const handleLike = async () => {
    if (!token || !post) return;
    try {
      await posts_api.toggleLike(postId, token);
      fetchPostDetails();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDislike = async () => {
    if (!token || !post) return;
    try {
      await posts_api.toggleDislike(postId, token);
      fetchPostDetails();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddComment = async () => {
    if (!token || !newComment.trim()) return;
    try {
      if (replyingTo) {
        await comments_api.createComment(postId, newComment, token, replyingTo.id);
        setExpandedReplies(prev => new Set([...prev, replyingTo.id]));
      } else {
        await comments_api.createComment(postId, newComment, token);
      }
      setNewComment('');
      setReplyingTo(null);
      fetchComments();
      fetchPostDetails();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token) return;
    if (!confirm('¿Eliminar comentario?')) return;
    try {
      await comments_api.deleteComment(commentId, token);
      fetchComments();
      fetchPostDetails();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ✅ NUEVA función para eliminar post
  const handleDeletePost = async () => {
    if (!token || !post) return;
    
    const confirmDelete = window.confirm(
      '¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.'
    );
    
    if (!confirmDelete) return;

    try {
      const postAuthor = getAuthorData(post.authorID);
      const isOwner = postAuthor._id === user?.id;

      // Si es admin de comunidad y no es el autor
      if (isAdmin && !isOwner && communityId) {
        await posts_api.deletePostAsAdmin(communityId, postId, token);
      } else {
        // Usuario eliminando su propio post
        await posts_api.deletePost(postId, token);
      }

      alert('Post eliminado exitosamente');
      onClose();
      
      // Callback para actualizar la lista de posts
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error) {
      console.error('Error al eliminar post:', error);
      alert('No se pudo eliminar el post. Intenta de nuevo.');
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${diffWeeks}sem`;
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isAuthor = comment.authorID?._id === user?.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const showReplies = expandedReplies.has(comment._id);
    const author = getAuthorData(comment.authorID);
    
    // Limitar indentación máxima para que no se salga del contenedor
    const marginLeft = Math.min(depth * 40, 80);

    return (
      <div key={comment._id} className="mb-4" style={{ marginLeft: `${marginLeft}px` }}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`${depth > 0 ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0 overflow-hidden`}>
            {author.userPhoto ? (
              <img 
                src={author.userPhoto} 
                alt={author.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                {author.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div>
              <span className="font-semibold text-sm text-gray-900 mr-2">
                {author.username}
              </span>
              <span className="text-sm text-gray-800 break-words">
                {comment.textBody}
              </span>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-gray-400">
                {formatTimeAgo(comment.createdAt)}
              </span>
              
              <button
                onClick={() => {
                  setReplyingTo({ id: comment._id, username: author.username });
                  setNewComment(`@${author.username} `);
                }}
                className="text-xs text-gray-500 font-semibold hover:text-gray-700"
              >
                Responder
              </button>

              {isAuthor && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  Eliminar
                </button>
              )}

              {comment.isEdited && (
                <span className="text-xs text-gray-400">(editado)</span>
              )}
            </div>

            {/* Ver respuestas */}
            {hasReplies && (
              <button
                onClick={() => toggleReplies(comment._id)}
                className="flex items-center gap-2 mt-2 text-xs text-gray-500 font-semibold hover:text-gray-700"
              >
                <div className="w-6 h-px bg-gray-300"></div>
                {showReplies 
                  ? 'Ocultar respuestas' 
                  : `Ver ${comment.replies.length} respuesta${comment.replies.length > 1 ? 's' : ''}`
                }
              </button>
            )}
          </div>
        </div>

        {/* Respuestas anidadas */}
        {hasReplies && showReplies && (
          <div className="mt-3">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!post) return null;

  const postAuthor = getAuthorData(post.authorID);
  const isOwner = postAuthor._id === user?.id;
  const canDelete = isOwner || isAdmin; // ✅ Puede eliminar si es dueño o admin

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-50"
      >
        ×
      </button>

      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[700px] overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen */}
        <div className="w-1/2 bg-black flex items-center justify-center">
          {!imageError ? (
            <img
              src={post.mediaURL}
              alt="Post"
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <span className="text-6xl mb-2">🖼️</span>
              <span className="text-sm">Imagen no disponible</span>
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="w-1/2 flex flex-col h-full">
          {/* Header con botón eliminar */}
          <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 overflow-hidden flex-shrink-0">
                {postAuthor.userPhoto ? (
                  <img 
                    src={postAuthor.userPhoto} 
                    alt={postAuthor.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {postAuthor.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <span className="font-semibold text-gray-900">{postAuthor.username}</span>
            </div>

            {/* ✅ Botón eliminar */}
            {canDelete && (
              <button
                onClick={handleDeletePost}
                className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                title={isOwner ? "Eliminar tu post" : "Eliminar post (Admin)"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Comentarios con scroll */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Descripción del post */}
            {post.textBody && (
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 overflow-hidden flex-shrink-0">
                  {postAuthor.userPhoto ? (
                    <img src={postAuthor.userPhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                      {postAuthor.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-sm text-gray-900 mr-2">
                    {postAuthor.username}
                  </span>
                  <span className="text-sm text-gray-800">{post.textBody}</span>
                  
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.hashtags.map((tag, i) => (
                        <span key={i} className="text-sm text-blue-500">#{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(post.createdAt)}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de comentarios */}
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <span className="text-3xl mb-2">💬</span>
                <p className="text-sm">No hay comentarios aún</p>
                <p className="text-xs">¡Sé el primero en comentar!</p>
              </div>
            ) : (
              <div>{comments.map(comment => renderComment(comment))}</div>
            )}
          </div>

          {/* Acciones y input - fijo abajo */}
          <div className="border-t border-gray-200">
            {/* Botones de reacción */}
            <div className="flex items-center gap-4 p-4 pb-2">
              <button
                onClick={handleLike}
                className={`transition-transform hover:scale-110 ${post.hasLiked ? 'text-red-500' : 'text-gray-700'}`}
              >
                <svg className="w-7 h-7" fill={post.hasLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              
              <button
                onClick={handleDislike}
                className={`transition-transform hover:scale-110 ${post.hasDisliked ? 'text-blue-500' : 'text-gray-700'}`}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </button>

              <button className="text-gray-700 hover:text-gray-900 transition-transform hover:scale-110">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>

            {/* Contadores */}
            <div className="px-4 pb-2 flex gap-4">
              <span className="font-semibold text-sm text-gray-900">
                {post.likesCount} Me gusta
              </span>
              <span className="text-sm text-gray-500">
                {post.dislikesCount} No me gusta
              </span>
            </div>

            {/* Indicador de respuesta */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Respondiendo a <span className="font-semibold">@{replyingTo.username}</span>
                </span>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 p-4 pt-2">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Añade un comentario..."
                className="flex-1 text-sm border-none outline-none bg-transparent placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className={`text-sm font-semibold transition-colors ${
                  newComment.trim() 
                    ? 'text-blue-500 hover:text-blue-600' 
                    : 'text-blue-300 cursor-not-allowed'
                }`}
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;