import { useState, useEffect, useRef } from "react";
import { posts_api } from "../services/posts.api";
import { comments_api } from "../services/comments.api";
import { useAuth } from "../hooks/useAuth";
import {
  Heart,
  ThumbsDown,
  MessageSquare,
  Trash2,
  X,
  Send,
  CornerDownRight,
  Loader2,
  Clock,
  User,
  UserMinus,
  Camera,
} from "lucide-react";

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
  isAdmin = false,
}) => {
  const { user } = useAuth();
  const [post, setPost] = useState<PostDetails | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("auth_token");

  const getAuthorData = (author: Author | string | undefined): Author => {
    if (!author) return { _id: "", username: "Usuario", userPhoto: "" };
    if (typeof author === "string") {
      return { _id: author, username: "Usuario", userPhoto: "" };
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
      setPost(data);
    } catch (error) {
      console.error("Error cargando post:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!token) return;
    try {
      const data = await comments_api.getCommentsByPost(postId, token);
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
      setComments(normalizedComments);
    } catch (error) {
      console.error("Error cargando comentarios:", error);
      setComments([]);
    }
  };

  const handleLike = async () => {
    if (!token || !post) return;
    try {
      await posts_api.toggleLike(postId, token);
      fetchPostDetails();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDislike = async () => {
    if (!token || !post) return;
    try {
      await posts_api.toggleDislike(postId, token);
      fetchPostDetails();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAddComment = async () => {
    if (!token || !newComment.trim()) return;
    try {
      if (replyingTo) {
        await comments_api.createComment(
          postId,
          newComment,
          token,
          replyingTo.id
        );
        setExpandedReplies((prev) => new Set([...prev, replyingTo.id]));
      } else {
        await comments_api.createComment(postId, newComment, token);
      }
      setNewComment("");
      setReplyingTo(null);
      fetchComments();
      fetchPostDetails();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token) return;
    if (!confirm("¿Eliminar comentario?")) return;
    try {
      await comments_api.deleteComment(commentId, token);
      fetchComments();
      fetchPostDetails();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!token || !post) return;
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer."
    );
    if (!confirmDelete) return;

    try {
      const postAuthor = getAuthorData(post.authorID);
      const isOwner = postAuthor._id === user?.id;

      if (isAdmin && !isOwner && communityId) {
        await posts_api.deletePostAsAdmin(communityId, postId, token);
      } else {
        await posts_api.deletePost(postId, token);
      }

      alert("Post eliminado exitosamente");
      onClose();
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error) {
      console.error("Error al eliminar post:", error);
      alert("No se pudo eliminar el post. Intenta de nuevo.");
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
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

    if (diffMins < 1) return "ahora";
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
    const marginLeft = Math.min(depth * 20, 40);

    return (
      <div
        key={comment._id}
        className="mb-4"
        style={{ marginLeft: `${marginLeft}px` }}
      >
               {" "}
        <div
          className={`flex items-start gap-3 ${
            depth > 0 ? "border-l border-gray-200 pl-3" : ""
          }`}
        >
                   {" "}
          <div
            className={`${
              depth > 0 ? "w-6 h-6" : "w-8 h-8"
            } rounded-full bg-[#B24700] flex-shrink-0 overflow-hidden border border-[#f7cda3]`}
          >
                       {" "}
            {author.userPhoto ? (
              <img
                src={author.userPhoto}
                alt={author.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                               {" "}
                {author.username?.charAt(0).toUpperCase() || "?"}             {" "}
              </div>
            )}
                     {" "}
          </div>
                   {" "}
          <div className="flex-1 min-w-0">
                       {" "}
            <div className="bg-[#fff8f5] rounded-xl p-2.5">
                           {" "}
              <span className="font-bold text-sm text-[#B24700] mr-2">
                                {author.username}             {" "}
              </span>
                           {" "}
              <span className="text-sm text-gray-800 break-words">
                                {comment.textBody}             {" "}
              </span>
                         {" "}
            </div>
                       {" "}
            <div className="flex items-center gap-4 mt-1 pl-1">
                           {" "}
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />               {" "}
                {formatTimeAgo(comment.createdAt)}             {" "}
              </span>
                                         {" "}
              <button
                onClick={() => {
                  setReplyingTo({ id: comment._id, username: author.username });
                  setNewComment(`@${author.username} `);
                }}
                className="text-xs text-[#F45C1C] font-bold hover:text-[#B24700] transition flex items-center"
              >
                <CornerDownRight className="w-3 h-3 mr-1" />               
                Responder              {" "}
              </button>
                           {" "}
              {(isAuthor || isAdmin) && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />                  Eliminar      
                           {" "}
                </button>
              )}
                           {" "}
              {comment.isEdited && (
                <span className="text-xs text-gray-400">(editado)</span>
              )}
                         {" "}
            </div>
                       {" "}
            {hasReplies && (
              <button
                onClick={() => toggleReplies(comment._id)}
                className="flex items-center gap-2 mt-2 text-xs text-[#F45C1C] font-semibold hover:text-[#B24700] transition"
              >
                                <div className="w-6 h-px bg-[#F45C1C]"></div>   
                           {" "}
                {showReplies
                  ? "Ocultar respuestas"
                  : `Ver ${comment.replies.length} respuesta${
                      comment.replies.length > 1 ? "s" : ""
                    }`}
                             {" "}
              </button>
            )}
                     {" "}
          </div>
                 {" "}
        </div>
               {" "}
        {hasReplies && showReplies && (
          <div className="mt-3">
                       {" "}
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}   
                 {" "}
          </div>
        )}
             {" "}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <Loader2 className="animate-spin h-10 w-10 text-white" />     {" "}
      </div>
    );
  }

  if (!post) return null;

  const postAuthor = getAuthorData(post.authorID);
  const isOwner = postAuthor._id === user?.id;
  const canDelete = isOwner || isAdmin;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
           {" "}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-[#F45C1C] transition z-50 p-2 rounded-full bg-black/30"
      >
                <X className="w-8 h-8" />     {" "}
      </button>
           {" "}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] max-h-[700px] overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
               {" "}
        <div className="w-1/2 bg-black flex items-center justify-center">
                   {" "}
          {!imageError ? (
            <img
              src={post.mediaURL}
              alt="Post content"
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
                            <Camera className="w-16 h-16 mb-2" />             {" "}
              <span className="text-sm">Imagen no disponible</span>           {" "}
            </div>
          )}
                 {" "}
        </div>
               {" "}
        <div className="w-1/2 flex flex-col h-full bg-[#fff8f5]">
                   {" "}
          <div className="flex items-center justify-between gap-3 p-4 border-b border-[#f7cda3]">
                       {" "}
            <div className="flex items-center gap-3">
                           {" "}
              <div className="w-10 h-10 rounded-full bg-[#B24700] overflow-hidden flex-shrink-0 border border-[#F45C1C]">
                               {" "}
                {postAuthor.userPhoto ? (
                  <img
                    src={postAuthor.userPhoto}
                    alt={postAuthor.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                        <User className="w-5 h-5" />           
                         {" "}
                  </div>
                )}
                             {" "}
              </div>
                           {" "}
              <span className="font-bold text-[#B24700]">
                {postAuthor.username}
              </span>
                         {" "}
            </div>
                       {" "}
            {canDelete && (
              <button
                onClick={handleDeletePost}
                className="text-red-600 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 flex items-center gap-1 font-semibold text-sm"
                title={isOwner ? "Eliminar tu post" : "Eliminar post (Admin)"}
              >
                                <Trash2 className="w-5 h-5" />
                {isAdmin && !isOwner && (
                  <UserMinus className="w-3 h-3 text-red-500 absolute -top-1 -right-1" />
                )}
                             {" "}
              </button>
            )}
                     {" "}
          </div>
                   {" "}
          <div className="flex-1 overflow-y-auto p-4">
                       {" "}
            {post.textBody && (
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-[#f7cda3]">
                               {" "}
                <div className="w-8 h-8 rounded-full bg-[#B24700] overflow-hidden flex-shrink-0">
                                   {" "}
                  {postAuthor.userPhoto ? (
                    <img
                      src={postAuthor.userPhoto}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                            <User className="w-4 h-4" />       
                                 {" "}
                    </div>
                  )}
                                 {" "}
                </div>
                               {" "}
                <div className="flex-1">
                                   {" "}
                  <div className="bg-[#FFE5C2]/50 rounded-xl p-2.5">
                                       {" "}
                    <span className="font-bold text-sm text-[#B24700] mr-2">
                                            {postAuthor.username}               
                         {" "}
                    </span>
                                       {" "}
                    <span className="text-sm text-gray-800 break-words">
                      {post.textBody}
                    </span>
                                     {" "}
                  </div>
                                                     {" "}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                                           {" "}
                      {post.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs text-[#F45C1C] hover:underline cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                                         {" "}
                    </div>
                  )}
                                                     {" "}
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />                   {" "}
                    {formatTimeAgo(post.createdAt)}                 {" "}
                  </div>
                                 {" "}
                </div>
                             {" "}
              </div>
            )}
                       {" "}
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                               {" "}
                <MessageSquare className="w-10 h-10 mb-2 text-[#f7cda3]" />     
                         {" "}
                <p className="text-sm font-semibold">No hay comentarios aún</p> 
                             {" "}
                <p className="text-xs">¡Sé el primero en comentar!</p>         
                   {" "}
              </div>
            ) : (
              <div className="divide-y divide-[#f7cda3]">
                {comments.map((comment) => renderComment(comment))}
              </div>
            )}
                     {" "}
          </div>
                   {" "}
          <div className="border-t border-[#f7cda3] bg-white">
                       {" "}
            <div className="flex items-center gap-4 p-4 pb-2">
                           {" "}
              <button
                onClick={handleLike}
                className="group transition-transform hover:scale-110"
              >
                               {" "}
                <Heart
                  className={`w-6 h-6 transition ${
                    post.hasLiked
                      ? "text-red-500 fill-red-500"
                      : "text-gray-600 group-hover:text-red-400"
                  }`}
                  fill={post.hasLiked ? "currentColor" : "none"}
                />
                             {" "}
              </button>
                                         {" "}
              <button
                onClick={handleDislike}
                className="group transition-transform hover:scale-110"
              >
                               {" "}
                <ThumbsDown
                  className={`w-6 h-6 transition ${
                    post.hasDisliked
                      ? "text-blue-500 fill-blue-500"
                      : "text-gray-600 group-hover:text-blue-400"
                  }`}
                  fill={post.hasDisliked ? "currentColor" : "none"}
                />
                             {" "}
              </button>
                           {" "}
              <button
                className="text-gray-600 hover:text-[#B24700] transition-transform hover:scale-110"
                onClick={() => inputRef.current?.focus()}
              >
                                <MessageSquare className="w-6 h-6" />           
                 {" "}
              </button>
                         {" "}
            </div>
                       {" "}
            <div className="px-4 pb-3 flex gap-4">
                           {" "}
              <span className="font-bold text-sm text-[#B24700]">
                                {post.likesCount} Me gusta              {" "}
              </span>
                           {" "}
              <span className="text-sm text-gray-500">
                                {post.dislikesCount} No me gusta              {" "}
              </span>
                         {" "}
            </div>
                       {" "}
            {replyingTo && (
              <div className="px-4 py-2 bg-[#FFE5C2] flex items-center justify-between text-sm rounded-t-xl mx-2 shadow-inner">
                               {" "}
                <span className="text-[#B24700] font-semibold">
                                    Respondiendo a{" "}
                  <span className="font-bold">@{replyingTo.username}</span>     
                           {" "}
                </span>
                               {" "}
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment("");
                  }}
                  className="text-[#F45C1C] hover:text-red-600 p-1"
                >
                                    <X className="w-4 h-4" />               {" "}
                </button>
                             {" "}
              </div>
            )}
                       {" "}
            <div
              className={`flex items-center gap-2 p-4 ${
                replyingTo ? "pt-1" : "pt-2"
              }`}
            >
                           {" "}
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Añade un comentario..."
                className="flex-1 text-sm border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-[#F45C1C] bg-[#fff8f5]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
                           {" "}
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className={`text-sm font-bold transition-colors px-3 py-2 rounded-full ${
                  newComment.trim()
                    ? "bg-[#F45C1C] text-white hover:bg-[#c94917] shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                                Publicar              {" "}
              </button>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default PostModal;
