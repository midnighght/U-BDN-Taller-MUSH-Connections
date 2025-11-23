const API_BASE_URL = 'http://localhost:3000';

export interface FeedPost {
  _id: string;
  mediaURL: string;
  textBody: string;
  hashtags: string[];
  createdAt: string;
  authorID: {
    _id: string;
    username: string;
    userPhoto?: string;
  };
  likesCount: number;
  dislikesCount: number;
  hasLiked: boolean;
  hasDisliked: boolean;
  comunityID?: string | null;
  community?: {
    _id: string;
    name: string;
    mediaURL: string;  // ✅ Cambiado de communityPhoto a mediaURL
  } | null;
}

export interface FeedResponse {
  posts: FeedPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasMore: boolean;
  };
}

export const feed_api = {
  /**
   * Obtener feed con paginación
   */
  async getFeed(token: string, page: number = 1, limit: number = 10): Promise<FeedResponse> {
    try {
      console.log(`📥 Cargando feed - página ${page}...`);
      
      const response = await fetch(
        `${API_BASE_URL}/feed?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cargar el feed');
      }

      const data = await response.json();
      console.log(`✅ Feed cargado: ${data.posts.length} posts`);
      return data;
    } catch (error) {
      console.error('❌ Error al cargar feed:', error);
      throw error;
    }
  }
};