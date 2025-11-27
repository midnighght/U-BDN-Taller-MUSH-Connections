import { API_BASE_URL } from '../config/api.config';

interface SearchUser {
  _id: string;
  username: string;
  userPhoto?: string;
  isPrivate?: boolean; 
  type: 'user';
}

interface SearchCommunity {
  _id: string;
  name: string;
  description: string;
  mediaURL: string;
  hashtags: string[];
  membersCount: number;
  isPrivate?: boolean; 
  type: 'community';
}

interface SearchPost {
  _id: string;
  mediaURL: string;
  textBody: string;
  hashtags: string[];
  author: {
    _id: string;
    username: string;
    userPhoto?: string;
  };
  likesCount: number;
  dislikesCount: number;
  comunityID?: string;
  createdAt: string;
  type: 'post';
}

export interface SearchResults {
  users: SearchUser[];
  communities: SearchCommunity[];
  posts: SearchPost[];
  total: number;
}

export const search_api = {
  async globalSearch(query: string, token: string): Promise<SearchResults> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en búsqueda');
      throw error;
    }
  }
};